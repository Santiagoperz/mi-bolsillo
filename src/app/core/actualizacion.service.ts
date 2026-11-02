import { DOCUMENT, Injectable, inject, signal } from '@angular/core';
import { SwUpdate, VersionReadyEvent } from '@angular/service-worker';
import { filter } from 'rxjs';

/**
 * Estrategia de actualización de la app instalada.
 * Ver la sección "Actualizaciones" del README.
 */
@Injectable({ providedIn: 'root' })
export class ActualizacionService {
    private readonly swUpdate = inject(SwUpdate);
    private readonly document = inject(DOCUMENT);

    readonly hayVersionNueva = signal(false);

    iniciar(): void {
        if (!this.swUpdate.isEnabled) {
            return;
        }

        this.swUpdate.versionUpdates
            .pipe(filter((evento): evento is VersionReadyEvent => evento.type === 'VERSION_READY'))
            .subscribe(() => this.hayVersionNueva.set(true));

        this.swUpdate.unrecoverable.subscribe(() => this.document.location.reload());

        this.document.addEventListener('visibilitychange', () => {
            if (this.document.visibilityState === 'visible') {
                this.swUpdate.checkForUpdate().catch(() => {
                    // Sin conexión: se reintentará la próxima vez que la app vuelva a primer plano.
                });
            }
        });
    }

    actualizar(): void {
        this.document.location.reload();
    }
}