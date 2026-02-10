import { m_sesion } from "../../public/modelo/m_sesion.js";
import { Alerta } from "../../public/utilidades/u_alertas.js";
import { u_utiles } from "../../public/utilidades/u_utiles.js";

export class u_utilesSA
{
    static botonesNavegacionWrapper(){
        let url = '/guniversidadfrontend/secretarioAcademico/template/html';

        $(document).ready( () =>  $('.tablero').click( () => u_utiles.redirigirA(null, '/guniversidadfrontend/secretarioAcademico/index.html') ) );

        this.navegacionSlider('.facultad', `${url}/facultad.html`);

        this.navegacionSlider('.departamento', `${url}/departamento.html`);

        this.navegacionSlider('.planEstudio', `${url}/planEstudio.html`);

        this.navegacionSlider('.carrera', `${url}/carrera.html`);

        this.navegacionSlider('.curso', `${url}/curso.html`);

        this.navegacionSlider('.semestre', `${url}/semestre.html`);

        this.navegacionSlider('.asignatura', `${url}/asignatura.html`);

        this.navegacionSlider('.aula', `${url}/aula.html`);

        this.navegacionSlider('.horario', `${url}/horario.html`);

        this.navegacionSlider('.formacion', `${url}/formacion.html`);

        this.navegacionSlider('.matricula', `${url}/matricula.html`);
        
        this.navegacionSlider('.pago', `${url}/pago.html`);

        this.navegacionSlider('.estudiante', `${url}/estudiante.html`);

        this.navegacionSlider('.profesor', `${url}/profesor.html`);

        // sentencia para cerrar la sesion
        $(document).ready( () =>  $('.cerrarSesion').click( () => m_sesion.cerrarSesion() ) );
    }


    // funcion para navegar en el slider
    static navegacionSlider(enlaceAClickear, archivoHTML)
    {
        $(document).ready( () =>  $(enlaceAClickear).click( () => u_utiles.redirigirA(null, archivoHTML) ) );
    }



    // funcion que se encarga de cargar los archivos HTML importados
    static async cargarArchivosImportadosHTML(ruta, contendorImportar)
    { 
        try{
            let respuesta = await fetch(`/guniversidadfrontend/secretarioAcademico/include/${ruta}.html`);
            if(!respuesta.ok) throw new Error(`Error al cargar ${ruta}`);
            const html = await respuesta.text();
            document.querySelector(contendorImportar).innerHTML = html;
            u_utilesSA.botonesNavegacionWrapper();
        } catch(error){
            Alerta.error('Error', `Fallo al hacer fetch [linea 28. u_utilesSA]: ${error}`);
        }
    }



    /* FUNCIONES MANEJO DE DATATABLE */
    // Call the dataTables jQuery plugin
    static manejoTabla(idTabla){
        $(document).ready( () => {
            $(idTabla).DataTable({
                language: {
                    url: '//cdn.datatables.net/plug-ins/1.13.6/i18n/es-ES.json'
                }
            });
        });
        
    }



    // Update call the dataTables jQuery plugin
    static actualizarDataTable(idTabla) {
        let table = $(idTabla).DataTable();
        if (table) {
            table.destroy();
        }
        
        // Re-dibujar la tabla sin reusar DataTables si ya está inicializada
        setTimeout(() => {
            if (!$.fn.dataTable.isDataTable(idTabla)) {
                $(idTabla).DataTable();
            }
        }, 100);
    }
}