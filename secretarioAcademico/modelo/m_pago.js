import { fetchPago } from "../servicios/fetchPago.js";

export class m_pago
{
    constructor (idPago, idMatricula, idFamiliar, cuota, monto, fechaPago) {
        this.idPago = idPago;
        this.idMatricula = idMatricula;
        this.idFamiliar = idFamiliar;
        this.cuota = cuota;
        this.monto = monto;
        this.fechaPago = fechaPago;
    }

    static async obtenerPagos() {
        return await fetchPago.obtenerPagosDelBackend();
    }

    static async insertarPago(objeto) {
        return await fetchPago.insertarPagoEnBDD(objeto);
    }

    static async actualizarPago(objeto) {
        return await fetchPago.actualizarPagoEnBDD(objeto);
    }

    static async eliminarPago(id) {
        return await fetchPago.eliminarPagoEnBDD(id);
    }
}