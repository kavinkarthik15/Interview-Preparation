const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const fsPromises = require('fs').promises;
const pdfParse = require('pdf-parse');
const mammoth = require('mammoth');
const User = require('../models/User');
const auth = require('../middleware/auth');
const sendError = require('../utils/sendError');

const router = express.Router();

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Multer storage config
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, `resume-${uniqueSuffix}${path.extname(file.originalname)}`);
  }
});

// File filter - only PDF and DOC/DOCX
const fileFilter = (req, file, cb) => {
  const allowedTypes = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only PDF, DOC, and DOCX files are allowed'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB max
});

// Extract text from uploaded file
async function extractText(filePath, mimetype) {
  if (mimetype === 'application/pdf') {
    const dataBuffer = await fsPromises.readFile(filePath);
    const data = await pdfParse(dataBuffer);
    return data.text;
  } else if (
    mimetype === 'application/msword' ||
    mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ) {
    const result = await mammoth.extractRawText({ path: filePath });
    return result.value;
  }
  throw new Error('Unsupported file type');
}

// Extract skills from resume text
function extractSkills(text) {
  const skillKeywords = [
    'JavaScript', 'TypeScript', 'Python', 'Java', 'C\\+\\+', 'C#', 'Go', 'Rust', 'Ruby', 'PHP', 'Swift', 'Kotlin',
    'React', 'Angular', 'Vue', 'Next\\.js', 'Node\\.js', 'Express', 'Django', 'Flask', 'Spring Boot', 'Laravel',
    'MongoDB', 'PostgreSQL', 'MySQL', 'Redis', 'SQLite', 'DynamoDB', 'Firebase',
    'AWS', 'Azure', 'GCP', 'Docker', 'Kubernetes', 'CI/CD', 'Jenkins', 'GitHub Actions',
    'REST', 'GraphQL', 'gRPC', 'WebSocket', 'Microservices',
    'HTML', 'CSS', 'SCSS', 'Tailwind', 'Bootstrap', 'Material UI',
    'Git', 'Linux', 'Agile', 'Scrum', 'JIRA', 'Figma',
    'Machine Learning', 'Deep Learning', 'TensorFlow', 'PyTorch', 'NLP',
    'Data Structures', 'Algorithms', 'System Design', 'OOP', 'Design Patterns',
    'SQL', 'NoSQL', 'Elasticsearch', 'RabbitMQ', 'Kafka',
    'Sass', 'Webpack', 'Vite', 'Babel', 'Redux', 'Zustand', 'MobX',
    'Jest', 'Mocha', 'Cypress', 'Selenium', 'Playwright',
    'Nginx', 'Apache', 'Terraform', 'Ansible'
  ];

  // Display-friendly names (unescaped) for results
  const displayNames = {
    'C\\+\\+': 'C++', 'Next\\.js': 'Next.js', 'Node\\.js': 'Node.js'
  };

  const foundSkills = [];

  for (const skill of skillKeywords) {
    // Use word-boundary matching to avoid false positives (e.g. "Go" matching "Google")
    const pattern = new RegExp(`\\b${skill}\\b`, 'i');
    if (pattern.test(text)) {
      foundSkills.push(displayNames[skill] || skill);
    }
  }

  return [...new Set(foundSkills)];
}

// Multer error-handling wrapper
function handleUpload(req, res, next) {
  upload.single('resume')(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ message: 'File size exceeds 10MB limit' });
      }
      return res.status(400).json({ message: err.message });
    }
    if (err) {
      return res.status(400).json({ message: err.message });
    }
    next();
  });
}

// POST /api/resume/upload - Upload resume
router.post('/upload', auth, handleUpload, async (req, res) => {
  const filePath = req.file?.path;
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded. Please upload a PDF or DOC file.' });
    }

    // Extract text from file
    const extractedText = await extractText(filePath, req.file.mimetype);
    const skills = extractSkills(extractedText);

    // Store resume text and filename in user profile
    await User.findByIdAndUpdate(req.userId, {
      resumeText: extractedText,
      resumeFileName: req.file.originalname
    });

    // Clean up uploaded file after processing
    await fsPromises.unlink(filePath).catch(() => {});

    res.json({
      message: 'Resume uploaded and processed successfully',
      fileName: req.file.originalname,
      fileSize: req.file.size,
      extractedText,
      skills,
      wordCount: extractedText.split(/\s+/).filter(w => w.length > 0).length
    });
  } catch (error) {
    // Clean up file on error
    if (filePath) await fsPromises.unlink(filePath).catch(() => {});
    sendError(res, 500, 'Server error', error);
  }
});

// GET /api/resume - Get stored resume data
router.get('/', auth, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user.resumeText) {
      return res.status(404).json({ message: 'No resume uploaded yet' });
    }

    const skills = extractSkills(user.resumeText);

    res.json({
      fileName: user.resumeFileName,
      resumeText: user.resumeText,
      skills,
      wordCount: user.resumeText.split(/\s+/).filter(w => w.length > 0).length
    });
  } catch (error) {
    sendError(res, 500, 'Server error', error);
  }
});

module.exports = router;
