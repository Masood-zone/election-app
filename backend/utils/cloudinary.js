// importing all dependencies
const cloudinaryModule = require('cloudinary');
const cloudinary = cloudinaryModule.v2;

// cloudinary function
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// exporting the cloudinary function

module.exports = cloudinary;
