import { Injectable, InjectionToken, computed, inject, signal } from '@angular/core';
import { ErrorBaseDatos, traducirError } from '../database/database.config';
import { Gasto } from '../models/gasto.model';
import { creadoEnLocal, hoy } from '../utils/fechas';
import { AlmacenamientoService } from './almacenamiento.service';
import { EntradaGasto, ErroresGasto, validarGasto } from './gasto.validacion';
import { gastosNuevos } from './importacion';

/** Fuente de la hora actual. Se reemplaza en las pruebas. */
export const RELOJ = new InjectionToken<() => Date>('RELOJ', {
    providedIn: 'root',
    factory: () => () => new Date(),
});

export type ResultadoGuardado =
    | { readonly estado: 'guardado'; readonly gasto: Gasto }
    | { readonly estado: 'invalido'; readonly errores: ErroresGasto }
    | { readonly estado: 'error'; readonly error: ErrorBaseDatos };

export type ResultadoEliminacion =
    | { readonly estado: 'eliminado' }
    | { readonly estado: 'error'; readonly error: ErrorBaseDatos };

export type ModoImportacion = 'reemplazar' | 'fusionar';

export type ResultadoImportacion =
    | { readonly estado: 'importado'; readonly agregados: number; readonly omitidos: number }
    | { readonly estado: 'error'; readonly error: ErrorBaseDatos };

function ordenar(gastos: readonly Gasto[]): Gasto[] {
    return [...gastos].sort((a, b) =>
        a.fecha < b.fecha ? -1 : a.fecha > b.fecha ? 1 : a.id - b.id,
    );
}
/** Más recientes primero: fecha descendente y, en el mismo día, el último creado primero. */
function ordenarRecientes(gastos: readonly Gasto[]): Gasto[] {
    return [...gastos].sort((a, b) => {
        if (a.fecha !== b.fecha) {
            return a.fecha < b.fecha ? 1 : -1;
        }
        return Date.parse(b.creadoEn) - Date.parse(a.creadoEn) || b.id - a.id;
    });
}
/**
 * Reglas de negocio y estado de los gastos.
 * Ninguna operación lanza excepciones: el resultado indica qué pasó.
 */
@Injectable({ providedIn: 'root' })
export class GastoService {
    private readonly almacenamiento = inject(AlmacenamientoService);
    private readonly reloj = inject(RELOJ);

    private readonly _gastos = signal<readonly Gasto[]>([]);
    private readonly _cargando = signal(false);
    private readonly _error = signal<ErrorBaseDatos | null>(null);

    /** Todos los gastos, ordenados por fecha y, dentro de un día, por orden de creación. */
    readonly gastos = this._gastos.asReadonly();
    /** Los gastos en el orden del historial: los más recientes primero. */
    readonly recientes = computed(() => ordenarRecientes(this._gastos()));
    readonly cargando = this._cargando.asReadonly();
    /** Error de la última carga. Los de guardar o eliminar llegan en el resultado de cada operación. */
    readonly error = this._error.asReadonly();

    async cargar(): Promise<void> {
        this._cargando.set(true);
        try {
            this._gastos.set(await this.almacenamiento.listar());
            this._error.set(null);
        } catch (error) {
            this._error.set(traducirError(error));
        } finally {
            this._cargando.set(false);
        }
    }

    async registrar(entrada: EntradaGasto): Promise<ResultadoGuardado> {
        const ahora = this.reloj();
        const validacion = validarGasto(entrada, hoy(ahora));
        if (!validacion.valido) {
            return { estado: 'invalido', errores: validacion.errores };
        }

        try {
            const gasto = await this.almacenamiento.agregar({
                ...validacion.gasto,
                creadoEn: creadoEnLocal(ahora),
            });
            this._gastos.update((gastos) => ordenar([...gastos, gasto]));
            return { estado: 'guardado', gasto };
        } catch (error) {
            return { estado: 'error', error: traducirError(error) };
        }
    }

    /** Reemplaza los datos editables y conserva el creadoEn original. */
    async actualizar(id: number, entrada: EntradaGasto): Promise<ResultadoGuardado> {
        const validacion = validarGasto(entrada, hoy(this.reloj()));
        if (!validacion.valido) {
            return { estado: 'invalido', errores: validacion.errores };
        }

        try {
            const existente = await this.almacenamiento.obtener(id);
            if (!existente) {
                throw new ErrorBaseDatos('no-encontrado');
            }
            const gasto: Gasto = { ...validacion.gasto, id, creadoEn: existente.creadoEn };
            await this.almacenamiento.actualizar(gasto);
            this._gastos.update((gastos) => ordenar(gastos.map((g) => (g.id === id ? gasto : g))));
            return { estado: 'guardado', gasto };
        } catch (error) {
            return { estado: 'error', error: traducirError(error) };
        }
    }

    async eliminar(id: number): Promise<ResultadoEliminacion> {
        try {
            await this.almacenamiento.eliminar(id);
            this._gastos.update((gastos) => gastos.filter((g) => g.id !== id));
            return { estado: 'eliminado' };
        } catch (error) {
            return { estado: 'error', error: traducirError(error) };
        }
    }
    /**
 * reemplazar: deja exactamente la copia, con sus ids originales.
 * fusionar: añade solo los gastos de la copia que no están ya, con ids nuevos.
 */
    async importar(copia: readonly Gasto[], modo: ModoImportacion): Promise<ResultadoImportacion> {
        try {
            if (modo === 'reemplazar') {
                await this.almacenamiento.reemplazarTodo(copia);
                this._gastos.set(ordenar(copia));
                return { estado: 'importado', agregados: copia.length, omitidos: 0 };
            }

            const agregados = await this.almacenamiento.agregarVarios(gastosNuevos(this._gastos(), copia));
            this._gastos.update((gastos) => ordenar([...gastos, ...agregados]));
            return { estado: 'importado', agregados: agregados.length, omitidos: copia.length - agregados.length };
        } catch (error) {
            return { estado: 'error', error: traducirError(error) };
        }
    }
}