
import React, { useState, useRef, useMemo } from 'react';
import { Camera, RefreshCcw, Loader2, Info, Play, ChevronRight, Search, X, Dumbbell, Home, Zap, Heart, CheckCircle, Calendar, Trash2, ArrowLeft } from 'lucide-react';
import { geminiService } from '../services/geminiService';
import { Language, Exercise, WorkoutLog } from '../types';
import { translations } from '../i18n';
import FormattedText from '../components/FormattedText';

interface CoachProps {
  onAnalyze: () => void;
  lang: Language;
  currentView: 'main' | 'history';
  setView: (v: 'main' | 'history') => void;
}

const Coach: React.FC<CoachProps> = ({ onAnalyze, lang, currentView, setView }) => {
  const t = translations[lang];
  const [analyzing, setAnalyzing] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [identifiedExercise, setIdentifiedExercise] = useState<string | null>(null);
  const [mediaUrl, setMediaUrl] = useState<string | null>(null);
  const [mimeType, setMimeType] = useState<string>('');
  const [selectedExercise, setSelectedExercise] = useState('Squat');
  const [showPicker, setShowPicker] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLogged, setIsLogged] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const workoutHistory: WorkoutLog[] = useMemo(() => {
    const saved = localStorage.getItem('sportbuddy_workouts');
    return saved ? JSON.parse(saved) : [];
  }, [isLogged, currentView]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const type = file.type;
    setMimeType(type);
    setIsLogged(false);
    setIdentifiedExercise(null);

    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64 = reader.result as string;
      const base64Data = base64.split(',')[1];
      setMediaUrl(base64);
      setAnalyzing(true);
      try {
        const result = await geminiService.analyzePosture(base64Data, selectedExercise, lang, type);
        
        // Parsing identified exercise
        const lines = result.split('\n');
        const firstLine = lines[0];
        if (firstLine.startsWith('IDENTIFIED_EXERCISE:')) {
          const name = firstLine.replace('IDENTIFIED_EXERCISE:', '').trim();
          setIdentifiedExercise(name);
          setFeedback(lines.slice(1).join('\n'));
        } else {
          setFeedback(result);
          setIdentifiedExercise(selectedExercise);
        }
        
      } catch (err) {
        setFeedback(lang === 'it' ? 'Errore nell\'analisi.' : 'Error analyzing.');
      } finally {
        setAnalyzing(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const logWorkout = () => {
    if (isLogged) return;
    
    const logsJson = localStorage.getItem('sportbuddy_workouts');
    const logs: WorkoutLog[] = logsJson ? JSON.parse(logsJson) : [];
    
    const newLog: WorkoutLog = {
      id: Date.now().toString(),
      exercise: identifiedExercise || selectedExercise,
      timestamp: Date.now()
    };
    
    const updatedLogs = [newLog, ...logs];
    localStorage.setItem('sportbuddy_workouts', JSON.stringify(updatedLogs));
    
    setIsLogged(true);
    onAnalyze(); // Updates global stats
  };

  const deleteLog = (id: string) => {
    const logsJson = localStorage.getItem('sportbuddy_workouts');
    if (!logsJson) return;
    const logs: WorkoutLog[] = JSON.parse(logsJson);
    const updated = logs.filter(l => l.id !== id);
    localStorage.setItem('sportbuddy_workouts', JSON.stringify(updated));
    // Trigger re-render by local state if needed, but useMemo depends on isLogged/currentView
    setIsLogged(prev => !prev); 
    setIsLogged(prev => !prev);
  };

  const exerciseEntries = Object.entries(t.exercises) as [string, Exercise][];
  const categories = Object.keys(t.categories);

  const filteredExercises = exerciseEntries.filter(([_, ex]) => 
    ex.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const categoryIcons: Record<string, any> = {
    bodyweight: Home,
    strength: Dumbbell,
    cardio: Zap,
    mobility: Heart
  };

  if (currentView === 'history') {
    return (
      <div className="space-y-6 animate-in fade-in slide-in-from-right duration-300">
        <div className="flex items-center gap-4 px-2">
          <button 
            onClick={() => setView('main')}
            className="p-3 bg-white dark:bg-gray-800 rounded-2xl shadow-sm text-gray-500 hover:text-blue-500 transition-colors"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h2 className="text-2xl font-black text-gray-800 dark:text-white uppercase tracking-tight">{lang === 'en' ? 'History' : 'Cronologia'}</h2>
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{workoutHistory.length} {lang === 'en' ? 'Log Entries' : 'Registrazioni'}</p>
          </div>
        </div>

        <div className="space-y-4 px-2">
          {workoutHistory.length === 0 ? (
            <div className="bg-white/50 dark:bg-gray-800/30 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-[2.5rem] p-12 text-center flex flex-col items-center">
              <div className="w-20 h-20 bg-gray-50 dark:bg-gray-900 rounded-full flex items-center justify-center text-gray-300 mb-6">
                <Calendar size={40} />
              </div>
              <p className="text-sm text-gray-400 font-bold uppercase tracking-widest">{t.no_activity}</p>
            </div>
          ) : (
            workoutHistory.map((log) => (
              <div key={log.id} className="bg-white dark:bg-gray-900 p-5 rounded-[2rem] shadow-sm border border-gray-100 dark:border-gray-800 flex items-center justify-between group animate-in slide-in-from-bottom duration-500">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-green-50 dark:bg-green-900/20 text-green-500 rounded-2xl flex items-center justify-center">
                    <Calendar size={20} />
                  </div>
                  <div>
                    <h4 className="text-base font-black text-gray-800 dark:text-gray-100 uppercase tracking-tight">{log.exercise}</h4>
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-[0.2em] mt-1">
                      {new Date(log.timestamp).toLocaleDateString(lang === 'it' ? 'it-IT' : 'en-US', { day: 'numeric', month: 'long', year: 'numeric' })}
                      <span className="mx-2">•</span>
                      {new Date(log.timestamp).toLocaleTimeString(lang === 'it' ? 'it-IT' : 'en-US', { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
                <button 
                  onClick={() => deleteLog(log.id)}
                  className="p-3 text-gray-300 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-all opacity-0 group-hover:opacity-100"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex justify-between items-center px-2">
        <h2 className="text-2xl font-black text-gray-800 dark:text-white uppercase tracking-tight">{t.ai_coach}</h2>
        <div className="flex gap-2">
           <button 
             onClick={() => setView('history')}
             className="p-2.5 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-400 hover:text-blue-500"
           >
             <Calendar size={20} />
           </button>
           <button 
            onClick={() => setShowPicker(true)}
            className="flex items-center gap-2 bg-white dark:bg-gray-800 dark:text-white border border-gray-200 dark:border-gray-700 px-4 py-2.5 rounded-2xl text-sm font-bold shadow-sm hover:border-blue-400 transition-all active:scale-95"
          >
            <span className="text-blue-600 font-black uppercase tracking-tighter">{selectedExercise}</span>
            <ChevronRight size={16} className="text-gray-400" />
          </button>
        </div>
      </div>

      <div className="bg-blue-50 dark:bg-blue-900/20 p-5 rounded-[2.5rem] flex gap-4 items-center border border-blue-100 dark:border-blue-800/50">
        <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/40 text-blue-500 rounded-xl flex items-center justify-center shrink-0">
          <Info size={20} />
        </div>
        <p className="text-[11px] text-blue-800 dark:text-blue-300 font-bold uppercase tracking-widest leading-relaxed">
          {lang === 'en' 
            ? "Upload your form. AI recognizes your exercise automatically."
            : "Carica il tuo video. L'AI riconosce l'esercizio automaticamente."}
        </p>
      </div>

      <div 
        onClick={() => !analyzing && fileInputRef.current?.click()}
        className={`relative aspect-video bg-gray-100 dark:bg-gray-900 rounded-[3rem] flex flex-col items-center justify-center cursor-pointer overflow-hidden border-2 border-dashed border-gray-300 dark:border-gray-700 hover:border-blue-400 dark:hover:border-blue-500 transition-all shadow-inner ${analyzing ? 'cursor-wait' : ''}`}
      >
        {mediaUrl ? (
          mimeType.startsWith('video') ? (
            <video src={mediaUrl} className="w-full h-full object-cover" controls playsInline />
          ) : (
            <img src={mediaUrl} className="w-full h-full object-cover" alt="Workout" />
          )
        ) : (
          <>
            <div className="w-20 h-20 bg-white dark:bg-gray-800 rounded-3xl flex items-center justify-center shadow-lg mb-4">
              <Camera className="text-gray-300" size={40} />
            </div>
            <p className="text-sm font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest">{t.tap_upload}</p>
          </>
        )}
        
        {analyzing && (
          <div className="absolute inset-0 bg-gray-950/80 backdrop-blur-xl flex flex-col items-center justify-center text-white z-20">
            <Loader2 className="animate-spin mb-4 text-blue-400" size={64} strokeWidth={1.5} />
            <span className="text-xs font-black tracking-[0.3em] uppercase animate-pulse">{t.analyze_form}</span>
          </div>
        )}
      </div>

      <input 
        type="file" 
        accept="image/*,video/*" 
        ref={fileInputRef} 
        onChange={handleFileUpload} 
        className="hidden" 
      />

      {feedback && (
        <div className="bg-white dark:bg-gray-900 p-8 rounded-[3rem] shadow-xl border border-gray-100 dark:border-gray-800 space-y-6 animate-in slide-in-from-bottom duration-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 rounded-xl flex items-center justify-center">
                <Dumbbell size={20} />
              </div>
              <div>
                <h3 className="font-black text-gray-900 dark:text-white uppercase tracking-tight">{t.feedback}</h3>
                <p className="text-[10px] text-blue-500 font-bold uppercase tracking-widest mt-1">
                  {lang === 'en' ? 'Recognized as:' : 'Riconosciuto come:'} {identifiedExercise}
                </p>
              </div>
            </div>
            {isLogged && <CheckCircle className="text-green-500" size={24} />}
          </div>
          
          <div className="bg-gray-50 dark:bg-gray-800/50 p-6 rounded-[2rem] border border-gray-100 dark:border-gray-800 shadow-inner">
            <FormattedText text={feedback} />
          </div>
          
          <div className="flex gap-4">
            <button 
              onClick={logWorkout}
              disabled={isLogged}
              className={`flex-1 py-5 rounded-[1.5rem] text-xs font-black uppercase tracking-widest transition-all flex items-center justify-center gap-3 shadow-xl ${isLogged ? 'bg-green-50 text-green-600 border border-green-100' : 'bg-blue-600 text-white hover:bg-blue-700 shadow-blue-500/20'}`}
            >
              {isLogged ? <CheckCircle size={18} /> : <Dumbbell size={18} />}
              {isLogged ? t.workout_logged : t.log_workout}
            </button>
            <button 
              onClick={() => { setMediaUrl(null); setFeedback(null); setMimeType(''); setIsLogged(false); setIdentifiedExercise(null); }}
              className="p-5 bg-gray-50 dark:bg-gray-800 text-gray-400 dark:text-gray-300 rounded-[1.5rem] hover:bg-gray-100 transition-all active:scale-95"
            >
              <RefreshCcw size={20} />
            </button>
          </div>
        </div>
      )}

      {/* Exercise Picker Modal */}
      {showPicker && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xl z-[100] flex items-end md:items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-900 w-full max-w-2xl h-[85vh] md:h-auto md:max-h-[80vh] rounded-[3rem] flex flex-col overflow-hidden animate-in zoom-in-95 duration-300 border border-white/10 shadow-2xl">
            <div className="p-8 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center bg-gray-50/50 dark:bg-gray-800/30">
              <div>
                <h3 className="text-2xl font-black dark:text-white uppercase tracking-tight">{t.select_exercise}</h3>
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">
                  Manual selection helper
                </p>
              </div>
              <button onClick={() => setShowPicker(false)} className="p-3 bg-white dark:bg-gray-700 rounded-2xl text-gray-500 shadow-sm">
                <X size={20} />
              </button>
            </div>

            <div className="p-6 bg-gray-50/30 dark:bg-gray-950">
              <div className="relative">
                <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input 
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={lang === 'en' ? "Search exercises..." : "Cerca esercizi..."}
                  className="w-full bg-white dark:bg-gray-800 dark:text-white border border-gray-100 dark:border-gray-700 rounded-3xl pl-14 pr-6 py-5 outline-none focus:ring-2 focus:ring-blue-500 transition-all shadow-sm font-medium"
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-10 no-scrollbar">
              {categories.map((catKey) => {
                const catExercises = filteredExercises.filter(([_, ex]) => ex.category === catKey);
                if (catExercises.length === 0) return null;
                
                const Icon = categoryIcons[catKey] || Dumbbell;

                return (
                  <div key={catKey} className="space-y-5">
                    <div className="flex items-center gap-3 px-2">
                      <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center text-blue-500">
                        <Icon size={16} />
                      </div>
                      <h4 className="text-[11px] font-black uppercase tracking-[0.3em] text-gray-400">
                        {(t.categories as any)[catKey]}
                      </h4>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {catExercises.map(([key, ex]) => (
                        <button
                          key={key}
                          onClick={() => {
                            setSelectedExercise(ex.name);
                            setShowPicker(false);
                            setSearchQuery('');
                            setIsLogged(false);
                          }}
                          className={`p-5 rounded-[1.75rem] text-left transition-all border ${
                            selectedExercise === ex.name 
                              ? 'bg-blue-600 border-blue-600 text-white shadow-xl shadow-blue-500/20' 
                              : 'bg-white dark:bg-gray-800 border-gray-100 dark:border-gray-700 hover:border-blue-400'
                          }`}
                        >
                          <span className={`text-xs font-black uppercase tracking-tight ${selectedExercise === ex.name ? 'text-white' : 'text-gray-700 dark:text-gray-200'}`}>
                            {ex.name}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Coach;
