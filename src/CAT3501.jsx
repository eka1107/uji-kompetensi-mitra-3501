import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { 
  ShieldAlert, User, CheckCircle, AlertTriangle, CheckCircle2, XCircle,
  LogOut, ChevronRight, ChevronLeft, Loader2, Trash2, ArrowRight, Activity,
  BookOpen, AlertCircle, Eye, EyeOff, CalendarClock, Lock, BarChart3, Clock
} from 'lucide-react';

import AdminDashboard from './admin.jsx';

// GANTI DENGAN URL DEPLOY APPS SCRIPT YANG BARU!
const GOOGLE_SCRIPT_WEB_APP_URL = "https://script.google.com/macros/s/AKfycbzLRkW2qOUDNmuoKibKV5_KsiCOissAhr0Us9w6gi52cbznFaO3beVXwMapUsANAfRj/exec"; 
const LOGO_BPS = "https://upload.wikimedia.org/wikipedia/commons/2/28/Lambang_Badan_Pusat_Statistik_%28BPS%29_Indonesia.svg";

// --- HELPER UNTUK ACAK ARRAY (SOAL DAN OPSI) ---
function shuffleArray(array) {
  const newArr = [...array];
  for (let i = newArr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArr[i], newArr[j]] = [newArr[j], newArr[i]];
  }
  return newArr;
}

const getLocalTime = () => new Date().toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' });

const formatTime = (seconds) => {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
};

// --- CSS GLOBAL & GRADASI PINTARLY ---
const AppStylesAndBackground = () => (
  <>
    <style>{`
      @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800&family=Inter:wght@400;500;600&display=swap');
      :root { --black-charcoal: #1A1A1B; --pintarly-yellow: #ffe16f; --se-primary: #ea580c; }
      body { font-family: 'Outfit', 'Inter', sans-serif; overflow: hidden; margin: 0; background-color: #fff9f0; }
      ::-webkit-scrollbar { width: 6px; height: 6px; }
      ::-webkit-scrollbar-track { background: transparent; }
      ::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.1); border-radius: 10px; }
      .animate-fade-up { animation: fadeInUp 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
      .animate-scale-in { animation: scaleIn 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
      .hover-slide-right:hover { transform: translateX(4px); }
      .hover-scale-up:hover { transform: translateY(-2px); box-shadow: 0 8px 20px -6px rgba(0, 0, 0, 0.15); }
      .pintarly-glass { background: rgba(255, 255, 255, 0.9); backdrop-filter: blur(24px); border: 1px solid rgba(255, 255, 255, 0.8); box-shadow: 0 4px 30px rgba(0, 0, 0, 0.05); }
      .pintarly-input { background: rgba(255, 255, 255, 0.8); border: 1px solid rgba(0, 0, 0, 0.08); }
      .pintarly-input:focus { background: #ffffff; border-color: var(--se-primary); box-shadow: 0 0 0 3px rgba(234, 88, 12, 0.15); }
      @keyframes fadeInUp { from { opacity: 0; transform: translateY(15px); } to { opacity: 1; transform: translateY(0); } }
      @keyframes scaleIn { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
    `}</style>
    {/* Gradasi Pintarly Kombinasi Kuning Oranye SE */}
    <div className="fixed inset-0 z-[-1] overflow-hidden bg-gradient-to-br from-orange-50 via-yellow-50 to-orange-100 pointer-events-none">
      <div className="absolute inset-0 w-full h-full blur-[100px] opacity-60">
        <div className="absolute w-[60%] h-[60%] top-[10%] left-[20%] bg-[radial-gradient(circle_at_center,rgba(250,204,21,0.6)_0,transparent_50%)] mix-blend-multiply animate-pulse"></div>
        <div className="absolute w-[60%] h-[60%] top-[40%] right-[10%] bg-[radial-gradient(circle_at_center,rgba(249,115,22,0.4)_0,transparent_50%)] mix-blend-multiply"></div>
      </div>
    </div>
  </>
);

// ==========================================
// 1. KOMPONEN LOGIN ADMIN (/admin)
// ==========================================
export const AdminLogin = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (sessionStorage.getItem('adminAuth_SE2026')) navigate('/dashboard');
  }, [navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(`${GOOGLE_SCRIPT_WEB_APP_URL}?action=init&cb=${new Date().getTime()}`);
      const data = await res.json();
      if (data.admin && data.admin[0].email === email && data.admin[0].password === password) {
        sessionStorage.setItem('adminAuth_SE2026', 'true');
        navigate('/dashboard');
      } else {
        setLoginError('Akses Ditolak! Kredensial tidak valid.');
      }
    } catch(err) { setLoginError('Koneksi server gagal.'); }
    setLoading(false);
  };

  return (
    <div className="h-[100svh] w-screen flex flex-col relative font-sans">
      {/* Header Form Admin */}
      <header className="bg-gradient-to-r from-[#ffe16f] to-[#facc15] shadow-md px-4 md:px-6 h-[70px] flex items-center justify-between shrink-0 z-40 relative border-b border-yellow-400 text-[#1A1A1B]">
        <div className="flex items-center gap-3">
          <img src={LOGO_BPS} alt="BPS" className="h-8 w-auto" />
          <div className="hidden sm:block">
            <div className="font-bold text-base md:text-lg leading-tight tracking-tight uppercase">Dashboard Uji Kompetensi</div>
            <div className="text-[10px] font-bold uppercase tracking-widest mt-0.5 opacity-80">BPS Kabupaten Pacitan</div>
          </div>
        </div>
      </header>

      <div className="flex-1 flex items-center justify-center p-4">
        <div className="max-w-[400px] w-full bg-white/90 backdrop-blur-3xl rounded-[32px] p-8 md:p-10 relative overflow-hidden animate-fade-up border border-orange-100 shadow-2xl">
          <div className="mb-8 text-center relative flex flex-col items-center">
            {/* Logo BPS di Box Login Admin */}
            <div className="w-20 h-20 bg-orange-50 rounded-full flex items-center justify-center mb-4 shadow-sm border border-orange-100">
              <img src={LOGO_BPS} alt="BPS" className="w-12 h-12 object-contain drop-shadow-sm" />
            </div>
            <h1 className="text-[22px] font-black text-slate-800 mb-1.5 uppercase">Otoritas Panitia</h1>
            <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest mt-1 bg-slate-100 px-3 py-1 rounded-full">Sensus Ekonomi 2026</p>
          </div>
          <form onSubmit={handleLogin} className="space-y-4">
            {loginError && <div className="bg-red-50 text-red-600 p-3 rounded-xl text-xs flex items-center gap-2 font-bold"><AlertCircle className="w-4 h-4 shrink-0"/>{loginError}</div>}
            <input required type="email" placeholder="Email Administrator" value={email} onChange={e => setEmail(e.target.value)} className="w-full px-4 py-3 text-sm pintarly-input rounded-xl font-medium" />
            <div className="relative">
              <input required type={showPassword ? "text" : "password"} placeholder="Kata Sandi Keamanan" value={password} onChange={e => setPassword(e.target.value)} className="w-full px-4 py-3 text-sm pintarly-input rounded-xl pr-12 font-medium" />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-orange-500 transition-colors"><EyeOff className="w-4 h-4" /></button>
            </div>
            <button type="submit" disabled={loading} className="w-full bg-[#1A1A1B] hover:bg-black text-white font-black py-4 rounded-xl flex justify-center items-center gap-2 shadow-lg hover-scale-up transition-all uppercase tracking-widest text-xs mt-2">
              {loading ? <Loader2 className="w-5 h-5 animate-spin"/> : <Lock className="w-4 h-4" />} Buka Dashboard
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};


// ==========================================
// 2. KOMPONEN APLIKASI PESERTA
// ==========================================
export const ParticipantApp = () => {
  const [view, setView] = useState('init'); 
  const [user, setUser] = useState({ email: '', token: '', namaLengkap: '' });
  
  const [loginError, setLoginError] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [emailWarning, setEmailWarning] = useState('');
  const [loadingLogo, setLoadingLogo] = useState(LOGO_BPS);
  
  const [accounts, setAccounts] = useState([]);
  const [quizData, setQuizData] = useState([]);
  const [adminData, setAdminData] = useState([]);
  
  const [answers, setAnswers] = useState({});
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [timeLeft, setTimeLeft] = useState(45 * 60); 
  
  const [attemptCount, setAttemptCount] = useState(1);
  const [startTime, setStartTime] = useState('');
  const [warnings, setWarnings] = useState(0);
  const [showWarningModal, setShowWarningModal] = useState(false);
  
  const [appModal, setAppModal] = useState({ show: false, type: '', message: '', title: '' });
  const [jadwalServer, setJadwalServer] = useState({ mulai: 0, selesai: 0, durasi: 45 });
  const [showMap, setShowMap] = useState(false); 

  const submitRef = useRef(null);

  const checkJadwal = (mulai, selesai) => {
    const now = new Date().getTime();
    if (mulai === 0 && selesai === 0) return 'buka'; 
    if (now < mulai) return 'belum_mulai';
    if (now > selesai) return 'sudah_selesai';
    return 'buka';
  };

  useEffect(() => {
    let logoTimer;
    if (view === 'init' || view === 'fetching_soal' || view === 'saving') {
      logoTimer = setInterval(() => {
        setLoadingLogo(prev => prev === LOGO_BPS ? '/logo.png' : LOGO_BPS);
      }, 750);
    }
    return () => clearInterval(logoTimer);
  }, [view]);

  useEffect(() => {
    const fetchInitData = async () => {
      try {
        const response = await fetch(`${GOOGLE_SCRIPT_WEB_APP_URL}?action=init&cb=${new Date().getTime()}`);
        const data = await response.json();
        
        const waktuMulai = Number(data.jadwal.mulai) || 0;
        const waktuSelesai = Number(data.jadwal.selesai) || 0;
        const durasi = Number(data.jadwal.durasi) || 45;

        setJadwalServer({ mulai: waktuMulai, selesai: waktuSelesai, durasi: durasi });
        setTimeLeft(durasi * 60); 
        
        setAccounts(data.akun);
        setAdminData(data.nilai);

        const formattedQuestions = data.soal.filter(row => row.soal && row.jawaban).map((row, index) => {
          const rawOptions = [
            { key: 'A', text: row.a != null ? String(row.a) : "" },
            { key: 'B', text: row.b != null ? String(row.b) : "" },
            { key: 'C', text: row.c != null ? String(row.c) : "" },
            { key: 'D', text: row.d != null ? String(row.d) : "" },
            { key: 'E', text: row.e != null ? String(row.e) : "" }
          ].filter(o => o.text.trim() !== '' && o.text.trim() !== 'null');

          return {
            id: `q_${index}`, 
            text: String(row.soal), 
            shuffledOptions: shuffleArray(rawOptions), 
            answer: String(row.jawaban).trim().toUpperCase()
          };
        });
        setQuizData(shuffleArray(formattedQuestions)); 

        const statusJadwal = checkJadwal(waktuMulai, waktuSelesai);
        if (statusJadwal !== 'buka') setView(statusJadwal);
        else setView('login');
      } catch (error) { setView('error_init'); }
    };
    fetchInitData();
  }, []);

  const notifyServerSessionActive = (email) => {
    const payload = { action: "mulai_sesi", email: email, waktu_mulai: getLocalTime() };
    try { fetch(GOOGLE_SCRIPT_WEB_APP_URL, { method: 'POST', mode: 'no-cors', body: JSON.stringify(payload) }); } catch(e){}
  };

  useEffect(() => {
    if (view === 'quiz') {
      const handleContextMenu = (e) => { e.preventDefault(); alert("Fungsi klik kanan dinonaktifkan."); };
      const handleCopy = (e) => { e.preventDefault(); alert("Fungsi Salin (Copy) dinonaktifkan."); };
      
      const handleKeyDown = (e) => {
        if (e.key === 'PrintScreen' || (e.ctrlKey && e.key === 'p') || e.key === 'F11') {
          e.preventDefault();
          try { navigator.clipboard.writeText(''); } catch(err){}
          alert('Pelanggaran! Fitur screenshot atau print diblokir.');
        }
      };

      const handleFullscreenChange = () => {
        if (!document.fullscreenElement) {
           triggerCheatWarning("Keluar dari Mode Layar Penuh terdeteksi!");
        }
      };

      const handleWindowBlur = () => {
        triggerCheatWarning("Sistem mendeteksi Anda membuka aplikasi atau jendela lain!");
      };

      const triggerCheatWarning = (msg) => {
        setWarnings(prev => {
          const newWarnings = prev + 1;
          if (newWarnings >= 3) {
            if (submitRef.current) submitRef.current(); 
          } else {
            setAppModal({ show: true, type: 'alert', title: 'Peringatan Sistem!', message: `${msg} Ini peringatan ke-${newWarnings}/3. Jika diulangi, ujian akan diakhiri paksa.` });
          }
          return newWarnings;
        });
      };

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

  useEffect(() => {
    let timer;
    if (view === 'quiz' && timeLeft > 0) {
      timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
    } else if (timeLeft === 0 && view === 'quiz') {
      if (submitRef.current) submitRef.current();
    }
    return () => clearInterval(timer);
  }, [view, timeLeft]);

  const checkEmail = (email) => {
    if (!email) { setEmailWarning(''); return; }
    const exists = accounts.some(acc => String(acc.email).trim().toLowerCase() === String(email).trim().toLowerCase());
    if (!exists) setEmailWarning('Email belum terdaftar di database.');
    else setEmailWarning('');
  };

  const handlePesertaLogin = async (e) => {
    e.preventDefault();
    setLoginError('');

    const statusJadwal = checkJadwal(jadwalServer.mulai, jadwalServer.selesai);
    if (statusJadwal !== 'buka') { setView(statusJadwal); return; }

    if (user.token !== 'BPS2026') { setLoginError('Token ujian tidak valid.'); return; }

    const isValidUser = accounts.find(acc => String(acc.email).trim().toLowerCase() === String(user.email).trim().toLowerCase());

    if (isValidUser) {
      setIsLoggingIn(true);
      const historyAttempts = adminData.filter(row => row.akun && String(row.akun).trim().toLowerCase() === String(user.email).trim().toLowerCase());
      
      if (historyAttempts.length >= 1) {
        setLoginError(`Anda telah menyelesaikan Ujian. Hubungi Panitia jika butuh akses Remedial.`);
        setIsLoggingIn(false); return;
      }

      setUser({ ...user, namaLengkap: isValidUser.nama });
      setAttemptCount(historyAttempts.length + 1);
      setStartTime(getLocalTime());
      setIsLoggingIn(false);
      
      setView('fetching_soal');
      setTimeout(() => { setView('instructions'); }, 1500);
    } else {
      setLoginError('Alamat email tidak terdaftar.');
    }
  };

  const startQuiz = () => {
    try {
      const elem = document.documentElement;
      if (elem.requestFullscreen) { elem.requestFullscreen(); }
    } catch (e) {}
    notifyServerSessionActive(user.email);
    setView('quiz');
  };

  const handleSubmit = useCallback(async () => {
    setView('saving');
    let correct = 0;
    const detailJawaban = [];

    quizData.forEach(q => {
      const userAnswer = answers[q.id] || ""; 
      const isCorrect = userAnswer === q.answer ? 1 : 0;
      if (isCorrect) correct++;
      
      const textJawaban = q.shuffledOptions.find(o => o.key === userAnswer)?.text || "-";
      detailJawaban.push({ soal: q.text, jawaban: textJawaban, nilai: isCorrect });
    });
    
    const finalScore = Math.round((correct / quizData.length) * 100);
    const endTime = getLocalTime();
    
    try { if (document.fullscreenElement) document.exitFullscreen(); } catch (e) {}

    const payload = {
      action: "save_all", waktu_mulai: startTime, waktu_selesai: endTime,
      akun: user.email, skor: finalScore, percobaan: attemptCount, keterangan: finalScore >= 70 ? 'LULUS' : 'TIDAK LULUS', detail: detailJawaban
    };

    if (GOOGLE_SCRIPT_WEB_APP_URL) {
      try { fetch(GOOGLE_SCRIPT_WEB_APP_URL, { method: 'POST', mode: 'no-cors', body: JSON.stringify(payload) }); } catch (e) {}
    }
    setTimeout(() => setView('result'), 1500);
  }, [answers, quizData, startTime, user.email, attemptCount]);

  useEffect(() => { submitRef.current = handleSubmit; }, [handleSubmit]);

  // --- RENDER VIEWS ---
  if (view === 'init') {
    return (
      <div className="h-[100svh] w-screen flex flex-col items-center justify-center relative bg-transparent">
        <img src={loadingLogo} className="w-20 h-20 mb-6 transition-all duration-300 object-contain drop-shadow-md" alt="Logo" onError={(e) => e.target.style.display = 'none'} />
        <Loader2 className="w-8 h-8 animate-spin mb-4 text-orange-500" />
        <h2 className="text-sm font-black animate-fade-up text-slate-500 uppercase tracking-widest">Menyiapkan Sistem...</h2>
      </div>
    );
  }

  if (view === 'belum_mulai' || view === 'sudah_selesai' || view === 'error_init') {
    return (
      <div className="h-[100svh] w-screen flex items-center justify-center p-4 relative">
        <div className="max-w-[420px] w-full pintarly-glass rounded-[32px] p-8 text-center animate-fade-up shadow-2xl">
          <CalendarClock className="w-12 h-12 text-orange-500 mx-auto mb-4" />
          <h1 className="text-2xl font-black text-slate-800 mb-2 uppercase">Portal Ditutup</h1>
          <p className="text-slate-500 text-sm mb-6 font-medium">Akses ke soal ujian Sensus Ekonomi saat ini dikunci oleh sistem Panitia.</p>
          <button onClick={() => window.location.reload()} className="w-full bg-[#1A1A1B] text-white font-bold py-4 rounded-2xl shadow-sm hover-scale-up uppercase tracking-widest text-xs">Coba Muat Ulang</button>
        </div>
      </div>
    );
  }

  if (view === 'login') {
    return (
      <div className="h-[100svh] w-screen flex items-center justify-center p-4 relative">
        <div className="max-w-[400px] w-full pintarly-glass rounded-[32px] p-8 md:p-10 relative animate-fade-up shadow-2xl border border-white">
          <div className="mb-8 text-center flex flex-col items-center">
            <img src={LOGO_BPS} alt="Logo BPS" className="w-16 h-16 mb-4 drop-shadow-sm object-contain" onError={(e) => e.target.style.display = 'none'} />
            <h1 className="text-xl font-black text-[#1A1A1B] mb-1.5 leading-snug uppercase tracking-tight">Tes Kompetensi Mitra</h1>
            <p className="text-slate-500 text-[10px] font-black uppercase mt-1 bg-slate-100/50 px-3 py-1 rounded-full tracking-widest border border-slate-200">Sensus Ekonomi 2026</p>
          </div>
          <form onSubmit={handlePesertaLogin} className="space-y-4">
            {loginError && <div className="bg-red-50 text-red-600 p-3 rounded-xl text-xs flex items-center gap-2 font-bold"><AlertCircle className="w-4 h-4 shrink-0"/>{loginError}</div>}
            <div>
              <input required type="email" placeholder="Alamat Email Terdaftar" value={user.email} onChange={e => setUser({...user, email: e.target.value})} onBlur={e => checkEmail(e.target.value)} className="w-full px-4 py-3.5 text-sm pintarly-input rounded-xl font-medium" />
              {emailWarning && <p className="text-red-500 text-[10px] mt-1.5 font-bold ml-2">{emailWarning}</p>}
            </div>
            <input required type="text" placeholder="TOKEN UJIAN" value={user.token} onChange={e => setUser({...user, token: e.target.value})} className="w-full px-4 py-3.5 text-sm pintarly-input rounded-xl uppercase font-black tracking-[0.2em] text-center" />
            <button type="submit" disabled={isLoggingIn || emailWarning !== ''} className="w-full bg-gradient-to-r from-orange-500 to-orange-400 hover:from-orange-600 hover:to-orange-500 text-white font-black py-4 rounded-xl shadow-lg shadow-orange-200 hover-scale-up uppercase tracking-widest text-xs mt-2 disabled:opacity-50">{isLoggingIn ? "Memverifikasi Identitas..." : "Lanjut ke Instruksi"}</button>
          </form>
        </div>
      </div>
    );
  }

  if (view === 'instructions') {
    return (
      <div className="h-[100svh] w-screen flex items-center justify-center p-3 relative overflow-hidden bg-transparent">
        <div className="max-w-[650px] w-full bg-white/95 backdrop-blur-xl rounded-[32px] animate-fade-up border border-white shadow-2xl flex flex-col max-h-full relative overflow-hidden">
          
          {/* Header Instruksi */}
          <div className="p-6 border-b border-slate-100 text-center shrink-0 bg-white relative">
            <button onClick={() => { setView('login'); setUser({ email: '', token: '', namaLengkap: '' }); }} className="absolute right-5 top-5 p-2 bg-slate-50 hover:bg-red-50 text-slate-400 hover:text-red-500 transition-colors rounded-xl flex items-center gap-2 text-[10px] font-black uppercase tracking-widest border border-slate-200 hover:border-red-200">
              <LogOut size={14} /> Keluar
            </button>
            <BookOpen className="w-10 h-10 text-orange-500 mx-auto mb-3" />
            <h1 className="text-xl font-black text-slate-800 tracking-tight uppercase">Instruksi Pengerjaan</h1>
            <p className="text-slate-500 mt-2 text-xs font-medium leading-relaxed max-w-md mx-auto">
              Selamat datang di Tes Kompetensi Daring Mitra Tambahan,<br/>
              <span className="font-black text-orange-600 text-sm">{user.namaLengkap || user.email}</span>
            </p>
          </div>
          
          {/* Body Instruksi */}
          <div className="flex-1 p-6 space-y-4 overflow-hidden flex flex-col">
             {/* Key Metrics Highlight - Tema Orange/Kuning */}
             <div className="grid grid-cols-2 gap-3 shrink-0">
                <div className="bg-gradient-to-br from-orange-500 to-orange-600 text-white p-4 rounded-[20px] flex items-center gap-3 shadow-lg shadow-orange-200 border border-orange-400">
                   <Clock className="w-8 h-8 opacity-80" />
                   <div>
                      <p className="text-[9px] uppercase font-black opacity-80 tracking-widest leading-none mb-1">Durasi Ujian</p>
                      <p className="text-xl font-black leading-none">{jadwalServer.durasi} Menit</p>
                   </div>
                </div>
                <div className="bg-gradient-to-br from-[#facc15] to-[#eab308] text-slate-900 p-4 rounded-[20px] flex items-center gap-3 shadow-lg shadow-yellow-200 border border-yellow-300">
                   <Database className="w-8 h-8 opacity-80" />
                   <div>
                      <p className="text-[9px] uppercase font-black opacity-80 tracking-widest leading-none mb-1">Total Soal</p>
                      <p className="text-xl font-black leading-none">{quizData.length} Butir</p>
                   </div>
                </div>
             </div>

             {/* Strict Rules List */}
             <div className="bg-slate-50 p-5 rounded-[24px] border border-slate-200 flex-1 overflow-y-auto custom-scrollbar space-y-3">
                <div className="flex gap-3">
                  <div className="mt-0.5"><Lock className="text-orange-500 w-4 h-4" /></div>
                  <div><p className="text-xs font-black text-slate-700">Wajib Layar Penuh</p><p className="text-[11px] text-slate-500 font-medium">Sistem akan mengunci perangkat Anda ke mode fullscreen secara otomatis.</p></div>
                </div>
                <div className="flex gap-3">
                  <div className="mt-0.5"><ShieldAlert className="text-red-500 w-4 h-4" /></div>
                  <div><p className="text-xs font-black text-slate-700">Dilarang Screenshot</p><p className="text-[11px] text-slate-500 font-medium">Aktivitas screenshot, print screen, dan copy-paste dinonaktifkan.</p></div>
                </div>
                <div className="flex gap-3">
                  <div className="mt-0.5"><AlertTriangle className="text-red-600 w-4 h-4" /></div>
                  <div><p className="text-xs font-black text-red-600">Sistem Anti-Curang Aktif</p><p className="text-[11px] text-red-500 font-bold">Membuka aplikasi lain (Split Screen) atau keluar dari halaman tab ujian 3 kali berturut-turut = DISKUALIFIKASI otomatis.</p></div>
                </div>
                <div className="flex gap-3">
                  <div className="mt-0.5"><CheckCircle2 className="text-blue-500 w-4 h-4" /></div>
                  <div><p className="text-xs font-black text-slate-700">Tidak Dapat Diulang</p><p className="text-[11px] text-slate-500 font-medium">Jika tombol 'Mulai' di bawah telah diklik, waktu akan berjalan mundur dan ujian bersifat final.</p></div>
                </div>
             </div>
          </div>

          {/* Action Buttons */}
          <div className="p-6 pt-0 shrink-0">
            <button onClick={startQuiz} className="w-full bg-[#1A1A1B] font-black py-4 rounded-xl shadow-xl hover:scale-[1.02] text-white flex justify-center items-center gap-2 uppercase tracking-widest text-xs transition-all">
              SAYA MENGERTI, MULAI UJIAN <ArrowRight size={16}/>
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (view === 'fetching_soal' || view === 'saving') {
    return (
      <div className="h-[100svh] flex flex-col items-center justify-center relative bg-transparent">
        {/* LOGO SELANG SELING SAAT TRANSIFI/FETCHING */}
        <img src={loadingLogo} className="w-20 h-20 mb-6 transition-all duration-300 object-contain drop-shadow-md" alt="Logo" onError={(e) => e.target.style.display = 'none'} />
        <Loader2 className="w-10 h-10 animate-spin text-orange-500 mb-4"/>
        <p className="font-black text-slate-500 uppercase tracking-widest text-xs">Memproses Data Server...</p>
      </div>
    );
  }

  if (view === 'quiz') {
    const q = quizData[currentQuestion];
    if(!q) return null;
    
    return (
      <div className="h-[100svh] w-screen flex flex-col font-sans select-none relative overflow-hidden bg-transparent">
        {appModal.show && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-[24px] max-w-sm w-full p-8 text-center animate-scale-in shadow-2xl">
              <AlertTriangle className="w-12 h-12 text-orange-500 mx-auto mb-4" />
              <h3 className="font-bold text-lg mb-2">{appModal.title}</h3>
              <p className="text-slate-500 text-sm mb-6">{appModal.message}</p>
              {appModal.type === 'alert' ? (
                <button onClick={() => setAppModal({ show: false })} className="w-full bg-[#1A1A1B] text-white font-bold py-3 rounded-xl uppercase tracking-widest text-xs">Kembali</button>
              ) : (
                <div className="flex gap-3">
                  <button onClick={() => setAppModal({ show: false })} className="flex-1 bg-slate-100 font-bold py-3 rounded-xl text-slate-700 uppercase tracking-widest text-xs">Batal</button>
                  <button onClick={() => { setAppModal({ show: false }); handleSubmit(); }} className="flex-1 bg-orange-500 font-bold py-3 rounded-xl text-white uppercase tracking-widest text-xs">Ya, Kirim</button>
                </div>
              )}
            </div>
          </div>
        )}

        {showWarningModal && (
          <div className="fixed inset-0 bg-red-900/70 backdrop-blur-md z-[100] flex items-center justify-center p-4">
            <div className="bg-white rounded-[32px] max-w-sm w-full p-8 text-center animate-scale-in shadow-2xl">
              <ShieldAlert className="w-16 h-16 text-red-500 mx-auto mb-5" />
              <h3 className="font-black text-xl mb-3 text-red-600 uppercase tracking-tight">Peringatan Keamanan</h3>
              <p className="text-slate-600 mb-6 text-sm font-bold leading-relaxed">Sistem mendeteksi Anda keluar halaman ujian. Pelanggaran ke-{warnings}/3. Mencapai 3x akan mengakibatkan diskualifikasi otomatis.</p>
              <button onClick={() => setShowWarningModal(false)} className="w-full bg-red-600 text-white font-black py-4 rounded-xl hover:bg-red-700 uppercase tracking-widest text-xs transition-colors">Saya Paham & Kembali</button>
            </div>
          </div>
        )}

        {/* QUIZ HEADER DENGAN COUNTDOWN HIGHLIGHT MENColok */}
        <header className="bg-white/90 backdrop-blur-md px-4 md:px-6 h-[70px] flex items-center justify-between z-40 shrink-0 border-b border-slate-200 shadow-sm">
          <div className="flex items-center gap-3">
            <img src={LOGO_BPS} className="w-9 h-9 object-contain drop-shadow-sm" alt="Logo" />
            <div className="font-black text-sm hidden sm:block tracking-tight text-slate-800 uppercase">CAT Sensus Ekonomi</div>
          </div>
          <div className="flex gap-3 items-center">
             <div className="hidden md:flex items-center gap-2 bg-slate-50 border border-slate-100 px-4 py-2 rounded-full shadow-sm">
                <User className="w-4 h-4 text-orange-500" />
                <span className="text-xs font-black uppercase tracking-wider text-slate-700 truncate max-w-[150px]">{user.namaLengkap || user.email}</span>
             </div>
             {/* TIMER MENGGUNAKAN WARNA KUNING/ORANYE MENColok */}
             <div className={`font-mono text-sm md:text-base font-black px-6 py-2 rounded-full shadow-lg border-2 flex items-center gap-2 transition-all ${timeLeft < 300 ? 'bg-red-500 text-white border-red-600 animate-pulse' : 'bg-gradient-to-r from-[#ffe16f] to-[#facc15] text-[#1A1A1B] border-yellow-400'}`}>
                <Clock size={16} />
                {formatTime(timeLeft)}
             </div>
          </div>
        </header>

        <main className="flex-1 flex flex-col md:flex-row max-w-[1200px] w-full mx-auto p-3 md:p-5 gap-4 min-h-0">
          {/* TOMBOL PETA SOAL KHUSUS HP (Top Toggle) */}
          <button onClick={() => setShowMap(!showMap)} className="md:hidden w-full bg-white p-3.5 rounded-2xl font-black text-xs text-slate-700 shadow-md border border-slate-100 uppercase tracking-widest flex items-center justify-center gap-2 shrink-0">
            {showMap ? <XCircle size={16}/> : <BarChart3 size={16}/>}
            {showMap ? "Tutup Peta Soal" : "Navigasi Peta Soal"}
          </button>

          {/* AREA PERTANYAAN */}
          <div className={`flex-1 flex-col min-h-0 ${showMap ? 'hidden md:flex' : 'flex'}`}>
            <div className="bg-white/90 backdrop-blur-md rounded-[24px] flex-1 flex flex-col shadow-lg border border-white overflow-hidden relative">
              <div className="px-5 py-3 border-b border-slate-100 bg-white flex justify-between items-center z-10">
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest bg-slate-50 border border-slate-200 px-3 py-1 rounded-full shadow-sm">Soal {currentQuestion + 1} dari {quizData.length}</span>
                {answers[q.id] && <button onClick={() => setAnswers(prev => { const n = {...prev}; delete n[q.id]; return n; })} className="text-[10px] font-black text-red-400 hover:text-red-600 hover:bg-red-50 px-2 py-1 rounded uppercase tracking-widest flex items-center gap-1.5 transition-colors"><Trash2 className="w-3.5 h-3.5"/> Batalkan Jawaban</button>}
              </div>
              <div className="flex-1 overflow-y-auto p-5 md:p-8 custom-scrollbar">
                <h2 className="text-base md:text-lg font-bold text-slate-800 mb-8 whitespace-pre-wrap leading-relaxed">{q.text}</h2>
                <div className="space-y-3">
                  {/* MENAMPILKAN OPSI YANG SUDAH DIACAK */}
                  {q.shuffledOptions.map((opt, index) => {
                    const uiLabel = String.fromCharCode(65 + index); // A, B, C, D, E berurutan
                    const isSelected = answers[q.id] === opt.key; // Simpan berdasarkan key asli dari database
                    return (
                      <label key={opt.key} onClick={() => setAnswers({...answers, [q.id]: opt.key})} className={`flex items-center p-4 rounded-[20px] cursor-pointer border-2 transition-all duration-200 ${isSelected ? 'border-orange-500 bg-orange-50 shadow-md transform translate-x-1' : 'border-slate-100 bg-white hover:border-orange-200 hover:bg-orange-50/30'}`}>
                        <div className={`w-6 h-6 rounded-full border-2 mr-4 flex items-center justify-center shrink-0 transition-colors ${isSelected ? 'border-orange-500 bg-orange-500' : 'border-slate-300 bg-slate-50'}`}>{isSelected && <div className="w-2 h-2 bg-white rounded-full"></div>}</div>
                        <span className={`font-black mr-2 text-sm ${isSelected ? 'text-orange-700' : 'text-slate-400'}`}>{uiLabel}.</span>
                        <span className={`text-sm md:text-base font-semibold leading-snug ${isSelected ? 'text-orange-900' : 'text-slate-700'}`}>{opt.text}</span>
                      </label>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* NAVIGASI BUTTONS */}
            <div className="flex justify-between mt-4 shrink-0 gap-3">
              <button onClick={() => setCurrentQuestion(p => Math.max(0, p - 1))} disabled={currentQuestion === 0} className="px-6 py-4 bg-white border border-slate-200 rounded-xl font-black text-slate-600 shadow-md disabled:opacity-40 uppercase tracking-widest text-xs flex-1 md:flex-none transition-all active:scale-95">
                <ChevronLeft size={18} className="inline mr-1" /> Kembali
              </button>
              {currentQuestion === quizData.length - 1 ? (
                <button onClick={() => {
                  const unanswered = quizData.length - Object.keys(answers).length;
                  if (unanswered > 0) setAppModal({ show: true, type: 'alert', title: 'Belum Selesai', message: `Harap selesaikan semua jawaban. Masih ada ${unanswered} soal yang kosong.`});
                  else setAppModal({ show: true, type: 'confirm', title: 'Kirim Jawaban', message: 'Anda tidak dapat mengubah jawaban lagi setelah dikirim. Kirim sekarang?'});
                }} className="px-8 py-4 bg-gradient-to-r from-orange-500 to-orange-600 font-black rounded-xl shadow-lg shadow-orange-200 text-white uppercase tracking-widest text-xs flex-1 md:flex-none transition-all active:scale-95">Selesai & Kirim</button>
              ) : (
                <button onClick={() => setCurrentQuestion(p => Math.min(quizData.length - 1, p + 1))} className="px-8 py-4 bg-[#1A1A1B] text-white font-black rounded-xl shadow-xl uppercase tracking-widest text-xs flex-1 md:flex-none transition-all active:scale-95">Selanjutnya <ChevronRight size={18} className="inline ml-1" /></button>
              )}
            </div>
          </div>

          {/* PETA SOAL (Desktop: Samping Kanan, Mobile: Di Bawah Tombol) */}
          <div className={`${showMap ? 'flex' : 'hidden'} md:flex w-full md:w-[320px] flex-shrink-0 flex-col min-h-0 h-max md:h-full`}>
            <div className="bg-white/90 backdrop-blur-md rounded-[24px] p-5 flex flex-col h-full shadow-lg border border-white">
              <div className="font-black text-[11px] uppercase tracking-widest text-slate-400 mb-4 flex items-center gap-2 border-b border-slate-100 pb-3">
                <BarChart3 className="w-4 h-4 text-orange-500"/> Navigasi Peta Soal
              </div>
              <div className="grid grid-cols-5 md:grid-cols-4 lg:grid-cols-5 gap-2 overflow-y-auto flex-1 content-start custom-scrollbar pr-1 pb-2">
                {quizData.map((item, idx) => {
                   const isAnswered = answers[item.id] !== undefined;
                   const isCurrent = currentQuestion === idx;
                   let btnClass = 'border-slate-200 bg-white text-slate-400 hover:border-slate-300';
                   if (isCurrent) btnClass = 'border-orange-500 bg-orange-500 text-white shadow-md scale-105 z-10';
                   else if (isAnswered) btnClass = 'border-emerald-500 bg-emerald-50 text-emerald-700 font-black';
                   return (
                     <button key={item.id} onClick={() => { setCurrentQuestion(idx); if(window.innerWidth < 768) setShowMap(false); }} className={`h-11 md:h-12 text-xs font-black rounded-xl border-2 transition-all duration-200 flex items-center justify-center ${btnClass}`}>
                       {idx + 1}
                     </button>
                   );
                })}
              </div>
              <div className="mt-4 pt-4 border-t border-slate-100 grid grid-cols-2 gap-2">
                <div className="flex items-center gap-2"><div className="w-2.5 h-2.5 rounded-full bg-emerald-500"></div><span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Terjawab</span></div>
                <div className="flex items-center gap-2"><div className="w-2.5 h-2.5 rounded-full border-2 border-slate-300 bg-white"></div><span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Kosong</span></div>
              </div>
            </div>
          </div>

        </main>
      </div>
    );
  }

  if (view === 'result') {
    return (
      <div className="h-[100svh] w-screen flex items-center justify-center p-4 relative bg-transparent">
        <div className="max-w-[450px] w-full bg-white/95 backdrop-blur-3xl rounded-[40px] p-10 text-center animate-fade-up border border-white shadow-2xl">
          <div className="w-24 h-24 bg-emerald-50 rounded-[32px] flex items-center justify-center mx-auto mb-6 shadow-sm"><CheckCircle className="w-12 h-12 text-emerald-500" /></div>
          <h1 className="text-3xl font-black text-slate-800 mb-3 tracking-tight">Berhasil Terkirim!</h1>
          <p className="text-slate-500 text-sm mb-8 font-medium leading-relaxed">Terima kasih telah mengikuti Uji Kompetensi Mitra Tambahan 2026. Data pengerjaan Anda telah aman tersimpan di Server Pusat BPS Pacitan.</p>
          <div className="text-left bg-slate-50 p-6 rounded-[24px] mb-8 border border-slate-100">
             <div className="flex justify-between border-b border-slate-200/50 pb-3 mb-3 items-center"><span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Peserta</span><span className="text-xs font-black text-slate-800">{user.email}</span></div>
             <div className="flex justify-between items-center"><span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Waktu Selesai</span><span className="text-xs font-black text-slate-800">{getLocalTime().split(' ')[1]} WIB</span></div>
          </div>
          <button onClick={() => window.location.reload()} className="w-full bg-[#1A1A1B] hover:bg-black text-white font-black py-4 rounded-2xl flex justify-center gap-3 items-center hover-scale-up uppercase tracking-widest text-xs transition-all shadow-xl">Keluar Sistem <LogOut size={16}/></button>
        </div>
      </div>
    );
  }

  return null;
};

// ==========================================
// 3. ROUTER UTAMA
// ==========================================
export default function App() {
  // SET DOCUMENT TITLE & FAVICON
  useEffect(() => {
    document.title = "Uji Kompetensi Mitra Tambahan 2026 - BPS Kabupaten Pacitan";
    let link = document.querySelector("link[rel~='icon']");
    if (!link) {
      link = document.createElement('link');
      link.rel = 'icon';
      document.head.appendChild(link);
    }
    link.href = LOGO_BPS;
  }, []);

  return (
    <>
      <AppStylesAndBackground />
      <Routes>
        <Route path="/" element={<ParticipantApp />} />
        <Route path="/admin" element={<AdminLogin />} />
        <Route path="/" element={<AdminDashboard />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}