import 'fake-indexeddb/auto';
import { IDBFactory } from 'fake-indexeddb';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { GastoService, RELOJ } from '../../core/services/gasto.service';
import { Registro } from './registro';

describe('Registro', () => {
    let fixture: ComponentFixture<Registro>;
    let elemento: HTMLElement;

    beforeEach(async () => {
        vi.stubGlobal('indexedDB', new IDBFactory());
        await TestBed.configureTestingModule({
            imports: [Registro],
            providers: [{ provide: RELOJ, useValue: () => new Date(2026, 10, 2, 9, 15) }],
        }).compileComponents();
        fixture = TestBed.createComponent(Registro);
        elemento = fixture.nativeElement as HTMLElement;
        await fixture.whenStable();
    });

    afterEach(() => {
        vi.unstubAllGlobals();
    });

    function campo<T extends HTMLInputElement | HTMLSelectElement>(id: string): T {
        return elemento.querySelector<T>(`#${id}`)!;
    }

    function escribir(id: string, valor: string): void {
        const control = campo(id);
        control.value = valor;
        control.dispatchEvent(new Event(control instanceof HTMLSelectElement ? 'change' : 'input'));
    }

    function enviar(): void {
        elemento.querySelector('form')!.dispatchEvent(new Event('submit'));
    }

    async function esperar(comprobacion: () => void): Promise<void> {
        await vi.waitFor(() => {
            fixture.detectChanges();
            comprobacion();
        });
    }

    it('should default the date to today', () => {
        expect(campo('fecha').value).toBe('2026-11-02');
    });

    it('should show an error per field when submitting an empty form', async () => {
        enviar();

        await esperar(() => {
            expect(elemento.querySelector('#error-descripcion')).not.toBeNull();
            expect(elemento.querySelector('#error-monto')).not.toBeNull();
            expect(elemento.querySelector('#error-categoria')).not.toBeNull();
            expect(elemento.querySelector('#error-fecha')).toBeNull();
        });
        expect(TestBed.inject(GastoService).gastos()).toEqual([]);
    });

    it('should clear a field error once it is corrected', async () => {
        enviar();
        await esperar(() => expect(elemento.querySelector('#error-descripcion')).not.toBeNull());

        escribir('descripcion', 'Almuerzo');

        await esperar(() => expect(elemento.querySelector('#error-descripcion')).toBeNull());
    });

    it('should preview the formatted amount', async () => {
        escribir('monto', '18000');

        await esperar(() => expect(elemento.querySelector('#ayuda-monto')?.textContent).toContain('$18.000'));
    });

    it('should save a valid gasto, clear the form and confirm', async () => {
        escribir('descripcion', 'Almuerzo');
        escribir('monto', '18.000');
        escribir('categoria', 'alimentacion');
        enviar();

        await esperar(() =>
            expect(elemento.querySelector('.confirmacion')?.textContent).toContain('Almuerzo · $18.000'),
        );
        expect(campo('descripcion').value).toBe('');
        expect(campo('monto').value).toBe('');
        expect(campo('fecha').value).toBe('2026-11-02');
        expect(TestBed.inject(GastoService).gastos()).toHaveLength(1);
    });

    it('should show a save error and keep what the user typed', async () => {
        vi.stubGlobal('indexedDB', undefined);
        escribir('descripcion', 'Almuerzo');
        escribir('monto', '18000');
        escribir('categoria', 'alimentacion');
        enviar();

        await esperar(() => expect(elemento.querySelector('.error-guardado')).not.toBeNull());
        expect(campo('descripcion').value).toBe('Almuerzo');
    });
});