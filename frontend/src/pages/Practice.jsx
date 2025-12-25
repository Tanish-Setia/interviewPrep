import React, { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import sanfoundryApi from "../services/sanfoudnryApi";
import { getMCQQuestions } from "../services/api";
import "./Practice.css";

const Practice = () => {
  const { isAuthenticated, subscription, subLoading } = useAuth();
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [questions, setQuestions] = useState([]);
  const [qLoading, setQLoading] = useState(false);
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [importing, setImporting] = useState(null);
  const [searchQuery, setSearchQuery] = useState(""); 
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated && !subLoading) {
      const hasPremium =
        subscription?.hasActiveSubscription &&
        subscription.subscription?.planId === "premium";
      
      if (hasPremium) {
        loadTopics();
      }
    }
  }, [isAuthenticated, subLoading, subscription]);

  const loadTopics = async () => {
    try {
      const data = await sanfoundryApi.getTopics();
      setTopics(data.topics);
    } catch (error) {
      console.error("Error loading topics:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleImport = async (topicName) => {
    try {
      setImporting(topicName);
      const result = await sanfoundryApi.importTopic(topicName);
      alert(result.message);

      await handleLoadFromDb(topicName);
    } catch (error) {
      alert(
        "Import failed: " + (error.response?.data?.message || error.message)
      );
    } finally {
      setImporting(null);
    }
  };

  const handleLoadFromDb = async (topicName) => {
    try {
      setQLoading(true);
      setSelectedTopic(topicName);

      const data = await getMCQQuestions({
        category: topicName,
        limit: 20,
        page: 1,
      });

      setQuestions(data.questions || []);

      setTimeout(() => {
        document.getElementById("questions-section")?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }, 100);
    } catch (error) {
      console.error("Error loading DB questions:", error);
      if (
        error.response?.status === 403 &&
        error.response?.data?.requiresSubscription
      ) {
        alert("Premium subscription required to practice these questions.");
        navigate("/subscription");
      } else {
        alert("Failed to load questions");
      }
    } finally {
      setQLoading(false);
    }
  };

  const filteredTopics = topics.filter((topic) =>
    topic.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const hasPremium =
    subscription?.hasActiveSubscription &&
    subscription.subscription?.planId === "premium";

  if (!isAuthenticated) {
    return (
      <div className="practice-page">
        <div className="container">
          <div className="premium-locked">
            <div className="lock-icon">🔐</div>
            <h3>Login required</h3>
            <p>Please log in to access practice questions.</p>
            <button
              className="btn btn-primary"
              onClick={() => navigate("/login")}
            >
              Go to Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (subLoading) {
    return (
      <div className="practice-page">
        <div className="container">
          <div className="loading-container">
            <div className="loading"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!hasPremium) {
    return (
      <div className="practice-page">
        <div className="container">
          <div className="premium-locked">
            <div className="lock-icon">🔒</div>
            <h3>Premium required</h3>
            <p>
              MCQ Practice is available only for Premium members. Upgrade your
              plan to unlock all Sanfoundry practice questions.
            </p>
            <button
              className="btn btn-primary"
              onClick={() => navigate("/subscription")}
            >
              View Subscription Plans
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="practice-page">
        <div className="container">
          <div className="loading-container">
            <div className="loading"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="practice-page">
      <div className="container">
        <div className="page-header">
          <h1>Practice MCQs</h1>
          <p>Choose a topic and start practicing with hundreds of questions</p>
        </div>

        <div className="search-section">
          <div className="search-bar">
            <span className="search-icon">🔍</span>
            <input
              type="text"
              placeholder="Search topics (e.g., C++, Python, Data Structures...)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
            />
            {searchQuery && (
              <button
                className="clear-search"
                onClick={() => setSearchQuery("")}
                aria-label="Clear search"
              >
                ✕
              </button>
            )}
          </div>
          <p className="search-results-count">
            {filteredTopics.length} topic{filteredTopics.length !== 1 ? "s" : ""} found
          </p>
        </div>

        <div className="practice-section">
          <h2>Available Topics</h2>
          
          {filteredTopics.length === 0 ? (
            <div className="no-results">
              <p>No topics found matching "{searchQuery}"</p>
              <button
                className="btn btn-outline"
                onClick={() => setSearchQuery("")}
              >
                Clear Search
              </button>
            </div>
          ) : (
            <div className="categories-grid">
              {filteredTopics.map((topic) => (
                <div key={topic.id} className="category-card">
                  <div className="category-header">
                    <h3>{topic.name}</h3>
                    <span className="free-badge">Premium</span>
                  </div>

                  <div className="category-actions">
                    <button
                      className="btn btn-primary"
                      onClick={() => handleLoadFromDb(topic.name)}
                      disabled={qLoading}
                    >
                      {qLoading && selectedTopic === topic.name ? (
                        <span className="loading"></span>
                      ) : (
                        "Practice Now"
                      )}
                    </button>

                    <button
                      className="btn btn-outline"
                      onClick={() => handleImport(topic.name)}
                      disabled={importing === topic.name}
                    >
                      {importing === topic.name ? (
                        <span className="loading"></span>
                      ) : (
                        "Import to DB"
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        
        {(questions.length > 0 || qLoading) && (
          <div className="practice-section" id="questions-section">
            <h2>
              {selectedTopic} Questions
              {questions.length > 0 && (
                <span
                  style={{
                    fontSize: "16px",
                    fontWeight: "normal",
                    color: "var(--text-secondary)",
                    marginLeft: "12px",
                  }}
                >
                  ({questions.length} available)
                </span>
              )}
            </h2>

            {qLoading ? (
              <div className="loading-container">
                <div className="loading"></div>
              </div>
            ) : (
              <div className="categories-grid">
                {questions.map((q, idx) => (
                  <div key={q._id} className="category-card">
                    <div className="category-header">
                      <h3>Question {idx + 1}</h3>
                      <span
                        className="free-badge"
                        style={{
                          background:
                            q.difficulty === "easy"
                              ? "#10b981"
                              : q.difficulty === "medium"
                              ? "#f59e0b"
                              : "#ef4444",
                        }}
                      >
                        {q.difficulty}
                      </span>
                    </div>

                    <p
                      style={{
                        fontSize: "14px",
                        color: "var(--text-secondary)",
                        marginBottom: "16px",
                        lineHeight: "1.5",
                        display: "-webkit-box",
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: "vertical",
                        overflow: "hidden",
                      }}
                    >
                      {q.body}
                    </p>

                    <button
                      className="btn btn-primary"
                      style={{ width: "100%" }}
                      onClick={() =>
                        navigate("/questions/quiz", {
                          state: { questions: questions.slice(0, 10) },
                        })
                      }
                    >
                      Start Quiz (10 Questions) →
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {!qLoading && questions.length === 0 && selectedTopic && (
          <div className="premium-locked">
            <div className="lock-icon">📝</div>
            <h3>No Questions Available</h3>
            <p>
              Click "Import to DB" on a topic to fetch questions from Sanfoundry
              database.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Practice;