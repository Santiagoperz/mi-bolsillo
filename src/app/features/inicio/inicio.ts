import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FechaLocal } from '../../core/models/gasto.model';
import { TipoPeriodo, desplazarPeriodo } from '../../core/services/estadisticas.calculos';
import { EstadisticasService } from '../../core/services/estadisticas.service';
import { GastoService, RELOJ } from '../../core/services/gasto.service';
import { PersistenciaService } from '../../core/services/persistencia.service';
import { hoy } from '../../core/utils/fechas';
import { ComparacionPeriodo } from '../../shared/components/comparacion-periodo/comparacion-periodo';
import { DesgloseCategorias } from '../../shared/components/desglose-categorias/desglose-categorias';
import {
  OpcionSegmento,
  SelectorSegmentado,
} from '../../shared/components/selector-segmentado/selector-segmentado';
import { contieneFecha, describirComparacion, etiquetaPeriodo } from '../../shared/periodos/periodo.textos';
import { PesosPipe } from '../../shared/pipes/pesos.pipe';

const OPCIONES: readonly OpcionSegmento<TipoPeriodo>[] = [
  { valor: 'dia', texto: 'Día' },
  { valor: 'semana', texto: 'Semana' },
  { valor: 'mes', texto: 'Mes' },
];

@Component({
  imports: [RouterLink, PesosPipe, DesgloseCategorias, SelectorSegmentado, ComparacionPeriodo],
  host: { class: 'pagina' },
  selector: 'app-inicio',
  styleUrl: './inicio.scss',
  templateUrl: './inicio.html',
})
export class Inicio {
  protected readonly persistencia = inject(PersistenciaService);
  protected readonly gastos = inject(GastoService);
  private readonly estadisticas = inject(EstadisticasService);
  private readonly reloj = inject(RELOJ);

  protected readonly opciones = OPCIONES;

  private readonly fechaHoy = signal<FechaLocal>(hoy(this.reloj()));
  protected readonly tipo = signal<TipoPeriodo>('dia');
  /** Cualquier fecha del período que se está viendo. */
  private readonly referencia = signal<FechaLocal>(this.fechaHoy());

  private readonly datos = computed(() => this.estadisticas.comparacion(this.tipo(), this.referencia()));
  protected readonly resumen = computed(() => this.datos().actual);
  protected readonly etiqueta = computed(() => etiquetaPeriodo(this.resumen().rango, this.fechaHoy()));
  protected readonly comparacion = computed(() =>
    describirComparacion(this.datos().comparacion, this.tipo()),
  );
  protected readonly esActual = computed(() => contieneFecha(this.resumen().rango, this.fechaHoy()));
  /** No se avanza más allá del período actual: no hay gastos futuros. */
  protected readonly puedeAvanzar = computed(() => this.resumen().rango.hasta < this.fechaHoy());

  protected mover(cantidad: number): void {
    this.referencia.set(desplazarPeriodo(this.resumen().rango, cantidad).desde);
  }

  protected volverAHoy(): void {
    const fecha = hoy(this.reloj());
    this.fechaHoy.set(fecha);
    this.referencia.set(fecha);
  }
}