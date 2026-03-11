import { u_utiles } from "../../public/utilidades/u_utiles.js";
import { u_verificaciones } from "../../public/utilidades/u_verificaciones.js";
import { Alerta } from "../../public/utilidades/u_alertas.js";

export class u_horario {
    
    // ========== VARIABLES ESTÁTICAS ==========
    static carrerasDisponibles = [];
    static semestresDisponibles = [];
    static aulasDisponibles = [];
    static asignaturasDisponibles = [];
    static profesoresDisponibles = [];
    
    static clasesPorDia = {
        Lunes: [],
        Martes: [],
        Miercoles: [],
        Jueves: [],
        Viernes: []
    };
    
    static filteredAsignaturas = [];
    static filteredAulas = [];
    
    static horarioActual = null;
    static diaSeleccionado = null;

    // ========== VALIDACIONES ==========
    static validarNombreHorario(valor) {
        return u_verificaciones.validarNombre(valor);
    }
    
    static validarHora(valor) {
        return valor && valor !== '';
    }
    
    static validarTipoSesion(valor) {
        return valor && valor !== 'Ninguno';
    }
    
    static validarAsignatura(valor) {
        return valor && valor !== null && valor !== '';
    }
    
    static validarAula(valor) {
        return valor && valor !== null && valor !== '';
    }
    
    static validarObservaciones(valor) {
        return true; // Opcional
    }

    // ========== VALIDACIONES EN TIEMPO REAL ==========
    static configurarValidaciones() {
        // Validación del nombre del horario
        $('#nombreHorario').off('input').on('input', function() {
            const valor = $(this).val().trim();
            const valido = u_horario.validarNombreHorario(valor);
            u_utiles.colorearCampo(valido, '#nombreHorario', '#errorNombreHorario', 'Mínimo 3 caracteres');
        });

        // Validaciones en el modal de clase
        $('#horaInicioClase').off('change').on('change', function() {
            const valor = $(this).val();
            const valido = u_horario.validarHora(valor);
            u_utiles.colorearCampo(valido, '#horaInicioClase', '#errorHoraInicioClase', 'Seleccione una hora');
            
            // Validar que la hora de fin sea posterior
            u_horario.validarRangoHoras();
        });

        $('#horaFinClase').off('change').on('change', function() {
            const valor = $(this).val();
            const valido = u_horario.validarHora(valor);
            u_utiles.colorearCampo(valido, '#horaFinClase', '#errorHoraFinClase', 'Seleccione una hora');
            
            // Validar que la hora de fin sea posterior
            u_horario.validarRangoHoras();
        });

        $('#tipoSesionClase').off('change').on('change', function() {
            const valor = $(this).val();
            const valido = u_horario.validarTipoSesion(valor);
            u_utiles.colorearCampo(valido, '#tipoSesionClase', '#errorTipoSesionClase', 'Seleccione un tipo');
        });

        $('#comboAsignaturasClase').off('input').on('input', function() {
            const valor = $(this).val().trim();
            u_horario.filtrarAsignaturas(valor);
            
            if (valor === '') {
                $(this).removeData('selected');
                u_utiles.colorearCampo(false, '#comboAsignaturasClase', '#errorAsignaturasClase', 'Seleccione una asignatura');
            }
        });

        $('#comboAulasClase').off('input').on('input', function() {
            const valor = $(this).val().trim();
            u_horario.filtrarAulas(valor);
            
            if (valor === '') {
                $(this).removeData('selected');
                u_utiles.colorearCampo(false, '#comboAulasClase', '#errorAulasClase', 'Seleccione un aula');
            }
        });
    }

    static validarRangoHoras() {
        const horaInicio = $('#horaInicioClase').val();
        const horaFin = $('#horaFinClase').val();
        
        if (horaInicio && horaFin) {
            if (horaFin <= horaInicio) {
                u_utiles.colorearCampo(false, '#horaFinClase', '#errorHoraFinClase', 'La hora fin debe ser posterior a la hora inicio');
                return false;
            } else {
                u_utiles.colorearCampo(true, '#horaFinClase', '#errorHoraFinClase', '');
                return true;
            }
        }
        return true;
    }

    // ========== VALIDAR FORMULARIO DE CLASE ==========
    static validarFormularioClase() {
        const asignaturaId = $('#comboAsignaturasClase').data('selected');
        const aulaId = $('#comboAulasClase').data('selected');
        
        return this.validarAsignatura(asignaturaId) &&
               this.validarAula(aulaId) &&
               this.validarHora($('#horaInicioClase').val()) &&
               this.validarHora($('#horaFinClase').val()) &&
               this.validarTipoSesion($('#tipoSesionClase').val()) &&
               this.validarRangoHoras();
    }

    // ========== MANEJO DE COMBOS ==========

    // ---- COMBO DE ASIGNATURAS ----
    static inicializarComboAsignaturas(asignaturas) {
        this.asignaturasDisponibles = asignaturas || [];
        this.filteredAsignaturas = this.asignaturasDisponibles;
        
        const input = $('#comboAsignaturasClase');
        const dropdown = $('#opcionesAsignaturasClase');

        this.renderizarDropdownAsignaturas();

        input.off('focus').on('focus', () => {
            this.mostrarDropdownAsignaturas();
        });

        input.off('input').on('input', (e) => {
            const valor = $(e.target).val().trim();
            this.filtrarAsignaturas(valor);
            
            if (valor === '') {
                $(e.target).removeData('selected');
                u_utiles.colorearCampo(false, '#comboAsignaturasClase', '#errorAsignaturasClase', 'Seleccione una asignatura');
            }
        });

        input.off('keyup').on('keyup', (e) => {
            if (e.key === 'Escape') {
                this.ocultarDropdownAsignaturas();
            }
        });

        $(document).off('click').on('click', (e) => {
            if (!$(e.target).closest('.combo-input-wrapper').length) {
                this.ocultarDropdownAsignaturas();
                this.ocultarDropdownAulas();
            }
        });
    }

    static filtrarAsignaturas(searchTerm) {
        if (!searchTerm) {
            this.filteredAsignaturas = this.asignaturasDisponibles;
        } else {
            const term = searchTerm.toLowerCase();
            this.filteredAsignaturas = this.asignaturasDisponibles.filter(a => 
                (a.nombreAsignatura && a.nombreAsignatura.toLowerCase().includes(term)) ||
                (a.codigoAsignatura && a.codigoAsignatura.toLowerCase().includes(term))
            );
        }
        this.renderizarDropdownAsignaturas();
        this.mostrarDropdownAsignaturas();
    }

    static renderizarDropdownAsignaturas() {
        const dropdown = $('#opcionesAsignaturasClase');
        dropdown.empty();

        if (!this.filteredAsignaturas || this.filteredAsignaturas.length === 0) {
            dropdown.append('<div class="dropdown-option no-results">No se encontraron asignaturas</div>');
        } else {
            this.filteredAsignaturas.forEach(a => {
                if (a.idAsignatura && a.nombreAsignatura) {
                    const texto = a.codigoAsignatura ? `${a.codigoAsignatura} - ${a.nombreAsignatura}` : a.nombreAsignatura;
                    const option = $(`<div class="dropdown-option" data-id="${a.idAsignatura}">${texto}</div>`);
                    option.on('click', () => {
                        this.seleccionarAsignatura(a.idAsignatura, texto);
                    });
                    dropdown.append(option);
                }
            });
        }
    }

    static mostrarDropdownAsignaturas() {
        $('#opcionesAsignaturasClase').addClass('active');
    }

    static ocultarDropdownAsignaturas() {
        $('#opcionesAsignaturasClase').removeClass('active');
    }

    static seleccionarAsignatura(id, texto) {
        $('#comboAsignaturasClase').val(texto);
        $('#comboAsignaturasClase').data('selected', id);
        this.ocultarDropdownAsignaturas();
        u_utiles.colorearCampo(true, '#comboAsignaturasClase', '#errorAsignaturasClase', '');
        
        // Disparar evento change
        $('#comboAsignaturasClase').trigger('change');
    }

    // ---- COMBO DE AULAS ----
    static inicializarComboAulas(aulas) {
        this.aulasDisponibles = aulas || [];
        this.filteredAulas = this.aulasDisponibles;
        
        const input = $('#comboAulasClase');
        const dropdown = $('#opcionesAulasClase');

        this.renderizarDropdownAulas();

        input.off('focus').on('focus', () => {
            this.mostrarDropdownAulas();
        });

        input.off('input').on('input', (e) => {
            const valor = $(e.target).val().trim();
            this.filtrarAulas(valor);
            
            if (valor === '') {
                $(e.target).removeData('selected');
                u_utiles.colorearCampo(false, '#comboAulasClase', '#errorAulasClase', 'Seleccione un aula');
            }
        });

        input.off('keyup').on('keyup', (e) => {
            if (e.key === 'Escape') {
                this.ocultarDropdownAulas();
            }
        });
    }

    static filtrarAulas(searchTerm) {
        if (!searchTerm) {
            this.filteredAulas = this.aulasDisponibles;
        } else {
            const term = searchTerm.toLowerCase();
            this.filteredAulas = this.aulasDisponibles.filter(a => 
                a.nombreAula && a.nombreAula.toLowerCase().includes(term)
            );
        }
        this.renderizarDropdownAulas();
        this.mostrarDropdownAulas();
    }

    static renderizarDropdownAulas() {
        const dropdown = $('#opcionesAulasClase');
        dropdown.empty();

        if (!this.filteredAulas || this.filteredAulas.length === 0) {
            dropdown.append('<div class="dropdown-option no-results">No se encontraron aulas</div>');
        } else {
            this.filteredAulas.forEach(a => {
                if (a.idAula && a.nombreAula) {
                    const texto = `${a.nombreAula} (Cap: ${a.capacidad || 'N/A'})`;
                    const option = $(`<div class="dropdown-option" data-id="${a.idAula}">${texto}</div>`);
                    option.on('click', () => {
                        this.seleccionarAula(a.idAula, texto);
                    });
                    dropdown.append(option);
                }
            });
        }
    }

    static mostrarDropdownAulas() {
        $('#opcionesAulasClase').addClass('active');
    }

    static ocultarDropdownAulas() {
        $('#opcionesAulasClase').removeClass('active');
    }

    static seleccionarAula(id, texto) {
        $('#comboAulasClase').val(texto);
        $('#comboAulasClase').data('selected', id);
        this.ocultarDropdownAulas();
        u_utiles.colorearCampo(true, '#comboAulasClase', '#errorAulasClase', '');
        
        // Disparar evento change
        $('#comboAulasClase').trigger('change');
    }

    // ========== MANEJO DE CLASES POR DÍA ==========
    
    static agregarClaseAlDia(dia, claseData) {
        if (!this.clasesPorDia[dia]) {
            this.clasesPorDia[dia] = [];
        }
        
        // Asignar un ID temporal
        claseData.tempId = Date.now() + Math.random();
        this.clasesPorDia[dia].push(claseData);
        this.actualizarVistaDia(dia);
    }

    static eliminarClaseDelDia(dia, index) {
        if (this.clasesPorDia[dia] && this.clasesPorDia[dia][index]) {
            this.clasesPorDia[dia].splice(index, 1);
            this.actualizarVistaDia(dia);
        }
    }

    static actualizarVistaDia(dia) {
        const listaId = `#diasSemana${dia}-list`;
        const lista = $(listaId);
        if (!lista.length) return;

        lista.empty();

        const clases = this.clasesPorDia[dia] || [];
        
        clases.forEach((clase, index) => {
            const item = $(`
                <div class="alert alert-info p-2 mb-2" data-temp-id="${clase.tempId || ''}">
                    <div class="d-flex justify-content-between align-items-start">
                        <div>
                            <strong>${clase.asignatura?.nombreAsignatura || 'Sin asignatura'}</strong><br>
                            <small>${clase.horaInicio} - ${clase.horaFinal}</small><br>
                            <small class="text-muted">${clase.tipoSesion} | Aula: ${clase.aula?.nombreAula || 'N/A'}</small>
                            ${clase.observaciones ? `<br><small><i>${clase.observaciones}</i></small>` : ''}
                        </div>
                        <div>
                            <button class="btn btn-sm btn-outline-danger eliminar-clase" 
                                    data-dia="${dia}" 
                                    data-index="${index}"
                                    title="Eliminar clase">
                                <i class="fas fa-times"></i>
                            </button>
                        </div>
                    </div>
                </div>
            `);
            lista.append(item);
        });
    }

    static limpiarClases() {
        this.clasesPorDia = {
            Lunes: [],
            Martes: [],
            Miercoles: [],
            Jueves: [],
            Viernes: []
        };
        
        ['Lunes', 'Martes', 'Miercoles', 'Jueves', 'Viernes'].forEach(dia => {
            this.actualizarVistaDia(dia);
        });
    }

    // ========== CARGAR DATOS EN SELECTORES DE FILTRO ==========
    
    static cargarCarrerasEnFiltro(carreras) {
        this.carrerasDisponibles = carreras || [];
        const select = $('#filtroPorCarreraHorario');
        select.empty();
        select.append('<option value="Ninguno">Elegir carrera</option>');
        
        carreras.forEach(c => {
            select.append(`<option value="${c.idCarrera}">${c.nombreCarrera || 'Sin nombre'}</option>`);
        });
    }

    static cargarSemestresEnFiltro(semestres) {
        this.semestresDisponibles = semestres || [];
        const select = $('#filtroPorSemestreHorario');
        select.empty();
        select.append('<option value="Ninguno">Elegir semestre</option>');
        
        semestres.forEach(s => {
            select.append(`<option value="${s.idSemestre}">Semestre ${s.numeroSemestre || s.idSemestre}</option>`);
        });
    }

    // ========== GENERAR TABLA DE HORARIO ==========
    
    static generarTablaHorario(horario, clases, asignaturas, aulas, profesores) {
        const tbody = $('#tbodyTablaMatriculas');
        tbody.empty();

        if (!horario || !clases || clases.length === 0) {
            tbody.html('<tr><td colspan="6" class="text-center text-muted">No hay clases en este horario</td></tr>');
            return;
        }

        // Definir horas posibles
        const horas = ['08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00'];
        const dias = ['Lunes', 'Martes', 'Miercoles', 'Jueves', 'Viernes'];
        
        // Crear mapa de clases por día y hora
        const mapaClases = {};
        clases.forEach(clase => {
            const dia = clase.diaSemanal;
            const hora = clase.horaInicio.substring(0, 5); // Tomar solo HH:MM
            
            if (!mapaClases[dia]) mapaClases[dia] = {};
            if (!mapaClases[dia][hora]) mapaClases[dia][hora] = [];
            
            // Buscar información completa de asignatura y aula
            const asignatura = asignaturas.find(a => a.idAsignatura == clase.idAsignatura) || { nombreAsignatura: 'N/A' };
            const aula = aulas.find(a => a.idAula == clase.idAula) || { nombreAula: 'N/A' };
            const profesor = profesores.find(p => p.idProfesor == clase.idProfesor) || { nombreProfesor: 'N/A', apellidosProfesor: '' };
            const nombreProfesor = profesor.nombreProfesor ? `${profesor.nombreProfesor} ${profesor.apellidosProfesor || ''}`.trim() : 'N/A';
            
            mapaClases[dia][hora].push({
                ...clase,
                asignatura: asignatura,
                aula: aula,
                profesor: nombreProfesor
            });
        });

        // Generar filas por hora
        horas.forEach(hora => {
            const fila = $('<tr>');
            fila.append(`<td class="align-middle"><strong>${hora}</strong></td>`);
            
            dias.forEach(dia => {
                const clasesEnHora = mapaClases[dia]?.[hora] || [];
                let contenido = '';
                
                if (clasesEnHora.length > 0) {
                    clasesEnHora.forEach(clase => {
                        contenido += `
                            <div class="clase-cell mb-1 p-1 bg-light rounded">
                                <strong>${clase.asignatura.nombreAsignatura}</strong><br>
                                <small>${clase.tipoSesion} | ${clase.aula.nombreAula}</small><br>
                                <small class="text-muted">${clase.profesor}</small>
                                ${clase.observaciones ? `<br><small><i>${clase.observaciones}</i></small>` : ''}
                            </div>
                        `;
                    });
                } else {
                    contenido = '<span class="text-muted">-</span>';
                }
                
                fila.append(`<td class="align-middle">${contenido}</td>`);
            });
            
            tbody.append(fila);
        });
    }

    // ========== MODO EDICIÓN ==========
    
    static configurarModoEdicion(activo) {
        if (activo) {
            $('#modalNuevoHorarioLabel').text('Editar horario');
            $('#btnGuardarHorario').text('Actualizar Horario');
        } else {
            $('#modalNuevoHorarioLabel').text('Agregar nuevo horario');
            $('#btnGuardarHorario').text('Guardar Horario');
        }
    }

    // ========== LIMPIAR MODAL PRINCIPAL ==========
    
    static limpiarModal() {
        $('#formHorario')[0].reset();
        $('.errorMensaje').text('').addClass('d-none');
        $('#formHorario input, #formHorario select').removeClass('border-success border-danger');
        
        // Limpiar clases
        this.limpiarClases();
        this.horarioActual = null;
    }

    // ========== LIMPIAR MODAL DE CLASE ==========
    
    static limpiarModalClase() {
        $('#comboAsignaturasClase').val('').removeData('selected');
        $('#comboAulasClase').val('').removeData('selected');
        $('#horaInicioClase').val('');
        $('#horaFinClase').val('');
        $('#tipoSesionClase').val('Ninguno');
        $('#observacionesClase').val('');
        
        $('.errorMensaje').text('').addClass('d-none');
        $('#comboAsignaturasClase, #comboAulasClase, #horaInicioClase, #horaFinClase, #tipoSesionClase, #observacionesClase')
            .removeClass('border-success border-danger');
    }

    // ========== CARGAR DATOS EN MODAL PARA EDICIÓN ==========
    
    static cargarDatosEnModal(horario, clases, asignaturas, aulas) {
        this.limpiarModal();
        
        $('#nombreHorario').val(horario.nombre || '');
        
        // Cargar clases por día
        this.clasesPorDia = {
            Lunes: [],
            Martes: [],
            Miercoles: [],
            Jueves: [],
            Viernes: []
        };
        
        clases.forEach(clase => {
            const asignatura = asignaturas.find(a => a.idAsignatura == clase.idAsignatura);
            const aula = aulas.find(a => a.idAula == clase.idAula);
            
            const claseData = {
                idClase: clase.idClase,
                idAsignatura: clase.idAsignatura,
                idAula: clase.idAula,
                idProfesor: clase.idProfesor,
                horaInicio: clase.horaInicio,
                horaFinal: clase.horaFinal,
                tipoSesion: clase.tipoSesion,
                observaciones: clase.observaciones,
                asignatura: asignatura,
                aula: aula
            };
            
            this.clasesPorDia[clase.diaSemanal].push(claseData);
        });
        
        // Actualizar vistas
        ['Lunes', 'Martes', 'Miercoles', 'Jueves', 'Viernes'].forEach(dia => {
            this.actualizarVistaDia(dia);
        });
        
        $('#nombreHorario').trigger('input');
    }

    // ========== GENERAR BOTONES PARA TABLA DE HORARIOS ==========
    
    static generarBotonesHorario(id) {
        return `
            <div class="d-flex justify-content-center gap-1">
                <button class="btn btn-sm btn-outline-info ver-horario" title="Ver horario" data-id="${id}">
                    <i class="fas fa-eye"></i>
                </button>
                <button class="btn btn-sm btn-outline-warning editar-horario" title="Editar" data-id="${id}">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn btn-sm btn-outline-danger eliminar-horario" title="Eliminar" data-id="${id}">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `;
    }

    // ========== ACTUALIZAR TABLA DE HORARIOS ==========
    
    static actualizarTablaHorarios(dataTable, horarios) {
        if (!dataTable) return;
        
        dataTable.clear();
        
        if (!horarios || horarios.length === 0) {
            dataTable.draw();
            return;
        }

        horarios.forEach(h => {
            const fila = [
                h.nombre || 'Sin nombre',
                this.generarBotonesHorario(h.idHorario)
            ];
            
            dataTable.row.add(fila).draw(false);
        });
        
        dataTable.draw();
    }
}