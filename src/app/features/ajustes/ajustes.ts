import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Gasto } from '../../core/models/gasto.model';
import { EntregaArchivosService } from '../../core/services/entrega-archivos.service';
import { archivoCsv, archivoJson } from '../../core/services/exportacion';
import { GastoService, ModoImportacion, RELOJ } from '../../core/services/gasto.service';
import { ResumenCopia, leerCopiaSeguridad } from '../../core/services/importacion';
import { PersistenciaService } from '../../core/services/persistencia.service';
import { formatearFechaCorta, hoy } from '../../core/utils/fechas';
import { PesosPipe } from '../../shared/pipes/pesos.pipe';
import { TEMAS, TemaService } from '../../core/services/tema.service';

interface CopiaPendiente {
    readonly gastos: readonly Gasto[];
    readonly resumen: ResumenCopia;
}

function textoGastos(cantidad: number): string {
    return cantidad === 1 ? '1 gasto' : `${cantidad} gastos`;
}

@Component({
    imports: [RouterLink, PesosPipe],
    host: { class: 'pagina' },
    selector: 'app-ajustes',
    styleUrl: './ajustes.scss',
    templateUrl: './ajustes.html',
})
export class Ajustes {
    protected readonly tema = inject(TemaService);
    protected readonly temas = TEMAS;
    protected readonly gastos = inject(GastoService);
    protected readonly persistencia = inject(PersistenciaService);
    private readonly entrega = inject(EntregaArchivosService);
    private readonly reloj = inject(RELOJ);

    protected readonly textoGastos = textoGastos;
    protected readonly formatearFecha = formatearFechaCorta;

    protected readonly cantidad = computed(() => this.gastos.gastos().length);
    protected readonly exportando = signal(false);
    protected readonly importando = signal(false);
    protected readonly confirmacion = signal<string | null>(null);
    protected readonly errorImportacion = signal<string | null>(null);
    /** Copia ya leída y validada, a la espera de que el usuario confirme. */
    protected readonly copiaPendiente = signal<CopiaPendiente | null>(null);

    protected async exportar(formato: 'json' | 'csv'): Promise<void> {
        const ahora = this.reloj();
        const archivo =
            formato === 'json' ? archivoJson(this.gastos.gastos(), ahora) : archivoCsv(this.gastos.gastos(), ahora);

        this.limpiarMensajes();
        this.exportando.set(true);
        const resultado = await this.entrega.entregar(archivo);
        this.exportando.set(false);

        if (resultado !== 'cancelado') {
            this.confirmacion.set(`Copia lista: ${archivo.nombre}`);
        }
    }

    protected async leerArchivo(evento: Event): Promise<void> {
        const campo = evento.target as HTMLInputElement;
        const archivo = campo.files?.[0];
        // Vaciar el campo permite volver a elegir el mismo archivo más tarde.
        campo.value = '';
        if (!archivo) {
            return;
        }

        this.limpiarMensajes();
        const lectura = leerCopiaSeguridad(await archivo.text(), hoy(this.reloj()));
        if (lectura.valido) {
            this.copiaPendiente.set({ gastos: lectura.gastos, resumen: lectura.resumen });
        } else {
            this.errorImportacion.set(lectura.error);
        }
    }

    protected async importar(modo: ModoImportacion): Promise<void> {
        const copia = this.copiaPendiente();
        if (!copia) {
            return;
        }

        this.importando.set(true);
        const resultado = await this.gastos.importar(copia.gastos, modo);
        this.importando.set(false);
        this.copiaPendiente.set(null);

        if (resultado.estado === 'error') {
            this.errorImportacion.set(resultado.error.message);
            return;
        }

        if (modo === 'reemplazar') {
            this.confirmacion.set(`Copia restaurada: ${textoGastos(resultado.agregados)}.`);
        } else if (resultado.agregados === 0) {
            this.confirmacion.set('No había gastos nuevos: todos ya estaban en la app.');
        } else {
            const nuevos = resultado.agregados === 1 ? 'Añadido 1 gasto nuevo' : `Añadidos ${resultado.agregados} gastos nuevos`;
            const repetidos = resultado.omitidos === 1 ? '1 ya estaba' : `${resultado.omitidos} ya estaban`;
            this.confirmacion.set(resultado.omitidos > 0 ? `${nuevos}; ${repetidos}.` : `${nuevos}.`);
        }
    }

    protected cancelarImportacion(): void {
        this.copiaPendiente.set(null);
    }

    private limpiarMensajes(): void {
        this.confirmacion.set(null);
        this.errorImportacion.set(null);
        this.copiaPendiente.set(null);
    }
}