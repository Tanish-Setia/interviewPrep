// const axios = require('axios');

// const SANFOUNDRY_API_BASE = 'https://raw.githubusercontent.com/owaisansarii/sanfoundry-api/main';

// // Hardcoded list from the repository (since contents.json doesn't exist)
// const AVAILABLE_CATEGORIES = [
//   'Advanced Machining',
//   'Aerodynamics',
//   'Aerospace Materials & Processes',
//   'Aircraft Design',
//   'Aircraft Maintenance',
//   'Aircraft Performance',
//   'Analog Circuits',
//   'Analog Communications',
//   'Analytical Instrumentation',
//   'Antennas',
//   'C',
//   'C#',
//   'C++',
//   'Cloud Computing',
//   'CSS',
//   'Cyber Security',
//   'Data Science',
//   'Data Structures & Algorithms I',
//   'Data Structures & Algorithms II',
//   'Database Management',
//   'Hadoop',
//   'HTML',
//   'IOT',
//   'Java',
//   'JavaScript',
//   'Linux',
//   'MongoDB',
//   'MySQL',
//   'Object Oriented Programming',
//   'Operating System',
//   'Oracle',
//   'PHP',
//   'Python',
//   'R Programming',
//   'Ruby',
//   'SQL Server',
//   'Unix',
//   'Computer Architecture',
//   'Computer Fundamentals',
//   'Computer Graphics',
//   'Computer Network',
//   'Artificial Intelligence',
//   'Software Engineering'
// ];

// async function getAvailableCategories() {
//   return AVAILABLE_CATEGORIES.sort();
// }

// async function getMCQsByCategory(categoryTitle) {
//   // The files are named exactly like: "1000 Java MCQs.json"
//   const fileName = `1000 ${categoryTitle} MCQs`;
//   const url = `${SANFOUNDRY_API_BASE}/saved/${encodeURIComponent(fileName)}.json`;

//   console.log(`🔍 Fetching: ${url}`);

//   try {
//     const response = await axios.get(url, {
//       timeout: 15000,
//       validateStatus: (status) => status === 200
//     });

//     console.log(`✅ Successfully fetched questions for: ${categoryTitle}`);
//     const data = Array.isArray(response.data) ? response.data : response.data.questions || [];
//     console.log(`📝 Retrieved ${data.length} questions`);
//     return data;
//   } catch (error) {
//     console.error(`❌ Failed to fetch ${fileName}.json:`, error.message);
//     throw new Error(`No MCQs found for "${categoryTitle}". File "${fileName}.json" does not exist.`);
//   }
// }

// function transformSanfoundryMCQ(mcq, categoryTitle, userId) {
//   // Extract question text
//   const questionText = mcq.question || mcq.title || mcq.q || mcq.Question || 'Question text not found';

//   // Extract options - handle multiple formats
//   let options = [];
//   if (Array.isArray(mcq.options)) {
//     options = mcq.options;
//   } else if (mcq.a || mcq.A) {
//     options = [
//       mcq.a || mcq.A,
//       mcq.b || mcq.B,
//       mcq.c || mcq.C,
//       mcq.d || mcq.D
//     ].filter(Boolean);
//   } else if (mcq.option1) {
//     options = [mcq.option1, mcq.option2, mcq.option3, mcq.option4].filter(Boolean);
//   }

//   // Get correct answer
//   const correctAnswer = (
//     mcq.answer ||
//     mcq.correctAnswer ||
//     mcq.correct ||
//     'a'
//   ).toString().toLowerCase().trim();

//   // Get explanation
//   const explanation = mcq.explanation || mcq.solution || '';

//   // Determine difficulty
//   const difficulty = (mcq.difficulty || 'medium').toLowerCase();

//   return {
//     title: questionText.substring(0, 100),
//     body: questionText,
//     difficulty,
//     tags: [categoryTitle, 'mcq', 'sanfoundry'],
//     type: 'mcq',
//     options,
//     correctAnswer,
//     explanation,
//     source: 'sanfoundry',
//     createdBy: userId,
//     companyId: null
//   };
// }

// async function importQuestionsFromCategory(categoryTitle, userId, limit = 50) {
//   console.log(`📥 Importing up to ${limit} questions for: ${categoryTitle}`);

//   const mcqs = await getMCQsByCategory(categoryTitle);
//   console.log(`✅ Found ${mcqs.length} total questions`);

//   const transformed = mcqs
//     .slice(0, limit)
//     .map(mcq => transformSanfoundryMCQ(mcq, categoryTitle, userId))
//     .filter(q => q.options.length >= 2);

//   console.log(`✅ Successfully transformed ${transformed.length} questions`);
//   return transformed;
// }

// module.exports = {
//   getAvailableCategories,
//   getMCQsByCategory,
//   transformSanfoundryMCQ,
//   importQuestionsFromCategory
// };

const fs = require("fs");
const path = require("path");

// Path to the downloaded JSON files
const DATA_DIR = path.join(__dirname, "../../data/sanfoundry");

/**
 * Get all available topics by reading filenames
 */
function getAvailableTopics() {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      console.error("❌ Data directory not found:", DATA_DIR);
      return [];
    }

    const files = fs.readdirSync(DATA_DIR);

    const topics = files
      .filter((file) => file.endsWith(".json"))
      .map((file) => {
        // Remove "1000 " prefix and " MCQs.json" suffix
        const topicName = file
          .replace(/^1000\s+/i, "")
          .replace(/\s+MCQs\.json$/i, "")
          .trim();

        return {
          id: topicName
            .toLowerCase()
            .replace(/\s+/g, "-") // spaces → hyphen
            .replace(/\+/g, "plus"), // "C++" → "c-plus-plus"

          name: topicName,
          fileName: file,
        };
      })
      .sort((a, b) => a.name.localeCompare(b.name));

    console.log(`✅ Found ${topics.length} topics`);
    return topics;
  } catch (error) {
    console.error("Error reading topics:", error);
    return [];
  }
}

/**
 * Find the exact JSON file for a given topic (case-insensitive)
 */
function findTopicFile(topicName) {
  const topics = getAvailableTopics();

  // Convert id-style back to comparable text
  const normalized = topicName
    .toLowerCase()
    .replace(/-/g, ' ')
    .replace(/plus/g, '+');

  let topic = topics.find(t =>
    t.id === topicName.toLowerCase() ||
    t.name.toLowerCase() === normalized
  );

  if (!topic) {
    topic = topics.find(t =>
      t.name.toLowerCase().includes(normalized)
    );
  }

  return topic;
}

/**
 * Load questions from a specific topic
 */
function getQuestionsByTopic(topicName, options = {}) {
  const { page = 1, limit = 20 } = options;

  try {
    const topic = findTopicFile(topicName);

    if (!topic) {
      throw new Error(`Topic "${topicName}" not found`);
    }

    const filePath = path.join(DATA_DIR, topic.fileName);

    if (!fs.existsSync(filePath)) {
      throw new Error(`File not found: ${topic.fileName}`);
    }

    const fileContent = fs.readFileSync(filePath, "utf8");
    const allQuestions = JSON.parse(fileContent);

    const normalized = allQuestions
      .map(normalizeQuestion)
      .filter((q) => q.question && q.options.length >= 2);

    // Pagination on normalized
    const startIndex = (page - 1) * limit;
    const pageItems = normalized.slice(startIndex, startIndex + limit);

    return {
      topic: topic.name,
      total: normalized.length,
      page: Number(page),
      limit: Number(limit),
      totalPages: Math.ceil(normalized.length / limit),
      questions: pageItems,
    };
  } catch (error) {
    console.error(`Error loading questions for ${topicName}:`, error.message);
    throw error;
  }
}

/**
 * Normalize question format (handle different JSON structures)
 */
function normalizeQuestion(mcq) {
  // 1. Question text (support multiple key styles)
  const question = mcq.question || mcq.Question || mcq.title || mcq.q || "";

  // 2. Options (support several common patterns)
  let options = [];

  if (Array.isArray(mcq.options)) {
    options = mcq.options;
  } else if (Array.isArray(mcq.Options)) {
    // ✅ your Sanfoundry JSON uses "Options": ["a) ...", "b) ..."]
    options = mcq.Options.map(opt =>
      String(opt).replace(/^[a-d]\)\s*/i, "").trim()
    );
  } else if (mcq.a || mcq.A) {
    options = [
      mcq.a || mcq.A,
      mcq.b || mcq.B,
      mcq.c || mcq.C,
      mcq.d || mcq.D,
    ].filter(Boolean);
  } else if (mcq["Option A"] || mcq["option A"]) {
    options = [
      mcq["Option A"] || mcq["option A"],
      mcq["Option B"] || mcq["option B"],
      mcq["Option C"] || mcq["option C"],
      mcq["Option D"] || mcq["option D"],
    ].filter(Boolean);
  } else if (mcq.option1) {
    options = [mcq.option1, mcq.option2, mcq.option3, mcq.option4].filter(
      Boolean
    );
  }

  // 3. Answer key (letter or full text)
  let answerRaw =
    mcq.answer || mcq.Answer || mcq.correctAnswer || mcq.correct || "";

  answerRaw = String(answerRaw).trim();

  let answer = "";
  let explanation = mcq.explanation || mcq.Explanation || mcq.solution || "";

  // ✅ handle "Answer: a\nExplanation: ...." format
  const letterMatch = answerRaw.match(/Answer:\s*([a-d])/i);
  if (letterMatch) {
    answer = letterMatch[1].toLowerCase(); // "a" | "b" | "c" | "d"
  } else if (answerRaw.length === 1) {
    answer = answerRaw.toLowerCase();
  } else {
    answer = answerRaw; // full-text fallback
  }

  const expSplit = answerRaw.split(/Explanation:/i);
  if (expSplit[1] && !explanation) {
    explanation = expSplit[1].trim();
  }

  // 4. Difficulty
  const difficulty = (mcq.difficulty || mcq.Difficulty || "medium")
    .toString()
    .toLowerCase();

  return {
    question,
    options,
    answer,
    explanation,
    difficulty,
  };
}


/**
 * Import questions to MongoDB
 */
async function importToDatabase(topicName, userId, Question) {
  try {
    const data = getQuestionsByTopic(topicName, { limit: 1000 });

    const questionsToInsert = data.questions.map((q) => ({
      title: q.question.substring(0, 100),
      body: q.question,
      difficulty: q.difficulty,
      tags: [topicName, "mcq", "sanfoundry"],
      type: "mcq",
      options: q.options,
      correctAnswer: q.answer,
      explanation: q.explanation,
      source: "sanfoundry",
      createdBy: userId,
      companyId: null,
    }));

    // Remove duplicates
    const inserted = await Question.insertMany(questionsToInsert, {
      ordered: false,
    }).catch((err) => {
      if (err.code === 11000) {
        console.log("Some questions already exist, skipping duplicates");
        return { insertedCount: 0 };
      }
      throw err;
    });

    return {
      topic: topicName,
      imported: inserted.length || questionsToInsert.length,
    };
  } catch (error) {
    console.error("Import error:", error);
    throw error;
  }
}

module.exports = {
  getAvailableTopics,
  getQuestionsByTopic,
  findTopicFile,
  importToDatabase,
};
