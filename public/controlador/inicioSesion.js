import { m_sesion } from "../modelo/m_sesion.js";
import { u_utiles } from "../utilidades/u_utiles.js";


document.addEventListener("DOMContentLoaded", function()
{
    u_utiles.botonesNavegacion();
    m_sesion.iniciarSesion();
});