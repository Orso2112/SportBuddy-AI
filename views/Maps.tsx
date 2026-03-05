
import React, { useState, useEffect, useRef } from 'react';
import { Search, MapPin, Loader2, Info, X, Map as MapIcon, LocateFixed, Sparkles, Send, Navigation, ChevronLeft } from 'lucide-react';
import { geminiService } from '../services/geminiService';
import { Language } from '../types';
import { translations } from '../i18n';
import FormattedText from '../components/FormattedText';

interface Venue {
  name: string;
  description: string;
  coords: [number, number];
}

const Maps: React.FC<{ lang: Language }> = ({ lang }) => {
  const t = translations[lang];
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<{ text: string; grounding: any[] } | null>(null);
  const [location, setLocation] = useState('');
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  const [venues, setVenues] = useState<Venue[]>([]);
  const [selectedVenue, setSelectedVenue] = useState<Venue | null>(null);

  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const markersLayerRef = useRef<any>(null);

  const [mapReady, setMapReady] = useState(false);

  // Initialize Map
  useEffect(() => {
    let isMounted = true;
    let retryCount = 0;
    const maxRetries = 20;

    const initMap = () => {
      if (!isMounted) return;
      
      const L = (window as any).L;
      if (!L || !mapContainerRef.current) {
        if (retryCount < maxRetries) {
          retryCount++;
          setTimeout(initMap, 200);
        } else {
          setError(lang === 'it' ? 'Errore nel caricamento della mappa.' : 'Error loading map library.');
        }
        return;
      }

      if (mapRef.current) return;

      try {
        // Initialize map
        const map = L.map(mapContainerRef.current, {
          zoomControl: false,
          scrollWheelZoom: true,
          fadeAnimation: true
        }).setView([41.9028, 12.4964], 6);

        L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
          attribution: '&copy; OpenStreetMap contributors &copy; CARTO'
        }).addTo(map);

        markersLayerRef.current = L.layerGroup().addTo(map);
        mapRef.current = map;
        
        setMapReady(true);
        
        // Force a resize check after a short delay to ensure container is fully rendered
        setTimeout(() => {
          if (mapRef.current) {
            mapRef.current.invalidateSize();
          }
        }, 300);
      } catch (err) {
        console.error("Map initialization failed:", err);
        setError(lang === 'it' ? 'Impossibile inizializzare la mappa.' : 'Failed to initialize map.');
      }
    };

    initMap();

    return () => {
      isMounted = false;
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
        markersLayerRef.current = null;
        setMapReady(false);
      }
    };
  }, [lang]);

  // Parse venues from AI text results
  useEffect(() => {
    if (!results?.text) return;

    const parsedVenues: Venue[] = [];
    const sections = results.text.split(/##\s+/);
    
    sections.forEach(section => {
      if (!section.trim()) return;
      
      const coordMatch = section.match(/\[COORDINATES:\s*(-?\d+\.?\d*),\s*(-?\d+\.?\d*)\]/);
      if (coordMatch) {
        const lat = parseFloat(coordMatch[1]);
        const lng = parseFloat(coordMatch[2]);
        
        const firstLine = section.split('\n')[0].trim();
        const name = firstLine.split('[COORDINATES')[0].trim();
        
        parsedVenues.push({
          name: name || (lang === 'it' ? "Impianto Sportivo" : "Sports Facility"),
          description: section.replace(/\[COORDINATES:.*?\]/, '').trim(),
          coords: [lat, lng]
        });
      }
    });

    setVenues(parsedVenues);
  }, [results, lang]);

  // Update markers when venues or map is ready
  useEffect(() => {
    if (mapReady && venues.length >= 0) {
      updateMapMarkers(venues);
    }
  }, [mapReady, venues]);

  const updateMapMarkers = (venuesList: Venue[]) => {
    const L = (window as any).L;
    if (!L || !mapRef.current || !markersLayerRef.current) return;

    markersLayerRef.current.clearLayers();
    
    if (venuesList.length === 0) {
      if (coords) {
        mapRef.current.flyTo([coords.lat, coords.lng], 14);
      }
      return;
    }

    const bounds = L.latLngBounds();

    venuesList.forEach((v) => {
      const marker = L.marker(v.coords, {
        icon: L.divIcon({
          className: 'custom-marker',
          html: `<div class="w-10 h-10 bg-blue-600 rounded-full border-4 border-white dark:border-gray-800 flex items-center justify-center text-white shadow-2xl scale-100 hover:scale-110 transition-all cursor-pointer"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg></div>`,
          iconSize: [40, 40],
          iconAnchor: [20, 40]
        })
      });

      marker.on('click', () => {
        setSelectedVenue(v);
        mapRef.current.flyTo(v.coords, 16, { duration: 1 });
      });

      marker.addTo(markersLayerRef.current);
      bounds.extend(v.coords);
    });

    mapRef.current.fitBounds(bounds, { padding: [50, 50], maxZoom: 15 });
  };

  const handleSearch = async (loc?: string, explicitCoords?: { lat: number; lng: number }) => {
    const targetLoc = loc !== undefined ? loc : location;
    const targetCoords = explicitCoords || coords;
    
    if (!targetLoc.trim() && !targetCoords) return;
    
    setLoading(true);
    setError(null);
    setSelectedVenue(null);

    try {
      const res = await geminiService.getSmartVenues(targetLoc.trim() || undefined, targetCoords || undefined, lang);
      setResults(res);
      if (venues.length === 0 && res.text.length < 50) {
         // Potentially no results found
         if (targetCoords) mapRef.current.flyTo([targetCoords.lat, targetCoords.lng], 14);
      }
    } catch (err) {
      setError(lang === 'it' ? 'Impossibile trovare luoghi in questa zona.' : 'Unable to find venues in this area.');
    } finally {
      setLoading(false);
    }
  };

  const getGeolocation = () => {
    if (!navigator.geolocation) {
      setError(t.location_denied);
      return;
    }

    setLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const newCoords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setCoords(newCoords);
        setError(null);
        if (mapRef.current) {
          mapRef.current.setView([pos.coords.latitude, pos.coords.longitude], 14);
        }
        // Direct call with newly fetched coordinates
        handleSearch("", newCoords);
      },
      (err) => {
        setLoading(false);
        setError(t.location_denied + (err.message ? ` (${err.message})` : ''));
      },
      { timeout: 10000 }
    );
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto pb-12 px-2 h-full flex flex-col">
      <div className="flex justify-between items-center shrink-0">
        <div>
          <h2 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight uppercase">{t.smart_venues}</h2>
          <p className="text-sm text-gray-500 font-medium mt-1">
            {lang === 'en' ? 'Interactive AI venue discovery' : 'Scoperta interattiva dei campi via AI'}
          </p>
        </div>
        <div className="w-14 h-14 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-[1.25rem] flex items-center justify-center text-blue-500 shadow-xl">
          <MapIcon size={28} />
        </div>
      </div>

      <div className="space-y-4 shrink-0">
        <div className="relative group">
          <div className="relative flex items-center bg-white dark:bg-gray-900 border-2 border-gray-100 dark:border-gray-800 rounded-[2.5rem] p-3 shadow-xl transition-all focus-within:ring-4 focus-within:ring-blue-500/5">
            <div className="pl-4 pr-3 text-gray-400">
              <Search size={22} />
            </div>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              placeholder={lang === 'en' ? "Enter city or specific area..." : "Inserisci città o zona specifica..."}
              className="flex-1 bg-transparent dark:text-white py-3 outline-none text-base font-bold placeholder-gray-400"
            />
            <button
              onClick={() => handleSearch()}
              disabled={loading || (!location.trim() && !coords)}
              className="p-4 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 transition-all flex items-center justify-center disabled:opacity-50"
            >
              {loading ? <Loader2 size={22} className="animate-spin" /> : <Send size={22} />}
            </button>
          </div>
        </div>
        
        <div className="flex justify-center">
          <button
            onClick={getGeolocation}
            disabled={loading}
            className="flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.2em] text-blue-600 dark:text-blue-400 py-4 px-8 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-[1.5rem] hover:shadow-lg transition-all active:scale-95 group shadow-sm disabled:opacity-50"
          >
            {loading && !venues.length ? <Loader2 size={18} className="animate-spin" /> : <LocateFixed size={18} className="group-hover:rotate-12 transition-transform" />}
            {lang === 'en' ? 'Use My Location' : 'Usa la mia posizione'}
          </button>
        </div>
      </div>

      {error && (
        <div className="p-6 bg-red-50 dark:bg-red-900/10 border-2 border-red-100 dark:border-red-900/20 text-red-600 dark:text-red-400 rounded-[2.5rem] text-xs font-black uppercase tracking-widest flex items-center gap-4 shadow-sm animate-in slide-in-from-top-2 shrink-0">
          <Info size={18} />
          <p>{error}</p>
        </div>
      )}

      {/* Map Section */}
      <div className="relative rounded-[3rem] overflow-hidden shadow-2xl border-4 border-white dark:border-gray-800 bg-gray-900 flex-1 min-h-[400px]">
        <div id="venue-map" ref={mapContainerRef} className="absolute inset-0 z-10" />
        
        {loading && (
          <div className="absolute inset-0 z-50 bg-gray-950/70 backdrop-blur-md flex flex-col items-center justify-center text-white">
            <div className="relative mb-6">
              <div className="absolute -inset-6 bg-blue-500/30 rounded-full blur-2xl animate-pulse"></div>
              <Loader2 className="animate-spin text-blue-500" size={64} strokeWidth={1.5} />
            </div>
            <span className="text-xs font-black uppercase tracking-[0.4em] animate-pulse">{t.searching}</span>
          </div>
        )}

        {/* Selected Venue Details Overlay */}
        {selectedVenue && (
          <div className="absolute bottom-6 left-6 right-6 z-[60] animate-in slide-in-from-bottom-12 duration-700">
            <div className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-2xl p-8 rounded-[3rem] shadow-[0_30px_60px_-12px_rgba(0,0,0,0.5)] border border-white/20 dark:border-gray-700 relative group overflow-hidden">
              <div className="absolute top-0 left-0 w-3 h-full bg-blue-600"></div>
              
              <button 
                onClick={() => setSelectedVenue(null)}
                className="absolute top-6 right-6 p-3 bg-gray-100 dark:bg-gray-800 rounded-2xl text-gray-500 hover:text-red-500 transition-colors shadow-sm"
              >
                <X size={20} />
              </button>
              
              <div className="flex items-center gap-6 mb-6">
                <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/40 text-blue-600 rounded-[1.5rem] flex items-center justify-center shadow-inner">
                  <MapPin size={32} />
                </div>
                <div className="pr-12">
                  <h3 className="text-2xl font-black dark:text-white leading-none tracking-tight uppercase">{selectedVenue.name}</h3>
                  <div className="flex items-center gap-2 mt-2">
                     <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
                     <p className="text-[10px] text-blue-500 font-black uppercase tracking-widest">Verified Venue</p>
                  </div>
                </div>
              </div>

              <div className="max-h-[150px] overflow-y-auto no-scrollbar mb-8 pr-2 text-gray-700 dark:text-gray-300">
                <FormattedText text={selectedVenue.description} />
              </div>

              <div className="flex gap-4">
                <a 
                  href={`https://www.google.com/maps/dir/?api=1&destination=${selectedVenue.coords[0]},${selectedVenue.coords[1]}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 flex items-center justify-center gap-3 py-5 bg-blue-600 text-white rounded-[1.75rem] font-black text-xs uppercase tracking-widest hover:bg-blue-700 transition-all shadow-xl shadow-blue-500/30 active:scale-95 group"
                >
                  <Navigation size={18} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                  {lang === 'en' ? 'Get Directions' : 'Ottieni Indicazioni'}
                </a>
              </div>
            </div>
          </div>
        )}

        {/* Empty State Overlay */}
        {!venues.length && !loading && !error && (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-gray-900/40 backdrop-blur-[2px] pointer-events-none">
            <div className="p-10 bg-white/10 dark:bg-gray-800/40 backdrop-blur-2xl rounded-[3.5rem] border border-white/10 text-center shadow-2xl">
              <div className="w-20 h-20 bg-blue-600/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <Sparkles className="text-blue-400" size={40} />
              </div>
              <h4 className="text-white text-lg font-black uppercase tracking-tight mb-2">Discovery Map</h4>
              <p className="text-white/60 text-[10px] font-black uppercase tracking-[0.2em] leading-relaxed max-w-[240px] mx-auto">
                Search above to find sports facilities near you plotted in real-time.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Discovery Indicator */}
      {venues.length > 0 && !selectedVenue && (
        <div className="bg-white dark:bg-gray-900 p-6 rounded-[2.5rem] border border-gray-100 dark:border-gray-800 flex items-center justify-between gap-4 animate-in fade-in duration-1000 shrink-0 shadow-lg">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-50 dark:bg-blue-900/20 text-blue-500 rounded-2xl flex items-center justify-center shadow-inner">
              <Sparkles size={24} />
            </div>
            <div>
              <p className="text-[11px] text-gray-900 dark:text-white font-black uppercase tracking-widest">
                {lang === 'en' ? 'Venues Found' : 'Luoghi Trovati'}
              </p>
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-[0.1em] mt-0.5">
                {lang === 'en' ? `We spotted ${venues.length} locations. Tap a pin!` : `Abbiamo trovato ${venues.length} posti. Tocca un pin!`}
              </p>
            </div>
          </div>
          <div className="flex -space-x-3">
             {venues.slice(0, 3).map((_, i) => (
               <div key={i} className="w-8 h-8 rounded-full border-2 border-white dark:border-gray-900 bg-blue-600 flex items-center justify-center text-white text-[8px] font-black">
                 {i + 1}
               </div>
             ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Maps;