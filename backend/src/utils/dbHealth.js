const mongoose = require('mongoose');

function checkDbHealth() {
  const state = mongoose.connection.readyState;
  const states = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting'
  };
  
  return {
    status: states[state] || 'unknown',
    readyState: state,
    isConnected: state === 1
  };
}

async function testConnection() {
  try {
    await mongoose.connection.db.admin().ping();
    return { success: true, message: 'Database connection is healthy' };
  } catch (error) {
    return { success: false, message: error.message };
  }
}

module.exports = { checkDbHealth, testConnection };