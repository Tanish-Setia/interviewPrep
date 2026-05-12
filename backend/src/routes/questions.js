const redisClient = require("../utils/redisClient");
const express = require("express");
const router = express.Router();
const { auth } = require("../middlewares/auth");
const { requireSubscription } = require("../middlewares/requireSubscription");
const Question = require("../models/Question");
const Company = require("../models/Company");
const Subscription = require("../models/Subscription");
const {
  getAvailableCategories,
  importQuestionsFromCategory,
} = require("../services/sanfoundryService");

router.get("/mcq", auth, requireSubscription, async (req, res) => {
  try {
    const { category, company, difficulty, limit = 20, page = 1 } = req.query;
    const cacheKey = `mcq:${JSON.stringify(req.query)}:${req.user._id}`;
    const cachedData = await redisClient.get(cacheKey);

    if (cachedData) {
      return res.json(JSON.parse(cachedData));
    }
    const query = { type: "mcq" };

    if (category) {
      query.tags = { $in: [new RegExp(`^${category}$`, "i")] };
    }

    if (difficulty) {
      query.difficulty = difficulty;
    }

    if (company) {
      const subscription = await Subscription.findOne({
        userId: req.user._id,
        status: "active",
        endsAt: { $gt: new Date() },
      });

      if (!subscription) {
        return res.status(403).json({
          message:
            "Premium subscription required for company-specific questions",
          requiresSubscription: true,
        });
      }

      const companyDoc = await Company.findOne({
        name: new RegExp(company, "i"),
      });
      if (companyDoc) {
        query.companyId = companyDoc._id;
      }
    } else {
      query.companyId = null;
    }

    const skip = (page - 1) * limit;

    const questions = await Question.find(query)
      .populate("companyId", "name")
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(skip);

    const total = await Question.countDocuments(query);

    const responseData = {
      questions,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / limit),
      },
    };

    await redisClient.setEx(cacheKey, 120, JSON.stringify(responseData));

    res.json(responseData);
  } catch (error) {
    console.error("Get MCQ questions error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

router.get("/:id", auth, async (req, res) => {
  try {
    const cacheKey = `question:${req.params.id}:${req.user._id}`;
    const cachedQuestion = await redisClient.get(cacheKey);

    if (cachedQuestion) {
      return res.json(JSON.parse(cachedQuestion));
    }
    const question = await Question.findById(req.params.id)
      .populate("companyId", "name")
      .populate("createdBy", "name email");

    if (!question) {
      return res.status(404).json({ message: "Question not found" });
    }

    if (question.companyId) {
      const subscription = await Subscription.findOne({
        userId: req.user._id,
        status: "active",
        endsAt: { $gt: new Date() },
      });

      if (!subscription) {
        return res.status(403).json({
          message: "Premium subscription required",
          requiresSubscription: true,
        });
      }
    }
    await redisClient.setEx(
      cacheKey,
      300, // 5 minutes
      JSON.stringify({ question })
    );
    res.json({ question });
  } catch (error) {
    console.error("Get question error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

router.get("/sanfoundry/categories", async (req, res) => {
  try {
    const cacheKey = "sanfoundry:categories";
    const cached = await redisClient.get(cacheKey);

    if (cached) {
      return res.json(JSON.parse(cached));
    }
    const {
      fetchAllCategoriesFromGithub,
    } = require("../services/sanfoundryService");
    const categories = await fetchAllCategoriesFromGithub();
    await redisClient.setEx(
      cacheKey,
      600, // 10 minutes
      JSON.stringify({ categories })
    );

    res.json({ categories });
  } catch (error) {
    console.error("Get categories error:", error);
    res.status(500).json({ message: "Error fetching categories" });
  }
});

router.post("/sanfoundry/import", auth, async (req, res) => {
  try {
    const { categoryTitle, limit = 50 } = req.body;
    console.log("IMPORT BODY:", req.body);
    console.log("USER:", req.user && req.user._id);
    if (!categoryTitle) {
      return res.status(400).json({ message: "Category title is required" });
    }

    console.log(`Importing ${limit} questions from ${categoryTitle}...`);

    const transformedQuestions = await importQuestionsFromCategory(
      categoryTitle,
      req.user._id,
      limit
    );
    console.log("TRANSFORMED QUESTIONS COUNT:", transformedQuestions.length);
    const savedQuestions = await Question.insertMany(transformedQuestions);

    console.log(` Imported ${savedQuestions.length} questions`);

    res.json({
      message: `Successfully imported ${savedQuestions.length} questions`,
      count: savedQuestions.length,
      category: categoryTitle,
    });
  } catch (error) {
    console.error("Import questions error:", error);
    res.status(500).json({
      message: error.message || "Error importing questions",
    });
  }
});

router.get("/companies/list", auth, async (req, res) => {
  try {
    const cacheKey = `companies:${req.user._id}`;
    const cachedCompanies = await redisClient.get(cacheKey);

    if (cachedCompanies) {
      return res.json(JSON.parse(cachedCompanies));
    }
    const subscription = await Subscription.findOne({
      userId: req.user._id,
      status: "active",
      endsAt: { $gt: new Date() },
    });

    if (!subscription) {
      return res.status(403).json({
        message: "Premium subscription required",
        requiresSubscription: true,
      });
    }

    const companies = await Company.find().sort({ name: 1 });
    await redisClient.setEx(cacheKey, 300, JSON.stringify({ companies }));

    res.json({ companies });
  } catch (error) {
    console.error("Get companies error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

router.post("/companies", auth, async (req, res) => {
  try {
    const { name, domain, description } = req.body;

    const company = await Company.create({
      name,
      domain,
      description,
    });
    await redisClient.del(`companies:${req.user._id}`);
    res.json({ company });
  } catch (error) {
    console.error("Create company error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
