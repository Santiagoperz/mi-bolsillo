import { Component, input, model } from '@angular/core';

export interface OpcionSegmento<T extends string> {
    readonly valor: T;
    readonly texto: string;
}

/** Grupo de botones donde solo uno está activo, por ejemplo Día / Semana / Mes. */
@Component({
    selector: 'app-selector-segmentado',
    styleUrl: './selector-segmentado.scss',
    templateUrl: './selector-segmentado.html',
})
export class SelectorSegmentado<T extends string> {
    readonly opciones = input.required<readonly OpcionSegmento<T>[]>();
    readonly valor = model.required<T>();
    /** Nombre del grupo para lectores de pantalla. */
    readonly etiqueta = input.required<string>();
}