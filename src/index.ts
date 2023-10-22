import * as fs from 'fs';
import { parse } from 'ts-command-line-args';
import {exec} from 'shelljs';
import extractCovers from './extractCalibreCovers';
import {cleanHtml, generateMarkdown} from './generateMarkdown';

// npm run build && npm run start -- --sourceCalibreJson ./data/calibre_books.json --markdownTargetPath ./output/calibre_markdown.md --generateJson --cleanImages -i ./output/images/ --ankiLibrary /Users/toni.tassani/Library/Application\ Support/Anki2/User\ 1/collection.media/
interface calibre2ankiArguments {
    sourceCalibreJson: string;
    markdownTargetPath: string;
    imagesTargetPath?: string;
    generateJson?: boolean;
    cleanImages?: boolean;
    ankiLibrary?: string;
    dontRunInka?: boolean;
    help?: boolean;
}

const args = parse<calibre2ankiArguments>(
    {
        sourceCalibreJson: { type: String, optional: undefined, alias: 'j', description: 'Full path to the calibre.json file' },
        markdownTargetPath: { type: String, optional: undefined, alias: 'm', description: 'Full path to filename to store the markdown' },
        imagesTargetPath: { type: String, optional: true, alias: 'i', description: 'Path to the location to store the cover images' },
        generateJson: { type: Boolean, optional: true, description: 'Generates JSON file from Calibre using calibredb' },
        cleanImages: { type: Boolean, optional: true, description: 'Deletes existing files in imagesTargetPath if the start with "Book_<number>"' },
        ankiLibrary: { type: String, optional: true, description: 'Image location in Anki to be deleted if cleanImages' },
        dontRunInka: { type: Boolean, optional: true, description: 'Prevents inka from running, only generating local markdown' },
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
    if (args.ankiLibrary) {
        if (args.ankiLibrary.slice(-1) !== '/') {
            console.error('ERROR: ankiLibrary must end with /');
            sanitized = false;
        }
    }
    return sanitized;
}

function deleteImageFiles(folder: string) {
    fs.readdir(folder, (err, files) => {
        files.forEach((file) => {
            const file_path = folder + file;
            fs.stat(file_path, (error, stat) => {
                if (error) throw new Error('File does not exist');
                if(stat.isDirectory()){
                    //console.error('The file is a directory ' + file_path);
                }else if (/^Book_[0-9]/.test(file) ) {
                    //console.log('Delete ' + file_path);
                    fs.unlink(file_path, (error)=> {
                        if (error) throw new Error('Could not delete file');
                    });
                }
            });
        });
    });
}

function main() {
    // Sanitize arguments
    if (!isSanitizedArguments()) {
        return;
    }

    // Generate JSON
    if (args.generateJson) {
        console.log(`Generate JSON using calibredb to "${args.sourceCalibreJson}`);
        exec(`calibredb list --fields=id,title,authors,pubdate,cover,last_modified,\*readdate,rating,tags,\*comments ` +
             `-s '#read:"Yes"' --for-machine --sort-by last_modified > ${args.sourceCalibreJson}`);
    }
    
    // Delete images
    if (args.cleanImages) {
        if (args.imagesTargetPath) {
            console.log(`Deleting image files in "${args.imagesTargetPath}"`);
            deleteImageFiles(args.imagesTargetPath);
            if (args.ankiLibrary) {
                console.log(`Deleting image files in "${args.ankiLibrary}"`);
                deleteImageFiles(args.ankiLibrary);
            }
        }
        else {
            console.error("ERROR: To cleanImages, imagesTargetPath must be set");
        }
    }
    
    // Generate images
    if (args.imagesTargetPath) {
        console.log(`Extracting covers to "${args.imagesTargetPath}"`);
        extractCovers(args.sourceCalibreJson, args.imagesTargetPath);
        // Convert images using mogrify
        const imageSize = '500x500';
        console.log(`Reducing image size to "${imageSize}", if bigger`);
        exec(`mogrify -resize ${imageSize}\\> ${args.imagesTargetPath}/*`);
    }

    // Generate markdown
    console.log(`Generate markdown file in ${args.markdownTargetPath}`);
    generateMarkdown(args.sourceCalibreJson, args.markdownTargetPath);

    // Invoke inka
    if (args.dontRunInka !== true) {
        console.log('Adding to Anki using inka');
        console.log('export DISABLE_QT5_COMPAT=1 && ' +
        'source /Users/toni.tassani/code/inka/venv/bin/activate && ' +
        '/Users/toni.tassani/code/inka/venv/bin/inka collect ' + args.markdownTargetPath);
        exec('export DISABLE_QT5_COMPAT=1 && ' +
            'source /Users/toni.tassani/code/inka/venv/bin/activate && ' +
            '/Users/toni.tassani/code/inka/venv/bin/inka collect ' + args.markdownTargetPath);
    }
}

main();