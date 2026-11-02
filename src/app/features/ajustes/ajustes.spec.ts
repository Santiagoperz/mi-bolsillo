import 'fake-indexeddb/auto';
import { IDBFactory } from 'fake-indexeddb';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { AlmacenamientoService } from '../../core/services/almacenamiento.service';
import { EntregaArchivosService } from '../../core/services/entrega-archivos.service';
import { GastoService, RELOJ } from '../../core/services/gasto.service';
import { Ajustes } from './ajustes';

describe('Ajustes', () => {
    let fixture: ComponentFixture<Ajustes>;
    let elemento: HTMLElement;
    let entregar: ReturnType<typeof vi.fn>;

    beforeEach(() => {
        vi.stubGlobal('indexedDB', new IDBFactory());
        entregar = vi.fn(() => Promise.resolve('compartido'));
        TestBed.configureTestingModule({
            imports: [Ajustes],
            providers: [
                provideRouter([]),
                { provide: RELOJ, useValue: () => new Date(2026, 10, 2, 10, 0) },
                { provide: EntregaArchivosService, useValue: { entregar } },
            ],
        });
    });

    afterEach(() => {
        vi.unstubAllGlobals();
    });

    async function renderizar(conGastos: boolean): Promise<void> {
        if (conGastos) {
            await TestBed.inject(AlmacenamientoService).agregar({
                descripcion: 'Almuerzo',
                monto: 18000,
                categoria: 'alimentacion',
                fecha: '2026-11-02',
                creadoEn: '2026-11-02T12:00:00-05:00',
            });
        }
        await TestBed.inject(GastoService).cargar();
        fixture = TestBed.createComponent(Ajustes);
        elemento = fixture.nativeElement as HTMLElement;
        await fixture.whenStable();
    }

    function boton(nombre: string): HTMLButtonElement {
        return [...elemento.querySelectorAll('button')].find((b) => b.textContent?.trim() === nombre)!;
    }

    it('should export the JSON backup and confirm it', async () => {
        await renderizar(true);
        expect(elemento.querySelector('.cantidad')?.textContent).toContain('1 gasto en la app');

        boton('Exportar copia de seguridad').click();
        await vi.waitFor(() => {
            fixture.detectChanges();
            expect(elemento.querySelector('.confirmacion')?.textContent).toContain('mi-bolsillo-2026-11-02.json');
        });

        const [archivo] = entregar.mock.calls[0];
        expect(JSON.parse(archivo.contenido)).toMatchObject({ esquema: 1, gastos: [{ descripcion: 'Almuerzo' }] });
    });

    it('should export the CSV for Excel', async () => {
        await renderizar(true);

        boton('Exportar para Excel').click();
        await vi.waitFor(() => expect(entregar).toHaveBeenCalledOnce());

        const [archivo] = entregar.mock.calls[0];
        expect(archivo.nombre).toBe('mi-bolsillo-2026-11-02.csv');
        expect(archivo.contenido).toContain('2026-11-02;Almuerzo;Alimentación;18000;');
    });

    it('should not confirm when the user cancels the share sheet', async () => {
        entregar.mockResolvedValue('cancelado');
        await renderizar(true);

        boton('Exportar copia de seguridad').click();
        await vi.waitFor(() => expect(entregar).toHaveBeenCalledOnce());
        await fixture.whenStable();

        expect(elemento.querySelector('.confirmacion')).toBeNull();
    });

    it('should say there is nothing to export yet', async () => {
        await renderizar(false);

        expect(elemento.querySelector('.vacio')?.textContent).toContain('Todavía no hay gastos para exportar');
        expect(elemento.querySelectorAll('.acciones button')).toHaveLength(0);
    });
    const COPIA = JSON.stringify({
        app: 'mi-bolsillo',
        esquema: 1,
        exportadoEn: '2026-11-02T10:00:00-05:00',
        gastos: [
            { id: 1, descripcion: 'Almuerzo', monto: 18000, categoria: 'alimentacion', fecha: '2026-11-02', creadoEn: '2026-11-02T12:00:00-05:00' },
            { id: 2, descripcion: 'Bus', monto: 2950, categoria: 'transporte', fecha: '2026-10-30', creadoEn: '2026-10-30T08:00:00-05:00' },
        ],
    });

    function elegirArchivo(contenido: string): void {
        const campo = elemento.querySelector<HTMLInputElement>('input[type="file"]')!;
        Object.defineProperty(campo, 'files', {
            value: [new File([contenido], 'copia.json', { type: 'application/json' })],
            configurable: true,
        });
        campo.dispatchEvent(new Event('change'));
    }

    async function esperar(comprobacion: () => void): Promise<void> {
        await vi.waitFor(() => {
            fixture.detectChanges();
            comprobacion();
        });
    }

    it('should restore a backup into an empty app', async () => {
        await renderizar(false);

        elegirArchivo(COPIA);
        await esperar(() => expect(elemento.querySelector('.confirmar-importacion')?.textContent).toContain('2 gastos'));
        boton('Importar').click();

        await esperar(() => expect(elemento.querySelector('.confirmacion')?.textContent).toBe('Copia restaurada: 2 gastos.'));
        expect(TestBed.inject(GastoService).gastos()).toHaveLength(2);
    });

    it('should add only the missing gastos when merging', async () => {
        await renderizar(true);

        elegirArchivo(COPIA);
        await esperar(() => expect(elemento.querySelector('.confirmar-importacion')).not.toBeNull());
        boton('Añadir los que faltan').click();

        await esperar(() =>
            expect(elemento.querySelector('.confirmacion')?.textContent).toBe('Añadido 1 gasto nuevo; 1 ya estaba.'),
        );
        expect(TestBed.inject(GastoService).gastos()).toHaveLength(2);
    });

    it('should explain why a file cannot be imported', async () => {
        await renderizar(true);

        elegirArchivo('esto no es una copia');

        await esperar(() => expect(elemento.querySelector('[role="alert"]')?.textContent).toContain('no se pudo leer'));
        expect(TestBed.inject(GastoService).gastos()).toHaveLength(1);
    });
});