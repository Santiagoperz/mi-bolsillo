/** Categorías predefinidas del MVP, en el orden en que se muestran. */
export const CATEGORIAS = [
    'alimentacion',
    'transporte',
    'entretenimiento',
    'compras',
    'estudio',
    'servicios',
    'salud',
    'otros',
] as const;

/** Identificador estable de una categoría. Es el valor que se guarda en IndexedDB. */
export type Categoria = (typeof CATEGORIAS)[number];

/** Nombre visible de cada categoría. El tipo obliga a que estén las 8, ni una más ni una menos. */
export const NOMBRES_CATEGORIA: Readonly<Record<Categoria, string>> = {
    alimentacion: 'Alimentación',
    transporte: 'Transporte',
    entretenimiento: 'Entretenimiento',
    compras: 'Compras',
    estudio: 'Estudio',
    servicios: 'Servicios y facturas',
    salud: 'Salud',
    otros: 'Otros',
};

/** Comprueba en tiempo de ejecución si un valor desconocido (de IndexedDB o de un archivo importado) es una categoría válida. */
export function esCategoria(valor: unknown): valor is Categoria {
    return typeof valor === 'string' && (CATEGORIAS as readonly string[]).includes(valor);
}