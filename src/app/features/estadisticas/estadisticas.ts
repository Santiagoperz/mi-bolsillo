import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NOMBRES_CATEGORIA } from '../../core/models/categoria.model';
import { FechaLocal } from '../../core/models/gasto.model';
import { RangoPeriodo, TipoPeriodo } from '../../core/services/estadisticas.calculos';
import { EstadisticasService } from '../../core/services/estadisticas.service';
import { GastoService, RELOJ } from '../../core/services/gasto.service';
import { hoy } from '../../core/utils/fechas';
import { DesgloseCategorias } from '../../shared/components/desglose-categorias/desglose-categorias';
import {
  describirComparacion,
  etiquetaCorta,
  etiquetaPeriodo,
  formatearPorcentaje,
} from '../../shared/periodos/periodo.textos';
import { PesosPipe } from '../../shared/pipes/pesos.pipe';

type TipoEstadistica = Extract<TipoPeriodo, 'semana' | 'mes'>;

/** Cuántos períodos muestra la gráfica de evolución. */
const CANTIDAD: Readonly<Record<TipoEstadistica, number>> = { semana: 8, mes: 6 };

const OPCIONES: readonly { readonly tipo: TipoEstadistica; readonly texto: string }[] = [
  { tipo: 'semana', texto: 'Semanas' },
  { tipo: 'mes', texto: 'Meses' },
];

@Component({
  imports: [RouterLink, PesosPipe, DesgloseCategorias],
  selector: 'app-estadisticas',
  styleUrl: './estadisticas.scss',
  templateUrl: './estadisticas.html',
})
export class Estadisticas {
  protected readonly gastos = inject(GastoService);
  private readonly estadisticas = inject(EstadisticasService);
  private readonly fechaHoy: FechaLocal = hoy(inject(RELOJ)());

  protected readonly opciones = OPCIONES;
  protected readonly nombres = NOMBRES_CATEGORIA;
  protected readonly etiquetaCorta = etiquetaCorta;
  protected readonly formatearPorcentaje = formatearPorcentaje;

  protected readonly tipo = signal<TipoEstadistica>('mes');
  /** Inicio del período elegido en la gráfica. Null = el período actual. */
  private readonly seleccion = signal<FechaLocal | null>(null);

  protected readonly serie = computed(() =>
    this.estadisticas.evolucion(this.tipo(), this.fechaHoy, CANTIDAD[this.tipo()]),
  );

  protected readonly hayGastos = computed(() => this.gastos.gastos().length > 0);

  private readonly maximo = computed(() => Math.max(0, ...this.serie().map((p) => p.total)));

  protected readonly promedio = computed(() => {
    const serie = this.serie();
    return Math.round(serie.reduce((suma, p) => suma + p.total, 0) / serie.length);
  });

  protected readonly seleccionado = computed(() => {
    const serie = this.serie();
    return serie.find((p) => p.rango.desde === this.seleccion()) ?? serie[serie.length - 1];
  });

  protected readonly comparacion = computed(() =>
    describirComparacion(
      this.estadisticas.comparacion(this.tipo(), this.seleccionado().rango.desde).comparacion,
      this.tipo(),
    ),
  );

  /** La categoría con mayor gasto del período elegido. */
  protected readonly mayor = computed(() => this.seleccionado().porCategoria[0] ?? null);

  protected titulo(rango: RangoPeriodo): string {
    return etiquetaPeriodo(rango, this.fechaHoy).titulo;
  }

  protected altura(total: number): number {
    const maximo = this.maximo();
    return maximo === 0 ? 0 : (total / maximo) * 100;
  }

  protected cambiarTipo(tipo: TipoEstadistica): void {
    this.tipo.set(tipo);
    this.seleccion.set(null);
  }

  protected seleccionar(rango: RangoPeriodo): void {
    this.seleccion.set(rango.desde);
  }
}