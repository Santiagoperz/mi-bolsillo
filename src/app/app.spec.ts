import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { App } from './app';
import { routes } from './app.routes';
import { Inicio } from './features/inicio/inicio';
import { Registro } from './features/registro/registro';
import { Historial } from './features/historial/historial';
import { Estadisticas } from './features/estadisticas/estadisticas';
import { provideServiceWorker } from '@angular/service-worker';
import { Title } from '@angular/platform-browser';

describe('App', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App],
      providers: [
        provideRouter(routes),
        provideServiceWorker('ngsw-worker.js', { enabled: false }),
      ],
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(App);
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should render a router outlet', async () => {
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('router-outlet')).not.toBeNull();
  });

  it('should redirect the root path to inicio', async () => {
    const harness = await RouterTestingHarness.create();
    await harness.navigateByUrl('/', Inicio);
    expect(TestBed.inject(Router).url).toBe('/inicio');
  });

  it('should redirect unknown paths to inicio', async () => {
    const harness = await RouterTestingHarness.create();
    await harness.navigateByUrl('/ruta-que-no-existe', Inicio);
    expect(TestBed.inject(Router).url).toBe('/inicio');
  });

  it('should load the registro screen', async () => {
    const harness = await RouterTestingHarness.create();
    await harness.navigateByUrl('/registro', Registro);
  });

  it('should load the historial screen', async () => {
    const harness = await RouterTestingHarness.create();
    await harness.navigateByUrl('/historial', Historial);
  });

  it('should load the estadisticas screen', async () => {
    const harness = await RouterTestingHarness.create();
    await harness.navigateByUrl('/estadisticas', Estadisticas);
  }); it('should show the four sections in the bottom bar and mark the active one', async () => {
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    const elemento = fixture.nativeElement as HTMLElement;
    const enlaces = [...elemento.querySelectorAll<HTMLAnchorElement>('nav a')];

    expect(enlaces.map((a) => a.textContent?.trim())).toEqual(['Inicio', 'Registrar', 'Historial', 'Estadísticas']);
    expect(enlaces.map((a) => a.getAttribute('href'))).toEqual(['/inicio', '/registro', '/historial', '/estadisticas']);

    await TestBed.inject(Router).navigateByUrl('/historial');
    await fixture.whenStable();

    expect(enlaces[2].getAttribute('aria-current')).toBe('page');
    expect(enlaces[0].getAttribute('aria-current')).toBeNull();
  });
  it('should set a page title for each section', async () => {
    await TestBed.inject(Router).navigateByUrl('/historial');

    expect(TestBed.inject(Title).getTitle()).toBe('Historial · Mi Bolsillo');
  });
  it('should reach the data screen instead of falling into the wildcard', async () => {
    const router = TestBed.inject(Router);

    await router.navigateByUrl('/datos');

    expect(router.url).toBe('/datos');
    expect(TestBed.inject(Title).getTitle()).toBe('Tus datos · Mi Bolsillo');
  });
});