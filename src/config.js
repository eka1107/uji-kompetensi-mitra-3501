export const GOOGLE_SCRIPT_WEB_APP_URL = "https://script.google.com/macros/s/AKfycbzLRkW2qOUDNmuoKibKV5_KsiCOissAhr0Us9w6gi52cbznFaO3beVXwMapUsANAfRj/exec"; 
export const LOGO_BPS = "https://upload.wikimedia.org/wikipedia/commons/2/28/Lambang_Badan_Pusat_Statistik_%28BPS%29_Indonesia.svg";

export function shuffleArray(array) {
  const newArr = [...array];
  for (let i = newArr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArr[i], newArr[j]] = [newArr[j], newArr[i]];
  }
  return newArr;
}

export const getLocalTime = () => new Date().toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' });
// lama loading halaman
export const formatTime = (seconds) => {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
};