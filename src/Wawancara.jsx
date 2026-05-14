// --- Wawancara.jsx ---
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, LogOut, ChevronRight, CheckCircle2, UserCheck, MessageCircle, AlertCircle, Save, ArrowLeft, Loader2 } from 'lucide-react';
import { GOOGLE_SCRIPT_WEB_APP_URL, LOGO_BPS } from './config.js';

export default function WawancaraArea() {
  const navigate = useNavigate();
  const [view, setView] = useState('login'); 
  const [isLoading, setIsLoading] = useState(false);
  
  // Data Master dari Database
  const [dbPetugas, setDbPetugas] = useState([]);
  const [dbPeserta, setDbPeserta] = useState([]);
  const [dbSoal, setDbSoal] = useState([]);

  // State Aktif
  const [petugasActive, setPetugasActive] = useState('');
  const [pesertaActive, setPesertaActive] = useState(null);
  const [loginEmail, setLoginEmail] = useState('');
  const [loginError, setLoginError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  // Form Wawancara
  const [jawabanList, setJawabanList] = useState({});
  const [keteranganAkhir, setKeteranganAkhir] = useState('Dipertimbangkan'); // Default status

  useEffect(() => {
    // Ubah title tab bar
    document.title = "Portal Wawancara - SE2026";
    const fetchInitData = async () => {
      try {
        const res = await fetch(`${GOOGLE_SCRIPT_WEB_APP_URL}?action=init&cb=${new Date().getTime()}`);
        const data = await res.json();
        setDbPetugas(data.petugas || []);
        setDbPeserta(data.akun || []);
        setDbSoal(data.soal_wawancara || []);
      } catch (err) {}
    };
    fetchInitData();
  }, []);

  const handleLogin = (e) => {
    e.preventDefault();
    const isValid = dbPetugas.find(p => p.email_petugas.toLowerCase() === loginEmail.toLowerCase());
    if (isValid) {
      setPetugasActive(isValid.nama_petugas);
      setView('dashboard');
    } else {
      setLoginError('Email Petugas tidak terdaftar. Hubungi Admin.');
    }
  };

  const mulaiWawancara = (peserta) => {
    setPesertaActive(peserta);
    setJawabanList({});
    setKeteranganAkhir('Dipertimbangkan');
    setView('form');
  };

  const handleKirimHasil = async (e) => {
    e.preventDefault();
    if(!window.confirm(`Kirim hasil wawancara untuk ${pesertaActive.nama}?`)) return;
    
    setIsLoading(true);
    // Format data sesuai permintaan backend
    const detailWawancara = dbSoal.map((s, idx) => ({
      pertanyaan: s.pertanyaan || s,
      jawaban: jawabanList[idx] || "Tidak ada jawaban."
    }));

    const payload = {
      action: "save_wawancara",
      nama_peserta: pesertaActive.nama,
      nama_petugas: petugasActive,
      keterangan: keteranganAkhir,
      data: detailWawancara
    };

    try {
      await fetch(GOOGLE_SCRIPT_WEB_APP_URL, { method: 'POST', mode: 'no-cors', body: JSON.stringify(payload) });
      setIsLoading(false);
      alert('Berhasil! Hasil wawancara telah tersimpan di Server.');
      setView('dashboard');
    } catch (e) {
      setIsLoading(false);
      alert('Gagal mengirim data. Coba lagi.');
    }
  };

  // --- RENDER 1: LOGIN PETUGAS ---
  if (view === 'login') {
    return (
      <div className="h-[100svh] w-screen flex items-center justify-center p-4 bg-[#f1f3f5] font-sans">
        <div className="max-w-[400px] w-full bg-white rounded-[32px] p-10 text-center shadow-2xl animate-fade-up border border-slate-100">
          <UserCheck className="w-16 h-16 text-blue-500 mx-auto mb-6 bg-blue-50 p-4 rounded-full" />
          <h1 className="text-2xl font-black text-[#1A1A1B] uppercase tracking-tight mb-2">Portal Petugas</h1>
          <p className="text-slate-500 text-xs font-medium mb-8">Masuk menggunakan email akses Pewawancara yang diberikan oleh Admin.</p>
          <form onSubmit={handleLogin} className="space-y-4">
            {loginError && <div className="bg-red-50 text-red-600 p-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2"><AlertCircle size={14}/>{loginError}</div>}
            <input required type="email" placeholder="Email Petugas" value={loginEmail} onChange={e => setLoginEmail(e.target.value)} className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-500 text-sm font-semibold transition-colors text-center" />
            <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black py-4 rounded-xl shadow-lg transition-all uppercase tracking-widest text-xs active:scale-95">Verifikasi Akses</button>
          </form>
        </div>
      </div>
    );
  }

  // --- RENDER 2: DASHBOARD PILIH PESERTA ---
  if (view === 'dashboard') {
    return (
      <div className="min-h-[100svh] w-screen flex flex-col bg-[#f1f3f5] font-sans">
        <header className="bg-white border-b border-slate-200 px-6 h-[70px] flex items-center justify-between shrink-0 sticky top-0 z-10 shadow-sm">
          <div className="flex items-center gap-3">
            <img src={LOGO_BPS} alt="BPS" className="h-8 w-auto" />
            <div>
              <h1 className="font-black text-[#1A1A1B] text-sm uppercase tracking-tight leading-tight">Wawancara SE2026</h1>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Petugas: {petugasActive}</p>
            </div>
          </div>
          <button onClick={() => setView('login')} className="flex items-center gap-2 bg-slate-100 hover:bg-red-50 text-slate-500 hover:text-red-500 px-4 py-2.5 rounded-xl text-xs font-black transition-colors"><LogOut size={14}/> <span className="hidden sm:inline">Keluar</span></button>
        </header>

        <div className="max-w-4xl w-full mx-auto p-4 sm:p-8 flex-1 flex flex-col">
          <div className="bg-white rounded-[24px] shadow-sm border border-slate-200 flex flex-col flex-1 overflow-hidden">
            <div className="p-6 sm:p-8 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-center gap-4 bg-white">
              <h2 className="text-lg font-black text-slate-800 uppercase tracking-tight flex items-center gap-2"><Users className="text-blue-500"/> Pilih Peserta Wawancara</h2>
              <div className="relative w-full sm:w-72">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16}/>
                <input type="text" placeholder="Cari nama atau desa peserta..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full pl-11 pr-4 py-2.5 border border-slate-200 bg-slate-50 rounded-xl text-sm focus:border-blue-500 outline-none font-semibold transition-colors"/>
              </div>
            </div>
            
            <div className="flex-1 overflow-y-auto custom-scrollbar p-2 sm:p-6 bg-slate-50/50">
               <div className="grid gap-3">
                 {dbPeserta.filter(p => `${p.nama} ${p.desa}`.toLowerCase().includes(searchTerm.toLowerCase())).map((p, i) => (
                   <div key={i} className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-sm flex justify-between items-center hover:border-blue-300 transition-colors group">
                     <div>
                       <p className="font-bold text-slate-800 text-base mb-1">{p.nama}</p>
                       <p className="text-xs text-slate-500 font-medium">{p.desa} • {p.kecamatan || 'Pacitan'}</p>
                     </div>
                     <button onClick={() => mulaiWawancara(p)} className="bg-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all flex items-center gap-2 shadow-sm">
                        Mulai <ChevronRight size={16}/>
                     </button>
                   </div>
                 ))}
                 {dbPeserta.length === 0 && <p className="text-center py-20 text-slate-400 font-bold">Data peserta kosong.</p>}
               </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // --- RENDER 3: FORM WAWANCARA ---
  if (view === 'form') {
    return (
      <div className="min-h-[100svh] w-screen bg-[#f1f3f5] font-sans pb-10">
        <header className="bg-white border-b border-slate-200 px-6 h-[70px] flex items-center justify-between sticky top-0 z-50 shadow-sm">
          <button onClick={() => {if(window.confirm('Batal mewawancara? Data isian akan hilang.')) setView('dashboard')}} className="flex items-center gap-2 text-slate-500 hover:text-black font-bold text-xs uppercase tracking-widest"><ArrowLeft size={16}/> Kembali</button>
          <div className="text-right">
             <h1 className="font-black text-[#1A1A1B] text-sm uppercase tracking-tight leading-tight">{pesertaActive.nama}</h1>
             <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Asal: {pesertaActive.desa}</p>
          </div>
        </header>

        <form onSubmit={handleKirimHasil} className="max-w-3xl w-full mx-auto p-4 sm:p-8 space-y-6 mt-4">
          <div className="bg-blue-600 text-white p-6 rounded-[24px] shadow-lg flex items-center gap-4">
             <MessageCircle size={32} className="opacity-80"/>
             <div>
               <h2 className="text-lg font-black uppercase tracking-widest">Lembar Wawancara</h2>
               <p className="text-xs font-medium opacity-80 mt-1">Petugas: <b>{petugasActive}</b>. Jawab pertanyaan dengan detail dan objektif.</p>
             </div>
          </div>

          <div className="space-y-5">
            {dbSoal.map((s, i) => (
              <div key={i} className="bg-white p-6 rounded-[24px] border border-slate-200 shadow-sm hover:border-slate-300 transition-colors">
                <p className="font-bold text-slate-800 text-sm mb-4 leading-relaxed"><span className="text-blue-500 font-black mr-2">Q{i+1}.</span> {s.pertanyaan || s}</p>
                <textarea required placeholder="Ketikkan tanggapan atau catatan peserta di sini..." value={jawabanList[i] || ''} onChange={e => setJawabanList({...jawabanList, [i]: e.target.value})} className="w-full min-h-[120px] p-4 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-500 text-sm font-medium transition-colors resize-y" />
              </div>
            ))}
          </div>

          <div className="bg-white p-6 rounded-[24px] border border-slate-200 shadow-lg mt-8 border-l-4 border-l-blue-500 sticky bottom-6">
             <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                <div className="w-full sm:w-auto flex-1">
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Keputusan Rekomendasi Akhir</label>
                  <select value={keteranganAkhir} onChange={e => setKeteranganAkhir(e.target.value)} className="w-full sm:w-64 px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-500 text-sm font-bold transition-colors cursor-pointer">
                    <option value="Dipertimbangkan">Dipertimbangkan (Ragu)</option>
                    <option value="Lulus">Rekomendasi (Lulus)</option>
                    <option value="Tidak Lulus">Tidak Direkomendasikan (Gagal)</option>
                  </select>
                </div>
                <button type="submit" disabled={isLoading} className="w-full sm:w-auto bg-[#1A1A1B] text-white hover:text-[#facc15] font-black px-10 py-4 rounded-xl shadow-xl transition-all uppercase tracking-widest text-xs flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50">
                  {isLoading ? <Loader2 className="w-4 h-4 animate-spin"/> : <Save className="w-4 h-4"/>} 
                  Kirim & Simpan Hasil
                </button>
             </div>
          </div>
        </form>
      </div>
    );
  }

  return null;
}