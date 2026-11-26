import { Pipe, PipeTransform } from '@angular/core';

const apiOrigin = 'http://localhost:3000';

@Pipe({
  name: 'imageUrl',
  standalone: true
})
export class ImageUrlPipe implements PipeTransform {
  transform(image: string | null | undefined): string {
    if (!image) return '/food-placeholder.svg';
    if (/^(https?:\/\/|blob:|data:image\/)/i.test(image)) return image;
    if (image.startsWith('/uploads/')) return `${apiOrigin}${image}`;
    if (image.startsWith('/')) return image;
    return '/food-placeholder.svg';
  }
}
