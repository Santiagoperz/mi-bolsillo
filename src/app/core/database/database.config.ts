import { DBSchema, IDBPDatabase, openDB } from 'idb';
import { Categoria } from '../models/categoria.model';
import { FechaLocal, Gasto } from '../models/gasto.model';

export const NOMBRE_BD = 'MiBolsilloDB';
export const VERSION_BD = 1;

export interface MiBolsilloDB extends DBSchema {
  gastos: {
    key: number;
    value: Gasto;
    indexes: {
      /** Las fechas YYYY-MM-DD se ordenan bien como texto, así que sirven para rangos de períodos. */
      fecha: FechaLocal;
      categoria: Categoria;
    };
  };
}

export type BaseDatos = IDBPDatabase<MiBolsilloDB>;

export type MotivoErrorBaseDatos = 'no-disponible' | 'cuota' | 'version' | 'desconocido';

const MENSAJES: Readonly<Record<MotivoErrorBaseDatos, string>> = {
  'no-disponible':
    'Este navegador no permite guardar datos. Si estás en navegación privada, abre la app en una ventana normal.',
  cuota: 'No hay espacio suficiente en el dispositivo para guardar los datos.',
  version: 'Los datos guardados pertenecen a una versión más nueva de la app. Recarga la app para actualizarla.',
  desconocido: 'No se pudo abrir el almacenamiento local.',
};

export class ErrorBaseDatos extends Error {
  constructor(
    readonly motivo: MotivoErrorBaseDatos,
    opciones?: { cause?: unknown },
  ) {
    super(MENSAJES[motivo], opciones);
    this.name = 'ErrorBaseDatos';
  }
}

export interface OpcionesApertura {
  /**
   * Se llama cuando la conexión deja de servir: el sistema la cerró (Safari en iOS lo hace)
   * o una versión más nueva de la app necesita migrar la base. Quien la recibe debe abrir otra.
   */
  alCerrarse?: () => void;
}

export async function abrirBaseDatos(opciones: OpcionesApertura = {}): Promise<BaseDatos> {
  if (typeof indexedDB === 'undefined') {
    throw new ErrorBaseDatos('no-disponible');
  }

  try {
    const db: BaseDatos = await openDB<MiBolsilloDB>(NOMBRE_BD, VERSION_BD, {
      upgrade: migrar,
      blocking() {
        db.close();
        opciones.alCerrarse?.();
      },
      terminated() {
        opciones.alCerrarse?.();
      },
    });
    return db;
  } catch (error) {
    throw traducirError(error);
  }
}

/**
 * Lleva la base desde la versión que tenga el dispositivo hasta VERSION_BD.
 * Los bloques ya publicados no se modifican nunca. Un cambio futuro sube VERSION_BD
 * y agrega su propio bloque: if (versionAnterior < 2) { ... }
 */
function migrar(db: BaseDatos, versionAnterior: number): void {
  if (versionAnterior < 1) {
    const gastos = db.createObjectStore('gastos', { keyPath: 'id', autoIncrement: true });
    gastos.createIndex('fecha', 'fecha');
    gastos.createIndex('categoria', 'categoria');
  }
}

function traducirError(error: unknown): ErrorBaseDatos {
  const nombre =
    typeof error === 'object' && error !== null && 'name' in error && typeof error.name === 'string'
      ? error.name
      : '';

  switch (nombre) {
    case 'QuotaExceededError':
      return new ErrorBaseDatos('cuota', { cause: error });
    case 'VersionError':
      return new ErrorBaseDatos('version', { cause: error });
    case 'InvalidStateError':
    case 'SecurityError':
      return new ErrorBaseDatos('no-disponible', { cause: error });
    default:
      return new ErrorBaseDatos('desconocido', { cause: error });
  }
}