import { TestBed } from '@angular/core/testing';
import { GESTOR_ALMACENAMIENTO, PersistenciaService, formatearBytes } from './persistencia.service';

const MB = 1024 ** 2;
const GB = 1024 ** 3;

function crearServicio(gestor: Partial<StorageManager> | undefined): PersistenciaService {
    TestBed.configureTestingModule({
        providers: [{ provide: GESTOR_ALMACENAMIENTO, useValue: gestor }],
    });
    return TestBed.inject(PersistenciaService);
}

function gestorFalso(persistido: boolean, concede: boolean) {
    return {
        persisted: vi.fn(() => Promise.resolve(persistido)),
        persist: vi.fn(() => Promise.resolve(concede)),
        estimate: vi.fn(() => Promise.resolve({ usage: 1.5 * MB, quota: 2 * GB })),
    };
}

describe('PersistenciaService', () => {
    beforeEach(() => {
        localStorage.clear();
    });

    it('should keep an existing persistence without asking again', async () => {
        const gestor = gestorFalso(true, true);
        const servicio = crearServicio(gestor);

        await servicio.verificar();

        expect(servicio.estado()).toBe('concedida');
        expect(gestor.persist).not.toHaveBeenCalled();
        expect(servicio.mostrarAviso()).toBe(false);
        expect(servicio.estimacion()).toEqual({ usado: 1.5 * MB, disponible: 2 * GB });
    });

    it('should request persistence when not yet granted', async () => {
        const gestor = gestorFalso(false, true);
        const servicio = crearServicio(gestor);

        await servicio.verificar();

        expect(gestor.persist).toHaveBeenCalledOnce();
        expect(servicio.estado()).toBe('concedida');
    });

    it('should show the notice when persistence is denied', async () => {
        const servicio = crearServicio(gestorFalso(false, false));

        await servicio.verificar();

        expect(servicio.estado()).toBe('denegada');
        expect(servicio.mostrarAviso()).toBe(true);
    });

    it('should treat a failing request as denied', async () => {
        const gestor = gestorFalso(false, false);
        gestor.persist.mockRejectedValue(new Error('fallo'));
        const servicio = crearServicio(gestor);

        await servicio.verificar();

        expect(servicio.estado()).toBe('denegada');
    });

    it('should show the notice when the storage API is unavailable', async () => {
        const servicio = crearServicio(undefined);

        await servicio.verificar();

        expect(servicio.estado()).toBe('no-soportada');
        expect(servicio.mostrarAviso()).toBe(true);
    });

    it('should remember a dismissed notice', async () => {
        const servicio = crearServicio(gestorFalso(false, false));
        await servicio.verificar();
        servicio.cerrarAviso();
        expect(servicio.mostrarAviso()).toBe(false);

        TestBed.resetTestingModule();
        const otraSesion = crearServicio(gestorFalso(false, false));
        await otraSesion.verificar();

        expect(otraSesion.mostrarAviso()).toBe(false);
    });

    it('should build a diagnostic summary', async () => {
        const servicio = crearServicio(gestorFalso(true, true));
        expect(servicio.resumen()).toBe('verificando…');

        await servicio.verificar();

        expect(servicio.resumen()).toBe('persistente · 1,5 MB usados de 2 GB');
    });

    it('should format bytes in MB or GB', () => {
        expect(formatearBytes(0)).toBe('0 MB');
        expect(formatearBytes(1.5 * MB)).toBe('1,5 MB');
        expect(formatearBytes(2 * GB)).toBe('2 GB');
    });
});