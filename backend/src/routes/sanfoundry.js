const express = require('express');
const router = express.Router();
const { auth } = require('../middlewares/auth');
const Question = require('../models/Question');
const sanfoundryService = require('../services/sanfoundryService');

router.get('/topics', (req, res) => {
  try {
    const topics = sanfoundryService.getAvailableTopics();
    res.json({
      success: true,
      count: topics.length,
      topics
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

router.get('/questions/:topic', (req, res) => {
  try {
    const { topic } = req.params;
    const { page = 1, limit = 20 } = req.query;
    
    const data = sanfoundryService.getQuestionsByTopic(topic, { page, limit });
    
    res.json({
      success: true,
      ...data
    });
  } catch (error) {
    if (error.message.includes('not found')) {
      res.status(404).json({
        success: false,
        message: error.message
      });
    } else {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }
});

router.post('/import/:topic', auth, async (req, res) => {
  try {
    const { topic } = req.params;
    const userId = req.user._id;
    
    const result = await sanfoundryService.importToDatabase(topic, userId, Question);
    
    res.json({
      success: true,
      message: `Successfully imported ${result.imported} questions`,
      ...result
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

router.get('/search', (req, res) => {
  try {
    const { q } = req.query;
    
    if (!q) {
      return res.status(400).json({
        success: false,
        message: 'Query parameter "q" is required'
      });
    }
    
    const allTopics = sanfoundryService.getAvailableTopics();
    const filtered = allTopics.filter(t => 
      t.name.toLowerCase().includes(q.toLowerCase())
    );
    
    res.json({
      success: true,
      count: filtered.length,
      topics: filtered
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

module.exports = router;