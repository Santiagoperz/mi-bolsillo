import { Injectable, InjectionToken, computed, inject, signal } from '@angular/core';

/** API de almacenamiento del navegador. Se reemplaza en las pruebas. */
export const GESTOR_ALMACENAMIENTO = new InjectionToken<StorageManager | undefined>(
    'GESTOR_ALMACENAMIENTO',
    {
        providedIn: 'root',
        factory: () => (typeof navigator === 'undefined' ? undefined : navigator.storage),
    },
);

export type EstadoPersistencia = 'pendiente' | 'concedida' | 'denegada' | 'no-soportada';

export interface EstimacionAlmacenamiento {
    readonly usado: number;
    readonly disponible: number;
}

const TEXTO_ESTADO: Readonly<Record<EstadoPersistencia, string>> = {
    pendiente: 'verificando…',
    concedida: 'persistente',
    denegada: 'no persistente',
    'no-soportada': 'sin soporte de persistencia',
};

const CLAVE_AVISO_CERRADO = 'mi-bolsillo:aviso-persistencia-cerrado';

/** Formatea bytes en MB o GB con el formato colombiano, por ejemplo '1,5 MB'. */
export function formatearBytes(bytes: number): string {
    const megas = bytes / 1024 ** 2;
    const [valor, unidad] = megas >= 1024 ? [megas / 1024, 'GB'] : [megas, 'MB'];
    return `${valor.toLocaleString('es-CO', { maximumFractionDigits: 1 })} ${unidad}`;
}

/**
 * Pide al navegador que no borre los datos locales y expone el resultado.
 * iOS puede eliminar el almacenamiento de sitios sin uso; la app instalada tiene otro trato.
 */
@Injectable({ providedIn: 'root' })
export class PersistenciaService {
    private readonly gestor = inject(GESTOR_ALMACENAMIENTO);

    private readonly _estado = signal<EstadoPersistencia>('pendiente');
    private readonly _estimacion = signal<EstimacionAlmacenamiento | null>(null);
    private readonly _avisoCerrado = signal(leerAvisoCerrado());

    readonly estado = this._estado.asReadonly();
    readonly estimacion = this._estimacion.asReadonly();

    readonly mostrarAviso = computed(
        () =>
            (this._estado() === 'denegada' || this._estado() === 'no-soportada') && !this._avisoCerrado(),
    );

    /** Texto de diagnóstico, por ejemplo 'persistente · 1,5 MB usados de 2 GB'. */
    readonly resumen = computed(() => {
        const estimacion = this._estimacion();
        const uso = estimacion
            ? ` · ${formatearBytes(estimacion.usado)} usados de ${formatearBytes(estimacion.disponible)}`
            : '';
        return `${TEXTO_ESTADO[this._estado()]}${uso}`;
    });

    /** Nunca lanza excepciones: cualquier fallo se refleja en el estado. */
    async verificar(): Promise<void> {
        const gestor = this.gestor;
        if (typeof gestor?.persisted !== 'function' || typeof gestor.persist !== 'function') {
            this._estado.set('no-soportada');
            return;
        }

        try {
            const persistente = (await gestor.persisted()) || (await gestor.persist());
            this._estado.set(persistente ? 'concedida' : 'denegada');
        } catch {
            this._estado.set('denegada');
        }

        if (typeof gestor.estimate === 'function') {
            try {
                const { usage = 0, quota = 0 } = await gestor.estimate();
                this._estimacion.set({ usado: usage, disponible: quota });
            } catch {
                // La estimación es solo informativa.
            }
        }
    }

    cerrarAviso(): void {
        this._avisoCerrado.set(true);
        try {
            localStorage.setItem(CLAVE_AVISO_CERRADO, '1');
        } catch {
            // Sin localStorage, el aviso solo queda cerrado durante esta sesión.
        }
    }
}

function leerAvisoCerrado(): boolean {
    try {
        return localStorage.getItem(CLAVE_AVISO_CERRADO) === '1';
    } catch {
        return false;
    }
}