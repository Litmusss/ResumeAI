"use server";

import Groq from "groq-sdk";

const getGroq = () => {
  const API_KEY = process.env.GROQ_API_KEY || "";
  if (!API_KEY) throw new Error("Groq API key is missing. Please check your environment variables.");
  return new Groq({ apiKey: API_KEY });
};

const callGroq = async (prompt: string): Promise<string> => {
  const groq = getGroq();
  const result = await groq.chat.completions.create({
    model: "openai/gpt-oss-20b",
    messages: [{ role: "user", content: prompt }],
    temperature: 0.7,
    max_tokens: 4096,
  });
  return result.choices[0]?.message?.content || "";
};

export const analyzeResume = async (resumeText: string): Promise<string> => {
  try {
    const prompt = `
      You are an ATS (Applicant Tracking System) resume analyzer.
      - Analyze the following resume and provide an ATS score (out of 100).
      - Give feedback on strengths and weaknesses.
      - Suggest improvements for better job matching.
      
      Resume Content:
      ${resumeText}
    `;
    return await callGroq(prompt);
  } catch (error: any) {
    console.error("GROQ ERROR in analyzeResume:", error?.message);
    return "Error analyzing resume. Please try again.";
  }
};

export const generateSummary = async (jobTitle: string): Promise<any[]> => {
  try {
    const prompt = `
      Generate 3 professional resume summary examples for someone with the job title: "${jobTitle || "Software Engineer"}".
      
      For each summary:
      - First summary should be for Entry-Level (0-2 years experience)
      - Second summary should be for Mid-Level (3-6 years experience)
      - Third summary should be for Senior-Level (7+ years experience)
      - Make each 3-5 sentences long
      - Focus on key skills and accomplishments
      - Use professional language
      - Include relevant industry keywords
      
      Return ONLY a JSON array with exactly this format, no markdown, no backticks, no extra text:
      [
        {
          "experience_level": "Entry-Level",
          "summary": "Summary text here..."
        },
        {
          "experience_level": "Mid-Level",
          "summary": "Summary text here..."
        },
        {
          "experience_level": "Senior-Level",
          "summary": "Summary text here..."
        }
      ]
    `;

    const responseText = await callGroq(prompt);

    try {
      const jsonMatch = responseText.match(/\[\s*\{[\s\S]*\}\s*\]/);
      const jsonString = jsonMatch ? jsonMatch[0] : responseText;
      const parsedData = JSON.parse(jsonString);
      if (Array.isArray(parsedData) && parsedData.length > 0) {
        return parsedData;
      } else {
        throw new Error("Response is not in the expected format");
      }
    } catch (parseError) {
      console.error("Error parsing JSON response:", parseError);
      return [
        {
          experience_level: "Entry-Level",
          summary:
            "Recent graduate with foundational knowledge in software development and programming languages. Eager to apply academic learning to real-world projects and grow as a professional developer.",
        },
        {
          experience_level: "Mid-Level",
          summary:
            "Experienced software professional with several years of hands-on development experience. Skilled in building scalable solutions and collaborating with cross-functional teams to deliver high-quality products.",
        },
        {
          experience_level: "Senior-Level",
          summary:
            "Seasoned software expert with extensive experience in architecting complex systems. Proven leadership abilities in guiding teams and implementing best practices while staying current with emerging technologies.",
        },
      ];
    }
  } catch (error: any) {
    console.error("GROQ ERROR in generateSummary:", error?.message);
    return [
      {
        experience_level: "Error",
        summary: `Error: ${error?.message || "Unknown error. Please try again."}`,
      },
    ];
  }
};

export const generateEducationDescription = async (educationInfo: any): Promise<any[]> => {
  try {
    let contextInfo = "";
    if (typeof educationInfo === "string") {
      contextInfo = educationInfo;
    } else {
      const { universityName, degree, major, startDate, endDate, description } = educationInfo;
      contextInfo = `
        University/Institute: ${universityName || "Not specified"}
        Degree: ${degree || "Not specified"}
        Major/Field of Study: ${major || "Not specified"}
        Duration: ${startDate || "Start date"} to ${endDate || "End date"}
        Current Description: ${description || "None provided"}
      `;
    }

    const prompt = `
      Create three professional education descriptions for a resume based on the following information:
      
      ${contextInfo}
      
      Return ONLY a JSON array with this format, no markdown, no backticks, no extra text:
      [
        {
          "activity_level": "Basic",
          "description": "• Completed coursework in...\n• Participated in...\n• Acquired knowledge of..."
        },
        {
          "activity_level": "Intermediate",
          "description": "• Conducted research on...\n• Implemented projects that...\n• Developed skills in..."
        },
        {
          "activity_level": "Advanced",
          "description": "• Led research team investigating...\n• Published academic papers on...\n• Pioneered innovative approaches to..."
        }
      ]
    `;

    const responseText = await callGroq(prompt);

    try {
      const jsonMatch = responseText.match(/\[\s*\{[\s\S]*\}\s*\]/);
      const jsonString = jsonMatch ? jsonMatch[0] : responseText;
      const parsedData = JSON.parse(jsonString);
      if (Array.isArray(parsedData) && parsedData.length > 0) {
        return parsedData;
      } else {
        throw new Error("Response is not in the expected format");
      }
    } catch (parseError) {
      console.error("Error parsing JSON response:", parseError);
      return [
        {
          activity_level: "Basic",
          description:
            "• Completed foundational coursework in major subjects with strong academic standing\n• Participated in relevant student organizations and academic groups\n• Developed essential skills in critical thinking and problem-solving",
        },
        {
          activity_level: "Intermediate",
          description:
            "• Conducted research projects relevant to field of study under faculty supervision\n• Collaborated with peers on group assignments and presentations\n• Applied theoretical knowledge to practical scenarios through coursework",
        },
        {
          activity_level: "Advanced",
          description:
            "• Led research initiatives resulting in notable academic contributions\n• Presented findings at department symposiums and student conferences\n• Developed specialized knowledge through advanced coursework and independent studies",
        },
      ];
    }
  } catch (error: any) {
    console.error("GROQ ERROR in generateEducationDescription:", error?.message);
    return [
      {
        activity_level: "Error",
        description: `Error: ${error?.message || "Unknown error. Please try again."}`,
      },
    ];
  }
};

export const generateExperienceDescription = async (experienceInfo: any): Promise<any[]> => {
  try {
    let contextInfo = "";
    if (typeof experienceInfo === "string") {
      contextInfo = experienceInfo;
    } else {
      const { company, title, location, startDate, endDate, description } = experienceInfo;
      contextInfo = `
        Company: ${company || "Not specified"}
        Job Title: ${title || "Not specified"}
        Location: ${location || "Not specified"}
        Duration: ${startDate || "Start date"} to ${endDate || "End date"}
        Current Description: ${description || "None provided"}
      `;
    }

    const prompt = `
      Create three professional work experience descriptions for a resume based on the following information:
      
      ${contextInfo}
      
      Return ONLY a JSON array with this format, no markdown, no backticks, no extra text:
      [
        {
          "activity_level": "Entry-Level",
          "description": "• Collaborated with team members to...\n• Assisted in developing...\n• Conducted research on..."
        },
        {
          "activity_level": "Mid-Level",
          "description": "• Led a team of X members to...\n• Implemented new processes that improved...\n• Designed and developed..."
        },
        {
          "activity_level": "Senior-Level",
          "description": "• Spearheaded the strategic initiative that...\n• Directed cross-functional teams to deliver...\n• Pioneered innovative solutions that..."
        }
      ]
    `;

    const responseText = await callGroq(prompt);

    try {
      const jsonMatch = responseText.match(/\[\s*\{[\s\S]*\}\s*\]/);
      const jsonString = jsonMatch ? jsonMatch[0] : responseText;
      const parsedData = JSON.parse(jsonString);
      if (Array.isArray(parsedData) && parsedData.length > 0) {
        return parsedData;
      } else {
        throw new Error("Response is not in the expected format");
      }
    } catch (parseError) {
      console.error("Error parsing JSON response:", parseError);
      return [
        {
          activity_level: "Entry-Level",
          description:
            "• Supported team projects by completing assigned tasks on schedule\n• Assisted with data collection and analysis\n• Participated in team meetings and contributed ideas",
        },
        {
          activity_level: "Mid-Level",
          description:
            "• Managed key projects from concept to completion\n• Collaborated with cross-functional teams to achieve business objectives\n• Implemented process improvements that increased efficiency",
        },
        {
          activity_level: "Senior-Level",
          description:
            "• Led strategic initiatives resulting in significant business growth\n• Directed team of professionals, providing mentorship and guidance\n• Pioneered innovative approaches to solve complex problems",
        },
      ];
    }
  } catch (error: any) {
    console.error("GROQ ERROR in generateExperienceDescription:", error?.message);
    return [
      {
        activity_level: "Error",
        description: `Error: ${error?.message || "Unknown error. Please try again."}`,
      },
    ];
  }
};