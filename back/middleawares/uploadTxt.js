//onst multer = require('multer');
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const upload = (multer({
    storage: multer.diskStorage({
        destination: (req, file, cb) => {
            cb(null, './public/upload');
        },
        filename: (req, file, cb) => {
            cb(null, Date.now().toString() + '-' + file.originalname)
        }
    }),
    fileFilter: (req, file, cb) => {
        const extensaoTxt = ['text/plain'].find(formatoAceito => formatoAceito == file.mimetype);

        if(extensaoTxt){
            return cb(null, true);
        }

        return(cb, false);
    }
}));

export default upload;