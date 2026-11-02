import { Component, inject } from '@angular/core';
import { PersistenciaService } from '../../core/services/persistencia.service';

@Component({
  imports: [],
  selector: 'app-inicio',
  styleUrl: './inicio.scss',
  templateUrl: './inicio.html',
})
export class Inicio {
  protected readonly persistencia = inject(PersistenciaService);
}