import { Component, inject, signal } from '@angular/core';
import { Gasto } from '../../core/models/gasto.model';
import { GastoService } from '../../core/services/gasto.service';
import { EntradaGasto } from '../../core/services/gasto.validacion';
import { formatearPesos } from '../../core/utils/moneda';
import { FormularioGasto } from '../../shared/components/formulario-gasto/formulario-gasto';

@Component({
  imports: [FormularioGasto],
  host: { class: 'pagina' },
  selector: 'app-registro',
  styleUrl: './registro.scss',
  templateUrl: './registro.html',
})
export class Registro {
  private readonly gastos = inject(GastoService);

  protected readonly confirmacion = signal<string | null>(null);
  protected readonly registrar = (entrada: EntradaGasto) => this.gastos.registrar(entrada);

  protected confirmar(gasto: Gasto): void {
    this.confirmacion.set(`Guardado: ${gasto.descripcion} · ${formatearPesos(gasto.monto)}`);
  }
}