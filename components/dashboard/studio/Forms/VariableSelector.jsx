"use client";
import React, { useState, useEffect } from "react";
import { HiCheck } from "react-icons/hi2";
import Heading from "@/components/shared/heading";

import { v4 as uuidv4 } from "uuid";

export default function VariableSelector({
  data,
  isSubmitting,
  register,
  setValue,
  errors,
  watch,
  clearErrors,
  trigger,
  shouldValidate,
}) {
  const [
    details,
    options,
    {
      isRequired,
      placeholderText,
      helpText,
      regexPattern,
      radioOptions,
      customOption,
    },
  ] = data;
  const [useCustomInput, setUseCustomInput] = useState(false);
  const [localValue, setLocalValue] = useState("");

  const handleCustomInputChange = (e) => {
    const customValue = e.target.value;
    setUseCustomInput(customValue !== "");
    setLocalValue(customValue);
    if (setValue) {
      setValue(details.fieldName, customValue, { shouldValidate });
    }
    if (clearErrors) {
      clearErrors(details.fieldName);
    }
  };

  const handleRadioChange = (value) => {
    setUseCustomInput(false);
    setLocalValue(value);
    if (setValue) {
      setValue(details.fieldName, value, { shouldValidate });
    }
    if (clearErrors) {
      clearErrors(details.fieldName);
    }
  };

  useEffect(() => {
    if (register) {
      register(details.fieldName, {
        required: `Please select a ${details.title.toLowerCase()}.`,
        validate: (value) =>
          value !== "" || `Please select a ${details.title.toLowerCase()}.`,
      });
    }
  }, [register, details.fieldName, details.title]);

  const currentValue = watch ? watch(details.fieldName) : localValue;

  const handleInputFocus = () => {
    setUseCustomInput(true);
  };

  const handleInputBlur = (e) => {
    if (e.target.value === "") {
      setUseCustomInput(false);
    }
  };

  return (
    <fieldset disabled={isSubmitting}>
      <span
        className={
          "text-xs uppercase font-bold pl-0 xs:pl-0 xl:pl-1 " +
          (isRequired ? "text-red-600" : "text-blue-600")
        }
      >
        {isRequired
          ? "this field required."
          : "Please refrain from selecting any options below unless you have a specific interest in a specific type of image(s)."}
      </span>
      <Heading variant={"hero"}>{details.title}</Heading>

      <h2 className="pl-0 xs:pl-0 xl:pl-1">{details.subtitle}</h2>

      <div className="mt-10 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
        <div className="col-span-full">
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
            {radioOptions &&
              options &&
              Object.entries(options).map(([optionName, optionValue]) => {
                const randomKey = uuidv4();
                return (
                  <label
                    key={randomKey}
                    htmlFor={randomKey}
                    className="relative py-3 px-4 flex border-2 border-transparent rounded cursor-pointer focus:outline-none"
                  >
                    <input
                      type="radio"
                      id={randomKey}
                      value={optionValue}
                      onChange={() => handleRadioChange(optionValue)}
                      checked={currentValue === optionValue}
                      name={details.fieldName}
                      className="peer absolute top-0 start-0 w-full h-full bg-transparent border border-gray-300 rounded cursor-pointer appearance-none focus:ring-white checked:border-2 checked:border-blue-600 checked:hover:border-blue-600 checked:focus:border-blue-600 checked:bg-none checked:text-transparent pointer-events-none before:content-[''] before:top-3.5 before:start-3.5 before:border-blue-600 before:h-5 before:rounded"
                    />
                    <span className="peer-checked:flex hidden absolute top-4 end-4">
                      <span className="w-5 h-5 flex justify-center items-center rounded bg-blue-600">
                        <HiCheck
                          className="flex-shrink-0 w-3 h-3 text-white"
                          width={24}
                          height={24}
                          strokeWidth={2}
                        />
                      </span>
                    </span>
                    <span className="w-full">
                      <span>{optionValue}</span>
                    </span>
                  </label>
                );
              })}
            {customOption && (
              // <input
              //   type="text"
              //   placeholder="use custom value instead, a-z lowercase only, use space as separator, no special characters."
              //   onChange={handleCustomInputChange}
              //   onFocus={handleInputFocus}
              //   onBlur={handleInputBlur}
              //   value={useCustomInput ? currentValue || "" : ""}
              //   className="col-span-2 sm:col-span-3 md:col-span-4 row-span-2 py-3 px-4 block w-full border border-gray-300 rounded text-sm focus:border-blue-500 focus:ring-blue-500 disabled:opacity-50 disabled:pointer-events-none outline-blue-600 placeholder:text-sm"
              // />
              <div className="col-span-2 sm:col-span-3 md:col-span-4 row-span-2 pl-0 xs:pl-0 xl:pl-1 mt-4">
                <label className="block text-sm font-medium mb-2">
                  Enter your {radioOptions ? "custom" : ""} value here:
                </label>
                <input
                  type="text"
                  className="py-3 px-4 block w-full border-gray-200 rounded text-sm focus:border-blue-500 focus:ring-blue-500 disabled:opacity-50 disabled:pointer-events-none outline-blue-600"
                  placeholder={
                    placeholderText || "enter your custom value here"
                  }
                  onChange={handleCustomInputChange}
                  onFocus={handleInputFocus}
                  onBlur={handleInputBlur}
                  value={useCustomInput ? currentValue || "" : ""}
                />
                <p className="mt-2 text-sm text-gray-500">{helpText}</p>
              </div>
            )}
          </div>

          <div className="mt-2">
            {shouldValidate &&
              errors &&
              errors[details?.fieldName]?.message && (
                <p className="mt-2 text-sm text-red-500">
                  {errors[details?.fieldName].message}
                </p>
              )}
          </div>
        </div>
      </div>
    </fieldset>
  );
}
