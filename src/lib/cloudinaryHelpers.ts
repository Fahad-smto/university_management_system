import cloudinary from '../lib/cloudinary';
import ApiError from '../errors/ApiError';

// মেমোরির ছবি (buffer) Cloudinary তে আপলোড করে, URL আর publicId ফেরত দেয়
export const uploadImageBuffer = (
  buffer: Buffer,
  folder: string,
): Promise<{ url: string; publicId: string }> => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: 'image',
        // ছবি 500x500 করে কেটে রাখা হয়, ফলে সব প্রোফাইল ছবি একই মাপের থাকে
        transformation: [{ width: 500, height: 500, crop: 'fill', gravity: 'auto' }],
      },
      (error, result) => {
        if (error || !result) {
          console.error('Cloudinary upload failed:', error);
          return reject(new ApiError(400, 'Image upload failed. Please try another image'));
        }
        resolve({ url: result.secure_url, publicId: result.public_id });
      },
    );

    stream.end(buffer);
  });
};

// publicId দিয়ে Cloudinary থেকে ছবি মুছে ফেলা
export const deleteImage = async (publicId: string): Promise<void> => {
  await cloudinary.uploader.destroy(publicId);
};