import React from "react";
import SanfoundryQuiz from "./pages/SanfoundryQuiz";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import Header from "./components/Header";
import Footer from "./components/Footer";
import LandingPage from "./pages/LandingPage";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Profile from "./pages/Profile";
import Practice from "./pages/Practice";
import QuestionView from "./pages/QuestionView";
import Subscription from "./pages/Subscription";
import SubscriptionSuccess from "./pages/SubscriptionSuccess";
import About from "./pages/About";
import ProtectedRoute from "./components/ProtectedRoute";
import ChatbotWidget from "./components/ChatbotWidget";
import "./App.css";

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Header />
          <main className="main-content">
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/about" element={<About />} />

              {/* Sanfoundry quiz routes */}
              <Route
                path="/practice/sanfoundry/:category"
                element={
                  <ProtectedRoute>
                    <SanfoundryQuiz />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/quiz/:category"
                element={
                  <ProtectedRoute>
                    <SanfoundryQuiz />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/company/:companyName"
                element={
                  <ProtectedRoute>
                    <SanfoundryQuiz />
                  </ProtectedRoute>
                }
              />

              {/* Profile */}
              <Route
                path="/profile"
                element={
                  <ProtectedRoute>
                    <Profile />
                  </ProtectedRoute>
                }
              />

              {/* Practice page */}
              <Route
                path="/practice"
                element={
                  <ProtectedRoute>
                    <Practice />
                  </ProtectedRoute>
                }
              />

              {/* Single question view */}
              <Route
                path="/questions/quiz"
                element={
                  <ProtectedRoute>
                    <QuestionView />
                  </ProtectedRoute>
                }
              />

              {/* Subscription */}
              <Route
                path="/subscription"
                element={
                  <ProtectedRoute>
                    <Subscription />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/subscription/success"
                element={
                  <ProtectedRoute>
                    <SubscriptionSuccess />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/subscription/cancel"
                element={
                  <ProtectedRoute>
                    <div
                      className="container"
                      style={{ padding: "40px 20px", textAlign: "center" }}
                    >
                      <h1>Subscription Cancelled</h1>
                      <p>
                        Your subscription was cancelled. You can try again
                        anytime.
                      </p>
                      <button
                        onClick={() => (window.location.href = "/subscription")}
                        className="btn btn-primary"
                      >
                        Back to Plans
                      </button>
                    </div>
                  </ProtectedRoute>
                }
              />

              {/* Fallback */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
          <ChatbotWidget />
          <Footer />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
