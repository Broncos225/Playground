const firebaseConfig = {
    apiKey: "AIzaSyAw5z5-aKicJ78N1UahQ-Lu_u7WP6MNVRE",
    authDomain: "playgroundbdstop.firebaseapp.com",
    databaseURL: "https://playgroundbdstop-default-rtdb.firebaseio.com",
    projectId: "playgroundbdstop",
    storageBucket: "playgroundbdstop.appspot.com",
    messagingSenderId: "808082296806",
    appId: "1:808082296806:web:c1d0dc3c2fc5fbf6c9d027"
  };


firebase.initializeApp(firebaseConfig);
const db = firebase.database();
  

let agentes = {
    Anderson_Cano_Londoño: {
        nombre: "Anderson",
        correo: "anderson.cano@arus.com.co",
        letra: "A"
    },
    Miguel_Cadavid_Naranjo: {
        nombre: "Miguel",
        correo: "miguel.cadavid@arus.com.co",
        letra: "B"
    },
    Milton_Alexis_Calle_Londoño: {
        nombre: "Milton Alexis",
        correo: "milton.calle@arus.com.co",
        letra: "C"
    },
    Yesica_Johana_Cano_Quintero: {
        nombre: "Yesica Johana",
        correo: "yesica.cano@arus.com.co",
        letra: "D"
    },
    Andrés_Felipe_Vidal_Medina: {
        nombre: "Andrés Felipe",
        correo: "andres.vidal@arus.com.co",
        letra: "E"
    },
    Andrés_Felipe_Yepes_Tascón: {
        nombre: "Andrés Felipe",
        correo: "andres.yepes@arus.com.co",
        letra: "F"
    }
}

