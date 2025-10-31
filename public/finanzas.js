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

            const loadUnits = async () => {
                try {
                    const unitsSnapshot = await firestore.collection('unidades').orderBy('numero').get();
                    incomeUnitSelect.innerHTML = '<option value="">Seleccione una unidad...</option>';
                    
                    for (const unitDoc of unitsSnapshot.docs) {
                        const unit = unitDoc.data();
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
                        
                        const option = document.createElement('option');
                        option.value = unitDoc.id;
                        option.textContent = `${unit.numero} - ${contactName}`;
                        incomeUnitSelect.appendChild(option);
                    }
                } catch (error) {
                     console.error("Error al cargar unidades: ", error)
                }
            };

            const openIncomeModal = () => {
                addIncomeForm.reset();
                document.getElementById('income-date').valueAsDate = new Date();
                loadUnits();
                addIncomeModal.style.display = 'flex';
            };

            const closeIncomeModal = () => addIncomeModal.style.display = 'none';

            const fetchIncomes = () => {
                firestore.collection('ingresos').orderBy('fecha', 'desc').get().then(snapshot => {
                    incomeTableBody.innerHTML = '';
                    snapshot.forEach(doc => {
                        const income = doc.data();
                        const row = `<tr data-id="${doc.id}">
                            <td>${income.fecha}</td>
                            <td>${income.unidadLabel}</td>
                            <td>${income.concepto}</td>
                            <td>$${parseFloat(income.monto).toFixed(2)}</td>
                            <td class="actions">
                                <button class="btn-icon edit-income"><i data-lucide="edit-2"></i></button>
                                <button class="btn-icon btn-danger delete-income"><i data-lucide="trash-2"></i></button>
                            </td>
                        </tr>`;
                        incomeTableBody.innerHTML += row;
                    });
                    lucide.createIcons();
                }).catch(error => console.error("Error al cargar ingresos: ", error));
            };

            addIncomeButton.addEventListener('click', openIncomeModal);
            addIncomeModal.querySelectorAll('.close-button, .close-button-form').forEach(btn => btn.addEventListener('click', closeIncomeModal));
            addIncomeForm.addEventListener('submit', (e) => {
                e.preventDefault();
                
                if (!incomeUnitSelect.value) {
                    alert('Por favor, seleccione una unidad.');
                    return;
                }

                const selectedOption = incomeUnitSelect.options[incomeUnitSelect.selectedIndex];
                const incomePayload = {
                    fecha: document.getElementById('income-date').value,
                    unidadId: selectedOption.value,
                    unidadLabel: selectedOption.textContent,
                    concepto: document.getElementById('income-concept').value,
                    monto: parseFloat(document.getElementById('income-amount').value),
                    metodoPago: document.getElementById('income-method').value,
                    timestamp: firebase.firestore.FieldValue.serverTimestamp()
                };

                firestore.collection('ingresos').add(incomePayload).then(() => {
                    closeIncomeModal();
                    fetchIncomes();
                }).catch(error => {
                    console.error("Error al registrar el ingreso: ", error);
                    alert("Error al registrar el ingreso: " + error.message);
                });
            });

            // --- Lógica de Egresos ---
            const addExpenseModal = document.getElementById('add-expense-modal');
            const addExpenseButton = document.getElementById('add-expense-button');
            const addExpenseForm = document.getElementById('add-expense-form');
            const expenseTableBody = document.querySelector('#expense-table tbody');

            const openExpenseModal = () => {
                addExpenseForm.reset();
                document.getElementById('expense-date').valueAsDate = new Date();
                addExpenseModal.style.display = 'flex';
            };

            const closeExpenseModal = () => addExpenseModal.style.display = 'none';

            const fetchExpenses = () => {
                firestore.collection('egresos').orderBy('fecha', 'desc').get().then(snapshot => {
                    expenseTableBody.innerHTML = '';
                    snapshot.forEach(doc => {
                        const expense = doc.data();
                        const row = `<tr data-id="${doc.id}">
                            <td>${expense.fecha}</td>
                            <td>${expense.concepto}</td>
                            <td>${expense.categoria}</td>
                            <td>$${parseFloat(expense.monto).toFixed(2)}</td>
                            <td class="actions">
                                <button class="btn-icon edit-expense"><i data-lucide="edit-2"></i></button>
                                <button class="btn-icon btn-danger delete-expense"><i data-lucide="trash-2"></i></button>
                            </td>
                        </tr>`;
                        expenseTableBody.innerHTML += row;
                    });
                    lucide.createIcons();
                }).catch(error => console.error("Error al cargar egresos: ", error));
            };

            addExpenseButton.addEventListener('click', openExpenseModal);
            addExpenseModal.querySelectorAll('.close-button, .close-button-form').forEach(btn => btn.addEventListener('click', closeExpenseModal));
            addExpenseForm.addEventListener('submit', (e) => {
                e.preventDefault();
                const expensePayload = {
                    fecha: document.getElementById('expense-date').value,
                    concepto: document.getElementById('expense-concept').value,
                    categoria: document.getElementById('expense-category').value,
                    monto: parseFloat(document.getElementById('expense-amount').value),
                    metodoPago: document.getElementById('expense-method').value,
                    timestamp: firebase.firestore.FieldValue.serverTimestamp()
                };

                firestore.collection('egresos').add(expensePayload).then(() => {
                    closeExpenseModal();
                    fetchExpenses();
                }).catch(error => {
                    console.error("Error al registrar el egreso: ", error);
                    alert("Error al registrar el egreso: " + error.message);
                });
            });

            // --- Lógica para cerrar modales al hacer clic afuera ---
            window.addEventListener('click', (event) => {
                if (event.target == addIncomeModal) closeIncomeModal();
                if (event.target == addExpenseModal) closeExpenseModal();
            });

            // --- Carga Inicial ---
            fetchIncomes();
            fetchExpenses();
            lucide.createIcons();

        } else {
            console.log("Usuario no autenticado en la página de finanzas.");
        }
    });
});
