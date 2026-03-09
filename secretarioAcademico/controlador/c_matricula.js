import { sesiones } from "../../public/core/sesiones.js";
import { m_estudiante } from "../modelo/m_estudiante.js";
import { m_familiar } from "../modelo/m_familiar.js";
import { m_beca } from "../modelo/m_beca.js";
import { m_estudianteBeca } from "../modelo/m_estudianteBeca.js";
import { m_pago } from "../modelo/m_pago.js";
import { m_planEstudio } from "../modelo/m_planEstudio.js";
import { m_usuario } from "../../public/modelo/m_usuario.js";
import { Alerta } from "../../public/utilidades/u_alertas.js";
import { u_utiles } from "../../public/utilidades/u_utiles.js";
import { u_matricula } from "../utilidades/u_matricula.js";
import { m_semestre } from "../../admin/modelo/m_semestre.js";
import { m_matricula } from "../modelo/m_matricula.js";

export class c_matricula {
    constructor() {
        this.matriculas = [];
        this.estudiantes = [];
        this.familiares = [];
        this.becas = [];
        this.planesEstudio = [];
        this.semestres = [];
        this.dataTable = null;
        this.contadorContactos = 1;
        this.contadorBecas = 1;
        this.modoEdicion = false;
        this.matriculaActual = null;
    }

    async inicializar() {
        try {
            sesiones.verificarExistenciaSesion();
            
            await u_utiles.cargarArchivosImportadosHTML('modalCerrarSesion', '.importandoModalCierreSesion');
            await u_utiles.cargarArchivosImportadosHTML('topBar', '.importandoTopBar');
            u_utiles.botonesNavegacionSecretario();
            
            this.inicializarDataTable();
            await this.cargarDatos();
            
            this.configurarEventos();
            u_matricula.configurarValidaciones();
            u_matricula.configurarSubidaImagen();
            u_matricula.cargarPaises();
            
            this.configurarCursoAcademico();
            
        } catch (error) {
            console.error('Error en inicialización:', error);
            Alerta.error('Error', 'No se pudo inicializar el módulo');
        }
    }

    inicializarDataTable() {
        if ($.fn.dataTable.isDataTable('#tablaMatriculas')) {
            $('#tablaMatriculas').DataTable().destroy();
        }
        this.dataTable = $('#tablaMatriculas').DataTable({
            language: { url: '/guniversidadfrontend/public/nomodules/dataTable/dataTable_es-ES.json' },
            columnDefs: [{ orderable: false, targets: [6] }]
        });
    }

    async cargarDatos() {
        try {
            const [matriculas, estudiantes, planes, semestres, becas, familiares] = await Promise.all([
                m_matricula.obtenerMatriculas().catch(() => []),
                m_estudiante.obtenerEstudiantes().catch(() => []),
                m_planEstudio.obtenerPlanesEstudios().catch(() => []),
                m_semestre.obtenerSemestres().catch(() => []),
                m_beca.obtenerBecas().catch(() => []),
                m_familiar.obtenerFamiliares().catch(() => [])
            ]);
            
            this.matriculas = matriculas || [];
            this.estudiantes = estudiantes || [];
            this.planesEstudio = planes || [];
            this.semestres = semestres || [];
            this.becas = becas || [];
            this.familiares = familiares || [];
            
            this.actualizarTabla();
            
            u_matricula.cargarPlanesEstudio(this.planesEstudio);
            u_matricula.cargarSemestres(this.semestres);
            u_matricula.cargarBecas(this.becas);
            
            u_matricula.configurarComboPlanes();
            
        } catch (error) {
            console.error('Error cargando datos:', error);
            Alerta.notificarError('Error al cargar datos', 1500);
        }
    }

    actualizarTabla() {
        if (!this.dataTable) return;
        
        this.dataTable.clear();
        
        this.matriculas.forEach(m => {
            const estudiante = this.estudiantes.find(e => e.idEstudiante == m.idEstudiante);
            const nombre = estudiante ? `${estudiante.nombre || ''} ${estudiante.apellidos || ''}` : 'Desconocido';
            
            this.dataTable.row.add([
                nombre,
                m.cursoAcademico || '',
                this.formatearFecha(m.fechaMatricula) || '',
                m.modalidadMatricula || '',
                m.totalCreditos || '',
                m.estado || '',
                this.generarBotones(m.idMatricula)
            ]).draw();
        });
    }

    formatearFecha(fecha) {
        if (!fecha) return '';
        const f = new Date(fecha);
        return f.toLocaleDateString('es-ES');
    }

    generarBotones(id) {
        return `
            <div class="d-flex gap-1 justify-content-center">
                <button class="btn btn-sm btn-outline-success nuevaMatricula" data-id="${id}" data-bs-toggle="modal" data-bs-target="#modalNuevaMatriculaRealizar" title="Nueva matrícula">
                    <i class="fas fa-plus"></i>
                </button>
                <button class="btn btn-sm btn-outline-info verDetalles" data-id="${id}" data-bs-toggle="modal" data-bs-target="#modalVerDetallesMatricula" title="Ver detalles">
                    <i class="fas fa-eye"></i>
                </button>
                <button class="btn btn-sm btn-outline-warning editar" data-id="${id}" data-bs-toggle="modal" data-bs-target="#modalNuevaMatricula" title="Editar">
                    <i class="fas fa-edit"></i>
                </button>
            </div>
        `;
    }

    configurarCursoAcademico() {
        const año = new Date().getFullYear();
        const curso = `${año}/${año + 1}`;
        $('#cursoAcademicoMatricula').val(curso);
        $('#modalNuevaMatriculaRealizar #cursoAcademicoMatricula').val(curso);
    }

    configurarEventos() {
        $('.nueva[data-bs-target="#modalNuevaMatricula"]').on('click', () => {
            this.modoEdicion = false;
            this.matriculaActual = null;
            u_matricula.limpiarModal('#modalNuevaMatricula');
            u_matricula.mostrarSeccion(1);
            this.resetearContadores();
        });

        $(document).on('click', '.nuevaMatricula', (e) => {
            const idMatricula = $(e.currentTarget).data('id');
            this.prepararNuevaMatriculaExistente(idMatricula);
        });

        $('#siguiente').on('click', () => this.siguienteSeccion());
        $('#anterior').on('click', () => this.anteriorSeccion());

        $('#btnGuardarMatricula').on('click', () => this.guardarMatricula());

        $('#modalNuevaMatriculaRealizar #btnGuardarMatricula').on('click', () => this.guardarMatriculaExistente());

        $('#añadirContactos').on('click', () => this.añadirContacto());

        $('#añadirBecas').on('click', () => this.añadirBeca());

        $('#esBecario').on('change', function() {
            if ($(this).is(':checked')) {
                $('#contDatosBecario').removeClass('d-none');
            } else {
                $('#contDatosBecario').addClass('d-none');
                u_matricula.limpiarCamposBeca();
            }
        });

        $('#generarContraseña').on('change', function() {
            if ($(this).is(':checked')) {
                u_matricula.generarContrasena();
            } else {
                $('#formMatricula').removeData('contrasena-generada');
            }
        });

        u_matricula.configurarComboCentros(() => {
            const centro = prompt('Ingrese el nuevo centro de procedencia:');
            if (centro) {
                $('#comboCentroEstudianteMatricula').val(centro);
            }
        });

        u_matricula.configurarComboUniversidades(() => {
            const universidad = prompt('Ingrese la nueva universidad:');
            if (universidad) {
                $('#comboUniversidadEstudianteMatricula').val(universidad);
            }
        });

        $('#comboPlanEstudioMatricula').on('change', () => {
            this.cargarSemestresPorPlan();
        });

        $('#semestresMatricula').on('change', () => {
            this.calcularCreditos();
        });

        $('#filtroPorModalidadMatricula, #filtroPorEstadoMatricula').on('change', () => this.aplicarFiltros());

        $('#imprimirComprobantePago').on('click', () => {
            window.location.href = 'comprobanteMatricula.html';
        });

        $(document).on('click', '.verDetalles', (e) => {
            this.verDetalles($(e.currentTarget).data('id'));
        });

        $(document).on('click', '.editar', (e) => {
            this.editarMatricula($(e.currentTarget).data('id'));
        });

        $(document).on('click', '.eliminar-contacto', function() {
            $(this).closest('.contacto-adicional').remove();
        });
        
        $(document).on('click', '.eliminar-beca', function() {
            $(this).closest('.beca-adicional').remove();
        });

        $('#modalNuevaMatricula').on('hidden.bs.modal', () => {
            if (!this.modoEdicion) {
                u_matricula.limpiarModal('#modalNuevaMatricula');
                this.resetearContadores();
            }
        });

        $('#modalNuevaMatriculaRealizar').on('hidden.bs.modal', () => {
            u_matricula.limpiarModal('#modalNuevaMatriculaRealizar');
        });
    }

    prepararNuevaMatriculaExistente(idMatricula) {
        this.modoEdicion = false;
        this.matriculaActual = null;
        u_matricula.limpiarModal('#modalNuevaMatriculaRealizar');
        
        if (idMatricula && idMatricula !== 'idMatricula') {
            const matricula = this.matriculas.find(m => m.idMatricula == idMatricula);
            if (matricula) {
                const estudiante = this.estudiantes.find(e => e.idEstudiante == matricula.idEstudiante);
                if (estudiante) {
                    $('#responsablePagoEstudiante').val(`${estudiante.nombre} ${estudiante.apellidos}`);
                    $('#modalNuevaMatriculaRealizar').data('id-estudiante', estudiante.idEstudiante);
                }
            }
        }
        
        this.configurarCursoAcademico();
    }

    siguienteSeccion() {
        const seccion = $('.seccion:visible').attr('id');
        const num = parseInt(seccion.replace('seccion', ''));
        
        if (num === 1 && !u_matricula.validarSeccion1()) {
            Alerta.notificarAdvertencia('Complete correctamente la sección 1', 1500);
            return;
        }
        if (num === 2 && !u_matricula.validarSeccion2($('#esBecario').is(':checked'))) {
            Alerta.notificarAdvertencia('Complete correctamente la sección 2', 1500);
            return;
        }
        
        u_matricula.ocultarSeccion(num);
        u_matricula.mostrarSeccion(num + 1);
    }

    anteriorSeccion() {
        const seccion = $('.seccion:visible').attr('id');
        const num = parseInt(seccion.replace('seccion', ''));
        u_matricula.ocultarSeccion(num);
        u_matricula.mostrarSeccion(num - 1);
    }

    resetearContadores() {
        this.contadorContactos = 1;
        this.contadorBecas = 1;
        $('.contacto-adicional, .beca-adicional').remove();
        $('#contactosAdicionales, #becasAdicionales').remove();
    }

    añadirContacto() {
        this.contadorContactos++;
        const html = u_matricula.generarCamposContacto(this.contadorContactos);
        
        if ($('#contactosAdicionales').length === 0) {
            $('#nombreEstudianteFamiliar').closest('.row').parent().append('<div id="contactosAdicionales"></div>');
        }
        
        $('#contactosAdicionales').append(html);
        u_matricula.configurarValidacionesContacto(this.contadorContactos);
    }

    añadirBeca() {
        if (!$('#esBecario').is(':checked')) {
            Alerta.notificarAdvertencia('Marque "El estudiante es becario" primero', 1500);
            return;
        }
        
        this.contadorBecas++;
        const html = u_matricula.generarCamposBeca(this.contadorBecas, this.becas);
        
        if ($('#becasAdicionales').length === 0) {
            $('#contDatosBecario').append('<div id="becasAdicionales"></div>');
        }
        
        $('#becasAdicionales').append(html);
        u_matricula.configurarValidacionesBeca(this.contadorBecas);
    }

    cargarSemestresPorPlan() {
        const idPlan = u_matricula.getIdPlanSeleccionado();
        if (idPlan && idPlan !== 'Ninguno') {
            u_matricula.cargarSemestres(this.semestres);
        }
    }

    calcularCreditos() {
        const idSemestre = $('#semestresMatricula').val();
        if (idSemestre && idSemestre !== 'Ninguno') {
            $('#creditosTotalesMatricula').val(30);
        } else {
            $('#creditosTotalesMatricula').val('');
        }
    }

    async guardarMatricula() {
        if (!u_matricula.validarSeccion1() || 
            !u_matricula.validarSeccion2($('#esBecario').is(':checked')) || 
            !u_matricula.validarSeccion3()) {
            Alerta.notificarAdvertencia('Complete todos los campos correctamente', 1500);
            return;
        }

        try {
            let idUsuario = null;
            if ($('#nombreOCorreoUsuario').val()) {
                idUsuario = await this.crearUsuario();
                if (!idUsuario) return;
            }

            const idEstudiante = await this.crearEstudiante(idUsuario);
            if (!idEstudiante) return;

            await this.crearFamiliares(idEstudiante);

            const idMatricula = await this.crearMatricula(idEstudiante);
            if (!idMatricula) return;

            if ($('#esBecario').is(':checked')) {
                await this.crearBecas(idEstudiante);
            }

            await this.crearPago(idMatricula);

            await this.cargarDatos();
            $('#modalNuevaMatricula').modal('hide');

            Alerta.exito('Éxito', 'Matrícula creada correctamente');

        } catch (error) {
            console.error('Error al guardar:', error);
            Alerta.error('Error', `No se pudo guardar: ${error.message}`);
        }
    }

    async guardarMatriculaExistente() {
        if (!u_matricula.validarFormularioExistente()) {
            Alerta.notificarAdvertencia('Complete todos los campos correctamente', 1500);
            return;
        }

        try {
            const idEstudiante = $('#modalNuevaMatriculaRealizar').data('id-estudiante');
            if (!idEstudiante) {
                Alerta.error('Error', 'No se ha seleccionado un estudiante');
                return;
            }

            const idMatricula = await this.crearMatricula(idEstudiante);
            if (!idMatricula) return;

            await this.cargarDatos();
            $('#modalNuevaMatriculaRealizar').modal('hide');

            Alerta.exito('Éxito', 'Nueva matrícula creada para el estudiante');

        } catch (error) {
            console.error('Error al guardar:', error);
            Alerta.error('Error', `No se pudo guardar: ${error.message}`);
        }
    }

    async crearUsuario() {
        const formData = new FormData();
        const valor = $('#nombreOCorreoUsuario').val();
        const esCorreo = valor.includes('@');
        
        formData.append('nombreUsuario', esCorreo ? valor.split('@')[0] : valor);
        formData.append('correo', esCorreo ? valor : `${valor}@sistema.com`);
        formData.append('rol', $('#rolUsuario').val());
        formData.append('estado', 'activo');
        
        const pass = u_matricula.obtenerContrasenaGenerada();
        if (pass) formData.append('contrasena', pass);
        
        const img = u_matricula.obtenerImagenParaSubir();
        if (img) formData.append('foto', img);
        
        const res = await m_usuario.insertarUsuario(formData);
        return res?.idUsuario || res;
    }

    async crearEstudiante(idUsuario) {
        const formData = new FormData();
        if (idUsuario) formData.append('idUsuario', idUsuario);
        
        formData.append('nombre', $('#nombreEstudianteMatricula').val().trim());
        formData.append('apellidos', $('#apellidosEstudianteMatricula').val().trim());
        formData.append('dipEstudiante', $('#dipEstudianteMatricula').val().trim());
        formData.append('fechaNacimiento', $('#fechaNacimientoEstudianteMatricula').val());
        formData.append('sexo', $('#generosEstudianteMatricula').val());
        formData.append('nacionalidad', $('#nacionalidadEstudianteMatricula').val().trim());
        formData.append('direccion', $('#direccionEstudianteMatricula').val().trim());
        formData.append('localidad', $('#localidadEstudianteMatricula').val().trim());
        formData.append('provincia', $('#provinciaEstudianteMatricula').val().trim());
        formData.append('pais', $('#comboPaisesEstudianteMatricula').val());
        formData.append('correoEstudiante', $('#correoEstudianteMatricula').val().trim());
        formData.append('telefono', $('#telefonoEstudianteMatricula').val().trim());
        formData.append('centroProcedencia', $('#comboCentroEstudianteMatricula').val() || 'Ninguno');
        formData.append('universidadProcedencia', $('#comboUniversidadEstudianteMatricula').val() || 'Ninguno');
        formData.append('esBecado', $('#esBecario').is(':checked') ? 'Sí' : 'No');
        formData.append('codigoEstudiante', `EST-${Math.floor(Math.random()*10000)}`);
        
        const res = await m_estudiante.insertarEstudiante(formData);
        return res?.idEstudiante || res;
    }

    async crearFamiliares(idEstudiante) {
        const principal = new FormData();
        principal.append('idEstudiante', idEstudiante);
        principal.append('nombre', $('#nombreEstudianteFamiliar').val().trim());
        principal.append('apellidos', $('#apellidosEstudianteFamiliar').val().trim());
        principal.append('dipFamiliar', $('#dipEstudianteFamiliar').val().trim());
        principal.append('direccion', $('#direccionEstudianteFamiliar').val().trim());
        principal.append('correoFamiliar', $('#correoEstudianteFamiliar').val().trim());
        principal.append('telefono', $('#telefonoEstudianteFamiliar').val().trim());
        principal.append('parentesco', $('#parentezcoEstudianteFamiliar').val().trim());
        principal.append('esContactoIncidentes', $('#contactoIncidenteEstudianteFamiliar').val());
        principal.append('esResponsablePago', $('#responsablePagoEstudianteFamiliar').val());
        
        await m_familiar.insertarFamiliar(principal);

        for (let i = 2; i <= this.contadorContactos; i++) {
            if ($(`#nombreEstudianteFamiliar${i}`).length) {
                const adicional = new FormData();
                adicional.append('idEstudiante', idEstudiante);
                adicional.append('nombre', $(`#nombreEstudianteFamiliar${i}`).val().trim());
                adicional.append('apellidos', $(`#apellidosEstudianteFamiliar${i}`).val().trim());
                adicional.append('dipFamiliar', $(`#dipEstudianteFamiliar${i}`).val().trim());
                adicional.append('direccion', $(`#direccionEstudianteFamiliar${i}`).val().trim());
                adicional.append('correoFamiliar', $(`#correoEstudianteFamiliar${i}`).val().trim());
                adicional.append('telefono', $(`#telefonoEstudianteFamiliar${i}`).val().trim());
                adicional.append('parentesco', $(`#parentezcoEstudianteFamiliar${i}`).val().trim());
                adicional.append('esContactoIncidentes', $(`#contactoIncidenteEstudianteFamiliar${i}`).val());
                adicional.append('esResponsablePago', $(`#responsablePagoEstudianteFamiliar${i}`).val());
                
                await m_familiar.insertarFamiliar(adicional);
            }
        }
    }

    async crearMatricula(idEstudiante) {
        const formData = new FormData();
        formData.append('idEstudiante', idEstudiante);
        
        const idPlan = u_matricula.getIdPlanSeleccionado();
        formData.append('idPlanEstudio', idPlan);
        formData.append('idSemestre', $('#semestresMatricula').val());
        formData.append('cursoAcademico', $('#cursoAcademicoMatricula').val().trim());
        formData.append('fechaMatricula', $('#fechaMatricula').val());
        formData.append('modalidadMatricula', $('#modalidadMatricula').val());
        formData.append('totalCreditos', $('#creditosTotalesMatricula').val());
        formData.append('estado', $('#estadosMatricula').val());
        
        const res = await m_matricula.insertarMatricula(formData);
        return res?.idMatricula || res;
    }

    async crearBecas(idEstudiante) {
        const principal = new FormData();
        principal.append('idEstudiante', idEstudiante);
        principal.append('idBeca', $('#comboNombreInstitucionBeca').val());
        principal.append('fechaInicio', $('#fechaInicioBeca').val());
        principal.append('fechaFinal', $('#fechaFinBeca').val());
        principal.append('estado', $('#estadosBeca').val());
        principal.append('observaciones', $('#observacionesBeca').val().trim());
        
        await m_estudianteBeca.insertarEstudiante(principal);

        for (let i = 2; i <= this.contadorBecas; i++) {
            if ($(`#comboNombreInstitucionBeca${i}`).length) {
                const adicional = new FormData();
                adicional.append('idEstudiante', idEstudiante);
                adicional.append('idBeca', $(`#comboNombreInstitucionBeca${i}`).val());
                adicional.append('fechaInicio', $(`#fechaInicioBeca${i}`).val());
                adicional.append('fechaFinal', $(`#fechaFinBeca${i}`).val());
                adicional.append('estado', $(`#estadosBeca${i}`).val());
                adicional.append('observaciones', $(`#observacionesBeca${i}`).val().trim());
                
                await m_estudianteBeca.insertarEstudiante(adicional);
            }
        }
    }

    async crearPago(idMatricula) {
        const formData = new FormData();
        formData.append('idMatricula', idMatricula);
        
        const responsable = this.familiares.find(f => f.esResponsablePago === 'Sí');
        if (responsable) {
            formData.append('idFamiliar', responsable.idFamiliar);
        }
        
        formData.append('cuota', $('#cuotaEstudiante').val());
        formData.append('monto', $('#montoEstudiante').val());
        formData.append('fechaPago', $('#fechaPagoEstudiante').val());
        
        await m_pago.insertarPago(formData);
    }

    verDetalles(id) {
        const matricula = this.matriculas.find(m => m.idMatricula == id);
        if (!matricula) return;
        
        const estudiante = this.estudiantes.find(e => e.idEstudiante == matricula.idEstudiante);
        const plan = this.planesEstudio.find(p => p.idPlanEstudio == matricula.idPlanEstudio);
        const familiar = this.familiares.find(f => f.idEstudiante == matricula.idEstudiante && f.esResponsablePago === 'Sí');
        
        const html = `
            <div class="container-fluid">
                <div class="row mb-4">
                    <div class="col-12">
                        <h5 class="bg-warning p-2 rounded text-white">Datos del Estudiante</h5>
                    </div>
                    <div class="col-md-6">
                        <p><strong>Nombre completo:</strong> ${estudiante?.nombre || ''} ${estudiante?.apellidos || ''}</p>
                        <p><strong>DIP:</strong> ${estudiante?.dipEstudiante || ''}</p>
                        <p><strong>Código:</strong> ${estudiante?.codigoEstudiante || ''}</p>
                    </div>
                    <div class="col-md-6">
                        <p><strong>Fecha nacimiento:</strong> ${this.formatearFecha(estudiante?.fechaNacimiento)}</p>
                        <p><strong>Nacionalidad:</strong> ${estudiante?.nacionalidad || ''}</p>
                        <p><strong>Sexo:</strong> ${estudiante?.sexo || ''}</p>
                    </div>
                </div>
                
                <div class="row mb-4">
                    <div class="col-12">
                        <h5 class="bg-warning p-2 rounded text-white">Datos de Contacto</h5>
                    </div>
                    <div class="col-md-6">
                        <p><strong>Correo:</strong> ${estudiante?.correoEstudiante || ''}</p>
                        <p><strong>Teléfono:</strong> ${estudiante?.telefono || ''}</p>
                    </div>
                    <div class="col-md-6">
                        <p><strong>Dirección:</strong> ${estudiante?.direccion || ''}</p>
                        <p><strong>Localidad/Provincia:</strong> ${estudiante?.localidad || ''}, ${estudiante?.provincia || ''}</p>
                        <p><strong>País:</strong> ${estudiante?.pais || ''}</p>
                    </div>
                </div>
                
                <div class="row mb-4">
                    <div class="col-12">
                        <h5 class="bg-warning p-2 rounded text-white">Datos de Matrícula</h5>
                    </div>
                    <div class="col-md-6">
                        <p><strong>Curso académico:</strong> ${matricula.cursoAcademico || ''}</p>
                        <p><strong>Fecha matrícula:</strong> ${this.formatearFecha(matricula.fechaMatricula)}</p>
                        <p><strong>Modalidad:</strong> ${matricula.modalidadMatricula || ''}</p>
                    </div>
                    <div class="col-md-6">
                        <p><strong>Plan de estudio:</strong> ${plan?.nombre || ''}</p>
                        <p><strong>Créditos totales:</strong> ${matricula.totalCreditos || ''}</p>
                        <p><strong>Estado:</strong> ${matricula.estado || ''}</p>
                    </div>
                </div>
                
                ${familiar ? `
                <div class="row mb-4">
                    <div class="col-12">
                        <h5 class="bg-warning p-2 rounded text-white">Responsable de Pago</h5>
                    </div>
                    <div class="col-md-6">
                        <p><strong>Nombre:</strong> ${familiar.nombre} ${familiar.apellidos}</p>
                        <p><strong>Parentesco:</strong> ${familiar.parentesco}</p>
                    </div>
                    <div class="col-md-6">
                        <p><strong>Teléfono:</strong> ${familiar.telefono}</p>
                        <p><strong>Correo:</strong> ${familiar.correoFamiliar}</p>
                    </div>
                </div>
                ` : ''}
            </div>
        `;
        
        $('#modalVerDetallesMatricula .card-body').html(html);
        $('#modalVerDetallesMatricula').modal('show');
    }

    editarMatricula(id) {
        const matricula = this.matriculas.find(m => m.idMatricula == id);
        if (!matricula) return;
        
        const estudiante = this.estudiantes.find(e => e.idEstudiante == matricula.idEstudiante);
        if (!estudiante) return;
        
        this.modoEdicion = true;
        this.matriculaActual = matricula;
        
        u_matricula.limpiarModal('#modalNuevaMatricula');
        
        $('#nombreEstudianteMatricula').val(estudiante.nombre || '');
        $('#apellidosEstudianteMatricula').val(estudiante.apellidos || '');
        $('#dipEstudianteMatricula').val(estudiante.dipEstudiante || '');
        $('#fechaNacimientoEstudianteMatricula').val(estudiante.fechaNacimiento || '');
        $('#nacionalidadEstudianteMatricula').val(estudiante.nacionalidad || '');
        $('#generosEstudianteMatricula').val(estudiante.sexo || 'Ninguno');
        $('#direccionEstudianteMatricula').val(estudiante.direccion || '');
        $('#localidadEstudianteMatricula').val(estudiante.localidad || '');
        $('#provinciaEstudianteMatricula').val(estudiante.provincia || '');
        $('#comboPaisesEstudianteMatricula').val(estudiante.pais || '');
        $('#correoEstudianteMatricula').val(estudiante.correoEstudiante || '');
        $('#telefonoEstudianteMatricula').val(estudiante.telefono || '');
        $('#comboCentroEstudianteMatricula').val(estudiante.centroProcedencia || '');
        $('#comboUniversidadEstudianteMatricula').val(estudiante.universidadProcedencia || '');
        
        if (estudiante.esBecado === 'Sí') {
            $('#esBecario').prop('checked', true).trigger('change');
        }
        
        $('#cursoAcademicoMatricula').val(matricula.cursoAcademico || '');
        $('#fechaMatricula').val(matricula.fechaMatricula || '');
        $('#modalidadMatricula').val(matricula.modalidadMatricula || 'Ninguno');
        $('#semestresMatricula').val(matricula.idSemestre || 'Ninguno');
        $('#creditosTotalesMatricula').val(matricula.totalCreditos || '');
        $('#estadosMatricula').val(matricula.estado || 'Ninguno');
        
        const plan = this.planesEstudio.find(p => p.idPlanEstudio == matricula.idPlanEstudio);
        if (plan) {
            $('#comboPlanEstudioMatricula').val(plan.nombre || plan.nombrePlan || '');
            $('#comboPlanEstudioMatricula').data('id-plan', plan.idPlanEstudio);
        }
        
        $('#nombreEstudianteMatricula, #apellidosEstudianteMatricula').trigger('input');
        $('#dipEstudianteMatricula, #correoEstudianteMatricula, #telefonoEstudianteMatricula').trigger('input');
        
        u_matricula.mostrarSeccion(1);
    }

    aplicarFiltros() {
        const modalidad = $('#filtroPorModalidadMatricula').val();
        const estado = $('#filtroPorEstadoMatricula').val();
        
        this.dataTable.search('').columns().search('').draw();
        
        if (modalidad !== 'Ninguno' || estado !== 'Ninguno') {
            $.fn.dataTable.ext.search.push((settings, data) => {
                const modalidadMatricula = data[3];
                const estadoMatricula = data[5];
                
                if (modalidad !== 'Ninguno' && modalidadMatricula !== modalidad) return false;
                if (estado !== 'Ninguno' && estadoMatricula !== estado) return false;
                
                return true;
            });
            
            this.dataTable.draw();
            $.fn.dataTable.ext.search.pop();
        }
    }
}

$(document).ready(async function() {
    const controlador = new c_matricula();
    await controlador.inicializar();
});