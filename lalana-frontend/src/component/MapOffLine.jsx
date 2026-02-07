import { useState, useEffect, useRef } from "react";
import { MapContainer, TileLayer } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

import MapControls from "./MapControls";
import MapController from "./MapController";
import ProblemListPanel from "./ProblemListPanel";
import SignalementListPanel from "./SignalementListPanel";
import ProblemMarker from "./ProblemMarker";
import SignalementMarker from "./SignalementMarker";
import DetailPanel from "./DetailPanel";
import { fetchSignalementsMap } from "../api/signalementService";
import { fetchProblemes as fetchProblemesAPI } from "../api/problemeService";

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
  const [listType, setListType] = useState("problemes"); // "problemes" ou "signalements"
  const [filterStatus, setFilterStatus] = useState("all");
  const [selectedProblemId, setSelectedProblemId] = useState(null);
  const [selectedSignalementId, setSelectedSignalementId] = useState(null);
  const [detailPanel, setDetailPanel] = useState({ type: null, data: null });
  const [searchQuery, setSearchQuery] = useState("");
  const [isFullscreen, setIsFullscreen] = useState(false);
  const mapRef = useRef();

  // Récupération des données depuis les APIs
  useEffect(() => {
    const loadSignalements = async () => {
      try {
        const formattedData = await fetchSignalementsMap();
        setSignalement(formattedData);
        console.log(`${formattedData.length} signalements chargés depuis l'API`);
      } catch (error) {
        console.error("Erreur lors du chargement des signalements:", error);
        setSignalement([]);
      }
    };

    const loadProblemes = async () => {
      try {
        const formattedData = await fetchProblemesAPI();
        setProbleme(formattedData);
        console.log(`${formattedData.length} problèmes chargés depuis l'API`);
      } catch (error) {
        console.error("Erreur lors du chargement des problèmes:", error);
        setProbleme([]);
      }
    };

    loadSignalements();
    loadProblemes();
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
    setSelectedSignalementId(null);
    const prob = probleme.find(p => p.id === problemId);
    if (prob) {
      setDetailPanel({ type: "probleme", data: prob });
    }
    if (window.innerWidth < 768) {
      setShowList(false);
    }
  };

  const handleSignalementClick = (signalementId) => {
    setSelectedSignalementId(signalementId);
    setSelectedProblemId(null);
    const sig = signalement.find(s => s.id === signalementId);
    if (sig) {
      setDetailPanel({ type: "signalement", data: sig });
    }
    if (window.innerWidth < 768) {
      setShowList(false);
    }
  };

  const handleCloseDetailPanel = () => {
    setDetailPanel({ type: null, data: null });
    setSelectedProblemId(null);
    setSelectedSignalementId(null);
  };

  const handleClearSelection = () => {
    setSelectedProblemId(null);
    setSelectedSignalementId(null);
    setDetailPanel({ type: null, data: null });
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
        <div className={`${showList ? 'w-full md:w-2/3' : 'w-full'} transition-all duration-300 relative`}>
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
                  onClick={handleSignalementClick}
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

          {/* Panneau de détail à gauche (affiché au clic sur un marqueur) */}
          {detailPanel.data && (
            <DetailPanel
              type={detailPanel.type}
              data={detailPanel.data}
              onClose={handleCloseDetailPanel}
            />
          )}
        </div>

        {/* Panneau de liste avec switch */}
        {showList && (
          <div className="w-full md:w-1/3 bg-white border-l border-gray-200 shadow-lg flex flex-col">
            {/* Boutons de switch */}
            <div className="flex border-b border-gray-200 bg-gray-50">
              <button
                onClick={() => setListType("problemes")}
                className={`flex-1 py-3 px-4 text-sm font-medium transition-colors ${listType === "problemes"
                    ? "bg-white text-blue-600 border-b-2 border-blue-600"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                  }`}
              >
                Problèmes ({problemesFiltres.length})
              </button>
              <button
                onClick={() => setListType("signalements")}
                className={`flex-1 py-3 px-4 text-sm font-medium transition-colors ${listType === "signalements"
                    ? "bg-white text-rose-600 border-b-2 border-rose-600"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                  }`}
              >
                Signalements ({signalementsFiltres.length})
              </button>
            </div>

            {/* Contenu du panneau */}
            <div className="flex-1 overflow-y-auto">
              {listType === "problemes" ? (
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
              ) : (
                <SignalementListPanel
                  signalements={signalementsFiltres}
                  selectedSignalementId={selectedSignalementId}
                  onSignalementClick={handleSignalementClick}
                  onClose={() => setShowList(false)}
                  filterStatus={filterStatus}
                  onFilterChange={setFilterStatus}
                  searchQuery={searchQuery}
                  onSearchChange={setSearchQuery}
                />
              )}
            </div>
          </div>
        )}
      </div>

      {/* Styles CSS */}
      <style jsx>{`
        .selected-marker {
          filter: drop-shadow(0 0 8px rgba(59, 130, 246, 0.5));
          z-index: 1000 !important;
        }
        .leaflet-tooltip {
          padding: 0 !important;
          border: none !important;
          background: white !important;
          box-shadow: 0 4px 12px rgba(0,0,0,0.15) !important;
          border-radius: 8px !important;
        }
        .leaflet-tooltip-top:before {
          border-top-color: white !important;
        }
        @keyframes slideIn {
          from {
            transform: translateX(-100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        .animate-slide-in {
          animation: slideIn 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}

export default MapOffLine;