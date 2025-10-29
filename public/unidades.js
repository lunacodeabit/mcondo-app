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
            
            // FIX: Correctly select ALL close buttons, including the one in the form actions.
            const closeButtons = document.querySelectorAll('.close-button, .close-button-form');

            let editingUnitId = null;

            const fetchUnits = () => {
                firestore.collection('unidades').orderBy("numero").get().then(querySnapshot => {
                    unitsTableBody.innerHTML = '';
                    querySnapshot.forEach(doc => {
                        const unit = doc.data();
                        const row = `<tr data-id="${doc.id}">
                            <td>${unit.numero || ''}</td>
                            <td>${unit.propietario || ''}</td>
                            <td>${unit.telefono || '--'}</td>
                            <td><span class="status-badge status-${(unit.estado || '').toLowerCase().replace(/\s/g, '-')}">${unit.estado}</span></td>
                            <td class="actions">
                                <button class="btn-icon edit-button"><i data-lucide="edit-2"></i></button>
                                <button class="btn-icon btn-danger delete-button"><i data-lucide="trash-2"></i></button>
                            </td>
                        </tr>`;
                        unitsTableBody.innerHTML += row;
                    });
                    lucide.createIcons();
                }).catch(error => console.error("Error al cargar las unidades: ", error));
            };

            const openModalForEdit = (id) => {
                editingUnitId = id;
                firestore.collection('unidades').doc(id).get().then(doc => {
                    if (doc.exists) {
                        const unit = doc.data();
                        const distribucion = unit.distribucion || {};
                        modalTitle.textContent = "Editar Unidad";
                        
                        document.getElementById('unit-number').value = unit.numero || '';
                        document.getElementById('unit-type').value = unit.tipo || 'Apartamento';
                        document.getElementById('unit-ncf').value = unit.requiereNCF || 'No';
                        document.getElementById('unit-owner').value = unit.propietario || '';
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

                        addUnitModal.style.display = 'block';
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
                addUnitForm.reset();
                editingUnitId = null;
                modalTitle.textContent = "Añadir Nueva Unidad";
            };

            addUnitButton.addEventListener('click', () => {
                 editingUnitId = null;
                 addUnitForm.reset();
                 modalTitle.textContent = "Añadir Nueva Unidad";
                 addUnitModal.style.display = 'block';
            });

            closeButtons.forEach(btn => btn.addEventListener('click', closeModal));
            
            window.addEventListener('click', (event) => {
                if (event.target == addUnitModal) {
                    closeModal();
                }
            });

            addUnitForm.addEventListener('submit', (event) => {
                event.preventDefault();
                const unitPayload = {
                    numero: document.getElementById('unit-number').value,
                    tipo: document.getElementById('unit-type').value,
                    requiereNCF: document.getElementById('unit-ncf').value,
                    propietario: document.getElementById('unit-owner').value,
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
                }).catch(error => {
                    console.error("Error al guardar la unidad: ", error);
                    alert("Error al guardar la unidad. Revisa la consola para más detalles.");
                });
            });

            fetchUnits();

        } else {
            console.log("Usuario no autenticado en la página de unidades.");
        }
    });
});
