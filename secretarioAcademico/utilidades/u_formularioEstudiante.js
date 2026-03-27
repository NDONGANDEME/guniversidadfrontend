import { u_verificaciones } from "../../public/utilidades/u_verificaciones.js";
import { u_utiles } from "../../public/utilidades/u_utiles.js";
import { u_estudiante } from "./u_estudiante.js";
import { Alerta } from "../../public/utilidades/u_alertas.js";

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
        // Curso académico automático
        const cursoAcademico = u_estudiante.generarCursoAcademico();
        const campoCurso = document.getElementById('cursoAcademicoMatricula');
        if (campoCurso) campoCurso.value = cursoAcademico;
        
        // Fecha actual para fecha de matrícula
        const fechaActual = new Date().toISOString().split('T')[0];
        const campoFechaMatricula = document.getElementById('fechaMatricula');
        if (campoFechaMatricula) campoFechaMatricula.value = fechaActual;
        
        // Fecha actual para fecha de pago
        const campoFechaPago = document.getElementById('fechaPagoEstudiante');
        if (campoFechaPago) campoFechaPago.value = fechaActual;
        
        // Valor por defecto para el combo de género
        const campoGenero = document.getElementById('generosEstudianteMatricula');
        if (campoGenero && campoGenero.value === 'Ninguno') {
            campoGenero.value = 'Ninguno';
        }
    }

/**
     * CONFIGURAR CHECKBOX DE BECARIO
     */
    static configurarCheckboxBecario() {
        const checkBecario = document.getElementById('esBecario');
        const contBecario = document.getElementById('contDatosBecario');
        
        if (checkBecario && contBecario) {
            const toggleBecario = () => {
                contBecario.classList.toggle('d-none', !checkBecario.checked);
            };
            
            checkBecario.addEventListener('change', toggleBecario);
            toggleBecario();
        }
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
        e.target.closest('.familiar-bloque')?.remove();
        // Reindexar los bloques restantes
        document.querySelectorAll('.familiar-bloque').forEach((bloque, newIndex) => {
            bloque.setAttribute('data-index', newIndex);
        });
    }

/**
     * CONFIGURAR EVENTOS DE BECAS
     */
    static configurarEventosBecas() {
        // Botón añadir más becas
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
        e.target.closest('.beca-bloque')?.remove();
        document.querySelectorAll('.beca-bloque').forEach((bloque, newIndex) => {
            bloque.setAttribute('data-index', newIndex);
        });
    }

/**
     * CONFIGURAR BOTONES DE SECCIONES
     */
    static configurarBotonesSecciones() {
        const btnDatosPersonales = document.getElementById('btnDatosPersonales');
        const btnMatricula = document.getElementById('btnMatricula');
        const btnDatosAcademicos = document.getElementById('btnDatosAcademicos');
        
        if (btnDatosPersonales) {
            btnDatosPersonales.addEventListener('click', () => this.mostrarSeccion('datosPersonales'));
        }
        if (btnMatricula) {
            btnMatricula.addEventListener('click', () => this.mostrarSeccion('matricula'));
        }
        if (btnDatosAcademicos) {
            btnDatosAcademicos.addEventListener('click', () => this.mostrarSeccion('datosAcademicos'));
        }
        
        // Mostrar sección por defecto
        this.mostrarSeccion('datosPersonales');
    }

    /**
     * MOSTRAR/OCULTAR SECCIONES
     */
    static mostrarSeccion(seccion) {
        const seccionPersonales = document.getElementById('seccionDatosPersonales');
        const seccionMatricula = document.getElementById('seccionDatosMatricula');
        const seccionAcademicos = document.getElementById('seccionDatosAcademicos');
        
        if (seccionPersonales) seccionPersonales.style.display = 'none';
        if (seccionMatricula) seccionMatricula.style.display = 'none';
        if (seccionAcademicos) seccionAcademicos.style.display = 'none';
        
        switch (seccion) {
            case 'datosPersonales':
                if (seccionPersonales) seccionPersonales.style.display = 'block';
                break;
            case 'matricula':
                if (seccionMatricula) seccionMatricula.style.display = 'block';
                break;
            case 'datosAcademicos':
                if (seccionAcademicos) seccionAcademicos.style.display = 'block';
                break;
        }
    }

/**
     * CONFIGURAR COMBOS
     */
    static configurarCombos(centrosProcedencia = [], universidadesProcedencia = []) {
        // Combo de países
        u_estudiante.inicializarComboPaises('comboPaisesEstudianteMatricula', 'opcionesEstudianteMatricula');
        
        // Combo de centros de procedencia
        u_estudiante.inicializarComboConNuevo(
            'comboCentroEstudianteMatricula',
            'opcionesCentroEstudianteMatricula',
            centrosProcedencia,
            null,
            (nuevoCentro) => {
                if (nuevoCentro && !centrosProcedencia.includes(nuevoCentro)) {
                    centrosProcedencia.push(nuevoCentro);
                }
            }
        );
        
        // Combo de universidades de procedencia
        u_estudiante.inicializarComboConNuevo(
            'comboUniversidadEstudianteMatricula',
            'opcionesUniversidadEstudianteMatricula',
            universidadesProcedencia,
            null,
            (nuevaUniversidad) => {
                if (nuevaUniversidad && !universidadesProcedencia.includes(nuevaUniversidad)) {
                    universidadesProcedencia.push(nuevaUniversidad);
                }
            }
        );
    }

/**
     * VALIDACIONES DE DATOS PERSONALES
     */
    
    static validarFormularioDatosPersonales() {
        const nombre = document.getElementById('nombreEstudianteMatricula')?.value || '';
        const apellidos = document.getElementById('apellidosEstudianteMatricula')?.value || '';
        const dip = document.getElementById('dipEstudianteMatricula')?.value || '';
        const fechaNacimiento = document.getElementById('fechaNacimientoEstudianteMatricula')?.value || '';
        const nacionalidad = document.getElementById('nacionalidadEstudianteMatricula')?.value || '';
        const genero = document.getElementById('generosEstudianteMatricula')?.value || '';
        const direccion = document.getElementById('direccionEstudianteMatricula')?.value || '';
        const localidad = document.getElementById('localidadEstudianteMatricula')?.value || '';
        const provincia = document.getElementById('provinciaEstudianteMatricula')?.value || '';
        const pais = document.getElementById('comboPaisesEstudianteMatricula')?.value || '';
        const correo = document.getElementById('correoEstudianteMatricula')?.value || '';
        const telefono = document.getElementById('telefonoEstudianteMatricula')?.value || '';
        const centro = document.getElementById('comboCentroEstudianteMatricula')?.value || '';
        const universidad = document.getElementById('comboUniversidadEstudianteMatricula')?.value || '';
        const nombreUsuario = document.getElementById('nombreOCorreoUsuario')?.value || '';
        
        const validaciones = {
            nombre: u_estudiante.validarNombreEstudiante(nombre),
            apellidos: u_estudiante.validarApellidosEstudiante(apellidos),
            dip: u_estudiante.validarDIPEstudiante(dip),
            fechaNacimiento: u_estudiante.validarFechaNacimiento(fechaNacimiento),
            nacionalidad: u_estudiante.validarNacionalidad(nacionalidad),
            genero: u_estudiante.validarGenero(genero),
            direccion: u_estudiante.validarDireccion(direccion),
            localidad: u_estudiante.validarLocalidad(localidad),
            provincia: u_estudiante.validarProvincia(provincia),
            pais: u_estudiante.validarPais(pais),
            correo: u_estudiante.validarCorreoEstudiante(correo),
            telefono: u_estudiante.validarTelefonoEstudiante(telefono),
            centro: u_estudiante.validarCentroProcedencia(centro),
            universidad: u_estudiante.validarUniversidadProcedencia(universidad),
            nombreUsuario: u_estudiante.validarNombreOCorreoUsuario(nombreUsuario)
        };
        
        // Aplicar colores y mensajes
        u_utiles.colorearCampo(validaciones.nombre, '#nombreEstudianteMatricula', '#errorNombreEstudianteMatricula', 
            validaciones.nombre ? '' : 'Nombre inválido (mínimo 3 caracteres)');
        u_utiles.colorearCampo(validaciones.apellidos, '#apellidosEstudianteMatricula', '#errorApellidosEstudianteMatricula', 
            validaciones.apellidos ? '' : 'Apellidos inválidos (mínimo 3 caracteres)');
        u_utiles.colorearCampo(validaciones.dip, '#dipEstudianteMatricula', '#errorDipEstudianteMatricula', 
            validaciones.dip ? '' : 'Formato inválido (ej: 000 000 000)');
        u_utiles.colorearCampo(validaciones.fechaNacimiento, '#fechaNacimientoEstudianteMatricula', '#errorFechaNacimientoEstudianteMatricula', 
            validaciones.fechaNacimiento ? '' : 'Fecha inválida (debe ser mayor de 16 años)');
        u_utiles.colorearCampo(validaciones.nacionalidad, '#nacionalidadEstudianteMatricula', '#errorNacionalidadEstudianteMatricula', 
            validaciones.nacionalidad ? '' : 'Nacionalidad inválida (mínimo 3 caracteres)');
        u_utiles.colorearCampo(validaciones.genero, '#generosEstudianteMatricula', '#errorGenerosEstudianteMatricula', 
            validaciones.genero ? '' : 'Seleccione un género');
        u_utiles.colorearCampo(validaciones.direccion, '#direccionEstudianteMatricula', '#errorDireccionEstudianteMatricula', 
            validaciones.direccion ? '' : 'Dirección inválida (mínimo 5 caracteres)');
        u_utiles.colorearCampo(validaciones.localidad, '#localidadEstudianteMatricula', '#errorLocalidadEstudianteMatricula', 
            validaciones.localidad ? '' : 'Localidad inválida (mínimo 3 caracteres)');
        u_utiles.colorearCampo(validaciones.provincia, '#provinciaEstudianteMatricula', '#errorProvinciaEstudianteMatricula', 
            validaciones.provincia ? '' : 'Provincia inválida (mínimo 3 caracteres)');
        u_utiles.colorearCampo(validaciones.pais, '#comboPaisesEstudianteMatricula', '#errorPaisesEstudianteMatricula', 
            validaciones.pais ? '' : 'Seleccione un país');
        u_utiles.colorearCampo(validaciones.correo, '#correoEstudianteMatricula', '#errorCorreoEstudianteMatricula', 
            validaciones.correo ? '' : 'Formato de correo inválido');
        u_utiles.colorearCampo(validaciones.telefono, '#telefonoEstudianteMatricula', '#errorTelefonoEstudianteMatricula', 
            validaciones.telefono ? '' : 'Formato inválido (ej: +240 222 123 456)');
        u_utiles.colorearCampo(validaciones.centro, '#comboCentroEstudianteMatricula', '#errorCentroEstudianteMatricula', 
            validaciones.centro ? '' : 'Centro de procedencia inválido');
        u_utiles.colorearCampo(validaciones.universidad, '#comboUniversidadEstudianteMatricula', '#errorUniversidadEstudianteMatricula', 
            validaciones.universidad ? '' : 'Universidad de procedencia inválida');
        u_utiles.colorearCampo(validaciones.nombreUsuario, '#nombreOCorreoUsuario', '#errorNombreOCorreoUsuario', 
            validaciones.nombreUsuario ? '' : 'Nombre de usuario o correo inválido');
        
        return Object.values(validaciones).every(v => v === true);
    }

// u_formularioEstudiante.js - PARTE CORREGIDA

/**
 * VALIDAR TODOS LOS FAMILIARES
 * Esta función debe usar los selectores correctos que existen en los bloques creados por u_estudiante.crearBloqueFamiliar()
 */
static validarTodosFamiliares() {
    let valido = true;
    
    // Obtener todos los bloques dinámicos
    const bloquesDinamicos = document.querySelectorAll('.familiar-bloque');
    
    if (bloquesDinamicos.length === 0) {
        // No hay familiares para validar
        return true;
    }
    
    bloquesDinamicos.forEach((bloque, index) => {
        const nombreInput = bloque.querySelector('.familiar-nombre');
        const apellidosInput = bloque.querySelector('.familiar-apellidos');
        const parentescoInput = bloque.querySelector('.familiar-parentesco');
        
        const nombre = nombreInput?.value || '';
        const apellidos = apellidosInput?.value || '';
        const parentesco = parentescoInput?.value || '';
        
        // Validar nombre
        if (!nombre.trim()) {
            const errorSpan = bloque.querySelector(`.error-familiar-nombre-${index}`);
            if (errorSpan) errorSpan.textContent = 'El nombre del familiar es requerido';
            if (nombreInput) nombreInput.classList.add('is-invalid');
            valido = false;
        } else if (nombre.trim().length < 3) {
            const errorSpan = bloque.querySelector(`.error-familiar-nombre-${index}`);
            if (errorSpan) errorSpan.textContent = 'El nombre debe tener al menos 3 caracteres';
            if (nombreInput) nombreInput.classList.add('is-invalid');
            valido = false;
        } else {
            const errorSpan = bloque.querySelector(`.error-familiar-nombre-${index}`);
            if (errorSpan) errorSpan.textContent = '';
            if (nombreInput) {
                nombreInput.classList.remove('is-invalid');
                nombreInput.classList.add('is-valid');
            }
        }
        
        // Validar apellidos
        if (!apellidos.trim()) {
            const errorSpan = bloque.querySelector(`.error-familiar-apellidos-${index}`);
            if (errorSpan) errorSpan.textContent = 'Los apellidos del familiar son requeridos';
            if (apellidosInput) apellidosInput.classList.add('is-invalid');
            valido = false;
        } else if (apellidos.trim().length < 3) {
            const errorSpan = bloque.querySelector(`.error-familiar-apellidos-${index}`);
            if (errorSpan) errorSpan.textContent = 'Los apellidos deben tener al menos 3 caracteres';
            if (apellidosInput) apellidosInput.classList.add('is-invalid');
            valido = false;
        } else {
            const errorSpan = bloque.querySelector(`.error-familiar-apellidos-${index}`);
            if (errorSpan) errorSpan.textContent = '';
            if (apellidosInput) {
                apellidosInput.classList.remove('is-invalid');
                apellidosInput.classList.add('is-valid');
            }
        }
        
        // Validar parentesco
        if (!parentesco.trim()) {
            const errorSpan = bloque.querySelector(`.error-familiar-parentesco-${index}`);
            if (errorSpan) errorSpan.textContent = 'El parentesco es requerido';
            if (parentescoInput) parentescoInput.classList.add('is-invalid');
            valido = false;
        } else if (parentesco.trim().length < 3) {
            const errorSpan = bloque.querySelector(`.error-familiar-parentesco-${index}`);
            if (errorSpan) errorSpan.textContent = 'El parentesco debe tener al menos 3 caracteres';
            if (parentescoInput) parentescoInput.classList.add('is-invalid');
            valido = false;
        } else {
            const errorSpan = bloque.querySelector(`.error-familiar-parentesco-${index}`);
            if (errorSpan) errorSpan.textContent = '';
            if (parentescoInput) {
                parentescoInput.classList.remove('is-invalid');
                parentescoInput.classList.add('is-valid');
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
    
    // Obtener todos los bloques de becas
    const bloquesDinamicos = document.querySelectorAll('.beca-bloque');
    
    if (bloquesDinamicos.length === 0) {
        if (esBecario) {
            Alerta.notificarAdvertencia('Debe agregar al menos una beca', 2000);
            return false;
        }
        return true;
    }
    
    bloquesDinamicos.forEach((bloque, index) => {
        // Usar los selectores correctos de u_estudiante.crearBloqueBeca()
        const institucionInput = bloque.querySelector('.beca-institucion');
        const tipoSelect = bloque.querySelector('.beca-tipo');
        const fechaInicioInput = bloque.querySelector('.beca-fechaInicio');
        const fechaFinInput = bloque.querySelector('.beca-fechaFin');
        
        const institucion = institucionInput?.value || '';
        const tipo = tipoSelect?.value || '';
        const fechaInicio = fechaInicioInput?.value || '';
        const fechaFin = fechaFinInput?.value || '';
        
        // Validar institución
        if (!institucion.trim()) {
            const errorSpan = bloque.querySelector(`.error-beca-institucion-${index}`);
            if (errorSpan) errorSpan.textContent = 'La institución es requerida';
            if (institucionInput) institucionInput.classList.add('is-invalid');
            valido = false;
        } else if (institucion.trim().length < 3) {
            const errorSpan = bloque.querySelector(`.error-beca-institucion-${index}`);
            if (errorSpan) errorSpan.textContent = 'La institución debe tener al menos 3 caracteres';
            if (institucionInput) institucionInput.classList.add('is-invalid');
            valido = false;
        } else {
            const errorSpan = bloque.querySelector(`.error-beca-institucion-${index}`);
            if (errorSpan) errorSpan.textContent = '';
            if (institucionInput) {
                institucionInput.classList.remove('is-invalid');
                institucionInput.classList.add('is-valid');
            }
        }
        
        // Validar tipo
        if (!tipo || tipo === 'Ninguno') {
            const errorSpan = bloque.querySelector(`.error-beca-tipo-${index}`);
            if (errorSpan) errorSpan.textContent = 'Seleccione un tipo de beca';
            if (tipoSelect) tipoSelect.classList.add('is-invalid');
            valido = false;
        } else {
            const errorSpan = bloque.querySelector(`.error-beca-tipo-${index}`);
            if (errorSpan) errorSpan.textContent = '';
            if (tipoSelect) {
                tipoSelect.classList.remove('is-invalid');
                tipoSelect.classList.add('is-valid');
            }
        }
        
        // Validar fecha inicio
        if (!fechaInicio) {
            const errorSpan = bloque.querySelector(`.error-beca-fechaInicio-${index}`);
            if (errorSpan) errorSpan.textContent = 'La fecha de inicio es requerida';
            if (fechaInicioInput) fechaInicioInput.classList.add('is-invalid');
            valido = false;
        } else {
            const errorSpan = bloque.querySelector(`.error-beca-fechaInicio-${index}`);
            if (errorSpan) errorSpan.textContent = '';
            if (fechaInicioInput) {
                fechaInicioInput.classList.remove('is-invalid');
                fechaInicioInput.classList.add('is-valid');
            }
        }
        
        // Validar fecha fin
        if (!fechaFin) {
            const errorSpan = bloque.querySelector(`.error-beca-fechaFin-${index}`);
            if (errorSpan) errorSpan.textContent = 'La fecha de fin es requerida';
            if (fechaFinInput) fechaFinInput.classList.add('is-invalid');
            valido = false;
        } else if (fechaInicio && new Date(fechaFin) < new Date(fechaInicio)) {
            const errorSpan = bloque.querySelector(`.error-beca-fechaFin-${index}`);
            if (errorSpan) errorSpan.textContent = 'La fecha de fin debe ser posterior a la fecha de inicio';
            if (fechaFinInput) fechaFinInput.classList.add('is-invalid');
            valido = false;
        } else {
            const errorSpan = bloque.querySelector(`.error-beca-fechaFin-${index}`);
            if (errorSpan) errorSpan.textContent = '';
            if (fechaFinInput) {
                fechaFinInput.classList.remove('is-invalid');
                fechaFinInput.classList.add('is-valid');
            }
        }
    });
    
    return valido;
}

/**
     * VALIDACIONES DE MATRÍCULA
     */
    
    static validarFormularioMatricula() {
        const cursoAcademico = document.getElementById('cursoAcademicoMatricula')?.value || '';
        const fechaMatricula = document.getElementById('fechaMatricula')?.value || '';
        const modalidad = document.getElementById('modalidadMatricula')?.value || '';
        const creditos = document.getElementById('creditosTotalesMatricula')?.value || '';
        const estado = document.getElementById('estadosMatricula')?.value || '';
        
        const validaciones = {
            cursoAcademico: u_estudiante.validarCursoAcademico(cursoAcademico),
            fechaMatricula: u_estudiante.validarFechaMatricula(fechaMatricula),
            modalidad: u_estudiante.validarModalidadMatricula(modalidad),
            creditos: u_estudiante.validarCreditosTotales(creditos),
            estado: u_estudiante.validarEstadoMatricula(estado)
        };
        
        u_utiles.colorearCampo(validaciones.cursoAcademico, '#cursoAcademicoMatricula', '#errorCursoAcademicoMatricula', 
            validaciones.cursoAcademico ? '' : 'Formato inválido (ej: 2025/2026)');
        u_utiles.colorearCampo(validaciones.fechaMatricula, '#fechaMatricula', '#errorFechaMatricula', 
            validaciones.fechaMatricula ? '' : 'Fecha inválida');
        u_utiles.colorearCampo(validaciones.modalidad, '#modalidadMatricula', '#errorModalidadMatricula', 
            validaciones.modalidad ? '' : 'Seleccione una modalidad');
        u_utiles.colorearCampo(validaciones.creditos, '#creditosTotalesMatricula', '#errorCreditosTotalesMatricula', 
            validaciones.creditos ? '' : 'Créditos inválidos (0-60)');
        u_utiles.colorearCampo(validaciones.estado, '#estadosMatricula', '#errorestadosMatricula', 
            validaciones.estado ? '' : 'Seleccione un estado');
        
        return Object.values(validaciones).every(v => v === true);
    }


    /**
         * VALIDACIONES DE PAGO
         */
        
        static validarFormularioPago() {
            const cuota = document.getElementById('cuotaEstudiante')?.value || '';
            const monto = document.getElementById('montoEstudiante')?.value || '';
            const fechaPago = document.getElementById('fechaPagoEstudiante')?.value || '';
            
            const validaciones = {
                cuota: u_estudiante.validarCuota(cuota),
                monto: u_estudiante.validarMonto(monto),
                fechaPago: u_estudiante.validarFechaPago(fechaPago)
            };
            
            u_utiles.colorearCampo(validaciones.cuota, '#cuotaEstudiante', '#errorCuotaEstudiante', 
                validaciones.cuota ? '' : 'Cuota inválida (1-12)');
            u_utiles.colorearCampo(validaciones.monto, '#montoEstudiante', '#errorMontoEstudiante', 
                validaciones.monto ? '' : 'Monto inválido');
            u_utiles.colorearCampo(validaciones.fechaPago, '#fechaPagoEstudiante', '#errorFechaPagoEstudiante', 
                validaciones.fechaPago ? '' : 'Fecha inválida');
            
            return Object.values(validaciones).every(v => v === true);
        }

/**
     * CONFIGURAR VALIDACIONES EN TIEMPO REAL
     */
    static configurarValidacionesEnTiempoReal() {
        // Validaciones de datos personales
        const campoNombre = document.getElementById('nombreEstudianteMatricula');
        if (campoNombre) {
            campoNombre.addEventListener('input', () => {
                const valido = u_estudiante.validarNombreEstudiante(campoNombre.value);
                u_utiles.colorearCampo(valido, '#nombreEstudianteMatricula', '#errorNombreEstudianteMatricula', 
                    valido ? '' : 'Nombre inválido (mínimo 3 caracteres)');
            });
        }
        
        const campoApellidos = document.getElementById('apellidosEstudianteMatricula');
        if (campoApellidos) {
            campoApellidos.addEventListener('input', () => {
                const valido = u_estudiante.validarApellidosEstudiante(campoApellidos.value);
                u_utiles.colorearCampo(valido, '#apellidosEstudianteMatricula', '#errorApellidosEstudianteMatricula', 
                    valido ? '' : 'Apellidos inválidos (mínimo 3 caracteres)');
            });
        }
        
        const campoDip = document.getElementById('dipEstudianteMatricula');
        if (campoDip) {
            campoDip.addEventListener('input', () => {
                const valido = u_estudiante.validarDIPEstudiante(campoDip.value);
                u_utiles.colorearCampo(valido, '#dipEstudianteMatricula', '#errorDipEstudianteMatricula', 
                    valido ? '' : 'Formato inválido (ej: 000 000 000)');
            });
        }
        
        const campoFechaNacimiento = document.getElementById('fechaNacimientoEstudianteMatricula');
        if (campoFechaNacimiento) {
            campoFechaNacimiento.addEventListener('change', () => {
                const valido = u_estudiante.validarFechaNacimiento(campoFechaNacimiento.value);
                u_utiles.colorearCampo(valido, '#fechaNacimientoEstudianteMatricula', '#errorFechaNacimientoEstudianteMatricula', 
                    valido ? '' : 'Fecha inválida (debe ser mayor de 16 años)');
            });
        }
        
        const campoNacionalidad = document.getElementById('nacionalidadEstudianteMatricula');
        if (campoNacionalidad) {
            campoNacionalidad.addEventListener('input', () => {
                const valido = u_estudiante.validarNacionalidad(campoNacionalidad.value);
                u_utiles.colorearCampo(valido, '#nacionalidadEstudianteMatricula', '#errorNacionalidadEstudianteMatricula', 
                    valido ? '' : 'Nacionalidad inválida (mínimo 3 caracteres)');
            });
        }
        
        const campoGenero = document.getElementById('generosEstudianteMatricula');
        if (campoGenero) {
            campoGenero.addEventListener('change', () => {
                const valido = u_estudiante.validarGenero(campoGenero.value);
                u_utiles.colorearCampo(valido, '#generosEstudianteMatricula', '#errorGenerosEstudianteMatricula', 
                    valido ? '' : 'Seleccione un género');
            });
        }
        
        const campoDireccion = document.getElementById('direccionEstudianteMatricula');
        if (campoDireccion) {
            campoDireccion.addEventListener('input', () => {
                const valido = u_estudiante.validarDireccion(campoDireccion.value);
                u_utiles.colorearCampo(valido, '#direccionEstudianteMatricula', '#errorDireccionEstudianteMatricula', 
                    valido ? '' : 'Dirección inválida (mínimo 5 caracteres)');
            });
        }
        
        const campoLocalidad = document.getElementById('localidadEstudianteMatricula');
        if (campoLocalidad) {
            campoLocalidad.addEventListener('input', () => {
                const valido = u_estudiante.validarLocalidad(campoLocalidad.value);
                u_utiles.colorearCampo(valido, '#localidadEstudianteMatricula', '#errorLocalidadEstudianteMatricula', 
                    valido ? '' : 'Localidad inválida (mínimo 3 caracteres)');
            });
        }
        
        const campoProvincia = document.getElementById('provinciaEstudianteMatricula');
        if (campoProvincia) {
            campoProvincia.addEventListener('input', () => {
                const valido = u_estudiante.validarProvincia(campoProvincia.value);
                u_utiles.colorearCampo(valido, '#provinciaEstudianteMatricula', '#errorProvinciaEstudianteMatricula', 
                    valido ? '' : 'Provincia inválida (mínimo 3 caracteres)');
            });
        }
        
        const campoCorreo = document.getElementById('correoEstudianteMatricula');
        if (campoCorreo) {
            campoCorreo.addEventListener('input', () => {
                const valido = u_estudiante.validarCorreoEstudiante(campoCorreo.value);
                u_utiles.colorearCampo(valido, '#correoEstudianteMatricula', '#errorCorreoEstudianteMatricula', 
                    valido ? '' : 'Formato de correo inválido');
            });
        }
        
        const campoTelefono = document.getElementById('telefonoEstudianteMatricula');
        if (campoTelefono) {
            campoTelefono.addEventListener('input', () => {
                const valido = u_estudiante.validarTelefonoEstudiante(campoTelefono.value);
                u_utiles.colorearCampo(valido, '#telefonoEstudianteMatricula', '#errorTelefonoEstudianteMatricula', 
                    valido ? '' : 'Formato inválido (ej: +240 222 123 456)');
            });
        }
        
        const campoNombreUsuario = document.getElementById('nombreOCorreoUsuario');
        if (campoNombreUsuario) {
            campoNombreUsuario.addEventListener('input', () => {
                const valido = u_estudiante.validarNombreOCorreoUsuario(campoNombreUsuario.value);
                u_utiles.colorearCampo(valido, '#nombreOCorreoUsuario', '#errorNombreOCorreoUsuario', 
                    valido ? '' : 'Nombre de usuario o correo inválido');
            });
        }
        
        // Validaciones de matrícula
        const campoCursoAcademico = document.getElementById('cursoAcademicoMatricula');
        if (campoCursoAcademico) {
            campoCursoAcademico.addEventListener('input', () => {
                const valido = u_estudiante.validarCursoAcademico(campoCursoAcademico.value);
                u_utiles.colorearCampo(valido, '#cursoAcademicoMatricula', '#errorCursoAcademicoMatricula', 
                    valido ? '' : 'Formato inválido (ej: 2025/2026)');
            });
        }
        
        const campoFechaMatricula = document.getElementById('fechaMatricula');
        if (campoFechaMatricula) {
            campoFechaMatricula.addEventListener('change', () => {
                const valido = u_estudiante.validarFechaMatricula(campoFechaMatricula.value);
                u_utiles.colorearCampo(valido, '#fechaMatricula', '#errorFechaMatricula', 
                    valido ? '' : 'Fecha inválida');
            });
        }
        
        const campoModalidad = document.getElementById('modalidadMatricula');
        if (campoModalidad) {
            campoModalidad.addEventListener('change', () => {
                const valido = u_estudiante.validarModalidadMatricula(campoModalidad.value);
                u_utiles.colorearCampo(valido, '#modalidadMatricula', '#errorModalidadMatricula', 
                    valido ? '' : 'Seleccione una modalidad');
            });
        }
        
        const campoCreditos = document.getElementById('creditosTotalesMatricula');
        if (campoCreditos) {
            campoCreditos.addEventListener('input', () => {
                const valido = u_estudiante.validarCreditosTotales(campoCreditos.value);
                u_utiles.colorearCampo(valido, '#creditosTotalesMatricula', '#errorCreditosTotalesMatricula', 
                    valido ? '' : 'Créditos inválidos (0-60)');
            });
        }
        
        const campoEstadoMatricula = document.getElementById('estadosMatricula');
        if (campoEstadoMatricula) {
            campoEstadoMatricula.addEventListener('change', () => {
                const valido = u_estudiante.validarEstadoMatricula(campoEstadoMatricula.value);
                u_utiles.colorearCampo(valido, '#estadosMatricula', '#errorestadosMatricula', 
                    valido ? '' : 'Seleccione un estado');
            });
        }
        
        // Validaciones de pago
        const campoCuota = document.getElementById('cuotaEstudiante');
        if (campoCuota) {
            campoCuota.addEventListener('input', () => {
                const valido = u_estudiante.validarCuota(campoCuota.value);
                u_utiles.colorearCampo(valido, '#cuotaEstudiante', '#errorCuotaEstudiante', 
                    valido ? '' : 'Cuota inválida (1-12)');
            });
        }
        
        const campoMonto = document.getElementById('montoEstudiante');
        if (campoMonto) {
            campoMonto.addEventListener('input', () => {
                const valido = u_estudiante.validarMonto(campoMonto.value);
                u_utiles.colorearCampo(valido, '#montoEstudiante', '#errorMontoEstudiante', 
                    valido ? '' : 'Monto inválido');
            });
        }
        
        const campoFechaPago = document.getElementById('fechaPagoEstudiante');
        if (campoFechaPago) {
            campoFechaPago.addEventListener('change', () => {
                const valido = u_estudiante.validarFechaPago(campoFechaPago.value);
                u_utiles.colorearCampo(valido, '#fechaPagoEstudiante', '#errorFechaPagoEstudiante', 
                    valido ? '' : 'Fecha inválida');
            });
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
                // Calcular el nuevo índice basado en los bloques existentes
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
    if (bloque) {
        bloque.remove();
    }
}
}