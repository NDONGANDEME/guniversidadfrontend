export class m_asistencia
{
    constructor(idAsistencia, idClase, idEstudiante, fecha, horaEntrada, horaSalida, estado, justificacion) {
        this.idAsistencia = idAsistencia;
        this.idClase = idClase;
        this.idEstudiante = idEstudiante;
        this.fecha = fecha;
        this.horaEntrada = horaEntrada;
        this.horaSalida = horaSalida;
        this.estado = estado;
        this.justificacion = justificacion;
    }
}

/**
 * Notas
 * Los estados pueden ser: Presente, Ausente, Tardanza, Justificado
*/