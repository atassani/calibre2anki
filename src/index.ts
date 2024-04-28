import * as fs from 'fs';
import { parse } from 'ts-command-line-args';
import {exec} from 'shelljs';
import extractCovers from './extractCalibreCovers';
import {generateMarkdown} from './generateMarkdown';
//import { execSync } from 'child_process';

// npm run build && npm run start -- --sourceCalibreJson ./data/calibre_books.json --markdownTargetPath ./output/calibre_markdown.md --generateJson --cleanImages -i ./output/images/ --ankiLibrary /Users/toni.tassani/Library/Application\ Support/Anki2/User\ 1/collection.media/
// npm run build && npm run start -- --sourceCalibreJson ./data/calibre_books.json --markdownTargetPath ./output/calibre_markdown.md --generateJson 
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
                    fs.unlinkSync(file_path);
                }
            });
        });
    });
}

function pathToFile(path: string) : string {
    return path.split('/').slice(0, -1).join('/');
}

async function generateJson() {
    if (args.generateJson) {
        console.log(`Generate JSON using calibredb to "${args.sourceCalibreJson}`);
        var error = '';
        try { 
            error = exec(`calibredb list --fields=id,title,authors,pubdate,cover,last_modified,\*readdate,rating,tags,\*comments,\*readorder,\*read ` +
                 `-s '#read:"Yes" or (#readorder:>0.0)' --for-machine --sort-by last_modified > ${args.sourceCalibreJson}`, {silent: true})
                 .stderr;
        } catch(err) {
            console.error('ERROR: Could not run calibredb. Is Calibre running?\n' + error);
            return;
        }
    }
}

async function deleteImages() {
    if (args.cleanImages) {
        if (args.imagesTargetPath) {
            console.log(`Deleting image files in "${args.imagesTargetPath}"`);
            deleteImageFiles(args.imagesTargetPath);
            if (args.ankiLibrary) {
                console.log(`Deleting image files in "${args.ankiLibrary}"`);
                deleteImageFiles(args.ankiLibrary);
            }
            // Delete emblems
            console.log(`Deleting emblems`);
            var error = '';
            try {
                error = exec(`rm "${args.ankiLibrary}calibre_emblems_"*`, {silent: true}).stderr;
            } catch(err) {
                console.error(`ERROR: deleting "${args.ankiLibrary}calibre_emblems_"*\n${error}`);
            }
            try {
                error = exec(`rm "${args.imagesTargetPath}calibre_emblems_"*`, {silent: true}).stderr;
            } catch(err) {
                console.log(`ERROR: deleting "${args.imagesTargetPath}calibre_emblems_"*\n${error}`);
            }
        }
        else {
            console.error("ERROR: To cleanImages, imagesTargetPath must be set");
        }
    }
}

async function generateImages() {
    if (args.imagesTargetPath) {
        console.log(`Extracting covers to "${args.imagesTargetPath}"`);
        extractCovers(args.sourceCalibreJson, args.imagesTargetPath);
        // Convert images using mogrify
        const imageSize = '500x500';
        console.log(`Reducing image size to "${imageSize}", if bigger`);
        var error = ''
        try {
            error = exec(`mogrify -resize ${imageSize}\\> ${args.imagesTargetPath}/*`, {silent: true}).stderr;
        } catch(err) {
            console.error('ERROR: Could not run mogrify to reduce images\n' + error);
        }

        // Add image borders if they are mostly white
        /*
        console.log(`Add image borders if they are mostly white`);
        var error = '';
        try {
            error = exec(`./border-images.sh`, {silent: true}).stderr;
        } catch(err) {
            console.error(`ERROR: adding border\n${error}`)
        }
        */

        // Copy emblems
        console.log(`Copying emblems`);
        var error = '';
        try {
            error = exec(`cp /Users/toni.tassani/Library/Preferences/calibre/cc_icons/* ${args.imagesTargetPath}`, {silent: true}).stderr;
            error = exec(`find ${args.imagesTargetPath} -type f -not -name "Book_*" -not -name ".DS_Store" -exec rename -e 's/(.*)\\/(.*)/$1\\/calibre_emblems_$2/' {}  \\;`, {silent:true}).stderr;
            error = exec(`find ${args.imagesTargetPath} -type f -not -name "Book_*" -not -name ".DS_Store" -exec  mogrify -resize 25x25\\> {} \\;`, {silent: true}).stderr;
        } catch(err) {
            console.error('ERROR: copying emblems\n' + error);
        }
    }
}

function invokeAnki() {
    if (args.dontRunInka !== true) {
        console.log('Adding to Anki using inka');
        try {
            const {stdout, stderr, code} = exec('export DISABLE_QT5_COMPAT=1 && ' +
                'source /Users/toni.tassani/code/inka/venv/bin/activate && ' +
                '/Users/toni.tassani/code/inka/venv/bin/inka collect ' + pathToFile(args.markdownTargetPath), {silent: true}); 
            console.log(stdout);
            console.log(stderr);
        } catch(err) {
            console.error('ERROR: executing inka');
        }
    }
}

async function main() {
    // Sanitize arguments
    if (!isSanitizedArguments()) {
        return;
    }

    // Generate JSON
    await generateJson();
    
    // Delete images, including emblems
    await deleteImages();
    
    // Generate images, including emblems
    await generateImages();

    // Generate markdown
    await generateMarkdown(args.sourceCalibreJson, args.markdownTargetPath);

    // Invoke inka
    invokeAnki();
}

main();