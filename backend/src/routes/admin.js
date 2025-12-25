const express = require('express');
const { adminAuth } = require('../middlewares/auth');
const Question = require('../models/Question');
const Company = require('../models/Company');

const router = express.Router();

router.use(adminAuth);

router.get('/questions', async (req, res) => {
  try {
    const questions = await Question.find()
      .populate('companyId', 'name')
      .populate('createdBy', 'name')
      .sort({ createdAt: -1 });

    res.json({ questions });
  } catch (error) {
    console.error('Get questions error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/questions', async (req, res) => {
  try {
    const { companyId, title, body, difficulty, tags } = req.body;

    if (!title || !body || !difficulty) {
      return res.status(400).json({ message: 'Title, body, and difficulty are required' });
    }

    const question = new Question({
      companyId: companyId || null,
      title,
      body,
      difficulty,
      tags: tags || [],
      createdBy: req.user._id
    });

    await question.save();
    res.status(201).json({ message: 'Question created successfully', question });
  } catch (error) {
    console.error('Create question error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.put('/questions/:id', async (req, res) => {
  try {
    const { title, body, difficulty, tags, companyId } = req.body;

    const question = await Question.findById(req.params.id);
    if (!question) {
      return res.status(404).json({ message: 'Question not found' });
    }

    if (title) question.title = title;
    if (body) question.body = body;
    if (difficulty) question.difficulty = difficulty;
    if (tags) question.tags = tags;
    if (companyId !== undefined) question.companyId = companyId;

    await question.save();
    res.json({ message: 'Question updated successfully', question });
  } catch (error) {
    console.error('Update question error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.delete('/questions/:id', async (req, res) => {
  try {
    const question = await Question.findByIdAndDelete(req.params.id);
    if (!question) {
      return res.status(404).json({ message: 'Question not found' });
    }
    res.json({ message: 'Question deleted successfully' });
  } catch (error) {
    console.error('Delete question error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/companies', async (req, res) => {
  try {
    const companies = await Company.find().sort({ name: 1 });
    res.json({ companies });
  } catch (error) {
    console.error('Get companies error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/companies', async (req, res) => {
  try {
    const { name, domain, description } = req.body;

    if (!name) {
      return res.status(400).json({ message: 'Company name is required' });
    }

    const company = new Company({
      name,
      domain: domain || '',
      description: description || ''
    });

    await company.save();
    res.status(201).json({ message: 'Company created successfully', company });
  } catch (error) {
    console.error('Create company error:', error);
    res.status(500).json({ message: error.message || 'Server error' });
  }
});

module.exports = router;

