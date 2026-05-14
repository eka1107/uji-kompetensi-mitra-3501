import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, LogOut, Users, CheckCircle2, XCircle, Clock,
  UserPlus, FileSpreadsheet, Trash2, Download, Search, CalendarClock, Shield, Save, Lock
} from 'lucide-react';

// GANTI DENGAN URL DEPLOY APPS SCRIPT YANG BARU!
const GOOGLE_SCRIPT_WEB_APP_URL = "https://script.google.com/macros/s/AKfycbzLRkW2qOUDNmuoKibKV5_KsiCOissAhr0Us9w6gi52cbznFaO3beVXwMapUsANAfRj/exec";

export default function AdminDashboard({ adminData, accountsData, adminCreds, onRefresh, AppStylesAndBackground }) {
  const [activeTab, setActiveTab] = useState('dashboard');
  
  const [daftarHasil, setDaftarHasil] = useState(adminData || []);
  const [daftarPeserta, setDaftarPeserta] = useState(accountsData || []);
  
  const [newPeserta, setNewPeserta] = useState({ email: '', password: '', nama: '', desa: '' });
  const [jadwalForm, setJadwalForm] = useState({ mulai: '', selesai: '' });
  const [adminSettingForm, setAdminSettingForm] = useState({ email: adminCreds?.email || '', password: adminCreds?.password || '' });
  
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => { setDaftarHasil(adminData || []); }, [adminData]);
  useEffect(() => { setDaftarPeserta(accountsData || []); }, [accountsData]);

  // LOGIKA PENGATURAN ADMIN (BARU)
  const handleSaveAdmin = (e) => {
    e.preventDefault();
    if(!window.confirm('Yakin ingin merubah akses masuk Panitia?')) return;

    const payload = { action: "update_admin", email: adminSettingForm.email, password: adminSettingForm.password };
    try {
      fetch(GOOGLE_SCRIPT_WEB_APP_URL, {
        method: 'POST', mode: 'no-cors', headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify(payload)
      });
      alert('Kredensial Admin berhasil diperbarui!');
    } catch(e) {
      alert('Gagal memperbarui admin.');
    }
  };

  // LOGIKA PENGATURAN JADWAL
  const handleSaveJadwal = (e) => {
    e.preventDefault();
    if(!jadwalForm.mulai || !jadwalForm.selesai) return;
    if(!window.confirm('Yakin ingin menetapkan jadwal ujian ini?')) return;

    const payload = { action: "set_jadwal", mulai: new Date(jadwalForm.mulai).getTime(), selesai: new Date(jadwalForm.selesai).getTime() };
    try {
      fetch(GOOGLE_SCRIPT_WEB_APP_URL, {
        method: 'POST', mode: 'no-cors', headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify(payload)
      });
      alert('Jadwal ujian berhasil diperbarui!');
    } catch(e) {}
  };

  // LOGIKA CRUD PESERTA
  const handleAddPeserta = async (e) => {
    e.preventDefault();
    if (!newPeserta.email || !newPeserta.password) return;
    
    setDaftarPeserta([{ ...newPeserta }, ...daftarPeserta]);
    setNewPeserta({ email: '', password: '', nama: '', desa: '' });

    try {
      fetch(GOOGLE_SCRIPT_WEB_APP_URL, {
        method: 'POST', mode: 'no-cors', headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({ action: "add_peserta", data: [newPeserta] })
      });
    } catch(e) {}
  };

  const handleDeletePeserta = (email) => {
    if(!window.confirm(`Yakin ingin mencabut akses untuk ${email}?`)) return;
    setDaftarPeserta(daftarPeserta.filter(p => p.email !== email));

    try {
      fetch(GOOGLE_SCRIPT_WEB_APP_URL, {
        method: 'POST', mode: 'no-cors', headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({ action: "delete_peserta", email: email })
      });
    } catch(e) {}
  };

  // LOGIKA UPLOAD & DOWNLOAD EXCEL (CSV) - DIPERBARUI DENGAN NAMA DAN DESA
  const downloadTemplateCSV = () => {
    const csvContent = "data:text/csv;charset=utf-8,email,password,nama,desa\nmitra1@bps.go.id,sandi123,Budi Santoso,Ploso\nmitra2@bps.go.id,sandi456,Siti Aminah,Arjowinangun";
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "Template_Data_Mitra_SE2026.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleUploadCSV = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      const text = evt.target.result;
      const rows = text.split('\n');
      
      const newData = [];
      for (let i = 1; i < rows.length; i++) {
        const row = rows[i].replace(/\r/g, ''); 
        if (row.trim() === '') continue;
        
        // Memecah 4 kolom sesuai template
        const [email, password, nama, desa] = row.split(',');
        if (email && password) {
          newData.push({ 
            email: email.trim(), 
            password: password.trim(),
            nama: nama ? nama.trim() : '',
            desa: desa ? desa.trim() : ''
          });
        }
      }

      if (newData.length > 0) {
        setDaftarPeserta([...newData, ...daftarPeserta]);
        alert(`${newData.length} Peserta berhasil diimpor!`);
        
        try {
          fetch(GOOGLE_SCRIPT_WEB_APP_URL, {
            method: 'POST', mode: 'no-cors', headers: { 'Content-Type': 'text/plain;charset=utf-8' },
            body: JSON.stringify({ action: "add_peserta", data: newData })
          });
        } catch(e) {}
      }
    };
    reader.readAsText(file);
    e.target.value = null; 
  };

  const handleDeleteHasil = (akun) => {
    if(!window.confirm(`Yakin ingin mereset/menghapus nilai ujian untuk ${akun}?`)) return;
    setDaftarHasil(daftarHasil.filter(h => h.akun !== akun));

    try {
      fetch(GOOGLE_SCRIPT_WEB_APP_URL, {
        method: 'POST', mode: 'no-cors', headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({ action: "delete_hasil", akun: akun })
      });
    } catch(e) {}
  };

  const totalLulus = daftarHasil.filter(d => d.keterangan === 'LULUS').length;
  const totalGagal = daftarHasil.filter(d => d.keterangan === 'TIDAK LULUS').length;
  const filterPencarian = (data, field) => data.filter(item => String(item[field]).toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="h-[100svh] w-screen flex flex-col font-sans relative bg-[#f5f5f7] overflow-hidden">
      <AppStylesAndBackground />

      <header className="pintarly-glass border-b border-black/5 px-6 h-[70px] flex items-center justify-between shrink-0 z-40 relative">
        <div className="flex items-center gap-3">
          <Shield className="w-8 h-8 text-blue-600 drop-shadow-sm" />
          <div>
            <div className="font-bold text-[var(--black-charcoal)] text-base leading-tight tracking-tight">Otoritas Panitia SE2026</div>
            <div className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-0.5">BPS Kabupaten Pacitan</div>
          </div>
        </div>
        <button onClick={() => window.location.reload()} className="flex items-center gap-2 bg-red-50 text-red-600 px-4 py-2 rounded-xl text-sm font-bold hover:bg-red-100 transition-colors shadow-sm">
          <LogOut className="w-4 h-4" /> Keluar
        </button>
      </header>

      <main className="flex-1 flex overflow-hidden">
        <aside className="w-64 pintarly-glass border-r border-black/5 p-4 flex flex-col gap-2 z-30 shrink-0">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 px-2">Menu Utama</p>
          
          <button onClick={() => setActiveTab('dashboard')} className={`flex items-center gap-3 p-3.5 rounded-2xl font-bold text-sm transition-all ${activeTab === 'dashboard' ? 'bg-blue-600 text-white shadow-md hover-scale-up' : 'text-slate-600 hover:bg-white/60'}`}>
            <LayoutDashboard className="w-5 h-5"/> Ringkasan & Jadwal
          </button>
          <button onClick={() => setActiveTab('peserta')} className={`flex items-center gap-3 p-3.5 rounded-2xl font-bold text-sm transition-all ${activeTab === 'peserta' ? 'bg-blue-600 text-white shadow-md hover-scale-up' : 'text-slate-600 hover:bg-white/60'}`}>
            <Users className="w-5 h-5"/> Kelola Peserta
          </button>
          <button onClick={() => setActiveTab('hasil')} className={`flex items-center gap-3 p-3.5 rounded-2xl font-bold text-sm transition-all ${activeTab === 'hasil' ? 'bg-blue-600 text-white shadow-md hover-scale-up' : 'text-slate-600 hover:bg-white/60'}`}>
            <FileSpreadsheet className="w-5 h-5"/> Rekap Nilai Ujian
          </button>
        </aside>

        <div className="flex-1 p-6 overflow-y-auto custom-scrollbar relative z-20">
          <div className="max-w-[1100px] mx-auto animate-fade-up">

            {activeTab === 'dashboard' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="pintarly-glass p-6 rounded-[24px] flex items-center gap-4 border border-white">
                    <div className="w-14 h-14 bg-blue-50 rounded-full flex items-center justify-center text-blue-600"><Users className="w-7 h-7" /></div>
                    <div>
                      <p className="text-sm font-bold text-slate-500 uppercase tracking-widest">Total Peserta</p>
                      <p className="text-3xl font-black text-[var(--black-charcoal)]">{daftarPeserta.length}</p>
                    </div>
                  </div>
                  <div className="pintarly-glass p-6 rounded-[24px] flex items-center gap-4 border border-green-200/50">
                    <div className="w-14 h-14 bg-green-50 rounded-full flex items-center justify-center text-green-600"><CheckCircle2 className="w-7 h-7" /></div>
                    <div>
                      <p className="text-sm font-bold text-slate-500 uppercase tracking-widest">Sesi Lulus</p>
                      <p className="text-3xl font-black text-green-600">{totalLulus}</p>
                    </div>
                  </div>
                  <div className="pintarly-glass p-6 rounded-[24px] flex items-center gap-4 border border-red-200/50">
                    <div className="w-14 h-14 bg-red-50 rounded-full flex items-center justify-center text-red-500"><XCircle className="w-7 h-7" /></div>
                    <div>
                      <p className="text-sm font-bold text-slate-500 uppercase tracking-widest">Sesi Gagal</p>
                      <p className="text-3xl font-black text-red-600">{totalGagal}</p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Panel Pengaturan Jadwal */}
                  <div className="pintarly-glass p-8 rounded-[24px] border border-white shadow-sm bg-white/40">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-12 h-12 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center shadow-sm">
                        <CalendarClock className="w-6 h-6" />
                      </div>
                      <div>
                        <h3 className="font-bold text-lg text-[var(--black-charcoal)]">Jadwal Ujian</h3>
                        <p className="text-xs text-slate-500 font-medium">Buka dan tutup portal soal.</p>
                      </div>
                    </div>
                    
                    <form onSubmit={handleSaveJadwal} className="space-y-4">
                      <div>
                        <label className="block text-[11px] font-bold text-slate-600 mb-2 uppercase tracking-wider">Waktu Dimulai</label>
                        <input type="datetime-local" required value={jadwalForm.mulai} onChange={(e) => setJadwalForm({...jadwalForm, mulai: e.target.value})}
                          className="w-full px-4 py-3 text-sm bg-white border border-slate-200 rounded-xl outline-none focus:border-blue-500 text-slate-800 font-bold shadow-sm" />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-slate-600 mb-2 uppercase tracking-wider">Waktu Ditutup</label>
                        <input type="datetime-local" required value={jadwalForm.selesai} onChange={(e) => setJadwalForm({...jadwalForm, selesai: e.target.value})}
                          className="w-full px-4 py-3 text-sm bg-white border border-slate-200 rounded-xl outline-none focus:border-blue-500 text-slate-800 font-bold shadow-sm" />
                      </div>
                      <button type="submit" className="w-full mt-2 bg-[var(--black-charcoal)] hover:bg-black text-white font-bold py-3 px-6 rounded-xl transition-all flex items-center justify-center gap-2 text-sm shadow-md hover-scale-up">
                        <Save className="w-4 h-4"/> Terapkan Jadwal
                      </button>
                    </form>
                  </div>

                  {/* Panel Pengaturan Akun Admin */}
                  <div className="pintarly-glass p-8 rounded-[24px] border border-white shadow-sm bg-white/40">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center shadow-sm">
                        <Lock className="w-6 h-6" />
                      </div>
                      <div>
                        <h3 className="font-bold text-lg text-[var(--black-charcoal)]">Akses Panitia</h3>
                        <p className="text-xs text-slate-500 font-medium">Ubah kredensial login admin Anda.</p>
                      </div>
                    </div>
                    
                    <form onSubmit={handleSaveAdmin} className="space-y-4">
                      <div>
                        <label className="block text-[11px] font-bold text-slate-600 mb-2 uppercase tracking-wider">Email Panitia Baru</label>
                        <input type="email" required value={adminSettingForm.email} onChange={(e) => setAdminSettingForm({...adminSettingForm, email: e.target.value})}
                          className="w-full px-4 py-3 text-sm bg-white border border-slate-200 rounded-xl outline-none focus:border-blue-500 text-slate-800 font-bold shadow-sm" />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-slate-600 mb-2 uppercase tracking-wider">Kata Sandi Baru</label>
                        <input type="text" required value={adminSettingForm.password} onChange={(e) => setAdminSettingForm({...adminSettingForm, password: e.target.value})}
                          className="w-full px-4 py-3 text-sm bg-white border border-slate-200 rounded-xl outline-none focus:border-blue-500 text-slate-800 font-bold shadow-sm" />
                      </div>
                      <button type="submit" className="w-full mt-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-xl transition-all flex items-center justify-center gap-2 text-sm shadow-md hover-scale-up">
                        <Shield className="w-4 h-4"/> Perbarui Kredensial
                      </button>
                    </form>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'peserta' && (
              <div className="space-y-6">
                
                <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                  
                  <div className="pintarly-glass p-6 rounded-[24px] border border-white shadow-sm lg:col-span-2">
                    <h3 className="font-bold text-base text-[var(--black-charcoal)] flex items-center gap-2 mb-4">
                      <UserPlus className="w-5 h-5 text-blue-600"/> Tambah Peserta Satuan
                    </h3>
                    <form onSubmit={handleAddPeserta} className="grid grid-cols-2 gap-3">
                      <input type="email" placeholder="Email Peserta" required value={newPeserta.email} onChange={e => setNewPeserta({...newPeserta, email: e.target.value})}
                        className="col-span-2 w-full px-4 py-3 text-sm bg-slate-50/50 border border-slate-200 rounded-xl outline-none focus:border-blue-500 text-slate-800" />
                      <input type="text" placeholder="Kata Sandi (Unik)" required value={newPeserta.password} onChange={e => setNewPeserta({...newPeserta, password: e.target.value})}
                        className="col-span-2 w-full px-4 py-3 text-sm bg-slate-50/50 border border-slate-200 rounded-xl outline-none focus:border-blue-500 text-slate-800" />
                      <input type="text" placeholder="Nama Lengkap" value={newPeserta.nama} onChange={e => setNewPeserta({...newPeserta, nama: e.target.value})}
                        className="col-span-1 w-full px-4 py-3 text-sm bg-slate-50/50 border border-slate-200 rounded-xl outline-none focus:border-blue-500 text-slate-800" />
                      <input type="text" placeholder="Asal Desa" value={newPeserta.desa} onChange={e => setNewPeserta({...newPeserta, desa: e.target.value})}
                        className="col-span-1 w-full px-4 py-3 text-sm bg-slate-50/50 border border-slate-200 rounded-xl outline-none focus:border-blue-500 text-slate-800" />
                      
                      <button type="submit" className="col-span-2 mt-2 w-full bg-blue-600 text-white font-bold py-3 rounded-xl hover:bg-blue-700 transition-colors text-sm shadow-sm">
                        Simpan Peserta
                      </button>
                    </form>
                  </div>

                  <div className="pintarly-glass p-6 rounded-[24px] border border-white shadow-sm lg:col-span-3 flex flex-col justify-center bg-gradient-to-br from-white/80 to-blue-50/50">
                    <h3 className="font-bold text-base text-[var(--black-charcoal)] flex items-center gap-2 mb-2">
                      <FileSpreadsheet className="w-5 h-5 text-green-600"/> Import Massal via Excel (CSV)
                    </h3>
                    <p className="text-xs text-slate-500 mb-5 font-medium leading-relaxed max-w-lg">Gunakan template resmi untuk menambahkan puluhan akun mitra sekaligus tanpa mengetik manual. Format tabel mencakup: <b>Email, Kata Sandi, Nama Lengkap, Asal Desa</b>.</p>
                    
                    <div className="flex flex-wrap gap-3">
                      <button onClick={downloadTemplateCSV} className="bg-white border border-slate-200 text-slate-700 font-bold py-3 px-5 rounded-xl hover:bg-slate-50 transition-all flex items-center gap-2 text-sm shadow-sm hover-scale-up">
                        <Download className="w-4 h-4"/> Unduh Template CSV
                      </button>
                      
                      <label className="bg-green-600 text-white font-bold py-3 px-5 rounded-xl hover:bg-green-700 transition-all flex items-center gap-2 text-sm shadow-sm cursor-pointer hover-scale-up">
                        <UserPlus className="w-4 h-4"/> Upload Data Peserta
                        <input type="file" accept=".csv" onChange={handleUploadCSV} className="hidden" />
                      </label>
                    </div>
                  </div>
                </div>

                <div className="pintarly-glass rounded-[24px] overflow-hidden border border-white shadow-sm">
                  <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between bg-white/50 gap-4">
                    <h3 className="font-bold text-lg text-[var(--black-charcoal)]">Database Peserta</h3>
                    <div className="relative">
                      <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input type="text" placeholder="Cari nama / email peserta..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
                        className="pl-9 pr-4 py-2 text-sm bg-white border border-slate-200 rounded-lg outline-none focus:border-blue-500 w-full sm:w-64" />
                    </div>
                  </div>
                  
                  <div className="overflow-x-auto max-h-[400px] overflow-y-auto custom-scrollbar bg-white/30">
                    <table className="w-full text-left border-collapse relative whitespace-nowrap">
                      <thead className="sticky top-0 bg-slate-50/90 backdrop-blur-md z-10 shadow-sm">
                        <tr className="text-[11px] uppercase tracking-wider text-slate-500">
                          <th className="p-4 font-bold border-b border-slate-200 w-12 text-center">No</th>
                          <th className="p-4 font-bold border-b border-slate-200">Identitas Peserta</th>
                          <th className="p-4 font-bold border-b border-slate-200">Asal Desa</th>
                          <th className="p-4 font-bold border-b border-slate-200">Kata Sandi</th>
                          <th className="p-4 font-bold border-b border-slate-200 text-right">Aksi</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filterPencarian(daftarPeserta, 'email').length === 0 ? (
                          <tr><td colSpan="5" className="p-8 text-center text-slate-500 font-medium">Data peserta tidak ditemukan.</td></tr>
                        ) : filterPencarian(daftarPeserta, 'email').map((row, idx) => (
                          <tr key={idx} className="border-b border-slate-100 hover:bg-white/80 transition-colors">
                            <td className="p-4 text-sm font-semibold text-slate-400 text-center">{idx + 1}</td>
                            <td className="p-4">
                              <p className="font-bold text-sm text-[var(--black-charcoal)]">{row.nama || '-'}</p>
                              <p className="text-[11px] font-medium text-slate-500">{row.email}</p>
                            </td>
                            <td className="p-4 text-sm font-semibold text-slate-600">{row.desa || '-'}</td>
                            <td className="p-4"><span className="text-xs font-mono text-slate-600 bg-slate-50 border border-slate-200 px-2 py-1 rounded">{row.password}</span></td>
                            <td className="p-4 text-right">
                              <button onClick={() => handleDeletePeserta(row.email)} className="p-2 bg-red-50 text-red-500 hover:bg-red-500 hover:text-white rounded-lg transition-colors">
                                <Trash2 className="w-4 h-4"/>
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'hasil' && (
              <div className="pintarly-glass rounded-[24px] overflow-hidden border border-white shadow-sm flex flex-col h-[80vh]">
                <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between bg-white/50 shrink-0 gap-4">
                  <h3 className="font-bold text-lg text-[var(--black-charcoal)]">Laporan Pengerjaan Live</h3>
                  <div className="flex gap-2">
                    <button onClick={onRefresh} className="text-sm bg-white border border-slate-200 px-4 py-2 rounded-xl font-semibold text-slate-700 hover:bg-slate-50 flex items-center gap-2 shadow-sm">
                      <Clock className="w-4 h-4" /> Segarkan
                    </button>
                  </div>
                </div>
                
                <div className="overflow-x-auto overflow-y-auto flex-1 custom-scrollbar bg-white/30">
                  <table className="w-full text-left border-collapse relative">
                    <thead className="sticky top-0 bg-slate-50/90 backdrop-blur-md z-10 shadow-sm">
                      <tr className="text-[11px] uppercase tracking-wider text-slate-500">
                        <th className="p-4 font-bold border-b border-slate-200">Email Peserta</th>
                        <th className="p-4 font-bold border-b border-slate-200">Waktu Mulai</th>
                        <th className="p-4 font-bold border-b border-slate-200">Selesai</th>
                        <th className="p-4 font-bold border-b border-slate-200 text-center">Percobaan</th>
                        <th className="p-4 font-bold border-b border-slate-200 text-center">Skor</th>
                        <th className="p-4 font-bold border-b border-slate-200">Status</th>
                        <th className="p-4 font-bold border-b border-slate-200 text-right">Opsi</th>
                      </tr>
                    </thead>
                    <tbody>
                      {daftarHasil.length === 0 ? (
                        <tr><td colSpan="7" className="p-8 text-center text-slate-500 font-medium">Belum ada peserta yang menyelesaikan ujian.</td></tr>
                      ) : daftarHasil.map((row, idx) => (
                        <tr key={idx} className="border-b border-slate-100 hover:bg-white/80 transition-colors">
                          <td className="p-4 font-bold text-sm text-[var(--black-charcoal)]">{String(row.akun || '')}</td>
                          <td className="p-4 text-xs text-slate-500">{String(row.waktu_mulai || '')}</td>
                          <td className="p-4 text-xs text-slate-500">{String(row.waktu_selesai || '')}</td>
                          <td className="p-4 text-sm font-semibold text-center text-slate-700">{String(row.percobaan || '')}</td>
                          <td className="p-4 text-base font-black text-center text-[var(--se-primary)]">{String(row.skor || '')}</td>
                          <td className="p-4">
                            <span className={`px-3 py-1 rounded-md text-[10px] font-bold ${row.keterangan === 'LULUS' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                              {String(row.keterangan || '')}
                            </span>
                          </td>
                          <td className="p-4 text-right">
                            <button onClick={() => handleDeleteHasil(row.akun)} title="Reset Ujian" className="p-2 bg-slate-100 text-slate-400 hover:bg-red-500 hover:text-white rounded-lg transition-colors">
                              <Trash2 className="w-4 h-4"/>
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

          </div>
        </div>
      </main>
    </div>
  );
}