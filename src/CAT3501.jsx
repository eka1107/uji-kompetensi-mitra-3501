import React, { useState, useEffect, useCallback, useRef } from 'react';
import { 
  ShieldAlert, Clock, User, FileText, CheckCircle, 
  AlertTriangle, LogOut, ChevronRight, ChevronLeft, Building, 
  Loader2, Lock, Save, Trash2, ArrowRight, BookOpen, AlertCircle,
  Zap, BarChart3, Database, Eye, EyeOff, CalendarClock, CalendarX,
  Download, LayoutDashboard, Users, CheckCircle2, XCircle,
  Menu, X, Shield 
} from 'lucide-react';

import AdminDashboard from './admin.jsx';

// GANTI DENGAN URL DEPLOY APPS SCRIPT YANG BARU!
const GOOGLE_SCRIPT_WEB_APP_URL = "https://script.google.com/macros/s/AKfycbzLRkW2qOUDNmuoKibKV5_KsiCOissAhr0Us9w6gi52cbznFaO3beVXwMapUsANAfRj/exec"; 

function shuffleArray(array) {
  const newArr = [...array];
  for (let i = newArr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArr[i], newArr[j]] = [newArr[j], newArr[i]];
  }
  return newArr;
}

const getLocalTime = () => {
  return new Date().toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' });
};

const formatJadwal = (timestampObj) => {
  if (!timestampObj || timestampObj === 0) return "Jadwal Belum Ditetapkan";
  return new Date(timestampObj).toLocaleString('id-ID', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
    hour: '2-digit', minute: '2-digit', timeZoneName: 'short'
  });
};

const AppStylesAndBackground = () => (
  <>
    <style dangerouslySetInnerHTML={{__html: `
      @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800&family=Inter:wght@400;500;600&display=swap');
      
      :root {
        --first-color: 152, 226, 253;   
        --second-color: 209, 240, 123;  
        --third-color: 255, 225, 111;   
        
        --black-charcoal: #1A1A1B;
        --pintarly-yellow: #ffe16f;
        --pintarly-yellow-hover: #e8cd65;
        --se-primary: #ea580c;
      }
      
      body {
        font-family: 'Outfit', 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
        overflow: hidden; 
        margin: 0;
        background-color: #f5f5f7;
      }

      ::-webkit-scrollbar { width: 6px; height: 6px; }
      ::-webkit-scrollbar-track { background: transparent; }
      ::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.1); border-radius: 10px; }
      ::-webkit-scrollbar-thumb:hover { background: rgba(0,0,0,0.2); }

      @keyframes animate-first { 0% { transform: rotate(0deg) scale(1); } 50% { transform: rotate(180deg) scale(1.1); } 100% { transform: rotate(360deg) scale(1); } }
      @keyframes animate-second { 0% { transform: rotate(0deg) scale(1.1); } 50% { transform: rotate(-180deg) scale(1); } 100% { transform: rotate(-360deg) scale(1.1); } }
      @keyframes animate-third { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
      
      @keyframes floating {
        0% { transform: translateY(0px); }
        50% { transform: translateY(-6px); }
        100% { transform: translateY(0px); }
      }

      @keyframes fadeInUp {
        from { opacity: 0; transform: translateY(15px); }
        to { opacity: 1; transform: translateY(0); }
      }
      
      @keyframes scaleIn {
        from { opacity: 0; transform: scale(0.95); }
        to { opacity: 1; transform: scale(1); }
      }
      
      @keyframes confettiFall {
        0% { transform: translateY(-100px) rotate(0deg); opacity: 1; }
        100% { transform: translateY(100vh) rotate(720deg); opacity: 0; }
      }

      .animate-fade-up { animation: fadeInUp 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
      .animate-scale-in { animation: scaleIn 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
      .animate-floating { animation: floating 4s ease-in-out infinite; }
      .animate-confetti { animation: confettiFall cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards; }

      .hover-slide-right { transition: transform 0.25s ease, box-shadow 0.25s ease, border-color 0.25s ease; }
      .hover-slide-right:hover { transform: translateX(4px); }
      .hover-scale-up { transition: all 0.25s ease; }
      .hover-scale-up:hover { transform: translateY(-2px); box-shadow: 0 8px 20px -6px rgba(0, 0, 0, 0.15); }

      .pintarly-glass {
        background: rgba(255, 255, 255, 0.9);
        backdrop-filter: blur(24px);
        -webkit-backdrop-filter: blur(24px);
        border: 1px solid rgba(255, 255, 255, 0.8);
        box-shadow: 0 4px 30px rgba(0, 0, 0, 0.05);
      }
      .pintarly-input {
        background: rgba(255, 255, 255, 0.8);
        border: 1px solid rgba(0, 0, 0, 0.08);
      }
      .pintarly-input:focus {
        background: #ffffff;
        border-color: var(--black-charcoal);
        box-shadow: 0 0 0 3px rgba(26, 26, 27, 0.1);
      }
    `}} />

    <div className="fixed inset-0 z-[-1] overflow-hidden bg-[linear-gradient(40deg,#ffffff,#f5f5f7)] pointer-events-none">
      <div 
        className="absolute inset-0 opacity-[0.06] mix-blend-soft-light z-10" 
        style={{ backgroundImage: "url('data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.85%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E')" }}
      ></div>
      <div className="absolute inset-0 w-full h-full blur-[90px] opacity-70">
        <div className="absolute w-[60%] h-[60%] top-[15%] left-[20%] bg-[radial-gradient(circle_at_center,rgba(var(--first-color),0.8)_0,transparent_50%)] mix-blend-multiply" style={{ transformOrigin: 'center center', animation: 'animate-first 25s ease infinite' }}></div>
        <div className="absolute w-[60%] h-[60%] top-[25%] left-[15%] bg-[radial-gradient(circle_at_center,rgba(var(--second-color),0.7)_0,transparent_50%)] mix-blend-multiply" style={{ transformOrigin: 'calc(50% - 200px)', animation: 'animate-second 20s reverse infinite' }}></div>
        <div className="absolute w-[60%] h-[60%] top-[20%] left-[25%] bg-[radial-gradient(circle_at_center,rgba(var(--third-color),0.8)_0,transparent_50%)] mix-blend-multiply" style={{ transformOrigin: 'calc(50% + 200px)', animation: 'animate-third 30s linear infinite' }}></div>
      </div>
    </div>
  </>
);

const Confetti = () => {
  const colors = ['#ea580c', '#fbbf24', '#facc15', '#0ea5e9'];
  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      {[...Array(60)].map((_, i) => (
        <div 
          key={i} 
          className="absolute animate-confetti rounded-sm opacity-80"
          style={{
            left: `${Math.random() * 100}vw`,
            width: `${Math.random() * 10 + 5}px`,
            height: `${Math.random() * 15 + 5}px`,
            backgroundColor: colors[Math.floor(Math.random() * colors.length)],
            animationDuration: `${Math.random() * 3 + 2}s`,
            animationDelay: `${Math.random() * 0.5}s`,
          }}
        />
      ))}
    </div>
  );
};

const LogoSE = ({ className }) => (
  <svg viewBox="0 0 100 100" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M15 45 C 30 10, 65 10, 45 55 C 25 100, 80 100, 85 60" stroke="#c2410c" strokeWidth="5" strokeLinecap="round"/>
    <path d="M22 50 C 37 15, 72 15, 52 60 C 32 105, 87 105, 92 65" stroke="#ea580c" strokeWidth="5" strokeLinecap="round"/>
    <path d="M29 55 C 44 20, 79 20, 59 65 C 39 110, 94 110, 99 70" stroke="#f59e0b" strokeWidth="5" strokeLinecap="round"/>
    <path d="M48 40 L 75 35" stroke="#c2410c" strokeWidth="5" strokeLinecap="round"/>
    <path d="M45 55 L 70 50" stroke="#f59e0b" strokeWidth="5" strokeLinecap="round"/>
  </svg>
);

export default function App() {
  const [view, setView] = useState('init'); 
  const [user, setUser] = useState({ email: '', password: '', token: '', namaLengkap: '' });
  const [adminUser, setAdminUser] = useState({ email: '', password: '' }); 
  
  const [adminCreds, setAdminCreds] = useState({ email: 'admin@bps.go.id', password: 'adminpacitan' });
  
  const [loginError, setLoginError] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  
  const [showPassword, setShowPassword] = useState(false);
  const [emailWarning, setEmailWarning] = useState('');
  
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
  const [score, setScore] = useState(null);
  
  const [appModal, setAppModal] = useState({ show: false, type: '', message: '' });
  const [jadwalServer, setJadwalServer] = useState({ mulai: 0, selesai: 0 });
  const [showMap, setShowMap] = useState(false); 

  const checkJadwal = (mulai, selesai) => {
    const now = new Date().getTime();
    if (mulai === 0 && selesai === 0) return 'buka'; // Mencegah blokir jika panitia belum set jadwal sama sekali
    if (now < mulai) return 'belum_mulai';
    if (now > selesai) return 'sudah_selesai';
    return 'buka';
  };

  const submitRef = useRef(null);

  useEffect(() => {
    const fetchInitData = async () => {
      try {
        const response = await fetch(`${GOOGLE_SCRIPT_WEB_APP_URL}?action=init&cb=${new Date().getTime()}`, {
          method: 'GET',
          redirect: 'follow'
        });
        
        if (!response.ok) throw new Error("Akses jaringan ke server ditolak.");
        const data = await response.json();
        if (data.status === "error") throw new Error(data.message);

        // Memastikan terbaca mutlak sebagai angka (Number)
        const waktuMulai = Number(data.jadwal.mulai) || 0;
        const waktuSelesai = Number(data.jadwal.selesai) || 0;

        setJadwalServer({ mulai: waktuMulai, selesai: waktuSelesai });
        setAccounts(data.akun.filter(row => row.email && row.password));
        setAdminData(data.nilai || []);

        if (data.admin && data.admin.length > 0) {
          setAdminCreds({ email: data.admin[0].email, password: data.admin[0].password });
        }

        const formattedQuestions = (data.soal || []).filter(row => row.soal && row.jawaban).map((row, index) => ({
          id: `q_${index}`,
          text: String(row.soal),
          options: { 
            A: row.a != null ? String(row.a) : "", 
            B: row.b != null ? String(row.b) : "", 
            C: row.c != null ? String(row.c) : "", 
            D: row.d != null ? String(row.d) : "", 
            E: row.e != null ? String(row.e) : "" 
          },
          answer: String(row.jawaban).trim().toUpperCase()
        }));
        setQuizData(shuffleArray(formattedQuestions));

        const statusJadwal = checkJadwal(waktuMulai, waktuSelesai);
        if (statusJadwal !== 'buka') {
          setView(statusJadwal);
        } else {
          setView('login');
        }
      } catch (error) {
        console.error("Fetch Error:", error);
        setView('error_init'); 
      }
    };
    fetchInitData();
  }, []);

  const outOfTabTimer = useRef(null);

  useEffect(() => {
    if (view === 'quiz') {
      const handleContextMenu = (e) => e.preventDefault();
      const handleCopy = (e) => e.preventDefault();
      
      const handleVisibilityChange = () => {
        if (document.hidden) {
          setWarnings(prev => {
            const newWarnings = prev + 1;
            if (newWarnings >= 3) {
              if (submitRef.current) submitRef.current();
            } else {
              setShowWarningModal(true);
            }
            return newWarnings;
          });

          outOfTabTimer.current = setTimeout(() => {
            if (submitRef.current) submitRef.current();
          }, 30000);

        } else {
          if (outOfTabTimer.current) {
            clearTimeout(outOfTabTimer.current);
            outOfTabTimer.current = null;
          }
        }
      };

      document.addEventListener('contextmenu', handleContextMenu);
      document.addEventListener('copy', handleCopy);
      document.addEventListener('paste', handleCopy);
      document.addEventListener('visibilitychange', handleVisibilityChange);

      return () => {
        document.removeEventListener('contextmenu', handleContextMenu);
        document.removeEventListener('copy', handleCopy);
        document.removeEventListener('paste', handleCopy);
        document.removeEventListener('visibilitychange', handleVisibilityChange);
        if (outOfTabTimer.current) clearTimeout(outOfTabTimer.current);
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
    if (!email) {
      setEmailWarning('');
      return;
    }
    const exists = accounts.some(acc => String(acc.email).trim().toLowerCase() === String(email).trim().toLowerCase());
    if (!exists) {
      setEmailWarning('Email belum terdaftar di sistem.');
    } else {
      setEmailWarning('');
    }
  };

  const loadAdminDashboard = async () => {
    setIsLoggingIn(true);
    try {
      const response = await fetch(`${GOOGLE_SCRIPT_WEB_APP_URL}?action=admin&cb=${new Date().getTime()}`, {
        method: 'GET',
        redirect: 'follow'
      });
      const data = await response.json();
      setAdminData(data.nilai || []); 
      setView('admin');
    } catch (e) {
      setLoginError("Gagal memuat data Dashboard Admin.");
    }
    setIsLoggingIn(false);
  };

  const handleAdminLogin = async (e) => {
    e.preventDefault();
    setLoginError('');

    if (adminUser.email === adminCreds.email && adminUser.password === adminCreds.password) {
      await loadAdminDashboard();
    } else {
      setLoginError('Akses Ditolak! Kredensial Panitia tidak valid.');
    }
  };

  const handlePesertaLogin = async (e) => {
    e.preventDefault();
    setLoginError('');

    const statusJadwal = checkJadwal(jadwalServer.mulai, jadwalServer.selesai);
    if (statusJadwal !== 'buka') {
      setView(statusJadwal);
      return;
    }

    if (user.token !== 'BPS2026') {
      setLoginError('Token ujian tidak valid. Hubungi pengawas.');
      return;
    }
    if (accounts.length === 0) {
      setLoginError("Sistem belum siap. Coba muat ulang halaman.");
      return;
    }

    const isValidUser = accounts.find(
      acc => String(acc.email).trim().toLowerCase() === String(user.email).trim().toLowerCase() && 
             String(acc.password).trim() === String(user.password).trim()
    );

    if (isValidUser) {
      setIsLoggingIn(true);
      
      const historyAttempts = adminData.filter(row => row.akun && String(row.akun).trim().toLowerCase() === String(user.email).trim().toLowerCase());
      
      if (historyAttempts.length >= 2) {
        setLoginError(`Batas percobaan habis untuk ${user.email}.`);
        setIsLoggingIn(false);
        return;
      }

      setUser({ ...user, namaLengkap: isValidUser.nama });
      setAttemptCount(historyAttempts.length + 1);
      setStartTime(getLocalTime());
      setIsLoggingIn(false);
      setWarnings(0); 
      
      setView('fetching_soal');
      setTimeout(() => {
         setView('instructions');
      }, 1500);

    } else {
      setLoginError('Email atau Sandi Peserta tidak cocok.');
    }
  };

  const startQuiz = () => {
    try {
      if (document.documentElement.requestFullscreen) {
        document.documentElement.requestFullscreen().catch(() => {});
      }
    } catch (e) {}
    setView('quiz');
  };

  const handleClearAnswer = (questionId) => {
    setAnswers(prev => {
      const newAnswers = { ...prev };
      delete newAnswers[questionId];
      return newAnswers;
    });
  };

  const confirmSubmit = () => {
    const unanswered = quizData.length - Object.keys(answers).length;
    
    if (unanswered > 0) {
      setAppModal({
        show: true,
        type: 'alert',
        title: 'Pengisian Belum Lengkap',
        message: `Masih terdapat ${unanswered} soal yang belum dijawab. Anda wajib mengisi seluruh soal sebelum dapat mengirim jawaban.`
      });
      return; 
    }

    setAppModal({
      show: true,
      type: 'confirm',
      title: 'Konfirmasi Pengiriman',
      message: 'Apakah Anda yakin dengan jawaban Anda? Data akan dikirim permanen ke server BPS.'
    });
  };

  const handleSubmit = useCallback(async () => {
    setView('saving');
    
    let correct = 0;
    const detailJawaban = [];

    quizData.forEach(q => {
      const userAnswer = answers[q.id] || "";
      const isCorrect = userAnswer === q.answer ? 1 : 0;
      if (isCorrect) correct++;
      
      detailJawaban.push({ soal: q.text, jawaban: userAnswer, nilai: isCorrect });
    });
    
    const finalScore = Math.round((correct / quizData.length) * 100);
    const endTime = getLocalTime();
    const isPassed = finalScore >= 70;

    setScore({ totalQuestions: quizData.length, value: finalScore, isPassed: isPassed });

    const payload = {
      action: "save_all", waktu_mulai: startTime, waktu_selesai: endTime,
      akun: user.email, skor: finalScore, percobaan: attemptCount, keterangan: isPassed ? 'LULUS' : 'TIDAK LULUS', detail: detailJawaban
    };

    if (GOOGLE_SCRIPT_WEB_APP_URL && GOOGLE_SCRIPT_WEB_APP_URL.startsWith('http')) {
      try {
        await fetch(GOOGLE_SCRIPT_WEB_APP_URL, {
          method: 'POST', mode: 'no-cors', headers: { 'Content-Type': 'text/plain;charset=utf-8' }, body: JSON.stringify(payload)
        });
      } catch (e) {}
    }

    try {
      if (document.fullscreenElement && document.exitFullscreen) document.exitFullscreen().catch(() => {});
    } catch (e) {}
    
    setTimeout(() => setView('result'), 1800);
  }, [answers, quizData, startTime, user.email, attemptCount]);

  useEffect(() => {
    submitRef.current = handleSubmit;
  }, [handleSubmit]);

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleAnswer = (questionId, optionKey) => setAnswers(prev => ({ ...prev, [questionId]: optionKey }));

  const handleDownloadBukti = () => {
    const generatePDF = () => {
      const { jsPDF } = window.jspdf;
      const doc = new jsPDF();

      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.text("BUKTI HASIL UJIAN KOMPETENSI MITRA", 105, 20, null, null, "center");
      doc.text("SENSUS EKONOMI 2026 - BPS KABUPATEN PACITAN", 105, 27, null, null, "center");

      doc.setLineWidth(0.5);
      doc.line(20, 35, 190, 35);

      doc.setFontSize(12);
      doc.setFont("helvetica", "normal");
      doc.text(`Email Peserta     : ${user.email}`, 20, 50);
      doc.text(`Nama Peserta      : ${user.namaLengkap || '-'}`, 20, 60);
      doc.text(`Nilai Akhir Ujian : ${score.value}`, 20, 70);
      doc.text(`Sesi Pengerjaan   : Percobaan Ke-${attemptCount}`, 20, 80);
      
      doc.setFont("helvetica", "bold");
      const statusText = score.isPassed ? 'LULUS (MEMENUHI SYARAT)' : 'TIDAK LULUS';
      doc.setTextColor(score.isPassed ? 21 : 220, score.isPassed ? 128 : 38, score.isPassed ? 61 : 38);
      doc.text(`Keterangan        : ${statusText}`, 20, 90);

      doc.setTextColor(0, 0, 0); 
      doc.setFont("helvetica", "normal");
      doc.text(`Waktu Selesai     : ${getLocalTime()}`, 20, 105);

      doc.setLineWidth(0.5);
      doc.line(20, 115, 190, 115);

      doc.setFontSize(10);
      doc.setTextColor(100);
      doc.text("* Dokumen ini diterbitkan otomatis oleh Sistem CAT BPS Pacitan.", 20, 125);

      doc.save(`Bukti_Nilai_SE2026_${String(user.email).split('@')[0]}.pdf`);
    };

    if (window.jspdf && window.jspdf.jsPDF) {
      generatePDF();
    } else {
      const script = document.createElement('script');
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js';
      script.onload = generatePDF;
      document.body.appendChild(script);
    }
  };
  
  if (view === 'init') {
    return (
      <div className="h-[100svh] w-screen flex flex-col items-center justify-center p-4 font-sans text-[var(--black-charcoal)] relative">
        <AppStylesAndBackground />
        <LogoSE className="w-16 h-16 mb-5 animate-scale-in animate-floating" />
        <Loader2 className="w-6 h-6 animate-spin mb-3 text-slate-800" />
        <h2 className="text-sm font-semibold animate-fade-up text-slate-600 tracking-wide">MENYIAPKAN SISTEM...</h2>
      </div>
    );
  }

  if (view === 'error_init') {
    return (
      <div className="h-[100svh] w-screen flex items-center justify-center p-4 font-sans relative">
        <AppStylesAndBackground />
        <div className="max-w-[420px] w-full pintarly-glass rounded-[32px] p-8 md:p-10 relative overflow-hidden animate-fade-up text-center">
          <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-5 shadow-sm animate-floating">
            <AlertTriangle className="w-8 h-8 text-red-500" />
          </div>
          <h1 className="text-2xl font-bold text-[var(--black-charcoal)] mb-3 tracking-tight">Koneksi Server Gagal</h1>
          <p className="text-slate-600 text-sm mb-6 leading-relaxed">
            Aplikasi gagal mengambil data dari Server (Google Apps Script).
          </p>
          <div className="bg-white/70 border border-red-100 p-4 rounded-2xl mb-8 shadow-sm text-left">
            <p className="text-[11px] font-bold text-red-600 uppercase tracking-widest mb-2">Solusi Untuk Panitia:</p>
            <ul className="text-xs text-slate-600 space-y-1.5 list-disc pl-4 font-medium">
              <li>Pastikan Kode Google Script telah di-Deploy sebagai <b>Versi Baru</b>.</li>
              <li>Pastikan pengaturan Akses (Who has access) adalah <b>Siapa saja (Anyone)</b>.</li>
            </ul>
          </div>
          <button onClick={() => window.location.reload()} className="w-full bg-[var(--se-primary)] hover:bg-[var(--se-primary-hover)] text-white font-bold py-3.5 rounded-2xl transition-all shadow-md hover-scale-up text-sm">
            Coba Hubungkan Ulang
          </button>
        </div>
      </div>
    );
  }

  if (view === 'admin') {
    return <AdminDashboard adminData={adminData} accountsData={accounts} adminCreds={adminCreds} onRefresh={loadAdminDashboard} AppStylesAndBackground={AppStylesAndBackground} />;
  }

  if (view === 'belum_mulai') {
    return (
      <div className="h-[100svh] w-screen flex items-center justify-center p-4 font-sans relative">
        <AppStylesAndBackground />
        <div className="max-w-[420px] w-full pintarly-glass rounded-[32px] p-8 md:p-10 relative overflow-hidden animate-fade-up text-center">
          <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-5 shadow-sm animate-floating">
            <CalendarClock className="w-8 h-8 text-blue-500" />
          </div>
          <h1 className="text-2xl font-bold text-[var(--black-charcoal)] mb-2 tracking-tight">Ujian Belum Dimulai</h1>
          <p className="text-slate-500 text-sm mb-6 leading-relaxed">Akses ke soal ujian Sensus Ekonomi saat ini masih dikunci oleh sistem.</p>
          <div className="bg-white/60 border border-white p-4 rounded-2xl mb-8 shadow-sm">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">UJIAN DIBUKA PADA</p>
            <p className="text-[13px] font-bold text-[var(--se-primary)]">{formatJadwal(jadwalServer.mulai)}</p>
          </div>
          <button onClick={() => window.location.reload()} className="w-full bg-[var(--black-charcoal)] hover:bg-black text-white font-bold py-4 rounded-2xl transition-all shadow-md hover-scale-up text-sm mb-4">
            Muat Ulang Halaman
          </button>
          <button onClick={() => { setView('login_admin'); setLoginError(''); }} className="text-xs font-bold text-slate-400 hover:text-blue-500 transition-colors">
            Masuk Khusus Panitia
          </button>
        </div>
      </div>
    );
  }

  if (view === 'sudah_selesai') {
    return (
      <div className="h-[100svh] w-screen flex items-center justify-center p-4 font-sans relative">
        <AppStylesAndBackground />
        <div className="max-w-[420px] w-full pintarly-glass rounded-[32px] p-8 md:p-10 relative overflow-hidden animate-fade-up text-center">
          <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-5 shadow-sm animate-floating">
            <CalendarX className="w-8 h-8 text-red-500" />
          </div>
          <h1 className="text-2xl font-bold text-[var(--black-charcoal)] mb-2 tracking-tight">Ujian Telah Ditutup</h1>
          <p className="text-slate-500 text-sm mb-6 leading-relaxed">Batas waktu pengerjaan untuk ujian Sensus Ekonomi ini telah berakhir.</p>
          <div className="bg-white/60 border border-white p-4 rounded-2xl mb-8 shadow-sm">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">UJIAN DITUTUP PADA</p>
            <p className="text-[13px] font-bold text-red-600">{formatJadwal(jadwalServer.selesai)}</p>
          </div>
          <button onClick={() => { setView('login_admin'); setLoginError(''); }} className="w-full bg-slate-100 border border-slate-200 text-slate-600 font-bold py-4 rounded-2xl transition-all shadow-sm hover:bg-white text-sm">
            Akses Dashboard Panitia
          </button>
        </div>
      </div>
    );
  }

  if (view === 'fetching_soal') {
    return (
      <div className="h-[100svh] w-screen flex flex-col items-center justify-center p-4 font-sans relative">
        <AppStylesAndBackground />
        <div className="pintarly-glass p-8 rounded-[32px] flex flex-col items-center max-w-[340px] w-full text-center animate-scale-in">
          <div className="w-16 h-16 bg-[#ffe16f]/40 rounded-full flex items-center justify-center mb-5 shadow-sm">
            <Database className="w-8 h-8 text-[var(--black-charcoal)]" />
          </div>
          <h2 className="text-lg font-bold text-slate-800 mb-2">Otentikasi Berhasil</h2>
          <p className="text-slate-500 text-sm mb-6 leading-relaxed">Menyiapkan modul soal adaptif untuk Anda...</p>
          <Loader2 className="w-6 h-6 animate-spin text-slate-800" />
        </div>
      </div>
    );
  }

  if (view === 'saving') {
    return (
      <div className="h-[100svh] w-screen flex flex-col items-center justify-center p-4 font-sans relative">
        <AppStylesAndBackground />
        <div className="pintarly-glass p-8 rounded-[32px] flex flex-col items-center max-w-[340px] w-full text-center animate-scale-in">
          <div className="w-16 h-16 bg-[#ffe16f]/40 rounded-full flex items-center justify-center mb-5 shadow-sm">
            <Save className="w-8 h-8 text-[var(--black-charcoal)] animate-bounce" />
          </div>
          <h2 className="text-lg font-bold text-slate-800 mb-2">Menyimpan Data</h2>
          <p className="text-slate-500 text-sm leading-relaxed">Merekam hasil pengerjaan Anda ke server pusat...</p>
        </div>
      </div>
    );
  }

  if (view === 'login_admin') {
    return (
      <div className="h-[100svh] w-screen flex items-center justify-center p-4 font-sans relative">
        <AppStylesAndBackground />
        <div className="max-w-[400px] w-full bg-white/95 backdrop-blur-3xl rounded-[32px] p-8 md:p-10 relative overflow-hidden animate-fade-up border border-blue-100 shadow-xl">
          <div className="mb-8 text-center relative z-10 flex flex-col items-center">
            <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center mb-4 text-blue-600 shadow-sm animate-floating">
              <Shield className="w-7 h-7" />
            </div>
            <h1 className="text-[22px] font-bold text-slate-800 mb-1.5 tracking-tight leading-snug">Otoritas Panitia</h1>
            <p className="text-slate-500 text-[11px] font-bold uppercase tracking-widest mt-1 bg-slate-100 px-3 py-1 rounded-full">BPS Kabupaten Pacitan</p>
          </div>

          <form onSubmit={handleAdminLogin} className="space-y-4 relative z-10">
            {loginError && (
              <div className="bg-red-50/80 backdrop-blur-sm border border-red-100 text-red-600 p-3.5 rounded-xl text-xs flex items-start gap-2.5 animate-scale-in">
                <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <p className="font-semibold leading-relaxed">{loginError}</p>
              </div>
            )}
            
            <div>
              <label className="block text-[11px] font-bold text-slate-600 mb-2 ml-1 uppercase tracking-wider">Email Panitia</label>
              <input required type="email" disabled={isLoggingIn}
                className="w-full px-4 py-3 text-sm bg-slate-50/50 border border-slate-200 rounded-2xl outline-none transition-all hover:border-blue-400 focus:border-blue-500 focus:bg-white text-slate-800 font-medium"
                placeholder="admin@bps.go.id"
                value={adminUser.email} onChange={(e) => setAdminUser({...adminUser, email: e.target.value})}
              />
            </div>
            
            <div className="relative">
              <label className="block text-[11px] font-bold text-slate-600 mb-2 ml-1 uppercase tracking-wider">Kata Sandi</label>
              <div className="relative">
                <input required type={showPassword ? "text" : "password"} disabled={isLoggingIn}
                  className="w-full px-4 py-3 text-sm bg-slate-50/50 border border-slate-200 rounded-2xl outline-none transition-all hover:border-blue-400 focus:border-blue-500 focus:bg-white text-slate-800 font-medium pr-12"
                  placeholder="••••••••"
                  value={adminUser.password} onChange={(e) => setAdminUser({...adminUser, password: e.target.value})}
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-blue-500 focus:outline-none transition-colors">
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button type="submit" disabled={isLoggingIn} className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-70 text-white font-bold text-[15px] py-4 px-4 rounded-2xl transition-all flex justify-center items-center gap-2 mt-8 shadow-md hover-scale-up">
              {isLoggingIn ? <Loader2 className="w-5 h-5 animate-spin"/> : <LayoutDashboard className="w-5 h-5" />}
              {isLoggingIn ? "Memverifikasi..." : "Masuk Dashboard"}
            </button>
          </form>

          <div className="mt-6 text-center">
            <button onClick={() => { setView('login'); setLoginError(''); }} className="text-[12px] font-bold text-slate-400 hover:text-slate-600 transition-colors flex items-center justify-center w-full gap-1.5">
              <User className="w-3.5 h-3.5"/> Kembali ke Halaman Peserta
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (view === 'login') {
    return (
      <div className="h-[100svh] w-screen flex items-center justify-center p-4 font-sans relative">
        <AppStylesAndBackground />
        <div className="max-w-[400px] w-full pintarly-glass rounded-[32px] p-8 md:p-10 relative overflow-hidden animate-fade-up">
          
          <div className="mb-8 text-center relative z-10 flex flex-col items-center">
            <LogoSE className="w-14 h-14 mb-4 drop-shadow-sm animate-floating" />
            <h1 className="text-[22px] font-bold text-[var(--black-charcoal)] mb-1.5 tracking-tight leading-snug">Tes Kompetensi Calon Mitra Tambahan 2026</h1>
            <p className="text-slate-500 text-[11px] font-bold uppercase tracking-widest mt-1 bg-slate-100/50 px-3 py-1 rounded-full">BPS Kabupaten Pacitan</p>
          </div>

          <form onSubmit={handlePesertaLogin} className="space-y-4 relative z-10">
            {loginError && (
              <div className="bg-red-50/80 backdrop-blur-sm border border-red-100 text-red-600 p-3.5 rounded-xl text-xs flex items-start gap-2.5 animate-scale-in">
                <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <p className="font-semibold leading-relaxed">{loginError}</p>
              </div>
            )}
            
            <div>
              <label className="block text-[11px] font-bold text-slate-600 mb-2 ml-1 uppercase tracking-wider">Alamat Email</label>
              <input required type="email" disabled={isLoggingIn}
                className={`w-full px-4 py-3 text-sm pintarly-input rounded-2xl outline-none transition-all text-slate-800 font-medium ${emailWarning ? 'border-red-400 focus:border-red-500 focus:ring-red-100' : 'hover:border-[var(--se-primary)]/50'}`}
                placeholder="nama@email.com"
                value={user.email} 
                onChange={(e) => { setUser({...user, email: e.target.value}); if (emailWarning) setEmailWarning(''); }}
                onBlur={(e) => checkEmail(e.target.value)}
              />
              {emailWarning && <p className="text-red-500 text-[10px] mt-1.5 ml-1 font-semibold animate-fade-up">{emailWarning}</p>}
            </div>
            
            <div className="relative">
              <label className="block text-[11px] font-bold text-slate-600 mb-2 ml-1 uppercase tracking-wider">Kata Sandi</label>
              <div className="relative">
                <input required type={showPassword ? "text" : "password"} disabled={isLoggingIn}
                  className="w-full px-4 py-3 text-sm pintarly-input rounded-2xl outline-none transition-all hover:border-[var(--se-primary)]/50 text-slate-800 font-medium pr-12"
                  placeholder="••••••••"
                  value={user.password} onChange={(e) => setUser({...user, password: e.target.value})}
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-[var(--se-primary)] focus:outline-none transition-colors">
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            
            <div>
              <label className="block text-[11px] font-bold text-slate-600 mb-2 ml-1 uppercase tracking-wider">Token Ujian</label>
              <input required type="text" disabled={isLoggingIn}
                className="w-full px-4 py-3 text-sm pintarly-input rounded-2xl outline-none transition-all hover:border-[var(--se-primary)]/50 text-slate-800 font-bold tracking-wider uppercase"
                placeholder="TOKEN"
                value={user.token} onChange={(e) => setUser({...user, token: e.target.value})}
              />
            </div>

            <button type="submit" disabled={isLoggingIn || emailWarning !== ''} className="w-full bg-[var(--pintarly-yellow)] hover:bg-[var(--pintarly-yellow-hover)] disabled:opacity-70 text-[var(--black-charcoal)] font-bold text-[15px] py-4 px-4 rounded-2xl transition-all flex justify-center items-center gap-2 mt-8 shadow-sm hover-scale-up">
              {isLoggingIn ? <Loader2 className="w-5 h-5 animate-spin"/> : <LogOut className="w-5 h-5" />}
              {isLoggingIn ? "Memverifikasi..." : "Mulai Ujian"}
            </button>
          </form>

          <div className="mt-6 text-center">
            <button onClick={() => { setView('login_admin'); setLoginError(''); }} className="text-[12px] font-bold text-slate-400 hover:text-[var(--se-primary)] transition-colors flex items-center justify-center w-full gap-1.5">
              <Shield className="w-3.5 h-3.5"/> Akses Khusus Panitia
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (view === 'instructions') {
    return (
      <div className="h-[100svh] w-screen flex flex-col items-center justify-center p-4 font-sans relative">
        <AppStylesAndBackground />
        <div className="max-w-[640px] w-full pintarly-glass rounded-[32px] overflow-hidden animate-fade-up flex flex-col max-h-[90vh]">
          
          <div className="p-8 border-b border-black/5 text-center shrink-0">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-[#ffe16f]/30 text-[var(--black-charcoal)] rounded-full mb-4 shadow-sm animate-floating">
              <BookOpen className="w-8 h-8" />
            </div>
            <h1 className="text-xl md:text-2xl font-bold text-[var(--black-charcoal)] tracking-tight leading-snug">Tes Kompetensi Calon Mitra Tambahan 2026</h1>
            <p className="text-slate-500 text-[11px] font-bold uppercase tracking-widest mt-2">BPS Kabupaten Pacitan</p>
          </div>
          
          <div className="p-8 space-y-6 overflow-y-auto custom-scrollbar">
            <div className="bg-white/60 border border-white p-4 rounded-2xl flex items-center justify-between gap-4 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="bg-blue-50 p-2 rounded-full hidden sm:block"><User className="w-5 h-5 text-blue-500"/></div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 mb-0.5 uppercase tracking-wider">Identitas Peserta</p>
                  <p className="font-bold text-sm text-[var(--black-charcoal)] truncate max-w-[180px] sm:max-w-xs">{user.namaLengkap || user.email}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-[10px] font-bold text-slate-400 mb-1.5 uppercase tracking-wider">Sesi Ujian</p>
                <p className="text-[11px] font-bold bg-blue-100 text-blue-700 px-3 py-1.5 rounded-lg inline-block">
                  Percobaan ke-{attemptCount}
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <h2 className="text-sm font-bold text-[var(--black-charcoal)] flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-orange-500" /> Peraturan Ujian
              </h2>
              <div className="grid sm:grid-cols-2 gap-3">
                {[
                  { title: "Alokasi Waktu", desc: `Tersedia waktu 45 Menit untuk menyelesaikan ${quizData.length} soal.` },
                  { title: "Sistem Keamanan", desc: "Keluar tab 30 detik atau 3 kali akan mengakhiri ujian otomatis." },
                  { title: "Penyelesaian", desc: "Tombol 'Kirim' aktif jika semua soal telah dijawab." },
                  { title: "Batas Lulus", desc: "Passing grade kelulusan minimal 70 poin." }
                ].map((item, idx) => (
                  <div key={idx} className="p-4 rounded-2xl bg-white/70 border border-white shadow-sm flex gap-3 items-start hover-slide-right cursor-default">
                    <div className="w-6 h-6 rounded-full bg-[var(--pintarly-yellow)] text-[var(--black-charcoal)] flex items-center justify-center font-bold text-[11px] shrink-0">{idx + 1}</div>
                    <div>
                      <p className="font-bold text-[var(--black-charcoal)] text-[13px] mb-1">{item.title}</p>
                      <p className="text-[12px] text-slate-500 leading-relaxed font-medium">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="p-8 pt-0 shrink-0 mt-2 flex flex-col gap-3">
            <button onClick={startQuiz} className="w-full bg-[var(--pintarly-yellow)] text-[var(--black-charcoal)] hover:bg-[var(--pintarly-yellow-hover)] font-bold py-4 rounded-2xl transition-all flex items-center justify-center gap-2 hover-scale-up text-base shadow-sm">
              Mulai Kerjakan Sekarang <ArrowRight className="w-5 h-5" />
            </button>
            <button onClick={() => { setView('login'); setUser({ email: '', password: '', token: '', namaLengkap: '' }); }} className="w-full bg-slate-100 hover:bg-slate-200 text-slate-500 font-bold py-3.5 rounded-2xl transition-all flex items-center justify-center gap-2 hover-scale-up text-sm shadow-sm">
              Batal & Ganti Akun Peserta <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (view === 'quiz') {
    const q = quizData[currentQuestion];
    if(!q) return null;
    
    return (
      <div className="h-[100svh] w-screen flex flex-col font-sans select-none relative overflow-hidden bg-[#f5f5f7]">
        <AppStylesAndBackground />
        
        {/* Modals */}
        {appModal.show && (
          <div className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-[32px] max-w-sm w-full p-8 text-center shadow-xl border border-white animate-scale-in">
              {appModal.type === 'alert' ? (
                <>
                  <div className="w-16 h-16 bg-orange-50 rounded-full flex items-center justify-center mx-auto mb-5">
                    <AlertTriangle className="w-8 h-8 text-orange-500" />
                  </div>
                  <h3 className="text-xl font-bold text-[var(--black-charcoal)] mb-2">{appModal.title}</h3>
                  <p className="text-slate-500 mb-8 text-sm leading-relaxed">{appModal.message}</p>
                  <button onClick={() => setAppModal({ show: false, type: '', message: '' })} className="w-full bg-[var(--black-charcoal)] text-white font-bold py-3.5 rounded-2xl hover:bg-black transition-colors text-sm">Tutup & Lanjutkan</button>
                </>
              ) : (
                <>
                  <div className="w-16 h-16 bg-[#ffe16f]/30 rounded-full flex items-center justify-center mx-auto mb-5">
                    <CheckCircle className="w-8 h-8 text-[var(--black-charcoal)]" />
                  </div>
                  <h3 className="text-xl font-bold text-[var(--black-charcoal)] mb-2">{appModal.title}</h3>
                  <p className="text-slate-500 mb-8 text-sm leading-relaxed">{appModal.message}</p>
                  <div className="flex gap-3">
                    <button onClick={() => setAppModal({ show: false, type: '', message: '' })} className="flex-1 bg-slate-100 text-slate-700 font-bold py-3.5 rounded-2xl hover:bg-slate-200 transition-colors text-sm">Cek Lagi</button>
                    <button onClick={() => { setAppModal({ show: false, type: '', message: '' }); handleSubmit(); }} className="flex-1 bg-[var(--pintarly-yellow)] text-[var(--black-charcoal)] font-bold py-3.5 rounded-2xl hover:bg-[#e8cd65] transition-colors shadow-sm text-sm">Ya, Kirim</button>
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {showWarningModal && (
          <div className="fixed inset-0 bg-red-900/60 backdrop-blur-md z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-[32px] max-w-sm w-full p-8 text-center shadow-2xl animate-scale-in">
              <ShieldAlert className="w-16 h-16 text-red-500 mx-auto mb-5" />
              <h3 className="text-xl font-bold text-[var(--black-charcoal)] mb-3 tracking-tight">Peringatan Keamanan</h3>
              <p className="text-slate-600 mb-8 text-sm leading-relaxed font-medium">Sistem mendeteksi Anda keluar dari halaman ujian. Ini pelanggaran ke-{warnings} dari maksimal 3 kali. Jika Anda keluar lebih dari 3 kali atau selama 30 detik berturut-turut, ujian akan diakhiri otomatis.</p>
              <button onClick={() => setShowWarningModal(false)} className="w-full bg-red-600 text-white font-bold py-3.5 rounded-2xl hover:bg-red-700 transition-all text-sm">Saya Paham</button>
            </div>
          </div>
        )}

        {/* Top Navbar */}
        <header className="pintarly-glass border-b border-black/5 px-4 md:px-6 h-[64px] flex items-center justify-between shrink-0 z-40">
          <div className="flex items-center gap-3">
            <LogoSE className="w-8 h-8" />
            <div className="hidden sm:block">
              <div className="font-bold text-[var(--black-charcoal)] text-sm leading-tight tracking-tight">MITRA TAMBAHAN 2026</div>
              <div className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-0.5">BPS Pacitan</div>
            </div>
          </div>
          
          <div className="flex items-center gap-3 md:gap-5">
            <div className="hidden md:flex items-center gap-2 bg-white/70 border border-white px-4 py-1.5 rounded-full shadow-sm">
              <User className="w-4 h-4 text-slate-400" />
              <span className="text-[12px] font-bold text-slate-700 truncate max-w-[150px]">{user.namaLengkap || user.email}</span>
            </div>
            <div className={`flex items-center gap-2 px-4 py-1.5 rounded-full font-mono text-sm font-bold transition-colors shadow-sm ${timeLeft < 300 ? 'bg-red-50 text-red-600 border border-red-200 animate-pulse' : 'bg-white border border-slate-100 text-[var(--black-charcoal)]'}`}>
              <Clock className="w-4 h-4" />
              {formatTime(timeLeft)}
            </div>
          </div>
        </header>

        {/* Main Workspace */}
        <main className="flex-1 flex flex-col md:flex-row max-w-[1200px] w-full mx-auto p-3 md:p-5 gap-4 min-h-0">

          {/* Tombol Toggle Peta Soal (Hanya Muncul di Mobile) */}
          <button 
            onClick={() => setShowMap(!showMap)} 
            className="md:hidden w-full pintarly-glass p-3 rounded-2xl flex items-center justify-center gap-2 font-bold text-sm text-[var(--black-charcoal)] shadow-sm active:scale-95 transition-transform shrink-0"
          >
            {showMap ? <X className="w-5 h-5 text-red-500" /> : <Menu className="w-5 h-5 text-[var(--se-primary)]" />}
            {showMap ? "Tutup Navigasi Peta Soal" : "Lihat Peta Soal & Navigasi"}
          </button>

          {/* Soal Area (Sembunyikan di mobile jika Peta Soal sedang dibuka) */}
          <div className={`flex-1 flex-col min-h-0 relative ${showMap ? 'hidden md:flex' : 'flex'}`}>
            <div className="pintarly-glass rounded-[24px] flex-1 flex flex-col overflow-hidden shadow-sm border-white">
              
              <div className="px-5 py-4 border-b border-slate-100/50 flex justify-between items-center bg-white/40 shrink-0">
                <span className="text-[11px] font-bold text-slate-500 tracking-widest uppercase bg-slate-100/50 px-3 py-1 rounded-full">Soal {currentQuestion + 1} / {quizData.length}</span>
                {answers[q.id] && (
                  <button 
                    onClick={() => handleClearAnswer(q.id)}
                    className="flex items-center gap-1.5 text-[12px] font-bold text-slate-400 hover:text-red-500 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" /> <span className="hidden sm:inline">Hapus Pilihan</span>
                  </button>
                )}
              </div>
              
              <div key={currentQuestion} className="flex-1 overflow-y-auto custom-scrollbar p-5 md:p-8 animate-fade-up">
                <h2 className="text-lg md:text-xl text-[var(--black-charcoal)] mb-8 whitespace-pre-wrap leading-relaxed font-semibold">
                  {q.text}
                </h2>
                
                <div className="space-y-3">
                  {Object.entries(q.options).map(([key, value]) => {
                    const strValue = value != null ? String(value) : "";
                    if (strValue.trim() === "") return null;
                    const isSelected = answers[q.id] === key;
                    
                    return (
                      <label key={key} 
                        onClick={() => handleAnswer(q.id, key)}
                        className={`group flex items-center p-4 rounded-[16px] cursor-pointer transition-all duration-300 border hover-slide-right ${
                          isSelected 
                          ? 'border-[var(--black-charcoal)] bg-white shadow-sm' 
                          : 'border-slate-200 bg-white/60 hover:border-slate-400 hover:bg-white'
                        }`}>
                        <div className={`w-6 h-6 rounded-full border-[2px] flex items-center justify-center mr-4 flex-shrink-0 transition-colors ${
                          isSelected ? 'border-[var(--black-charcoal)] bg-[var(--pintarly-yellow)]' : 'border-slate-300 bg-slate-50 group-hover:border-slate-400'
                        }`}>
                          {isSelected && <div className="w-2 h-2 rounded-full bg-[var(--black-charcoal)]"></div>}
                        </div>
                        <span className={`font-bold text-[14px] w-8 transition-colors ${isSelected ? 'text-[var(--black-charcoal)]' : 'text-slate-400'}`}>{key}.</span>
                        <span className={`text-[14px] md:text-base transition-colors ${isSelected ? 'text-[var(--black-charcoal)] font-bold' : 'text-slate-600 font-medium'}`}>{strValue}</span>
                      </label>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Navigasi Bawah */}
            <div className="flex justify-between mt-4 shrink-0 gap-3">
              <button 
                onClick={() => setCurrentQuestion(prev => Math.max(0, prev - 1))}
                disabled={currentQuestion === 0}
                className="px-5 py-3.5 bg-white border border-slate-200 text-slate-600 font-bold rounded-2xl shadow-sm disabled:opacity-40 hover:bg-slate-50 flex items-center gap-2 transition-all hover-scale-up text-sm">
                <ChevronLeft className="w-5 h-5" /> <span className="hidden sm:inline">Kembali</span>
              </button>
              
              {currentQuestion === quizData.length - 1 ? (
                <button 
                  onClick={confirmSubmit}
                  className="px-6 py-3.5 bg-[var(--pintarly-yellow)] text-[var(--black-charcoal)] font-bold rounded-2xl shadow-sm hover:bg-[var(--pintarly-yellow-hover)] flex items-center gap-2 transition-all hover-scale-up text-sm">
                  Kirim Jawaban <CheckCircle className="w-5 h-5" />
                </button>
              ) : (
                <button 
                  onClick={() => setCurrentQuestion(prev => Math.min(quizData.length - 1, prev + 1))}
                  className="px-6 py-3.5 bg-[var(--black-charcoal)] text-white font-bold rounded-2xl shadow-sm hover:bg-black flex items-center gap-2 transition-all hover-scale-up text-sm flex-1 sm:flex-none justify-center">
                  Lanjut <ChevronRight className="w-5 h-5" />
                </button>
              )}
            </div>
          </div>

          {/* Sidebar Navigasi Soal */}
          <div className={`${showMap ? 'flex' : 'hidden'} md:flex w-full md:w-64 flex-shrink-0 flex-col min-h-0 h-[65vh] md:h-auto animate-fade-up md:animate-none`}>
            <div className="pintarly-glass rounded-[24px] p-5 flex flex-col h-full shadow-sm border-white">
              <div className="flex items-center gap-2 text-[var(--black-charcoal)] font-bold text-[12px] uppercase tracking-wider mb-4 shrink-0">
                <BarChart3 className="w-4 h-4 text-blue-500" /> Peta Soal
              </div>
              
              <div className="grid grid-cols-5 md:grid-cols-5 gap-2 overflow-y-auto custom-scrollbar pr-1 flex-1 content-start">
                {quizData.map((item, index) => {
                  const isAnswered = !!answers[item.id];
                  const isCurrent = currentQuestion === index;
                  
                  let btnClass = "h-11 md:h-9 text-[13px] md:text-[12px] font-bold rounded-xl transition-all flex items-center justify-center border ";
                  if (isCurrent) {
                    btnClass += "border-[var(--black-charcoal)] bg-white text-[var(--black-charcoal)] shadow-sm scale-110";
                  } else if (isAnswered) {
                    btnClass += "border-transparent bg-[var(--pintarly-yellow)] text-[var(--black-charcoal)]";
                  } else {
                    btnClass += "border-slate-200 bg-slate-50/80 text-slate-400 hover:bg-white";
                  }

                  return (
                    <button 
                      key={item.id} 
                      onClick={() => {
                        setCurrentQuestion(index);
                        setShowMap(false); 
                      }} 
                      className={btnClass}
                    >
                      {index + 1}
                    </button>
                  );
                })}
              </div>
              
              <div className="pt-4 border-t border-slate-100/80 shrink-0 mt-4 flex justify-between items-end">
                <div className="space-y-2 w-full">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-[11px] font-bold text-slate-500 uppercase tracking-widest">
                      <div className="w-3 h-3 bg-[var(--pintarly-yellow)] rounded-sm"></div> Terjawab
                    </div>
                    <span className="font-bold text-[var(--black-charcoal)] text-sm">{Object.keys(answers).length}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-[11px] font-bold text-slate-500 uppercase tracking-widest">
                      <div className="w-3 h-3 bg-slate-50 border border-slate-200 rounded-sm"></div> Belum
                    </div>
                    <span className="font-bold text-[var(--black-charcoal)] text-sm">{quizData.length - Object.keys(answers).length}</span>
                  </div>
                  <button 
                    onClick={confirmSubmit}
                    className="w-full mt-3 py-3 text-[var(--black-charcoal)] font-bold bg-white border border-slate-200 hover:border-[var(--black-charcoal)] hover:bg-slate-50 rounded-xl transition-all text-xs">
                    Kirim Sekarang
                  </button>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (view === 'result') {
    return (
      <div className="h-[100svh] w-screen flex items-center justify-center p-4 font-sans relative">
        <AppStylesAndBackground />
        
        {score.isPassed && <Confetti />}

        <div className={`max-w-[400px] w-full pintarly-glass rounded-[32px] shadow-2xl overflow-hidden text-center border-white relative z-10 ${!score.isPassed && 'animate-[floating_0.5s_ease-in-out_2]'}`}>
          
          <div className="bg-white/50 pt-10 pb-8 px-8 border-b border-black/5">
            <div className={`w-16 h-16 rounded-[16px] flex items-center justify-center mx-auto mb-5 shadow-sm transform ${score.isPassed ? 'bg-[#ffe16f] rotate-3 animate-floating' : 'bg-red-100 -rotate-3'}`}>
              {score.isPassed ? <CheckCircle className="w-8 h-8 text-[var(--black-charcoal)]" /> : <XCircle className="w-8 h-8 text-red-500" />}
            </div>
            <h1 className="text-2xl font-bold text-[var(--black-charcoal)] mb-1 tracking-tight">Ujian Selesai!</h1>
            <p className="text-slate-500 text-[12px] px-2 leading-relaxed font-medium">Data pengerjaan terekam aman di server BPS.</p>
          </div>
          
          <div className="p-8">
            <div className="mb-8">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Skor Akhir</p>
              <div className="text-6xl font-black mb-4 text-[var(--black-charcoal)] tracking-tighter">
                {score.value}
              </div>
              <div className={`inline-flex items-center px-4 py-1.5 rounded-lg font-bold text-[11px] ${
                score.isPassed ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
              }`}>
                {score.isPassed ? '✅ LULUS' : '❌ TIDAK LULUS'}
              </div>
            </div>

            <div className="space-y-3 mb-8 text-left bg-white/80 p-5 rounded-2xl border border-white shadow-sm">
              <div className="flex justify-between items-center">
                <span className="text-[12px] text-slate-500 font-bold">Peserta</span>
                <span className="text-[12px] font-bold text-[var(--black-charcoal)] truncate max-w-[120px]">{user.namaLengkap || user.email}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[12px] text-slate-500 font-bold">Sisa Kuota</span>
                <span className="text-[12px] font-bold text-[var(--black-charcoal)]">{2 - attemptCount} Percobaan</span>
              </div>
            </div>

            <div className="space-y-3">
              <button 
                onClick={handleDownloadBukti} 
                className="w-full bg-[var(--pintarly-yellow)] hover:bg-[var(--pintarly-yellow-hover)] text-[var(--black-charcoal)] font-bold py-4 rounded-2xl transition-all shadow-sm hover-scale-up text-sm flex items-center justify-center gap-2">
                <Download className="w-4 h-4"/> Unduh Bukti Nilai
              </button>
              
              <button 
                onClick={() => window.location.reload()} 
                className="w-full bg-[var(--black-charcoal)] hover:bg-black text-white font-bold py-4 rounded-2xl transition-all shadow-md hover-scale-up text-sm">
                Selesai & Keluar
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
}