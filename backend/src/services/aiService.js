const { GoogleGenerativeAI } = require('@google/generative-ai');

let genAI = null;
if (process.env.GEMINI_API_KEY) {
  genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
} else {
  console.warn('Warning: GEMINI_API_KEY not set. AI features will be disabled.');
}


async function retryWithBackoff(fn, maxRetries = 3, baseDelay = 1000) {
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      const isOverloaded = error.status === 503 || 
                          error.statusText === 'Service Unavailable' ||
                          error.message?.includes('overloaded') ||
                          error.message?.includes('503');
      
      const isLastAttempt = attempt === maxRetries - 1;
      
      if (isOverloaded && !isLastAttempt) {
       
        const delay = baseDelay * Math.pow(2, attempt);
        const jitter = Math.random() * 200; 
        const totalDelay = delay + jitter;
        
        console.log(`API overloaded, retrying in ${Math.round(totalDelay)}ms... (attempt ${attempt + 1}/${maxRetries})`);
        await new Promise(resolve => setTimeout(resolve, totalDelay));
        continue;
      }
      
      throw error;
    }
  }
}

async function parseResume(resumeText) {
  if (!genAI) {
    throw new Error('Gemini API key not configured');
  }
  
  return retryWithBackoff(async () => {
    try {
      const model = genAI.getGenerativeModel({ 
        model: 'gemini-2.5-flash',
        generationConfig: {
          temperature: 0.3,
          responseMimeType: 'application/json'
        }
      });
      
      const prompt = `You are a resume parsing assistant. Input is raw resume text. Output MUST be a valid JSON object with the following keys:
- "skills" (array of strings): technical and soft skills
- "roles" (array of strings): job titles/roles mentioned
- "projects" (array of objects with "name", "summary", "technologies"): notable projects
- "years_of_experience" (number or string like "2-3"): years of professional experience
- "education" (array of strings): educational background
- "certifications" (array of strings): certifications mentioned
- "highlights" (array of strings): key achievements or highlights

Do not include personal contact info. If a field is absent, use an empty array or null. Return ONLY valid JSON, no additional text.

Resume text:
${resumeText}`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      const parsed = JSON.parse(text);
      return parsed;
    } catch (error) {
      console.error('Resume parsing error:', error);
      throw error;
    }
  }, 3, 1000).catch(error => {
    throw new Error('Failed to parse resume: ' + error.message);
  });
}

async function generateSuggestedQuestions(parsedResume) {
  if (!genAI) {
    throw new Error('Gemini API key not configured');
  }
  
  return retryWithBackoff(async () => {
    try {
      const model = genAI.getGenerativeModel({ 
        model: 'gemini-2.5-flash',
        generationConfig: {
          temperature: 0.7,
          responseMimeType: 'application/json'
        }
      });
      
      const prompt = `Based on the following resume data, generate 10 relevant interview questions (mix of technical and behavioral). 
Return a JSON object with a "questions" key containing an array of objects, each with: "title" (string), "body" (string), "difficulty" ("easy"/"medium"/"hard"), "tags" (array of strings), "type" ("technical"/"behavioral").

Resume data:
${JSON.stringify(parsedResume, null, 2)}

Return ONLY valid JSON, no additional text.`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      const resultData = JSON.parse(text);
      return resultData.questions || [];
    } catch (error) {
      console.error('Question generation error:', error);
      throw error;
    }
  }, 3, 1000).catch(error => {
    throw new Error('Failed to generate questions: ' + error.message);
  });
}


async function chatWithAI(messages, resumeContext = null) {
  if (!genAI) {
    throw new Error('Gemini API key not configured');
  }
  
  return retryWithBackoff(async () => {
    try {
      const systemInstruction = resumeContext
        ? `You are an AI interview preparation assistant. You have access to the user's resume information. Help them prepare for interviews by:
- Answering questions about their resume
- Suggesting practice questions
- Providing interview tips
- Conducting mock interviews if requested

Resume context:
${JSON.stringify(resumeContext, null, 2)}

Be friendly, professional, and helpful.`
        : 'You are an AI interview preparation assistant. Help users prepare for interviews with tips, practice questions, and guidance.';

      const model = genAI.getGenerativeModel({ 
        model: 'gemini-2.5-flash',
        systemInstruction: systemInstruction,
        generationConfig: {
          temperature: 0.7
        }
      });

      
      const chatHistory = [];
      for (const msg of messages) {
        if (msg.role === 'user') {
          chatHistory.push({
            role: 'user',
            parts: [{ text: msg.text }]
          });
        } else if (msg.role === 'assistant') {
          chatHistory.push({
            role: 'model',
            parts: [{ text: msg.text }]
          });
        }
      }

      if (chatHistory.length === 0) {
        throw new Error('No messages provided');
      }

      const lastMessage = chatHistory[chatHistory.length - 1];
      
      if (lastMessage.role !== 'user') {
        throw new Error('Last message must be from user');
      }

      const history = chatHistory.slice(0, -1);
      
      const chat = history.length > 0 
        ? model.startChat({ history })
        : model.startChat();
      
      const result = await chat.sendMessage(lastMessage.parts[0].text);
      const response = await result.response;
      return response.text();
    } catch (error) {
      console.error('Chat error:', error);
      console.error('Error details:', error.message);
      if (error.stack) {
        console.error('Stack trace:', error.stack);
      }
      throw error;
    }
  }, 3, 1000).catch(error => {
    if (error.message && error.message.includes('API key')) {
      throw error;
    }
    throw new Error(`Failed to get AI response: ${error.message || 'Unknown error'}`);
  });
}

module.exports = {
  parseResume,
  generateSuggestedQuestions,
  chatWithAI
};