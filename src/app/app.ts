import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ActualizacionService } from './core/actualizacion.service';
import { PersistenciaService } from './core/services/persistencia.service';

@Component({
  imports: [RouterOutlet],
  selector: 'app-root',
  styleUrl: './app.scss',
  templateUrl: './app.html',
})
export class App {
  protected readonly actualizacion = inject(ActualizacionService);
  protected readonly persistencia = inject(PersistenciaService);

  constructor() {
    this.actualizacion.iniciar();
    void this.persistencia.verificar();
  }
}