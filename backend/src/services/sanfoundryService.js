const fs = require("fs");
const path = require("path");

const DATA_DIR = path.join(__dirname, "../../data/sanfoundry");

function getAvailableTopics() {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      console.error("Data directory not found:", DATA_DIR);
      return [];
    }

    const files = fs.readdirSync(DATA_DIR);

    const topics = files
      .filter((file) => file.endsWith(".json"))
      .map((file) => {
        
        const topicName = file
          .replace(/^1000\s+/i, "")
          .replace(/\s+MCQs\.json$/i, "")
          .trim();

        return {
          id: topicName
            .toLowerCase()
            .replace(/\s+/g, "-") 
            .replace(/\+/g, "plus"), 

          name: topicName,
          fileName: file,
        };
      })
      .sort((a, b) => a.name.localeCompare(b.name));

    console.log(`Found ${topics.length} topics`);
    return topics;
  } catch (error) {
    console.error("Error reading topics:", error);
    return [];
  }
}

function findTopicFile(topicName) {
  const topics = getAvailableTopics();

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

function normalizeQuestion(mcq) {
  const question = mcq.question || mcq.Question || mcq.title || mcq.q || "";

  let options = [];

  if (Array.isArray(mcq.options)) {
    options = mcq.options;
  } else if (Array.isArray(mcq.Options)) {
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

  let answerRaw =
    mcq.answer || mcq.Answer || mcq.correctAnswer || mcq.correct || "";

  answerRaw = String(answerRaw).trim();

  let answer = "";
  let explanation = mcq.explanation || mcq.Explanation || mcq.solution || "";

  const letterMatch = answerRaw.match(/Answer:\s*([a-d])/i);
  if (letterMatch) {
    answer = letterMatch[1].toLowerCase(); 
  } else if (answerRaw.length === 1) {
    answer = answerRaw.toLowerCase();
  } else {
    answer = answerRaw; 
  }

  const expSplit = answerRaw.split(/Explanation:/i);
  if (expSplit[1] && !explanation) {
    explanation = expSplit[1].trim();
  }

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
