import { PesosPipe } from './pesos.pipe';

describe('PesosPipe', () => {
    it('should format amounts as Colombian pesos', () => {
        const pipe = new PesosPipe();
        expect(pipe.transform(18000)).toBe('$18.000');
        expect(pipe.transform(2950)).toBe('$2.950');
    });
});