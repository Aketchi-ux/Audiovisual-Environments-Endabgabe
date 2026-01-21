// ===== 2D CANVAS-SZENE: Feuerwerk-Visualisierung =====

// Globale 2D-Variablen
let canvas; // Das 2D-Canvas-Element
let ctx; // 2D-Kontext für Canvas-Zeichnungen
let particles = []; // Array mit allen aktiven Partikeln
let animationFrameId; // ID für requestAnimationFrame

// Canvas initialisieren - wird beim Start aufgerufen
function initScene() {
    // Finde Canvas-Container
    const container = document.getElementById('canvas-container');
    
    // Erstelle Canvas-Element
    canvas = document.createElement('canvas');
    // Setze Canvas-Größe (voller Bildschirm)
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    
    // Hole 2D-Kontext
    ctx = canvas.getContext('2d');
    
    // Hänge Canvas in Container ein
    container.appendChild(canvas);
    
    // Starte Animations-Loop
    startAnimationLoop();
    
    // Höre auf Fenster-Größenänderung
    window.addEventListener('resize', function() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    });
}

// ===== PARTIKEL-KLASSE: Ein einzelnes Feuerwerk-Partikel in 2D =====
class Particle {
    constructor(x, y, color) {
        // Setze Start-Position (2D)
        this.x = x;
        this.y = y;
        
        // ===== KREISFÖRMIGE VERTEILUNG: Feuerwerk-Ausbreitung =====
        // Zufälliger Winkel (0-360°)
        const angle = Math.random() * Math.PI * 2;
        // Zufällige Geschwindigkeit (2-5 Einheiten pro Frame)
        const speed = Math.random() * 3 + 2;
        
        // Berechne Velocity basierend auf Winkel und Geschwindigkeit
        this.vx = Math.cos(angle) * speed; // X-Geschwindigkeit
        this.vy = Math.sin(angle) * speed; // Y-Geschwindigkeit
        
        // ===== PHYSIK-PARAMETER =====
        // Luftwiderstand (bremst Bewegung ab)
        this.damping = 0.98; // 2% Geschwindigkeit pro Frame verloren
        // Lebenszeit (0 = tot, 1 = neu)
        this.life = 1;
        // Maximale Lebensdauer in Frames
        this.maxLife = Math.random() * 60 + 40; // 40-100 Frames
        this.age = 0;
        
        // ===== FARBE UND GRÖSSE =====
        this.color = color; // Die Farbe aus color-picker.js
        this.radius = 4; // Partikel-Größe
    }
    
    // Update: wird jeden Frame aufgerufeng
    update() {
        // Erhöhe Alter
        this.age++;
        
        // Berechne Lebenszeit (0 = alt, 1 = neu)
        this.life = 1 - (this.age / this.maxLife);
        
        // Wenn Partikel tot: abbrechen
        if (this.life <= 0) {
            return false; // Signalisiert: Partikel kann gelöscht werden
        }
        
        // ===== PHYSIK ANWENDEN =====
        // Luftwiderstand anwenden
        this.vx *= this.damping;
        this.vy *= this.damping;
        
        // Position aktualisieren
        this.x += this.vx;
        this.y += this.vy;
        
        return true; // Partikel ist noch am Leben
    }
    
    // Draw: rendert Partikel auf Canvas
    draw(ctx) {
        // Berechne Transparenz basierend auf Lebenszeit
        const alpha = this.life * 255;
        
        // Konvertiere Farbe (hex) zu RGB und setze Alpha
        const rgbColor = this.hexToRgba(this.color, this.life);
        
        // Zeichne Kreis
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = rgbColor;
        ctx.fill();
        
        // Optionaler Glow-Effekt
        ctx.strokeStyle = rgbColor;
        ctx.lineWidth = 1;
        ctx.stroke();
    }
    
    // Hilfsfunktion: konvertiere Hex-Farbe zu RGBA
    hexToRgba(hex, alpha) {
        // Entferne '#' Zeichen falls vorhanden
        hex = hex.replace('#', '');
        
        // Konvertiere hex zu RGB
        const r = parseInt(hex.substring(0, 2), 16);
        const g = parseInt(hex.substring(2, 4), 16);
        const b = parseInt(hex.substring(4, 6), 16);
        
        // Rückgabe als RGBA-String
        return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    }
}

// ===== FEUERWERK ERSTELLEN: wird bei Maus-Klick aufgerufen =====
function createFireworks(mouseX, mouseY) {
    console.log('createFireworks aufgerufen mit:', mouseX, mouseY);
    
    // Finde aktive Farben aus color-picker.js
    const activeColors = getActiveColors();
    console.log('Aktive Farben:', activeColors);
    
    // Wenn keine Farben aktiv: verwende Standard-Farbe
    if (activeColors.length === 0) {
        activeColors.push('#ffffff'); // Weiß als Fallback
    }
    
    // Zufällige Anzahl Partikel (10 bis 100)
    const particleCount = Math.floor(Math.random() * 91) + 10;
    
    // Erstelle mehrere Partikel
    for (let i = 0; i < particleCount; i++) {
        // Wähle zufällige aktive Farbe
        const color = activeColors[Math.floor(Math.random() * activeColors.length)];
        
        // Erstelle Partikel an Maus-Position
        const particle = new Particle(mouseX, mouseY, color);
        
        // Füge zu Partikel-Array hinzu
        particles.push(particle);
    }
    
    console.log('Partikel erstellt. Gesamt:', particles.length);
}

// ===== ANIMATIONS-LOOP: wird kontinuierlich aufgerufen =====
function startAnimationLoop() {
    function animate() {
        // ===== CANVAS LÖSCHEN (schwarzer Hintergrund) =====
        ctx.fillStyle = 'rgba(0, 0, 0, 1)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // ===== PARTIKEL AKTUALISIEREN UND ZEICHNEN =====
        // Durchlaufe alle Partikel
        for (let i = particles.length - 1; i >= 0; i--) {
            const particle = particles[i];
            
            // Update Partikel
            const isAlive = particle.update();
            
            // Wenn tot: entferne aus Array
            if (!isAlive) {
                particles.splice(i, 1);
                continue;
            }
            
            // Zeichne Partikel
            particle.draw(ctx);
        }
        
        // Aktualisiere Statistiken
        updateStats();
        
        // Nächster Frame
        animationFrameId = requestAnimationFrame(animate);
    }
    
    // Starte erste Animation
    animate();
}

// Cleanup wenn Seite ungeladen wird
window.addEventListener('beforeunload', function() {
    if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
    }
});

