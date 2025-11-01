const firebaseConfig = {
  apiKey: "AIzaSyCQEWcZMNICvitrg1wxEEu3Rko6_McDbtk",
  authDomain: "mcondo-app-42247438-22be9.firebaseapp.com",
  projectId: "mcondo-app-42247438-22be9",
  storageBucket: "mcondo-app-42247438-22be9.firebasestorage.app",
  messagingSenderId: "1026534525301",
  appId: "1:1026534525301:web:334fbfc327b57b7a32eb3c"
};

// Inicializar Firebase de forma segura para evitar conflictos
if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}
const auth = firebase.auth();
const db = firebase.firestore();


document.addEventListener('DOMContentLoaded', () => {
    const loginGoogleBtn = document.getElementById('login-google-btn');
    if (loginGoogleBtn) {
        loginGoogleBtn.addEventListener('click', () => {
            const provider = new firebase.auth.GoogleAuthProvider();
            auth.signInWithPopup(provider)
                .then((result) => {
                    window.location.href = 'index.html';
                })
                .catch((error) => {
                    console.error("Error durante el inicio de sesión: ", error);
                    alert("No se pudo iniciar sesión. Por favor, intenta de nuevo. Error: " + error.message);
                });
        });
    }

    auth.onAuthStateChanged((user) => {
        const isLoginPage = window.location.pathname.endsWith('login.html') || window.location.pathname === '/';

        if (user) {
            // Usuario está logueado
            if (isLoginPage) {
                window.location.href = 'index.html';
            }
        } else {
            // Usuario no está logueado
            if (!isLoginPage) {
                window.location.href = 'login.html';
            }
        }
    });
});
