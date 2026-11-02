import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ActualizacionService } from './core/actualizacion.service';

@Component({
  imports: [RouterOutlet],
  selector: 'app-root',
  styleUrl: './app.scss',
  templateUrl: './app.html',
})
export class App {
  protected readonly actualizacion = inject(ActualizacionService);

  constructor() {
    this.actualizacion.iniciar();
  }
}