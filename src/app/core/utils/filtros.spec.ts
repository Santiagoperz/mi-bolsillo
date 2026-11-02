import { Gasto } from '../models/gasto.model';
import { OpcionesFiltro, construirFiltro, filtrarGastos } from './filtros';

function gasto(id: number, categoria: Gasto['categoria'], fecha: Gasto['fecha']): Gasto {
    return { id, descripcion: `Gasto ${id}`, monto: 1000, categoria, fecha, creadoEn: `${fecha}T12:00:00-05:00` };
}

const GASTOS: Gasto[] = [
    gasto(1, 'alimentacion', '2026-11-01'),
    gasto(2, 'transporte', '2026-10-30'),
    gasto(3, 'alimentacion', '2026-10-26'),
    gasto(4, 'alimentacion', '2026-10-20'),
];

function opciones(cambios: Partial<OpcionesFiltro>): OpcionesFiltro {
    return { categoria: '', periodo: 'todo', referencia: '', desde: '', hasta: '', ...cambios };
}

function ids(gastos: Gasto[]): number[] {
    return gastos.map((g) => g.id);
}

describe('filtros', () => {
    it('should filter by category', () => {
        expect(ids(filtrarGastos(GASTOS, { categoria: 'transporte', desde: null, hasta: null }))).toEqual([2]);
    });

    it('should filter by a single day and by an inclusive range', () => {
        expect(ids(filtrarGastos(GASTOS, { categoria: null, desde: '2026-10-30', hasta: '2026-10-30' }))).toEqual([2]);
        expect(ids(filtrarGastos(GASTOS, { categoria: null, desde: '2026-10-26', hasta: '2026-11-01' }))).toEqual([1, 2, 3]);
    });

    it('should combine category and dates', () => {
        expect(
            ids(filtrarGastos(GASTOS, { categoria: 'alimentacion', desde: '2026-10-26', hasta: '2026-11-01' })),
        ).toEqual([1, 3]);
    });

    it('should turn the chosen period into a date range', () => {
        expect(construirFiltro(opciones({}))).toEqual({ categoria: null, desde: null, hasta: null });
        expect(construirFiltro(opciones({ periodo: 'dia', referencia: '2026-10-30' }))).toMatchObject({
            desde: '2026-10-30',
            hasta: '2026-10-30',
        });
        expect(construirFiltro(opciones({ periodo: 'semana', referencia: '2026-10-30' }))).toMatchObject({
            desde: '2026-10-26',
            hasta: '2026-11-01',
        });
        expect(construirFiltro(opciones({ periodo: 'mes', referencia: '2026-02-10' }))).toMatchObject({
            desde: '2026-02-01',
            hasta: '2026-02-28',
        });
        expect(
            construirFiltro(opciones({ periodo: 'rango', desde: '2026-11-01', hasta: '2026-10-26' })),
        ).toMatchObject({ desde: '2026-10-26', hasta: '2026-11-01' });
        expect(construirFiltro(opciones({ periodo: 'rango', desde: '2026-10-26' }))).toMatchObject({
            desde: '2026-10-26',
            hasta: null,
        });
        expect(construirFiltro(opciones({ periodo: 'semana', referencia: '' }))).toMatchObject({
            desde: null,
            hasta: null,
        });
        expect(construirFiltro(opciones({ categoria: 'Alimentación' })).categoria).toBeNull();
    });
});