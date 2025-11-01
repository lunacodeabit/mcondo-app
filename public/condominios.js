document.addEventListener('DOMContentLoaded', () => {
    if (!window.location.pathname.includes('condominios.html')) {
        return;
    }

    firebase.auth().onAuthStateChanged(user => {
        if (user) {
            const firestore = firebase.firestore();

            const addButton = document.getElementById('add-unit-button');
            const modal = document.getElementById('add-unit-modal');
            const modalTitle = modal.querySelector('h2');
            const form = document.getElementById('add-unit-form');
            const tableBody = document.querySelector('#units-table tbody');
            const contactInput = document.getElementById('unit-contact-input');
            const closeButtons = document.querySelectorAll('.close-button, .close-button-form');

            let editingId = null;
            let contactsCache = [];

            const loadContacts = async () => {
                try {
                    const snapshot = await firestore.collection('residentes').orderBy('nombre').get();
                    contactsCache = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                } catch (error) {
                    console.error("Error al cargar residentes en cache: ", error);
                }
            };

            const fetchCollection = () => {
                 firestore.collection('condominios').orderBy("numero").get().then(async (querySnapshot) => {
                    tableBody.innerHTML = '';
                    for (const doc of querySnapshot.docs) {
                        const item = doc.data();
                        let contactName = 'N/A';

                        if (item.contactoId) {
                            try {
                                const contactDoc = await firestore.collection('residentes').doc(item.contactoId).get();
                                if (contactDoc.exists) {
                                    contactName = contactDoc.data().nombre;
                                }
                            } catch (error) {
                                console.error("Error al buscar el nombre del residente: ", error);
                            }
                        }

                        const row = `<tr data-id="${doc.id}">
                            <td>${item.numero || ''}</td>
                            <td>${contactName}</td>
                            <td>${item.telefono || '--'}</td>
                            <td><span class="status-badge status-${(item.estado || '').toLowerCase().replace(/\s/g, '-')}">${item.estado}</span></td>
                            <td class="actions">
                                <button class="btn-icon edit-button"><i data-lucide="edit-2"></i></button>
                                <button class="btn-icon btn-danger delete-button"><i data-lucide="trash-2"></i></button>
                            </td>
                        </tr>`;
                        tableBody.innerHTML += row;
                    }
                    lucide.createIcons();
                }).catch(error => console.error("Error al cargar los condominios: ", error));
            };
            
            const openModal = () => {
                modal.style.display = 'flex';
            }

            const openModalForCreate = () => {
                 editingId = null;
                 form.reset();
                 contactInput.value = '';
                 modalTitle.textContent = "Añadir Nuevo Condominio";
                 openModal();
            };

            const openModalForEdit = (id) => {
                editingId = id;
                firestore.collection('condominios').doc(id).get().then(async (doc) => {
                    if (doc.exists) {
                        const item = doc.data();
                        const distribucion = item.distribucion || {};
                        modalTitle.textContent = "Editar Condominio";

                        contactInput.value = ''; 
                        if (item.contactoId) {
                            try {
                                const contactDoc = await firestore.collection('residentes').doc(item.contactoId).get();
                                if(contactDoc.exists) {
                                    contactInput.value = contactDoc.data().nombre;
                                }
                            } catch (e) { console.error(e); }
                        }
                        
                        document.getElementById('unit-number').value = item.numero || '';
                        document.getElementById('unit-type').value = item.tipo || 'Apartamento';
                        document.getElementById('unit-ncf').value = item.requiereNCF || 'No';
                        document.getElementById('unit-phone').value = item.telefono || '';
                        document.getElementById('unit-whatsapp').value = item.whatsapp || '';
                        document.getElementById('unit-email1').value = item.email1 || '';
                        document.getElementById('unit-email2').value = item.email2 || '';
                        document.getElementById('unit-comment').value = item.comentario || '';
                        document.getElementById('unit-habited').value = item.habitado || 'Si';
                        document.getElementById('unit-airbnb').value = item.airbnb || 'No';
                        document.getElementById('unit-rented').value = item.alquilado || 'No';
                        document.getElementById('unit-represented').value = item.representado || 'No';
                        document.getElementById('unit-fee').value = item.cuotaMensual || 0;
                        document.getElementById('unit-fee-notification').value = item.notifCuotasEmail || 'Si';
                        document.getElementById('unit-doc-name').value = item.verNombreEnDocs || 'Si';
                        document.getElementById('dist-maintenance').value = distribucion.mantenimiento || 'Propietario';
                        document.getElementById('dist-gas').value = distribucion.gas || 'Propietario';
                        document.getElementById('dist-charges').value = distribucion.cargos || 'Propietario';
                        document.getElementById('dist-arrears').value = distribucion.moras || 'Propietario';
                        document.getElementById('dist-cxc').value = distribucion.cxc || 'Propietario';
                        document.getElementById('unit-board-member').value = item.miembroJunta || 'No';
                        document.getElementById('unit-board-name').value = item.nombreMiembroJA || '';
                        document.getElementById('unit-payment-agreement').value = item.acuerdoPago || 'No';
                        document.getElementById('unit-legal').value = item.aptoEnLegal || 'No';
                        document.getElementById('unit-status').value = item.estado || 'Activo';

                        openModal();
                    }
                }).catch(error => console.error("Error al obtener el condominio para editar: ", error));
            };

            tableBody.addEventListener('click', (e) => {
                const row = e.target.closest('tr');
                if (!row) return;
                const id = row.dataset.id;

                if (e.target.closest('.edit-button')) {
                    openModalForEdit(id);
                } else if (e.target.closest('.delete-button')) {
                    if (confirm('¿Estás seguro de que quieres eliminar este condominio?')) {
                        firestore.collection('condominios').doc(id).delete()
                            .then(() => fetchCollection())
                            .catch(error => console.error("Error al eliminar el documento: ", error));
                    }
                }
            });

            const closeModal = () => {
                modal.style.display = 'none';
            };

            addButton.addEventListener('click', openModalForCreate);

            closeButtons.forEach(btn => btn.addEventListener('click', closeModal));
            
            window.addEventListener('click', (event) => {
                if (event.target == modal) {
                    closeModal();
                }
            });

            form.addEventListener('submit', async (event) => {
                event.preventDefault();
                const contactName = contactInput.value.trim();
                let contactId = null;

                if (!contactName) {
                    alert('Por favor, introduzca un nombre de residente.');
                    return;
                }

                try {
                    await loadContacts(); 
                    const existingContact = contactsCache.find(c => c.nombre.toLowerCase() === contactName.toLowerCase());

                    if (existingContact) {
                        contactId = existingContact.id;
                    } else {
                        const newContactRef = await firestore.collection('residentes').add({ 
                            nombre: contactName,
                            tipo: 'Propietario', 
                            telefono: document.getElementById('unit-phone').value, 
                            email: document.getElementById('unit-email1').value    
                        });
                        contactId = newContactRef.id;
                    }
                } catch (error) {
                     console.error("Error al gestionar el residente: ", error);
                     alert("No se pudo guardar el residente. Revisa la consola.");
                     return; 
                }

                const payload = {
                    numero: document.getElementById('unit-number').value,
                    tipo: document.getElementById('unit-type').value,
                    requiereNCF: document.getElementById('unit-ncf').value,
                    contactoId: contactId, 
                    telefono: document.getElementById('unit-phone').value,
                    whatsapp: document.getElementById('unit-whatsapp').value,
                    email1: document.getElementById('unit-email1').value,
                    email2: document.getElementById('unit-email2').value,
                    comentario: document.getElementById('unit-comment').value,
                    habitado: document.getElementById('unit-habited').value,
                    airbnb: document.getElementById('unit-airbnb').value,
                    alquilado: document.getElementById('unit-rented').value,
                    representado: document.getElementById('unit-represented').value,
                    cuotaMensual: parseFloat(document.getElementById('unit-fee').value) || 0,
                    notifCuotasEmail: document.getElementById('unit-fee-notification').value,
                    verNombreEnDocs: document.getElementById('unit-doc-name').value,
                    distribucion: {
                        mantenimiento: document.getElementById('dist-maintenance').value,
                        gas: document.getElementById('dist-gas').value,
                        cargos: document.getElementById('dist-charges').value,
                        moras: document.getElementById('dist-arrears').value,
                        cxc: document.getElementById('dist-cxc').value,
                    },
                    miembroJunta: document.getElementById('unit-board-member').value,
                    nombreMiembroJA: document.getElementById('unit-board-name').value,
                    acuerdoPago: document.getElementById('unit-payment-agreement').value,
                    aptoEnLegal: document.getElementById('unit-legal').value,
                    estado: document.getElementById('unit-status').value
                };

                const promise = editingId
                    ? firestore.collection('condominios').doc(editingId).update(payload)
                    : firestore.collection('condominios').add(payload);

                promise.then(() => {
                    closeModal();
                    fetchCollection();
                    loadContacts();
                }).catch(error => {
                    console.error("Error al guardar el condominio: ", error);
                    alert("Error al guardar el condominio. Revisa la consola.");
                });
            });

            // Initial loads
            fetchCollection();
            loadContacts();

        } else {
            console.log("Usuario no autenticado en la página de condominios.");
        }
    });
});