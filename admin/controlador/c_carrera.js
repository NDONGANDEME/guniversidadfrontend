import { sesiones } from "../../public/core/sesiones.js"
import { u_utiles } from "../../public/utilidades/u_utiles.js";

document.addEventListener('DOMContentLoaded', function()
{
    // verificamos que existe sesion
    sesiones.verificarExistenciaSesion();
    u_utiles.cargarArchivosImportadosHTML('modalCerrarSesion', '.importandoModalCierreSesion');
    u_utiles.cargarArchivosImportadosHTML('topBar', '.importandoTopBar');
    u_utiles.botonesNavegacionAdministrador();
    u_utiles.manejoTabla();

    // Datos de ejemplo para estudiantes
        const allStudents = [
            { id: 1, name: "Juan Pérez", career: "ingenieria" },
            { id: 2, name: "María García", career: "medicina" },
            { id: 3, name: "Carlos López", career: "derecho" },
            { id: 4, name: "Ana Rodríguez", career: "administracion" },
            { id: 5, name: "Pedro Sánchez", career: "psicologia" },
            { id: 6, name: "Laura Martínez", career: "ingenieria" },
            { id: 7, name: "Miguel Fernández", career: "medicina" },
            { id: 8, name: "Sofía Gómez", career: "derecho" }
        ];

        // Inicializar el combo input de estudiantes
        function initializeComboInput() {
            const comboInput = $('#comboDepartamentoCarrera');
            const dropdownOptions = $('#opcionesDepartamentosCarrera');
            
            // Mostrar opciones al hacer focus
            comboInput.on('focus', function() {
                showStudentOptions();
            });
            
            // Filtrar opciones mientras se escribe
            comboInput.on('input', function() {
                filterStudentOptions($(this).val());
            });
            
            // Cerrar dropdown al hacer clic fuera
            $(document).on('click', function(e) {
                if (!$(e.target).closest('.combo-input-wrapper').length) {
                    dropdownOptions.removeClass('active');
                }
            });
        }

        function selectStudent(studentData) {
            selectedStudent = studentData;
            $('#comboDepartamentoCarrera').val(studentData.name);
            $('#opcionesDepartamentosCarrera').removeClass('active');
        }

        // Filtrar opciones de estudiantes
        function filterStudentOptions(searchTerm) {
            const dropdownOptions = $('#opcionesDepartamentosCarrera');
            dropdownOptions.empty();
            
            const filteredStudents = allStudents.filter(student => 
                student.name.toLowerCase().includes(searchTerm.toLowerCase())
            );
            
            if (filteredStudents.length === 0) {
                dropdownOptions.append('<div class="dropdown-option">No se encontraron estudiantes</div>');
            } else {
                filteredStudents.forEach(student => {
                    const option = $('<div class="dropdown-option"></div>')
                        .text(student.name)
                        .data('student', student);
                    
                    option.on('click', function() {
                        const studentData = $(this).data('student');
                        selectStudent(studentData);
                    });
                    
                    dropdownOptions.append(option);
                });
            }
            
            dropdownOptions.addClass('active');
        }

        // Mostrar opciones de estudiantes
        function showStudentOptions() {
            const dropdownOptions = $('#opcionesDepartamentosCarrera');
            dropdownOptions.empty();
            
            allStudents.forEach(student => {
                const option = $('<div class="dropdown-option"></div>')
                    .text(student.name)
                    .data('student', student);
                
                option.on('click', function() {
                    const studentData = $(this).data('student');
                    selectStudent(studentData);
                });
                
                dropdownOptions.append(option);
            });
            
            dropdownOptions.addClass('active');
        }

        initializeComboInput();
});