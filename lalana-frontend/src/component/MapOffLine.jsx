import { useState, useEffect, useRef } from "react";
import { MapContainer, TileLayer } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

import MapControls from "./MapControls";
import MapController from "./MapController";
import ProblemListPanel from "./ProblemListPanel";
import ProblemMarker from "./ProblemMarker";
import SignalementMarker from "./SignalementMarker";

// Fix pour les icônes de marqueurs par défaut
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";


delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
});

function MapOffLine() {
  const [signalement, setSignalement] = useState([]);
  const [probleme, setProbleme] = useState([]);
  const [showSignalements, setShowSignalements] = useState(true); 
  const [showProblemes, setShowProblemes] = useState(true);
  const [showList, setShowList] = useState(false);
  const [filterStatus, setFilterStatus] = useState("all");
  const [selectedProblemId, setSelectedProblemId] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isFullscreen, setIsFullscreen] = useState(false);
  const mapRef = useRef();

  // Formater les données de signalements reçues de l'API
  const formatSignalementData = (apiData) => {
    return apiData.map(item => ({
      id: item.id,
      userId: item.user?.id || null,
      userEmail: item.user?.email || "Utilisateur inconnu",
      x: item.point?.y || 0, // Note: x correspond à longitude dans le JSON
      y: item.point?.x || 0, // Note: y correspond à latitude dans le JSON
      localisation: item.point?.localisation || "Localisation inconnue",
      description: item.description || "Pas de description",
      createdAt: item.createdAt || new Date().toISOString(),
      statusLiebelle: item.status?.nom || "Non défini",
      statusId: item.status?.id || 0,
      valeur: item.status?.valeur || 0,
      // Données originales si besoin
      rawData: item
    }));
  };

  // Formater les données de problèmes reçues de l'API
  const formatProblemeData = (apiData) => {
    return apiData.map(item => ({
      id: item.id,
      surface: item.surface || 0,
      budgetEstime: item.budgetEstime || 0,
      entrepriseId: item.entreprise?.id || null,
      entrepriseName: item.entreprise?.nom || null,
      entrepriseContact: item.entreprise?.telephone || null,
      entrepriseAdresse: item.entreprise?.adresse || null,
      statusId: item.problemeStatus?.id || 0,
      statusNom: item.problemeStatus?.nom || "Non défini",
      statusValeur: item.problemeStatus?.valeur || 0,
      signalementId: item.signalement?.id || null,
      // Données du signalement associé
      userId: item.signalement?.user?.id || null,
      userEmail: item.signalement?.user?.email || "Utilisateur inconnu",
      x: item.signalement?.point?.y || 0, // longitude
      y: item.signalement?.point?.x || 0, // latitude
      localisation: item.signalement?.point?.localisation || "Localisation inconnue",
      description: item.signalement?.description || "Pas de description",
      signalementCreatedAt: item.signalement?.createdAt || null,
      signalementStatus: item.signalement?.status?.nom || "Non défini",
      signalementValeur: item.signalement?.status?.valeur || 0,
      // Alias pour compatibilité avec le code existant
      statusLiebelle: item.problemeStatus?.nom || "Non défini",
      createdAt: item.signalement?.createdAt || new Date().toISOString(),
      // Données originales si besoin
      rawData: item
    }));
  };

  // Récupération des données depuis les APIs
  useEffect(() => {
    const fetchSignalements = async () => {
      try {
        const response = await fetch('http://localhost:8080/api/signalement');
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data.success && data.data) {
          const formattedData = formatSignalementData(data.data);
          setSignalement(formattedData);
          console.log(`${formattedData.length} signalements chargés depuis l'API`);
        } else {
          console.error("Format de données invalide pour signalements:", data);
          setSignalement(getMockSignalements());
        }
      } catch (error) {
        console.error("Erreur lors du chargement des signalements:", error);
        setSignalement(getMockSignalements());
      }
    };

    const fetchProblemes = async () => {
      try {
        const response = await fetch('http://localhost:8080/api/problemes');
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data.success && data.data) {
          const formattedData = formatProblemeData(data.data);
          setProbleme(formattedData);
          console.log(`${formattedData.length} problèmes chargés depuis l'API`);
        } else {
          console.error("Format de données invalide pour problèmes:", data);
          setProbleme(getMockProblemes());
        }
      } catch (error) {
        console.error("Erreur lors du chargement des problèmes:", error);
        setProbleme(getMockProblemes());
      }
    };

    // Données mockées pour les signalements (fallback)
    const getMockSignalements = () => {
      return [
        {
          id: 1,
          userId: 1,
          userEmail: "alice@example.com",
          x: 47.5218,
          y: -18.9089,
          localisation: "Antananarivo - Avenue de l'Independance",
          description: "Nid-de-poule important sur la chaussee principale, risque pour les vehicules",
          createdAt: "2024-01-15T09:30:00",
          statusLiebelle: "Nouveau",
          statusId: 1,
          valeur: 10,
        },
        {
          id: 2,
          userId: 2,
          userEmail: "bob@example.com",
          x: 49.3958,
          y: -18.1443,
          localisation: "Toamasina - Port",
          description: "eclairage public defectueux depuis 3 jours, quartier sombre le soir",
          createdAt: "2024-01-16T14:20:00",
          statusLiebelle: "En cours",
          statusId: 2,
          valeur: 20,
        },
        {
          id: 3,
          userId: 1,
          userEmail: "alice@example.com",
          x: 47.0331,
          y: -19.8689,
          localisation: "Antsirabe - Centre ville",
          description: "Caniveau bouche causant des inondations lors des pluies",
          createdAt: "2024-01-17T11:45:00",
          statusLiebelle: "Nouveau",
          statusId: 1,
          valeur: 10,
        },
      ];
    };

    // Données mockées pour les problèmes (fallback)
    const getMockProblemes = () => {
      return [
        {
          id: 1,
          surface: 4.5,
          budgetEstime: 2500000,
          entrepriseId: 1,
          entrepriseName: "Entreprise A",
          entrepriseContact: "0123456789",
          entrepriseAdresse: "1 Rue Exemple, 75001 Paris",
          statusId: 1,
          statusNom: "Ouvert",
          statusValeur: 10,
          signalementId: 1,
          userId: 1,
          userEmail: "alice@example.com",
          x: 47.5218,
          y: -18.9089,
          localisation: "Antananarivo - Avenue de l'Independance",
          description: "Nid-de-poule important sur la chaussee principale, risque pour les vehicules",
          signalementCreatedAt: "2024-01-15T09:30:00",
          signalementStatus: "Nouveau",
          signalementValeur: 10,
          statusLiebelle: "Ouvert",
          createdAt: "2024-01-15T09:30:00",
        },
        {
          id: 2,
          surface: 12,
          budgetEstime: 850000,
          entrepriseId: 2,
          entrepriseName: "Entreprise B",
          entrepriseContact: "0987654321",
          entrepriseAdresse: "2 Avenue Exemple, 69001 Lyon",
          statusId: 2,
          statusNom: "Assigné",
          statusValeur: 20,
          signalementId: 2,
          userId: 2,
          userEmail: "bob@example.com",
          x: 49.3958,
          y: -18.1443,
          localisation: "Toamasina - Port",
          description: "eclairage public defectueux depuis 3 jours, quartier sombre le soir",
          signalementCreatedAt: "2024-01-16T14:20:00",
          signalementStatus: "En cours",
          signalementValeur: 20,
          statusLiebelle: "Assigné",
          createdAt: "2024-01-16T14:20:00",
        },
        {
          id: 3,
          surface: 8.2,
          budgetEstime: 1500000,
          entrepriseId: 1,
          entrepriseName: "Entreprise A",
          entrepriseContact: "0123456789",
          entrepriseAdresse: "1 Rue Exemple, 75001 Paris",
          statusId: 1,
          statusNom: "Ouvert",
          statusValeur: 10,
          signalementId: 3,
          userId: 1,
          userEmail: "alice@example.com",
          x: 47.0331,
          y: -19.8689,
          localisation: "Antsirabe - Centre ville",
          description: "Caniveau bouche causant des inondations lors des pluies",
          signalementCreatedAt: "2024-01-17T11:45:00",
          signalementStatus: "Nouveau",
          signalementValeur: 10,
          statusLiebelle: "Ouvert",
          createdAt: "2024-01-17T11:45:00",
        },
      ];
    };

    fetchSignalements();
    fetchProblemes();
  }, []);

  // Filtrage des données
  const getProblemesFiltres = () => {
    let filtered = probleme;
    
    if (filterStatus !== "all") {
      switch (filterStatus) {
        case "pending":
          filtered = filtered.filter(p => p.statusValeur === 10);
          break;
        case "inprogress":
          filtered = filtered.filter(p => p.statusValeur === 20);
          break;
        case "resolved":
          filtered = filtered.filter(p => p.statusValeur === 30);
          break;
      }
    }
    
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(p => 
        p.localisation.toLowerCase().includes(query) ||
        p.description.toLowerCase().includes(query) ||
        p.userEmail.toLowerCase().includes(query) ||
        (p.entrepriseName && p.entrepriseName.toLowerCase().includes(query)) ||
        (p.entrepriseAdresse && p.entrepriseAdresse.toLowerCase().includes(query))
      );
    }
    
    return filtered;
  };

  const getSignalementsFiltres = () => {
    let filtered = signalement;
    
    if (filterStatus !== "all") {
      switch (filterStatus) {
        case "pending":
          filtered = filtered.filter(s => s.valeur === 10);
          break;
        case "inprogress":
          filtered = filtered.filter(s => s.valeur === 20);
          break;
        case "resolved":
          filtered = filtered.filter(s => s.valeur === 30);
          break;
      }
    }
    
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(s => 
        s.localisation.toLowerCase().includes(query) ||
        s.description.toLowerCase().includes(query) ||
        s.userEmail.toLowerCase().includes(query)
      );
    }
    
    return filtered;
  };

  const problemesFiltres = getProblemesFiltres();
  const signalementsFiltres = getSignalementsFiltres();
  const selectedProblem = selectedProblemId 
    ? probleme.find(p => p.id === selectedProblemId) 
    : null;

  const handleProblemClick = (problemId) => {
    setSelectedProblemId(problemId);
    if (window.innerWidth < 768) {
      setShowList(false);
    }
  };

  const handleClearSelection = () => {
    setSelectedProblemId(null);
  };

  const handleFullscreenToggle = () => {
    setIsFullscreen(!isFullscreen);
    if (!isFullscreen) {
      document.documentElement.requestFullscreen().catch(console.log);
    } else {
      document.exitFullscreen().catch(console.log);
    }
  };

  const getProblemesEnCours = () => {
    return probleme.filter(p => p.statusValeur === 10 || p.statusValeur === 20);
  };

  const problemesEnCours = getProblemesEnCours();

  return (
    <div className={`${isFullscreen ? 'fixed inset-0 z-50 bg-white' : 'w-full h-full'}`}>
      <MapControls
        totalPoints={probleme.length + signalement.length}
        problemsEnCours={problemesEnCours.length}
        selectedProblem={selectedProblem}
        showList={showList}
        onToggleList={() => setShowList(!showList)}
        isFullscreen={isFullscreen}
        onToggleFullscreen={handleFullscreenToggle}
        selectedProblemId={selectedProblemId}
        onClearSelection={handleClearSelection}
        showSignalements={showSignalements}
        onToggleSignalements={() => setShowSignalements(!showSignalements)}
        showProblemes={showProblemes}
        onToggleProblemes={() => setShowProblemes(!showProblemes)}
        filterStatus={filterStatus}
        onFilterChange={setFilterStatus}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        signalementCount={signalement.length}
        problemeCount={probleme.length}
      />

      {/* Contenu principal */}
      <div className="flex h-[calc(100vh-140px)]">
        {/* Carte */}
        <div className={`${showList ? 'w-full md:w-2/3' : 'w-full'} transition-all duration-300`}>
          <div className="h-full bg-white">
            <MapContainer
              center={[-18.8792, 47.5079]}
              zoom={13}
              minZoom={12}
              maxZoom={18}
              className="h-full w-full"
              ref={mapRef}
            >
              <MapController 
                center={[-18.8792, 47.5079]} 
                zoom={13}
                selectedProblemId={selectedProblemId}
                problems={probleme}
                signals={signalement}
              />
              
              <TileLayer
                url="/tiles/{z}/{x}/{y}.png"
                tileSize={256}
                maxZoom={18}
                minZoom={12}
              />

              {/* Marqueurs pour les signalements */}
              {showSignalements && signalementsFiltres.map((sig) => (
                <SignalementMarker
                  key={`signalement-${sig.id}`}
                  signalement={sig}
                />
              ))}

              {/* Marqueurs pour les problèmes */}
              {showProblemes && problemesFiltres.map((prob) => (
                <ProblemMarker
                  key={`probleme-${prob.id}`}
                  problem={prob}
                  isSelected={selectedProblemId === prob.id}
                  onClick={handleProblemClick}
                />
              ))}
            </MapContainer>
          </div>
        </div>

        {/* Panneau de liste */}
        {showList && (
          <ProblemListPanel
            problems={problemesFiltres}
            selectedProblemId={selectedProblemId}
            onProblemClick={handleProblemClick}
            onClose={() => setShowList(false)}
            filterStatus={filterStatus}
            onFilterChange={setFilterStatus}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
          />
        )}
      </div>

      {/* Styles CSS */}
      <style jsx>{`
        .selected-marker {
          filter: drop-shadow(0 0 8px rgba(59, 130, 246, 0.5));
          z-index: 1000 !important;
        }
        .leaflet-popup-content {
          margin: 12px !important;
        }
        .leaflet-popup {
          z-index: 1001 !important;
        }
      `}</style>
    </div>
  );
}

export default MapOffLine;