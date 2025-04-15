//onst multer = require('multer');
import multer from 'multer';

const upload = (multer({
    storage: multer.diskStorage({
        destination: (req, file, cb) => {
            cb(null, './public/upload')
        },
        filename: (req, file, cb) => {
            cb(null, Date.now().toString + '-' + file.originalname)
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