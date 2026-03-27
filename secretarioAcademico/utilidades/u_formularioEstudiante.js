import { u_verificaciones } from "../../public/utilidades/u_verificaciones.js";
import { u_utiles } from "../../public/utilidades/u_utiles.js";

/**
 * Utilidades para el formulario de estudiantes
 */
export class u_formularioEstudiante {

    /**
     * Genera el código de asignatura
     * @param {number} numero - Número secuencial
     * @returns {string} - Código generado
     */
    static generarCodigoEstudiante(numero) {
        const numeroFormateado = numero.toString().padStart(4, '0');

        return `${numeroFormateado}`;
    }
    
    /**
     * CONFIGURAR COMBO DE PAÍSES
     */
    static configurarComboPaises(inputId, dropdownId, paises) {
        const input = document.getElementById(inputId);
        const dropdown = document.getElementById(dropdownId);
        
        if (!input || !dropdown) return;
        
        let selectedValue = null;
        
        const filtrarOpciones = () => {
            const texto = input.value.toLowerCase().trim();
            const filtrados = paises.filter(pais => 
                pais.toLowerCase().includes(texto)
            );
            
            let html = '';
            if (filtrados.length === 0) {
                html = '<div class="dropdown-option no-results text-muted p-2">No se encontraron resultados</div>';
            } else {
                filtrados.forEach(pais => {
                    html += `<div class="dropdown-option p-2 hover-bg-light" data-valor="${this.escapeHTML(pais)}" style="cursor: pointer;">${this.escapeHTML(pais)}</div>`;
                });
            }
            
            dropdown.innerHTML = html;
            dropdown.classList.add('active');
        };
        
        const seleccionarOpcion = (option) => {
            const valor = option.dataset.valor;
            input.value = valor;
            selectedValue = valor;
            dropdown.classList.remove('active');
            u_utiles.colorearCampo(true, `#${inputId}`, null);
        };
        
        input.addEventListener('input', () => {
            filtrarOpciones();
            selectedValue = null;
        });
        
        input.addEventListener('click', () => filtrarOpciones());
        
        dropdown.addEventListener('click', (e) => {
            const option = e.target.closest('.dropdown-option');
            if (option && !option.classList.contains('no-results')) {
                seleccionarOpcion(option);
            }
        });
        
        document.addEventListener('click', (e) => {
            if (!input.contains(e.target) && !dropdown.contains(e.target)) {
                dropdown.classList.remove('active');
            }
        });
        
        return {
            getSelected: () => selectedValue,
            setSelected: (valor) => {
                if (valor && paises.includes(valor)) {
                    input.value = valor;
                    selectedValue = valor;
                }
            }
        };
    }

    /**
     * CONFIGURAR COMBO CON OPCIÓN "NUEVO"
     */
    static configurarComboConNuevo(inputId, dropdownId, opciones, onNuevo) {
        const input = document.getElementById(inputId);
        const dropdown = document.getElementById(dropdownId);
        
        if (!input || !dropdown) return;
        
        let selectedValue = null;
        
        const filtrarOpciones = () => {
            const texto = input.value.toLowerCase().trim();
            
            let filtrados = opciones.filter(opt => 
                opt.toLowerCase().includes(texto)
            );
            
            let html = '';
            
            if (texto && !opciones.some(opt => opt.toLowerCase() === texto)) {
                html += `<div class="dropdown-option option-nuevo p-2 text-warning" data-nuevo="true" data-valor="${this.escapeHTML(texto)}" style="cursor: pointer;">
                    <i class="fas fa-plus-circle me-2"></i> Nuevo: "${this.escapeHTML(texto)}"
                </div>`;
            }
            
            if (filtrados.length === 0 && !texto) {
                html += '<div class="dropdown-option no-results text-muted p-2">No hay opciones disponibles</div>';
            } else if (filtrados.length > 0) {
                filtrados.forEach(opt => {
                    html += `<div class="dropdown-option p-2 hover-bg-light" data-valor="${this.escapeHTML(opt)}" style="cursor: pointer;">${this.escapeHTML(opt)}</div>`;
                });
            }
            
            dropdown.innerHTML = html;
            dropdown.classList.add('active');
        };
        
        const seleccionarOpcion = (option) => {
            const esNuevo = option.dataset.nuevo === 'true';
            const valor = option.dataset.valor;
            
            if (esNuevo && onNuevo) {
                onNuevo(valor);
                if (opciones && !opciones.includes(valor)) {
                    opciones.push(valor);
                }
            }
            
            input.value = valor;
            selectedValue = valor;
            dropdown.classList.remove('active');
            u_utiles.colorearCampo(true, `#${inputId}`, null);
        };
        
        input.addEventListener('input', () => {
            filtrarOpciones();
            selectedValue = null;
        });
        
        input.addEventListener('click', () => filtrarOpciones());
        
        dropdown.addEventListener('click', (e) => {
            const option = e.target.closest('.dropdown-option');
            if (option && !option.classList.contains('no-results')) {
                seleccionarOpcion(option);
            }
        });
        
        document.addEventListener('click', (e) => {
            if (!input.contains(e.target) && !dropdown.contains(e.target)) {
                dropdown.classList.remove('active');
            }
        });
        
        return {
            getSelected: () => selectedValue,
            setSelected: (valor) => {
                if (valor) {
                    input.value = valor;
                    selectedValue = valor;
                }
            }
        };
    }

    /**
     * CREAR BLOQUE DE FAMILIAR
     */
    static crearBloqueFamiliar(index, datos = null) {
        const nombre = datos?.nombre || '';
        const apellidos = datos?.apellidos || '';
        const dip = datos?.dipFamiliar || '';
        const direccion = datos?.direccion || '';
        const correo = datos?.correoFamiliar || '';
        const telefono = datos?.telefono || '';
        const parentesco = datos?.parentesco || '';
        const esContacto = (datos?.esContactoIncidentes === 1 || datos?.esContactoIncidentes === true) ? 'Sí' : 'No';
        const esResponsable = (datos?.esResponsablePago === 1 || datos?.esResponsablePago === true) ? 'Sí' : 'No';
        
        return `
            <div class="familiar-bloque border rounded p-3 mb-3 position-relative">
                <button type="button" class="btn-close btn-eliminar-familiar position-absolute top-0 end-0 mt-2 me-2" aria-label="Eliminar"></button>
                
                <div class="row">
                    <div class="col-md-4 mb-2">
                        <label class="form-label small">Nombre</label>
                        <input type="text" class="form-control form-control-sm" name="familiar_nombre[]" value="${this.escapeHTML(nombre)}" placeholder="Ej: Martín">
                    </div>
                    <div class="col-md-4 mb-2">
                        <label class="form-label small">Apellidos</label>
                        <input type="text" class="form-control form-control-sm" name="familiar_apellidos[]" value="${this.escapeHTML(apellidos)}" placeholder="Ej: Lola">
                    </div>
                    <div class="col-md-4 mb-2">
                        <label class="form-label small">DIP</label>
                        <input type="text" class="form-control form-control-sm" name="familiar_dip[]" value="${this.escapeHTML(dip)}" placeholder="Ej: 000 000 000">
                    </div>
                </div>
                
                <div class="row">
                    <div class="col-md-4 mb-2">
                        <label class="form-label small">Dirección</label>
                        <input type="text" class="form-control form-control-sm" name="familiar_direccion[]" value="${this.escapeHTML(direccion)}" placeholder="Ej: Avenida las Palmas">
                    </div>
                    <div class="col-md-4 mb-2">
                        <label class="form-label small">Correo</label>
                        <input type="email" class="form-control form-control-sm" name="familiar_correo[]" value="${this.escapeHTML(correo)}" placeholder="Ej: familiar@email.com">
                    </div>
                    <div class="col-md-4 mb-2">
                        <label class="form-label small">Teléfono</label>
                        <input type="tel" class="form-control form-control-sm" name="familiar_telefono[]" value="${this.escapeHTML(telefono)}" placeholder="Ej: +240 222 123 456">
                    </div>
                </div>
                
                <div class="row">
                    <div class="col-md-4 mb-2">
                        <label class="form-label small">Parentezco</label>
                        <input type="text" class="form-control form-control-sm" name="familiar_parentesco[]" value="${this.escapeHTML(parentesco)}" placeholder="Ej: Padre">
                    </div>
                    <div class="col-md-4 mb-2">
                        <label class="form-label small">¿Es contacto incidente?</label>
                        <select class="form-select form-select-sm" name="familiar_contactoIncidente[]">
                            <option value="No" ${esContacto === 'No' ? 'selected' : ''}>No</option>
                            <option value="Sí" ${esContacto === 'Sí' ? 'selected' : ''}>Sí</option>
                        </select>
                    </div>
                    <div class="col-md-4 mb-2">
                        <label class="form-label small">¿Es responsable de pago?</label>
                        <select class="form-select form-select-sm" name="familiar_responsablePago[]">
                            <option value="No" ${esResponsable === 'No' ? 'selected' : ''}>No</option>
                            <option value="Sí" ${esResponsable === 'Sí' ? 'selected' : ''}>Sí</option>
                        </select>
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * CREAR BLOQUE DE BECA
     */
    static crearBloqueBeca(index, datos = null) {
        const institucion = datos?.institucionBeca || '';
        const tipo = datos?.tipoBeca || 'Ninguno';
        const estado = datos?.estado || 'Ninguno';
        const fechaInicio = datos?.fechaInicio ? datos.fechaInicio.split('T')[0] : '';
        const fechaFin = datos?.fechaFinal ? datos.fechaFinal.split('T')[0] : '';
        const observaciones = datos?.observaciones || '';
        
        return `
            <div class="beca-bloque border rounded p-3 mb-3 position-relative">
                <button type="button" class="btn-close btn-eliminar-beca position-absolute top-0 end-0 mt-2 me-2" aria-label="Eliminar"></button>
                
                <div class="row">
                    <div class="col-md-6 mb-2">
                        <label class="form-label small">Institución</label>
                        <input type="text" class="form-control form-control-sm" name="beca_institucion[]" value="${this.escapeHTML(institucion)}" placeholder="Ej: AAUCA">
                    </div>
                    <div class="col-md-3 mb-2">
                        <label class="form-label small">Tipo</label>
                        <select class="form-select form-select-sm" name="beca_tipo[]">
                            <option value="Ninguno" ${tipo === 'Ninguno' ? 'selected' : ''}>Seleccione...</option>
                            <option value="Externa" ${tipo === 'Externa' ? 'selected' : ''}>Externa</option>
                            <option value="Interna" ${tipo === 'Interna' ? 'selected' : ''}>Interna</option>
                        </select>
                    </div>
                    <div class="col-md-3 mb-2">
                        <label class="form-label small">Estado</label>
                        <select class="form-select form-select-sm" name="beca_estado[]">
                            <option value="Ninguno" ${estado === 'Ninguno' ? 'selected' : ''}>Seleccione...</option>
                            <option value="Vigente" ${estado === 'Vigente' ? 'selected' : ''}>Vigente</option>
                            <option value="No vigente" ${estado === 'No vigente' ? 'selected' : ''}>No vigente</option>
                        </select>
                    </div>
                </div>
                
                <div class="row">
                    <div class="col-md-3 mb-2">
                        <label class="form-label small">Fecha inicio</label>
                        <input type="date" class="form-control form-control-sm" name="beca_fechaInicio[]" value="${fechaInicio}">
                    </div>
                    <div class="col-md-3 mb-2">
                        <label class="form-label small">Fecha fin</label>
                        <input type="date" class="form-control form-control-sm" name="beca_fechaFin[]" value="${fechaFin}">
                    </div>
                    <div class="col-md-6 mb-2">
                        <label class="form-label small">Observaciones</label>
                        <textarea class="form-control form-control-sm" name="beca_observaciones[]" rows="1" placeholder="Observaciones">${this.escapeHTML(observaciones)}</textarea>
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * CONFIGURAR VALIDACIONES
     */
    static configurarValidaciones() {
        const campoCorreo = document.getElementById('correoEstudianteMatricula');
        if (campoCorreo) {
            campoCorreo.addEventListener('input', () => {
                const valido = u_verificaciones.validarCorreo(campoCorreo.value);
                u_utiles.colorearCampo(valido, '#correoEstudianteMatricula', '#errorCorreoEstudianteMatricula', 
                    valido ? '' : 'Formato de correo inválido (ej: usuario@dominio.com)');
            });
        }
        
        const campoTelefono = document.getElementById('telefonoEstudianteMatricula');
        if (campoTelefono) {
            campoTelefono.addEventListener('input', () => {
                const valido = u_verificaciones.validarTelefono(campoTelefono.value);
                u_utiles.colorearCampo(valido, '#telefonoEstudianteMatricula', '#errorTelefonoEstudianteMatricula',
                    valido ? '' : 'Formato inválido (ej: +240 222 123 456)');
            });
        }
        
        const campoDip = document.getElementById('dipEstudianteMatricula');
        if (campoDip) {
            campoDip.addEventListener('input', () => {
                const valido = u_verificaciones.validarDIP(campoDip.value);
                u_utiles.colorearCampo(valido, '#dipEstudianteMatricula', '#errorDipEstudianteMatricula',
                    valido ? '' : 'Formato inválido (ej: 000 000 000)');
            });
        }
        
        const campoNombre = document.getElementById('nombreEstudianteMatricula');
        if (campoNombre) {
            campoNombre.addEventListener('input', () => {
                const valido = u_verificaciones.validarNombre(campoNombre.value);
                u_utiles.colorearCampo(valido, '#nombreEstudianteMatricula', '#errorNombreEstudianteMatricula',
                    valido ? '' : 'Nombre inválido (mínimo 3 caracteres)');
            });
        }
    }

    /**
     * GENERAR CURSO ACADÉMICO
     */
    static generarCursoAcademico() {
        const añoActual = new Date().getFullYear();
        return `${añoActual}/${añoActual + 1}`;
    }

    /**
     * FORMATEAR FECHA
     */
    static formatearFecha(fecha) {
        if (!fecha) return '';
        try {
            const date = new Date(fecha);
            if (isNaN(date.getTime())) return fecha;
            return date.toLocaleDateString('es-ES');
        } catch (e) {
            return fecha;
        }
    }

    /**
 * INICIALIZAR VALORES POR DEFECTO
 */
static inicializarValoresPorDefecto() {
    // Fecha actual para fecha de nacimiento
    const fechaActual = new Date().toISOString().split('T')[0];
    const fechaNacimiento = document.getElementById('fechaNacimientoEstudianteMatricula');
    if (fechaNacimiento && !fechaNacimiento.value) {
        // No establecer fecha por defecto, dejar vacío
    }
    
    // Curso académico actual para matrícula
    const cursoAcademico = document.getElementById('cursoAcademicoMatricula');
    if (cursoAcademico && !cursoAcademico.value) {
        cursoAcademico.value = this.generarCursoAcademico();
    }
    
    // Fecha actual para matrícula
    const fechaMatricula = document.getElementById('fechaMatricula');
    if (fechaMatricula && !fechaMatricula.value) {
        fechaMatricula.value = fechaActual;
    }
    
    // Fecha actual para pago
    const fechaPago = document.getElementById('fechaPagoEstudiante');
    if (fechaPago && !fechaPago.value) {
        fechaPago.value = fechaActual;
    }
    
    // Resetear selects a valores por defecto
    const selects = ['modalidadMatricula', 'estadosMatricula', 'generosEstudianteMatricula'];
    selects.forEach(id => {
        const select = document.getElementById(id);
        if (select && select.value === 'Ninguno') {
            // Mantener como está
        }
    });
}

/**
 * CONFIGURAR CHECKBOX BECARIO
 */
static configurarCheckboxBecario() {
    const checkBecario = document.getElementById('esBecario');
    const contBecario = document.getElementById('contDatosBecario');
    
    if (checkBecario && contBecario) {
        const toggleBecario = () => {
            if (checkBecario.checked) {
                contBecario.classList.remove('d-none');
            } else {
                contBecario.classList.add('d-none');
            }
        };
        
        checkBecario.addEventListener('change', toggleBecario);
        toggleBecario(); // Estado inicial
    }
}

/**
 * CONFIGURAR EVENTOS DE FAMILIARES
 */
static configurarEventosFamiliares() {
    const btnAñadir = document.getElementById('añadirContactos');
    if (btnAñadir) {
        btnAñadir.addEventListener('click', () => {
            const container = document.getElementById('contenedorFamiliares');
            if (container) {
                const index = container.children.length;
                const nuevoBloque = u_estudiante.crearBloqueFamiliar(index);
                container.insertAdjacentHTML('beforeend', nuevoBloque);
                this.configurarEventosEliminarFamiliar();
            }
        });
    }
    
    this.configurarEventosEliminarFamiliar();
}

/**
 * CONFIGURAR EVENTOS ELIMINAR FAMILIAR
 */
static configurarEventosEliminarFamiliar() {
    document.querySelectorAll('.btn-eliminar-familiar').forEach(btn => {
        btn.removeEventListener('click', this.handleEliminarFamiliar);
        btn.addEventListener('click', this.handleEliminarFamiliar);
    });
}

static handleEliminarFamiliar(e) {
    const bloque = e.target.closest('.familiar-bloque');
    if (bloque && document.querySelectorAll('.familiar-bloque').length > 1) {
        bloque.remove();
    } else {
        Alerta.notificarAdvertencia('Debe haber al menos un familiar registrado', 1500);
    }
}

/**
 * CONFIGURAR EVENTOS DE BECAS
 */
static configurarEventosBecas() {
    const btnAñadir = document.getElementById('añadirBecas');
    if (btnAñadir) {
        btnAñadir.addEventListener('click', () => {
            const container = document.getElementById('contenedorBecas');
            if (container) {
                const index = container.children.length;
                const nuevoBloque = u_estudiante.crearBloqueBeca(index);
                container.insertAdjacentHTML('beforeend', nuevoBloque);
                this.configurarEventosEliminarBeca();
            }
        });
    }
    
    this.configurarEventosEliminarBeca();
}

/**
 * CONFIGURAR EVENTOS ELIMINAR BECA
 */
static configurarEventosEliminarBeca() {
    document.querySelectorAll('.btn-eliminar-beca').forEach(btn => {
        btn.removeEventListener('click', this.handleEliminarBeca);
        btn.addEventListener('click', this.handleEliminarBeca);
    });
}

static handleEliminarBeca(e) {
    const bloque = e.target.closest('.beca-bloque');
    if (bloque && document.querySelectorAll('.beca-bloque').length > 1) {
        bloque.remove();
    } else {
        Alerta.notificarAdvertencia('Debe haber al menos una beca registrada', 1500);
    }
}

/**
 * CONFIGURAR BOTONES DE SECCIONES
 */
static configurarBotonesSecciones() {
    const btnDatosPersonales = document.getElementById('btnDatosPersonales');
    const btnMatricula = document.getElementById('btnMatricula');
    const btnDatosAcademicos = document.getElementById('btnDatosAcademicos');
    
    const seccionPersonales = document.getElementById('seccionDatosPersonales');
    const seccionMatricula = document.getElementById('seccionDatosMatricula');
    const seccionAcademicos = document.getElementById('seccionDatosAcademicos');
    
    const ocultarTodas = () => {
        if (seccionPersonales) seccionPersonales.classList.add('d-none');
        if (seccionMatricula) seccionMatricula.classList.add('d-none');
        if (seccionAcademicos) seccionAcademicos.classList.add('d-none');
    };
    
    if (btnDatosPersonales) {
        btnDatosPersonales.addEventListener('click', () => {
            ocultarTodas();
            if (seccionPersonales) seccionPersonales.classList.remove('d-none');
        });
    }
    
    if (btnMatricula) {
        btnMatricula.addEventListener('click', () => {
            ocultarTodas();
            if (seccionMatricula) seccionMatricula.classList.remove('d-none');
        });
    }
    
    if (btnDatosAcademicos) {
        btnDatosAcademicos.addEventListener('click', () => {
            ocultarTodas();
            if (seccionAcademicos) seccionAcademicos.classList.remove('d-none');
        });
    }
}

/**
 * CONFIGURAR COMBOS (CENTROS Y UNIVERSIDADES)
 */
static configurarCombos(centros, universidades) {
    // Configurar combo de centros
    const inputCentro = document.getElementById('comboCentroEstudianteMatricula');
    const dropdownCentro = document.getElementById('opcionesCentroEstudianteMatricula');
    
    if (inputCentro && dropdownCentro) {
        this.configurarComboConNuevo('comboCentroEstudianteMatricula', 'opcionesCentroEstudianteMatricula', 
            centros, (nuevoValor) => {
                // Callback para nuevo centro
                console.log('Nuevo centro:', nuevoValor);
            });
    }
    
    // Configurar combo de universidades
    const inputUniversidad = document.getElementById('comboUniversidadEstudianteMatricula');
    const dropdownUniversidad = document.getElementById('opcionesUniversidadEstudianteMatricula');
    
    if (inputUniversidad && dropdownUniversidad) {
        this.configurarComboConNuevo('comboUniversidadEstudianteMatricula', 'opcionesUniversidadEstudianteMatricula',
            universidades, (nuevoValor) => {
                // Callback para nueva universidad
                console.log('Nueva universidad:', nuevoValor);
            });
    }
}

/**
 * VALIDAR FORMULARIO DATOS PERSONALES
 */
static validarFormularioDatosPersonales() {
    let valido = true;
    
    // Validar nombre
    const nombre = document.getElementById('nombreEstudianteMatricula');
    if (nombre && !nombre.value.trim()) {
        u_utiles.colorearCampo(false, '#nombreEstudianteMatricula', '#errorNombreEstudianteMatricula', 
            'El nombre es requerido');
        valido = false;
    } else if (nombre && !u_verificaciones.validarNombre(nombre.value)) {
        u_utiles.colorearCampo(false, '#nombreEstudianteMatricula', '#errorNombreEstudianteMatricula', 
            'El nombre debe tener al menos 3 caracteres');
        valido = false;
    } else if (nombre) {
        u_utiles.colorearCampo(true, '#nombreEstudianteMatricula', null);
    }
    
    // Validar apellidos
    const apellidos = document.getElementById('apellidosEstudianteMatricula');
    if (apellidos && !apellidos.value.trim()) {
        u_utiles.colorearCampo(false, '#apellidosEstudianteMatricula', '#errorApellidosEstudianteMatricula',
            'Los apellidos son requeridos');
        valido = false;
    } else if (apellidos && apellidos.value.trim().length < 3) {
        u_utiles.colorearCampo(false, '#apellidosEstudianteMatricula', '#errorApellidosEstudianteMatricula',
            'Los apellidos deben tener al menos 3 caracteres');
        valido = false;
    } else if (apellidos) {
        u_utiles.colorearCampo(true, '#apellidosEstudianteMatricula', null);
    }
    
    // Validar DIP
    const dip = document.getElementById('dipEstudianteMatricula');
    if (dip && !dip.value.trim()) {
        u_utiles.colorearCampo(false, '#dipEstudianteMatricula', '#errorDipEstudianteMatricula',
            'El DIP es requerido');
        valido = false;
    } else if (dip && !u_verificaciones.validarDIP(dip.value)) {
        u_utiles.colorearCampo(false, '#dipEstudianteMatricula', '#errorDipEstudianteMatricula',
            'Formato inválido (ej: 000 000 000)');
        valido = false;
    } else if (dip) {
        u_utiles.colorearCampo(true, '#dipEstudianteMatricula', null);
    }
    
    // Validar correo
    const correo = document.getElementById('correoEstudianteMatricula');
    if (correo && !correo.value.trim()) {
        u_utiles.colorearCampo(false, '#correoEstudianteMatricula', '#errorCorreoEstudianteMatricula',
            'El correo es requerido');
        valido = false;
    } else if (correo && !u_verificaciones.validarCorreo(correo.value)) {
        u_utiles.colorearCampo(false, '#correoEstudianteMatricula', '#errorCorreoEstudianteMatricula',
            'Formato de correo inválido (ej: usuario@dominio.com)');
        valido = false;
    } else if (correo) {
        u_utiles.colorearCampo(true, '#correoEstudianteMatricula', null);
    }
    
    // Validar teléfono
    const telefono = document.getElementById('telefonoEstudianteMatricula');
    if (telefono && telefono.value.trim() && !u_verificaciones.validarTelefono(telefono.value)) {
        u_utiles.colorearCampo(false, '#telefonoEstudianteMatricula', '#errorTelefonoEstudianteMatricula',
            'Formato inválido (ej: +240 222 123 456)');
        valido = false;
    } else if (telefono) {
        u_utiles.colorearCampo(true, '#telefonoEstudianteMatricula', null);
    }
    
    // Validar fecha de nacimiento
    const fechaNac = document.getElementById('fechaNacimientoEstudianteMatricula');
    if (fechaNac && !fechaNac.value) {
        u_utiles.colorearCampo(false, '#fechaNacimientoEstudianteMatricula', '#errorFechaNacimientoEstudianteMatricula',
            'La fecha de nacimiento es requerida');
        valido = false;
    } else if (fechaNac) {
        u_utiles.colorearCampo(true, '#fechaNacimientoEstudianteMatricula', null);
    }
    
    // Validar sexo
    const sexo = document.getElementById('generosEstudianteMatricula');
    if (sexo && (!sexo.value || sexo.value === 'Ninguno')) {
        u_utiles.colorearCampo(false, '#generosEstudianteMatricula', '#errorGenerosEstudianteMatricula',
            'Seleccione un sexo');
        valido = false;
    } else if (sexo) {
        u_utiles.colorearCampo(true, '#generosEstudianteMatricula', null);
    }
    
    return valido;
}

/**
 * VALIDAR TODOS LOS FAMILIARES (estáticos + dinámicos)
 */
static validarTodosFamiliares() {
    let valido = true;
    
    // 1. Validar bloque estático (IDs fijos)
    const nombreStatic = document.getElementById('nombreEstudianteFamiliar');
    if (nombreStatic && nombreStatic.value.trim()) {
        // Si hay datos en el bloque estático, validar campos requeridos
        const apellidosStatic = document.getElementById('apellidosEstudianteFamiliar');
        const parentescoStatic = document.getElementById('parentezcoEstudianteFamiliar');
        
        if (!nombreStatic.value.trim()) {
            u_utiles.colorearCampo(false, '#nombreEstudianteFamiliar', '#errorNombreEstudianteFamiliar',
                'El nombre del familiar es requerido');
            valido = false;
        } else {
            u_utiles.colorearCampo(true, '#nombreEstudianteFamiliar', null);
        }
        
        if (!apellidosStatic?.value.trim()) {
            u_utiles.colorearCampo(false, '#apellidosEstudianteFamiliar', '#errorApellidosEstudianteFamiliar',
                'Los apellidos del familiar son requeridos');
            valido = false;
        } else {
            u_utiles.colorearCampo(true, '#apellidosEstudianteFamiliar', null);
        }
        
        if (!parentescoStatic?.value.trim()) {
            u_utiles.colorearCampo(false, '#parentezcoEstudianteFamiliar', '#errorParentezcoEstudianteFamiliar',
                'El parentesco es requerido');
            valido = false;
        } else {
            u_utiles.colorearCampo(true, '#parentezcoEstudianteFamiliar', null);
        }
    }
    
    // 2. Validar bloques dinámicos (con clases)
    const bloquesDinamicos = document.querySelectorAll('.familiar-bloque');
    bloquesDinamicos.forEach((bloque, index) => {
        const nombre = bloque.querySelector('.familiar-nombre');
        const apellidos = bloque.querySelector('.familiar-apellidos');
        const parentesco = bloque.querySelector('.familiar-parentesco');
        
        // Solo validar si el bloque tiene datos
        if (nombre && nombre.value.trim()) {
            if (!nombre.value.trim()) {
                u_utiles.colorearCampo(false, bloque.querySelector('.familiar-nombre'), null,
                    'El nombre del familiar es requerido');
                valido = false;
            }
            
            if (!apellidos?.value.trim()) {
                u_utiles.colorearCampo(false, bloque.querySelector('.familiar-apellidos'), null,
                    'Los apellidos del familiar son requeridos');
                valido = false;
            }
            
            if (!parentesco?.value.trim()) {
                u_utiles.colorearCampo(false, bloque.querySelector('.familiar-parentesco'), null,
                    'El parentesco es requerido');
                valido = false;
            }
        }
    });
    
    return valido;
}

/**
 * VALIDAR TODAS LAS BECAS
 */
static validarTodosBecas() {
    const esBecario = document.getElementById('esBecario')?.checked;
    if (!esBecario) return true;
    
    let valido = true;
    
    // 1. Validar bloque estático de beca (IDs fijos)
    const institucionStatic = document.getElementById('comboNombreInstitucionBeca');
    const tipoStatic = document.getElementById('tiposBeca');
    const fechaInicioStatic = document.getElementById('fechaInicioBeca');
    const fechaFinStatic = document.getElementById('fechaFinBeca');
    
    if (institucionStatic && institucionStatic.value.trim()) {
        if (!institucionStatic.value.trim()) {
            u_utiles.colorearCampo(false, '#comboNombreInstitucionBeca', '#errorNombreInstitucionBeca',
                'La institución es requerida');
            valido = false;
        } else {
            u_utiles.colorearCampo(true, '#comboNombreInstitucionBeca', null);
        }
        
        if (!tipoStatic || tipoStatic.value === 'Ninguno') {
            u_utiles.colorearCampo(false, '#tiposBeca', '#errorTiposBeca',
                'Seleccione un tipo de beca');
            valido = false;
        } else {
            u_utiles.colorearCampo(true, '#tiposBeca', null);
        }
        
        if (!fechaInicioStatic?.value) {
            u_utiles.colorearCampo(false, '#fechaInicioBeca', '#errorFechaInicioBeca',
                'La fecha de inicio es requerida');
            valido = false;
        } else {
            u_utiles.colorearCampo(true, '#fechaInicioBeca', null);
        }
        
        if (!fechaFinStatic?.value) {
            u_utiles.colorearCampo(false, '#fechaFinBeca', '#errorFechaFinBeca',
                'La fecha de fin es requerida');
            valido = false;
        } else {
            u_utiles.colorearCampo(true, '#fechaFinBeca', null);
        }
    }
    
    // 2. Validar bloques dinámicos de becas
    const bloquesDinamicos = document.querySelectorAll('.beca-bloque');
    bloquesDinamicos.forEach(bloque => {
        const institucion = bloque.querySelector('.beca-institucion');
        const tipo = bloque.querySelector('.beca-tipo');
        const fechaInicio = bloque.querySelector('.beca-fechaInicio');
        const fechaFin = bloque.querySelector('.beca-fechaFin');
        
        if (institucion && institucion.value.trim()) {
            if (!institucion.value.trim()) {
                u_utiles.colorearCampo(false, institucion, null, 'Institución requerida');
                valido = false;
            }
            
            if (!tipo || tipo.value === 'Ninguno') {
                u_utiles.colorearCampo(false, tipo, null, 'Tipo de beca requerido');
                valido = false;
            }
            
            if (!fechaInicio?.value) {
                u_utiles.colorearCampo(false, fechaInicio, null, 'Fecha inicio requerida');
                valido = false;
            }
            
            if (!fechaFin?.value) {
                u_utiles.colorearCampo(false, fechaFin, null, 'Fecha fin requerida');
                valido = false;
            }
        }
    });
    
    return valido;
}

/**
 * VALIDAR FORMULARIO MATRÍCULA
 */
static validarFormularioMatricula() {
    let valido = true;
    
    const curso = document.getElementById('cursoAcademicoMatricula');
    if (!curso?.value.trim()) {
        u_utiles.colorearCampo(false, '#cursoAcademicoMatricula', '#errorCursoAcademicoMatricula',
            'El curso académico es requerido');
        valido = false;
    } else {
        u_utiles.colorearCampo(true, '#cursoAcademicoMatricula', null);
    }
    
    const fecha = document.getElementById('fechaMatricula');
    if (!fecha?.value) {
        u_utiles.colorearCampo(false, '#fechaMatricula', '#errorFechaMatricula',
            'La fecha de matrícula es requerida');
        valido = false;
    } else {
        u_utiles.colorearCampo(true, '#fechaMatricula', null);
    }
    
    const modalidad = document.getElementById('modalidadMatricula');
    if (!modalidad?.value || modalidad.value === 'Ninguno') {
        u_utiles.colorearCampo(false, '#modalidadMatricula', '#errorModalidadMatricula',
            'Seleccione una modalidad');
        valido = false;
    } else {
        u_utiles.colorearCampo(true, '#modalidadMatricula', null);
    }
    
    const estado = document.getElementById('estadosMatricula');
    if (!estado?.value || estado.value === 'Ninguno') {
        u_utiles.colorearCampo(false, '#estadosMatricula', '#errorestadosMatricula',
            'Seleccione un estado');
        valido = false;
    } else {
        u_utiles.colorearCampo(true, '#estadosMatricula', null);
    }
    
    return valido;
}

/**
 * VALIDAR FORMULARIO PAGO
 */
static validarFormularioPago() {
    let valido = true;
    
    const responsable = document.getElementById('responsablePagoEstudiante');
    if (!responsable?.value.trim()) {
        u_utiles.colorearCampo(false, '#responsablePagoEstudiante', '#errorResponsablePagoEstudiante',
            'El responsable de pago es requerido');
        valido = false;
    } else {
        u_utiles.colorearCampo(true, '#responsablePagoEstudiante', null);
    }
    
    const cuota = document.getElementById('cuotaEstudiante');
    if (!cuota?.value || cuota.value <= 0) {
        u_utiles.colorearCampo(false, '#cuotaEstudiante', '#errorCuotaEstudiante',
            'La cuota es requerida y debe ser mayor a 0');
        valido = false;
    } else {
        u_utiles.colorearCampo(true, '#cuotaEstudiante', null);
    }
    
    const monto = document.getElementById('montoEstudiante');
    if (!monto?.value || monto.value <= 0) {
        u_utiles.colorearCampo(false, '#montoEstudiante', '#errorMontoEstudiante',
            'El monto es requerido y debe ser mayor a 0');
        valido = false;
    } else {
        u_utiles.colorearCampo(true, '#montoEstudiante', null);
    }
    
    const fechaPago = document.getElementById('fechaPagoEstudiante');
    if (!fechaPago?.value) {
        u_utiles.colorearCampo(false, '#fechaPagoEstudiante', '#errorFechaPagoEstudiante',
            'La fecha de pago es requerida');
        valido = false;
    } else {
        u_utiles.colorearCampo(true, '#fechaPagoEstudiante', null);
    }
    
    return valido;
}

/**
 * CONFIGURAR VALIDACIONES EN TIEMPO REAL
 */
static configurarValidacionesEnTiempoReal() {
    this.configurarValidaciones();
    
    // Validaciones para familiares estáticos
    const camposFamiliar = [
        'nombreEstudianteFamiliar',
        'apellidosEstudianteFamiliar',
        'parentezcoEstudianteFamiliar'
    ];
    
    camposFamiliar.forEach(id => {
        const campo = document.getElementById(id);
        if (campo) {
            campo.addEventListener('input', () => {
                if (campo.value.trim()) {
                    u_utiles.colorearCampo(true, `#${id}`, null);
                }
            });
        }
    });
}

/**
 * ESCAPE HTML
 */
static escapeHTML(str) {
    if (!str) return '';
    return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}
}