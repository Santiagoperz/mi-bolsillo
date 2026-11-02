import { FechaLocal } from '../models/gasto.model';

/*
 * Utilidades de fechas en hora local del dispositivo.
 * Nunca usar new Date('YYYY-MM-DD') ni toISOString() para fechas de gasto:
 * ambos trabajan en UTC, y en Colombia (UTC-5) cambian el día.
 */

const PATRON_FECHA = /^(\d{4})-(\d{2})-(\d{2})$/;

function dosDigitos(valor: number): string {
    return String(valor).padStart(2, '0');
}

/** Convierte un Date a YYYY-MM-DD usando sus componentes locales. */
export function formatearFecha(fecha: Date): FechaLocal {
    const anio = String(fecha.getFullYear()).padStart(4, '0');
    return `${anio}-${dosDigitos(fecha.getMonth() + 1)}-${dosDigitos(fecha.getDate())}` as FechaLocal;
}

/** Comprueba que el valor tenga el formato YYYY-MM-DD y sea un día que existe en el calendario. */
export function esFechaLocal(valor: unknown): valor is FechaLocal {
    if (typeof valor !== 'string') {
        return false;
    }
    const partes = PATRON_FECHA.exec(valor);
    if (!partes) {
        return false;
    }
    const anio = Number(partes[1]);
    const mes = Number(partes[2]) - 1;
    const dia = Number(partes[3]);
    const fecha = new Date(anio, mes, dia);
    return fecha.getFullYear() === anio && fecha.getMonth() === mes && fecha.getDate() === dia;
}

/** Convierte YYYY-MM-DD a un Date a medianoche local. */
export function parsearFecha(fecha: FechaLocal): Date {
    if (!esFechaLocal(fecha)) {
        throw new RangeError(`Fecha inválida: ${String(fecha)}`);
    }
    const [anio, mes, dia] = fecha.split('-').map(Number);
    return new Date(anio, mes - 1, dia);
}

export function hoy(ahora: Date = new Date()): FechaLocal {
    return formatearFecha(ahora);
}

export function desplazarDias(fecha: FechaLocal, dias: number): FechaLocal {
    const base = parsearFecha(fecha);
    return formatearFecha(new Date(base.getFullYear(), base.getMonth(), base.getDate() + dias));
}

export function desplazarSemanas(fecha: FechaLocal, semanas: number): FechaLocal {
    return desplazarDias(fecha, semanas * 7);
}

/** Mueve la fecha N meses. Si el día no existe en el mes destino, usa el último día de ese mes. */
export function desplazarMeses(fecha: FechaLocal, meses: number): FechaLocal {
    const base = parsearFecha(fecha);
    const ultimoDiaDestino = new Date(base.getFullYear(), base.getMonth() + meses + 1, 0).getDate();
    return formatearFecha(
        new Date(base.getFullYear(), base.getMonth() + meses, Math.min(base.getDate(), ultimoDiaDestino)),
    );
}

/** Lunes de la semana a la que pertenece la fecha (RN-10). */
export function inicioSemana(fecha: FechaLocal): FechaLocal {
    const diasDesdeLunes = (parsearFecha(fecha).getDay() + 6) % 7;
    return desplazarDias(fecha, -diasDesdeLunes);
}

/** Domingo de la semana a la que pertenece la fecha. */
export function finSemana(fecha: FechaLocal): FechaLocal {
    return desplazarDias(inicioSemana(fecha), 6);
}

export function inicioMes(fecha: FechaLocal): FechaLocal {
    const base = parsearFecha(fecha);
    return formatearFecha(new Date(base.getFullYear(), base.getMonth(), 1));
}

export function finMes(fecha: FechaLocal): FechaLocal {
    const base = parsearFecha(fecha);
    return formatearFecha(new Date(base.getFullYear(), base.getMonth() + 1, 0));
}

/** Instante actual como ISO 8601 en hora local con desfase, por ejemplo 2026-10-30T12:30:00-05:00 (RN-05). */
export function creadoEnLocal(ahora: Date = new Date()): string {
    const desfase = -ahora.getTimezoneOffset();
    const signo = desfase >= 0 ? '+' : '-';
    const minutosDesfase = Math.abs(desfase);
    const hora = `${dosDigitos(ahora.getHours())}:${dosDigitos(ahora.getMinutes())}:${dosDigitos(ahora.getSeconds())}`;
    const zona = `${signo}${dosDigitos(Math.floor(minutosDesfase / 60))}:${dosDigitos(minutosDesfase % 60)}`;
    return `${formatearFecha(ahora)}T${hora}${zona}`;
}