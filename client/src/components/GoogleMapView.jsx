// Source: Google Maps Platform Code Assist
import React, { useEffect, useRef, useState } from 'react';
import { 
  Navigation, Crosshair, Filter, Layers, ZoomIn, ZoomOut, 
  MapPin, Bike, Sparkles, CheckCircle2, ArrowRight, Shield, RefreshCw 
} from 'lucide-react';
import { useToast } from '../context/ToastContext';

// Standard Google Maps luxury dark mode styling
const DARK_MAP_STYLE = [
  { elementType: 'geometry', stylers: [{ color: '#15171E' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#15171E' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#D4AF37' }] },
  {
    featureType: 'administrative.locality',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#EAEAEA' }]
  },
  {
    featureType: 'poi',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#94A3B8' }]
  },
  {
    featureType: 'poi.park',
    elementType: 'geometry',
    stylers: [{ color: '#1A2130' }]
  },
  {
    featureType: 'road',
    elementType: 'geometry',
    stylers: [{ color: '#262D3D' }]
  },
  {
    featureType: 'road',
    elementType: 'geometry.stroke',
    stylers: [{ color: '#1E2430' }]
  },
  {
    featureType: 'road',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#8A97A8' }]
  },
  {
    featureType: 'road.highway',
    elementType: 'geometry',
    stylers: [{ color: '#3A4459' }]
  },
  {
    featureType: 'road.highway',
    elementType: 'geometry.stroke',
    stylers: [{ color: '#1F2430' }]
  },
  {
    featureType: 'road.highway',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#D4AF37' }]
  },
  {
    featureType: 'transit',
    elementType: 'geometry',
    stylers: [{ color: '#1F2430' }]
  },
  {
    featureType: 'water',
    elementType: 'geometry',
    stylers: [{ color: '#0B0C10' }]
  },
  {
    featureType: 'water',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#4B5563' }]
  }
];

export const MOCK_DELIVERY_AGENTS = [
  {
    id: 'agent-1',
    name: 'Vikram "Speedy" Das',
    vehicle: 'Electric Scooter',
    vehicleIcon: '🛵',
    rating: 4.9,
    reviews: 142,
    etaMinutes: 12,
    status: 'AVAILABLE',
    fee: '₹40',
    distanceKm: 1.2,
    coordinates: { lat: 19.0820, lng: 72.8820 },
    currentLocationName: 'Bandra West Courier Hub',
    phone: '+91 98201 44512',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
    tag: '⚡ Top Rated Courier'
  },
  {
    id: 'agent-2',
    name: 'Kavita Patil',
    vehicle: 'Green Eco-Bicycle',
    vehicleIcon: '🚲',
    rating: 5.0,
    reviews: 89,
    etaMinutes: 20,
    status: 'AVAILABLE',
    fee: '₹30 (Eco Rate)',
    distanceKm: 0.8,
    coordinates: { lat: 19.0710, lng: 72.8710 },
    currentLocationName: 'Dadar Book District',
    phone: '+91 98192 33410',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=400&q=80',
    tag: '🌱 100% Zero-Emission'
  },
  {
    id: 'agent-3',
    name: 'Arjun Mehta',
    vehicle: 'Metro Rapid Transit',
    vehicleIcon: '🚇',
    rating: 4.8,
    reviews: 210,
    etaMinutes: 25,
    status: 'ON_DELIVERY',
    fee: '₹45',
    distanceKm: 2.4,
    coordinates: { lat: 19.0900, lng: 72.8650 },
    currentLocationName: 'Andheri Metro Junction',
    phone: '+91 98209 88123',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
    tag: '📦 Heavy Bundle Courier'
  },
  {
    id: 'agent-4',
    name: 'Sameer Khan',
    vehicle: 'Hyperlocal Runner',
    vehicleIcon: '🏃',
    rating: 4.9,
    reviews: 65,
    etaMinutes: 15,
    status: 'AVAILABLE',
    fee: '₹35',
    distanceKm: 1.5,
    coordinates: { lat: 19.0650, lng: 72.8890 },
    currentLocationName: 'Kurla West Hub',
    phone: '+91 98334 12908',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80',
    tag: '⚡ 15-Min Express'
  }
];

const GoogleMapView = ({ 
  books = [], 
  activeTab = 'books', 
  onSelectBook, 
  onSelectAgent 
}) => {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersRef = useRef([]);
  const circleRef = useRef(null);
  const userMarkerRef = useRef(null);
  const { showToast } = useToast();

  const [mapLoaded, setMapLoaded] = useState(false);
  const [mapError, setMapError] = useState(null);
  const [gpsActive, setGpsActive] = useState(false);
  const [gpsLoading, setGpsLoading] = useState(false);
  const [currentCenter, setCurrentCenter] = useState({ lat: 19.0760, lng: 72.8777 }); // Mumbai Central
  const [radiusKm, setRadiusKm] = useState(10);
  const [selectedPin, setSelectedPin] = useState(null);

  // Load Google Maps JavaScript API script dynamically
  useEffect(() => {
    // Check if script is already present
    if (window.google && window.google.maps) {
      setMapLoaded(true);
      return;
    }

    const existingScript = document.getElementById('google-maps-script');
    if (existingScript) {
      existingScript.onload = () => setMapLoaded(true);
      return;
    }

    const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '';
    const script = document.createElement('script');
    script.id = 'google-maps-script';
    // Append tracking client parameter per GMP skill mandate
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places,geometry,marker&v=weekly`;
    script.async = true;
    script.defer = true;
    script.onload = () => {
      setMapLoaded(true);
    };
    script.onerror = () => {
      console.warn('Google Maps API Key not yet supplied or invalid. Initializing Vector Canvas fallback.');
      setMapError('Google Maps API key not configured. Using high-precision Vector Canvas.');
    };

    document.head.appendChild(script);
  }, []);

  // Initialize Map when script is loaded
  useEffect(() => {
    if (!mapLoaded || !mapRef.current || !window.google || !window.google.maps) return;

    try {
      const map = new window.google.maps.Map(mapRef.current, {
        center: currentCenter,
        zoom: 13,
        styles: DARK_MAP_STYLE,
        disableDefaultUI: true,
        zoomControl: false,
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: false
      });

      mapInstanceRef.current = map;

      // Add Radius Circle
      circleRef.current = new window.google.maps.Circle({
        strokeColor: '#D4AF37',
        strokeOpacity: 0.6,
        strokeWeight: 2,
        fillColor: '#D4AF37',
        fillOpacity: 0.08,
        map,
        center: currentCenter,
        radius: radiusKm * 1000
      });

      // User location marker
      userMarkerRef.current = new window.google.maps.Marker({
        position: currentCenter,
        map,
        title: 'Your Location',
        icon: {
          path: window.google.maps.SymbolPath.CIRCLE,
          scale: 8,
          fillColor: '#D4AF37',
          fillOpacity: 1,
          strokeColor: '#000000',
          strokeWeight: 2
        }
      });
    } catch (err) {
      console.error('Google Maps init error:', err);
    }
  }, [mapLoaded]);

  // Update markers when books, agents, or activeTab changes
  useEffect(() => {
    if (!mapInstanceRef.current || !window.google || !window.google.maps) return;

    // Clear existing markers
    markersRef.current.forEach(m => m.setMap(null));
    markersRef.current = [];

    const map = mapInstanceRef.current;

    if (activeTab === 'books') {
      // Add Book markers
      books.forEach((book, idx) => {
        const offsetLat = currentCenter.lat + (Math.sin(idx * 1.5) * (book.distanceKm || 1.5) * 0.009);
        const offsetLng = currentCenter.lng + (Math.cos(idx * 1.5) * (book.distanceKm || 1.5) * 0.009);
        const pos = { lat: offsetLat, lng: offsetLng };

        const marker = new window.google.maps.Marker({
          position: pos,
          map,
          title: book.title,
          icon: {
            url: book.coverUrl,
            scaledSize: new window.google.maps.Size(32, 44),
            origin: new window.google.maps.Point(0, 0),
            anchor: new window.google.maps.Point(16, 44)
          }
        });

        marker.addListener('click', () => {
          setSelectedPin({ type: 'book', data: book, pos });
          if (onSelectBook) onSelectBook(book);
        });

        markersRef.current.push(marker);
      });
    } else {
      // Add Delivery Agent markers
      MOCK_DELIVERY_AGENTS.forEach((agent) => {
        const marker = new window.google.maps.Marker({
          position: agent.coordinates,
          map,
          title: agent.name,
          label: {
            text: agent.vehicleIcon,
            fontSize: '18px'
          },
          icon: {
            path: window.google.maps.SymbolPath.CIRCLE,
            scale: 16,
            fillColor: '#F59E0B',
            fillOpacity: 0.9,
            strokeColor: '#000000',
            strokeWeight: 2
          }
        });

        marker.addListener('click', () => {
          setSelectedPin({ type: 'agent', data: agent, pos: agent.coordinates });
          if (onSelectAgent) onSelectAgent(agent);
        });

        markersRef.current.push(marker);
      });
    }
  }, [books, activeTab, mapLoaded, currentCenter]);

  // Handle GPS detection
  const handleEnableGPS = () => {
    if (!navigator.geolocation) {
      showToast('Geolocation not supported by browser', 'error');
      return;
    }

    setGpsLoading(true);
    showToast('Detecting your live GPS location...');

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        const newPos = { lat: latitude, lng: longitude };
        setCurrentCenter(newPos);
        setGpsActive(true);
        setGpsLoading(false);

        if (mapInstanceRef.current) {
          mapInstanceRef.current.panTo(newPos);
          mapInstanceRef.current.setZoom(14);
        }
        if (circleRef.current) {
          circleRef.current.setCenter(newPos);
        }
        if (userMarkerRef.current) {
          userMarkerRef.current.setPosition(newPos);
        }

        showToast('📍 Real-Time Google Maps Centered to Your Exact Coordinates! 🎉');
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
    const currentZoom = mapInstanceRef.current.getZoom() || 13;
    mapInstanceRef.current.setZoom(currentZoom + delta);
  };

  return (
    <div className="relative w-full h-[620px] bg-[#0B0C10] border border-gold-500/30 rounded-3xl overflow-hidden shadow-2xl flex flex-col">
      
      {/* Real Google Maps Container */}
      <div ref={mapRef} className="w-full h-full" style={{ minHeight: '620px' }}>
        {/* Fallback Vector Canvas if no Google Maps API Key */}
        {(!mapLoaded || mapError) && (
          <div className="relative w-full h-full bg-gradient-to-br from-[#0F1117] via-[#151821] to-[#0B0C10] flex items-center justify-center overflow-hidden">
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f243025_1px,transparent_1px),linear-gradient(to_bottom,#1f243025_1px,transparent_1px)] bg-[size:36px_36px]" />
            
            {/* Pulsing Radar rings */}
            <div className="absolute w-[460px] h-[460px] rounded-full border border-gold-500/20 animate-ping opacity-25 pointer-events-none" />
            <div className="absolute w-[300px] h-[300px] rounded-full border border-gold-500/30 opacity-40 pointer-events-none" />
            <div className="absolute w-[160px] h-[160px] rounded-full border border-amber-500/50 opacity-60 pointer-events-none" />

            {/* Center User Pin */}
            <div className="absolute z-10 flex flex-col items-center">
              <div className="w-6 h-6 rounded-full bg-gold-400 border-2 border-black flex items-center justify-center shadow-xl shadow-gold-500/60 animate-bounce">
                <div className="w-2.5 h-2.5 rounded-full bg-black" />
              </div>
              <span className="bg-black/90 backdrop-blur-md px-2.5 py-1 rounded-full text-[10px] text-gold-300 font-bold mt-1.5 border border-gold-500/40 shadow-lg">
                {gpsActive ? '📍 Your Live Position' : '📍 You (Center Point)'}
              </span>
            </div>

            {/* Interactive Pins */}
            {activeTab === 'books' ? (
              books.map((book, idx) => {
                const angle = (idx / (books.length || 1)) * 2 * Math.PI;
                const distanceOffset = 85 + (idx % 3) * 60;
                const leftOffset = Math.cos(angle) * distanceOffset;
                const topOffset = Math.sin(angle) * distanceOffset;

                return (
                  <button
                    key={book._id}
                    onClick={() => {
                      setSelectedPin({ type: 'book', data: book });
                      if (onSelectBook) onSelectBook(book);
                    }}
                    style={{ transform: `translate(${leftOffset}px, ${topOffset}px)` }}
                    className="absolute z-10 group flex flex-col items-center cursor-pointer transition-transform hover:scale-125"
                  >
                    <div className="relative">
                      <img
                        src={book.coverUrl}
                        alt={book.title}
                        className="w-10 h-14 object-cover rounded-lg border-2 border-gold-500 shadow-2xl group-hover:border-amber-400"
                      />
                      <span className="absolute -top-2 -right-2 px-1.5 py-0.5 rounded-full bg-gold-500 text-black font-extrabold text-[9px] shadow">
                        {book.distanceKm || 1.8}km
                      </span>
                    </div>
                    <span className="bg-[#15171E]/95 text-white font-semibold text-[10px] px-2 py-0.5 rounded-md mt-1 border border-white/10 shadow-md truncate max-w-[100px]">
                      {book.title}
                    </span>
                  </button>
                );
              })
            ) : (
              MOCK_DELIVERY_AGENTS.map((agent, idx) => {
                const angle = (idx / MOCK_DELIVERY_AGENTS.length) * 2 * Math.PI + 0.5;
                const distanceOffset = 70 + idx * 45;
                const leftOffset = Math.cos(angle) * distanceOffset;
                const topOffset = Math.sin(angle) * distanceOffset;

                return (
                  <button
                    key={agent.id}
                    onClick={() => {
                      setSelectedPin({ type: 'agent', data: agent });
                      if (onSelectAgent) onSelectAgent(agent);
                    }}
                    style={{ transform: `translate(${leftOffset}px, ${topOffset}px)` }}
                    className="absolute z-10 group flex flex-col items-center cursor-pointer transition-transform hover:scale-125"
                  >
                    <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-gold-500 to-amber-600 text-black font-extrabold flex items-center justify-center text-xl shadow-xl shadow-gold-500/40 border-2 border-black">
                      {agent.vehicleIcon}
                    </div>
                    <div className="bg-[#15171E]/95 border border-gold-500/40 px-2 py-0.5 rounded-lg text-[10px] text-white font-bold mt-1 shadow flex items-center gap-1">
                      <span>{agent.name.split(' ')[0]}</span>
                      <span className="text-gold-400">⚡{agent.etaMinutes}m</span>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        )}
      </div>

      {/* Top Floating Control Bar */}
      <div className="absolute top-4 left-4 right-4 z-20 flex flex-wrap items-center justify-between gap-3 bg-[#15171E]/95 backdrop-blur-md p-3 rounded-2xl border border-gold-500/30 shadow-xl">
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
            {gpsActive ? 'Live Geolocation Pin Active' : 'Mumbai Central (72.877°E, 19.076°N)'}
          </span>
        </div>

        {/* Filters & Radius */}
        <div className="flex items-center gap-2 text-xs">
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
              className="bg-transparent text-white font-bold outline-none cursor-pointer"
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
      <div className="absolute right-4 bottom-24 z-20 flex flex-col gap-2">
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
        <div className="absolute bottom-4 left-4 right-4 z-30 bg-[#15171E]/95 backdrop-blur-md border border-gold-500/40 rounded-2xl p-4 shadow-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-in fade-in">
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
                <span>Request Swap</span>
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

export default GoogleMapView;
