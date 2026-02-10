
import React, { useMemo } from 'react';
import { Tab, UserProfile, Language, WorkoutLog } from '../types';
import { Activity, Map as MapIcon, Users, Trophy, MessageSquare, Flame, Calendar, ChevronRight, Zap, Target, Star, TrendingUp, Award } from 'lucide-react';
import { translations } from '../i18n';

interface DashboardProps {
  onNavigate: (tab: Tab, subView?: 'main' | 'history') => void;
  user: UserProfile;
  lang: Language;
}

const Dashboard: React.FC<DashboardProps> = ({ onNavigate, user, lang }) => {
  const t = translations[lang];
  
  const workouts: WorkoutLog[] = useMemo(() => {
    const saved = localStorage.getItem('sportbuddy_workouts');
    return saved ? JSON.parse(saved) : [];
  }, []);

  const streak = useMemo(() => {
    if (workouts.length === 0) return 0;
    
    const dates = workouts.map(w => new Date(w.timestamp).toDateString());
    const uniqueDates = Array.from(new Set(dates)).map(d => new Date(d));
    uniqueDates.sort((a, b) => b.getTime() - a.getTime());
    
    const today = new Date().toDateString();
    const yesterday = new Date(Date.now() - 86400000).toDateString();
    
    if (new Date(uniqueDates[0]).toDateString() !== today && 
        new Date(uniqueDates[0]).toDateString() !== yesterday) {
      return 0;
    }
    
    let currentStreak = 1;
    for (let i = 0; i < uniqueDates.length - 1; i++) {
      const diff = (uniqueDates[i].getTime() - uniqueDates[i+1].getTime()) / 86400000;
      if (Math.round(diff) === 1) {
        currentStreak++;
      } else {
        break;
      }
    }
    return currentStreak;
  }, [workouts]);

  const stats = [
    { label: t.workouts, value: user.stats.workouts.toString(), icon: Activity, color: 'text-green-500', bg: 'bg-green-500/10', border: 'border-green-500/20' },
    { label: t.matches, value: user.stats.matches.toString(), icon: Users, color: 'text-blue-500', bg: 'bg-blue-500/10', border: 'border-blue-500/20' },
    { label: t.chats, value: user.stats.chats.toString(), icon: MessageSquare, color: 'text-amber-500', bg: 'bg-amber-500/10', border: 'border-amber-500/20' },
  ];

  const features = [
    { id: Tab.COACH, title: t.ai_coach, desc: t.ai_coach_desc, icon: Activity, color: 'bg-blue-500' },
    { id: Tab.MAPS, title: t.smart_venues, desc: t.smart_venues_desc, icon: MapIcon, color: 'bg-emerald-500' },
    { id: Tab.SOCIAL, title: t.match_making, desc: t.match_making_desc, icon: Users, color: 'bg-indigo-500' },
    { id: Tab.SCOUT, title: t.auto_scout, desc: t.auto_scout_desc, icon: Trophy, color: 'bg-orange-500' },
  ];

  return (
    <div className="space-y-8 pb-10">
      {/* Super "Alive" Welcome Banner */}
      <section className="relative group overflow-visible">
        <div className="absolute -inset-2 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 rounded-[3rem] blur-xl opacity-20 group-hover:opacity-40 transition duration-1000 group-hover:duration-500"></div>
        <div className="relative bg-gradient-to-br from-blue-700 via-blue-800 to-indigo-950 rounded-[2.5rem] p-8 text-white shadow-2xl overflow-hidden min-h-[220px] flex items-center border border-white/10">
          
          <div className="absolute -top-10 -right-10 w-64 h-64 bg-blue-500/30 rounded-full blur-[80px] animate-pulse"></div>
          <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-indigo-600/20 rounded-full blur-[100px]"></div>
          
          <div className="relative z-10 flex flex-col md:flex-row justify-between items-center w-full gap-8">
            <div className="space-y-6 text-center md:text-left flex-1">
              <div className="space-y-2">
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 mb-2">
                  {user.selectedSports.map((us, idx) => (
                    <div key={idx} className="flex items-center gap-1.5 px-2.5 py-1 bg-white/20 rounded-full backdrop-blur-md border border-white/10">
                      <span className="text-[8px] font-black uppercase tracking-widest text-blue-200">{us.level}</span>
                      <span className="text-[9px] font-black uppercase tracking-tight text-white">{us.sport}</span>
                    </div>
                  ))}
                </div>
                <h2 className="text-4xl font-black tracking-tight leading-none drop-shadow-lg">
                  {t.welcome}, <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-200 to-white">{user.name.split(' ')[0]}</span>!
                </h2>
                <p className="text-white/60 text-xs font-medium tracking-wide max-w-sm">
                  {lang === 'en' ? "Your AI-powered training journey continues today." : "Il tuo percorso di allenamento AI continua oggi."}
                </p>
              </div>

              <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
                <button 
                  onClick={() => onNavigate(Tab.COACH)}
                  className="bg-white text-blue-700 px-8 py-3.5 rounded-2xl font-black text-xs uppercase tracking-widest shadow-[0_10px_30px_rgba(255,255,255,0.2)] hover:scale-105 active:scale-95 transition-all flex items-center gap-2 group/btn border-b-4 border-gray-200"
                >
                  <Zap size={16} className="fill-blue-700 group-hover/btn:animate-bounce" />
                  {t.start_training}
                </button>
                {streak > 0 && (
                  <div className="flex items-center gap-2 bg-white/10 px-5 py-3 rounded-2xl backdrop-blur-xl border border-white/20 shadow-xl group/streak">
                    <Flame size={18} className="text-orange-400 animate-pulse fill-orange-400 group-hover/streak:scale-125 transition-transform" />
                    <div className="flex flex-col items-start leading-none">
                      <span className="text-[10px] font-black uppercase tracking-widest">{streak} {t.streak}</span>
                      <span className="text-[8px] text-white/50 font-bold uppercase tracking-tighter">{lang === 'en' ? 'KEEP IT UP!' : 'CONTINUA COSÌ!'}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="relative shrink-0 flex items-center justify-center group/avatar">
              <div className="absolute -inset-6 bg-gradient-to-tr from-blue-400 to-indigo-600 rounded-full blur-2xl opacity-20 group-hover/avatar:opacity-50 transition-all duration-700"></div>
              <div className="relative">
                <div className="absolute -top-2 -left-2 w-8 h-8 bg-green-500 rounded-full border-4 border-blue-900 z-20 flex items-center justify-center shadow-lg animate-bounce">
                  <TrendingUp size={12} className="text-white" />
                </div>
                <img 
                  src={user.avatar} 
                  className="w-32 h-32 rounded-[3rem] border-4 border-white/20 bg-white/10 shadow-2xl relative z-10 transition-all duration-500 group-hover/avatar:-rotate-3 group-hover/avatar:scale-105" 
                  alt="Avatar" 
                />
                <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-amber-400 rounded-2xl flex items-center justify-center text-blue-900 shadow-xl border-4 border-blue-800 z-20 hover:rotate-12 transition-transform">
                  <Award size={20} fill="currentColor" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Improved Alive Stats Cards */}
      <div className="grid grid-cols-3 gap-6 px-2">
        {stats.map((stat, i) => (
          <div 
            key={i} 
            className={`group relative bg-white dark:bg-gray-900 p-6 rounded-[3rem] shadow-sm border ${stat.border} flex flex-col items-center text-center transition-all hover:scale-105 hover:shadow-2xl hover:shadow-blue-500/10 cursor-pointer overflow-hidden`}
          >
            <div className={`absolute -inset-4 ${stat.bg} opacity-0 group-hover:opacity-100 transition-opacity blur-2xl`}></div>
            <div className={`relative w-14 h-14 ${stat.bg} ${stat.color} rounded-[1.5rem] flex items-center justify-center mb-4 transition-all group-hover:scale-110 group-hover:-rotate-12`}>
              <stat.icon size={28} />
            </div>
            <div className="relative">
              <span className="block text-3xl font-black dark:text-white tracking-tighter leading-none mb-1">{stat.value}</span>
              <span className="block text-[10px] text-gray-400 uppercase font-black tracking-[0.2em]">{stat.label}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10 px-2 pt-4">
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-600/10 text-blue-600 flex items-center justify-center border border-blue-500/10">
              <Target size={22} />
            </div>
            <h3 className="text-2xl font-black text-gray-900 dark:text-gray-100 uppercase tracking-tight">{t.explore}</h3>
          </div>
          <div className="grid grid-cols-1 gap-4">
            {features.map((feat) => (
              <button
                key={feat.id}
                onClick={() => onNavigate(feat.id)}
                className="flex items-center gap-5 p-6 bg-white dark:bg-gray-900 rounded-[2.5rem] shadow-sm border border-gray-100 dark:border-gray-800 text-left hover:border-blue-500 dark:hover:border-blue-500 transition-all group hover:shadow-2xl hover:-translate-y-1"
              >
                <div className={`w-16 h-16 rounded-[1.5rem] ${feat.color} flex items-center justify-center text-white group-hover:scale-110 group-hover:rotate-6 transition-transform shadow-xl shadow-blue-500/10`}>
                  <feat.icon size={30} />
                </div>
                <div className="flex-1">
                  <h4 className="font-black text-gray-900 dark:text-white uppercase tracking-tight text-lg leading-tight">{feat.title}</h4>
                  <p className="text-[11px] text-gray-500 dark:text-gray-400 font-medium tracking-tight mt-1">{feat.desc}</p>
                </div>
                <div className="p-2 bg-gray-50 dark:bg-gray-800 rounded-full opacity-0 group-hover:opacity-100 transition-opacity translate-x-4 group-hover:translate-x-0 transition-all">
                  <ChevronRight className="text-blue-500" size={18} />
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-600/10 text-emerald-600 flex items-center justify-center border border-emerald-500/10">
                <Calendar size={22} />
              </div>
              <h3 className="text-2xl font-black text-gray-900 dark:text-gray-100 uppercase tracking-tight">{t.recent_activity}</h3>
            </div>
            {workouts.length > 0 && (
              <button onClick={() => onNavigate(Tab.COACH, 'history')} className="text-[11px] font-black uppercase text-blue-600 tracking-[0.2em] flex items-center gap-2 hover:gap-3 transition-all px-4 py-2 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
                {lang === 'en' ? 'History' : 'Cronologia'} <ChevronRight size={12} strokeWidth={3} />
              </button>
            )}
          </div>
          
          <div className="space-y-4">
            {workouts.length === 0 ? (
              <div className="bg-white/50 dark:bg-gray-900/30 border-2 border-dashed border-gray-200 dark:border-gray-800 rounded-[3rem] p-16 text-center flex flex-col items-center">
                <div className="w-20 h-20 bg-gray-50 dark:bg-gray-800 rounded-full flex items-center justify-center text-gray-300 mb-6">
                  <Activity size={40} />
                </div>
                <p className="text-sm text-gray-400 font-black uppercase tracking-widest">{t.no_activity}</p>
              </div>
            ) : (
              workouts.slice(0, 4).map((log) => (
                <div key={log.id} className="bg-white dark:bg-gray-900 p-6 rounded-[2.5rem] shadow-sm border border-gray-100 dark:border-gray-800 flex items-center justify-between group hover:border-blue-400 dark:hover:border-blue-600 transition-all cursor-pointer hover:shadow-xl">
                  <div className="flex items-center gap-5">
                    <div className="w-14 h-14 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-500 rounded-2xl flex items-center justify-center group-hover:scale-110 group-hover:rotate-12 transition-transform shadow-sm">
                      <Calendar size={24} />
                    </div>
                    <div>
                      <h4 className="text-base font-black text-gray-900 dark:text-gray-100 uppercase tracking-tight leading-tight">{log.exercise}</h4>
                      <div className="flex items-center gap-2 mt-1.5">
                        <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                          {new Date(log.timestamp).toLocaleDateString(lang === 'it' ? 'it-IT' : 'en-US', { day: 'numeric', month: 'short' })}
                        </span>
                        <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                        <span className="text-[10px] font-black uppercase tracking-widest text-emerald-500">
                          {new Date(log.timestamp).toLocaleTimeString(lang === 'it' ? 'it-IT' : 'en-US', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="w-10 h-10 bg-gray-50 dark:bg-gray-800 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all">
                    <ChevronRight size={18} className="text-gray-400 group-hover:text-blue-500" />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
