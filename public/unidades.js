document.addEventListener('DOMContentLoaded', () => {
    if (!window.location.pathname.includes('unidades.html')) {
        return;
    }

    firebase.auth().onAuthStateChanged(user => {
        if (user) {
            const firestore = firebase.firestore();

            const addUnitButton = document.getElementById('add-unit-button');
            const addUnitModal = document.getElementById('add-unit-modal');
            const modalTitle = addUnitModal.querySelector('h2');
            const addUnitForm = document.getElementById('add-unit-form');
            const unitsTableBody = document.querySelector('#units-table tbody');
            const contactInput = document.getElementById('unit-contact-input');
            const closeButtons = document.querySelectorAll('.close-button, .close-button-form');

            let editingUnitId = null;
            let contactsCache = [];

            const loadContacts = async () => {
                try {
                    const snapshot = await firestore.collection('contactos').orderBy('nombre').get();
                    contactsCache = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                } catch (error) {
                    console.error("Error al cargar contactos en cache: ", error);
                }
            };

            const fetchUnits = () => {
                 firestore.collection('unidades').orderBy("numero").get().then(async (querySnapshot) => {
                    unitsTableBody.innerHTML = '';
                    for (const doc of querySnapshot.docs) {
                        const unit = doc.data();
                        let contactName = 'N/A';

                        if (unit.contactoId) {
                            try {
                                const contactDoc = await firestore.collection('contactos').doc(unit.contactoId).get();
                                if (contactDoc.exists) {
                                    contactName = contactDoc.data().nombre;
                                }
                            } catch (error) {
                                console.error("Error al buscar el nombre del contacto: ", error);
                            }
                        }

                        const row = `<tr data-id="${doc.id}">
                            <td>${unit.numero || ''}</td>
                            <td>${contactName}</td>
                            <td>${unit.telefono || '--'}</td>
                            <td><span class="status-badge status-${(unit.estado || '').toLowerCase().replace(/\s/g, '-')}">${unit.estado}</span></td>
                            <td class="actions">
                                <button class="btn-icon edit-button"><i data-lucide="edit-2"></i></button>
                                <button class="btn-icon btn-danger delete-button"><i data-lucide="trash-2"></i></button>
                            </td>
                        </tr>`;
                        unitsTableBody.innerHTML += row;
                    }
                    lucide.createIcons();
                }).catch(error => console.error("Error al cargar las unidades: ", error));
            };
            
            const openModal = () => {
                addUnitModal.style.display = 'flex';
            }

            const openModalForCreate = () => {
                 editingUnitId = null;
                 addUnitForm.reset();
                 contactInput.value = '';
                 modalTitle.textContent = "Añadir Nueva Unidad";
                 openModal();
            };

            const openModalForEdit = (id) => {
                editingUnitId = id;
                firestore.collection('unidades').doc(id).get().then(async (doc) => {
                    if (doc.exists) {
                        const unit = doc.data();
                        const distribucion = unit.distribucion || {};
                        modalTitle.textContent = "Editar Unidad";

                        contactInput.value = ''; // Clear previous value
                        if (unit.contactoId) {
                            try {
                                const contactDoc = await firestore.collection('contactos').doc(unit.contactoId).get();
                                if(contactDoc.exists) {
                                    contactInput.value = contactDoc.data().nombre;
                                }
                            } catch (e) { console.error(e); }
                        }
                        
                        document.getElementById('unit-number').value = unit.numero || '';
                        document.getElementById('unit-type').value = unit.tipo || 'Apartamento';
                        document.getElementById('unit-ncf').value = unit.requiereNCF || 'No';
                        document.getElementById('unit-phone').value = unit.telefono || '';
                        document.getElementById('unit-whatsapp').value = unit.whatsapp || '';
                        document.getElementById('unit-email1').value = unit.email1 || '';
                        document.getElementById('unit-email2').value = unit.email2 || '';
                        document.getElementById('unit-comment').value = unit.comentario || '';
                        document.getElementById('unit-habited').value = unit.habitado || 'Si';
                        document.getElementById('unit-airbnb').value = unit.airbnb || 'No';
                        document.getElementById('unit-rented').value = unit.alquilado || 'No';
                        document.getElementById('unit-represented').value = unit.representado || 'No';
                        document.getElementById('unit-fee').value = unit.cuotaMensual || 0;
                        document.getElementById('unit-fee-notification').value = unit.notifCuotasEmail || 'Si';
                        document.getElementById('unit-doc-name').value = unit.verNombreEnDocs || 'Si';
                        document.getElementById('dist-maintenance').value = distribucion.mantenimiento || 'Propietario';
                        document.getElementById('dist-gas').value = distribucion.gas || 'Propietario';
                        document.getElementById('dist-charges').value = distribucion.cargos || 'Propietario';
                        document.getElementById('dist-arrears').value = distribucion.moras || 'Propietario';
                        document.getElementById('dist-cxc').value = distribucion.cxc || 'Propietario';
                        document.getElementById('unit-board-member').value = unit.miembroJunta || 'No';
                        document.getElementById('unit-board-name').value = unit.nombreMiembroJA || '';
                        document.getElementById('unit-payment-agreement').value = unit.acuerdoPago || 'No';
                        document.getElementById('unit-legal').value = unit.aptoEnLegal || 'No';
                        document.getElementById('unit-status').value = unit.estado || 'Activo';

                        openModal();
                    }
                }).catch(error => console.error("Error al obtener la unidad para editar: ", error));
            };

            unitsTableBody.addEventListener('click', (e) => {
                const row = e.target.closest('tr');
                if (!row) return;
                const unitId = row.dataset.id;

                if (e.target.closest('.edit-button')) {
                    openModalForEdit(unitId);
                } else if (e.target.closest('.delete-button')) {
                    if (confirm('¿Estás seguro de que quieres eliminar esta unidad?')) {
                        firestore.collection('unidades').doc(unitId).delete()
                            .then(() => fetchUnits())
                            .catch(error => console.error("Error al eliminar el documento: ", error));
                    }
                }
            });

            const closeModal = () => {
                addUnitModal.style.display = 'none';
            };

            addUnitButton.addEventListener('click', openModalForCreate);

            closeButtons.forEach(btn => btn.addEventListener('click', closeModal));
            
            window.addEventListener('click', (event) => {
                if (event.target == addUnitModal) {
                    closeModal();
                }
            });

            addUnitForm.addEventListener('submit', async (event) => {
                event.preventDefault();
                const contactName = contactInput.value.trim();
                let contactId = null;

                if (!contactName) {
                    alert('Por favor, introduzca un nombre de contacto.');
                    return;
                }

                try {
                    await loadContacts(); 
                    const existingContact = contactsCache.find(c => c.nombre.toLowerCase() === contactName.toLowerCase());

                    if (existingContact) {
                        contactId = existingContact.id;
                    } else {
                        const newContactRef = await firestore.collection('contactos').add({ 
                            nombre: contactName,
                            tipo: 'Propietario', 
                            telefono: document.getElementById('unit-phone').value, 
                            email: document.getElementById('unit-email1').value    
                        });
                        contactId = newContactRef.id;
                    }
                } catch (error) {
                     console.error("Error al gestionar el contacto: ", error);
                     alert("No se pudo guardar el contacto. Revisa la consola.");
                     return; 
                }

                const unitPayload = {
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

                const promise = editingUnitId
                    ? firestore.collection('unidades').doc(editingUnitId).update(unitPayload)
                    : firestore.collection('unidades').add(unitPayload);

                promise.then(() => {
                    closeModal();
                    fetchUnits();
                    loadContacts();
                }).catch(error => {
                    console.error("Error al guardar la unidad: ", error);
                    alert("Error al guardar la unidad. Revisa la consola.");
                });
            });

            // Initial loads
            fetchUnits();
            loadContacts();

        } else {
            console.log("Usuario no autenticado en la página de unidades.");
        }
    });
});
