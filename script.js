import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js";
import { getDatabase, ref, set, push, onValue, remove } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-database.js";
import { getAuth, signInWithPopup, GoogleAuthProvider, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-auth.js";

const firebaseConfig = {
    apiKey: "AIzaSyDKZ2HS2OaqZoPH6-SLVgQ5LD_NIVA_Tcg",
    authDomain: "survivorop.firebaseapp.com",
    projectId: "survivorop",
    storageBucket: "survivorop.firebasestorage.app",
    messagingSenderId: "62669967258",
    appId: "1:62669967258:web:3d7e38a4d23c1ec6c7b423",
    databaseURL: "https://survivorop-default-rtdb.firebaseio.com"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

// ==========================================
// NOTIFICACIONES TOAST (IN-APP)
// ==========================================
window.mostrarToast = (mensaje, tipo = "success") => {
    const container = document.getElementById('toast-container');
    if(!container) return;
    const toast = document.createElement('div');
    toast.className = `toast toast-${tipo}`;
    let icono = "✅"; if(tipo === "error") icono = "⚠️"; if(tipo === "warning") icono = "🔥";
    toast.innerHTML = `<span>${icono}</span> <span>${mensaje}</span>`;
    container.appendChild(toast);
    setTimeout(() => { toast.classList.add('fade-out'); setTimeout(() => toast.remove(), 300); }, 3000);
};

// ==========================================
// RESULTADOS EN VIVO (FOOTBALL-DATA.ORG)
// ==========================================
window.cargarResultadosEnVivo = async () => {
    const apiKey = '2d61e6642bf24074afa9b05e8c00630f'; 
    const url = `https://api.football-data.org/v4/matches?authToken=${apiKey}`;
    const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(url)}`;
    const list = document.getElementById('live-scores-list');
    
    if (!list) return;

    try {
        const response = await fetch(proxyUrl);
        const json = await response.json();
        const data = JSON.parse(json.contents);
        
        list.innerHTML = '';
        
        // Si no hay partidos, dejamos la "Vista Previa" que ya te funciona
        if(!data.matches || data.matches.length === 0) {
            list.innerHTML = `
                <div class="live-match"><div class="live-status" style="color:var(--text-muted)">TIMED</div><div class="live-teams">LDU de Quito <b>-</b> - <b>-</b> Always Ready</div></div>
                <div class="live-match"><div class="live-status" style="color:var(--text-muted)">TIMED</div><div class="live-teams">Lanús <b>-</b> - <b>-</b> Mirassol</div></div>
                <p style="text-align:center; font-size:10px; color:var(--text-muted); margin-top:5px;">(Vista previa: No hay juegos en vivo hoy)</p>
            `;
            return;
        }
        
        data.matches.forEach(m => {
            const isLive = m.status === 'IN_PLAY' || m.status === 'PAUSED';
            if (!isLive) return; 

            const home = m.homeTeam.shortName || m.homeTeam.name;
            const away = m.awayTeam.shortName || m.awayTeam.name;
            
            list.innerHTML += `
                <div class="live-match">
                    <div class="live-status" style="color:red">🔴 En Vivo</div>
                    <div class="live-teams">${home} <b>${m.score.fullTime.home ?? '-'}</b> - <b>${m.score.fullTime.away ?? '-'}</b> ${away}</div>
                </div>
            `;
        });
    } catch(error) {
        console.error("Error:", error);
    }
};
// ==========================================
// DICCIONARIOS Y CALENDARIO
// ==========================================
const banderas = { "Arabia Saudita": "🇸🇦", "Argelia": "🇩🇿", "Argentina": "🇦🇷", "Australia": "🇦🇺", "Austria": "🇦🇹", "Bélgica": "🇧🇪", "Bosnia y Herzegovina": "🇧🇦", "Brasil": "🇧🇷", "Cabo Verde": "🇨🇻", "Camerún": "🇨🇲", "Canadá": "🇨🇦", "Chile": "🇨🇱", "Colombia": "🇨🇴", "Corea del Sur": "🇰🇷", "Costa de Marfil": "🇨🇮", "Costa Rica": "🇨🇷", "Croacia": "🇭🇷", "Curazao": "🇨🇼", "Dinamarca": "🇩🇰", "Ecuador": "🇪🇨", "Egipto": "🇪🇬", "Escocia": "🏴󠁧󠁢󠁳󠁣󠁴󠁿", "España": "🇪🇸", "Estados Unidos": "🇺🇸", "Francia": "🇫🇷", "Gales": "🏴󠁧󠁢󠁷󠁬󠁳󠁿", "Ghana": "🇬🇭", "Haití": "🇭🇹", "Inglaterra": "🏴󠁧󠁢󠁥󠁮󠁧󠁿", "Irak": "🇮🇶", "Irán": "🇮🇷", "Italia": "🇮🇹", "Jamaica": "🇯🇲", "Japón": "🇯🇵", "Jordania": "🇯🇴", "Malí": "🇲🇱", "Marruecos": "🇲🇦", "México": "🇲🇽", "Noruega": "🇳🇴", "Nueva Zelanda": "🇳🇿", "Países Bajos": "🇳🇱", "Panamá": "🇵🇦", "Paraguay": "🇵🇾", "Perú": "🇵🇪", "Polonia": "🇵🇱", "Portugal": "🇵🇹", "Qatar": "🇶🇦", "RD Congo": "🇨🇩", "República Checa": "🇨🇿", "Senegal": "🇸🇳", "Serbia": "🇷🇸", "Sudáfrica": "🇿🇦", "Suecia": "🇸🇪", "Suiza": "🇨🇭", "Túnez": "🇹🇳", "Turquía": "🇹🇷", "Ucrania": "🇺🇦", "Uruguay": "🇺🇾", "Uzbekistán": "🇺🇿", "Venezuela": "🇻🇪" };
const getFlag = (team) => banderas[team] || "🏳️";
const equiposMundial = Object.keys(banderas).sort();

const calendarioMundial = [ { j: 1, nombre: "J1: Grupos", fechas: "11 Jun - 17 Jun 2026" }, { j: 2, nombre: "J2: Grupos", fechas: "18 Jun - 23 Jun 2026" }, { j: 3, nombre: "J3: Grupos", fechas: "24 Jun - 27 Jun 2026" }, { j: 4, nombre: "J4: 16vos de Final", fechas: "28 Jun - 03 Jul 2026" }, { j: 5, nombre: "J5: Octavos de Final", fechas: "04 Jul - 07 Jul 2026" }, { j: 6, nombre: "J6: Cuartos de Final", fechas: "09 Jul - 11 Jul 2026" }, { j: 7, nombre: "J7: Semifinales", fechas: "14 Jul - 15 Jul 2026" }, { j: 8, nombre: "J8: Gran Final / 3er", fechas: "18 Jul - 19 Jul 2026" } ];

const partidosMundial = [
    { j: 1, local: "México", visitante: "Sudáfrica", fecha: "11 de Junio", hora: "13:00" }, { j: 1, local: "Corea del Sur", visitante: "República Checa", fecha: "11 de Junio", hora: "20:00" }, { j: 1, local: "Canadá", visitante: "Bosnia y Herzegovina", fecha: "12 de Junio", hora: "13:00" }, { j: 1, local: "Estados Unidos", visitante: "Paraguay", fecha: "12 de Junio", hora: "19:00" }, { j: 1, local: "Qatar", visitante: "Suiza", fecha: "13 de Junio", hora: "13:00" }, { j: 1, local: "Brasil", visitante: "Marruecos", fecha: "13 de Junio", hora: "16:00" }, { j: 1, local: "Haití", visitante: "Escocia", fecha: "13 de Junio", hora: "19:00" }, { j: 1, local: "Australia", visitante: "Turquía", fecha: "13 de Junio", hora: "22:00" }, { j: 1, local: "Alemania", visitante: "Curazao", fecha: "14 de Junio", hora: "11:00" }, { j: 1, local: "Países Bajos", visitante: "Japón", fecha: "14 de Junio", hora: "14:00" }, { j: 1, local: "Costa de Marfil", visitante: "Ecuador", fecha: "14 de Junio", hora: "17:00" }, { j: 1, local: "Suecia", visitante: "Túnez", fecha: "14 de Junio", hora: "20:00" }, { j: 1, local: "España", visitante: "Cabo Verde", fecha: "15 de Junio", hora: "10:00" }, { j: 1, local: "Bélgica", visitante: "Egipto", fecha: "15 de Junio", hora: "13:00" }, { j: 1, local: "Arabia Saudita", visitante: "Uruguay", fecha: "15 de Junio", hora: "16:00" }, { j: 1, local: "Irán", visitante: "Nueva Zelanda", fecha: "15 de Junio", hora: "19:00" }, { j: 1, local: "Francia", visitante: "Senegal", fecha: "16 de Junio", hora: "13:00" }, { j: 1, local: "Irak", visitante: "Noruega", fecha: "16 de Junio", hora: "16:00" }, { j: 1, local: "Argentina", visitante: "Argelia", fecha: "16 de Junio", hora: "19:00" }, { j: 1, local: "Austria", visitante: "Jordania", fecha: "16 de Junio", hora: "22:00" }, { j: 1, local: "Portugal", visitante: "RD Congo", fecha: "17 de Junio", hora: "11:00" }, { j: 1, local: "Inglaterra", visitante: "Croacia", fecha: "17 de Junio", hora: "14:00" }, { j: 1, local: "Ghana", visitante: "Panamá", fecha: "17 de Junio", hora: "17:00" }, { j: 1, local: "Uzbekistán", visitante: "Colombia", fecha: "17 de Junio", hora: "20:00" },
    { j: 2, local: "República Checa", visitante: "Sudáfrica", fecha: "18 de Junio", hora: "10:00" }, { j: 2, local: "Suiza", visitante: "Bosnia y Herzegovina", fecha: "18 de Junio", hora: "13:00" }, { j: 2, local: "Canadá", visitante: "Qatar", fecha: "18 de Junio", hora: "16:00" }, { j: 2, local: "México", visitante: "Corea del Sur", fecha: "18 de Junio", hora: "19:00" }, { j: 2, local: "Estados Unidos", visitante: "Australia", fecha: "19 de Junio", hora: "13:00" }, { j: 2, local: "Escocia", visitante: "Marruecos", fecha: "19 de Junio", hora: "16:00" }, { j: 2, local: "Brasil", visitante: "Haití", fecha: "19 de Junio", hora: "18:30" }, { j: 2, local: "Turquía", visitante: "Paraguay", fecha: "19 de Junio", hora: "21:00" }, { j: 2, local: "Países Bajos", visitante: "Suecia", fecha: "20 de Junio", hora: "11:00" }, { j: 2, local: "Alemania", visitante: "Costa de Marfil", fecha: "20 de Junio", hora: "14:00" }, { j: 2, local: "Ecuador", visitante: "Curazao", fecha: "20 de Junio", hora: "18:00" }, { j: 2, local: "Túnez", visitante: "Japón", fecha: "20 de Junio", hora: "22:00" }, { j: 2, local: "España", visitante: "Arabia Saudita", fecha: "21 de Junio", hora: "10:00" }, { j: 2, local: "Bélgica", visitante: "Irán", fecha: "21 de Junio", hora: "13:00" }, { j: 2, local: "Uruguay", visitante: "Cabo Verde", fecha: "21 de Junio", hora: "16:00" }, { j: 2, local: "Nueva Zelanda", visitante: "Egipto", fecha: "21 de Junio", hora: "19:00" }, { j: 2, local: "Noruega", visitante: "Senegal", fecha: "22 de Junio", hora: "13:00" }, { j: 2, local: "Francia", visitante: "Irak", fecha: "22 de Junio", hora: "16:00" }, { j: 2, local: "Jordania", visitante: "Argelia", fecha: "22 de Junio", hora: "19:00" }, { j: 2, local: "Argentina", visitante: "Austria", fecha: "22 de Junio", hora: "22:00" }, { j: 2, local: "Colombia", visitante: "RD Congo", fecha: "23 de Junio", hora: "11:00" }, { j: 2, local: "Portugal", visitante: "Uzbekistán", fecha: "23 de Junio", hora: "14:00" }, { j: 2, local: "Panamá", visitante: "Croacia", fecha: "23 de Junio", hora: "17:00" }, { j: 2, local: "Inglaterra", visitante: "Ghana", fecha: "23 de Junio", hora: "20:00" },
    { j: 3, local: "República Checa", visitante: "México", fecha: "24 de Junio", hora: "19:00" }, { j: 3, local: "Sudáfrica", visitante: "Corea del Sur", fecha: "24 de Junio", hora: "19:00" }, { j: 3, local: "Suiza", visitante: "Canadá", fecha: "24 de Junio", hora: "13:00" }, { j: 3, local: "Bosnia y Herzegovina", visitante: "Qatar", fecha: "24 de Junio", hora: "13:00" }, { j: 3, local: "Brasil", visitante: "Escocia", fecha: "24 de Junio", hora: "18:00" }, { j: 3, local: "Marruecos", visitante: "Haití", fecha: "24 de Junio", hora: "18:00" }, { j: 3, local: "Turquía", visitante: "Estados Unidos", fecha: "25 de Junio", hora: "20:00" }, { j: 3, local: "Paraguay", visitante: "Australia", fecha: "25 de Junio", hora: "20:00" }, { j: 3, local: "Ecuador", visitante: "Alemania", fecha: "25 de Junio", hora: "14:00" }, { j: 3, local: "Curazao", visitante: "Costa de Marfil", fecha: "25 de Junio", hora: "14:00" }, { j: 3, local: "Japón", visitante: "Suecia", fecha: "25 de Junio", hora: "17:00" }, { j: 3, local: "Túnez", visitante: "Países Bajos", fecha: "25 de Junio", hora: "17:00" }, { j: 3, local: "Uruguay", visitante: "España", fecha: "26 de Junio", hora: "18:00" }, { j: 3, local: "Cabo Verde", visitante: "Arabia Saudita", fecha: "26 de Junio", hora: "18:00" }, { j: 3, local: "Egipto", visitante: "Irán", fecha: "26 de Junio", hora: "21:00" }, { j: 3, local: "Nueva Zelanda", visitante: "Bélgica", fecha: "26 de Junio", hora: "21:00" }, { j: 3, local: "Noruega", visitante: "Francia", fecha: "26 de Junio", hora: "13:00" }, { j: 3, local: "Senegal", visitante: "Irak", fecha: "26 de Junio", hora: "13:00" }, { j: 3, local: "Jordania", visitante: "Argentina", fecha: "27 de Junio", hora: "20:00" }, { j: 3, local: "Argelia", visitante: "Austria", fecha: "27 de Junio", hora: "20:00" }, { j: 3, local: "Colombia", visitante: "Portugal", fecha: "27 de Junio", hora: "17:30" }, { j: 3, local: "RD Congo", visitante: "Uzbekistán", fecha: "27 de Junio", hora: "17:30" }, { j: 3, local: "Panamá", visitante: "Inglaterra", fecha: "27 de Junio", hora: "15:00" }, { j: 3, local: "Croacia", visitante: "Ghana", fecha: "27 de Junio", hora: "15:00" },
    { j: 4, local: "Ganador Grupo A", visitante: "Tercero C/D/E", fecha: "28 de Junio", hora: "14:00" }, { j: 4, local: "Ganador Grupo B", visitante: "Segundo Grupo C", fecha: "28 de Junio", hora: "18:00" }, { j: 4, local: "Ganador Grupo C", visitante: "Tercero A/F/G", fecha: "29 de Junio", hora: "13:00" }, { j: 4, local: "Segundo Grupo A", visitante: "Segundo Grupo B", fecha: "29 de Junio", hora: "17:00" }, { j: 4, local: "Ganador Grupo D", visitante: "Tercero B/I/J", fecha: "29 de Junio", hora: "21:00" }, { j: 4, local: "Ganador Grupo E", visitante: "Segundo Grupo D", fecha: "30 de Junio", hora: "14:00" }, { j: 4, local: "Ganador Grupo F", visitante: "Segundo Grupo E", fecha: "30 de Junio", hora: "18:00" }, { j: 4, local: "Segundo Grupo D", visitante: "Segundo Grupo F", fecha: "30 de Junio", hora: "21:00" }, { j: 4, local: "Ganador Grupo G", visitante: "Tercero E/H/K", fecha: "01 de Julio", hora: "13:00" }, { j: 4, local: "Ganador Grupo H", visitante: "Segundo Grupo G", fecha: "01 de Julio", hora: "17:00" }, { j: 4, local: "Ganador Grupo I", visitante: "Tercero D/G/L", fecha: "01 de Julio", hora: "21:00" }, { j: 4, local: "Ganador Grupo J", visitante: "Segundo Grupo I", fecha: "02 de Julio", hora: "14:00" }, { j: 4, local: "Ganador Grupo K", visitante: "Segundo Grupo J", fecha: "02 de Julio", hora: "18:00" }, { j: 4, local: "Segundo Grupo H", visitante: "Segundo Grupo K", fecha: "02 de Julio", hora: "21:00" }, { j: 4, local: "Ganador Grupo L", visitante: "Tercero F/H/I", fecha: "03 de Julio", hora: "15:00" }, { j: 4, local: "Segundo Grupo G", visitante: "Segundo Grupo L", fecha: "03 de Julio", hora: "19:00" },
    { j: 5, local: "Ganador Llave 1", visitante: "Ganador Llave 2", fecha: "04 de Julio", hora: "14:00" }, { j: 5, local: "Ganador Llave 3", visitante: "Ganador Llave 4", fecha: "04 de Julio", hora: "19:00" }, { j: 5, local: "Ganador Llave 5", visitante: "Ganador Llave 6", fecha: "05 de Julio", hora: "13:00" }, { j: 5, local: "Ganador Llave 7", visitante: "Ganador Llave 8", fecha: "05 de Julio", hora: "18:00" }, { j: 5, local: "Ganador Llave 9", visitante: "Ganador Llave 10", fecha: "06 de Julio", hora: "14:00" }, { j: 5, local: "Ganador Llave 11", visitante: "Ganador Llave 12", fecha: "06 de Julio", hora: "19:00" }, { j: 5, local: "Ganador Llave 13", visitante: "Ganador Llave 14", fecha: "07 de Julio", hora: "15:00" }, { j: 5, local: "Ganador Llave 15", visitante: "Ganador Llave 16", fecha: "07 de Julio", hora: "20:00" },
    { j: 6, local: "Cuartofinalista 1", visitante: "Cuartofinalista 2", fecha: "09 de Julio", hora: "16:00" }, { j: 6, local: "Cuartofinalista 3", visitante: "Cuartofinalista 4", fecha: "10 de Julio", hora: "19:00" }, { j: 6, local: "Cuartofinalista 5", visitante: "Cuartofinalista 6", fecha: "11 de Julio", hora: "14:00" }, { j: 6, local: "Cuartofinalista 7", visitante: "Cuartofinalista 8", fecha: "11 de Julio", hora: "18:00" },
    { j: 7, local: "Semifinalista 1", visitante: "Semifinalista 2", fecha: "14 de Julio", hora: "20:00" }, { j: 7, local: "Semifinalista 3", visitante: "Semifinalista 4", fecha: "15 de Julio", hora: "20:00" },
    { j: 8, local: "Perdedor Semifinal 1", visitante: "Perdedor Semifinal 2", fecha: "18 de Julio", hora: "15:00" }, { j: 8, local: "Finalista 1", visitante: "Finalista 2", fecha: "19 de Julio", hora: "16:00" }
];

let jugadores = [];
let currentUser = null;
let appConfig = { jornadaActual: 1, fase: 'grupos' };

// ==========================================
// TEMA Y MODALES GLOBALES
// ==========================================
if (localStorage.getItem('theme') === 'light') document.body.classList.remove('dark-theme');

window.toggleTema = () => {
    document.body.classList.toggle('dark-theme');
    localStorage.setItem('theme', document.body.classList.contains('dark-theme') ? 'dark' : 'light');
    toggleMenu();
};

window.toggleMenu = () => {
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('menu-overlay');
    if (sidebar.classList.contains('open')) { sidebar.classList.remove('open'); overlay.style.display = 'none'; } 
    else { sidebar.classList.add('open'); overlay.style.display = 'block'; }
};

window.abrirModalReglas = () => { toggleMenu(); document.getElementById('modal-overlay').style.display = 'block'; document.getElementById('modal-reglas').style.display = 'block'; };
window.cerrarModalReglas = () => { document.getElementById('modal-overlay').style.display = 'none'; document.getElementById('modal-reglas').style.display = 'none'; };

// NUEVO: MODAL CALENDARIO COMPLETO
window.abrirModalCalendario = () => {
    toggleMenu(); 
    document.getElementById('modal-overlay').style.display = 'block';
    document.getElementById('modal-calendario').style.display = 'block';
    
    const cont = document.getElementById('calendario-completo-contenido');
    cont.innerHTML = '';
    
    calendarioMundial.forEach(cal => {
        const partidosFiltro = partidosMundial.filter(p => p.j === cal.j);
        let partidosHTML = '';
        partidosFiltro.forEach(p => {
            partidosHTML += `
                <div class="match-compact">
                    <div style="color:var(--text-muted); font-size:10px; margin-bottom:4px;">📅 ${p.fecha} - ${p.hora}</div>
                    <div>${getFlag(p.local)} ${p.local}</div>
                    <div style="font-size:10px; margin:2px 0;">VS</div>
                    <div>${getFlag(p.visitante)} ${p.visitante}</div>
                </div>
            `;
        });
        
        cont.innerHTML += `
            <details class="jornada-accordion">
                <summary>${cal.nombre} <span style="font-size:11px; float:right; color:var(--text-muted);">${cal.fechas}</span></summary>
                <div class="acordeon-content">
                    ${partidosHTML}
                </div>
            </details>
        `;
    });
};

window.cerrarModalCalendario = () => {
    document.getElementById('modal-overlay').style.display = 'none';
    document.getElementById('modal-calendario').style.display = 'none';
};

window.abrirModalEspia = (userId) => {
    const j = jugadores.find(x => x.id === userId); if(!j) return;
    document.getElementById('espia-nombre').textContent = `Picks de ${j.nombre}`;
    const cont = document.getElementById('espia-contenido'); cont.innerHTML = '';
    if(!j.picks || j.picks.length === 0) { cont.innerHTML = '<p style="text-align:center; color:var(--text-muted);">Sin picks registrados.</p>'; } 
    else { j.picks.forEach((p, idx) => { cont.innerHTML += `<div class="espia-item"><span><b>Jornada ${idx + 1}</b></span><span style="font-weight:bold;">${getFlag(p)} ${p}</span></div>`; }); }
    document.getElementById('modal-overlay').style.display = 'block'; document.getElementById('modal-espia').style.display = 'block';
};

window.cerrarModalEspia = () => { document.getElementById('modal-overlay').style.display = 'none'; document.getElementById('modal-espia').style.display = 'none'; };

function actualizarTodo() { renderizarCalendario(); actualizarDashboard(); cargarSelectsAdmin(); }

onValue(ref(db, 'survivor/config'), (snapshot) => { if (snapshot.exists()) appConfig = snapshot.val(); else set(ref(db, 'survivor/config'), appConfig); actualizarTodo(); });
onValue(ref(db, 'survivor/jugadores'), (snapshot) => { jugadores = snapshot.val() ? Object.values(snapshot.val()) : []; actualizarTodo(); });

function renderizarCalendario() {
    const banner = document.getElementById('global-status-banner');
    const infoJornada = calendarioMundial[appConfig.jornadaActual - 1]?.nombre || '';
    if (banner) banner.innerHTML = `⚽ <b>JORNADA ${appConfig.jornadaActual}:</b> ${infoJornada} | Estado: <b>${appConfig.fase === 'grupos' ? 'Fase de Grupos' : 'Eliminatoria'}</b>`;
    const adminTexto = document.getElementById('admin-jornada-text'); if (adminTexto) adminTexto.textContent = `JORNADA ${appConfig.jornadaActual}`;
    const selectFase = document.getElementById('select-fase-admin'); if (selectFase) selectFase.value = appConfig.fase;
    const divCalendario = document.getElementById('lista-calendario');
    if (divCalendario) {
        divCalendario.innerHTML = '';
        calendarioMundial.forEach(c => {
            let clase = 'cal-item'; if (c.j === appConfig.jornadaActual) clase += ' cal-active'; else if (c.j < appConfig.jornadaActual) clase += ' cal-past';
            divCalendario.innerHTML += `<div class="${clase}"><span style="font-weight:bold;">${c.nombre}</span><span style="font-size:12px; opacity:0.8;">${c.fechas}</span></div>`;
        });
    }
}

// AUTENTICACIÓN
window.loginConGoogle = async () => { try { const result = await signInWithPopup(auth, provider); verificarOcrearUsuario(result.user); } catch (e) { mostrarToast("Error al iniciar sesión.", "error"); } };
window.cerrarSesion = () => { signOut(auth); mostrarToast("Sesión cerrada.", "success"); };
onAuthStateChanged(auth, (user) => {
    currentUser = user;
    document.getElementById('login-btn').style.display = user ? 'none' : 'block'; document.getElementById('perfil-btn').style.display = user ? 'block' : 'none';
    document.getElementById('config-btn').style.display = user ? 'block' : 'none'; document.getElementById('user-panel').style.display = user ? 'block' : 'none';
    document.getElementById('chat-general-container').style.display = user ? 'block' : 'none';
    actualizarTodo();
});

function verificarOcrearUsuario(user) {
    const userRef = ref(db, `survivor/jugadores/${user.uid}`);
    onValue(userRef, (snapshot) => {
        if (!snapshot.exists()) {
            set(userRef, { id: user.uid, nombre: user.displayName, equipo: "Equipo Survivor", foto: user.photoURL, vivo: true, vidas: 3, ganados: 0, empatados: 0, perdidos: 0, gf: 0, gc: 0, difGoles: 0, picks: [] }).then(() => { window.abrirModalPerfil(); mostrarToast("¡Bienvenido al torneo!", "success"); });
        } else { mostrarToast(`Hola de nuevo, ${snapshot.val().nombre}`, "success"); }
    }, { onlyOnce: true });
}
window.abrirModalPerfil = () => { const j = jugadores.find(j => j.id === currentUser.uid); if(j) { document.getElementById('edit-nick').value = j.nombre; document.getElementById('edit-equipo').value = j.equipo; document.getElementById('modal-overlay').style.display = 'block'; document.getElementById('modal-perfil').style.display = 'block'; } };
window.cerrarModalPerfil = () => { document.getElementById('modal-overlay').style.display = 'none'; document.getElementById('modal-perfil').style.display = 'none'; };
window.guardarPerfil = () => { const j = jugadores.find(j => j.id === currentUser.uid); if(j) { j.nombre = document.getElementById('edit-nick').value; j.equipo = document.getElementById('edit-equipo').value; set(ref(db, `survivor/jugadores/${currentUser.uid}`), j); cerrarModalPerfil(); mostrarToast("Perfil actualizado.", "success"); } };

// SELECCIÓN PICKS
window.seleccionarEquipo = (nombreEquipo) => {
    document.querySelectorAll('.team-option').forEach(el => el.classList.remove('selected'));
    const tarjeta = document.getElementById('team-opt-' + nombreEquipo.replace(/\s+/g, '-')); if (tarjeta) tarjeta.classList.add('selected');
    document.getElementById('equipo-seleccionado').value = nombreEquipo; const btn = document.getElementById('btn-confirmar-pick'); btn.disabled = false; btn.textContent = `Confirmar a ${nombreEquipo} ⚽`;
};
function lanzarConfeti() { confetti({ particleCount: 150, spread: 80, origin: { y: 0.6 }, colors: ['#2e7d32', '#deff9a', '#ffffff'] }); }
function flashRojo() { document.body.classList.add('flash-red'); setTimeout(() => { document.body.classList.remove('flash-red'); }, 800); }

window.guardarPickPropio = () => {
    if (!currentUser) return mostrarToast("Debes iniciar sesión.", "error");
    const equipo = document.getElementById('equipo-seleccionado').value; const j = jugadores.find(j => j.id === currentUser.uid);
    if (!equipo) return mostrarToast("Selecciona un equipo.", "error"); if (!j.vivo) return mostrarToast("Jugador eliminado.", "error");
    if ((j.picks || []).length >= appConfig.jornadaActual) return mostrarToast("Ya registraste tu pick.", "warning");
    const ultimoPick = (j.picks || []).length > 0 ? j.picks[j.picks.length - 1] : null;

    if (appConfig.fase === 'eliminatoria') {
        if (equipo === ultimoPick) {
            if (j.vidas <= 1) return mostrarToast("Regla de Descanso: Vidas insuficientes.", "error");
            if (!confirm(`🔥 ¿Sacrificar 1 vida para repetir?`)) return;
            j.vidas -= 1; flashRojo(); mostrarToast(`Vida sacrificada. Pick confirmado.`, "warning");
        } else { lanzarConfeti(); mostrarToast(`Pick confirmado.`, "success"); }
    } else {
        if ((j.picks || []).includes(equipo)) return mostrarToast("¡Ya usaste a este equipo!", "error");
        lanzarConfeti(); mostrarToast(`Pick confirmado.`, "success");
    }
    j.picks = [...(j.picks || []), equipo]; set(ref(db, `survivor/jugadores/${currentUser.uid}`), j);
};

function generarBadges(j) {
    let badges = "";
    if (j.ganados >= 3) badges += '<span class="badge-icon" title="Francotirador 🎯: 3+ Victorias">🎯</span>';
    if (j.ganados >= 1 && j.gc === 0) badges += '<span class="badge-icon" title="La Muralla 🧱: 0 Goles en contra">🧱</span>';
    if (j.vidas === 3 && (j.picks || []).length >= 3) badges += '<span class="badge-icon" title="Intocable 🛡️: Sobrevivió intacto 3 jornadas">🛡️</span>';
    if (j.perdidos >= 2) badges += '<span class="badge-icon" title="Pecho Frío 🧊: 2+ Derrotas">🧊</span>';
    return badges;
}

function actualizarDashboard() {
    const dashboard = document.getElementById('dashboard');
    const tablaContainer = document.getElementById('tabla-general-container');
    const tablaPosiciones = document.getElementById('tabla-posiciones');
    const interfazSeleccion = document.getElementById('interfaz-seleccion');
    const interfazEspera = document.getElementById('interfaz-espera');
    const headerPanel = document.getElementById('user-panel-header');
    const gridEquipos = document.getElementById('grid-equipos');
    const userPanel = document.getElementById('user-panel');
    const podiumContainer = document.getElementById('hall-of-fame-container');
    const podiumContent = document.getElementById('podium-content');
    
    if(!dashboard) return; dashboard.innerHTML = '';
    
    // FOCUS PANEL
    if (currentUser && userPanel && interfazSeleccion && interfazEspera) {
        const miJugador = jugadores.find(j => j.id === currentUser.uid);
        if (miJugador) {
            const picksRealizados = (miJugador.picks || []).length;
            if (!miJugador.vivo) {
                headerPanel.style.display = 'none'; interfazSeleccion.style.display = 'none'; interfazEspera.style.display = 'block';
                interfazEspera.innerHTML = `<div style="font-size: 40px; margin-bottom: 10px;">💀</div><h3 style="color: var(--danger); margin: 0;">Eliminado</h3><p style="color: var(--text-muted); font-size: 14px; margin-top: 5px;">Has perdido todas tus vidas.</p>`;
                userPanel.style.borderColor = "var(--danger)";
            } else if (picksRealizados >= appConfig.jornadaActual) {
                headerPanel.style.display = 'none'; interfazSeleccion.style.display = 'none'; interfazEspera.style.display = 'block';
                interfazEspera.innerHTML = `<div style="font-size: 40px; margin-bottom: 10px;">🛡️</div><h3 style="color: var(--accent-color); margin: 0;">¡Estrategia Confirmada!</h3><p style="color: var(--text-muted); font-size: 14px; margin-top: 5px;">Tu pick de <b>${miJugador.picks[miJugador.picks.length-1]}</b> está listo.</p>`;
                userPanel.style.borderColor = "var(--border-color)";
            } else {
                headerPanel.style.display = 'block'; interfazSeleccion.style.display = 'block'; interfazEspera.style.display = 'none';
                userPanel.style.borderColor = "var(--accent-color)";
                const disp = equiposMundial.filter(e => { if (appConfig.fase === 'eliminatoria') return true; return !(miJugador.picks || []).includes(e); }).sort();
                gridEquipos.innerHTML = '';
                disp.forEach(e => { gridEquipos.innerHTML += `<div class="team-option" id="team-opt-${e.replace(/\s+/g, '-')}" onclick="seleccionarEquipo('${e}')"><span class="team-flag">${getFlag(e)}</span><span class="team-name">${e}</span></div>`; });
                const btn = document.getElementById('btn-confirmar-pick'); btn.disabled = true; btn.textContent = "Selecciona un equipo primero ⚽"; document.getElementById('equipo-seleccionado').value = "";
            }
        }
    }
    
    // ORDENAR JUGADORES PARA TODO LO DEMÁS
    jugadores.sort((a,b) => (b.vivo - a.vivo) || (b.vidas - a.vidas) || (b.ganados - a.ganados) || (b.difGoles - a.difGoles));

    // PODIO - SALÓN DE LA FAMA
    if(jugadores.length >= 3 && podiumContainer && podiumContent) {
        podiumContainer.style.display = 'block';
        const top3 = jugadores.slice(0, 3);
        
        let htmlPodium = '';
        if(top3[1]) htmlPodium += `<div class="podium-spot podium-2"><img src="${top3[1].foto || 'https://via.placeholder.com/50'}"><div class="podium-name">${top3[1].nombre}</div><div class="podium-box">2</div></div>`;
        if(top3[0]) htmlPodium += `<div class="podium-spot podium-1"><img src="${top3[0].foto || 'https://via.placeholder.com/50'}"><div class="podium-name">${top3[0].nombre}</div><div class="podium-box">1</div></div>`;
        if(top3[2]) htmlPodium += `<div class="podium-spot podium-3"><img src="${top3[2].foto || 'https://via.placeholder.com/50'}"><div class="podium-name">${top3[2].nombre}</div><div class="podium-box">3</div></div>`;
        
        podiumContent.innerHTML = htmlPodium;
    }

    // ESTADÍSTICAS
    if(jugadores.length > 0) {
        const pichichi = [...jugadores].sort((a,b) => (b.ganados - a.ganados) || (b.difGoles - a.difGoles))[0];
        const pechoFrio = [...jugadores].sort((a,b) => (a.vidas - b.vidas) || (b.ganados - a.ganados) || (a.difGoles - b.difGoles))[0];
        const estCont = document.getElementById('estadisticas-container');
        if(estCont) {
            estCont.style.display = 'flex';
            document.getElementById('stat-pichichi').innerHTML = `${pichichi.nombre} <br><span style="font-size: 12px; color: var(--text-muted); font-weight: normal;">${pichichi.ganados} ganados (+${pichichi.difGoles} dif)</span>`;
            document.getElementById('stat-pecho-frio').innerHTML = `${pechoFrio.nombre} <br><span style="font-size: 12px; color: var(--text-muted); font-weight: normal;">${pechoFrio.vidas} vidas (${pechoFrio.difGoles} dif)</span>`;
        }
    }

    // TABLA GENERAL CON LOGROS
    if(jugadores.length > 0 && tablaContainer && tablaPosiciones) {
        tablaContainer.style.display = 'block';
        let tablaHTML = `<thead><tr><th>Pos</th><th style="text-align:left;">Jugador</th><th>J</th><th>G</th><th>E</th><th>P</th><th>GF</th><th>GC</th><th>DIF</th><th>Vidas</th></tr></thead><tbody>`;
        jugadores.forEach((j, i) => {
            const pj = (j.picks || []).length; const dif = j.difGoles > 0 ? '+' + j.difGoles : j.difGoles; const vidasHtml = j.vivo ? '❤️'.repeat(j.vidas) : '💀';
            const misLogros = generarBadges(j);
            tablaHTML += `<tr style="${!j.vivo ? 'opacity: 0.5;' : ''}"><td><strong>${i + 1}</strong></td><td class="td-jugador"><img src="${j.foto || 'https://via.placeholder.com/30'}"><div><span>${j.nombre}</span><div class="badges-container">${misLogros}</div></div></td><td>${pj}</td><td>${j.ganados}</td><td>${j.empatados || 0}</td><td>${j.perdidos || 0}</td><td>${j.gf||0}</td><td>${j.gc||0}</td><td><strong>${dif}</strong></td><td class="col-vidas">${vidasHtml}</td></tr>`;
        });
        tablaHTML += '</tbody>'; tablaPosiciones.innerHTML = tablaHTML;
    } else if (tablaContainer) { tablaContainer.style.display = 'none'; }

    // TARJETAS INDIVIDUALES
    jugadores.forEach((j, i) => {
        const card = document.createElement('div'); card.className = `card ${j.vivo ? 'vivo' : 'eliminado'}`;
        card.innerHTML = `<div class="card-header"><img src="${j.foto || 'https://via.placeholder.com/50'}" class="avatar-img"><div style="flex-grow: 1;"><h3 style="margin:0;">#${i+1} ${j.nombre}</h3><span style="font-size: 12px; color: var(--text-muted);">🛡️ ${j.equipo}</span></div><div class="vidas-container">${j.vivo ? '❤️'.repeat(j.vidas) : '💀'}</div></div><div class="stats-row"><span>Ganados: <b>${j.ganados}</b></span><span>Dif. Goles: <b>${j.difGoles > 0 ? '+' : ''}${j.difGoles}</b></span></div><button class="btn-espia btn-interactivo" onclick="abrirModalEspia('${j.id}')">🔍 Ver Picks (Modo Espía)</button>`;
        dashboard.appendChild(card);
    });
}

function cargarSelectsAdmin() {
    const sJugador = document.getElementById('select-jugador'); const sJugadorVidas = document.getElementById('select-jugador-vidas');
    const sEliminar = document.getElementById('select-jugador-eliminar'); const sEquipo = document.getElementById('select-equipo');
    if(!sJugador || !sJugadorVidas || !sEliminar || !sEquipo) return;
    sJugador.innerHTML = sJugadorVidas.innerHTML = sEliminar.innerHTML = '<option value="">Selecciona un jugador...</option>';
    jugadores.forEach(j => { const opt = `<option value="${j.id}">${j.nombre}</option>`; sJugador.innerHTML += opt; sJugadorVidas.innerHTML += opt; sEliminar.innerHTML += opt; });
    sEquipo.innerHTML = '<option value="">Selecciona Equipo...</option>'; equiposMundial.forEach(e => sEquipo.innerHTML += `<option value="${e}">${getFlag(e)} ${e}</option>`);
}

// CHAT EN TIEMPO REAL
onValue(ref(db, 'survivor/chat'), (snapshot) => {
    const divChat = document.getElementById('chat-messages'); if (!divChat) return; divChat.innerHTML = '';
    if (snapshot.exists()) {
        Object.values(snapshot.val()).forEach(m => {
            const horaStr = new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            divChat.innerHTML += `<div class="chat-msg"><img src="${m.foto || 'https://via.placeholder.com/35'}" class="chat-avatar"><div class="chat-content"><div class="chat-header"><span>${m.autor}</span> <span class="chat-time">${horaStr}</span></div><div class="chat-text">${m.texto}</div></div></div>`;
        });
        divChat.scrollTop = divChat.scrollHeight;
    } else { divChat.innerHTML = '<p style="text-align:center; color:var(--text-muted); font-size:12px; margin-top:20px;">No hay mensajes aún.</p>'; }
});
window.manejarEnterChat = (e) => { if (e.key === 'Enter') enviarMensajeChat(); };
window.enviarMensajeChat = () => {
    if (!currentUser) return alert("Inicia sesión."); const input = document.getElementById('chat-input'); const texto = input.value.trim(); if (!texto) return;
    const j = jugadores.find(jug => jug.id === currentUser.uid); const nombreDisplay = j ? j.nombre : currentUser.displayName;
    push(ref(db, 'survivor/chat'), { autor: nombreDisplay, foto: currentUser.photoURL, texto: texto, timestamp: Date.now() }); input.value = '';
};

// ==========================================
// CONTROLES DE ADMINISTRADOR (MANUAL COMPLETO)
// ==========================================
if (sessionStorage.getItem('isAdmin') === 'true') document.getElementById('admin-panel').style.display = 'block';
window.accesoAdmin = () => { toggleMenu(); if(prompt("Clave de Administrador:") === "OP2026") { document.getElementById('admin-panel').style.display = 'block'; sessionStorage.setItem('isAdmin', 'true'); mostrarToast("Acceso Concedido", "success"); } else mostrarToast("Clave incorrecta.", "error"); };
window.cambiarJornada = (suma) => { let nuevaJornada = appConfig.jornadaActual + suma; if (nuevaJornada < 1) nuevaJornada = 1; if (nuevaJornada > 8) nuevaJornada = 8; set(ref(db, 'survivor/config/jornadaActual'), nuevaJornada); mostrarToast(`Jornada cambiada a ${nuevaJornada}`, "success"); };
window.cambiarFase = (fase) => { set(ref(db, 'survivor/config/fase'), fase); mostrarToast(`Fase actualizada.`, "success"); };
window.agregarJugadorManual = () => { const nombre = document.getElementById('nuevo-jugador-nombre').value; if (!nombre) return mostrarToast("Ingresa un nombre.", "error"); const id = "manual_" + Date.now(); set(ref(db, `survivor/jugadores/${id}`), { id, nombre, equipo: "Invitado", foto: "https://via.placeholder.com/50", vivo: true, vidas: 3, ganados: 0, empatados: 0, perdidos: 0, gf: 0, gc: 0, difGoles: 0, picks: [] }); document.getElementById('nuevo-jugador-nombre').value = ''; mostrarToast("Usuario manual creado.", "success"); };
window.eliminarUsuario = () => { const id = document.getElementById('select-jugador-eliminar').value; if(!id) return mostrarToast("Selecciona usuario.", "error"); if(confirm("¿Eliminar usuario?")) { remove(ref(db, `survivor/jugadores/${id}`)); mostrarToast("Usuario eliminado.", "warning"); } };
window.registrarPick = () => { const id = document.getElementById('select-jugador').value; const equipo = document.getElementById('select-equipo').value; if(!id || !equipo) return mostrarToast("Faltan datos.", "error"); const j = jugadores.find(j => j.id === id); j.picks = [...(j.picks || []), equipo]; set(ref(db, `survivor/jugadores/${id}`), j); mostrarToast("Pick forzado asignado.", "success"); };

window.resolverPartido = (tipoResultado) => { 
    const id = document.getElementById('select-jugador-vidas').value; 
    if (!id) return mostrarToast("Selecciona un jugador para resolver.", "error"); 
    const j = jugadores.find(j => j.id === id); 
    const gf = parseInt(document.getElementById('goles-favor').value) || 0; 
    const gc = parseInt(document.getElementById('goles-contra').value) || 0; 
    
    if (tipoResultado === 'G') { j.ganados = (j.ganados || 0) + 1; mostrarToast("Partido GANADO 🟢", "success"); } 
    else if (tipoResultado === 'E') { j.empatados = (j.empatados || 0) + 1; j.vidas--; if(j.vidas <= 0) { j.vidas = 0; j.vivo = false; } mostrarToast("Partido EMPATADO 🟡", "warning"); } 
    else if (tipoResultado === 'P') { j.perdidos = (j.perdidos || 0) + 1; j.vidas--; if(j.vidas <= 0) { j.vidas = 0; j.vivo = false; } mostrarToast("Partido PERDIDO 🔴", "error"); } 
    
    j.gf = (j.gf || 0) + gf; j.gc = (j.gc || 0) + gc; j.difGoles += (gf - gc); 
    set(ref(db, `survivor/jugadores/${id}`), j); 
};

window.verificarResultadosAutomaticos = async () => { /* Logic is in cargarResultadosEnVivo for manual check */ mostrarToast("Usa el panel 'Partidos de Hoy' para revisar resultados.", "warning"); };

window.reiniciarLiga = () => { 
    if(confirm("🚨 ¿Seguro que quieres reiniciar la temporada completa?")) { 
        jugadores.forEach(j => { set(ref(db, `survivor/jugadores/${j.id}`), {...j, vivo:true, vidas:3, ganados:0, empatados:0, perdidos:0, gf:0, gc:0, difGoles:0, picks:[]}); }); 
        set(ref(db, 'survivor/config'), {jornadaActual: 1, fase: 'grupos'}); remove(ref(db, 'survivor/chat')); mostrarToast("Liga reiniciada.", "warning");
    }
};