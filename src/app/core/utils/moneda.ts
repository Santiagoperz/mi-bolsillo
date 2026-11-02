/** Formatea pesos colombianos sin decimales: 18000 → '$18.000', 1000 → '$1.000'. */
export function formatearPesos(monto: number): string {
    const signo = monto < 0 ? '-' : '';
    const digitos = String(Math.abs(Math.trunc(monto))).replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    return `${signo}$${digitos}`;
}

/**
 * Convierte lo escrito en el campo de monto a número.
 * Acepta '18000', '18.000' o '$ 18.000' (el punto separa miles en Colombia).
 * Devuelve NaN si no es un número; la validación decide si es aceptable.
 */
export function parsearMonto(texto: string): number {
    const limpio = texto.replace(/[\s$.]/g, '').replace(',', '.');
    return /^-?\d+(\.\d+)?$/.test(limpio) ? Number(limpio) : Number.NaN;
}