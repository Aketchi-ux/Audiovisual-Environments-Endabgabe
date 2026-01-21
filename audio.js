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
    // Verbinde Analyser mit Lautsprechern (WICHTIG!)
    analyser.connect(audioContext.destination);
    // Setze FFT-Größe (256 = schneller, aber weniger Detailiert)
    analyser.fftSize = 256;
    // Berechne Anzahl der Frequenzbins
    const bufferLength = analyser.frequencyBinCount;
    // Erstelle Array für Frequenzdaten (0-255 Werte)
    dataArray = new Uint8Array(bufferLength);

    // Markiere Audio als initialisiert
    isAudioInitialized = true;
}

// Feuerwerk Sound abspielen - nutzt nur synthetischen Sound
function playFireworkSound() {
    // Initialisiere Audio beim ersten Mal
    if (!isAudioInitialized) {
        initAudio();
    }

    // Spiele synthetischen Sound ab
    playFireworkSoundSynthetic();
}

// Fallback: Synthesizer-Sound wenn echte Datei nicht verfügbar
function playFireworkSoundSynthetic() {
    const now = audioContext.currentTime;
    
    // ===== TIEFE BASS-EXPLOSION =====
    // Hauptknall - sehr tiefer Bass
    const bass = audioContext.createOscillator();
    const bassGain = audioContext.createGain();
    bass.connect(bassGain);
    bassGain.connect(analyser);
    
    // Starte bei 120 Hz (sehr tief), falle zu 30 Hz
    bass.frequency.setValueAtTime(120, now);
    bass.frequency.exponentialRampToValueAtTime(30, now + 0.5);
    bass.type = 'sine';
    
    // Lautstärke: Laut starten, schnell verblassen
    bassGain.gain.setValueAtTime(0.8, now);
    bassGain.gain.exponentialRampToValueAtTime(0.05, now + 0.5);
    
    bass.start(now);
    bass.stop(now + 0.5);
    
    // ===== KNALL-EFFEKT: Noise für Knistereffekt =====
    // Erstelle Noise-Buffer (0.4 Sekunden)
    const bufferSize = audioContext.sampleRate * 0.4;
    const buffer = audioContext.createBuffer(1, bufferSize, audioContext.sampleRate);
    const data = buffer.getChannelData(0);
    
    // Fülle mit Zufallswerten für Knall-Sound
    for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
    }
    
    // Noise-Quelle
    const noise = audioContext.createBufferSource();
    const noiseGain = audioContext.createGain();
    noise.buffer = buffer;
    noise.connect(noiseGain);
    noiseGain.connect(analyser);
    
    // Noise-Lautstärke
    noiseGain.gain.setValueAtTime(0.5, now);
    noiseGain.gain.exponentialRampToValueAtTime(0.01, now + 0.4);
    
    noise.start(now);
}

