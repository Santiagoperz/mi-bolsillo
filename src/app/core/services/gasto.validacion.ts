import { esCategoria } from '../models/categoria.model';
import { FechaLocal, NuevoGasto } from '../models/gasto.model';
import { esFechaLocal } from '../utils/fechas';

export const LONGITUD_MAXIMA_DESCRIPCION = 80;

/** Datos tal como llegan del formulario, todavía sin validar. */
export interface EntradaGasto {
    readonly descripcion: string;
    readonly monto: number;
    readonly categoria: string;
    readonly fecha: string;
}

export type CampoGasto = keyof EntradaGasto;

/** Un mensaje por campo con error. Los campos válidos no aparecen. */
export type ErroresGasto = Partial<Record<CampoGasto, string>>;

export type ResultadoValidacion =
    | { readonly valido: true; readonly gasto: NuevoGasto }
    | { readonly valido: false; readonly errores: ErroresGasto };

/** Quita los espacios de los extremos y deja uno solo entre palabras. */
export function normalizarDescripcion(texto: string): string {
    return texto.replace(/\s+/g, ' ').trim();
}

/**
 * Aplica RN-01, RN-02, RN-03 y RN-12. No se permiten fechas posteriores a hoy:
 * la app registra dinero ya gastado, y así se detectan errores de año.
 */
export function validarGasto(entrada: EntradaGasto, hoy: FechaLocal): ResultadoValidacion {
    const errores: ErroresGasto = {};

    const descripcion = normalizarDescripcion(entrada.descripcion);
    if (descripcion === '') {
        errores.descripcion = 'Escribe una descripción.';
    } else if ([...descripcion].length > LONGITUD_MAXIMA_DESCRIPCION) {
        errores.descripcion = `Máximo ${LONGITUD_MAXIMA_DESCRIPCION} caracteres.`;
    }

    const { monto, categoria, fecha } = entrada;

    if (!Number.isFinite(monto)) {
        errores.monto = 'Escribe un monto válido.';
    } else if (!Number.isInteger(monto)) {
        errores.monto = 'El monto debe ser en pesos enteros, sin centavos.';
    } else if (monto <= 0) {
        errores.monto = 'El monto debe ser mayor que cero.';
    } else if (!Number.isSafeInteger(monto)) {
        errores.monto = 'El monto es demasiado grande.';
    }

    if (!esCategoria(categoria)) {
        errores.categoria = 'Elige una categoría.';
    }

    if (!esFechaLocal(fecha)) {
        errores.fecha = 'Elige una fecha válida.';
    } else if (fecha > hoy) {
        errores.fecha = 'La fecha no puede ser posterior a hoy.';
    }

    if (!esCategoria(categoria) || !esFechaLocal(fecha) || Object.keys(errores).length > 0) {
        return { valido: false, errores };
    }
    return { valido: true, gasto: { descripcion, monto, categoria, fecha } };
}