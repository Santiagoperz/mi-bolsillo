import { Gasto } from '../models/gasto.model';
import {
    comparar,
    compararPeriodos,
    desplazarPeriodo,
    rangoPeriodo,
    resumirPeriodo,
    totalesPorCategoria,
} from './estadisticas.calculos';

function gasto(id: number, categoria: Gasto['categoria'], fecha: Gasto['fecha'], monto: number): Gasto {
    return { id, descripcion: `Gasto ${id}`, monto, categoria, fecha, creadoEn: `${fecha}T12:00:00-05:00` };
}

// Semana actual: lunes 2 a domingo 8 de noviembre. Semana anterior: 26 oct a 1 nov.
const GASTOS: Gasto[] = [
    gasto(1, 'alimentacion', '2026-11-02', 18000),
    gasto(2, 'transporte', '2026-11-02', 2950),
    gasto(3, 'alimentacion', '2026-10-30', 12000),
    gasto(4, 'salud', '2026-10-26', 40000),
    gasto(5, 'alimentacion', '2026-10-25', 5000),
    gasto(6, 'compras', '2026-11-08', 30000),
];

describe('estadisticas.calculos', () => {
    it('should build day, week and month ranges', () => {
        expect(rangoPeriodo('dia', '2026-11-04')).toEqual({ tipo: 'dia', desde: '2026-11-04', hasta: '2026-11-04' });
        expect(rangoPeriodo('semana', '2026-11-04')).toEqual({ tipo: 'semana', desde: '2026-11-02', hasta: '2026-11-08' });
        expect(rangoPeriodo('mes', '2026-11-04')).toEqual({ tipo: 'mes', desde: '2026-11-01', hasta: '2026-11-30' });
    });

    it('should move to previous periods across months and years', () => {
        expect(desplazarPeriodo(rangoPeriodo('dia', '2026-11-01'), -1).desde).toBe('2026-10-31');
        expect(desplazarPeriodo(rangoPeriodo('semana', '2027-01-01'), -1)).toMatchObject({
            desde: '2026-12-21',
            hasta: '2026-12-27',
        });
        expect(desplazarPeriodo(rangoPeriodo('mes', '2026-03-31'), -1)).toMatchObject({
            desde: '2026-02-01',
            hasta: '2026-02-28',
        });
        expect(desplazarPeriodo(rangoPeriodo('mes', '2027-01-15'), -1)).toMatchObject({
            desde: '2026-12-01',
            hasta: '2026-12-31',
        });
    });

    it('should compute total and count per day, week and month', () => {
        expect(resumirPeriodo(GASTOS, rangoPeriodo('dia', '2026-11-02'))).toMatchObject({ total: 20950, cantidad: 2 });
        expect(resumirPeriodo(GASTOS, rangoPeriodo('semana', '2026-11-02'))).toMatchObject({ total: 50950, cantidad: 3 });
        expect(resumirPeriodo(GASTOS, rangoPeriodo('semana', '2026-10-30'))).toMatchObject({ total: 52000, cantidad: 2 });
        expect(resumirPeriodo(GASTOS, rangoPeriodo('mes', '2026-10-15'))).toMatchObject({ total: 57000, cantidad: 3 });
        expect(resumirPeriodo(GASTOS, rangoPeriodo('dia', '2026-11-03'))).toMatchObject({
            total: 0,
            cantidad: 0,
            porCategoria: [],
        });
    });

    it('should total by category, largest first, with its share of the period', () => {
        const porCategoria = resumirPeriodo(GASTOS, rangoPeriodo('semana', '2026-11-02')).porCategoria;

        expect(porCategoria.map((c) => [c.categoria, c.total, c.cantidad])).toEqual([
            ['compras', 30000, 1],
            ['alimentacion', 18000, 1],
            ['transporte', 2950, 1],
        ]);
        expect(porCategoria[0].porcentaje).toBeCloseTo(58.88, 2);
        expect(porCategoria.reduce((suma, c) => suma + c.porcentaje, 0)).toBeCloseTo(100, 10);
    });

    it('should break ties between categories in their fixed order', () => {
        const empate = [gasto(1, 'salud', '2026-11-02', 1000), gasto(2, 'alimentacion', '2026-11-02', 1000)];

        expect(totalesPorCategoria(empate).map((c) => c.categoria)).toEqual(['alimentacion', 'salud']);
    });

    it('should compare against the previous amount without dividing by zero', () => {
        expect(comparar(1500, 1000)).toEqual({ actual: 1500, anterior: 1000, diferencia: 500, porcentaje: 50 });
        expect(comparar(500, 1000)).toMatchObject({ diferencia: -500, porcentaje: -50 });
        expect(comparar(1000, 1000)).toMatchObject({ diferencia: 0, porcentaje: 0 });
        expect(comparar(1000, 0)).toMatchObject({ diferencia: 1000, porcentaje: null });
        expect(comparar(0, 0)).toMatchObject({ diferencia: 0, porcentaje: null });
    });

    it('should compare a period with the previous one', () => {
        const { actual, anterior, comparacion } = compararPeriodos(GASTOS, rangoPeriodo('semana', '2026-11-04'));

        expect(actual.total).toBe(50950);
        expect(anterior.rango).toMatchObject({ desde: '2026-10-26', hasta: '2026-11-01' });
        expect(anterior.total).toBe(52000);
        expect(comparacion.diferencia).toBe(-1050);
        expect(comparacion.porcentaje).toBeCloseTo(-2.019, 3);
    });
});