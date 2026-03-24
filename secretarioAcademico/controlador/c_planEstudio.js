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
        //this.inicializarPaginacion();
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
            console.log(response)

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
        const tbody = document.getElementById('tbodyTablaPlanesEstudios');
        if (!tbody) return;

        // Destruir DataTable si existe
        if ($.fn.dataTable.isDataTable('#tablaPlanesEstudios')) {
            $('#tablaPlanesEstudios').DataTable().destroy();
        }

        const puedeEditar = u_planEstudio.verificarPermiso('actualizar');
        const puedeEliminar = u_planEstudio.verificarPermiso('eliminar');

        tbody.innerHTML = this.planesEstudio.map(plan => {
            const carrera = this.carreras.find(c => c.idCarrera == plan.idCarrera);
            const nombreCarrera = carrera ? carrera.nombreCarrera : 'N/A';

            return `
                <tr class="fila-clickeable" data-id="${plan.idPlanEstudio}">
                    <td class="align-middle">${plan.nombre}</td>
                    <td class="align-middle">${plan.fechaElaboracion}</td>
                    <td class="align-middle">${plan.periodoPlanEstudio}</td>
                    <td class="align-middle">${nombreCarrera}</td>
                    <td class="align-middle">
                        <span class="badge ${plan.vigente === 'Sí' ? 'bg-success' : 'bg-danger'}">
                            ${plan.vigente}
                        </span>
                    </td>
                    <td class="align-middle">
                        <div class="d-flex justify-content-center gap-1">
                            ${puedeEditar ? 
                                `<button class="btn btn-sm btn-outline-info editar-plan" data-id="${plan.idPlanEstudio}" title="Editar">
                                    <i class="fas fa-edit"></i>
                                </button>` : ''}
                            ${puedeEliminar ? 
                                `<button class="btn btn-sm btn-outline-danger eliminar-plan" data-id="${plan.idPlanEstudio}" title="Eliminar">
                                    <i class="fas fa-trash"></i>
                                </button>` : ''}
                        </div>
                    </td>
                </tr>
            `;
        }).join('') || '<tr><td colspan="6" class="text-center">No hay planes de estudio</td></tr>';

        // Inicializar DataTable (solo para búsqueda y ordenamiento)
        $('#tablaPlanesEstudios').DataTable({
            language: {
                url: '/guniversidadfrontend/public/nomodules/dataTable/dataTable_es-ES.json'
            },
            paging: false,
            searching: true,
            ordering: true,
            info: false
        });

        this.agregarEventosTabla();
    }

    /**
     * Agrega eventos a la tabla
     */
    static agregarEventosTabla() {
        // Evento para filas clickeables (visualización)
        document.querySelectorAll('.fila-clickeable').forEach(fila => {
            fila.addEventListener('click', (e) => {
                // Evitar si se hizo clic en un botón
                if (e.target.closest('button')) return;
                
                const id = fila.dataset.id;
                window.location.href = `/guniversidadfrontend/secretarioAcademico/template/html/formularioPlanEstudio.html?modo=visualizar&id=${id}`;
            });
        });

        // Eventos para botones de editar
        document.querySelectorAll('.editar-plan').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const id = btn.dataset.id;
                window.location.href = `/guniversidadfrontend/secretarioAcademico/template/html/formularioPlanEstudio.html?modo=editar&id=${id}`;
            });
        });

        // Eventos para botones de eliminar
        document.querySelectorAll('.eliminar-plan').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.eliminarPlan(btn.dataset.id);
            });
        });
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