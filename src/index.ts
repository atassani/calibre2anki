import * as fs from 'fs';
import { parse } from 'ts-command-line-args';
import {exec} from 'shelljs';
import extractCovers from './extractCalibreCovers';
import {generateMarkdown} from './generateMarkdown';
//import { execSync } from 'child_process';

// npm run build && npm run start -- --sourceCalibreJson ./data/calibre_books.json --markdownTargetPath ./output/calibre_markdown.md
interface calibre2ankiArguments {
    sourceCalibreJson: string;
    markdownTargetPath: string;
    imagesTargetPath?: string;
    help?: boolean;
}

const args = parse<calibre2ankiArguments>(
    {
        sourceCalibreJson: { type: String, optional: undefined, alias: 'j', description: 'Full path to the calibre.json file' },
        markdownTargetPath: { type: String, optional: undefined, alias: 'm', description: 'Full path to filename to store the markdown' },
        imagesTargetPath: { type: String, optional: true, alias: 'i', description: 'Path to the location to store the cover images' },
        help: { type: Boolean, optional: true, alias: 'h', description: 'Prints this usage guide' },    
    },
    {
        helpArg: 'help',
        headerContentSections: [{ header: 'calibre2anki', content: 'From the JSON file provided as an argument, copies the calibre covers to the target path using renaming them using id and title.' }],
        footerContentSections: [{ header: 'Notes', content: '' }],
    },
);

function isSanitizedArguments(): boolean {
    var sanitized = true;
    if (args.imagesTargetPath) {
        if (args.imagesTargetPath.slice(-1) !== '/') {
            console.error('ERROR: imagesTargetPath must end with /');
            sanitized = false;
        }
    }
    return sanitized;
}

async function generateImages() {
    if (args.imagesTargetPath) {
        console.log(`Extracting covers to "${args.imagesTargetPath}"`);
        extractCovers(args.sourceCalibreJson, args.imagesTargetPath);
    }
}

async function main() {

    // Generate images, including emblems
    await generateImages();

    // Generate markdown
    await generateMarkdown(args.sourceCalibreJson, args.markdownTargetPath);
}

main();