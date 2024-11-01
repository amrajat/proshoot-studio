import React from "react";
import { motion } from "framer-motion";
import { HiCheck } from "react-icons/hi2";
import Heading from "@/components/shared/Heading";
export default function EthnicitySelector({
  isPending,
  register,
  delta,
  errors,
}) {
  const ethnicities = [
    "African American",
    "Caucasian",
    "East Asian",
    "Hispanic/Latino",
    "Middle Eastern",
    "Mixed race",
    "Native American",
    "Pacific Islander",
    "South Asian",
    "Southeast Asian",
  ];

  return (
    <fieldset disabled={isPending}>
      <motion.div
        initial={{ x: delta >= 0 ? "50%" : "-50%", opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
      >
        <Heading type="h4">I look like i am in my</Heading>
        <p className="mt-1 text-sm leading-6">
          You might be younger or older in realty, but here choose the ethnicity
          range that resembles you.
        </p>
        <div className="mt-10 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
          <div className="col-span-full">
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
              {ethnicities.map((ethnicity, index) => {
                return (
                  <label
                    key={index}
                    htmlFor={ethnicity}
                    className="relative py-3 px-4 flex border-2 border-transparent rounded cursor-pointer focus:outline-none"
                  >
                    <input
                      type="radio"
                      id={ethnicity}
                      value={ethnicity}
                      {...register("ethnicity")}
                      name="ethnicity"
                      className="peer absolute top-0 start-0 w-full h-full bg-transparent border border-gray-300 rounded cursor-pointer appearance-none focus:ring-white checked:border-2 checked:border-blue-600 checked:hover:border-blue-600 checked:focus:border-blue-600 checked:bg-none checked:text-transparent disabled:opacity-50 pointer-events-none before:content-[''] before:top-3.5 before:start-3.5  before:border-blue-600 before:h-5 before:rounded"
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
                      <span className="">{ethnicity.toLowerCase()}</span>
                    </span>
                  </label>
                );
              })}
            </div>
            <div className="mt-2">
              {errors.gender?.messethnicity && (
                <p className="mt-2 text-sm text-red-400">
                  {errors.ethnicity.messethnicity}
                </p>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    </fieldset>
  );
}
