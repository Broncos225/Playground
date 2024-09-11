const firebaseConfig = {
    apiKey: "AIzaSyAw5z5-aKicJ78N1UahQ-Lu_u7WP6MNVRE",
    authDomain: "playgroundbdstop.firebaseapp.com",
    databaseURL: "https://playgroundbdstop-default-rtdb.firebaseio.com",
    projectId: "playgroundbdstop",
    storageBucket: "playgroundbdstop.appspot.com",
    messagingSenderId: "808082296806",
    appId: "1:808082296806:web:c1d0dc3c2fc5fbf6c9d027"
};

const app = firebase.initializeApp(firebaseConfig);
const db = firebase.database();

const itemsRef = firebase.database().ref('procedimientos');

itemsRef.on('value', (snapshot) => {
    const itemsContainer = document.getElementById('items-container');
    const tituloTexto = document.getElementById('titulo-texto');
    const descripcionTexto = document.getElementById('descripcion-texto');
    const enlacesContainer = document.getElementById('enlaces-container');
    itemsContainer.innerHTML = '';
    descripcionTexto.innerHTML = '';
    enlacesContainer.innerHTML = '';

    const data = snapshot.val();
    console.log("Datos de Firebase:", data);

    for (const key in data) {
        if (data.hasOwnProperty(key)) {
            const itemData = data[key];
            const itemDiv = document.createElement('div');
            itemDiv.classList.add('Items');
            const itemTitle = document.createElement('h4');
            itemTitle.textContent = key;

            itemDiv.appendChild(itemTitle);

            itemDiv.addEventListener('click', () => {
                const allTitles = document.querySelectorAll('.Items h4');
                allTitles.forEach(title => title.classList.remove('selected'));

                itemTitle.classList.add('selected');
                tituloTexto.textContent = key;
                descripcionTexto.innerHTML = itemData.descripcion || "Descripción no disponible";

                enlacesContainer.innerHTML = '';

                if (itemData.enlaces) {
                    console.log("Enlaces encontrados:", itemData.enlaces);

                    for (const descripcion in itemData.enlaces) {
                        if (itemData.enlaces.hasOwnProperty(descripcion)) {
                            const url = itemData.enlaces[descripcion];
                            console.log("Enlace:", descripcion, url);

                            const enlaceDiv = document.createElement('div');
                            enlaceDiv.classList.add('enlace-item');
                            enlaceDiv.classList.add('Modulo2');

                            if (url) {
                                enlaceDiv.textContent = descripcion;
                                enlaceDiv.addEventListener('click', () => {
                                    window.open(url, '_blank');
                                });
                            } else {
                                enlaceDiv.textContent = "Enlace no disponible";
                            }

                            enlacesContainer.appendChild(enlaceDiv);
                        }
                    }
                }
            });

            itemsContainer.appendChild(itemDiv);
        }
    }
});
