import 'fake-indexeddb/auto';
import { IDBFactory } from 'fake-indexeddb';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { AlmacenamientoService } from '../../core/services/almacenamiento.service';
import { GastoService, RELOJ } from '../../core/services/gasto.service';
import { GastoSinId } from '../../core/models/gasto.model';
import { Inicio } from './inicio';

// Hoy es lunes 2 de noviembre de 2026.
const GASTOS: GastoSinId[] = [
    { descripcion: 'Almuerzo', monto: 18000, categoria: 'alimentacion', fecha: '2026-11-02', creadoEn: '2026-11-02T12:00:00-05:00' },
    { descripcion: 'Bus', monto: 2950, categoria: 'transporte', fecha: '2026-11-02', creadoEn: '2026-11-02T08:00:00-05:00' },
    { descripcion: 'Mercado', monto: 40000, categoria: 'alimentacion', fecha: '2026-11-01', creadoEn: '2026-11-01T18:00:00-05:00' },
    { descripcion: 'Farmacia', monto: 12000, categoria: 'salud', fecha: '2026-10-26', creadoEn: '2026-10-26T09:00:00-05:00' },
    { descripcion: 'Cine', monto: 25000, categoria: 'entretenimiento', fecha: '2026-10-25', creadoEn: '2026-10-25T20:00:00-05:00' },
];

describe('Inicio', () => {
    let fixture: ComponentFixture<Inicio>;
    let elemento: HTMLElement;

    beforeEach(async () => {
        vi.stubGlobal('indexedDB', new IDBFactory());
        TestBed.configureTestingModule({
            imports: [Inicio],
            providers: [provideRouter([]), { provide: RELOJ, useValue: () => new Date(2026, 10, 2, 10, 0) }],
        });
        const almacenamiento = TestBed.inject(AlmacenamientoService);
        for (const gasto of GASTOS) {
            await almacenamiento.agregar(gasto);
        }
        await TestBed.inject(GastoService).cargar();
        fixture = TestBed.createComponent(Inicio);
        elemento = fixture.nativeElement as HTMLElement;
        await fixture.whenStable();
    });

    afterEach(() => {
        vi.unstubAllGlobals();
    });

    function texto(selector: string): string {
        return elemento.querySelector(selector)?.textContent?.replace(/\s+/g, ' ').trim() ?? '';
    }

    function boton(nombre: string): HTMLButtonElement {
        const encontrado = [...elemento.querySelectorAll('button')].find(
            (b) => b.textContent?.trim() === nombre || b.getAttribute('aria-label') === nombre,
        );
        if (!encontrado) {
            throw new Error(`No hay un botón "${nombre}"`);
        }
        return encontrado;
    }

    async function pulsar(nombre: string): Promise<void> {
        boton(nombre).click();
        await fixture.whenStable();
    }

    it('should summarise today with the category breakdown and the comparison', () => {
        expect(texto('.periodo h2')).toBe('Hoy');
        expect(texto('.total')).toBe('$20.950');
        expect(texto('.cantidad')).toBe('2 gastos');
        expect([...elemento.querySelectorAll('.categorias .nombre')].map((n) => n.textContent?.trim())).toEqual([
            'Alimentación',
            'Transporte',
        ]);
        expect(texto('.comparacion')).toBe('$19.050 menos que el día anterior (−48 %)');
        expect(elemento.querySelector('.comparacion')?.getAttribute('data-tendencia')).toBe('baja');
    });

    it('should navigate to previous days and back to today', async () => {
        expect(boton('Período siguiente').disabled).toBe(true);

        await pulsar('Período anterior');

        expect(texto('.periodo h2')).toBe('Ayer');
        expect(texto('.total')).toBe('$40.000');
        expect(texto('.cantidad')).toBe('1 gasto');
        expect(texto('.comparacion')).toBe('Sin gastos el día anterior');
        expect(boton('Período siguiente').disabled).toBe(false);

        await pulsar('Volver a hoy');

        expect(texto('.periodo h2')).toBe('Hoy');
    });

    it('should use Monday to Sunday weeks (RN-10)', async () => {
        await pulsar('Semana');
        expect(texto('.periodo h2')).toBe('Esta semana');
        expect(texto('.total')).toBe('$20.950');

        await pulsar('Período anterior');

        expect(texto('.periodo h2')).toBe('Semana pasada');
        expect(texto('.subtitulo')).toBe('26 oct 2026 – 1 nov 2026');
        expect(texto('.total')).toBe('$52.000');
        expect(texto('.cantidad')).toBe('2 gastos');
    });

    it('should show months and an empty period', async () => {
        await pulsar('Mes');
        expect(texto('.periodo h2')).toBe('Este mes');

        await pulsar('Período anterior');
        expect(texto('.periodo h2')).toBe('Octubre 2026');
        expect(texto('.total')).toBe('$37.000');

        await pulsar('Período anterior');
        expect(texto('.periodo h2')).toBe('Septiembre 2026');
        expect(texto('.total')).toBe('$0');
        expect(elemento.querySelector('.vacio')).not.toBeNull();
        expect(elemento.querySelector('.comparacion')).toBeNull();
    });
});
describe('Inicio sin almacenamiento', () => {
    afterEach(() => {
        vi.unstubAllGlobals();
    });

    it('should show the load error message', async () => {
        vi.stubGlobal('indexedDB', undefined);
        TestBed.configureTestingModule({
            imports: [Inicio],
            providers: [provideRouter([]), { provide: RELOJ, useValue: () => new Date(2026, 10, 2, 10, 0) }],
        });
        await TestBed.inject(GastoService).cargar();

        const fixture = TestBed.createComponent(Inicio);
        await fixture.whenStable();
        const elemento = fixture.nativeElement as HTMLElement;

        expect(elemento.querySelector('[role="alert"]')?.textContent).toContain('no permite guardar datos');
    });
});