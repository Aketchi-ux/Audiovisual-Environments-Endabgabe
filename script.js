// ===== HAUPTMODUL: Koordination und Interaktion =====

// ===== STATISTIKEN AKTUALISIEREN: zeigt Anzahl aktiver Partikel =====
function updateStats() {
    // Finde HTML-Element für Partikelzähler
    const particleCount = document.getElementById('particle-count');
    
    // Wenn Element existiert
    if (particleCount) {
        // Setze Text-Inhalt auf aktuelle Array-Länge (wieviele Partikel?)
        particleCount.textContent = particles.length;
    }
}

// ===== MAUS-KLICK EVENT: Haupt-Interaktion =====
document.addEventListener('click', function(event) {
    // Prüfe ob Klick auf rechtem Control-Panel war
    if (event.target.closest('#right-panel')) {
        // Wenn ja: ignoriere Klick (nicht auf Canvas auslösen)
        return;
    }

    // Beim ersten Klick: initialisiere Audio
    if (!isAudioInitialized) {
        // Rufe Audio-Initialisierung auf (aus audio.js)
        initAudio();
    }

    // Spiele Feuerwerk-Sound ab (aus audio.js)
    playFireworkSound();

    // Erstelle 3D Feuerwerk (aus three-scene.js)
    // Übergebe Maus-Koordinaten
    createFireworks(event.clientX, event.clientY);
});

// ===== FARB-TOGGLE BUTTON: "Alle An/Aus" Funktionalität =====
document.addEventListener('DOMContentLoaded', function() {
    // Warte bis HTML geladen, dann finde Button
    const toggleBtn = document.getElementById('toggle-all-btn');
    // Wenn Button existiert
    if (toggleBtn) {
        // Registriere Click-Listener
        toggleBtn.addEventListener('click', function(e) {
            // Verhindere, dass Event zum Canvas propagiert
            e.stopPropagation();
            // Rufe Toggle-Funktion auf (aus color-picker.js)
            toggleAllColors();
        });
    }
});

// ===== INITIALISIERUNG: wird bei Seiten-Laden aufgerufen =====
// Initialisiere 3D-Szene (aus three-scene.js)
initThreeScene();
// Initialisiere Farbwähler (aus color-picker.js)
initColorPicker();
// Aktualisiere Statistiken alle 100ms (0.1 Sekunden)
setInterval(updateStats, 100);