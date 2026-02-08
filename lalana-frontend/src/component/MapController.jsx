import { useEffect } from "react";
import { useMap } from "react-leaflet";

function MapController({ center, zoom, selectedProblemId, problems, selectedSignalementId, signals }) {
  const map = useMap();
  
  useEffect(() => {
    if (selectedProblemId) {
      const problem = problems.find(p => p.id === selectedProblemId);
      if (problem) {
        map.flyTo([problem.y, problem.x], 16, {
          duration: 1.5,
          easeLinearity: 0.25,
        });
      }
    } else if (selectedSignalementId) {
      const sig = signals.find(s => s.id === selectedSignalementId);
      if (sig) {
        map.flyTo([sig.y, sig.x], 16, {
          duration: 1.5,
          easeLinearity: 0.25,
        });
      }
    } else if (center) {
      map.flyTo(center, zoom, {
        duration: 1,
        easeLinearity: 0.25,
      });
    }
  }, [selectedProblemId, selectedSignalementId, center, zoom, map, problems, signals]);

  return null;
}

export default MapController;