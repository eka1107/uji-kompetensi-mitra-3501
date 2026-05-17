// --- admin.jsx ---
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, LogOut, Users, CheckCircle2, XCircle, Clock, Activity,
  UserPlus, FileSpreadsheet, Trash2, Download, Search, CalendarClock, Shield, Save, Filter, ChevronLeft, ChevronRight,
  Database, RefreshCw, Edit3, X, Lock, Settings, DownloadCloud, AlertTriangle, Menu, ListFilter, FileText, Check, Info, Loader2, BarChart3,
  UserCheck, MessageCircle, ClipboardList, MapPin, TrendingUp, Printer, Layers
} from 'lucide-react';
import { GOOGLE_SCRIPT_WEB_APP_URL, LOGO_BPS } from './config.js';

// --- DATA KECAMATAN PACITAN ---
const KECAMATAN_LIST = [
  "Donorojo", "Punung", "Pringkuku", "Pacitan", "Kebonagung", 
  "Arjosari", "Nawangan", "Bandar", "Tegalombo", "Tulakan", 
  "Ngadirojo", "Sudimoro"
];

// --- KOMPONEN PROGRESS BAR ---
const ProgressBar = ({ percent, color = "bg-[#1A1A1B]" }) => (
  <div className="w-full mt-1">
    <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
      <div className={`h-full ${color} rounded-full transition-all duration-1000`} style={{ width: `${percent}%` }}></div>
    </div>
  </div>
);

// --- KOMPONEN BAR CHART KECAMATAN ---
const KecamatanProgressChart = ({ data }) => {
  const { kec, target, mengerjakan, lulus, pctMengerjakan, pctLulus } = data;
  return (
    <div className="p-4 bg-white border border-slate-200 rounded-[20px] hover:border-black transition-all group shadow-sm hover:shadow-md relative">
      <div className="flex justify-between items-center mb-4">
        <h4 className="font-black text-xs uppercase tracking-wider text-slate-800 flex items-center gap-2">
          <MapPin size={14} className="text-[#facc15]"/> {kec}
        </h4>
        <span className="text-[10px] font-bold text-slate-400 bg-slate-50 px-2 py-1 rounded border border-slate-100" title="Total Pendaftar">Target: {target}</span>
      </div>
      
      <div className="space-y-4 pt-1">
        <div className="relative group/bar">
          <div className="flex justify-between text-[9px] font-black uppercase tracking-widest text-slate-500 mb-1">
            <span>Mengerjakan</span>
            <span className="text-[#1A1A1B]">{pctMengerjakan}%</span>
          </div>
          <ProgressBar percent={pctMengerjakan} color="bg-[#1A1A1B]" />
          <div className="absolute -top-7 left-1/2 -translate-x-1/2 bg-[#1A1A1B] text-white text-[10px] font-bold px-2.5 py-1 rounded-md opacity-0 group-hover/bar:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10 shadow-lg">
            {mengerjakan} dari {target} Peserta ({pctMengerjakan}%)
            <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-[#1A1A1B] rotate-45"></div>
          </div>
        </div>

        <div className="relative group/bar">
          <div className="flex justify-between text-[9px] font-black uppercase tracking-widest text-slate-500 mb-1">
            <span>Lulus PG</span>
            <span className="text-yellow-600">{pctLulus}%</span>
          </div>
          <ProgressBar percent={pctLulus} color="bg-[#facc15]" />
          <div className="absolute -top-7 left-1/2 -translate-x-1/2 bg-[#facc15] text-[#1A1A1B] text-[10px] font-bold px-2.5 py-1 rounded-md opacity-0 group-hover/bar:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10 shadow-lg">
            {lulus} Lulus ({pctLulus}%)
            <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-[#facc15] rotate-45"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- KOMPONEN PAGINASI UNIVERSAL ---
const PaginationFooter = ({ currentPage, totalPages, setCurrentPage, itemsPerPage, setItemsPerPage }) => (
  <div className="p-4 border-t border-slate-100 bg-white flex flex-col sm:flex-row justify-between items-center gap-4 shrink-0">
    <div className="flex items-center gap-3">
      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Tampilkan:</span>
      <select value={itemsPerPage} onChange={e => { setItemsPerPage(Number(e.target.value)); setCurrentPage(1); }} className="text-xs font-bold border border-slate-200 rounded-lg px-2 py-1.5 bg-slate-50 outline-none focus:border-black cursor-pointer text-slate-600">
        <option value={10}>10 Baris</option>
        <option value={15}>15 Baris</option>
        <option value={25}>25 Baris</option>
        <option value={50}>50 Baris</option>
        <option value={100}>100 Baris</option>
      </select>
    </div>
    <div className="flex items-center gap-4">
      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Hal {currentPage} / {totalPages > 0 ? totalPages : 1}</p>
      <div className="flex gap-2">
        <button onClick={() => setCurrentPage(p => Math.max(1, p-1))} disabled={currentPage === 1} className="p-2 border border-slate-200 bg-slate-50 rounded-lg hover:bg-slate-200 disabled:opacity-30 transition-colors"><ChevronLeft size={16}/></button>
        <button onClick={() => setCurrentPage(p => Math.min(totalPages, p+1))} disabled={currentPage === totalPages || totalPages === 0} className="p-2 border border-slate-200 bg-slate-50 rounded-lg hover:bg-slate-200 disabled:opacity-30 transition-colors"><ChevronRight size={16}/></button>
      </div>
    </div>
  </div>
);

// --- HELPER FUNCTIONS ---
const formatForInput = (ms) => {
  if (!ms || ms === 0) return '';
  const d = new Date(ms);
  const yyyy = d.getFullYear();
  const MM = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  const hh = String(d.getHours()).padStart(2, '0');
  const mm = String(d.getMinutes()).padStart(2, '0');
  return `${yyyy}-${MM}-${dd}T${hh}:${mm}`;
};

const hitungDurasi = (mulaiStr, selesaiStr) => {
  if (!mulaiStr || !selesaiStr) return '-';
  try {
    const parseDate = (str) => {
      const parts = str.replace(',', '').trim().split(' ');
      const dateParts = parts[0].split('/');
      const timeParts = parts[1].split(/[.:]/);
      return new Date(dateParts[2], dateParts[1]-1, dateParts[0], timeParts[0], timeParts[1], timeParts[2]);
    };
    const start = parseDate(mulaiStr);
    const end = parseDate(selesaiStr);
    const diffMs = end - start;
    if(isNaN(diffMs) || diffMs < 0) return '-';
    const mins = Math.floor(diffMs / 60000);
    const secs = Math.floor((diffMs % 60000) / 1000);
    return `${mins}m ${secs}s`;
  } catch(e) { return '-'; }
};

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('dashboard'); 
  const [isLoading, setIsLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); 
  
  // --- STATE DATA UTAMA ---
  const [adminData, setAdminData] = useState([]);
  const [daftarPeserta, setDaftarPeserta] = useState([]);
  const [quizData, setQuizData] = useState([]);
  const [activeSessions, setActiveSessions] = useState([]); 
  const [detailAnswers, setDetailAnswers] = useState([]); 
  
  const [soalWawancara, setSoalWawancara] = useState([]);
  const [hasilWawancara, setHasilWawancara] = useState([]);
  
  // --- STATE FORM ---
  const [adminSettingForm, setAdminSettingForm] = useState({ email: '', password: '' });
  const [jadwalForm, setJadwalForm] = useState({ mulai: '', selesai: '', durasi: 45 });
  const [newPeserta, setNewPeserta] = useState({ email: '', password: '', nama: '', desa: '', kecamatan: 'Pacitan' });
  
  // --- STATE UI, FILTER & SORTING ---
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('ALL'); 
  const [filterKecamatan, setFilterKecamatan] = useState('ALL');
  const [filterDesa, setFilterDesa] = useState('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(15); 
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' }); 

  const [dashFilter, setDashFilter] = useState('');
  const [dashSort, setDashSort] = useState('nama_asc');
  
  const [filterEsaiView, setFilterEsaiView] = useState('sudah'); 
  const [filterStatusRekap, setFilterStatusRekap] = useState('ALL'); 

  // --- MODALS ---
  const [editModal, setEditModal] = useState({ isOpen: false, oldEmail: '', data: { email: '', password: '', nama: '', desa: '', kecamatan: '' } });
  const [viewDetailModal, setViewDetailModal] = useState({ isOpen: false, email: '', nama: '', skor: 0, keterangan: '', data: [] });
  const [viewWawancaraModal, setViewWawancaraModal] = useState({ isOpen: false, data: null });
  const [alertModal, setAlertModal] = useState({ isOpen: false, title: '', message: '' });
  const [confirmModal, setConfirmModal] = useState({ isOpen: false, title: '', message: '', action: null });

  const showAlert = (title, message) => setAlertModal({ isOpen: true, title, message });
  const showConfirm = (title, message, action) => setConfirmModal({ isOpen: true, title, message, action });

  useEffect(() => {
    if (!sessionStorage.getItem('adminAuth_SE2026')) { navigate('/admin'); return; }
    fetchData();
    if (window.innerWidth >= 768) setIsSidebarOpen(true);
  }, [navigate]);

  useEffect(() => {
    setSortConfig({ key: null, direction: 'asc' });
    setCurrentPage(1);
    setFilterEsaiView('sudah');
    setFilterStatusRekap('ALL');
  }, [activeTab]);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`${GOOGLE_SCRIPT_WEB_APP_URL}?action=init&cb=${new Date().getTime()}`);
      const data = await res.json();
      if (data.status === "success") {
        
        const rawNilai = data.nilai || [];
        const uniqueNilai = rawNilai.filter((v, i, a) => 
          a.findIndex(t => String(t.akun).toLowerCase() === String(v.akun).toLowerCase()) === i
        );
        setAdminData(uniqueNilai);
        
        setDaftarPeserta(data.akun || []);
        setQuizData(data.soal || []);
        
        const rawSesi = data.sesi_aktif || [];
        const uniqueSesi = rawSesi.filter((v, i, a) => a.findIndex(t => (t.email === v.email)) === i);
        
        const validSesi = [];
        const now = Date.now();
        
        uniqueSesi.forEach(s => {
          let startMs = 0;
          try {
            const parts = s.waktu_mulai.replace(',', '').trim().split(' ');
            const dateParts = parts[0].split(/[\/-]/);
            const timeParts = (parts[1] || "00:00:00").split(/[.:]/);
            let year = dateParts[2]; let month = dateParts[1]; let day = dateParts[0];
            if (dateParts[0] && dateParts[0].length === 4) { year = dateParts[0]; day = dateParts[2]; }
            startMs = new Date(year, month - 1, day, timeParts[0] || 0, timeParts[1] || 0, timeParts[2] || 0).getTime();
          } catch(e) {}
          
          if (startMs > 0 && (now - startMs) > 86400000) {
            fetch(GOOGLE_SCRIPT_WEB_APP_URL, { 
              method: 'POST', mode: 'no-cors', 
              body: JSON.stringify({ action: "delete_sesi", email: s.email }) 
            });
          } else {
            validSesi.push(s); 
          }
        });
        
        setActiveSessions(validSesi);
        setDetailAnswers(data.detail_jawaban || []);
        setSoalWawancara(data.soal_wawancara || []);
        setHasilWawancara(data.hasil_wawancara || []);
        
        if(data.admin && data.admin.length > 0) setAdminSettingForm(data.admin[0]);
        setJadwalForm({ 
          mulai: formatForInput(Number(data.jadwal.mulai)), 
          selesai: formatForInput(Number(data.jadwal.selesai)),
          durasi: data.jadwal.durasi || 45 
        });
      }
    } catch (e) { console.error("Gagal sinkronisasi data"); }
    setIsLoading(false);
  };

  const handleLogout = () => { sessionStorage.removeItem('adminAuth_SE2026'); navigate('/admin'); };

  // --- STATISTIK UMUM ---
  const totalPendaftar = daftarPeserta.length;
  const jumlahSudahUjian = adminData.length;
  const daftarRemedial = adminData.filter(d => d.keterangan === 'TIDAK LULUS');
  const totalGagal = daftarRemedial.length;
  const jumlahLulus = adminData.filter(d => d.keterangan === 'LULUS').length;
  
  const persenUjian = totalPendaftar > 0 ? Math.round((jumlahSudahUjian / totalPendaftar) * 100) : 0;
  const persenLulus = jumlahSudahUjian > 0 ? Math.round((jumlahLulus / jumlahSudahUjian) * 100) : 0;
  const persenRemedial = jumlahSudahUjian > 0 ? Math.round((totalGagal / jumlahSudahUjian) * 100) : 0;
  const rataSkor = adminData.length ? Math.round(adminData.reduce((acc, curr) => acc + curr.skor, 0) / adminData.length) : 0;

  const getPesertaInfo = (email) => daftarPeserta.find(p => String(p.email).toLowerCase() === String(email).toLowerCase()) || { nama: '-', desa: '-', kecamatan: '-' };
  const getJumlahBenar = (skor) => Math.round((skor / 100) * (quizData.length || 100));
  const uniqueDesaList = [...new Set(daftarPeserta.map(p => p.desa).filter(Boolean))].sort();

  let kecamatanStats = KECAMATAN_LIST.map(kec => {
    const pesertaKec = daftarPeserta.filter(p => (p.kecamatan || '').toUpperCase() === kec.toUpperCase());
    const target = pesertaKec.length; 
    const emails = pesertaKec.map(p => p.email.toLowerCase());
    const hasilKec = adminData.filter(h => emails.includes(h.akun.toLowerCase()));
    
    const mengerjakan = hasilKec.length;
    const lulus = hasilKec.filter(h => h.keterangan === 'LULUS').length;

    const pctMengerjakan = target > 0 ? Math.round((mengerjakan / target) * 100) : 0;
    const pctLulus = target > 0 ? Math.round((lulus / target) * 100) : 0;

    return { kec, target, mengerjakan, lulus, pctMengerjakan, pctLulus };
  });

  if (dashFilter) kecamatanStats = kecamatanStats.filter(item => item.kec.toLowerCase().includes(dashFilter.toLowerCase()));
  kecamatanStats.sort((a, b) => {
    if (dashSort === 'nama_asc') return a.kec.localeCompare(b.kec);
    if (dashSort === 'nama_desc') return b.kec.localeCompare(a.kec);
    if (dashSort === 'prog_desc') return b.pctMengerjakan - a.pctMengerjakan;
    if (dashSort === 'prog_asc') return a.pctMengerjakan - b.pctMengerjakan;
    if (dashSort === 'lulus_desc') return b.pctLulus - a.pctLulus;
    if (dashSort === 'lulus_asc') return a.pctLulus - b.pctLulus;
    return 0;
  });

  const requestSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') direction = 'desc';
    setSortConfig({ key, direction });
  };

  const SortIcon = ({ columnKey }) => {
    if (sortConfig.key !== columnKey) return <span className="opacity-30 inline-block ml-1">↕</span>;
    return <span className="inline-block ml-1 text-[#facc15] drop-shadow-sm font-black">{sortConfig.direction === 'asc' ? '↑' : '↓'}</span>;
  };

  const handleSort = (dataArray) => {
    if (!sortConfig.key) return dataArray;
    return [...dataArray].sort((a, b) => {
      let valA = a[sortConfig.key] || "";
      let valB = b[sortConfig.key] || "";
      
      if (typeof valA === 'string') valA = valA.toLowerCase();
      if (typeof valB === 'string') valB = valB.toLowerCase();
      
      if (!isNaN(valA) && !isNaN(valB) && valA !== '' && valB !== '') {
         valA = Number(valA); valB = Number(valB);
      }

      if (valA < valB) return sortConfig.direction === 'asc' ? -1 : 1;
      if (valA > valB) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
  };

  // --- FILTERING, SORTING & PAGINATION CALCULATIONS ---
  
  const filteredPeserta = daftarPeserta.filter(p => `${p.nama} ${p.email} ${p.desa} ${p.kecamatan || ''}`.toLowerCase().includes(searchTerm.toLowerCase()));
  const sortedPeserta = handleSort(filteredPeserta);
  const currentPeserta = sortedPeserta.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  const totalPagesPeserta = Math.ceil(sortedPeserta.length / itemsPerPage);

  const mappedHasil = adminData.map(item => {
    const p = getPesertaInfo(item.akun);
    return {
      ...item,
      nama: p.nama,
      kecamatan: p.kecamatan || '-',
      desa: p.desa || '-',
      durasi: hitungDurasi(item.waktu_mulai, item.waktu_selesai),
      benar: getJumlahBenar(item.skor)
    };
  });
  const filteredHasil = mappedHasil.filter(item => {
    const s = `${item.akun} ${item.nama} ${item.desa} ${item.kecamatan}`.toLowerCase();
    const matchSearch = s.includes(searchTerm.toLowerCase());
    const matchStatus = filterStatus === 'ALL' || item.keterangan === filterStatus;
    const matchKecamatan = filterKecamatan === 'ALL' || (item.kecamatan.toUpperCase() === filterKecamatan.toUpperCase());
    const matchDesa = filterDesa === 'ALL' || (item.desa.toUpperCase() === filterDesa.toUpperCase());
    return matchSearch && matchStatus && matchKecamatan && matchDesa;
  });
  const sortedHasil = handleSort(filteredHasil);
  const currentDataHasil = sortedHasil.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  const totalPagesHasil = Math.ceil(sortedHasil.length / itemsPerPage);

  // --- GROUPING DATA HASIL WAWANCARA (ESAI) BERDASARKAN EMAIL ---
  const groupedWawancaraMap = {};
  hasilWawancara.forEach(item => {
    const emailKey = String(item.email || item.nama_petugas || '').toLowerCase(); // Fallback ke old key
    if (!emailKey) return;
    if (!groupedWawancaraMap[emailKey]) {
      groupedWawancaraMap[emailKey] = {
        email: item.email || item.nama_petugas, 
        nama_peserta: item.nama_peserta || '-',
        waktu_mulai: item.waktu_mulai || '-',
        waktu_selesai: item.waktu_selesai || '-',
        ttd: item.ttd || '', //TAMBAHKAN BARIS INI UNTUK MENGAMBIL TTD
        qa: []
      };
    }
    groupedWawancaraMap[emailKey].qa.push({ pertanyaan: item.pertanyaan, jawaban: item.jawaban });
  });
  const groupedWawancaraArr = Object.values(groupedWawancaraMap);

  // 1. Array Peserta Sudah Wawancara (Esai)
  const filteredSudahWawancara = groupedWawancaraArr.filter(item => {
    const s = `${item.nama_peserta} ${item.email}`.toLowerCase();
    return s.includes(searchTerm.toLowerCase());
  });
  const sortedSudahWawancara = handleSort(filteredSudahWawancara);
  const currentHasilWawancara = sortedSudahWawancara.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  const totalPagesSudahWawancara = Math.ceil(sortedSudahWawancara.length / itemsPerPage);

  // 2. Array Peserta Belum Wawancara (Hanya yang sudah selesai PG)
  const belumWawancaraArr = adminData.filter(pg => {
    const emailKey = String(pg.akun).toLowerCase();
    return !groupedWawancaraMap[emailKey];
  }).map(item => {
    const p = getPesertaInfo(item.akun);
    return { ...item, nama_peserta: p.nama, email: item.akun, kecamatan: p.kecamatan || '-', desa: p.desa || '-' };
  });
  const filteredBelumWawancara = belumWawancaraArr.filter(item => {
    const s = `${item.nama_peserta} ${item.email} ${item.kecamatan} ${item.desa}`.toLowerCase();
    return s.includes(searchTerm.toLowerCase());
  });
  const sortedBelumWawancara = handleSort(filteredBelumWawancara);
  const currentBelumWawancara = sortedBelumWawancara.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  const totalPagesBelumWawancara = Math.ceil(sortedBelumWawancara.length / itemsPerPage);

  const activeWawancaraTotalPages = filterEsaiView === 'sudah' ? totalPagesSudahWawancara : totalPagesBelumWawancara;


  // --- 🚀 MAP DATA UNTUK REKAP TERPADU ---
  const mappedRekap = daftarPeserta.map(p => {
    const emailKey = String(p.email).toLowerCase();
    const pgResult = adminData.find(h => String(h.akun).toLowerCase() === emailKey);
    const esaiResult = groupedWawancaraArr.find(w => String(w.email).toLowerCase() === emailKey);

    let statusPG = 'BELUM UJIAN';
    let skorPG = '-';
    if (pgResult) {
       statusPG = pgResult.keterangan; 
       skorPG = pgResult.skor;
    }

    let statusEsai = 'BELUM ESAI';
    if (esaiResult) statusEsai = 'SUDAH ESAI';

    let statusAkhir = 'BELUM MULAI';
    if (statusPG === 'LULUS' && statusEsai === 'SUDAH ESAI') statusAkhir = 'SELESAI SEMUA';
    else if (statusPG === 'TIDAK LULUS') statusAkhir = 'GAGAL PG';
    else if (statusPG === 'LULUS' && statusEsai === 'BELUM ESAI') statusAkhir = 'LULUS PG (BELUM ESAI)';
    else if (statusPG !== 'BELUM UJIAN') statusAkhir = 'PROSES';

    return {
      ...p,
      skorPG,
      statusPG,
      statusEsai,
      statusAkhir
    }
  });

  const filteredRekap = mappedRekap.filter(item => {
    const s = `${item.nama} ${item.email} ${item.desa} ${item.kecamatan}`.toLowerCase();
    const matchSearch = s.includes(searchTerm.toLowerCase());
    const matchFilter = filterStatusRekap === 'ALL' || item.statusAkhir === filterStatusRekap;
    return matchSearch && matchFilter;
  });
  const sortedRekap = handleSort(filteredRekap);
  const currentRekap = sortedRekap.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  const totalPagesRekap = Math.ceil(sortedRekap.length / itemsPerPage);


  const sortedSesi = handleSort(activeSessions);
  const currentSesi = sortedSesi.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  const totalPagesSesi = Math.ceil(sortedSesi.length / itemsPerPage);

  const sortedRemedial = handleSort(daftarRemedial);
  const currentRemedial = sortedRemedial.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  const totalPagesRemedial = Math.ceil(sortedRemedial.length / itemsPerPage);

  const sortedSoal = handleSort(quizData);
  const currentSoal = sortedSoal.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  const totalPagesSoal = Math.ceil(sortedSoal.length / itemsPerPage);

  const sortedSoalWawancara = handleSort(soalWawancara);
  const currentSoalWawancara = sortedSoalWawancara.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  const totalPagesSoalWawancara = Math.ceil(sortedSoalWawancara.length / itemsPerPage);


  // --- LOGIKA EXPORT & DELETE ---
  const exportHasilToCSV = () => {
    const headers = ["No", "Selesai", "Nama", "Email", "Kecamatan", "Desa", "Benar", "Skor", "Durasi", "Status"];
    let csv = headers.join(",") + "\n";
    sortedHasil.forEach((r, i) => {
      csv += `${i+1},"${r.waktu_selesai}","${r.nama}","${r.akun}","${r.kecamatan}","${r.desa}",${r.benar},${r.skor},"${r.durasi}","${r.keterangan}"\n`;
    });
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `Hasil_CAT_SE2026_${new Date().toLocaleDateString('id-ID')}.csv`;
    link.click();
  };

  // 🚀 Ekspor Rekap Terpadu
  const exportRekapToCSV = () => {
    const headers = ["No", "Nama Peserta", "Email", "Kecamatan", "Desa", "Skor PG", "Status PG", "Status Esai", "Status Akhir"];
    let csv = headers.join(",") + "\n";
    sortedRekap.forEach((r, i) => {
      csv += `${i+1},"${r.nama}","${r.email}","${r.kecamatan}","${r.desa}","${r.skorPG}","${r.statusPG}","${r.statusEsai}","${r.statusAkhir}"\n`;
    });
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `Rekap_Terpadu_SE2026_${new Date().toLocaleDateString('id-ID')}.csv`;
    link.click();
  };

  const exportHasilToPDF = () => {
    const printWindow = window.open('', '_blank');
    let html = `
      <html>
        <head>
          <title>Hasil Ujian Kompetensi BPS</title>
          <style>
            body { font-family: Arial, sans-serif; font-size: 12px; margin: 20px; }
            h2 { text-align: center; margin-bottom: 20px; text-transform: uppercase; font-size: 16px; }
            table { width: 100%; border-collapse: collapse; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f8f9fa; font-weight: bold; text-transform: uppercase; font-size: 10px; }
            .text-center { text-align: center; }
          </style>
        </head>
        <body>
          <h2>Hasil Uji Kompetensi Mitra Tambahan 2026</h2>
          <p><strong>Filter Status:</strong> ${filterStatus} | <strong>Kecamatan:</strong> ${filterKecamatan} | <strong>Desa:</strong> ${filterDesa}</p>
          <table>
            <thead>
              <tr>
                <th class="text-center">No</th>
                <th>Selesai</th>
                <th>Nama Peserta</th>
                <th>Email</th>
                <th>Kecamatan</th>
                <th>Desa</th>
                <th class="text-center">Durasi</th>
                <th class="text-center">Benar</th>
                <th class="text-center">Skor</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
    `;
    
    sortedHasil.forEach((r, i) => {
       html += `
         <tr>
           <td class="text-center">${i+1}</td>
           <td>${r.waktu_selesai}</td>
           <td><strong>${r.nama}</strong></td>
           <td>${r.akun}</td>
           <td>${r.kecamatan}</td>
           <td>${r.desa}</td>
           <td class="text-center">${r.durasi}</td>
           <td class="text-center">${r.benar}</td>
           <td class="text-center"><strong>${r.skor}</strong></td>
           <td>${r.keterangan}</td>
         </tr>
       `;
    });

    html += `</tbody></table></body></html>`;
    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => { printWindow.print(); }, 300);
  };

  // --- LOGIKA CETAK ESAI WAWANCARA (FORMAT FORMAL BPS A4) ---
  // --- LOGIKA CETAK ESAI WAWANCARA (FORMAT RESMI BPS A4 - MARGIN @PAGE 3CM & FULL UNDERLINE) ---
  // --- LOGIKA CETAK ESAI WAWANCARA (FORMAT RESMI BPS A4 - MARGIN @PAGE 3CM & DYNAMIC RE-INDEX) ---
  // --- LOGIKA CETAK ESAI WAWANCARA (MARGIN 3CM, NO. DINAMIS, FONT KETIK, & TTD) ---
  const exportWawancaraToPDF = (data) => {
    if (!data) return;
    
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert("Browser memblokir pop-up. Mohon izinkan pop-up (Allow Pop-ups) untuk mencetak dokumen.");
      return;
    }

    let html = `
      <html>
        <head>
          <title>Hasil Esai - ${data.nama_peserta || 'Peserta'}</title>
          <style>
            /* Mengunci Margin 3cm secara mutlak di setiap halaman */
            @page { 
              size: A4; 
              margin: 3cm; 
            }
            
            body { 
              font-family: Arial, Helvetica, sans-serif; 
              font-size: 11pt; 
              color: #000; 
              line-height: 1.6;
              margin: 0;
              padding: 0;
            }
            
            /* Desain Kop Surat Resmi BPS */
            .kop-surat {
              width: 100%;
              border-bottom: 3px double black; 
              padding-bottom: 10px;
              margin-bottom: 25px;
            }
            .kop-table {
              width: 100%;
              border-collapse: collapse;
            }
            .kop-logo {
              width: 90px;
              vertical-align: middle;
              text-align: left;
            }
            .kop-logo img {
              width: 80px;
              height: auto;
            }
            .kop-text {
              text-align: center;
              vertical-align: middle;
              padding-right: 90px; 
            }
            .kop-title {
              font-size: 14pt;
              font-weight: bold;
              margin: 0;
              line-height: 1.2;
            }
            .kop-subtitle {
              font-size: 10pt;
              margin: 5px 0 0 0;
            }
            
            /* Desain Judul Lembar */
            .title { 
              text-align: center; 
              font-weight: bold; 
              // text-decoration: underline; 
              margin-bottom: 25px; 
              font-size: 12pt; 
            }
            .info-table { 
              margin-bottom: 20px; 
              width: 100%; 
              border-collapse: collapse;
            }
            .info-table td { 
              padding: 5px; 
              vertical-align: top; 
            }
            
            /* Format Penomoran Sejajar Lurus (Hanging Indent) */
            .qa-container { 
              display: table;
              width: 100%;
              margin-bottom: 25px; 
            }
            .qa-num {
              display: table-cell;
              width: 25px;
              font-weight: bold;
              vertical-align: top;
            }
            .qa-content {
              display: table-cell;
              vertical-align: top;
            }
            .question { 
              font-weight: bold; 
              margin-bottom: 8px; 
              text-align: justify;
            }
            
            /* 🚀 JAWABAN: Font Mesin Ketik + Garis Bawah di SETIAP baris kalimat */
            .answer { 
              font-family: 'Courier New', Courier, monospace; /* FONT KETIK */
              font-size: 10.5pt;
              text-align: justify; 
              text-decoration: underline; 
              text-underline-offset: 5px; 
              margin-top: 6px;
              width: 100%;
              display: block;
              white-space: pre-wrap; 
              word-wrap: break-word;
            }
          </style>
        </head>
        <body>
          
          <div class="kop-surat">
            <table class="kop-table">
              <tr>
                <td class="kop-logo">
                  <img src="${LOGO_BPS}" alt="Logo BPS" />
                </td>
                <td class="kop-text">
                  <div class="kop-title">BADAN PUSAT STATISTIK</div>
                  <div class="kop-title">KABUPATEN PACITAN</div>
                  <div class="kop-subtitle">Jl. Ronggowarsito No.2 Pacitan, Jawa Timur 63511</div>
                  <div class="kop-subtitle">Telp. (0357) 881304 Website: pacitankab.bps.go.id</div>
                  <div class="kop-subtitle"> Emai: bps3501@bps.go.if</div>
                </td>
              </tr>
            </table>
          </div>

          <div class="title">LEMBAR JAWABAN TES ESAI (WAWANCARA ONLINE)</div>
          
          <table class="info-table">
            <tr><td><strong>Email Akun</strong></td><td>:</td><td>${data.email || '-'}</td></tr>
            <tr><td><strong>Waktu Mulai</strong></td><td>:</td><td>${data.waktu_mulai || '-'}</td></tr>
            <tr><td><strong>Waktu Selesai</strong></td><td>:</td><td>${data.waktu_selesai || '-'}</td></tr>
    `;

    let questionsHtml = '';
    let testQuestionCounter = 1;

    if (data.qa && Array.isArray(data.qa)) {
      data.qa.forEach((item, index) => {
        const pert = item.pertanyaan || 'Pertanyaan tidak tersedia.';
        const jaw = String(item.jawaban || '-').trim() === "" ? "-" : String(item.jawaban);
        
        if (index < 3) {
          // Soal 1, 2, 3 (Data diri) dibuat sejajar di atas tanpa nomor, font jawaban mesin ketik
          html += `
            <tr>
              <td><strong>${pert}</strong></td>
              <td>:</td>
              <td style="font-family: 'Courier New', Courier, monospace; font-size: 10.5pt; text-decoration: underline; text-underline-offset: 5px;">${jaw}</td>
            </tr>
          `;
        } else {
          // Pertanyaan esai dimulai dengan nomor urut 1
          questionsHtml += `
            <div class="qa-container">
              <div class="qa-num">${testQuestionCounter}.</div>
              <div class="qa-content">
                <div class="question">${pert}</div>
                <div class="answer">${jaw}</div>
              </div>
            </div>
          `;
          testQuestionCounter++;
        }
      });
    }

    // 🚀 MERENDER KANVAS TANDA TANGAN DI BAGIAN BAWAH JIKA ADA
    let ttdHtml = '';
    if (data.ttd && data.ttd.trim() !== '') {
      const tanggalCetak = data.waktu_selesai ? data.waktu_selesai.split(' ')[0] : '...........';
      ttdHtml = `
        <div style="width: 100%; text-align: right; margin-top: 40px; page-break-inside: avoid;">
           <div style="display: inline-block; text-align: center; width: 220px;">
              <p style="margin: 0 0 4px 0;">Pacitan, ${tanggalCetak}</p>
              <p style="margin: 0;">Peserta Ujian,</p>
              <img src="${data.ttd}" style="width: 140px; height: 70px; object-fit: contain; margin: 5px 0;" />
              <p style="margin: 0; font-weight: bold; text-decoration: underline;">${data.nama_peserta}</p>
           </div>
        </div>
      `;
    }

    html += `</table><br/>` + questionsHtml + ttdHtml + `</body></html>`;
    
    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.focus();
    
    setTimeout(() => { 
      printWindow.print(); 
    }, 500); 
  };

  // --- 🚀 FITUR HAPUS HASIL WAWANCARA ---
  const requestDeleteWawancara = (email) => {
    showConfirm('Hapus Esai Wawancara', `Hapus seluruh data esai wawancara untuk ${email}? Ini akan memungkinkan peserta untuk mengisi ulang.`, () => {
      setHasilWawancara(prev => prev.filter(h => String(h.email || h.nama_petugas).toLowerCase() !== String(email).toLowerCase()));
      fetch(GOOGLE_SCRIPT_WEB_APP_URL, { 
        method: 'POST', 
        mode: 'no-cors', 
        body: JSON.stringify({ action: "delete_wawancara", email: email }) 
      });
      showAlert('Berhasil', 'Data wawancara peserta tersebut berhasil dihapus.');
    });
  };

  // --- LOGIKA SETTINGS & CRUD ---
  const requestSaveJadwal = (e) => {
    e.preventDefault();
    showConfirm('Simpan Pengaturan', 'Simpan pengaturan jadwal & durasi ujian baru?', () => {
      const payload = { action: "set_jadwal", mulai: new Date(jadwalForm.mulai).getTime(), selesai: new Date(jadwalForm.selesai).getTime(), durasi: jadwalForm.durasi };
      fetch(GOOGLE_SCRIPT_WEB_APP_URL, { method: 'POST', mode: 'no-cors', body: JSON.stringify(payload) });
      showAlert('Berhasil', 'Jadwal dan Durasi telah diperbarui!');
    });
  };

  const requestSaveAdmin = (e) => {
    e.preventDefault();
    showConfirm('Perbarui Akun', 'Ubah akses login root panitia?', () => {
      const payload = { action: "update_admin", email: adminSettingForm.email, password: adminSettingForm.password };
      fetch(GOOGLE_SCRIPT_WEB_APP_URL, { method: 'POST', mode: 'no-cors', body: JSON.stringify(payload) });
      showAlert('Berhasil', 'Kredensial Admin diperbarui!');
    });
  };

  const handleAddPeserta = (e) => {
    e.preventDefault();
    if (!newPeserta.email) return;
    setDaftarPeserta([{ ...newPeserta }, ...daftarPeserta]);
    fetch(GOOGLE_SCRIPT_WEB_APP_URL, { method: 'POST', mode: 'no-cors', body: JSON.stringify({ action: "add_peserta", data: [newPeserta] }) });
    setNewPeserta({ email: '', password: '', nama: '', desa: '', kecamatan: 'Pacitan' });
    showAlert('Sukses', 'Peserta berhasil ditambahkan');
  };

  const handleEditPeserta = (e) => {
    e.preventDefault();
    const updated = daftarPeserta.map(p => p.email === editModal.oldEmail ? editModal.data : p);
    setDaftarPeserta(updated);
    fetch(GOOGLE_SCRIPT_WEB_APP_URL, { method: 'POST', mode: 'no-cors', body: JSON.stringify({ action: "edit_peserta", oldEmail: editModal.oldEmail, newData: editModal.data }) });
    setEditModal({ isOpen: false, oldEmail: '', data: {} });
  };

  const requestDeletePeserta = (email) => {
    showConfirm('Hapus Peserta', 'Hapus peserta ini selamanya?', () => {
      setDaftarPeserta(prev => prev.filter(p => p.email !== email));
      fetch(GOOGLE_SCRIPT_WEB_APP_URL, { method: 'POST', mode: 'no-cors', body: JSON.stringify({ action: "delete_peserta", email: email }) });
    });
  };

  const requestDeleteAllPeserta = () => {
    showConfirm('Hapus Semua Peserta', 'PERINGATAN: Yakin ingin menghapus SELURUH data peserta? Tindakan ini tidak dapat dibatalkan.', () => {
      setDaftarPeserta([]);
      fetch(GOOGLE_SCRIPT_WEB_APP_URL, { method: 'POST', mode: 'no-cors', body: JSON.stringify({ action: "delete_all_peserta" }) });
      showAlert('Berhasil', 'Seluruh data peserta telah dihapus.');
    });
  };

  const requestResetSesi = (email) => {
    showConfirm('Reset Sesi Peserta', `Hapus sesi aktif untuk ${email}? Tindakan ini akan mengizinkan peserta login kembali untuk ujian ulang.`, () => {
      setActiveSessions(prev => prev.filter(s => s.email !== email));
      fetch(GOOGLE_SCRIPT_WEB_APP_URL, { 
        method: 'POST', 
        mode: 'no-cors', 
        body: JSON.stringify({ action: "delete_sesi", email: email }) 
      });
      showAlert('Berhasil', 'Sesi peserta berhasil direset secara permanen.');
    });
  };

  const downloadTemplateCSV = () => {
    const csvContent = "data:text/csv;charset=utf-8,email,password,nama,kecamatan,desa\nmitra1@bps.go.id,sandi123,Budi Santoso,Pacitan,Ploso\nmitra2@bps.go.id,sandi456,Siti Aminah,Pacitan,Arjowinangun";
    const link = document.createElement("a");
    link.href = encodeURI(csvContent);
    link.download = "Template_Data_Mitra.csv";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleUploadCSV = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      const rows = evt.target.result.split('\n');
      const newData = [];
      for (let i = 1; i < rows.length; i++) {
        const row = rows[i].replace(/\r/g, '');
        if (!row.trim()) continue;
        const cols = row.split(',');
        const email = cols[0];
        const password = cols[1];
        const nama = cols[2];
        const kecamatan = cols[3];
        const desa = cols[4];
        if (email && password) {
          newData.push({ 
            email: email.trim(), 
            password: password.trim(), 
            nama: nama?.trim(), 
            kecamatan: kecamatan?.trim(), 
            desa: desa?.trim() 
          });
        }
      }
      setDaftarPeserta([...newData, ...daftarPeserta]);
      fetch(GOOGLE_SCRIPT_WEB_APP_URL, { method: 'POST', mode: 'no-cors', body: JSON.stringify({ action: "add_peserta", data: newData }) });
      showAlert('Impor Berhasil', `Data (${newData.length} baris) berhasil diimpor dari CSV!`);
    };
    reader.readAsText(file);
  };

  const openDetailJawaban = (email, nama, skor, keterangan) => {
    const userDetail = detailAnswers.filter(d => String(d.akun).toLowerCase() === String(email).toLowerCase());
    setViewDetailModal({ isOpen: true, email, nama, skor, keterangan, data: userDetail });
  };

  const requestDeleteHasilFull = (akun) => {
    showConfirm('Hapus Nilai', 'PERINGATAN: Menghapus data ini akan menghapus Nilai DAN seluruh detail Jawaban peserta di database. Lanjutkan?', () => {
      setAdminData(prev => prev.filter(h => h.akun !== akun));
      fetch(GOOGLE_SCRIPT_WEB_APP_URL, { method: 'POST', mode: 'no-cors', body: JSON.stringify({ action: "delete_hasil_full", akun: akun }) });
    });
  };

  const requestBukaAksesRemedial = (akun) => {
    showConfirm('Buka Akses Remedial', 'Buka kembali akses ujian? Data nilai lama peserta akan direset secara permanen.', () => {
      setAdminData(prev => prev.filter(h => h.akun !== akun));
      fetch(GOOGLE_SCRIPT_WEB_APP_URL, { method: 'POST', mode: 'no-cors', body: JSON.stringify({ action: "delete_hasil_full", akun: akun }) });
    });
  };

  if (isLoading) {
    return (
      <div className="h-[100svh] w-screen flex flex-col items-center justify-center bg-slate-50">
        <Loader2 className="w-10 h-10 animate-spin text-[#1A1A1B] mb-4"/>
        <p className="font-black text-slate-500 uppercase tracking-[0.2em] text-xs">Memuat Data...</p>
      </div>
    );
  }

  return (
    <div className="h-[100svh] w-screen flex flex-col font-sans relative overflow-hidden bg-slate-50 selection:bg-[#facc15] selection:text-black">
      
      {/* --- CUSTOM MODALS UI --- */}
      {alertModal.isOpen && (
        <div className="fixed inset-0 bg-[#1A1A1B]/60 backdrop-blur-sm z-[200] flex items-center justify-center p-4">
          <div className="bg-white rounded-[24px] w-full max-w-sm p-6 shadow-2xl animate-scale-in border border-slate-200 text-center">
            <Info className="w-12 h-12 text-[#1A1A1B] mx-auto mb-4" />
            <h3 className="font-black text-lg text-[#1A1A1B] uppercase tracking-tight mb-2">{alertModal.title}</h3>
            <p className="text-sm font-medium text-slate-500 mb-6 leading-relaxed">{alertModal.message}</p>
            <button onClick={() => setAlertModal({isOpen: false})} className="w-full bg-[#1A1A1B] text-white hover:text-[#facc15] font-black py-4 rounded-xl uppercase tracking-widest text-xs transition-colors shadow-lg active:scale-95">Tutup</button>
          </div>
        </div>
      )}

      {confirmModal.isOpen && (
        <div className="fixed inset-0 bg-[#1A1A1B]/60 backdrop-blur-sm z-[200] flex items-center justify-center p-4">
          <div className="bg-white rounded-[24px] w-full max-w-sm p-6 shadow-2xl animate-scale-in border border-slate-200 text-center">
            <AlertTriangle className="w-12 h-12 text-[#facc15] mx-auto mb-4" />
            <h3 className="font-black text-lg text-[#1A1A1B] uppercase tracking-tight mb-2">{confirmModal.title}</h3>
            <p className="text-sm font-medium text-slate-500 mb-6 leading-relaxed">{confirmModal.message}</p>
            <div className="flex gap-3">
              <button onClick={() => setConfirmModal({isOpen: false})} className="flex-1 bg-slate-100 font-bold py-4 rounded-xl text-slate-700 uppercase tracking-widest text-xs hover:bg-slate-200 transition-colors active:scale-95">Batal</button>
              <button onClick={() => { confirmModal.action(); setConfirmModal({isOpen: false}); }} className="flex-1 bg-[#1A1A1B] text-white hover:text-[#facc15] font-black py-4 rounded-xl uppercase tracking-widest text-xs transition-colors shadow-lg active:scale-95">Ya, Lanjutkan</button>
            </div>
          </div>
        </div>
      )}

      {/* --- MODAL DETAIL JAWABAN PG --- */}
      {viewDetailModal.isOpen && (
        <div className="fixed inset-0 bg-[#1A1A1B]/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-[24px] w-full max-w-2xl h-[85vh] flex flex-col shadow-2xl animate-scale-in overflow-hidden border border-slate-200">
            <div className="p-6 border-b-2 border-[#1A1A1B] flex justify-between items-center shrink-0 bg-white">
              <div>
                <h3 className="font-black text-xl text-[#1A1A1B] uppercase tracking-tight">{viewDetailModal.nama}</h3>
                <p className="text-xs font-bold text-slate-400 font-mono mt-1">{viewDetailModal.email}</p>
              </div>
              <div className="flex items-center gap-5">
                <div className="text-right hidden sm:block">
                  <p className="text-2xl font-black text-[#1A1A1B] leading-none mb-1">{viewDetailModal.skor}</p>
                  <p className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded border ${viewDetailModal.keterangan === 'LULUS' ? 'bg-emerald-50 text-emerald-600 border-emerald-200' : 'bg-red-50 text-red-600 border-red-200'}`}>
                    {viewDetailModal.keterangan}
                  </p>
                </div>
                <button onClick={() => setViewDetailModal({ ...viewDetailModal, isOpen: false })} className="p-2 bg-slate-100 hover:bg-slate-200 rounded-full transition-colors text-slate-500 hover:text-black"><X size={20}/></button>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-6 custom-scrollbar bg-slate-50/50">
              <div className="space-y-3">
                {viewDetailModal.data.length === 0 ? <p className="text-center py-20 text-slate-400 font-bold text-sm">Data detail jawaban belum sinkron dari server.</p> : 
                viewDetailModal.data.map((item, idx) => (
                  <div key={idx} className="p-5 rounded-[16px] border border-slate-200 bg-white flex gap-4 hover:border-black transition-colors shadow-sm">
                      <div className="pt-0.5 shrink-0">
                        {item.benar_salah == 1 ? <CheckCircle2 size={24} className="text-emerald-500"/> : <XCircle size={24} className="text-red-500"/>}
                      </div>
                      <div className="flex-1">
                        <p className="text-[13px] font-bold text-slate-800 mb-3 leading-relaxed">{item.soal}</p>
                        <div className="flex items-center gap-2 bg-slate-50 px-3 py-2 rounded-lg w-max border border-slate-100">
                          <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Jawaban:</span>
                          <span className={`text-[11px] font-black px-2 py-0.5 rounded border ${item.benar_salah == 1 ? 'border-emerald-200 bg-emerald-100 text-emerald-700' : 'border-red-200 bg-red-100 text-red-700'}`}>{String(item.jawaban_peserta || '').toUpperCase()}</span>
                        </div>
                      </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* --- MODAL DETAIL JAWABAN ESAI WAWANCARA --- */}
      {viewWawancaraModal.isOpen && viewWawancaraModal.data && (
        <div className="fixed inset-0 bg-[#1A1A1B]/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-[24px] w-full max-w-3xl h-[85vh] flex flex-col shadow-2xl animate-scale-in overflow-hidden border border-slate-200">
            <div className="p-6 border-b-2 border-blue-500 flex justify-between items-center shrink-0 bg-white">
              <div>
                <h3 className="font-black text-xl text-blue-600 uppercase tracking-tight">Detail Jawaban Esai</h3>
                <p className="text-xs font-bold text-slate-500 mt-1">{viewWawancaraModal.data.nama_peserta} | <span className="font-mono">{viewWawancaraModal.data.email}</span></p>
              </div>
              <button onClick={() => setViewWawancaraModal({ isOpen: false, data: null })} className="p-2 bg-slate-100 hover:bg-slate-200 rounded-full transition-colors text-slate-500 hover:text-black"><X size={20}/></button>
            </div>
            <div className="flex-1 overflow-y-auto p-6 custom-scrollbar bg-slate-50">
              <div className="space-y-4">
                {viewWawancaraModal.data.qa.map((item, idx) => (
                  <div key={idx} className="p-5 rounded-[16px] border border-slate-200 bg-white hover:border-blue-300 transition-colors shadow-sm">
                      <p className="font-bold text-slate-800 text-sm mb-3 leading-relaxed border-b border-slate-100 pb-3"><span className="text-blue-500 font-black mr-2">Q{idx+1}.</span>{item.pertanyaan}</p>
                      <div className="text-sm font-medium text-slate-600 bg-slate-50 p-4 rounded-xl border border-slate-100 leading-relaxed whitespace-pre-wrap">
                        {item.jawaban}
                      </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="p-4 bg-white border-t border-slate-200 flex justify-end">
               <button onClick={() => exportWawancaraToPDF(viewWawancaraModal.data)} className="bg-[#1A1A1B] text-white px-5 py-3 rounded-xl text-xs font-black uppercase tracking-widest shadow-md hover:bg-black transition-colors flex items-center gap-2"><Printer size={16}/> Cetak & Unduh Esai</button>
            </div>
          </div>
        </div>
      )}

      {/* --- MODAL EDIT PESERTA --- */}
      {editModal.isOpen && (
        <div className="fixed inset-0 bg-[#1A1A1B]/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-[24px] w-full max-w-md p-6 shadow-2xl animate-scale-in border border-slate-200">
            <div className="flex justify-between items-center mb-6 border-b-2 border-black pb-4">
              <h3 className="font-black text-lg flex items-center gap-2 text-[#1A1A1B] uppercase tracking-tight"><Edit3 className="text-[#facc15]"/> Edit Peserta</h3>
              <button onClick={() => setEditModal({ ...editModal, isOpen: false })}><X className="text-slate-400 hover:text-black"/></button>
            </div>
            <form onSubmit={handleEditPeserta} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase ml-1 tracking-widest">Email Akun</label>
                <input required type="email" value={editModal.data.email} onChange={e => setEditModal({...editModal, data: {...editModal.data, email: e.target.value}})} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-black focus:bg-white text-sm font-semibold transition-colors" />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase ml-1 tracking-widest">Password Baru</label>
                <input required type="text" value={editModal.data.password} onChange={e => setEditModal({...editModal, data: {...editModal.data, password: e.target.value}})} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-black focus:bg-white text-sm font-semibold transition-colors" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase ml-1 tracking-widest">Nama Lengkap</label>
                  <input type="text" value={editModal.data.nama} onChange={e => setEditModal({...editModal, data: {...editModal.data, nama: e.target.value}})} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-black focus:bg-white text-sm font-semibold transition-colors" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase ml-1 tracking-widest">Kecamatan</label>
                  <select value={editModal.data.kecamatan} onChange={e => setEditModal({...editModal, data: {...editModal.data, kecamatan: e.target.value}})} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-black focus:bg-white text-sm font-semibold transition-colors">
                    {KECAMATAN_LIST.map(k => <option key={k} value={k}>{k}</option>)}
                  </select>
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase ml-1 tracking-widest">Desa</label>
                <input type="text" value={editModal.data.desa} onChange={e => setEditModal({...editModal, data: {...editModal.data, desa: e.target.value}})} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-black focus:bg-white text-sm font-semibold transition-colors" />
              </div>
              <button type="submit" className="w-full bg-[#1A1A1B] text-white hover:text-[#facc15] font-black py-4 rounded-xl mt-4 active:scale-95 transition-all uppercase tracking-widest text-xs shadow-lg">Simpan Perubahan</button>
            </form>
          </div>
        </div>
      )}

      {/* --- HEADER --- */}
      <header className="bg-white border-b border-slate-200 px-4 md:px-6 h-[70px] flex items-center justify-between shrink-0 z-50">
        <div className="flex items-center gap-4">
          <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2 hover:bg-slate-100 rounded-xl transition-colors text-slate-600">
            <Menu size={24}/>
          </button>
          
          <div className="flex items-center gap-3">
            <img src="/logo.png" alt="Logo Utama" className="h-8 w-auto drop-shadow-sm" onError={(e) => e.target.style.display = 'none'} />
            <div className="hidden sm:block ml-2 border-l-2 border-slate-200 pl-3">
              <h1 className="font-black text-[#1A1A1B] text-sm md:text-[15px] leading-tight uppercase tracking-tight">Dashboard Uji Kompetensi</h1>
            </div>
          </div>
        </div>
        
        <div className="flex gap-2 items-center">
          <button onClick={fetchData} className="flex items-center gap-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 px-3 md:px-4 py-2 md:py-2.5 rounded-lg md:rounded-xl text-xs font-black transition-colors shadow-sm">
            <RefreshCw className="w-3.5 h-3.5" /> <span className="hidden md:inline uppercase tracking-widest">Segarkan</span>
          </button>
          <button onClick={handleLogout} className="flex items-center gap-2 bg-[#1A1A1B] text-white hover:text-[#facc15] px-4 py-2.5 rounded-xl text-xs font-black transition-colors shadow-md hover:shadow-lg">
            <LogOut className="w-3.5 h-3.5" /> <span className="hidden md:inline uppercase tracking-widest">Keluar</span>
          </button>
        </div>
      </header>

      <main className="flex-1 flex overflow-hidden">
        
        {/* --- SIDEBAR --- */}
        <aside className={`${isSidebarOpen ? 'w-64' : 'w-0 md:w-20'} bg-[#1A1A1B] flex flex-col transition-all duration-300 ease-in-out z-40 overflow-hidden shrink-0 border-r border-[#2A2A2B]`}>
          <div className="flex-1 py-6 flex flex-col gap-2 px-3 overflow-y-auto custom-scrollbar">
            {[
              { id: 'dashboard', icon: <LayoutDashboard size={18}/>, label: 'Dashboard' },
              { id: 'rekap', icon: <Layers size={18}/>, label: 'Rangkuman Hasil' },
              { id: 'peserta', icon: <Users size={18}/>, label: 'Data Peserta' },
              { id: 'soal', icon: <Database size={18}/>, label: 'Soal Ujian' },
              { id: 'soal_wawancara', icon: <MessageCircle size={18}/>, label: 'Soal Esai' },
              { id: 'hasil', icon: <FileSpreadsheet size={18}/>, label: 'Hasil Ujian' },
              { id: 'hasil_wawancara', icon: <ClipboardList size={18}/>, label: 'Hasil Esai' },
              { id: 'sesi', icon: <Activity size={18}/>, label: 'Sesi Aktif' },
              { id: 'remedial', icon: <RefreshCw size={18}/>, label: 'Remedial' },
              { id: 'pengaturan', icon: <Settings size={18}/>, label: 'Pengaturan' }
            ].map(m => (
              <button key={m.id} onClick={() => { setActiveTab(m.id); if(window.innerWidth < 768) setIsSidebarOpen(false); }} 
                className={`flex items-center gap-4 p-3.5 rounded-xl font-bold text-sm transition-all group ${activeTab === m.id ? 'bg-[#facc15] text-[#1A1A1B] shadow-md' : 'text-slate-400 hover:text-white hover:bg-white/10'}`}>
                <div className="shrink-0">{m.icon}</div>
                {isSidebarOpen && <span className="whitespace-nowrap tracking-wide">{m.label}</span>}
              </button>
            ))}
          </div>
        </aside>

        {/* --- CONTENT AREA --- */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-4 md:p-8 relative">
          <div className="max-w-[1200px] mx-auto space-y-6">
            
            {/* TAB CONTENT: DASHBOARD */}
            {activeTab === 'dashboard' && (
              <div className="space-y-8 animate-fade-up">
                
                <h2 className="text-2xl font-black text-[#1A1A1B] tracking-tight uppercase border-b-2 border-[#1A1A1B] pb-2 inline-block">Dashboard</h2>
                
                {/* Statistik Utama */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="bg-white p-5 rounded-[20px] shadow-sm border border-slate-200 hover:border-black transition-colors group">
                    <div className="flex justify-between items-start mb-4">
                      <div><p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Peserta</p><p className="text-3xl font-black text-[#1A1A1B]">{totalPendaftar}</p></div>
                      <div className="w-10 h-10 bg-[#facc15]/20 text-[#d97706] rounded-xl flex items-center justify-center group-hover:bg-[#facc15] group-hover:text-black transition-colors"><Users size={20}/></div>
                    </div>
                  </div>

                  <div className="bg-white p-5 rounded-[20px] shadow-sm border border-slate-200 hover:border-black transition-colors group">
                    <div className="flex justify-between items-start mb-2">
                      <div><p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Partisipasi</p><p className="text-3xl font-black text-[#1A1A1B]">{jumlahSudahUjian}</p></div>
                      <div className="w-10 h-10 bg-slate-100 text-slate-500 rounded-xl flex items-center justify-center group-hover:bg-[#1A1A1B] group-hover:text-white transition-colors"><CheckCircle2 size={20}/></div>
                    </div>
                    <div className="flex items-center justify-between"><span className="text-xs font-bold text-slate-500">{persenUjian}% Selesai</span></div>
                    <ProgressBar percent={persenUjian} color="bg-blue-600"/>
                  </div>

                  <div className="bg-white p-5 rounded-[20px] shadow-sm border border-slate-200 hover:border-black transition-colors group">
                    <div className="flex justify-between items-start mb-2">
                      <div><p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Lulus</p><p className="text-3xl font-black text-[#1A1A1B]">{jumlahLulus}</p></div>
                      <div className="w-10 h-10 bg-slate-100 text-slate-500 rounded-xl flex items-center justify-center group-hover:bg-[#1A1A1B] group-hover:text-white transition-colors"><ListFilter size={20}/></div>
                    </div>
                    <div className="flex items-center justify-between"><span className="text-xs font-bold text-slate-500">{persenLulus}% Lulus</span></div>
                    <ProgressBar percent={persenLulus} color="bg-emerald-500"/>
                  </div>

                  <div className="bg-white p-5 rounded-[20px] shadow-sm border border-slate-200 hover:border-black transition-colors group">
                    <div className="flex justify-between items-start mb-2">
                      <div><p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Tidak Lulus</p><p className="text-3xl font-black text-[#1A1A1B]">{totalGagal}</p></div>
                      <div className="w-10 h-10 bg-slate-100 text-slate-500 rounded-xl flex items-center justify-center group-hover:bg-[#1A1A1B] group-hover:text-white transition-colors"><AlertTriangle size={20}/></div>
                    </div>
                    <div className="flex items-center justify-between"><span className="text-xs font-bold text-slate-500">{persenRemedial}% Tidak Lulus</span></div>
                    <ProgressBar percent={persenRemedial} color="bg-red-500"/>
                  </div>
                </div>

                {/* SATU BARCHART TERPADU UNTUK 12 KECAMATAN */}
                <div className="bg-white rounded-[24px] shadow-sm border border-slate-200 p-6 md:p-8">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 border-b border-slate-100 pb-4">
                    <div>
                      <h3 className="text-lg font-black text-slate-800 uppercase tracking-tight flex items-center gap-2"><TrendingUp className="text-blue-500"/> Progress Terpadu Kecamatan</h3>
                      <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-widest">Kabupaten Pacitan</p>
                    </div>
                    <div className="flex flex-wrap items-center gap-3">
                      {/* Filter Search */}
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14}/>
                        <input type="text" placeholder="Cari kecamatan..." value={dashFilter} onChange={e => setDashFilter(e.target.value)} className="w-full sm:w-40 pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:border-black outline-none font-semibold transition-colors"/>
                      </div>
                      {/* Filter Sort */}
                      <select value={dashSort} onChange={e => setDashSort(e.target.value)} className="text-xs font-bold border border-slate-200 rounded-xl px-3 py-2 bg-slate-50 outline-none focus:border-black cursor-pointer text-slate-600">
                         <option value="nama_asc">Nama (A-Z)</option>
                         <option value="nama_desc">Nama (Z-A)</option>
                         <option value="prog_desc">Progress Tertinggi</option>
                         <option value="prog_asc">Progress Terendah</option>
                         <option value="lulus_desc">Lulus Tertinggi</option>
                         <option value="lulus_asc">Lulus Terendah</option>
                      </select>
                      {/* Legend */}
                      <div className="hidden md:flex items-center gap-4 text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">
                        <span className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded bg-[#1A1A1B]"></div> Mengerjakan</span>
                        <span className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded bg-[#facc15]"></div> Lulus</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    {kecamatanStats.map((stat) => (
                      <KecamatanProgressChart key={stat.kec} data={stat} />
                    ))}
                    {kecamatanStats.length === 0 && <p className="text-center py-10 text-slate-400 font-bold text-sm">Kecamatan tidak ditemukan.</p>}
                  </div>
                </div>

              </div>
            )}

            {/* 🚀 TAB CONTENT: REKAP TERPADU */}
            {activeTab === 'rekap' && (
              <div className="space-y-6 animate-fade-up">
                
                <div className="bg-white rounded-[24px] overflow-hidden border border-slate-200 shadow-sm flex flex-col">
                  
                  {/* BARIS FILTER */}
                  <div className="px-6 py-5 border-b border-slate-100 flex flex-col space-y-4 bg-white">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-3">
                        <h3 className="font-black text-base text-slate-800 uppercase tracking-tight">Rekapitulasi Keseluruhan (PG & Esai)</h3>
                      </div>
                      <div className="flex gap-2">
                        <button onClick={exportRekapToCSV} className="bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2.5 rounded-xl text-xs font-black flex items-center gap-2 transition-colors uppercase tracking-widest shadow-md active:scale-95"><DownloadCloud size={16}/> CSV Rekap</button>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                      <div className="relative w-full">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14}/>
                        <input type="text" placeholder="Cari nama/email..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:border-black outline-none font-semibold transition-colors"/>
                      </div>
                      <select value={filterStatusRekap} onChange={e => setFilterStatusRekap(e.target.value)} className="text-xs font-bold border border-slate-200 rounded-xl px-3 py-2 bg-slate-50 outline-none focus:border-black cursor-pointer text-slate-600">
                         <option value="ALL">- Semua Status Akhir -</option>
                         <option value="SELESAI SEMUA">Selesai Semua (Lulus PG & Sudah Esai)</option>
                         <option value="LULUS PG (BELUM ESAI)">Lulus PG (Belum Esai)</option>
                         <option value="GAGAL PG">Gagal PG</option>
                         <option value="BELUM MULAI">Belum Mulai Sama Sekali</option>
                      </select>
                    </div>
                  </div>

                  <div className="overflow-x-auto custom-scrollbar">
                    <table className="w-full text-left border-collapse whitespace-nowrap min-w-max">
                      <thead className="bg-slate-50 text-[10px] uppercase font-black tracking-widest text-slate-500 sticky top-0 z-10 border-b-2 border-slate-800">
                        <tr>
                          <th className="px-6 py-4 w-10 text-center">No</th>
                          <th className="px-6 py-4 cursor-pointer hover:bg-slate-100 select-none" onClick={() => requestSort('nama')}>Peserta <SortIcon columnKey="nama"/></th>
                          <th className="px-6 py-4 cursor-pointer hover:bg-slate-100 select-none" onClick={() => requestSort('kecamatan')}>Kecamatan <SortIcon columnKey="kecamatan"/></th>
                          <th className="px-6 py-4 text-center cursor-pointer hover:bg-slate-100 select-none" onClick={() => requestSort('skorPG')}>Skor PG <SortIcon columnKey="skorPG"/></th>
                          <th className="px-6 py-4 cursor-pointer hover:bg-slate-100 select-none" onClick={() => requestSort('statusPG')}>Status PG <SortIcon columnKey="statusPG"/></th>
                          <th className="px-6 py-4 cursor-pointer hover:bg-slate-100 select-none" onClick={() => requestSort('statusEsai')}>Status Esai <SortIcon columnKey="statusEsai"/></th>
                          <th className="px-6 py-4 cursor-pointer hover:bg-slate-100 select-none" onClick={() => requestSort('statusAkhir')}>Status Akhir <SortIcon columnKey="statusAkhir"/></th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {currentRekap.map((row, idx) => {
                          const actualIdx = (currentPage - 1) * itemsPerPage + idx + 1;
                          
                          // Pewarnaan Label Status Akhir
                          let akhirLabelColor = "bg-slate-100 text-slate-500 border-slate-200";
                          if (row.statusAkhir === 'SELESAI SEMUA') akhirLabelColor = "bg-emerald-50 text-emerald-600 border-emerald-200";
                          if (row.statusAkhir === 'LULUS PG (BELUM ESAI)') akhirLabelColor = "bg-blue-50 text-blue-600 border-blue-200";
                          if (row.statusAkhir === 'GAGAL PG') akhirLabelColor = "bg-red-50 text-red-600 border-red-200";

                          return (
                            <tr key={idx} className="hover:bg-slate-50 transition-colors group">
                              <td className="px-6 py-3 text-center font-bold text-slate-300 text-xs">{actualIdx}</td>
                              <td className="px-6 py-3">
                                <p className="font-bold text-[13px] text-slate-800 mb-0.5">{row.nama}</p>
                                <p className="text-[10px] text-slate-400 font-mono">{row.email}</p>
                              </td>
                              <td className="px-6 py-3">
                                <p className="text-xs font-semibold text-slate-600">{row.kecamatan || '-'}</p>
                                <p className="text-[10px] text-slate-400">{row.desa || '-'}</p>
                              </td>
                              <td className="px-6 py-3 text-sm font-black text-center text-[#1A1A1B]">{row.skorPG}</td>
                              <td className="px-6 py-3">
                                {row.statusPG === 'LULUS' ? (
                                  <span className="font-black text-[10px] text-emerald-600">LULUS PG</span>
                                ) : row.statusPG === 'TIDAK LULUS' ? (
                                  <span className="font-black text-[10px] text-red-600">GAGAL PG</span>
                                ) : (
                                  <span className="font-bold text-[10px] text-slate-400">BELUM UJIAN</span>
                                )}
                              </td>
                              <td className="px-6 py-3">
                                {row.statusEsai === 'SUDAH ESAI' ? (
                                  <span className="font-black text-[10px] text-blue-600">SUDAH ESAI</span>
                                ) : (
                                  <span className="font-bold text-[10px] text-slate-400">BELUM ESAI</span>
                                )}
                              </td>
                              <td className="px-6 py-3">
                                <span className={`inline-flex items-center px-2.5 py-1 rounded border text-[9px] font-black uppercase tracking-widest ${akhirLabelColor}`}>
                                  {row.statusAkhir}
                                </span>
                              </td>
                            </tr>
                          );
                        })}
                        {currentRekap.length === 0 && <tr><td colSpan="7" className="p-10 text-center text-slate-400 font-medium text-sm">Data tidak ditemukan.</td></tr>}
                      </tbody>
                    </table>
                  </div>
                  {totalPagesRekap > 0 && (
                    <PaginationFooter currentPage={currentPage} totalPages={totalPagesRekap} setCurrentPage={setCurrentPage} itemsPerPage={itemsPerPage} setItemsPerPage={setItemsPerPage} />
                  )}
                </div>
              </div>
            )}

            {/* TAB CONTENT: DATA PESERTA */}
            {activeTab === 'peserta' && (
              <div className="space-y-6 animate-fade-up">
                <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                  
                  <div className="bg-white p-6 rounded-[24px] lg:col-span-2 shadow-sm border border-slate-200">
                    <h3 className="font-black text-base text-[#1A1A1B] mb-5 uppercase tracking-tight flex items-center gap-2"><Users className="text-[#facc15]"/> Registrasi Manual</h3>
                    <form onSubmit={handleAddPeserta} className="grid grid-cols-2 gap-3">
                      <input required type="email" placeholder="Email Peserta" value={newPeserta.email} onChange={e => setNewPeserta({...newPeserta, email: e.target.value})} className="col-span-2 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-black text-sm font-semibold transition-colors" />
                      <input required type="text" placeholder="Kata Sandi" value={newPeserta.password} onChange={e => setNewPeserta({...newPeserta, password: e.target.value})} className="col-span-2 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-black text-sm font-semibold transition-colors" />
                      <input type="text" placeholder="Nama Lengkap" value={newPeserta.nama} onChange={e => setNewPeserta({...newPeserta, nama: e.target.value})} className="col-span-2 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-black text-sm font-semibold transition-colors" />
                      
                      <select value={newPeserta.kecamatan} onChange={e => setNewPeserta({...newPeserta, kecamatan: e.target.value})} className="col-span-1 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-black text-sm font-semibold transition-colors text-slate-600">
                        {KECAMATAN_LIST.map(k => <option key={k} value={k}>{k}</option>)}
                      </select>
                      
                      <input type="text" placeholder="Desa" value={newPeserta.desa} onChange={e => setNewPeserta({...newPeserta, desa: e.target.value})} className="col-span-1 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-black text-sm font-semibold transition-colors" />
                      
                      <button type="submit" className="col-span-2 bg-[#1A1A1B] text-white hover:text-[#facc15] font-black py-4 rounded-xl mt-3 transition-all text-xs uppercase tracking-widest shadow-md active:scale-95">Daftarkan Peserta</button>
                    </form>
                  </div>
                  
                  <div className="bg-white p-6 rounded-[24px] lg:col-span-3 flex flex-col justify-center border border-slate-200 shadow-sm relative overflow-hidden">
                    <div className="absolute -right-10 -top-10 text-slate-50 opacity-50"><FileSpreadsheet size={220}/></div>
                    <div className="relative z-10">
                      <h3 className="font-black text-base text-[#1A1A1B] mb-2 uppercase tracking-tight">Impor (CSV)</h3>
                      <p className="text-xs text-slate-500 mb-6 leading-relaxed max-w-md font-medium">Gunakan template untuk mendaftarkan ratusan peserta sekaligus. Kolom wajib: <b>Email, Sandi, Nama, Kecamatan, Desa</b>.</p>
                      <div className="flex flex-wrap gap-3">
                        <button onClick={downloadTemplateCSV} className="px-5 py-3.5 bg-white border border-slate-200 text-slate-700 font-bold rounded-xl text-xs shadow-sm hover:border-black transition-colors flex items-center gap-2 uppercase tracking-widest"><Download size={14}/> Unduh Template</button>
                        <label className="px-5 py-3.5 bg-emerald-500 hover:bg-emerald-600 text-white font-black rounded-xl text-xs cursor-pointer shadow-md transition-colors flex items-center gap-2 uppercase tracking-widest active:scale-95">
                          <UserPlus size={16}/> Upload CSV <input type="file" accept=".csv" onChange={handleUploadCSV} className="hidden" />
                        </label>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-[24px] shadow-sm border border-slate-200 overflow-hidden flex flex-col">
                   <div className="px-6 py-5 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-center bg-white gap-4">
                      <div className="flex items-center gap-3">
                        <h3 className="font-black text-slate-800 text-base uppercase tracking-tight">Database Akun ({daftarPeserta.length})</h3>
                        <button onClick={requestDeleteAllPeserta} className="bg-red-50 text-red-600 hover:bg-red-500 hover:text-white border border-red-200 px-3 py-1.5 rounded-lg text-[10px] font-black flex items-center gap-1.5 transition-colors uppercase tracking-widest shadow-sm"><Trash2 size={12}/> Hapus Semua</button>
                      </div>
                      <div className="relative w-full sm:w-80">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16}/>
                        <input type="text" placeholder="Cari nama, email, desa..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full pl-11 pr-4 py-2.5 border border-slate-200 bg-slate-50 rounded-xl text-sm focus:border-black outline-none font-semibold transition-colors"/>
                      </div>
                   </div>
                   <div className="overflow-x-auto custom-scrollbar">
                     <table className="w-full text-left border-collapse whitespace-nowrap min-w-max">
                       <thead className="bg-slate-50 text-[10px] uppercase font-black tracking-widest text-slate-500 border-b-2 border-slate-800 sticky top-0 z-10">
                         <tr>
                           <th className="px-6 py-4 w-12 text-center">No</th>
                           <th className="px-6 py-4 cursor-pointer hover:bg-slate-100 select-none" onClick={() => requestSort('nama')}>Peserta <SortIcon columnKey="nama"/></th>
                           <th className="px-6 py-4 cursor-pointer hover:bg-slate-100 select-none" onClick={() => requestSort('kecamatan')}>Kecamatan <SortIcon columnKey="kecamatan"/></th>
                           <th className="px-6 py-4 cursor-pointer hover:bg-slate-100 select-none" onClick={() => requestSort('desa')}>Desa <SortIcon columnKey="desa"/></th>
                           <th className="px-6 py-4 cursor-pointer hover:bg-slate-100 select-none" onClick={() => requestSort('password')}>Kata Sandi <SortIcon columnKey="password"/></th>
                           <th className="px-6 py-4 text-right">Opsi</th>
                         </tr>
                       </thead>
                       <tbody className="divide-y divide-slate-100">
                         {currentPeserta.map((p, i) => {
                           const actualIdx = (currentPage - 1) * itemsPerPage + i + 1;
                           return (
                             <tr key={i} className="hover:bg-slate-50/80 transition-colors">
                               <td className="px-6 py-3 text-center font-bold text-slate-400 text-xs">{actualIdx}</td>
                               <td className="px-6 py-3">
                                 <p className="font-bold text-slate-800 text-[13px] mb-0.5">{p.nama || '-'}</p>
                                 <p className="text-[10px] text-slate-500 font-mono">{p.email}</p>
                               </td>
                               <td className="px-6 py-3 text-xs font-semibold text-slate-600">{p.kecamatan || '-'}</td>
                               <td className="px-6 py-3 text-xs font-semibold text-slate-600">{p.desa || '-'}</td>
                               <td className="px-6 py-3"><span className="px-2.5 py-1 border border-slate-200 bg-white rounded-md text-[11px] font-mono text-slate-600">{p.password}</span></td>
                               <td className="px-6 py-3 text-right">
                                 <div className="flex justify-end gap-1.5">
                                    <button onClick={() => setEditModal({ isOpen: true, oldEmail: p.email, data: {...p, kecamatan: p.kecamatan || 'Pacitan'} })} className="p-2 text-slate-400 hover:text-black rounded-lg border border-transparent hover:border-slate-200 bg-white transition-all"><Edit3 size={16}/></button>
                                    <button onClick={() => requestDeletePeserta(p.email)} className="p-2 text-slate-400 hover:text-white rounded-lg border border-transparent hover:bg-red-500 hover:border-red-600 transition-all"><Trash2 size={16}/></button>
                                 </div>
                               </td>
                             </tr>
                           )
                         })}
                         {currentPeserta.length === 0 && <tr><td colSpan="6" className="p-10 text-center text-slate-400 font-medium text-sm">Belum ada data peserta.</td></tr>}
                       </tbody>
                     </table>
                   </div>
                   {totalPagesPeserta > 0 && (
                     <PaginationFooter currentPage={currentPage} totalPages={totalPagesPeserta} setCurrentPage={setCurrentPage} itemsPerPage={itemsPerPage} setItemsPerPage={setItemsPerPage} />
                   )}
                </div>
              </div>
            )}

            {/* TAB CONTENT: HASIL UJIAN PG */}
            {activeTab === 'hasil' && (
              <div className="space-y-6 animate-fade-up">
                
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="bg-white p-5 rounded-[20px] shadow-sm border border-slate-200 hover:border-black transition-colors group">
                    <div className="flex justify-between items-start mb-2">
                      <div><p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Rata-Rata Skor</p><p className="text-3xl font-black text-[#1A1A1B]">{rataSkor}</p></div>
                      <div className="w-10 h-10 bg-slate-100 text-slate-500 rounded-xl flex items-center justify-center group-hover:bg-[#1A1A1B] group-hover:text-white transition-colors"><BarChart3 size={20}/></div>
                    </div>
                  </div>

                  <div className="bg-white p-5 rounded-[20px] shadow-sm border border-slate-200 hover:border-black transition-colors group">
                    <div className="flex justify-between items-start mb-2">
                      <div><p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Lulus PG</p><p className="text-3xl font-black text-[#1A1A1B]">{jumlahLulus}</p></div>
                      <div className="w-10 h-10 bg-slate-100 text-slate-500 rounded-xl flex items-center justify-center group-hover:bg-[#1A1A1B] group-hover:text-white transition-colors"><CheckCircle2 size={20}/></div>
                    </div>
                  </div>

                  <div className="bg-white p-5 rounded-[20px] shadow-sm border border-slate-200 hover:border-black transition-colors group">
                    <div className="flex justify-between items-start mb-2">
                      <div><p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Tidak Lulus PG</p><p className="text-3xl font-black text-[#1A1A1B]">{totalGagal}</p></div>
                      <div className="w-10 h-10 bg-slate-100 text-slate-500 rounded-xl flex items-center justify-center group-hover:bg-[#1A1A1B] group-hover:text-white transition-colors"><XCircle size={20}/></div>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-[24px] overflow-hidden border border-slate-200 shadow-sm flex flex-col">
                  
                  {/* BARIS FILTER KOMPLEKS */}
                  <div className="px-6 py-5 border-b border-slate-100 flex flex-col space-y-4 bg-white">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-3">
                        <h3 className="font-black text-base text-slate-800 uppercase tracking-tight">Rekapitulasi Ujian PG</h3>
                        <span className="bg-[#facc15] text-[#1A1A1B] px-3 py-1 rounded-md text-[10px] font-black uppercase tracking-widest border border-yellow-400">PG: 70</span>
                      </div>
                      <div className="flex gap-2">
                        <button onClick={exportHasilToPDF} className="bg-red-500 hover:bg-red-600 text-white px-4 py-2.5 rounded-xl text-xs font-black flex items-center gap-2 transition-colors uppercase tracking-widest shadow-md active:scale-95"><Printer size={16}/> PDF</button>
                        <button onClick={exportHasilToCSV} className="bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2.5 rounded-xl text-xs font-black flex items-center gap-2 transition-colors uppercase tracking-widest shadow-md active:scale-95"><DownloadCloud size={16}/> CSV</button>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                      <div className="relative w-full">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14}/>
                        <input type="text" placeholder="Cari nama/email..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:border-black outline-none font-semibold transition-colors"/>
                      </div>
                      <select value={filterKecamatan} onChange={e => setFilterKecamatan(e.target.value)} className="text-xs font-bold border border-slate-200 rounded-xl px-3 py-2 bg-slate-50 outline-none focus:border-black cursor-pointer text-slate-600">
                         <option value="ALL">- Semua Kecamatan -</option>
                         {KECAMATAN_LIST.map(k => <option key={k} value={k.toUpperCase()}>{k}</option>)}
                      </select>
                      <select value={filterDesa} onChange={e => setFilterDesa(e.target.value)} className="text-xs font-bold border border-slate-200 rounded-xl px-3 py-2 bg-slate-50 outline-none focus:border-black cursor-pointer text-slate-600">
                         <option value="ALL">- Semua Desa -</option>
                         {uniqueDesaList.map(d => <option key={d} value={d.toUpperCase()}>{d}</option>)}
                      </select>
                      <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="text-xs font-bold border border-slate-200 rounded-xl px-3 py-2 bg-slate-50 outline-none focus:border-black cursor-pointer text-slate-600">
                         <option value="ALL">- Semua Status -</option>
                         <option value="LULUS">Lulus</option>
                         <option value="TIDAK LULUS">Tidak Lulus</option>
                      </select>
                    </div>
                  </div>

                  <div className="overflow-x-auto custom-scrollbar">
                    <table className="w-full text-left border-collapse whitespace-nowrap min-w-max">
                      <thead className="bg-slate-50 text-[10px] uppercase font-black tracking-widest text-slate-500 sticky top-0 z-10 border-b-2 border-slate-800">
                        <tr>
                          <th className="px-6 py-4 w-10 text-center">No</th>
                          <th className="px-6 py-4 cursor-pointer hover:bg-slate-100 select-none" onClick={() => requestSort('waktu_selesai')}>Selesai <SortIcon columnKey="waktu_selesai"/></th>
                          <th className="px-6 py-4 cursor-pointer hover:bg-slate-100 select-none" onClick={() => requestSort('nama')}>Peserta <SortIcon columnKey="nama"/></th>
                          <th className="px-6 py-4 cursor-pointer hover:bg-slate-100 select-none" onClick={() => requestSort('kecamatan')}>Kecamatan <SortIcon columnKey="kecamatan"/></th>
                          <th className="px-6 py-4 cursor-pointer hover:bg-slate-100 select-none" onClick={() => requestSort('desa')}>Desa <SortIcon columnKey="desa"/></th>
                          <th className="px-6 py-4 text-center cursor-pointer hover:bg-slate-100 select-none" onClick={() => requestSort('durasi')}>Durasi <SortIcon columnKey="durasi"/></th>
                          <th className="px-6 py-4 text-center cursor-pointer hover:bg-slate-100 select-none" onClick={() => requestSort('benar')}>B <SortIcon columnKey="benar"/></th>
                          <th className="px-6 py-4 text-center cursor-pointer hover:bg-slate-100 select-none" onClick={() => requestSort('skor')}>Skor <SortIcon columnKey="skor"/></th>
                          <th className="px-6 py-4 cursor-pointer hover:bg-slate-100 select-none" onClick={() => requestSort('keterangan')}>Status <SortIcon columnKey="keterangan"/></th>
                          <th className="px-6 py-4 text-right">Opsi</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {currentDataHasil.map((row, idx) => {
                          const actualIdx = (currentPage - 1) * itemsPerPage + idx + 1;
                          return (
                            <tr key={idx} className="hover:bg-slate-50 transition-colors group">
                              <td className="px-6 py-3 text-center font-bold text-slate-300 text-xs">{actualIdx}</td>
                              <td className="px-6 py-3 text-[11px] text-slate-500 font-mono">{row.waktu_selesai}</td>
                              <td className="px-6 py-3">
                                <p className="font-bold text-[13px] text-slate-800 mb-0.5">{row.nama}</p>
                                <p className="text-[10px] text-slate-400 font-mono">{row.akun}</p>
                              </td>
                              <td className="px-6 py-3 text-xs font-semibold text-slate-600">{row.kecamatan}</td>
                              <td className="px-6 py-3 text-xs font-semibold text-slate-600">{row.desa}</td>
                              <td className="px-6 py-3 text-center"><span className="px-2.5 py-1 border border-slate-200 bg-white rounded-md text-[10px] font-mono text-slate-600">{row.durasi}</span></td>
                              <td className="px-6 py-3 text-xs font-bold text-slate-600 text-center">{row.benar}</td>
                              <td className="px-6 py-3 text-sm font-black text-center text-[#1A1A1B]">{row.skor}</td>
                              <td className="px-6 py-3">
                                {row.keterangan === 'LULUS' ? (
                                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-white border border-emerald-200 text-[9px] font-black uppercase tracking-widest text-emerald-700 shadow-sm"><div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div> LULUS</span>
                                ) : (
                                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-white border border-red-200 text-[9px] font-black uppercase tracking-widest text-red-700 shadow-sm"><div className="w-1.5 h-1.5 rounded-full bg-red-500"></div> TIDAK LULUS</span>
                                )}
                              </td>
                              <td className="px-6 py-3 text-right">
                                 <div className="flex justify-end gap-1.5 opacity-50 group-hover:opacity-100 transition-opacity">
                                    <button onClick={() => openDetailJawaban(row.akun, row.nama, row.skor, row.keterangan)} className="p-2 text-slate-500 hover:text-black bg-white border border-slate-200 rounded-lg hover:border-black transition-colors" title="Lihat Detail"><FileText size={16}/></button>
                                    <button onClick={() => requestDeleteHasilFull(row.akun)} className="p-2 text-slate-500 hover:text-white bg-white border border-slate-200 rounded-lg hover:bg-red-500 hover:border-red-600 transition-colors" title="Hapus Data"><Trash2 size={16}/></button>
                                 </div>
                              </td>
                            </tr>
                          );
                        })}
                        {currentDataHasil.length === 0 && <tr><td colSpan="10" className="p-10 text-center text-slate-400 font-medium text-sm">Belum ada pengerjaan yang sesuai kriteria.</td></tr>}
                      </tbody>
                    </table>
                  </div>
                  {totalPagesHasil > 0 && (
                    <PaginationFooter currentPage={currentPage} totalPages={totalPagesHasil} setCurrentPage={setCurrentPage} itemsPerPage={itemsPerPage} setItemsPerPage={setItemsPerPage} />
                  )}
                </div>
              </div>
            )}

            {/* TAB CONTENT: HASIL WAWANCARA (ESAI) */}
            {activeTab === 'hasil_wawancara' && (
              <div className="space-y-6 animate-fade-up">
                
                {/* 🚀 3 KOTAK STATISTIK BARU UNTUK ESAI WAWANCARA */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                   <div className="bg-white p-5 rounded-[20px] shadow-sm border border-slate-200 hover:border-black transition-colors group flex items-center gap-4">
                     <div className="w-12 h-12 bg-blue-50 text-blue-500 rounded-xl flex items-center justify-center group-hover:bg-blue-500 group-hover:text-white transition-colors"><ClipboardList size={20}/></div>
                     <div><p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Sudah Esai</p><p className="text-2xl font-black text-[#1A1A1B]">{groupedWawancaraArr.length}</p></div>
                   </div>
                   <div className="bg-white p-5 rounded-[20px] shadow-sm border border-slate-200 hover:border-black transition-colors group flex items-center gap-4">
                     <div className="w-12 h-12 bg-emerald-50 text-emerald-500 rounded-xl flex items-center justify-center group-hover:bg-emerald-500 group-hover:text-white transition-colors"><CheckCircle2 size={20}/></div>
                     <div className="flex-1">
                       <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">% Dari Selesai PG</p>
                       <div className="flex items-end justify-between">
                         <p className="text-2xl font-black text-[#1A1A1B]">{adminData.length > 0 ? Math.round((groupedWawancaraArr.length / adminData.length) * 100) || 0 : 0}%</p>
                         <span className="text-[10px] font-bold text-slate-400">{groupedWawancaraArr.length} / {adminData.length}</span>
                       </div>
                     </div>
                   </div>
                   <div className="bg-white p-5 rounded-[20px] shadow-sm border border-slate-200 hover:border-black transition-colors group flex items-center gap-4">
                     <div className="w-12 h-12 bg-orange-50 text-orange-500 rounded-xl flex items-center justify-center group-hover:bg-orange-500 group-hover:text-white transition-colors"><Users size={20}/></div>
                     <div className="flex-1">
                       <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">% Dari Total Pendaftar</p>
                       <div className="flex items-end justify-between">
                         <p className="text-2xl font-black text-[#1A1A1B]">{totalPendaftar > 0 ? Math.round((groupedWawancaraArr.length / daftarPeserta.length) * 100) || 0 : 0}%</p>
                         <span className="text-[10px] font-bold text-slate-400">{groupedWawancaraArr.length} / {daftarPeserta.length}</span>
                       </div>
                     </div>
                   </div>
                </div>

                <div className="bg-white rounded-[24px] overflow-hidden border border-slate-200 shadow-sm flex flex-col">
                  <div className="px-6 py-5 border-b border-slate-100 flex flex-col lg:flex-row justify-between items-center gap-4 bg-white">
                    <div className="flex items-center gap-3">
                      <h3 className="font-black text-base text-slate-800 uppercase tracking-tight">Rekap Hasil Esai</h3>
                    </div>
                    <div className="flex flex-wrap gap-3 w-full lg:w-auto items-center">
                      <div className="relative flex-1 sm:w-56"><Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14}/><input type="text" placeholder="Cari nama atau email..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:border-black outline-none font-semibold transition-colors"/></div>
                      
                      <select value={filterEsaiView} onChange={e => {setFilterEsaiView(e.target.value); setCurrentPage(1);}} className="text-xs font-bold border border-slate-200 rounded-xl px-3 py-2.5 bg-slate-50 outline-none focus:border-black cursor-pointer text-slate-600">
                         <option value="sudah">Tampilkan: Sudah Esai</option>
                         <option value="belum">Tampilkan: Belum Esai (Sudah PG)</option>
                      </select>
                    </div>
                  </div>

                  <div className="overflow-x-auto custom-scrollbar">
                    <table className="w-full text-left border-collapse whitespace-nowrap min-w-max">
                      <thead className="bg-slate-50 text-[10px] uppercase font-black tracking-widest text-slate-500 sticky top-0 z-10 border-b-2 border-slate-800">
                        {filterEsaiView === 'sudah' ? (
                          <tr>
                            <th className="px-6 py-4 w-10 text-center">No</th>
                            <th className="px-6 py-4 cursor-pointer hover:bg-slate-100 select-none" onClick={() => requestSort('waktu_selesai')}>Selesai <SortIcon columnKey="waktu_selesai"/></th>
                            <th className="px-6 py-4 cursor-pointer hover:bg-slate-100 select-none" onClick={() => requestSort('email')}>Peserta <SortIcon columnKey="email"/></th>
                            <th className="px-6 py-4 text-right">Opsi</th>
                          </tr>
                        ) : (
                          <tr>
                            <th className="px-6 py-4 w-10 text-center">No</th>
                            <th className="px-6 py-4 cursor-pointer hover:bg-slate-100 select-none" onClick={() => requestSort('nama_peserta')}>Peserta (Belum Esai) <SortIcon columnKey="nama_peserta"/></th>
                            <th className="px-6 py-4 cursor-pointer hover:bg-slate-100 select-none" onClick={() => requestSort('kecamatan')}>Kecamatan <SortIcon columnKey="kecamatan"/></th>
                            <th className="px-6 py-4 cursor-pointer hover:bg-slate-100 select-none" onClick={() => requestSort('desa')}>Desa <SortIcon columnKey="desa"/></th>
                            <th className="px-6 py-4 text-center">Opsi</th>
                          </tr>
                        )}
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {filterEsaiView === 'sudah' ? (
                           currentHasilWawancara.map((row, idx) => {
                             const actualIdx = (currentPage - 1) * itemsPerPage + idx + 1;
                             return (
                               <tr key={idx} className="hover:bg-slate-50 transition-colors group">
                                 <td className="px-6 py-3 text-center font-bold text-slate-300 text-xs">{actualIdx}</td>
                                 <td className="px-6 py-3 text-[11px] text-slate-500 font-mono">{row.waktu_selesai}</td>
                                 <td className="px-6 py-3">
                                   <p className="font-bold text-[13px] text-slate-800 mb-0.5">{row.nama_peserta}</p>
                                   <p className="text-[10px] text-slate-400 font-mono">{row.email}</p>
                                 </td>
                                 <td className="px-6 py-3 text-right">
                                    <div className="flex justify-end gap-1.5 opacity-50 group-hover:opacity-100 transition-opacity">
                                       <button onClick={() => setViewWawancaraModal({ isOpen: true, data: row })} className="bg-white border border-slate-200 text-slate-500 hover:text-black hover:border-black px-3 py-1.5 rounded-lg text-[10px] font-black flex items-center gap-1.5 transition-colors uppercase tracking-widest shadow-sm"><FileText size={14}/> Lihat Esai</button>
                                       <button onClick={() => exportWawancaraToPDF(row)} className="bg-emerald-500 hover:bg-emerald-600 text-white px-3 py-1.5 rounded-lg text-[10px] font-black flex items-center gap-1.5 transition-colors uppercase tracking-widest shadow-md"><Printer size={14}/> PDF</button>
                                       <button onClick={() => requestDeleteWawancara(row.email)} className="bg-red-50 text-red-600 hover:bg-red-500 hover:text-white px-3 py-1.5 rounded-lg text-[10px] font-black flex items-center gap-1.5 transition-colors uppercase tracking-widest shadow-sm"><Trash2 size={14}/> Hapus</button>
                                    </div>
                                 </td>
                               </tr>
                             )
                           })
                        ) : (
                           currentBelumWawancara.map((row, idx) => {
                             const actualIdx = (currentPage - 1) * itemsPerPage + idx + 1;
                             return (
                               <tr key={idx} className="hover:bg-slate-50 transition-colors">
                                 <td className="px-6 py-3 text-center font-bold text-slate-300 text-xs">{actualIdx}</td>
                                 <td className="px-6 py-3">
                                   <p className="font-bold text-[13px] text-slate-800 mb-0.5">{row.nama_peserta}</p>
                                   <p className="text-[10px] text-slate-400 font-mono">{row.email}</p>
                                 </td>
                                 <td className="px-6 py-3 text-xs font-semibold text-slate-600">{row.kecamatan}</td>
                                 <td className="px-6 py-3 text-xs font-semibold text-slate-600">{row.desa}</td>
                                 <td className="px-6 py-3 text-center">
                                    <span className="px-3 py-1 border border-orange-200 bg-orange-50 text-orange-600 rounded-md text-[9px] font-black uppercase tracking-widest">Belum Mengisi</span>
                                 </td>
                               </tr>
                             )
                           })
                        )}
                        
                        {filterEsaiView === 'sudah' && currentHasilWawancara.length === 0 && <tr><td colSpan="4" className="p-10 text-center text-slate-400 font-medium text-sm">Belum ada data esai yang ditarik dari server.</td></tr>}
                        {filterEsaiView === 'belum' && currentBelumWawancara.length === 0 && <tr><td colSpan="5" className="p-10 text-center text-slate-400 font-medium text-sm">Luar biasa! Semua peserta lulusan PG sudah mengisi esai.</td></tr>}
                      </tbody>
                    </table>
                  </div>
                  {activeWawancaraTotalPages > 0 && (
                     <PaginationFooter currentPage={currentPage} totalPages={activeWawancaraTotalPages} setCurrentPage={setCurrentPage} itemsPerPage={itemsPerPage} setItemsPerPage={setItemsPerPage} />
                  )}
                </div>
              </div>
            )}

            {/* TAB CONTENT: BANK SOAL PG */}
            {activeTab === 'soal' && (
              <div className="bg-white rounded-[24px] border border-slate-200 shadow-sm flex flex-col h-[75vh] animate-fade-up">
                <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-white shrink-0">
                  <h3 className="font-black text-base text-[#1A1A1B] uppercase tracking-tight flex items-center gap-2"><Database className="text-[#facc15]"/> Soal Ujian ({quizData.length})</h3>
                </div>
                <div className="flex-1 overflow-y-auto p-6 custom-scrollbar bg-slate-50/50 flex flex-col">
                  <div className="grid gap-4 flex-1 content-start">
                    {currentSoal.map((s, i) => {
                      const actualIdx = (currentPage - 1) * itemsPerPage + i + 1;
                      return (
                      <div key={i} className="p-6 bg-white border border-slate-200 rounded-2xl shadow-sm hover:border-black transition-colors">
                         <div className="flex gap-4">
                           <div className="mt-0.5 text-sm font-black text-slate-300 w-6 text-right shrink-0">{actualIdx}.</div>
                           <div className="flex-1">
                             <p className="font-bold text-slate-800 text-sm mb-4 leading-relaxed">{s.soal}</p>
                             <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-600 font-medium">
                               <p className="bg-slate-50 p-2 rounded-lg border border-slate-100"><span className="font-black text-slate-400 mr-2">A.</span>{s.a}</p>
                               <p className="bg-slate-50 p-2 rounded-lg border border-slate-100"><span className="font-black text-slate-400 mr-2">B.</span>{s.b}</p>
                               <p className="bg-slate-50 p-2 rounded-lg border border-slate-100"><span className="font-black text-slate-400 mr-2">C.</span>{s.c}</p>
                               <p className="bg-slate-50 p-2 rounded-lg border border-slate-100"><span className="font-bold text-slate-400 mr-2">D.</span>{s.d}</p>
                               <p className="bg-slate-50 p-2 rounded-lg border border-slate-100"><span className="font-black text-slate-400 mr-2">E.</span>{s.e}</p>
                             </div>
                             <div className="mt-5 pt-4 border-t border-slate-100 flex items-center gap-2">
                               <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Kunci Jawaban:</span>
                               <span className="bg-[#1A1A1B] text-[#facc15] font-black px-3 py-1 rounded-md text-[10px]">{String(s.jawaban).toUpperCase()}</span>
                             </div>
                           </div>
                         </div>
                      </div>
                      )
                    })}
                    {currentSoal.length === 0 && <p className="text-center py-20 text-slate-400 font-bold text-sm">Belum ada soal PG yang disinkronisasi.</p>}
                  </div>
                </div>
                {totalPagesSoal > 0 && (
                   <PaginationFooter currentPage={currentPage} totalPages={totalPagesSoal} setCurrentPage={setCurrentPage} itemsPerPage={itemsPerPage} setItemsPerPage={setItemsPerPage} />
                )}
              </div>
            )}

            {/* TAB CONTENT: SOAL WAWANCARA */}
            {activeTab === 'soal_wawancara' && (
              <div className="bg-white rounded-[24px] border border-slate-200 shadow-sm flex flex-col h-[75vh] animate-fade-up">
                <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-white shrink-0">
                  <h3 className="font-black text-base text-[#1A1A1B] uppercase tracking-tight flex items-center gap-2"><MessageCircle className="text-[#facc15]"/> Daftar Pertanyaan Wawancara ({soalWawancara.length})</h3>
                </div>
                <div className="flex-1 overflow-y-auto p-6 custom-scrollbar bg-slate-50/50 flex flex-col">
                  <div className="grid gap-4 flex-1 content-start">
                    {currentSoalWawancara.map((s, i) => {
                      const actualIdx = (currentPage - 1) * itemsPerPage + i + 1;
                      return (
                      <div key={i} className="p-6 bg-white border border-slate-200 rounded-2xl shadow-sm hover:border-black transition-colors">
                         <div className="flex gap-4">
                           <div className="mt-0.5 text-sm font-black text-slate-300 w-6 text-right shrink-0">{actualIdx}.</div>
                           <div className="flex-1">
                             <p className="font-bold text-slate-800 text-sm leading-relaxed">{s.pertanyaan || s}</p>
                           </div>
                         </div>
                      </div>
                      )
                    })}
                    {currentSoalWawancara.length === 0 && <p className="text-center py-20 text-slate-400 font-bold text-sm">Belum ada soal wawancara yang disinkronisasi.</p>}
                  </div>
                </div>
                {totalPagesSoalWawancara > 0 && (
                   <PaginationFooter currentPage={currentPage} totalPages={totalPagesSoalWawancara} setCurrentPage={setCurrentPage} itemsPerPage={itemsPerPage} setItemsPerPage={setItemsPerPage} />
                )}
              </div>
            )}

            {/* TAB CONTENT: SESI AKTIF */}
            {activeTab === 'sesi' && (
              <div className="bg-white rounded-[24px] border border-slate-200 shadow-sm flex flex-col h-[75vh] animate-fade-up">
                <div className="p-6 border-b border-slate-100 bg-white flex justify-between items-center">
                  <div>
                    <h3 className="font-black text-base text-[#1A1A1B] uppercase tracking-tight">Sesi Aktif Ujian</h3>
                    <p className="text-[10px] text-slate-500 font-medium mt-1 tracking-wide">Pantau peserta yang sedang mengerjakan soal. (Otomatis Reset &gt; 24 Jam)</p>
                  </div>
                </div>
                <div className="flex-1 overflow-y-auto custom-scrollbar flex flex-col">
                  {activeSessions.length === 0 ? (
                    <div className="text-center py-32 text-slate-300"><Activity size={48} className="mx-auto opacity-20 mb-4"/><p className="text-xs font-bold uppercase tracking-widest">Tidak ada sesi aktif saat ini</p></div>
                  ) : (
                    <>
                    <table className="w-full text-left border-collapse min-w-max flex-1">
                       <thead className="bg-slate-50 text-[10px] uppercase font-black tracking-widest text-slate-500 border-b-2 border-slate-800 sticky top-0">
                         <tr>
                           <th className="px-6 py-4 w-12 text-center">No</th>
                           <th className="px-6 py-4 cursor-pointer hover:bg-slate-100 select-none" onClick={() => requestSort('email')}>Akun Email <SortIcon columnKey="email"/></th>
                           <th className="px-6 py-4 cursor-pointer hover:bg-slate-100 select-none" onClick={() => requestSort('waktu_mulai')}>Waktu Mulai <SortIcon columnKey="waktu_mulai"/></th>
                           <th className="px-6 py-4">Status</th>
                           <th className="px-6 py-4 text-right">Opsi</th>
                         </tr>
                       </thead>
                       <tbody className="divide-y divide-slate-100 h-full">
                         {currentSesi.map((s, i) => {
                           const actualIdx = (currentPage - 1) * itemsPerPage + i + 1;
                           return (
                             <tr key={i} className="hover:bg-slate-50 transition-colors">
                               <td className="px-6 py-3 text-center text-slate-400 font-bold text-xs">{actualIdx}</td>
                               <td className="px-6 py-3 font-bold text-slate-800 text-[13px]">{s.email}</td>
                               <td className="px-6 py-3 text-xs font-mono text-slate-500">{s.waktu_mulai}</td>
                               <td className="px-6 py-3">
                                 <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-white border border-blue-200 text-[9px] font-black uppercase tracking-widest text-blue-600 animate-pulse shadow-sm">
                                   <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div> Online
                                 </span>
                               </td>
                               <td className="px-6 py-3 text-right">
                                 <button onClick={() => requestResetSesi(s.email)} className="bg-red-50 text-red-600 hover:bg-red-500 hover:text-white px-3 py-1.5 rounded-lg text-[10px] font-black flex items-center justify-end gap-1.5 ml-auto transition-colors uppercase tracking-widest shadow-sm active:scale-95">
                                   <XCircle size={12}/> Reset Sesi
                                 </button>
                               </td>
                             </tr>
                           )
                         })}
                       </tbody>
                    </table>
                    {totalPagesSesi > 0 && (
                      <PaginationFooter currentPage={currentPage} totalPages={totalPagesSesi} setCurrentPage={setCurrentPage} itemsPerPage={itemsPerPage} setItemsPerPage={setItemsPerPage} />
                    )}
                    </>
                  )}
                </div>
              </div>
            )}

            {/* TAB CONTENT: REMEDIAL */}
            {activeTab === 'remedial' && (
              <div className="bg-white rounded-[24px] border border-slate-200 shadow-sm flex flex-col h-[75vh] animate-fade-up">
                <div className="p-6 border-b border-slate-100 bg-white">
                  <h3 className="font-black text-base text-[#1A1A1B] uppercase tracking-tight">Manajemen Remedial PG</h3>
                  <p className="text-xs text-slate-500 font-medium mt-2 max-w-md leading-relaxed">Hapus nilai lama untuk membuka gerbang ujian ulang bagi peserta dengan status <span className="font-bold text-red-500">Tidak Lulus</span>.</p>
                </div>
                <div className="overflow-x-auto flex-1 custom-scrollbar flex flex-col">
                   <table className="w-full text-left border-collapse min-w-max flex-1">
                      <thead className="bg-slate-50 text-[10px] uppercase font-black tracking-widest text-slate-500 border-b-2 border-slate-800 sticky top-0">
                        <tr>
                          <th className="px-6 py-4 w-12 text-center">No</th>
                          <th className="px-6 py-4 cursor-pointer hover:bg-slate-100 select-none" onClick={() => requestSort('akun')}>Peserta <SortIcon columnKey="akun"/></th>
                          <th className="px-6 py-4 text-center cursor-pointer hover:bg-slate-100 select-none" onClick={() => requestSort('skor')}>Skor Lama <SortIcon columnKey="skor"/></th>
                          <th className="px-6 py-4 text-right">Opsi</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-sm">
                        {currentRemedial.map((r, i) => {
                          const actualIdx = (currentPage - 1) * itemsPerPage + i + 1;
                          return (
                            <tr key={i} className="hover:bg-slate-50 transition-colors">
                               <td className="px-6 py-4 text-center font-bold text-slate-400 text-xs">{actualIdx}</td>
                               <td className="px-6 py-4 font-bold text-slate-800 text-[13px]">{r.akun}</td>
                               <td className="px-6 py-4 text-center font-black text-red-600 text-lg">{r.skor}</td>
                               <td className="px-6 py-4 text-right">
                                 <button onClick={() => requestBukaAksesRemedial(r.akun)} className="bg-blue-500 hover:bg-blue-600 text-white px-5 py-2.5 rounded-xl font-black text-[10px] transition-all uppercase tracking-widest shadow-md active:scale-95">
                                   Buka Akses
                                 </button>
                               </td>
                            </tr>
                          )
                        })}
                        {currentRemedial.length === 0 && <tr><td colSpan="4" className="p-16 text-center text-slate-400 text-sm font-medium">Tidak ada peserta berstatus Tidak Lulus saat ini.</td></tr>}
                      </tbody>
                   </table>
                   {totalPagesRemedial > 0 && (
                      <PaginationFooter currentPage={currentPage} totalPages={totalPagesRemedial} setCurrentPage={setCurrentPage} itemsPerPage={itemsPerPage} setItemsPerPage={setItemsPerPage} />
                   )}
                </div>
              </div>
            )}

            {/* TAB CONTENT: PENGATURAN / AKUN */}
            {activeTab === 'pengaturan' && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-fade-up">
                <div className="bg-white p-6 md:p-8 rounded-[24px] border border-slate-200 shadow-sm">
                  <div className="flex items-center gap-3 mb-6 border-b border-slate-100 pb-4">
                    <CalendarClock className="text-[#1A1A1B] w-6 h-6"/>
                    <h3 className="font-black text-lg text-[#1A1A1B] uppercase tracking-tight">Waktu & Durasi Ujian</h3>
                  </div>
                  <form onSubmit={requestSaveJadwal} className="space-y-5">
                     <div>
                       <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Waktu Dibuka (WIB)</label>
                       <input type="datetime-local" value={jadwalForm.mulai} onChange={e => setJadwalForm({...jadwalForm, mulai: e.target.value})} className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-black font-semibold text-sm transition-colors" />
                     </div>
                     <div>
                       <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Waktu Ditutup (WIB)</label>
                       <input type="datetime-local" value={jadwalForm.selesai} onChange={e => setJadwalForm({...jadwalForm, selesai: e.target.value})} className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-black font-semibold text-sm transition-colors" />
                     </div>
                     <div>
                       <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Durasi Pengerjaan (Menit)</label>
                       <input type="number" required min="5" value={jadwalForm.durasi} onChange={e => setJadwalForm({...jadwalForm, durasi: e.target.value})} className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-black font-semibold text-sm transition-colors" />
                     </div>
                     <button type="submit" className="w-full bg-[#1A1A1B] hover:bg-black text-[#facc15] font-black py-4 rounded-xl shadow-lg active:scale-95 transition-all uppercase tracking-widest text-xs mt-2">Simpan Aturan Waktu</button>
                  </form>
                </div>
                
                <div className="bg-white p-6 md:p-8 rounded-[24px] border border-slate-200 shadow-sm">
                  <div className="flex items-center gap-3 mb-6 border-b border-slate-100 pb-4">
                    <Shield className="text-[#1A1A1B] w-6 h-6"/>
                    <h3 className="font-black text-lg text-[#1A1A1B] uppercase tracking-tight">Ubah Data Kredensial</h3>
                  </div>
                  <form onSubmit={requestSaveAdmin} className="space-y-5">
                     <div>
                       <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Email Root Dashboard</label>
                       <input type="email" required value={adminSettingForm.email} onChange={e => setAdminSettingForm({...adminSettingForm, email: e.target.value})} className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-black font-semibold text-sm transition-colors" />
                     </div>
                     <div>
                       <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">New Secure Password</label>
                       <input type="text" required value={adminSettingForm.password} onChange={e => setAdminSettingForm({...adminSettingForm, password: e.target.value})} className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-black font-semibold text-sm transition-colors" />
                     </div>
                     <button type="submit" className="w-full bg-[#1A1A1B] hover:bg-black text-[#facc15] font-black py-4 rounded-xl shadow-lg active:scale-95 transition-all uppercase tracking-widest text-xs mt-2">Perbarui Akses Keamanan</button>
                  </form>
                </div>
              </div>
            )}

          </div>
        </div>
      </main>
    </div>
  );
}