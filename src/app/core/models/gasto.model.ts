import { Categoria } from './categoria.model';

/** Fecha local del dispositivo en formato YYYY-MM-DD, por ejemplo '2026-10-30'. */
export type FechaLocal = `${number}-${number}-${number}`;

export interface Gasto {
    /** Clave primaria autoincremental asignada por IndexedDB. */
    readonly id: number;
    /** Concepto del gasto. Obligatorio (RN-01). */
    readonly descripcion: string;
    /** Valor en pesos colombianos (COP). Entero mayor que cero (RN-02, RN-12). */
    readonly monto: number;
    readonly categoria: Categoria;
    /** Día en que se realizó el gasto, en hora local. Se usa para todos los períodos. */
    readonly fecha: FechaLocal;
    /** Instante de creación en hora local con desfase, por ejemplo '2026-10-30T12:30:00-05:00' (RN-05). */
    readonly creadoEn: string;
}

/** Datos que introduce el usuario. El id y creadoEn se generan al guardar. */
export type NuevoGasto = Omit<Gasto, 'id' | 'creadoEn'>;