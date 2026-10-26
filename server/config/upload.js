import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure directories exist
const uploadBase = path.join(__dirname, '..', 'uploads');
const reportsDir = path.join(uploadBase, 'medical_reports');
const profilesDir = path.join(uploadBase, 'profiles');

[uploadBase, reportsDir, profilesDir].forEach((dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// Allowed file types for medical reports
const allowedReportTypes = /jpeg|jpg|png|pdf/;
const allowedProfileTypes = /jpeg|jpg|png|webp/;

// Report storage
const reportStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, reportsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `report-${uniqueSuffix}${ext}`);
  }
});

// Profile storage
const profileStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, profilesDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `profile-${uniqueSuffix}${ext}`);
  }
});

// Filter functions
const reportFileFilter = (req, file, cb) => {
  const extname = allowedReportTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = /application\/pdf|image\/jpeg|image\/png/.test(file.mimetype);

  if (extname && mimetype) {
    return cb(null, true);
  } else {
    cb(new Error('Only PDF, JPG, JPEG, and PNG files are allowed for medical reports!'));
  }
};

const profileFileFilter = (req, file, cb) => {
  const extname = allowedProfileTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = /image\/jpeg|image\/png|image\/webp/.test(file.mimetype);

  if (extname && mimetype) {
    return cb(null, true);
  } else {
    cb(new Error('Only JPG, JPEG, PNG, and WEBP image files are allowed for profiles!'));
  }
};

const maxFileSize = (parseInt(process.env.MAX_FILE_SIZE_MB, 10) || 10) * 1024 * 1024;

export const uploadReport = multer({
  storage: reportStorage,
  limits: { fileSize: maxFileSize },
  fileFilter: reportFileFilter
});

export const uploadProfilePhoto = multer({
  storage: profileStorage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB for profile photos
  fileFilter: profileFileFilter
});
