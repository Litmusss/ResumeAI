"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { analyzeResume } from "@/lib/actions/atschecker.actions";

const ATSChecker = () => {
  const [jobDesc, setJobDesc] = useState("");
  const [resume, setResume] = useState<File | null>(null);
  const [fileName, setFileName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [analysis, setAnalysis] = useState("");

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setResume(file);
      setFileName(file.name);
    }
  };

  const handleSubmit = async () => {
    if (!resume || !jobDesc) {
      alert("Please upload a resume and provide a job description");
      return;
    }
  
    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append("jobDesc", jobDesc);
      formData.append("resume", resume); // Make sure this is the File object
      
      // This should match your server action name
      const result = await analyzeResume(formData); 
      setAnalysis(result);
    } catch (error) {
      console.error("Error analyzing resume:", error);
      setAnalysis("Error analyzing resume. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-6">ATS Resume Checker</h1>
        <p className="text-gray-600 mb-4">
          Upload your resume and paste the job description to check how well your resume matches the job requirements.
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <Label htmlFor="jobDesc" className="text-base font-medium">Job Description</Label>
          <Textarea
            id="jobDesc"
            className="min-h-32"
            placeholder="Paste the job description here..."
            value={jobDesc}
            onChange={(e) => setJobDesc(e.target.value)}
          />
        </div>

        <div>
          <Label htmlFor="resume" className="text-base font-medium">Resume</Label>
          <div className="flex items-center gap-4">
            <Input
              id="resume"
              type="file"
              accept=".pdf,.docx,.doc,.txt"
              onChange={handleFileChange}
              className="cursor-pointer"
            />
            {fileName && <span className="text-sm text-gray-500">{fileName}</span>}
          </div>
        </div>

        <Button 
          onClick={handleSubmit} 
          disabled={isLoading || !resume || !jobDesc}
          className="w-full md:w-auto"
        >
          {isLoading ? "Analyzing..." : "Analyze Resume"}
        </Button>
      </div>

      {analysis && (
        <div className="mt-8 p-6 bg-gray-50 rounded-lg border">
          <h2 className="text-xl font-semibold mb-4">Analysis Results</h2>
          <div className="whitespace-pre-wrap">{analysis}</div>
        </div>
      )}
    </div>
  );
};

export default ATSChecker;


