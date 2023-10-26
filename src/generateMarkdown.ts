import * as fs from 'fs';
import {buildFileName} from './filename';
import {format} from 'date-fns';

export function cleanHtml(html: string): string {
    var newHtml = html;
    newHtml = newHtml.replace(/\n\s*/g, '\n');
    newHtml = newHtml.replace(/\s*\n/g, '\n');
    newHtml = newHtml.replace(/^\s*/g, '');
    newHtml = newHtml.replace(/\s*$/g, '');
    newHtml = newHtml.replace(/\<div\>/g, '');
    newHtml = newHtml.replace(/<\/div>/g, '');
    newHtml = newHtml.replace(/<p>/g, '');
    newHtml = newHtml.replace(/<p [^>]*>/g, '');
    newHtml = newHtml.replace(/<\/p>/g, '');
    newHtml = newHtml.replace(/<span[^>]*>/g, '');
    newHtml = newHtml.replace(/<\/span>/g, '');
    newHtml = newHtml.replace(/<br\/>/g, '\n');
    newHtml = newHtml.replace(/<br>/g, '\n');
    newHtml = newHtml.replace(/<a href="([^\"]*)">([^<]*)<\/a>/g, '[$2]($1)');
    newHtml = newHtml.replace(/<table[^>]*>/g, '');
    newHtml = newHtml.replace(/<\/table>/g, '');
    newHtml = newHtml.replace(/<tbody>/g, '');
    newHtml = newHtml.replace(/<\/tbody>/g, '');
    newHtml = newHtml.replace(/<tr>/g, '');
    newHtml = newHtml.replace(/<\/tr>/g, '');
    newHtml = newHtml.replace(/<td[^>]*>/g, '');
    newHtml = newHtml.replace(/<\/td>/g, '');
    newHtml = newHtml.replace(/<em>/g, '_');
    newHtml = newHtml.replace(/<\/em>/g, '_');
    newHtml = newHtml.replace(/\n\n/g, '\n');
    newHtml = newHtml.replace(/^\n/, '');
    newHtml = newHtml.replace(/\n/g, '\n> ');

    return newHtml;
}

function getBookEmblems(isRead: boolean, readorder: number, tags: Array<string>): string {
    var formats = [];
/*
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
*/
    if (tags.some(t => t==='format:physical'))      formats.push({ 'key': '1', 'value': '![Physical](images/calibre_emblems_round_book.png)' });
    if (tags.some(t => t==='format:audiobook'))     formats.push({ 'key': '2', 'value': '![Audiobook](images/calibre_emblems_audio.png)' });
    if (tags.some(t => t==='format:kindle'))        formats.push({ 'key': '3', 'value': '![Kindle](images/calibre_emblems_kindle.png)' });
    if (tags.some(t => t==='format:ebook'))         formats.push({ 'key': '4', 'value': '![eBook](images/calibre_emblems_downloaded_book_pirate.png)' });
    if (tags.some(t => t==='format:ebookok'))       formats.push({ 'key': '5', 'value': '![eBook Ok](images/calibre_emblems_downloaded_book.png)' });
    if (tags.some(t => t==='format:safari'))        formats.push({ 'key': '6', 'value': '![Safari](images/calibre_emblems_oreilly.png)' });
    if (tags.some(t => t==='format:files'))         formats.push({ 'key': '7', 'value': '![Files](images/calibre_emblems_computer_files.png)' });
    if (tags.some(t => t==='format:lent'))          formats.push({ 'key': '8', 'value': '![Lent](images/calibre_emblems_borrowed_trans.png)' });
    if (tags.some(t => t==='format:borrowed'))      formats.push({ 'key': '9', 'value': '![Borrowed](images/calibre_emblems_borrowed_trans.png)' });
    if (tags.some(t => t==='format:warning'))       formats.push({ 'key': '10', 'value': '![Warning](images/calibre_emblems_warning.png)' });
    if (tags.some(t => t==='format:warning'))       formats.push({ 'key': '11', 'value': '![Stop](images/calibre_emblems_stop.png)' });

    const readYNimage = isRead ? '![Read](images/calibre_emblems_book_read.png)' : '';

    var readorderImage = '';
    if      (readorder > 0.1  && readorder < 0.99) readorderImage = '![0](images/calibre_emblems_circle_0.png)';
    else if (readorder > 0.99 && readorder < 2   ) readorderImage = '![1](images/calibre_emblems_circle_1.png)';
    else if (readorder > 1.99 && readorder < 3   ) readorderImage = '![2](images/calibre_emblems_circle_2.png)';
    else if (readorder > 2.99 && readorder < 4   ) readorderImage = '![3](images/calibre_emblems_circle_3.png)';
    else if (readorder > 3.99 && readorder < 5   ) readorderImage = '![4](images/calibre_emblems_circle_4.png)';
    else if (readorder > 4.99 && readorder < 6   ) readorderImage = '![4](images/calibre_emblems_circle_5.png)';

    formats = formats.sort( (n1, n2) => n1 - n2 );
    return readYNimage + readorderImage + formats.map(f => f.value).join('');
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

function appendBookMarkdown(markdown: Array<string>, book: any, mapAnkiIds: Map<string, string>) {
    const readDate = formatDate(book['*readdate'], 'MMM y');
    const pubDate = formatDate(book.pubdate, 'y');
    const rating = (book.rating) ? `${'★'.repeat(book.rating/2)}${'☆'.repeat(5 - book.rating/2)}` : '';
    const comments = (book['*comments']) ? book['*comments'] : '';
    const readorder = (book['*readorder']) ? book['*readorder'] : '';
    const isRead = book['*read']==='True' ? true : false; 



    const ankiId = mapAnkiIds.get(book.id.toString());
    var bookMarkdown = 
`${(ankiId) ? '\n' + ankiId : ''}
${book.id}. Remember **${book.title.split(':', 1)}**?
> _${book.authors}_
> Published: ${pubDate}
> Format: ${getBookEmblems(isRead, readorder, book.tags)}
> Read: ${readDate}
> ${rating}
>
> ![book.title](./images/${buildFileName(book.id, book.title)})
>
> ${cleanHtml(comments)}
`;
    markdown.push(bookMarkdown);
}

function generateMapAnkiIds(markdownFile: string): Map<string, string> {
    var map = new Map<string, string>();
    try {
        const markdownContents = fs.readFileSync(markdownFile).toString().split('\n');
        for (var i in markdownContents) {
            const match = markdownContents[i].match(/^([0-9]*)\./);
            if (match && markdownContents[parseInt(i)-1].length > 0) {
                map.set(match[1], markdownContents[parseInt(i)-1]);
            }
        }
    }
    catch (err) { 
        console.error(`File ${markdownFile} does not exist.`);
    }
    return map;
}

export function generateMarkdown(sourceCalibreJson: string, markdownTargetPath: string) {
    var data = JSON.parse(fs.readFileSync(sourceCalibreJson, 'utf-8'));
    var mapAnkiIds = generateMapAnkiIds(markdownTargetPath);
    var markdown: Array<string> = ['\n\n', '---\n\n', 'Deck: CalibreBooks\n\n', 'Tags: books calibre\n\n'];
    data.filter(book => (book.cover))
        .sort((book1,book2) => (book1.id > book2.id ? 1 : -1)) 
        .map((book) => appendBookMarkdown(markdown, book, mapAnkiIds));
    markdown.push( '---\n\n');

    fs.writeFileSync(markdownTargetPath, markdown.join(''));
}
