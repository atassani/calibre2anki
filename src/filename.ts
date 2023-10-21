import * as removeAccents from 'remove-accents';

export function buildFileName(id:string, title: string): string {
    return 'Book_' + id + '_' + 
        removeAccents.remove(title)
        .split(':', 1)[0].split('.', 1)[0].split(' (', 1)[0].split(' -', 1)[0]
        .replaceAll("'", '')
        .replaceAll('"', '')
        .replaceAll("¡", '')
        .replaceAll("!", '')
        .replaceAll("?", '')
        .replaceAll("¿", '')
        .replaceAll("…", '')
        .replaceAll(",", '')
        .replaceAll('/', '_')
        .replaceAll('&', 'and')
        .replaceAll('*', '_')
        .replaceAll(' ', '_')
        + '.jpg';
}