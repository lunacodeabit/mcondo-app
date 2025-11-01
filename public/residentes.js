document.addEventListener('DOMContentLoaded', () => {
    if (!window.location.pathname.includes('residentes.html')) {
        return;
    }

    firebase.auth().onAuthStateChanged(user => {
        if (user) {
            const firestore = firebase.firestore();

            const addButton = document.getElementById('add-contact-button');
            const modal = document.getElementById('add-contact-modal');
            const modalTitle = modal.querySelector('h2');
            const form = document.getElementById('add-contact-form');
            const tableBody = document.querySelector('#contacts-table tbody');
            const closeButtons = document.querySelectorAll('.close-button, .close-button-form');

            let editingId = null;

            const openModal = () => {
                modal.style.display = 'flex';
            }

            const fetchCollection = () => {
                firestore.collection('residentes').orderBy("nombre").get().then(querySnapshot => {
                    tableBody.innerHTML = ''; 
                    querySnapshot.forEach(doc => {
                        const item = doc.data();
                        const row = `<tr data-id="${doc.id}">
                            <td>${item.nombre}</td>
                            <td>${item.tipo || 'N/A'}</td>
                            <td>${item.telefono || '--'}</td>
                            <td>${item.email || '--'}</td>
                            <td class="actions">
                                <button class="btn-icon edit-button"><i data-lucide="edit-2"></i></button>
                                <button class="btn-icon btn-danger delete-button"><i data-lucide="trash-2"></i></button>
                            </td>
                        </tr>`;
                        tableBody.innerHTML += row;
                    });
                    lucide.createIcons();
                }).catch(error => console.error("Error al cargar los residentes: ", error));
            };

            const openModalForCreate = () => {
                 editingId = null;
                 form.reset();
                 modalTitle.textContent = "Añadir Nuevo Residente";
                 openModal();
            }

            const openModalForEdit = (id) => {
                editingId = id;
                firestore.collection('residentes').doc(id).get().then(doc => {
                    if (doc.exists) {
                        const item = doc.data();
                        modalTitle.textContent = "Editar Residente";
                        document.getElementById('contact-name').value = item.nombre || '';
                        document.getElementById('contact-type').value = item.tipo || 'Propietario';
                        document.getElementById('contact-phone').value = item.telefono || '';
                        document.getElementById('contact-email').value = item.email || '';
                        document.getElementById('contact-notes').value = item.notas || '';
                        openModal();
                    }
                }).catch(error => console.error("Error al obtener el residente para editar: ", error));
            };

            tableBody.addEventListener('click', (e) => {
                const row = e.target.closest('tr');
                if (!row) return;
                const id = row.dataset.id;

                if (e.target.closest('.edit-button')) {
                    openModalForEdit(id);
                } else if (e.target.closest('.delete-button')) {
                    if (confirm('¿Estás seguro de que quieres eliminar este residente?')) {
                        firestore.collection('residentes').doc(id).delete()
                            .then(() => fetchCollection())
                            .catch(error => console.error("Error al eliminar el residente: ", error));
                    }
                }
            });

            const closeModal = () => {
                modal.style.display = 'none';
                form.reset();
                editingId = null;
                modalTitle.textContent = "Añadir Nuevo Residente";
            };

            addButton.addEventListener('click', openModalForCreate);

            closeButtons.forEach(btn => btn.addEventListener('click', closeModal));
            
            window.addEventListener('click', (event) => {
                if (event.target == modal) {
                    closeModal();
                }
            });

            form.addEventListener('submit', (event) => {
                event.preventDefault();
                const payload = {
                    nombre: document.getElementById('contact-name').value,
                    tipo: document.getElementById('contact-type').value,
                    telefono: document.getElementById('contact-phone').value,
                    email: document.getElementById('contact-email').value,
                    notas: document.getElementById('contact-notes').value
                };

                const promise = editingId
                    ? firestore.collection('residentes').doc(editingId).update(payload)
                    : firestore.collection('residentes').add(payload);

                promise.then(() => {
                    closeModal();
                    fetchCollection();
                }).catch(error => {
                    console.error("Error al guardar el residente: ", error);
                    alert("Error al guardar el residente. Revisa la consola para más detalles.");
                });
            });

            fetchCollection();

        } else {
            console.log("Usuario no autenticado en la página de residentes.");
        }
    });
});