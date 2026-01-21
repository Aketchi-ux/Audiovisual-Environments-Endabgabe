// ===== FARB-MODUL: Farbverwaltung und Farbwähler =====

// Array mit allen verfügbaren Farben (Hexadezimal zu Dezimal konvertiert)
let selectedColors = [
    0xFF0000, // Rot
    0x00FF00, // Grün
    0x0000FF, // Blau
    0xFFFF00, // Gelb
    0xFF00FF, // Magenta
    0x00FFFF, // Cyan
    0xFFA500, // Orange
    0xFF1493  // Pink/Violett
];

// Zufällige Farbe aus den ausgewählten Farben auswählen
function getRandomColor() {
    // Berechne zufälligen Index (0 bis Arraygrößße-1)
    const randomIndex = Math.floor(Math.random() * selectedColors.length);
    // Gebe die Farbe an diesem Index zurück
    return selectedColors[randomIndex];
}

// Alle aktiven Farben als Hex-Strings zurückgeben
function getActiveColors() {
    // Finde alle aktiven Farb-Buttons
    const activeBtns = document.querySelectorAll('.color-btn.active');
    
    // Wenn keine Farben aktiv, gib leeres Array zurück
    if (activeBtns.length === 0) {
        return [];
    }
    
    // Konvertiere alle aktiven Buttons zu Hex-Strings
    return Array.from(activeBtns).map(btn => btn.dataset.hex);
}

// Color-Palette initialisieren - erstelle HTML-Buttons für jede Farbe
function initColorPicker() {
    // Finde das HTML-Container-Element für die Farb-Buttons
    const colorContainer = document.getElementById('color-palette');
    // Wenn Container nicht existiert, breche ab
    if (!colorContainer) return;

    // Array mit allen Farben und ihren Namen
    const defaultColors = [
        { hex: '#FF0000', name: 'Rot' },
        { hex: '#00FF00', name: 'Grün' },
        { hex: '#0000FF', name: 'Blau' },
        { hex: '#FFFF00', name: 'Gelb' },
        { hex: '#FF00FF', name: 'Magenta' },
        { hex: '#00FFFF', name: 'Cyan' },
        { hex: '#FFA500', name: 'Orange' },
        { hex: '#FF1493', name: 'Pink' }
    ];

    // Iteriere durch jede Farbe und erstelle einen Button
    defaultColors.forEach((color, index) => {
        // Erstelle neues Button-Element
        const colorBtn = document.createElement('button');
        // Setze CSS-Klasse für Styling
        colorBtn.className = 'color-btn active'; // 'active' = standardmäßig ausgewählt
        // Setze Background-Farbe des Buttons
        colorBtn.style.backgroundColor = color.hex;
        // Setze Tooltip (angezeigt bei Mausüberfahrt)
        colorBtn.title = color.name;
        // Speichere Index als Datenattribut
        colorBtn.dataset.index = index;
        // Speichere Hex-Farbe als Datenattribut
        colorBtn.dataset.hex = color.hex;
        
        // Registriere Click-Event-Listener
        colorBtn.addEventListener('click', function(e) {
            // Verhindere, dass Event nach oben propagiert (zu Canvas)
            e.stopPropagation();
            // Rufe Toggle-Funktion auf
            toggleColor(this);
        });

        // Füge Button zum Container hinzu
        colorContainer.appendChild(colorBtn);
    });
}

// Farbe an/ausschalten (Toggle) - wird bei Button-Click aufgerufen
function toggleColor(btn) {
    // Füge 'active' Klasse hinzu oder entferne sie
    btn.classList.toggle('active');
    // Aktualisiere die ausgewählten Farben
    updateSelectedColors();
}

// Ausgewählte Farben aktualisieren - lese alle aktiven Buttons aus
function updateSelectedColors() {
    // Leere das Array
    selectedColors = [];
    
    // Finde alle Buttons mit 'active' Klasse
    document.querySelectorAll('.color-btn.active').forEach(btn => {
        // Hole Hex-Wert aus Datenattribut
        const hex = btn.dataset.hex;
        // Konvertiere Hex zu RGB-Objekt
        const rgb = hexToRgb(hex);
        // Konvertiere RGB zu Dezimalzahl: (R << 16) = R-Wert * 65536, etc.
        const color = (rgb.r << 16) | (rgb.g << 8) | rgb.b;
        // Füge konvertierte Farbe zum Array hinzu
        selectedColors.push(color);
    });

    // Fallback: Wenn keine Farbe ausgewählt, verwende Weiß
    if (selectedColors.length === 0) {
        // Weiß = (255, 255, 255) = 0xFFFFFF
        selectedColors.push(0xFFFFFF);
    }
}

// Konvertiere Hex-String zu RGB-Objekt
function hexToRgb(hex) {
    // Regular Expression: Extrahiere 3x zwei Hex-Ziffern
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    // Wenn Match erfolgreich, konvertiere zu Dezimal
    return result ? {
        r: parseInt(result[1], 16), // Erste 2 Ziffern = Rot
        g: parseInt(result[2], 16), // Mittlere 2 Ziffern = Grün
        b: parseInt(result[3], 16)  // Letzte 2 Ziffern = Blau
    } : { r: 255, g: 0, b: 0 }; // Fallback: Rot bei Fehler
}

// Alle Farben aktivieren/deaktivieren (Toggle All)
function toggleAllColors() {
    // Zähle Buttons die NICHT aktiv sind
    const allActive = document.querySelectorAll('.color-btn:not(.active)').length === 0;
    
    // Iteriere durch alle Buttons
    document.querySelectorAll('.color-btn').forEach(btn => {
        // Wenn alle aktiv: deaktiviere alle
        if (allActive) {
            btn.classList.remove('active');
        } else {
            // Wenn nicht alle aktiv: aktiviere alle
            btn.classList.add('active');
        }
    });

    // Aktualisiere ausgewählte Farben
    updateSelectedColors();
}
