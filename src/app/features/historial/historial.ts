import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NOMBRES_CATEGORIA } from '../../core/models/categoria.model';
import { GastoService } from '../../core/services/gasto.service';
import { formatearFechaCorta } from '../../core/utils/fechas';
import { PesosPipe } from '../../shared/pipes/pesos.pipe';

@Component({
  imports: [RouterLink, PesosPipe],
  selector: 'app-historial',
  styleUrl: './historial.scss',
  templateUrl: './historial.html',
})
export class Historial {
  protected readonly gastos = inject(GastoService);
  protected readonly nombres = NOMBRES_CATEGORIA;
  protected readonly formatearFecha = formatearFechaCorta;
}