const multer = require('multer');

// Using uploads directory for the storage configuration of the files 
// received by multer,

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, '../../public/uploads')
    },
    filename: function (req, file, cb) {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
      cb(null, file.fieldname + '-' + uniqueSuffix)
    }
  })
  
  const upload = multer({ storage: storage })

module.exports = upload;