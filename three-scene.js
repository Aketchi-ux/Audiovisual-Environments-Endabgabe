// ===== THREE.JS 3D-SZENE: Feuerwerk-Visualisierung =====

// Globale 3D-Variablen
let scene; // Die 3D-Szene (Container für alle 3D-Objekte)
let camera; // Die virtuelle Kamera (wie wir die Szene sehen)
let renderer; // WebGL-Renderer (zeichnet die Szene auf den Screen)
let particles = []; // Array mit allen aktiven Partikeln

// Scene initialisieren - wird beim Start aufgerufen
function initScene() {
    // ===== SZENE ERSTELLEN =====
    // Erstelle neue 3D-Szene
    scene = new THREE.Scene();
    // Setze schwarzen Hintergrund
    scene.background = new THREE.Color(0x000000);
    // Erstelle Nebel für Tiefenwirkung (Farbe, Start-Abstand, End-Abstand)
    scene.fog = new THREE.Fog(0x000000, 100, 500);

    // ===== KAMERA ERSTELLEN =====
    // Perspektiv-Kamera (75° Sichtwinkel, Bildschirmverhältnis, Near-Clipping, Far-Clipping)
    camera = new THREE.PerspectiveCamera(
        75, // Vertikales Sichtfeld in Grad
        window.innerWidth / window.innerHeight, // Bildschirmverhältnis
        0.1, // Near plane (alles näher wird nicht gezeichnet)
        1000 // Far plane (alles weiter weg wird nicht gezeichnet)
    );
    // Positioniere Kamera 100 Einheiten nach hinten
    camera.position.z = 100;

    // ===== RENDERER ERSTELLEN =====
    // Erstelle WebGL-Renderer (GPU-gestützt)
    renderer = new THREE.WebGLRenderer({ antialias: true }); // antialias = glatte Kanten
    // Setze Renderer-Größe (voller Bildschirm)
    renderer.setSize(window.innerWidth, window.innerHeight);
    // Setze Pixel-Ratio für hochauflösende Displays (Retina)
    renderer.setPixelRatio(window.devicePixelRatio);
    // Aktiviere Schattenberechnung
    renderer.shadowMap.enabled = true;
    // Hänge Renderer-Canvas in HTML-Container ein
    document.getElementById('canvas-container').appendChild(renderer.domElement);

    // ===== LICHTER HINZUFÜGEN =====
    // Erstelle Umgebungslicht (beleuchtet alles gleichmäßig von überall)
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6); // Weiß, 60% Intensität
    scene.add(ambientLight);

    // Erstelle Punktlicht (wie eine Glühbirne)
    const pointLight = new THREE.PointLight(0xffffff, 0.4); // Weiß, 40% Intensität
    // Positioniere Licht (50, 50, 50)
    pointLight.position.set(50, 50, 50);
    // Füge Licht zur Szene hinzu
    scene.add(pointLight);
}

// ===== PARTIKEL-KLASSE: Ein einzelnes Feuerwerk-Partikel =====
class Particle {
    // Konstruktor: wird aufgerufen wenn neues Partikel erstellt wird
    constructor(x, y, z, color) {
        // Setze Start-Position (3D-Punkt)
        this.position = new THREE.Vector3(x, y, z);
        
        // ===== SPHÄRISCHE VERTEILUNG: echte Feuerwerk-Ausbreitung =====
        // Zufällige Winkel in sphärischen Koordinaten
        const theta = Math.random() * Math.PI * 2; // Horizontale Rotation (0-360°)
        const phi = Math.acos(Math.random() * 2 - 1); // Vertikale Verbreitung (0-180°)
        const speed = Math.random() * 3 + 2; // Geschwindigkeit: 2-5 Einheiten pro Frame
        
        // Konvertiere Sphärenkoordinaten zu 3D-Vektor (Cartesisch)
        this.velocity = new THREE.Vector3(
            Math.sin(phi) * Math.cos(theta) * speed, // X-Komponente
            Math.sin(phi) * Math.sin(theta) * speed, // Y-Komponente
            Math.cos(phi) * speed // Z-Komponente
        );

        // ===== PHYSIK-PARAMETER =====
        // Schwerkraft (zieht Partikel nach unten)
        this.acceleration = new THREE.Vector3(0, -0.08, 0); // 0.08 Einheiten nach unten
        // Luftwiderstand (bremst Bewegung ab)
        this.damping = 0.98; // 2% Geschwindigkeit pro Frame verloren
        // Lebenszeit (0 = tot, 1 = neu)
        this.life = 1;
        // Maximale Lebensdauer in Sekunden
        this.maxLife = Math.random() * 1.5 + 0.8; // 0.8-2.3 Sekunden

        // ===== 3D-GEOMETRIE ERSTELLEN =====
        // Erstelle Kugel-Geometrie (Radius, horizontale Segmente, vertikale Segmente)
        const geometry = new THREE.SphereGeometry(0.6, 8, 8);
        // Erstelle Material mit Glow-Effekt
        const material = new THREE.MeshStandardMaterial({
            color: color, // Die Farbe aus color-picker.js
            emissive: color, // Eigenleuchte (Glow!)
            emissiveIntensity: 1.0, // 100% Glow
            metalness: 0.3, // Leicht metallisch
            roughness: 0.4 // Etwas raue Oberfläche
        });
        // Kombiniere Geometrie + Material zu Mesh
        this.mesh = new THREE.Mesh(geometry, material);
        // Setze Position
        this.mesh.position.copy(this.position);
        // Aktiviere Schattenberechnung
        this.mesh.castShadow = true;
        this.mesh.receiveShadow = true;

        // Füge Mesh zur Szene hinzu
        scene.add(this.mesh);
    }

    // Update: wird jeden Frame aufgerufen für Bewegung
    update() {
        // ===== PHYSIK-SIMULATION =====
        // Addiere Beschleunigung (Schwerkraft) zur Geschwindigkeit
        this.velocity.add(this.acceleration);
        // Multipliziere Geschwindigkeit mit Damping (Luftwiderstand)
        this.velocity.multiplyScalar(this.damping);
        // Addiere Geschwindigkeit zur Position (neue Position)
        this.position.add(this.velocity);
        // Kopiere neue Position zum 3D-Mesh
        this.mesh.position.copy(this.position);

        // ===== LEBENSZEIT ABNEHMEND =====
        // Berechne: 1 Frame von maxLife (bei 60 FPS = 1/60ter der Lebensdauer)
        this.life -= 1 / (this.maxLife * 60); // 60 FPS
        // Berechne Transparenz (0 = unsichtbar, 1 = sichtbar)
        const opacity = Math.max(0, this.life);
        // Setze Material-Transparenz
        this.mesh.material.opacity = opacity;
        
        // ===== GRÖSSE NIMMT AB =====
        // Berechne Skalierungsfaktor (minimal 0.3, maximal Lebenszeit)
        const scale = Math.max(0.3, opacity);
        // Setze Größe (X, Y, Z)
        this.mesh.scale.set(scale, scale, scale);

        // ===== ROTATION HINZUFÜGEN =====
        // Rotiere um X-Achse (0.05 Radiant pro Frame)
        this.mesh.rotation.x += 0.05;
        // Rotiere um Y-Achse (für Dynamik)
        this.mesh.rotation.y += 0.05;

        // Gebe true zurück wenn noch lebendig, false wenn tot
        return this.life > 0;
    }

    // Destroy: Partikel entfernen und Speicher freigeben
    destroy() {
        // Entferne Mesh aus Szene
        scene.remove(this.mesh);
        // Gebe Geometrie-Speicher frei
        this.mesh.geometry.dispose();
        // Gebe Material-Speicher frei
        this.mesh.material.dispose();
    }
}

// ===== FEUERWERK ERSTELLEN: Konvertiert 2D-Maus-Koordinaten zu 3D-Position =====
function createFireworks(x, y) {
    // ===== RAYCASTING: 2D-Maus zu 3D-Raum =====
    // Erstelle 2D-Vektor aus Maus-Koordinaten (-1 bis +1)
    const mouse = new THREE.Vector2();
    // Normalisiere X (0-screenWidth -> -1 bis +1)
    mouse.x = (x / window.innerWidth) * 2 - 1;
    // Normalisiere Y (0-screenHeight -> -1 bis +1, invertiert weil Y oben anfängt)
    mouse.y = -(y / window.innerHeight) * 2 + 1;

    // Erstelle Raycaster (Strahl vom Kamera-Punkt)
    const raycaster = new THREE.Raycaster();
    // Setze Strahl von Kamera durch Maus-Position
    raycaster.setFromCamera(mouse, camera);

    // ===== 3D-POSITION BERECHNEN =====
    // Zufällige Tiefe (50 Einheiten voraus, -25 bis +25 Variation)
    const zPos = Math.random() * 50 - 25;
    // Erstelle leeren 3D-Vektor
    const worldPos = new THREE.Vector3();
    // Berechne Punkt auf Strahl (50 Einheiten von Kamera)
    raycaster.ray.at(50, worldPos);
    // Überschreibe Z mit zufälliger Tiefe
    worldPos.z = zPos;

    // ===== PARTIKEL GENERIEREN =====
    // Erstelle 150 Partikel für großes Feuerwerk
    const particleCount = 150;
    for (let i = 0; i < particleCount; i++) {
        // Hole zufällige Farbe aus color-picker.js
        const color = getRandomColor();
        // Erstelle neues Partikel-Objekt
        const particle = new Particle(worldPos.x, worldPos.y, worldPos.z, color);
        // Füge zu Array hinzu
        particles.push(particle);
    }
}

// ===== ANIMATIONS-LOOP: wird 60x pro Sekunde aufgerufen =====
function animateScene() {
    // Rufe diese Funktion wieder auf beim nächsten Frame
    requestAnimationFrame(animateScene);

    // ===== PARTIKEL UPDATEN =====
    // Iteriere rückwärts durch Array (wichtig zum Löschen während Iteration)
    for (let i = particles.length - 1; i >= 0; i--) {
        // Rufe update() auf - gibt false zurück wenn tot
        if (!particles[i].update()) {
            // Wenn tot: zerstöre Mesh und speichere
            particles[i].destroy();
            // Entferne aus Array
            particles.splice(i, 1);
        }
    }

    // ===== SZENE LEICHT ROTIEREN (für Dynamik) =====
    // Rotiere Szene um X-Achse (sehr langsam)
    scene.rotation.x += 0.0002;
    // Rotiere Szene um Y-Achse (etwas schneller)
    scene.rotation.y += 0.0003;

    // ===== RENDERN =====
    // Zeichne die Szene mit aktueller Kamera
    renderer.render(scene, camera);
}

// ===== FENSTER-RESIZE HANDLER: bei Bildschirmgrößen-Änderung =====
window.addEventListener('resize', function() {
    // Berechne neues Bildschirmverhältnis
    camera.aspect = window.innerWidth / window.innerHeight;
    // Aktualisiere Kamera-Matrixberechnung
    camera.updateProjectionMatrix();
    // Setze neue Renderer-Größe
    renderer.setSize(window.innerWidth, window.innerHeight);
});

// ===== INITIALISIERUNGS-FUNKTION (wird aus script.js aufgerufen) =====
function initThreeScene() {
    // Erstelle die 3D-Szene
    initScene();
    // Starte Animations-Loop
    animateScene();
}

