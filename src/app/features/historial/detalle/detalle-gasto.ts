import { Component, computed, inject, input, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { NOMBRES_CATEGORIA } from '../../../core/models/categoria.model';
import { GastoService } from '../../../core/services/gasto.service';
import { EntradaGasto } from '../../../core/services/gasto.validacion';
import { formatearFechaCorta, formatearMomento } from '../../../core/utils/fechas';
import { FormularioGasto } from '../../../shared/components/formulario-gasto/formulario-gasto';
import { PesosPipe } from '../../../shared/pipes/pesos.pipe';

@Component({
    imports: [RouterLink, PesosPipe, FormularioGasto],
    selector: 'app-detalle-gasto',
    styleUrl: './detalle-gasto.scss',
    templateUrl: './detalle-gasto.html',
})
export class DetalleGasto {
    protected readonly gastos = inject(GastoService);
    private readonly router = inject(Router);

    /** Parámetro :id de la ruta. */
    readonly id = input.required<string>();

    protected readonly nombres = NOMBRES_CATEGORIA;
    protected readonly formatearFecha = formatearFechaCorta;
    protected readonly formatearMomento = formatearMomento;

    /** Se lee del estado: tras editar o eliminar se actualiza solo (RN-08, RN-09). */
    protected readonly gasto = computed(
        () => this.gastos.gastos().find((g) => g.id === Number(this.id())) ?? null,
    );

    protected readonly editando = signal(false);
    protected readonly confirmandoEliminacion = signal(false);
    protected readonly eliminando = signal(false);
    protected readonly errorEliminacion = signal<string | null>(null);

    protected readonly actualizar = (entrada: EntradaGasto) =>
        this.gastos.actualizar(Number(this.id()), entrada);

    protected async eliminar(): Promise<void> {
        this.eliminando.set(true);
        this.errorEliminacion.set(null);

        const resultado = await this.gastos.eliminar(Number(this.id()));
        this.eliminando.set(false);

        if (resultado.estado === 'eliminado') {
            await this.router.navigate(['/historial']);
        } else {
            this.confirmandoEliminacion.set(false);
            this.errorEliminacion.set(resultado.error.message);
        }
    }
}