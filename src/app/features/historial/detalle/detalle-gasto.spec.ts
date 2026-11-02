import 'fake-indexeddb/auto';
import { IDBFactory } from 'fake-indexeddb';
import { TestBed } from '@angular/core/testing';
import { Router, provideRouter, withComponentInputBinding } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { AlmacenamientoService } from '../../../core/services/almacenamiento.service';
import { GastoService, RELOJ } from '../../../core/services/gasto.service';
import { Historial } from '../historial';
import { DetalleGasto } from './detalle-gasto';

describe('DetalleGasto', () => {
    let harness: RouterTestingHarness;
    let almacenamiento: AlmacenamientoService;

    beforeEach(async () => {
        vi.stubGlobal('indexedDB', new IDBFactory());
        TestBed.configureTestingModule({
            providers: [
                provideRouter(
                    [
                        { path: 'historial', component: Historial },
                        { path: 'historial/:id', component: DetalleGasto },
                    ],
                    withComponentInputBinding(),
                ),
                { provide: RELOJ, useValue: () => new Date(2026, 10, 2, 10, 0) },
            ],
        });
        almacenamiento = TestBed.inject(AlmacenamientoService);
        await almacenamiento.agregar({
            descripcion: 'Almuerzo',
            monto: 18000,
            categoria: 'alimentacion',
            fecha: '2026-11-02',
            creadoEn: '2026-11-02T09:15:00-05:00',
        });
        await TestBed.inject(GastoService).cargar();
    });

    afterEach(() => {
        vi.unstubAllGlobals();
    });

    async function abrir(url: string): Promise<HTMLElement> {
        harness = await RouterTestingHarness.create();
        await harness.navigateByUrl(url);
        return harness.routeNativeElement!;
    }

    async function esperar(comprobacion: () => void): Promise<void> {
        await vi.waitFor(() => {
            harness.detectChanges();
            comprobacion();
        });
    }

    function boton(raiz: HTMLElement, texto: string): HTMLButtonElement {
        const encontrado = [...raiz.querySelectorAll('button')].find((b) => b.textContent?.trim() === texto);
        if (!encontrado) {
            throw new Error(`No hay un botón "${texto}"`);
        }
        return encontrado;
    }

    it('should show the gasto details', async () => {
        const raiz = await abrir('/historial/1');

        expect(raiz.querySelector('h1')?.textContent).toBe('Almuerzo');
        expect(raiz.querySelector('.monto')?.textContent).toBe('$18.000');
        expect(raiz.textContent).toContain('Alimentación');
        expect(raiz.textContent).toContain('2 nov 2026, 9:15 a. m.');
    });

    it('should report a gasto that does not exist', async () => {
        const raiz = await abrir('/historial/99');

        expect(raiz.querySelector('.no-encontrado')).not.toBeNull();
    });

    it('should edit the gasto with the shared form and show the new values', async () => {
        const raiz = await abrir('/historial/1');
        boton(raiz, 'Editar').click();
        await esperar(() => expect(raiz.querySelector<HTMLInputElement>('#monto')?.value).toBe('18000'));

        const monto = raiz.querySelector<HTMLInputElement>('#monto')!;
        monto.value = '20000';
        monto.dispatchEvent(new Event('input'));
        raiz.querySelector('form')!.dispatchEvent(new Event('submit'));

        await esperar(() => expect(raiz.querySelector('.monto')?.textContent).toBe('$20.000'));
        expect((await almacenamiento.obtener(1))?.monto).toBe(20000);
    });

    it('should ask for confirmation and keep the gasto when cancelled', async () => {
        const raiz = await abrir('/historial/1');
        boton(raiz, 'Eliminar').click();
        await esperar(() => expect(raiz.textContent).toContain('¿Eliminar este gasto?'));

        boton(raiz, 'Cancelar').click();

        await esperar(() => expect(raiz.textContent).not.toContain('¿Eliminar este gasto?'));
        expect(await almacenamiento.obtener(1)).toBeDefined();
    });

    it('should delete after confirming and go back to the history', async () => {
        const raiz = await abrir('/historial/1');
        boton(raiz, 'Eliminar').click();
        await esperar(() => expect(raiz.textContent).toContain('¿Eliminar este gasto?'));

        boton(raiz, 'Sí, eliminar').click();

        await vi.waitFor(() => expect(TestBed.inject(Router).url).toBe('/historial'));
        expect(await almacenamiento.obtener(1)).toBeUndefined();
        expect(TestBed.inject(GastoService).gastos()).toEqual([]);
    });
});