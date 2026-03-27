import { sesiones } from "../../public/core/sesiones.js";
import { Alerta } from "../../public/utilidades/u_alertas.js";
import { u_utiles } from "../../public/utilidades/u_utiles.js";
import { u_estudiante } from "../utilidades/u_estudiante.js";
import { m_estudiante } from "../modelo/m_estudiante.js";
import { m_matricula } from "../modelo/m_matricula.js";
import { m_sesion } from "../../public/modelo/m_sesion.js";

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
    static vistaActual = 'tarjetas';
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
            sesiones.verificarExistenciaSesion();
            
            await u_utiles.cargarArchivosImportadosHTML('modalCerrarSesion', '.importandoModalCierreSesion');
            await u_utiles.cargarArchivosImportadosHTML('topBar', '.importandoTopBar');
            
            u_utiles.botonesNavegacionSecretario();
            
            this.cargarUsuarioYPermisos();
            this.cargarFacultadActual();
            
            this.configurarEventos();
            this.configurarVista();
            this.configurarBusqueda();
            this.configurarPaginacion();
            
            await this.cargarEstudiantes();
            
        } catch (error) {
            console.error('Error al inicializar c_estudiante:', error);
            Alerta.error('Error', 'No se pudo inicializar el módulo de estudiantes');
        }
    }

    /**
     * CARGA DE USUARIO Y PERMISOS
     */
    static cargarUsuarioYPermisos() {
        try {
            this.usuarioActual = m_sesion.leerSesion('usuarioActivo');
            
            if (this.usuarioActual && this.usuarioActual.permisos) {
                this.permisos = {
                    insertarEstudiante: false,
                    actualizarEstudiante: false,
                    eliminarEstudiante: false,
                    insertarMatricula: false,
                    actualizarMatricula: false,
                    eliminarMatricula: false
                };
                
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

            const respuesta = await m_estudiante.obtenerEstudiantesAPaginarPorFacultad(
                this.facultadActual, 
                this.paginaActual
            );

            if (respuesta) {
                this.estudiantes = respuesta.estudiantes || [];
                this.totalPaginas = respuesta.total_paginas || 1;
                this.paginaActual = respuesta.pagina_actual || this.paginaActual;
                
                this.matriculas = await m_matricula.obtenerMatriculas() || [];
                
                if (this.filtroBusqueda) {
                    const busquedaLower = this.filtroBusqueda.toLowerCase();
                    this.estudiantes = this.estudiantes.filter(e => 
                        (e.nombre && e.nombre.toLowerCase().includes(busquedaLower)) ||
                        (e.apellidos && e.apellidos.toLowerCase().includes(busquedaLower)) ||
                        (e.codigoEstudiante && e.codigoEstudiante.toLowerCase().includes(busquedaLower)) ||
                        (e.dipEstudiante && e.dipEstudiante.toLowerCase().includes(busquedaLower))
                    );
                }
            } else {
                this.estudiantes = [];
                this.totalPaginas = 1;
            }

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
     * OBTENER NÚMERO DE MATRÍCULAS
     */
    static obtenerNumeroMatriculas(idEstudiante) {
        if (!this.matriculas) return 0;
        return this.matriculas.filter(m => m.idEstudiante == idEstudiante).length;
    }

    /**
     * OBTENER MATRÍCULA MÁS RECIENTE
     */
    static obtenerMatriculaReciente(idEstudiante) {
        if (!this.matriculas) return null;
        const matriculasEstudiante = this.matriculas.filter(m => m.idEstudiante == idEstudiante);
        if (matriculasEstudiante.length === 0) return null;
        return matriculasEstudiante.sort((a, b) => 
            new Date(b.fechaMatricula) - new Date(a.fechaMatricula)
        )[0];
    }

    /**
     * ACTUALIZAR VISTA
     */
    static actualizarVista() {
        if (this.vistaActual === 'tarjetas') {
            this.renderizarTarjetas();
        } else {
            this.renderizarLista();
        }
    }

    /**
     * RENDERIZAR TARJETAS
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

        contenedor.innerHTML = this.estudiantes.map(estudiante => 
            this.crearTarjetaEstudianteHTML(estudiante)
        ).join('');
        
        this.agregarEventosBotones();
    }

    /**
     * CREAR TARJETA DE ESTUDIANTE
     */
    static crearTarjetaEstudianteHTML(estudiante) {
        let fotoHtml = '<i class="fas fa-user-graduate fa-3x text-muted"></i>';
        
        if (estudiante.foto) {
            const fotoUrl = estudiante.foto.url_completa || estudiante.foto;
            if (fotoUrl && typeof fotoUrl === 'string' && fotoUrl.length > 0) {
                fotoHtml = `<img src="${u_estudiante.escapeHTML(fotoUrl)}" alt="${u_estudiante.escapeHTML(estudiante.nombre)}" class="rounded-circle" style="width: 60px; height: 60px; object-fit: cover;" onerror="this.onerror=null;this.src='';this.style.display='none';this.nextSibling.style.display='flex';">`;
                fotoHtml += `<div style="display: none;" class="d-flex justify-content-center align-items-center bg-light rounded-circle" style="width: 60px; height: 60px;"><i class="fas fa-user-graduate fa-3x text-muted"></i></div>`;
            } else {
                fotoHtml = '<div class="d-flex justify-content-center align-items-center bg-light rounded-circle" style="width: 60px; height: 60px;"><i class="fas fa-user-graduate fa-3x text-muted"></i></div>';
            }
        }

        const estadoActivo = estudiante.estado === 'activo' || estudiante.estado === 1;
        const estadoBadge = estadoActivo 
            ? '<span class="badge bg-success">Activo</span>' 
            : '<span class="badge bg-secondary">Inactivo</span>';

        const nombreCompleto = `${estudiante.nombre || ''} ${estudiante.apellidos || ''}`.trim();
        const numMatriculas = this.obtenerNumeroMatriculas(estudiante.idEstudiante);
        const matriculaReciente = this.obtenerMatriculaReciente(estudiante.idEstudiante);
        const cursoActual = matriculaReciente ? matriculaReciente.cursoAcademico : 'Sin matrícula';

        const matriculasInfo = numMatriculas > 0 
            ? `<p class="card-text text-muted small">
                <strong>Curso actual:</strong> ${u_estudiante.escapeHTML(cursoActual)}<br>
                <strong>Matrículas:</strong> ${numMatriculas}
               </p>`
            : `<p class="card-text text-muted small">
                <strong>Sin matrículas registradas</strong>
               </p>`;

        let botonesHtml = '';
        
        botonesHtml += `
            <button class="btn btn-sm btn-outline-info visualizar-estudiante" title="Visualizar" data-id="${estudiante.idEstudiante}">
                <i class="fas fa-eye"></i>
            </button>
        `;
        
        if (this.permisos.actualizarEstudiante) {
            botonesHtml += `
                <button class="btn btn-sm btn-outline-warning editar-estudiante" title="Editar" data-id="${estudiante.idEstudiante}">
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

        return `
            <div class="col-md-4 col-lg-3 mb-4">
                <div class="card h-100 shadow-sm estudiante-card">
                    <div class="card-body text-center">
                        <div class="mb-3 d-flex justify-content-center">
                            ${fotoHtml}
                        </div>
                        <h5 class="card-title">${u_estudiante.escapeHTML(nombreCompleto || 'Sin nombre')}</h5>
                        <p class="card-text text-muted small">
                            <strong>Código:</strong> ${u_estudiante.escapeHTML(estudiante.codigoEstudiante || 'N/A')}<br>
                            <strong>DIP:</strong> ${u_estudiante.escapeHTML(estudiante.dipEstudiante || 'N/A')}
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
     * RENDERIZAR LISTA
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
                            <th>Curso actual</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${this.estudiantes.map(estudiante => 
                            this.crearFilaListaHTML(estudiante)
                        ).join('')}
                    </tbody>
                </table>
            </div>
        `;
        
        this.agregarEventosBotones();
    }

    /**
     * CREAR FILA DE LISTA
     */
    static crearFilaListaHTML(estudiante) {
        const nombreCompleto = `${estudiante.nombre || ''} ${estudiante.apellidos || ''}`.trim();
        const matriculaReciente = this.obtenerMatriculaReciente(estudiante.idEstudiante);
        const cursoActual = matriculaReciente ? matriculaReciente.cursoAcademico : 'Sin matrícula';

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

        return `
            <tr>
                <td>${u_estudiante.escapeHTML(estudiante.codigoEstudiante || 'N/A')}</td>
                <td>${u_estudiante.escapeHTML(nombreCompleto)}</td>
                <td>${u_estudiante.escapeHTML(estudiante.dipEstudiante || 'N/A')}</td>
                <td>${u_estudiante.escapeHTML(estudiante.correoEstudiante || '-')}</td>
                <td>${u_estudiante.escapeHTML(estudiante.telefono || '-')}</td>
                <td><span class="badge bg-info">${u_estudiante.escapeHTML(cursoActual)}</span></td>
                <td>${botonesHtml}</td>
            </tr>
        `;
    }

    /**
     * AGREGAR EVENTOS A BOTONES
     */
    static agregarEventosBotones() {
        document.querySelectorAll('.visualizar-estudiante').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const id = btn.dataset.id;
                if (id) this.visualizarEstudiante(id);
            });
        });

        document.querySelectorAll('.editar-estudiante').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const id = btn.dataset.id;
                if (id) this.editarEstudiante(id);
            });
        });

        document.querySelectorAll('.eliminar-estudiante').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                e.stopPropagation();
                const id = btn.dataset.id;
                if (id) await this.eliminarEstudiante(id);
            });
        });
    }

    /**
     * CONFIGURAR EVENTOS PRINCIPALES
     */
    static configurarEventos() {
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

        const btnVolver = document.getElementById('btnVolverPanelPrincipal');
        if (btnVolver) {
            btnVolver.addEventListener('click', () => {
                window.location.href = '/guniversidadfrontend/secretarioAcademico/index.html';
            });
        }
    }

    /**
     * CONFIGURAR VISTA
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
     * ACTUALIZAR PAGINACIÓN
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

        const matriculasEstudiante = this.matriculas.filter(m => m.idEstudiante == id);
        let mensaje = '¿Está seguro de eliminar este estudiante? Esta acción no se puede deshacer.';
        
        if (matriculasEstudiante.length > 0) {
            mensaje = `El estudiante tiene ${matriculasEstudiante.length} matrícula(s) asociada(s). ¿Está seguro de eliminarlo? Esta acción no se puede deshacer.`;
        }
        
        const confirmacion = await Alerta.pregunta('Eliminar estudiante', mensaje);
        if (!confirmacion) return;

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