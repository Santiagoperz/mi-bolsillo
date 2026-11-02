import { formatearPesos, parsearMonto } from './moneda';

describe('moneda', () => {
    it('should format Colombian pesos with dot thousands separators', () => {
        expect(formatearPesos(0)).toBe('$0');
        expect(formatearPesos(950)).toBe('$950');
        expect(formatearPesos(1000)).toBe('$1.000');
        expect(formatearPesos(18000)).toBe('$18.000');
        expect(formatearPesos(1234567)).toBe('$1.234.567');
    });

    it('should parse what the user types in the amount field', () => {
        expect(parsearMonto('18000')).toBe(18000);
        expect(parsearMonto('18.000')).toBe(18000);
        expect(parsearMonto('$ 18.000')).toBe(18000);
        expect(parsearMonto('1500,5')).toBe(1500.5);
        expect(parsearMonto('-500')).toBe(-500);
        expect(parsearMonto('0')).toBe(0);
        expect(parsearMonto('')).toBeNaN();
        expect(parsearMonto('abc')).toBeNaN();
    });
});