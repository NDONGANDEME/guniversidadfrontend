export class u_verificaciones
{
    // metodo para validar el correo. Solo letras, números, @ y punto, sin espacios ni otros símbolos
    static validarCorreo(correo) 
    {
        const regex = /^[a-zA-Z0-9]+@[a-zA-Z0-9]+\.[a-zA-Z]{2,}$/;
        return regex.test(correo.trim());
    }
    

    // metodo para validar los mensajes y descripciones. Una longitud mayor que 10
    static validarMensaje(mensaje) 
    {
        return mensaje.trim().length > 10;
    }
    

    // metodo para confimacion de contraseña: deben ser iguales
    static validarConfirmacionContraseña(contraseña, confirmarContraseña)
    {
        return contraseña === confirmarContraseña;
    }


    // metodo para validar el nombre: solo se aceptan caracteres y como min 3
    static validarNombre(nombre) 
    {
        const regex = /^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]{3,50}/;
        return regex.test(nombre.trim());
    }


    // metodo para validar el texto: solo se aceptan caracteres y como min 5 y maw de 100
    static validarTexto(texto)
    {
        const regex = /^[A-Za-zÁÉÍÓÚáéíóúÑñ\d\s]{5,100}/;
        return regex.test(texto.trim());
    }

    static validarDescripcion(texto)
    {
        const regex = /^[A-Za-zÁÉÍÓÚáéíóúÑñ0-9\s.,;:¿?¡!-]{10,500}$/;
        return regex.test(texto.trim());
    }


    // metodo para validar el telefono: hecho para el formato +240 222 (555) 123 456
    static validarTelefono(telefono)
    {
        const regex = /^\+240?\s?\d{3}\s?\d{3}\s?\d{3}$/;
        return regex.test(telefono.trim());
    }


    // metodo para validar la contraseña
    static validarContraseña(contraseña) 
    {
        if (typeof contraseña !== 'string') return false;
        
        const pass = contraseña.trim();
        if (pass.length === 0) return false;
        
        // Longitud 8-128 caracteres
        if (pass.length < 8 || pass.length > 128) return false;
        
        // Contiene caracteres peligrosos para SQL?
        if (/['"\\;()]|(--)|\b(SELECT|INSERT|UPDATE|DELETE|DROP|UNION|OR|AND)\b/i.test(pass)) {
            return false;
        }
        return true;
    }


    // metodo para validar nombre o correo
    static validarNombreOCorreo(nombreOCorreo)
    {
        const regexCorreo = /^[a-zA-Z0-9]+@[a-zA-Z0-9]+\.[a-zA-Z]{2,}$/;
        const regexNombre = /^[A-Za-zÁÉÍÓÚáéíóúÑñ\s0-9_]{3,20}/;

        if (regexCorreo.test(nombreOCorreo)){
            return true;
        } else if (regexNombre.test(nombreOCorreo)){
            return true;
        }else{
            return false;
        }
    }
}