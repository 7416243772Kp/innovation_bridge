const multer = require('multer');
const path = require('path');

// Configure local storage
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'frontend/uploads/'); // Ensure this folder exists!
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

// Create upload middleware
const upload = multer({ 
    storage: storage,
    limits: { fileSize: 50 * 1024 * 1024 } // 50MB limit for videos/images
});

module.exports = upload;