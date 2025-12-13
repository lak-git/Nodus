import { useEffect, useState } from "react";
import {
  MapContainer,
  TileLayer,
  CircleMarker,
  Popup,
  useMap,
} from "react-leaflet";
import { Layers, CloudRain, Wind, Cloud, Thermometer, Map as MapIcon, Sun } from "lucide-react";
import type { Incident } from "../../types/incident";
import "leaflet/dist/leaflet.css";

interface MapViewProps {
  incidents: Incident[];
  selectedIncident: Incident | null;
  onIncidentClick: (incident: Incident) => void;
}

// Helper component to handle flying to selected incident
function MapUpdater({ selectedIncident }: { selectedIncident: Incident | null }) {
  const map = useMap();

  useEffect(() => {
    if (selectedIncident && selectedIncident.location) {
      map.flyTo(
        [selectedIncident.location.lat, selectedIncident.location.lng],
        13,
        { animate: true, duration: 1.5 },
      );
    }
  }, [selectedIncident, map]);

  return null;
}

export function MapView({ incidents, selectedIncident, onIncidentClick }: MapViewProps) {
  const API_KEY = import.meta.env.VITE_OPENWEATHER_API_KEY;

  // Custom Layer State
  const [activeBaseMap, setActiveBaseMap] = useState<'osm' | 'light'>('osm');
  const [weatherLayers, setWeatherLayers] = useState({
    precipitation: false,
    clouds: false,
    temp: false,
    wind: false,
  });
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    if (!API_KEY) {
      console.warn("VITE_OPENWEATHER_API_KEY is missing. Weather layers will not render properly.");
    }
  }, [API_KEY]);

  const toggleWeatherLayer = (layer: keyof typeof weatherLayers) => {
    setWeatherLayers(prev => ({ ...prev, [layer]: !prev[layer] }));
  };

  const getSeverityStyles = (severity: number) => {
    switch (severity) {
      case 5:
        return { color: "#dc2626", radius: 12 }; // Critical
      case 4:
        return { color: "#f97316", radius: 10 }; // High
      case 3:
        return { color: "#eab308", radius: 8 }; // Medium
      case 2:
        return { color: "#3b82f6", radius: 6 }; // Low
      case 1:
      default:
        return { color: "#22c55e", radius: 6 }; // Minimal
    }
  };

  const defaultPosition: [number, number] = [6.6828, 80.3992]; // Ratnapura

  return (
    <div className="relative w-full h-full bg-gray-100 rounded-lg overflow-hidden border border-border">
      <MapContainer
        center={defaultPosition}
        zoom={13}
        style={{ height: "100%", width: "100%" }}
        scrollWheelZoom={true}
        zoomControl={false} // We can add custom zoom control if needed, but default is fine usually. 
      // Actually, keeping default zoom control but maybe it overlaps? 
      // Leaflet default zoom is top-left. Our panel is top-right. Safe.
      >
        {/* Base Map Layer */}
        {activeBaseMap === 'osm' ? (
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
        ) : (
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
            url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
          />
        )}

        {/* Weather Overlays */}
        {API_KEY && weatherLayers.precipitation && (
          <TileLayer
            key="precip"
            url={`https://tile.openweathermap.org/map/precipitation_new/{z}/{x}/{y}.png?appid=${API_KEY}`}
            opacity={0.8}
            zIndex={10}
          />
        )}
        {API_KEY && weatherLayers.clouds && (
          <TileLayer
            key="clouds"
            url={`https://tile.openweathermap.org/map/clouds_new/{z}/{x}/{y}.png?appid=${API_KEY}`}
            opacity={0.8}
            zIndex={10}
          />
        )}
        {API_KEY && weatherLayers.temp && (
          <TileLayer
            key="temp"
            url={`https://tile.openweathermap.org/map/temp_new/{z}/{x}/{y}.png?appid=${API_KEY}`}
            opacity={0.8}
            zIndex={10}
          />
        )}
        {API_KEY && weatherLayers.wind && (
          <TileLayer
            key="wind"
            url={`https://tile.openweathermap.org/map/wind_new/{z}/{x}/{y}.png?appid=${API_KEY}`}
            opacity={0.8}
            zIndex={10}
          />
        )}

        <MapUpdater selectedIncident={selectedIncident} />

        {incidents.map((incident) => {
          const { color, radius } = getSeverityStyles(incident.severity);

          return (
            <CircleMarker
              key={incident.id}
              center={[incident.location.lat, incident.location.lng]}
              pathOptions={{
                color,
                fillColor: color,
                fillOpacity: 0.7,
              }}
              radius={radius}
              eventHandlers={{
                click: () => onIncidentClick(incident),
              }}
            >
              <Popup>
                <div className="text-sm">
                  <strong className="block mb-1 text-base">{incident.type}</strong>
                  <span className="text-gray-600">{incident.description}</span>
                  <div className="mt-2 text-xs text-gray-400">
                    Severity Level: {incident.severity}
                  </div>
                </div>
              </Popup>
            </CircleMarker>
          );
        })}
      </MapContainer>

      {/* Custom Layers Floating Dock */}
      <div className="absolute top-4 right-4 z-[1000] flex flex-col items-end gap-2">
        <button
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="bg-white/90 backdrop-blur-sm p-3 rounded-xl shadow-lg hover:bg-white transition-colors border border-gray-100/50"
          title="Map Layers & Weather"
        >
          <Layers className="w-6 h-6 text-gray-700" />
        </button>

        {isMenuOpen && (
          <div className="bg-white/95 backdrop-blur-md p-4 rounded-xl shadow-xl border border-gray-100 w-64 animate-in fade-in slide-in-from-top-2 duration-200">
            {/* Section 1: Base Map */}
            <div className="mb-4">
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Base Style</h3>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setActiveBaseMap('osm')}
                  className={`flex flex-col items-center gap-2 p-2 rounded-lg border text-xs transition-all ${activeBaseMap === 'osm'
                      ? 'bg-blue-50 border-blue-200 text-blue-700'
                      : 'bg-gray-50 border-transparent text-gray-600 hover:bg-gray-100'
                    }`}
                >
                  <MapIcon className="w-4 h-4" />
                  Standard
                </button>
                <button
                  onClick={() => setActiveBaseMap('light')}
                  className={`flex flex-col items-center gap-2 p-2 rounded-lg border text-xs transition-all ${activeBaseMap === 'light'
                      ? 'bg-blue-50 border-blue-200 text-blue-700'
                      : 'bg-gray-50 border-transparent text-gray-600 hover:bg-gray-100'
                    }`}
                >
                  <Sun className="w-4 h-4" />
                  Clean Light
                </button>
              </div>
              <p className="text-[10px] text-gray-400 mt-2 leading-tight">
                "Clean Light" improves visibility of weather patterns.
              </p>
            </div>

            <div className="h-px bg-gray-200 my-2" />

            {/* Section 2: Weather Overlays */}
            <div>
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Live Weather</h3>
              <div className="space-y-2">
                <button
                  onClick={() => toggleWeatherLayer('precipitation')}
                  className={`flex items-center justify-between w-full p-2.5 rounded-lg text-sm transition-all ${weatherLayers.precipitation ? 'bg-blue-50 text-blue-700' : 'hover:bg-gray-50 text-gray-700'
                    }`}
                >
                  <div className="flex items-center gap-3">
                    <CloudRain className={`w-4 h-4 ${weatherLayers.precipitation ? 'text-blue-500' : 'text-gray-400'}`} />
                    <span>Precipitation</span>
                  </div>
                  {weatherLayers.precipitation && <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />}
                </button>

                <button
                  onClick={() => toggleWeatherLayer('clouds')}
                  className={`flex items-center justify-between w-full p-2.5 rounded-lg text-sm transition-all ${weatherLayers.clouds ? 'bg-blue-50 text-blue-700' : 'hover:bg-gray-50 text-gray-700'
                    }`}
                >
                  <div className="flex items-center gap-3">
                    <Cloud className={`w-4 h-4 ${weatherLayers.clouds ? 'text-blue-500' : 'text-gray-400'}`} />
                    <span>Cloud Cover</span>
                  </div>
                  {weatherLayers.clouds && <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />}
                </button>

                <button
                  onClick={() => toggleWeatherLayer('temp')}
                  className={`flex items-center justify-between w-full p-2.5 rounded-lg text-sm transition-all ${weatherLayers.temp ? 'bg-blue-50 text-blue-700' : 'hover:bg-gray-50 text-gray-700'
                    }`}
                >
                  <div className="flex items-center gap-3">
                    <Thermometer className={`w-4 h-4 ${weatherLayers.temp ? 'text-blue-500' : 'text-gray-400'}`} />
                    <span>Temperature</span>
                  </div>
                  {weatherLayers.temp && <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />}
                </button>

                <button
                  onClick={() => toggleWeatherLayer('wind')}
                  className={`flex items-center justify-between w-full p-2.5 rounded-lg text-sm transition-all ${weatherLayers.wind ? 'bg-blue-50 text-blue-700' : 'hover:bg-gray-50 text-gray-700'
                    }`}
                >
                  <div className="flex items-center gap-3">
                    <Wind className={`w-4 h-4 ${weatherLayers.wind ? 'text-blue-500' : 'text-gray-400'}`} />
                    <span>Wind Speed</span>
                  </div>
                  {weatherLayers.wind && <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Map title overlay (CENTER TOP) */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[400] bg-white/90 backdrop-blur-sm rounded-lg shadow-md px-4 py-2 pointer-events-none text-center">
        <div className="text-sm font-semibold text-[#800020]">
          Incident Overview Map
        </div>
        <div className="text-xs text-[#6B4423]">
          Displays all reported incidents by location
        </div>
      </div>

      {/* Legend overlay */}
      <div className="absolute bottom-6 right-4 z-[400] bg-white/90 backdrop-blur-sm rounded-lg shadow-md p-3">
        <div className="text-xs text-[#6B4423] mb-2 font-medium">
          Severity Legend
        </div>
        <div className="space-y-1.5">
          {[
            { level: 5, label: "Critical", color: "#dc2626" },
            { level: 4, label: "High", color: "#f97316" },
            { level: 3, label: "Medium", color: "#eab308" },
            { level: 2, label: "Low", color: "#3b82f6" },
            { level: 1, label: "Minimal", color: "#22c55e" },
          ].map(({ level, label, color }) => (
            <div key={level} className="flex items-center gap-2 text-xs">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: color }} />
              <span className="text-[#6B4423]">{label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
