"use client";
import ImageUploadingGuideLines from "@/components/dashboard/studio/ImageUploadingGuideLines";
import { Button } from "@/components/ui/button";
import { useState, useCallback, useRef } from "react";
import createSupabaseBrowserClient from "@/lib/supabase/BrowserClient";
import { v4 as uuidv4 } from "uuid";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

import { ArrowUp, Paperclip, Trash, X } from "lucide-react";
import Image from "next/image";

import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

const formSchema = z.object({
  gender: z.enum(["man", "woman", "non-binary"], {
    required_error: "Please select your gender",
  }),
  ageRange: z.string().min(1, "Please select your age range"),
  ethnicity: z.string().min(1, "Please enter your ethnicity"),
  hairStyle: z.string().min(1, "Please describe your hairstyle"),
  eyeColor: z.string().min(1, "Please enter your eye color"),
  glasses: z.string().optional(),
});

const supabase = createSupabaseBrowserClient();

export default function Component() {
  const [files, setFiles] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const fileInputRef = useRef(null);

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      gender: undefined,
      ageRange: "",
      ethnicity: "",
      hairStyle: "",
      eyeColor: "",
      glasses: "",
    },
  });

  const handleFileChange = useCallback((e) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setFiles((prevFiles) => [...prevFiles, ...newFiles]);

      const newPreviews = newFiles.map((file) => URL.createObjectURL(file));
      setPreviews((prevPreviews) => [...prevPreviews, ...newPreviews]);
    }
  }, []);

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const removeFile = useCallback((index) => {
    setFiles((prevFiles) => prevFiles.filter((_, i) => i !== index));
    setPreviews((prevPreviews) => {
      URL.revokeObjectURL(prevPreviews[index]);
      return prevPreviews.filter((_, i) => i !== index);
    });
  }, []);

  const removeAllFiles = useCallback(() => {
    previews.forEach((preview) => URL.revokeObjectURL(preview));
    setFiles([]);
    setPreviews([]);
  }, [previews]);

  const uploadFiles = useCallback(
    async (formData) => {
      setUploading(true);
      setProgress(0);

      const {
        data: {
          session: { user },
        },
      } = await supabase.auth.getSession();

      const randomString = uuidv4();
      const date = new Date();
      const options = { day: "2-digit", month: "2-digit", year: "numeric" };
      const formattedDate = date
        .toLocaleDateString("en-GB", options)
        .replace(/\//g, "-");

      let uploadedCount = 0;
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const { error } = await supabase.storage
          .from("temp-flux")
          .upload(
            `${user?.id}/${formattedDate}/${randomString}/${Date.now()}_${
              file.name
            }`,
            file
          );

        if (error) {
          console.error("Error uploading file:", error);
        } else {
          uploadedCount++;
          setProgress((uploadedCount / files.length) * 100);
        }
      }

      const details = `
      Gender: ${formData.gender}
      Age Range: ${formData.ageRange}
      Ethnicity: ${formData.ethnicity}
      Hair Style: ${formData.hairStyle}
      Eye Color: ${formData.eyeColor}
      Glasses: ${formData.glasses || "N/A"}
    `;

      const { error: textFileError } = await supabase.storage
        .from("temp-flux")
        .upload(
          `${user?.id}/${formattedDate}/${randomString}/details.txt`,
          new Blob([details], { type: "text/plain" })
        );

      if (textFileError) {
        console.error("Error uploading details file:", textFileError);
      }

      setIsCompleted(uploadedCount === files.length);
      setUploading(false);
      removeAllFiles();
    },
    [files, removeAllFiles]
  );

  const onSubmit = async (data) => {
    if (files.length === 0) {
      alert("Please select at least one image");
      return;
    }
    await uploadFiles(data);
  };

  return (
    <>
      {!isCompleted && (
        <div className="w-full mx-auto space-y-8">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="gender"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Gender</FormLabel>
                    <FormControl>
                      <RadioGroup
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        className="flex flex-row space-x-4"
                      >
                        <FormItem className="flex items-center space-x-2">
                          <RadioGroupItem value="man" />
                          <FormLabel>Man</FormLabel>
                        </FormItem>
                        <FormItem className="flex items-center space-x-2">
                          <RadioGroupItem value="woman" />
                          <FormLabel>Woman</FormLabel>
                        </FormItem>
                        <FormItem className="flex items-center space-x-2">
                          <RadioGroupItem value="non-binary" />
                          <FormLabel>Non-binary</FormLabel>
                        </FormItem>
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="ageRange"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Age Range</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g. mid 30s, late 20s, early 70s"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="ethnicity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Ethnicity</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. Caucasian" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="hairStyle"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Hair Style</FormLabel>
                    <FormControl>
                      <Input placeholder="Describe your hairstyle" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="eyeColor"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Eye Color</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. Hazel, Blue" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="glasses"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Glasses(Optional)</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Write 'true' if wearing glasses in photos, otherwise describe desired glasses."
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="space-y-4">
                <p className="text-sm text-destructive">
                  Read image uploading guidelines below.
                </p>
                <Dialog defaultOpen={true}>
                  <DialogTrigger asChild>
                    <Button className="mr-2" variant={"destructive"}>
                      Show Image Guidelines
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="w-[95vw] max-w-[95vw] sm:max-w-[90vw] md:max-w-[85vw] lg:max-w-[80vw] xl:max-w-6xl h-[90vh] p-4 sm:p-6 overflow-hidden">
                    <DialogHeader className="mb-2 sm:mb-4">
                      <DialogTitle className="text-xl sm:text-2xl">
                        Image Upload Guidelines
                      </DialogTitle>
                    </DialogHeader>
                    <div className="overflow-y-auto pr-2 -mr-2 h-full pb-12">
                      <ImageUploadingGuideLines />
                    </div>
                    <DialogFooter className="mt-4 sm:mt-6">
                      <DialogClose asChild>
                        <Button variant="destructive">Close</Button>
                      </DialogClose>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
                <p className="text-sm text-destructive">
                  Please upload 5 or more images (we recommend 8-20 for best
                  results.)
                </p>

                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleFileChange}
                  className="hidden"
                  ref={fileInputRef}
                />

                <Button
                  type="button"
                  onClick={triggerFileInput}
                  disabled={uploading}
                  className="w-full"
                >
                  <Paperclip className="mr-2" strokeWidth={2} />
                  Select Images
                </Button>

                {previews.length > 0 && (
                  <div className="flex w-full flex-wrap gap-2 mt-4 justify-center">
                    {previews.map((preview, index) => (
                      <div key={index} className="relative">
                        <Image
                          width={160}
                          height={160}
                          src={preview}
                          alt={`Preview ${index + 1}`}
                          className="w-full h-40 object-cover rounded-md"
                        />
                        <Button
                          variant="destructive"
                          size="icon"
                          className="absolute top-2 right-2"
                          onClick={() => removeFile(index)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}

                {previews.length > 0 && (
                  <div className="space-y-2">
                    <Button
                      type="submit"
                      disabled={uploading || files.length < 5}
                      className="w-full"
                    >
                      <ArrowUp className="mr-2" />
                      {uploading
                        ? "Uploading..."
                        : "Submit Form & Upload Images"}
                    </Button>
                    <Button
                      type="button"
                      onClick={removeAllFiles}
                      variant="destructive"
                      disabled={uploading}
                      className="w-full"
                    >
                      <Trash className="mr-2" />
                      Remove All Images
                    </Button>
                  </div>
                )}
              </div>
            </form>
          </Form>

          {parseInt(progress) <= 100 && parseInt(progress) > 0 && (
            <div
              className="flex w-full h-4 bg-gray-200 rounded-full overflow-hidden"
              role="progressbar"
              aria-valuenow={parseInt(progress)}
              aria-valuemin="0"
              aria-valuemax="100"
            >
              <div
                className="flex flex-col justify-center rounded-full overflow-hidden bg-blue-600 text-xs text-white text-center whitespace-nowrap duration-500 transition-all"
                style={{ width: `${parseInt(progress)}%` }}
              >
                {parseInt(progress)}%
              </div>
            </div>
          )}
        </div>
      )}
      {isCompleted && parseInt(progress) === 100 && !uploading && (
        <h1 className="text-2xl font-bold">
          Thank you! We are in the process of setting up your studio. You will
          be notified once it is ready. Please chat/email us at
          support@proshoot.co if you don't hear from us within 24Hrs.
        </h1>
      )}
    </>
  );
}
