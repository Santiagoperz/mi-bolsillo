import { Gasto } from '../models/gasto.model';
import { archivoJson } from './exportacion';
import { gastosNuevos, leerCopiaSeguridad } from './importacion';

const HOY = '2026-11-02';

const ALMUERZO: Gasto = {
    id: 1,
    descripcion: 'Almuerzo',
    monto: 18000,
    categoria: 'alimentacion',
    fecha: '2026-11-02',
    creadoEn: '2026-11-02T12:00:00-05:00',
};
const BUS: Gasto = {
    id: 2,
    descripcion: 'Bus',
    monto: 2950,
    categoria: 'transporte',
    fecha: '2026-10-30',
    creadoEn: '2026-10-30T08:00:00-05:00',
};

function copia(cambios: Record<string, unknown> = {}): string {
    return JSON.stringify({
        app: 'mi-bolsillo',
        esquema: 1,
        exportadoEn: '2026-11-02T10:00:00-05:00',
        gastos: [ALMUERZO, BUS],
        ...cambios,
    });
}

function error(texto: string): string {
    const resultado = leerCopiaSeguridad(texto, HOY);
    return resultado.valido ? '' : resultado.error;
}

describe('importacion', () => {
    it('should read a valid backup and summarise it', () => {
        expect(leerCopiaSeguridad(copia(), HOY)).toEqual({
            valido: true,
            gastos: [ALMUERZO, BUS],
            resumen: {
                cantidad: 2,
                total: 20950,
                desde: '2026-10-30',
                hasta: '2026-11-02',
                exportadoEn: '2026-11-02T10:00:00-05:00',
            },
        });
    });

    it('should read exactly what the export produces', () => {
        const exportado = archivoJson([ALMUERZO, BUS], new Date(2026, 10, 2, 10, 0)).contenido;

        expect(leerCopiaSeguridad(exportado, HOY).valido).toBe(true);
        expect(leerCopiaSeguridad(`\uFEFF${exportado}`, HOY).valido).toBe(true);
    });

    it('should reject files that are not a usable backup', () => {
        expect(error('esto no es JSON')).toContain('no se pudo leer');
        expect(error(copia({ app: 'otra-app' }))).toContain('no es una copia de seguridad de Mi Bolsillo');
        expect(error(copia({ esquema: 2 }))).toContain('versión más nueva');
        expect(error(copia({ esquema: 'uno' }))).toContain('versión de formato válida');
        expect(error(copia({ gastos: [] }))).toContain('no contiene gastos');
    });

    it('should reject the whole file when one gasto is invalid, saying which one', () => {
        expect(error(copia({ gastos: [ALMUERZO, { ...BUS, monto: 0 }] }))).toBe(
            'El gasto 2 no es válido. El monto debe ser mayor que cero.',
        );
        expect(error(copia({ gastos: [ALMUERZO, { ...BUS, id: 1 }] }))).toContain('identificador inválido o repetido');
        expect(error(copia({ gastos: [{ ...ALMUERZO, creadoEn: 'ayer' }] }))).toContain('fecha de registro inválida');
        expect(error(copia({ gastos: [{ ...ALMUERZO, categoria: 'Comida' }] }))).toContain('El gasto 1 no es válido');
    });

    it('should find only the gastos that are not already in the app', () => {
        const enOtroIphone = { ...ALMUERZO, id: 9 };

        expect(gastosNuevos([ALMUERZO], [enOtroIphone, BUS])).toEqual([
            {
                descripcion: 'Bus',
                monto: 2950,
                categoria: 'transporte',
                fecha: '2026-10-30',
                creadoEn: '2026-10-30T08:00:00-05:00',
            },
        ]);
    });
});