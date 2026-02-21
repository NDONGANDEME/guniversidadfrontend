import { u_utiles } from "../utilidades/u_utiles.js";
import { c_noticia } from "./c_noticia.js";

document.addEventListener('DOMContentLoaded', async function()
{
    u_utiles.existenciaContenedorImportacion();
    u_utiles.botonesNavegacion();
    const controlador = new c_noticia();

    await controlador.inicializarInicio();
});