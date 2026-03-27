import { u_verificaciones } from "../../public/utilidades/u_verificaciones.js";
import { u_utiles } from "../../public/utilidades/u_utiles.js";

/**
 * Utilidades específicas para el módulo de estudiantes
 * Contiene funciones de validación, combos y manejo de formularios
 */
export class u_estudiante {
    
    /**
     * VALIDACIONES DE ESTUDIANTE
     */
    
    /**
     * Valida el nombre de un estudiante
     * @param {string} nombre - Nombre a validar
     * @returns {boolean} - true si es válido
     */
    static validarNombreEstudiante(nombre) {
        return u_verificaciones.validarNombre(nombre);
    }

    /**
     * Valida los apellidos de un estudiante
     * @param {string} apellidos - Apellidos a validar
     * @returns {boolean} - true si es válido
     */
    static validarApellidosEstudiante(apellidos) {
        return u_verificaciones.validarNombre(apellidos);
    }

    /**
     * Valida el DIP de un estudiante
     * @param {string} dip - DIP a validar
     * @returns {boolean} - true si es válido
     */
    static validarDIPEstudiante(dip) {
        return u_verificaciones.validarDIP(dip);
    }

    /**
     * Valida la fecha de nacimiento
     * @param {string} fecha - Fecha a validar
     * @returns {boolean} - true si es válida
     */
    static validarFechaNacimiento(fecha) {
        if (!fecha) return false;
        const fechaObj = new Date(fecha);
        const hoy = new Date();
        const edad = hoy.getFullYear() - fechaObj.getFullYear();
        return fechaObj instanceof Date && !isNaN(fechaObj) && edad >= 16 && edad <= 100;
    }

    /**
     * Valida la nacionalidad
     * @param {string} nacionalidad - Nacionalidad a validar
     * @returns {boolean} - true si es válida
     */
    static validarNacionalidad(nacionalidad) {
        return nacionalidad && nacionalidad.trim().length >= 3 && nacionalidad.trim().length <= 50;
    }

    /**
     * Valida el género/sexo
     * @param {string} genero - Género seleccionado
     * @returns {boolean} - true si es válido
     */
    static validarGenero(genero) {
        return genero && genero !== "Ninguno";
    }

    /**
     * Valida la dirección
     * @param {string} direccion - Dirección a validar
     * @returns {boolean} - true si es válida
     */
    static validarDireccion(direccion) {
        return direccion && direccion.trim().length >= 5 && direccion.trim().length <= 200;
    }

    /**
     * Valida la localidad
     * @param {string} localidad - Localidad a validar
     * @returns {boolean} - true si es válida
     */
    static validarLocalidad(localidad) {
        return localidad && localidad.trim().length >= 3 && localidad.trim().length <= 100;
    }

    /**
     * Valida la provincia
     * @param {string} provincia - Provincia a validar
     * @returns {boolean} - true si es válida
     */
    static validarProvincia(provincia) {
        return provincia && provincia.trim().length >= 3 && provincia.trim().length <= 100;
    }

    /**
     * Valida el correo del estudiante
     * @param {string} correo - Correo a validar
     * @returns {boolean} - true si es válido
     */
    static validarCorreoEstudiante(correo) {
        return u_verificaciones.validarCorreo(correo);
    }

    /**
     * Valida el teléfono del estudiante
     * @param {string} telefono - Teléfono a validar
     * @returns {boolean} - true si es válido
     */
    static validarTelefonoEstudiante(telefono) {
        return u_verificaciones.validarTelefono(telefono);
    }

    /**
     * Valida el país seleccionado
     * @param {string} pais - País seleccionado
     * @returns {boolean} - true si es válido
     */
    static validarPais(pais) {
        return pais && pais.trim().length >= 3 && pais !== "Ninguno";
    }

    /**
     * Valida el centro de procedencia
     * @param {string} centro - Centro a validar
     * @returns {boolean} - true si es válido
     */
    static validarCentroProcedencia(centro) {
        return centro && centro.trim().length >= 3;
    }

    /**
     * Valida la universidad de procedencia
     * @param {string} universidad - Universidad a validar
     * @returns {boolean} - true si es válida
     */
    static validarUniversidadProcedencia(universidad) {
        return universidad && universidad.trim().length >= 3;
    }

    /**
     * VALIDACIONES DE FAMILIARES
     */

    /**
     * Valida el nombre de un familiar
     * @param {string} nombre - Nombre a validar
     * @returns {boolean} - true si es válido
     */
    static validarNombreFamiliar(nombre) {
        return u_verificaciones.validarNombre(nombre);
    }

    /**
     * Valida los apellidos de un familiar
     * @param {string} apellidos - Apellidos a validar
     * @returns {boolean} - true si es válido
     */
    static validarApellidosFamiliar(apellidos) {
        return u_verificaciones.validarNombre(apellidos);
    }

    /**
     * Valida el DIP de un familiar
     * @param {string} dip - DIP a validar
     * @returns {boolean} - true si es válido
     */
    static validarDIPFamiliar(dip) {
        return u_verificaciones.validarDIP(dip);
    }

    /**
     * Valida el parentesco
     * @param {string} parentesco - Parentesco a validar
     * @returns {boolean} - true si es válido
     */
    static validarParentesco(parentesco) {
        return parentesco && parentesco.trim().length >= 3 && parentesco.trim().length <= 50;
    }

    /**
     * Valida el correo de un familiar
     * @param {string} correo - Correo a validar
     * @returns {boolean} - true si es válido
     */
    static validarCorreoFamiliar(correo) {
        return u_verificaciones.validarCorreo(correo);
    }

    /**
     * Valida el teléfono de un familiar
     * @param {string} telefono - Teléfono a validar
     * @returns {boolean} - true si es válido
     */
    static validarTelefonoFamiliar(telefono) {
        return u_verificaciones.validarTelefono(telefono);
    }

    /**
     * VALIDACIONES DE MATRÍCULA
     */

    /**
     * Valida el curso académico
     * @param {string} curso - Curso a validar (formato YYYY/YYYY)
     * @returns {boolean} - true si es válido
     */
    static validarCursoAcademico(curso) {
        const regex = /^\d{4}\/\d{4}$/;
        if (!regex.test(curso)) return false;
        const [inicio, fin] = curso.split('/');
        return parseInt(fin) === parseInt(inicio) + 1;
    }

    /**
     * Valida la fecha de matrícula
     * @param {string} fecha - Fecha a validar
     * @returns {boolean} - true si es válida
     */
    static validarFechaMatricula(fecha) {
        if (!fecha) return false;
        const fechaObj = new Date(fecha);
        const hoy = new Date();
        return fechaObj instanceof Date && !isNaN(fechaObj) && fechaObj <= hoy;
    }

    /**
     * Valida la modalidad de matrícula
     * @param {string} modalidad - Modalidad seleccionada
     * @returns {boolean} - true si es válida
     */
    static validarModalidadMatricula(modalidad) {
        return modalidad && modalidad !== "Ninguno";
    }

    /**
     * Valida el total de créditos
     * @param {number} creditos - Créditos a validar
     * @returns {boolean} - true si es válido
     */
    static validarCreditosTotales(creditos) {
        const num = parseInt(creditos);
        return !isNaN(num) && num >= 0 && num <= 60;
    }

    /**
     * Valida el estado de matrícula
     * @param {string} estado - Estado seleccionado
     * @returns {boolean} - true si es válido
     */
    static validarEstadoMatricula(estado) {
        return estado && estado !== "Ninguno";
    }

    /**
     * VALIDACIONES DE PAGO
     */

    /**
     * Valida la cuota
     * @param {number} cuota - Cuota a validar
     * @returns {boolean} - true si es válida
     */
    static validarCuota(cuota) {
        const num = parseInt(cuota);
        return !isNaN(num) && num > 0 && num <= 12;
    }

    /**
     * Valida el monto
     * @param {number} monto - Monto a validar
     * @returns {boolean} - true si es válido
     */
    static validarMonto(monto) {
        const num = parseFloat(monto);
        return !isNaN(num) && num > 0 && num <= 10000000;
    }

    /**
     * Valida la fecha de pago
     * @param {string} fecha - Fecha a validar
     * @returns {boolean} - true si es válida
     */
    static validarFechaPago(fecha) {
        if (!fecha) return false;
        const fechaObj = new Date(fecha);
        const hoy = new Date();
        return fechaObj instanceof Date && !isNaN(fechaObj) && fechaObj <= hoy;
    }

    /**
     * VALIDACIONES DE BECA
     */

    /**
     * Valida la institución de beca
     * @param {string} institucion - Institución a validar
     * @returns {boolean} - true si es válida
     */
    static validarInstitucionBeca(institucion) {
        return institucion && institucion.trim().length >= 3 && institucion.trim().length <= 100;
    }

    /**
     * Valida el tipo de beca
     * @param {string} tipo - Tipo seleccionado
     * @returns {boolean} - true si es válido
     */
    static validarTipoBeca(tipo) {
        return tipo && tipo !== "Ninguno";
    }

    /**
     * Valida el estado de beca
     * @param {string} estado - Estado seleccionado
     * @returns {boolean} - true si es válido
     */
    static validarEstadoBeca(estado) {
        return estado && estado !== "Ninguno";
    }

    /**
     * Valida la fecha de inicio de beca
     * @param {string} fecha - Fecha a validar
     * @returns {boolean} - true si es válida
     */
    static validarFechaInicioBeca(fecha) {
        if (!fecha) return false;
        const fechaObj = new Date(fecha);
        return fechaObj instanceof Date && !isNaN(fechaObj);
    }

    /**
     * Valida la fecha de fin de beca
     * @param {string} fechaInicio - Fecha de inicio
     * @param {string} fechaFin - Fecha de fin
     * @returns {boolean} - true si es válida
     */
    static validarFechaFinBeca(fechaInicio, fechaFin) {
        if (!fechaFin) return false;
        const fechaInicioObj = new Date(fechaInicio);
        const fechaFinObj = new Date(fechaFin);
        return fechaFinObj instanceof Date && !isNaN(fechaFinObj) && fechaFinObj >= fechaInicioObj;
    }

    /**
     * Valida las observaciones
     * @param {string} observaciones - Observaciones a validar
     * @returns {boolean} - true si es válida
     */
    static validarObservacionesBeca(observaciones) {
        return u_verificaciones.validarDescripcion(observaciones);
    }

    /**
     * VALIDACIONES DE USUARIO
     */

    /**
     * Valida el nombre de usuario o correo
     * @param {string} nombreOCorreo - Nombre o correo a validar
     * @returns {boolean} - true si es válido
     */
    static validarNombreOCorreoUsuario(nombreOCorreo) {
        return u_verificaciones.validarNombreOCorreo(nombreOCorreo);
    }

    /**
     * COMBO BOX INTELIGENTE PARA PAÍSES
     */

    /**
     * Lista estática de países
     */
    static paises = [
        "Guinea Ecuatorial", "España", "México", "Argentina", "Colombia", 
        "Perú", "Venezuela", "Chile", "Ecuador", "Cuba", "República Dominicana",
        "Puerto Rico", "Estados Unidos", "Francia", "Portugal", "Brasil",
        "Camerún", "Gabón", "Nigeria", "Angola", "Marruecos"
    ];

    /**
     * Inicializa el combo box inteligente para países
     * @param {string} inputId - ID del input donde se escribe
     * @param {string} dropdownId - ID del contenedor de opciones
     * @param {Function} onSelect - Callback cuando se selecciona un país
     */
    static inicializarComboPaises(inputId, dropdownId, onSelect = null) {
        const input = document.getElementById(inputId);
        const dropdown = document.getElementById(dropdownId);
        
        if (!input || !dropdown) return null;

        let selectedValue = null;

        const filtrarOpciones = () => {
            const texto = input.value.toLowerCase().trim();
            
            const filtrados = this.paises.filter(pais => 
                pais.toLowerCase().includes(texto)
            );

            let html = '';
            if (filtrados.length === 0) {
                html = '<div class="dropdown-option no-results">No se encontraron resultados</div>';
            } else {
                filtrados.forEach(pais => {
                    html += `<div class="dropdown-option" data-valor="${this.escapeHTML(pais)}">
                        ${this.escapeHTML(pais)}
                    </div>`;
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
            
            if (onSelect) onSelect(valor);
            
            u_utiles.colorearCampo(true, `#${inputId}`, null);
        };

        input.addEventListener('input', () => {
            filtrarOpciones();
            selectedValue = null;
            
            const esValido = input.value.trim().length > 0;
            u_utiles.colorearCampo(esValido, `#${inputId}`, null);
        });

        input.addEventListener('click', () => {
            filtrarOpciones();
        });

        dropdown.addEventListener('click', (e) => {
            const option = e.target.closest('.dropdown-option');
            if (option && !option.classList.contains('no-results')) {
                seleccionarOpcion(option);
            }
        });

        document.addEventListener('click', (e) => {
            if (!input.contains(e.target) && !dropdown.contains(e.target)) {
                dropdown.classList.remove('active');
                
                if (!selectedValue && input.value.trim()) {
                    // Si no se seleccionó nada y hay texto, puede ser un nuevo país
                    const nuevoPais = input.value.trim();
                    if (nuevoPais && !this.paises.includes(nuevoPais)) {
                        this.paises.push(nuevoPais);
                        selectedValue = nuevoPais;
                    }
                }
            }
        });

        input.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                dropdown.classList.remove('active');
            } else if (e.key === 'Enter' && dropdown.classList.contains('active')) {
                const primeraOpcion = dropdown.querySelector('.dropdown-option:not(.no-results)');
                if (primeraOpcion) {
                    e.preventDefault();
                    seleccionarOpcion(primeraOpcion);
                }
            }
        });

        return {
            getSelected: () => selectedValue,
            setSelected: (valor) => {
                if (valor) {
                    input.value = valor;
                    selectedValue = valor;
                    if (!this.paises.includes(valor)) {
                        this.paises.push(valor);
                    }
                    u_utiles.colorearCampo(true, `#${inputId}`, null);
                }
            }
        };
    }

    /**
     * COMBO BOX INTELIGENTE CON OPCIÓN "NUEVO"
     */

    /**
     * Inicializa un combo que permite añadir nuevos valores
     * @param {string} inputId - ID del input donde se escribe
     * @param {string} dropdownId - ID del contenedor de opciones
     * @param {Array} opciones - Lista de opciones existentes
     * @param {Function} onSelect - Callback cuando se selecciona una opción
     * @param {Function} onNuevo - Callback cuando se añade un nuevo valor
     */
    static inicializarComboConNuevo(inputId, dropdownId, opciones, onSelect = null, onNuevo = null) {
        const input = document.getElementById(inputId);
        const dropdown = document.getElementById(dropdownId);
        
        if (!input || !dropdown) return null;

        let selectedValue = null;

        const filtrarOpciones = () => {
            const texto = input.value.toLowerCase().trim();
            
            let filtrados = opciones.filter(opt => 
                opt && opt.toLowerCase().includes(texto)
            );

            let html = '';
            
            // Opción para añadir nuevo
            if (texto && !opciones.some(opt => opt && opt.toLowerCase() === texto)) {
                html += `<div class="dropdown-option option-nuevo" data-nuevo="true" data-valor="${this.escapeHTML(texto)}">
                    <i class="fas fa-plus-circle me-2"></i> Nuevo: "${this.escapeHTML(texto)}"
                </div>`;
            }
            
            if (filtrados.length === 0 && !texto) {
                html += '<div class="dropdown-option no-results">No hay opciones disponibles</div>';
            } else if (filtrados.length > 0) {
                filtrados.forEach(opt => {
                    html += `<div class="dropdown-option" data-valor="${this.escapeHTML(opt)}">
                        ${this.escapeHTML(opt)}
                    </div>`;
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
            
            if (onSelect) onSelect(valor);
            
            u_utiles.colorearCampo(true, `#${inputId}`, null);
        };

        input.addEventListener('input', () => {
            filtrarOpciones();
            selectedValue = null;
            
            const esValido = input.value.trim().length > 0;
            u_utiles.colorearCampo(esValido, `#${inputId}`, null);
        });

        input.addEventListener('click', () => {
            filtrarOpciones();
        });

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

        input.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                dropdown.classList.remove('active');
            } else if (e.key === 'Enter' && dropdown.classList.contains('active')) {
                const primeraOpcion = dropdown.querySelector('.dropdown-option:not(.no-results)');
                if (primeraOpcion) {
                    e.preventDefault();
                    seleccionarOpcion(primeraOpcion);
                }
            }
        });

        return {
            getSelected: () => selectedValue,
            setSelected: (valor) => {
                if (valor) {
                    input.value = valor;
                    selectedValue = valor;
                    if (opciones && !opciones.includes(valor)) {
                        opciones.push(valor);
                    }
                    u_utiles.colorearCampo(true, `#${inputId}`, null);
                }
            }
        };
    }

    /**
     * VALIDAR BLOQUE DE FAMILIAR
     */
    static validarBloqueFamiliar(bloque, index) {
        const nombre = bloque.querySelector('.familiar-nombre')?.value || '';
        const apellidos = bloque.querySelector('.familiar-apellidos')?.value || '';
        const dip = bloque.querySelector('.familiar-dip')?.value || '';
        const direccion = bloque.querySelector('.familiar-direccion')?.value || '';
        const correo = bloque.querySelector('.familiar-correo')?.value || '';
        const telefono = bloque.querySelector('.familiar-telefono')?.value || '';
        const parentesco = bloque.querySelector('.familiar-parentesco')?.value || '';
        
        const validaciones = {
            nombre: this.validarNombreFamiliar(nombre),
            apellidos: this.validarApellidosFamiliar(apellidos),
            dip: this.validarDIPFamiliar(dip),
            direccion: this.validarDireccion(direccion),
            correo: this.validarCorreoFamiliar(correo),
            telefono: this.validarTelefonoFamiliar(telefono),
            parentesco: this.validarParentesco(parentesco)
        };
        
        // Aplicar colores y mensajes
        u_utiles.colorearCampo(validaciones.nombre, `.familiar-nombre`, `.error-familiar-nombre-${index}`, 
            validaciones.nombre ? '' : 'Nombre inválido (mínimo 3 caracteres)');
        u_utiles.colorearCampo(validaciones.apellidos, `.familiar-apellidos`, `.error-familiar-apellidos-${index}`, 
            validaciones.apellidos ? '' : 'Apellidos inválidos (mínimo 3 caracteres)');
        u_utiles.colorearCampo(validaciones.dip, `.familiar-dip`, `.error-familiar-dip-${index}`, 
            validaciones.dip ? '' : 'Formato inválido (ej: 000 000 000)');
        u_utiles.colorearCampo(validaciones.direccion, `.familiar-direccion`, `.error-familiar-direccion-${index}`, 
            validaciones.direccion ? '' : 'Dirección inválida (mínimo 5 caracteres)');
        u_utiles.colorearCampo(validaciones.correo, `.familiar-correo`, `.error-familiar-correo-${index}`, 
            validaciones.correo ? '' : 'Formato de correo inválido');
        u_utiles.colorearCampo(validaciones.telefono, `.familiar-telefono`, `.error-familiar-telefono-${index}`, 
            validaciones.telefono ? '' : 'Formato inválido (ej: +240 222 123 456)');
        u_utiles.colorearCampo(validaciones.parentesco, `.familiar-parentesco`, `.error-familiar-parentesco-${index}`, 
            validaciones.parentesco ? '' : 'Parentesco inválido (mínimo 3 caracteres)');
        
        return Object.values(validaciones).every(v => v === true);
    }

    /**
     * VALIDAR BLOQUE DE BECA
     */
    static validarBloqueBeca(bloque, index, fechaInicioGlobal = null) {
        const institucion = bloque.querySelector('.beca-institucion')?.value || '';
        const tipo = bloque.querySelector('.beca-tipo')?.value || '';
        const estado = bloque.querySelector('.beca-estado')?.value || '';
        const fechaInicio = bloque.querySelector('.beca-fechaInicio')?.value || '';
        const fechaFin = bloque.querySelector('.beca-fechaFin')?.value || '';
        const observaciones = bloque.querySelector('.beca-observaciones')?.value || '';
        
        const validaciones = {
            institucion: this.validarInstitucionBeca(institucion),
            tipo: this.validarTipoBeca(tipo),
            estado: this.validarEstadoBeca(estado),
            fechaInicio: this.validarFechaInicioBeca(fechaInicio),
            fechaFin: fechaInicio ? this.validarFechaFinBeca(fechaInicio, fechaFin) : (fechaFin ? false : true),
            observaciones: this.validarObservacionesBeca(observaciones)
        };
        
        // Aplicar colores y mensajes
        u_utiles.colorearCampo(validaciones.institucion, `.beca-institucion`, `.error-beca-institucion-${index}`, 
            validaciones.institucion ? '' : 'Institución inválida (mínimo 3 caracteres)');
        u_utiles.colorearCampo(validaciones.tipo, `.beca-tipo`, `.error-beca-tipo-${index}`, 
            validaciones.tipo ? '' : 'Seleccione un tipo de beca');
        u_utiles.colorearCampo(validaciones.estado, `.beca-estado`, `.error-beca-estado-${index}`, 
            validaciones.estado ? '' : 'Seleccione un estado');
        u_utiles.colorearCampo(validaciones.fechaInicio, `.beca-fechaInicio`, `.error-beca-fechaInicio-${index}`, 
            validaciones.fechaInicio ? '' : 'Fecha de inicio inválida');
        u_utiles.colorearCampo(validaciones.fechaFin, `.beca-fechaFin`, `.error-beca-fechaFin-${index}`, 
            validaciones.fechaFin ? '' : 'Fecha de fin inválida (debe ser posterior a inicio)');
        u_utiles.colorearCampo(validaciones.observaciones, `.beca-observaciones`, `.error-beca-observaciones-${index}`, 
            validaciones.observaciones ? '' : 'Observaciones inválidas (mínimo 10 caracteres)');
        
        return Object.values(validaciones).every(v => v === true);
    }

    /**
 * CREAR BLOQUE DE FAMILIAR (para agregar dinámicamente)
 * @param {number} index - Índice del bloque
 * @param {Object} datos - Datos del familiar (opcional)
 * @returns {string} - HTML del bloque
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
        <div class="familiar-bloque border rounded p-3 mb-3 position-relative" data-index="${index}">
            <button type="button" class="btn-close btn-eliminar-familiar position-absolute top-0 end-0 mt-2 me-2" aria-label="Eliminar"></button>
            
            <div class="row">
                <div class="col-md-4 mb-2">
                    <label class="form-label small">Nombre</label>
                    <input type="text" class="form-control form-control-sm familiar-nombre" 
                           name="familiar_nombre[]" value="${this.escapeHTML(nombre)}" 
                           placeholder="Ej: Martín" required>
                    <label class="errorMensaje error-familiar-nombre-${index}"></label>
                </div>
                <div class="col-md-4 mb-2">
                    <label class="form-label small">Apellidos</label>
                    <input type="text" class="form-control form-control-sm familiar-apellidos" 
                           name="familiar_apellidos[]" value="${this.escapeHTML(apellidos)}" 
                           placeholder="Ej: Lola" required>
                    <label class="errorMensaje error-familiar-apellidos-${index}"></label>
                </div>
                <div class="col-md-4 mb-2">
                    <label class="form-label small">DIP</label>
                    <input type="text" class="form-control form-control-sm familiar-dip" 
                           name="familiar_dip[]" value="${this.escapeHTML(dip)}" 
                           placeholder="Ej: 000 000 000">
                    <label class="errorMensaje error-familiar-dip-${index}"></label>
                </div>
            </div>
            
            <div class="row">
                <div class="col-md-4 mb-2">
                    <label class="form-label small">Dirección</label>
                    <input type="text" class="form-control form-control-sm familiar-direccion" 
                           name="familiar_direccion[]" value="${this.escapeHTML(direccion)}" 
                           placeholder="Ej: Avenida las Palmas">
                    <label class="errorMensaje error-familiar-direccion-${index}"></label>
                </div>
                <div class="col-md-4 mb-2">
                    <label class="form-label small">Correo</label>
                    <input type="email" class="form-control form-control-sm familiar-correo" 
                           name="familiar_correo[]" value="${this.escapeHTML(correo)}" 
                           placeholder="Ej: familiar@email.com">
                    <label class="errorMensaje error-familiar-correo-${index}"></label>
                </div>
                <div class="col-md-4 mb-2">
                    <label class="form-label small">Teléfono</label>
                    <input type="tel" class="form-control form-control-sm familiar-telefono" 
                           name="familiar_telefono[]" value="${this.escapeHTML(telefono)}" 
                           placeholder="Ej: +240 222 123 456">
                    <label class="errorMensaje error-familiar-telefono-${index}"></label>
                </div>
            </div>
            
            <div class="row">
                <div class="col-md-4 mb-2">
                    <label class="form-label small">Parentezco</label>
                    <input type="text" class="form-control form-control-sm familiar-parentesco" 
                           name="familiar_parentesco[]" value="${this.escapeHTML(parentesco)}" 
                           placeholder="Ej: Padre" required>
                    <label class="errorMensaje error-familiar-parentesco-${index}"></label>
                </div>
                <div class="col-md-4 mb-2">
                    <label class="form-label small">¿Es contacto incidente?</label>
                    <select class="form-select form-select-sm familiar-contactoIncidente" 
                            name="familiar_contactoIncidente[]">
                        <option value="No" ${esContacto === 'No' ? 'selected' : ''}>No</option>
                        <option value="Sí" ${esContacto === 'Sí' ? 'selected' : ''}>Sí</option>
                    </select>
                    <label class="errorMensaje error-familiar-contactoIncidente-${index}"></label>
                </div>
                <div class="col-md-4 mb-2">
                    <label class="form-label small">¿Es responsable de pago?</label>
                    <select class="form-select form-select-sm familiar-responsablePago" 
                            name="familiar_responsablePago[]">
                        <option value="No" ${esResponsable === 'No' ? 'selected' : ''}>No</option>
                        <option value="Sí" ${esResponsable === 'Sí' ? 'selected' : ''}>Sí</option>
                    </select>
                    <label class="errorMensaje error-familiar-responsablePago-${index}"></label>
                </div>
            </div>
        </div>
    `;
}

/**
 * CREAR BLOQUE DE BECA (para agregar dinámicamente)
 * @param {number} index - Índice del bloque
 * @param {Object} datos - Datos de la beca (opcional)
 * @returns {string} - HTML del bloque
 */
static crearBloqueBeca(index, datos = null) {
    const institucion = datos?.institucionBeca || '';
    const tipo = datos?.tipoBeca || 'Ninguno';
    const estado = datos?.estado || 'Ninguno';
    const fechaInicio = datos?.fechaInicio ? datos.fechaInicio.split('T')[0] : '';
    const fechaFin = datos?.fechaFinal ? datos.fechaFinal.split('T')[0] : '';
    const observaciones = datos?.observaciones || '';
    
    return `
        <div class="beca-bloque border rounded p-3 mb-3 position-relative" data-index="${index}">
            <button type="button" class="btn-close btn-eliminar-beca position-absolute top-0 end-0 mt-2 me-2" aria-label="Eliminar"></button>
            
            <div class="row">
                <div class="col-md-6 mb-2">
                    <label class="form-label small">Nombre de la institución</label>
                    <input type="text" class="form-control form-control-sm beca-institucion" 
                           name="beca_institucion[]" value="${this.escapeHTML(institucion)}" 
                           placeholder="Ej: AAUCA" required>
                    <label class="errorMensaje error-beca-institucion-${index}"></label>
                </div>
                <div class="col-md-3 mb-2">
                    <label class="form-label small">Tipo</label>
                    <select class="form-select form-select-sm beca-tipo" name="beca_tipo[]" required>
                        <option value="Ninguno" ${tipo === 'Ninguno' ? 'selected' : ''}>Seleccione...</option>
                        <option value="Externa" ${tipo === 'Externa' ? 'selected' : ''}>Externa</option>
                        <option value="Interna" ${tipo === 'Interna' ? 'selected' : ''}>Interna</option>
                    </select>
                    <label class="errorMensaje error-beca-tipo-${index}"></label>
                </div>
                <div class="col-md-3 mb-2">
                    <label class="form-label small">Estado</label>
                    <select class="form-select form-select-sm beca-estado" name="beca_estado[]" required>
                        <option value="Ninguno" ${estado === 'Ninguno' ? 'selected' : ''}>Seleccione...</option>
                        <option value="Vigente" ${estado === 'Vigente' ? 'selected' : ''}>Vigente</option>
                        <option value="No vigente" ${estado === 'No vigente' ? 'selected' : ''}>No vigente</option>
                    </select>
                    <label class="errorMensaje error-beca-estado-${index}"></label>
                </div>
            </div>
            
            <div class="row">
                <div class="col-md-3 mb-2">
                    <label class="form-label small">Fecha de inicio</label>
                    <input type="date" class="form-control form-control-sm beca-fechaInicio" 
                           name="beca_fechaInicio[]" value="${fechaInicio}" required>
                    <label class="errorMensaje error-beca-fechaInicio-${index}"></label>
                </div>
                <div class="col-md-3 mb-2">
                    <label class="form-label small">Fecha de fin</label>
                    <input type="date" class="form-control form-control-sm beca-fechaFin" 
                           name="beca_fechaFin[]" value="${fechaFin}" required>
                    <label class="errorMensaje error-beca-fechaFin-${index}"></label>
                </div>
                <div class="col-md-6 mb-2">
                    <label class="form-label small">Observaciones</label>
                    <textarea class="form-control form-control-sm beca-observaciones" 
                              name="beca_observaciones[]" rows="2" 
                              placeholder="Ej: Describa las observaciones">${this.escapeHTML(observaciones)}</textarea>
                    <label class="errorMensaje error-beca-observaciones-${index}"></label>
                </div>
            </div>
        </div>
    `;
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
}