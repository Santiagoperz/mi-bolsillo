import { TestBed } from '@angular/core/testing';
import { SwUpdate, VersionEvent } from '@angular/service-worker';
import { Subject } from 'rxjs';
import { ActualizacionService } from './actualizacion.service';

describe('ActualizacionService', () => {
    let versionUpdates: Subject<VersionEvent>;

    function crearServicio(isEnabled: boolean): ActualizacionService {
        versionUpdates = new Subject<VersionEvent>();
        TestBed.configureTestingModule({
            providers: [
                {
                    provide: SwUpdate,
                    useValue: {
                        isEnabled,
                        versionUpdates,
                        unrecoverable: new Subject(),
                        checkForUpdate: () => Promise.resolve(false),
                    },
                },
            ],
        });
        return TestBed.inject(ActualizacionService);
    }

    const versionLista: VersionEvent = {
        type: 'VERSION_READY',
        currentVersion: { hash: 'a' },
        latestVersion: { hash: 'b' },
    };

    it('should flag a new version when VERSION_READY arrives', () => {
        const servicio = crearServicio(true);
        servicio.iniciar();
        versionUpdates.next(versionLista);
        expect(servicio.hayVersionNueva()).toBe(true);
    });

    it('should ignore other version events', () => {
        const servicio = crearServicio(true);
        servicio.iniciar();
        versionUpdates.next({ type: 'VERSION_DETECTED', version: { hash: 'b' } });
        expect(servicio.hayVersionNueva()).toBe(false);
    });

    it('should do nothing when the service worker is disabled', () => {
        const servicio = crearServicio(false);
        servicio.iniciar();
        versionUpdates.next(versionLista);
        expect(servicio.hayVersionNueva()).toBe(false);
    });
});