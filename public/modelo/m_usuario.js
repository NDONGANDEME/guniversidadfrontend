import { fetchUsuario } from "../servicios/fetchUsuario.js";

export class m_usuario
{
    constructor(idUsuario, nombreUsuario, contrasena, correo, rol, foto, estado, ultimoAcceso, preguntaRecuperacion, respuestaRecuperacion) {
        this.idUsuario = idUsuario;
        this.nombreUsuario = nombreUsuario;
        this.contrasena = contrasena;
        this.correo = correo;
        this.rol = rol;
        this.foto = foto;
        this.estado = estado;
        this.ultimoAcceso = ultimoAcceso;
        this.preguntaRecuperacion = preguntaRecuperacion;
        this.respuestaRecuperacion = respuestaRecuperacion;
    }

    static async obtenerUsuarios(actor) {
        return await fetchUsuario.obtenerUsuariosEnBDD(actor);
    }

    static async insertarUsuario(objeto, actor) {
        return await fetchUsuario.insertarUsuarioEnBDD(objeto, actor);
    }

    static async actualizarUsuario(objeto, actor) {
        return await fetchUsuario.actualizarUsuarioEnBDD(objeto, actor);
    }

    static async deshabilitarUsuario(id, actor) {
        return await fetchUsuario.deshabilitarUsuarioEnBDD(id, actor);
    }

    static async habilitarUsuario(id, actor) {
        return await fetchUsuario.habilitarUsuarioEnBDD(id, actor);
    }

    static async verificarContraseñaExistente(contraseña, actor) {
        return await fetchUsuario.verificarContraseñaExistenteEnBackend(contraseña, actor);
    }
}