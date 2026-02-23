"use client";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { generateSummary } from "@/lib/actions/gemini.actions";
import { updateResume } from "@/lib/actions/resume.actions";
import { useFormContext } from "@/lib/context/FormProvider";
import { Brain, Loader2 } from "lucide-react";
import React, { useRef, useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { SummaryValidationSchema } from "@/lib/validations/resume"; // Adjust path if needed

interface SummaryItem {
  experience_level: string;
  summary: string;
}

const SummaryForm = ({ params }: { params: { id: string } }) => {
  const listRef = useRef<HTMLDivElement>(null);
  const { formData, handleInputChange } = useFormContext();
  const [summary, setSummary] = useState(formData?.summary || "");
  const [isLoading, setIsLoading] = useState(false);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiGeneratedSummaryList, setAiGeneratedSummaryList] = useState<SummaryItem[]>([]);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof SummaryValidationSchema>>({
    resolver: zodResolver(SummaryValidationSchema),
    mode: "onChange",
    defaultValues: {
      summary: formData?.summary || "",
    },
  });

  useEffect(() => {
    if (formData?.summary) {
      form.reset({ summary: formData.summary });
    }
  }, [formData, form]);

  const handleSummaryChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newSummary = e.target.value;
    setSummary(newSummary);

    handleInputChange({
      target: { name: "summary", value: newSummary },
    } as any);
  };

  const generateSummaryFromAI = async () => {
    setIsAiLoading(true);
    try {
      const result = await generateSummary(formData?.jobTitle || "Software Engineer");
      setAiGeneratedSummaryList(result);

      setTimeout(() => {
        listRef?.current?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }, 100);
    } catch (error) {
      console.error("Error generating summaries:", error);
      toast({
        title: "Error generating summaries",
        description: "There was a problem connecting to the AI service. Please try again.",
        variant: "destructive",
        className: "bg-white",
      });
    } finally {
      setIsAiLoading(false);
    }
  };

  const onSave = async (data: z.infer<typeof SummaryValidationSchema>) => {
    setIsLoading(true);
    try {
      const updates = { summary: data.summary };
      const result = await updateResume({ resumeId: params.id, updates });

      if (result.success) {
        toast({
          title: "Information saved.",
          description: "Summary updated successfully.",
          className: "bg-white",
        });
      } else {
        toast({
          title: "Uh Oh! Something went wrong.",
          description: result?.error,
          variant: "destructive",
          className: "bg-white",
        });
      }
    } catch (error) {
      toast({
        title: "Error saving summary",
        description: "There was a problem saving your changes. Please try again.",
        variant: "destructive",
        className: "bg-white",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const selectSummary = (selectedSummary: string) => {
    // Update the form value
    form.setValue("summary", selectedSummary, { shouldValidate: true });
    
    // Update local state
    setSummary(selectedSummary);
    
    // Update the form context
    handleInputChange({
      target: { name: "summary", value: selectedSummary },
    } as any);
  };

  return (
    <div>
      <div className="p-5 shadow-lg rounded-lg border-t-primary-700 border-t-4 bg-white">
        <h2 className="text-lg font-semibold leading-none tracking-tight">
          Summary
        </h2>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Add summary about your job
        </p>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSave)} className="mt-5 space-y-2">
            <FormField
              control={form.control}
              name="summary"
              render={({ field }) => (
                <FormItem>
                  <div className="flex justify-between items-end">
                    <FormLabel className="text-slate-700 font-semibold text-md">
                      Summary:
                    </FormLabel>
                    <Button
                      variant="outline"
                      onClick={generateSummaryFromAI}
                      type="button"
                      size="sm"
                      className="border-primary text-primary flex gap-2"
                      disabled={isAiLoading}
                    >
                      {isAiLoading ? (
                        <Loader2 size={16} className="animate-spin" />
                      ) : (
                        <Brain className="h-4 w-4" />
                      )}{" "}
                      Generate from AI
                    </Button>
                  </div>
                  <FormControl>
                    <Textarea
                      className={`no-focus min-h-[10em] ${
                        form.formState.errors.summary ? "error" : ""
                      }`}
                      {...field}
                      onChange={(e) => {
                        field.onChange(e);
                        handleSummaryChange(e);
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex justify-end">
              <Button
                className="mt-3 bg-primary-700 hover:bg-primary-800 text-white"
                type="submit"
                disabled={isLoading || !form.formState.isValid}
              >
                {isLoading ? (
                  <>
                    <Loader2 size={20} className="animate-spin" /> &nbsp; Saving
                  </>
                ) : (
                  "Save"
                )}
              </Button>
            </div>
          </form>
        </Form>
      </div>

      {aiGeneratedSummaryList.length > 0 && (
        <div className="my-5" ref={listRef}>
          <h2 className="font-bold text-lg">Suggestions</h2>
          {aiGeneratedSummaryList.map((item, index) => (
            <div
              key={index}
              onClick={() => selectSummary(item.summary)}
              className={`p-5 shadow-lg my-4 rounded-lg border-t-2 ${
                isAiLoading ? "cursor-not-allowed" : "cursor-pointer hover:bg-gray-50"
              }`}
              aria-disabled={isAiLoading}
            >
              <h2 className="font-semibold my-1 text-primary text-gray-800">
                Level: {item.experience_level}
              </h2>
              <p className="text-justify text-gray-600">{item.summary}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SummaryForm;