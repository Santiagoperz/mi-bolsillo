import { Injectable } from '@angular/core';
import { FechaLocal, Gasto, GastoSinId } from '../models/gasto.model';
import { abrirBaseDatos, BaseDatos, ErrorBaseDatos, traducirError } from '../database/database.config';

/**
 * Capa delgada sobre IndexedDB: guarda y lee gastos tal como los recibe.
 * Las validaciones y reglas de negocio están en GastoService.
 * Todos los errores salen como ErrorBaseDatos, con el error original en `cause`.
 */
@Injectable({ providedIn: 'root' })
export class AlmacenamientoService {
    private conexion: Promise<BaseDatos> | null = null;

    agregar(gasto: GastoSinId): Promise<Gasto> {
        return this.ejecutar(async (db) => {
            // El id lo asigna IndexedDB (autoIncrement), así que el objeto se guarda sin él.
            const id = await db.add('gastos', gasto as Gasto);
            return { ...gasto, id };
        });
    }

    obtener(id: number): Promise<Gasto | undefined> {
        return this.ejecutar((db) => db.get('gastos', id));
    }

    /** Todos los gastos, ordenados por fecha. */
    listar(): Promise<Gasto[]> {
        return this.ejecutar((db) => db.getAllFromIndex('gastos', 'fecha'));
    }

    /** Gastos entre dos fechas, ambas incluidas, ordenados por fecha. */
    listarPorRango(desde: FechaLocal, hasta: FechaLocal): Promise<Gasto[]> {
        return this.ejecutar((db) =>
            db.getAllFromIndex('gastos', 'fecha', IDBKeyRange.bound(desde, hasta)),
        );
    }

    actualizar(gasto: Gasto): Promise<void> {
        return this.ejecutar(async (db) => {
            const transaccion = db.transaction('gastos', 'readwrite');
            if (!(await transaccion.store.get(gasto.id))) {
                await transaccion.done;
                throw new ErrorBaseDatos('no-encontrado');
            }
            await Promise.all([transaccion.store.put(gasto), transaccion.done]);
        });
    }

    eliminar(id: number): Promise<void> {
        return this.ejecutar(async (db) => {
            const transaccion = db.transaction('gastos', 'readwrite');
            if (!(await transaccion.store.get(id))) {
                await transaccion.done;
                throw new ErrorBaseDatos('no-encontrado');
            }
            await Promise.all([transaccion.store.delete(id), transaccion.done]);
        });
    }

    private async ejecutar<T>(operacion: (db: BaseDatos) => Promise<T>): Promise<T> {
        try {
            return await operacion(await this.obtenerConexion());
        } catch (error) {
            throw traducirError(error);
        }
    }

    private obtenerConexion(): Promise<BaseDatos> {
        this.conexion ??= abrirBaseDatos({
            alCerrarse: () => {
                this.conexion = null;
            },
        }).catch((error: unknown) => {
            // No se guarda una apertura fallida: la siguiente operación vuelve a intentarlo.
            this.conexion = null;
            throw error;
        });
        return this.conexion;
    }
}