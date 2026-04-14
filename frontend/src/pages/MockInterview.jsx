import { useState } from "react";
import { saveAnswer } from "../services/api";

const questions = [
  "Tell me about yourself",
  "What are your strengths?",
  "Explain a challenging project you worked on",
];

const MockInterview = () => {
  const [current, setCurrent] = useState(0);
  const [answer, setAnswer] = useState("");
  const [feedback, setFeedback] = useState(null);

  const nextQuestion = async () => {
    const res = await saveAnswer({
      question: questions[current],
      answer,
    });

    setFeedback(res);

    setAnswer("");
    setCurrent(current + 1);
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-4 text-center">
        Mock Interview 🎤
      </h1>

      {current < questions.length ? (
        <div className="bg-white p-6 rounded shadow">
          <p className="text-lg font-semibold mb-4">
            {questions[current]}
          </p>

          <textarea
            className="w-full border p-3 rounded mb-4"
            placeholder="Type your answer..."
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
          />

          <button
            className="bg-blue-500 text-white px-4 py-2 rounded w-full"
            onClick={nextQuestion}
          >
            Submit Answer
          </button>
        </div>
      ) : (
        <div className="text-center">
          <h2 className="text-xl font-bold">
            Interview Completed 🎉
          </h2>
        </div>
      )}

      {/* Feedback */}
      {feedback && (
        <div className="bg-gray-100 p-4 mt-6 rounded">
          <p><strong>Score:</strong> {feedback.score}</p>
          <p><strong>Feedback:</strong> {feedback.feedback}</p>
          <p><strong>Suggestion:</strong> {feedback.suggestion}</p>
        </div>
      )}
    </div>
  );
};

export default MockInterview;
