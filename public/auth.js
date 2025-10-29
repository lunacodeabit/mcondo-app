const firebaseConfig = {
    apiKey: "AIzaSyD-LjKp8-Qdj0ube1vfa6ju1MJ2SosOCu4",
    authDomain: "studio-2882775050-18569.firebaseapp.com",
    projectId: "studio-2882775050-18569",
    storageBucket: "studio-2882775050-18569.firebasestorage.app",
    messagingSenderId: "301300120429",
    appId: "1:301300120429:web:56f59894b97863e143f864"
};

// Inicializar Firebase de forma segura para evitar conflictos
if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}
const auth = firebase.auth();

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
            } else {
                setupLogout();
                if (typeof lucide !== 'undefined') {
                    lucide.createIcons();
                }
            }
        } else {
            // Usuario no está logueado
            if (!isLoginPage) {
                window.location.href = 'login.html';
            }
        }
    });
});

function setupLogout() {
    const sidebarNav = document.querySelector('.sidebar nav ul');
    if (sidebarNav && !document.getElementById('logout-btn')) { // Evitar duplicados
        const logoutLi = document.createElement('li');
        logoutLi.innerHTML = `<a href="#" id="logout-btn"><i data-lucide="log-out"></i> Cerrar Sesión</a>`;
        sidebarNav.appendChild(logoutLi);

        const logoutButton = document.getElementById('logout-btn');
        logoutButton.addEventListener('click', (e) => {
            e.preventDefault();
            auth.signOut().then(() => {
                window.location.href = 'login.html';
            });
        });
    }
}
