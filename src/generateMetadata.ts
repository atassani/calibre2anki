import * as fs from 'fs';
import {buildFileName} from './filename';
import {format} from 'date-fns';

function getBookFormatFromTags(tags: Array<string>): string {
    var formats = [];
    if (tags.some(t => t==='format:physical'))      formats.push({ 'key': '1', 'value': '📖 Physical'});
    if (tags.some(t => t==='format:audiobook'))     formats.push({ 'key': '2', 'value': '🔈 Audiobook'});
    if (tags.some(t => t==='format:kindle'))        formats.push({ 'key': '3', 'value': '📱 Kindle'});
    if (tags.some(t => t==='format:ebook'))         formats.push({ 'key': '4', 'value': '📱 eBook'});
    if (tags.some(t => t==='format:ebookok'))       formats.push({ 'key': '5', 'value': '📱 eBook Ok'});
    if (tags.some(t => t==='format:safari'))        formats.push({ 'key': '6', 'value': '📱 Safari'});
    if (tags.some(t => t==='format:files'))         formats.push({ 'key': '7', 'value': 'Files'});
    if (tags.some(t => t==='format:lent'))          formats.push({ 'key': '8', 'value': '🫴 Lent'});
    if (tags.some(t => t==='format:borrowed'))      formats.push({ 'key': '9', 'value': '🫴 Borrowed'});
    if (tags.some(t => t==='format:warning'))       formats.push({ 'key': '10', 'value': '⚠️ Warning'});

    formats = formats.sort( (n1, n2) => n1 - n2 );
    return formats.map(f => f.value).join(', ');
}

function formatDate(dateStr: string, dateFormat: string): string {
    var formattedDate = '';
    try {
        formattedDate = format(new Date(dateStr), dateFormat)
    } catch(e) {   
        formattedDate = dateStr;
    }
    return formattedDate;
}

function appendBookMetadata(metadata: Array<string>, book: any, num: number) {
    var readDate = formatDate(book['*readdate'], 'MMM y');
    var pubDate = formatDate(book.pubdate, 'y');
    var rating = (book.rating) ? `${'★'.repeat(book.rating/2)}${'☆'.repeat(5 - book.rating/2)}` : '';
    var comments = (book['*comments']) ? book['*comments'] : '';

    var bookMetadata = 
`
${num}. Remember **${book.title.split(':', 1)}**?
> _${book.authors}_
> Published ${pubDate}
> Format ${getBookFormatFromTags(book.tags)}
> Read ${readDate}
> ${rating}
> ![book.title](./images/${buildFileName(book.id, book.title)})
> ${comments}

`;
    metadata.push(bookMetadata);
}

async function generateMetadata() {
    var data = JSON.parse(fs.readFileSync('./data/calibre_books.json', 'utf-8'));
    var outFile = './output/calibre_metadata.md';
    var metadata: Array<string> = ['\n\n', '---\n\n', 'Deck: CalibreBooks\n\n', 'Tags: books calibre\n\n'];
    data.filter(b => (b.cover))
        .map((b, i) => appendBookMetadata(metadata, b, i));
    metadata.push( '---\n\n');

    fs.writeFileSync(outFile, metadata.join(''));
}

generateMetadata();