import { Component, ElementRef, computed, inject, signal, viewChild } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { NonNullableFormBuilder, ReactiveFormsModule } from '@angular/forms';
import { map } from 'rxjs';
import { CATEGORIAS, NOMBRES_CATEGORIA } from '../../core/models/categoria.model';
import { GastoService, RELOJ } from '../../core/services/gasto.service';
import { EntradaGasto, ErroresGasto, validarGasto } from '../../core/services/gasto.validacion';
import { hoy } from '../../core/utils/fechas';
import { formatearPesos, parsearMonto } from '../../core/utils/moneda';

interface ValorFormulario {
  descripcion: string;
  monto: string;
  categoria: string;
  fecha: string;
}

@Component({
  imports: [ReactiveFormsModule],
  selector: 'app-registro',
  styleUrl: './registro.scss',
  templateUrl: './registro.html',
})
export class Registro {
  private readonly gastos = inject(GastoService);
  private readonly reloj = inject(RELOJ);
  private readonly campoDescripcion =
    viewChild.required<ElementRef<HTMLInputElement>>('campoDescripcion');

  protected readonly categorias = CATEGORIAS;
  protected readonly nombres = NOMBRES_CATEGORIA;
  protected readonly hoy = signal(hoy(this.reloj()));

  protected readonly formulario = inject(NonNullableFormBuilder).group({
    descripcion: '',
    monto: '',
    categoria: '',
    fecha: this.hoy(),
  });

  private readonly valor = toSignal(
    this.formulario.valueChanges.pipe(map(() => this.formulario.getRawValue())),
    { initialValue: this.formulario.getRawValue() },
  );

  /** Los errores se muestran después del primer intento de guardar. */
  private readonly intentado = signal(false);
  protected readonly guardando = signal(false);
  protected readonly confirmacion = signal<string | null>(null);
  protected readonly errorGuardado = signal<string | null>(null);

  protected readonly errores = computed<ErroresGasto>(() => {
    if (!this.intentado()) {
      return {};
    }
    const resultado = validarGasto(this.aEntrada(this.valor()), this.hoy());
    return resultado.valido ? {} : resultado.errores;
  });

  protected readonly montoFormateado = computed(() => {
    const monto = parsearMonto(this.valor().monto);
    return Number.isSafeInteger(monto) && monto > 0 ? formatearPesos(monto) : null;
  });

  protected async guardar(): Promise<void> {
    if (this.guardando()) {
      return;
    }
    this.intentado.set(true);
    this.confirmacion.set(null);
    this.errorGuardado.set(null);
    this.guardando.set(true);

    const resultado = await this.gastos.registrar(this.aEntrada(this.formulario.getRawValue()));
    this.guardando.set(false);

    switch (resultado.estado) {
      case 'guardado': {
        const fechaHoy = hoy(this.reloj());
        this.hoy.set(fechaHoy);
        this.intentado.set(false);
        this.formulario.reset({ descripcion: '', monto: '', categoria: '', fecha: fechaHoy });
        const { descripcion, monto } = resultado.gasto;
        this.confirmacion.set(`Guardado: ${descripcion} · ${formatearPesos(monto)}`);
        this.campoDescripcion().nativeElement.focus();
        break;
      }
      case 'invalido':
        // Los mensajes por campo ya se muestran: `errores` se recalcula con intentado = true.
        break;
      case 'error':
        this.errorGuardado.set(resultado.error.message);
        break;
    }
  }

  private aEntrada(valor: ValorFormulario): EntradaGasto {
    return { ...valor, monto: parsearMonto(valor.monto) };
  }
}