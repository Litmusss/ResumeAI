'use client';

import { useState } from "react";
import { GoogleGenerativeAI } from "@google/generative-ai";

interface Question {
  id: number;
  question: string;
  options: {
    A: string;
    B: string;
    C: string;
    D: string;
  };
  correctAnswer: string;
  explanation: string;
}

interface QuestionsResponse {
  questions: Question[];
}

function Questionnaire() {
  const [jobProfile, setJobProfile] = useState<string>("");
  const [difficulty, setDifficulty] = useState<string>("easy");
  const [questions, setQuestions] = useState<Question[]>([]);
  const [userAnswers, setUserAnswers] = useState<Record<number, string>>({});
  const [result, setResult] = useState<string>("");
  const [incorrectAnswers, setIncorrectAnswers] = useState<Record<number, string>>({});
  
  // In Next.js, we need to access environment variables differently
  const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;

  const fetchQuestions = async () => {
    if (!jobProfile) {
      alert("Please select a job profile first!");
      return;
    }

    if (!apiKey) {
      alert("API key is missing. Please check your environment variables.");
      return;
    }

    try {
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

      const prompt = `Generate exactly 5 multiple-choice interview questions for a ${jobProfile} role at a ${difficulty} difficulty level. 
      Format the response as a pure JSON array (without any markdown or code block formatting) under the key 'questions'. Each object should contain:
      - 'id': Unique identifier (1 to 5)
      - 'question': The question text
      - 'options': Object containing keys 'A', 'B', 'C', 'D' with answer choices
      - 'correctAnswer': The correct option ('A', 'B', 'C', or 'D')
      - 'explanation': A short explanation of the correct answer.`;

      const result = await model.generateContent(prompt);

      if (!result.response || !result.response.candidates) {
        throw new Error("Invalid API response structure.");
      }

      let responseText = result.response.candidates[0]?.content?.parts[0]?.text || "{}";
      console.log("API Raw Response:", responseText);

      // Fix: Remove potential code block formatting
      responseText = responseText.replace(/```json/g, "").replace(/```/g, "").trim();

      try {
        const responseJson = JSON.parse(responseText) as QuestionsResponse;
        if (Array.isArray(responseJson.questions)) {
          setQuestions(responseJson.questions);
        } else {
          throw new Error("Invalid response format");
        }
      } catch (error) {
        console.error("Error parsing response JSON:", error);
        alert("Invalid response received from AI model.");
      }
    } catch (error) {
      console.error("Error fetching questions:", error);
      alert("Failed to fetch questions. Check API key and response format.");
    }
  };

  const handleAnswerChange = (questionId: number, answer: string) => {
    setUserAnswers((prevAnswers) => ({
      ...prevAnswers,
      [questionId]: answer,
    }));
  };

  const handleSubmit = () => {
    let correctAnswers = 0;
    let incorrect: Record<number, string> = {};
    
    questions.forEach((q) => {
      if (userAnswers[q.id] === q.correctAnswer) {
        correctAnswers++;
      } else {
        incorrect[q.id] = q.explanation;
      }
    });

    setIncorrectAnswers(incorrect);
    setResult(`You got ${correctAnswers} out of ${questions.length} correct!`);
  };

  return (
    <div className="questionnaire-container">
      <h2 className="title">AI-Powered Interview Questions</h2>

      <div className="selection-container">
        <label>Select Job Profile:</label>
        <select value={jobProfile} onChange={(e) => setJobProfile(e.target.value)}>
          <option value="">Select</option>
          <option value="Frontend Developer">Frontend Developer</option>
          <option value="Backend Developer">Backend Developer</option>
          <option value="Data Analyst">Data Analyst</option>
        </select>

        <label>Select Difficulty:</label>
        <select value={difficulty} onChange={(e) => setDifficulty(e.target.value)}>
          <option value="easy">Easy</option>
          <option value="medium">Medium</option>
          <option value="hard">Hard</option>
        </select>

        <button className="fetch-btn" onClick={fetchQuestions}>Generate Questions</button>
      </div>

      <div className="questions-container">
        {questions.map((q) => (
          <div key={q.id} className="question-card">
            <p className="question-text">{q.question}</p>
            <div className="options-container">
              {Object.entries(q.options).map(([key, value]) => (
                <label key={key} className="option">
                  <input
                    type="radio"
                    name={`question-${q.id}`}
                    value={key}
                    onChange={() => handleAnswerChange(q.id, key)}
                  />
                  {key}) {value}
                </label>
              ))}
            </div>
            
            {incorrectAnswers[q.id] && (
              <div className="explanation">
                <strong>Explanation:</strong> {incorrectAnswers[q.id]}
              </div>
            )}
          </div>
        ))}
      </div>

      {questions.length > 0 && (
        <button className="submit-btn" onClick={handleSubmit}>Submit Answers</button>
      )}

      {result && <h3 className="result-message">{result}</h3>}
    </div>
  );
}

export default Questionnaire;