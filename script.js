const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

// Array für aktive Kreise
const circles = [];

// Farben für Feuerwerk
const colors = ['#FF0000', '#00FF00', '#0000FF', '#FFFF00', '#FF00FF', '#00FFFF', '#FFA500', '#FF1493'];

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

// Mausclick Event
canvas.addEventListener('click', function(event) {
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    
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
    
    // Feuerwerk Sound abspielen (zufällig)
    const fireworkSounds = ['firework1.mp3', 'firework2.mp3'];
    const randomSound = fireworkSounds[Math.floor(Math.random() * fireworkSounds.length)];
    const audio = new Audio(randomSound);
    audio.volume = 0.5;
    audio.play().catch(e => console.log('Sound konnte nicht abgespielt werden'));
});

// Initiale Größe setzen
resizeCanvas();

// Canvas bei Fenstergrößenänderung anpassen
window.addEventListener('resize', resizeCanvas);

// Animation starten
animate();