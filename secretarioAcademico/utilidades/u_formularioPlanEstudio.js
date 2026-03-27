import { u_verificaciones } from "../../public/utilidades/u_verificaciones.js";
import { u_utiles } from "../../public/utilidades/u_utiles.js";
import { u_estudiante } from "./u_estudiante.js";

/**
 * Utilidades específicas para el formulario de estudiantes
 * Contiene funciones de validación y manejo de formularios
 */
export class u_formularioEstudiante {
    
    /**
     * VALIDACIONES DE DATOS PERSONALES
     */
    
    static validarFormularioDatosPersonales() {
        const nombre = document.getElementById('nombreEstudianteMatricula')?.value || '';
        const apellidos = document.getElementById('apellidosEstudianteMatricula')?.value || '';
        const dip = document.getElementById('dipEstudianteMatricula')?.value || '';
        const fechaNacimiento = document.getElementById('fechaNacimientoEstudianteMatricula')?.value || '';
        const nacionalidad = document.getElementById('nacionalidadEstudianteMatricula')?.value || '';
        const genero = document.getElementById('generosEstudianteMatricula')?.value || '';
        const direccion = document.getElementById('direccionEstudianteMatricula')?.value || '';
        const localidad = document.getElementById('localidadEstudianteMatricula')?.value || '';
        const provincia = document.getElementById('provinciaEstudianteMatricula')?.value || '';
        const pais = document.getElementById('comboPaisesEstudianteMatricula')?.value || '';
        const correo = document.getElementById('correoEstudianteMatricula')?.value || '';
        const telefono = document.getElementById('telefonoEstudianteMatricula')?.value || '';
        const centro = document.getElementById('comboCentroEstudianteMatricula')?.value || '';
        const universidad = document.getElementById('comboUniversidadEstudianteMatricula')?.value || '';
        const nombreUsuario = document.getElementById('nombreOCorreoUsuario')?.value || '';
        
        const validaciones = {
            nombre: u_estudiante.validarNombreEstudiante(nombre),
            apellidos: u_estudiante.validarApellidosEstudiante(apellidos),
            dip: u_estudiante.validarDIPEstudiante(dip),
            fechaNacimiento: u_estudiante.validarFechaNacimiento(fechaNacimiento),
            nacionalidad: u_estudiante.validarNacionalidad(nacionalidad),
            genero: u_estudiante.validarGenero(genero),
            direccion: u_estudiante.validarDireccion(direccion),
            localidad: u_estudiante.validarLocalidad(localidad),
            provincia: u_estudiante.validarProvincia(provincia),
            pais: u_estudiante.validarPais(pais),
            correo: u_estudiante.validarCorreoEstudiante(correo),
            telefono: u_estudiante.validarTelefonoEstudiante(telefono),
            centro: u_estudiante.validarCentroProcedencia(centro),
            universidad: u_estudiante.validarUniversidadProcedencia(universidad),
            nombreUsuario: u_estudiante.validarNombreOCorreoUsuario(nombreUsuario)
        };
        
        // Aplicar colores y mensajes
        u_utiles.colorearCampo(validaciones.nombre, '#nombreEstudianteMatricula', '#errorNombreEstudianteMatricula', 
            validaciones.nombre ? '' : 'Nombre inválido (mínimo 3 caracteres)');
        u_utiles.colorearCampo(validaciones.apellidos, '#apellidosEstudianteMatricula', '#errorApellidosEstudianteMatricula', 
            validaciones.apellidos ? '' : 'Apellidos inválidos (mínimo 3 caracteres)');
        u_utiles.colorearCampo(validaciones.dip, '#dipEstudianteMatricula', '#errorDipEstudianteMatricula', 
            validaciones.dip ? '' : 'Formato inválido (ej: 000 000 000)');
        u_utiles.colorearCampo(validaciones.fechaNacimiento, '#fechaNacimientoEstudianteMatricula', '#errorFechaNacimientoEstudianteMatricula', 
            validaciones.fechaNacimiento ? '' : 'Fecha inválida (debe ser mayor de 16 años)');
        u_utiles.colorearCampo(validaciones.nacionalidad, '#nacionalidadEstudianteMatricula', '#errorNacionalidadEstudianteMatricula', 
            validaciones.nacionalidad ? '' : 'Nacionalidad inválida (mínimo 3 caracteres)');
        u_utiles.colorearCampo(validaciones.genero, '#generosEstudianteMatricula', '#errorGenerosEstudianteMatricula', 
            validaciones.genero ? '' : 'Seleccione un género');
        u_utiles.colorearCampo(validaciones.direccion, '#direccionEstudianteMatricula', '#errorDireccionEstudianteMatricula', 
            validaciones.direccion ? '' : 'Dirección inválida (mínimo 5 caracteres)');
        u_utiles.colorearCampo(validaciones.localidad, '#localidadEstudianteMatricula', '#errorLocalidadEstudianteMatricula', 
            validaciones.localidad ? '' : 'Localidad inválida (mínimo 3 caracteres)');
        u_utiles.colorearCampo(validaciones.provincia, '#provinciaEstudianteMatricula', '#errorProvinciaEstudianteMatricula', 
            validaciones.provincia ? '' : 'Provincia inválida (mínimo 3 caracteres)');
        u_utiles.colorearCampo(validaciones.pais, '#comboPaisesEstudianteMatricula', '#errorPaisesEstudianteMatricula', 
            validaciones.pais ? '' : 'Seleccione un país');
        u_utiles.colorearCampo(validaciones.correo, '#correoEstudianteMatricula', '#errorCorreoEstudianteMatricula', 
            validaciones.correo ? '' : 'Formato de correo inválido');
        u_utiles.colorearCampo(validaciones.telefono, '#telefonoEstudianteMatricula', '#errorTelefonoEstudianteMatricula', 
            validaciones.telefono ? '' : 'Formato inválido (ej: +240 222 123 456)');
        u_utiles.colorearCampo(validaciones.centro, '#comboCentroEstudianteMatricula', '#errorCentroEstudianteMatricula', 
            validaciones.centro ? '' : 'Centro de procedencia inválido');
        u_utiles.colorearCampo(validaciones.universidad, '#comboUniversidadEstudianteMatricula', '#errorUniversidadEstudianteMatricula', 
            validaciones.universidad ? '' : 'Universidad de procedencia inválida');
        u_utiles.colorearCampo(validaciones.nombreUsuario, '#nombreOCorreoUsuario', '#errorNombreOCorreoUsuario', 
            validaciones.nombreUsuario ? '' : 'Nombre de usuario o correo inválido');
        
        return Object.values(validaciones).every(v => v === true);
    }
    
    /**
     * VALIDACIONES DE MATRÍCULA
     */
    
    static validarFormularioMatricula() {
        const cursoAcademico = document.getElementById('cursoAcademicoMatricula')?.value || '';
        const fechaMatricula = document.getElementById('fechaMatricula')?.value || '';
        const modalidad = document.getElementById('modalidadMatricula')?.value || '';
        const creditos = document.getElementById('creditosTotalesMatricula')?.value || '';
        const estado = document.getElementById('estadosMatricula')?.value || '';
        
        const validaciones = {
            cursoAcademico: u_estudiante.validarCursoAcademico(cursoAcademico),
            fechaMatricula: u_estudiante.validarFechaMatricula(fechaMatricula),
            modalidad: u_estudiante.validarModalidadMatricula(modalidad),
            creditos: u_estudiante.validarCreditosTotales(creditos),
            estado: u_estudiante.validarEstadoMatricula(estado)
        };
        
        u_utiles.colorearCampo(validaciones.cursoAcademico, '#cursoAcademicoMatricula', '#errorCursoAcademicoMatricula', 
            validaciones.cursoAcademico ? '' : 'Formato inválido (ej: 2025/2026)');
        u_utiles.colorearCampo(validaciones.fechaMatricula, '#fechaMatricula', '#errorFechaMatricula', 
            validaciones.fechaMatricula ? '' : 'Fecha inválida');
        u_utiles.colorearCampo(validaciones.modalidad, '#modalidadMatricula', '#errorModalidadMatricula', 
            validaciones.modalidad ? '' : 'Seleccione una modalidad');
        u_utiles.colorearCampo(validaciones.creditos, '#creditosTotalesMatricula', '#errorCreditosTotalesMatricula', 
            validaciones.creditos ? '' : 'Créditos inválidos (0-60)');
        u_utiles.colorearCampo(validaciones.estado, '#estadosMatricula', '#errorestadosMatricula', 
            validaciones.estado ? '' : 'Seleccione un estado');
        
        return Object.values(validaciones).every(v => v === true);
    }
    
    /**
     * VALIDACIONES DE PAGO
     */
    
    static validarFormularioPago() {
        const cuota = document.getElementById('cuotaEstudiante')?.value || '';
        const monto = document.getElementById('montoEstudiante')?.value || '';
        const fechaPago = document.getElementById('fechaPagoEstudiante')?.value || '';
        
        const validaciones = {
            cuota: u_estudiante.validarCuota(cuota),
            monto: u_estudiante.validarMonto(monto),
            fechaPago: u_estudiante.validarFechaPago(fechaPago)
        };
        
        u_utiles.colorearCampo(validaciones.cuota, '#cuotaEstudiante', '#errorCuotaEstudiante', 
            validaciones.cuota ? '' : 'Cuota inválida (1-12)');
        u_utiles.colorearCampo(validaciones.monto, '#montoEstudiante', '#errorMontoEstudiante', 
            validaciones.monto ? '' : 'Monto inválido');
        u_utiles.colorearCampo(validaciones.fechaPago, '#fechaPagoEstudiante', '#errorFechaPagoEstudiante', 
            validaciones.fechaPago ? '' : 'Fecha inválida');
        
        return Object.values(validaciones).every(v => v === true);
    }
    
    /**
     * VALIDAR TODOS LOS BLOQUES DE FAMILIARES
     */
    static validarTodosFamiliares() {
        const bloques = document.querySelectorAll('.familiar-bloque');
        let todosValidos = true;
        
        bloques.forEach((bloque, index) => {
            const valido = u_estudiante.validarBloqueFamiliar(bloque, index);
            if (!valido) todosValidos = false;
        });
        
        return todosValidos;
    }
    
    /**
     * VALIDAR TODOS LOS BLOQUES DE BECAS (si el checkbox está activo)
     */
    static validarTodosBecas() {
        const esBecario = document.getElementById('esBecario')?.checked;
        if (!esBecario) return true;
        
        const bloques = document.querySelectorAll('.beca-bloque');
        let todosValidos = true;
        
        bloques.forEach((bloque, index) => {
            const valido = u_estudiante.validarBloqueBeca(bloque, index);
            if (!valido) todosValidos = false;
        });
        
        return todosValidos;
    }
    
    /**
     * CONFIGURAR VALIDACIONES EN TIEMPO REAL
     */
    static configurarValidacionesEnTiempoReal() {
        // Validaciones de datos personales
        const campoNombre = document.getElementById('nombreEstudianteMatricula');
        if (campoNombre) {
            campoNombre.addEventListener('input', () => {
                const valido = u_estudiante.validarNombreEstudiante(campoNombre.value);
                u_utiles.colorearCampo(valido, '#nombreEstudianteMatricula', '#errorNombreEstudianteMatricula', 
                    valido ? '' : 'Nombre inválido (mínimo 3 caracteres)');
            });
        }
        
        const campoApellidos = document.getElementById('apellidosEstudianteMatricula');
        if (campoApellidos) {
            campoApellidos.addEventListener('input', () => {
                const valido = u_estudiante.validarApellidosEstudiante(campoApellidos.value);
                u_utiles.colorearCampo(valido, '#apellidosEstudianteMatricula', '#errorApellidosEstudianteMatricula', 
                    valido ? '' : 'Apellidos inválidos (mínimo 3 caracteres)');
            });
        }
        
        const campoDip = document.getElementById('dipEstudianteMatricula');
        if (campoDip) {
            campoDip.addEventListener('input', () => {
                const valido = u_estudiante.validarDIPEstudiante(campoDip.value);
                u_utiles.colorearCampo(valido, '#dipEstudianteMatricula', '#errorDipEstudianteMatricula', 
                    valido ? '' : 'Formato inválido (ej: 000 000 000)');
            });
        }
        
        const campoFechaNacimiento = document.getElementById('fechaNacimientoEstudianteMatricula');
        if (campoFechaNacimiento) {
            campoFechaNacimiento.addEventListener('change', () => {
                const valido = u_estudiante.validarFechaNacimiento(campoFechaNacimiento.value);
                u_utiles.colorearCampo(valido, '#fechaNacimientoEstudianteMatricula', '#errorFechaNacimientoEstudianteMatricula', 
                    valido ? '' : 'Fecha inválida (debe ser mayor de 16 años)');
            });
        }
        
        const campoNacionalidad = document.getElementById('nacionalidadEstudianteMatricula');
        if (campoNacionalidad) {
            campoNacionalidad.addEventListener('input', () => {
                const valido = u_estudiante.validarNacionalidad(campoNacionalidad.value);
                u_utiles.colorearCampo(valido, '#nacionalidadEstudianteMatricula', '#errorNacionalidadEstudianteMatricula', 
                    valido ? '' : 'Nacionalidad inválida (mínimo 3 caracteres)');
            });
        }
        
        const campoGenero = document.getElementById('generosEstudianteMatricula');
        if (campoGenero) {
            campoGenero.addEventListener('change', () => {
                const valido = u_estudiante.validarGenero(campoGenero.value);
                u_utiles.colorearCampo(valido, '#generosEstudianteMatricula', '#errorGenerosEstudianteMatricula', 
                    valido ? '' : 'Seleccione un género');
            });
        }
        
        const campoDireccion = document.getElementById('direccionEstudianteMatricula');
        if (campoDireccion) {
            campoDireccion.addEventListener('input', () => {
                const valido = u_estudiante.validarDireccion(campoDireccion.value);
                u_utiles.colorearCampo(valido, '#direccionEstudianteMatricula', '#errorDireccionEstudianteMatricula', 
                    valido ? '' : 'Dirección inválida (mínimo 5 caracteres)');
            });
        }
        
        const campoLocalidad = document.getElementById('localidadEstudianteMatricula');
        if (campoLocalidad) {
            campoLocalidad.addEventListener('input', () => {
                const valido = u_estudiante.validarLocalidad(campoLocalidad.value);
                u_utiles.colorearCampo(valido, '#localidadEstudianteMatricula', '#errorLocalidadEstudianteMatricula', 
                    valido ? '' : 'Localidad inválida (mínimo 3 caracteres)');
            });
        }
        
        const campoProvincia = document.getElementById('provinciaEstudianteMatricula');
        if (campoProvincia) {
            campoProvincia.addEventListener('input', () => {
                const valido = u_estudiante.validarProvincia(campoProvincia.value);
                u_utiles.colorearCampo(valido, '#provinciaEstudianteMatricula', '#errorProvinciaEstudianteMatricula', 
                    valido ? '' : 'Provincia inválida (mínimo 3 caracteres)');
            });
        }
        
        const campoCorreo = document.getElementById('correoEstudianteMatricula');
        if (campoCorreo) {
            campoCorreo.addEventListener('input', () => {
                const valido = u_estudiante.validarCorreoEstudiante(campoCorreo.value);
                u_utiles.colorearCampo(valido, '#correoEstudianteMatricula', '#errorCorreoEstudianteMatricula', 
                    valido ? '' : 'Formato de correo inválido');
            });
        }
        
        const campoTelefono = document.getElementById('telefonoEstudianteMatricula');
        if (campoTelefono) {
            campoTelefono.addEventListener('input', () => {
                const valido = u_estudiante.validarTelefonoEstudiante(campoTelefono.value);
                u_utiles.colorearCampo(valido, '#telefonoEstudianteMatricula', '#errorTelefonoEstudianteMatricula', 
                    valido ? '' : 'Formato inválido (ej: +240 222 123 456)');
            });
        }
        
        const campoNombreUsuario = document.getElementById('nombreOCorreoUsuario');
        if (campoNombreUsuario) {
            campoNombreUsuario.addEventListener('input', () => {
                const valido = u_estudiante.validarNombreOCorreoUsuario(campoNombreUsuario.value);
                u_utiles.colorearCampo(valido, '#nombreOCorreoUsuario', '#errorNombreOCorreoUsuario', 
                    valido ? '' : 'Nombre de usuario o correo inválido');
            });
        }
        
        // Validaciones de matrícula
        const campoCursoAcademico = document.getElementById('cursoAcademicoMatricula');
        if (campoCursoAcademico) {
            campoCursoAcademico.addEventListener('input', () => {
                const valido = u_estudiante.validarCursoAcademico(campoCursoAcademico.value);
                u_utiles.colorearCampo(valido, '#cursoAcademicoMatricula', '#errorCursoAcademicoMatricula', 
                    valido ? '' : 'Formato inválido (ej: 2025/2026)');
            });
        }
        
        const campoFechaMatricula = document.getElementById('fechaMatricula');
        if (campoFechaMatricula) {
            campoFechaMatricula.addEventListener('change', () => {
                const valido = u_estudiante.validarFechaMatricula(campoFechaMatricula.value);
                u_utiles.colorearCampo(valido, '#fechaMatricula', '#errorFechaMatricula', 
                    valido ? '' : 'Fecha inválida');
            });
        }
        
        const campoModalidad = document.getElementById('modalidadMatricula');
        if (campoModalidad) {
            campoModalidad.addEventListener('change', () => {
                const valido = u_estudiante.validarModalidadMatricula(campoModalidad.value);
                u_utiles.colorearCampo(valido, '#modalidadMatricula', '#errorModalidadMatricula', 
                    valido ? '' : 'Seleccione una modalidad');
            });
        }
        
        const campoCreditos = document.getElementById('creditosTotalesMatricula');
        if (campoCreditos) {
            campoCreditos.addEventListener('input', () => {
                const valido = u_estudiante.validarCreditosTotales(campoCreditos.value);
                u_utiles.colorearCampo(valido, '#creditosTotalesMatricula', '#errorCreditosTotalesMatricula', 
                    valido ? '' : 'Créditos inválidos (0-60)');
            });
        }
        
        const campoEstadoMatricula = document.getElementById('estadosMatricula');
        if (campoEstadoMatricula) {
            campoEstadoMatricula.addEventListener('change', () => {
                const valido = u_estudiante.validarEstadoMatricula(campoEstadoMatricula.value);
                u_utiles.colorearCampo(valido, '#estadosMatricula', '#errorestadosMatricula', 
                    valido ? '' : 'Seleccione un estado');
            });
        }
        
        // Validaciones de pago
        const campoCuota = document.getElementById('cuotaEstudiante');
        if (campoCuota) {
            campoCuota.addEventListener('input', () => {
                const valido = u_estudiante.validarCuota(campoCuota.value);
                u_utiles.colorearCampo(valido, '#cuotaEstudiante', '#errorCuotaEstudiante', 
                    valido ? '' : 'Cuota inválida (1-12)');
            });
        }
        
        const campoMonto = document.getElementById('montoEstudiante');
        if (campoMonto) {
            campoMonto.addEventListener('input', () => {
                const valido = u_estudiante.validarMonto(campoMonto.value);
                u_utiles.colorearCampo(valido, '#montoEstudiante', '#errorMontoEstudiante', 
                    valido ? '' : 'Monto inválido');
            });
        }
        
        const campoFechaPago = document.getElementById('fechaPagoEstudiante');
        if (campoFechaPago) {
            campoFechaPago.addEventListener('change', () => {
                const valido = u_estudiante.validarFechaPago(campoFechaPago.value);
                u_utiles.colorearCampo(valido, '#fechaPagoEstudiante', '#errorFechaPagoEstudiante', 
                    valido ? '' : 'Fecha inválida');
            });
        }
    }
    
    /**
     * CONFIGURAR EVENTOS DE FAMILIARES
     */
    static configurarEventosFamiliares() {
        // Botón añadir más contactos
        const btnAñadir = document.getElementById('añadirContactos');
        if (btnAñadir) {
            btnAñadir.addEventListener('click', () => {
                const container = document.getElementById('contenedorFamiliares');
                if (container) {
                    const index = container.children.length;
                    const nuevoBloque = u_estudiante.crearBloqueFamiliar(index);
                    container.insertAdjacentHTML('beforeend', nuevoBloque);
                    this.configurarEventosEliminarFamiliar();
                }
            });
        }
        
        this.configurarEventosEliminarFamiliar();
    }
    
    /**
     * CONFIGURAR EVENTOS ELIMINAR FAMILIAR
     */
    static configurarEventosEliminarFamiliar() {
        document.querySelectorAll('.btn-eliminar-familiar').forEach(btn => {
            btn.removeEventListener('click', this.handleEliminarFamiliar);
            btn.addEventListener('click', this.handleEliminarFamiliar);
        });
    }
    
    static handleEliminarFamiliar(e) {
        e.target.closest('.familiar-bloque')?.remove();
        // Reindexar los bloques restantes
        document.querySelectorAll('.familiar-bloque').forEach((bloque, newIndex) => {
            bloque.setAttribute('data-index', newIndex);
        });
    }
    
    /**
     * CONFIGURAR EVENTOS DE BECAS
     */
    static configurarEventosBecas() {
        // Botón añadir más becas
        const btnAñadir = document.getElementById('añadirBecas');
        if (btnAñadir) {
            btnAñadir.addEventListener('click', () => {
                const container = document.getElementById('contenedorBecas');
                if (container) {
                    const index = container.children.length;
                    const nuevoBloque = u_estudiante.crearBloqueBeca(index);
                    container.insertAdjacentHTML('beforeend', nuevoBloque);
                    this.configurarEventosEliminarBeca();
                }
            });
        }
        
        this.configurarEventosEliminarBeca();
    }
    
    /**
     * CONFIGURAR EVENTOS ELIMINAR BECA
     */
    static configurarEventosEliminarBeca() {
        document.querySelectorAll('.btn-eliminar-beca').forEach(btn => {
            btn.removeEventListener('click', this.handleEliminarBeca);
            btn.addEventListener('click', this.handleEliminarBeca);
        });
    }
    
    static handleEliminarBeca(e) {
        e.target.closest('.beca-bloque')?.remove();
        document.querySelectorAll('.beca-bloque').forEach((bloque, newIndex) => {
            bloque.setAttribute('data-index', newIndex);
        });
    }
    
    /**
     * CONFIGURAR CHECKBOX DE BECARIO
     */
    static configurarCheckboxBecario() {
        const checkBecario = document.getElementById('esBecario');
        const contBecario = document.getElementById('contDatosBecario');
        
        if (checkBecario && contBecario) {
            const toggleBecario = () => {
                contBecario.classList.toggle('d-none', !checkBecario.checked);
            };
            
            checkBecario.addEventListener('change', toggleBecario);
            toggleBecario();
        }
    }
    
    /**
     * CONFIGURAR COMBOS
     */
    static configurarCombos(centrosProcedencia = [], universidadesProcedencia = []) {
        // Combo de países
        u_estudiante.inicializarComboPaises('comboPaisesEstudianteMatricula', 'opcionesEstudianteMatricula');
        
        // Combo de centros de procedencia
        u_estudiante.inicializarComboConNuevo(
            'comboCentroEstudianteMatricula',
            'opcionesCentroEstudianteMatricula',
            centrosProcedencia,
            null,
            (nuevoCentro) => {
                if (nuevoCentro && !centrosProcedencia.includes(nuevoCentro)) {
                    centrosProcedencia.push(nuevoCentro);
                }
            }
        );
        
        // Combo de universidades de procedencia
        u_estudiante.inicializarComboConNuevo(
            'comboUniversidadEstudianteMatricula',
            'opcionesUniversidadEstudianteMatricula',
            universidadesProcedencia,
            null,
            (nuevaUniversidad) => {
                if (nuevaUniversidad && !universidadesProcedencia.includes(nuevaUniversidad)) {
                    universidadesProcedencia.push(nuevaUniversidad);
                }
            }
        );
    }
    
    /**
     * INICIALIZAR VALORES POR DEFECTO
     */
    static inicializarValoresPorDefecto() {
        // Curso académico automático
        const cursoAcademico = u_estudiante.generarCursoAcademico();
        const campoCurso = document.getElementById('cursoAcademicoMatricula');
        if (campoCurso) campoCurso.value = cursoAcademico;
        
        // Fecha actual para fecha de matrícula
        const fechaActual = new Date().toISOString().split('T')[0];
        const campoFechaMatricula = document.getElementById('fechaMatricula');
        if (campoFechaMatricula) campoFechaMatricula.value = fechaActual;
        
        // Fecha actual para fecha de pago
        const campoFechaPago = document.getElementById('fechaPagoEstudiante');
        if (campoFechaPago) campoFechaPago.value = fechaActual;
        
        // Valor por defecto para el combo de género
        const campoGenero = document.getElementById('generosEstudianteMatricula');
        if (campoGenero && campoGenero.value === 'Ninguno') {
            campoGenero.value = 'Ninguno';
        }
    }
    
    /**
     * MOSTRAR/OCULTAR SECCIONES
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
    }
    
    /**
     * CONFIGURAR BOTONES DE SECCIONES
     */
    static configurarBotonesSecciones() {
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
        
        // Mostrar sección por defecto
        this.mostrarSeccion('datosPersonales');
    }
}