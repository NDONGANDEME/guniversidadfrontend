import { u_utiles } from "../utilidades/u_utiles.js";
import { c_noticia } from "./c_noticia.js";

document.addEventListener('DOMContentLoaded', function()
{
    u_utiles.existenciaContenedorImportacion();
    u_utiles.botonesNavegacion();
    c_noticia.inicializarInicio();
});