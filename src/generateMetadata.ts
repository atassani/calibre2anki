import * as fs from 'fs';
import { parse } from 'ts-command-line-args';
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

function appendBookMarkdown(markdown: Array<string>, book: any, mapAnkiIds: Map<string, string>) {
    var readDate = formatDate(book['*readdate'], 'MMM y');
    var pubDate = formatDate(book.pubdate, 'y');
    var rating = (book.rating) ? `${'★'.repeat(book.rating/2)}${'☆'.repeat(5 - book.rating/2)}` : '';
    var comments = (book['*comments']) ? book['*comments'] : '';

    const ankiId = mapAnkiIds.get(book.id.toString());
    var bookMarkdown = 
`${(ankiId) ? '\n' + ankiId : ''}
${book.id}. Remember **${book.title.split(':', 1)}**?
> _${book.authors}_
> Published: ${pubDate}
> Format: ${getBookFormatFromTags(book.tags)}
> Read: ${readDate}
> ${rating}
>
> ![book.title](./images/${buildFileName(book.id, book.title)})
> ${comments}

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

interface GenerateMarkdownArguments {
    sourceCalibreJson: string;
    markdownTargetPath: string;
    help?: boolean;
}

async function generateMarkdown() {
    // npm run build && node dist/generateMetadata.js -j ./data/calibre_books.json -t ./output/calibre_markdown.md
    const args = parse<GenerateMarkdownArguments>(
        {
            sourceCalibreJson: { type: String, optional: undefined, alias: 'j', description: 'Full path to the calibre.json file' },
            markdownTargetPath: { type: String, optional: undefined, alias: 't', description: 'Full path to filename to store the markdown' },
            help: { type: Boolean, optional: true, alias: 'h', description: 'Prints this usage guide' },    
        },
        {
            helpArg: 'help',
            headerContentSections: [{ header: 'Generate Markdown', content: 'From the JSON file provided as an argument, transforms it into a suitable markdown to be uploaded to Anki.' }],
            footerContentSections: [{ header: 'Notes', content: `Generate the JSON file using calibre command line.` }],
        },
        );
    var data = JSON.parse(fs.readFileSync(args.sourceCalibreJson, 'utf-8'));
    var mapAnkiIds = generateMapAnkiIds(args.markdownTargetPath);
    var markdown: Array<string> = ['\n\n', '---\n\n', 'Deck: CalibreBooks\n\n', 'Tags: books calibre\n\n'];
    data.filter(book => (book.cover))
        .map((book) => appendBookMarkdown(markdown, book, mapAnkiIds));
    markdown.push( '---\n\n');

    fs.writeFileSync(args.markdownTargetPath, markdown.join(''));
}

generateMarkdown();