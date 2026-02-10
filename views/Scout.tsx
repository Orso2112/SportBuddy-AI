
import React, { useState, useRef } from 'react';
import { Trophy, Upload, Loader2, Sparkles, CheckCircle, Info, X, PlayCircle } from 'lucide-react';
import { geminiService } from '../services/geminiService';
import { Language } from '../types';
import { translations } from '../i18n';
import FormattedText from '../components/FormattedText';

const Scout: React.FC<{ lang: Language }> = ({ lang }) => {
  const t = translations[lang];
  const [analyzing, setAnalyzing] = useState(false);
  const [report, setReport] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [showInfo, setShowInfo] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64 = reader.result as string;
      const base64Data = base64.split(',')[1];
      setPreview(base64);
      setAnalyzing(true);
      try {
        const result = await geminiService.analyzeScouting(base64Data, lang);
        setReport(result || '...');
      } catch (err) {
        setReport(lang === 'it' ? 'Errore durante l\'analisi.' : 'Error during analysis.');
      } finally {
        setAnalyzing(false);
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="space-y-8 max-w-2xl mx-auto pb-10 px-2">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">{t.auto_scout}</h2>
          <p className="text-sm text-gray-500 font-medium">{t.auto_scout_desc}</p>
        </div>
        <div className="w-12 h-12 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl flex items-center justify-center text-orange-500 shadow-sm group">
          <Sparkles size={24} className="group-hover:rotate-12 transition-transform" />
        </div>
      </div>

      {showInfo && (
        <div className="bg-gray-900 dark:bg-gray-800 p-6 rounded-[2rem] flex gap-5 relative animate-in fade-in slide-in-from-top-2 overflow-hidden shadow-xl">
          <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/10 rounded-full blur-3xl -mr-16 -mt-16"></div>
          <div className="w-12 h-12 rounded-2xl bg-orange-500 flex items-center justify-center text-white shrink-0 shadow-lg shadow-orange-500/20">
            <Trophy size={24} />
          </div>
          <div className="flex-1">
            <h4 className="text-sm font-black text-white uppercase tracking-widest mb-1">{lang === 'en' ? 'AI Scouting' : 'Scouting AI'}</h4>
            <p className="text-[11px] text-gray-300 leading-relaxed font-medium">
              {lang === 'en' 
                ? "Upload match clips. Our professional AI engine identifies key moments and builds detailed performance reports automatically."
                : "Carica le tue clip. Il nostro motore AI professionale identifica i momenti chiave e genera report di performance dettagliati."}
            </p>
          </div>
          <button onClick={() => setShowInfo(false)} className="text-gray-500 hover:text-white transition-colors p-2 h-fit">
            <X size={18} />
          </button>
        </div>
      )}

      <div 
        onClick={() => !analyzing && fileInputRef.current?.click()}
        className={`group relative aspect-video bg-white dark:bg-gray-950 border-2 border-dashed border-gray-200 dark:border-gray-800 rounded-[3rem] flex flex-col items-center justify-center cursor-pointer hover:border-orange-400 dark:hover:border-orange-500 transition-all overflow-hidden shadow-sm ${analyzing ? 'cursor-wait' : ''}`}
      >
        {preview ? (
          <div className="w-full h-full relative">
            <img src={preview} className="w-full h-full object-cover transition-transform group-hover:scale-105 duration-700" alt="Scouting Source" />
            <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <PlayCircle size={64} className="text-white drop-shadow-lg" />
            </div>
          </div>
        ) : (
          <>
            <div className="w-24 h-24 bg-orange-50 dark:bg-orange-950 rounded-[2rem] flex items-center justify-center text-orange-500 mb-6 shadow-sm group-hover:scale-110 transition-transform">
              <Upload size={32} />
            </div>
            <div className="text-center">
              <p className="text-base font-black text-gray-800 dark:text-gray-200">{lang === 'en' ? 'Upload Gameplay Clip' : 'Carica Clip Partita'}</p>
              <p className="text-[10px] text-gray-400 uppercase tracking-[0.3em] font-bold mt-2">{lang === 'en' ? 'Max 50MB • MP4/MOV/JPG' : 'Max 50MB • MP4/MOV/JPG'}</p>
            </div>
          </>
        )}
        
        {analyzing && (
          <div className="absolute inset-0 bg-gray-950/90 backdrop-blur-xl flex flex-col items-center justify-center text-white z-20">
            <div className="relative mb-6">
              <div className="absolute -inset-4 bg-orange-500/20 rounded-full blur-xl animate-pulse"></div>
              <Loader2 className="animate-spin text-orange-500" size={64} strokeWidth={1.5} />
              <Trophy className="absolute inset-0 m-auto text-white" size={24} />
            </div>
            <div className="text-center space-y-1">
              <span className="text-orange-400 font-black uppercase tracking-[0.4em] text-[11px] animate-pulse block">{t.extracting}</span>
              <p className="text-[9px] text-gray-500 font-bold uppercase tracking-widest">{lang === 'en' ? 'Identifying athletes and actions...' : 'Identificazione atleti e azioni...'}</p>
            </div>
          </div>
        )}
      </div>

      <input type="file" ref={fileInputRef} onChange={handleFile} accept="video/*,image/*" className="hidden" />

      {report && !analyzing && (
        <div className="bg-white dark:bg-gray-900 p-8 rounded-[3rem] shadow-2xl border border-gray-100 dark:border-gray-800 animate-in zoom-in-95 duration-700 overflow-hidden relative">
          <div className="absolute top-0 right-0 p-8">
            <div className="w-14 h-14 bg-green-50 dark:bg-green-900/20 text-green-500 rounded-full flex items-center justify-center shadow-inner">
               <CheckCircle size={32} />
            </div>
          </div>
          <div className="flex items-center gap-4 mb-8">
            <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/40 text-orange-600 dark:text-orange-400 rounded-2xl flex items-center justify-center">
              <Trophy size={24} />
            </div>
            <div>
              <h3 className="text-xl font-black text-gray-900 dark:text-white leading-none uppercase tracking-tight">{t.scouting_report}</h3>
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-2">{lang === 'en' ? 'AI GENERATED ANALYSIS' : 'ANALISI GENERATA DA AI'}</p>
            </div>
          </div>
          <div className="bg-gray-50 dark:bg-gray-950/50 p-8 rounded-[2rem] border border-gray-100 dark:border-gray-800 shadow-inner">
            <FormattedText text={report} />
          </div>
          <div className="mt-8 flex justify-center">
             <button 
               onClick={() => { setPreview(null); setReport(null); }}
               className="text-xs font-black uppercase tracking-[0.3em] text-gray-400 hover:text-orange-500 transition-all py-3 px-8 bg-gray-50 dark:bg-gray-800 rounded-xl hover:shadow-md"
             >
               {lang === 'en' ? 'New Session' : 'Nuova Sessione'}
             </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Scout;
