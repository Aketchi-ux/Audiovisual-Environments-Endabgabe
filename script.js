const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

// Array für aktive Kreise
const circles = [];

// Farben für Feuerwerk
const colors = ['#FF0000', '#00FF00', '#0000FF', '#FFFF00', '#FF00FF', '#00FFFF', '#FFA500', '#FF1493'];

// Web Audio API Setup
let audioContext;
let analyser;
let dataArray;
let bufferLength;
let isAudioInitialized = false;

function initAudio() {
    if (isAudioInitialized) return;
    
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
    analyser = audioContext.createAnalyser();
    analyser.fftSize = 256;
    bufferLength = analyser.frequencyBinCount;
    dataArray = new Uint8Array(bufferLength);
    
    isAudioInitialized = true;
}

// Canvas Größe an Fenster anpassen
function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    // Canvas schwarz färben
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
}

// Feuerwerk zeichnen
function drawCircles() {
    // Hintergrund schwarz
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Alle Feuerwerks-Partikel zeichnen
    for (let i = circles.length - 1; i >= 0; i--) {
        const circle = circles[i];
        
        // Striche vom Mittelpunkt ausstrahlen
        for (let j = 0; j < circle.particles.length; j++) {
            const particle = circle.particles[j];
            
            ctx.strokeStyle = `rgba(${parseInt(particle.color.slice(1, 3), 16)}, ${parseInt(particle.color.slice(3, 5), 16)}, ${parseInt(particle.color.slice(5, 7), 16)}, ${circle.opacity})`;
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.moveTo(circle.x, circle.y);
            ctx.lineTo(particle.x, particle.y);
            ctx.stroke();
            
            // Partikel bewegen
            particle.x += particle.vx;
            particle.y += particle.vy;
        }
        
        // Opacity verringern
        circle.opacity -= 1 / (circle.duration * 60); // 60 FPS
        
        // Entfernen wenn verblasst
        if (circle.opacity <= 0) {
            circles.splice(i, 1);
        }
    }
}

// Animation Loop
function animate() {
    drawCircles();
    requestAnimationFrame(animate);
}

// Feuerwerk Sound mit Web Audio API erzeugen
function playFireworkSound() {
    if (!isAudioInitialized) {
        initAudio();
    }
    
    const now = audioContext.currentTime;
    
    // Hauptton (Explosion)
    const osc1 = audioContext.createOscillator();
    const gain1 = audioContext.createGain();
    osc1.connect(gain1);
    gain1.connect(analyser);
    analyser.connect(audioContext.destination);
    
    osc1.frequency.setValueAtTime(Math.random() * 80 + 40, now);
    osc1.frequency.exponentialRampToValueAtTime(20, now + 0.3);
    osc1.type = 'sine';
    
    gain1.gain.setValueAtTime(0.3, now);
    gain1.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
    
    osc1.start(now);
    osc1.stop(now + 0.3);
    
    // Hochfrequenz-Knall
    const osc2 = audioContext.createOscillator();
    const gain2 = audioContext.createGain();
    osc2.connect(gain2);
    gain2.connect(analyser);
    
    osc2.frequency.setValueAtTime(Math.random() * 400 + 300, now);
    osc2.frequency.exponentialRampToValueAtTime(80, now + 0.15);
    osc2.type = 'square';
    
    gain2.gain.setValueAtTime(0.2, now);
    gain2.gain.exponentialRampToValueAtTime(0.01, now + 0.15);
    
    osc2.start(now);
    osc2.stop(now + 0.15);
    
    // Noise für Krachen
    const bufferSize = audioContext.sampleRate * 0.2;
    const buffer = audioContext.createBuffer(1, bufferSize, audioContext.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
    }
    
    const noise = audioContext.createBufferSource();
    const noiseGain = audioContext.createGain();
    noise.buffer = buffer;
    noise.connect(noiseGain);
    noiseGain.connect(analyser);
    
    noiseGain.gain.setValueAtTime(0.15, now);
    noiseGain.gain.exponentialRampToValueAtTime(0.01, now + 0.2);
    
    noise.start(now);
}

// Mausclick Event
canvas.addEventListener('click', function(event) {
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    
    // Audio initialisieren beim ersten Klick
    if (!isAudioInitialized) {
        initAudio();
    }
    
    // Feuerwerk Sound abspielen
    playFireworkSound();
    
    // Zufällige Dauer zwischen 2 und 6 Sekunden
    const duration = Math.random() * 4 + 2;
    
    // Partikel für Feuerwerk generieren
    const particles = [];
    const particleCount = 60;
    
    for (let i = 0; i < particleCount; i++) {
        const angle = (Math.random()) * Math.PI * 2;
        const speed = Math.random() * 1.5 + 0.5;
        const color = colors[Math.floor(Math.random() * colors.length)];
        
        particles.push({
            x: x,
            y: y,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed - 1, // Etwas nach oben
            color: color,
            size: Math.random() * 2 + 1
        });
    }
    
    circles.push({
        x: x,
        y: y,
        opacity: 1,
        duration: duration,
        particles: particles
    });
});

// Initiale Größe setzen
resizeCanvas();

// Canvas bei Fenstergrößenänderung anpassen
window.addEventListener('resize', resizeCanvas);

// Animation starten
animate();