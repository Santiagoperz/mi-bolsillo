import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { ActualizacionService } from './core/actualizacion.service';
import { GastoService } from './core/services/gasto.service';
import { PersistenciaService } from './core/services/persistencia.service';
import { TemaService } from './core/services/tema.service';

@Component({
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  selector: 'app-root',
  styleUrl: './app.scss',
  templateUrl: './app.html',
})
export class App {
  protected readonly actualizacion = inject(ActualizacionService);
  protected readonly persistencia = inject(PersistenciaService);
  private readonly gastos = inject(GastoService);
  private readonly tema = inject(TemaService);

  constructor() {
    this.actualizacion.iniciar();
    void this.persistencia.verificar();
    void this.gastos.cargar();
  }
}