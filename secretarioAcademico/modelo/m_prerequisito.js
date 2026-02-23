import { fetchPrerequisito } from "../../admin/servicios/fetchPrerequisitos";

export class m_prerequisito
{
    constructor (idPrerrequisito, idAsignatura, idAsignaturaRequerida) {
        this.idPrerrequisito = idPrerrequisito;
        this.idAsignatura = idAsignatura;
        this.idAsignaturaRequerida = idAsignaturaRequerida;
    }

    static async obtenerMatriculas() {
        return await fetchPrerequisito.obtenerPrerequisitosDelBackend();
    }

    static async insertarMatricula(objeto) {
        return await fetchPrerequisito.insertarPrerequisitoEnBDD(objeto);
    }

    static async actualizarMatricula(objeto) {
        return await fetchPrerequisito.actualizarPrerequisitoEnBDD(objeto);
    }
}