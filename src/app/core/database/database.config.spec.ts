import 'fake-indexeddb/auto';
import { IDBFactory } from 'fake-indexeddb';
import { openDB } from 'idb';
import { Gasto } from '../models/gasto.model';
import { abrirBaseDatos, NOMBRE_BD, VERSION_BD } from './database.config';

describe('database.config', () => {
    beforeEach(() => {
        vi.stubGlobal('indexedDB', new IDBFactory());
    });

    afterEach(() => {
        vi.unstubAllGlobals();
    });

    it('should create the gastos store with an autoincrement id', async () => {
        const db = await abrirBaseDatos();
        const almacen = db.transaction('gastos').store;
        expect(almacen.keyPath).toBe('id');
        expect(almacen.autoIncrement).toBe(true);
        expect([...almacen.indexNames].sort()).toEqual(['categoria', 'fecha']);
        db.close();
    });

    it('should query a date range through the fecha index', async () => {
        const db = await abrirBaseDatos();
        for (const fecha of ['2026-10-26', '2026-10-27', '2026-11-02', '2026-11-03'] as const) {
            const gasto: Omit<Gasto, 'id'> = {
                descripcion: 'Prueba',
                monto: 1000,
                categoria: 'otros',
                fecha,
                creadoEn: '2026-11-01T12:00:00.000Z',
            };
            // El id lo asigna IndexedDB con autoIncrement.
            await db.add('gastos', gasto as Gasto);
        }

        const semana = await db.getAllFromIndex(
            'gastos',
            'fecha',
            IDBKeyRange.bound('2026-10-27', '2026-11-02'),
        );

        expect(semana.map((gasto) => gasto.fecha)).toEqual(['2026-10-27', '2026-11-02']);
        expect(semana.map((gasto) => gasto.id)).toEqual([2, 3]);
        db.close();
    });

    it('should close itself and notify when a newer version needs to open', async () => {
        const alCerrarse = vi.fn();
        await abrirBaseDatos({ alCerrarse });

        const versionNueva = await openDB(NOMBRE_BD, VERSION_BD + 1);

        expect(alCerrarse).toHaveBeenCalledOnce();
        versionNueva.close();
    });

    it('should report a database created by a newer version', async () => {
        const versionNueva = await openDB(NOMBRE_BD, VERSION_BD + 1);
        versionNueva.close();

        await expect(abrirBaseDatos()).rejects.toMatchObject({ motivo: 'version' });
    });

    it('should report when IndexedDB is unavailable', async () => {
        vi.stubGlobal('indexedDB', undefined);

        await expect(abrirBaseDatos()).rejects.toMatchObject({ motivo: 'no-disponible' });
    });
});