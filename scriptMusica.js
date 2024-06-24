document.addEventListener("DOMContentLoaded", function () {
    fetch('Musica.html')
        .then(response => response.text())
        .then(data => {
            document.body.insertAdjacentHTML('beforeend', data);
            var musicPlayer = document.getElementById('musicPlayer');
            var songSelector = document.getElementById('songSelector');
            var audioPlayer = document.getElementById('audioPlayer');

            // Establecer el estado de visualización inicial a "none"
            musicPlayer.style.display = "none";

            // Cargar el estado guardado (si existe)
            var savedSong = localStorage.getItem('currentSong');
            var savedTime = parseFloat(localStorage.getItem('currentTime')); // Convertir a número
            var savedVolume = parseFloat(localStorage.getItem('currentVolume')); // Convertir a número y cargar el volumen guardado
            // No cargar el estado de visualización guardado desde localStorage para asegurar que siempre esté oculto al cargar
            var isPlaying = localStorage.getItem('isPlaying') === 'true'; // Convertir a booleano

            if (savedSong) {
                songSelector.value = savedSong;
                audioPlayer.src = savedSong;
                audioPlayer.volume = isNaN(savedVolume) ? 0.05 : savedVolume; // Establecer volumen antes de cargar

                audioPlayer.addEventListener('canplay', function () {
                    if (!isNaN(savedTime)) {
                        audioPlayer.currentTime = savedTime;
                    }
                    if (isPlaying) { // Reproducir solo si isPlaying es true
                        audioPlayer.play();
                    }
                }, { once: true });
            }

            document.getElementById('btnMostrarReproductor').addEventListener('click', function () {
                // Alternar la visualización del reproductor de música
                musicPlayer.style.display = musicPlayer.style.display === "none" ? "flex" : "none";
                // Guardar el nuevo estado de visualización
                localStorage.setItem('musicPlayerDisplay', musicPlayer.style.display);
            });

            songSelector.addEventListener('change', function () {
                audioPlayer.src = this.value;
                audioPlayer.load();
                localStorage.setItem('currentSong', this.value);
            });

            audioPlayer.addEventListener('timeupdate', function () {
                localStorage.setItem('currentTime', audioPlayer.currentTime);
            });

            audioPlayer.addEventListener('volumechange', function () {
                localStorage.setItem('currentVolume', audioPlayer.volume);
            });

            // Guardar el estado de reproducción
            audioPlayer.addEventListener('play', function () {
                localStorage.setItem('isPlaying', 'true');
            });

            audioPlayer.addEventListener('pause', function () {
                localStorage.setItem('isPlaying', 'false');
            });
        })
        .catch(error => console.error('Error al cargar el reproductor de música:', error));
});