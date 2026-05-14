// --- App.jsx ---
import React, { useEffect } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { LOGO_BPS } from './config.js';

import ParticipantLogin from './ParticipantLogin.jsx';
import QuizArea from './QuizArea.jsx';
import AdminLogin from './AdminLogin.jsx';
import AdminDashboard from './admin.jsx';
import WawancaraArea from './Wawancara.jsx';

const AppStylesAndBackground = () => (
  <>
    <style>{`
      @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800&family=Inter:wght@400;500;600&display=swap');
      
      :root { 
        --black-charcoal: #1A1A1B; 
        --pintarly-yellow: #ffe16f; 
        --se-primary: #ea580c; 
      }
      
      body { 
        font-family: 'Outfit', 'Inter', sans-serif; 
        overflow: hidden; 
        margin: 0; 
        background-color: #f1f3f5; 
      }
      
      ::-webkit-scrollbar { width: 6px; height: 6px; }
      ::-webkit-scrollbar-track { background: transparent; }
      ::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.1); border-radius: 10px; }
      
      .animate-fade-up { animation: fadeInUp 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
      .animate-scale-in { animation: scaleIn 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
      .hover-slide-right:hover { transform: translateX(4px); }
      .hover-scale-up:hover { transform: translateY(-2px); box-shadow: 0 8px 20px -6px rgba(0, 0, 0, 0.15); }
      
      .pintarly-input { 
        background: rgba(255, 255, 255, 0.9); 
        border: 1px solid rgba(0, 0, 0, 0.06); 
        transition: all 0.3s ease;
      }
      .pintarly-input:focus { 
        background: #ffffff; 
        border-color: #facc15; 
        box-shadow: 0 0 0 4px rgba(250, 204, 21, 0.2); 
        outline: none;
      }

      @keyframes fadeInUp { from { opacity: 0; transform: translateY(15px); } to { opacity: 1; transform: translateY(0); } }
      @keyframes scaleIn { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
    `}</style>

    <div className="fixed inset-0 z-[-1] overflow-hidden pointer-events-none bg-[#eaedf0]">
      <div className="absolute top-1/2 left-1/2 w-[120vw] h-[120vh] -translate-x-1/2 -translate-y-1/2 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.7)_0%,transparent_70%)]"></div>
      
      <div 
        className="absolute inset-0 w-full h-full opacity-[0.06] mix-blend-multiply"
        style={{ 
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
          backgroundRepeat: 'repeat'
        }}
      ></div>
    </div>
  </>
);

export default function App() {
  const location = useLocation();

  useEffect(() => {
    // 1. Buat elemen link favicon jika belum ada
    let link = document.querySelector("link[rel~='icon']");
    if (!link) {
      link = document.createElement('link');
      link.rel = 'icon';
      document.head.appendChild(link);
    }

    // 2. Deteksi Rute Otomatis (Dynamic Title & Icon)
    const currentPath = location.pathname.toLowerCase();
    
    if (currentPath.includes('/admin') || currentPath.includes('/dashboard')) {
      // Khusus untuk tampilan Admin & Dashboard
      document.title = "Dashboard Uji Kompetensi";
      link.href = "/logo.png";
    } else {
      // Kembali ke tampilan Default untuk Peserta Ujian
      document.title = "Uji Kompetensi Mitra Tambahan 2026 - BPS Kabupaten Pacitan";
      link.href = LOGO_BPS; 
    }
    
  }, [location.pathname]); // Efek ini akan berjalan setiap kali user pindah halaman

  return (
    <>
      <AppStylesAndBackground />
      <Routes>
        <Route path="/" element={<ParticipantLogin />} />
        <Route path="/quiz" element={<QuizArea />} />
        <Route path="/admin" element={<AdminLogin />} />
        <Route path="/dashboard" element={<AdminDashboard />} />
        <Route path="*" element={<Navigate to="/" replace />} />
        <Route path="/wawancara" element={<WawancaraArea />} />
      </Routes>
    </>
  );
}