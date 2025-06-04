document.addEventListener('DOMContentLoaded', function() {
    // Variables globales
    let currentUser = null;
    let patients = JSON.parse(localStorage.getItem('patients')) || [];
    const itemsPerPage = 10;
    let currentPage = 1;
    
    // Elementos del DOM
    const loginSystem = document.getElementById('loginSystem');
    const mainSystem = document.getElementById('mainSystem');
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm'); // This is now the "Register System User" form
    const showRegisterUserFormBtn = document.getElementById('showRegisterUserFormBtn'); // New button to show register user form
    const hideRegisterUserFormBtn = document.getElementById('hideRegisterUserFormBtn'); // New button to hide register user form
    const registerUserCard = document.getElementById('registerUserCard'); // The new card containing the register user form

    const togglePassword = document.getElementById('togglePassword');
    const toggleRegisterPassword = document.getElementById('toggleRegisterPassword');
    const logoutBtn = document.getElementById('logoutBtn');
    const patientForm = document.getElementById('patientForm');
    const patientsTable = document.getElementById('patientsTable').getElementsByTagName('tbody')[0];
    const searchInput = document.getElementById('searchInput');
    const searchBtn = document.getElementById('searchBtn');
    const pagination = document.getElementById('pagination');
    const patientModal = new bootstrap.Modal(document.getElementById('patientModal'));
    const criticalAlertModal = new bootstrap.Modal(document.getElementById('criticalAlertModal'));

    // Document type radio buttons
    const ciRadio = document.getElementById('ci');
    const pasaporteRadio = document.getElementById('pasaporte');
    const extranjeroRadio = document.getElementById('extranjero');
    const documentoInput = document.getElementById('documento');
    const documentoHelp = document.getElementById('documentoHelp');

    // Inicializar el sistema
    initSystem();
    
    // Función para inicializar el sistema
    function initSystem() {
        // Verificar si hay un usuario logueado
        const loggedInUser = localStorage.getItem('currentUser');
        if (loggedInUser) {
            currentUser = JSON.parse(loggedInUser);
            showMainSystem();
        } else {
            showLoginSystem();
        }
        
        // Configurar eventos
        setupEventListeners();
        // Initial call to set correct help text
        updateDocumentHelpText(); 
    }
    
    // Configurar event listeners
    function setupEventListeners() {
        // Login/Register
        loginForm.addEventListener('submit', handleLogin);
        registerForm.addEventListener('submit', handleRegisterUser); // Changed function name
        logoutBtn.addEventListener('click', handleLogout);
        togglePassword.addEventListener('click', togglePasswordVisibility);
        toggleRegisterPassword.addEventListener('click', toggleRegisterPasswordVisibility);

        // Show/Hide Register System User Form
        showRegisterUserFormBtn.addEventListener('click', () => registerUserCard.style.display = 'block');
        hideRegisterUserFormBtn.addEventListener('click', () => {
            registerUserCard.style.display = 'none';
            registerForm.reset(); // Clear the form when hiding
        });
        
        // Patient Form
        patientForm.addEventListener('submit', handlePatientSubmit);
        
        // Document validation listeners
        ciRadio.addEventListener('change', updateDocumentHelpText);
        pasaporteRadio.addEventListener('change', updateDocumentHelpText);
        extranjeroRadio.addEventListener('change', updateDocumentHelpText);
        documentoInput.addEventListener('input', validateDocument); // Existing validation, now updates on input

        // Search
        searchInput.addEventListener('keyup', handleSearch);
        searchBtn.addEventListener('click', handleSearch);
        
        // Modals
        document.getElementById('printPatientBtn').addEventListener('click', printPatientDetails);
    }
    
    // Mostrar sistema de login
    function showLoginSystem() {
        loginSystem.style.display = 'flex';
        mainSystem.style.display = 'none';
    }
    
    // Mostrar sistema principal
    function showMainSystem() {
        loginSystem.style.display = 'none';
        mainSystem.style.display = 'block';
        document.getElementById('currentUser').textContent = currentUser.username;
        
        // Actualizar la interfaz
        updatePatientsTable();
        updateStats();
    }
    
    // Alternar visibilidad de contraseña
    function togglePasswordVisibility() {
        const passwordInput = document.getElementById('loginPassword');
        const icon = this.querySelector('i');
        
        if (passwordInput.type === 'password') {
            passwordInput.type = 'text';
            icon.classList.remove('fa-eye');
            icon.classList.add('fa-eye-slash');
        } else {
            passwordInput.type = 'password';
            icon.classList.remove('fa-eye-slash');
            icon.classList.add('fa-eye');
        }
    }
    
    // Alternar visibilidad de contraseña en registro
    function toggleRegisterPasswordVisibility() {
        const passwordInput = document.getElementById('registerPassword');
        const icon = this.querySelector('i');
        
        if (passwordInput.type === 'password') {
            passwordInput.type = 'text';
            icon.classList.remove('fa-eye');
            icon.classList.add('fa-eye-slash');
        } else {
            passwordInput.type = 'password';
            icon.classList.remove('fa-eye-slash');
            icon.classList.add('fa-eye');
        }
    }
    
    // Manejar login
    function handleLogin(e) {
        e.preventDefault();
        
        const username = document.getElementById('loginUser').value;
        const password = document.getElementById('loginPassword').value;
        
        // Validación simple
        if (!username || !password) {
            alert('Por favor ingrese usuario y contraseña');
            return;
        }
        
        // Verificar credenciales (en un sistema real esto sería con backend)
        const users = JSON.parse(localStorage.getItem('users')) || [];
        const user = users.find(u => u.username === username && u.password === password);
        
        if (user) {
            currentUser = user;
            localStorage.setItem('currentUser', JSON.stringify(user));
            showMainSystem();
        } else {
            alert('Usuario o contraseña incorrectos');
        }
    }
    
    // Manejar registro de USUARIO DEL SISTEMA
    function handleRegisterUser(e) {
        e.preventDefault();
        
        const username = document.getElementById('registerUser').value;
        const password = document.getElementById('registerPassword').value;
        const confirmPassword = document.getElementById('registerConfirm').value;
        const email = document.getElementById('registerEmail').value;
        
        // Validaciones
        if (!username || !password || !confirmPassword || !email) {
            alert('Por favor complete todos los campos');
            return;
        }
        
        if (password.length < 8) {
            alert('La contraseña debe tener al menos 8 caracteres');
            return;
        }
        
        if (password !== confirmPassword) {
            alert('Las contraseñas no coinciden');
            return;
        }
        
        if (!validateEmail(email)) {
            alert('Por favor ingrese un email válido');
            return;
        }
        
        // Registrar usuario (en un sistema real esto sería con backend)
        const users = JSON.parse(localStorage.getItem('users')) || [];
        
        // Verificar si el usuario ya existe
        if (users.some(u => u.username === username)) {
            alert('El nombre de usuario ya está en uso');
            return;
        }
        
        const newUser = {
            username,
            password, // En un sistema real, nunca almacenar contraseñas en texto plano
            email,
            createdAt: new Date().toISOString()
        };
        
        users.push(newUser);
        localStorage.setItem('users', JSON.stringify(users));
        
        alert('Registro de usuario exitoso.');
        registerUserCard.style.display = 'none'; // Hide the form after successful registration
        registerForm.reset();
    }
    
    // Validar email
    function validateEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    }
    
    // Manejar logout
    function handleLogout() {
        localStorage.removeItem('currentUser');
        currentUser = null;
        showLoginSystem();
    }
    
    // Actualizar el texto de ayuda del documento
    function updateDocumentHelpText() {
        const docType = document.querySelector('input[name="tipoDocumento"]:checked').value;
        let message = '';
        if (docType === 'CI') {
            message = 'Formato requerido: X.XXX.XXX-X (Ej. 1.234.567-8)';
        } else if (docType === 'Pasaporte') {
            message = 'Formato requerido: 2 letras seguidas de 6 números (Ej. AB123456)';
        } else { // Documento Extranjero
            message = 'Mínimo 5 caracteres alfanuméricos';
        }
        documentoHelp.textContent = message;
        // Re-validate the current input when type changes
        validateDocument.call(documentoInput);
    }

    // Validar documento según tipo seleccionado
    function validateDocument() {
        const docInput = this;
        const docValue = docInput.value.trim(); // Trim whitespace
        const docType = document.querySelector('input[name="tipoDocumento"]:checked').value;
        let isValid = true;
        
        docInput.classList.remove('is-valid', 'is-invalid');
        documentoHelp.classList.remove('text-success', 'text-danger');

        if (docValue.length === 0) {
            documentoHelp.textContent = `Formato requerido: ${getHelpMessageForDocumentType(docType)}`;
            return; // Don't show invalid state if empty
        }

        if (docType === 'CI') {
            // Validar CI (ejemplo: 1.234.567-8)
            // Permite el formato con o sin puntos y guion inicialmente para mejorar la UX
            const ciRegex = /^\d{1,2}(\.\d{3}){2}-[\dkK]$/; // More flexible regex for input, strict for final validation
            isValid = ciRegex.test(docValue);
        } else if (docType === 'Pasaporte') {
            // Validar pasaporte (ejemplo: AB123456)
            const passportRegex = /^[A-Za-z]{2}\d{6}$/;
            isValid = passportRegex.test(docValue);
        } else {
            // Documento extranjero (mínimo 5 caracteres, solo alfanuméricos)
            const extranjeroRegex = /^[a-zA-Z0-9]{5,}$/;
            isValid = extranjeroRegex.test(docValue);
        }
        
        if (isValid) {
            docInput.classList.add('is-valid');
            documentoHelp.classList.add('text-success');
        } else {
            docInput.classList.add('is-invalid');
            documentoHelp.classList.add('text-danger');
        }
    }

    function getHelpMessageForDocumentType(docType) {
        if (docType === 'CI') {
            return 'X.XXX.XXX-X (Ej. 1.234.567-8)';
        } else if (docType === 'Pasaporte') {
            return '2 letras seguidas de 6 números (Ej. AB123456)';
        } else {
            return 'Mínimo 5 caracteres alfanuméricos';
        }
    }

    // Manejar envío de formulario de paciente
    function handlePatientSubmit(e) {
        e.preventDefault();
        
        const nombre = document.getElementById('nombre').value;
        const edad = document.getElementById('edad').value;
        const genero = document.getElementById('genero').value;
        const tipoDocumento = document.querySelector('input[name="tipoDocumento"]:checked').value;
        const documento = document.getElementById('documento').value;
        const sintomas = document.getElementById('sintomas').value;
        const gravedad = document.getElementById('gravedad').value;
        const tratamiento = document.getElementById('tratamiento').value;
        const medicamentosSelected = Array.from(document.getElementById('medicamentos').selectedOptions).map(option => option.value);
        const examenesChecked = Array.from(document.querySelectorAll('#examenes input[type="checkbox"]:checked')).map(checkbox => checkbox.value);
        const observaciones = document.getElementById('observaciones').value;

        // Basic validation for patient registration
        if (!nombre || !edad || !genero || !documento || !sintomas || !gravedad) {
            alert('Por favor complete todos los campos obligatorios del paciente.');
            return;
        }

        // Validate document input before saving patient
        const docInput = document.getElementById('documento');
        const docValue = docInput.value.trim();
        const docType = document.querySelector('input[name="tipoDocumento"]:checked').value;
        let docIsValid = true;

        if (docType === 'CI') {
            const ciRegex = /^\d{1,2}\.\d{3}\.\d{3}-[\dkK]$/; // Stricter regex for final saving
            docIsValid = ciRegex.test(docValue);
        } else if (docType === 'Pasaporte') {
            const passportRegex = /^[A-Za-z]{2}\d{6}$/;
            docIsValid = passportRegex.test(docValue);
        } else {
            const extranjeroRegex = /^[a-zA-Z0-9]{5,}$/;
            docIsValid = extranjeroRegex.test(docValue);
        }

        if (!docIsValid) {
            alert(`El formato del número de documento no es válido para el tipo "${tipoDocumento}". Por favor, revise el formato.`);
            docInput.classList.add('is-invalid'); // Add invalid class if it's not already
            documentoHelp.classList.add('text-danger');
            return;
        }
        
        const newPatient = {
            id: Date.now(), // Simple unique ID
            nombre,
            edad: parseInt(edad),
            genero,
            tipoDocumento,
            documento,
            sintomas,
            gravedad,
            tratamiento,
            medicamentos: medicamentosSelected,
            examenes: examenesChecked,
            observaciones,
            fechaRegistro: new Date().toISOString()
        };
        
        patients.push(newPatient);
        localStorage.setItem('patients', JSON.stringify(patients));
        
        alert('Paciente registrado con éxito!');
        patientForm.reset();
        documentoInput.classList.remove('is-valid', 'is-invalid'); // Clear validation styles
        documentoHelp.classList.remove('text-success', 'text-danger');
        updateDocumentHelpText(); // Reset help text to default for CI

        updatePatientsTable();
        updateStats();

        // Show critical alert if severity is "Crítico"
        if (gravedad === 'Crítico') {
            document.getElementById('criticalPatientDetails').innerHTML = `
                <strong>Nombre:</strong> ${newPatient.nombre}<br>
                <strong>Documento:</strong> ${newPatient.documento}<br>
                <strong>Síntomas:</strong> ${newPatient.sintomas}<br>
                <strong>Gravedad:</strong> <span class="text-danger">${newPatient.gravedad}</span>
            `;
            criticalAlertModal.show();
        }
    }
    
    // Actualizar tabla de pacientes
    function updatePatientsTable() {
        patientsTable.innerHTML = ''; // Clear existing rows
        const filteredPatients = getFilteredPatients();
        const totalPages = Math.ceil(filteredPatients.length / itemsPerPage);
        
        // Ensure currentPage is not out of bounds
        if (currentPage > totalPages && totalPages > 0) {
            currentPage = totalPages;
        } else if (totalPages === 0) {
            currentPage = 1;
        }

        const start = (currentPage - 1) * itemsPerPage;
        const end = start + itemsPerPage;
        const patientsToDisplay = filteredPatients.slice(start, end);

        if (patientsToDisplay.length === 0 && filteredPatients.length > 0) {
            // If current page is empty after filtering, go back to first page
            currentPage = 1;
            updatePatientsTable(); // Recurse to re-render from first page
            return;
        }
        
        patientsToDisplay.forEach(patient => {
            const row = patientsTable.insertRow();
            row.dataset.patientId = patient.id; // Store ID for easy lookup
            
            // Apply color coding based on severity
            let severityClass = '';
            if (patient.gravedad === 'Leve') severityClass = 'table-success';
            else if (patient.gravedad === 'Moderado') severityClass = 'table-warning';
            else if (patient.gravedad === 'Urgente') severityClass = 'table-danger'; // Using danger for urgent as well, consider a different class
            else if (patient.gravedad === 'Crítico') severityClass = 'table-danger fw-bold'; // Make critical bold
            row.classList.add(severityClass);

            row.innerHTML = `
                <td>${patient.nombre}</td>
                <td>${patient.edad}</td>
                <td>${patient.genero}</td>
                <td>${patient.documento}</td>
                <td>${patient.sintomas.substring(0, 50)}${patient.sintomas.length > 50 ? '...' : ''}</td>
                <td>${patient.gravedad}</td>
                <td>
                    <button class="btn btn-sm btn-info view-btn me-1" data-id="${patient.id}" title="Ver Detalles"><i class="fas fa-eye"></i></button>
                    <button class="btn btn-sm btn-danger delete-btn" data-id="${patient.id}" title="Eliminar Paciente"><i class="fas fa-trash"></i></button>
                </td>
            `;
        });
        
        // Add event listeners for view and delete buttons
        document.querySelectorAll('.view-btn').forEach(button => {
            button.addEventListener('click', showPatientDetails);
        });
        document.querySelectorAll('.delete-btn').forEach(button => {
            button.addEventListener('click', deletePatient);
        });

        renderPagination(totalPages);
    }

    // Filtrar pacientes por búsqueda
    function getFilteredPatients() {
        const searchTerm = searchInput.value.toLowerCase();
        if (!searchTerm) {
            return patients;
        }
        return patients.filter(patient => 
            patient.nombre.toLowerCase().includes(searchTerm) ||
            patient.documento.toLowerCase().includes(searchTerm) ||
            patient.sintomas.toLowerCase().includes(searchTerm)
        );
    }
    
    // Manejar búsqueda
    function handleSearch() {
        currentPage = 1; // Reset to first page on new search
        updatePatientsTable();
    }

    // Renderizar paginación
    function renderPagination(totalPages) {
        pagination.innerHTML = '';
        if (totalPages <= 1) return;

        // Previous button
        const prevItem = document.createElement('li');
        prevItem.classList.add('page-item');
        if (currentPage === 1) prevItem.classList.add('disabled');
        prevItem.innerHTML = `<a class="page-link" href="#" aria-label="Previous"><span aria-hidden="true">&laquo;</span></a>`;
        prevItem.addEventListener('click', (e) => {
            e.preventDefault();
            if (currentPage > 1) {
                currentPage--;
                updatePatientsTable();
            }
        });
        pagination.appendChild(prevItem);

        // Page numbers
        for (let i = 1; i <= totalPages; i++) {
            const pageItem = document.createElement('li');
            pageItem.classList.add('page-item');
            if (i === currentPage) pageItem.classList.add('active');
            pageItem.innerHTML = `<a class="page-link" href="#">${i}</a>`;
            pageItem.addEventListener('click', (e) => {
                e.preventDefault();
                currentPage = i;
                updatePatientsTable();
            });
            pagination.appendChild(pageItem);
        }

        // Next button
        const nextItem = document.createElement('li');
        nextItem.classList.add('page-item');
        if (currentPage === totalPages) nextItem.classList.add('disabled');
        nextItem.innerHTML = `<a class="page-link" href="#" aria-label="Next"><span aria-hidden="true">&raquo;</span></a>`;
        nextItem.addEventListener('click', (e) => {
            e.preventDefault();
            if (currentPage < totalPages) {
                currentPage++;
                updatePatientsTable();
            }
        });
        pagination.appendChild(nextItem);
    }
    
    // Mostrar detalles del paciente en modal
    function showPatientDetails(e) {
        const patientId = parseInt(e.currentTarget.dataset.id);
        const patient = patients.find(p => p.id === patientId);
        
        if (patient) {
            const modalBody = document.getElementById('patientModalBody');
            modalBody.innerHTML = `
                <p><strong>Nombre Completo:</strong> ${patient.nombre}</p>
                <p><strong>Edad:</strong> ${patient.edad}</p>
                <p><strong>Género:</strong> ${patient.genero}</p>
                <p><strong>Documento:</strong> ${patient.tipoDocumento} - ${patient.documento}</p>
                <p><strong>Síntomas:</strong> ${patient.sintomas}</p>
                <p><strong>Nivel de Gravedad:</strong> <span class="badge ${getSeverityBadgeClass(patient.gravedad)}">${patient.gravedad}</span></p>
                <p><strong>Tratamiento Inicial:</strong> ${patient.tratamiento || 'N/A'}</p>
                <p><strong>Medicamentos Administrados:</strong> ${patient.medicamentos.length > 0 ? patient.medicamentos.join(', ') : 'Ninguno'}</p>
                <p><strong>Exámenes Solicitados:</strong> ${patient.examenes.length > 0 ? patient.examenes.join(', ') : 'Ninguno'}</p>
                <p><strong>Observaciones:</strong> ${patient.observaciones || 'N/A'}</p>
                <p><small>Fecha de Registro: ${new Date(patient.fechaRegistro).toLocaleString()}</small></p>
            `;
            patientModal.show();
        }
    }

    function getSeverityBadgeClass(gravedad) {
        switch (gravedad) {
            case 'Leve': return 'bg-success';
            case 'Moderado': return 'bg-warning text-dark';
            case 'Urgente': return 'bg-danger';
            case 'Crítico': return 'bg-dark'; // Or bg-danger
            default: return 'bg-secondary';
        }
    }
    
    // Eliminar paciente
    function deletePatient(e) {
        const patientId = parseInt(e.currentTarget.dataset.id);
        if (confirm('¿Está seguro de que desea eliminar este paciente?')) {
            patients = patients.filter(p => p.id !== patientId);
            localStorage.setItem('patients', JSON.stringify(patients));
            updatePatientsTable();
            updateStats();
        }
    }
    
    // Actualizar estadísticas
    function updateStats() {
        document.getElementById('totalPacientes').textContent = patients.length;
        document.getElementById('criticosCount').textContent = patients.filter(p => p.gravedad === 'Crítico').length;
        document.getElementById('urgentesCount').textContent = patients.filter(p => p.gravedad === 'Urgente').length;
        document.getElementById('levesCount').textContent = patients.filter(p => p.gravedad === 'Leve').length;
    }

    // Función para imprimir detalles del paciente
    function printPatientDetails() {
        const printContent = document.getElementById('patientModalBody').innerHTML;
        const originalContents = document.body.innerHTML;

        document.body.innerHTML = `
            <div style="font-family: Arial, sans-serif; padding: 20px;">
                <h1>Detalles del Paciente</h1>
                ${printContent}
            </div>
        `;
        window.print();
        document.body.innerHTML = originalContents; // Restore original content
        window.location.reload(); // Reload to ensure all event listeners are re-attached (simpler than re-attaching manually)
    }
});