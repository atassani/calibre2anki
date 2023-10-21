import * as fs from 'fs';
import { parse } from 'ts-command-line-args';
import {buildFileName} from './filename';

function copyFile(src: string, dst: string) {
    fs.copyFileSync(src, dst);
}

interface ExtractCalibreCoversArguments {
    sourceCalibreJson: string;
    imagesTargetPath: string;
    help?: boolean;
}

async function extractCalibreCovers() {
    // node dist/extractCalibreCovers.js -j ./data/calibre.json -t /Users/toni.tassani/Downloads/calibre_books/
    const args = parse<ExtractCalibreCoversArguments>(
    {
        sourceCalibreJson: { type: String, optional: undefined, alias: 'j', description: 'Full path to the calibre.json file' },
        imagesTargetPath: { type: String, optional: undefined, alias: 't', description: 'Path to the location to store the cover images' },
        help: { type: Boolean, optional: true, alias: 'h', description: 'Prints this usage guide' },    
    },
    {
        helpArg: 'help',
        headerContentSections: [{ header: 'Extract Calibre covers', content: 'From the JSON file provided as an argument, copies the calibre covers to the target path using renaming them using id and title.' }],
        footerContentSections: [{ header: 'Notes', content: `Generate the JSON file using calibre command line.` }],
    },
    );
    var data = JSON.parse(fs.readFileSync(args.sourceCalibreJson, 'utf-8'));
    data.filter(b => (b.cover)).map(b => copyFile(
        b.cover
        ,args.imagesTargetPath+buildFileName(b.id, b.title)
    ));
}

extractCalibreCovers();