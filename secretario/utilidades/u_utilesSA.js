import { m_sesion } from "../../public/modelo/m_sesion.js";
import { u_utiles } from "../../public/utilidades/u_utiles.js";

export class u_utilesSA
{
    static botonesNavegacionWrapper(){
        // sentencia para ir al tablero
        $(document).ready( () =>  $('.tablero').click( () => u_utiles.redirigirA(null, '/guniversidadfrontend/secretario/index.html') ) );

        // sentencia para ir al submodulo de facultad
        $(document).ready( () =>  $('.facultad').click( () => u_utiles.redirigirA(null, '/guniversidadfrontend/secretario/template/html/subFacultad.html') ) );

        // sentencia para ir al submodulo de asignatura
        $(document).ready( () =>  $('.asignatura').click( () => u_utiles.redirigirA(null, '/guniversidadfrontend/secretario/template/html/subAsignatura.html') ) );

        // sentencia para ir al submodulo de departamento
        $(document).ready( () =>  $('.departamento').click( () => u_utiles.redirigirA(null, '/guniversidadfrontend/secretario/template/html/subDepartamento.html') ) );

        // sentencia para ir al submodulo de carrera
        $(document).ready( () =>  $('.carrera').click( () => u_utiles.redirigirA(null, '/guniversidadfrontend/secretario/template/html/subCarrera.html') ) );

        // sentencia para ir al submodulo de curso
        $(document).ready( () =>  $('.curso').click( () => u_utiles.redirigirA(null, '/guniversidadfrontend/secretario/template/html/subCurso.html') ) );

        // sentencia para ir al submodulo de curso
        $(document).ready( () =>  $('.semestre').click( () => u_utiles.redirigirA(null, '/guniversidadfrontend/secretario/template/html/subSemestre.html') ) );

        // sentencia para cerrar la sesion
        $(document).ready( () =>  $('.cerrarSesion').click( () => m_sesion.cerrarSesion() ) );
    }

    // funcion que se encarga de cargar los archivos HTML importados
    static async cargarArchivosImportadosHTML(ruta, contendorImportar)
    { 
        try{
            let respuesta = await fetch(`/guniversidadfrontend/secretario/include/${ruta}.html`);
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
                $(idTabla).DataTable({
                    language: {
                        url: '//cdn.datatables.net/plug-ins/1.10.25/i18n/Spanish.json'
                    },
                    pageLength: 10,
                    responsive: true
                });
            }
        }, 100);
    }
}