import { comparar, rangoPeriodo } from '../../core/services/estadisticas.calculos';
import { describirComparacion, etiquetaCorta, etiquetaPeriodo, formatearPorcentaje } from './periodo.textos';

const HOY = '2026-11-02';

describe('periodo.textos', () => {
    it('should label days, weeks and months relative to today', () => {
        expect(etiquetaPeriodo(rangoPeriodo('dia', HOY), HOY)).toEqual({
            titulo: 'Hoy',
            subtitulo: 'lunes, 2 nov 2026',
        });
        expect(etiquetaPeriodo(rangoPeriodo('dia', '2026-11-01'), HOY)).toEqual({
            titulo: 'Ayer',
            subtitulo: 'domingo, 1 nov 2026',
        });
        expect(etiquetaPeriodo(rangoPeriodo('dia', '2026-10-30'), HOY)).toEqual({
            titulo: 'Viernes, 30 oct 2026',
            subtitulo: null,
        });
        expect(etiquetaPeriodo(rangoPeriodo('semana', HOY), HOY)).toEqual({
            titulo: 'Esta semana',
            subtitulo: '2 nov 2026 – 8 nov 2026',
        });
        expect(etiquetaPeriodo(rangoPeriodo('semana', '2026-10-30'), HOY)).toEqual({
            titulo: 'Semana pasada',
            subtitulo: '26 oct 2026 – 1 nov 2026',
        });
        expect(etiquetaPeriodo(rangoPeriodo('semana', '2026-10-20'), HOY)).toEqual({
            titulo: '19 oct 2026 – 25 oct 2026',
            subtitulo: null,
        });
        expect(etiquetaPeriodo(rangoPeriodo('mes', HOY), HOY)).toEqual({
            titulo: 'Este mes',
            subtitulo: 'Noviembre 2026',
        });
        expect(etiquetaPeriodo(rangoPeriodo('mes', '2026-10-15'), HOY)).toEqual({
            titulo: 'Octubre 2026',
            subtitulo: null,
        });
    });

    it('should describe every comparison case in words', () => {
        expect(describirComparacion(comparar(20950, 40000), 'dia')).toEqual({
            texto: '$19.050 menos que el día anterior (−48 %)',
            tendencia: 'baja',
        });
        expect(describirComparacion(comparar(15000, 10000), 'semana')).toEqual({
            texto: '$5.000 más que la semana anterior (+50 %)',
            tendencia: 'sube',
        });
        expect(describirComparacion(comparar(10000, 10000), 'mes')).toEqual({
            texto: 'Igual que el mes anterior',
            tendencia: 'igual',
        });
        expect(describirComparacion(comparar(10000, 0), 'dia')).toEqual({
            texto: 'Sin gastos el día anterior',
            tendencia: 'sin-base',
        });
        expect(describirComparacion(comparar(0, 0), 'dia')).toBeNull();
    });

    it('should format percentages without decimals', () => {
        expect(formatearPorcentaje(47.625)).toBe('48 %');
        expect(formatearPorcentaje(0.3)).toBe('<1 %');
        expect(formatearPorcentaje(0)).toBe('0 %');
    });
    it('should build short labels for charts', () => {
        expect(etiquetaCorta(rangoPeriodo('mes', '2026-10-15'))).toBe('oct');
        expect(etiquetaCorta(rangoPeriodo('semana', '2026-10-30'))).toBe('26 oct');
    });
});