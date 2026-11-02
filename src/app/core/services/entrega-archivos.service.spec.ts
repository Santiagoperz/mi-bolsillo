import { TestBed } from '@angular/core/testing';
import { EntregaArchivosService, NAVEGADOR } from './entrega-archivos.service';

const ARCHIVO = { nombre: 'mi-bolsillo-2026-11-02.json', tipo: 'application/json', contenido: '{}' };

describe('EntregaArchivosService', () => {
    function crear(navegador: Partial<Navigator> | undefined): EntregaArchivosService {
        TestBed.configureTestingModule({ providers: [{ provide: NAVEGADOR, useValue: navegador }] });
        return TestBed.inject(EntregaArchivosService);
    }

    afterEach(() => {
        vi.restoreAllMocks();
    });

    it('should open the system share sheet when files can be shared', async () => {
        const share = vi.fn(() => Promise.resolve());
        const servicio = crear({ canShare: () => true, share });

        expect(await servicio.entregar(ARCHIVO)).toBe('compartido');
        const [{ files }] = share.mock.calls[0] as unknown as [{ files: File[] }];
        expect(files[0].name).toBe('mi-bolsillo-2026-11-02.json');
    });

    it('should do nothing when the user cancels the share sheet', async () => {
        const clic = vi.spyOn(HTMLAnchorElement.prototype, 'click');
        const servicio = crear({
            canShare: () => true,
            share: () => Promise.reject(new DOMException('Cancelado', 'AbortError')),
        });

        expect(await servicio.entregar(ARCHIVO)).toBe('cancelado');
        expect(clic).not.toHaveBeenCalled();
    });

    it('should download the file when sharing files is not supported', async () => {
        URL.createObjectURL = vi.fn(() => 'blob:mi-bolsillo');
        URL.revokeObjectURL = vi.fn();
        const clic = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => undefined);
        const servicio = crear({});

        expect(await servicio.entregar(ARCHIVO)).toBe('descargado');
        expect(clic).toHaveBeenCalledOnce();
    });
});