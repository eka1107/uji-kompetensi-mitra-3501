// --- ParticipantLogin.jsx ---
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertCircle, CalendarClock, Loader2 } from 'lucide-react';
import { GOOGLE_SCRIPT_WEB_APP_URL, LOGO_BPS, shuffleArray, getLocalTime } from './config.js';

export default function ParticipantLogin() {
  const navigate = useNavigate();
  const [view, setView] = useState('init'); 
  const [user, setUser] = useState({ email: '', token: '', namaLengkap: '' });
  const [loginError, setLoginError] = useState('');
  const [isLoggingIn, setIsLoadingIn] = useState(false);
  const [emailWarning, setEmailWarning] = useState('');
  const [loadingLogo, setLoadingLogo] = useState(LOGO_BPS);
  const [globalState, setGlobalState] = useState(null);

  const checkJadwal = (mulai, selesai) => {
    const now = new Date().getTime();
    if (mulai === 0 && selesai === 0) return 'buka'; 
    if (now < mulai) return 'belum_mulai';
    if (now > selesai) return 'sudah_selesai';
    return 'buka';
  };

  useEffect(() => {
    let logoTimer;
    if (view === 'init' || view === 'fetching_soal') {
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
        
        const jadwalServer = {
          mulai: Number(data.jadwal.mulai) || 0,
          selesai: Number(data.jadwal.selesai) || 0,
          durasi: Number(data.jadwal.durasi) || 45
        };

        const formattedQuestions = data.soal.filter(row => row.soal && row.jawaban).map((row, index) => {
          const rawOptions = [
            { key: 'A', text: row.a != null ? String(row.a) : "" },
            { key: 'B', text: row.b != null ? String(row.b) : "" },
            { key: 'C', text: row.c != null ? String(row.c) : "" },
            { key: 'D', text: row.d != null ? String(row.d) : "" },
            { key: 'E', text: row.e != null ? String(row.e) : "" }
          ].filter(o => o.text.trim() !== '' && o.text.trim() !== 'null');
          return { id: `q_${index}`, text: String(row.soal), shuffledOptions: shuffleArray(rawOptions), answer: String(row.jawaban).trim().toUpperCase() };
        });

        setGlobalState({ 
          accounts: data.akun, 
          adminData: data.nilai, 
          hasilWawancara: data.hasil_wawancara || [], 
          quizData: shuffleArray(formattedQuestions), 
          jadwalServer 
        });
        
        const statusJadwal = checkJadwal(jadwalServer.mulai, jadwalServer.selesai);
        if (statusJadwal !== 'buka') setView(statusJadwal);
        else setView('login');
      } catch (error) { setView('error_init'); }
    };
    fetchInitData();
  }, []);

  const checkEmail = (email) => {
    if (!email || !globalState) { setEmailWarning(''); return; }
    const exists = globalState.accounts.some(acc => String(acc.email).trim().toLowerCase() === String(email).trim().toLowerCase());
    if (!exists) setEmailWarning('Email belum terdaftar di database.');
    else setEmailWarning('');
  };

  const handlePesertaLogin = async (e) => {
    e.preventDefault();
    setLoginError('');

    const statusJadwal = checkJadwal(globalState.jadwalServer.mulai, globalState.jadwalServer.selesai);
    if (statusJadwal !== 'buka') { setView(statusJadwal); return; }
    if (user.token !== 'BPS2026') { setLoginError('Token ujian tidak valid.'); return; }

    const isValidUser = globalState.accounts.find(acc => String(acc.email).trim().toLowerCase() === String(user.email).trim().toLowerCase());

    if (isValidUser) {
      setIsLoadingIn(true);
      const finalUser = { ...user, namaLengkap: isValidUser.nama };
      
      // =======================================================
      // 🛡️ PERBAIKAN LOGIKA VALIDASI: STRIKTIF BERDASARKAN KOLOM A (EMAIL)
      // =======================================================
      const sudahUjianPG = globalState.adminData.find(n => String(n.akun).trim().toLowerCase() === String(user.email).trim().toLowerCase());
      
      // Validasi mutlak mencocokkan email peserta dengan Kolom A (email) di sheet hasil_wawancara
      const sudahIsiEsai = globalState.hasilWawancara.find(h => 
        String(h.email).trim().toLowerCase() === String(user.email).trim().toLowerCase()
      );

      if (sudahUjianPG && sudahIsiEsai) {
         setLoginError("Anda sudah menyelesaikan seluruh rangkaian tes kompetensi, hubungi panitia jika terdapat kendala");
         setIsLoadingIn(false);
         return;
      }

      setView('fetching_soal');
      setTimeout(() => {
        if (sudahUjianPG && !sudahIsiEsai) {
           // SUDAH PG TAPI BELUM ESAI -> LEMPAR KE PORTAL WAWANCARA (ESAI)
           navigate('/wawancara', { state: { user: finalUser, jadwalServer: globalState.jadwalServer } });
        } else {
           // BELUM PG -> LEMPAR KE QUIZAREA (PILIHAN GANDA)
           const historyAttempts = globalState.adminData.filter(row => row.akun && String(row.akun).trim().toLowerCase() === String(user.email).trim().toLowerCase());
           const attemptCount = historyAttempts.length + 1;
           navigate('/quiz', { 
             replace: true, 
             state: { user: finalUser, quizData: globalState.quizData, jadwalServer: globalState.jadwalServer, attemptCount, startTime: getLocalTime() }
           });
        }
      }, 1500);
      // =======================================================

    } else { setLoginError('Alamat email tidak terdaftar.'); }
  };

  if (view === 'init' || view === 'fetching_soal') {
    return (
      <div className="h-[100svh] w-screen flex flex-col items-center justify-center relative bg-transparent">
        <img src={loadingLogo} className="w-24 h-24 mb-6 transition-all duration-300 object-contain drop-shadow-md" alt="Logo" onError={(e) => e.target.style.display = 'none'} />
        <Loader2 className="w-10 h-10 animate-spin mb-4 text-orange-500" />
        <h2 className="text-sm font-black animate-fade-up text-slate-600 uppercase tracking-widest">{view === 'init' ? 'Menyiapkan Sistem...' : 'Membuka Sesi...'}</h2>
      </div>
    );
  }

  if (view === 'belum_mulai' || view === 'sudah_selesai' || view === 'error_init') {
    return (
      <div className="h-[100svh] w-screen flex items-center justify-center p-4 relative bg-transparent">
        <div className="max-w-[420px] w-full bg-white rounded-[32px] p-8 text-center animate-fade-up shadow-2xl border border-slate-100">
          <CalendarClock className="w-12 h-12 text-orange-500 mx-auto mb-4" />
          <h1 className="text-2xl font-black text-slate-800 mb-2 uppercase">Akses Ditutup</h1>
          <p className="text-slate-500 text-sm mb-6 font-medium">Pelaksanaan uji kompetensi belum dibuka/sudah ditutup</p>
          <button onClick={() => window.location.reload()} className="w-full bg-[#1A1A1B] text-white font-bold py-4 rounded-xl shadow-sm hover-scale-up uppercase tracking-widest text-xs transition-all">Coba Muat Ulang</button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-[100svh] w-screen flex items-center justify-center p-4 relative bg-transparent">
      <div className="max-w-[420px] w-full bg-white rounded-[32px] p-8 md:p-10 relative animate-fade-up shadow-2xl border border-slate-100">
        <div className="mb-8 text-center flex flex-col items-center">
          <img src={LOGO_BPS} alt="Logo BPS" className="w-16 h-16 mb-4 drop-shadow-sm object-contain" onError={(e) => e.target.style.display = 'none'} />
          <h1 className="text-[20px] font-black text-[#1A1A1B] leading-snug uppercase tracking-tight">Uji Kompetensi<br/> Calon Mitra Tambahan 2026</h1>
          <h2 className="text-[12px] font-bold text-slate-500 mt-2 uppercase tracking-widest">Badan Pusat Statistik<br className="sm:hidden"/> Kabupaten Pacitan</h2>
        </div>
        <form onSubmit={handlePesertaLogin} className="space-y-4">
          {loginError && <div className="bg-red-50 text-red-600 p-3 rounded-xl text-xs flex items-center gap-2 font-bold"><AlertCircle className="w-4 h-4 shrink-0"/>{loginError}</div>}
          <div>
            <input required type="email" placeholder="Alamat Email Terdaftar" value={user.email} onChange={e => setUser({...user, email: e.target.value})} onBlur={e => checkEmail(e.target.value)} className="w-full px-4 py-3.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:border-orange-500 outline-none font-medium transition-colors" />
            {emailWarning && <p className="text-red-500 text-[10px] mt-1.5 font-bold ml-2">{emailWarning}</p>}
          </div>
          <input required type="text" placeholder="TOKEN UJIAN" value={user.token} onChange={e => setUser({...user, token: e.target.value})} autoCapitalize="none" className="w-full px-4 py-3.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:border-orange-500 outline-none font-black tracking-[0.2em] text-center transition-colors" />
          <button type="submit" disabled={isLoggingIn || emailWarning !== ''} className="w-full bg-[#ffe16f] hover:bg-[#facc15] text-[#1A1A1B] font-black py-4 rounded-xl shadow-lg shadow-yellow-200/50 hover-scale-up uppercase tracking-widest text-xs mt-2 disabled:opacity-50 transition-all">
            {isLoggingIn ? "Memverifikasi..." : "Masuk"}
          </button>
        </form>
        <p className="text-center text-[10px] font-bold text-slate-400 mt-6">©2026 Tim PLS BPS Kabupaten Pacitan</p>
      </div>
    </div>
  );
}