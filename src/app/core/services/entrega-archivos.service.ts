import { DOCUMENT, Injectable, InjectionToken, inject } from '@angular/core';
import { ArchivoExportado } from './exportacion';

/** Navigator del navegador. Se reemplaza en las pruebas. */
export const NAVEGADOR = new InjectionToken<Navigator | undefined>('NAVEGADOR', {
    providedIn: 'root',
    factory: () => (typeof navigator === 'undefined' ? undefined : navigator),
});

export type ResultadoEntrega = 'compartido' | 'descargado' | 'cancelado';

/**
 * Entrega un archivo al usuario. En iPhone abre el menú Compartir del sistema
 * (Guardar en Archivos, iCloud, correo…); donde no se puede compartir archivos, lo descarga.
 */
@Injectable({ providedIn: 'root' })
export class EntregaArchivosService {
    private readonly documento = inject(DOCUMENT);
    private readonly navegador = inject(NAVEGADOR);

    async entregar(archivo: ArchivoExportado): Promise<ResultadoEntrega> {
        const fichero = new File([archivo.contenido], archivo.nombre, { type: archivo.tipo });
        const navegador = this.navegador;

        if (navegador && typeof navegador.canShare === 'function' && navegador.canShare({ files: [fichero] })) {
            try {
                await navegador.share({ files: [fichero], title: archivo.nombre });
                return 'compartido';
            } catch (error) {
                if (error instanceof DOMException && error.name === 'AbortError') {
                    return 'cancelado';
                }
                // Cualquier otro fallo al compartir: se intenta la descarga directa.
            }
        }

        this.descargar(fichero);
        return 'descargado';
    }

    private descargar(fichero: File): void {
        const url = URL.createObjectURL(fichero);
        const enlace = this.documento.createElement('a');
        enlace.href = url;
        enlace.download = fichero.name;
        this.documento.body.append(enlace);
        enlace.click();
        enlace.remove();
        setTimeout(() => URL.revokeObjectURL(url), 1000);
    }
}