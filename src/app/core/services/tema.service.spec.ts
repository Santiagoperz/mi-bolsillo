import { TestBed } from '@angular/core/testing';
import { TemaService, resolverTema } from './tema.service';

describe('TemaService', () => {
    let oyente: ((evento: { matches: boolean }) => void) | null;

    function simularSistema(claro: boolean): void {
        oyente = null;
        vi.stubGlobal('matchMedia', () => ({
            matches: claro,
            addEventListener: (_tipo: string, funcion: (evento: { matches: boolean }) => void) => {
                oyente = funcion;
            },
        }));
    }

    function crear(): TemaService {
        const servicio = TestBed.inject(TemaService);
        TestBed.tick();
        return servicio;
    }

    function temaAplicado(): string | null {
        return document.documentElement.getAttribute('data-tema');
    }

    beforeEach(() => {
        localStorage.clear();
        document.documentElement.removeAttribute('data-tema');
        simularSistema(false);
    });

    afterEach(() => {
        vi.unstubAllGlobals();
    });

    it('should resolve the automatic theme from the system mode', () => {
        expect(resolverTema('automatico', false)).toBe('ciruela');
        expect(resolverTema('automatico', true)).toBe('lavanda');
        expect(resolverTema('medianoche', true)).toBe('medianoche');
    });

    it('should apply Ciruela when nothing has been chosen', () => {
        const servicio = crear();

        expect(servicio.preferencia()).toBe('ciruela');
        expect(temaAplicado()).toBe('ciruela');
    });

    it('should apply and remember the chosen theme', () => {
        const servicio = crear();

        servicio.elegir('algodon');
        TestBed.tick();

        expect(temaAplicado()).toBe('algodon');
        expect(localStorage.getItem('mi-bolsillo:tema')).toBe('algodon');
    });

    it('should start with the saved theme and ignore invalid values', () => {
        localStorage.setItem('mi-bolsillo:tema', 'medianoche');
        expect(crear().tema()).toBe('medianoche');

        TestBed.resetTestingModule();
        localStorage.setItem('mi-bolsillo:tema', 'arcoiris');
        expect(crear().tema()).toBe('ciruela');
    });

    it('should follow the system when it switches between light and dark in automatic mode', () => {
        const servicio = crear();
        servicio.elegir('automatico');
        TestBed.tick();
        expect(temaAplicado()).toBe('ciruela');

        oyente?.({ matches: true });
        TestBed.tick();

        expect(temaAplicado()).toBe('lavanda');
    });
});