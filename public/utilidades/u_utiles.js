import { Alerta } from "./u_alertas.js";

export class u_utiles
{
    // metodo para los botones de navegacion del header y footer
    static botonesNavegacion()
    {
        const enlacesBarraNavegacion = document.querySelectorAll('.enlacesBarraNavegacion');
        const footerLink = document.querySelectorAll('.footerLink');
        const enlaceInicioSesion = document.querySelectorAll('.enlaceInicioSesion');
    
        enlacesBarraNavegacion.forEach(boton => {
            boton.addEventListener('click', function(){
                switch(this.id){
                    case 'enlaceInicio': window.location.href = '/guniversidadfrontend/index.html'; 
                        break;
                    case 'enlaceNoticias': window.location.href = '/guniversidadfrontend/public/template/html/noticias.html';
                        break;
                    case 'enlaceSobreNos':window.location.href = '/guniversidadfrontend/public/template/html/sobreNos.html';
                        break;
                    case 'enlaceIniciarSesion': window.location.href = '/guniversidadfrontend/public/template/html/iniciarSesion.html';
                        break;
                }
            });
        });


        footerLink.forEach(enlace => {
            enlace.addEventListener('click', function(){
                switch(this.id){
                    case 'enlaceFooterInicio': window.location.href = '/guniversidadfrontend/index.html'; 
                        break;
                    case 'enlaceFooterNoticias': window.location.href = '/guniversidadfrontend/public/template/html/noticias.html';
                        break;
                    case 'enlaceFooterSobreNos':window.location.href = '/guniversidadfrontend/public/template/html/sobreNos.html';
                        break;
                }
            });
        });


        enlaceInicioSesion.forEach(enlace => {
            enlace.addEventListener('click', function(){
                switch(this.id){
                    case 'enlaceInicio': window.location.href = '/guniversidadfrontend/index.html'; 
                        break;
                    case 'enlaceInicioSesion': window.location.href = '/guniversidadfrontend/public/template/html/iniciarSesion.html';
                        break;
                }
            });
        });
    }



    // funcion para colorear los campos en tiempo real
    static colorearCampo(parametroBooleano, campo)
    {
        if(parametroBooleano==false){
            campo.removeClass('border-success');
            campo.addClass('border', 'border-2', 'border-danger');
        }else{
            campo.removeClass('border-danger');
            campo.addClass('border', 'border-2', 'border-success');
        }
    }



    // Función para validar todos los campos de un formulario
    static validarTodosCampos(objeto) {
        return Object.values(objeto).every(val => val === true);
    }



    // funcion que se encarga de cargar los archivos HTML importados
    static async cargarArchivosImportadosHTML(ruta, contendorImportar)
    {
        try{
            let respuesta = await fetch(`/guniversidadfrontend/public/include/${ruta}.html`);
            if(!respuesta.ok) throw new Error(`Error al cargar ${ruta}`);
            const html = await respuesta.text();
            document.querySelector(contendorImportar).innerHTML = html;
            u_utiles.botonesNavegacion();
        } catch(error){
            Alerta.error('Error', `Fallo al hacer fetch [linea 85. u_utiles]: ${error}`);
        }
    }

    

    // metodo para aplicar las redirecciones
    static redirigirA(elementoAClickear, rutaRedireccion)
    {
        if(elementoAClickear==null) window.location.href = rutaRedireccion;
        else{
            elementoAClickear.addEventListener('click', function() {
                window.location.href = rutaRedireccion;
            });
        }
    }



    // Función para mostrar error en un campo específico
    static mostrarError(idCampo, mensaje, esError = true) 
    {
        const errorLabel = document.querySelector(`#${idCampo}`);
        if (errorLabel) 
        {
            errorLabel.textContent = mensaje;
            errorLabel.style.display = esError ? 'block' : 'none';
        }
    }


    // metodo para generar Ids de forma dinamica
    static obtenerSiguienteId(tipo = 'default') {
        // Inicializar contador si no existe
        if (!contadores[tipo]) {
            contadores[tipo] = 0;
        }
        
        // Incrementar y devolver
        contadores[tipo]++;
        return contadores[tipo];
    }
}