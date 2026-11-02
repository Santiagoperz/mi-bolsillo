import { FechaLocal, Gasto, GastoSinId } from '../models/gasto.model';
import { VERSION_EXPORTACION } from './exportacion';
import { validarGasto } from './gasto.validacion';

export interface ResumenCopia {
    readonly cantidad: number;
    readonly total: number;
    readonly desde: FechaLocal;
    readonly hasta: FechaLocal;
    readonly exportadoEn: string | null;
}

export type ResultadoLectura =
    | { readonly valido: true; readonly gastos: readonly Gasto[]; readonly resumen: ResumenCopia }
    | { readonly valido: false; readonly error: string };

function esObjeto(valor: unknown): valor is Record<string, unknown> {
    return typeof valor === 'object' && valor !== null && !Array.isArray(valor);
}

function fallo(error: string): ResultadoLectura {
    return { valido: false, error };
}

/**
 * Lleva los gastos de una copia antigua al formato actual. Hoy solo existe el esquema 1.
 * Cuando exista el 2, se añade aquí su conversión: if (esquema < 2) { gastos = gastos.map(...) }
 */
function migrar(esquema: number, gastos: unknown[]): unknown[] {
    return esquema === VERSION_EXPORTACION ? gastos : gastos;
}

/**
 * Lee y valida una copia de seguridad completa antes de escribir nada.
 * Cada gasto pasa las mismas reglas que el formulario (RN-01 a RN-12).
 */
export function leerCopiaSeguridad(texto: string, hoy: FechaLocal): ResultadoLectura {
    let datos: unknown;
    try {
        datos = JSON.parse(texto.replace(/^\uFEFF/, ''));
    } catch {
        return fallo('El archivo no se pudo leer: no es una copia de seguridad válida.');
    }

    if (!esObjeto(datos) || datos['app'] !== 'mi-bolsillo') {
        return fallo('El archivo no es una copia de seguridad de Mi Bolsillo.');
    }

    const esquema = datos['esquema'];
    if (typeof esquema !== 'number' || !Number.isInteger(esquema) || esquema < 1) {
        return fallo('La copia no indica una versión de formato válida.');
    }
    if (esquema > VERSION_EXPORTACION) {
        return fallo('La copia se hizo con una versión más nueva de la app. Actualiza la app antes de importarla.');
    }

    const lista = datos['gastos'];
    if (!Array.isArray(lista)) {
        return fallo('La copia no contiene una lista de gastos.');
    }
    const crudos = migrar(esquema, lista);
    if (crudos.length === 0) {
        return fallo('La copia no contiene gastos.');
    }

    const gastos: Gasto[] = [];
    const ids = new Set<number>();

    for (const [indice, crudo] of crudos.entries()) {
        const posicion = indice + 1;
        if (!esObjeto(crudo)) {
            return fallo(`El gasto ${posicion} no tiene un formato válido.`);
        }

        const { id, descripcion, monto, categoria, fecha, creadoEn } = crudo;
        if (typeof id !== 'number' || !Number.isSafeInteger(id) || id < 1 || ids.has(id)) {
            return fallo(`El gasto ${posicion} tiene un identificador inválido o repetido.`);
        }
        if (typeof creadoEn !== 'string' || Number.isNaN(Date.parse(creadoEn))) {
            return fallo(`El gasto ${posicion} tiene una fecha de registro inválida.`);
        }

        const validacion = validarGasto(
            {
                descripcion: typeof descripcion === 'string' ? descripcion : '',
                monto: typeof monto === 'number' ? monto : Number.NaN,
                categoria: typeof categoria === 'string' ? categoria : '',
                fecha: typeof fecha === 'string' ? fecha : '',
            },
            hoy,
        );
        if (!validacion.valido) {
            const motivo = Object.values(validacion.errores)[0] ?? '';
            return fallo(`El gasto ${posicion} no es válido. ${motivo}`);
        }

        ids.add(id);
        gastos.push({ ...validacion.gasto, id, creadoEn });
    }

    const fechas = gastos.map((g) => g.fecha).sort();
    return {
        valido: true,
        gastos,
        resumen: {
            cantidad: gastos.length,
            total: gastos.reduce((suma, g) => suma + g.monto, 0),
            desde: fechas[0],
            hasta: fechas[fechas.length - 1],
            exportadoEn: typeof datos['exportadoEn'] === 'string' ? datos['exportadoEn'] : null,
        },
    };
}

function clave(gasto: GastoSinId): string {
    return [gasto.fecha, gasto.creadoEn, gasto.monto, gasto.categoria, gasto.descripcion].join('|');
}

/**
 * Gastos de la copia que no están ya en la app. Se comparan por contenido y no por id,
 * porque en otro dispositivo el mismo número puede corresponder a otro gasto.
 */
export function gastosNuevos(actuales: readonly Gasto[], copia: readonly Gasto[]): GastoSinId[] {
    const existentes = new Set(actuales.map(clave));
    return copia
        .filter((gasto) => !existentes.has(clave(gasto)))
        .map((gasto) => ({
            descripcion: gasto.descripcion,
            monto: gasto.monto,
            categoria: gasto.categoria,
            fecha: gasto.fecha,
            creadoEn: gasto.creadoEn,
        }));
}