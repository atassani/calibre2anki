import * as fs from 'fs';
import {buildFileName} from './filename';

function copyFile(src: string, dst: string) {
    try {
        fs.copyFileSync(src, dst);
    } catch(err) {
        console.error('Error copying file ' + src + '. ' + err);
    }
}

async function extractCalibreCovers(sourceCalibreJson: string, imagesTargetPath: string) {
    var data = JSON.parse(fs.readFileSync(sourceCalibreJson, 'utf-8'));
    await new Promise( resolve => {
        data.filter(b => (b.cover)).map(b => copyFile(
            b.cover
            ,imagesTargetPath+'/'+buildFileName(b.id, b.title)
        ));
        resolve('extractCalibreCovers');
        }
    );
}

export default extractCalibreCovers;