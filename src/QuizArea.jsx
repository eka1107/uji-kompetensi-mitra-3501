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
  const startTime = stateData.startTime || '';

  const [view, setView] = useState('instructions'); 
  const [answers, setAnswers] = useState({});
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [timeLeft, setTimeLeft] = useState(jadwalServer.durasi * 60); 
  const [warnings, setWarnings] = useState(0);
  const [showWarningModal, setShowWarningModal] = useState(false);
  const [appModal, setAppModal] = useState({ show: false, type: '', message: '', title: '' });
  const [showMap, setShowMap] = useState(false); 
  const [loadingLogo, setLoadingLogo] = useState(LOGO_BPS);
  
  const submitRef = useRef(null);
  const isSubmitting = useRef(false);

  useEffect(() => {
    window.history.pushState(null, null, window.location.href);
    const handlePopState = () => { window.history.pushState(null, null, window.location.href); };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  useEffect(() => {
    let logoTimer;
    if (view === 'saving') {
      logoTimer = setInterval(() => { setLoadingLogo(prev => prev === LOGO_BPS ? '/logo.png' : LOGO_BPS); }, 750);
    }
    return () => clearInterval(logoTimer);
  }, [view]);

  useEffect(() => {
    if (view === 'quiz') {
      const handleContextMenu = (e) => { e.preventDefault(); alert("Fungsi klik kanan dinonaktifkan."); };
      const handleCopy = (e) => { e.preventDefault(); alert("Fungsi Salin dinonaktifkan."); };
      const handleKeyDown = (e) => {
        if (e.key === 'PrintScreen' || (e.ctrlKey && e.key === 'p') || e.key === 'F11') {
          e.preventDefault();
          try { navigator.clipboard.writeText(''); } catch(err){}
          alert('Pelanggaran! Fitur screenshot/print diblokir.');
        }
      };

      const triggerCheatWarning = (msg) => {
        setWarnings(prev => {
          const newWarnings = prev + 1;
          if (newWarnings >= 3) { 
             if (!isSubmitting.current && submitRef.current) submitRef.current(); 
          } 
          else { setShowWarningModal(true); }
          return newWarnings;
        });
      };

      const handleFullscreenChange = () => { if (!document.fullscreenElement) triggerCheatWarning("Keluar dari Layar Penuh terdeteksi!"); };
      const handleWindowBlur = () => { triggerCheatWarning("Membuka aplikasi/jendela lain terdeteksi!"); };

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
      if (!isSubmitting.current && submitRef.current) submitRef.current();
    }
    return () => clearInterval(timer);
  }, [view, timeLeft]);

  const handleSubmit = useCallback(async () => {
    if (isSubmitting.current) return; 
    isSubmitting.current = true;

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
      akun: user.email, nama: user.namaLengkap, skor: finalScore, percobaan: attemptCount, keterangan: finalScore >= 70 ? 'LULUS' : 'TIDAK LULUS', detail: detailJawaban
    };

    try { fetch(GOOGLE_SCRIPT_WEB_APP_URL, { method: 'POST', mode: 'no-cors', body: JSON.stringify(payload) }); } catch (e) {}
    setTimeout(() => setView('result'), 2000);
  }, [answers, quizData, startTime, user.email, user.namaLengkap, attemptCount]);

  useEffect(() => { submitRef.current = handleSubmit; }, [handleSubmit]);

  if (!location.state || !location.state.user) {
    return <Navigate to="/" replace />;
  }

  const startQuiz = () => {
    try { const elem = document.documentElement; if (elem.requestFullscreen) { elem.requestFullscreen(); } } catch (e) {}
    try { fetch(GOOGLE_SCRIPT_WEB_APP_URL, { method: 'POST', mode: 'no-cors', body: JSON.stringify({ action: "mulai_sesi", email: user.email, waktu_mulai: getLocalTime() }) }); } catch(e){}
    setView('quiz');
  };

  const handleKeluar = () => { navigate('/', { replace: true }); };

  // ==========================================
  // RENDER VIEWS
  // ==========================================
  if (view === 'instructions') {
    return (
      <div className="h-[100svh] w-screen flex items-center justify-center p-3 relative overflow-hidden bg-transparent">
        <div className="max-w-[650px] w-full bg-white/95 backdrop-blur-xl rounded-[32px] animate-fade-up border border-white shadow-2xl flex flex-col max-h-full relative overflow-hidden">
          <div className="p-6 border-b border-slate-100 text-center shrink-0 bg-white relative">
            <button onClick={handleKeluar} className="absolute right-5 top-5 p-2 bg-slate-50 hover:bg-red-50 text-slate-400 hover:text-red-500 transition-colors rounded-xl flex items-center gap-2 text-[10px] font-black uppercase tracking-widest border border-slate-200 hover:border-red-200"><LogOut size={14} /> Keluar</button>
            <BookOpen className="w-10 h-10 text-orange-500 mx-auto mb-3" />
            <h1 className="text-xl font-black text-slate-800 tracking-tight uppercase">Instruksi Pengerjaan</h1>
            <p className="text-slate-500 mt-2 text-xs font-medium leading-relaxed max-w-md mx-auto">Selamat datang di Tes Kompetensi Daring,<br/><span className="font-black text-orange-600 text-sm">{user.namaLengkap || user.email}</span></p>
          </div>
          <div className="flex-1 p-6 space-y-4 overflow-hidden flex flex-col">
             <div className="grid grid-cols-2 gap-3 shrink-0">
                <div className="bg-gradient-to-br from-orange-500 to-orange-600 text-white p-4 rounded-[20px] flex items-center gap-3 shadow-lg shadow-orange-200 border border-orange-400">
                   <Clock className="w-8 h-8 opacity-80" />
                   <div><p className="text-[9px] uppercase font-black opacity-80 tracking-widest leading-none mb-1">Durasi Ujian</p><p className="text-xl font-black leading-none">{jadwalServer.durasi} Menit</p></div>
                </div>
                <div className="bg-gradient-to-br from-[#facc15] to-[#eab308] text-slate-900 p-4 rounded-[20px] flex items-center gap-3 shadow-lg shadow-yellow-200 border border-yellow-300">
                   <Database className="w-8 h-8 opacity-80" />
                   <div><p className="text-[9px] uppercase font-black opacity-80 tracking-widest leading-none mb-1">Total Soal</p><p className="text-xl font-black leading-none">{quizData.length} Butir</p></div>
                </div>
             </div>
             <div className="bg-slate-50 p-5 rounded-[24px] border border-slate-200 flex-1 overflow-y-auto custom-scrollbar space-y-3">
                <div className="flex gap-3"><div className="mt-0.5"><Lock className="text-orange-500 w-4 h-4" /></div><div><p className="text-xs font-black text-slate-700">Wajib Layar Penuh</p><p className="text-[11px] text-slate-500 font-medium">Sistem mengunci perangkat ke mode fullscreen.</p></div></div>
                <div className="flex gap-3"><div className="mt-0.5"><ShieldAlert className="text-red-500 w-4 h-4" /></div><div><p className="text-xs font-black text-slate-700">Dilarang Screenshot</p><p className="text-[11px] text-slate-500 font-medium">Screenshot & copy-paste dinonaktifkan.</p></div></div>
                <div className="flex gap-3"><div className="mt-0.5"><AlertTriangle className="text-red-600 w-4 h-4" /></div><div><p className="text-xs font-black text-red-600">Sistem Anti-Curang Aktif</p><p className="text-[11px] text-red-500 font-bold">Keluar tab / Split Screen 3 kali = DISKUALIFIKASI otomatis.</p></div></div>
                <div className="flex gap-3"><div className="mt-0.5"><CheckCircle2 className="text-blue-500 w-4 h-4" /></div><div><p className="text-xs font-black text-slate-700">Tidak Dapat Diulang</p><p className="text-[11px] text-slate-500 font-medium">Ujian bersifat final setelah Anda klik mulai.</p></div></div>
             </div>
          </div>
          <div className="p-6 pt-0 shrink-0">
            <button onClick={startQuiz} className="w-full bg-[#1A1A1B] font-black py-4 rounded-2xl shadow-xl hover:scale-[1.02] text-white flex justify-center items-center gap-2 uppercase tracking-widest text-xs transition-all">SAYA MENGERTI, MULAI UJIAN <ArrowRight size={16}/></button>
          </div>
        </div>
      </div>
    );
  }

  if (view === 'saving') {
    return (
      <div className="h-[100svh] flex flex-col items-center justify-center relative bg-transparent">
        <img src={loadingLogo} className="w-20 h-20 mb-6 transition-all duration-300 object-contain drop-shadow-md" alt="Logo" onError={(e) => e.target.style.display = 'none'} />
        <Loader2 className="w-10 h-10 animate-spin text-orange-500 mb-4"/>
        <p className="font-black text-slate-500 uppercase tracking-widest text-xs">Menyimpan Hasil Ujian...</p>
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

        <header className="bg-white/90 backdrop-blur-md px-4 md:px-6 h-[70px] flex items-center justify-between z-40 shrink-0 border-b border-slate-200 shadow-sm">
          <div className="flex items-center gap-3">
            <img src={LOGO_BPS} className="w-9 h-9 object-contain drop-shadow-sm" alt="Logo" />
            <div className="font-black text-sm hidden sm:block tracking-tight text-slate-800 uppercase">Uji Kompetensi Calon Mitra Tambahan 2026</div>
          </div>
          <div className="flex gap-3 items-center">
             <div className="hidden md:flex items-center gap-2 bg-slate-50 border border-slate-100 px-4 py-2 rounded-full shadow-sm">
                <User className="w-4 h-4 text-orange-500" />
                <span className="text-xs font-black uppercase tracking-wider text-slate-700 truncate max-w-[150px]">{user.namaLengkap || user.email}</span>
             </div>
             <div className={`font-mono text-sm md:text-base font-black px-6 py-2 rounded-full shadow-lg border-2 flex items-center gap-2 transition-all ${timeLeft < 300 ? 'bg-red-500 text-white border-red-600 animate-pulse' : 'bg-gradient-to-r from-[#ffe16f] to-[#facc15] text-[#1A1A1B] border-yellow-400'}`}>
                <Clock size={16} />{formatTime(timeLeft)}
             </div>
          </div>
        </header>

        <main className="flex-1 flex flex-col md:flex-row max-w-[1200px] w-full mx-auto p-3 md:p-5 gap-4 min-h-0">
          <button onClick={() => setShowMap(!showMap)} className="md:hidden w-full bg-white p-3.5 rounded-2xl font-black text-xs text-slate-700 shadow-md border border-slate-100 uppercase tracking-widest flex items-center justify-center gap-2 shrink-0">
            {showMap ? <XCircle size={16}/> : <BarChart3 size={16}/>} {showMap ? "Tutup Peta Soal" : "Navigasi Peta Soal"}
          </button>

          <div className={`flex-1 flex-col min-h-0 ${showMap ? 'hidden md:flex' : 'flex'}`}>
            <div className="bg-white/90 backdrop-blur-md rounded-[24px] flex-1 flex flex-col shadow-lg border border-white overflow-hidden relative">
              <div className="px-5 py-3 border-b border-slate-100 bg-white flex justify-between items-center z-10">
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest bg-slate-50 border border-slate-200 px-3 py-1 rounded-full shadow-sm">Soal {currentQuestion + 1} dari {quizData.length}</span>
                {answers[q.id] && <button onClick={() => setAnswers(prev => { const n = {...prev}; delete n[q.id]; return n; })} className="text-[10px] font-black text-red-400 hover:text-red-600 hover:bg-red-50 px-2 py-1 rounded uppercase tracking-widest flex items-center gap-1.5 transition-colors"><Trash2 className="w-3.5 h-3.5"/> Hapus Jawaban</button>}
              </div>
              <div className="flex-1 overflow-y-auto p-5 md:p-8 custom-scrollbar">
                <h2 className="text-base md:text-lg font-bold text-slate-800 mb-8 whitespace-pre-wrap leading-relaxed">{q.text}</h2>
                <div className="space-y-3">
                  {q.shuffledOptions.map((opt, index) => {
                    const uiLabel = String.fromCharCode(65 + index); 
                    const isSelected = answers[q.id] === opt.key; 
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

            <div className="flex justify-between mt-4 shrink-0 gap-3">
              <button onClick={() => setCurrentQuestion(p => Math.max(0, p - 1))} disabled={currentQuestion === 0} className="px-6 py-4 bg-white border border-slate-200 rounded-xl font-black text-slate-600 shadow-md disabled:opacity-40 uppercase tracking-widest text-xs flex-1 md:flex-none transition-all active:scale-95"><ChevronLeft size={18} className="inline mr-1" /> Kembali</button>
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

          <div className={`${showMap ? 'flex' : 'hidden'} md:flex w-full md:w-[300px] flex-shrink-0 flex-col min-h-0 h-max md:h-full flex`}>
            <div className="bg-white/90 backdrop-blur-md rounded-[24px] p-5 flex flex-col h-full shadow-lg border border-white">
              <div className="font-black text-[11px] uppercase tracking-widest text-slate-400 mb-4 flex items-center gap-2 border-b border-slate-100 pb-3"><BarChart3 className="w-4 h-4 text-orange-500"/> Navigasi Peta Soal</div>
              <div className="grid grid-cols-5 md:grid-cols-4 lg:grid-cols-5 gap-2 overflow-y-auto flex-1 content-start custom-scrollbar pr-1 pb-2">
                {quizData.map((item, idx) => {
                   const isAnswered = answers[item.id] !== undefined;
                   const isCurrent = currentQuestion === idx;
                   let btnClass = 'border-slate-200 bg-white text-slate-400 hover:border-slate-300';
                   
                   // --- PERUBAHAN WARNA TOMBOL NAVIGASI SOAL TERJAWAB KE HITAM ---
                   if (isCurrent) btnClass = 'border-orange-500 bg-orange-500 text-white shadow-md scale-105 z-10';
                   else if (isAnswered) btnClass = 'border-[#1A1A1B] bg-[#1A1A1B] text-white font-black shadow-sm';
                   
                   return <button key={item.id} onClick={() => { setCurrentQuestion(idx); if(window.innerWidth < 768) setShowMap(false); }} className={`h-11 md:h-12 text-xs font-black rounded-[14px] border-2 transition-all duration-200 flex items-center justify-center ${btnClass}`}>{idx + 1}</button>;
                })}
              </div>
              <div className="mt-4 pt-4 border-t border-slate-100 grid grid-cols-2 gap-2">
                {/* --- PERUBAHAN WARNA LEGEND MENJADI HITAM --- */}
                <div className="flex items-center gap-2"><div className="w-2.5 h-2.5 rounded-full bg-[#1A1A1B]"></div><span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Terjawab</span></div>
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
          <p className="text-slate-500 text-sm mb-8 font-medium leading-relaxed">Terima kasih telah mengikuti Uji Kompetensi Mitra Tambahan 2026. Bukti pengerjaan telah diamankan di sistem kami.</p>
          <div className="text-left bg-slate-50 p-6 rounded-[24px] mb-8 border border-slate-100">
             <div className="flex justify-between border-b border-slate-200/50 pb-3 mb-3 items-center"><span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Peserta</span><span className="text-xs font-black text-slate-800">{user.email}</span></div>
             <div className="flex justify-between items-center"><span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Waktu Selesai</span><span className="text-xs font-black text-slate-800">{getLocalTime().split(' ')[1]} WIB</span></div>
          </div>
          <button onClick={handleKeluar} className="w-full bg-[#1A1A1B] hover:bg-black text-white font-black py-4 rounded-2xl flex justify-center gap-3 items-center hover-scale-up uppercase tracking-widest text-xs transition-all shadow-xl">Kembali ke Beranda <LogOut size={16}/></button>
        </div>
      </div>
    );
  }

  return null;
}