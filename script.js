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
// DICCIONARIOS Y CALENDARIO
// ==========================================
const banderas = { 
    "Alemania": "🇩🇪", 
    "Arabia Saudita": "🇸🇦", "Argelia": "🇩🇿", "Argentina": "🇦🇷", "Australia": "🇦🇺", "Austria": "🇦🇹", 
    "Bélgica": "🇧🇪", "Bolivia": "🇧🇴", "Bosnia y Herzegovina": "🇧🇦", "Brasil": "🇧🇷", "Cabo Verde": "🇨🇻", 
    "Camerún": "🇨🇲", "Canadá": "🇨🇦", "Chile": "🇨🇱", "Colombia": "🇨🇴", "Corea del Sur": "🇰🇷", 
    "Costa de Marfil": "🇨🇮", "Costa Rica": "🇨🇷", "Croacia": "🇭🇷", "Curazao": "🇨🇼", "Dinamarca": "🇩🇰", 
    "Ecuador": "🇪🇨", "Egipto": "🇪🇬", "Escocia": "🏴󠁧󠁢󠁳󠁣󠁴󠁿", "España": "🇪🇸", "Estados Unidos": "🇺🇸", 
    "Francia": "🇫🇷", "Gales": "🏴󠁧󠁢󠁷󠁬󠁳󠁿", "Ghana": "🇬🇭", "Grecia": "🇬🇷", "Haití": "🇭🇹", "Honduras": "🇭🇳",
    "Inglaterra": "🏴󠁧󠁢󠁥󠁮󠁧󠁿", "Irak": "🇮🇶", "Irán": "🇮🇷", "Italia": "🇮🇹", "Jamaica": "🇯🇲", "Japón": "🇯🇵", 
    "Jordania": "🇯🇴", "Malí": "🇲🇱", "Marruecos": "🇲🇦", "México": "🇲🇽", "Nigeria": "🇳🇬", "Noruega": "🇳🇴", 
    "Nueva Zelanda": "🇳🇿", "Países Bajos": "🇳🇱", "Panamá": "🇵🇦", "Paraguay": "🇵🇾", "Perú": "🇵🇪", 
    "Polonia": "🇵🇱", "Portugal": "🇵🇹", "Qatar": "🇶🇦", "RD Congo": "🇨🇩", "República Checa": "🇨🇿", 
    "Senegal": "🇸🇳", "Serbia": "🇷🇸", "Sudáfrica": "🇿🇦", "Suecia": "🇸🇪", "Suiza": "🇨🇭", "Túnez": "🇹🇳", 
    "Turquía": "🇹🇷", "Ucrania": "🇺🇦", "Uruguay": "🇺🇾", "Uzbekistán": "🇺🇿", "Venezuela": "🇻🇪" 
};
const getFlag = (team) => banderas[team] || "🏳️";
const equiposMundial = Object.keys(banderas).sort((a, b) => a.localeCompare(b, 'es'));

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
let marcadoresEnVivo = {};
let currentUser = null;
let appConfig = { jornadaActual: 1, fase: 'grupos', equiposClasificados: equiposMundial, jornadaAbierta: true, mensajeAviso: "" };

// ==========================================
// TEMA Y MODALES GLOBALES
// ==========================================
if (localStorage.getItem('theme') === 'light') document.body.classList.remove('dark-theme');

document.addEventListener("DOMContentLoaded", () => {
    const themeIcon = document.getElementById('theme-toggle-icon');
    if (themeIcon) {
        themeIcon.src = document.body.classList.contains('dark-theme') ? 'assets/light.svg' : 'assets/dark.svg';
    }
});

window.toggleTema = () => {
    document.body.classList.toggle('dark-theme');
    const isDark = document.body.classList.contains('dark-theme');
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
    const themeIcon = document.getElementById('theme-toggle-icon');
    if (themeIcon) { themeIcon.src = isDark ? 'assets/light.svg' : 'assets/dark.svg'; }
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

window.abrirModalCalendario = () => {
    toggleMenu(); 
    document.getElementById('modal-overlay').style.display = 'block';
    document.getElementById('modal-calendario').style.display = 'block';
    
    const cont = document.getElementById('calendario-completo-contenido');
    cont.innerHTML = '';
    
    calendarioMundial.forEach(cal => {
        const partidosFiltro = partidosMundial.filter(p => p.j === cal.j);
        let partidosHTML = '';
        
        const canPick = (cal.j === appConfig.jornadaActual && appConfig.jornadaAbierta);

        partidosFiltro.forEach(p => {
            let btnPickHtml = '';
            if (canPick) {
                btnPickHtml = `<button class="btn-interactivo btn-outline" style="margin-top: 10px; width: 100%; font-size: 12px; padding: 6px; border: 1px solid var(--accent-color); color: var(--accent-color); background: transparent;" onclick="abrirModalPickRapido('${p.local}', '${p.visitante}')">Hacer Pick 🎯</button>`;
            }

            partidosHTML += `
                <div class="match-compact" style="${canPick ? 'border: 1px solid var(--accent-color); padding-bottom: 10px;' : ''}">
                    <div style="color:var(--text-muted); font-size:10px; margin-bottom:4px;">📅 ${p.fecha} - ${p.hora}</div>
                    <div>${getFlag(p.local)} ${p.local}</div>
                    <div style="font-size:10px; margin:2px 0;">VS</div>
                    <div>${getFlag(p.visitante)} ${p.visitante}</div>
                    ${btnPickHtml}
                </div>
            `;
        });
        
        cont.innerHTML += `
            <details class="jornada-accordion" ${cal.j === appConfig.jornadaActual ? 'open' : ''}>
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

function actualizarTodo() { 
    renderizarCalendario(); 
    actualizarDashboard(); 
    cargarSelectsAdmin(); 
    renderizarFiltroEquiposAdmin(); 
    renderizarComunicacionAdmin(); 
    calcularYMostrarResumenJornada(); 
}

onValue(ref(db, 'survivor/config'), (snapshot) => { 
    if (snapshot.exists()) {
        appConfig = snapshot.val(); 
        if (!appConfig.equiposClasificados) appConfig.equiposClasificados = equiposMundial;
        if (appConfig.jornadaAbierta === undefined) appConfig.jornadaAbierta = true;
        if (appConfig.mensajeAviso === undefined) appConfig.mensajeAviso = "";
    } else {
        set(ref(db, 'survivor/config'), appConfig); 
    }
    actualizarTodo(); 
});

onValue(ref(db, 'survivor/jugadores'), (snapshot) => { jugadores = snapshot.val() ? Object.values(snapshot.val()) : []; actualizarTodo(); });

onValue(ref(db, 'survivor/marcadores'), (snapshot) => {
    marcadoresEnVivo = snapshot.val() ? snapshot.val() : {};
    if (typeof window.cargarResultadosEnVivo === 'function') window.cargarResultadosEnVivo();
});

function renderizarCalendario() {
    const elInscritos = document.getElementById('num-inscritos');
    if (elInscritos) elInscritos.textContent = jugadores.length;

    const banner = document.getElementById('global-status-banner');
    const infoJornada = calendarioMundial[appConfig.jornadaActual - 1]?.nombre || '';
    if (banner) banner.innerHTML = `<img src="assets/jornada.svg" class="svg-icon"> <b>JORNADA ${appConfig.jornadaActual}:</b> ${infoJornada} | Estado: <b>${appConfig.fase === 'grupos' ? 'Fase de Grupos' : 'Eliminatoria'}</b>`;
    const adminTexto = document.getElementById('admin-jornada-text'); if (adminTexto) adminTexto.textContent = `JORNADA ${appConfig.jornadaActual}`;
    const selectFase = document.getElementById('select-fase-admin'); if (selectFase) selectFase.value = appConfig.fase;
    
    const newsTicker = document.getElementById('news-ticker');
    const newsText = document.getElementById('news-text');
    if (newsTicker && newsText) {
        if (appConfig.mensajeAviso && appConfig.mensajeAviso.trim() !== "") {
            newsTicker.style.display = 'block';
            newsText.textContent = appConfig.mensajeAviso;
        } else {
            newsTicker.style.display = 'none';
        }
    }

    const divCalendario = document.getElementById('lista-calendario');
    if (divCalendario) {
        divCalendario.innerHTML = '';
        calendarioMundial.forEach(c => {
            let clase = 'cal-item'; if (c.j === appConfig.jornadaActual) clase += ' cal-active'; else if (c.j < appConfig.jornadaActual) clase += ' cal-past';
            divCalendario.innerHTML += `<div class="${clase}"><span style="font-weight:bold;">${c.nombre}</span><span style="font-size:12px; opacity:0.8;">${c.fechas}</span></div>`;
        });
    }
}

// ==========================================
// NUEVA FUNCIÓN: GENERADOR DE SURVIVOR NEWS
// ==========================================
function calcularYMostrarResumenJornada() {
    const container = document.getElementById('survivor-news-container');
    const content = document.getElementById('survivor-news-content');
    
    if (!container || !content) return;
    
    const jornadaNum = parseInt(appConfig.jornadaActual) || 1;
    
    if (jornadaNum <= 1 || jugadores.length === 0) {
        container.style.display = 'none';
        return;
    }
    
    container.style.display = 'block';
    const jAnterior = jornadaNum - 1;
    
    let totalVidasPerdidas = 0;
    let caidosList = [];
    let conteoPicks = {};
    
    let mvpNombre = "Nadie";
    let maxGolesFavor = -1;
    let maxGolesFavorEquipo = "";
    
    let pechoFrioNombre = "Nadie";
    let maxGolesContra = -1;
    let maxGolesContraEquipo = "";

    jugadores.forEach(j => {
        const pickAnterior = j.picks ? j.picks[jAnterior - 1] : null;
        
        if (pickAnterior) {
            conteoPicks[pickAnterior] = (conteoPicks[pickAnterior] || 0) + 1;
            
            Object.keys(marcadoresEnVivo).forEach(key => {
                const equipos = key.replace(/-/g, ' ').split('_'); 
                const loc = equipos[0];
                const vis = equipos[1];
                
                if (loc === pickAnterior || vis === pickAnterior) {
                    const m = marcadoresEnVivo[key];
                    if (m && m.golesLocal !== undefined && m.golesVisitante !== undefined) {
                        const gf = (loc === pickAnterior) ? m.golesLocal : m.golesVisitante;
                        const gc = (loc === pickAnterior) ? m.golesVisitante : m.golesLocal;
                        
                        if (gf <= gc) {
                            totalVidasPerdidas++;
                            if (!caidosList.includes(j.nombre)) caidosList.push(j.nombre);
                        }
                        
                        if (gf > maxGolesFavor) {
                            maxGolesFavor = gf;
                            mvpNombre = j.nombre;
                            maxGolesFavorEquipo = pickAnterior;
                        }
                        if (gc > maxGolesContra) {
                            maxGolesContra = gc;
                            pechoFrioNombre = j.nombre;
                            maxGolesContraEquipo = pickAnterior;
                        }
                    }
                }
            });
        }
    });

    let equipoMasVotado = "Ninguno";
    let maxVotos = 0;
    Object.keys(conteoPicks).forEach(eq => {
        if (conteoPicks[eq] > maxVotos) {
            maxVotos = conteoPicks[eq];
            equipoMasVotado = eq;
        }
    });

    let htmlNews = `<p style="margin-top: 0; text-align:center; font-style: italic; color: var(--text-muted);">Crónica de la sangrienta Jornada ${jAnterior}</p>`;
    
    htmlNews += `<div style="background: rgba(255,255,255,0.03); padding: 12px; border-radius: 8px; margin-bottom: 12px; border-left: 3px solid #d32f2f;">`;
    htmlNews += `<strong style="color: #ff5252; font-size: 14px;">📉 Reporte de Bajas:</strong><br>`;
    if (caidosList.length > 0) {
        htmlNews += `La jornada pasada se cobró un total de <b style="color:white;">${totalVidasPerdidas} vidas</b>. Los sobrevivientes que tropezaron y sufrieron heridas en la arena fueron: <span style="color:#deff9a; font-weight:bold;">${caidosList.join(', ')}</span>. ¡A cuidar las vidas que se agotan!`;
    } else {
        htmlNews += `¡Increíble! Una jornada pacífica en la arena OP. Nadie perdió vidas en la ronda anterior. Todos leyeron el juego a la perfección.`;
    }
    htmlNews += `</div>`;

    htmlNews += `<div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 12px;">`;
    
    htmlNews += `<div style="background: rgba(46, 125, 50, 0.1); padding: 10px; border-radius: 8px; border: 1px solid #2e7d32; text-align: center;">`;
    htmlNews += `<span style="font-size: 18px;">👑</span><br><strong style="color: #4CAF50; font-size: 13px;">MVP de la Ronda</strong><br>`;
    if (maxGolesFavor > -1) {
        htmlNews += `<b style="color:white;">${mvpNombre}</b><br><span style="font-size:11px; color:var(--text-muted);">Confiando en ${getFlag(maxGolesFavorEquipo)} ${maxGolesFavorEquipo} (${maxGolesFavor} GF)</span>`;
    } else {
        htmlNews += `<span style="font-size:12px; color:var(--text-muted);">Sin goles guardados</span>`;
    }
    htmlNews += `</div>`;

    htmlNews += `<div style="background: rgba(211, 47, 47, 0.1); padding: 10px; border-radius: 8px; border: 1px solid #d32f2f; text-align: center;">`;
    htmlNews += `<span style="font-size: 18px;">🥶</span><br><strong style="color: #ff5252; font-size: 13px;">Pecho Frío</strong><br>`;
    if (maxGolesContra > -1) {
        htmlNews += `<b style="color:white;">${pechoFrioNombre}</b><br><span style="font-size:11px; color:var(--text-muted);">Sufriendo con ${getFlag(maxGolesContraEquipo)} ${maxGolesContraEquipo} (${maxGolesContra} GC)</span>`;
    } else {
        htmlNews += `<span style="font-size:12px; color:var(--text-muted);">Sin goles guardados</span>`;
    }
    htmlNews += `</div>`;
    
    htmlNews += `</div>`;

    htmlNews += `<div style="background: rgba(255, 255, 255, 0.03); padding: 10px; border-radius: 8px; border-left: 3px solid #ff9800; font-size: 13px;">`;
    htmlNews += `🐑 <strong style="color: #ff9800;">Efecto Oveja:</strong> El equipo más seleccionado por el grupo en la jornada pasada fue <span style="font-weight:bold; color: white;">${getFlag(equipoMasVotado)} ${equipoMasVotado}</span> con un total de <b>${maxVotos} votos</b>. Irse con la mayoría ${totalVidasPerdidas > maxVotos ? 'salió caro esta vez 💀' : 'fue una decisión segura y sabia ✔️'}.`;
    htmlNews += `</div>`;

    content.innerHTML = htmlNews;
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
    if (!appConfig.jornadaAbierta) return; 
    document.querySelectorAll('.team-option').forEach(el => el.classList.remove('selected'));
    const tarjeta = document.getElementById('team-opt-' + nombreEquipo.replace(/\s+/g, '-')); if (tarjeta) tarjeta.classList.add('selected');
    document.getElementById('equipo-seleccionado').value = nombreEquipo; const btn = document.getElementById('btn-confirmar-pick'); btn.disabled = false; btn.innerHTML = `Confirmar a ${nombreEquipo} <img src="assets/jornada.svg" class="svg-icon" style="margin-left:5px; margin-right:0;">`;
};
function lanzarConfeti() { confetti({ particleCount: 150, spread: 80, origin: { y: 0.6 }, colors: ['#2e7d32', '#deff9a', '#ffffff'] }); }
function flashRojo() { document.body.classList.add('flash-red'); setTimeout(() => { document.body.classList.remove('flash-red'); }, 800); }

window.guardarPickPropio = () => {
    if (!currentUser) return mostrarToast("Debes iniciar sesión.", "error");
    if (appConfig.jornadaAbierta === false) return mostrarToast("La jornada está cerrada. No se aceptan picks.", "error"); 
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
    if (j.ganados >= 3) badges += '<img src="assets/francotirador.svg" class="badge-icon svg-icon" title="Francotirador: 3+ Victorias" style="width:16px; margin:0 2px;">';
    if (j.ganados >= 1 && j.gc === 0) badges += '<img src="assets/muralla.svg" class="badge-icon svg-icon" title="La Muralla: 0 Goles en contra" style="width:16px; margin:0 2px;">';
    if (j.vidas === 3 && (j.picks || []).length >= 3) badges += '<img src="assets/intocable.svg" class="badge-icon svg-icon" title="Intocable: Sobrevivió intacto 3 jornadas" style="width:16px; margin:0 2px;">';
    if (j.perdidos >= 2) badges += '<img src="assets/pechofrio.svg" class="badge-icon svg-icon" title="Pecho Frío: 2+ Derrotas" style="width:16px; margin:0 2px;">';
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
    
    if (currentUser && userPanel && interfazSeleccion && interfazEspera) {
        const miJugador = jugadores.find(j => j.id === currentUser.uid);
        if (miJugador) {
            const picksRealizados = (miJugador.picks || []).length;
            if (!miJugador.vivo) {
                headerPanel.style.display = 'none'; interfazSeleccion.style.display = 'none'; interfazEspera.style.display = 'block';
                interfazEspera.innerHTML = `<div style="margin-bottom: 10px;"><img src="assets/muerto.svg" class="svg-icon-large"></div><h3 style="color: var(--danger); margin: 0;">Eliminado</h3><p style="color: var(--text-muted); font-size: 14px; margin-top: 5px;">Has perdido todas tus vidas.</p>`;
                userPanel.style.borderColor = "var(--danger)";
            } else if (picksRealizados >= appConfig.jornadaActual) {
                headerPanel.style.display = 'none'; interfazSeleccion.style.display = 'none'; interfazEspera.style.display = 'block';
                interfazEspera.innerHTML = `<div style="margin-bottom: 10px;"><img src="assets/estrategia.svg" class="svg-icon-large"></div><h3 style="color: var(--accent-color); margin: 0;">¡Estrategia Confirmada!</h3><p style="color: var(--text-muted); font-size: 14px; margin-top: 5px;">Tu pick de <b>${miJugador.picks[miJugador.picks.length-1]}</b> está listo.</p>`;
                userPanel.style.borderColor = "var(--border-color)";
            } else {
                headerPanel.style.display = 'block'; interfazSeleccion.style.display = 'block'; interfazEspera.style.display = 'none';
                userPanel.style.borderColor = "var(--accent-color)";
                
                if (!appConfig.jornadaAbierta) {
                    gridEquipos.innerHTML = '<div style="grid-column: 1 / -1; text-align: center; padding: 20px; background: var(--card-bg); border-radius: 8px; border: 1px solid var(--border-color);"><p style="color: #ff9800; font-weight: bold; margin:0 0 5px 0;">¡Jornada Cerrada! 🔒</p><p style="color: var(--text-muted); font-size: 13px; margin:0;">El administrador ha bloqueado los picks por el momento. Espera instrucciones.</p></div>';
                    const btn = document.getElementById('btn-confirmar-pick'); btn.disabled = true; btn.innerHTML = `Picks Bloqueados 🔒`; document.getElementById('equipo-seleccionado').value = "";
                } else {
                    const clasificados = appConfig.equiposClasificados || equiposMundial;
                    const disp = clasificados.filter(e => { 
                        if (appConfig.fase === 'eliminatoria') return true; 
                        return !(miJugador.picks || []).includes(e); 
                    }).sort((a, b) => a.localeCompare(b, 'es'));
                    
                    gridEquipos.innerHTML = '';
                    disp.forEach(e => { gridEquipos.innerHTML += `<div class="team-option" id="team-opt-${e.replace(/\s+/g, '-')}" onclick="seleccionarEquipo('${e}')"><span class="team-flag">${getFlag(e)}</span><span class="team-name">${e}</span></div>`; });
                    const btn = document.getElementById('btn-confirmar-pick'); btn.disabled = true; btn.innerHTML = `Selecciona un equipo primero <img src="assets/jornada.svg" class="svg-icon" style="margin-left:5px; margin-right:0;">`; document.getElementById('equipo-seleccionado').value = "";
                }
            }
        }
    }
    
    jugadores.sort((a,b) => (b.vivo - a.vivo) || (b.vidas - a.vidas) || (b.ganados - a.ganados) || (b.difGoles - a.difGoles));

    if(jugadores.length >= 3 && podiumContainer && podiumContent) {
        podiumContainer.style.display = 'block';
        const top3 = jugadores.slice(0, 3);
        
        let htmlPodium = '';
        if(top3[1]) htmlPodium += `<div class="podium-spot podium-2"><img src="${top3[1].foto || 'https://via.placeholder.com/50'}"><div class="podium-name">${top3[1].nombre}</div><div class="podium-box">2</div></div>`;
        if(top3[0]) htmlPodium += `<div class="podium-spot podium-1"><img src="${top3[0].foto || 'https://via.placeholder.com/50'}"><div class="podium-name">${top3[0].nombre}</div><div class="podium-box">1</div></div>`;
        if(top3[2]) htmlPodium += `<div class="podium-spot podium-3"><img src="${top3[2].foto || 'https://via.placeholder.com/50'}"><div class="podium-name">${top3[2].nombre}</div><div class="podium-box">3</div></div>`;
        
        podiumContent.innerHTML = htmlPodium;
    }

    if(jugadores.length > 0 && tablaContainer && tablaPosiciones) {
        tablaContainer.style.display = 'block';
        let tablaHTML = `<thead><tr><th>Pos</th><th style="text-align:left;">Jugador</th><th>J</th><th>G</th><th>E</th><th>P</th><th>GF</th><th>GC</th><th>DIF</th><th>Vidas</th></tr></thead><tbody>`;
        jugadores.forEach((j, i) => {
            const pj = (j.picks || []).length; const dif = j.difGoles > 0 ? '+' + j.difGoles : j.difGoles; 
            const vidasHtml = `<div class="vidas-container">` + (j.vivo ? Array(j.vidas).fill('<img src="assets/corazon.svg" class="svg-icon" style="width:16px; margin:0 2px;">').join('') : '<img src="assets/muerto.svg" class="svg-icon" style="width:16px; margin:0 2px;">') + `</div>`;
            const misLogros = generarBadges(j);
            tablaHTML += `<tr style="${!j.vivo ? 'opacity: 0.5;' : ''}"><td><strong>${i + 1}</strong></td><td class="td-jugador"><img src="${j.foto || 'https://via.placeholder.com/30'}"><div><span>${j.nombre}</span><div class="badges-container">${misLogros}</div></div></td><td>${pj}</td><td>${j.ganados}</td><td>${j.empatados || 0}</td><td>${j.perdidos || 0}</td><td>${j.gf||0}</td><td>${j.gc||0}</td><td><strong>${dif}</strong></td><td class="col-vidas">${vidasHtml}</td></tr>`;
        });
        tablaHTML += '</tbody>'; tablaPosiciones.innerHTML = tablaHTML;
    } else if (tablaContainer) { tablaContainer.style.display = 'none'; }

    const cementerio = document.getElementById('cementerio-container');
    if (cementerio) cementerio.innerHTML = '';
    let hayMuertos = false;

    jugadores.forEach((j, i) => {
        const misLogros = generarBadges(j);
        const card = document.createElement('div'); 
        
        if (j.vivo) {
            card.className = `card vivo`;
            card.innerHTML = `
                <div class="card-header">
                    <img src="${j.foto || 'https://via.placeholder.com/50'}" class="avatar-img">
                    <div style="flex-grow: 1;">
                        <h3 style="margin:0;">#${i+1} ${j.nombre}</h3>
                        <span style="font-size: 12px; color: var(--text-muted);"><img src="assets/equipo.svg" class="svg-icon" style="width:12px; margin-right:4px;"> ${j.equipo}</span>
                    </div>
                    <div class="vidas-container">${Array(j.vidas).fill('<img src="assets/corazon.svg" class="svg-icon" style="width:18px;">').join('')}</div>
                </div>
                <div style="margin: 12px 0; padding: 8px; background: var(--input-bg); border-radius: 8px; border: 1px solid var(--border-color); text-align: center;">
                    <span style="font-size: 10px; color: var(--text-muted); text-transform: uppercase; display: block; margin-bottom: 5px; font-weight: bold;"><img src="assets/logros.svg" class="svg-icon" style="width:12px; margin-right: 4px;"> Vitrina de Logros</span>
                    <div class="badges-container" style="justify-content: center; gap: 10px; min-height: 20px;">
                        ${misLogros || '<span style="font-size:11px; color:var(--text-muted);">Aún sin medallas</span>'}
                    </div>
                </div>
                <div class="stats-row">
                    <span>Ganados: <b>${j.ganados}</b></span>
                    <span>Dif. Goles: <b>${j.difGoles > 0 ? '+' : ''}${j.difGoles}</b></span>
                </div>
                <button class="btn-espia btn-interactivo btn-outline" onclick="abrirModalEspia('${j.id}')"><img src="assets/lupa.svg" class="svg-icon" style="width:14px; margin-right:5px;"> Ver Picks (Modo Espía)</button>
            `;
            dashboard.appendChild(card);
        } else {
            hayMuertos = true;
            card.className = `card eliminado`;
            card.style.filter = "grayscale(100%) opacity(0.7)";
            card.style.border = "1px solid var(--border-color)";
            card.style.boxShadow = "none";
            const jornadaMuerte = (j.picks || []).length;
            card.innerHTML = `
                <div class="card-header" style="justify-content: center; flex-direction: column; text-align: center; gap: 5px;">
                    <img src="${j.foto || 'https://via.placeholder.com/50'}" class="avatar-img" style="margin: 0; width: 40px; height: 40px; border: 2px solid var(--border-color);">
                    <h3 style="margin:0; color: var(--text-color); font-size: 16px;">✝️ ${j.nombre}</h3>
                    <span style="font-size: 12px; color: #d32f2f; font-weight: bold;">Caído en la Jornada ${jornadaMuerte}</span>
                </div>
                <button class="btn-espia btn-interactivo btn-outline" style="border-color: var(--border-color); color: var(--text-color); margin-top: 10px;" onclick="abrirModalEspia('${j.id}')"><img src="assets/lupa.svg" class="svg-icon" style="width:14px; margin-right:5px; filter: brightness(0.5);"> Última Voluntad (Ver Picks)</button>
            `;
            if (cementerio) cementerio.appendChild(card);
        }
    });

    if (!hayMuertos && cementerio) {
        cementerio.innerHTML = '<p style="text-align:center; color:var(--text-muted); width:100%; font-size: 14px;">Aún no hay caídos en batalla...</p>';
    }
}

// ==========================================
// CONTROLES DE ADMINISTRADOR (SISTEMA SEGURO)
// ==========================================
// Ponemos todos estrictamente en minúsculas para que no haya fallas
const correosAdmin = ["whoiscasta@gmail.com", "efrafavel7@gmail.com", "enriquepro610@gmail.com"]; 

window.accesoAdmin = () => { 
    const sidebar = document.getElementById('sidebar');
    if (sidebar && sidebar.classList.contains('open')) {
        toggleMenu(); 
    }

    if (!currentUser) {
        return mostrarToast("Debes iniciar sesión primero.", "error");
    }
    
    const miCorreo = currentUser.email ? currentUser.email.toLowerCase() : "";

    if (correosAdmin.includes(miCorreo)) { 
        document.getElementById('admin-panel').style.display = 'block'; 
        mostrarToast("Acceso Concedido, Admin OP", "success"); 
    } else { 
        mostrarToast(`Acceso denegado para: ${miCorreo}`, "error"); 
    } 
};

function cargarSelectsAdmin() {
    const sJugador = document.getElementById('select-jugador'); 
    const sJugadorVidas = document.getElementById('select-jugador-vidas');
    const sEliminar = document.getElementById('select-jugador-eliminar'); 
    
    if (sJugador) sJugador.innerHTML = '<option value="">Selecciona un jugador...</option>';
    if (sJugadorVidas) sJugadorVidas.innerHTML = '<option value="">Selecciona un jugador...</option>';
    if (sEliminar) sEliminar.innerHTML = '<option value="">Selecciona un jugador...</option>';

    jugadores.forEach(j => { 
        const opt = `<option value="${j.id}">${j.nombre}</option>`; 
        if (sJugador) sJugador.innerHTML += opt; 
        if (sJugadorVidas) sJugadorVidas.innerHTML += opt; 
        if (sEliminar) sEliminar.innerHTML += opt; 
    });
    
    const sEquipo = document.getElementById('select-equipo');
    if (sEquipo) {
        sEquipo.innerHTML = '<option value="">Selecciona Equipo...</option>'; 
        equiposMundial.forEach(e => sEquipo.innerHTML += `<option value="${e}">${getFlag(e)} ${e}</option>`);
    }

    const sPartidoActivo = document.getElementById('select-partido-activo');
    if (sPartidoActivo) {
        const jornadaNum = parseInt(appConfig.jornadaActual) || 1; 
        const partidosDeLaJornada = partidosMundial.filter(p => p.j == jornadaNum);
        
        sPartidoActivo.innerHTML = '<option value="">Selecciona un partido de la jornada...</option>';
        
        if (partidosDeLaJornada.length === 0) {
            sPartidoActivo.innerHTML += `<option value="">⚠️ Error: No hay partidos en J${jornadaNum}</option>`;
        } else {
            partidosDeLaJornada.forEach(p => {
                const key = `${p.local}_${p.visitante}`.replace(/\s+/g, '-');
                sPartidoActivo.innerHTML += `<option value="${key}">${getFlag(p.local)} ${p.local} vs ${getFlag(p.visitante)} ${p.visitante} (${p.fecha})</option>`;
            });
        }
    }
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

window.renderizarComunicacionAdmin = () => {
    const chkEstado = document.getElementById('chk-estado-jornada');
    const lblEstado = document.getElementById('lbl-estado-jornada');
    if (chkEstado && lblEstado) {
        chkEstado.checked = appConfig.jornadaAbierta;
        lblEstado.textContent = appConfig.jornadaAbierta ? "Abierta (Picks permitidos) 🟢" : "Cerrada (Picks bloqueados) 🔴";
    }
    const inputAviso = document.getElementById('admin-aviso-input');
    if (inputAviso && document.activeElement !== inputAviso) { 
        inputAviso.value = appConfig.mensajeAviso || "";
    }
};

window.toggleEstadoJornada = () => {
    const chk = document.getElementById('chk-estado-jornada');
    set(ref(db, 'survivor/config/jornadaAbierta'), chk.checked);
    mostrarToast(chk.checked ? "Jornada Abierta a todos." : "Jornada Cerrada.", chk.checked ? "success" : "warning");
};

window.guardarAviso = () => {
    const texto = document.getElementById('admin-aviso-input').value;
    set(ref(db, 'survivor/config/mensajeAviso'), texto);
    mostrarToast("Aviso actualizado.", "success");
};

let filtroFijo = false; 
window.renderizarFiltroEquiposAdmin = () => {
    const container = document.getElementById('admin-equipos-filtro');
    if(!container) return;
    if (filtroFijo) return; 
    
    let htmlFiltro = '';
    const clasificados = appConfig.equiposClasificados || equiposMundial;
    
    equiposMundial.forEach(equipo => {
        const isChecked = clasificados.includes(equipo) ? 'checked' : '';
        htmlFiltro += `
            <div class="equipo-toggle-item">
                <span style="font-size: 13px; color: white; display: flex; align-items: center; gap: 5px;">
                    ${getFlag(equipo)} <span style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 90px;" title="${equipo}">${equipo}</span>
                </span>
                <label class="switch">
                    <input type="checkbox" value="${equipo}" class="chk-equipo-admin" ${isChecked}>
                    <span class="slider"></span>
                </label>
            </div>
        `;
    });
    container.innerHTML = htmlFiltro;
    filtroFijo = true; 
};

window.guardarEquiposClasificados = () => {
    const checkboxes = document.querySelectorAll('.chk-equipo-admin');
    let seleccionados = [];
    checkboxes.forEach(chk => {
        if(chk.checked) seleccionados.push(chk.value);
    });
    set(ref(db, 'survivor/config/equiposClasificados'), seleccionados);
    mostrarToast("Equipos clasificados actualizados.", "success");
    filtroFijo = false; 
};

window.cambiarJornada = (suma) => { let nuevaJornada = appConfig.jornadaActual + suma; if (nuevaJornada < 1) nuevaJornada = 1; if (nuevaJornada > 8) nuevaJornada = 8; set(ref(db, 'survivor/config/jornadaActual'), nuevaJornada); mostrarToast(`Jornada cambiada a ${nuevaJornada}`, "success"); };
window.cambiarFase = (fase) => { set(ref(db, 'survivor/config/fase'), fase); mostrarToast(`Fase actualizada.`, "success"); };
window.agregarJugadorManual = () => { const nombre = document.getElementById('nuevo-jugador-nombre').value; if (!nombre) return mostrarToast("Ingresa un nombre.", "error"); const id = "manual_" + Date.now(); set(ref(db, `survivor/jugadores/${id}`), { id, nombre, equipo: "Invitado", foto: "https://via.placeholder.com/50", vivo: true, vidas: 3, ganados: 0, empatados: 0, perdidos: 0, gf: 0, gc: 0, difGoles: 0, picks: [] }); document.getElementById('nuevo-jugador-nombre').value = ''; mostrarToast("Usuario manual creado.", "success"); };
window.eliminarUsuario = () => { const id = document.getElementById('select-jugador-eliminar').value; if(!id) return mostrarToast("Selecciona usuario.", "error"); if(confirm("¿Eliminar usuario?")) { remove(ref(db, `survivor/jugadores/${id}`)); mostrarToast("Usuario eliminado.", "warning"); } };

window.agregarVida = () => {
    const id = document.getElementById('select-jugador-vidas').value;
    if (!id) return mostrarToast("Selecciona un jugador primero.", "error");
    const j = jugadores.find(j => j.id === id);
    j.vidas = (j.vidas || 0) + 1;
    if (j.vidas > 0 && !j.vivo) { j.vivo = true; }
    set(ref(db, `survivor/jugadores/${id}`), j);
    mostrarToast(`¡Vida añadida! ${j.nombre} ahora tiene ${j.vidas} vidas.`, "success");
    lanzarConfeti(); 
};

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

window.reiniciarLiga = () => { 
    if(confirm("🚨 ¿Seguro que quieres reiniciar la temporada completa?")) { 
        jugadores.forEach(j => { set(ref(db, `survivor/jugadores/${j.id}`), {...j, vivo:true, vidas:3, ganados:0, empatados:0, perdidos:0, gf:0, gc:0, difGoles:0, picks:[]}); }); 
        set(ref(db, 'survivor/config'), {jornadaActual: 1, fase: 'grupos', equiposClasificados: equiposMundial, jornadaAbierta: true, mensajeAviso: ""}); 
        remove(ref(db, 'survivor/chat')); 
        remove(ref(db, 'survivor/marcadores')); 
        filtroFijo = false; 
        mostrarToast("Liga reiniciada.", "warning");
    }
};

window.guardarMarcadorVivo = () => {
    const key = document.getElementById('select-partido-activo').value;
    const golL = document.getElementById('goles-local-vivo').value;
    const golV = document.getElementById('goles-visitante-vivo').value;
    const estado = document.getElementById('estado-partido-vivo').value; 
    
    if (!key) return mostrarToast("Selecciona un partido primero.", "error");
    if (golL === "" || golV === "") return mostrarToast("Ingresa los goles de ambos equipos.", "error");
    
    set(ref(db, `survivor/marcadores/${key}`), {
        golesLocal: parseInt(golL),
        golesVisitante: parseInt(golV),
        estado: estado 
    }).then(() => {
        mostrarToast("Marcador y estado actualizados en vivo.", "success");
        document.getElementById('goles-local-vivo').value = '';
        document.getElementById('goles-visitante-vivo').value = '';
        document.getElementById('estado-partido-vivo').value = 'auto'; 
    });
};

// ==========================================
// FUNCIONES DE INTERFAZ: PICK RÁPIDO Y ESCAPE
// ==========================================
window.abrirModalPickRapido = (local, visitante) => {
    if (!currentUser) return mostrarToast("Debes iniciar sesión para elegir.", "error");
    const j = jugadores.find(jug => jug.id === currentUser.uid);
    if (j && !j.vivo) return mostrarToast("Estás eliminado de la arena.", "error");

    document.getElementById('modal-pick-rapido').style.display = 'block';
    
    const btnLocal = document.getElementById('btn-pick-local');
    const btnVisit = document.getElementById('btn-pick-visitante');
    
    btnLocal.innerHTML = `${getFlag(local)} ${local}`;
    btnLocal.onclick = () => procesarPickRapido(local);
    
    btnVisit.innerHTML = `${getFlag(visitante)} ${visitante}`;
    btnVisit.onclick = () => procesarPickRapido(visitante);
};

window.cerrarModalPickRapido = () => {
    document.getElementById('modal-pick-rapido').style.display = 'none';
};

window.procesarPickRapido = (equipo) => {
    seleccionarEquipo(equipo); 
    guardarPickPropio();       
    cerrarModalPickRapido();
    cerrarModalCalendario();   
};

document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
        if (typeof cerrarModalPerfil === 'function') cerrarModalPerfil();
        if (typeof cerrarModalReglas === 'function') cerrarModalReglas();
        if (typeof cerrarModalCalendario === 'function') cerrarModalCalendario();
        if (typeof cerrarModalEspia === 'function') cerrarModalEspia();
        if (typeof cerrarModalPickRapido === 'function') cerrarModalPickRapido();
        
        const adminPanel = document.getElementById('admin-panel');
        if (adminPanel) adminPanel.style.display = 'none';
        
        const sidebar = document.getElementById('sidebar');
        if (sidebar && sidebar.classList.contains('open')) toggleMenu();
    }
});

window.cerrarModalesConClick = () => {
    if (typeof cerrarModalPerfil === 'function') cerrarModalPerfil();
    if (typeof cerrarModalReglas === 'function') cerrarModalReglas();
    if (typeof cerrarModalCalendario === 'function') cerrarModalCalendario();
    if (typeof cerrarModalEspia === 'function') cerrarModalEspia();
    if (typeof cerrarModalPickRapido === 'function') cerrarModalPickRapido();
};

// ==========================================
// CARTELERA INFORMATIVA E HÍBRIDA DEL DÍA
// ==========================================
window.cargarResultadosEnVivo = async () => {
    const list = document.getElementById('live-scores-list');
    if (!list) return;
    
    const meses = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
    const fechaHoy = new Date();
    const textoHoy = `${fechaHoy.getDate()} de ${meses[fechaHoy.getMonth()]}`;
    const partidosDeHoy = partidosMundial.filter(p => p.fecha === textoHoy);

    list.innerHTML = ''; 

    if(partidosDeHoy.length > 0) {
        partidosDeHoy.forEach(p => {
            const key = `${p.local}_${p.visitante}`.replace(/\s+/g, '-');
            const marcadorGuardado = marcadoresEnVivo[key];
            
            const horaPartido = parseInt(p.hora.split(':')[0]);
            const horaActual = fechaHoy.getHours();
            
            let statusLabel = '';
            let defaultGoles = '-';
            
            let estadoManual = marcadorGuardado ? marcadorGuardado.estado : 'auto';
            if (!estadoManual) estadoManual = 'auto';

            if (estadoManual === 'vivo') {
                statusLabel = `<span style="color:#deff9a; font-weight:bold;"><img src="assets/live.svg" class="svg-icon" style="width:14px; margin-right:4px;"> En Juego</span>`;
                defaultGoles = '0';
            } else if (estadoManual === 'finalizado') {
                statusLabel = `<span style="color:var(--text-muted);">Finalizado</span>`;
                defaultGoles = '0';
            } else {
                if (horaActual < horaPartido) {
                    statusLabel = `<span style="color:#ff9800;">⏱️ Hoy a las ${p.hora}</span>`;
                    defaultGoles = '-'; 
                } else if (horaActual === horaPartido || horaActual === horaPartido + 1) {
                    statusLabel = `<span style="color:#deff9a; font-weight:bold;"><img src="assets/live.svg" class="svg-icon" style="width:14px; margin-right:4px;"> En Juego</span>`;
                    defaultGoles = '0'; 
                } else {
                    statusLabel = `<span style="color:var(--text-muted);">Finalizado</span>`;
                    defaultGoles = '0'; 
                }
            }
            
            const golesLocal = (marcadorGuardado && marcadorGuardado.golesLocal !== undefined) ? marcadorGuardado.golesLocal : defaultGoles;
            const golesVisitante = (marcadorGuardado && marcadorGuardado.golesVisitante !== undefined) ? marcadorGuardado.golesVisitante : defaultGoles;

            list.innerHTML += `
                <div class="live-match" style="border: 1px solid var(--border-color); background: var(--input-bg); padding: 12px; margin-bottom: 12px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.2);">
                    <div class="live-status" style="margin-bottom: 8px; border-bottom: 1px dashed var(--border-color); padding-bottom: 6px; font-size: 12px;">${statusLabel}</div>
                    <div class="live-teams" style="display:flex; justify-content:space-between; align-items: center; font-size: 15px; font-weight: bold;">
                        <span style="flex: 1; text-align: right; padding-right: 12px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${p.local} ${getFlag(p.local)}</span>
                        <span style="background: #111; padding: 4px 14px; border-radius: 4px; border: 1px solid var(--border-color); font-size: 16px; color: var(--accent-color); font-family: monospace; letter-spacing: 2px;">
                            ${golesLocal}:${golesVisitante}
                        </span>
                        <span style="flex: 1; text-align: left; padding-left: 12px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${getFlag(p.visitante)} ${p.visitante}</span>
                    </div>
                </div>
            `;
        });
    } else {
        list.innerHTML = `<p style="text-align:center; font-size:14px; color:var(--text-muted);">Hoy (${textoHoy}) hay descanso en la arena. Aprovechen para planear estrategias.</p>`;
    }
};