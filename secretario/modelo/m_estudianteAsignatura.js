export class m_estudianteAsignatura
{
    constructor(idEstudianteConvocatoria, codigo, idAsignatura, convocatoria)
    {
        this.idEstudianteConvocatoria = idEstudianteConvocatoria || null;
        this.codigo = codigo || null;
        this.idAsignatura = idAsignatura || null;
        this.convocatoria = convocatoria || null;
    }
}