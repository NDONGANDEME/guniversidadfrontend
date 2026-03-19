/**
 * Utilidades específicas para el módulo de Planes de Estudio
 * Contiene validaciones, combo boxes y manejo de formularios
 */

import { u_verificaciones } from "../../public/utilidades/u_verificaciones.js";
import { u_utiles } from "../../public/utilidades/u_utiles.js";

export class u_planEstudio {
    
    /**
     * VALIDACIONES DE PLAN DE ESTUDIO
     */
    
    /**
     * Valida el nombre del plan de estudio
     * @param {string} nombre - Nombre a validar
     * @returns {boolean} - true si es válido
     */
    static validarNombrePlan(nombre) {
        return u_verificaciones.validarTexto(nombre);
    }

    /**
     * Valida la fecha de elaboración
     * @param {string} fecha - Fecha a validar (formato YYYY-MM-DD)
     * @returns {boolean} - true si es válida
     */
    static validarFechaElaboracion(fecha) {
        if (!fecha) return false;
        
        const fechaRegex = /^\d{4}-\d{2}-\d{2}$/;
        if (!fechaRegex.test(fecha)) return false;
        
        const fechaObj = new Date(fecha);
        const hoy = new Date();
        
        // No puede ser fecha futura
        return fechaObj <= hoy;
    }

    /**
     * Valida el período del plan
     * @param {string} periodo - Período a validar (formato: 2024-2028)
     * @returns {boolean} - true si es válido
     */
    static validarPeriodo(periodo) {
        const periodoRegex = /^\d{4}-\d{4}$/;
        if (!periodoRegex.test(periodo)) return false;
        
        const [inicio, fin] = periodo.split('-').map(Number);
        return inicio < fin && (fin - inicio) >= 3 && (fin - inicio) <= 5;
    }

    /**
     * Valida que se haya seleccionado una opción de vigente
     * @param {string} vigente - Valor seleccionado
     * @returns {boolean} - true si es válido
     */
    static validarVigente(vigente) {
        return vigente === 'Sí' || vigente === 'No';
    }

    /**
     * Valida que se haya seleccionado una carrera
     * @param {string} idCarrera - ID de la carrera seleccionada
     * @returns {boolean} - true si es válido
     */
    static validarCarreraSeleccionada(idCarrera) {
        return idCarrera && idCarrera !== "" && idCarrera !== "Seleccione...";
    }

    /**
     * VALIDACIONES DE SEMESTRE/ASIGNATURA
     */

    /**
     * Valida el nombre del curso/semestre
     * @param {string} nombreCurso - Nombre del curso
     * @returns {boolean} - true si es válido
     */
    static validarNombreCurso(nombreCurso) {
        return nombreCurso && nombreCurso.trim().length >= 3;
    }

    /**
     * Valida el número de semestre
     * @param {number} numero - Número de semestre
     * @returns {boolean} - true si es válido
     */
    static validarNumeroSemestre(numero) {
        return numero && parseInt(numero) >= 1;
    }

    /**
     * Valida que se haya seleccionado una asignatura
     * @param {string} nombreAsignatura - Nombre de la asignatura seleccionada
     * @returns {boolean} - true si es válido
     */
    static validarAsignaturaSeleccionada(nombreAsignatura) {
        return nombreAsignatura && nombreAsignatura.trim().length > 0;
    }

    /**
     * Valida los créditos de la asignatura
     * @param {number} creditos - Créditos
     * @returns {boolean} - true si es válido
     */
    static validarCreditos(creditos) {
        return creditos && parseInt(creditos) >= 1 && parseInt(creditos) <= 12;
    }

    /**
     * Valida la modalidad
     * @param {string} modalidad - Modalidad seleccionada
     * @returns {boolean} - true si es válido
     */
    static validarModalidad(modalidad) {
        return modalidad && ['Obligatoria', 'Opcional', 'Especializada'].includes(modalidad);
    }

    /**
     * COMBO BOX INTELIGENTE PARA CURSOS
     */
    static inicializarComboCursos(inputId, dropdownId, cursos, onSelect) {
        return this._inicializarComboGenerico(inputId, dropdownId, cursos, 'idCurso', 'nombreCurso', onSelect);
    }

    /**
     * COMBO BOX INTELIGENTE PARA ASIGNATURAS
     */
    static inicializarComboAsignaturas(inputId, dropdownId, asignaturas, onSelect) {
        return this._inicializarComboGenerico(inputId, dropdownId, asignaturas, 'idAsignatura', 'nombreAsignatura', onSelect);
    }

    /**
     * COMBO BOX INTELIGENTE PARA PRERREQUISITOS (excluye la asignatura actual)
     */
    static inicializarComboPrerrequisitos(inputId, dropdownId, asignaturas, idAsignaturaExcluir, onSelect) {
        const asignaturasFiltradas = asignaturas.filter(a => a.idAsignatura != idAsignaturaExcluir);
        return this._inicializarComboGenerico(inputId, dropdownId, asignaturasFiltradas, 'idAsignatura', 'nombreAsignatura', onSelect);
    }

    /**
     * COMBO BOX INTELIGENTE PARA CURSOS CON OPCIÓN "AGREGAR NUEVO"
     */
    static inicializarComboCursosConAgregar(inputId, dropdownId, cursos, onSelect, onAgregarNuevo) {
        const input = document.getElementById(inputId);
        const dropdown = document.getElementById(dropdownId);
        
        if (!input || !dropdown) return null;

        let selectedId = null;

        const filtrarOpciones = () => {
            const texto = input.value.toLowerCase().trim();
            
            const filtrados = cursos.filter(curso => 
                curso.nombreCurso.toLowerCase().includes(texto)
            );

            let html = '';
            
            // Opción para agregar nuevo curso
            html += `<div class="dropdown-option agregar-nuevo" data-action="agregar">
                        <i class="fas fa-plus-circle me-2 text-success"></i> Agregar nuevo curso: "${input.value}"
                    </div>`;
            
            if (filtrados.length === 0) {
                html += '<div class="dropdown-option no-results">No se encontraron cursos existentes</div>';
            } else {
                filtrados.forEach(curso => {
                    html += `<div class="dropdown-option" data-id="${curso.idCurso}" data-nombre="${curso.nombreCurso}">
                        ${curso.nombreCurso}
                    </div>`;
                });
            }

            dropdown.innerHTML = html;
            dropdown.classList.add('active');
        };

        const seleccionarOpcion = (option) => {
            if (option.classList.contains('agregar-nuevo')) {
                if (onAgregarNuevo) onAgregarNuevo(input.value);
                dropdown.classList.remove('active');
                return;
            }

            const id = option.dataset.id;
            const nombre = option.dataset.nombre;
            
            input.value = nombre;
            selectedId = id;
            
            dropdown.classList.remove('active');
            
            if (onSelect) onSelect(id, nombre);
            
            u_utiles.colorearCampo(true, `#${inputId}`, null);
        };

        input.addEventListener('input', () => {
            filtrarOpciones();
            selectedId = null;
            
            const esValido = input.value.trim().length > 0;
            u_utiles.colorearCampo(esValido, `#${inputId}`, null);
        });

        input.addEventListener('click', () => {
            filtrarOpciones();
        });

        dropdown.addEventListener('click', (e) => {
            const option = e.target.closest('.dropdown-option');
            if (option) {
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
            getSelectedId: () => selectedId,
            setSelected: (id, nombre) => {
                input.value = nombre || '';
                selectedId = id || null;
                if (id) {
                    u_utiles.colorearCampo(true, `#${inputId}`, null);
                }
            }
        };
    }

    /**
     * COMBO BOX INTELIGENTE GENÉRICO
     * @private
     */
    static _inicializarComboGenerico(inputId, dropdownId, items, idField, nameField, onSelect) {
        const input = document.getElementById(inputId);
        const dropdown = document.getElementById(dropdownId);
        
        if (!input || !dropdown) return null;

        let selectedId = null;

        const filtrarOpciones = () => {
            const texto = input.value.toLowerCase().trim();
            
            const filtrados = items.filter(item => 
                item[nameField].toLowerCase().includes(texto)
            );

            let html = '';
            if (filtrados.length === 0) {
                html = '<div class="dropdown-option no-results">No se encontraron resultados</div>';
            } else {
                filtrados.forEach(item => {
                    html += `<div class="dropdown-option" data-id="${item[idField]}" data-nombre="${item[nameField]}">
                        ${item[nameField]}
                    </div>`;
                });
            }

            dropdown.innerHTML = html;
            dropdown.classList.add('active');
        };

        const seleccionarOpcion = (option) => {
            const id = option.dataset.id;
            const nombre = option.dataset.nombre;
            
            input.value = nombre;
            selectedId = id;
            
            dropdown.classList.remove('active');
            
            if (onSelect) onSelect(id, nombre);
            
            u_utiles.colorearCampo(true, `#${inputId}`, null);
        };

        input.addEventListener('input', () => {
            filtrarOpciones();
            selectedId = null;
            
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
                
                if (!selectedId && input.value.trim() !== '') {
                    input.value = '';
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
            getSelectedId: () => selectedId,
            setSelected: (id, nombre) => {
                input.value = nombre || '';
                selectedId = id || null;
                if (id) {
                    u_utiles.colorearCampo(true, `#${inputId}`, null);
                }
            }
        };
    }

    /**
     * MANEJO DE PRERREQUISITOS
     */
    static agregarCampoPrerrequisito(containerId, asignaturas, idAsignaturaActual, onPrerrequisitoAgregado) {
        const container = document.getElementById(containerId);
        if (!container) return;

        const wrapperId = 'prerreq-' + Date.now();
        const inputId = 'comboPrerreq-' + Date.now();
        const dropdownId = 'opcionesPrerreq-' + Date.now();

        const html = `
            <div class="row mt-2 prerrequisito-item" id="${wrapperId}">
                <div class="col-10 filter-group">
                    <div class="combo-input-wrapper">
                        <input type="text" id="${inputId}" class="form-control" placeholder="Buscar prerrequisito...">
                        <div class="dropdown-options" id="${dropdownId}"></div>
                    </div>
                </div>
                <div class="col-2">
                    <button class="btn btn-outline-danger btn-sm eliminar-prerrequisito" type="button">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
            </div>
        `;

        container.insertAdjacentHTML('beforeend', html);

        const combo = this.inicializarComboPrerrequisitos(
            inputId,
            dropdownId,
            asignaturas,
            idAsignaturaActual,
            (id, nombre) => {
                if (onPrerrequisitoAgregado) onPrerrequisitoAgregado(id);
            }
        );

        document.getElementById(wrapperId).querySelector('.eliminar-prerrequisito').addEventListener('click', () => {
            document.getElementById(wrapperId).remove();
        });

        return combo;
    }

    /**
     * CALCULAR ESTADÍSTICAS DEL PLAN
     */
    static calcularEstadisticas(semestres) {
        let totalSemestresConAsignaturas = 0;
        let totalAsignaturas = 0;
        let totalCreditos = 0;

        semestres.forEach(semestre => {
            if (semestre.asignaturas && semestre.asignaturas.length > 0) {
                totalSemestresConAsignaturas++;
                totalAsignaturas += semestre.asignaturas.length;
                semestre.asignaturas.forEach(asig => {
                    totalCreditos += parseInt(asig.creditos) || 0;
                });
            }
        });

        return {
            totalSemestres: totalSemestresConAsignaturas,
            totalAsignaturas,
            totalCreditos
        };
    }

    /**
     * GENERAR MALLA CURRICULAR
     */
    static generarMallaCurricular(semestres, asignaturasCompletas = []) {
        const malla = [];

        semestres.forEach(semestre => {
            const semestreInfo = {
                numero: semestre.numeroSemestre,
                nombreCurso: semestre.nombreCurso,
                asignaturas: []
            };

            if (semestre.asignaturas && semestre.asignaturas.length > 0) {
                semestre.asignaturas.forEach(asig => {
                    // Buscar prerrequisitos de esta asignatura
                    const asignaturaCompleta = asignaturasCompletas.find(a => a.idAsignatura == asig.idAsignatura);
                    const prerrequisitos = asignaturaCompleta?.prerrequisitos || [];

                    semestreInfo.asignaturas.push({
                        nombre: asig.nombreAsignatura,
                        creditos: asig.creditos,
                        modalidad: asig.modalidad,
                        prerrequisitos: prerrequisitos.map(p => p.nombreAsignaturaRequerida || 'ID: ' + p.idAsignaturaRequerida)
                    });
                });
            }

            malla.push(semestreInfo);
        });

        return malla;
    }

    /**
     * VERIFICAR PERMISOS DEL USUARIO
     */
    static tengoPermiso = [];

    static verificarPermiso(accion) {
        const usuarioActivo = JSON.parse(sessionStorage.getItem('usuarioActivo') || '{}');
        const permisos = usuarioActivo.permisos || [];

        permisos.forEach(permiso => {
            if (permiso.tabla == 'Planestudio') this.tengoPermiso.push(permiso.nombrePermiso)
        });
        
        const mapaPermisos = {
            'insertar': 'insertarPlanestudio',
            'actualizar': 'actualizarPlanestudio',
            'eliminar': 'eliminarPlanestudio',
            'visualizar': 'puede_visualizar_plan_estudio'
        };

        const permisoRequerido = mapaPermisos[accion];
        return this.tengoPermiso.includes(permisoRequerido);
    }

    /**
     * OCULTAR BOTONES SEGÚN PERMISOS
     */
    static ocultarBotonesSegunPermisos() {
        if (!this.verificarPermiso('insertar')) {
            const btnNuevo = document.getElementById('btnNuevoPlanEstudio');
            if (btnNuevo) btnNuevo.style.display = 'none';
        }

        // Los botones de editar/eliminar en tabla se manejan individualmente al renderizar
    }
}