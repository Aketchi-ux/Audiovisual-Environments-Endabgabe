// JavaScript für Audiovisual Environments
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

// Canvas Größe an Fenster anpassen
function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}

// Initiale Größe setzen
resizeCanvas();

// Canvas bei Fenstergrößenänderung anpassen
window.addEventListener('resize', resizeCanvas);

console.log('Canvas ist bereit!');
