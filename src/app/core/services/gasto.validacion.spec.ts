import { EntradaGasto, validarGasto } from './gasto.validacion';
import { hoy } from '../utils/fechas';

const HOY = '2026-11-02';

function entrada(cambios: Partial<EntradaGasto> = {}): EntradaGasto {
    return { descripcion: 'Almuerzo', monto: 18000, categoria: 'alimentacion', fecha: HOY, ...cambios };
}

function errores(cambios: Partial<EntradaGasto>) {
    const resultado = validarGasto(entrada(cambios), HOY);
    return resultado.valido ? {} : resultado.errores;
}

describe('validarGasto', () => {
    it('should accept a valid entry and normalize the description', () => {
        expect(validarGasto(entrada({ descripcion: '  Almuerzo   con\tamigos ' }), HOY)).toEqual({
            valido: true,
            gasto: { descripcion: 'Almuerzo con amigos', monto: 18000, categoria: 'alimentacion', fecha: HOY },
        });
    });

    it('should require a description', () => {
        expect(errores({ descripcion: '' }).descripcion).toBeDefined();
        expect(errores({ descripcion: '   ' }).descripcion).toBeDefined();
    });

    it('should limit the description to 80 characters', () => {
        expect(errores({ descripcion: 'a'.repeat(80) }).descripcion).toBeUndefined();
        expect(errores({ descripcion: 'a'.repeat(81) }).descripcion).toBeDefined();
        expect(errores({ descripcion: '🍕'.repeat(80) }).descripcion).toBeUndefined();
    });

    it('should require a safe integer amount greater than zero', () => {
        expect(errores({ monto: 1 }).monto).toBeUndefined();
        for (const monto of [0, -5000, 1500.5, Number.NaN, Number.POSITIVE_INFINITY, 2 ** 53]) {
            expect(errores({ monto }).monto).toBeDefined();
        }
    });

    it('should require a valid category id', () => {
        expect(errores({ categoria: 'transporte' }).categoria).toBeUndefined();
        expect(errores({ categoria: 'Alimentación' }).categoria).toBeDefined();
        expect(errores({ categoria: '' }).categoria).toBeDefined();
    });

    it('should accept today and past dates but not future or invalid ones', () => {
        expect(errores({ fecha: HOY }).fecha).toBeUndefined();
        expect(errores({ fecha: '2025-12-31' }).fecha).toBeUndefined();
        expect(errores({ fecha: '2026-11-03' }).fecha).toBeDefined();
        expect(errores({ fecha: '2027-11-02' }).fecha).toBeDefined();
        expect(errores({ fecha: '2026-02-30' }).fecha).toBeDefined();
        expect(errores({ fecha: '02/11/2026' }).fecha).toBeDefined();
    });

    it('should report every invalid field at once', () => {
        expect(Object.keys(errores({ descripcion: '', monto: 0, categoria: 'x', fecha: '' })).sort()).toEqual([
            'categoria',
            'descripcion',
            'fecha',
            'monto',
        ]);
    });
    it('should move the future-date limit exactly at midnight', () => {
        const casiMedianoche = hoy(new Date(2026, 10, 2, 23, 59, 59));
        const medianoche = hoy(new Date(2026, 10, 3, 0, 0, 0));
        const delDiaNuevo = entrada({ fecha: '2026-11-03' });

        expect(validarGasto(delDiaNuevo, casiMedianoche).valido).toBe(false);
        expect(validarGasto(delDiaNuevo, medianoche).valido).toBe(true);
    });
});