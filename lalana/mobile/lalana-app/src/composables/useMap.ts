import { ref, onMounted, onUnmounted } from 'vue';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import type { Signalement } from '@/types/firestore';

// Fix pour les icônes de marqueurs Leaflet
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

// Configuration de l'icône par défaut
const DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

// Configuration par défaut de la carte (Madagascar - Antananarivo)
const DEFAULT_CONFIG = {
  lat: -18.8792,
  lng: 47.5079,
  zoom: 13
};

export function useMap(containerId: string = 'map') {
  let map: L.Map | null = null;
  const isMapReady = ref(false);
  const signalementMarkers = new Map<string, L.Marker>();
  let tempMarker: L.Marker | null = null;
  let userLocationMarker: L.Marker | null = null;
  const userLocation = ref<{ lat: number; lng: number } | null>(null);
  const isTrackingLocation = ref(false);
  let watchId: number | null = null;

  /**
   * Initialiser la carte
   */
  function initMap(onMapClick?: (lat: number, lng: number) => void): void {
    const mapContainer = document.getElementById(containerId);
    if (!mapContainer) {
      console.error('Conteneur de carte non trouvé');
      return;
    }

    // Créer la carte avec options optimisées
    map = L.map(containerId, {
      preferCanvas: true,
      zoomControl: true,
      attributionControl: true
    }).setView([DEFAULT_CONFIG.lat, DEFAULT_CONFIG.lng], DEFAULT_CONFIG.zoom);

    // Ajouter la couche OpenStreetMap
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19,
      minZoom: 3,
      updateWhenIdle: true,
      updateWhenZooming: false,
      keepBuffer: 2,
      crossOrigin: true,
      detectRetina: false
    }).addTo(map);

    if (onMapClick) {
      map.on('click', (e: L.LeafletMouseEvent) => {
        onMapClick(e.latlng.lat, e.latlng.lng);
      });
    }

    isMapReady.value = true;
  }

  function destroyMap(): void {
    if (map) {
      map.remove();
      map = null;
    }
    stopTrackingLocation();
    isMapReady.value = false;
  }

  /**
   * Créer une icône personnalisée pour la position de l'utilisateur
   */
  function createUserLocationIcon(): L.DivIcon {
    return L.divIcon({
      className: 'user-location-marker',
      html: `
        <div style="
          position: relative;
          width: 24px;
          height: 24px;
        ">
          <div style="
            position: absolute;
            width: 24px;
            height: 24px;
            background-color: #4285F4;
            border: 3px solid #fff;
            border-radius: 50%;
            box-shadow: 0 2px 6px rgba(0,0,0,0.3);
          "></div>
          <div style="
            position: absolute;
            width: 50px;
            height: 50px;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background-color: rgba(66, 133, 244, 0.2);
            border-radius: 50%;
            animation: pulse 2s infinite;
          "></div>
        </div>
        <style>
          @keyframes pulse {
            0% {
              transform: translate(-50%, -50%) scale(0.8);
              opacity: 1;
            }
            100% {
              transform: translate(-50%, -50%) scale(1.5);
              opacity: 0;
            }
          }
        </style>
      `,
      iconSize: [24, 24],
      iconAnchor: [12, 12]
    });
  }

  /**
   * Mettre à jour la position de l'utilisateur sur la carte
   */
  function updateUserLocation(lat: number, lng: number): void {
    if (!map) return;

    userLocation.value = { lat, lng };

    // Supprimer l'ancien marqueur si présent
    if (userLocationMarker) {
      map.removeLayer(userLocationMarker);
    }

    // Créer un nouveau marqueur
    userLocationMarker = L.marker([lat, lng], {
      icon: createUserLocationIcon(),
      zIndexOffset: 1000 // Placer au-dessus des autres marqueurs
    }).addTo(map);

    userLocationMarker.bindPopup(`
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
        <h3 style="margin: 0 0 8px 0; color: #1a1a1a; font-size: 14px; font-weight: 600;">
          📍 Votre position
        </h3>
        <p style="margin: 4px 0; font-size: 12px; color: #6b7280;">
          Lat: ${lat.toFixed(6)}<br/>
          Lng: ${lng.toFixed(6)}
        </p>
      </div>
    `);

    console.log('📍 Position utilisateur mise à jour:', { lat, lng });
  }

  /**
   * Démarrer le suivi de la position de l'utilisateur
   */
  function startTrackingLocation(centerOnLocation: boolean = true): void {
    if (!navigator.geolocation) {
      console.error('La géolocalisation n\'est pas supportée par ce navigateur');
      return;
    }

    isTrackingLocation.value = true;

    // Position initiale
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        updateUserLocation(latitude, longitude);
        if (centerOnLocation) {
          setView(latitude, longitude, 15);
        }
      },
      (error) => {
        console.error('Erreur de géolocalisation:', error);
        isTrackingLocation.value = false;
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );

    // Suivi continu
    watchId = navigator.geolocation.watchPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        updateUserLocation(latitude, longitude);
      },
      (error) => {
        console.error('Erreur de suivi de position:', error);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 5000
      }
    );
  }

  /**
   * Arrêter le suivi de la position de l'utilisateur
   */
  function stopTrackingLocation(): void {
    if (watchId !== null) {
      navigator.geolocation.clearWatch(watchId);
      watchId = null;
    }
    
    if (userLocationMarker && map) {
      map.removeLayer(userLocationMarker);
      userLocationMarker = null;
    }

    isTrackingLocation.value = false;
    userLocation.value = null;
  }

  /**
   * Centrer la carte sur la position actuelle de l'utilisateur
   */
  function centerOnUserLocation(): void {
    if (userLocation.value) {
      setView(userLocation.value.lat, userLocation.value.lng, 15);
    } else {
      startTrackingLocation(true);
    }
  }

  function createStatusIcon(status: string): L.DivIcon {
    let iconConfig = {
      color: '#3b82f6',
      symbol: '●',
      bgColor: '#fff'
    };

    switch (status.toLowerCase()) {
      case 'en attente':
        iconConfig = {
          color: '#f59e0b',
          symbol: '⏱',
          bgColor: '#fff'
        };
        break;
      case 'validé':
      case 'en cours':
        iconConfig = {
          color: '#3b82f6',
          symbol: '⚙',
          bgColor: '#fff'
        };
        break;
      case 'résolu':
      case 'terminé':
        iconConfig = {
          color: '#10b981',
          symbol: '✓',
          bgColor: '#fff'
        };
        break;
      case 'rejeté':
        iconConfig = {
          color: '#ef4444',
          symbol: '✕',
          bgColor: '#fff'
        };
        break;
    }

    return L.divIcon({
      className: 'custom-marker',
      html: `
        <div style="
          background-color: ${iconConfig.bgColor}; 
          width: 40px; 
          height: 40px; 
          border-radius: 50%; 
          border: 3px solid ${iconConfig.color}; 
          box-shadow: 0 3px 8px rgba(0,0,0,0.25);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 20px;
          font-weight: bold;
          color: ${iconConfig.color};
        ">
          ${iconConfig.symbol}
        </div>
      `,
      iconSize: [40, 40],
      iconAnchor: [20, 20]
    });
  }

  function createPopupContent(signalement: Signalement): string {
    let dateStr = 'Date inconnue';
    if (signalement.createdAt) {
      const date = typeof signalement.createdAt === 'string' 
        ? new Date(signalement.createdAt)
        : signalement.createdAt.toDate();
      dateStr = date.toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    }

    // Déterminer l'icône et la couleur selon le statut
    let statusIcon = '●';
    let statusColor = '#3b82f6';
    
    switch (signalement.statusLibelle.toLowerCase()) {
      case 'en attente':
        statusIcon = '⏱';
        statusColor = '#f59e0b';
        break;
      case 'validé':
      case 'en cours':
        statusIcon = '⚙';
        statusColor = '#3b82f6';
        break;
      case 'résolu':
      case 'terminé':
        statusIcon = '✓';
        statusColor = '#10b981';
        break;
      case 'rejeté':
        statusIcon = '✕';
        statusColor = '#ef4444';
        break;
    }

    return `
      <div style="min-width: 220px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
        <h3 style="margin: 0 0 12px 0; color: #1a1a1a; font-size: 16px; font-weight: 600; border-bottom: 2px solid #f0f0f0; padding-bottom: 8px;">
          📍 Signalement
        </h3>
        <p style="margin: 8px 0; font-size: 14px; line-height: 1.5;">
          <strong style="color: #1a1a1a;">Description:</strong><br/>
          <span style="color: #4b5563;">${signalement.description || 'Aucune description'}</span>
        </p>
        <p style="margin: 8px 0; font-size: 12px; color: #6b7280; line-height: 1.4;">
          <strong>Localisation:</strong><br/>
          Latitude: ${signalement.y.toFixed(6)}<br/>
          Longitude: ${signalement.x.toFixed(6)}<br/>
          ${signalement.localisation || 'Non spécifiée'}
        </p>
        <p style="margin: 10px 0 8px 0; font-size: 13px;">
          <strong style="color: #1a1a1a;">Statut:</strong> 
          <span style="
            display: inline-flex;
            align-items: center;
            gap: 6px;
            padding: 4px 12px; 
            border-radius: 6px; 
            background-color: ${statusColor}15;
            border: 1.5px solid ${statusColor};
            font-weight: 600;
            color: ${statusColor};
          ">
            <span style="font-size: 16px;">${statusIcon}</span>
            ${signalement.statusLibelle}
          </span>
        </p>
        <p style="margin: 8px 0 0 0; font-size: 11px; color: #9ca3af; font-style: italic;">
          📅 ${dateStr}
        </p>
      </div>
    `;
  }

  /**
   * Afficher les signalements sur la carte
   */
  function displaySignalements(signalements: Signalement[]): void {
    if (!map) return;

    signalementMarkers.forEach((marker) => {
      map?.removeLayer(marker);
    });
    signalementMarkers.clear();

    signalements.forEach((signalement) => {
      if (!map) return;

      const lat = signalement.y;
      const lng = signalement.x;

      const marker = L.marker([lat, lng], {
        icon: createStatusIcon(signalement.statusLibelle)
      }).addTo(map);

      marker.bindPopup(createPopupContent(signalement));

      const markerId = (signalement as any).id || `${lat}-${lng}-${Date.now()}`;
      signalementMarkers.set(markerId, marker);
    });

    console.log(`✅ ${signalements.length} signalements affichés sur la carte`);
  }

  function addTempMarker(lat: number, lng: number): void {
    if (!map) return;

    removeTempMarker();

    tempMarker = L.marker([lat, lng])
      .addTo(map)
      .bindPopup('📍 Nouveau signalement')
      .openPopup();
  }

  function removeTempMarker(): void {
    if (tempMarker && map) {
      map.removeLayer(tempMarker);
      tempMarker = null;
    }
  }

  function setView(lat: number, lng: number, zoom?: number): void {
    if (map) {
      map.setView([lat, lng], zoom ?? DEFAULT_CONFIG.zoom);
    }
  }

  return {
    isMapReady,
    userLocation,
    isTrackingLocation,
    initMap,
    destroyMap,
    displaySignalements,
    addTempMarker,
    removeTempMarker,
    setView,
    startTrackingLocation,
    stopTrackingLocation,
    centerOnUserLocation
  };
}
