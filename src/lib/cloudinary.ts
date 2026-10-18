import { config } from './../config/index';
import { v2 as cloudinary } from 'cloudinary';
 cloudinary.config({ 
        cloud_name: config.cloudinary.cloud_name, // Click 'View API Keys' above to copy your cloud name
        api_key: config.cloudinary.api_key, // Click 'View API Keys' above to copy your API key
        api_secret: config.cloudinary.api_secret // Click 'View API Keys' above to copy your API secret
    });
    

export const cloudinaryUploader = cloudinary.uploader;