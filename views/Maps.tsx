
import React, { useState } from 'react';
import { Search, MapPin, Loader2, Info, Navigation, ExternalLink, X, Map as MapIcon, LocateFixed, Sparkles, Send } from 'lucide-react';
import { geminiService } from '../services/geminiService';
import { Language } from '../types';
import { translations } from '../i18n';
import FormattedText from '../components/FormattedText';

const Maps: React.FC<{ lang: Language }> = ({ lang }) => {
  const t = translations[lang];
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<{ text: string; grounding: any[] } | null>(null);
  const [location, setLocation] = useState('');
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showInfo, setShowInfo] = useState(true);

  const handleSearch = async (loc?: string) => {
    const targetLoc = loc || location;
    if (!targetLoc && !coords) return;
    
    setLoading(true);
    setError(null);
    try {
      const res = await geminiService.getSmartVenues(targetLoc, coords || undefined, lang);
      setResults(res);
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

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setError(null);
        handleSearch(""); // Trigger search with coords
      },
      () => {
        setError(t.location_denied);
      }
    );
  };

  return (
    <div className="space-y-8 max-w-2xl mx-auto pb-12 px-2">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">{t.smart_venues}</h2>
          <p className="text-sm text-gray-500 font-medium mt-1">
            {lang === 'en' ? 'Find the best places to play' : 'Trova i migliori posti dove giocare'}
          </p>
        </div>
        <div className="w-12 h-12 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl flex items-center justify-center text-green-500 shadow-sm group">
          <MapIcon size={24} className="group-hover:rotate-12 transition-transform" />
        </div>
      </div>

      {showInfo && !results && (
        <div className="bg-gray-900 dark:bg-gray-800 p-6 rounded-[2rem] flex gap-5 relative animate-in fade-in slide-in-from-top-2 overflow-hidden shadow-xl">
          <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/10 rounded-full blur-3xl -mr-16 -mt-16"></div>
          <div className="w-12 h-12 rounded-2xl bg-green-500 flex items-center justify-center text-white shrink-0 shadow-lg shadow-green-500/20">
            <MapIcon size={24} />
          </div>
          <div className="flex-1">
            <h4 className="text-sm font-black text-white uppercase tracking-widest mb-1">{lang === 'en' ? 'Smart Discovery' : 'Scoperta Smart'}</h4>
            <p className="text-[11px] text-gray-300 leading-relaxed font-medium pr-8">
              {t.smart_venues_desc}
            </p>
          </div>
          <button onClick={() => setShowInfo(false)} className="absolute top-4 right-4 text-gray-500 hover:text-white transition-colors p-2">
            <X size={18} />
          </button>
        </div>
      )}

      <div className="space-y-6">
        <div className="relative group">
          <div className="relative flex items-center bg-white dark:bg-gray-900 border-2 border-gray-100 dark:border-gray-800 rounded-[2.5rem] p-3 shadow-sm focus-within:border-blue-500/50 transition-all">
            <div className="pl-4 pr-3 text-gray-400">
              <Search size={22} />
            </div>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              placeholder={lang === 'en' ? "Search city or area..." : "Cerca città o zona..."}
              className="flex-1 bg-transparent dark:text-white py-4 outline-none text-base font-medium"
            />
            <button
              onClick={() => handleSearch()}
              disabled={loading || (!location.trim() && !coords)}
              className="p-4 bg-blue-600 text-white rounded-full shadow-xl shadow-blue-600/20 hover:bg-blue-700 hover:scale-105 disabled:opacity-50 transition-all active:scale-95 flex items-center justify-center"
            >
              {loading ? <Loader2 size={22} className="animate-spin" /> : <Send size={22} />}
            </button>
          </div>
        </div>
        
        <div className="flex justify-center">
          <button
            onClick={getGeolocation}
            className="flex items-center gap-3 text-xs font-black uppercase tracking-[0.2em] text-blue-600 dark:text-blue-400 py-4 px-8 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl hover:shadow-lg transition-all active:scale-95 group"
          >
            <LocateFixed size={18} className="group-hover:rotate-12 transition-transform" />
            {lang === 'en' ? 'Use My Location' : 'Usa la mia posizione'}
          </button>
        </div>
      </div>

      {error && (
        <div className="p-6 bg-red-50 dark:bg-red-900/10 border-2 border-red-100 dark:border-red-900/20 text-red-600 dark:text-red-400 rounded-[2.5rem] text-xs font-black uppercase tracking-widest flex items-center gap-4 animate-in slide-in-from-top-2">
          <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-900/40 flex items-center justify-center shrink-0">
            <Info size={18} />
          </div>
          <p className="leading-relaxed">{error}</p>
        </div>
      )}

      {results && !loading && (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <div className="bg-white dark:bg-gray-900 p-8 rounded-[3rem] shadow-xl border border-gray-100 dark:border-gray-800 relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-2 h-full bg-green-500"></div>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-green-100 dark:bg-green-900/40 text-green-600 rounded-xl flex items-center justify-center">
                <Sparkles size={20} />
              </div>
              <h3 className="text-lg font-black text-gray-900 dark:text-white uppercase tracking-tight">
                {lang === 'en' ? 'Smart Venues' : 'Luoghi Consigliati'}
              </h3>
            </div>
            <div className="bg-gray-50/50 dark:bg-gray-950/50 p-6 rounded-[2rem] border border-gray-100 dark:border-gray-800">
              <FormattedText text={results.text} />
            </div>
          </div>

          {results.grounding.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {results.grounding.map((chunk: any, i: number) => (
                chunk.maps && (
                  <a
                    key={i}
                    href={chunk.maps.uri}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between p-6 bg-white dark:bg-gray-900 rounded-[2rem] border border-gray-100 dark:border-gray-800 hover:border-blue-400 dark:hover:border-blue-500 hover:shadow-2xl transition-all group active:scale-95"
                  >
                    <div className="flex items-center gap-4 truncate">
                      <div className="w-12 h-12 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-2xl flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                        <MapPin size={22} />
                      </div>
                      <div className="truncate">
                        <span className="block text-base font-black text-gray-900 dark:text-gray-100 truncate">
                          {chunk.maps.title}
                        </span>
                        <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{lang === 'en' ? 'Navigate' : 'Naviga'}</span>
                      </div>
                    </div>
                    <ExternalLink size={18} className="text-gray-300 group-hover:text-blue-500 transition-colors ml-2" />
                  </a>
                )
              ))}
            </div>
          )}
        </div>
      )}

      {loading && (
        <div className="flex flex-col items-center justify-center py-24 bg-white dark:bg-gray-900/50 rounded-[3rem] border-2 border-dashed border-gray-200 dark:border-gray-800">
          <div className="relative mb-8">
            <Loader2 className="animate-spin text-blue-500" size={72} strokeWidth={1} />
            <MapPin className="absolute inset-0 m-auto text-blue-200" size={28} />
          </div>
          <p className="text-sm font-black animate-pulse uppercase tracking-[0.4em] text-gray-400">{t.searching}</p>
        </div>
      )}
    </div>
  );
};

export default Maps;
