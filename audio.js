// ===== AUDIO-MODUL: Soundsynthese für Feuerwerk-Explosionen =====

// Globale Audio-Variablen
let audioContext; // Web Audio API Kontext (Zentrale für Audioverarbeitung)
let analyser; // Analyser für Frequenzanalyse (optional für Visualisierung)
let dataArray; // Array für Frequenzdaten
let isAudioInitialized = false; // Flag: wurde Audio bereits initialisiert?

// Audio initialisieren - wird beim ersten Klick aufgerufen
function initAudio() {
    if (isAudioInitialized) return; // Abbruch wenn schon initialisiert (spart Ressourcen)

    // Erstelle den Audio-Kontext (Chrome/Firefox)
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
    // Erstelle einen Analyser zur Frequenzmessung
    analyser = audioContext.createAnalyser();
    // Setze FFT-Größe (256 = schneller, aber weniger Detailiert)
    analyser.fftSize = 256;
    // Berechne Anzahl der Frequenzbins
    const bufferLength = analyser.frequencyBinCount;
    // Erstelle Array für Frequenzdaten (0-255 Werte)
    dataArray = new Uint8Array(bufferLength);

    // Markiere Audio als initialisiert
    isAudioInitialized = true;
}

// Feuerwerk Sound abspielen - echte Explosion mit 4 Schichten
function playFireworkSound() {
    // Initialisiere Audio beim ersten Mal
    if (!isAudioInitialized) {
        initAudio();
    }

    // Hole aktuelle Audiozeit für Timing
    const now = audioContext.currentTime;
    
    // ===== SCHICHT 1: TIEFE EXPLOSION - Bass-Frequenzen =====
    // Erstelle Oszillator für Bass
    const bassBoom = audioContext.createOscillator();
    // Erstelle Gain-Node für Lautstärkeregelung
    const bassGain = audioContext.createGain();
    // Verbinde: Oszillator -> Gain -> Analyser -> Lautsprecher
    bassBoom.connect(bassGain);
    bassGain.connect(analyser);
    analyser.connect(audioContext.destination);
    
    // Starte Bass bei 150 Hz (tiefe Explosion)
    bassBoom.frequency.setValueAtTime(150, now);
    // Abfall auf 30 Hz über 0.4 Sekunden (exponentiell = natürlich)
    bassBoom.frequency.exponentialRampToValueAtTime(30, now + 0.4);
    // Wellenform: Sinus = rund und tief
    bassBoom.type = 'sine';
    
    // Starte Lautstärke bei 40% (0.4)
    bassGain.gain.setValueAtTime(0.4, now);
    // Leiser werdend auf 1% über 0.4 Sekunden
    bassGain.gain.exponentialRampToValueAtTime(0.01, now + 0.4);
    
    // Starte und stoppe den Bass-Ton
    bassBoom.start(now);
    bassBoom.stop(now + 0.4);

    // ===== SCHICHT 2: HAUPTTON - schnelle Explosion =====
    // Erstelle zweiten Oszillator
    const osc1 = audioContext.createOscillator();
    // Erstelle Gain für diesen Ton
    const gain1 = audioContext.createGain();
    // Verbinde die Audio-Kette
    osc1.connect(gain1);
    gain1.connect(analyser);

    // Zufallsfrequenz zwischen 60-180 Hz (warm, explosiv)
    osc1.frequency.setValueAtTime(Math.random() * 120 + 60, now);
    // Abfall auf 40 Hz über 0.25 Sekunden
    osc1.frequency.exponentialRampToValueAtTime(40, now + 0.25);
    // Triangle = warm und melodisch
    osc1.type = 'triangle';
    
    // Starke Lautstärke
    gain1.gain.setValueAtTime(0.3, now);
    // Schnell verblassen
    gain1.gain.exponentialRampToValueAtTime(0.01, now + 0.25);
    
    // Starte und stoppe
    osc1.start(now);
    osc1.stop(now + 0.25);

    // ===== SCHICHT 3: HOCHFREQUENZ-GLITZERN =====
    // Dritter Oszillator für helles "Knallen"
    const osc2 = audioContext.createOscillator();
    // Gain für Highfreq
    const gain2 = audioContext.createGain();
    // Verbinde
    osc2.connect(gain2);
    gain2.connect(analyser);

    // Zufallsfrequenz zwischen 400-1000 Hz (hell, scharf)
    osc2.frequency.setValueAtTime(Math.random() * 600 + 400, now);
    // Abfall auf 150 Hz über 0.2 Sekunden
    osc2.frequency.exponentialRampToValueAtTime(150, now + 0.2);
    // Square = digital, hart und scharf
    osc2.type = 'square';
    
    // Mittlere Lautstärke
    gain2.gain.setValueAtTime(0.25, now);
    // Schnell weg
    gain2.gain.exponentialRampToValueAtTime(0.01, now + 0.2);
    
    // Starte und stoppe
    osc2.start(now);
    osc2.stop(now + 0.2);

    // ===== SCHICHT 4: NOISE - Knistereffekt =====
    // Berechne Buffer-Größe: 0.3 Sekunden Noise
    const bufferSize = audioContext.sampleRate * 0.3;
    // Erstelle leeren Audio-Buffer
    const buffer = audioContext.createBuffer(1, bufferSize, audioContext.sampleRate);
    // Hole Kanaldaten
    const data = buffer.getChannelData(0);
    // Fülle mit Zufallswerten (-1 bis +1 = Noise)
    for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
    }
    
    // Erstelle Buffer-Quelle zum Abspielen
    const noise = audioContext.createBufferSource();
    // Erstelle Gain für Lautstärke
    const noiseGain = audioContext.createGain();
    // Verbinde Buffer -> Gain -> Analyser
    noise.buffer = buffer;
    noise.connect(noiseGain);
    noiseGain.connect(analyser);
    
    // Starte Noise-Lautstärke
    noiseGain.gain.setValueAtTime(0.2, now);
    // Verblasse über 0.3 Sekunden
    noiseGain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
    
    // Starte Noise-Wiedergabe
    noise.start(now);
}

