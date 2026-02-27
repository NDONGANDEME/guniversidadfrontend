import { fetchUsuario } from "../servicios/fetchUsuario.js";

export class m_usuario
{
    constructor(idUsuario, nombreUsuario, contrasena, correo, rol, foto, estado, ultimoAcceso) {
        this.idUsuario = idUsuario;
        this.nombreUsuario = nombreUsuario;
        this.contrasena = contrasena;
        this.correo = correo;
        this.rol = rol;
        this.foto = foto;
        this.estado = estado;
        this.ultimoAcceso = ultimoAcceso;
    }

    static async obtenerUsuarios() {
        return await fetchUsuario.obtenerUsuariosEnBDD();
    }

    static async insertarUsuario(formData) {
        return await fetchUsuario.insertarUsuarioEnBDD(formData);
    }

    static async actualizarUsuario(formData) {
        return await fetchUsuario.actualizarUsuarioEnBDD(formData);
    }

    static async deshabilitarUsuario(id) {
        return await fetchUsuario.deshabilitarUsuarioEnBDD(id);
    }

    static async habilitarUsuario(id) {
        return await fetchUsuario.habilitarUsuarioEnBDD(id);
    }
}