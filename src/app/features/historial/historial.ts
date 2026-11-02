import { Component, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { NonNullableFormBuilder, ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { map } from 'rxjs';
import { CATEGORIAS, NOMBRES_CATEGORIA } from '../../core/models/categoria.model';
import { GastoService, RELOJ } from '../../core/services/gasto.service';
import { formatearFechaCorta, hoy } from '../../core/utils/fechas';
import { Periodo, construirFiltro, filtrarGastos } from '../../core/utils/filtros';
import { PesosPipe } from '../../shared/pipes/pesos.pipe';

const ETIQUETA_REFERENCIA: Readonly<Record<Periodo, string>> = {
  todo: '',
  dia: 'Día',
  semana: 'Un día de la semana',
  mes: 'Un día del mes',
  rango: '',
};

@Component({
  imports: [ReactiveFormsModule, RouterLink, PesosPipe],
  host: { class: 'pagina' },
  selector: 'app-historial',
  styleUrl: './historial.scss',
  templateUrl: './historial.html',
})

export class Historial {
  protected readonly gastos = inject(GastoService);
  private readonly reloj = inject(RELOJ);

  protected readonly categorias = CATEGORIAS;
  protected readonly nombres = NOMBRES_CATEGORIA;
  protected readonly etiquetaReferencia = ETIQUETA_REFERENCIA;
  protected readonly formatearFecha = formatearFechaCorta;

  protected readonly filtros = inject(NonNullableFormBuilder).group(this.valoresIniciales());

  protected readonly valor = toSignal(
    this.filtros.valueChanges.pipe(map(() => this.filtros.getRawValue())),
    { initialValue: this.filtros.getRawValue() },
  );

  private readonly filtro = computed(() => construirFiltro(this.valor()));

  protected readonly filtrados = computed(() => filtrarGastos(this.gastos.recientes(), this.filtro()));
  protected readonly total = computed(() => this.filtrados().reduce((suma, g) => suma + g.monto, 0));

  protected readonly hayFiltros = computed(
    () => this.valor().categoria !== '' || this.valor().periodo !== 'todo',
  );

  /** Muestra los límites calculados, por ejemplo 'Del 26 oct 2026 al 1 nov 2026'. */
  protected readonly rangoTexto = computed(() => {
    const { desde, hasta } = this.filtro();
    if (this.valor().periodo === 'dia' || desde === null || hasta === null) {
      return null;
    }
    return `Del ${formatearFechaCorta(desde)} al ${formatearFechaCorta(hasta)}`;
  });

  protected limpiar(): void {
    this.filtros.reset(this.valoresIniciales());
  }

  private valoresIniciales() {
    const fechaHoy = hoy(this.reloj());
    return {
      categoria: '',
      periodo: 'todo' as Periodo,
      referencia: fechaHoy,
      desde: fechaHoy,
      hasta: fechaHoy,
    };
  }
}