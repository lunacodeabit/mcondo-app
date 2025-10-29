document.addEventListener('DOMContentLoaded', () => {
    // Nos aseguramos de que este script solo se ejecute en la página de finanzas
    if (!window.location.pathname.includes('finanzas.html')) {
        return;
    }

    firebase.auth().onAuthStateChanged(user => {
        if (user) {
            // --- USUARIO AUTENTICADO ---
            console.log("Usuario autenticado en la página de finanzas.");
            const firestore = firebase.firestore();

            // Lógica de las pestañas (Tabs)
            const tabs = document.querySelectorAll('.tab-link');
            const tabContents = document.querySelectorAll('.tab-content');

            tabs.forEach(tab => {
                tab.addEventListener('click', () => {
                    const tabId = tab.dataset.tab;

                    // Ocultar todos los contenidos y desactivar todos los links
                    tabContents.forEach(content => content.classList.remove('active'));
                    tabs.forEach(link => link.classList.remove('active'));

                    // Mostrar el contenido de la pestaña seleccionada y activar el link
                    document.getElementById(tabId).classList.add('active');
                    tab.classList.add('active');
                });
            });

            // Inicializar los iconos de Lucide
            lucide.createIcons();

            // A partir de aquí, añadiremos la lógica para ingresos y egresos.

        } else {
            // --- USUARIO NO AUTENTICADO ---
            // auth.js se encargará de redirigir a login.html
            console.log("Usuario no autenticado en la página de finanzas.");
        }
    });
});
