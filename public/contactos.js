document.addEventListener('DOMContentLoaded', () => {
    if (!window.location.pathname.includes('contactos.html')) {
        return;
    }

    firebase.auth().onAuthStateChanged(user => {
        if (user) {
            const firestore = firebase.firestore();

            const addContactButton = document.getElementById('add-contact-button');
            const addContactModal = document.getElementById('add-contact-modal');
            const modalTitle = addContactModal.querySelector('h2');
            const addContactForm = document.getElementById('add-contact-form');
            const contactsTableBody = document.querySelector('#contacts-table tbody');
            const closeButtons = document.querySelectorAll('.close-button, .close-button-form');

            let editingContactId = null;

            const openModal = () => {
                addContactModal.style.display = 'flex';
            }

            const fetchContacts = () => {
                firestore.collection('contactos').orderBy("nombre").get().then(querySnapshot => {
                    contactsTableBody.innerHTML = ''; 
                    querySnapshot.forEach(doc => {
                        const contact = doc.data();
                        const row = `<tr data-id="${doc.id}">
                            <td>${contact.nombre}</td>
                            <td>${contact.tipo || 'N/A'}</td>
                            <td>${contact.telefono || '--'}</td>
                            <td>${contact.email || '--'}</td>
                            <td class="actions">
                                <button class="btn-icon edit-button"><i data-lucide="edit-2"></i></button>
                                <button class="btn-icon btn-danger delete-button"><i data-lucide="trash-2"></i></button>
                            </td>
                        </tr>`;
                        contactsTableBody.innerHTML += row;
                    });
                    lucide.createIcons();
                }).catch(error => console.error("Error al cargar los contactos: ", error));
            };

            const openModalForCreate = () => {
                 editingContactId = null;
                 addContactForm.reset();
                 modalTitle.textContent = "Añadir Nuevo Contacto";
                 openModal();
            }

            const openModalForEdit = (id) => {
                editingContactId = id;
                firestore.collection('contactos').doc(id).get().then(doc => {
                    if (doc.exists) {
                        const contact = doc.data();
                        modalTitle.textContent = "Editar Contacto";
                        document.getElementById('contact-name').value = contact.nombre || '';
                        document.getElementById('contact-type').value = contact.tipo || 'Propietario';
                        document.getElementById('contact-phone').value = contact.telefono || '';
                        document.getElementById('contact-email').value = contact.email || '';
                        document.getElementById('contact-notes').value = contact.notas || '';
                        openModal();
                    }
                }).catch(error => console.error("Error al obtener el contacto para editar: ", error));
            };

            contactsTableBody.addEventListener('click', (e) => {
                const row = e.target.closest('tr');
                if (!row) return;
                const contactId = row.dataset.id;

                if (e.target.closest('.edit-button')) {
                    openModalForEdit(contactId);
                } else if (e.target.closest('.delete-button')) {
                    if (confirm('¿Estás seguro de que quieres eliminar este contacto?')) {
                        firestore.collection('contactos').doc(contactId).delete()
                            .then(() => fetchContacts())
                            .catch(error => console.error("Error al eliminar el contacto: ", error));
                    }
                }
            });

            const closeModal = () => {
                addContactModal.style.display = 'none';
                addContactForm.reset();
                editingContactId = null;
                modalTitle.textContent = "Añadir Nuevo Contacto";
            };

            addContactButton.addEventListener('click', openModalForCreate);

            closeButtons.forEach(btn => btn.addEventListener('click', closeModal));
            
            window.addEventListener('click', (event) => {
                if (event.target == addContactModal) {
                    closeModal();
                }
            });

            addContactForm.addEventListener('submit', (event) => {
                event.preventDefault();
                const contactPayload = {
                    nombre: document.getElementById('contact-name').value,
                    tipo: document.getElementById('contact-type').value,
                    telefono: document.getElementById('contact-phone').value,
                    email: document.getElementById('contact-email').value,
                    notas: document.getElementById('contact-notes').value
                };

                const promise = editingContactId
                    ? firestore.collection('contactos').doc(editingContactId).update(contactPayload)
                    : firestore.collection('contactos').add(contactPayload);

                promise.then(() => {
                    closeModal();
                    fetchContacts();
                }).catch(error => {
                    console.error("Error al guardar el contacto: ", error);
                    alert("Error al guardar el contacto. Revisa la consola para más detalles.");
                });
            });

            fetchContacts();

        } else {
            console.log("Usuario no autenticado en la página de contactos.");
        }
    });
});
