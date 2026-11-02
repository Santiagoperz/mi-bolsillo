import 'fake-indexeddb/auto';
import { IDBFactory } from 'fake-indexeddb';
import { computed } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { EstadisticasService } from './estadisticas.service';
import { GastoService, RELOJ } from './gasto.service';

describe('EstadisticasService', () => {
    beforeEach(() => {
        vi.stubGlobal('indexedDB', new IDBFactory());
        TestBed.configureTestingModule({
            providers: [{ provide: RELOJ, useValue: () => new Date(2026, 10, 2, 10, 0) }],
        });
    });

    afterEach(() => {
        vi.unstubAllGlobals();
    });

    it('should recalculate totals after registering, editing and deleting (RN-07, RN-09)', async () => {
        const estadisticas = TestBed.inject(EstadisticasService);
        const gastos = TestBed.inject(GastoService);
        const totalHoy = computed(() => estadisticas.resumen('dia', '2026-11-02').total);
        const entrada = { descripcion: 'Almuerzo', monto: 18000, categoria: 'alimentacion', fecha: '2026-11-02' };

        expect(totalHoy()).toBe(0);

        const resultado = await gastos.registrar(entrada);
        expect(totalHoy()).toBe(18000);

        const id = resultado.estado === 'guardado' ? resultado.gasto.id : -1;
        await gastos.actualizar(id, { ...entrada, monto: 20000 });
        expect(totalHoy()).toBe(20000);

        await gastos.eliminar(id);
        expect(totalHoy()).toBe(0);
    });
});