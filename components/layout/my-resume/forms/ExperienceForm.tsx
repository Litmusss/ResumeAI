"use client";

import RichTextEditor from "@/components/common/RichTextEditor";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { generateExperienceDescription } from "@/lib/actions/gemini.actions";
import { addExperienceToResume } from "@/lib/actions/resume.actions";
import { useFormContext } from "@/lib/context/FormProvider";
import { Brain, Loader2, Minus, Plus } from "lucide-react";
import React, { useRef, useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
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
import { ExperienceValidationSchema } from "@/lib/validations/resume";
import { experienceFields } from "@/lib/fields";

interface ExperienceSuggestion {
  activity_level: string;
  description: string;
}

const ExperienceForm = ({ params }: { params: { id: string } }) => {
  const listRef = useRef<HTMLDivElement>(null);
  const { formData, handleInputChange } = useFormContext();
  const [isLoading, setIsLoading] = useState(false);
  const [isAiLoading, setIsLoadingAi] = useState(false);
  const [aiGeneratedSuggestions, setAiGeneratedSuggestions] = useState<ExperienceSuggestion[]>([]);
  const [currentAiIndex, setCurrentAiIndex] = useState(0);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof ExperienceValidationSchema>>({
    resolver: zodResolver(ExperienceValidationSchema),
    mode: "onChange",
    defaultValues: {
      experience:
        formData?.experience?.length > 0
          ? formData.experience
          : [
              {
                title: "",
                companyName: "",
                city: "",
                state: "",
                startDate: "",
                endDate: "",
                workSummary: "",
              },
            ],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "experience",
  });

  const handleChange = (
    index: number,
    event:
      | React.ChangeEvent<HTMLInputElement>
      | { target: { name: string; value: string } }
  ) => {
    const { name, value } = event.target;
    const newEntries = form.getValues("experience").slice();
    newEntries[index] = { ...newEntries[index], [name]: value };
    handleInputChange({
      target: {
        name: "experience",
        value: newEntries,
      },
    });
  };

  const AddNewExperience = () => {
    const newEntry = {
      title: "",
      companyName: "",
      city: "",
      state: "",
      startDate: "",
      endDate: "",
      workSummary: "",
    };
    append(newEntry);
    const newEntries = [...form.getValues("experience"), newEntry];
    handleInputChange({
      target: {
        name: "experience",
        value: newEntries,
      },
    });
  };

  const RemoveExperience = (index: number) => {
    remove(index);
    const newEntries = form.getValues("experience");
    if (currentAiIndex >= newEntries.length) {
      setCurrentAiIndex(newEntries.length - 1 >= 0 ? newEntries.length - 1 : 0);
    }
    handleInputChange({
      target: {
        name: "experience",
        value: newEntries,
      },
    });
  };

  const generateExperienceDescriptionFromAI = async (index: number) => {
    const experience = form.getValues("experience")[index];
    if (!experience.title || !experience.companyName) {
      toast({
        title: "Uh Oh! Something went wrong.",
        description:
          "Please enter the position title and company name to generate summary.",
        variant: "destructive",
        className: "bg-white border-2",
      });
      return;
    }

    setCurrentAiIndex(index);
    setIsLoadingAi(true);
    setAiGeneratedSuggestions([]); // Clear previous suggestions

    try {
      const result = await generateExperienceDescription({
        title: experience.title,
        company: experience.companyName,
        startDate: experience.startDate,
        endDate: experience.endDate,
        description: experience.workSummary
      });
      
      if (Array.isArray(result) && result.length > 0) {
        setAiGeneratedSuggestions(result);
        
        setTimeout(() => {
          listRef?.current?.scrollIntoView({
            behavior: "smooth",
            block: "start",
          });
        }, 100);
      } else {
        toast({
          title: "Error generating suggestions",
          description: "Failed to get proper response from AI. Please try again.",
          variant: "destructive",
          className: "bg-white",
        });
      }
    } catch (error) {
      console.error("Error generating experience description:", error);
      toast({
        title: "Error",
        description: "There was a problem generating suggestions. Please try again.",
        variant: "destructive",
        className: "bg-white",
      });
    } finally {
      setIsLoadingAi(false);
    }
  };

  const onSave = async (data: z.infer<typeof ExperienceValidationSchema>) => {
    setIsLoading(true);
    try {
      const result = await addExperienceToResume(params.id, data.experience);

      if (result.success) {
        toast({
          title: "Information saved.",
          description: "Professional experience updated successfully.",
          className: "bg-white",
        });
        handleInputChange({
          target: {
            name: "experience",
            value: data.experience,
          },
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
        title: "Error saving experience",
        description: "There was a problem saving your changes. Please try again.",
        variant: "destructive",
        className: "bg-white",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const selectDescription = (description: string) => {
    form.setValue(`experience.${currentAiIndex}.workSummary`, description, { 
      shouldValidate: true 
    });
    
    // Update the form context
    const updatedExperience = form.getValues("experience");
    handleInputChange({
      target: {
        name: "experience",
        value: updatedExperience,
      },
    });
  };

  return (
    <div>
      <div className="p-5 shadow-lg rounded-lg border-t-primary-700 border-t-4 bg-white">
        <h2 className="text-lg font-semibold leading-none tracking-tight">
          Professional Experience
        </h2>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Add your previous job experiences
        </p>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSave)} className="mt-5">
            {fields.map((item, index) => (
              <div
                key={item.id}
                className="grid grid-cols-2 gap-3 border p-3 my-5 rounded-lg"
              >
                {experienceFields.map((config) => (
                  <FormField
                    key={config.name}
                    control={form.control}
                    name={`experience.${index}.${config.name}`}
                    render={({ field }) => (
                      <FormItem className={config.colSpan || ""}>
                        {config.type === "richText" ? (
                          <div className="flex justify-between items-end">
                            <FormLabel className="text-slate-700 font-semibold text-md">
                              {config.label}:
                            </FormLabel>
                            <Button
                              variant="outline"
                              onClick={() =>
                                generateExperienceDescriptionFromAI(index)
                              }
                              type="button"
                              size="sm"
                              className="border-primary text-primary flex gap-2"
                              disabled={isAiLoading}
                            >
                              {isAiLoading && currentAiIndex === index ? (
                                <Loader2 size={16} className="animate-spin" />
                              ) : (
                                <Brain className="h-4 w-4" />
                              )}{" "}
                              Generate from AI
                            </Button>
                          </div>
                        ) : (
                          <FormLabel className="text-slate-700 font-semibold text-md">
                            {config.label}:
                          </FormLabel>
                        )}
                        <FormControl>
                          {config.type === "richText" ? (
                            <RichTextEditor
                              defaultValue={(field.value as string) || ""}
                              onRichTextEditorChange={(e) => {
                                field.onChange(e);
                                handleChange(index, e);
                              }}
                            />
                          ) : (
                            <Input
                              type={config.type}
                              {...field}
                              value={field.value as string}
                              className={`no-focus ${
                                form.formState.errors.experience?.[index]?.[
                                  config.name
                                ]
                                  ? "error"
                                  : ""
                              }`}
                              onChange={(e) => {
                                field.onChange(e);
                                handleChange(index, e);
                              }}
                            />
                          )}
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                ))}
              </div>
            ))}
            <div className="mt-3 flex gap-2 justify-between">
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={AddNewExperience}
                  className="text-primary"
                  type="button"
                >
                  <Plus className="size-4 mr-2" /> Add More
                </Button>
                <Button
                  variant="outline"
                  onClick={() => RemoveExperience(fields.length - 1)}
                  className="text-primary"
                  type="button"
                  disabled={fields.length <= 1}
                >
                  <Minus className="size-4 mr-2" /> Remove
                </Button>
              </div>
              <Button
                type="submit"
                disabled={isLoading || !form.formState.isValid}
                className="bg-primary-700 hover:bg-primary-800 text-white"
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

      {aiGeneratedSuggestions.length > 0 && (
        <div className="my-5" ref={listRef}>
          <h2 className="font-bold text-lg">Suggestions</h2>
          {aiGeneratedSuggestions.map((item, index) => (
            <div
              key={index}
              onClick={() => selectDescription(item.description)}
              className={`p-5 shadow-lg my-4 rounded-lg border-t-2 ${
                isAiLoading ? "cursor-not-allowed" : "cursor-pointer hover:bg-gray-50"
              }`}
              aria-disabled={isAiLoading}
            >
              <h2 className="font-semibold my-1 text-primary text-gray-800">
                Level: {item.activity_level}
              </h2>
              <pre className="text-justify text-gray-600 whitespace-pre-line font-sans">{item.description}</pre>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ExperienceForm;