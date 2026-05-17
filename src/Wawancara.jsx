// --- Wawancara.jsx ---
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useLocation, useNavigate, Navigate } from 'react-router-dom';
import { 
  ShieldAlert, User, CheckCircle, AlertTriangle, BookOpen, Clock, 
  Database, Lock, ArrowRight, Loader2, Save, LogOut, PenTool
} from 'lucide-react';
import { GOOGLE_SCRIPT_WEB_APP_URL, LOGO_BPS, getLocalTime, formatTime } from './config.js';

export default function WawancaraArea() {
  const navigate = useNavigate();
  const location = useLocation();
  const stateData = location.state || {};
  const user = stateData.user || { email: '', namaLengkap: '' };
  const jadwalServer = stateData.jadwalServer || { durasi: 45 };

  const [view, setView] = useState('instructions'); 
  const [dbSoal, setDbSoal] = useState([]);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [showWarningModal, setShowWarningModal] = useState(false);
  const [appModal, setAppModal] = useState({ show: false, title: '', message: '' }); 
  const [loadingLogo, setLoadingLogo] = useState(LOGO_BPS);
  const [finishTime, setFinishTime] = useState('');

  const [answers, setAnswers] = useState(() => {
    try { const saved = localStorage.getItem('se2026_wawancara_answers_' + user.email); return saved ? JSON.parse(saved) : {}; } catch(e) { return {}; }
  });
  const [warnings, setWarnings] = useState(() => Number(localStorage.getItem('se2026_wawancara_warn_' + user.email)) || 0);
  const [actualStartTime, setActualStartTime] = useState(() => localStorage.getItem('se2026_wawancara_starttime_' + user.email) || '');

  const [timeLeft, setTimeLeft] = useState(jadwalServer.durasi * 60); 
  const [endTimeTarget, setEndTimeTarget] = useState(null); 
  const sessionToken = useRef(Math.random().toString(36).substring(2)); 
  const submitRef = useRef(null);
  const isSubmitting = useRef(false);

  // --- 🚀 STATE & LOGIKA KANVAS TANDA TANGAN ---
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [isTtdEmpty, setIsTtdEmpty] = useState(true);

  const getCoordinates = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const clientX = e.clientX || (e.touches && e.touches[0].clientX);
    const clientY = e.clientY || (e.touches && e.touches[0].clientY);
    return { x: clientX - rect.left, y: clientY - rect.top };
  };

  const startDrawing = (e) => {
    const { x, y } = getCoordinates(e);
    const ctx = canvasRef.current.getContext('2d');
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.strokeStyle = '#0f172a'; // Warna tinta
    setIsDrawing(true);
  };

  const draw = (e) => {
    if (!isDrawing) return;
    const { x, y } = getCoordinates(e);
    const ctx = canvasRef.current.getContext('2d');
    ctx.lineTo(x, y);
    ctx.stroke();
    setIsTtdEmpty(false);
  };

  const stopDrawing = () => setIsDrawing(false);

  const clearCanvas = (e) => {
    if(e) e.preventDefault();
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setIsTtdEmpty(true);
  };

  useEffect(() => {
    const fetchInitData = async () => {
      try {
        const res = await fetch(`${GOOGLE_SCRIPT_WEB_APP_URL}?action=init&cb=${new Date().getTime()}`);
        const data = await res.json();
        setDbSoal(data.soal_wawancara || []);
        setIsLoadingData(false);
      } catch (err) { setIsLoadingData(false); }
    };
    if (view === 'instructions') fetchInitData();
  }, [view]);

  useEffect(() => {
    if (user.email && view === 'form') {
      localStorage.setItem('se2026_wawancara_answers_' + user.email, JSON.stringify(answers));
      localStorage.setItem('se2026_wawancara_warn_' + user.email, warnings.toString());
    }
  }, [answers, warnings, user.email, view]);

  useEffect(() => {
    if (user.email && view === 'instructions') {
      const savedEndTime = localStorage.getItem('se2026_wawancara_endtime_' + user.email);
      if (savedEndTime) { setEndTimeTarget(Number(savedEndTime)); setView('form'); }
    }
  }, [user.email, view]);

  useEffect(() => {
    if (view === 'form') {
      window.history.pushState(null, '', window.location.href);
      const handlePopState = () => window.history.pushState(null, '', window.location.href);
      window.addEventListener('popstate', handlePopState);
      const handleBeforeUnload = (e) => {
        if (!isSubmitting.current) { e.preventDefault(); e.returnValue = 'Data akan hilang. Muat ulang?'; }
      };
      window.addEventListener('beforeunload', handleBeforeUnload);
      return () => { window.removeEventListener('popstate', handlePopState); window.removeEventListener('beforeunload', handleBeforeUnload); };
    }
  }, [view]);

  useEffect(() => {
    let logoTimer;
    if (view === 'saving') logoTimer = setInterval(() => { setLoadingLogo(prev => prev === LOGO_BPS ? '/logo.png' : LOGO_BPS); }, 750);
    return () => clearInterval(logoTimer);
  }, [view]);

  useEffect(() => {
    if (view === 'form') {
      const handleContextMenu = (e) => e.preventDefault();
      const handleCopy = (e) => e.preventDefault();
      const handleKeyDown = (e) => { if (e.key === 'PrintScreen' || (e.ctrlKey && e.key === 'p') || e.key === 'F11') e.preventDefault(); };
      const triggerCheatWarning = () => {
        setWarnings(prev => { const next = prev + 1; if (next < 10) setShowWarningModal(true); return next; });
      };
      const handleFullscreenChange = () => { if (!document.fullscreenElement) triggerCheatWarning(); };
      const handleWindowBlur = () => { triggerCheatWarning(); };

      document.addEventListener('contextmenu', handleContextMenu); document.addEventListener('copy', handleCopy);
      document.addEventListener('keydown', handleKeyDown); document.addEventListener('fullscreenchange', handleFullscreenChange);
      window.addEventListener('blur', handleWindowBlur);

      return () => {
        document.removeEventListener('contextmenu', handleContextMenu); document.removeEventListener('copy', handleCopy);
        document.removeEventListener('keydown', handleKeyDown); document.removeEventListener('fullscreenchange', handleFullscreenChange);
        window.removeEventListener('blur', handleWindowBlur);
      };
    }
  }, [view]);

  useEffect(() => {
    if (view === 'form' && warnings >= 10) {
      if (!isSubmitting.current && submitRef.current) { alert("Batas pelanggaran terlewati. Esai dikirim otomatis!"); submitRef.current(); }
    }
  }, [warnings, view]);

  useEffect(() => {
    if (view !== 'form' || !endTimeTarget) return;
    const timerId = setInterval(() => {
      const remainingMs = endTimeTarget - Date.now();
      const remainingSec = Math.ceil(remainingMs / 1000);
      if (remainingSec <= 0) {
        setTimeLeft(0); clearInterval(timerId);
        if (!isSubmitting.current && submitRef.current) { alert("Waktu Esai habis! Sistem otomatis mengirim jawaban."); submitRef.current(); }
      } else { setTimeLeft(remainingSec); }
    }, 1000);
    return () => clearInterval(timerId);
  }, [view, endTimeTarget]);

  const triggerSubmitConfirm = (e) => {
    e.preventDefault();
    if (isSubmitting.current) return;
    
    if (isTtdEmpty) {
       alert("Anda WAJIB membubuhkan Tanda Tangan pada kanvas yang disediakan sebelum mengirim!");
       return;
    }

    const belumDiisi = dbSoal.length - Object.keys(answers).length;
    if (belumDiisi > 0) {
      setAppModal({ show: true, title: 'Belum Selesai', message: `Masih ada ${belumDiisi} isian yang kosong. Yakin ingin mengirim sekarang?` });
    } else {
      setAppModal({ show: true, title: 'Konfirmasi Pengiriman', message: 'Apakah Anda yakin ingin mengirim esai ini? Jawaban tidak dapat diubah lagi.' });
    }
  };

  const executeSubmit = useCallback(async () => {
    if (isSubmitting.current) return; 
    
    isSubmitting.current = true;
    setAppModal({ show: false, title: '', message: '' }); 
    setView('saving');
    
    localStorage.removeItem('se2026_wawancara_endtime_' + user.email);
    localStorage.removeItem('se2026_wawancara_answers_' + user.email);
    localStorage.removeItem('se2026_wawancara_warn_' + user.email);
    localStorage.removeItem('se2026_wawancara_starttime_' + user.email);

    const detailWawancara = dbSoal.map((s, idx) => ({
      pertanyaan: s.pertanyaan || s,
      jawaban: answers[idx] || "Tidak ada jawaban."
    }));

    const endTime = getLocalTime();
    setFinishTime(endTime);

    // Ambil Data Tanda Tangan (Base64)
    const ttdBase64 = canvasRef.current ? canvasRef.current.toDataURL('image/png') : '';

    const payload = {
      action: "save_wawancara",
      email: user.email,
      waktu_mulai: actualStartTime || getLocalTime(), 
      waktu_selesai: endTime,
      nama_peserta: user.namaLengkap || user.email,
      data: detailWawancara,
      ttd: ttdBase64  // 🚀 Kirim TTD ke backend
    };

    try { 
      try { if (document.fullscreenElement) document.exitFullscreen(); } catch (e) {}
      await fetch(GOOGLE_SCRIPT_WEB_APP_URL, { method: 'POST', mode: 'no-cors', body: JSON.stringify(payload) }); 
    } catch (e) {}
    
    setTimeout(() => setView('result'), 2000);
  }, [answers, dbSoal, user.email, user.namaLengkap, actualStartTime]);

  useEffect(() => { submitRef.current = executeSubmit; }, [executeSubmit]);

  if (!location.state || !location.state.user) { return <Navigate to="/" replace />; }

  const startWawancara = () => {
    try { const elem = document.documentElement; if (elem.requestFullscreen) { elem.requestFullscreen(); } } catch (e) {}
    const realStartTime = getLocalTime();
    setActualStartTime(realStartTime);
    localStorage.setItem('se2026_wawancara_starttime_' + user.email, realStartTime);
    let target = Date.now() + (jadwalServer.durasi * 60 * 1000);
    localStorage.setItem('se2026_wawancara_endtime_' + user.email, target.toString());
    setEndTimeTarget(target);
    setView('form');
  };

  const handleKeluar = () => { 
    window.history.replaceState(null, null, '/'); navigate('/', { replace: true, state: null }); 
  };

  if (view === 'instructions') {
    return (
      <div className="min-h-[100dvh] w-screen flex items-center justify-center p-3 sm:p-4 py-6 sm:py-10 relative bg-slate-50">
        <div className="max-w-[650px] w-full bg-white rounded-[24px] sm:rounded-[32px] animate-fade-up border border-slate-200 shadow-2xl flex flex-col relative overflow-hidden">
          <div className="p-4 sm:p-6 border-b border-slate-100 text-center bg-blue-600 rounded-t-[24px] sm:rounded-t-[32px] relative text-white">
            <button onClick={handleKeluar} className="absolute right-3 top-4 sm:right-5 sm:top-5 p-2 bg-white/10 hover:bg-white/20 transition-colors rounded-xl flex items-center gap-1 sm:gap-2 text-[9px] sm:text-[10px] font-black uppercase tracking-widest"><LogOut size={12} /> Keluar</button>
            <BookOpen className="w-8 h-8 sm:w-10 sm:h-10 mx-auto mb-2 sm:mb-3 opacity-90" />
            <h1 className="text-lg sm:text-xl font-black tracking-tight uppercase">Tahap 2: Tes Esai (Wawancara Online)</h1>
            <p className="mt-2 text-xs font-medium leading-relaxed max-w-md mx-auto opacity-90">Peserta: <span className="font-black text-white">{user.namaLengkap || user.email}</span></p>
          </div>
          <div className="p-4 sm:p-6 space-y-3 sm:space-y-4 flex flex-col bg-white">
             <div className="grid grid-cols-2 gap-2 sm:gap-3">
                <div className="bg-slate-50 text-slate-800 p-3 sm:p-4 rounded-[16px] sm:rounded-[20px] flex items-center gap-2 sm:gap-3 border border-slate-200">
                   <Clock className="w-6 h-6 sm:w-8 sm:h-8 text-blue-500" />
                   <div><p className="text-[8px] sm:text-[9px] uppercase font-black text-slate-400 tracking-widest leading-none mb-1">Durasi</p><p className="text-base sm:text-xl font-black leading-none">{jadwalServer.durasi} Menit</p></div>
                </div>
                <div className="bg-slate-50 text-slate-800 p-3 sm:p-4 rounded-[16px] sm:rounded-[20px] flex items-center gap-2 sm:gap-3 border border-slate-200">
                   <Database className="w-6 h-6 sm:w-8 sm:h-8 text-blue-500" />
                   <div><p className="text-[8px] sm:text-[9px] uppercase font-black text-slate-400 tracking-widest leading-none mb-1">Jumlah</p><p className="text-base sm:text-xl font-black leading-none">{dbSoal.length} Isian</p></div>
                </div>
             </div>
             <div className="bg-blue-50 p-4 sm:p-5 rounded-[16px] sm:rounded-[24px] border border-blue-100 space-y-2 sm:space-y-3">
                <div className="flex gap-2.5 sm:gap-3"><div className="mt-0.5"><Lock className="text-blue-500 w-3.5 h-3.5 sm:w-4 sm:h-4" /></div><div><p className="text-[11px] sm:text-xs font-black text-slate-700">Mode Layar Terkunci</p><p className="text-[9px] sm:text-[11px] text-slate-500 font-medium leading-snug">Wajib menggunakan mode fullscreen.</p></div></div>
                <div className="flex gap-2.5 sm:gap-3"><div className="mt-0.5"><AlertTriangle className="text-orange-500 w-3.5 h-3.5 sm:w-4 sm:h-4" /></div><div><p className="text-[11px] sm:text-xs font-black text-slate-700">Sistem Deteksi Aktivitas</p><p className="text-[9px] sm:text-[11px] text-slate-600 font-bold leading-snug">Keluar dari layar aplikasi akan mengurangi kuota pelanggaran (Maks 10x).</p></div></div>
             </div>
          </div>
          <div className="p-4 sm:p-6 pt-0 bg-white">
            {isLoadingData ? (
               <div className="w-full bg-slate-100 text-slate-500 font-black py-3.5 sm:py-4 rounded-[14px] sm:rounded-2xl flex justify-center items-center gap-2 uppercase tracking-widest text-[10px] sm:text-xs border border-slate-200"><Loader2 size={14} className="animate-spin text-blue-500"/> Mengunduh Soal...</div>
            ) : (
               <button onClick={startWawancara} className="w-full bg-[#1A1A1B] font-black py-3.5 sm:py-4 rounded-[14px] sm:rounded-2xl shadow-xl active:scale-95 text-white flex justify-center items-center gap-2 uppercase tracking-widest text-[10px] sm:text-xs transition-all">SAYA MENGERTI, MULAI ESAI <ArrowRight size={14}/></button>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (view === 'saving') {
    return (
      <div className="h-[100dvh] flex flex-col items-center justify-center relative bg-slate-50">
        <img src={loadingLogo} className="w-16 h-16 sm:w-20 sm:h-20 mb-6 transition-all duration-300 object-contain drop-shadow-md" alt="Logo" onError={(e) => e.target.style.display = 'none'} />
        <Loader2 className="w-8 h-8 sm:w-10 sm:h-10 animate-spin text-blue-600 mb-4"/>
        <p className="font-black text-slate-500 uppercase tracking-widest text-[10px] sm:text-xs">Menyimpan Esai...</p>
      </div>
    );
  }

  if (view === 'form') {
    return (
      <div className="h-[100dvh] w-screen flex flex-col font-sans relative overflow-hidden bg-slate-50">
        
        {appModal.show && (
          <div className="fixed inset-0 bg-[#1A1A1B]/80 backdrop-blur-sm z-[150] flex items-center justify-center p-4">
            <div className="bg-white rounded-[24px] max-w-sm w-full p-6 sm:p-8 text-center animate-scale-in shadow-2xl">
              <AlertTriangle className="w-10 h-10 sm:w-12 sm:h-12 text-blue-600 mx-auto mb-4" />
              <h3 className="font-bold text-base sm:text-lg mb-2 text-slate-800">{appModal.title}</h3>
              <p className="text-slate-500 text-xs sm:text-sm mb-6">{appModal.message}</p>
              <div className="flex gap-3">
                <button onClick={() => setAppModal({ show: false, title: '', message: '' })} className="flex-1 bg-slate-100 font-bold py-3 sm:py-4 rounded-xl text-slate-700 uppercase tracking-widest text-[10px] sm:text-xs hover:bg-slate-200 transition-colors">Batal</button>
                <button onClick={executeSubmit} className="flex-1 bg-blue-600 font-bold py-3 sm:py-4 rounded-xl text-white uppercase tracking-widest text-[10px] sm:text-xs hover:bg-blue-700 transition-colors shadow-md">Ya, Kirim</button>
              </div>
            </div>
          </div>
        )}

        {showWarningModal && (
          <div className="fixed inset-0 bg-[#1A1A1B]/80 backdrop-blur-md z-[100] flex items-center justify-center p-4">
            <div className="bg-white rounded-[24px] max-w-sm w-full p-6 sm:p-8 text-center animate-scale-in shadow-2xl border-2 border-red-500">
              <ShieldAlert className="w-12 h-12 sm:w-16 sm:h-16 text-red-500 mx-auto mb-4 sm:mb-5" />
              <h3 className="font-black text-lg sm:text-xl mb-2 sm:mb-3 text-[#1A1A1B] uppercase tracking-tight">Peringatan Sistem</h3>
              <p className="text-slate-600 mb-5 sm:mb-6 text-xs sm:text-sm font-bold leading-relaxed">Sistem mendeteksi Anda meminimalkan layar/membuka aplikasi lain. Pelanggaran ke-{warnings}/10.</p>
              <button onClick={() => setShowWarningModal(false)} className="w-full bg-[#1A1A1B] text-white font-black py-3 sm:py-4 rounded-xl hover:bg-black uppercase tracking-widest text-[10px] sm:text-xs transition-colors">Lanjutkan Esai</button>
            </div>
          </div>
        )}

        <header className="bg-white/90 backdrop-blur-md px-3 sm:px-6 h-[60px] sm:h-[70px] flex items-center justify-between z-40 shrink-0 shadow-sm">
          <div className="flex items-center gap-2 sm:gap-3 flex-1 mr-2">
            <img src={LOGO_BPS} className="w-7 h-7 sm:w-9 sm:h-9 object-contain shrink-0" alt="Logo" />
            <div className="font-black text-[9px] sm:text-sm tracking-tight text-slate-800 uppercase leading-tight border-l-2 border-slate-200 pl-2">Tes Esai (Wawancara Online)</div>
          </div>
          <div className="flex gap-2 sm:gap-3 items-center shrink-0">
             <div className="hidden md:flex items-center gap-2 bg-blue-50 border border-blue-100 px-4 py-2 rounded-full shadow-sm">
                <User className="w-4 h-4 text-blue-600" />
                <span className="text-xs font-black uppercase tracking-wider text-slate-700 truncate max-w-[150px]">{user.namaLengkap || user.email}</span>
             </div>
             <div className={`font-mono text-xs sm:text-base font-black px-4 sm:px-6 py-1.5 sm:py-2 rounded-full shadow-lg border-2 flex items-center gap-1.5 sm:gap-2 transition-all ${timeLeft < 300 ? 'bg-red-500 text-white border-red-600 animate-pulse' : 'bg-white text-[#1A1A1B] border-slate-200'}`}>
                <Clock size={14} className={timeLeft < 300 ? "text-white" : "text-blue-500"}/>{formatTime(timeLeft)}
             </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto custom-scrollbar p-3 sm:p-6 w-full">
          <div className="max-w-[800px] mx-auto space-y-4 sm:space-y-6 pb-20">
            
            <div className="bg-blue-600 text-white p-5 sm:p-6 rounded-[20px] sm:rounded-[24px] shadow-md flex items-center gap-4">
               <div>
                 <h2 className="text-sm sm:text-lg font-black uppercase tracking-widest">Lembar Jawaban Peserta</h2>
                 <p className="text-[10px] sm:text-xs font-medium opacity-90 mt-1">Jawablah pertanyaan di bawah ini dengan sejujur-jujurnya. Data otomatis tersimpan saat Anda mengetik.</p>
               </div>
            </div>

            <form onSubmit={triggerSubmitConfirm} className="space-y-4 sm:space-y-5">
              {dbSoal.map((s, i) => {
                const isBiodata = i < 3; 
                return (
                  <div key={i} className="bg-white p-4 sm:p-6 rounded-[16px] sm:rounded-[24px] border border-slate-200 shadow-sm transition-all focus-within:border-blue-400 focus-within:shadow-md">
                    <p className="font-bold text-slate-800 text-[13px] sm:text-sm mb-3 sm:mb-4 leading-relaxed"><span className="text-blue-500 font-black mr-1 sm:mr-2">{i+1}.</span> {s.pertanyaan || s}</p>
                    
                    {isBiodata ? (
                       <input required type="text" placeholder="Ketik jawaban singkat Anda..." value={answers[i] || ''} onChange={e => setAnswers({...answers, [i]: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-500 focus:bg-white text-[13px] sm:text-sm font-semibold transition-colors" />
                    ) : (
                       <textarea required placeholder="Ketik penjelasan Anda secara lengkap di sini..." value={answers[i] || ''} onChange={e => setAnswers({...answers, [i]: e.target.value})} className="w-full min-h-[100px] sm:min-h-[120px] p-4 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-500 focus:bg-white text-[13px] sm:text-sm font-medium transition-colors resize-y custom-scrollbar leading-relaxed" />
                    )}
                  </div>
                );
              })}

              {/* 🚀 KANVAS TANDA TANGAN PESERTA */}
              <div className="bg-white p-5 sm:p-6 rounded-[16px] sm:rounded-[24px] border border-slate-200 shadow-sm flex flex-col items-center">
                 <div className="text-center mb-4">
                    <p className="font-black text-slate-800 text-sm flex items-center justify-center gap-2"><PenTool size={16} className="text-blue-500"/> Tanda Tangan Peserta</p>
                    <p className="text-[10px] sm:text-xs text-slate-500 font-medium mt-1">Gambarlah tanda tangan Anda pada kotak di bawah ini.</p>
                 </div>
                 
                 <div className="relative border-2 border-dashed border-slate-300 rounded-2xl bg-slate-50 overflow-hidden shadow-inner">
                   {isTtdEmpty && <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-30 font-bold text-xs uppercase tracking-widest text-slate-500">Area Tanda Tangan</div>}
                   <canvas
                      ref={canvasRef}
                      width={320}
                      height={160}
                      className="touch-none cursor-crosshair relative z-10"
                      onMouseDown={startDrawing}
                      onMouseMove={draw}
                      onMouseUp={stopDrawing}
                      onMouseLeave={stopDrawing}
                      onTouchStart={startDrawing}
                      onTouchMove={draw}
                      onTouchEnd={stopDrawing}
                   />
                 </div>
                 
                 <button type="button" onClick={clearCanvas} className="mt-3 text-[10px] sm:text-xs font-bold text-red-500 hover:text-red-600 bg-red-50 px-4 py-2.5 rounded-xl transition-colors active:scale-95">Hapus & Ulangi TTD</button>
              </div>

              <div className="pt-4">
                <button type="submit" disabled={isSubmitting.current} className="w-full bg-[#1A1A1B] text-white font-black py-4 sm:py-5 rounded-[16px] sm:rounded-2xl shadow-xl transition-all uppercase tracking-widest text-[11px] sm:text-xs flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50">
                  <Save className="w-4 h-4"/> Selesai & Kirim Dokumen
                </button>
              </div>
            </form>

          </div>
        </div>
      </div>
    );
  }

  if (view === 'result') {
    return (
      <div className="h-[100dvh] w-screen flex items-center justify-center p-4 relative bg-slate-50">
        <div className="max-w-[450px] w-full bg-white rounded-[32px] sm:rounded-[40px] p-6 sm:p-10 text-center animate-fade-up border border-slate-200 shadow-2xl">
          <div className="w-20 h-20 sm:w-24 sm:h-24 bg-blue-50 rounded-[24px] sm:rounded-[32px] flex items-center justify-center mx-auto mb-4 sm:mb-6 shadow-sm"><CheckCircle className="w-10 h-10 sm:w-12 sm:h-12 text-blue-600" /></div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-800 mb-2 tracking-tight uppercase">Rangkaian Uji Kompetensi Selesai</h1>
          <p className="text-slate-500 text-xs sm:text-sm mb-6 font-medium leading-relaxed">Seluruh tahapan seleksi (Pilihan Ganda & Esai) telah Anda selesaikan. Data Anda telah tersimpan dengan aman di database BPS Kabupaten Pacitan.</p>
          
          <div className="text-left bg-slate-50 p-5 sm:p-6 rounded-[20px] mb-8 border border-slate-200 space-y-3">
             <div className="flex flex-col border-b border-slate-200 pb-2"><span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Nama Lengkap</span><span className="text-xs sm:text-sm font-bold text-slate-800 uppercase">{user.namaLengkap || '-'}</span></div>
             <div className="flex flex-col border-b border-slate-200 pb-2"><span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Alamat Email</span><span className="text-xs sm:text-sm font-bold text-slate-800">{user.email}</span></div>
             <div className="flex flex-col"><span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Waktu Selesai</span><span className="text-xs sm:text-sm font-bold text-blue-600">{finishTime || getLocalTime()}</span></div>
          </div>
          
          <button onClick={handleKeluar} className="w-full bg-[#1A1A1B] hover:bg-black text-white font-black py-4 sm:py-5 rounded-[16px] sm:rounded-2xl flex justify-center gap-2 sm:gap-3 items-center uppercase tracking-widest text-[10px] sm:text-xs transition-all shadow-xl active:scale-95">Keluar & Selesai <LogOut size={16}/></button>
        </div>
      </div>
    );
  }

  return null;
}