import { sesiones } from "../../public/core/sesiones.js";
import { Alerta } from "../../public/utilidades/u_alertas.js";
import { u_utiles } from "../../public/utilidades/u_utiles.js";
import { u_estudiante } from "../utilidades/u_estudiante.js";
import { m_estudiante, m_familiar, m_beca, m_estudianteBeca } from "../modelo/m_estudiante.js";
import { m_sesion } from "../../public/modelo/m_sesion.js";
import { m_matricula, m_pago } from "../modelo/m_matricula.js";
import { m_asignatura } from "../../admin/modelo/m_academico.js";
import { u_formularioEstudiante } from "../utilidades/u_formularioPlanEstudio.js";
import { u_usuario } from "../../admin/utilidades/u_usuario.js";
import { m_usuario } from "../../public/modelo/m_usuario.js";
import { u_verificaciones } from "../../public/utilidades/u_verificaciones.js";

/**
 * Controlador para el formulario de estudiantes
 * Maneja creación, edición y visualización de estudiantes
 */
export class c_formularioEstudiante {
    
    /**
     * VARIABLES DE ESTADO
     */
    static idEstudiante = null;
    static modo = 'creacion'; // 'creacion', 'edicion', 'visualizacion'
    static datosEstudiante = null;
    static datosFamiliares = [];
    static datosBecas = [];
    static datosMatriculas = [];
    static datosPagos = [];
    static seccionActiva = 'datosPersonales';
    static permisos = {
        insertarEstudiante: false,
        actualizarEstudiante: false,
        eliminarEstudiante: false,
        insertarMatricula: false,
        actualizarMatricula: false,
        eliminarMatricula: false
    };
    static usuarioActual = null;
    static centrosProcedencia = [];
    static universidadesProcedencia = [];

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
            this.obtenerIdDesdeURL();
            
            this.configurarEventos();
            this.configurarValidaciones();
            this.configurarCombos();
            
            if (this.idEstudiante) {
                await this.cargarDatosEstudiante();
            } else if (this.modo === 'creacion') {
                this.configurarModoCreacion();
            }
            
        } catch (error) {
            console.error('Error al inicializar c_formularioEstudiante:', error);
            Alerta.error('Error', 'No se pudo inicializar el formulario');
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
     * OBTENER ID DESDE URL
     */
    static obtenerIdDesdeURL() {
        const urlParams = new URLSearchParams(window.location.search);
        this.idEstudiante = urlParams.get('id');
        const modoParam = urlParams.get('modo');
        
        if (this.idEstudiante) {
            if (modoParam === 'edicion' && this.permisos.actualizarEstudiante) {
                this.modo = 'edicion';
            } else if (modoParam === 'visualizacion') {
                this.modo = 'visualizacion';
            } else if (modoParam === 'creacion') {
                this.modo = 'creacion';
                this.idEstudiante = null;
            } else {
                this.modo = 'visualizacion';
            }
        } else {
            this.modo = 'creacion';
            if (!this.permisos.insertarEstudiante) {
                Alerta.error('Permiso denegado', 'No tiene permiso para crear estudiantes');
                setTimeout(() => window.location.href = 'estudiante.html', 2000);
                return;
            }
        }
    }

    /**
     * CONFIGURAR MODO CREACIÓN
     */
    static configurarModoCreacion() {
        const edicionDiv = document.getElementById('seccionDatosPersonalesEdicion');
        const visualizacionDiv = document.getElementById('seccionDatosPersonalesVisualizacion');
        
        if (edicionDiv) edicionDiv.classList.remove('d-none');
        if (visualizacionDiv) visualizacionDiv.classList.add('d-none');
        
        const btnEditar = document.getElementById('btnEditarDatosPersonales');
        if (btnEditar) btnEditar.style.display = 'none';
        
        const titulo = document.getElementById('tituloPagina');
        if (titulo) titulo.textContent = 'Nuevo Estudiante';
        
        this.habilitarCamposFormulario(true);
        u_formularioEstudiante.inicializarValoresPorDefecto();
        
        // Añadir bloque familiar inicial si no existe
        const containerFamiliares = document.getElementById('contenedorFamiliares');
        if (containerFamiliares && containerFamiliares.children.length === 0) {
            containerFamiliares.innerHTML = u_estudiante.crearBloqueFamiliar(0);
            u_formularioEstudiante.configurarEventosEliminarFamiliar();
        }
    }

    /**
     * CONFIGURAR MODO EDICIÓN
     */
    static configurarModoEdicion() {
        const edicionDiv = document.getElementById('seccionDatosPersonalesEdicion');
        const visualizacionDiv = document.getElementById('seccionDatosPersonalesVisualizacion');
        
        if (edicionDiv) edicionDiv.classList.remove('d-none');
        if (visualizacionDiv) visualizacionDiv.classList.add('d-none');
        
        const btnEditar = document.getElementById('btnEditarDatosPersonales');
        if (btnEditar) btnEditar.style.display = 'none';
        
        const titulo = document.getElementById('tituloPagina');
        if (titulo) titulo.textContent = 'Editar Estudiante';
        
        this.habilitarCamposFormulario(true);
        
        const btnNuevaMatricula = document.getElementById('btnVuevaMatricula');
        if (btnNuevaMatricula) {
            btnNuevaMatricula.style.display = this.permisos.insertarMatricula ? 'inline-flex' : 'none';
        }
    }

    /**
     * CONFIGURAR MODO VISUALIZACIÓN
     */
    static configurarModoVisualizacion() {
        const edicionDiv = document.getElementById('seccionDatosPersonalesEdicion');
        const visualizacionDiv = document.getElementById('seccionDatosPersonalesVisualizacion');
        
        if (edicionDiv) edicionDiv.classList.add('d-none');
        if (visualizacionDiv) visualizacionDiv.classList.remove('d-none');
        
        const titulo = document.getElementById('tituloPagina');
        if (titulo) titulo.textContent = 'Visualizar Estudiante';
        
        this.habilitarCamposFormulario(false);
        
        const btnNuevaMatricula = document.getElementById('btnVuevaMatricula');
        if (btnNuevaMatricula) {
            btnNuevaMatricula.style.display = this.permisos.insertarMatricula ? 'inline-flex' : 'none';
        }
        
        // Ocultar botones de edición en secciones
        const btnEditarMatricula = document.getElementById('btnEditarDatosMatricula');
        if (btnEditarMatricula) btnEditarMatricula.style.display = 'none';
        
        const btnEditarAcademicos = document.getElementById('btnEditarDatosAcademicos');
        if (btnEditarAcademicos) btnEditarAcademicos.style.display = 'none';
        
        const btnAsignarAsignaturas = document.getElementById('btnAsignarAsignaturasEstudiante');
        if (btnAsignarAsignaturas) btnAsignarAsignaturas.style.display = 'none';
    }

    /**
     * HABILITAR/DESHABILITAR CAMPOS
     */
    static habilitarCamposFormulario(habilitar) {
        const campos = document.querySelectorAll('#formEstudiante input, #formEstudiante select, #formEstudiante textarea');
        campos.forEach(campo => {
            campo.disabled = !habilitar;
        });
    }

    /**
     * CARGAR DATOS DEL ESTUDIANTE
     */
    static async cargarDatosEstudiante() {
        try {
            this.mostrarCarga(true);
            
            const estudiantes = await m_estudiante.obtenerEstudiantes(); console.log(estudiantes)
            this.datosEstudiante = estudiantes.find(e => e.idEstudiante == this.idEstudiante);
            
            if (!this.datosEstudiante) {
                Alerta.error('Error', 'No se encontraron datos del estudiante');
                return;
            }
            
            this.datosFamiliares = await m_familiar.obtenerFamiliarPorEstudiante(this.idEstudiante) || [];
            this.datosBecas = await m_estudianteBeca.obtenerEstudiantesBecasPorEstudiante(this.idEstudiante) || [];
            
            const todasMatriculas = await m_matricula.obtenerMatriculas() || [];
            this.datosMatriculas = todasMatriculas.filter(m => m.idEstudiante == this.idEstudiante);
            
            const todosPagos = await m_pago.obtenerPagos() || [];
            const idsMatriculas = this.datosMatriculas.map(m => m.idMatricula);
            this.datosPagos = todosPagos.filter(p => idsMatriculas.includes(p.idMatricula));
            
            if (this.modo === 'edicion') {
                this.configurarModoEdicion();
            } else {
                this.configurarModoVisualizacion();
            }
            
            this.llenarFormularioDatosPersonales();
            this.llenarFormularioFamiliares();
            this.llenarFormularioBecas();
            this.llenarFormularioMatricula();
            
            await this.cargarCentrosYUniversidades();
            await this.cargarDatosAcademicos();
            
            this.mostrarCarga(false);
            
        } catch (error) {
            console.error('Error cargando datos del estudiante:', error);
            Alerta.error('Error', 'No se pudieron cargar los datos del estudiante');
            this.mostrarCarga(false);
        }
    }

    /**
     * CARGAR CENTROS Y UNIVERSIDADES
     */
    static async cargarCentrosYUniversidades() {
        try {
            const estudiantes = await m_estudiante.obtenerEstudiantes();
            
            if (estudiantes && estudiantes.length > 0) {
                this.centrosProcedencia = [...new Set(
                    estudiantes.map(e => e.centroProcedencia).filter(c => c && c.trim())
                )];
                
                this.universidadesProcedencia = [...new Set(
                    estudiantes.map(e => e.universidadProcedencia).filter(u => u && u.trim())
                )];
            }
            
            // Actualizar combos con los datos cargados
            u_formularioEstudiante.configurarCombos(this.centrosProcedencia, this.universidadesProcedencia);
            
        } catch (error) {
            console.error('Error cargando centros y universidades:', error);
        }
    }

    /**
     * CARGAR DATOS ACADÉMICOS
     */
    static async cargarDatosAcademicos() {
        if (!this.idEstudiante || this.datosMatriculas.length === 0) return;
        
        try {
            const matriculaReciente = this.datosMatriculas.sort((a, b) => 
                new Date(b.fechaMatricula) - new Date(a.fechaMatricula)
            )[0];
            
            // Obtener semestre de la matrícula reciente
            const semestre = matriculaReciente.idSemestre || 1;
            
            // Obtener asignaturas del semestre
            const asignaturasSemestre = await m_asignatura.obtenerAsignaturasPorSemestre(semestre, this.idEstudiante);
            
            // Obtener asignaturas pendientes y bloqueadas
            const asignaturasPendientesBloqueadas = await m_asignatura.obtenerAsignaturasPendientesYBloqueadas(semestre, this.idEstudiante);
            
            this.renderizarAsignaturasSemestre(asignaturasSemestre);
            this.renderizarAsignaturasPendientesBloqueadas(asignaturasPendientesBloqueadas);
            
        } catch (error) {
            console.error('Error cargando datos académicos:', error);
        }
    }

    /**
     * RENDERIZAR ASIGNATURAS DEL SEMESTRE
     */
    static renderizarAsignaturasSemestre(asignaturas) {
        const contenedor = document.getElementById('contenedorAsignaturasSemestre');
        if (!contenedor) return;
        
        if (!asignaturas || asignaturas.length === 0) {
            contenedor.innerHTML = '<p class="text-muted text-center p-3">No hay asignaturas disponibles para este semestre</p>';
            return;
        }
        
        contenedor.innerHTML = asignaturas.map(asig => `
            <div class="asignatura-item p-2 border-bottom d-flex justify-content-between align-items-center">
                <div>
                    <strong>${u_estudiante.escapeHTML(asig.codigoAsignatura || '')}</strong><br>
                    <small>${u_estudiante.escapeHTML(asig.nombreAsignatura)}</small>
                    <br><small class="text-muted">Créditos: ${asig.creditos || 0}</small>
                </div>
                <button class="btn btn-sm btn-outline-success agregar-asignatura" data-id="${asig.idAsignatura}" data-nombre="${u_estudiante.escapeHTML(asig.nombreAsignatura)}" data-creditos="${asig.creditos || 0}">
                    <i class="fas fa-plus"></i>
                </button>
            </div>
        `).join('');
        
        // Eventos para agregar asignaturas
        document.querySelectorAll('.agregar-asignatura').forEach(btn => {
            btn.addEventListener('click', () => {
                const id = btn.dataset.id;
                const nombre = btn.dataset.nombre;
                const creditos = parseInt(btn.dataset.creditos);
                this.agregarAsignaturaAsignar(id, nombre, creditos);
            });
        });
    }

    /**
     * RENDERIZAR ASIGNATURAS PENDIENTES Y BLOQUEADAS
     */
    static renderizarAsignaturasPendientesBloqueadas(asignaturas) {
        const contenedor = document.getElementById('contenedorAsignaturasPendienteYBloqueadas');
        if (!contenedor) return;
        
        if (!asignaturas || asignaturas.length === 0) {
            contenedor.innerHTML = '<p class="text-muted text-center p-3">No hay asignaturas pendientes o bloqueadas</p>';
            return;
        }
        
        contenedor.innerHTML = asignaturas.map(asig => `
            <div class="asignatura-item p-2 border-bottom">
                <div class="d-flex justify-content-between align-items-center">
                    <div>
                        <strong>${u_estudiante.escapeHTML(asig.codigoAsignatura || '')}</strong><br>
                        <small>${u_estudiante.escapeHTML(asig.nombreAsignatura)}</small>
                        <br><small class="text-muted">Créditos: ${asig.creditos || 0}</small>
                    </div>
                    <span class="badge ${asig.estado === 'bloqueada' ? 'bg-danger' : 'bg-warning'}">
                        ${asig.estado === 'bloqueada' ? 'Bloqueada' : 'Pendiente'}
                    </span>
                </div>
            </div>
        `).join('');
    }

    /**
     * AGREGAR ASIGNATURA A ASIGNAR
     */
    static agregarAsignaturaAsignar(id, nombre, creditos) {
        const contenedor = document.getElementById('contenedorAsignaturasAsignar');
        if (!contenedor) return;
        
        // Verificar si ya está agregada
        if (document.querySelector(`.asignatura-asignada[data-id="${id}"]`)) {
            Alerta.notificarAdvertencia('Esta asignatura ya está en la lista', 1500);
            return;
        }
        
        const nuevoElemento = document.createElement('div');
        nuevoElemento.className = 'asignatura-asignada p-2 border-bottom d-flex justify-content-between align-items-center';
        nuevoElemento.setAttribute('data-id', id);
        nuevoElemento.setAttribute('data-creditos', creditos);
        nuevoElemento.innerHTML = `
            <div>
                <strong>${nombre}</strong>
                <br><small class="text-muted">Créditos: ${creditos}</small>
            </div>
            <button class="btn btn-sm btn-outline-danger eliminar-asignatura-asignada">
                <i class="fas fa-trash"></i>
            </button>
        `;
        
        contenedor.appendChild(nuevoElemento);
        
        nuevoElemento.querySelector('.eliminar-asignatura-asignada').addEventListener('click', () => {
            nuevoElemento.remove();
            this.actualizarTotalCreditos();
        });
        
        this.actualizarTotalCreditos();
    }

    /**
     * ACTUALIZAR TOTAL DE CRÉDITOS
     */
    static actualizarTotalCreditos() {
        const asignaturas = document.querySelectorAll('.asignatura-asignada');
        let total = 0;
        asignaturas.forEach(asig => {
            total += parseInt(asig.dataset.creditos) || 0;
        });
        
        const spanTotal = document.getElementById('totalCreditos');
        if (spanTotal) spanTotal.textContent = total;
    }

    /**
     * LLENAR FORMULARIO DE DATOS PERSONALES
     */
    static llenarFormularioDatosPersonales() {
        if (!this.datosEstudiante) return;
        
        const d = this.datosEstudiante;
        
        document.getElementById('nombreEstudianteMatricula').value = d.nombre || '';
        document.getElementById('apellidosEstudianteMatricula').value = d.apellidos || '';
        document.getElementById('dipEstudianteMatricula').value = d.dipEstudiante || '';
        if (d.fechaNacimiento) {
            document.getElementById('fechaNacimientoEstudianteMatricula').value = d.fechaNacimiento.split('T')[0];
        }
        document.getElementById('nacionalidadEstudianteMatricula').value = d.nacionalidad || '';
        document.getElementById('generosEstudianteMatricula').value = d.sexo || 'Ninguno';
        document.getElementById('direccionEstudianteMatricula').value = d.direccion || '';
        document.getElementById('localidadEstudianteMatricula').value = d.localidad || '';
        document.getElementById('provinciaEstudianteMatricula').value = d.provincia || '';
        document.getElementById('correoEstudianteMatricula').value = d.correoEstudiante || '';
        document.getElementById('telefonoEstudianteMatricula').value = d.telefono || '';
        
        const paisCombo = document.getElementById('comboPaisesEstudianteMatricula');
        if (paisCombo && d.pais) paisCombo.value = d.pais;
        
        const centroCombo = document.getElementById('comboCentroEstudianteMatricula');
        if (centroCombo && d.centroProcedencia) centroCombo.value = d.centroProcedencia;
        
        const universidadCombo = document.getElementById('comboUniversidadEstudianteMatricula');
        if (universidadCombo && d.universidadProcedencia) universidadCombo.value = d.universidadProcedencia;
        
        const checkBecario = document.getElementById('esBecario');
        if (checkBecario) checkBecario.checked = d.esBecado === 1 || d.esBecado === true;
        
        document.getElementById('nombreOCorreoUsuario').value = d.usuario?.nombreUsuario || '';
        
        this.actualizarVistaVisualizacion();
    }

    /**
     * ACTUALIZAR VISTA DE VISUALIZACIÓN
     */
    static actualizarVistaVisualizacion() {
        const contenedor = document.getElementById('seccionDatosPersonalesVisualizacion');
        if (!contenedor || this.modo !== 'visualizacion') return;
        
        const d = this.datosEstudiante;
        if (!d) return;
        
        const html = `
            <div class="card">
                <div class="card-header bg-warning text-dark">
                    <h5 class="mb-0">Datos del Estudiante</h5>
                </div>
                <div class="card-body">
                    <div class="row">
                        <div class="col-md-6">
                            <p><strong>Nombre completo:</strong> ${u_estudiante.escapeHTML(d.nombre)} ${u_estudiante.escapeHTML(d.apellidos)}</p>
                            <p><strong>Código:</strong> ${u_estudiante.escapeHTML(d.codigoEstudiante || 'N/A')}</p>
                            <p><strong>DIP:</strong> ${u_estudiante.escapeHTML(d.dipEstudiante || 'N/A')}</p>
                            <p><strong>Fecha de nacimiento:</strong> ${u_estudiante.formatearFecha(d.fechaNacimiento)}</p>
                            <p><strong>Nacionalidad:</strong> ${u_estudiante.escapeHTML(d.nacionalidad || 'N/A')}</p>
                            <p><strong>Sexo:</strong> ${u_estudiante.escapeHTML(d.sexo || 'N/A')}</p>
                        </div>
                        <div class="col-md-6">
                            <p><strong>Dirección:</strong> ${u_estudiante.escapeHTML(d.direccion || 'N/A')}</p>
                            <p><strong>Localidad:</strong> ${u_estudiante.escapeHTML(d.localidad || 'N/A')}</p>
                            <p><strong>Provincia:</strong> ${u_estudiante.escapeHTML(d.provincia || 'N/A')}</p>
                            <p><strong>País:</strong> ${u_estudiante.escapeHTML(d.pais || 'N/A')}</p>
                            <p><strong>Correo:</strong> ${u_estudiante.escapeHTML(d.correoEstudiante || 'N/A')}</p>
                            <p><strong>Teléfono:</strong> ${u_estudiante.escapeHTML(d.telefono || 'N/A')}</p>
                        </div>
                    </div>
                    <hr>
                    <div class="row">
                        <div class="col-md-6">
                            <p><strong>Centro de procedencia:</strong> ${u_estudiante.escapeHTML(d.centroProcedencia || 'N/A')}</p>
                            <p><strong>Universidad de procedencia:</strong> ${u_estudiante.escapeHTML(d.universidadProcedencia || 'N/A')}</p>
                        </div>
                        <div class="col-md-6">
                            <p><strong>Es becario:</strong> ${d.esBecado ? 'Sí' : 'No'}</p>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        contenedor.innerHTML = html;
    }

    /**
     * LLENAR FORMULARIO DE FAMILIARES
     */
    static llenarFormularioFamiliares() {
        const container = document.getElementById('contenedorFamiliares');
        if (!container) return;
        
        if (!this.datosFamiliares || this.datosFamiliares.length === 0) {
            container.innerHTML = u_estudiante.crearBloqueFamiliar(0);
        } else {
            let html = '';
            this.datosFamiliares.forEach((familiar, index) => {
                html += u_estudiante.crearBloqueFamiliar(index, familiar);
            });
            container.innerHTML = html;
        }
        
        u_formularioEstudiante.configurarEventosEliminarFamiliar();
    }

    /**
     * LLENAR FORMULARIO DE BECAS
     */
    static llenarFormularioBecas() {
        const container = document.getElementById('contenedorBecas');
        if (!container) return;
        
        const esBecario = this.datosEstudiante?.esBecado === 1 || this.datosEstudiante?.esBecado === true;
        
        if (!esBecario || !this.datosBecas || this.datosBecas.length === 0) {
            container.innerHTML = '';
        } else {
            let html = '';
            this.datosBecas.forEach((beca, index) => {
                html += u_estudiante.crearBloqueBeca(index, beca);
            });
            container.innerHTML = html;
        }
        
        u_formularioEstudiante.configurarEventosEliminarBeca();
    }

    /**
     * LLENAR FORMULARIO DE MATRÍCULA
     */
    static llenarFormularioMatricula() {
        if (!this.datosMatriculas || this.datosMatriculas.length === 0) {
            u_formularioEstudiante.inicializarValoresPorDefecto();
            return;
        }
        
        const matriculaReciente = this.datosMatriculas.sort((a, b) => 
            new Date(b.fechaMatricula) - new Date(a.fechaMatricula)
        )[0];
        
        document.getElementById('cursoAcademicoMatricula').value = matriculaReciente.cursoAcademico || '';
        if (matriculaReciente.fechaMatricula) {
            document.getElementById('fechaMatricula').value = matriculaReciente.fechaMatricula.split('T')[0];
        }
        document.getElementById('modalidadMatricula').value = matriculaReciente.modalidadMatricula || 'Ninguno';
        document.getElementById('creditosTotalesMatricula').value = matriculaReciente.totalCreditos || 0;
        document.getElementById('estadosMatricula').value = matriculaReciente.estado || 'Ninguno';
        
        if (this.datosPagos && this.datosPagos.length > 0) {
            const pagoReciente = this.datosPagos.sort((a, b) => 
                new Date(b.fechaPago) - new Date(a.fechaPago)
            )[0];
            
            document.getElementById('cuotaEstudiante').value = pagoReciente.cuota || '';
            document.getElementById('montoEstudiante').value = pagoReciente.monto || '';
            if (pagoReciente.fechaPago) {
                document.getElementById('fechaPagoEstudiante').value = pagoReciente.fechaPago.split('T')[0];
            }
            
            if (pagoReciente.idFamiliar && this.datosFamiliares) {
                const familiarResponsable = this.datosFamiliares.find(f => f.idFamiliar == pagoReciente.idFamiliar);
                if (familiarResponsable) {
                    document.getElementById('responsablePagoEstudiante').value = `${familiarResponsable.nombre} ${familiarResponsable.apellidos}`;
                }
            }
        }
        
        this.actualizarVistaVisualizacionMatricula();
    }

    /**
     * ACTUALIZAR VISTA DE VISUALIZACIÓN DE MATRÍCULA
     */
    static actualizarVistaVisualizacionMatricula() {
        const contenedor = document.getElementById('seccionDatosMatriculaVisualizacion');
        if (!contenedor || this.modo !== 'visualizacion') return;
        
        if (!this.datosMatriculas || this.datosMatriculas.length === 0) {
            contenedor.innerHTML = `
                <div class="alert alert-info text-center">
                    <i class="fas fa-info-circle me-2"></i>
                    No hay matrículas registradas para este estudiante.
                </div>
            `;
            return;
        }
        
        let html = '<div class="row">';
        this.datosMatriculas.forEach(matricula => {
            const pagoAsociado = this.datosPagos.find(p => p.idMatricula === matricula.idMatricula);
            
            html += `
                <div class="col-md-6 mb-3">
                    <div class="card shadow-sm">
                        <div class="card-header bg-warning text-dark">
                            <strong>Curso Académico: ${u_estudiante.escapeHTML(matricula.cursoAcademico)}</strong>
                        </div>
                        <div class="card-body">
                            <p><strong>Fecha Matrícula:</strong> ${u_estudiante.formatearFecha(matricula.fechaMatricula)}</p>
                            <p><strong>Modalidad:</strong> ${u_estudiante.escapeHTML(matricula.modalidadMatricula)}</p>
                            <p><strong>Total Créditos:</strong> ${matricula.totalCreditos || 0}</p>
                            <p><strong>Estado:</strong> ${matricula.estado === 'Completo' ? 
                                '<span class="badge bg-success">Completada</span>' : 
                                '<span class="badge bg-warning text-dark">Incompleta</span>'}
                            </p>
                            ${pagoAsociado ? `
                                <hr>
                                <h6>Información de Pago</h6>
                                <p><strong>Cuota:</strong> ${pagoAsociado.cuota}</p>
                                <p><strong>Monto:</strong> ${new Intl.NumberFormat('es-ES', {style: 'currency', currency: 'FCFA'}).format(pagoAsociado.monto)}</p>
                                <p><strong>Fecha Pago:</strong> ${u_estudiante.formatearFecha(pagoAsociado.fechaPago)}</p>
                            ` : ''}
                            ${this.permisos.actualizarMatricula ? `
                                <button class="btn btn-sm btn-outline-warning editar-matricula mt-2" data-id="${matricula.idMatricula}">
                                    <i class="fas fa-edit"></i> Editar
                                </button>
                            ` : ''}
                        </div>
                    </div>
                </div>
            `;
        });
        html += '</div>';
        
        contenedor.innerHTML = html;
        
        // Eventos para editar matrícula
        document.querySelectorAll('.editar-matricula').forEach(btn => {
            btn.addEventListener('click', () => this.editarMatricula(btn.dataset.id));
        });
    }

    /**
     * MOSTRAR/OCULTAR CARGA
     */
    static mostrarCarga(mostrar) {
        const contenedor = document.querySelector('.container-fluid');
        if (!contenedor) return;
        
        if (mostrar) {
            const loader = document.createElement('div');
            loader.id = 'loaderFormulario';
            loader.className = 'position-fixed top-0 start-0 w-100 h-100 d-flex justify-content-center align-items-center bg-white bg-opacity-75 z-3';
            loader.innerHTML = `
                <div class="text-center">
                    <div class="spinner-border text-warning" role="status" style="width: 3rem; height: 3rem;">
                        <span class="visually-hidden">Cargando...</span>
                    </div>
                    <p class="mt-2">Cargando datos...</p>
                </div>
            `;
            contenedor.appendChild(loader);
        } else {
            const loader = document.getElementById('loaderFormulario');
            if (loader) loader.remove();
        }
    }

    /**
     * CONFIGURAR EVENTOS
     */
    static configurarEventos() {
        // Botones de secciones
        u_formularioEstudiante.configurarBotonesSecciones();
        
        // Botón editar datos personales
        const btnEditar = document.getElementById('btnEditarDatosPersonales');
        if (btnEditar && this.permisos.actualizarEstudiante) {
            btnEditar.addEventListener('click', () => {
                this.modo = 'edicion';
                this.configurarModoEdicion();
                this.llenarFormularioDatosPersonales();
            });
        }
        
        // Botón guardar estudiante
        const btnGuardar = document.getElementById('btnGuardarEstudiante');
        if (btnGuardar) {
            btnGuardar.addEventListener('click', () => this.guardarEstudiante());
        }
        
        // Botón guardar matrícula
        const btnGuardarMatricula = document.getElementById('btnGuardarMatricula');
        if (btnGuardarMatricula) {
            btnGuardarMatricula.addEventListener('click', () => this.guardarMatricula());
        }
        
        // Botón nueva matrícula
        const btnNuevaMatricula = document.getElementById('btnVuevaMatricula');
        if (btnNuevaMatricula && this.permisos.insertarMatricula) {
            btnNuevaMatricula.addEventListener('click', () => this.mostrarFormularioMatricula());
        }
        
        // Botón cancelar
        document.querySelectorAll('.btnCancelar').forEach(btn => {
            btn.addEventListener('click', () => {
                if (this.idEstudiante) {
                    window.location.href = `formularioEstudiante.html?id=${this.idEstudiante}&modo=visualizacion`;
                } else {
                    window.location.href = 'estudiante.html';
                }
            });
        });
        
        // Botón volver
        const btnVolver = document.getElementById('btnVolverPanelEstudiante');
        if (btnVolver) {
            btnVolver.addEventListener('click', () => {
                window.location.href = 'estudiante.html';
            });
        }
        
        // Checkbox becario
        u_formularioEstudiante.configurarCheckboxBecario();
        
        // Botones añadir
        u_formularioEstudiante.configurarEventosFamiliares();
        u_formularioEstudiante.configurarEventosBecas();
    }

    /**
     * CONFIGURAR VALIDACIONES
     */
    static configurarValidaciones() {
        u_formularioEstudiante.configurarValidacionesEnTiempoReal();
    }

    /**
     * CONFIGURAR COMBOS
     */
    static async configurarCombos() {
        await this.cargarCentrosYUniversidades();
    }

    /**
     * MOSTRAR FORMULARIO DE MATRÍCULA
     */
    static mostrarFormularioMatricula() {
        const edicionDiv = document.getElementById('seccionDatosMatriculaEdicion');
        const visualizacionDiv = document.getElementById('seccionDatosMatriculaVisualizacion');
        
        if (edicionDiv) edicionDiv.classList.remove('d-none');
        if (visualizacionDiv) visualizacionDiv.classList.add('d-none');
        
        u_formularioEstudiante.inicializarValoresPorDefecto();
        
        const btnNuevaMatricula = document.getElementById('btnVuevaMatricula');
        if (btnNuevaMatricula) btnNuevaMatricula.style.display = 'none';
        
        // Mostrar botón cancelar matrícula
        if (!document.getElementById('btnCancelarMatricula')) {
            const btnCancelarMatricula = document.createElement('button');
            btnCancelarMatricula.id = 'btnCancelarMatricula';
            btnCancelarMatricula.className = 'btn btn-sm btn-secondary me-1';
            btnCancelarMatricula.innerHTML = '<i class="fas fa-times me-2"></i> Cancelar Matrícula';
            btnCancelarMatricula.addEventListener('click', () => this.cancelarNuevaMatricula());
            
            const btnGuardarMatricula = document.getElementById('btnGuardarMatricula');
            if (btnGuardarMatricula && btnGuardarMatricula.parentNode) {
                btnGuardarMatricula.parentNode.insertBefore(btnCancelarMatricula, btnGuardarMatricula);
            }
        }
    }

    /**
     * CANCELAR NUEVA MATRÍCULA
     */
    static cancelarNuevaMatricula() {
        const edicionDiv = document.getElementById('seccionDatosMatriculaEdicion');
        const visualizacionDiv = document.getElementById('seccionDatosMatriculaVisualizacion');
        
        if (edicionDiv) edicionDiv.classList.add('d-none');
        if (visualizacionDiv) visualizacionDiv.classList.remove('d-none');
        
        const btnNuevaMatricula = document.getElementById('btnVuevaMatricula');
        if (btnNuevaMatricula) btnNuevaMatricula.style.display = 'inline-flex';
        
        const btnCancelar = document.getElementById('btnCancelarMatricula');
        if (btnCancelar) btnCancelar.remove();
        
        this.llenarFormularioMatricula();
    }

    /**
     * Genera el código de asignatura
     * @param {number} numero - Número secuencial
     * @returns {string} - Código generado
     */
    static generarCodigoEstudiante(numero) {
        numero++;
        const numeroFormateado = numero.toString().padStart(4, '0');

        return `${numeroFormateado}`;
    }

    /**
     * GUARDAR ESTUDIANTE
     */
    static async guardarEstudiante() {
        if (this.modo === 'visualizacion') return;
        
        if (!u_formularioEstudiante.validarFormularioDatosPersonales()) {
            Alerta.notificarAdvertencia('Revise los campos marcados en rojo', 2000);
            return;
        }
        
        if (!u_formularioEstudiante.validarTodosFamiliares()) {
            Alerta.notificarAdvertencia('Revise los datos de los familiares', 2000);
            return;
        }
        
        if (!u_formularioEstudiante.validarTodosBecas()) {
            Alerta.notificarAdvertencia('Revise los datos de las becas', 2000);
            return;
        }
        
        try {
            const formData = new FormData(); 
            const formDataUsuario = new FormData();
            
            formData.append('nombre', document.getElementById('nombreEstudianteMatricula').value);
            formData.append('apellidos', document.getElementById('apellidosEstudianteMatricula').value);
            formData.append('codigoEstudiante', c_formularioEstudiante.generarCodigoEstudiante(1000));
            formData.append('dipEstudiante', document.getElementById('dipEstudianteMatricula').value);
            formData.append('fechaNacimiento', document.getElementById('fechaNacimientoEstudianteMatricula').value);
            formData.append('nacionalidad', document.getElementById('nacionalidadEstudianteMatricula').value);
            formData.append('sexo', document.getElementById('generosEstudianteMatricula').value);
            formData.append('direccion', document.getElementById('direccionEstudianteMatricula').value);
            formData.append('localidad', document.getElementById('localidadEstudianteMatricula').value);
            formData.append('provincia', document.getElementById('provinciaEstudianteMatricula').value);
            formData.append('pais', document.getElementById('comboPaisesEstudianteMatricula').value);
            formData.append('correoEstudiante', document.getElementById('correoEstudianteMatricula').value);
            formData.append('telefono', document.getElementById('telefonoEstudianteMatricula').value);
            formData.append('centroProcedencia', document.getElementById('comboCentroEstudianteMatricula').value);
            formData.append('universidadProcedencia', document.getElementById('comboUniversidadEstudianteMatricula').value);
            formData.append('esBecado', document.getElementById('esBecario').checked ? 'Si' : 'No');

            // usuario
            const nombreOCorreo = $('#nombreOCorreoUsuario').val().trim();
            let nombreUsuario = nombreOCorreo;
            let correoUsuario = null;
            
            if (u_verificaciones.validarCorreo(nombreOCorreo)) {
                nombreUsuario = u_usuario.generarNombreUsuario(nombreOCorreo);
                correoUsuario = nombreOCorreo;
            } else {
                correoUsuario = u_usuario.generarCorreoUsuario(nombreOCorreo);
            }
            
            let idUsuario;
            
            formDataUsuario.append('nombreUsuario', nombreUsuario);
            formDataUsuario.append('correo', correoUsuario);
            formDataUsuario.append('contrasena', $('#generarContraseña').is(':checked') ? u_usuario.generarContraseñaAleatoria() : 'contraseña123');
            formDataUsuario.append('rol', 3);
            formDataUsuario.append('estado', 'activo');
            
            if (this.modo === 'edicion' && this.idEstudiante) {
                //
                formDataUsuario.append('idUsuario', this.usuarioActual.idUsuario);
                let actualizado = await m_usuario.actualizarUsuario(formDataUsuario);

                if (actualizado==null) return;

                idUsuario = this.usuarioActual.idUsuario;

                //
                formData.append('idEstudiante', this.idEstudiante);
                formData.append('idUsuario', idUsuario);
                const resultado = await m_estudiante.actualizarEstudiante(formData);
                if (resultado) {
                    Alerta.notificarExito('Estudiante actualizado correctamente', 1500);
                    window.location.href = `formularioEstudiante.html?id=${this.idEstudiante}&modo=visualizacion`;
                }
            } else {
                //
                const resultadoa = await m_usuario.insertarUsuario(formDataUsuario);

                if (resultadoa==null) return;

                idUsuario = resultadoa.idUsuario;

                //
                formData.append('idUsuario', idUsuario);
                const resultado = await m_estudiante.insertarEstudiante(formData);
                if (resultado && resultado.idEstudiante) {
                    await this.guardarFamiliares(resultado.idEstudiante);
                    await this.guardarBecas(resultado.idEstudiante);
                    
                    Alerta.notificarExito('Estudiante creado correctamente', 1500);
                    window.location.href = `formularioEstudiante.html?id=${resultado.idEstudiante}&modo=visualizacion`;
                }
            }
            
        } catch (error) {
            console.error('Error guardando estudiante:', error);
            Alerta.error('Error', 'No se pudo guardar el estudiante');
        }
    }

    /**
     * GUARDAR FAMILIARES
     */
    /*static async guardarFamiliares(idEstudiante) {
        const bloques = document.querySelectorAll('.familiar-bloque');
        
        for (const bloque of bloques) {
            const datos = {
                idEstudiante: idEstudiante,
                nombre: bloque.querySelector('.familiar-nombre')?.value || '',
                apellidos: bloque.querySelector('.familiar-apellidos')?.value || '',
                dipFamiliar: bloque.querySelector('.familiar-dip')?.value || '',
                direccion: bloque.querySelector('.familiar-direccion')?.value || '',
                correoFamiliar: bloque.querySelector('.familiar-correo')?.value || '',
                telefono: bloque.querySelector('.familiar-telefono')?.value || '',
                parentesco: bloque.querySelector('.familiar-parentesco')?.value || '',
                esContactoIncidentes: bloque.querySelector('.familiar-contactoIncidente')?.value === 'Sí' ? 1 : 0,
                esResponsablePago: bloque.querySelector('.familiar-responsablePago')?.value === 'Sí' ? 1 : 0
            };
            
            if (datos.nombre || datos.apellidos) {
                await m_familiar.insertarFamiliar(datos);
            }
        }
    }*/

    /**
     * GUARDAR FAMILIARES (estáticos + dinámicos)
     */
    static async guardarFamiliares(idEstudiante) {
        const familiaresGuardar = [];
        
        // 1. Obtener datos del bloque estático (IDs fijos)
        const nombreStatic = document.getElementById('nombreEstudianteFamiliar')?.value;
        const apellidosStatic = document.getElementById('apellidosEstudianteFamiliar')?.value;
        
        // Solo guardar si el bloque estático tiene datos
        if (nombreStatic || apellidosStatic) {
            const datosStatic = {
                idEstudiante: idEstudiante,
                nombre: nombreStatic || '',
                apellidos: apellidosStatic || '',
                dipFamiliar: document.getElementById('dipEstudianteFamiliar')?.value || '',
                direccion: document.getElementById('direccionEstudianteFamiliar')?.value || '',
                correoFamiliar: document.getElementById('correoEstudianteFamiliar')?.value || '',
                telefono: document.getElementById('telefonoEstudianteFamiliar')?.value || '',
                parentesco: document.getElementById('parentezcoEstudianteFamiliar')?.value || '',
                esContactoIncidentes: document.getElementById('contactoIncidenteEstudianteFamiliar')?.value === 'Sí' ? 1 : 0,
                esResponsablePago: document.getElementById('responsablePagoEstudianteFamiliar')?.value === 'Sí' ? 1 : 0
            };
            familiaresGuardar.push(datosStatic);
        }
        
        // 2. Obtener datos de bloques dinámicos
        const bloquesDinamicos = document.querySelectorAll('.familiar-bloque');
        bloquesDinamicos.forEach(bloque => {
            const nombre = bloque.querySelector('.familiar-nombre')?.value;
            const apellidos = bloque.querySelector('.familiar-apellidos')?.value;
            
            // Solo guardar si el bloque tiene datos
            if (nombre || apellidos) {
                const datosDinamico = {
                    idEstudiante: idEstudiante,
                    nombre: nombre || '',
                    apellidos: apellidos || '',
                    dipFamiliar: bloque.querySelector('.familiar-dip')?.value || '',
                    direccion: bloque.querySelector('.familiar-direccion')?.value || '',
                    correoFamiliar: bloque.querySelector('.familiar-correo')?.value || '',
                    telefono: bloque.querySelector('.familiar-telefono')?.value || '',
                    parentesco: bloque.querySelector('.familiar-parentesco')?.value || '',
                    esContactoIncidentes: bloque.querySelector('.familiar-contactoIncidente')?.value === 'Sí' ? 1 : 0,
                    esResponsablePago: bloque.querySelector('.familiar-responsablePago')?.value === 'Sí' ? 1 : 0
                };
                familiaresGuardar.push(datosDinamico);
            }
        });
        
        // 3. Guardar todos los familiares
        for (const familiar of familiaresGuardar) {
            await m_familiar.insertarFamiliar(familiar);
        }
        
        console.log(`Guardados ${familiaresGuardar.length} familiares`);
    }

    /**
     * GUARDAR BECAS
     */
  /*  static async guardarBecas(idEstudiante) {
        const esBecario = document.getElementById('esBecario')?.checked;
        if (!esBecario) return;
        
        const bloques = document.querySelectorAll('.beca-bloque');
        
        for (const bloque of bloques) {
            const institucion = bloque.querySelector('.beca-institucion')?.value || '';
            const tipo = bloque.querySelector('.beca-tipo')?.value || '';
            const estado = bloque.querySelector('.beca-estado')?.value || '';
            const fechaInicio = bloque.querySelector('.beca-fechaInicio')?.value || '';
            const fechaFin = bloque.querySelector('.beca-fechaFin')?.value || '';
            const observaciones = bloque.querySelector('.beca-observaciones')?.value || '';
            
            if (institucion && tipo !== 'Ninguno') {
                // Insertar beca
                const becaResultado = await m_beca.insertarBeca({
                    institucionBeca: institucion,
                    tipoBeca: tipo
                });
                
                if (becaResultado && becaResultado.idBeca) {
                    // Insertar relación estudiante-beca
                    await m_estudianteBeca.insertarEstudianteBecado({
                        idEstudiante: idEstudiante,
                        idBeca: becaResultado.idBeca,
                        fechaInicio: fechaInicio,
                        fechaFinal: fechaFin,
                        estado: estado,
                        observaciones: observaciones
                    });
                }
            }
        }
    }*/

    /**
     * GUARDAR BECAS (estáticas + dinámicas)
     */
    static async guardarBecas(idEstudiante) {
        const esBecario = document.getElementById('esBecario')?.checked;
        if (!esBecario) return;
        
        const becasGuardar = [];
        
        // 1. Obtener datos del bloque estático de beca (IDs fijos)
        const institucionStatic = document.getElementById('comboNombreInstitucionBeca')?.value;
        const tipoStatic = document.getElementById('tiposBeca')?.value;
        
        if (institucionStatic && tipoStatic !== 'Ninguno') {
            becasGuardar.push({
                institucionBeca: institucionStatic,
                tipoBeca: tipoStatic,
                estado: document.getElementById('estadosBeca')?.value || 'Ninguno',
                fechaInicio: document.getElementById('fechaInicioBeca')?.value,
                fechaFin: document.getElementById('fechaFinBeca')?.value,
                observaciones: document.getElementById('observacionesBeca')?.value || ''
            });
        }
        
        // 2. Obtener datos de bloques dinámicos de becas
        const bloquesDinamicos = document.querySelectorAll('.beca-bloque');
        bloquesDinamicos.forEach(bloque => {
            const institucion = bloque.querySelector('.beca-institucion')?.value;
            const tipo = bloque.querySelector('.beca-tipo')?.value;
            
            if (institucion && tipo !== 'Ninguno') {
                becasGuardar.push({
                    institucionBeca: institucion,
                    tipoBeca: tipo,
                    estado: bloque.querySelector('.beca-estado')?.value || 'Ninguno',
                    fechaInicio: bloque.querySelector('.beca-fechaInicio')?.value,
                    fechaFin: bloque.querySelector('.beca-fechaFin')?.value,
                    observaciones: bloque.querySelector('.beca-observaciones')?.value || ''
                });
            }
        });
        
        // 3. Guardar todas las becas
        for (const beca of becasGuardar) {
            // Insertar beca
            const becaResultado = await m_beca.insertarBeca({
                institucionBeca: beca.institucionBeca,
                tipoBeca: beca.tipoBeca
            });
            
            if (becaResultado && becaResultado.idBeca) {
                // Insertar relación estudiante-beca
                await m_estudianteBeca.insertarEstudianteBecado({
                    idEstudiante: idEstudiante,
                    idBeca: becaResultado.idBeca,
                    fechaInicio: beca.fechaInicio,
                    fechaFinal: beca.fechaFin,
                    estado: beca.estado,
                    observaciones: beca.observaciones
                });
            }
        }
        
        console.log(`Guardados ${becasGuardar.length} becas`);
    }

    /**
     * GUARDAR MATRÍCULA
     */
    static async guardarMatricula() {
        if (!this.idEstudiante) {
            Alerta.error('Error', 'Primero debe guardar los datos del estudiante');
            return;
        }
        
        if (!u_formularioEstudiante.validarFormularioMatricula()) {
            Alerta.notificarAdvertencia('Revise los campos de matrícula', 2000);
            return;
        }
        
        if (!u_formularioEstudiante.validarFormularioPago()) {
            Alerta.notificarAdvertencia('Revise los campos de pago', 2000);
            return;
        }
        
        try {
            const matriculaData = {
                idEstudiante: this.idEstudiante,
                idPlanEstudio: document.getElementById('comboPlanEstudioMatricula')?.value || null,
                idSemestre: document.getElementById('semestresMatricula')?.value || null,
                cursoAcademico: document.getElementById('cursoAcademicoMatricula')?.value,
                fechaMatricula: document.getElementById('fechaMatricula')?.value,
                modalidadMatricula: document.getElementById('modalidadMatricula')?.value,
                totalCreditos: document.getElementById('creditosTotalesMatricula')?.value || 0,
                estado: document.getElementById('estadosMatricula')?.value
            };
            
            const resultadoMatricula = await m_matricula.insertarMatricula(matriculaData);
            
            if (resultadoMatricula && resultadoMatricula.idMatricula) {
                const pagoData = {
                    idMatricula: resultadoMatricula.idMatricula,
                    cuota: document.getElementById('cuotaEstudiante')?.value,
                    monto: document.getElementById('montoEstudiante')?.value,
                    fechaPago: document.getElementById('fechaPagoEstudiante')?.value
                };
                
                await m_pago.insertarPago(pagoData);
                
                Alerta.notificarExito('Matrícula guardada correctamente', 1500);
                
                await this.cargarDatosEstudiante();
                this.cancelarNuevaMatricula();
            } else {
                Alerta.error('Error', 'No se pudo guardar la matrícula');
            }
            
        } catch (error) {
            console.error('Error guardando matrícula:', error);
            Alerta.error('Error', 'No se pudo guardar la matrícula');
        }
    }

    /**
     * EDITAR MATRÍCULA
     */
    static async editarMatricula(idMatricula) {
        const matricula = this.datosMatriculas.find(m => m.idMatricula == idMatricula);
        if (!matricula) return;
        
        const pago = this.datosPagos.find(p => p.idMatricula == idMatricula);
        
        // Mostrar formulario de edición
        this.mostrarFormularioMatricula();
        
        // Llenar datos
        document.getElementById('cursoAcademicoMatricula').value = matricula.cursoAcademico || '';
        if (matricula.fechaMatricula) {
            document.getElementById('fechaMatricula').value = matricula.fechaMatricula.split('T')[0];
        }
        document.getElementById('modalidadMatricula').value = matricula.modalidadMatricula || 'Ninguno';
        document.getElementById('creditosTotalesMatricula').value = matricula.totalCreditos || 0;
        document.getElementById('estadosMatricula').value = matricula.estado || 'Ninguno';
        
        if (pago) {
            document.getElementById('cuotaEstudiante').value = pago.cuota || '';
            document.getElementById('montoEstudiante').value = pago.monto || '';
            if (pago.fechaPago) {
                document.getElementById('fechaPagoEstudiante').value = pago.fechaPago.split('T')[0];
            }
        }
        
        // Guardar ID para actualización
        this.idMatriculaEditando = idMatricula;
        
        // Cambiar texto del botón guardar
        const btnGuardar = document.getElementById('btnGuardarMatricula');
        if (btnGuardar) {
            btnGuardar.innerHTML = '<i class="fas fa-sync-alt me-2"></i> Actualizar Matrícula';
            btnGuardar.removeEventListener('click', this.guardarMatricula);
            btnGuardar.addEventListener('click', () => this.actualizarMatricula());
        }
    }

    /**
     * ACTUALIZAR MATRÍCULA
     */
    static async actualizarMatricula() {
        if (!this.idMatriculaEditando) return;
        
        try {
            const matriculaData = {
                idMatricula: this.idMatriculaEditando,
                cursoAcademico: document.getElementById('cursoAcademicoMatricula')?.value,
                fechaMatricula: document.getElementById('fechaMatricula')?.value,
                modalidadMatricula: document.getElementById('modalidadMatricula')?.value,
                totalCreditos: document.getElementById('creditosTotalesMatricula')?.value || 0,
                estado: document.getElementById('estadosMatricula')?.value
            };
            
            await m_matricula.actualizarMatricula(matriculaData);
            
            Alerta.notificarExito('Matrícula actualizada correctamente', 1500);
            
            delete this.idMatriculaEditando;
            
            await this.cargarDatosEstudiante();
            this.cancelarNuevaMatricula();
            
            // Restaurar botón guardar
            const btnGuardar = document.getElementById('btnGuardarMatricula');
            if (btnGuardar) {
                btnGuardar.innerHTML = '<i class="fas fa-save me-2"></i> Guardar Matrícula';
                btnGuardar.removeEventListener('click', this.actualizarMatricula);
                btnGuardar.addEventListener('click', () => this.guardarMatricula());
            }
            
        } catch (error) {
            console.error('Error actualizando matrícula:', error);
            Alerta.error('Error', 'No se pudo actualizar la matrícula');
        }
    }
}

// ========== INICIALIZAR ==========
$(document).ready(async function() {
    await c_formularioEstudiante.iniciar();
});