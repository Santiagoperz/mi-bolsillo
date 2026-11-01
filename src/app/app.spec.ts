import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { App } from './app';
import { routes } from './app.routes';
import { Inicio } from './features/inicio/inicio';
import { Registro } from './features/registro/registro';
import { Historial } from './features/historial/historial';
import { Estadisticas } from './features/estadisticas/estadisticas';

describe('App', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App],
      providers: [provideRouter(routes)],
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
  });
});