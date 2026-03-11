import { fetchPrerequisito } from "../servicios/fetchPrerequisitos.js";


export class m_prerequisito
{
    constructor (idPrerrequisito, idAsignatura, idAsignaturaRequerida) {
        this.idPrerrequisito = idPrerrequisito;
        this.idAsignatura = idAsignatura;
        this.idAsignaturaRequerida = idAsignaturaRequerida;
    }

    static async obtenerPrerequisito() {
        return await fetchPrerequisito.obtenerPrerequisitosDelBackend();
    }

    static async insertarPrerequisito(objeto) {
        return await fetchPrerequisito.insertarPrerequisitoEnBDD(objeto);
    }

    static async actualizarPrerequisito(objeto) {
        return await fetchPrerequisito.actualizarPrerequisitoEnBDD(objeto);
    }
}