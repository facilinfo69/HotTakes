//gestion de fichier
const multer = require('multer');

const MIME_TYPES = {
  'image/jpg': 'jpg',
  'image/jpeg': 'jpg',
  'image/png': 'png'
};

// configure le chemin et le nom de fichier
const storage = multer.diskStorage({
  // indique le dossier 
  destination: (req, file, callback) => {
    callback(null, 'images');
  },
  // nom d'origine, remplace espace par underscore, supprime les caractères après le "." et ajoute un timestamp = nom de fichier
  filename: (req, file, callback) => {
    let name = file.originalname.split(' ').join('_');
    name = name.split(".")[0];
    //extension du fichier 
    const extension = MIME_TYPES[file.mimetype];
    callback(null, name + Date.now() + '.' + extension);
  }
});
// seulement les fichiers images. capture les fichiers image 
module.exports = multer({ storage: storage }).single('image');