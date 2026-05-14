// --- AdminLogin.jsx ---
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertCircle, Eye, EyeOff, Loader2, Lock } from 'lucide-react';
import { GOOGLE_SCRIPT_WEB_APP_URL, LOGO_BPS } from './config.js';

export default function AdminLogin() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Jika sudah ter-autentikasi, langsung lempar ke Dashboard
    if (sessionStorage.getItem('adminAuth_SE2026')) {
      navigate('/dashboard', { replace: true });
    }
  }, [navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setLoginError('');
    
    try {
      const res = await fetch(`${GOOGLE_SCRIPT_WEB_APP_URL}?action=init&cb=${new Date().getTime()}`);
      const data = await res.json();
      
      // Validasi kredensial admin dari database
      if (data.admin && data.admin[0].email === email && data.admin[0].password === password) {
        sessionStorage.setItem('adminAuth_SE2026', 'true');
        navigate('/dashboard', { replace: true });
      } else {
        setLoginError('Kredensial Administrator tidak valid atau akses ditolak.');
      }
    } catch(err) {
      setLoginError('Gagal terhubung ke server keamanan.');
    }
    setLoading(false);
  };

  return (
    <div className="h-[100svh] w-screen flex items-center justify-center p-4 relative bg-transparent">
      
      {/* Box Login persis dengan ParticipantLogin (bg-white, shadow-2xl, border-slate-100, max-w-[420px]) */}
      <div className="max-w-[420px] w-full bg-white rounded-[32px] p-8 md:p-10 relative animate-fade-up shadow-2xl border border-slate-100">
        
        <div className="mb-8 text-center flex flex-col items-center">
          <img src="/logo.png" alt="Logo BPS" className="w-16 h-16 mb-4 drop-shadow-sm object-contain" onError={(e) => e.target.style.display = 'none'} />
          <h1 className="text-[20px] font-black text-[#1A1A1B] leading-snug uppercase tracking-tight">
            Admin Dashboard
          </h1>
          <h2 className="text-[12px] font-bold text-slate-500 mt-2 uppercase tracking-widest">
            Uji Kompetensi Mitra Tambahan 2026
          </h2>
        </div>
        
        <form onSubmit={handleLogin} className="space-y-4">
          {loginError && (
            <div className="bg-red-50 text-red-600 p-3 rounded-xl text-xs flex items-center gap-2 font-bold animate-shake">
              <AlertCircle className="w-4 h-4 shrink-0"/>{loginError}
            </div>
          )}
          
          <input 
            required 
            type="email" 
            placeholder="Email Administrator" 
            value={email} 
            onChange={e => setEmail(e.target.value)} 
            className="w-full px-4 py-3.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:border-orange-500 outline-none font-medium transition-colors" 
          />
          
          <div className="relative">
            <input 
              required 
              type={showPassword ? "text" : "password"} 
              placeholder="Kata Sandi Keamanan" 
              value={password} 
              onChange={e => setPassword(e.target.value)} 
              className="w-full px-4 py-3.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:border-orange-500 outline-none font-medium transition-colors pr-12" 
            />
            <button 
              type="button" 
              onClick={() => setShowPassword(!showPassword)} 
              className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-orange-500 transition-colors"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          
          {/* Tombol dengan ukuran yang sama persis (py-4, rounded-xl) tapi menggunakan warna hitam Admin */}
          <button 
            type="submit" 
            disabled={loading} 
            className="w-full bg-[#1A1A1B] hover:bg-black text-white font-black py-4 rounded-xl shadow-lg hover-scale-up transition-all uppercase tracking-widest text-xs mt-2 disabled:opacity-50 flex justify-center items-center gap-2"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin"/> : <Lock className="w-4 h-4" />} 
            Verifikasi Akses
          </button>
        </form>

        <p className="text-center text-[10px] font-bold text-slate-400 mt-6">
           ©2026 Tim PLS BPS Kabupaten Pacitan
        </p>
        
      </div>
    </div>
  );
}