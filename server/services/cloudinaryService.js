const cloudinary = require('cloudinary').v2;
const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'fars',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp', 'pdf'],
    max_file_size: 5 * 1024 * 1024,
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
    if (!allowed.includes(file.mimetype)) {
      return cb(new Error('Only JPG, PNG, WebP images and PDF files are allowed.'));
    }
    cb(null, true);
  },
});

const uploadToCloudinary = async (fileBuffer, options = {}) => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      { folder: 'fars', ...options },
      (err, result) => {
        if (err) reject(err);
        else resolve(result.secure_url);
      }
    );
    uploadStream.end(fileBuffer);
  });
};

module.exports = { cloudinary, upload, uploadToCloudinary };
