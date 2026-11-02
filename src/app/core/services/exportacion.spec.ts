import { Gasto } from '../models/gasto.model';
import { archivoCsv, archivoJson, generarCsv } from './exportacion';

const AHORA = new Date(2026, 10, 2, 10, 0, 0);

function gasto(id: number, fecha: Gasto['fecha'], descripcion: string, monto = 18000): Gasto {
    return {
        id,
        descripcion,
        monto,
        categoria: 'alimentacion',
        fecha,
        creadoEn: `${fecha}T12:00:00-05:00`,
    };
}

const GASTOS = [gasto(2, '2026-11-02', 'Almuerzo'), gasto(1, '2026-10-30', 'Bus', 2950)];

describe('exportacion', () => {
    it('should export a versioned JSON backup ordered by fecha with every field', () => {
        const archivo = archivoJson(GASTOS, AHORA);
        const copia = JSON.parse(archivo.contenido);

        expect(archivo.nombre).toBe('mi-bolsillo-2026-11-02.json');
        expect(archivo.tipo).toBe('application/json');
        expect(copia).toEqual({
            app: 'mi-bolsillo',
            esquema: 1,
            exportadoEn: '2026-11-02T10:00:00-05:00',
            gastos: [GASTOS[1], GASTOS[0]],
        });
    });

    it('should export a CSV for Excel in es-CO', () => {
        const archivo = archivoCsv(GASTOS, AHORA);

        expect(archivo.nombre).toBe('mi-bolsillo-2026-11-02.csv');
        expect(archivo.contenido.startsWith('\uFEFF')).toBe(true);
        expect(archivo.contenido.slice(1).split('\r\n')).toEqual([
            'Fecha;Descripción;Categoría;Monto (COP);Registrado',
            '2026-10-30;Bus;Alimentación;2950;2026-10-30T12:00:00-05:00',
            '2026-11-02;Almuerzo;Alimentación;18000;2026-11-02T12:00:00-05:00',
            '',
        ]);
    });

    it('should quote fields with separators, quotes or line breaks', () => {
        const lineas = generarCsv([
            gasto(1, '2026-11-02', 'Pan; leche'),
            gasto(2, '2026-11-02', 'Regalo "sorpresa"'),
            gasto(3, '2026-11-02', 'Dos\nlíneas'),
        ]).split('\r\n');

        expect(lineas[1]).toContain(';"Pan; leche";');
        expect(lineas[2]).toContain(';"Regalo ""sorpresa""";');
        expect(lineas[3]).toContain(';"Dos\nlíneas";');
    });

    it('should neutralise descriptions that Excel would run as formulas', () => {
        const lineas = generarCsv([gasto(1, '2026-11-02', '=SUMA(A1:A9)'), gasto(2, '2026-11-02', '-500')]).split('\r\n');

        expect(lineas[1]).toContain(";'=SUMA(A1:A9);");
        expect(lineas[2]).toContain(";'-500;");
    });

    it('should export an empty list', () => {
        expect(JSON.parse(archivoJson([], AHORA).contenido).gastos).toEqual([]);
        expect(generarCsv([])).toBe('\uFEFFFecha;Descripción;Categoría;Monto (COP);Registrado\r\n');
    });
});