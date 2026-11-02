import { DOCUMENT, Injectable, computed, effect, inject, signal } from '@angular/core';

export type Tema = 'ciruela' | 'medianoche' | 'lavanda' | 'algodon';
export type PreferenciaTema = Tema | 'automatico';

export interface OpcionTema {
    readonly valor: PreferenciaTema;
    readonly nombre: string;
    readonly descripcion: string;
    /** Colores de muestra para el selector: fondo, acento y cifras. */
    readonly muestra: readonly string[];
}

export const TEMAS: readonly OpcionTema[] = [
    { valor: 'automatico', nombre: 'Automático', descripcion: 'Sigue el modo claro u oscuro del iPhone', muestra: ['#17141f', '#f6f1fb', '#f4b8d4'] },
    { valor: 'ciruela', nombre: 'Ciruela', descripcion: 'Oscuro', muestra: ['#17141f', '#f4b8d4', '#c9b6f2'] },
    { valor: 'medianoche', nombre: 'Medianoche', descripcion: 'Oscuro', muestra: ['#0f1626', '#a9c8f5', '#b8e6d9'] },
    { valor: 'lavanda', nombre: 'Lavanda', descripcion: 'Claro', muestra: ['#f6f1fb', '#5b3fb0', '#2f5fa8'] },
    { valor: 'algodon', nombre: 'Algodón', descripcion: 'Claro', muestra: ['#fff4f6', '#b03a6e', '#7a3fa6'] },
];

const CLAVE = 'mi-bolsillo:tema';
const POR_DEFECTO: PreferenciaTema = 'ciruela';

export function esPreferenciaTema(valor: unknown): valor is PreferenciaTema {
    return TEMAS.some((opcion) => opcion.valor === valor);
}

/** Automático usa Ciruela en modo oscuro y Lavanda en modo claro. Debe coincidir con el script de index.html. */
export function resolverTema(preferencia: PreferenciaTema, sistemaClaro: boolean): Tema {
    if (preferencia === 'automatico') {
        return sistemaClaro ? 'lavanda' : 'ciruela';
    }
    return preferencia;
}

function leerPreferencia(): PreferenciaTema {
    try {
        const guardado = localStorage.getItem(CLAVE);
        return esPreferenciaTema(guardado) ? guardado : POR_DEFECTO;
    } catch {
        return POR_DEFECTO;
    }
}

/** Tema de la app: lo aplica en <html data-tema>, lo guarda en el dispositivo y sigue al sistema en modo Automático. */
@Injectable({ providedIn: 'root' })
export class TemaService {
    private readonly documento = inject(DOCUMENT);
    private readonly consultaClaro = this.documento.defaultView?.matchMedia?.('(prefers-color-scheme: light)') ?? null;

    private readonly _preferencia = signal<PreferenciaTema>(leerPreferencia());
    private readonly sistemaClaro = signal(this.consultaClaro?.matches ?? false);

    readonly preferencia = this._preferencia.asReadonly();
    readonly tema = computed(() => resolverTema(this._preferencia(), this.sistemaClaro()));

    constructor() {
        this.consultaClaro?.addEventListener('change', (evento) => this.sistemaClaro.set(evento.matches));
        effect(() => this.aplicar(this.tema()));
    }

    elegir(preferencia: PreferenciaTema): void {
        this._preferencia.set(preferencia);
        try {
            localStorage.setItem(CLAVE, preferencia);
        } catch {
            // Sin localStorage, el tema solo dura esta sesión.
        }
    }

    private aplicar(tema: Tema): void {
        const raiz = this.documento.documentElement;
        raiz.setAttribute('data-tema', tema);

        const color = getComputedStyle(raiz).getPropertyValue('--barra-estado').trim();
        if (color) {
            this.documento.querySelector('meta[name="theme-color"]')?.setAttribute('content', color);
        }
    }
}