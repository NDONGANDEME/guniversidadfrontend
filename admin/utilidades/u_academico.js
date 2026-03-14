/**
 * Utilidades específicas para el módulo de gestión académica
 * Contiene funciones de validación, combo boxes y manejo de formularios
 */

import { u_verificaciones } from "../../public/utilidades/u_verificaciones.js";
import { u_utiles } from "../../public/utilidades/u_utiles.js";

export class u_academico {
    
    /**
     * VALIDACIONES DE FACULTAD
     */
    
    /**
     * Valida el nombre de una facultad
     * @param {string} nombre - Nombre a validar
     * @returns {boolean} - true si es válido
     */
    static validarNombreFacultad(nombre) {
        return u_verificaciones.validarTexto(nombre);
    }

    /**
     * Valida la dirección de una facultad
     * @param {string} direccion - Dirección a validar
     * @returns {boolean} - true si es válida
     */
    static validarDireccionFacultad(direccion) {
        return direccion.trim().length >= 5 && direccion.trim().length <= 200;
    }

    /**
     * Valida el correo de una facultad
     * @param {string} correo - Correo a validar
     * @returns {boolean} - true si es válido
     */
    static validarCorreoFacultad(correo) {
        return u_verificaciones.validarCorreo(correo);
    }

    /**
     * Valida el teléfono de una facultad
     * @param {string} telefono - Teléfono a validar
     * @returns {boolean} - true si es válido
     */
    static validarTelefonoFacultad(telefono) {
        return u_verificaciones.validarTelefono(telefono);
    }


    /**
     * VALIDACIONES DE DEPARTAMENTO
     */

    /**
     * Valida el nombre de un departamento
     * @param {string} nombre - Nombre a validar
     * @returns {boolean} - true si es válido
     */
    static validarNombreDepartamento(nombre) {
        return u_verificaciones.validarTexto(nombre);
    }

    /**
     * Valida que se haya seleccionado una facultad
     * @param {string} idFacultad - ID de la facultad seleccionada
     * @returns {boolean} - true si es válido
     */
    static validarFacultadSeleccionada(idFacultad) {
        return idFacultad && idFacultad !== "Ninguno" && idFacultad !== "";
    }


    /**
     * VALIDACIONES DE CARRERA
     */

    /**
     * Valida el nombre de una carrera
     * @param {string} nombre - Nombre a validar
     * @returns {boolean} - true si es válido
     */
    static validarNombreCarrera(nombre) {
        return u_verificaciones.validarTexto(nombre);
    }

    /**
     * Valida que se haya seleccionado un departamento para la carrera
     * @param {string} idDepartamento - ID del departamento seleccionado
     * @returns {boolean} - true si es válido
     */
    static validarDepartamentoCarrera(idDepartamento) {
        return idDepartamento && idDepartamento !== "";
    }


    /**
     * VALIDACIONES DE ASIGNATURA
     */

    /**
     * Valida el nombre de una asignatura
     * @param {string} nombre - Nombre a validar
     * @returns {boolean} - true si es válido
     */
    static validarNombreAsignatura(nombre) {
        return u_verificaciones.validarTexto(nombre);
    }

    /**
     * Valida la descripción de una asignatura
     * @param {string} descripcion - Descripción a validar
     * @returns {boolean} - true si es válida
     */
    static validarDescripcionAsignatura(descripcion) {
        return u_verificaciones.validarDescripcion(descripcion);
    }


    /**
     * COMBO BOX INTELIGENTE PARA DEPARTAMENTOS
     */

    /**
     * Inicializa el combo box inteligente para seleccionar departamentos
     * @param {string} inputId - ID del input donde se escribe
     * @param {string} dropdownId - ID del contenedor de opciones
     * @param {Array} departamentos - Lista de departamentos
     * @param {Function} onSelect - Callback cuando se selecciona un departamento
     */
    static inicializarComboDepartamentos(inputId, dropdownId, departamentos, onSelect) {
        const input = document.getElementById(inputId);
        const dropdown = document.getElementById(dropdownId);
        
        if (!input || !dropdown) return;

        let selectedId = null;

        const filtrarOpciones = () => {
            const texto = input.value.toLowerCase().trim();
            
            const filtrados = departamentos.filter(depto => 
                depto.nombreDepartamento.toLowerCase().includes(texto)
            );

            let html = '';
            if (filtrados.length === 0) {
                html = '<div class="dropdown-option no-results">No se encontraron resultados</div>';
            } else {
                filtrados.forEach(depto => {
                    html += `<div class="dropdown-option" data-id="${depto.idDepartamento}" data-nombre="${depto.nombreDepartamento}">
                        ${depto.nombreDepartamento}
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
                
                if (!selectedId) {
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
     * MANEJO DE PESTAÑAS
     */

    /**
     * Inicializa los botones desplegables para cambiar entre secciones
     * @param {Array} botonesIds - IDs de los botones
     * @param {Array} seccionesIds - IDs de las secciones
     * @param {string} claseActiva - Clase CSS para botón activo
     */
    static inicializarBotonesDesplegables(botonesIds, seccionesIds, claseActiva = 'btn-warning') {
        botonesIds.forEach((btnId, index) => {
            const btn = document.getElementById(btnId);
            if (!btn) return;

            btn.addEventListener('click', () => {
                seccionesIds.forEach(seccionId => {
                    const seccion = document.getElementById(seccionId);
                    if (seccion) seccion.classList.add('d-none');
                });

                const seccionActual = document.getElementById(seccionesIds[index]);
                if (seccionActual) seccionActual.classList.remove('d-none');

                botonesIds.forEach(id => {
                    const boton = document.getElementById(id);
                    if (boton) {
                        boton.classList.remove(claseActiva);
                        boton.classList.add('btn-outline-warning');
                    }
                });

                btn.classList.remove('btn-outline-warning');
                btn.classList.add(claseActiva);
            });
        });
    }
}