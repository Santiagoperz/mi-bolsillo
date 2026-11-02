import {
    creadoEnLocal,
    desplazarDias,
    desplazarMeses,
    desplazarSemanas,
    esFechaLocal,
    finMes,
    finSemana,
    formatearFecha,
    hoy,
    inicioMes,
    inicioSemana,
    parsearFecha,
    formatearFechaCorta,
} from './fechas';

describe('fechas', () => {
    it('should run in the America/Bogota time zone (UTC-5)', () => {
        // Si falla, las pruebas no se están ejecutando con TZ=America/Bogota
        // y no detectarían errores de zona horaria.
        expect(new Date(2026, 0, 1).getTimezoneOffset()).toBe(300);
    });

    it('should format using local components, not UTC', () => {
        // 23:59 en Bogotá ya es el día 31 en UTC.
        expect(formatearFecha(new Date(2026, 9, 30, 23, 59))).toBe('2026-10-30');
        expect(formatearFecha(new Date(2026, 0, 5))).toBe('2026-01-05');
    });

    it('should parse to local midnight of the same day', () => {
        // new Date('2026-10-30') daría el 29 a las 19:00 en Bogotá.
        const fecha = parsearFecha('2026-10-30');
        expect(fecha.getFullYear()).toBe(2026);
        expect(fecha.getMonth()).toBe(9);
        expect(fecha.getDate()).toBe(30);
        expect(fecha.getHours()).toBe(0);
    });

    it('should validate real calendar dates', () => {
        expect(esFechaLocal('2026-10-30')).toBe(true);
        expect(esFechaLocal('2028-02-29')).toBe(true);
        expect(esFechaLocal('2026-02-29')).toBe(false);
        expect(esFechaLocal('2026-02-30')).toBe(false);
        expect(esFechaLocal('2026-13-01')).toBe(false);
        expect(esFechaLocal('2026-1-5')).toBe(false);
        expect(esFechaLocal('30/10/2026')).toBe(false);
        expect(esFechaLocal(20261030)).toBe(false);
        expect(esFechaLocal(null)).toBe(false);
    });

    it('should return today from a local instant', () => {
        // 23:30 del 1 de noviembre en Bogotá ya es 2 de noviembre en UTC.
        expect(hoy(new Date(2026, 10, 1, 23, 30))).toBe('2026-11-01');
    });

    it('should go from sunday to the next week on monday', () => {
        expect(inicioSemana('2026-10-30')).toBe('2026-10-26');
        expect(inicioSemana('2026-11-01')).toBe('2026-10-26');
        expect(finSemana('2026-11-01')).toBe('2026-11-01');
        expect(inicioSemana('2026-11-02')).toBe('2026-11-02');
        expect(finSemana('2026-11-02')).toBe('2026-11-08');
    });

    it('should handle weeks that cross a month or a year', () => {
        expect(finSemana('2026-10-26')).toBe('2026-11-01');
        expect(inicioSemana('2027-01-01')).toBe('2026-12-28');
        expect(finSemana('2026-12-31')).toBe('2027-01-03');
    });

    it('should compute month bounds, including leap years', () => {
        expect(inicioMes('2026-10-30')).toBe('2026-10-01');
        expect(finMes('2026-10-30')).toBe('2026-10-31');
        expect(finMes('2026-02-10')).toBe('2026-02-28');
        expect(finMes('2028-02-10')).toBe('2028-02-29');
        expect(finMes('2026-12-15')).toBe('2026-12-31');
    });

    it('should shift days across months, years and leap days', () => {
        expect(desplazarDias('2026-10-31', 1)).toBe('2026-11-01');
        expect(desplazarDias('2026-12-31', 1)).toBe('2027-01-01');
        expect(desplazarDias('2026-03-01', -1)).toBe('2026-02-28');
        expect(desplazarDias('2028-03-01', -1)).toBe('2028-02-29');
    });

    it('should shift weeks across a year', () => {
        expect(desplazarSemanas('2026-12-28', 1)).toBe('2027-01-04');
        expect(desplazarSemanas('2027-01-04', -1)).toBe('2026-12-28');
    });

    it('should shift months, clamping to the last day of the target month', () => {
        expect(desplazarMeses('2026-03-31', -1)).toBe('2026-02-28');
        expect(desplazarMeses('2028-01-31', 1)).toBe('2028-02-29');
        expect(desplazarMeses('2026-12-15', 1)).toBe('2027-01-15');
        expect(desplazarMeses('2027-01-15', -1)).toBe('2026-12-15');
    });

    it('should build creadoEn in local time with the offset', () => {
        const ahora = new Date(2026, 9, 30, 12, 30, 5);
        const creadoEn = creadoEnLocal(ahora);
        expect(creadoEn).toBe('2026-10-30T12:30:05-05:00');
        expect(new Date(creadoEn).getTime()).toBe(ahora.getTime());
    });
    it('should format a short date for lists', () => {
        expect(formatearFechaCorta('2026-11-02')).toBe('2 nov 2026');
        expect(formatearFechaCorta('2027-01-05')).toBe('5 ene 2027');
    });
});