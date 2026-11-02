import 'fake-indexeddb/auto';
import { IDBFactory } from 'fake-indexeddb';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { AlmacenamientoService } from '../../core/services/almacenamiento.service';
import { GastoService } from '../../core/services/gasto.service';
import { Historial } from './historial';

describe('Historial', () => {
    beforeEach(() => {
        vi.stubGlobal('indexedDB', new IDBFactory());
        TestBed.configureTestingModule({
            imports: [Historial],
            providers: [provideRouter([])],
        });
    });

    afterEach(() => {
        vi.unstubAllGlobals();
    });

    async function renderizar(): Promise<HTMLElement> {
        const fixture = TestBed.createComponent(Historial);
        await fixture.whenStable();
        return fixture.nativeElement as HTMLElement;
    }

    function textos(elemento: HTMLElement, selector: string): string[] {
        return [...elemento.querySelectorAll(selector)].map((nodo) => nodo.textContent?.trim() ?? '');
    }

    it('should show an empty state with a link to register', async () => {
        await TestBed.inject(GastoService).cargar();

        const elemento = await renderizar();

        expect(elemento.querySelector('.vacio')?.textContent).toContain('Todavía no has registrado gastos');
        expect(elemento.querySelector('.vacio a')?.getAttribute('href')).toBe('/registro');
    });

    it('should list gastos most recent first with formatted amounts', async () => {
        const almacenamiento = TestBed.inject(AlmacenamientoService);
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
        await TestBed.inject(GastoService).cargar();

        const elemento = await renderizar();

        expect(textos(elemento, '.descripcion')).toEqual(['Almuerzo', 'Bus']);
        expect(textos(elemento, '.monto')).toEqual(['$18.000', '$2.950']);
        expect(textos(elemento, '.meta')[0]).toBe('Alimentación · 1 nov 2026');
    });

    it('should show the load error message', async () => {
        vi.stubGlobal('indexedDB', undefined);
        await TestBed.inject(GastoService).cargar();

        const elemento = await renderizar();

        expect(elemento.querySelector('[role="alert"]')?.textContent).toContain('no permite guardar datos');
    });
});