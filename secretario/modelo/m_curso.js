export class m_curso
{
    constructor(idCurso, NombreCurso, CreditosCurso, idCarrera, idSemestre)
    {
        this.idCurso = idCurso || null;
        this.NombreCurso = NombreCurso || null;
        this.CreditosCurso = CreditosCurso || null;
        this.idCarrera = idCarrera || null;
        this.idSemestre = idSemestre || null;
    }



    // lista estatica de Cursos
    static listaCursosEstaticas()
    {
        let cursos = [
            { id: 1, nombre: "Primero" },
            { id: 2, nombre: "Segundo" },
            { id: 3, nombre: "Tercero" },
            { id: 4, nombre: "Cuarto" },
            { id: 5, nombre: "Quinto" },
            { id: 6, nombre: "Sexto" }
        ];
        
        return cursos;
    }
}