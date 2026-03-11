import { m_carrera } from "../../admin/modelo/m_carrera.js";
import { m_curso } from "../../admin/modelo/m_curso.js";
import { sesiones } from "../../public/core/sesiones.js";
import { Alerta } from "../../public/utilidades/u_alertas.js";
import { u_utiles } from "../../public/utilidades/u_utiles.js";
import { u_comprobante } from "../utilidades/u_comprobanteMatricula.js";

export class c_comprobanteMatricula {
    constructor() {
        this.cursos = [];
        this.carreras = [];
        this.añosAcademicos = [];
    }

    // ========== INICIALIZACIÓN ==========
    async inicializar() {
        try {
            // Verificar sesión
            sesiones.verificarExistenciaSesion();
            
            // Cargar componentes comunes
            await u_utiles.cargarArchivosImportadosHTML('modalCerrarSesion', '.importandoModalCierreSesion');
            await u_utiles.cargarArchivosImportadosHTML('topBar', '.importandoTopBar');
            
            // Cargar datos iniciales
            await this.cargarDatosIniciales();
            
            // Configurar eventos y validaciones
            this.configurarEventos();
            u_comprobante.configurarValidaciones();
            
            // Cargar años académicos
            this.generarAñosAcademicos();
            
            // Cargar datos guardados en sessionStorage si existen
            this.cargarDatosGuardados();
            
        } catch (error) {
            console.error('Error en inicialización:', error);
            Alerta.error('Error', `No se pudo inicializar el módulo: ${error.message}`);
        }
    }

    // ========== CARGA DE DATOS ==========
    async cargarDatosIniciales() {
        try {
            const [cursos, carreras] = await Promise.all([
                m_curso.obtenerCursos().catch(() => []),
                m_carrera.obtenerCarreras().catch(() => [])
            ]);
            
            this.cursos = cursos || [];
            this.carreras = carreras || [];
            
            // Cargar datos en combos
            u_comprobante.cargarCursos(this.cursos);
            u_comprobante.cargarCarreras(this.carreras);
            
        } catch (error) {
            console.error('Error cargando datos:', error);
            Alerta.notificarError(`Error al cargar datos: ${error.message}`, 1500);
        }
    }

    // ========== GENERAR AÑOS ACADÉMICOS ==========
    generarAñosAcademicos() {
        const añoActual = new Date().getFullYear();
        this.añosAcademicos = [];
        
        // Generar últimos 5 años y próximos 5 años
        for (let i = -5; i <= 5; i++) {
            const año = añoActual + i;
            this.añosAcademicos.push(`${año}/${año + 1}`);
        }
        
        u_comprobante.cargarAñosAcademicos(this.añosAcademicos);
    }

    // ========== CARGAR DATOS GUARDADOS ==========
    cargarDatosGuardados() {
        const datosGuardados = sessionStorage.getItem('datosComprobante');
        if (datosGuardados) {
            try {
                const datos = JSON.parse(datosGuardados);
                u_comprobante.cargarDatosEnFormulario(datos);
            } catch (error) {
                console.error('Error cargando datos guardados:', error);
            }
        }
    }

    // ========== EVENTOS ==========
    configurarEventos() {
        // Botón volver
        $('.volver').off('click').on('click', () => {
            window.location.href = 'matricula.html';
        });

        // Botón guardar
        $('#btnGuardarSemestre').off('click').on('click', () => this.guardarDatos());

        // Botón imprimir
        $('#btnImprimir').off('click').on('click', () => this.imprimirComprobante());

        // Eventos de los selects para actualizar en tiempo real
        $('#nombreCompletoComprobante, #dipOPasaporteComprobante').on('input', () => {
            this.actualizarComprobante();
        });

        $('#añoAcademicoComprobante, #cursoComprobante, #carreraComprobante').on('change', () => {
            this.actualizarComprobante();
        });
    }

    // ========== GUARDAR DATOS ==========
    guardarDatos() {
        // Validar formulario
        if (!u_comprobante.validarFormulario()) {
            Alerta.notificarAdvertencia('Complete correctamente todos los campos', 1500);
            return;
        }
        
        // Actualizar comprobante
        this.actualizarComprobante();
        
        Alerta.exito('Éxito', 'Datos guardados correctamente');
    }

    // ========== ACTUALIZAR COMPROBANTE ==========
    actualizarComprobante() {
        const nombreCompleto = $('#nombreCompletoComprobante').val().trim() || '_________________________';
        const dip = $('#dipOPasaporteComprobante').val().trim() || '_________________________';
        const añoAcademico = $('#añoAcademicoComprobante').val();
        const curso = $('#cursoComprobante option:selected').text();
        const carrera = $('#carreraComprobante option:selected').text();
        
        // Obtener nombres de las opciones seleccionadas
        const cursoTexto = curso !== 'Ninguno' && curso !== 'Seleccione...' ? curso : '_________________________';
        const carreraTexto = carrera !== 'Ninguno' && carrera !== 'Seleccione...' ? carrera : '_________________________';
        const añoTexto = añoAcademico && añoAcademico !== 'Ninguno' ? añoAcademico : '_________________________';
        
        // Fecha actual formateada
        const fecha = new Date();
        const dia = fecha.getDate();
        const mes = fecha.toLocaleString('es-ES', { month: 'long' });
        const año = fecha.getFullYear();
        const fechaTexto = `${dia} de ${mes} de ${año}`;
        
        // Actualizar el comprobante
        $('.nombreEstudiante').text(nombreCompleto);
        $('.dipEstudiante').text(dip);
        $('.añoAcademicoEstudiante').text(añoTexto);
        $('.cursoEstudiante').text(cursoTexto);
        $('.carreraEstudiante').text(carreraTexto);
        $('.fechaEnCurso').text(fechaTexto);
        
        // Si hay un nombre de secretaria guardado en sesión, usarlo
        const usuarioSesion = sessionStorage.getItem('usuarioActual');
        if (usuarioSesion) {
            try {
                const usuario = JSON.parse(usuarioSesion);
                $('.nombreSecretaria').text(usuario.nombre || '_________________________');
            } catch {
                $('.nombreSecretaria').text('_________________________');
            }
        } else {
            $('.nombreSecretaria').text('_________________________');
        }
        
        // La facultad podría venir de sesión o del contexto
        $('.facultad').text('INGENIERÍAS Y ARQUITECTURA'); // Por defecto
    }

    // ========== IMPRIMIR COMPROBANTE ==========
    imprimirComprobante() {
        // Obtener solo el contenido del comprobante
        const contenido = document.getElementById('documentoAImprimir').innerHTML;
        
        // Crear estilos para la impresión (simulando Word)
        const estilos = `
            <style>
                body {
                    font-family: 'Times New Roman', Times, serif;
                    margin: 0;
                    padding: 20px;
                }
                .comprobante-container {
                    max-width: 750px;
                    margin: 0 auto;
                    background: white;
                    padding: 30px 25px;
                }
                h1 { font-size: 14px; margin: 0; font-weight: bold; text-transform: uppercase; letter-spacing: 1px; }
                h2 { font-size: 18px; font-weight: bold; text-transform: uppercase; margin: 0; letter-spacing: 1px; }
                p { margin: 5px 0; }
                .nombreSecretaria, .nombreEstudiante, .dipEstudiante, .facultad, 
                .añoAcademicoEstudiante, .cursoEstudiante, .carreraEstudiante, .fechaEnCurso, .suscribiente {
                    font-weight: bold;
                }
            </style>
        `;
        
        // Crear ventana para impresión
        const ventanaImprimir = window.open('', '_blank', 'width=800,height=600');
        ventanaImprimir.document.write(`
            <html>
                <head>
                    <title>Comprobante de Matrícula</title>
                    ${estilos}
                </head>
                <body>
                    ${contenido}
                    <script>
                        window.onload = function() { 
                            window.print(); 
                            window.onafterprint = function() { window.close(); };
                        };
                    <\/script>
                </body>
            </html>
        `);
        ventanaImprimir.document.close();
    }
}

// ========== INICIALIZAR ==========
$(document).ready(async function() {
    const controlador = new c_comprobanteMatricula();
    await controlador.inicializar();
});