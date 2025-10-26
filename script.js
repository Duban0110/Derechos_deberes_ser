// Variables globales
let currentSection = 1;
let currentRightIndex = 0;
let selectedMood = null;
let patientData = {};
let rightsSkipped = false;
let isMedicalMode = false;
let isLoggedIn = false;
let sessionTimer = null;
let sessionCountdownTimer = null;
let sessionStartTime = null;
let patientsList = JSON.parse(localStorage.getItem('patientsList')) || [];

// Credenciales de administrador
const ADMIN_CREDENTIALS = {
    username: 'admin',
    password: 'admin'
};

// Configuración de sesión (30 minutos)
const SESSION_TIMEOUT = 30 * 60 * 1000; // 30 minutos en milisegundos

// Datos de deberes y derechos
const rightsData = [
    // DERECHOS (10 elementos)
    {
        title: "Derecho 1: Trámites Administrativos",
        content: "Tienes derecho a conocer todos los trámites administrativos necesarios para tu atención médica."
    },
    {
        title: "Derecho 2: Información Completa",
        content: "Tienes derecho a ser informado de todo lo relacionado con tu atención médica de manera clara y comprensible."
    },
    {
        title: "Derecho 3: Atención Digna",
        content: "Tienes derecho a recibir atención que salvaguarde tu dignidad personal y respete tus valores."
    },
    {
        title: "Derecho 4: Privacidad y Confidencialidad",
        content: "Tienes derecho a que se respete tu privacidad, confidencialidad de la información y contar con una historia clínica íntegra, veraz y legible."
    },
    {
        title: "Derecho 5: Trato Humano",
        content: "Tienes derecho a recibir un trato amable, cortés y humano por parte de todo el personal de la institución."
    },
    {
        title: "Derecho 6: Información sobre Enfermedad",
        content: "Tienes derecho a conocer toda la información sobre tu enfermedad, procedimientos y tratamientos."
    },
    {
        title: "Derecho 7: Personal Capacitado",
        content: "Tienes derecho a ser atendido por personal debidamente capacitado y competente."
    },
    {
        title: "Derecho 8: Medicamentos y Administración",
        content: "Tienes derecho a recibir prescripción de medicamentos y explicación clara de las vías de administración."
    },
    {
        title: "Derecho 9: Aceptar o Rechazar",
        content: "Tienes derecho a aceptar o rechazar procedimientos, dejando constancia escrita de tu decisión."
    },
    {
        title: "Derecho 10: Atención Requerida",
        content: "Tienes derecho a recibir atención requerida de acuerdo a tus necesidades específicas de salud."
    },
    // DEBERES (10 elementos)
    {
        title: "Deber 1: Orden y Aseo",
        content: "Es tu deber mantener el buen orden y aseo en la institución, cuidando las instalaciones y equipos."
    },
    {
        title: "Deber 2: Buena Fe",
        content: "Es tu deber cumplir las normas y actuar de buena fe en todo momento durante tu estancia."
    },
    {
        title: "Deber 3: Información Veraz",
        content: "Es tu deber exponer claramente tu estado de salud y la causa de tu visita de manera honesta."
    },
    {
        title: "Deber 4: Seguir Recomendaciones",
        content: "Es tu deber seguir las recomendaciones médicas prescritas para tu tratamiento y recuperación."
    },
    {
        title: "Deber 5: No Información Engañosa",
        content: "Es tu deber no solicitar servicios con información engañosa o falsa."
    },
    {
        title: "Deber 6: Colaborar con Información",
        content: "Es tu deber expresar la información que se solicita para prestar un buen servicio médico."
    },
    {
        title: "Deber 7: Informar Situaciones",
        content: "Es tu deber informar de todo acto que afecte el buen funcionamiento de la clínica."
    },
    {
        title: "Deber 8: Cumplir Citas",
        content: "Es tu deber cumplir las citas y requerimientos del personal de salud puntualmente."
    },
    {
        title: "Deber 9: Respeto al Personal",
        content: "Es tu deber respetar al personal de salud y a los demás usuarios de la institución."
    },
    {
        title: "Deber 10: Trato Amable",
        content: "Es tu deber brindar un trato amable y digno a todas las personas en la institución."
    }
];

// Mapeo de estados de ánimo
const moodMapping = {
    'muy-feliz': { emoji: '😄', label: 'Muy Feliz', priority: 'positive' },
    'feliz': { emoji: '😊', label: 'Feliz', priority: 'positive' },
    'neutral': { emoji: '😐', label: 'Neutral', priority: 'neutral' },
    'preocupado': { emoji: '😟', label: 'Preocupado', priority: 'attention' },
    'triste': { emoji: '😢', label: 'Triste', priority: 'attention' }
};

// Inicialización
document.addEventListener('DOMContentLoaded', function () {
    console.log('Iniciando aplicación...');
    loadPatientsList();
    setupFormValidation();
    setupNavigation();
    displayCurrentRight();
    setupMoodSurvey();
    setupMedicalMode();
    console.log('Aplicación iniciada correctamente');
});

// Configurar modo médico
function setupMedicalMode() {
    const toggleBtn = document.getElementById('medicalModeToggle');
    const backBtn = document.getElementById('backToPatientMode');
    const logoutBtn = document.getElementById('logoutBtn');

    if (toggleBtn) {
        toggleBtn.addEventListener('click', showLoginModal);
    }
    
    if (backBtn) {
        backBtn.addEventListener('click', () => toggleMedicalMode(false));
    }
    
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => toggleMedicalMode(false));
    }

    // Configurar filtros
    setupFilters();
}

// Función para mostrar el modal de login
function showLoginModal() {
    const loginModal = document.getElementById('loginModal');
    if (loginModal) {
        loginModal.classList.add('active');
        document.getElementById('username').focus();
        
        // Agregar listener para tecla Escape
        document.addEventListener('keydown', handleLoginKeydown);
    }
    
    // Configurar el formulario de login
    setupLoginForm();
}

// Función para manejar teclas en el modal de login
function handleLoginKeydown(e) {
    if (e.key === 'Escape') {
        hideLoginModal();
    }
}

// Función para configurar el formulario de login
function setupLoginForm() {
    const loginForm = document.getElementById('loginForm');
    const cancelBtn = document.getElementById('cancelLogin');
    
    if (loginForm) {
        // Limpiar formulario previo
        loginForm.reset();
        
        // Remover listeners previos
        const newForm = loginForm.cloneNode(true);
        loginForm.parentNode.replaceChild(newForm, loginForm);
        
        // Configurar nuevo listener
        const updatedForm = document.getElementById('loginForm');
        if (updatedForm) {
            updatedForm.addEventListener('submit', handleLogin);
        }
    }
    
    if (cancelBtn) {
        // Remover listener previo
        const newCancelBtn = cancelBtn.cloneNode(true);
        cancelBtn.parentNode.replaceChild(newCancelBtn, cancelBtn);
        
        // Configurar nuevo listener
        const updatedCancelBtn = document.getElementById('cancelLogin');
        if (updatedCancelBtn) {
            updatedCancelBtn.addEventListener('click', hideLoginModal);
        }
    }
}

// Función para manejar el login
function handleLogin(e) {
    e.preventDefault();
    
    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value.trim();
    const loginError = document.getElementById('loginError');
    
    // Validar credenciales
    if (username === ADMIN_CREDENTIALS.username && password === ADMIN_CREDENTIALS.password) {
        isLoggedIn = true;
        hideLoginModal();
        toggleMedicalMode(true);
        startSessionTimer();
        console.log('Login exitoso - Acceso médico autorizado');
    } else {
        // Mostrar error
        if (loginError) {
            loginError.style.display = 'block';
        }
        
        // Limpiar contraseña
        document.getElementById('password').value = '';
        document.getElementById('password').focus();
        
        console.log('Login fallido - Credenciales incorrectas');
    }
}

// Función para iniciar el timer de sesión
function startSessionTimer() {
    // Limpiar timer previo si existe
    if (sessionTimer) {
        clearTimeout(sessionTimer);
    }
    
    // Establecer tiempo de inicio de sesión
    sessionStartTime = Date.now();
    
    // Configurar nuevo timer
    sessionTimer = setTimeout(() => {
        console.log('Sesión expirada - Cerrando automáticamente');
        alert('Tu sesión ha expirado por inactividad. Por favor, inicia sesión nuevamente.');
        logout();
    }, SESSION_TIMEOUT);
    
    // Iniciar contador visual
    startSessionCountdown();
    
    console.log('Timer de sesión iniciado - Expira en 30 minutos');
}

// Función para iniciar el contador visual de sesión
function startSessionCountdown() {
    const sessionTimerElement = document.getElementById('sessionTimer');
    const sessionIconElement = document.querySelector('.session-icon');
    if (!sessionTimerElement) return;
    
    // Limpiar timer previo si existe
    if (sessionCountdownTimer) {
        clearInterval(sessionCountdownTimer);
    }
    
    function updateTimer() {
        if (!isLoggedIn || !isMedicalMode || !sessionStartTime) return;
        
        const now = Date.now();
        const elapsed = now - sessionStartTime;
        const remaining = Math.max(0, SESSION_TIMEOUT - elapsed);
        
        if (remaining <= 0) {
            sessionTimerElement.textContent = '00:00';
            if (sessionIconElement) sessionIconElement.textContent = '🔴';
            return;
        }
        
        const minutes = Math.floor(remaining / 60000);
        const seconds = Math.floor((remaining % 60000) / 1000);
        
        sessionTimerElement.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        
        // Cambiar color e icono según el tiempo restante
        if (remaining < 5 * 60 * 1000) {
            sessionTimerElement.style.color = '#e74c3c';
            if (sessionIconElement) sessionIconElement.textContent = '🔴';
            showSessionWarning(true);
        } else if (remaining < 10 * 60 * 1000) {
            sessionTimerElement.style.color = '#f39c12';
            if (sessionIconElement) sessionIconElement.textContent = '🟡';
            showSessionWarning(false);
        } else {
            sessionTimerElement.style.color = 'var(--color-primary)';
            if (sessionIconElement) sessionIconElement.textContent = '🟢';
            showSessionWarning(false);
        }
    }
    
    // Actualizar inmediatamente y luego cada segundo
    updateTimer();
    sessionCountdownTimer = setInterval(updateTimer, 1000);
}

// Función para extender la sesión
function extendSession() {
    if (isLoggedIn && isMedicalMode && sessionStartTime) {
        // Solo extender el timer de expiración, no resetear el contador
        if (sessionTimer) {
            clearTimeout(sessionTimer);
        }
        
        // Recalcular tiempo restante basado en el tiempo transcurrido
        const elapsed = Date.now() - sessionStartTime;
        const remaining = Math.max(0, SESSION_TIMEOUT - elapsed);
        
        if (remaining > 0) {
            sessionTimer = setTimeout(() => {
                console.log('Sesión expirada - Cerrando automáticamente');
                alert('Tu sesión ha expirado por inactividad. Por favor, inicia sesión nuevamente.');
                logout();
            }, remaining);
            
            console.log('Sesión extendida - Tiempo restante:', Math.floor(remaining / 60000), 'minutos');
        }
    }
}

// Función para cerrar sesión
function logout() {
    isLoggedIn = false;
    isMedicalMode = false;
    
    // Limpiar timer de sesión
    if (sessionTimer) {
        clearTimeout(sessionTimer);
        sessionTimer = null;
    }
    
    // Limpiar contador visual
    if (sessionCountdownTimer) {
        clearInterval(sessionCountdownTimer);
        sessionCountdownTimer = null;
    }
    
    // Limpiar tiempo de inicio
    sessionStartTime = null;
    
    // Limpiar detección de actividad
    if (window.medicalActivityHandler) {
        const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
        events.forEach(event => {
            document.removeEventListener(event, window.medicalActivityHandler, true);
        });
        window.medicalActivityHandler = null;
    }
    
    // Ocultar vista médica
    const medicalView = document.getElementById('medicalView');
    if (medicalView) {
        medicalView.classList.remove('active');
    }
    
    // Restaurar vista de paciente
    const patientHeader = document.getElementById('patientHeader');
    const progressBar = document.getElementById('progressBar');
    if (patientHeader) patientHeader.style.display = 'block';
    if (progressBar) progressBar.style.display = 'flex';
    
    // Mostrar botón de modo médico
    const medicalToggleBtn = document.getElementById('medicalModeToggle');
    if (medicalToggleBtn) medicalToggleBtn.style.display = 'inline-block';
    
    // Restaurar sección del paciente
    restorePatientSection();
    updateProgressBar();
    
    console.log('Sesión cerrada');
}

// Función para ocultar el modal de login
function hideLoginModal() {
    const loginModal = document.getElementById('loginModal');
    if (loginModal) {
        loginModal.classList.remove('active');
        
        // Remover listener de teclado
        document.removeEventListener('keydown', handleLoginKeydown);
    }
    
    // Limpiar error
    const loginError = document.getElementById('loginError');
    if (loginError) {
        loginError.style.display = 'none';
    }
}

function toggleMedicalMode(show) {
    console.log('Cambiando a modo médico:', show);
    isMedicalMode = show;
    
    const medicalView = document.getElementById('medicalView');
    const patientHeader = document.getElementById('patientHeader');
    const progressBar = document.getElementById('progressBar');
    const sections = document.querySelectorAll('.section');
    const completionMessage = document.getElementById('completionMessage');
    const medicalToggleBtn = document.getElementById('medicalModeToggle');

    if (isMedicalMode) {
        // MODO MÉDICO ACTIVADO
        console.log('Activando modo médico...');
        
        if (medicalView) medicalView.classList.add('active');
        if (patientHeader) patientHeader.style.display = 'none';
        if (progressBar) progressBar.style.display = 'none';
        if (completionMessage) completionMessage.style.display = 'none';
        if (medicalToggleBtn) medicalToggleBtn.style.display = 'none';

        // Ocultar todas las secciones
        sections.forEach(section => {
            section.style.display = 'none';
            section.classList.remove('active');
        });

        updateMedicalView();
        
        // Configurar detección de actividad para extender sesión
        setupActivityDetection();
        
    } else {
        // MODO PACIENTE ACTIVADO
        console.log('Regresando a modo paciente...');
        console.log('Sección actual:', currentSection);
        
        // Cerrar sesión médica
        logout();

        // Limpiar todas las secciones primero
        sections.forEach(section => {
            section.style.display = 'none';
            section.classList.remove('active');
        });

        // Restaurar la sección correcta
        restorePatientSection();
        
        // Restaurar la barra de progreso
        updateProgressBar();

        // Re-inicializar todos los event listeners
        reinitializeEventListeners();
    }
}

// Función para configurar detección de actividad
function setupActivityDetection() {
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
    
    const activityHandler = () => {
        if (isLoggedIn && isMedicalMode) {
            extendSession();
        }
    };
    
    events.forEach(event => {
        document.addEventListener(event, activityHandler, true);
    });
    
    // Limpiar listeners previos al cerrar sesión
    window.medicalActivityHandler = activityHandler;
}

function restorePatientSection() {
    console.log('Restaurando sección:', currentSection);
    
    const sections = ['', 'registration', 'rights', 'exercises', 'mood'];
    
    // Si se completó todo, mostrar mensaje de finalización
    if (currentSection > 4 || (patientData.mood && patientData.completedAt)) {
        console.log('Mostrando mensaje de finalización');
        const completionMessage = document.getElementById('completionMessage');
        if (completionMessage) {
            completionMessage.style.display = 'block';
        }
        return;
    }

    // Mostrar la sección actual
    const sectionId = sections[currentSection];
    const sectionElement = document.getElementById(sectionId);
    
    if (sectionElement) {
        console.log('Mostrando sección:', sectionId);
        sectionElement.style.display = 'block';
        sectionElement.classList.add('active');
    } else {
        console.error('No se encontró la sección:', sectionId);
        // Si no se encuentra, mostrar registro por defecto
        const registration = document.getElementById('registration');
        if (registration) {
            registration.style.display = 'block';
            registration.classList.add('active');
        }
        currentSection = 1;
    }
}

function updateProgressBar() {
    console.log('Actualizando barra de progreso...');
    
    // Limpiar todos los estados
    document.querySelectorAll('.progress-step').forEach(step => {
        step.classList.remove('active', 'completed');
    });

    // Marcar pasos completados
    for (let i = 1; i < currentSection; i++) {
        const step = document.querySelector(`.progress-step[data-step="${i}"]`);
        if (step) {
            step.classList.add('completed');
            console.log('Paso completado:', i);
        }
    }

    // Marcar paso actual como activo (solo si no se completó todo)
    if (currentSection <= 4) {
        const currentStep = document.querySelector(`.progress-step[data-step="${currentSection}"]`);
        if (currentStep) {
            currentStep.classList.add('active');
            console.log('Paso activo:', currentSection);
        }
    }
}

function reinitializeEventListeners() {
    console.log('Reinicializando event listeners...');
    
    // Reinicializar formulario
    setupFormValidation();
    
    // Reinicializar navegación
    setupNavigation();
    
    // Reinicializar encuesta de ánimo
    setupMoodSurvey();
    
    // Actualizar contenido de derechos
    displayCurrentRight();
    
    console.log('Event listeners reinicializados');
}

function updateMedicalView() {
    updateStatistics();
    updatePatientsTable();
    updateServiceFilter();
}

function updateStatistics() {
    const totalPatients = patientsList.length;
    const completedSurveys = patientsList.filter(p => p.mood).length;
    const positivePatients = patientsList.filter(p => p.mood && (p.mood === 'muy-feliz' || p.mood === 'feliz')).length;
    const needAttentionPatients = patientsList.filter(p => p.mood && (p.mood === 'preocupado' || p.mood === 'triste')).length;

    const elements = {
        totalPatients: document.getElementById('totalPatients'),
        completedSurveys: document.getElementById('completedSurveys'),
        positivePatients: document.getElementById('positivePatients'),
        needAttentionPatients: document.getElementById('needAttentionPatients')
    };

    if (elements.totalPatients) elements.totalPatients.textContent = totalPatients;
    if (elements.completedSurveys) elements.completedSurveys.textContent = completedSurveys;
    if (elements.positivePatients) elements.positivePatients.textContent = positivePatients;
    if (elements.needAttentionPatients) elements.needAttentionPatients.textContent = needAttentionPatients;
}

function updatePatientsTable(filteredPatients = null) {
    const tbody = document.getElementById('patientsTableBody');
    const noDataMessage = document.getElementById('noPatientsMessage');
    const patients = filteredPatients || patientsList;

    if (!tbody) return;

    if (patients.length === 0) {
        tbody.innerHTML = '';
        if (noDataMessage) noDataMessage.style.display = 'block';
        return;
    }

    if (noDataMessage) noDataMessage.style.display = 'none';
    
    tbody.innerHTML = patients.map((patient, index) => {
        const moodInfo = patient.mood ? moodMapping[patient.mood] : null;
        const rightsStatus = patient.rightsSkipped ? '❌ Omitido' : '✅ Revisado';
        const timestamp = new Date(patient.timestamp).toLocaleString('es-CO');
        
        return `
            <tr>
                <td class="patient-id">P${String(index + 1).padStart(3, '0')}</td>
                <td><strong>${patient.fullName}</strong></td>
                <td>${patient.documentType} ${patient.documentNumber}</td>
                <td>${patient.room}</td>
                <td>${patient.service}</td>
                <td>
                    ${moodInfo ? `
                        <div class="mood-indicator">
                            <span class="mood-emoji">${moodInfo.emoji}</span>
                            <span class="mood-text mood-${patient.mood}">${moodInfo.label}</span>
                        </div>
                    ` : '<span style="color: #999;">Sin completar</span>'}
                </td>
                <td>${rightsStatus}</td>
                <td><small>${timestamp}</small></td>
            </tr>
        `;
    }).join('');
}

function updateServiceFilter() {
    const serviceFilter = document.getElementById('filterService');
    if (!serviceFilter) return;
    
    const services = [...new Set(patientsList.map(p => p.service))].sort();
    
    serviceFilter.innerHTML = '<option value="">Todos los servicios</option>' +
        services.map(service => `<option value="${service}">${service}</option>`).join('');
}

function setupFilters() {
    const searchInput = document.getElementById('searchPatient');
    const moodFilter = document.getElementById('filterMood');
    const serviceFilter = document.getElementById('filterService');

    function applyFilters() {
        const searchTerm = searchInput ? searchInput.value.toLowerCase() : '';
        const selectedMood = moodFilter ? moodFilter.value : '';
        const selectedService = serviceFilter ? serviceFilter.value : '';

        const filtered = patientsList.filter(patient => {
            const matchesSearch = !searchTerm || 
                patient.fullName.toLowerCase().includes(searchTerm) ||
                patient.documentNumber.includes(searchTerm);
            
            const matchesMood = !selectedMood || patient.mood === selectedMood;
            const matchesService = !selectedService || patient.service === selectedService;

            return matchesSearch && matchesMood && matchesService;
        });

        updatePatientsTable(filtered);
    }

    if (searchInput) searchInput.addEventListener('input', applyFilters);
    if (moodFilter) moodFilter.addEventListener('change', applyFilters);
    if (serviceFilter) serviceFilter.addEventListener('change', applyFilters);
}

function loadPatientsList() {
    try {
        const savedPatients = localStorage.getItem('patientsList');
        if (savedPatients) {
            patientsList = JSON.parse(savedPatients);
            console.log('Pacientes cargados:', patientsList.length);
        }
    } catch (e) {
        console.error('Error al cargar datos de pacientes:', e);
        patientsList = [];
    }
}

function savePatientsList() {
    try {
        localStorage.setItem('patientsList', JSON.stringify(patientsList));
        console.log('Pacientes guardados:', patientsList.length);
    } catch (e) {
        console.error('Error al guardar datos de pacientes:', e);
    }
}

// Configurar validación del formulario
function setupFormValidation() {
    const form = document.getElementById('patientForm');
    if (!form) {
        console.log('Formulario no encontrado');
        return;
    }

    // Remover listeners previos clonando el formulario
    const newForm = form.cloneNode(true);
    form.parentNode.replaceChild(newForm, form);

    const fields = {
        fullName: {
            pattern: /^[a-záéíóúñ\s]{3,60}$/i,
            message: 'El nombre debe contener solo letras y espacios, entre 3 y 60 caracteres'
        },
        documentType: {
            required: true,
            message: 'Debe seleccionar un tipo de documento'
        },
        documentNumber: {
            pattern: /^\d{10}$/,
            message: 'El número de documento debe contener exactamente 10 dígitos'
        },
        room: {
            pattern: /^[a-z0-9\-]{2,10}$/i,
            message: 'Formato de habitación inválido (ej: 402A, H-203)'
        },
        service: {
            pattern: /^[a-záéíóúñ\s]{3,30}$/i,
            message: 'El servicio debe contener solo letras y espacios, entre 3 y 30 caracteres'
        }
    };

    // Configurar validación en tiempo real
    Object.keys(fields).forEach(fieldName => {
        const field = document.getElementById(fieldName);
        if (field) {
            field.addEventListener('input', () => validateField(field, fields[fieldName]));
            field.addEventListener('blur', () => validateField(field, fields[fieldName]));
        }
    });

    // Configurar envío del formulario
    const updatedForm = document.getElementById('patientForm');
    if (updatedForm) {
        updatedForm.addEventListener('submit', function (e) {
            e.preventDefault();
            console.log('Formulario enviado');

            let isValid = true;
            Object.keys(fields).forEach(fieldName => {
                const field = document.getElementById(fieldName);
                if (field && !validateField(field, fields[fieldName])) {
                    isValid = false;
                }
            });

            if (isValid) {
                console.log('Formulario válido, avanzando...');
                const formData = new FormData(updatedForm);
                patientData = Object.fromEntries(formData);
                patientData.timestamp = Date.now();
                nextSection();
            } else {
                console.log('Formulario inválido');
            }
        });
    }

    console.log('Validación del formulario configurada');
}

function validateField(field, rules) {
    const formGroup = field.parentElement;
    const errorMessage = formGroup.querySelector('.error-message');
    let isValid = true;

    formGroup.classList.remove('error');

    if (rules.required && !field.value.trim()) {
        isValid = false;
    } else if (rules.pattern && field.value.trim() && !rules.pattern.test(field.value.trim())) {
        isValid = false;
    }

    if (!isValid) {
        formGroup.classList.add('error');
        if (errorMessage) {
            errorMessage.textContent = rules.message;
        }
    }

    return isValid;
}

// Configurar navegación
function setupNavigation() {
    console.log('Configurando navegación...');

    // Limpiar listeners previos y configurar nuevos
    const buttons = [
        { id: 'skipRightsBtn', handler: skipRightsSection },
        { id: 'prevRight', handler: handlePrevRight },
        { id: 'nextRight', handler: handleNextRight },
        { id: 'backToRights', handler: previousSection },
        { id: 'goToSurvey', handler: nextSection },
        { id: 'backToExercises', handler: previousSection },
        { id: 'completeSurvey', handler: completeSurvey }
    ];

    buttons.forEach(({ id, handler }) => {
        const button = document.getElementById(id);
        if (button) {
            // Remover listener previo clonando el botón
            const newButton = button.cloneNode(true);
            button.parentNode.replaceChild(newButton, button);
            
            // Agregar nuevo listener
            const updatedButton = document.getElementById(id);
            if (updatedButton) {
                updatedButton.addEventListener('click', handler);
                console.log(`Listener configurado para: ${id}`);
            }
        }
    });

    console.log('Navegación configurada');
}

function handlePrevRight() {
    if (currentRightIndex > 0) {
        currentRightIndex--;
        displayCurrentRight();
    } else {
        previousSection();
    }
}

function handleNextRight() {
    if (currentRightIndex < rightsData.length - 1) {
        currentRightIndex++;
        displayCurrentRight();
    } else {
        nextSection();
    }
}

function skipRightsSection() {
    console.log('Omitiendo sección de derechos...');
    rightsSkipped = true;
    
    const currentStep = document.querySelector(`.progress-step[data-step="${currentSection}"]`);
    if (currentStep) {
        currentStep.classList.add('completed');
        currentStep.classList.remove('active');
    }
    
    nextSection();
    
    const skipNotice = document.getElementById('skipNotice');
    if (skipNotice) {
        skipNotice.style.display = 'block';
    }
}

function displayCurrentRight() {
    const rightsCard = document.getElementById('rightsCard');
    const rightsCounter = document.getElementById('rightsCounter');
    
    if (!rightsCard || !rightsCounter) return;
    
    const currentRight = rightsData[currentRightIndex];
    if (!currentRight) return;

    rightsCounter.textContent = `${currentRightIndex + 1} de ${rightsData.length}`;

    const isRight = currentRightIndex < 10;
    const indicator = isRight ? '⚖️ DERECHO' : '📋 DEBER';
    const indicatorColor = isRight ? 'var(--color-primary)' : 'var(--color-accent)';

    rightsCard.innerHTML = `
        <div style="color: ${indicatorColor}; font-weight: bold; margin-bottom: 1rem; font-size: 0.9rem;">
            ${indicator}
        </div>
        <h3>${currentRight.title}</h3>
        <p>${currentRight.content}</p>
    `;

    // Actualizar textos de botones
    const prevBtn = document.getElementById('prevRight');
    const nextBtn = document.getElementById('nextRight');
    if (prevBtn) prevBtn.textContent = currentRightIndex === 0 ? 'Anterior' : 'Anterior';
    if (nextBtn) nextBtn.textContent = currentRightIndex === rightsData.length - 1 ? 'Continuar' : 'Siguiente';
}

function setupMoodSurvey() {
    console.log('Configurando encuesta de ánimo...');
    
    const moodOptions = document.querySelectorAll('.mood-option');
    const completeButton = document.getElementById('completeSurvey');

    // Limpiar listeners previos
    moodOptions.forEach(option => {
        const newOption = option.cloneNode(true);
        option.parentNode.replaceChild(newOption, option);
    });

    // Configurar nuevos listeners
    const updatedMoodOptions = document.querySelectorAll('.mood-option');
    updatedMoodOptions.forEach(option => {
        option.addEventListener('click', function () {
            console.log('Mood seleccionado:', this.dataset.mood);
            updatedMoodOptions.forEach(opt => opt.classList.remove('selected'));
            this.classList.add('selected');
            selectedMood = this.dataset.mood;
            if (completeButton) {
                completeButton.disabled = false;
            }
        });
    });

    console.log('Encuesta de ánimo configurada');
}

function nextSection() {
    console.log('Avanzando a siguiente sección desde:', currentSection);
    
    if (currentSection < 4) {
        // Ocultar sección actual
        const currentSectionElement = document.querySelector('.section.active');
        if (currentSectionElement) {
            currentSectionElement.classList.remove('active');
            currentSectionElement.style.display = 'none';
        }
        
        // Marcar paso como completado
        const currentStep = document.querySelector(`.progress-step[data-step="${currentSection}"]`);
        if (currentStep) {
            currentStep.classList.add('completed');
            currentStep.classList.remove('active');
        }

        // Incrementar sección
        currentSection++;
        console.log('Nueva sección:', currentSection);

        // Mostrar nueva sección
        const sections = ['', 'registration', 'rights', 'exercises', 'mood'];
        const newSection = document.getElementById(sections[currentSection]);
        if (newSection) {
            newSection.classList.add('active');
            newSection.style.display = 'block';
        }
        
        // Activar nuevo paso
        const newStep = document.querySelector(`.progress-step[data-step="${currentSection}"]`);
        if (newStep) {
            newStep.classList.add('active');
        }
    }
}

function previousSection() {
    console.log('Regresando a sección anterior desde:', currentSection);
    
    if (currentSection > 1) {
        // Ocultar sección actual
        const currentSectionElement = document.querySelector('.section.active');
        if (currentSectionElement) {
            currentSectionElement.classList.remove('active');
            currentSectionElement.style.display = 'none';
        }
        
        // Remover estado activo del paso actual
        const currentStep = document.querySelector(`.progress-step[data-step="${currentSection}"]`);
        if (currentStep) {
            currentStep.classList.remove('active');
        }

        // Ocultar aviso de omisión si estamos saliendo de ejercicios
        if (currentSection === 4) {
            const skipNotice = document.getElementById('skipNotice');
            if (skipNotice) {
                skipNotice.style.display = 'none';
            }
        }

        // Decrementar sección
        currentSection--;
        console.log('Nueva sección:', currentSection);

        // Restaurar estado de derechos si se había omitido
        if (currentSection === 2 && rightsSkipped) {
            rightsSkipped = false;
        }

        // Mostrar sección anterior
        const sections = ['', 'registration', 'rights', 'exercises', 'mood'];
        const prevSectionElement = document.getElementById(sections[currentSection]);
        if (prevSectionElement) {
            prevSectionElement.classList.add('active');
            prevSectionElement.style.display = 'block';
        }
        
        // Activar paso anterior y remover completed
        const prevStep = document.querySelector(`.progress-step[data-step="${currentSection}"]`);
        if (prevStep) {
            prevStep.classList.add('active');
            prevStep.classList.remove('completed');
        }
    }
}

function completeSurvey() {
    if (!selectedMood) {
        console.log('No hay mood seleccionado');
        return;
    }

    console.log('Completando encuesta...');
    
    // Guardar datos
    patientData.mood = selectedMood;
    patientData.rightsSkipped = rightsSkipped;
    patientData.completedAt = Date.now();

    // Agregar a lista y guardar
    patientsList.push({ ...patientData });
    savePatientsList();

    // Marcar como completado
    const currentStep = document.querySelector(`.progress-step[data-step="${currentSection}"]`);
    if (currentStep) {
        currentStep.classList.add('completed');
        currentStep.classList.remove('active');
    }
    
    // Ocultar sección actual
    const currentSectionElement = document.querySelector('.section.active');
    if (currentSectionElement) {
        currentSectionElement.classList.remove('active');
        currentSectionElement.style.display = 'none';
    }
    
    // Mostrar mensaje de finalización
    const completionMessage = document.getElementById('completionMessage');
    if (completionMessage) {
        completionMessage.style.display = 'block';
        completionMessage.scrollIntoView({ behavior: 'smooth' });
    }

    // Marcar como completado
    currentSection = 5;

    console.log('Encuesta completada:', patientData);
}

// Función para reiniciar la aplicación
window.resetApp = function () {
    console.log('Reiniciando aplicación...');
    
    // Resetear variables
    currentSection = 1;
    currentRightIndex = 0;
    selectedMood = null;
    patientData = {};
    rightsSkipped = false;
    isLoggedIn = false;

    // Limpiar timers de sesión
    if (sessionTimer) {
        clearTimeout(sessionTimer);
        sessionTimer = null;
    }
    if (sessionCountdownTimer) {
        clearInterval(sessionCountdownTimer);
        sessionCountdownTimer = null;
    }
    sessionStartTime = null;

    // Resetear formulario
    const form = document.getElementById('patientForm');
    if (form) form.reset();

    // Limpiar validaciones
    document.querySelectorAll('.form-group').forEach(group => {
        group.classList.remove('error');
    });

    // Resetear progreso
    document.querySelectorAll('.progress-step').forEach(step => {
        step.classList.remove('active', 'completed');
    });
    const firstStep = document.querySelector('.progress-step[data-step="1"]');
    if (firstStep) firstStep.classList.add('active');

    // Resetear secciones
    document.querySelectorAll('.section').forEach(section => {
        section.classList.remove('active');
        section.style.display = 'none';
    });
    const registrationSection = document.getElementById('registration');
    if (registrationSection) {
        registrationSection.classList.add('active');
        registrationSection.style.display = 'block';
    }

    // Resetear encuesta de ánimo
    document.querySelectorAll('.mood-option').forEach(option => {
        option.classList.remove('selected');
    });
    const completeSurveyBtn = document.getElementById('completeSurvey');
    if (completeSurveyBtn) completeSurveyBtn.disabled = true;

    // Ocultar mensajes
    const completionMessage = document.getElementById('completionMessage');
    const skipNotice = document.getElementById('skipNotice');
    if (completionMessage) completionMessage.style.display = 'none';
    if (skipNotice) skipNotice.style.display = 'none';

    // Resetear derechos
    currentRightIndex = 0;
    displayCurrentRight();

    // Salir del modo médico si estaba activo
    if (isMedicalMode) {
        toggleMedicalMode(false);
    }
    
    // Ocultar modal de login si está visible
    hideLoginModal();

    // Reinicializar todo
    setTimeout(() => {
        setupFormValidation();
        setupNavigation();
        setupMoodSurvey();
        console.log('Aplicación reiniciada completamente');
    }, 100);

    // Scroll hacia arriba
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Funcionalidad de teclado para accesibilidad
document.addEventListener('keydown', function (e) {
    // Solo funcionar si no estamos en modo médico
    if (isMedicalMode) return;
    
    if (currentSection === 2) {
        if (e.key === 'ArrowLeft' && currentRightIndex > 0) {
            currentRightIndex--;
            displayCurrentRight();
        } else if (e.key === 'ArrowRight' && currentRightIndex < rightsData.length - 1) {
            currentRightIndex++;
            displayCurrentRight();
        } else if (e.key.toLowerCase() === 's') {
            skipRightsSection();
        }
    }

    if (currentSection === 4 && e.key >= '1' && e.key <= '5') {
        const moodOptions = document.querySelectorAll('.mood-option');
        const selectedIndex = parseInt(e.key) - 1;
        if (selectedIndex < moodOptions.length) {
            moodOptions.forEach(opt => opt.classList.remove('selected'));
            moodOptions[selectedIndex].classList.add('selected');
            selectedMood = moodOptions[selectedIndex].dataset.mood;
            const completeSurveyBtn = document.getElementById('completeSurvey');
            if (completeSurveyBtn) {
                completeSurveyBtn.disabled = false;
            }
        }
    }
});

function showTooltip(element, message) {
    const tooltip = document.createElement('div');
    tooltip.className = 'tooltip';
    tooltip.textContent = message;
    tooltip.style.cssText = `
        position: absolute;
        background: var(--color-text);
        color: white;
        padding: 8px 12px;
        border-radius: 6px;
        font-size: 0.9rem;
        z-index: 1000;
        pointer-events: none;
        opacity: 0;
        transition: opacity 0.3s ease;
    `;

    document.body.appendChild(tooltip);

    const rect = element.getBoundingClientRect();
    tooltip.style.left = rect.left + 'px';
    tooltip.style.top = (rect.bottom + 5) + 'px';

    setTimeout(() => tooltip.style.opacity = '1', 10);

    setTimeout(() => {
        tooltip.style.opacity = '0';
        setTimeout(() => {
            if (document.body.contains(tooltip)) {
                document.body.removeChild(tooltip);
            }
        }, 300);
    }, 3000);
}

// Agregar tooltips informativos
document.addEventListener('DOMContentLoaded', function () {
    const roomField = document.getElementById('room');
    if (roomField) {
        roomField.addEventListener('focus', function () {
            showTooltip(this, 'Ejemplos: 402A, H-203, B-150');
        });
    }
});

// Función para mostrar/ocultar advertencia de sesión
function showSessionWarning(show) {
    const sessionWarning = document.getElementById('sessionWarning');
    if (sessionWarning) {
        sessionWarning.style.display = show ? 'block' : 'none';
    }
}