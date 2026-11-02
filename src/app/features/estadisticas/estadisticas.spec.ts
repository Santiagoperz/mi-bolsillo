import 'fake-indexeddb/auto';
import { IDBFactory } from 'fake-indexeddb';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { GastoSinId } from '../../core/models/gasto.model';
import { AlmacenamientoService } from '../../core/services/almacenamiento.service';
import { GastoService, RELOJ } from '../../core/services/gasto.service';
import { Estadisticas } from './estadisticas';

// Hoy es 2 de noviembre de 2026. Totales: septiembre $30.000, octubre $77.000, noviembre $20.950.
const GASTOS: GastoSinId[] = [
    { descripcion: 'Almuerzo', monto: 18000, categoria: 'alimentacion', fecha: '2026-11-02', creadoEn: '2026-11-02T12:00:00-05:00' },
    { descripcion: 'Bus', monto: 2950, categoria: 'transporte', fecha: '2026-11-02', creadoEn: '2026-11-02T08:00:00-05:00' },
    { descripcion: 'Mercado', monto: 40000, categoria: 'alimentacion', fecha: '2026-10-20', creadoEn: '2026-10-20T18:00:00-05:00' },
    { descripcion: 'Cine', monto: 25000, categoria: 'entretenimiento', fecha: '2026-10-25', creadoEn: '2026-10-25T20:00:00-05:00' },
    { descripcion: 'Farmacia', monto: 12000, categoria: 'salud', fecha: '2026-10-05', creadoEn: '2026-10-05T09:00:00-05:00' },
    { descripcion: 'Internet', monto: 30000, categoria: 'servicios', fecha: '2026-09-10', creadoEn: '2026-09-10T10:00:00-05:00' },
];

describe('Estadisticas', () => {
    let fixture: ComponentFixture<Estadisticas>;
    let elemento: HTMLElement;

    beforeEach(() => {
        vi.stubGlobal('indexedDB', new IDBFactory());
        TestBed.configureTestingModule({
            imports: [Estadisticas],
            providers: [provideRouter([]), { provide: RELOJ, useValue: () => new Date(2026, 10, 2, 10, 0) }],
        });
    });

    afterEach(() => {
        vi.unstubAllGlobals();
    });

    async function renderizar(gastos: GastoSinId[]): Promise<void> {
        const almacenamiento = TestBed.inject(AlmacenamientoService);
        for (const gasto of gastos) {
            await almacenamiento.agregar(gasto);
        }
        await TestBed.inject(GastoService).cargar();
        fixture = TestBed.createComponent(Estadisticas);
        elemento = fixture.nativeElement as HTMLElement;
        await fixture.whenStable();
    }

    function texto(selector: string): string {
        return elemento.querySelector(selector)?.textContent?.replace(/\s+/g, ' ').trim() ?? '';
    }

    function textos(selector: string): string[] {
        return [...elemento.querySelectorAll(selector)].map((n) => n.textContent?.trim() ?? '');
    }

    function columnas(): HTMLButtonElement[] {
        return [...elemento.querySelectorAll<HTMLButtonElement>('.columna')];
    }

    it('should show an empty state when there are no gastos', async () => {
        await renderizar([]);

        expect(texto('.vacio')).toContain('Todavía no hay gastos para analizar');
    });

    it('should chart the monthly evolution and detail the current month', async () => {
        await renderizar(GASTOS);

        expect(textos('.etiqueta')).toEqual(['jun', 'jul', 'ago', 'sep', 'oct', 'nov']);
        expect(columnas()[4].querySelector<HTMLElement>('.barra')?.style.height).toBe('100%');
        expect(columnas()[5].getAttribute('aria-pressed')).toBe('true');
        expect(texto('.promedio')).toBe('Promedio: $21.325 por mes');
        expect(texto('#titulo-periodo')).toBe('Este mes');
        expect(texto('.total')).toBe('$20.950');
        expect(texto('.comparacion')).toBe('$56.050 menos que el mes anterior (−73 %)');
    });

    it('should show the distribution and top category of a selected bar', async () => {
        await renderizar(GASTOS);

        columnas()[4].click();
        await fixture.whenStable();

        expect(texto('#titulo-periodo')).toBe('Octubre 2026');
        expect(texto('.total')).toBe('$77.000');
        expect(texto('.mayor strong')).toBe('Alimentación');
        expect(textos('app-desglose-categorias .nombre')).toEqual(['Alimentación', 'Entretenimiento', 'Salud']);
        expect(texto('.comparacion')).toBe('$47.000 más que el mes anterior (+157 %)');
    });

    it('should switch to weeks ending in the current week', async () => {
        await renderizar(GASTOS);

        const semanas = [...elemento.querySelectorAll<HTMLButtonElement>('.selector button')].find(
            (b) => b.textContent?.trim() === 'Semanas',
        )!;
        semanas.click();
        await fixture.whenStable();

        const etiquetas = textos('.etiqueta');
        expect(etiquetas).toHaveLength(8);
        expect(etiquetas[0]).toBe('14 sep');
        expect(etiquetas[7]).toBe('2 nov');
        expect(texto('#titulo-periodo')).toBe('Esta semana');
        expect(texto('.total')).toBe('$20.950');
    });
});