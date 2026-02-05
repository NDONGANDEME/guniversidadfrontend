export class m_asignatura
{
    constructor(idAsignatura, NombreAsignatura, Creditos, idProfesor, idCurso, idCarrera, idSemestre)
    {
        this.idAsignatura = idAsignatura || null;
        this.NombreAsignatura = NombreAsignatura || null;
        this.Creditos = Creditos || null;
        this.idProfesor = idProfesor || null;
        this.idCurso = idCurso || null;
        this.idCarrera = idCarrera || null;
        this.idSemestre = idSemestre || null;
    }



    // lista estatica de asignaturas
    static asignaturasEstaticas()
    {
        let listaAsignaturas = []; 

        for(let i=1; i<=100; i++){
            let creditos = Math.floor(Math.random() * 5) + 1;

            listaAsignaturas.push(
                new m_asignatura(`${i}`, `Asignatura ${i}`, `${creditos}`)
            );
        }
        return listaAsignaturas;
    }


    static asignaturasEstaticas()
    {
        let listaAsignaturas = [
            // INFORMÁTICA
            { id: 1, nombre: "Programación I", creditos: 4},
            { id: 2, nombre: "Bases de Datos", creditos: 5},
            
            // CIVIL
            { id: 6, nombre: "Mecánica de Suelos", creditos: 4},
            { id: 7, nombre: "Resistencia de Materiales", creditos: 4},
            
            // ELÉCTRICA
            { id: 11, nombre: "Circuitos Eléctricos", creditos: 3},
            { id: 12, nombre: "Electrónica Analógica", creditos: 5}
        ];
        
        return listaAsignaturas;
    }



    // lista estatica de asignaturas asignadas
    static asignaturasAsignadasEstaticas()
    {
        let listaAsignaturasAsignadas = [
            { id: 1, nombre: "Sistema de Información Web", carrera: "Informática", curso: "Primero", semestre: "Primero", profesor: "Andrés Pérez" },
            { id: 2, nombre: "Programación I", carrera: "Sistemas", curso: "Segundo", semestre: "Primero", profesor: "María Gómez" },
            { id: 3, nombre: "Bases de Datos", carrera: "Informática", curso: "Tercero", semestre: "Segundo", profesor: "Carlos Ruiz" }
        ];

        return listaAsignaturasAsignadas;
    }
}