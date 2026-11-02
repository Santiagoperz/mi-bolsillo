import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { EntregaArchivosService } from '../../core/services/entrega-archivos.service';
import { archivoCsv, archivoJson } from '../../core/services/exportacion';
import { GastoService, RELOJ } from '../../core/services/gasto.service';
import { PersistenciaService } from '../../core/services/persistencia.service';

@Component({
    imports: [RouterLink],
    host: { class: 'pagina' },
    selector: 'app-datos',
    styleUrl: './datos.scss',
    templateUrl: './datos.html',
})
export class Datos {
    protected readonly gastos = inject(GastoService);
    protected readonly persistencia = inject(PersistenciaService);
    private readonly entrega = inject(EntregaArchivosService);
    private readonly reloj = inject(RELOJ);

    protected readonly cantidad = computed(() => this.gastos.gastos().length);
    protected readonly exportando = signal(false);
    protected readonly confirmacion = signal<string | null>(null);

    protected async exportar(formato: 'json' | 'csv'): Promise<void> {
        const ahora = this.reloj();
        const archivo =
            formato === 'json' ? archivoJson(this.gastos.gastos(), ahora) : archivoCsv(this.gastos.gastos(), ahora);

        this.confirmacion.set(null);
        this.exportando.set(true);
        const resultado = await this.entrega.entregar(archivo);
        this.exportando.set(false);

        if (resultado !== 'cancelado') {
            this.confirmacion.set(`Copia lista: ${archivo.nombre}`);
        }
    }
}