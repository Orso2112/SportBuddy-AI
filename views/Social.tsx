
import React, { useState, useEffect, useRef } from 'react';
import { 
  Plus, MapPin, Clock, UserPlus, X, Filter, ChevronRight, ChevronLeft, 
  Dumbbell, Bike, Waves, Trophy, Flag, Grid, Circle, Target, Activity, 
  Dribbble, Medal
} from 'lucide-react';
import { MatchAd, UserProfile, Language } from '../types';
import { translations } from '../i18n';

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

  useEffect(() => {
    const savedAds = localStorage.getItem('sportbuddy_ads');
    if (savedAds) {
      setAds(JSON.parse(savedAds));
    } else {
      setAds([]);
    }
  }, []);

  const handleAddAd = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const newAd: MatchAd = {
      id: Date.now().toString(),
      creator: user.name,
      sport: formData.get('sport') as string,
      location: formData.get('location') as string,
      time: formData.get('time') as string,
      needed: parseInt(formData.get('needed') as string),
    };
    const updated = [newAd, ...ads];
    setAds(updated);
    localStorage.setItem('sportbuddy_ads', JSON.stringify(updated));
    setShowModal(false);
    onPost();
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
          <h2 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">{t.match_making}</h2>
          <p className="text-sm text-gray-500 font-medium mt-1">{t.match_making_desc}</p>
        </div>
        <button 
          onClick={() => setShowModal(true)}
          className="flex items-center justify-center gap-2 bg-blue-600 text-white px-6 py-3.5 rounded-2xl shadow-xl shadow-blue-500/20 hover:bg-blue-700 hover:-translate-y-0.5 active:scale-95 transition-all group shrink-0"
        >
          <Plus size={20} className="group-hover:rotate-90 transition-transform" />
          <span className="font-bold text-sm">{lang === 'en' ? 'Create Match' : 'Crea Partita'}</span>
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
            <div className="w-24 h-24 bg-gray-50 dark:bg-gray-800 rounded-full flex items-center justify-center text-gray-300 dark:text-gray-700 mb-8">
              <UserPlus size={48} />
            </div>
            <h3 className="text-xl font-black text-gray-900 dark:text-gray-100 uppercase tracking-tight">{lang === 'en' ? 'No matches found' : 'Nessuna partita trovata'}</h3>
            <p className="text-gray-400 text-sm max-w-[280px] mt-2 mb-10 font-medium">{t.no_matches}</p>
            <button 
              onClick={() => setShowModal(true)}
              className="bg-blue-600 text-white px-10 py-4 rounded-[1.5rem] font-black text-xs uppercase tracking-[0.2em] hover:bg-blue-700 transition-all shadow-xl shadow-blue-600/20"
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
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
                  <div className="flex items-center gap-4 text-gray-600 dark:text-gray-400 text-sm bg-gray-50/50 dark:bg-gray-800/50 p-4 rounded-2xl border border-gray-100 dark:border-gray-800">
                    <MapPin size={18} className="text-blue-500" />
                    <span className="font-bold truncate">{ad.location}</span>
                  </div>
                  <div className="flex items-center gap-4 text-gray-600 dark:text-gray-400 text-sm bg-gray-50/50 dark:bg-gray-800/50 p-4 rounded-2xl border border-gray-100 dark:border-gray-800">
                    <Clock size={18} className="text-indigo-500" />
                    <span className="font-bold truncate">{ad.time}</span>
                  </div>
                </div>

                <button className="w-full py-5 bg-blue-600 text-white rounded-[1.5rem] font-black text-xs uppercase tracking-widest hover:bg-blue-700 shadow-xl shadow-blue-600/10 active:scale-95 transition-all">
                  {t.join_match}
                </button>
              </div>
            );
          })
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-[60] flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-900 rounded-[2.5rem] p-10 w-full max-w-sm shadow-2xl animate-in zoom-in-95 duration-300 border border-white/10">
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight uppercase">{t.create_match}</h3>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-white p-2.5 bg-gray-50 dark:bg-gray-800 rounded-2xl transition-colors">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleAddAd} className="space-y-6">
              <div>
                <label className="block text-[10px] font-black uppercase text-gray-400 tracking-widest mb-2 px-1">{t.sport}</label>
                <select name="sport" className="w-full bg-gray-50 dark:bg-gray-800 dark:text-white border border-gray-100 dark:border-gray-700 rounded-2xl px-5 py-4 outline-none focus:ring-2 focus:ring-blue-500 shadow-sm appearance-none font-bold">
                  {(user.selectedSports.length > 0 ? user.selectedSports.map(s => s.sport) : sportLabels).map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-black uppercase text-gray-400 tracking-widest mb-2 px-1">{t.location}</label>
                <input name="location" required className="w-full bg-gray-50 dark:bg-gray-800 dark:text-white border border-gray-100 dark:border-gray-700 rounded-2xl px-5 py-4 outline-none focus:ring-2 focus:ring-blue-500 shadow-sm font-medium" placeholder="e.g. Central Park Court" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-black uppercase text-gray-400 tracking-widest mb-2 px-1">{t.time}</label>
                  <input name="time" required className="w-full bg-gray-50 dark:bg-gray-800 dark:text-white border border-gray-100 dark:border-gray-700 rounded-2xl px-5 py-4 outline-none focus:ring-2 focus:ring-blue-500 shadow-sm font-medium" placeholder="18:00" />
                </div>
                <div>
                  <label className="block text-[10px] font-black uppercase text-gray-400 tracking-widest mb-2 px-1">{lang === 'en' ? 'Ppl' : 'Grs'}</label>
                  <input name="needed" type="number" min="1" required className="w-full bg-gray-50 dark:bg-gray-800 dark:text-white border border-gray-100 dark:border-gray-700 rounded-2xl px-5 py-4 outline-none focus:ring-2 focus:ring-blue-500 shadow-sm font-medium" />
                </div>
              </div>
              <button type="submit" className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-5 rounded-[1.75rem] font-black shadow-xl shadow-blue-500/20 hover:shadow-blue-500/40 hover:-translate-y-0.5 transition-all active:scale-95 mt-4 uppercase tracking-[0.2em] text-xs">
                {t.publish}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Social;
