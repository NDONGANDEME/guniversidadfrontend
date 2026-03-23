import { sesiones } from "../../public/core/sesiones.js";
import { Alerta } from "../../public/utilidades/u_alertas.js";
import { u_utiles } from "../../public/utilidades/u_utiles.js";
import { u_estudiante } from "../utilidades/u_estudiante.js";
import { m_estudiante } from "../modelo/m_estudiante.js";
import { m_sesion } from "../../public/modelo/m_sesion.js";
import { m_matricula } from "../modelo/m_matricula.js";

/**
 * Controlador para la gestión de estudiantes
 * Maneja listado, paginación, búsqueda y permisos
 */
export class c_estudiante {
    
    /**
     * VARIABLES DE ESTADO
     */
    static estudiantes = [];
    static matriculas = [];
    static facultadActual = null;
    static paginaActual = 1;
    static totalPaginas = 1;
    static filtroBusqueda = '';
    static vistaActual = 'tarjetas'; // 'tarjetas' o 'lista'
    static permisos = {
        insertarEstudiante: false,
        actualizarEstudiante: false,
        eliminarEstudiante: false,
        insertarMatricula: false,
        actualizarMatricula: false,
        eliminarMatricula: false
    };
    static usuarioActual = null;

    /**
     * INICIALIZACIÓN
     */
    static async iniciar() {
        try {
            // Verificar sesión
            sesiones.verificarExistenciaSesion();
            
            // Cargar archivos importados
            await u_utiles.cargarArchivosImportadosHTML('modalCerrarSesion', '.importandoModalCierreSesion');
            await u_utiles.cargarArchivosImportadosHTML('topBar', '.importandoTopBar');
            
            // Configurar navegación
            u_utiles.botonesNavegacionSecretario();
            
            // Obtener usuario actual y permisos desde sessionStorage
            this.cargarUsuarioYPermisos();
            
            // Obtener facultad del usuario logueado
            this.cargarFacultadActual();
            
            // Configurar eventos
            this.configurarEventos();
            this.configurarVista();
            this.configurarBusqueda();
            this.configurarPaginacion();
            
            // Cargar estudiantes iniciales
            await this.cargarEstudiantes();
            
        } catch (error) {
            console.error('Error al inicializar c_estudiante:', error);
            Alerta.error('Error', 'No se pudo inicializar el módulo de estudiantes');
        }
    }

    /**
     * CARGA DE USUARIO Y PERMISOS DESDE SESSIONSTORAGE
     */
    static cargarUsuarioYPermisos() {
        try {
            this.usuarioActual = m_sesion.leerSesion('usuarioActivo');
            
            if (this.usuarioActual && this.usuarioActual.permisos) {
                // Resetear permisos
                this.permisos = {
                    insertarEstudiante: false,
                    actualizarEstudiante: false,
                    eliminarEstudiante: false,
                    insertarMatricula: false,
                    actualizarMatricula: false,
                    eliminarMatricula: false
                };
                
                // Recorrer el array de permisos y asignar según nombrePermiso
                this.usuarioActual.permisos.forEach(permiso => {
                    switch (permiso.nombrePermiso) {
                        case 'insertarEstudiante':
                            this.permisos.insertarEstudiante = true;
                            break;
                        case 'actualizarEstudiante':
                            this.permisos.actualizarEstudiante = true;
                            break;
                        case 'eliminarEstudiante':
                            this.permisos.eliminarEstudiante = true;
                            break;
                        case 'insertarMatricula':
                            this.permisos.insertarMatricula = true;
                            break;
                        case 'actualizarMatricula':
                            this.permisos.actualizarMatricula = true;
                            break;
                        case 'eliminarMatricula':
                            this.permisos.eliminarMatricula = true;
                            break;
                    }
                });
            }
            
            console.log('Permisos cargados:', this.permisos);
            
        } catch (error) {
            console.error('Error cargando permisos:', error);
        }
    }

    /**
     * CARGA DE FACULTAD ACTUAL
     */
    static cargarFacultadActual() {
        try {
            if (this.usuarioActual) {
                // El ID de facultad puede venir en diferentes campos
                this.facultadActual = this.usuarioActual.idFacultad || 
                                      this.usuarioActual.facultad || 
                                      (this.usuarioActual.administrativo ? this.usuarioActual.administrativo.idFacultad : null) ||
                                      1;
            } else {
                this.facultadActual = 1;
            }
        } catch (error) {
            console.error('Error cargando facultad actual:', error);
            this.facultadActual = 1;
        }
    }

    /**
     * CARGA DE ESTUDIANTES CON PAGINACIÓN
     */
    static async cargarEstudiantes() {
        try {
            // Mostrar indicador de carga
            const contenedor = document.getElementById('contenedorEstudiantes');
            if (contenedor) {
                contenedor.innerHTML = `
                    <div class="col-12 text-center py-5">
                        <div class="spinner-border text-warning" role="status">
                            <span class="visually-hidden">Cargando...</span>
                        </div>
                        <p class="mt-2 text-muted">Cargando estudiantes...</p>
                    </div>
                `;
            }

            // Llamar al backend con paginación y facultad
            const respuesta = await m_estudiante.obtenerEstudiantesAPaginarPorFacultad(
                this.facultadActual, 
                this.paginaActual
            );

            if (respuesta) {
                this.estudiantes = respuesta.estudiantes || [];
                this.totalPaginas = respuesta.total_paginas || 1;
                this.paginaActual = respuesta.pagina_actual || this.paginaActual;
                
                // Cargar matrículas para estadísticas
                this.matriculas = await m_matricula.obtenerMatriculas() || [];
                
                // Aplicar filtro de búsqueda si existe
                if (this.filtroBusqueda) {
                    this.estudiantes = this.estudiantes.filter(e => 
                        (e.nombre && e.nombre.toLowerCase().includes(this.filtroBusqueda.toLowerCase())) ||
                        (e.apellidos && e.apellidos.toLowerCase().includes(this.filtroBusqueda.toLowerCase())) ||
                        (e.codigoEstudiante && e.codigoEstudiante.toLowerCase().includes(this.filtroBusqueda.toLowerCase()))
                    );
                }
            } else {
                this.estudiantes = [];
                this.totalPaginas = 1;
            }

            // Actualizar vista
            this.actualizarVista();
            this.actualizarPaginacion();
            this.actualizarIndicadorPagina();

        } catch (error) {
            console.error('Error al cargar estudiantes:', error);
            Alerta.error('Error', 'No se pudieron cargar los estudiantes');
            this.estudiantes = [];
            this.actualizarVista();
        }
    }

    /**
     * OBTENER NÚMERO DE MATRÍCULAS DE UN ESTUDIANTE
     */
    static obtenerNumeroMatriculas(idEstudiante) {
        if (!this.matriculas) return 0;
        return this.matriculas.filter(m => m.idEstudiante == idEstudiante).length;
    }

    /**
     * ACTUALIZAR VISTA SEGÚN VISTA ACTUAL
     */
    static actualizarVista() {
        if (this.vistaActual === 'tarjetas') {
            this.renderizarTarjetas();
        } else {
            this.renderizarLista();
        }
    }

    /**
     * RENDERIZAR TARJETAS DE ESTUDIANTES
     */
    static renderizarTarjetas() {
        const contenedor = document.getElementById('contenedorEstudiantes');
        if (!contenedor) return;

        if (!this.estudiantes || this.estudiantes.length === 0) {
            contenedor.innerHTML = `
                <div class="col-12 text-center py-5">
                    <i class="fas fa-user-graduate fa-4x text-muted mb-3"></i>
                    <h3 class="text-muted">No hay estudiantes disponibles</h3>
                    <p class="text-muted">No se encontraron estudiantes para esta facultad</p>
                </div>
            `;
            return;
        }

        // Enriquecer estudiantes con información de matrículas
        const estudiantesEnriquecidos = this.estudiantes.map(e => ({
            ...e,
            numeroMatriculas: this.obtenerNumeroMatriculas(e.idEstudiante)
        }));

        contenedor.innerHTML = estudiantesEnriquecidos.map(estudiante => 
            this.crearTarjetaEstudianteConMatricula(estudiante)
        ).join('');
        
        // Agregar eventos a los botones de las tarjetas
        this.agregarEventosBotonesTarjetas();
    }

    /**
     * CREAR TARJETA DE ESTUDIANTE CON INFORMACIÓN DE MATRÍCULA
     */
    static crearTarjetaEstudianteConMatricula(estudiante) {
        // Obtener foto o icono por defecto
        let fotoHtml = '<i class="fas fa-user-graduate fa-3x text-muted"></i>';
        
        if (estudiante.foto) {
            const fotoUrl = estudiante.foto.url_completa || estudiante.foto;
            if (fotoUrl && typeof fotoUrl === 'string' && fotoUrl.length > 0) {
                fotoHtml = `<img src="${this.escapeHTML(fotoUrl)}" alt="${this.escapeHTML(estudiante.nombre)}" class="rounded-circle" style="width: 60px; height: 60px; object-fit: cover;" onerror="this.onerror=null;this.src='';this.style.display='none';this.nextSibling.style.display='flex';">`;
                fotoHtml += `<div style="display: none;" class="d-flex justify-content-center align-items-center bg-light rounded-circle" style="width: 60px; height: 60px;"><i class="fas fa-user-graduate fa-3x text-muted"></i></div>`;
            } else {
                fotoHtml = '<div class="d-flex justify-content-center align-items-center bg-light rounded-circle" style="width: 60px; height: 60px;"><i class="fas fa-user-graduate fa-3x text-muted"></i></div>';
            }
        }

        // Estado del estudiante
        const estadoActivo = estudiante.estado === 'activo' || estudiante.estado === 1;
        const estadoBadge = estadoActivo 
            ? '<span class="badge bg-success">Activo</span>' 
            : '<span class="badge bg-secondary">Inactivo</span>';

        // Nombre completo
        const nombreCompleto = `${estudiante.nombre || ''} ${estudiante.apellidos || ''}`.trim();

        // Generar botones según permisos
        let botonesHtml = '';
        
        // Botón visualizar (siempre visible)
        botonesHtml += `
            <button class="btn btn-sm btn-outline-info visualizar-estudiante" title="Visualizar" data-id="${estudiante.idEstudiante}">
                <i class="fas fa-eye"></i>
            </button>
        `;
        
        // Botón editar (solo si tiene permiso)
        if (this.permisos.actualizarEstudiante) {
            botonesHtml += `
                <button class="btn btn-sm btn-outline-warning editar-estudiante" title="Editar" data-id="${estudiante.idEstudiante}">
                    <i class="fas fa-edit"></i>
                </button>
            `;
        }
        
        // Botón eliminar (solo si tiene permiso)
        if (this.permisos.eliminarEstudiante) {
            botonesHtml += `
                <button class="btn btn-sm btn-outline-danger eliminar-estudiante" title="Eliminar" data-id="${estudiante.idEstudiante}">
                    <i class="fas fa-trash"></i>
                </button>
            `;
        }

        // Información de matrículas
        const matriculasInfo = estudiante.numeroMatriculas > 0 
            ? `<p class="card-text text-muted small">
                <strong>Matrículas:</strong> ${estudiante.numeroMatriculas}
               </p>`
            : `<p class="card-text text-muted small">
                <strong>Sin matrículas registradas</strong>
               </p>`;

        return `
            <div class="col-md-4 col-lg-3 mb-4">
                <div class="card h-100 shadow-sm estudiante-card">
                    <div class="card-body text-center">
                        <div class="mb-3 d-flex justify-content-center">
                            ${fotoHtml}
                        </div>
                        <h5 class="card-title">${this.escapeHTML(nombreCompleto || 'Sin nombre')}</h5>
                        <p class="card-text text-muted small">
                            <strong>Código:</strong> ${this.escapeHTML(estudiante.codigoEstudiante || 'N/A')}<br>
                            <strong>DIP:</strong> ${this.escapeHTML(estudiante.dipEstudiante || 'N/A')}
                        </p>
                        ${matriculasInfo}
                        <div class="d-flex justify-content-center gap-2 mb-2">
                            ${estadoBadge}
                        </div>
                        <div class="d-flex justify-content-center gap-2 mt-3">
                            ${botonesHtml}
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * RENDERIZAR LISTA DE ESTUDIANTES
     */
    static renderizarLista() {
        const contenedor = document.getElementById('contenedorEstudiantes');
        if (!contenedor) return;

        if (!this.estudiantes || this.estudiantes.length === 0) {
            contenedor.innerHTML = `
                <div class="col-12 text-center py-5">
                    <i class="fas fa-user-graduate fa-4x text-muted mb-3"></i>
                    <h3 class="text-muted">No hay estudiantes disponibles</h3>
                    <p class="text-muted">No se encontraron estudiantes para esta facultad</p>
                </div>
            `;
            return;
        }

        // Enriquecer estudiantes con información de matrículas
        const estudiantesEnriquecidos = this.estudiantes.map(e => ({
            ...e,
            numeroMatriculas: this.obtenerNumeroMatriculas(e.idEstudiante)
        }));

        contenedor.innerHTML = `
            <div class="table-responsive">
                <table class="table table-striped table-hover">
                    <thead class="table-warning">
                        <tr>
                            <th>Código</th>
                            <th>Nombre completo</th>
                            <th>DIP</th>
                            <th>Correo</th>
                            <th>Teléfono</th>
                            <th>Matrículas</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${estudiantesEnriquecidos.map(estudiante => 
                            this.crearFilaListaConMatricula(estudiante)
                        ).join('')}
                    </tbody>
                </table>
            </div>
        `;
        
        // Agregar eventos a los botones de la tabla
        this.agregarEventosBotonesLista();
    }

    /**
     * CREAR FILA DE LISTA CON INFORMACIÓN DE MATRÍCULA
     */
    static crearFilaListaConMatricula(estudiante) {
        const nombreCompleto = `${estudiante.nombre || ''} ${estudiante.apellidos || ''}`.trim();
        const estadoActivo = estudiante.estado === 'activo' || estudiante.estado === 1;
        const estadoBadge = estadoActivo 
            ? '<span class="badge bg-success">Activo</span>' 
            : '<span class="badge bg-secondary">Inactivo</span>';

        // Generar botones según permisos
        let botonesHtml = '';
        
        botonesHtml += `
            <button class="btn btn-sm btn-outline-info visualizar-estudiante me-1" title="Visualizar" data-id="${estudiante.idEstudiante}">
                <i class="fas fa-eye"></i>
            </button>
        `;
        
        if (this.permisos.actualizarEstudiante) {
            botonesHtml += `
                <button class="btn btn-sm btn-outline-warning editar-estudiante me-1" title="Editar" data-id="${estudiante.idEstudiante}">
                    <i class="fas fa-edit"></i>
                </button>
            `;
        }
        
        if (this.permisos.eliminarEstudiante) {
            botonesHtml += `
                <button class="btn btn-sm btn-outline-danger eliminar-estudiante" title="Eliminar" data-id="${estudiante.idEstudiante}">
                    <i class="fas fa-trash"></i>
                </button>
            `;
        }

        // Botón para ver matrículas (si tiene permiso de visualización)
        if (this.permisos.actualizarMatricula || this.permisos.insertarMatricula) {
            botonesHtml += `
                <button class="btn btn-sm btn-outline-success ver-matriculas me-1" title="Ver Matrículas" data-id="${estudiante.idEstudiante}">
                    <i class="fas fa-list-alt"></i>
                </button>
            `;
        }

        return `
            <tr>
                <td>${this.escapeHTML(estudiante.codigoEstudiante || 'N/A')}</td>
                <td>${this.escapeHTML(nombreCompleto)}</td>
                <td>${this.escapeHTML(estudiante.dipEstudiante || 'N/A')}</td>
                <td>${this.escapeHTML(estudiante.correoEstudiante || '-')}</td>
                <td>${this.escapeHTML(estudiante.telefono || '-')}</td>
                <td>
                    <span class="badge bg-info">${estudiante.numeroMatriculas}</span>
                </td>
                <td>${botonesHtml}</td>
            </tr>
        `;
    }

    /**
     * ESCAPAR HTML PARA PREVENIR XSS
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

    /**
     * AGREGAR EVENTOS A BOTONES DE TARJETAS
     */
    static agregarEventosBotonesTarjetas() {
        // Botones visualizar
        document.querySelectorAll('.visualizar-estudiante').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const id = btn.dataset.id;
                if (id) this.visualizarEstudiante(id);
            });
        });

        // Botones editar
        document.querySelectorAll('.editar-estudiante').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const id = btn.dataset.id;
                if (id) this.editarEstudiante(id);
            });
        });

        // Botones eliminar
        document.querySelectorAll('.eliminar-estudiante').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                e.stopPropagation();
                const id = btn.dataset.id;
                if (id) await this.eliminarEstudiante(id);
            });
        });

        // Botones ver matrículas
        document.querySelectorAll('.ver-matriculas').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const id = btn.dataset.id;
                if (id) this.verMatriculasEstudiante(id);
            });
        });
    }

    /**
     * AGREGAR EVENTOS A BOTONES DE LISTA
     */
    static agregarEventosBotonesLista() {
        this.agregarEventosBotonesTarjetas();
    }

    /**
     * VER MATRÍCULAS DEL ESTUDIANTE
     */
    static async verMatriculasEstudiante(id) {
        try {
            const todasMatriculas = await m_matricula.obtenerMatriculas() || [];
            const matriculasEstudiante = todasMatriculas.filter(m => m.idEstudiante == id);
            
            if (matriculasEstudiante.length === 0) {
                Alerta.notificarInformacion('No hay matrículas registradas para este estudiante', 2000);
                return;
            }
            
            // Mostrar modal con las matrículas
            let contenido = '<div class="list-group">';
            matriculasEstudiante.forEach(mat => {
                contenido += `
                    <div class="list-group-item">
                        <div class="d-flex w-100 justify-content-between">
                            <h6 class="mb-1">Curso: ${this.escapeHTML(mat.cursoAcademico)}</h6>
                            <small>${u_estudiante.formatearFecha(mat.fechaMatricula)}</small>
                        </div>
                        <p class="mb-1">Modalidad: ${this.escapeHTML(mat.modalidadMatricula)}</p>
                        <small>Estado: ${mat.estado === 'Completo' ? 'Completada' : 'Incompleta'}</small>
                    </div>
                `;
            });
            contenido += '</div>';
            
            // Mostrar modal (asumiendo que existe un modal global)
            Alerta.mostrarModal('Matrículas del Estudiante', contenido);
            
        } catch (error) {
            console.error('Error cargando matrículas:', error);
            Alerta.error('Error', 'No se pudieron cargar las matrículas');
        }
    }

    /**
     * CONFIGURAR EVENTOS PRINCIPALES
     */
    static configurarEventos() {
        // Botón nuevo estudiante (ocultar si no tiene permiso de inserción)
        const btnNuevo = document.getElementById('btnNuevoEstudiante');
        if (btnNuevo) {
            if (!this.permisos.insertarEstudiante) {
                btnNuevo.style.display = 'none';
            } else {
                btnNuevo.addEventListener('click', () => {
                    window.location.href = '/guniversidadfrontend/secretarioAcademico/template/html/formularioEstudiante.html?modo=creacion';
                });
            }
        }

        // Botón volver al panel principal
        const btnVolver = document.getElementById('btnVolverPanelPrincipal');
        if (btnVolver) {
            btnVolver.addEventListener('click', () => {
                window.location.href = '/guniversidadfrontend/secretarioAcademico/index.html';
            });
        }
    }

    /**
     * CONFIGURAR CAMBIO DE VISTA
     */
    static configurarVista() {
        const btnTarjetas = document.getElementById('vistaTarjetas');
        const btnLista = document.getElementById('vistaLista');

        if (btnTarjetas) {
            btnTarjetas.addEventListener('click', () => {
                this.vistaActual = 'tarjetas';
                btnTarjetas.classList.add('active');
                btnLista.classList.remove('active');
                this.actualizarVista();
            });
        }

        if (btnLista) {
            btnLista.addEventListener('click', () => {
                this.vistaActual = 'lista';
                btnLista.classList.add('active');
                btnTarjetas.classList.remove('active');
                this.actualizarVista();
            });
        }
    }

    /**
     * CONFIGURAR BÚSQUEDA
     */
    static configurarBusqueda() {
        const buscador = document.getElementById('buscadorEstudiante');
        if (buscador) {
            const debouncedSearch = u_utiles.debounce(async (e) => {
                this.filtroBusqueda = e.target.value.trim();
                this.paginaActual = 1;
                await this.cargarEstudiantes();
            }, 500);
            
            buscador.addEventListener('input', debouncedSearch);
        }
    }

    /**
     * CONFIGURAR PAGINACIÓN
     */
    static configurarPaginacion() {
        const btnAnterior = document.getElementById('btnAnteriorEstudiantes');
        const btnSiguiente = document.getElementById('btnSiguienteEstudiantes');

        if (btnAnterior) {
            btnAnterior.addEventListener('click', async () => {
                if (this.paginaActual > 1) {
                    this.paginaActual--;
                    await this.cargarEstudiantes();
                }
            });
        }

        if (btnSiguiente) {
            btnSiguiente.addEventListener('click', async () => {
                if (this.paginaActual < this.totalPaginas) {
                    this.paginaActual++;
                    await this.cargarEstudiantes();
                }
            });
        }
    }

    /**
     * ACTUALIZAR ESTADO DE BOTONES DE PAGINACIÓN
     */
    static actualizarPaginacion() {
        const btnAnterior = document.getElementById('btnAnteriorEstudiantes');
        const btnSiguiente = document.getElementById('btnSiguienteEstudiantes');

        if (btnAnterior) {
            btnAnterior.disabled = this.paginaActual <= 1;
        }

        if (btnSiguiente) {
            btnSiguiente.disabled = this.paginaActual >= this.totalPaginas;
        }
    }

    /**
     * ACTUALIZAR INDICADOR DE PÁGINA
     */
    static actualizarIndicadorPagina() {
        const indicador = document.getElementById('paginaActualEstudiantes');
        if (indicador) {
            indicador.textContent = `Página ${this.paginaActual} de ${this.totalPaginas}`;
        }
    }

    /**
     * EDITAR ESTUDIANTE
     */
    static editarEstudiante(id) {
        if (!this.permisos.actualizarEstudiante) {
            Alerta.notificarAdvertencia('No tiene permiso para editar estudiantes', 2000);
            return;
        }
        window.location.href = `/guniversidadfrontend/secretarioAcademico/template/html/formularioEstudiante.html?id=${id}&modo=edicion`;
    }

    /**
     * VISUALIZAR ESTUDIANTE
     */
    static visualizarEstudiante(id) {
        window.location.href = `/guniversidadfrontend/secretarioAcademico/template/html/formularioEstudiante.html?id=${id}&modo=visualizacion`;
    }

    /**
     * ELIMINAR ESTUDIANTE
     */
    static async eliminarEstudiante(id) {
        if (!this.permisos.eliminarEstudiante) {
            Alerta.notificarAdvertencia('No tiene permiso para eliminar estudiantes', 2000);
            return;
        }

        // Verificar si el estudiante tiene matrículas
        const matriculasEstudiante = this.matriculas.filter(m => m.idEstudiante == id);
        if (matriculasEstudiante.length > 0) {
            const confirmacion = await Alerta.pregunta(
                'Eliminar estudiante',
                `El estudiante tiene ${matriculasEstudiante.length} matrícula(s) asociada(s). ¿Está seguro de eliminarlo? Esta acción no se puede deshacer.`
            );
            if (!confirmacion) return;
        } else {
            const confirmacion = await Alerta.pregunta(
                'Eliminar estudiante',
                '¿Está seguro de eliminar este estudiante? Esta acción no se puede deshacer.'
            );
            if (!confirmacion) return;
        }

        try {
            const resultado = await m_estudiante.eliminarEstudiante(id);
            
            if (resultado && resultado.exito) {
                Alerta.notificarExito('Estudiante eliminado correctamente', 1500);
                await this.cargarEstudiantes();
            } else {
                Alerta.error('Error', resultado?.mensaje || 'No se pudo eliminar el estudiante');
            }
        } catch (error) {
            console.error('Error al eliminar estudiante:', error);
            Alerta.error('Error', 'No se pudo eliminar el estudiante');
        }
    }
}

// ========== INICIALIZAR ==========
$(document).ready(async function() {
    await c_estudiante.iniciar();
});