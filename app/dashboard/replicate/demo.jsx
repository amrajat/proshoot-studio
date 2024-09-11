"use client";
import React, { useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { createClient } from "@supabase/supabase-js";
import { v4 as uuidv4 } from "uuid";
import { motion, AnimatePresence } from "framer-motion";

// Initialize Supabase client
const supabase = createClient("https://.gogole.com", "YOUR_SUPABASE_ANON_KEY");

// Define the schema for form validation
const schema = z.object({
  gender: z.string().min(1, "Please select or enter a gender"),
  hairColor: z.string().min(1, "Please select or enter a hair color"),
  eyeColor: z.string().min(1, "Please select or enter an eye color"),
  image: z.instanceof(File).optional(),
});

const MultiStepForm = () => {
  const [step, setStep] = useState(0);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [imagePreview, setImagePreview] = useState(null);

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
    mode: "onChange",
  });

  const watchAllFields = watch();

  useEffect(() => {
    if (step < 3 && watchAllFields[Object.keys(watchAllFields)[step]]) {
      setStep(step + 1);
    }
  }, [watchAllFields, step]);

  const onSubmit = async (data) => {
    console.log(data);
    // Here you would typically send the data to your AI image generation service
    // For demo purposes, we&apos;ll just log it

    if (data.image) {
      const file = data.image;
      const fileExt = file.name.split(".").pop();
      const fileName = `${uuidv4()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error } = await supabase.storage
        .from("images")
        .upload(filePath, file, {
          onUploadProgress: (progress) => {
            setUploadProgress(progress);
          },
        });

      if (error) {
        console.error("Error uploading file:", error);
      } else {
        console.log("File uploaded successfully");
      }
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const renderRadioOptions = (name, options) => (
    <Controller
      name={name}
      control={control}
      render={({ field }) => (
        <div className="space-y-4">
          {options.map((option) => (
            <motion.label
              key={option}
              className="flex items-center space-x-3 p-3 bg-white rounded-lg shadow-md cursor-pointer transition-all duration-300 hover:shadow-lg"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <input
                type="radio"
                {...field}
                value={option}
                checked={field.value === option}
                className="form-radio text-blue-600 h-5 w-5 cursor-pointer"
                onChange={() => {
                  field.onChange(option);
                  setStep(Math.min(3, step + 1));
                }}
              />
              <span className="capitalize text-lg">{option}</span>
            </motion.label>
          ))}
          <motion.label
            className="flex items-center space-x-3 p-3 bg-white rounded-lg shadow-md cursor-pointer transition-all duration-300 hover:shadow-lg"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <input
              type="radio"
              {...field}
              value="custom"
              checked={!options.includes(field.value)}
              className="form-radio text-blue-600 h-5 w-5 cursor-pointer"
              onChange={() => {
                field.onChange("");
                setStep(Math.min(3, step + 1));
              }}
            />
            <input
              type="text"
              placeholder="Custom value"
              className="form-input mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
              value={!options.includes(field.value) ? field.value : ""}
              onChange={(e) => {
                field.onChange(e.target.value);
                setStep(Math.min(3, step + 1));
              }}
            />
          </motion.label>
        </div>
      )}
    />
  );

  const renderStep = () => {
    switch (step) {
      case 0:
        return (
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            className="space-y-6"
          >
            <h2 className="text-3xl font-bold text-gray-800">
              What&apos;s your gender?
            </h2>
            {renderRadioOptions("gender", ["male", "female", "other"])}
            {errors.gender && (
              <p className="text-red-500">{errors.gender.message}</p>
            )}
          </motion.div>
        );
      case 1:
        return (
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            className="space-y-6"
          >
            <h2 className="text-3xl font-bold text-gray-800">
              What&apos;s your hair color?
            </h2>
            {renderRadioOptions("hairColor", [
              "black",
              "brown",
              "blonde",
              "red",
              "other",
            ])}
            {errors.hairColor && (
              <p className="text-red-500">{errors.hairColor.message}</p>
            )}
          </motion.div>
        );
      case 2:
        return (
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            className="space-y-6"
          >
            <h2 className="text-3xl font-bold text-gray-800">
              What&apos;s your eye color?
            </h2>
            {renderRadioOptions("eyeColor", [
              "brown",
              "blue",
              "green",
              "hazel",
              "other",
            ])}
            {errors.eyeColor && (
              <p className="text-red-500">{errors.eyeColor.message}</p>
            )}
          </motion.div>
        );
      case 3:
        return (
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            className="space-y-6"
          >
            <h2 className="text-3xl font-bold text-gray-800">
              Upload your photo
            </h2>
            <Controller
              name="image"
              control={control}
              render={({ field }) => (
                <div className="space-y-4">
                  <label className="block">
                    <span className="sr-only">Choose profile photo</span>
                    <input
                      type="file"
                      onChange={(e) => {
                        field.onChange(e.target.files[0]);
                        handleImageChange(e);
                      }}
                      accept="image/*"
                      className="block w-full text-sm text-gray-500
                        file:mr-4 file:py-2 file:px-4
                        file:rounded-full file:border-0
                        file:text-sm file:font-semibold
                        file:bg-blue-50 file:text-blue-700
                        hover:file:bg-blue-100
                        transition-all duration-300"
                    />
                  </label>
                  {imagePreview && (
                    <motion.img
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      src={imagePreview}
                      alt="Preview"
                      className="mt-4 max-w-xs rounded-lg shadow-md"
                    />
                  )}
                  {uploadProgress > 0 && uploadProgress < 100 && (
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${uploadProgress}%` }}
                      className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden"
                    >
                      <div
                        className="bg-blue-600 h-2.5 rounded-full"
                        style={{ width: `${uploadProgress}%` }}
                      ></div>
                    </motion.div>
                  )}
                </div>
              )}
            />
            {errors.image && (
              <p className="text-red-500">{errors.image.message}</p>
            )}
          </motion.div>
        );
      default:
        return null;
    }
  };

  const handlePrevious = () => {
    setStep((prevStep) => Math.max(0, prevStep - 1));
  };

  return (
    <div className="max-w-2xl mx-auto mt-10 p-8 bg-white rounded-xl shadow-2xl">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        <AnimatePresence mode="wait">{renderStep()}</AnimatePresence>
        <motion.div
          className="flex justify-between"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <motion.button
            type="button"
            onClick={handlePrevious}
            className="px-6 py-3 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
            disabled={step === 0}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Previous
          </motion.button>
          {step < 3 ? (
            <motion.button
              type="button"
              onClick={() => setStep(Math.min(3, step + 1))}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-300"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Next
            </motion.button>
          ) : (
            <motion.button
              type="submit"
              className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all duration-300"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Submit
            </motion.button>
          )}
        </motion.div>
      </form>
    </div>
  );
};

export default MultiStepForm;
