// --- admin.jsx ---
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, LogOut, Users, CheckCircle2, XCircle, Clock, Activity,
  UserPlus, FileSpreadsheet, Trash2, Download, Search, CalendarClock, Shield, Save, Filter, ChevronLeft, ChevronRight,
  Database, RefreshCw, Edit3, X, Lock, Settings, DownloadCloud, AlertTriangle, Menu, ListFilter, FileText, Check, Info, Loader2, BarChart3,
  UserCheck, MessageCircle, ClipboardList, MapPin, TrendingUp, Printer
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

// --- KOMPONEN BAR CHART KECAMATAN (HIDUP & INTERAKTIF) ---
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
        {/* Progress Mengerjakan (HITAM) */}
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

        {/* Progress Lulus (KUNING) */}
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
  
  // --- STATE DATA WAWANCARA ---
  const [daftarPetugas, setDaftarPetugas] = useState([]);
  const [soalWawancara, setSoalWawancara] = useState([]);
  const [hasilWawancara, setHasilWawancara] = useState([]);
  
  // --- STATE FORM ---
  const [newPetugas, setNewPetugas] = useState({ nama_petugas: '', email_petugas: '' });
  const [adminSettingForm, setAdminSettingForm] = useState({ email: '', password: '' });
  const [jadwalForm, setJadwalForm] = useState({ mulai: '', selesai: '', durasi: 45 });
  const [newPeserta, setNewPeserta] = useState({ email: '', password: '', nama: '', desa: '', kecamatan: 'Pacitan' });
  
  // --- STATE UI & FILTER ---
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('ALL'); 
  const [filterKecamatan, setFilterKecamatan] = useState('ALL');
  const [filterDesa, setFilterDesa] = useState('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(15); 

  // --- STATE DASHBOARD KHUSUS ---
  const [dashFilter, setDashFilter] = useState('');
  const [dashSort, setDashSort] = useState('nama_asc');

  // --- MODALS ---
  const [editModal, setEditModal] = useState({ isOpen: false, oldEmail: '', data: { email: '', password: '', nama: '', desa: '', kecamatan: '' } });
  const [viewDetailModal, setViewDetailModal] = useState({ isOpen: false, email: '', nama: '', skor: 0, keterangan: '', data: [] });
  const [alertModal, setAlertModal] = useState({ isOpen: false, title: '', message: '' });
  const [confirmModal, setConfirmModal] = useState({ isOpen: false, title: '', message: '', action: null });

  const showAlert = (title, message) => setAlertModal({ isOpen: true, title, message });
  const showConfirm = (title, message, action) => setConfirmModal({ isOpen: true, title, message, action });

  useEffect(() => {
    if (!sessionStorage.getItem('adminAuth_SE2026')) { navigate('/admin'); return; }
    fetchData();
    if (window.innerWidth >= 768) setIsSidebarOpen(true);
  }, [navigate]);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`${GOOGLE_SCRIPT_WEB_APP_URL}?action=init&cb=${new Date().getTime()}`);
      const data = await res.json();
      if (data.status === "success") {
        setAdminData(data.nilai || []);
        setDaftarPeserta(data.akun || []);
        setQuizData(data.soal || []);
        setActiveSessions(data.sesi_aktif || []);
        setDetailAnswers(data.detail_jawaban || []);
        setDaftarPetugas(data.petugas || []);
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

  // --- STATISTIK ---
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

  // --- LOGIKA PROGRESS KECAMATAN (HIDUP / REAL DATA) ---
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

  if (dashFilter) {
    kecamatanStats = kecamatanStats.filter(item => item.kec.toLowerCase().includes(dashFilter.toLowerCase()));
  }

  kecamatanStats.sort((a, b) => {
    if (dashSort === 'nama_asc') return a.kec.localeCompare(b.kec);
    if (dashSort === 'nama_desc') return b.kec.localeCompare(a.kec);
    if (dashSort === 'prog_desc') return b.pctMengerjakan - a.pctMengerjakan;
    if (dashSort === 'prog_asc') return a.pctMengerjakan - b.pctMengerjakan;
    if (dashSort === 'lulus_desc') return b.pctLulus - a.pctLulus;
    if (dashSort === 'lulus_asc') return a.pctLulus - b.pctLulus;
    return 0;
  });

  // --- FILTERING & PAGINATION CALCULATIONS ---
  const filteredPeserta = daftarPeserta.filter(p => `${p.nama} ${p.email} ${p.desa} ${p.kecamatan || ''}`.toLowerCase().includes(searchTerm.toLowerCase()));
  const currentPeserta = filteredPeserta.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  const totalPagesPeserta = Math.ceil(filteredPeserta.length / itemsPerPage);

  const currentPetugas = daftarPetugas.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  const totalPagesPetugas = Math.ceil(daftarPetugas.length / itemsPerPage);

  const filteredHasil = adminData.filter(item => {
    const p = getPesertaInfo(item.akun);
    const s = `${item.akun} ${p.nama} ${p.desa} ${p.kecamatan || ''}`.toLowerCase();
    const matchSearch = s.includes(searchTerm.toLowerCase());
    const matchStatus = filterStatus === 'ALL' || item.keterangan === filterStatus;
    const matchKecamatan = filterKecamatan === 'ALL' || (p.kecamatan && p.kecamatan.toUpperCase() === filterKecamatan.toUpperCase());
    const matchDesa = filterDesa === 'ALL' || (p.desa && p.desa.toUpperCase() === filterDesa.toUpperCase());
    return matchSearch && matchStatus && matchKecamatan && matchDesa;
  });
  const currentDataHasil = filteredHasil.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  const totalPagesHasil = Math.ceil(filteredHasil.length / itemsPerPage);

  const filteredHasilWawancara = hasilWawancara.filter(item => {
    const s = `${item.nama_peserta} ${item.nama_petugas} ${item.keterangan}`.toLowerCase();
    return s.includes(searchTerm.toLowerCase());
  });
  const currentHasilWawancara = filteredHasilWawancara.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  const totalPagesWawancara = Math.ceil(filteredHasilWawancara.length / itemsPerPage);

  const currentSesi = activeSessions.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  const totalPagesSesi = Math.ceil(activeSessions.length / itemsPerPage);

  const currentRemedial = daftarRemedial.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  const totalPagesRemedial = Math.ceil(daftarRemedial.length / itemsPerPage);

  // --- LOGIKA EXPORT ---
  const exportHasilToCSV = () => {
    const headers = ["No", "Selesai", "Nama", "Email", "Kecamatan", "Desa", "Benar", "Skor", "Durasi", "Status"];
    let csv = headers.join(",") + "\n";
    filteredHasil.forEach((r, i) => {
      const p = getPesertaInfo(r.akun);
      const dur = hitungDurasi(r.waktu_mulai, r.waktu_selesai);
      csv += `${i+1},"${r.waktu_selesai}","${p.nama}","${r.akun}","${p.kecamatan || '-'}","${p.desa}",${getJumlahBenar(r.skor)},${r.skor},"${dur}","${r.keterangan}"\n`;
    });
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `Hasil_CAT_SE2026_${new Date().toLocaleDateString('id-ID')}.csv`;
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
    
    filteredHasil.forEach((r, i) => {
       const p = getPesertaInfo(r.akun);
       html += `
         <tr>
           <td class="text-center">${i+1}</td>
           <td>${r.waktu_selesai}</td>
           <td><strong>${p.nama}</strong></td>
           <td>${r.akun}</td>
           <td>${p.kecamatan || '-'}</td>
           <td>${p.desa}</td>
           <td class="text-center">${hitungDurasi(r.waktu_mulai, r.waktu_selesai)}</td>
           <td class="text-center">${getJumlahBenar(r.skor)}</td>
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

  const handleAddPetugas = (e) => {
    e.preventDefault();
    if (!newPetugas.email_petugas) return;
    setDaftarPetugas([{ ...newPetugas }, ...daftarPetugas]);
    showAlert('Sukses', 'Petugas baru ditambahkan ke tabel UI. Sinkronisasi backend otomatis dilakukan.');
    setNewPetugas({ nama_petugas: '', email_petugas: '' });
  };

  const requestDeletePetugas = (email) => {
    showConfirm('Hapus Petugas', 'Hapus akses petugas ini selamanya?', () => {
      setDaftarPetugas(prev => prev.filter(p => p.email_petugas !== email));
      showAlert('Berhasil', 'Data petugas telah dihapus dari tabel.');
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

  // --- LOGIKA HASIL & DETAIL ---
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

  useEffect(() => { setCurrentPage(1); }, [searchTerm, filterStatus, filterKecamatan, filterDesa, activeTab]);

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

      {/* --- MODAL DETAIL JAWABAN --- */}
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
            
            <div className="sm:hidden px-6 pt-4 pb-3 bg-slate-50 flex justify-between items-center border-b border-slate-200">
               <span className="text-xs font-black text-slate-500 uppercase tracking-widest">Skor Akhir:</span>
               <div className="flex items-center gap-3">
                 <span className="text-lg font-black">{viewDetailModal.skor}</span>
                 <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded border ${viewDetailModal.keterangan === 'LULUS' ? 'bg-emerald-50 text-emerald-600 border-emerald-200' : 'bg-red-50 text-red-600 border-red-200'}`}>
                   {viewDetailModal.keterangan}
                 </span>
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
          {/* Tombol Hamburger Desain Lama */}
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
              { id: 'peserta', icon: <Users size={18}/>, label: 'Data Peserta' },
              { id: 'petugas', icon: <UserCheck size={18}/>, label: 'Data Petugas' },
              { id: 'soal', icon: <Database size={18}/>, label: 'Soal Ujian' },
              { id: 'soal_wawancara', icon: <MessageCircle size={18}/>, label: 'Soal Wawancara' },
              { id: 'hasil', icon: <FileSpreadsheet size={18}/>, label: 'Hasil Ujian' },
              { id: 'hasil_wawancara', icon: <ClipboardList size={18}/>, label: 'Hasil Wawancara' },
              { id: 'sesi', icon: <Activity size={18}/>, label: 'Sesi Aktif' },
              { id: 'remedial', icon: <RefreshCw size={18}/>, label: 'Remedial' },
              { id: 'pengaturan', icon: <Settings size={18}/>, label: 'Akun' }
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
                           <th className="px-6 py-4">Peserta</th>
                           <th className="px-6 py-4">Kecamatan</th>
                           <th className="px-6 py-4">Desa</th>
                           <th className="px-6 py-4">Kata Sandi</th>
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

            {/* TAB CONTENT: DATA PETUGAS WAWANCARA */}
            {activeTab === 'petugas' && (
              <div className="space-y-6 animate-fade-up">
                <div className="bg-white p-6 md:p-8 rounded-[24px] shadow-sm border border-slate-200">
                   <h3 className="font-black text-base text-[#1A1A1B] mb-5 uppercase tracking-tight flex items-center gap-2"><UserCheck size={20} className="text-[#facc15]"/> Tambah Petugas Wawancara</h3>
                   <form onSubmit={handleAddPetugas} className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                     <input required type="text" placeholder="Nama Lengkap Petugas" value={newPetugas.nama_petugas} onChange={e => setNewPetugas({...newPetugas, nama_petugas: e.target.value})} className="px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-black text-sm font-semibold transition-colors" />
                     <input required type="email" placeholder="Email Akses Petugas" value={newPetugas.email_petugas} onChange={e => setNewPetugas({...newPetugas, email_petugas: e.target.value})} className="px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-black text-sm font-semibold transition-colors" />
                     <button type="submit" className="bg-[#1A1A1B] hover:bg-black text-[#facc15] font-black py-3.5 rounded-xl transition-all text-xs uppercase tracking-widest flex items-center justify-center gap-2 shadow-md active:scale-95"><UserPlus size={16}/> Daftarkan</button>
                   </form>
                </div>
                <div className="flex items-center gap-3">
                  <h3 className="font-black text-slate-800 text-base uppercase tracking-tight">Database Petugas ({daftarPetugas.length})</h3>
                  
                  {/* TOMBOL MENUJU PORTAL WAWANCARA */}
                  <button onClick={() => window.open('/wawancara', '_blank')} className="bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white border border-blue-200 px-3 py-1.5 rounded-lg text-[10px] font-black flex items-center gap-1.5 transition-all uppercase tracking-widest shadow-sm">
                    Portal Wawancara <ChevronRight size={12}/>
                  </button>
                </div>

                <div className="bg-white rounded-[24px] shadow-sm border border-slate-200 overflow-hidden flex flex-col">
                   <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center bg-white">
                      <h3 className="font-black text-slate-800 text-base uppercase tracking-tight">Database Petugas ({daftarPetugas.length})</h3>
                   </div>
                   <div className="overflow-x-auto custom-scrollbar">
                     <table className="w-full text-left border-collapse whitespace-nowrap min-w-max">
                       <thead className="bg-slate-50 text-[10px] uppercase font-black tracking-widest text-slate-500 border-b-2 border-slate-800 sticky top-0 z-10">
                         <tr>
                           <th className="px-6 py-4 w-12 text-center">No</th>
                           <th className="px-6 py-4">Nama Petugas</th>
                           <th className="px-6 py-4">Email Akses</th>
                           <th className="px-6 py-4 text-right">Opsi</th>
                         </tr>
                       </thead>
                       <tbody className="divide-y divide-slate-100">
                         {currentPetugas.map((p, i) => {
                           const actualIdx = (currentPage - 1) * itemsPerPage + i + 1;
                           return (
                             <tr key={i} className="hover:bg-slate-50/80 transition-colors">
                               <td className="px-6 py-3 text-center font-bold text-slate-400 text-xs">{actualIdx}</td>
                               <td className="px-6 py-3 font-bold text-slate-800 text-[13px]">{p.nama_petugas || '-'}</td>
                               <td className="px-6 py-3 text-[11px] font-mono text-slate-500">{p.email_petugas}</td>
                               <td className="px-6 py-3 text-right">
                                 <button onClick={() => requestDeletePetugas(p.email_petugas)} className="p-2 text-slate-400 hover:text-white rounded-lg border border-transparent hover:bg-red-500 hover:border-red-600 transition-all"><Trash2 size={16}/></button>
                               </td>
                             </tr>
                           )
                         })}
                         {currentPetugas.length === 0 && <tr><td colSpan="4" className="p-10 text-center text-slate-400 font-medium text-sm">Belum ada data petugas yang terdaftar.</td></tr>}
                       </tbody>
                     </table>
                   </div>
                   {totalPagesPetugas > 0 && (
                     <PaginationFooter currentPage={currentPage} totalPages={totalPagesPetugas} setCurrentPage={setCurrentPage} itemsPerPage={itemsPerPage} setItemsPerPage={setItemsPerPage} />
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
                          <th className="px-6 py-4">Selesai</th>
                          <th className="px-6 py-4">Identitas Peserta</th>
                          <th className="px-6 py-4">Kecamatan</th>
                          <th className="px-6 py-4">Desa</th>
                          <th className="px-6 py-4 text-center">Durasi</th>
                          <th className="px-6 py-4 text-center">B</th>
                          <th className="px-6 py-4 text-center">Skor</th>
                          <th className="px-6 py-4">Status</th>
                          <th className="px-6 py-4 text-right">Opsi</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {currentDataHasil.map((row, idx) => {
                          const pInfo = getPesertaInfo(row.akun);
                          const actualIdx = (currentPage - 1) * itemsPerPage + idx + 1;
                          const durasi = hitungDurasi(row.waktu_mulai, row.waktu_selesai);
                          return (
                            <tr key={idx} className="hover:bg-slate-50 transition-colors group">
                              <td className="px-6 py-3 text-center font-bold text-slate-300 text-xs">{actualIdx}</td>
                              <td className="px-6 py-3 text-[11px] text-slate-500 font-mono">{row.waktu_selesai}</td>
                              <td className="px-6 py-3">
                                <p className="font-bold text-[13px] text-slate-800 mb-0.5">{pInfo.nama}</p>
                                <p className="text-[10px] text-slate-400 font-mono">{row.akun}</p>
                              </td>
                              <td className="px-6 py-3 text-xs font-semibold text-slate-600">{pInfo.kecamatan || '-'}</td>
                              <td className="px-6 py-3 text-xs font-semibold text-slate-600">{pInfo.desa || '-'}</td>
                              <td className="px-6 py-3 text-center"><span className="px-2.5 py-1 border border-slate-200 bg-white rounded-md text-[10px] font-mono text-slate-600">{durasi}</span></td>
                              <td className="px-6 py-3 text-xs font-bold text-slate-600 text-center">{getJumlahBenar(row.skor)}</td>
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
                                    <button onClick={() => openDetailJawaban(row.akun, pInfo.nama, row.skor, row.keterangan)} className="p-2 text-slate-500 hover:text-black bg-white border border-slate-200 rounded-lg hover:border-black transition-colors" title="Lihat Detail"><FileText size={16}/></button>
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

            {/* TAB CONTENT: HASIL WAWANCARA */}
            {activeTab === 'hasil_wawancara' && (
              <div className="space-y-6 animate-fade-up">
                
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                   <div className="bg-white p-5 rounded-[20px] shadow-sm border border-slate-200 hover:border-black transition-colors group flex items-center gap-4">
                     <div className="w-12 h-12 bg-slate-100 text-slate-500 rounded-xl flex items-center justify-center group-hover:bg-[#1A1A1B] group-hover:text-white transition-colors"><ClipboardList size={20}/></div>
                     <div><p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Total Wawancara</p><p className="text-2xl font-black text-[#1A1A1B]">{hasilWawancara.length}</p></div>
                   </div>
                </div>

                <div className="bg-white rounded-[24px] overflow-hidden border border-slate-200 shadow-sm flex flex-col">
                  <div className="px-6 py-5 border-b border-slate-100 flex flex-col lg:flex-row justify-between items-center gap-4 bg-white">
                    <div className="flex items-center gap-3">
                      <h3 className="font-black text-base text-slate-800 uppercase tracking-tight">Rekap Wawancara</h3>
                    </div>
                    <div className="flex flex-wrap gap-2 w-full lg:w-auto">
                      <div className="relative flex-1 sm:w-64"><Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14}/><input type="text" placeholder="Cari nama peserta/petugas..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:border-black outline-none font-semibold transition-colors"/></div>
                      <button className="bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2.5 rounded-xl text-xs font-black flex items-center gap-2 transition-colors uppercase tracking-widest shadow-md active:scale-95"><DownloadCloud size={16}/> CSV</button>
                    </div>
                  </div>

                  <div className="overflow-x-auto custom-scrollbar">
                    <table className="w-full text-left border-collapse whitespace-nowrap min-w-max">
                      <thead className="bg-slate-50 text-[10px] uppercase font-black tracking-widest text-slate-500 sticky top-0 z-10 border-b-2 border-slate-800">
                        <tr>
                          <th className="px-6 py-4 w-10 text-center">No</th>
                          <th className="px-6 py-4">Nama Peserta</th>
                          <th className="px-6 py-4">Petugas</th>
                          <th className="px-6 py-4 max-w-[200px]">Pertanyaan</th>
                          <th className="px-6 py-4 max-w-[250px]">Jawaban</th>
                          <th className="px-6 py-4">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {currentHasilWawancara.map((row, idx) => {
                          const actualIdx = (currentPage - 1) * itemsPerPage + idx + 1;
                          return (
                            <tr key={idx} className="hover:bg-slate-50 transition-colors group">
                              <td className="px-6 py-3 text-center font-bold text-slate-300 text-xs">{actualIdx}</td>
                              <td className="px-6 py-3 font-bold text-[13px] text-slate-800">{row.nama_peserta}</td>
                              <td className="px-6 py-3 text-[11px] font-mono text-slate-500">{row.nama_petugas}</td>
                              <td className="px-6 py-3 text-xs text-slate-600 max-w-[200px] truncate">{row.pertanyaan}</td>
                              <td className="px-6 py-3 text-xs text-slate-600 max-w-[250px] truncate">{row.jawaban}</td>
                              <td className="px-6 py-3">
                                <span className="inline-flex items-center px-2.5 py-1 rounded-md bg-slate-100 border border-slate-200 text-[10px] font-black uppercase tracking-widest text-slate-700">{row.keterangan || '-'}</span>
                              </td>
                            </tr>
                          )
                        })}
                        {currentHasilWawancara.length === 0 && <tr><td colSpan="6" className="p-10 text-center text-slate-400 font-medium text-sm">Belum ada data hasil wawancara yang ditarik dari server.</td></tr>}
                      </tbody>
                    </table>
                  </div>
                  {totalPagesWawancara > 0 && (
                     <PaginationFooter currentPage={currentPage} totalPages={totalPagesWawancara} setCurrentPage={setCurrentPage} itemsPerPage={itemsPerPage} setItemsPerPage={setItemsPerPage} />
                  )}
                </div>
              </div>
            )}

            {/* TAB CONTENT: BANK SOAL PG */}
            {activeTab === 'soal' && (
              <div className="bg-white rounded-[24px] border border-slate-200 shadow-sm flex flex-col h-[75vh] animate-fade-up">
                <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-white">
                  <h3 className="font-black text-base text-[#1A1A1B] uppercase tracking-tight flex items-center gap-2"><Database className="text-[#facc15]"/> Soal Ujian ({quizData.length})</h3>
                </div>
                <div className="flex-1 overflow-y-auto p-6 custom-scrollbar bg-slate-50/50">
                  <div className="grid gap-4">
                    {quizData.map((s, i) => (
                      <div key={i} className="p-6 bg-white border border-slate-200 rounded-2xl shadow-sm hover:border-black transition-colors">
                         <div className="flex gap-4">
                           <div className="mt-0.5 text-sm font-black text-slate-300 w-6 text-right shrink-0">{i+1}.</div>
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
                    ))}
                    {quizData.length === 0 && <p className="text-center py-20 text-slate-400 font-bold text-sm">Belum ada soal PG yang disinkronisasi.</p>}
                  </div>
                </div>
              </div>
            )}

            {/* TAB CONTENT: SOAL WAWANCARA */}
            {activeTab === 'soal_wawancara' && (
              <div className="bg-white rounded-[24px] border border-slate-200 shadow-sm flex flex-col h-[75vh] animate-fade-up">
                <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-white">
                  <h3 className="font-black text-base text-[#1A1A1B] uppercase tracking-tight flex items-center gap-2"><MessageCircle className="text-[#facc15]"/> Daftar Pertanyaan Wawancara ({soalWawancara.length})</h3>
                </div>
                <div className="flex-1 overflow-y-auto p-6 custom-scrollbar bg-slate-50/50">
                  <div className="grid gap-4">
                    {soalWawancara.map((s, i) => (
                      <div key={i} className="p-6 bg-white border border-slate-200 rounded-2xl shadow-sm hover:border-black transition-colors">
                         <div className="flex gap-4">
                           <div className="mt-0.5 text-sm font-black text-slate-300 w-6 text-right shrink-0">{i+1}.</div>
                           <div className="flex-1">
                             <p className="font-bold text-slate-800 text-sm leading-relaxed">{s.pertanyaan || s}</p>
                           </div>
                         </div>
                      </div>
                    ))}
                    {soalWawancara.length === 0 && <p className="text-center py-20 text-slate-400 font-bold text-sm">Belum ada soal wawancara yang disinkronisasi.</p>}
                  </div>
                </div>
              </div>
            )}

            {/* TAB CONTENT: SESI AKTIF */}
            {activeTab === 'sesi' && (
              <div className="bg-white rounded-[24px] border border-slate-200 shadow-sm flex flex-col h-[75vh] animate-fade-up">
                <div className="p-6 border-b border-slate-100 bg-white flex justify-between items-center">
                  <div>
                    <h3 className="font-black text-base text-[#1A1A1B] uppercase tracking-tight">Sesi Aktif Ujian</h3>
                    <p className="text-[10px] text-slate-500 font-medium mt-1 tracking-wide">Pantau peserta yang sedang mengerjakan soal.</p>
                  </div>
                </div>
                <div className="flex-1 overflow-y-auto custom-scrollbar flex flex-col">
                  {activeSessions.length === 0 ? (
                    <div className="text-center py-32 text-slate-300"><Activity size={48} className="mx-auto opacity-20 mb-4"/><p className="text-xs font-bold uppercase tracking-widest">Tidak ada sesi aktif saat ini</p></div>
                  ) : (
                    <>
                    <table className="w-full text-left border-collapse min-w-max flex-1">
                       <thead className="bg-slate-50 text-[10px] uppercase font-black tracking-widest text-slate-500 border-b-2 border-slate-800 sticky top-0">
                         <tr><th className="px-6 py-4 w-12 text-center">No</th><th className="px-6 py-4">Akun Email</th><th className="px-6 py-4">Waktu Mulai</th><th className="px-6 py-4">Status</th></tr>
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
                        <tr><th className="px-6 py-4 w-12 text-center">No</th><th className="px-6 py-4">Peserta</th><th className="px-6 py-4 text-center">Skor Lama</th><th className="px-6 py-4 text-right">Opsi</th></tr>
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