document.addEventListener('DOMContentLoaded', () => {
    if (!window.location.pathname.includes('finanzas.html')) {
        return;
    }

    firebase.auth().onAuthStateChanged(user => {
        if (user) {
            console.log("Usuario autenticado en la página de finanzas.");
            const firestore = firebase.firestore();

            // --- Lógica de Pestañas ---
            const tabs = document.querySelectorAll('.tab-link');
            const tabContents = document.querySelectorAll('.tab-content');
            tabs.forEach(tab => {
                tab.addEventListener('click', () => {
                    const tabId = tab.dataset.tab;
                    tabContents.forEach(content => content.classList.remove('active'));
                    tabs.forEach(link => link.classList.remove('active'));
                    document.getElementById(tabId).classList.add('active');
                    tab.classList.add('active');
                });
            });

            // --- Lógica de Ingresos ---
            const addIncomeModal = document.getElementById('add-income-modal');
            const addIncomeButton = document.getElementById('add-income-button');
            const addIncomeForm = document.getElementById('add-income-form');
            const incomeTableBody = document.querySelector('#income-table tbody');
            const incomeUnitSelect = document.getElementById('income-unit');
            const closeButtons = addIncomeModal.querySelectorAll('.close-button, .close-button-form');

            // Cargar unidades en el select
            const loadUnits = () => {
                firestore.collection('unidades').orderBy('numero').get().then(snapshot => {
                    incomeUnitSelect.innerHTML = '<option value="">Seleccione una unidad...</option>'; // Opción por defecto
                    snapshot.forEach(doc => {
                        const unit = doc.data();
                        const option = document.createElement('option');
                        option.value = doc.id; // Guardamos el ID del documento
                        option.textContent = `${unit.numero} - ${unit.propietario}`;
                        incomeUnitSelect.appendChild(option);
                    });
                }).catch(error => console.error("Error al cargar unidades: ", error));
            };

            const openIncomeModal = () => {
                addIncomeForm.reset();
                // Poner la fecha actual por defecto
                document.getElementById('income-date').valueAsDate = new Date();
                loadUnits(); // Cargar unidades cada vez que se abre el modal
                addIncomeModal.style.display = 'block';
            };

            const closeIncomeModal = () => {
                addIncomeModal.style.display = 'none';
            };

            const fetchIncomes = () => {
                firestore.collection('ingresos').orderBy('fecha', 'desc').get().then(snapshot => {
                    incomeTableBody.innerHTML = '';
                    snapshot.forEach(doc => {
                        const income = doc.data();
                        // Para mostrar el número de unidad, necesitamos buscarlo. Por ahora, mostramos el ID.
                        // En un futuro, podríamos guardar el número directamente o hacer una consulta más compleja.
                        const row = `<tr data-id="${doc.id}">
                            <td>${income.fecha}</td>
                            <td>${income.unidadId}</td> 
                            <td>${income.concepto}</td>
                            <td>$${parseFloat(income.monto).toFixed(2)}</td>
                            <td class="actions">
                                <button class="btn-icon edit-income-button"><i data-lucide="edit-2"></i></button>
                                <button class="btn-icon btn-danger delete-income-button"><i data-lucide="trash-2"></i></button>
                            </td>
                        </tr>`;
                        incomeTableBody.innerHTML += row;
                    });
                    lucide.createIcons(); // Actualizar iconos después de añadir filas
                }).catch(error => console.error("Error al cargar ingresos: ", error));
            };

            addIncomeButton.addEventListener('click', openIncomeModal);
            closeButtons.forEach(btn => btn.addEventListener('click', closeIncomeModal));
            window.addEventListener('click', (event) => {
                if (event.target == addIncomeModal) {
                    closeIncomeModal();
                }
            });

            addIncomeForm.addEventListener('submit', (e) => {
                e.preventDefault();
                const selectedOption = incomeUnitSelect.options[incomeUnitSelect.selectedIndex];

                const incomePayload = {
                    fecha: document.getElementById('income-date').value,
                    unidadId: selectedOption.value, // Guardamos el ID de la unidad
                    unidadLabel: selectedOption.textContent, // Guardamos el texto para fácil visualización
                    concepto: document.getElementById('income-concept').value,
                    monto: parseFloat(document.getElementById('income-amount').value),
                    metodoPago: document.getElementById('income-method').value,
                    timestamp: firebase.firestore.FieldValue.serverTimestamp()
                };

                firestore.collection('ingresos').add(incomePayload).then(() => {
                    console.log("Ingreso registrado con éxito");
                    closeIncomeModal();
                    fetchIncomes();
                }).catch(error => {
                    console.error("Error al registrar el ingreso: ", error);
                    alert("Hubo un error al guardar el ingreso. Revisa la consola.");
                });
            });

            // --- Carga Inicial ---
            fetchIncomes();
            lucide.createIcons();

        } else {
            console.log("Usuario no autenticado en la página de finanzas.");
        }
    });
});
