import 'fake-indexeddb/auto';
import { IDBFactory } from 'fake-indexeddb';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { AlmacenamientoService } from '../../core/services/almacenamiento.service';
import { GastoService, RELOJ } from '../../core/services/gasto.service';
import { Historial } from './historial';

describe('Historial', () => {
    let fixture: ComponentFixture<Historial>;
    let elemento: HTMLElement;

    beforeEach(() => {
        vi.stubGlobal('indexedDB', new IDBFactory());
        TestBed.configureTestingModule({
            imports: [Historial],
            providers: [provideRouter([]), { provide: RELOJ, useValue: () => new Date(2026, 10, 2, 10, 0) }],
        });
    });

    afterEach(() => {
        vi.unstubAllGlobals();
    });

    async function sembrar(): Promise<void> {
        const almacenamiento = TestBed.inject(AlmacenamientoService);
        await almacenamiento.agregar({
            descripcion: 'Mercado',
            monto: 52000,
            categoria: 'alimentacion',
            fecha: '2026-10-20',
            creadoEn: '2026-10-20T18:00:00-05:00',
        });
        await almacenamiento.agregar({
            descripcion: 'Bus',
            monto: 2950,
            categoria: 'transporte',
            fecha: '2026-10-30',
            creadoEn: '2026-10-30T08:00:00-05:00',
        });
        await almacenamiento.agregar({
            descripcion: 'Almuerzo',
            monto: 18000,
            categoria: 'alimentacion',
            fecha: '2026-11-01',
            creadoEn: '2026-11-01T12:30:00-05:00',
        });
    }

    async function renderizar(): Promise<void> {
        await TestBed.inject(GastoService).cargar();
        fixture = TestBed.createComponent(Historial);
        elemento = fixture.nativeElement as HTMLElement;
        await fixture.whenStable();
    }

    async function esperar(comprobacion: () => void): Promise<void> {
        await vi.waitFor(() => {
            fixture.detectChanges();
            comprobacion();
        });
    }

    function cambiar(selector: string, valor: string): void {
        const control = elemento.querySelector<HTMLInputElement | HTMLSelectElement>(selector)!;
        control.value = valor;
        control.dispatchEvent(new Event(control instanceof HTMLSelectElement ? 'change' : 'input'));
    }

    function textos(selector: string): string[] {
        return [...elemento.querySelectorAll(selector)].map((nodo) => nodo.textContent?.trim() ?? '');
    }

    function resumen(): string {
        return elemento.querySelector('.resumen span')?.textContent?.replace(/\s+/g, ' ').trim() ?? '';
    }

    it('should show an empty state with a link to register', async () => {
        await renderizar();

        expect(elemento.querySelector('.vacio')?.textContent).toContain('Todavía no has registrado gastos');
        expect(elemento.querySelector('.vacio a')?.getAttribute('href')).toBe('/registro');
    });

    it('should list gastos most recent first with formatted amounts', async () => {
        await sembrar();
        await renderizar();

        expect(textos('.descripcion')).toEqual(['Almuerzo', 'Bus', 'Mercado']);
        expect(textos('.monto')).toEqual(['$18.000', '$2.950', '$52.000']);
        expect(textos('.meta')[0]).toBe('Alimentación · 1 nov 2026');
        expect(resumen()).toBe('3 gastos · $72.950');
    });

    it('should show the load error message', async () => {
        vi.stubGlobal('indexedDB', undefined);
        await renderizar();

        expect(elemento.querySelector('[role="alert"]')?.textContent).toContain('no permite guardar datos');
    });

    it('should filter by category and update the summary', async () => {
        await sembrar();
        await renderizar();

        cambiar('#filtro-categoria', 'alimentacion');

        await esperar(() => expect(textos('.descripcion')).toEqual(['Almuerzo', 'Mercado']));
        expect(resumen()).toBe('2 gastos · $70.000');
    });

    it('should combine category and week filters', async () => {
        await sembrar();
        await renderizar();

        cambiar('#filtro-categoria', 'alimentacion');
        cambiar('#filtro-periodo', 'semana');
        await esperar(() => expect(elemento.querySelector('#filtro-referencia')).not.toBeNull());
        cambiar('#filtro-referencia', '2026-10-30');

        await esperar(() => expect(textos('.descripcion')).toEqual(['Almuerzo']));
        expect(elemento.querySelector('.rango')?.textContent).toBe('Del 26 oct 2026 al 1 nov 2026');
        expect(resumen()).toBe('1 gasto · $18.000');
    });

    it('should clear all filters', async () => {
        await sembrar();
        await renderizar();
        expect(textos('.resumen button')).toEqual([]);

        cambiar('#filtro-categoria', 'transporte');
        await esperar(() => expect(textos('.descripcion')).toEqual(['Bus']));
        elemento.querySelector<HTMLButtonElement>('.resumen button')!.click();

        await esperar(() => expect(textos('.descripcion')).toEqual(['Almuerzo', 'Bus', 'Mercado']));
        expect(textos('.resumen button')).toEqual([]);
    });

    it('should say when no gasto matches the filters', async () => {
        await sembrar();
        await renderizar();

        cambiar('#filtro-categoria', 'salud');

        await esperar(() => expect(elemento.querySelector('.sin-resultados')).not.toBeNull());
        expect(resumen()).toBe('0 gastos · $0');
    });
});