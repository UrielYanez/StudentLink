import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'slugify',
  standalone: false
})
export class SlugifyPipe implements PipeTransform {

  transform(value: string): string {
    if (!value) {
      return '';
    }

    return value
      .toLowerCase()            // 1. Pone todo en minúsculas
      .trim()                   // 2. Quita espacios al inicio o final
      .replace(/[\s\W-]+/g, '-') // 3. Reemplaza espacios (y otros caracteres raros) con un guion
      .replace(/^-+|-+$/g, '');  // 4. (Opcional) Quita guiones al inicio o final
  }
}
