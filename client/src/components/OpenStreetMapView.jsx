import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { 
  Crosshair, Filter, ZoomIn, ZoomOut, Layers, Bike, 
  BookOpen, ArrowRight, ShieldCheck, Star, Clock 
} from 'lucide-react';
import { useToast } from '../context/ToastContext';
import { MOCK_DELIVERY_AGENTS } from './GoogleMapView';

// OpenStreetMap Tile Layers
const TILE_LAYERS = {
  dark: {
    name: 'Luxury Dark Matter',
    url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
  },
  voyager: {
    name: 'Voyager Detailed',
    url: 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
  },
  osm: {
    name: 'OpenStreetMap Standard',
    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  }
};

const OpenStreetMapView = ({ 
  books = [], 
  activeTab = 'books', 
  onSelectBook, 
  onSelectAgent 
}) => {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersLayerRef = useRef(null);
  const circleRef = useRef(null);
  const userMarkerRef = useRef(null);
  const tileLayerRef = useRef(null);

  const { showToast } = useToast();
  const [currentLayer, setCurrentLayer] = useState('dark');
  const [gpsActive, setGpsActive] = useState(false);
  const [gpsLoading, setGpsLoading] = useState(false);
  const [currentCoords, setCurrentCoords] = useState([19.0760, 72.8777]); // Mumbai Central
  const [radiusKm, setRadiusKm] = useState(10);
  const [selectedPin, setSelectedPin] = useState(null);

  // Initialize Leaflet OpenStreetMap
  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Destroy existing instance if any
    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
    }

    try {
      const map = L.map(mapContainerRef.current, {
        center: currentCoords,
        zoom: 13,
        zoomControl: false,
        attributionControl: false
      });

      // Add Base Tile Layer
      tileLayerRef.current = L.tileLayer(TILE_LAYERS[currentLayer].url, {
        maxZoom: 19,
        attribution: TILE_LAYERS[currentLayer].attribution
      }).addTo(map);

      // Create Layer Group for markers
      markersLayerRef.current = L.layerGroup().addTo(map);

      // Add Radius Circle
      circleRef.current = L.circle(currentCoords, {
        color: '#D4AF37',
        fillColor: '#D4AF37',
        fillOpacity: 0.08,
        weight: 2,
        radius: radiusKm * 1000
      }).addTo(map);

      // User location marker
      const userIcon = L.divIcon({
        className: 'custom-user-marker',
        html: `
          <div class="relative flex items-center justify-center">
            <div class="w-6 h-6 rounded-full bg-[#D4AF37] border-2 border-black flex items-center justify-center shadow-xl shadow-[#D4AF37]/50 animate-bounce">
              <div class="w-2.5 h-2.5 rounded-full bg-black"></div>
            </div>
          </div>
        `,
        iconSize: [24, 24],
        iconAnchor: [12, 12]
      });

      userMarkerRef.current = L.marker(currentCoords, { icon: userIcon }).addTo(map);

      mapInstanceRef.current = map;

      // Force size update
      setTimeout(() => {
        map.invalidateSize();
      }, 200);
    } catch (err) {
      console.error('OpenStreetMap initialization error:', err);
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Switch Tile Layer
  useEffect(() => {
    if (!mapInstanceRef.current || !tileLayerRef.current) return;
    mapInstanceRef.current.removeLayer(tileLayerRef.current);
    tileLayerRef.current = L.tileLayer(TILE_LAYERS[currentLayer].url, {
      maxZoom: 19,
      attribution: TILE_LAYERS[currentLayer].attribution
    }).addTo(mapInstanceRef.current);
  }, [currentLayer]);

  // Update Markers for Books or Delivery Agents
  useEffect(() => {
    if (!mapInstanceRef.current || !markersLayerRef.current) return;

    markersLayerRef.current.clearLayers();

    if (activeTab === 'books') {
      books.forEach((book, idx) => {
        const offsetLat = currentCoords[0] + (Math.sin(idx * 1.5) * (book.distanceKm || 1.5) * 0.009);
        const offsetLng = currentCoords[1] + (Math.cos(idx * 1.5) * (book.distanceKm || 1.5) * 0.009);

        const bookIcon = L.divIcon({
          className: 'custom-book-marker',
          html: `
            <div class="group flex flex-col items-center cursor-pointer transition-transform hover:scale-125">
              <div class="relative">
                <img 
                  src="${book.coverUrl}" 
                  class="w-10 h-14 object-cover rounded-lg border-2 border-[#D4AF37] shadow-2xl" 
                />
                <span class="absolute -top-2 -right-2 px-1.5 py-0.5 rounded-full bg-[#D4AF37] text-black font-extrabold text-[9px] shadow">
                  ${book.distanceKm || 1.8}km
                </span>
              </div>
              <span class="bg-[#15171E]/95 text-white font-semibold text-[10px] px-2 py-0.5 rounded-md mt-1 border border-white/10 shadow-md truncate max-w-[100px]">
                ${book.title}
              </span>
            </div>
          `,
          iconSize: [40, 60],
          iconAnchor: [20, 50]
        });

        const marker = L.marker([offsetLat, offsetLng], { icon: bookIcon });
        marker.on('click', () => {
          setSelectedPin({ type: 'book', data: book });
          if (onSelectBook) onSelectBook(book);
        });

        markersLayerRef.current.addLayer(marker);
      });
    } else {
      MOCK_DELIVERY_AGENTS.forEach((agent) => {
        const agentIcon = L.divIcon({
          className: 'custom-agent-marker',
          html: `
            <div class="group flex flex-col items-center cursor-pointer transition-transform hover:scale-125">
              <div class="w-11 h-11 rounded-2xl bg-gradient-to-br from-[#D4AF37] to-[#F59E0B] text-black font-extrabold flex items-center justify-center text-xl shadow-xl shadow-[#D4AF37]/40 border-2 border-black">
                ${agent.vehicleIcon}
              </div>
              <div class="bg-[#15171E]/95 border border-[#D4AF37]/40 px-2 py-0.5 rounded-lg text-[10px] text-white font-bold mt-1 shadow flex items-center gap-1">
                <span>${agent.name.split(' ')[0]}</span>
                <span class="text-[#D4AF37]">⚡${agent.etaMinutes}m</span>
              </div>
            </div>
          `,
          iconSize: [44, 55],
          iconAnchor: [22, 45]
        });

        const marker = L.marker([agent.coordinates.lat, agent.coordinates.lng], { icon: agentIcon });
        marker.on('click', () => {
          setSelectedPin({ type: 'agent', data: agent });
          if (onSelectAgent) onSelectAgent(agent);
        });

        markersLayerRef.current.addLayer(marker);
      });
    }
  }, [books, activeTab, currentCoords]);

  // Live GPS Centering using Leaflet flyTo
  const handleEnableGPS = () => {
    if (!navigator.geolocation) {
      showToast('Geolocation is not supported by your browser', 'error');
      return;
    }

    setGpsLoading(true);
    showToast('Detecting your live GPS coordinates on OpenStreetMap...');

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        const newCoords = [latitude, longitude];
        setCurrentCoords(newCoords);
        setGpsActive(true);
        setGpsLoading(false);

        if (mapInstanceRef.current) {
          mapInstanceRef.current.flyTo(newCoords, 14, { duration: 1.5 });
        }
        if (circleRef.current) {
          circleRef.current.setLatLng(newCoords);
        }
        if (userMarkerRef.current) {
          userMarkerRef.current.setLatLng(newCoords);
        }

        showToast('📍 Live GPS Centered on OpenStreetMap! Radar active. 🎉');
      },
      (error) => {
        setGpsLoading(false);
        showToast('GPS permission required or timed out. Centered on Mumbai Hub.', 'info');
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const handleZoom = (delta) => {
    if (!mapInstanceRef.current) return;
    const currentZoom = mapInstanceRef.current.getZoom();
    mapInstanceRef.current.setZoom(currentZoom + delta);
  };

  return (
    <div className="relative w-full h-[620px] bg-[#0B0C10] border border-gold-500/30 rounded-3xl overflow-hidden shadow-2xl flex flex-col">
      
      {/* Leaflet Map Canvas */}
      <div ref={mapContainerRef} className="w-full h-full z-0" />

      {/* Top Floating Control Bar */}
      <div className="absolute top-4 left-4 right-4 z-10 flex flex-wrap items-center justify-between gap-3 bg-[#15171E]/95 backdrop-blur-md p-3 rounded-2xl border border-gold-500/30 shadow-xl">
        
        {/* GPS Location Button */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleEnableGPS}
            disabled={gpsLoading}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-extrabold transition shadow-md ${
              gpsActive
                ? 'gold-gradient-bg text-black border border-gold-500/50'
                : 'bg-[#1F2430] hover:bg-gold-500 hover:text-black text-gold-300 border border-gold-500/30'
            }`}
          >
            <Crosshair className={`w-4 h-4 ${gpsLoading ? 'animate-spin' : ''}`} />
            <span>{gpsActive ? '📍 Real-Time GPS Active' : '📍 Enable Live GPS Location'}</span>
          </button>
          
          <span className="hidden sm:inline text-[11px] text-gray-300 font-medium truncate max-w-[200px]">
            {gpsActive ? 'OpenStreetMap Live Coordinates' : 'Mumbai Central (72.877°E, 19.076°N)'}
          </span>
        </div>

        {/* Filters, Radius & Map Style */}
        <div className="flex items-center gap-2 text-xs">
          {/* Layer Selector */}
          <div className="flex items-center gap-1.5 bg-[#1F2430] px-3 py-1.5 rounded-xl border border-white/10">
            <Layers className="w-3.5 h-3.5 text-gold-400" />
            <select
              value={currentLayer}
              onChange={(e) => setCurrentLayer(e.target.value)}
              className="bg-transparent text-white font-bold outline-none cursor-pointer text-[11px]"
            >
              <option value="dark" className="bg-[#15171E]">Luxury Dark (OSM)</option>
              <option value="voyager" className="bg-[#15171E]">Voyager Light (OSM)</option>
              <option value="osm" className="bg-[#15171E]">Standard (OSM)</option>
            </select>
          </div>

          {/* Radius Selector */}
          <div className="flex items-center gap-1.5 bg-[#1F2430] px-3 py-1.5 rounded-xl border border-white/10">
            <Filter className="w-3.5 h-3.5 text-gold-400" />
            <span className="text-gray-400">Radius:</span>
            <select
              value={radiusKm}
              onChange={(e) => {
                const val = Number(e.target.value);
                setRadiusKm(val);
                if (circleRef.current) circleRef.current.setRadius(val * 1000);
              }}
              className="bg-transparent text-white font-bold outline-none cursor-pointer text-[11px]"
            >
              <option value={5} className="bg-[#15171E]">5 km</option>
              <option value={10} className="bg-[#15171E]">10 km</option>
              <option value={15} className="bg-[#15171E]">15 km</option>
              <option value={30} className="bg-[#15171E]">30 km</option>
            </select>
          </div>
        </div>
      </div>

      {/* Floating Zoom & Centering Controls */}
      <div className="absolute right-4 bottom-24 z-10 flex flex-col gap-2">
        <button
          onClick={() => handleZoom(1)}
          className="w-9 h-9 rounded-xl bg-[#15171E] hover:bg-gold-500 hover:text-black border border-white/10 text-white font-bold flex items-center justify-center shadow-lg transition"
          title="Zoom In"
        >
          <ZoomIn className="w-4 h-4" />
        </button>
        <button
          onClick={() => handleZoom(-1)}
          className="w-9 h-9 rounded-xl bg-[#15171E] hover:bg-gold-500 hover:text-black border border-white/10 text-white font-bold flex items-center justify-center shadow-lg transition"
          title="Zoom Out"
        >
          <ZoomOut className="w-4 h-4" />
        </button>
        <button
          onClick={handleEnableGPS}
          className="w-9 h-9 rounded-xl bg-gold-500 hover:bg-gold-400 text-black font-bold flex items-center justify-center shadow-lg transition"
          title="Recenter to GPS"
        >
          <Crosshair className="w-4 h-4" />
        </button>
      </div>

      {/* Bottom Popup for Selected Item */}
      {selectedPin && (
        <div className="absolute bottom-4 left-4 right-4 z-10 bg-[#15171E]/95 backdrop-blur-md border border-gold-500/40 rounded-2xl p-4 shadow-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-in fade-in">
          {selectedPin.type === 'book' ? (
            <>
              <div className="flex items-center gap-3">
                <img src={selectedPin.data.coverUrl} alt="" className="w-12 h-16 object-cover rounded-lg shadow-md shrink-0" />
                <div>
                  <span className="text-[10px] font-bold text-gold-400 uppercase tracking-wider">{selectedPin.data.genre}</span>
                  <h4 className="font-bold text-sm text-white">{selectedPin.data.title}</h4>
                  <p className="text-xs text-gray-300">
                    Owner: <span className="text-white font-semibold">{selectedPin.data.owner?.name || 'Local Reader'}</span> • 📍 {selectedPin.data.distanceKm || 1.8} km away
                  </p>
                </div>
              </div>

              <button
                onClick={() => {
                  if (onSelectBook) onSelectBook(selectedPin.data);
                }}
                className="flex items-center justify-center gap-1.5 gold-gradient-bg text-black font-extrabold px-5 py-2.5 rounded-xl text-xs shadow-md hover:opacity-95 transition shrink-0"
              >
                <span>Request Physical Swap</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </>
          ) : (
            <>
              <div className="flex items-center gap-3">
                <img src={selectedPin.data.avatar} alt="" className="w-12 h-12 object-cover rounded-xl border border-gold-500/40 shadow-md shrink-0" />
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-base">{selectedPin.data.vehicleIcon}</span>
                    <h4 className="font-bold text-sm text-white">{selectedPin.data.name}</h4>
                    <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full font-bold">
                      {selectedPin.data.status}
                    </span>
                  </div>
                  <p className="text-xs text-gray-300 mt-0.5">
                    {selectedPin.data.vehicle} • ⚡ {selectedPin.data.etaMinutes} min ETA • ⭐ {selectedPin.data.rating} ({selectedPin.data.reviews} swaps)
                  </p>
                </div>
              </div>

              <button
                onClick={() => {
                  if (onSelectAgent) onSelectAgent(selectedPin.data);
                }}
                className="flex items-center justify-center gap-1.5 gold-gradient-bg text-black font-extrabold px-5 py-2.5 rounded-xl text-xs shadow-md hover:opacity-95 transition shrink-0"
              >
                <span>Dispatch Courier ({selectedPin.data.fee})</span>
                <Bike className="w-4 h-4" />
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default OpenStreetMapView;
