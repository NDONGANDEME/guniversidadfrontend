import { m_sesion } from "../modelo/m_sesion.js";
import { Alerta } from "./u_alertas.js";

export class u_utiles
{
    /**********************************************************************************************************/
    /* METODOS GENERALES */
    /**********************************************************************************************************/

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
            
            if(document.querySelector('#administrador')) u_utiles.botonesNavegacionAdministrador();
            if(document.querySelector('#secretarioAcademico')) u_utiles.botonesNavegacionSecretario();
        } catch(error) {
            Alerta.error('Error', `Fallo al hacer fetch para cargar los archivos de importacion, estoy en u_utiles: ${error}`);
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

        u_utiles.redirigirA(document.querySelector('.tableroS'), '/guniversidadfrontend/secretarioAcademico/index.html');

        u_utiles.redirigirA(document.querySelector('.planEstudio'), `${url}/planEstudio.html`);

        u_utiles.redirigirA(document.querySelector('.horario'), `${url}/horario.html`);

        u_utiles.redirigirA(document.querySelector('.matricula'), `${url}/matricula.html`);

        u_utiles.redirigirA(document.querySelector('.pago'), `${url}/pago.html`);

        u_utiles.redirigirA(document.querySelector('.estudiante'), `${url}/estudiante.html`);

        u_utiles.redirigirA(document.querySelector('.profesor'), `${url}/profesor.html`);

        $(document).ready( () =>  $('.cerrarSesion').click( () => m_sesion.cerrarSesion() ) );
    }

    /**********************************************************************************************************/
    /* PARTE ADMIN */
    /**********************************************************************************************************/

    // configura los botones de navegacion del admin
    static botonesNavegacionAdministrador(){
        let url = '/guniversidadfrontend/admin/template/html';

        u_utiles.redirigirA(document.querySelector('.tableroA'), '/guniversidadfrontend/admin/index.html');

        u_utiles.redirigirA(document.querySelector('.usuario'), `${url}/usuario.html`);

        u_utiles.redirigirA(document.querySelector('.facultad'), `${url}/facultad.html`);

        u_utiles.redirigirA(document.querySelector('.departamento'), `${url}/departamento.html`);

        u_utiles.redirigirA(document.querySelector('.carrera'), `${url}/carrera.html`);

        u_utiles.redirigirA(document.querySelector('.curso'), `${url}/curso.html`);

        u_utiles.redirigirA(document.querySelector('.semestre'), `${url}/semestre.html`);

        u_utiles.redirigirA(document.querySelector('.asignatura'), `${url}/asignatura.html`);

        u_utiles.redirigirA(document.querySelector('.aula'), `${url}/aula.html`);

        u_utiles.redirigirA(document.querySelector('.noticia'), `${url}/noticia.html`);

        u_utiles.redirigirA(document.querySelector('.parametro'), `${url}/parametros.html`);

        if(document.querySelector('.perfil')) u_utiles.redirigirA(document.querySelector('.perfil'), `${url}/perfil.html`);

        $(document).ready( () =>  $('.cerrarSesion').click( () => m_sesion.cerrarSesion() ) );
    }
}