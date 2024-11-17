"use client";
import React, { useState, useEffect } from "react";
import { HiCheck } from "react-icons/hi2";
import Heading from "@/components/shared/heading";
import { v4 as uuidv4 } from "uuid";
import { PLANS } from "@/lib/data";

export default function PlanSelector({
  data,
  isPending,
  register,
  setValue,
  errors,
  watch,
  clearErrors,
  trigger,
  shouldValidate,
}) {
  const [details, options] = data;
  const [localValue, setLocalValue] = useState("");

  const handleRadioChange = (value) => {
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

  return (
    <fieldset disabled={isPending}>
      <span className="text-xs uppercase font-bold pl-0 xs:pl-0 xl:pl-1 text-red-600">
        this field required.
      </span>
      <Heading variant={"hero"}>{details.title}</Heading>
      <h2 className="pl-0 xs:pl-0 xl:pl-1">{details.subtitle}</h2>
      <div className="mt-10 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
        <div className="col-span-full">
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
            {options.map(([planName, remainingCredits]) => {
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
                    value={planName}
                    disabled={remainingCredits < 1}
                    onChange={() => handleRadioChange(planName)}
                    checked={currentValue === planName}
                    name={details.fieldName}
                    className="peer disabled:cursor-not-allowed absolute top-0 start-0 w-full h-full bg-transparent border border-gray-300 rounded cursor-pointer appearance-none focus:ring-white checked:border-2 checked:border-blue-600 checked:hover:border-blue-600 checked:focus:border-blue-600 checked:bg-none checked:text-transparent pointer-events-none before:content-[''] before:top-3.5 before:start-3.5 before:border-blue-600 before:h-5 before:rounded"
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
                  <span className="flex flex-col w-full">
                    <span>{planName}</span>
                    <span className="text-xs">
                      {remainingCredits} credits available.
                    </span>
                    <span className="text-xs">
                      {PLANS[planName]?.headshots} Headshots.
                    </span>
                  </span>
                </label>
              );
            })}
          </div>

          <div className="mt-2">
            {shouldValidate &&
              errors &&
              errors[details?.fieldName]?.message && (
                <p className="mt-2 text-sm text-red-400">
                  {errors[details?.fieldName].message}
                </p>
              )}
          </div>
        </div>
      </div>
    </fieldset>
  );
}
