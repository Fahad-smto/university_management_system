import { v2 as cloudinary } from 'cloudinary';
import config from '../config';

// Cloudinary এর সাথে সংযোগের সেটিং, একবারই করা হয়
cloudinary.config({
  cloud_name: config.cloudinary.cloud_name,
  api_key: config.cloudinary.api_key,
  api_secret: config.cloudinary.api_secret,
  secure: true,
});

export default cloudinary;