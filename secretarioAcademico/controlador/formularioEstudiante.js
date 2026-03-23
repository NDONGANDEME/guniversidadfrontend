import { sesiones } from "../../public/core/sesiones.js";
import { Alerta } from "../../public/utilidades/u_alertas.js";
import { u_utiles } from "../../public/utilidades/u_utiles.js";
import { u_formularioEstudiante } from "../utilidades/u_formularioEstudiante.js";
import { m_estudiante, m_familiar, m_beca, m_estudianteBeca } from "../modelo/m_estudiante.js";
import { m_sesion } from "../../public/modelo/m_sesion.js";
import { m_matricula, m_pago } from "../modelo/m_matricula.js";

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
    static paises = [
        "Guinea Ecuatorial", "España", "Argentina", "México", "Colombia", 
        "Perú", "Venezuela", "Chile", "Ecuador", "Cuba", "República Dominicana",
        "Guatemala", "Honduras", "Nicaragua", "El Salvador", "Costa Rica", 
        "Panamá", "Bolivia", "Paraguay", "Uruguay", "Brasil", "Portugal",
        "Francia", "Estados Unidos", "Canadá", "China", "Japón", "Corea del Sur"
    ];

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
            
            // Obtener usuario actual y permisos
            this.cargarUsuarioYPermisos();
            
            // Obtener ID del estudiante desde URL
            this.obtenerIdDesdeURL();
            
            // Configurar eventos
            this.configurarEventos();
            this.configurarSecciones();
            this.configurarCombos();
            this.configurarValidaciones();
            
            // Cargar datos según el modo
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
        // Mostrar formulario de edición vacío
        const edicionDiv = document.getElementById('seccionDatosPersonalesEdicion');
        const visualizacionDiv = document.getElementById('seccionDatosPersonalesVisualizacion');
        
        if (edicionDiv) edicionDiv.classList.remove('d-none');
        if (visualizacionDiv) visualizacionDiv.classList.add('d-none');
        
        // Ocultar botón editar
        const btnEditar = document.getElementById('btnEditarDatosPersonales');
        if (btnEditar) btnEditar.style.display = 'none';
        
        // Configurar título
        const titulo = document.getElementById('tituloPagina');
        if (titulo) titulo.textContent = 'Nuevo Estudiante';
        
        // Habilitar campos
        this.habilitarCamposFormulario(true);
        
        // Inicializar valores por defecto
        this.inicializarValoresPorDefecto();
    }

    /**
     * CONFIGURAR MODO EDICIÓN
     */
    static configurarModoEdicion() {
        // Mostrar formulario de edición
        const edicionDiv = document.getElementById('seccionDatosPersonalesEdicion');
        const visualizacionDiv = document.getElementById('seccionDatosPersonalesVisualizacion');
        
        if (edicionDiv) edicionDiv.classList.remove('d-none');
        if (visualizacionDiv) visualizacionDiv.classList.add('d-none');
        
        // Ocultar botón editar
        const btnEditar = document.getElementById('btnEditarDatosPersonales');
        if (btnEditar) btnEditar.style.display = 'none';
        
        // Configurar título
        const titulo = document.getElementById('tituloPagina');
        if (titulo) titulo.textContent = 'Editar Estudiante';
        
        // Habilitar campos
        this.habilitarCamposFormulario(true);
        
        // Mostrar botón nueva matrícula en edición si tiene permiso
        const btnNuevaMatricula = document.getElementById('btnVuevaMatricula');
        if (btnNuevaMatricula) {
            btnNuevaMatricula.style.display = this.permisos.insertarMatricula ? 'inline-flex' : 'none';
        }
    }

    /**
     * CONFIGURAR MODO VISUALIZACIÓN
     */
    static configurarModoVisualizacion() {
        // Mostrar vista de visualización
        const edicionDiv = document.getElementById('seccionDatosPersonalesEdicion');
        const visualizacionDiv = document.getElementById('seccionDatosPersonalesVisualizacion');
        
        if (edicionDiv) edicionDiv.classList.add('d-none');
        if (visualizacionDiv) visualizacionDiv.classList.remove('d-none');
        
        // Configurar título
        const titulo = document.getElementById('tituloPagina');
        if (titulo) titulo.textContent = 'Visualizar Estudiante';
        
        // Deshabilitar campos
        this.habilitarCamposFormulario(false);
        
        // Mostrar botón nueva matrícula en visualización si tiene permiso
        const btnNuevaMatricula = document.getElementById('btnVuevaMatricula');
        if (btnNuevaMatricula) {
            btnNuevaMatricula.style.display = this.permisos.insertarMatricula ? 'inline-flex' : 'none';
        }
    }

    /**
     * HABILITAR/DESHABILITAR CAMPOS DEL FORMULARIO
     */
    static habilitarCamposFormulario(habilitar) {
        const campos = document.querySelectorAll('#formEstudiante input, #formEstudiante select, #formEstudiante textarea');
        campos.forEach(campo => {
            campo.disabled = !habilitar;
        });
    }

    /**
     * INICIALIZAR VALORES POR DEFECTO
     */
    static inicializarValoresPorDefecto() {
        // Curso académico automático (año actual - año siguiente)
        const cursoAcademico = u_formularioEstudiante.generarCursoAcademico();
        const campoCurso = document.getElementById('cursoAcademicoMatricula');
        if (campoCurso) campoCurso.value = cursoAcademico;
        
        // Fecha actual para fecha de matrícula
        const fechaActual = new Date().toISOString().split('T')[0];
        const campoFechaMatricula = document.getElementById('fechaMatricula');
        if (campoFechaMatricula) campoFechaMatricula.value = fechaActual;
        
        // Fecha actual para fecha de pago
        const campoFechaPago = document.getElementById('fechaPagoEstudiante');
        if (campoFechaPago) campoFechaPago.value = fechaActual;
    }

    /**
     * CARGAR DATOS DEL ESTUDIANTE
     */
    static async cargarDatosEstudiante() {
        try {
            // Mostrar indicador de carga
            this.mostrarCarga(true);
            
            // Obtener datos del estudiante
            const estudiantes = await m_estudiante.obtenerEstudiantes();
            this.datosEstudiante = estudiantes.find(e => e.idEstudiante == this.idEstudiante);
            
            if (!this.datosEstudiante) {
                Alerta.error('Error', 'No se encontraron datos del estudiante');
                return;
            }
            
            // Obtener familiares
            this.datosFamiliares = await m_familiar.obtenerFamiliarPorEstudiante(this.idEstudiante) || [];
            
            // Obtener becas
            this.datosBecas = await m_estudianteBeca.obtenerEstudiantesBecasPorEstudiante(this.idEstudiante) || [];
            
            // Obtener matrículas del estudiante
            const todasMatriculas = await m_matricula.obtenerMatriculas() || [];
            this.datosMatriculas = todasMatriculas.filter(m => m.idEstudiante == this.idEstudiante);
            
            // Obtener pagos del estudiante (a través de matrículas)
            const todosPagos = await m_pago.obtenerPagos() || [];
            const idsMatriculas = this.datosMatriculas.map(m => m.idMatricula);
            this.datosPagos = todosPagos.filter(p => idsMatriculas.includes(p.idMatricula));
            
            // Configurar según modo
            if (this.modo === 'edicion') {
                this.configurarModoEdicion();
            } else {
                this.configurarModoVisualizacion();
            }
            
            // Llenar formularios
            this.llenarFormularioDatosPersonales();
            this.llenarFormularioFamiliares();
            this.llenarFormularioBecas();
            this.llenarFormularioMatricula();
            
            // Cargar centros y universidades
            await this.cargarCentrosYUniversidades();
            
            this.mostrarCarga(false);
            
        } catch (error) {
            console.error('Error cargando datos del estudiante:', error);
            Alerta.error('Error', 'No se pudieron cargar los datos del estudiante');
            this.mostrarCarga(false);
        }
    }

    /**
     * MOSTRAR/OCULTAR INDICADOR DE CARGA
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
     * LLENAR FORMULARIO DE DATOS PERSONALES
     */
    static llenarFormularioDatosPersonales() {
        if (!this.datosEstudiante) return;
        
        const d = this.datosEstudiante;
        
        // Datos generales
        const campoNombre = document.getElementById('nombreEstudianteMatricula');
        if (campoNombre) campoNombre.value = d.nombre || '';
        
        const campoApellidos = document.getElementById('apellidosEstudianteMatricula');
        if (campoApellidos) campoApellidos.value = d.apellidos || '';
        
        const campoDip = document.getElementById('dipEstudianteMatricula');
        if (campoDip) campoDip.value = d.dipEstudiante || '';
        
        const campoFecha = document.getElementById('fechaNacimientoEstudianteMatricula');
        if (campoFecha && d.fechaNacimiento) campoFecha.value = d.fechaNacimiento.split('T')[0];
        
        const campoNacionalidad = document.getElementById('nacionalidadEstudianteMatricula');
        if (campoNacionalidad) campoNacionalidad.value = d.nacionalidad || '';
        
        const campoGenero = document.getElementById('generosEstudianteMatricula');
        if (campoGenero) campoGenero.value = d.sexo || 'Ninguno';
        
        const campoDireccion = document.getElementById('direccionEstudianteMatricula');
        if (campoDireccion) campoDireccion.value = d.direccion || '';
        
        const campoLocalidad = document.getElementById('localidadEstudianteMatricula');
        if (campoLocalidad) campoLocalidad.value = d.localidad || '';
        
        const campoProvincia = document.getElementById('provinciaEstudianteMatricula');
        if (campoProvincia) campoProvincia.value = d.provincia || '';
        
        const campoCorreo = document.getElementById('correoEstudianteMatricula');
        if (campoCorreo) campoCorreo.value = d.correoEstudiante || '';
        
        const campoTelefono = document.getElementById('telefonoEstudianteMatricula');
        if (campoTelefono) campoTelefono.value = d.telefono || '';
        
        // País
        const campoPais = document.getElementById('comboPaisesEstudianteMatricula');
        if (campoPais && d.pais) campoPais.value = d.pais;
        
        // Centro y universidad de procedencia
        const campoCentro = document.getElementById('comboCentroEstudianteMatricula');
        if (campoCentro && d.centroProcedencia) campoCentro.value = d.centroProcedencia;
        
        const campoUniversidad = document.getElementById('comboUniversidadEstudianteMatricula');
        if (campoUniversidad && d.universidadProcedencia) campoUniversidad.value = d.universidadProcedencia;
        
        // Checkbox becario
        const checkBecario = document.getElementById('esBecario');
        if (checkBecario) checkBecario.checked = d.esBecado === 1 || d.esBecado === true;
        
        // Mostrar/ocultar sección de becario
        this.mostrarOcultarSeccionBecario();
        
        // Datos de sesión
        const campoUsuario = document.getElementById('nombreOCorreoUsuario');
        if (campoUsuario && d.usuario) campoUsuario.value = d.usuario.nombreUsuario || '';
        
        const campoRol = document.getElementById('rolUsuario');
        if (campoRol) campoRol.value = 'Estudiante';
        
        // Actualizar vista de visualización
        this.actualizarVistaVisualizacion();
    }

    /**
     * LLENAR FORMULARIO DE MATRÍCULA
     */
    static llenarFormularioMatricula() {
        if (!this.datosMatriculas || this.datosMatriculas.length === 0) {
            // Si no hay matrículas, mostrar campos vacíos
            const campoCurso = document.getElementById('cursoAcademicoMatricula');
            if (campoCurso) campoCurso.value = u_formularioEstudiante.generarCursoAcademico();
            
            const campoFecha = document.getElementById('fechaMatricula');
            if (campoFecha) campoFecha.value = new Date().toISOString().split('T')[0];
            return;
        }
        
        // Tomar la matrícula más reciente
        const matriculaReciente = this.datosMatriculas.sort((a, b) => 
            new Date(b.fechaMatricula) - new Date(a.fechaMatricula)
        )[0];
        
        const campoCurso = document.getElementById('cursoAcademicoMatricula');
        if (campoCurso) campoCurso.value = matriculaReciente.cursoAcademico || '';
        
        const campoFecha = document.getElementById('fechaMatricula');
        if (campoFecha && matriculaReciente.fechaMatricula) {
            campoFecha.value = matriculaReciente.fechaMatricula.split('T')[0];
        }
        
        const campoModalidad = document.getElementById('modalidadMatricula');
        if (campoModalidad) campoModalidad.value = matriculaReciente.modalidadMatricula || 'Ninguno';
        
        const campoCreditos = document.getElementById('creditosTotalesMatricula');
        if (campoCreditos) campoCreditos.value = matriculaReciente.totalCreditos || 0;
        
        const campoEstado = document.getElementById('estadosMatricula');
        if (campoEstado) campoEstado.value = matriculaReciente.estado || 'Ninguno';
        
        // Llenar datos de pago si existen
        if (this.datosPagos && this.datosPagos.length > 0) {
            const pagoReciente = this.datosPagos.sort((a, b) => 
                new Date(b.fechaPago) - new Date(a.fechaPago)
            )[0];
            
            const campoCuota = document.getElementById('cuotaEstudiante');
            if (campoCuota) campoCuota.value = pagoReciente.cuota || '';
            
            const campoMonto = document.getElementById('montoEstudiante');
            if (campoMonto) campoMonto.value = pagoReciente.monto || '';
            
            const campoFechaPago = document.getElementById('fechaPagoEstudiante');
            if (campoFechaPago && pagoReciente.fechaPago) {
                campoFechaPago.value = pagoReciente.fechaPago.split('T')[0];
            }
            
            // Buscar familiar responsable de pago
            if (pagoReciente.idFamiliar && this.datosFamiliares) {
                const familiarResponsable = this.datosFamiliares.find(f => f.idFamiliar == pagoReciente.idFamiliar);
                const campoResponsable = document.getElementById('responsablePagoEstudiante');
                if (campoResponsable && familiarResponsable) {
                    campoResponsable.value = `${familiarResponsable.nombre} ${familiarResponsable.apellidos}`;
                }
            }
        }
        
        // Actualizar vista de visualización de matrícula
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
                            <strong>Curso Académico: ${u_formularioEstudiante.escapeHTML(matricula.cursoAcademico)}</strong>
                        </div>
                        <div class="card-body">
                            <p><strong>Fecha Matrícula:</strong> ${u_formularioEstudiante.formatearFecha(matricula.fechaMatricula)}</p>
                            <p><strong>Modalidad:</strong> ${u_formularioEstudiante.escapeHTML(matricula.modalidadMatricula)}</p>
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
                                <p><strong>Fecha Pago:</strong> ${u_formularioEstudiante.formatearFecha(pagoAsociado.fechaPago)}</p>
                            ` : ''}
                        </div>
                    </div>
                </div>
            `;
        });
        html += '</div>';
        
        contenedor.innerHTML = html;
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
                            <p><strong>Nombre completo:</strong> ${u_formularioEstudiante.escapeHTML(d.nombre)} ${u_formularioEstudiante.escapeHTML(d.apellidos)}</p>
                            <p><strong>Código:</strong> ${u_formularioEstudiante.escapeHTML(d.codigoEstudiante || 'N/A')}</p>
                            <p><strong>DIP:</strong> ${u_formularioEstudiante.escapeHTML(d.dipEstudiante || 'N/A')}</p>
                            <p><strong>Fecha de nacimiento:</strong> ${u_formularioEstudiante.formatearFecha(d.fechaNacimiento)}</p>
                            <p><strong>Nacionalidad:</strong> ${u_formularioEstudiante.escapeHTML(d.nacionalidad || 'N/A')}</p>
                            <p><strong>Sexo:</strong> ${u_formularioEstudiante.escapeHTML(d.sexo || 'N/A')}</p>
                        </div>
                        <div class="col-md-6">
                            <p><strong>Dirección:</strong> ${u_formularioEstudiante.escapeHTML(d.direccion || 'N/A')}</p>
                            <p><strong>Localidad:</strong> ${u_formularioEstudiante.escapeHTML(d.localidad || 'N/A')}</p>
                            <p><strong>Provincia:</strong> ${u_formularioEstudiante.escapeHTML(d.provincia || 'N/A')}</p>
                            <p><strong>País:</strong> ${u_formularioEstudiante.escapeHTML(d.pais || 'N/A')}</p>
                            <p><strong>Correo:</strong> ${u_formularioEstudiante.escapeHTML(d.correoEstudiante || 'N/A')}</p>
                            <p><strong>Teléfono:</strong> ${u_formularioEstudiante.escapeHTML(d.telefono || 'N/A')}</p>
                        </div>
                    </div>
                    <hr>
                    <div class="row">
                        <div class="col-md-6">
                            <p><strong>Centro de procedencia:</strong> ${u_formularioEstudiante.escapeHTML(d.centroProcedencia || 'N/A')}</p>
                            <p><strong>Universidad de procedencia:</strong> ${u_formularioEstudiante.escapeHTML(d.universidadProcedencia || 'N/A')}</p>
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
            container.innerHTML = u_formularioEstudiante.crearBloqueFamiliar(0);
            return;
        }
        
        let html = '';
        this.datosFamiliares.forEach((familiar, index) => {
            html += u_formularioEstudiante.crearBloqueFamiliar(index, familiar);
        });
        
        container.innerHTML = html;
        this.configurarEventosFamiliares();
    }

    /**
     * LLENAR FORMULARIO DE BECAS
     */
    static llenarFormularioBecas() {
        const container = document.getElementById('contenedorBecas');
        if (!container) return;
        
        if (!this.datosBecas || this.datosBecas.length === 0) {
            container.innerHTML = u_formularioEstudiante.crearBloqueBeca(0);
            return;
        }
        
        let html = '';
        this.datosBecas.forEach((beca, index) => {
            html += u_formularioEstudiante.crearBloqueBeca(index, beca);
        });
        
        container.innerHTML = html;
        this.configurarEventosBecas();
    }

    /**
     * CARGAR CENTROS Y UNIVERSIDADES DE PROCEDENCIA
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
            
            // Configurar combo de centros
            u_formularioEstudiante.configurarComboConNuevo(
                'comboCentroEstudianteMatricula',
                'opcionesCentroEstudianteMatricula',
                this.centrosProcedencia,
                (nuevoCentro) => {
                    if (nuevoCentro && !this.centrosProcedencia.includes(nuevoCentro)) {
                        this.centrosProcedencia.push(nuevoCentro);
                    }
                }
            );
            
            // Configurar combo de universidades
            u_formularioEstudiante.configurarComboConNuevo(
                'comboUniversidadEstudianteMatricula',
                'opcionesUniversidadEstudianteMatricula',
                this.universidadesProcedencia,
                (nuevaUniversidad) => {
                    if (nuevaUniversidad && !this.universidadesProcedencia.includes(nuevaUniversidad)) {
                        this.universidadesProcedencia.push(nuevaUniversidad);
                    }
                }
            );
            
        } catch (error) {
            console.error('Error cargando centros y universidades:', error);
        }
    }

    /**
     * CONFIGURAR EVENTOS PRINCIPALES
     */
    static configurarEventos() {
        // Botones de secciones
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
            btnNuevaMatricula.addEventListener('click', () => {
                this.mostrarFormularioMatricula();
            });
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
        const checkBecario = document.getElementById('esBecario');
        if (checkBecario) {
            checkBecario.addEventListener('change', () => this.mostrarOcultarSeccionBecario());
        }
        
        // Botón añadir más contactos
        const btnAñadirContactos = document.getElementById('añadirContactos');
        if (btnAñadirContactos) {
            btnAñadirContactos.addEventListener('click', () => this.agregarBloqueFamiliar());
        }
        
        // Botón añadir más becas
        const btnAñadirBecas = document.getElementById('añadirBecas');
        if (btnAñadirBecas) {
            btnAñadirBecas.addEventListener('click', () => this.agregarBloqueBeca());
        }
    }

    /**
     * MOSTRAR FORMULARIO DE MATRÍCULA PARA NUEVA MATRÍCULA
     */
    static mostrarFormularioMatricula() {
        // Mostrar sección de matrícula en modo edición
        const edicionDiv = document.getElementById('seccionDatosMatriculaEdicion');
        const visualizacionDiv = document.getElementById('seccionDatosMatriculaVisualizacion');
        
        if (edicionDiv) edicionDiv.classList.remove('d-none');
        if (visualizacionDiv) visualizacionDiv.classList.add('d-none');
        
        // Limpiar formulario para nueva matrícula
        const campoCurso = document.getElementById('cursoAcademicoMatricula');
        if (campoCurso) campoCurso.value = u_formularioEstudiante.generarCursoAcademico();
        
        const campoFecha = document.getElementById('fechaMatricula');
        if (campoFecha) campoFecha.value = new Date().toISOString().split('T')[0];
        
        const campoModalidad = document.getElementById('modalidadMatricula');
        if (campoModalidad) campoModalidad.value = 'Ninguno';
        
        const campoCreditos = document.getElementById('creditosTotalesMatricula');
        if (campoCreditos) campoCreditos.value = 0;
        
        const campoEstado = document.getElementById('estadosMatricula');
        if (campoEstado) campoEstado.value = 'Ninguno';
        
        // Limpiar campos de pago
        const campoCuota = document.getElementById('cuotaEstudiante');
        if (campoCuota) campoCuota.value = '';
        
        const campoMonto = document.getElementById('montoEstudiante');
        if (campoMonto) campoMonto.value = '';
        
        const campoFechaPago = document.getElementById('fechaPagoEstudiante');
        if (campoFechaPago) campoFechaPago.value = new Date().toISOString().split('T')[0];
        
        const campoResponsable = document.getElementById('responsablePagoEstudiante');
        if (campoResponsable) campoResponsable.value = '';
        
        // Cambiar título de la sección
        const btnNuevaMatricula = document.getElementById('btnVuevaMatricula');
        if (btnNuevaMatricula) btnNuevaMatricula.style.display = 'none';
        
        // Mostrar botón cancelar matrícula
        const btnCancelarMatricula = document.createElement('button');
        btnCancelarMatricula.id = 'btnCancelarMatricula';
        btnCancelarMatricula.className = 'btn btn-sm btn-secondary me-1';
        btnCancelarMatricula.innerHTML = '<i class="fas fa-times me-2"></i> Cancelar Matrícula';
        btnCancelarMatricula.addEventListener('click', () => {
            this.cancelarNuevaMatricula();
        });
        
        const btnGuardarMatricula = document.getElementById('btnGuardarMatricula');
        if (btnGuardarMatricula && btnGuardarMatricula.parentNode) {
            btnGuardarMatricula.parentNode.insertBefore(btnCancelarMatricula, btnGuardarMatricula);
        }
    }

    /**
     * CANCELAR NUEVA MATRÍCULA
     */
    static cancelarNuevaMatricula() {
        // Volver a vista de visualización
        const edicionDiv = document.getElementById('seccionDatosMatriculaEdicion');
        const visualizacionDiv = document.getElementById('seccionDatosMatriculaVisualizacion');
        
        if (edicionDiv) edicionDiv.classList.add('d-none');
        if (visualizacionDiv) visualizacionDiv.classList.remove('d-none');
        
        // Mostrar botón nueva matrícula
        const btnNuevaMatricula = document.getElementById('btnVuevaMatricula');
        if (btnNuevaMatricula) btnNuevaMatricula.style.display = 'inline-flex';
        
        // Eliminar botón cancelar matrícula
        const btnCancelar = document.getElementById('btnCancelarMatricula');
        if (btnCancelar) btnCancelar.remove();
        
        // Recargar datos de matrícula
        this.llenarFormularioMatricula();
    }

    /**
     * GUARDAR MATRÍCULA
     */
    static async guardarMatricula() {
        if (!this.idEstudiante) {
            Alerta.error('Error', 'Primero debe guardar los datos del estudiante');
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
            
            // Validar campos requeridos
            if (!matriculaData.cursoAcademico || !matriculaData.fechaMatricula || 
                matriculaData.modalidadMatricula === 'Ninguno' || matriculaData.estado === 'Ninguno') {
                Alerta.notificarAdvertencia('Complete todos los campos requeridos de la matrícula', 2000);
                return;
            }
            
            const resultadoMatricula = await m_matricula.insertarMatricula(matriculaData);
            
            if (resultadoMatricula && resultadoMatricula.idMatricula) {
                // Guardar pago si hay datos
                const cuota = document.getElementById('cuotaEstudiante')?.value;
                const monto = document.getElementById('montoEstudiante')?.value;
                const fechaPago = document.getElementById('fechaPagoEstudiante')?.value;
                
                if (cuota && monto && fechaPago) {
                    const pagoData = {
                        idMatricula: resultadoMatricula.idMatricula,
                        idFamiliar: null, // Se puede buscar el familiar responsable
                        cuota: cuota,
                        monto: monto,
                        fechaPago: fechaPago
                    };
                    
                    await m_pago.insertarPago(pagoData);
                }
                
                Alerta.notificarExito('Matrícula guardada correctamente', 1500);
                
                // Recargar datos
                await this.cargarDatosEstudiante();
                
                // Volver a vista de visualización
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
     * CONFIGURAR SECCIONES
     */
    static configurarSecciones() {
        this.mostrarSeccion('datosPersonales');
    }

    /**
     * MOSTRAR SECCIÓN ESPECÍFICA
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
        this.seccionActiva = seccion;
    }

    /**
     * CONFIGURAR COMBOS
     */
    static configurarCombos() {
        // Configurar combo de países
        u_formularioEstudiante.configurarComboPaises(
            'comboPaisesEstudianteMatricula',
            'opcionesEstudianteMatricula',
            this.paises
        );
    }

    /**
     * CONFIGURAR VALIDACIONES
     */
    static configurarValidaciones() {
        u_formularioEstudiante.configurarValidaciones();
    }

    /**
     * MOSTRAR/OCULTAR SECCIÓN DE BECARIO
     */
    static mostrarOcultarSeccionBecario() {
        const checkBecario = document.getElementById('esBecario');
        const contBecario = document.getElementById('contDatosBecario');
        
        if (checkBecario && contBecario) {
            contBecario.style.display = checkBecario.checked ? 'block' : 'none';
        }
    }

    /**
     * AGREGAR BLOQUE FAMILIAR
     */
    static agregarBloqueFamiliar() {
        const container = document.getElementById('contenedorFamiliares');
        if (!container) return;
        
        const index = container.children.length;
        const nuevoBloque = u_formularioEstudiante.crearBloqueFamiliar(index);
        container.insertAdjacentHTML('beforeend', nuevoBloque);
        this.configurarEventosFamiliares();
    }

    /**
     * AGREGAR BLOQUE BECA
     */
    static agregarBloqueBeca() {
        const container = document.getElementById('contenedorBecas');
        if (!container) return;
        
        const index = container.children.length;
        const nuevoBloque = u_formularioEstudiante.crearBloqueBeca(index);
        container.insertAdjacentHTML('beforeend', nuevoBloque);
        this.configurarEventosBecas();
    }

    /**
     * CONFIGURAR EVENTOS DE FAMILIARES
     */
    static configurarEventosFamiliares() {
        document.querySelectorAll('.btn-eliminar-familiar').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.target.closest('.familiar-bloque')?.remove();
            });
        });
    }

    /**
     * CONFIGURAR EVENTOS DE BECAS
     */
    static configurarEventosBecas() {
        document.querySelectorAll('.btn-eliminar-beca').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.target.closest('.beca-bloque')?.remove();
            });
        });
    }

    /**
     * GUARDAR ESTUDIANTE
     */
    static async guardarEstudiante() {
        if (this.modo === 'visualizacion') return;
        
        if (!this.validarFormulario()) return;
        
        try {
            const formData = new FormData();
            
            formData.append('nombre', document.getElementById('nombreEstudianteMatricula').value);
            formData.append('apellidos', document.getElementById('apellidosEstudianteMatricula').value);
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
            formData.append('esBecado', document.getElementById('esBecario').checked ? 1 : 0);
            formData.append('nombreUsuario', document.getElementById('nombreOCorreoUsuario').value);
            formData.append('rol', 'Estudiante');
            
            if (this.modo === 'edicion' && this.idEstudiante) {
                formData.append('idEstudiante', this.idEstudiante);
                const resultado = await m_estudiante.actualizarEstudiante(formData);
                if (resultado) {
                    Alerta.notificarExito('Estudiante actualizado correctamente', 1500);
                    window.location.href = `formularioEstudiante.html?id=${this.idEstudiante}&modo=visualizacion`;
                }
            } else {
                const resultado = await m_estudiante.insertarEstudiante(formData);
                if (resultado && resultado.idEstudiante) {
                    // Guardar matrícula inicial si se proporcionaron datos
                    const cursoAcademico = document.getElementById('cursoAcademicoMatricula')?.value;
                    const fechaMatricula = document.getElementById('fechaMatricula')?.value;
                    
                    if (cursoAcademico && fechaMatricula) {
                        const matriculaData = {
                            idEstudiante: resultado.idEstudiante,
                            cursoAcademico: cursoAcademico,
                            fechaMatricula: fechaMatricula,
                            modalidadMatricula: document.getElementById('modalidadMatricula')?.value || 'Tiempo completo',
                            totalCreditos: document.getElementById('creditosTotalesMatricula')?.value || 0,
                            estado: 'Incompleto'
                        };
                        
                        const resultadoMatricula = await m_matricula.insertarMatricula(matriculaData);
                        
                        // Guardar pago si hay datos
                        const cuota = document.getElementById('cuotaEstudiante')?.value;
                        const monto = document.getElementById('montoEstudiante')?.value;
                        const fechaPago = document.getElementById('fechaPagoEstudiante')?.value;
                        
                        if (resultadoMatricula && resultadoMatricula.idMatricula && cuota && monto && fechaPago) {
                            const pagoData = {
                                idMatricula: resultadoMatricula.idMatricula,
                                cuota: cuota,
                                monto: monto,
                                fechaPago: fechaPago
                            };
                            await m_pago.insertarPago(pagoData);
                        }
                    }
                    
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
     * VALIDAR FORMULARIO
     */
    static validarFormulario() {
        const camposRequeridos = [
            'nombreEstudianteMatricula',
            'apellidosEstudianteMatricula',
            'dipEstudianteMatricula',
            'fechaNacimientoEstudianteMatricula',
            'nacionalidadEstudianteMatricula',
            'generosEstudianteMatricula',
            'direccionEstudianteMatricula',
            'localidadEstudianteMatricula',
            'provinciaEstudianteMatricula',
            'correoEstudianteMatricula',
            'telefonoEstudianteMatricula'
        ];
        
        for (const campo of camposRequeridos) {
            const elemento = document.getElementById(campo);
            if (elemento && !elemento.value.trim()) {
                Alerta.notificarAdvertencia(`El campo ${elemento.labels?.[0]?.textContent || campo} es requerido`, 2000);
                elemento.focus();
                return false;
            }
        }
        
        return true;
    }
}

// ========== INICIALIZAR ==========
$(document).ready(async function() {
    await c_formularioEstudiante.iniciar();
});