document.addEventListener('DOMContentLoaded', function() {
    // Observador del estado de autenticación
    firebase.auth().onAuthStateChanged(function(user) {
        if (user) {
            // Si el usuario está autenticado, se carga el dashboard
            loadDashboard(user);
        } else {
            // Si no está autenticado, redirige a la página de login
            window.location.href = 'login.html';
        }
    });
});

async function loadDashboard(user) {
    const db = firebase.firestore();

    // 1. Personalizar el saludo y el avatar
    const welcomeMessage = document.getElementById('welcome-message');
    const userAvatar = document.getElementById('user-avatar');
    if (user.displayName) {
        welcomeMessage.textContent = `¡Bienvenido, ${user.displayName.split(' ')[0]}!`;
    }
    if (user.photoURL) {
        const img = document.createElement('img');
        img.src = user.photoURL;
        img.alt = user.displayName;
        img.style.width = '100%';
        img.style.height = '100%';
        img.style.borderRadius = '50%';
        userAvatar.innerHTML = '';
        userAvatar.appendChild(img);
    } else {
        userAvatar.textContent = user.displayName ? user.displayName.charAt(0) : 'U';
    }

    // 2. Obtener y calcular los KPIs
    const totalIngresosElem = document.getElementById('total-ingresos');
    const totalEgresosElem = document.getElementById('total-egresos');
    const balanceGeneralElem = document.getElementById('balance-general');
    const totalCondominiosElem = document.getElementById('total-condominios');

    try {
        const ingresosSnapshot = await db.collection('ingresos').get();
        const egresosSnapshot = await db.collection('egresos').get();
        const condominiosSnapshot = await db.collection('condominios').get();

        let totalIngresos = 0;
        ingresosSnapshot.forEach(doc => {
            totalIngresos += doc.data().monto;
        });

        let totalEgresos = 0;
        egresosSnapshot.forEach(doc => {
            totalEgresos += doc.data().monto;
        });

        const balanceGeneral = totalIngresos - totalEgresos;
        const totalCondominios = condominiosSnapshot.size;

        // Formatear como moneda
        const formatCurrency = (amount) => amount.toLocaleString('es-DO', { style: 'currency', currency: 'DOP' });

        totalIngresosElem.textContent = formatCurrency(totalIngresos);
        totalEgresosElem.textContent = formatCurrency(totalEgresos);
        balanceGeneralElem.textContent = formatCurrency(balanceGeneral);
        totalCondominiosElem.textContent = totalCondominios;

    } catch (error) {
        console.error("Error al calcular KPIs: ", error);
    }
    
    // 3. Obtener actividad reciente
    const recentActivityList = document.getElementById('recent-activity-list');
    try {
        const ingresosRecientes = await db.collection('ingresos').orderBy('fecha', 'desc').limit(3).get();
        const egresosRecientes = await db.collection('egresos').orderBy('fecha', 'desc').limit(3).get();

        const actividades = [];
        ingresosRecientes.forEach(doc => {
            actividades.push({ ...doc.data(), tipo: 'ingreso' });
        });
        egresosRecientes.forEach(doc => {
            actividades.push({ ...doc.data(), tipo: 'egreso' });
        });

        // Ordenar las 5 actividades más recientes
        const actividadesRecientes = actividades.sort((a, b) => new Date(b.fecha) - new Date(a.fecha)).slice(0, 5);
        
        recentActivityList.innerHTML = ''; // Limpiar la lista

        if (actividadesRecientes.length > 0) {
            actividadesRecientes.forEach(act => {
                const li = document.createElement('li');
                
                const iconClass = act.tipo === 'ingreso' ? 'success' : 'danger';
                const icon = act.tipo === 'ingreso' ? 'arrow-down' : 'arrow-up';
                const amountSign = act.tipo === 'ingreso' ? '+' : '-';
                const amountClass = act.tipo === 'ingreso' ? 'income' : 'expense';

                li.innerHTML = `
                    <div class="activity-icon" style="background-color: var(--${iconClass}-light);">
                        <i data-lucide="${icon}" style="color: var(--${iconClass});"></i>
                    </div>
                    <div class="activity-details">
                        <p class="activity-title">${act.concepto}</p>
                        <p class="activity-time">${new Date(act.fecha).toLocaleDateString()}</p>
                    </div>
                    <span class="activity-amount ${amountClass}">
                        ${amountSign}${act.monto.toLocaleString('es-DO', { style: 'currency', currency: 'DOP' })}
                    </span>
                `;
                recentActivityList.appendChild(li);
            });
        } else {
            recentActivityList.innerHTML = '<li>No hay actividad reciente.</li>';
        }

        lucide.createIcons(); // Volver a crear los iconos de Lucide

    } catch (error) {
        console.error("Error al cargar actividad reciente: ", error);
        recentActivityList.innerHTML = '<li>Error al cargar la actividad.</li>
    }
}
