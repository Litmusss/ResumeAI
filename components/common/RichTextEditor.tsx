"use client";

import React, { useEffect, useState } from "react";

const SimpleRichTextEditor = ({
  onRichTextEditorChange,
  defaultValue,
}: {
  onRichTextEditorChange: (value: any) => void;
  defaultValue: string;
}) => {
  const [value, setValue] = useState(defaultValue || "");
  
  useEffect(() => {
    if (defaultValue !== undefined) {
      setValue(defaultValue);
    }
  }, [defaultValue]);

  // Handle changes and propagate them to the parent component
  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    setValue(newValue);
    onRichTextEditorChange({ target: { name: "workSummary", value: newValue } });
  };

  return (
    <div className="mt-2">
      <div className="flex flex-wrap gap-2 mb-2 p-2 border border-gray-200 rounded bg-white">
        <button
          type="button"
          className="px-2 py-1 text-sm font-medium rounded hover:bg-gray-100"
          onClick={() => {
            const textarea = document.getElementById("simple-editor") as HTMLTextAreaElement;
            if (textarea) {
              const start = textarea.selectionStart;
              const end = textarea.selectionEnd;
              const selectedText = value.substring(start, end);
              const newText = value.substring(0, start) + `**${selectedText}**` + value.substring(end);
              setValue(newText);
              onRichTextEditorChange({ target: { name: "workSummary", value: newText } });
            }
          }}
        >
          Bold
        </button>
        <button
          type="button"
          className="px-2 py-1 text-sm font-medium rounded hover:bg-gray-100"
          onClick={() => {
            const textarea = document.getElementById("simple-editor") as HTMLTextAreaElement;
            if (textarea) {
              const start = textarea.selectionStart;
              const end = textarea.selectionEnd;
              const selectedText = value.substring(start, end);
              const newText = value.substring(0, start) + `*${selectedText}*` + value.substring(end);
              setValue(newText);
              onRichTextEditorChange({ target: { name: "workSummary", value: newText } });
            }
          }}
        >
          Italic
        </button>
        <button
          type="button"
          className="px-2 py-1 text-sm font-medium rounded hover:bg-gray-100"
          onClick={() => {
            const textarea = document.getElementById("simple-editor") as HTMLTextAreaElement;
            if (textarea) {
              const start = textarea.selectionStart;
              const end = textarea.selectionEnd;
              const selectedText = value.substring(start, end);
              const newText = value.substring(0, start) + `- ${selectedText}` + value.substring(end);
              setValue(newText);
              onRichTextEditorChange({ target: { name: "workSummary", value: newText } });
            }
          }}
        >
          Bullet
        </button>
        <button
          type="button"
          className="px-2 py-1 text-sm font-medium rounded hover:bg-gray-100"
          onClick={() => {
            const textarea = document.getElementById("simple-editor") as HTMLTextAreaElement;
            if (textarea) {
              const start = textarea.selectionStart;
              const end = textarea.selectionEnd;
              const selectedText = value.substring(start, end);
              const newText = value.substring(0, start) + `1. ${selectedText}` + value.substring(end);
              setValue(newText);
              onRichTextEditorChange({ target: { name: "workSummary", value: newText } });
            }
          }}
        >
          Number
        </button>
        <button
          type="button"
          className="px-2 py-1 text-sm font-medium rounded hover:bg-gray-100"
          onClick={() => {
            const textarea = document.getElementById("simple-editor") as HTMLTextAreaElement;
            if (textarea) {
              const start = textarea.selectionStart;
              const end = textarea.selectionEnd;
              const selectedText = value.substring(start, end);
              const newText = value.substring(0, start) + `### ${selectedText}` + value.substring(end);
              setValue(newText);
              onRichTextEditorChange({ target: { name: "workSummary", value: newText } });
            }
          }}
        >
          Heading
        </button>
      </div>
      
      <textarea
        id="simple-editor"
        value={value}
        onChange={handleChange}
        className="w-full min-h-48 p-3 border border-gray-200 rounded"
        style={{ borderColor: "#E5E7EB" }}
        placeholder="Enter description here..."
      />
      
      <div className="mt-2 p-4 border border-gray-100 rounded bg-gray-50">
        <div className="text-xs text-gray-500 mb-2">Preview (Markdown)</div>
        <div className="prose prose-sm max-w-none" dangerouslySetInnerHTML={{ 
          __html: value
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.*?)\*/g, '<em>$1</em>')
            .replace(/^### (.*?)$/gm, '<h3>$1</h3>')
            .replace(/^- (.*?)$/gm, '<li>$1</li>')
            .replace(/^(\d+)\. (.*?)$/gm, '<li>$2</li>')
            .replace(/\n/g, '<br />')
        }} />
      </div>
    </div>
  );
};

export default SimpleRichTextEditor;