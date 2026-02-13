
import React, { useState, useEffect, useRef } from 'react';
import { 
  Plus, MapPin, Clock, UserPlus, X, Filter, ChevronRight, ChevronLeft, 
  Dumbbell, Bike, Waves, Trophy, Flag, Grid, Circle, Target, Activity, 
  Dribbble, Medal, Navigation, Users as UsersIcon, LocateFixed, Loader2, Sparkles, Minus
} from 'lucide-react';
import { MatchAd, UserProfile, Language } from '../types';
import { translations } from '../i18n';
import { geminiService } from '../services/geminiService';

interface SocialProps {
  user: UserProfile;
  onPost: () => void;
  lang: Language;
}

const Social: React.FC<SocialProps> = ({ user, onPost, lang }) => {
  const t = translations[lang];
  const [ads, setAds] = useState<MatchAd[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [filter, setFilter] = useState('ALL');
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Modal Form state management
  const [formSport, setFormSport] = useState('');
  const [formLocation, setFormLocation] = useState('');
  const [formTime, setFormTime] = useState('18:00');
  const [formNeeded, setFormNeeded] = useState(2);
  const [isFetchingVenues, setIsFetchingVenues] = useState(false);
  const [venueSuggestions, setVenueSuggestions] = useState<string[]>([]);

  useEffect(() => {
    const savedAds = localStorage.getItem('sportbuddy_ads');
    if (savedAds) {
      setAds(JSON.parse(savedAds));
    } else {
      setAds([]);
    }
  }, []);

  // Initialize form sport based on user profile or default list
  useEffect(() => {
    if (showModal) {
      if (user.selectedSports.length > 0) {
        setFormSport(user.selectedSports[0].sport);
      } else {
        setFormSport(Object.values(t.sports)[0]);
      }
    }
  }, [showModal, user.selectedSports, t.sports]);

  const handleAddAd = (e: React.FormEvent) => {
    e.preventDefault();
    const newAd: MatchAd = {
      id: Date.now().toString(),
      creator: user.name,
      sport: formSport,
      location: formLocation,
      time: formTime,
      needed: formNeeded,
    };
    const updated = [newAd, ...ads];
    setAds(updated);
    localStorage.setItem('sportbuddy_ads', JSON.stringify(updated));
    setShowModal(false);
    resetForm();
    onPost();
  };

  const resetForm = () => {
    setFormLocation('');
    setFormTime('18:00');
    setFormNeeded(2);
    setVenueSuggestions([]);
  };

  const fetchNearbyVenues = async () => {
    setIsFetchingVenues(true);
    try {
      if (!navigator.geolocation) {
        setIsFetchingVenues(false);
        return;
      }
      
      navigator.geolocation.getCurrentPosition(async (pos) => {
        const coords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        const res = await geminiService.getSmartVenues(undefined, coords, lang);
        
        // Parse venue names from the markdown response
        const names = res.text
          .split(/##\s+/)
          .filter(s => s.trim())
          .map(s => s.split('\n')[0].replace(/\[COORDINATES.*?\]/, '').trim());
          
        setVenueSuggestions(names.slice(0, 10)); // Increased limit but made list scrollable
        setIsFetchingVenues(false);
      }, () => {
        setIsFetchingVenues(false);
      });
    } catch (err) {
      setIsFetchingVenues(false);
    }
  };

  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = 200;
      scrollContainerRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  const filteredAds = filter === 'ALL' ? ads : ads.filter(ad => ad.sport === filter);
  const sportLabels = Object.values(t.sports) as string[];

  const getSportVisual = (sportName: string) => {
    const name = sportName.toLowerCase();
    if (name.includes('basket')) return { icon: Dribbble, color: 'text-orange-500', bg: 'bg-orange-50 dark:bg-orange-900/20' };
    if (name.includes('calcio') || name.includes('football')) return { icon: Medal, color: 'text-green-500', bg: 'bg-green-50 dark:bg-green-900/20' };
    if (name.includes('tennis')) return { icon: Circle, color: 'text-lime-500', bg: 'bg-lime-50 dark:bg-lime-900/20' };
    if (name.includes('padel')) return { icon: Grid, color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-900/20' };
    if (name.includes('pallavolo') || name.includes('volleyball')) return { icon: Circle, color: 'text-yellow-500', bg: 'bg-yellow-50 dark:bg-yellow-900/20' };
    if (name.includes('golf')) return { icon: Flag, color: 'text-emerald-600', bg: 'bg-emerald-50 dark:bg-emerald-900/20' };
    if (name.includes('bowling')) return { icon: Target, color: 'text-red-500', bg: 'bg-red-50 dark:bg-red-900/20' };
    if (name.includes('nuoto') || name.includes('swimming')) return { icon: Waves, color: 'text-sky-500', bg: 'bg-sky-50 dark:bg-sky-900/20' };
    if (name.includes('palestra') || name.includes('gym')) return { icon: Dumbbell, color: 'text-gray-600', bg: 'bg-gray-50 dark:bg-gray-800' };
    if (name.includes('ciclismo') || name.includes('cycling')) return { icon: Bike, color: 'text-purple-500', bg: 'bg-purple-50 dark:bg-purple-900/20' };
    return { icon: Activity, color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-900/20' };
  };

  return (
    <div className="space-y-8 max-w-2xl mx-auto pb-10">
      <div className="flex justify-between items-center px-2">
        <div>
          <h2 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight leading-none uppercase">Match Ads</h2>
          <p className="text-[11px] text-gray-500 font-bold uppercase tracking-widest mt-2">{t.match_making_desc}</p>
        </div>
        <button 
          onClick={() => setShowModal(true)}
          className="flex items-center justify-center gap-2 bg-blue-600 text-white px-6 py-4 rounded-2xl shadow-xl shadow-blue-500/20 hover:bg-blue-700 hover:-translate-y-0.5 active:scale-95 transition-all group shrink-0 border-b-4 border-blue-800"
        >
          <Plus size={20} className="group-hover:rotate-90 transition-transform" />
          <span className="font-black text-[11px] uppercase tracking-widest">{lang === 'en' ? 'Create Ad' : 'Crea Annuncio'}</span>
        </button>
      </div>

      <div className="px-2">
        <div className="flex items-center bg-white dark:bg-gray-900 rounded-[1.75rem] border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden p-1 relative">
          <button 
            onClick={() => scroll('left')}
            className="p-3 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-full transition-colors text-gray-400 z-10 hidden sm:flex"
          >
            <ChevronLeft size={20} />
          </button>

          <div 
            ref={scrollContainerRef}
            className="flex-1 flex gap-2 overflow-x-auto no-scrollbar py-1 scroll-smooth px-2"
          >
            <button 
              onClick={() => setFilter('ALL')}
              className={`whitespace-nowrap px-6 py-2.5 rounded-xl text-[10px] font-black tracking-widest transition-all uppercase ${filter === 'ALL' ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30' : 'text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800'}`}
            >
              {lang === 'en' ? 'All' : 'Tutti'}
            </button>
            {sportLabels.map((s) => (
              <button 
                key={s} 
                onClick={() => setFilter(s)}
                className={`whitespace-nowrap px-6 py-2.5 rounded-xl text-[10px] font-black tracking-widest transition-all uppercase ${filter === s ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30' : 'text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800'}`}
              >
                {s}
              </button>
            ))}
          </div>

          <button 
            onClick={() => scroll('right')}
            className="p-3 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-full transition-colors text-gray-400 z-10 hidden sm:flex"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      </div>

      <div className="space-y-4 px-2">
        {filteredAds.length === 0 ? (
          <div className="text-center py-24 bg-white/50 dark:bg-gray-900/30 rounded-[3.5rem] border-2 border-dashed border-gray-200 dark:border-gray-800 flex flex-col items-center">
            <div className="w-24 h-24 bg-gray-50 dark:bg-gray-800 rounded-full flex items-center justify-center text-gray-300 dark:text-gray-700 mb-8 shadow-inner">
              <UsersIcon size={48} />
            </div>
            <h3 className="text-xl font-black text-gray-900 dark:text-gray-100 uppercase tracking-tight">{lang === 'en' ? 'No matches found' : 'Nessuna partita trovata'}</h3>
            <p className="text-gray-400 text-[11px] max-w-[280px] mt-2 mb-10 font-bold uppercase tracking-widest leading-relaxed text-center px-4">{t.no_matches}</p>
            <button 
              onClick={() => setShowModal(true)}
              className="bg-blue-600 text-white px-10 py-5 rounded-[1.75rem] font-black text-xs uppercase tracking-[0.2em] hover:bg-blue-700 transition-all shadow-xl shadow-blue-600/20 active:scale-95 border-b-4 border-blue-800"
            >
              {lang === 'en' ? 'Start one now' : 'Iniziane una ora'}
            </button>
          </div>
        ) : (
          filteredAds.map((ad) => {
            const visual = getSportVisual(ad.sport);
            const SportIcon = visual.icon;
            
            return (
              <div key={ad.id} className="bg-white dark:bg-gray-900 p-8 rounded-[3rem] shadow-sm border border-gray-100 dark:border-gray-800 hover:border-blue-400 dark:hover:border-blue-500 transition-all group animate-in slide-in-from-bottom duration-500 hover:shadow-2xl">
                <div className="flex justify-between items-start mb-6">
                  <div className="flex gap-5 items-center">
                    <div className={`w-16 h-16 ${visual.bg} rounded-[1.5rem] flex items-center justify-center ${visual.color} font-bold group-hover:scale-110 group-hover:rotate-6 transition-transform shadow-sm`}>
                      <SportIcon size={32} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`text-[10px] font-black ${visual.color} uppercase tracking-widest`}>{ad.sport}</span>
                        <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">• {ad.creator}</span>
                      </div>
                      <h4 className="font-black text-gray-900 dark:text-white text-2xl tracking-tight leading-none">
                        {lang === 'en' ? 'Need' : 'Servono'} {ad.needed} {lang === 'en' ? 'players' : 'giocatori'}
                      </h4>
                    </div>
                  </div>
                  <div className="bg-blue-50 dark:bg-blue-900/20 px-3 py-1.5 rounded-full">
                    <span className="text-[9px] font-black text-blue-500 uppercase tracking-widest">Active</span>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
                  <div className="flex items-center gap-4 text-gray-600 dark:text-gray-400 text-sm bg-gray-50/50 dark:bg-gray-800/50 p-5 rounded-2xl border border-gray-100 dark:border-gray-800">
                    <MapPin size={20} className="text-blue-500" />
                    <span className="font-bold truncate text-xs uppercase tracking-tight">{ad.location}</span>
                  </div>
                  <div className="flex items-center gap-4 text-gray-600 dark:text-gray-400 text-sm bg-gray-50/50 dark:bg-gray-800/50 p-5 rounded-2xl border border-gray-100 dark:border-gray-800">
                    <Clock size={20} className="text-indigo-500" />
                    <span className="font-bold truncate text-xs uppercase tracking-tight">{ad.time}</span>
                  </div>
                </div>

                <button className="w-full py-5 bg-blue-600 text-white rounded-[1.75rem] font-black text-xs uppercase tracking-[0.2em] hover:bg-blue-700 shadow-xl shadow-blue-600/10 active:scale-95 transition-all border-b-4 border-blue-800">
                  {t.join_match}
                </button>
              </div>
            );
          })
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-xl z-[100] flex items-center justify-center p-4">
          <div className="bg-gray-900 dark:bg-gray-900 rounded-[3rem] p-10 w-full max-w-sm shadow-[0_0_80px_-10px_rgba(37,99,235,0.3)] animate-in zoom-in-95 duration-500 border border-white/10 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/10 rounded-full blur-[60px] -mr-10 -mt-10"></div>
            
            <div className="flex justify-between items-center mb-10 relative">
              <div>
                <h3 className="text-2xl font-black text-white tracking-tight uppercase leading-none">{t.create_match}</h3>
                <p className="text-[10px] text-blue-500 font-bold uppercase tracking-[0.2em] mt-2">New Announcement</p>
              </div>
              <button onClick={() => { setShowModal(false); resetForm(); }} className="text-gray-400 hover:text-white p-3 bg-white/5 rounded-2xl transition-all hover:bg-white/10 active:scale-90">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleAddAd} className="space-y-8 relative">
              <div>
                <label className="block text-[10px] font-black uppercase text-gray-500 tracking-[0.25em] mb-3 px-1">{t.sport}</label>
                <div className="relative group">
                  <select 
                    value={formSport}
                    onChange={(e) => setFormSport(e.target.value)}
                    className="w-full bg-white/5 text-white border border-white/10 rounded-2xl px-6 py-5 outline-none focus:ring-2 focus:ring-blue-500 shadow-inner appearance-none font-bold text-sm tracking-tight transition-all cursor-pointer hover:bg-white/10"
                  >
                    {(user.selectedSports.length > 0 ? user.selectedSports.map(s => s.sport) : sportLabels).map((s) => (
                      <option key={s} value={s} className="bg-gray-900 text-white">{s}</option>
                    ))}
                  </select>
                  <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500 group-hover:text-white transition-colors">
                    <ChevronRight size={18} className="rotate-90" />
                  </div>
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-3 px-1">
                  <label className="block text-[10px] font-black uppercase text-gray-500 tracking-[0.25em]">{t.location}</label>
                  <button 
                    type="button" 
                    onClick={fetchNearbyVenues}
                    className="text-[9px] font-black uppercase text-blue-500 tracking-widest hover:text-blue-400 flex items-center gap-1 group transition-all"
                  >
                    <LocateFixed size={12} className="group-hover:rotate-12 transition-transform" />
                    {lang === 'en' ? 'Suggest Nearby' : 'Suggerisci Vicini'}
                  </button>
                </div>
                <div className="relative group">
                  <MapPin className="absolute left-6 top-1/2 -translate-y-1/2 text-blue-500 group-focus-within:scale-110 transition-transform" size={18} />
                  <input 
                    value={formLocation}
                    onChange={(e) => setFormLocation(e.target.value)}
                    required 
                    className="w-full bg-white/5 text-white border border-white/10 rounded-2xl pl-14 pr-6 py-5 outline-none focus:ring-2 focus:ring-blue-500 shadow-inner font-bold text-sm tracking-tight placeholder-gray-600 transition-all hover:bg-white/10" 
                    placeholder="e.g. Central Park Court" 
                  />
                </div>
                
                {/* Real venue suggestions dropdown with scrollable height */}
                {isFetchingVenues ? (
                  <div className="mt-3 flex items-center justify-center py-4 bg-white/5 rounded-2xl border border-white/5">
                    <Loader2 size={16} className="animate-spin text-blue-500 mr-2" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-gray-500 animate-pulse">Scanning area...</span>
                  </div>
                ) : venueSuggestions.length > 0 && (
                  <div className="mt-3 grid grid-cols-1 gap-2 max-h-[160px] overflow-y-auto no-scrollbar pr-1 animate-in fade-in slide-in-from-top-2">
                    <div className="flex items-center gap-2 mb-1 px-1 sticky top-0 bg-gray-900 py-1 z-10">
                      <Sparkles size={12} className="text-blue-500" />
                      <span className="text-[8px] font-black uppercase tracking-[0.2em] text-gray-600">Verified Nearby Places</span>
                    </div>
                    {venueSuggestions.map((venue, idx) => (
                      <button 
                        key={idx}
                        type="button"
                        onClick={() => setFormLocation(venue)}
                        className="text-left px-5 py-3.5 bg-white/5 hover:bg-blue-600/20 text-blue-400 border border-white/5 rounded-xl transition-all flex items-center gap-3 active:scale-95 group shrink-0"
                      >
                        <div className="w-6 h-6 rounded-lg bg-blue-500/10 flex items-center justify-center group-hover:bg-blue-500/30 transition-all">
                          <Navigation size={12} />
                        </div>
                        <span className="text-[11px] font-black uppercase tracking-tighter truncate">{venue}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-[10px] font-black uppercase text-gray-500 tracking-[0.25em] mb-3 px-1">{t.time}</label>
                  <div className="relative group">
                    <Clock className="absolute left-5 top-1/2 -translate-y-1/2 text-indigo-500 pointer-events-none group-focus-within:scale-110 transition-transform" size={18} />
                    <input 
                      type="time" 
                      value={formTime}
                      onChange={(e) => setFormTime(e.target.value)}
                      required 
                      className="w-full bg-white/5 text-white border border-white/10 rounded-2xl pl-12 pr-4 py-5 outline-none focus:ring-2 focus:ring-blue-500 shadow-inner font-bold text-sm tracking-tighter appearance-none hover:bg-white/10 transition-all cursor-pointer" 
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] font-black uppercase text-gray-500 tracking-[0.25em] mb-3 px-1">{lang === 'en' ? 'Needed' : 'Necessari'}</label>
                  <div className="flex items-center bg-white/5 border border-white/10 rounded-2xl overflow-hidden shadow-inner h-full group hover:bg-white/10 transition-all">
                    <button 
                      type="button" 
                      onClick={() => setFormNeeded(prev => Math.max(1, prev - 1))}
                      className="flex-1 flex items-center justify-center py-5 text-gray-500 hover:text-white transition-colors"
                    >
                      <Minus size={16} />
                    </button>
                    <span className="w-12 text-center text-white font-black text-base">{formNeeded}</span>
                    <button 
                      type="button" 
                      onClick={() => setFormNeeded(prev => prev + 1)}
                      className="flex-1 flex items-center justify-center py-5 text-gray-500 hover:text-white transition-colors"
                    >
                      <Plus size={16} />
                    </button>
                  </div>
                </div>
              </div>

              <div className="pt-6">
                <button 
                  type="submit" 
                  disabled={!formLocation.trim() || !formSport}
                  className="w-full relative group/publish overflow-hidden rounded-[2rem] active:scale-95 transition-all shadow-2xl shadow-blue-500/30 disabled:opacity-50"
                >
                  <div className="absolute inset-0 bg-gradient-to-tr from-blue-700 via-blue-600 to-indigo-500 group-hover/publish:scale-110 transition-transform duration-700"></div>
                  <div className="relative py-6 flex items-center justify-center gap-3">
                    <span className="text-[13px] font-black uppercase tracking-[0.35em] text-white drop-shadow-lg">{t.publish}</span>
                    <Sparkles size={18} className="text-white/80 group-hover/publish:rotate-12 transition-transform" />
                  </div>
                  <div className="absolute bottom-0 left-0 w-full h-1 bg-blue-400/30"></div>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Social;