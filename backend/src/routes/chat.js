const express = require('express');
const { v4: uuidv4 } = require('uuid');
const { auth } = require('../middlewares/auth');
const ChatSession = require('../models/ChatSession');
const Profile = require('../models/Profile');
const { chatWithAI } = require('../services/aiService');

const router = express.Router();

router.get('/session', auth, async (req, res) => {
  try {
    let session = await ChatSession.findOne({ userId: req.user._id });
    
    if (!session) {
      session = new ChatSession({
        userId: req.user._id,
        sessionId: uuidv4(),
        messages: []
      });
      await session.save();
    }

    res.json({ sessionId: session.sessionId, messages: session.messages });
  } catch (error) {
    console.error('Get session error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/message', auth, async (req, res) => {
  try {
    const { message, sessionId } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).json({ message: 'Message is required' });
    }

    let session = null;
    if (sessionId) {
      session = await ChatSession.findOne({ 
        userId: req.user._id,
        sessionId: sessionId
      });
    } else {
      session = await ChatSession.findOne({ userId: req.user._id });
    }

    if (!session) {
      session = new ChatSession({
        userId: req.user._id,
        sessionId: sessionId || uuidv4(),
        messages: []
      });
    }

    session.messages.push({
      role: 'user',
      sender: 'user',
      text: message.trim()
    });

    const profile = await Profile.findOne({ userId: req.user._id });
    const resumeContext = profile?.aiSummary || null;

    const aiResponse = await chatWithAI(session.messages, resumeContext);

    session.messages.push({
      role: 'assistant',
      sender: 'assistant',
      text: aiResponse
    });

    await session.save();

    res.json({
      sessionId: session.sessionId,
      response: aiResponse,
      messages: session.messages
    });
  } catch (error) {
    console.error('Chat error:', error);
    res.status(500).json({ message: error.message || 'Server error' });
  }
});

router.delete('/session', auth, async (req, res) => {
  try {
    await ChatSession.deleteOne({ userId: req.user._id });
    res.json({ message: 'Chat session cleared' });
  } catch (error) {
    console.error('Clear session error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;