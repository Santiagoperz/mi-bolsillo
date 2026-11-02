import { CATEGORIAS, NOMBRES_CATEGORIA, esCategoria } from './categoria.model';

describe('categoria.model', () => {
    it('should define 8 unique categories', () => {
        expect(CATEGORIAS).toHaveLength(8);
        expect(new Set(CATEGORIAS).size).toBe(8);
    });

    it('should have a display name for every category', () => {
        expect(Object.keys(NOMBRES_CATEGORIA).sort()).toEqual([...CATEGORIAS].sort());
        for (const categoria of CATEGORIAS) {
            expect(NOMBRES_CATEGORIA[categoria].trim()).not.toBe('');
        }
    });

    it('should accept valid category ids', () => {
        expect(esCategoria('alimentacion')).toBe(true);
        expect(esCategoria('servicios')).toBe(true);
    });

    it('should reject display names and other values', () => {
        expect(esCategoria('Alimentación')).toBe(false);
        expect(esCategoria('')).toBe(false);
        expect(esCategoria(3)).toBe(false);
        expect(esCategoria(null)).toBe(false);
        expect(esCategoria(undefined)).toBe(false);
    });
});