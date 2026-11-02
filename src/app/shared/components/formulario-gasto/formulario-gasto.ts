import {
    Component,
    ElementRef,
    OnInit,
    computed,
    inject,
    input,
    output,
    signal,
    viewChild,
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { NonNullableFormBuilder, ReactiveFormsModule } from '@angular/forms';
import { map } from 'rxjs';
import { CATEGORIAS, NOMBRES_CATEGORIA } from '../../../core/models/categoria.model';
import { Gasto } from '../../../core/models/gasto.model';
import { RELOJ, ResultadoGuardado } from '../../../core/services/gasto.service';
import { EntradaGasto, ErroresGasto, validarGasto } from '../../../core/services/gasto.validacion';
import { hoy } from '../../../core/utils/fechas';
import { formatearPesos, parsearMonto } from '../../../core/utils/moneda';

interface ValorFormulario {
    descripcion: string;
    monto: string;
    categoria: string;
    fecha: string;
}

/**
 * Formulario de gasto para registrar y editar.
 * No sabe si crea o actualiza: ejecuta la `accion` que recibe y muestra su resultado.
 */
@Component({
    imports: [ReactiveFormsModule],
    selector: 'app-formulario-gasto',
    styleUrl: './formulario-gasto.scss',
    templateUrl: './formulario-gasto.html',
})
export class FormularioGasto implements OnInit {
    private readonly reloj = inject(RELOJ);
    private readonly campoDescripcion =
        viewChild.required<ElementRef<HTMLInputElement>>('campoDescripcion');

    /** Gasto a editar. Sin él, el formulario empieza vacío con la fecha de hoy. */
    readonly inicial = input<Gasto | null>(null);
    readonly accion = input.required<(entrada: EntradaGasto) => Promise<ResultadoGuardado>>();
    readonly textoBoton = input('Guardar');
    /** Vacía el formulario tras guardar, para anotar el siguiente gasto. */
    readonly limpiarAlGuardar = input(false);

    /** Se emite al pulsar el botón, antes de guardar. */
    readonly intento = output();
    readonly guardado = output<Gasto>();

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

    ngOnInit(): void {
        const gasto = this.inicial();
        if (gasto) {
            this.formulario.reset({
                descripcion: gasto.descripcion,
                monto: String(gasto.monto),
                categoria: gasto.categoria,
                fecha: gasto.fecha,
            });
        }
    }

    protected async guardar(): Promise<void> {
        if (this.guardando()) {
            return;
        }
        this.intento.emit();
        this.intentado.set(true);
        this.errorGuardado.set(null);
        this.guardando.set(true);

        const resultado = await this.accion()(this.aEntrada(this.formulario.getRawValue()));
        this.guardando.set(false);

        switch (resultado.estado) {
            case 'guardado':
                this.intentado.set(false);
                if (this.limpiarAlGuardar()) {
                    const fechaHoy = hoy(this.reloj());
                    this.hoy.set(fechaHoy);
                    this.formulario.reset({ descripcion: '', monto: '', categoria: '', fecha: fechaHoy });
                    this.campoDescripcion().nativeElement.focus();
                }
                this.guardado.emit(resultado.gasto);
                break;
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