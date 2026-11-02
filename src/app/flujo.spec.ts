import 'fake-indexeddb/auto';
import { IDBFactory } from 'fake-indexeddb';
import { TestBed } from '@angular/core/testing';
import { Router, provideRouter, withComponentInputBinding } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { routes } from './app.routes';
import { GastoService, RELOJ } from './core/services/gasto.service';

describe('Flujo completo', () => {
    let harness: RouterTestingHarness;

    beforeEach(async () => {
        vi.stubGlobal('indexedDB', new IDBFactory());
        TestBed.configureTestingModule({
            providers: [
                provideRouter(routes, withComponentInputBinding()),
                { provide: RELOJ, useValue: () => new Date(2026, 10, 2, 10, 0) },
            ],
        });
        await TestBed.inject(GastoService).cargar();
        harness = await RouterTestingHarness.create();
    });

    afterEach(() => {
        vi.unstubAllGlobals();
    });

    async function ir(url: string): Promise<HTMLElement> {
        await harness.navigateByUrl(url);
        return harness.routeNativeElement!;
    }

    async function esperar(comprobacion: () => void): Promise<void> {
        await vi.waitFor(() => {
            harness.detectChanges();
            comprobacion();
        });
    }

    function escribir(raiz: HTMLElement, id: string, valor: string): void {
        const control = raiz.querySelector<HTMLInputElement | HTMLSelectElement>(`#${id}`)!;
        control.value = valor;
        control.dispatchEvent(new Event(control instanceof HTMLSelectElement ? 'change' : 'input'));
    }

    function texto(raiz: HTMLElement, selector: string): string {
        return raiz.querySelector(selector)?.textContent?.replace(/\s+/g, ' ').trim() ?? '';
    }

    function boton(raiz: HTMLElement, nombre: string): HTMLButtonElement {
        const encontrado = [...raiz.querySelectorAll('button')].find((b) => b.textContent?.trim() === nombre);
        if (!encontrado) {
            throw new Error(`No hay un botón "${nombre}"`);
        }
        return encontrado;
    }

    it('should register, edit and delete a gasto keeping the totals in sync', async () => {
        let raiz = await ir('/registro');
        escribir(raiz, 'descripcion', 'Almuerzo');
        escribir(raiz, 'monto', '18000');
        escribir(raiz, 'categoria', 'alimentacion');
        raiz.querySelector('form')!.dispatchEvent(new Event('submit'));
        await esperar(() => expect(texto(raiz, '.confirmacion')).toContain('Almuerzo · $18.000'));

        raiz = await ir('/inicio');
        expect(texto(raiz, '.total')).toBe('$18.000');
        expect(texto(raiz, '.cantidad')).toBe('1 gasto');

        raiz = await ir('/historial/1');
        boton(raiz, 'Editar').click();
        await esperar(() => expect(raiz.querySelector<HTMLInputElement>('#monto')?.value).toBe('18000'));
        escribir(raiz, 'monto', '25000');
        raiz.querySelector('form')!.dispatchEvent(new Event('submit'));
        await esperar(() => expect(texto(raiz, '.monto')).toBe('$25.000'));

        raiz = await ir('/inicio');
        expect(texto(raiz, '.total')).toBe('$25.000');

        raiz = await ir('/historial/1');
        boton(raiz, 'Eliminar').click();
        await esperar(() => expect(raiz.textContent).toContain('¿Eliminar este gasto?'));
        boton(raiz, 'Sí, eliminar').click();
        await vi.waitFor(() => expect(TestBed.inject(Router).url).toBe('/historial'));

        raiz = await ir('/inicio');
        expect(texto(raiz, '.total')).toBe('$0');
        expect(raiz.querySelector('.vacio')).not.toBeNull();
    });
});