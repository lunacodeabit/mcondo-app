document.addEventListener('DOMContentLoaded', () => {
    const sidebar = document.querySelector('.sidebar');
    const hamburgerButton = document.querySelector('.hamburger-button');
    const mainContent = document.querySelector('.main-content');
    const signOutLink = document.getElementById('sign-out-link');

    // Lógica para el menú de hamburguesa en móviles
    if (hamburgerButton) {
        hamburgerButton.addEventListener('click', () => {
            sidebar.classList.toggle('is-open');
        });
    }

    // Lógica para cerrar el menú si se hace clic fuera de él en móviles
    if (mainContent) {
        mainContent.addEventListener('click', () => {
            if (sidebar.classList.contains('is-open')) {
                sidebar.classList.remove('is-open');
            }
        });
    }

    // Lógica para cerrar sesión
    if (signOutLink) {
        signOutLink.addEventListener('click', (e) => {
            e.preventDefault();
            firebase.auth().signOut().then(() => {
                console.log('Usuario cerró sesión exitosamente');
                window.location.href = 'login.html'; // Redirige a la página de login
            }).catch((error) => {
                console.error('Error al cerrar sesión:', error);
            });
        });
    }
});
