"use server";

import Groq from "groq-sdk";
import { revalidatePath } from "next/cache";

const getGroq = () => {
  const API_KEY = process.env.GROQ_API_KEY || "";
  if (!API_KEY) throw new Error("Groq API key is missing. Please check your environment variables.");
  return new Groq({ apiKey: API_KEY });
};

async function extractTextFromPDF(file: File): Promise<string> {
  const formData = new FormData();
  formData.append("file", file);

  try {
    console.log("Sending PDF to extraction service...");
    const response = await fetch("http://127.0.0.1:5000/extract-text", {
      method: "POST",
      body: formData,
    });

    console.log("Received response status:", response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error("PDF Service Error:", { status: response.status, text: errorText });
      throw new Error(`PDF service error: ${response.statusText}`);
    }

    const data = await response.json();
    console.log("Successfully extracted text from PDF");
    return data.text;
  } catch (error) {
    console.error("Error extracting text from PDF:", error);
    throw new Error("Failed to extract text from PDF. Please ensure the Python service is running.");
  }
}

export async function analyzeResume(formData: FormData): Promise<string> {
  try {
    const jobDesc = formData.get("jobDesc") as string;
    const resumeFile = formData.get("resume") as File;

    if (!jobDesc || !resumeFile) {
      throw new Error("Missing job description or resume");
    }

    console.log("Starting resume analysis...");
    let resumeText = "";

    try {
      if (resumeFile.type === "application/pdf") {
        console.log("Processing PDF file...");
        resumeText = await extractTextFromPDF(resumeFile);
      } else {
        console.log("Processing text-based file...");
        resumeText = await resumeFile.text();
      }
      console.log("Successfully extracted text from resume");
    } catch (error) {
      console.error("Error extracting text from file:", error);
      throw new Error(
        "Could not read resume file. Please check if the Python service is running."
      );
    }

    if (!resumeText.trim()) {
      throw new Error("The resume appears to be empty");
    }

    const prompt = `
    I need a detailed ATS (Applicant Tracking System) compatibility analysis between a job description 
    and resume. Provide a percentage match score and specific suggestions for improvement.
    
    JOB DESCRIPTION:
    ${jobDesc}
    
    RESUME:
    ${resumeText}
    
    Please analyze:
    1. Overall match percentage between resume and job description
    2. Key skills/requirements present in the job description but missing in resume
    3. Suggestions to improve ATS compatibility
    4. Optimal keywords to add
    5. Format and structure recommendations
    
    Please format your response in a clear, structured way with headings and bullet points.
    `;

    const groq = getGroq();
    console.log("Sending request to Groq...");

    const result = await groq.chat.completions.create({
      model: "openai/gpt-oss-20b",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
      max_tokens: 2048,
    });

    const analysisText = result.choices[0]?.message?.content || "No response received.";
    console.log("Received response from Groq");

    revalidatePath("/atschecker");
    return analysisText;
  } catch (error: any) {
    console.error("Error in analyzeResume:", error);
    return `There was an error analyzing your resume: ${error.message || "Unknown error"}. Please try again.`;
  }
}