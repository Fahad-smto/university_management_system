import multer from 'multer';
import { NextFunction, Request, Response } from 'express';
import ApiError from '../errors/ApiError';

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

const upload = multer({
  storage: multer.memoryStorage(), // ডিস্কে ফাইল জমা হবে না
  limits: { fileSize: 2 * 1024 * 1024 }, // সর্বোচ্চ 2MB
  fileFilter: (req, file, cb) => {
    if (ALLOWED_TYPES.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new ApiError(400, 'Only JPG, PNG and WEBP images are allowed'));
    }
  },
});

// form-data এর "image" ফিল্ডের একটা ছবি নেয়।
// Multer এর নিজস্ব error গুলো সুন্দর 400 error এ বদলে দেওয়া হচ্ছে
export const uploadSingleImage = (req: Request, res: Response, next: NextFunction) => {
  upload.single('image')(req, res, (error: unknown) => {
    if (error instanceof multer.MulterError) {
      const message =
        error.code === 'LIMIT_FILE_SIZE' ? 'Image must be 2MB or smaller' : error.message;
      return next(new ApiError(400, message));
    }

    if (error) return next(error);

    next();
  });
};

export default uploadSingleImage;