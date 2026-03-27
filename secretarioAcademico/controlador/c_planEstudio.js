import { sesiones } from "../../public/core/sesiones.js";
import { u_utiles } from "../../public/utilidades/u_utiles.js";
import { u_planEstudio } from "../utilidades/u_planEstudio.js";
import { Alerta } from "../../public/utilidades/u_alertas.js";
import { m_planEstudio } from "../modelo/m_planEstudio.js";
import { m_carrera } from "../../admin/modelo/m_academico.js";

export class c_planEstudio {
    
    /**
     * VARIABLES DE ESTADO
     */
    static planesEstudio = [];
    static carreras = [];
    static idFacultad = null;
    
    // Variables para paginación
    static paginaActual = 1;
    static totalPaginas = 1;

    /**
     * INICIALIZACIÓN
     */
    static async iniciar() {
        // Obtener facultad del usuario desde sesión
        const usuarioActivo = JSON.parse(sessionStorage.getItem('usuarioActivo') || '{}');
        this.idFacultad = usuarioActivo.idFacultad;
        
        if (!this.idFacultad) {
            Alerta.error('Error', 'No se pudo determinar la facultad del usuario');
            return;
        }

        await this.cargarDatosIniciales();
        this.inicializarEventos();
        u_planEstudio.ocultarBotonesSegunPermisos();
    }

    /**
     * Carga los datos iniciales
     */
    static async cargarDatosIniciales() {
        try {
            await this.cargarTotalPaginas();
            await this.cargarPlanesPaginados(1);
            await this.cargarCarreras();
        } catch (error) {
            console.error('Error cargando datos iniciales:', error);
            Alerta.error('Error', 'No se pudieron cargar los datos iniciales');
        }
    }

    /**
     * Inicializa los eventos
     */
    static inicializarEventos() {
        // Botones de paginación
        document.getElementById('btnAnteriorPlanEstudios')?.addEventListener('click', () => this.irAPaginaAnterior());
        document.getElementById('btnSiguientePlanEstudios')?.addEventListener('click', () => this.irAPaginaSiguiente());

        // Botón volver al panel principal
        document.getElementById('btnVolverPanelPrincipal')?.addEventListener('click', () => {
            window.location.href = '/guniversidadfrontend/secretarioAcademico/index.html';
        });

        // Botón nuevo plan de estudio
        const btnNuevo = document.getElementById('btnNuevoPlanEstudio');
        if (btnNuevo && u_planEstudio.verificarPermiso('insertar')) {
            btnNuevo.addEventListener('click', () => {
                window.location.href = '/guniversidadfrontend/secretarioAcademico/template/html/formularioPlanEstudio.html?modo=crear';
            });
        }
    }

    /**
     * CARGA DE DATOS - PLANES DE ESTUDIO (CON PAGINACIÓN)
     */

    /**
     * Carga el total de páginas
     */
    static async cargarTotalPaginas() {
        try {
            const response = await m_planEstudio.obtenerPlanesEstudiosAPaginar(1, this.idFacultad);

            if (response.length==0) return;

            this.totalPaginas = response.total_paginas || 1;
            this.actualizarEstadoBotonesPaginacion();
            this.actualizarIndicadorPagina();
        } catch (error) {
            console.error('Error cargando total de páginas:', error);
        }
    }

    /**
     * Carga planes paginados
     * @param {number} pagina - Número de página
     */
    static async cargarPlanesPaginados(pagina) {
        try {
            const response = await m_planEstudio.obtenerPlanesEstudiosAPaginar(pagina, this.idFacultad);

            if (response.length == 0) return;

            this.planesEstudio = response.planes || [];
            this.paginaActual = response.pagina_actual || pagina;
            this.mostrarPlanesEnTabla();
            this.actualizarEstadoBotonesPaginacion();
            this.actualizarIndicadorPagina();
        } catch (error) {
            console.error('Error cargando planes paginados:', error);
            Alerta.error('Error', 'No se pudieron cargar los planes de estudio');
        }
    }

    /**
     * Carga las carreras para mostrar nombres
     */
    static async cargarCarreras() {
        try {
            const response = await m_carrera.obtenerCarreraPorFacultad(this.idFacultad);
            this.carreras = response.carreras || response || [];
        } catch (error) {
            console.error('Error cargando carreras:', error);
        }
    }

    /**
     * Actualiza el estado de los botones de paginación
     */
    static actualizarEstadoBotonesPaginacion() {
        const btnAnterior = document.getElementById('btnAnteriorPlanEstudios');
        const btnSiguiente = document.getElementById('btnSiguientePlanEstudios');
        
        if (btnAnterior) {
            btnAnterior.disabled = this.paginaActual <= 1;
        }
        
        if (btnSiguiente) {
            btnSiguiente.disabled = this.paginaActual >= this.totalPaginas;
        }
    }

    /**
     * Actualiza el indicador de página actual
     */
    static actualizarIndicadorPagina() {
        const indicador = document.getElementById('paginaActualPlanEstudios');
        if (indicador) {
            indicador.textContent = `Página ${this.paginaActual} de ${this.totalPaginas}`;
        }
    }

    /**
     * Navega a la página anterior
     */
    static async irAPaginaAnterior() {
        if (this.paginaActual > 1) {
            await this.cargarPlanesPaginados(this.paginaActual - 1);
        }
    }

    /**
     * Navega a la página siguiente
     */
    static async irAPaginaSiguiente() {
        if (this.paginaActual < this.totalPaginas) {
            await this.cargarPlanesPaginados(this.paginaActual + 1);
        }
    }

    /**
     * Muestra los planes en la tabla
     */
    static mostrarPlanesEnTabla() {
        const tabla = document.getElementById('tablaPlanesEstudios');
        const tbody = document.getElementById('tbodyTablaPlanesEstudios');
        
        if (!tbody || !tabla) return;

        const puedeEliminar = u_planEstudio.verificarPermiso('eliminar');

        // Limpiar el tbody completamente
        tbody.innerHTML = '';
        
        // Agregar filas una por una
        if (this.planesEstudio && this.planesEstudio.length > 0) {
            this.planesEstudio.forEach(plan => {
                const fila = document.createElement('tr');
                fila.className = 'fila-clickeable';
                fila.setAttribute('data-id', plan.idPlanEstudio);
                
                // Nombre
                const celdaNombre = document.createElement('td');
                celdaNombre.className = 'align-middle';
                celdaNombre.textContent = plan.nombre || '';
                fila.appendChild(celdaNombre);
                
                // Fecha
                const celdaFecha = document.createElement('td');
                celdaFecha.className = 'align-middle';
                celdaFecha.textContent = plan.fechaElaboracion || '';
                fila.appendChild(celdaFecha);
                
                // Período
                const celdaPeriodo = document.createElement('td');
                celdaPeriodo.className = 'align-middle';
                celdaPeriodo.textContent = plan.periodoPlanEstudio || '';
                fila.appendChild(celdaPeriodo);
                
                // Carrera
                const celdaCarrera = document.createElement('td');
                celdaCarrera.className = 'align-middle';
                celdaCarrera.textContent = plan.nombreCarrera;
                fila.appendChild(celdaCarrera);
                
                // Vigente
                const celdaVigente = document.createElement('td');
                celdaVigente.className = 'align-middle';
                const badge = document.createElement('span');
                badge.className = `badge ${plan.vigente === 'Sí' ? 'bg-success' : 'bg-danger'}`;
                badge.textContent = plan.vigente || 'No';
                celdaVigente.appendChild(badge);
                fila.appendChild(celdaVigente);
                
                // Acciones (solo visualizar y eliminar)
                const celdaAcciones = document.createElement('td');
                celdaAcciones.className = 'align-middle';
                const divBotones = document.createElement('div');
                divBotones.className = 'd-flex justify-content-center gap-1';
                
                // Botón Visualizar
                const btnVisualizar = document.createElement('button');
                btnVisualizar.className = 'btn btn-sm btn-outline-info visualizar-plan';
                btnVisualizar.setAttribute('data-id', plan.idPlanEstudio);
                btnVisualizar.title = 'Visualizar';
                btnVisualizar.innerHTML = '<i class="fas fa-eye"></i>';
                btnVisualizar.addEventListener('click', (e) => {
                    e.stopPropagation();
                    window.location.href = `/guniversidadfrontend/secretarioAcademico/template/html/formularioPlanEstudio.html?modo=visualizar&id=${plan.idPlanEstudio}`;
                });
                divBotones.appendChild(btnVisualizar);
                
                // Botón Eliminar
                if (puedeEliminar) {
                    const btnEliminar = document.createElement('button');
                    btnEliminar.className = 'btn btn-sm btn-outline-danger eliminar-plan';
                    btnEliminar.setAttribute('data-id', plan.idPlanEstudio);
                    btnEliminar.title = 'Eliminar';
                    btnEliminar.innerHTML = '<i class="fas fa-trash"></i>';
                    btnEliminar.addEventListener('click', (e) => {
                        e.stopPropagation();
                        this.eliminarPlan(plan.idPlanEstudio);
                    });
                    divBotones.appendChild(btnEliminar);
                }
                
                celdaAcciones.appendChild(divBotones);
                fila.appendChild(celdaAcciones);
                
                // Evento de clic en la fila (visualizar)
                fila.addEventListener('click', (e) => {
                    if (e.target.closest('button')) return;
                    window.location.href = `/guniversidadfrontend/secretarioAcademico/template/html/formularioPlanEstudio.html?modo=visualizar&id=${plan.idPlanEstudio}`;
                });
                
                tbody.appendChild(fila);
            });
        } else {
            const filaVacia = document.createElement('tr');
            const celdaVacia = document.createElement('td');
            celdaVacia.colSpan = 6;
            celdaVacia.className = 'text-center';
            celdaVacia.textContent = 'No hay planes de estudio';
            filaVacia.appendChild(celdaVacia);
            tbody.appendChild(filaVacia);
        }

        // Destruir DataTable existente de manera segura
        if ($.fn.DataTable.isDataTable('#tablaPlanesEstudios')) {
            const table = $('#tablaPlanesEstudios').DataTable();
            table.destroy();
            $('#tablaPlanesEstudios').removeClass('dataTable');
        }

        // Esperar a que el DOM se actualice antes de reinicializar
        setTimeout(() => {
            try {
                $('#tablaPlanesEstudios').DataTable({
                    language: {
                        url: '/guniversidadfrontend/public/nomodules/dataTable/dataTable_es-ES.json'
                    },
                    paging: false,
                    searching: true,
                    ordering: true,
                    info: false,
                    destroy: true,
                    retrieve: true,
                    drawCallback: function() {
                        $(this).removeClass('dataTable');
                    }
                });
            } catch (error) {
                console.error('Error inicializando DataTable:', error);
            }
        }, 50);
    }

    /**
     * Elimina un plan de estudio
     * @param {string} id - ID del plan
     */
    static async eliminarPlan(id) {
        const confirmacion = await Alerta.pregunta('¿Eliminar plan de estudio?','Esta acción no se puede deshacer');

        if (!confirmacion) return;

        try {
            const eliminado = await m_planEstudio.eliminarPlanEstudio(id);

            if (eliminado === false) return;

            Alerta.notificarExito('Plan de estudio eliminado correctamente');
            
            await this.cargarTotalPaginas();
            
            if (this.paginaActual > this.totalPaginas) {
                this.paginaActual = this.totalPaginas;
            }
            
            await this.cargarPlanesPaginados(this.paginaActual);
        } catch (error) {
            console.error('Error eliminando plan:', error);
            Alerta.error('Error', 'No se pudo eliminar el plan de estudio');
        }
    }
}

// ========== INICIALIZAR ==========
$(document).ready(async function() {
    sesiones.verificarExistenciaSesion();
    await u_utiles.cargarArchivosImportadosHTML('modalCerrarSesion', '.importandoModalCierreSesion');
    await u_utiles.cargarArchivosImportadosHTML('topBar', '.importandoTopBar');
    u_utiles.botonesNavegacionSecretario();
    
    await c_planEstudio.iniciar();
});