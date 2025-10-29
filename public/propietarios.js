document.addEventListener('DOMContentLoaded', () => {
    // Solo ejecutar en la página de propietarios
    if (!window.location.pathname.includes('propietarios.html')) {
        return;
    }

    firebase.auth().onAuthStateChanged(user => {
        if (user) {
            // --- USUARIO AUTENTICADO ---
            const firestore = firebase.firestore();

            const addOwnerButton = document.getElementById('add-owner-button');
            const addOwnerModal = document.getElementById('add-owner-modal');
            const modalTitle = addOwnerModal.querySelector('h2');
            const closeButton = addOwnerModal.querySelector('.close-button');
            const addOwnerForm = document.getElementById('add-owner-form');
            const ownersTableBody = document.querySelector('#owners-table tbody');

            let editingOwnerId = null;

            const fetchOwners = () => {
                firestore.collection('propietarios').orderBy("nombre").get().then(querySnapshot => {
                    ownersTableBody.innerHTML = ''; // Limpiar tabla
                    querySnapshot.forEach(doc => {
                        const owner = doc.data();
                        const row = `<tr data-id="${doc.id}">
                            <td>${owner.nombre}</td>
                            <td>${owner.unidad}</td>
                            <td>${owner.telefono || '--'}</td>
                            <td>${owner.email || '--'}</td>
                            <td class="actions">
                                <button class="btn-icon edit-button"><i data-lucide="edit-2"></i></button>
                                <button class="btn-icon btn-danger delete-button"><i data-lucide="trash-2"></i></button>
                            </td>
                        </tr>`;
                        ownersTableBody.innerHTML += row;
                    });
                    lucide.createIcons(); // Re-render icons
                }).catch(error => console.error("Error al cargar los propietarios: ", error));
            };

            const openModalForEdit = (id) => {
                editingOwnerId = id;
                firestore.collection('propietarios').doc(id).get().then(doc => {
                    if (doc.exists) {
                        const owner = doc.data();
                        modalTitle.textContent = "Editar Propietario";
                        document.getElementById('owner-name').value = owner.nombre;
                        document.getElementById('owner-unit').value = owner.unidad;
                        document.getElementById('owner-phone').value = owner.telefono || '';
                        document.getElementById('owner-email').value = owner.email || '';
                        addOwnerModal.style.display = 'block';
                    }
                }).catch(error => console.error("Error al obtener el propietario para editar: ", error));
            };

            ownersTableBody.addEventListener('click', (e) => {
                const editButton = e.target.closest('.edit-button');
                const deleteButton = e.target.closest('.delete-button');
                const row = e.target.closest('tr');
                const ownerId = row ? row.dataset.id : null;

                if (editButton && ownerId) {
                    openModalForEdit(ownerId);
                } else if (deleteButton && ownerId) {
                    if (confirm('¿Estás seguro de que quieres eliminar a este propietario?')) {
                        firestore.collection('propietarios').doc(ownerId).delete()
                            .then(() => fetchOwners())
                            .catch(error => console.error("Error al eliminar el propietario: ", error));
                    }
                }
            });

            const closeModal = () => {
                addOwnerModal.style.display = 'none';
                addOwnerForm.reset();
                editingOwnerId = null;
                modalTitle.textContent = "Añadir Nuevo Propietario";
            };

            addOwnerButton.addEventListener('click', () => {
                addOwnerModal.style.display = 'block';
            });

            closeButton.addEventListener('click', closeModal);
            window.addEventListener('click', (event) => {
                if (event.target == addOwnerModal) {
                    closeModal();
                }
            });

            addOwnerForm.addEventListener('submit', (event) => {
                event.preventDefault();
                const ownerPayload = {
                    nombre: document.getElementById('owner-name').value,
                    unidad: document.getElementById('owner-unit').value,
                    telefono: document.getElementById('owner-phone').value,
                    email: document.getElementById('owner-email').value,
                };

                let promise;
                if (editingOwnerId) {
                    promise = firestore.collection('propietarios').doc(editingOwnerId).update(ownerPayload);
                } else {
                    promise = firestore.collection('propietarios').add(ownerPayload);
                }

                promise.then(() => {
                    closeModal();
                    fetchOwners();
                }).catch(error => {
                    console.error("Error al guardar el propietario: ", error);
                    alert("Error al guardar el propietario. Revisa la consola para más detalles.");
                });
            });

            // Carga inicial de datos
            fetchOwners();

        } else {
            // Usuario no autenticado
            console.log("Usuario no autenticado en la página de propietarios.");
        }
    });
});
