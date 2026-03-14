import { m_sesion } from "../modelo/m_sesion.js";
import { Alerta } from "./u_alertas.js";

export class u_utiles
{
    /**********************************************************************************************************/
    /* METODOS GENERALES */
    /**********************************************************************************************************/

    static manejoDatosSesion() {
        let usuarioRegistrado = m_sesion.leerSesion('usuarioActivo');

        if (document.querySelector('.nombreUsuarioTopBar')) document.querySelector('.nombreUsuarioTopBar').textContent = usuarioRegistrado.nombreUsuario || 'Nombre del usuario';
        if (document.querySelector('.correoTopBar')) document.querySelector('.correoTopBar').textContent = usuarioRegistrado.correo || 'Correo del usuario';
    }

    // valida todos los campos de un formulario
    static validarTodosCampos(objeto) {
        return Object.values(objeto).every(val => val === true);
    }

    // verifica la existencia del contenedor de importacion
    static async existenciaContenedorImportacion() {
        if (document.querySelector('.importandoNavegacion')) await u_utiles.cargarArchivosImportadosHTML('Navegacion', '.importandoNavegacion');
        if (document.querySelector('.importandoFooter')) await u_utiles.cargarArchivosImportadosHTML('Footer', '.importandoFooter');
    }

    // metodo para aplicar las redirecciones
    static redirigirA(elementoAClickear=null, rutaRedireccion) {
        if(elementoAClickear==null) window.location.replace(rutaRedireccion);
        else{
            elementoAClickear.addEventListener('click', function() {
                window.location.replace(rutaRedireccion);
            });
        }
    }

    // funcion que se encarga de cargar los archivos HTML importados
    static async cargarArchivosImportadosHTML(ruta, contenedorImportar) {
        try {
            let respuesta = await fetch(`/guniversidadfrontend/public/include/${ruta}.html`);
            if(!respuesta.ok) throw new Error(`Error al cargar ${ruta}`);
            const html = await respuesta.text();
            document.querySelector(contenedorImportar).innerHTML = html;
            u_utiles.botonesNavegacion();
            u_utiles.manejoDatosSesion();
            
            if(document.querySelector('#administrador')) u_utiles.botonesNavegacionAdministrador(); 
            if(document.querySelector('#secretarioAcademico')) u_utiles.botonesNavegacionSecretario();
            if(document.querySelector('#comprobante')) u_utiles.botonesNavegacionComprobante();
            if(document.querySelector('#profesorPanel')) u_utiles.botonesNavegacionProfesor();
        } catch(error) {
            //Alerta.error('Error', `Fallo al hacer fetch para cargar los archivos de importacion, estoy en u_utiles: ${error}`);
        }
    }

    // colorea los bordes de los campos segun si la validacion es correcta o no, ademas de mostrar u ocultar el mensaje de error
    static colorearCampo(boolean, campo, errorCampo=null, mensajeError='') {
        if (boolean) {
            document.querySelector(campo).classList.remove('border-danger');
            document.querySelector(campo).classList.add('border-success');

            if(document.querySelector(errorCampo)) {
                document.querySelector(errorCampo).textContent = mensajeError;
                document.querySelector(errorCampo).classList.add('d-none');
            }
        } else {
            document.querySelector(campo).classList.remove('border-success');
            document.querySelector(campo).classList.add('border-danger');

            if(document.querySelector(errorCampo)) {
                document.querySelector(errorCampo).textContent = mensajeError;
                document.querySelector(errorCampo).classList.remove('d-none');
            }
        }
    }

    /**
     * Inicializa la tabla con DataTable
     * @param {string} idTabla - ID de la tabla
     * @returns {Object} Instancia de DataTable
     */
    static inicializarDataTable(idTabla) {
        if ($.fn.dataTable.isDataTable(idTabla)) {
            return $(idTabla).DataTable();
        } else {
            return $(idTabla).DataTable({
                language: {
                    url: '/guniversidadfrontend/public/nomodules/dataTable/dataTable_es-ES.json'
                }
            });
        }
    }

    static manejoTabla() {
        $(document).ready( () => $('.tabla').DataTable({
            language : { url : '/guniversidadfrontend/public/nomodules/dataTable/dataTable_es-ES.json' }
        }));
    }

    /**
     * Función debounce para limitar la frecuencia de ejecución de una función
     * @param {Function} func - La función a ejecutar
     * @param {number} wait - Tiempo de espera en milisegundos
     * @returns {Function} Función con debounce aplicado
     */
    static debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }


    /**********************************************************************************************************/
    /* PARTE PUBLICA */
    /**********************************************************************************************************/

    // navegacion para los botones de la parte public (header y footer)
    static botonesNavegacion() {
        let url = '/guniversidadfrontend/public/template/html';

        // Enlaces de la barra de navegacion
        document.querySelectorAll('.enlacesBarraNavegacion').forEach(enlace => {
            enlace.addEventListener('click', function(e) {
                switch(e.target.id){
                    case 'enlaceInicio': u_utiles.redirigirA(null, '/guniversidadfrontend/index.html');
                        break;
                    case 'enlaceNoticias': u_utiles.redirigirA(null, `${url}/noticias.html`);
                        break;
                    case 'enlaceSobreNos': u_utiles.redirigirA(null, `${url}/sobreNos.html`);
                        break;
                    case 'enlaceIniciarSesion': u_utiles.redirigirA(null, `${url}/iniciarSesion.html`);
                        break;
                }
            });
        });

        // Enlaces del footer
        document.querySelectorAll('.footerLink').forEach(enlace => {
            enlace.addEventListener('click', function(e) {
                switch(e.target.id){
                    case 'enlaceFooterInicio': u_utiles.redirigirA(null, '/guniversidadfrontend/index.html'); 
                        break;
                    case 'enlaceFooterNoticias': u_utiles.redirigirA(null, `${url}/noticias.html`);
                        break;
                    case 'enlaceFooterSobreNos': u_utiles.redirigirA(null, `${url}/sobreNos.html`);
                        break;
                }
            });
        });

        // Enlaces de inicio de sesion
        document.querySelectorAll('.enlaceInicioSesion').forEach(enlace => {
            enlace.addEventListener('click', function(e) {
                switch(e.target.id){
                    case 'enlaceInicio': u_utiles.redirigirA(null, '/guniversidadfrontend/index.html'); 
                        break;
                    case 'enlaceInicioSesion': u_utiles.redirigirA(null, `${url}/iniciarSesion.html`);
                        break;
                }
            });
        });
        
        if(document.querySelector('#btnBodyHeader')) u_utiles.redirigirA(document.querySelector('#btnBodyHeader'), `${url}/iniciarSesion.html`);
    }


    /**********************************************************************************************************/
    /* PARTE SECRETARIO */
    /**********************************************************************************************************/

    // navegacion para los botones de la parte del secretario academico
    static botonesNavegacionSecretario() {
        let url = '/guniversidadfrontend/secretarioAcademico/template/html';

        if (document.querySelector('#btnVolverPanelPrincipal')) {
            u_utiles.redirigirA(document.querySelector('#btnVolverPanelPrincipal'), '/guniversidadfrontend/secretarioAcademico/index.html');
        }

        if (document.querySelector('#btnVolverPanelPlanEstudio')) {
            u_utiles.redirigirA(document.querySelector('#btnVolverPanelPlanEstudio'), `${url}/planEstudio.html`);
        }

        if (document.querySelector('#btnComprobante')) {
            u_utiles.redirigirA(document.querySelector('#btnComprobante'), `${url}/comprobanteMatricula.html`);
        }

        if (document.querySelector('#btnVolverPanelEstudiante')) {
            u_utiles.redirigirA(document.querySelector('#btnVolverPanelEstudiante'), `${url}/estudiante.html`);
        }

        if (document.querySelector('#btnNuevoEstudiante')) {
            u_utiles.redirigirA(document.querySelector('#btnNuevoEstudiante'), `${url}/formularioEstudiante.html`);
        }

        if (document.querySelector('#btnNuevoPlanEstudio')) {
            u_utiles.redirigirA(document.querySelector('#btnNuevoPlanEstudio'), `${url}/formularioPlanEstudio.html`);
        }

        if (document.querySelector('#btnVolverPanelProfesor')) {
            u_utiles.redirigirA(document.querySelector('#btnVolverPanelProfesor'), `${url}/profesor.html`);
        }

        if (document.querySelector('#btnNuevoProfesor')) {
            u_utiles.redirigirA(document.querySelector('#btnNuevoProfesor'), `${url}/formularioProfesor.html`);
        }

        if ($('.cerrarSesion')) $(document).ready( () =>  $('.cerrarSesion').click( () => m_sesion.cerrarSesion() ) );
    }

    /**********************************************************************************************************/
    /* PARTE ADMIN */
    /**********************************************************************************************************/

    // configura los botones de navegacion del admin
    static botonesNavegacionAdministrador(){
        let url = '/guniversidadfrontend/admin/template/html';

        if (document.querySelector('#btnVolverPanelPrincipal')) {
            u_utiles.redirigirA(document.querySelector('#btnVolverPanelPrincipal'), '/guniversidadfrontend/admin/index.html');
        }

        if (document.querySelector('#gestionUsuarios')) {
            u_utiles.redirigirA(document.querySelector('#gestionUsuarios'), `${url}/usuario.html`);
        }

        if (document.querySelector('#gestionAcademica')) {
            u_utiles.redirigirA(document.querySelector('#gestionAcademica'), `${url}/academico.html`);
        }

        if (document.querySelector('#gestionNoticias')) {
            u_utiles.redirigirA(document.querySelector('#gestionNoticias'), `${url}/noticia.html`);
        }

        if (document.querySelector('#gestionPermisos')) {
            u_utiles.redirigirA(document.querySelector('#gestionPermisos'), `${url}/permiso.html`);
        }

        if ($('.cerrarSesion')) $(document).ready( () =>  $('.cerrarSesion').click( () => m_sesion.cerrarSesion() ) );
    }

    /**********************************************************************************************************/
    /* PARTE PROFESOR */
    /**********************************************************************************************************/

    // navegacion para los botones de la parte del secretario academico
    static botonesNavegacionProfesor() {
        let url = '/guniversidadfrontend/profesor/template/html';

        u_utiles.redirigirA(document.querySelector('.tableroP'), '/guniversidadfrontend/profesor/index.html');

        u_utiles.redirigirA(document.querySelector('.evaluacion'), `${url}/evaluacion.html`);

        u_utiles.redirigirA(document.querySelector('.horario'), `${url}/horario.html`);

        u_utiles.redirigirA(document.querySelector('.noticia'), `${url}/noticia.html`);

        u_utiles.redirigirA(document.querySelector('.consulta'), `${url}/consulta.html`);

        if(document.querySelector('.perfil')) u_utiles.redirigirA(document.querySelector('.perfil'), `${url}/perfil.html`);

        $(document).ready( () =>  $('.cerrarSesion').click( () => m_sesion.cerrarSesion() ) );
    }
}