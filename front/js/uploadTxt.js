const multer = require('multer');

module.exports = (multer({
    storage: multer.diskStorage({
        destination: (req, file, cb) => {
            cb(null, './back/uploads')
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
}))