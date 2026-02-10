
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
          <h2 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight uppercase">{t.smart_venues}</h2>
          <p className="text-sm text-gray-500 font-medium mt-1">
            {lang === 'en' ? 'Find the best places to play' : 'Trova i migliori posti dove giocare'}
          </p>
        </div>
        <div className="w-14 h-14 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-[1.25rem] flex items-center justify-center text-emerald-500 shadow-xl group">
          <MapIcon size={28} className="group-hover:rotate-12 transition-transform" />
        </div>
      </div>

      {showInfo && !results && (
        <div className="bg-gray-900 dark:bg-gray-800 p-8 rounded-[3rem] flex gap-6 relative animate-in fade-in slide-in-from-top-4 overflow-hidden shadow-2xl border border-white/5">
          <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-500/10 rounded-full blur-[60px] -mr-16 -mt-16"></div>
          <div className="w-14 h-14 rounded-2xl bg-emerald-500 flex items-center justify-center text-white shrink-0 shadow-2xl shadow-emerald-500/30">
            <MapIcon size={30} />
          </div>
          <div className="flex-1">
            <h4 className="text-base font-black text-white uppercase tracking-[0.2em] mb-2">{lang === 'en' ? 'Smart Discovery' : 'Scoperta Smart'}</h4>
            <p className="text-[12px] text-gray-300 leading-relaxed font-medium pr-8">
              {t.smart_venues_desc}
            </p>
          </div>
          <button onClick={() => setShowInfo(false)} className="absolute top-6 right-6 text-gray-500 hover:text-white transition-colors p-2 bg-white/5 rounded-full">
            <X size={18} />
          </button>
        </div>
      )}

      <div className="space-y-6">
        <div className="relative group">
          <div className="relative flex items-center bg-white dark:bg-gray-900 border-2 border-gray-100 dark:border-gray-800 rounded-[3rem] p-4 shadow-xl focus-within:border-blue-500/50 transition-all focus-within:ring-8 focus-within:ring-blue-500/5">
            <div className="pl-4 pr-3 text-gray-400">
              <Search size={24} />
            </div>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              placeholder={lang === 'en' ? "Search city or area..." : "Cerca città o zona..."}
              className="flex-1 bg-transparent dark:text-white py-4 outline-none text-lg font-bold placeholder-gray-400"
            />
            <button
              onClick={() => handleSearch()}
              disabled={loading || (!location.trim() && !coords)}
              className="p-5 bg-blue-600 text-white rounded-full shadow-[0_15px_40px_rgba(37,99,235,0.4)] hover:bg-blue-700 hover:scale-105 disabled:opacity-50 transition-all active:scale-95 flex items-center justify-center border-b-4 border-blue-800"
            >
              {loading ? <Loader2 size={24} className="animate-spin" /> : <Send size={24} />}
            </button>
          </div>
        </div>
        
        <div className="flex justify-center">
          <button
            onClick={getGeolocation}
            className="flex items-center gap-4 text-xs font-black uppercase tracking-[0.3em] text-blue-600 dark:text-blue-400 py-5 px-10 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-[1.5rem] hover:shadow-2xl transition-all active:scale-95 group shadow-sm"
          >
            <LocateFixed size={20} className="group-hover:rotate-12 transition-transform" />
            {lang === 'en' ? 'Use My Location' : 'Usa la mia posizione'}
          </button>
        </div>
      </div>

      {error && (
        <div className="p-8 bg-red-50 dark:bg-red-900/10 border-2 border-red-100 dark:border-red-900/20 text-red-600 dark:text-red-400 rounded-[3rem] text-xs font-black uppercase tracking-widest flex items-center gap-6 animate-in slide-in-from-top-2 shadow-sm">
          <div className="w-12 h-12 rounded-[1rem] bg-red-100 dark:bg-red-900/40 flex items-center justify-center shrink-0">
            <Info size={22} />
          </div>
          <p className="leading-relaxed">{error}</p>
        </div>
      )}

      {results && !loading && (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
          <div className="bg-white dark:bg-gray-900 p-10 rounded-[4rem] shadow-2xl border border-gray-100 dark:border-gray-800 relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-3 h-full bg-emerald-500"></div>
            <div className="flex items-center gap-4 mb-8">
              <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 rounded-2xl flex items-center justify-center shadow-inner">
                <Sparkles size={24} />
              </div>
              <h3 className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-tight">
                {lang === 'en' ? 'Recommended Venues' : 'Luoghi Consigliati'}
              </h3>
            </div>
            <div className="bg-gray-50/50 dark:bg-gray-950/50 p-8 rounded-[2.5rem] border border-gray-100 dark:border-gray-800 shadow-inner">
              <FormattedText text={results.text} />
            </div>
          </div>

          {results.grounding.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {results.grounding.map((chunk: any, i: number) => (
                chunk.maps && (
                  <a
                    key={i}
                    href={chunk.maps.uri}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between p-8 bg-white dark:bg-gray-900 rounded-[3rem] border border-gray-100 dark:border-gray-800 hover:border-blue-400 dark:hover:border-blue-500 hover:shadow-[0_20px_50px_rgba(0,0,0,0.1)] transition-all group active:scale-95"
                  >
                    <div className="flex items-center gap-5 truncate">
                      <div className="w-14 h-14 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-2xl flex items-center justify-center shrink-0 group-hover:scale-110 group-hover:rotate-6 transition-transform shadow-sm">
                        <MapPin size={26} />
                      </div>
                      <div className="truncate">
                        <span className="block text-lg font-black text-gray-900 dark:text-gray-100 truncate tracking-tight">
                          {chunk.maps.title}
                        </span>
                        <span className="text-[10px] text-blue-500 font-black uppercase tracking-widest">{lang === 'en' ? 'Get Directions' : 'Indicazioni'}</span>
                      </div>
                    </div>
                    <ExternalLink size={20} className="text-gray-300 group-hover:text-blue-500 transition-colors ml-4" />
                  </a>
                )
              ))}
            </div>
          )}
        </div>
      )}

      {loading && (
        <div className="flex flex-col items-center justify-center py-28 bg-white dark:bg-gray-900/50 rounded-[4rem] border-2 border-dashed border-gray-200 dark:border-gray-800">
          <div className="relative mb-10">
            <div className="absolute -inset-8 bg-blue-500/10 rounded-full blur-2xl animate-pulse"></div>
            <Loader2 className="animate-spin text-blue-600" size={96} strokeWidth={1} />
            <MapPin className="absolute inset-0 m-auto text-blue-300" size={36} />
          </div>
          <div className="text-center">
            <p className="text-base font-black animate-pulse uppercase tracking-[0.5em] text-gray-400 mb-2">{t.searching}</p>
            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">{lang === 'en' ? 'Finding premium courts nearby...' : 'Ricerca campi premium in corso...'}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Maps;
