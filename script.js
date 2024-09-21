// Set the date of the birthday
const birthdayDate = new Date("2024-09-07T00:00:00").getTime();
const flame = document.getElementById("flame");
const birthdayMessage = document.getElementById("birthdayMessage");
const backgroundMusic = document.getElementById("backgroundMusic");
const continueButton = document.getElementById("continueButton");

// Countdown timer
const countdownInterval = setInterval(() => {
    const now = new Date().getTime();
    const timeLeft = birthdayDate - now;

    const days = Math.floor(timeLeft / (1000 * 60 * 60 * 24));
    const hours = Math.floor((timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);

    document.getElementById("countdown").innerHTML = `Tiempo hasta tu cumpleaños: ${days}d ${hours}h ${minutes}m ${seconds}s`;

    // If countdown reaches 0
    if (timeLeft < 0) {
        clearInterval(countdownInterval);
        document.getElementById("countdown").innerHTML = "🎉Prende tu micrófono y sopla la vela";
        lightCandle(); // Show the candle and start microphone detection
    }
}, 1000);

// Function to light the candle
function lightCandle() {
    flame.classList.remove("hidden"); // Reveal the flame
    startMicrophoneDetection(); // Start microphone detection after lighting the candle
}

// Añadir evento de doble clic para apagar la vela
document.body.addEventListener('dblclick', function() {
    if (!flame.classList.contains("hidden")) { // Si la vela está encendida
        extinguishCandle();
    }
});

// Función para detectar sonido usando el micrófono
function startMicrophoneDetection() {
    if (navigator.mediaDevices.getUserMedia) {
        navigator.mediaDevices.getUserMedia({ audio: true })
        .then(function(stream) {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const microphone = audioContext.createMediaStreamSource(stream);
            const analyser = audioContext.createAnalyser();
            analyser.fftSize = 128; // Tamaño del buffer FFT
            analyser.smoothingTimeConstant = 0.85; // Suaviza la respuesta del sonido para evitar picos bruscos

            const dataArray = new Uint8Array(analyser.frequencyBinCount);
            microphone.connect(analyser);

            let previousVolume = 0;
            let checkInterval = 100; // Revisar cada 100ms

            // Agregamos control del volumen de entrada
            function normalizeVolume(array) {
                const sum = array.reduce((acc, val) => acc + val, 0);
                return sum / array.length;
            }

            function detectBlow() {
                analyser.getByteFrequencyData(dataArray);
                const volume = normalizeVolume(dataArray); // Normalizamos el volumen

                // Umbral ajustable para detectar el soplido
                const blowThreshold = 120; // Puedes ajustar este valor según la sensibilidad del micrófono
                if (volume > blowThreshold && volume > previousVolume) {
                    console.log("¡Soplido detectado!");
                    extinguishCandle(); // Llamamos la función para apagar la vela
                }

                previousVolume = volume;
                setTimeout(detectBlow, checkInterval); // Continuamos revisando el sonido
            }

            detectBlow(); // Iniciamos la detección de sonido
        })
        .catch(function(err) {
            console.error("Acceso al micrófono denegado o no disponible.", err);
            alert("No se puede acceder al micrófono. Por favor, habilítalo para apagar la vela.");
        });
    } else {
        console.log("getUserMedia no es compatible con tu navegador.");
        alert("Tu navegador no soporta la detección de sonido.");
    }
}

// Function to extinguish the candle
function extinguishCandle() {
    flame.classList.add("hidden"); // Hide the flame (candle extinguished)
    birthdayMessage.classList.remove("hidden"); // Show 'Happy Birthday' message

    // Play background music
    backgroundMusic.play();

    // Trigger confetti
    triggerConfetti();
}

// Function to trigger confetti
function triggerConfetti() {
    confetti({
        particleCount: 200, // Number of confetti particles
        spread: 70, // Spread of the confetti
        origin: { y: 0.6 } // Position where the confetti will start
    });
}

// Event listener for continuing to the video
continueButton.addEventListener('click', () => {
    window.location.href = 'video.html'; // Redirigir a la página del video
});
