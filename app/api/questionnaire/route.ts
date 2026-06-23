import Groq from "groq-sdk";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { jobProfile, difficulty } = await req.json();

    if (!jobProfile) {
      return NextResponse.json({ error: "Job profile is required" }, { status: 400 });
    }

    const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

    const prompt = `Generate exactly 5 multiple-choice interview questions for a ${jobProfile} role at ${difficulty} difficulty level.

Return ONLY a JSON object with this exact format, no markdown, no backticks, no extra text before or after:
{
  "questions": [
    {
      "id": 1,
      "question": "Question text here",
      "options": {
        "A": "First option",
        "B": "Second option", 
        "C": "Third option",
        "D": "Fourth option"
      },
      "correctAnswer": "A",
      "explanation": "Short explanation of why this answer is correct"
    },
    {
      "id": 2,
      "question": "Question text here",
      "options": {
        "A": "First option",
        "B": "Second option",
        "C": "Third option",
        "D": "Fourth option"
      },
      "correctAnswer": "B",
      "explanation": "Short explanation of why this answer is correct"
    },
    {
      "id": 3,
      "question": "Question text here",
      "options": {
        "A": "First option",
        "B": "Second option",
        "C": "Third option",
        "D": "Fourth option"
      },
      "correctAnswer": "C",
      "explanation": "Short explanation of why this answer is correct"
    },
    {
      "id": 4,
      "question": "Question text here",
      "options": {
        "A": "First option",
        "B": "Second option",
        "C": "Third option",
        "D": "Fourth option"
      },
      "correctAnswer": "A",
      "explanation": "Short explanation of why this answer is correct"
    },
    {
      "id": 5,
      "question": "Question text here",
      "options": {
        "A": "First option",
        "B": "Second option",
        "C": "Third option",
        "D": "Fourth option"
      },
      "correctAnswer": "D",
      "explanation": "Short explanation of why this answer is correct"
    }
  ]
}`;

    const result = await groq.chat.completions.create({
      model: "openai/gpt-oss-20b",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
      max_tokens: 4096,
    });

    const responseText = result.choices[0]?.message?.content || "{}";

    // Strip any markdown formatting if present
    const cleaned = responseText.replace(/```json/g, "").replace(/```/g, "").trim();

    // Extract JSON object
    const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("Could not extract JSON from response");
    }

    const parsed = JSON.parse(jsonMatch[0]);

    if (!parsed.questions || !Array.isArray(parsed.questions)) {
      throw new Error("Invalid response structure");
    }

    return NextResponse.json(parsed);
  } catch (error: any) {
    console.error("Questionnaire API error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to generate questions" },
      { status: 500 }
    );
  }
}