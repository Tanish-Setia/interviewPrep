const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { auth } = require('../middlewares/auth');
const Profile = require('../models/Profile');
const { parseResume, generateSuggestedQuestions } = require('../services/aiService');
const pdf = require('pdf-parse');

const router = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../../uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, `resume-${req.user._id}-${uniqueSuffix}${path.extname(file.originalname)}`);
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['.pdf', '.docx', '.txt'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowedTypes.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only PDF, DOCX, and TXT files are allowed.'));
    }
  }
});

async function extractTextFromPDF(filePath) {
  try {
    const dataBuffer = fs.readFileSync(filePath);
    const data = await pdf(dataBuffer);
    return data.text;
  } catch (error) {
    throw new Error('Failed to extract text from PDF');
  }
}

function extractTextFromTXT(filePath) {
  try {
    return fs.readFileSync(filePath, 'utf-8');
  } catch (error) {
    throw new Error('Failed to read text file');
  }
}

router.post('/upload', auth, upload.single('resume'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const profile = await Profile.findOne({ userId: req.user._id });
    if (!profile) {
      return res.status(404).json({ message: 'Profile not found' });
    }

    if (profile.resumeUrl) {
      const oldPath = path.join(__dirname, '../../', profile.resumeUrl);
      if (fs.existsSync(oldPath)) {
        fs.unlinkSync(oldPath);
      }
    }

    profile.resumeUrl = `/uploads/${req.file.filename}`;
    await profile.save();

    res.json({
      message: 'Resume uploaded successfully',
      resumeUrl: profile.resumeUrl
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ message: error.message || 'Server error' });
  }
});

router.post('/parse', auth, async (req, res) => {
  try {
    const profile = await Profile.findOne({ userId: req.user._id });
    if (!profile || !profile.resumeUrl) {
      return res.status(404).json({ message: 'Resume not found. Please upload a resume first.' });
    }

    const filePath = path.join(__dirname, '../../', profile.resumeUrl);
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ message: 'Resume file not found' });
    }

    let resumeText = '';
    const ext = path.extname(filePath).toLowerCase();
    
    if (ext === '.pdf') {
      resumeText = await extractTextFromPDF(filePath);
    } else if (ext === '.txt') {
      resumeText = extractTextFromTXT(filePath);
    } else if (ext === '.docx') {
      return res.status(400).json({ 
        message: 'DOCX parsing not yet implemented. Please upload PDF or TXT format.' 
      });
    }

    const parsedData = await parseResume(resumeText);

    const suggestedQuestions = await generateSuggestedQuestions(parsedData);

    profile.aiSummary = {
      skills: parsedData.skills || [],
      strengths: parsedData.highlights || [],
      suggestedQuestions: [] 
    };

    if (parsedData.skills && parsedData.skills.length > 0) {
      profile.skills = [...new Set([...profile.skills, ...parsedData.skills])];
    }

    await profile.save();

    res.json({
      message: 'Resume parsed successfully',
      parsedData,
      suggestedQuestions,
      aiSummary: profile.aiSummary
    });
  } catch (error) {
    console.error('Parse error:', error);
    res.status(500).json({ message: error.message || 'Server error during parsing' });
  }
});

module.exports = router;