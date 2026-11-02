import 'fake-indexeddb/auto';
import { IDBFactory } from 'fake-indexeddb';
import { TestBed } from '@angular/core/testing';
import { ErrorBaseDatos } from '../database/database.config';
import { FechaLocal, GastoSinId } from '../models/gasto.model';
import { AlmacenamientoService } from './almacenamiento.service';

function gasto(fecha: FechaLocal): GastoSinId {
    return {
        descripcion: 'Prueba',
        monto: 1000,
        categoria: 'otros',
        fecha,
        creadoEn: '2026-11-01T12:00:00-05:00',
    };
}

describe('AlmacenamientoService', () => {
    let servicio: AlmacenamientoService;

    beforeEach(() => {
        vi.stubGlobal('indexedDB', new IDBFactory());
        servicio = TestBed.inject(AlmacenamientoService);
    });

    afterEach(() => {
        vi.unstubAllGlobals();
    });

    it('should add a gasto with an assigned id and read it back', async () => {
        const guardado = await servicio.agregar(gasto('2026-10-30'));

        expect(guardado.id).toBe(1);
        expect(await servicio.obtener(guardado.id)).toEqual(guardado);
    });

    it('should return undefined for an unknown id', async () => {
        expect(await servicio.obtener(99)).toBeUndefined();
    });

    it('should list all gastos ordered by fecha', async () => {
        await servicio.agregar(gasto('2026-11-02'));
        await servicio.agregar(gasto('2026-10-30'));
        await servicio.agregar(gasto('2026-11-01'));

        const fechas = (await servicio.listar()).map((g) => g.fecha);

        expect(fechas).toEqual(['2026-10-30', '2026-11-01', '2026-11-02']);
    });

    it('should list a date range including both ends', async () => {
        for (const fecha of ['2026-10-25', '2026-10-26', '2026-11-01', '2026-11-02'] as const) {
            await servicio.agregar(gasto(fecha));
        }

        const semana = await servicio.listarPorRango('2026-10-26', '2026-11-01');

        expect(semana.map((g) => g.fecha)).toEqual(['2026-10-26', '2026-11-01']);
    });

    it('should update an existing gasto', async () => {
        const guardado = await servicio.agregar(gasto('2026-10-30'));

        await servicio.actualizar({ ...guardado, monto: 25000 });

        expect((await servicio.obtener(guardado.id))?.monto).toBe(25000);
    });

    it('should reject updating a missing gasto without creating it', async () => {
        const inexistente = { ...gasto('2026-10-30'), id: 99 };

        await expect(servicio.actualizar(inexistente)).rejects.toMatchObject({ motivo: 'no-encontrado' });
        expect(await servicio.obtener(99)).toBeUndefined();
    });

    it('should delete a gasto and reject deleting a missing one', async () => {
        const guardado = await servicio.agregar(gasto('2026-10-30'));

        await servicio.eliminar(guardado.id);

        expect(await servicio.obtener(guardado.id)).toBeUndefined();
        await expect(servicio.eliminar(guardado.id)).rejects.toMatchObject({ motivo: 'no-encontrado' });
    });

    it('should report typed errors and retry opening after a failure', async () => {
        vi.stubGlobal('indexedDB', undefined);
        await expect(servicio.listar()).rejects.toBeInstanceOf(ErrorBaseDatos);

        vi.stubGlobal('indexedDB', new IDBFactory());
        expect(await servicio.listar()).toEqual([]);
    });
    it('should not return a deleted gasto in any query (RN-08)', async () => {
        await servicio.agregar(gasto('2026-10-26'));
        const eliminado = await servicio.agregar(gasto('2026-10-28'));
        await servicio.agregar(gasto('2026-11-01'));

        await servicio.eliminar(eliminado.id);

        expect(await servicio.obtener(eliminado.id)).toBeUndefined();
        expect((await servicio.listar()).map((g) => g.fecha)).toEqual(['2026-10-26', '2026-11-01']);
        expect((await servicio.listarPorRango('2026-10-26', '2026-11-01')).map((g) => g.id)).not.toContain(
            eliminado.id,
        );
    });
});