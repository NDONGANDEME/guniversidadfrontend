import { u_verificaciones } from "../../public/utilidades/u_verificaciones.js";
import { u_utiles } from "../../public/utilidades/u_utiles.js";

/**
 * Utilidades para el formulario de estudiantes
 */
export class u_formularioEstudiante {
    
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
     * ESCAPAR HTML
     */
    static escapeHTML(str) {
        if (!str) return '';
        return String(str)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    }
}