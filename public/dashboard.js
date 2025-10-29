document.addEventListener('DOMContentLoaded', () => {
    // Asegurarnos de que Firebase está inicializado por auth.js
    if (typeof firebase === 'undefined') {
        console.error("Firebase no está cargado. Asegúrate de que los scripts de Firebase y auth.js se cargan antes que dashboard.js");
        return;
    }

    const firestore = firebase.firestore();

    const updateTotalUnidades = () => {
        const totalUnidadesElement = document.getElementById('total-unidades');
        if (!totalUnidadesElement) return; // Salir si el elemento no existe

        firestore.collection('unidades').get()
            .then(querySnapshot => {
                totalUnidadesElement.textContent = querySnapshot.size;
            })
            .catch(error => {
                console.error("Error al obtener el total de unidades: ", error);
                totalUnidadesElement.textContent = 'Error';
            });
    };

    // Llamar a la función solo cuando el usuario está autenticado
    firebase.auth().onAuthStateChanged(user => {
        if (user) {
            // Solo ejecutar si estamos en el dashboard
            if (window.location.pathname.includes('index.html')) {
                updateTotalUnidades();
            }
        } 
    });
});
