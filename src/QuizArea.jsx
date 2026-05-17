// --- QuizArea.jsx ---
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useLocation, useNavigate, Navigate } from 'react-router-dom';
import { 
  ShieldAlert, User, CheckCircle, AlertTriangle, CheckCircle2, XCircle, 
  LogOut, ChevronRight, ChevronLeft, Loader2, Trash2, ArrowRight, 
  BookOpen, Clock, Database, BarChart3, Lock 
} from 'lucide-react';
import { GOOGLE_SCRIPT_WEB_APP_URL, LOGO_BPS, getLocalTime, formatTime } from './config.js';

export default function QuizArea() {
  const navigate = useNavigate();
  const location = useLocation();
  
  const stateData = location.state || {};
  const user = stateData.user || { email: '', namaLengkap: '' };
  const quizData = stateData.quizData || [];
  const jadwalServer = stateData.jadwalServer || { durasi: 45 };
  const attemptCount = stateData.attemptCount || 1;
  
  // Waktu mulai dari halaman login (sebagai cadangan)
  const initialStartTime = stateData.startTime || '';

  const [view, setView] = useState('instructions'); 
  const [showMap, setShowMap] = useState(false); 
  const [loadingLogo, setLoadingLogo] = useState(LOGO_BPS);
  const [showWarningModal, setShowWarningModal] = useState(false);
  const [appModal, setAppModal] = useState({ show: false, type: '', message: '', title: '' });
  const [isSyncing, setIsSyncing] = useState(true);

  // ==============================================================
  // 🛡️ SISTEM RECOVERY SESI & KEAMANAN (ANTI-REFRESH / ANTI-CLOSE)
  // ==============================================================
  
  const [answers, setAnswers] = useState(() => {
    try {
      const savedAnswers = localStorage.getItem('se2026_answers_' + user.email);
      return savedAnswers ? JSON.parse(savedAnswers) : {};
    } catch(e) { return {}; }
  });

  const [warnings, setWarnings] = useState(() => {
    return Number(localStorage.getItem('se2026_warn_' + user.email)) || 0;
  });

  // MEMORI PENYIMPAN WAKTU MULAI ASLI (AGAR TIDAK KESET SAAT RELOGIN)
  const [actualStartTime, setActualStartTime] = useState(() => {
    return localStorage.getItem('se2026_starttime_' + user.email) || initialStartTime;
  });

  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [timeLeft, setTimeLeft] = useState(jadwalServer.durasi * 60); 
  const [endTimeTarget, setEndTimeTarget] = useState(null); 
  
  const sessionToken = useRef(Math.random().toString(36).substring(2)); 
  const submitRef = useRef(null);
  const isSubmitting = useRef(false);

  // 1. Auto-Save Jawaban & Pelanggaran ke Browser
  useEffect(() => {
    if (user.email && view === 'quiz') {
      localStorage.setItem('se2026_answers_' + user.email, JSON.stringify(answers));
      localStorage.setItem('se2026_warn_' + user.email, warnings.toString());
    }
  }, [answers, warnings, user.email, view]);

  // 2. Kunci Tombol Back Browser Kuat-Kuat
  useEffect(() => {
    if (view === 'quiz') {
      window.history.pushState(null, '', window.location.href);
      const handlePopState = () => {
        window.history.pushState(null, '', window.location.href);
      };
      window.addEventListener('popstate', handlePopState);
      return () => window.removeEventListener('popstate', handlePopState);
    }
  }, [view]);

  // 3. Mencegah reload halaman secara tidak sengaja
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (view === 'quiz' && !isSubmitting.current) {
        e.preventDefault();
        e.returnValue = 'Yakin ingin memuat ulang?';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [view]);

  // 4. VERIFIKASI SESI SERVER-SIDE & KUNCI WAKTU MULAI ASLI
  useEffect(() => {
    if (view !== 'instructions') return;
    let isMounted = true;
    
    const syncServerSession = async () => {
        try {
            const res = await fetch(`${GOOGLE_SCRIPT_WEB_APP_URL}?action=init&cb=${new Date().getTime()}`);
            const data = await res.json();
            
            if (!isMounted) return;
            
            if (data.status === "success" && data.sesi_aktif) {
                const sesiSaya = data.sesi_aktif.find(s => String(s.email).toLowerCase() === String(user.email).toLowerCase());
                
                if (sesiSaya && sesiSaya.waktu_mulai) {
                    
                    // KUNCI WAKTU MULAI DARI SERVER!
                    setActualStartTime(sesiSaya.waktu_mulai);
                    localStorage.setItem('se2026_starttime_' + user.email, sesiSaya.waktu_mulai);

                    const parts = sesiSaya.waktu_mulai.replace(',', '').trim().split(' ');
                    const dateParts = parts[0].split(/[\/-]/);
                    const timeParts = (parts[1] || "00:00:00").split(/[.:]/);
                    
                    let year = dateParts[2];
                    let month = dateParts[1];
                    let day = dateParts[0];
                    if (dateParts[0] && dateParts[0].length === 4) { 
                        year = dateParts[0];
                        day = dateParts[2];
                    }
                    
                    const startMs = new Date(year, month - 1, day, timeParts[0] || 0, timeParts[1] || 0, timeParts[2] || 0).getTime();
                    
                    if (startMs > 0 && !isNaN(startMs)) {
                        const target = startMs + (jadwalServer.durasi * 60 * 1000);
                        setEndTimeTarget(target);
                        localStorage.setItem('se2026_endtime_' + user.email, target.toString());
                        setView('quiz'); 
                        setIsSyncing(false);
                        return; 
                    }
                }
            }
        } catch(e) {}
        
        // Fallback jika tidak ada sesi server (atau koneksi buruk)
        if (isMounted) {
            const savedEndTime = localStorage.getItem('se2026_endtime_' + user.email);
            if (savedEndTime) {
                setEndTimeTarget(Number(savedEndTime));
                setView('quiz');
            }
            setIsSyncing(false);
        }
    };
    
    syncServerSession();
    return () => { isMounted = false; };
  }, [user.email, jadwalServer.durasi, view]);

  useEffect(() => {
    let logoTimer;
    if (view === 'saving') {
      logoTimer = setInterval(() => { setLoadingLogo(prev => prev === LOGO_BPS ? '/logo.png' : LOGO_BPS); }, 750);
    }
    return () => clearInterval(logoTimer);
  }, [view]);

  // 5. Deteksi Pelanggaran Keamanan Anti-Curang
  useEffect(() => {
    if (view === 'quiz') {
      const handleContextMenu = (e) => { e.preventDefault(); };
      const handleCopy = (e) => { e.preventDefault(); };
      const handleKeyDown = (e) => {
        if (e.key === 'PrintScreen' || (e.ctrlKey && e.key === 'p') || e.key === 'F11') {
          e.preventDefault();
          try { navigator.clipboard.writeText(''); } catch(err){}
        }
      };

      const triggerCheatWarning = () => {
        setWarnings(prev => {
          const next = prev + 1;
          if (next < 10) {
            setShowWarningModal(true);
          }
          return next;
        });
      };

      const handleFullscreenChange = () => { if (!document.fullscreenElement) triggerCheatWarning(); };
      const handleWindowBlur = () => { triggerCheatWarning(); };

      document.addEventListener('contextmenu', handleContextMenu);
      document.addEventListener('copy', handleCopy);
      document.addEventListener('keydown', handleKeyDown);
      document.addEventListener('fullscreenchange', handleFullscreenChange);
      window.addEventListener('blur', handleWindowBlur);

      return () => {
        document.removeEventListener('contextmenu', handleContextMenu);
        document.removeEventListener('copy', handleCopy);
        document.removeEventListener('keydown', handleKeyDown);
        document.removeEventListener('fullscreenchange', handleFullscreenChange);
        window.removeEventListener('blur', handleWindowBlur);
      };
    }
  }, [view]);

  // 6. Submit Otomatis Jika Pelanggaran >= 10
  useEffect(() => {
    if (view === 'quiz' && warnings >= 10) {
      if (!isSubmitting.current && submitRef.current) {
        alert("Batas pelanggaran sistem (10x) telah tercapai. Jawaban Anda disimpan dan dikirim otomatis!");
        submitRef.current();
      }
    }
  }, [warnings, view]);

  // 7. Anti Multi-Tab / Multi-Device
  useEffect(() => {
    if (view === 'quiz') {
      localStorage.setItem('active_se2026_quiz_' + user.email, sessionToken.current);
      const handleStorageChange = (e) => {
        if (e.key === 'active_se2026_quiz_' + user.email && e.newValue !== sessionToken.current) {
          if (!isSubmitting.current && submitRef.current) {
            alert("Aktivitas terdeteksi di perangkat/tab lain! Sesi ujian di layar ini otomatis dihentikan.");
            submitRef.current();
          }
        }
      };
      window.addEventListener('storage', handleStorageChange);
      return () => window.removeEventListener('storage', handleStorageChange);
    }
  }, [view, user.email]);

  // 8. Sinkronisasi Timer Waktu Nyata Absolut (Kebal Refresh)
  useEffect(() => {
    if (view !== 'quiz' || !endTimeTarget) return;
    
    const timerId = setInterval(() => {
      const remainingMs = endTimeTarget - Date.now();
      const remainingSec = Math.ceil(remainingMs / 1000);
      
      if (remainingSec <= 0) {
        setTimeLeft(0);
        clearInterval(timerId);
        if (!isSubmitting.current && submitRef.current) {
           alert("Waktu pengerjaan telah habis! Sistem langsung mengirim jawaban Anda ke server.");
           submitRef.current();
        }
      } else {
        setTimeLeft(remainingSec);
      }
    }, 1000);
    
    return () => clearInterval(timerId);
  }, [view, endTimeTarget]);

  // ==============================================================
  // FUNGSI PENGIRIMAN DATA (SUBMIT)
  // ==============================================================
  const handleSubmit = useCallback(async () => {
    if (isSubmitting.current) return; 
    isSubmitting.current = true;

    setView('saving');
    
    // Bersihkan semua jejak recovery browser
    localStorage.removeItem('active_se2026_quiz_' + user.email);
    localStorage.removeItem('se2026_endtime_' + user.email);
    localStorage.removeItem('se2026_answers_' + user.email);
    localStorage.removeItem('se2026_warn_' + user.email);
    localStorage.removeItem('se2026_starttime_' + user.email);

    let correct = 0;
    const detailJawaban = [];
    
    (quizData || []).forEach(q => {
      if (!q) return; 
      const userAnswer = answers[q?.id] || ""; 
      const isCorrect = userAnswer === q?.answer ? 1 : 0;
      if (isCorrect) correct++;
      
      const textJawaban = (q?.shuffledOptions || []).find(o => o?.key === userAnswer)?.text || "-";
      detailJawaban.push({ soal: q?.text || "-", jawaban: textJawaban, nilai: isCorrect });
    });
    
    const finalScore = quizData.length > 0 ? Math.round((correct / quizData.length) * 100) : 0;
    const endTime = getLocalTime();
    try { if (document.fullscreenElement) document.exitFullscreen(); } catch (e) {}

    const payload = {
      action: "save_all", 
      waktu_mulai: actualStartTime, // DIKIRIM MENGGUNAKAN WAKTU ASLI!
      waktu_selesai: endTime,
      akun: user.email, 
      nama: user.namaLengkap, 
      skor: finalScore, 
      percobaan: attemptCount, 
      keterangan: finalScore >= 70 ? 'LULUS' : 'TIDAK LULUS', 
      detail: detailJawaban
    };

    try { fetch(GOOGLE_SCRIPT_WEB_APP_URL, { method: 'POST', mode: 'no-cors', body: JSON.stringify(payload) }); } catch (e) {}
    setTimeout(() => setView('result'), 2000);
  }, [answers, quizData, actualStartTime, user.email, user.namaLengkap, attemptCount]);

  useEffect(() => { submitRef.current = handleSubmit; }, [handleSubmit]);

  // ==============================================================
  // KONTROL ALUR
  // ==============================================================
  if (!location.state || !location.state.user) {
    return <Navigate to="/" replace />;
  }

  const startQuiz = () => {
    try { const elem = document.documentElement; if (elem.requestFullscreen) { elem.requestFullscreen(); } } catch (e) {}
    
    // Set Waktu Mulai Asli & Simpan ke Memory dan Server
    const realStartTime = getLocalTime();
    setActualStartTime(realStartTime);
    localStorage.setItem('se2026_starttime_' + user.email, realStartTime);

    try { fetch(GOOGLE_SCRIPT_WEB_APP_URL, { method: 'POST', mode: 'no-cors', body: JSON.stringify({ action: "mulai_sesi", email: user.email, waktu_mulai: realStartTime }) }); } catch(e){}
    
    let target = Date.now() + (jadwalServer.durasi * 60 * 1000);
    localStorage.setItem('se2026_endtime_' + user.email, target.toString());
    
    setEndTimeTarget(target);
    setView('quiz');
  };

  const handleKeluar = () => { 
    window.history.replaceState(null, null, '/');
    navigate('/', { replace: true, state: null }); 
  };

  // ==========================================
  // RENDER VIEWS
  // ==========================================
  if (view === 'instructions') {
    return (
      <div className="min-h-[100dvh] w-screen flex items-center justify-center p-3 sm:p-4 py-6 sm:py-10 relative bg-transparent">
        <div className="max-w-[650px] w-full bg-white/95 backdrop-blur-xl rounded-[24px] sm:rounded-[32px] animate-fade-up border border-white shadow-2xl flex flex-col relative">
          <div className="p-4 sm:p-6 border-b border-slate-100 text-center bg-white rounded-t-[24px] sm:rounded-t-[32px] relative">
            <button onClick={handleKeluar} className="absolute right-3 top-4 sm:right-5 sm:top-5 p-2 bg-slate-50 hover:bg-red-50 text-slate-400 hover:text-red-500 transition-colors rounded-xl flex items-center gap-1 sm:gap-2 text-[9px] sm:text-[10px] font-black uppercase tracking-widest border border-slate-200"><LogOut size={12} /> Keluar</button>
            <BookOpen className="w-8 h-8 sm:w-10 sm:h-10 text-orange-500 mx-auto mb-2 sm:mb-3" />
            <h1 className="text-lg sm:text-xl font-black text-slate-800 tracking-tight uppercase">Instruksi Pengerjaan</h1>
            <p className="text-slate-500 mt-2 text-xs font-medium leading-relaxed max-w-md mx-auto">Selamat datang di Uji Kompetensi Calon Mitra Tambahan 2026,<br/><span className="font-black text-orange-600 text-sm">{user.namaLengkap || user.email}</span></p>
          </div>
          <div className="p-4 sm:p-6 space-y-3 sm:space-y-4 flex flex-col">
             <div className="grid grid-cols-2 gap-2 sm:gap-3">
                <div className="bg-gradient-to-br from-orange-500 to-orange-600 text-white p-3 sm:p-4 rounded-[16px] sm:rounded-[20px] flex items-center gap-2 sm:gap-3 shadow-lg shadow-orange-200">
                   <Clock className="w-6 h-6 sm:w-8 sm:h-8 opacity-80" />
                   <div><p className="text-[8px] sm:text-[9px] uppercase font-black opacity-80 tracking-widest leading-none mb-1">Durasi</p><p className="text-base sm:text-xl font-black leading-none">{jadwalServer.durasi} Menit</p></div>
                </div>
                <div className="bg-gradient-to-br from-[#facc15] to-[#eab308] text-slate-900 p-3 sm:p-4 rounded-[16px] sm:rounded-[20px] flex items-center gap-2 sm:gap-3 shadow-lg shadow-yellow-200">
                   <Database className="w-6 h-6 sm:w-8 sm:h-8 opacity-80" />
                   <div><p className="text-[8px] sm:text-[9px] uppercase font-black opacity-80 tracking-widest leading-none mb-1">Soal</p><p className="text-base sm:text-xl font-black leading-none">{quizData.length} Butir</p></div>
                </div>
             </div>
             <div className="bg-slate-50 p-4 sm:p-5 rounded-[16px] sm:rounded-[24px] border border-slate-200 space-y-2 sm:space-y-3">
                <div className="flex gap-2.5 sm:gap-3"><div className="mt-0.5"><Lock className="text-orange-500 w-3.5 h-3.5 sm:w-4 sm:h-4" /></div><div><p className="text-[11px] sm:text-xs font-black text-slate-700">Mode Layar Terkunci</p><p className="text-[9px] sm:text-[11px] text-slate-500 font-medium leading-snug">Sistem meminta akses fullscreen untuk kenyamanan.</p></div></div>
                <div className="flex gap-2.5 sm:gap-3"><div className="mt-0.5"><ShieldAlert className="text-red-500 w-3.5 h-3.5 sm:w-4 sm:h-4" /></div><div><p className="text-[11px] sm:text-xs font-black text-slate-700">Dilarang Salin Data</p><p className="text-[9px] sm:text-[11px] text-slate-500 font-medium leading-snug">Fitur screenshot & copy-paste dinonaktifkan.</p></div></div>
                <div className="flex gap-2.5 sm:gap-3"><div className="mt-0.5"><AlertTriangle className="text-orange-600 w-3.5 h-3.5 sm:w-4 sm:h-4" /></div><div><p className="text-[11px] sm:text-xs font-black text-orange-600">Sistem Deteksi Aktivitas</p><p className="text-[9px] sm:text-[11px] text-slate-600 font-bold leading-snug">Batas toleransi keluar aplikasi/notif adalah 10 kali.</p></div></div>
                <div className="flex gap-2.5 sm:gap-3"><div className="mt-0.5"><CheckCircle2 className="text-blue-500 w-3.5 h-3.5 sm:w-4 sm:h-4" /></div><div><p className="text-[11px] sm:text-xs font-black text-slate-700">Hanya 1 Kali Percobaan</p><p className="text-[9px] sm:text-[11px] text-slate-500 font-medium leading-snug">Ujian bersifat final setelah dikirim.</p></div></div>
             </div>
          </div>
          <div className="p-4 sm:p-6 pt-0">
            {isSyncing ? (
               <div className="w-full bg-slate-100 text-slate-500 font-black py-3.5 sm:py-4 rounded-[14px] sm:rounded-2xl flex justify-center items-center gap-2 uppercase tracking-widest text-[10px] sm:text-xs border border-slate-200">
                   <Loader2 size={14} className="animate-spin text-orange-500"/> Memverifikasi Sesi...
               </div>
            ) : (
               <button onClick={startQuiz} className="w-full bg-[#1A1A1B] font-black py-3.5 sm:py-4 rounded-[14px] sm:rounded-2xl shadow-xl active:scale-95 text-white flex justify-center items-center gap-2 uppercase tracking-widest text-[10px] sm:text-xs transition-all">SAYA MENGERTI, MULAI UJIAN <ArrowRight size={14}/></button>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (view === 'saving') {
    return (
      <div className="h-[100dvh] flex flex-col items-center justify-center relative bg-transparent">
        <img src={loadingLogo} className="w-16 h-16 sm:w-20 sm:h-20 mb-6 transition-all duration-300 object-contain drop-shadow-md" alt="Logo" onError={(e) => e.target.style.display = 'none'} />
        <Loader2 className="w-8 h-8 sm:w-10 sm:h-10 animate-spin text-orange-500 mb-4"/>
        <p className="font-black text-slate-500 uppercase tracking-widest text-[10px] sm:text-xs">Menyimpan Hasil...</p>
      </div>
    );
  }

  if (view === 'quiz') {
    const q = quizData[currentQuestion];
    if(!q) return <div className="h-[100dvh] flex items-center justify-center text-slate-400 font-bold text-sm">Memuat data soal...</div>;
    
    return (
      <div className="h-[100dvh] w-screen flex flex-col font-sans select-none relative overflow-hidden bg-transparent">
        {appModal.show && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-[24px] max-w-sm w-full p-6 sm:p-8 text-center animate-scale-in shadow-2xl">
              <AlertTriangle className="w-10 h-10 sm:w-12 sm:h-12 text-orange-500 mx-auto mb-4" />
              <h3 className="font-bold text-base sm:text-lg mb-2">{appModal.title}</h3>
              <p className="text-slate-500 text-xs sm:text-sm mb-6">{appModal.message}</p>
              {appModal.type === 'alert' ? (
                <button onClick={() => setAppModal({ show: false })} className="w-full bg-[#1A1A1B] text-white font-bold py-3 rounded-xl uppercase tracking-widest text-[10px] sm:text-xs">Kembali</button>
              ) : (
                <div className="flex gap-3">
                  <button onClick={() => setAppModal({ show: false })} className="flex-1 bg-slate-100 font-bold py-3 rounded-xl text-slate-700 uppercase tracking-widest text-[10px] sm:text-xs">Batal</button>
                  <button onClick={() => { setAppModal({ show: false }); handleSubmit(); }} className="flex-1 bg-orange-500 font-bold py-3 rounded-xl text-white uppercase tracking-widest text-[10px] sm:text-xs">Ya, Kirim</button>
                </div>
              )}
            </div>
          </div>
        )}

        {showWarningModal && (
          <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-md z-[100] flex items-center justify-center p-4">
            <div className="bg-white rounded-[24px] max-w-sm w-full p-6 sm:p-8 text-center animate-scale-in shadow-2xl">
              <ShieldAlert className="w-12 h-12 sm:w-16 sm:h-16 text-orange-500 mx-auto mb-4 sm:mb-5" />
              <h3 className="font-black text-lg sm:text-xl mb-2 sm:mb-3 text-[#1A1A1B] uppercase tracking-tight">Gangguan Terdeteksi</h3>
              <p className="text-slate-600 mb-5 sm:mb-6 text-xs sm:text-sm font-bold leading-relaxed">Sistem mendeteksi Anda keluar dari halaman atau menerima notifikasi/panggilan. Pelanggaran ke-{warnings}/10.</p>
              <button onClick={() => setShowWarningModal(false)} className="w-full bg-[#1A1A1B] text-white font-black py-3 sm:py-4 rounded-xl hover:bg-black uppercase tracking-widest text-[10px] sm:text-xs transition-colors">Lanjutkan Ujian</button>
            </div>
          </div>
        )}

        <header className="bg-white/90 backdrop-blur-md px-3 sm:px-6 h-[60px] sm:h-[70px] flex items-center justify-between z-40 shrink-0 border-b border-slate-200 shadow-sm">
          <div className="flex items-center gap-2 sm:gap-3 flex-1 mr-2">
            <img src={LOGO_BPS} className="w-7 h-7 sm:w-9 sm:h-9 object-contain drop-shadow-sm shrink-0" alt="Logo" />
            <div className="font-black text-[9px] sm:text-sm tracking-tight text-slate-800 uppercase leading-tight">Uji Kompetensi Calon Mitra Tambahan 2026</div>
          </div>
          <div className="flex gap-2 sm:gap-3 items-center shrink-0">
             <div className="hidden md:flex items-center gap-2 bg-slate-50 border border-slate-100 px-4 py-2 rounded-full shadow-sm">
                <User className="w-4 h-4 text-orange-500" />
                <span className="text-xs font-black uppercase tracking-wider text-slate-700 truncate max-w-[150px]">{user.namaLengkap || user.email}</span>
             </div>
             <div className={`font-mono text-xs sm:text-base font-black px-4 sm:px-6 py-1.5 sm:py-2 rounded-full shadow-lg border-2 flex items-center gap-1.5 sm:gap-2 transition-all ${timeLeft < 300 ? 'bg-red-500 text-white border-red-600 animate-pulse' : 'bg-gradient-to-r from-[#ffe16f] to-[#facc15] text-[#1A1A1B] border-yellow-400'}`}>
                <Clock size={14} className="sm:w-4 sm:h-4"/>{formatTime(timeLeft)}
             </div>
          </div>
        </header>

        <main className="flex-1 flex flex-col md:flex-row max-w-[1200px] w-full mx-auto p-2 sm:p-3 md:p-5 gap-2 sm:gap-4 min-h-0">
          <button onClick={() => setShowMap(!showMap)} className="md:hidden w-full bg-white p-2.5 sm:p-3.5 rounded-[14px] sm:rounded-2xl font-black text-[10px] sm:text-xs text-slate-700 shadow-sm border border-slate-100 uppercase tracking-widest flex items-center justify-center gap-2 shrink-0">
            {showMap ? <XCircle size={14}/> : <BarChart3 size={14}/>} {showMap ? "Tutup Peta Soal" : "Navigasi Peta Soal"}
          </button>

          <div className={`flex-1 flex-col min-h-0 ${showMap ? 'hidden md:flex' : 'flex'}`}>
            <div className="bg-white/90 backdrop-blur-md rounded-[16px] sm:rounded-[24px] flex-1 flex flex-col shadow-sm sm:shadow-lg border border-white overflow-hidden relative min-h-0">
              <div className="px-3 sm:px-5 py-2 sm:py-3 border-b border-slate-100 bg-white flex justify-between items-center shrink-0">
                <span className="text-[9px] sm:text-[10px] font-black text-slate-500 uppercase tracking-widest bg-slate-50 border border-slate-200 px-2.5 sm:px-3 py-1 rounded-full shadow-sm">Soal {currentQuestion + 1}/{quizData.length}</span>
                {answers[q?.id] && <button onClick={() => setAnswers(prev => { const n = {...prev}; delete n[q?.id]; return n; })} className="text-[9px] sm:text-[10px] font-black text-red-400 hover:text-red-600 hover:bg-red-50 px-2 py-1 rounded uppercase tracking-widest flex items-center gap-1 sm:gap-1.5 transition-colors"><Trash2 className="w-3 h-3 sm:w-3.5 sm:h-3.5"/> Batal</button>}
              </div>
              
              <div className="flex-1 overflow-y-auto p-3 sm:p-4 md:p-6 custom-scrollbar">
                <h2 className="text-[13px] sm:text-sm md:text-base font-bold text-slate-800 mb-3 sm:mb-4 md:mb-6 whitespace-pre-wrap leading-relaxed">{q?.text || "Soal tidak tersedia"}</h2>
                <div className="space-y-2 md:space-y-3">
                  {(q?.shuffledOptions || []).map((opt, index) => {
                    if (!opt) return null; 
                    const uiLabel = String.fromCharCode(65 + index); 
                    const isSelected = answers[q?.id] === opt?.key; 
                    return (
                      <label key={opt?.key || index} onClick={() => setAnswers({...answers, [q?.id]: opt?.key})} className={`flex items-start sm:items-center p-2.5 sm:p-3 md:p-4 rounded-[12px] sm:rounded-[16px] cursor-pointer border-2 transition-all duration-200 ${isSelected ? 'border-orange-500 bg-orange-50 shadow-sm transform sm:translate-x-1' : 'border-slate-100 bg-white hover:border-orange-200 hover:bg-orange-50/30'}`}>
                        <div className={`w-4 h-4 sm:w-5 sm:h-5 rounded-full border-2 mr-2 sm:mr-3 flex items-center justify-center shrink-0 transition-colors mt-0.5 sm:mt-0 ${isSelected ? 'border-orange-500 bg-orange-500' : 'border-slate-300 bg-slate-50'}`}>{isSelected && <div className="w-1.5 h-1.5 bg-white rounded-full"></div>}</div>
                        <span className={`font-black mr-1.5 sm:mr-2 text-[11px] sm:text-xs md:text-sm pt-0.5 sm:pt-0 ${isSelected ? 'text-orange-700' : 'text-slate-400'}`}>{uiLabel}.</span>
                        <span className={`text-[12px] sm:text-[13px] md:text-sm font-semibold leading-snug ${isSelected ? 'text-orange-900' : 'text-slate-700'}`}>{opt?.text || "-"}</span>
                      </label>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="flex justify-between mt-2 sm:mt-4 shrink-0 gap-2 sm:gap-3">
              <button onClick={() => setCurrentQuestion(p => Math.max(0, p - 1))} disabled={currentQuestion === 0} className="px-4 sm:px-6 py-3 sm:py-4 bg-white border border-slate-200 rounded-[12px] sm:rounded-xl font-black text-slate-600 shadow-sm disabled:opacity-40 uppercase tracking-widest text-[9px] sm:text-[10px] md:text-xs flex-1 md:flex-none transition-all active:scale-95 flex items-center justify-center"><ChevronLeft size={14} className="mr-1" /> Kembali</button>
              
              {currentQuestion === quizData.length - 1 ? (
                <button onClick={() => {
                  const unanswered = quizData.length - Object.keys(answers).length;
                  if (unanswered > 0) setAppModal({ show: true, type: 'alert', title: 'Belum Selesai', message: `Harap selesaikan semua jawaban. Masih ada ${unanswered} soal kosong.`});
                  else setAppModal({ show: true, type: 'confirm', title: 'Kirim Jawaban', message: 'Anda tidak dapat mengubah jawaban lagi. Kirim sekarang?'});
                }} className="px-4 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-orange-500 to-orange-600 font-black rounded-[12px] sm:rounded-xl shadow-md shadow-orange-200 text-white uppercase tracking-widest text-[9px] sm:text-[10px] md:text-xs flex-1 md:flex-none transition-all active:scale-95 flex items-center justify-center">Kirim</button>
              ) : (
                <button onClick={() => setCurrentQuestion(p => Math.min(quizData.length - 1, p + 1))} className="px-4 sm:px-8 py-3 sm:py-4 bg-[#1A1A1B] text-white font-black rounded-[12px] sm:rounded-xl shadow-md uppercase tracking-widest text-[9px] sm:text-[10px] md:text-xs flex-1 md:flex-none transition-all active:scale-95 flex items-center justify-center">Lanjut <ChevronRight size={14} className="ml-1" /></button>
              )}
            </div>
          </div>

          <div className={`${showMap ? 'flex' : 'hidden'} md:flex w-full md:w-[300px] flex-shrink-0 flex-col min-h-0 h-max md:h-full flex`}>
            <div className="bg-white/90 backdrop-blur-md rounded-[16px] sm:rounded-[24px] p-4 sm:p-5 flex flex-col h-full shadow-sm sm:shadow-lg border border-white">
              <div className="font-black text-[9px] sm:text-[11px] uppercase tracking-widest text-slate-400 mb-3 sm:mb-4 flex items-center gap-1.5 sm:gap-2 border-b border-slate-100 pb-2.5 sm:pb-3"><BarChart3 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-orange-500"/> Navigasi Soal</div>
              <div className="grid grid-cols-5 md:grid-cols-4 lg:grid-cols-5 gap-1.5 sm:gap-2 overflow-y-auto flex-1 content-start custom-scrollbar pr-1 pb-2">
                {(quizData || []).map((item, idx) => {
                   if (!item) return null; 
                   const isAnswered = answers[item?.id] !== undefined;
                   const isCurrent = currentQuestion === idx;
                   let btnClass = 'border-slate-200 bg-white text-slate-400 hover:border-slate-300';
                   
                   if (isCurrent) btnClass = 'border-orange-500 bg-orange-500 text-white shadow-sm scale-105 z-10';
                   else if (isAnswered) btnClass = 'border-[#1A1A1B] bg-[#1A1A1B] text-white font-black';
                   
                   return <button key={item?.id || idx} onClick={() => { setCurrentQuestion(idx); if(window.innerWidth < 768) setShowMap(false); }} className={`h-9 sm:h-11 md:h-12 text-[10px] sm:text-xs font-black rounded-[10px] sm:rounded-[14px] border-2 transition-all duration-200 flex items-center justify-center ${btnClass}`}>{idx + 1}</button>;
                })}
              </div>
              <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-slate-100 grid grid-cols-2 gap-2">
                <div className="flex items-center gap-1.5 sm:gap-2"><div className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-[#1A1A1B]"></div><span className="text-[8px] sm:text-[9px] font-black text-slate-500 uppercase tracking-widest">Terjawab</span></div>
                <div className="flex items-center gap-1.5 sm:gap-2"><div className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full border-2 border-slate-300 bg-white"></div><span className="text-[8px] sm:text-[9px] font-black text-slate-500 uppercase tracking-widest">Kosong</span></div>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (view === 'result') {
    return (
      <div className="h-[100dvh] w-screen flex items-center justify-center p-4 relative bg-transparent">
        <div className="max-w-[450px] w-full bg-white/95 backdrop-blur-3xl rounded-[32px] sm:rounded-[40px] p-6 sm:p-10 text-center animate-fade-up border border-white shadow-2xl">
          <div className="w-20 h-20 sm:w-24 sm:h-24 bg-emerald-50 rounded-[24px] sm:rounded-[32px] flex items-center justify-center mx-auto mb-4 sm:mb-6 shadow-sm">
            <CheckCircle className="w-10 h-10 sm:w-12 sm:h-12 text-emerald-500" />
          </div>
          
          <h1 className="text-xl sm:text-3xl font-black text-slate-800 mb-2 sm:mb-3 tracking-tight">Tahap 1 Terkirim!</h1>
          
          <p className="text-slate-500 text-xs sm:text-sm mb-6 sm:mb-8 font-medium leading-relaxed">
            Terima kasih, jawaban Uji Kompetensi Anda telah berhasil diamankan di server BPS.
            <br/><br/>
            <span className="font-bold text-red-500 bg-red-50 px-3 py-1.5 rounded-lg border border-red-100 inline-block">
              ⚠️ JANGAN KELUAR DULU!
            </span>
            <br/>Silakan klik tombol di bawah ini untuk melanjutkan ke tahap berikutnya.
          </p>

          <div className="text-left bg-slate-50 p-4 sm:p-6 rounded-[16px] sm:rounded-[24px] mb-6 sm:mb-8 border border-slate-100">
             <div className="flex justify-between border-b border-slate-200/50 pb-2 sm:pb-3 mb-2 sm:mb-3 items-center">
               <span className="text-[9px] sm:text-[10px] font-black text-slate-400 uppercase tracking-widest">Peserta</span>
               <span className="text-[10px] sm:text-xs font-black text-slate-800 truncate pl-2">{user.email}</span>
             </div>
             <div className="flex justify-between items-center">
               <span className="text-[9px] sm:text-[10px] font-black text-slate-400 uppercase tracking-widest">Waktu Selesai </span>
               <span className="text-[10px] sm:text-xs font-black text-slate-800">{getLocalTime().split(' ')[1]} WIB</span>
             </div>
          </div>
          
          {/* Tombol Lanjut dengan efek kedap-kedip (pulse) tipis agar menarik perhatian */}
          <button 
            onClick={() => navigate('/wawancara', { state: location.state })} 
            className="w-full bg-[#1A1A1B] hover:bg-black text-[#facc15] font-black py-4 rounded-[14px] sm:rounded-2xl flex justify-center gap-2 sm:gap-3 items-center uppercase tracking-widest text-[10px] sm:text-xs transition-all shadow-xl hover:scale-[1.02]"
          >
             Lanjut Tahap 2: Tes Wawancara <ArrowRight size={16}/>
          </button>
        </div>
      </div>
    );
  }

  // if (view === 'result') {
  //   return (
  //     <div className="h-[100dvh] w-screen flex items-center justify-center p-4 relative bg-transparent">
  //       <div className="max-w-[450px] w-full bg-white/95 backdrop-blur-3xl rounded-[32px] sm:rounded-[40px] p-6 sm:p-10 text-center animate-fade-up border border-white shadow-2xl">
  //         <div className="w-20 h-20 sm:w-24 sm:h-24 bg-emerald-50 rounded-[24px] sm:rounded-[32px] flex items-center justify-center mx-auto mb-4 sm:mb-6 shadow-sm"><CheckCircle className="w-10 h-10 sm:w-12 sm:h-12 text-emerald-500" /></div>
  //         <h1 className="text-xl sm:text-3xl font-black text-slate-800 mb-2 sm:mb-3 tracking-tight">Berhasil Terkirim!</h1>
  //         <p className="text-slate-500 text-xs sm:text-sm mb-6 sm:mb-8 font-medium leading-relaxed">Terima kasih telah mengikuti Uji Kompetensi Mitra Tambahan 2026. Bukti pengerjaan telah diamankan.</p>
  //         <div className="text-left bg-slate-50 p-4 sm:p-6 rounded-[16px] sm:rounded-[24px] mb-6 sm:mb-8 border border-slate-100">
  //            <div className="flex justify-between border-b border-slate-200/50 pb-2 sm:pb-3 mb-2 sm:mb-3 items-center"><span className="text-[9px] sm:text-[10px] font-black text-slate-400 uppercase tracking-widest">Peserta</span><span className="text-[10px] sm:text-xs font-black text-slate-800 truncate pl-2">{user.email}</span></div>
  //            <div className="flex justify-between items-center"><span className="text-[9px] sm:text-[10px] font-black text-slate-400 uppercase tracking-widest">Waktu Selesai</span><span className="text-[10px] sm:text-xs font-black text-slate-800">{getLocalTime().split(' ')[1]} WIB</span></div>
  //         </div>
  //         <button onClick={handleKeluar} className="w-full bg-[#1A1A1B] hover:bg-black text-white font-black py-3.5 sm:py-4 rounded-[14px] sm:rounded-2xl flex justify-center gap-2 sm:gap-3 items-center uppercase tracking-widest text-[10px] sm:text-xs transition-all shadow-xl">Ke Beranda <LogOut size={14}/></button>
  //       </div>
  //     </div>
  //   );
  // }

  return null;
}