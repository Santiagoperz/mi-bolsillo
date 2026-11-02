import 'fake-indexeddb/auto';
import { IDBFactory } from 'fake-indexeddb';
import { TestBed } from '@angular/core/testing';
import { AlmacenamientoService } from './almacenamiento.service';
import { GastoService, RELOJ } from './gasto.service';
import { EntradaGasto } from './gasto.validacion';

const AHORA = new Date(2026, 10, 2, 9, 15, 0);

function entrada(cambios: Partial<EntradaGasto> = {}): EntradaGasto {
    return { descripcion: 'Almuerzo', monto: 18000, categoria: 'alimentacion', fecha: '2026-11-02', ...cambios };
}

describe('GastoService', () => {
    let servicio: GastoService;
    let almacenamiento: AlmacenamientoService;

    beforeEach(() => {
        vi.stubGlobal('indexedDB', new IDBFactory());
        TestBed.configureTestingModule({
            providers: [{ provide: RELOJ, useValue: () => AHORA }],
        });
        servicio = TestBed.inject(GastoService);
        almacenamiento = TestBed.inject(AlmacenamientoService);
    });

    afterEach(() => {
        vi.unstubAllGlobals();
    });

    it('should register a valid gasto with an automatic local creadoEn', async () => {
        const resultado = await servicio.registrar(entrada({ descripcion: '  Almuerzo   con amigos ' }));

        expect(resultado).toEqual({
            estado: 'guardado',
            gasto: {
                id: 1,
                descripcion: 'Almuerzo con amigos',
                monto: 18000,
                categoria: 'alimentacion',
                fecha: '2026-11-02',
                creadoEn: '2026-11-02T09:15:00-05:00',
            },
        });
        expect(servicio.gastos()).toHaveLength(1);
        expect(await almacenamiento.listar()).toHaveLength(1);
    });

    it('should not save an invalid gasto', async () => {
        const resultado = await servicio.registrar(entrada({ descripcion: ' ', monto: 0 }));

        expect(resultado.estado).toBe('invalido');
        expect(servicio.gastos()).toEqual([]);
        expect(await almacenamiento.listar()).toEqual([]);
    });

    it('should keep the state ordered by fecha', async () => {
        await servicio.registrar(entrada({ fecha: '2026-11-02' }));
        await servicio.registrar(entrada({ fecha: '2026-10-30' }));

        expect(servicio.gastos().map((g) => g.fecha)).toEqual(['2026-10-30', '2026-11-02']);
    });

    it('should load stored gastos into the state', async () => {
        await almacenamiento.agregar({
            descripcion: 'Bus',
            monto: 2950,
            categoria: 'transporte',
            fecha: '2026-10-30',
            creadoEn: '2026-10-30T08:00:00-05:00',
        });

        await servicio.cargar();

        expect(servicio.gastos().map((g) => g.descripcion)).toEqual(['Bus']);
        expect(servicio.cargando()).toBe(false);
        expect(servicio.error()).toBeNull();
    });

    it('should update a gasto and keep its original creadoEn', async () => {
        const original = await almacenamiento.agregar({
            descripcion: 'Bus',
            monto: 2950,
            categoria: 'transporte',
            fecha: '2026-10-30',
            creadoEn: '2026-10-30T08:00:00-05:00',
        });
        await servicio.cargar();

        const resultado = await servicio.actualizar(
            original.id,
            entrada({ descripcion: 'Taxi', monto: 12000, categoria: 'transporte', fecha: '2026-10-30' }),
        );

        expect(resultado).toMatchObject({
            estado: 'guardado',
            gasto: { descripcion: 'Taxi', monto: 12000, creadoEn: '2026-10-30T08:00:00-05:00' },
        });
        expect(servicio.gastos()[0].monto).toBe(12000);
        expect((await almacenamiento.obtener(original.id))?.descripcion).toBe('Taxi');
    });

    it('should report a missing gasto when updating', async () => {
        expect(await servicio.actualizar(99, entrada())).toMatchObject({
            estado: 'error',
            error: { motivo: 'no-encontrado' },
        });
    });

    it('should delete a gasto from storage and state', async () => {
        const resultado = await servicio.registrar(entrada());
        const id = resultado.estado === 'guardado' ? resultado.gasto.id : -1;

        expect(await servicio.eliminar(id)).toEqual({ estado: 'eliminado' });
        expect(servicio.gastos()).toEqual([]);
        expect(await almacenamiento.obtener(id)).toBeUndefined();
    });

    it('should expose a load error without throwing', async () => {
        vi.stubGlobal('indexedDB', undefined);

        await servicio.cargar();

        expect(servicio.error()?.motivo).toBe('no-disponible');
        expect(servicio.cargando()).toBe(false);
    });
});