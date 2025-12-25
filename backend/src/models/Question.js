const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  companyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company',
    default: null
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  body: {
    type: String,
    required: true
  },
  difficulty: {
    type: String,
    enum: ['easy', 'medium', 'hard'],
    required: true
  },
  tags: [{
    type: String,
    trim: true
  }],
  
  type: {
    type: String,
    enum: ['coding', 'mcq'],
    default: 'coding'
  },
  options: [{
    type: String,
    trim: true
  }],
  correctAnswer: {
    type: String,
    trim: true
  },
  explanation: {
    type: String,
    trim: true
  },
  source: {
    type: String,
    enum: ['user', 'sanfoundry'],
    default: 'user'
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: function() {
      return this.source === 'user';
    }
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

questionSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Question', questionSchema);