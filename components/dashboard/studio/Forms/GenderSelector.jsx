import React from "react";
import { motion } from "framer-motion";
import { HiCheck } from "react-icons/hi2";
export default function GenderSelector({
  isPending,
  register,
  delta,
  errors,
  watch,
}) {
  const genders = { Man: "man", Woman: "woman", "Non Binary": "non-binary" };
  const selectedGender = watch("gender");
  return (
    <fieldset disabled={isPending}>
      <motion.div
        initial={{ x: delta >= 0 ? "50%" : "-50%", opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
      >
        <h2 className="text-base font-semibold leading-7">
          Please select your gender.
        </h2>
        <p className="mt-1 text-sm leading-6">{selectedGender}</p>
        <div className="mt-10 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
          <div className="col-span-full">
            <div className="grid grid-flow-col auto-cols-fr gap-2">
              {Object.entries(genders).map(([key, value]) => {
                return (
                  <label
                    key={key}
                    htmlFor={key}
                    className="relative py-3 px-4 flex border-2 border-transparent rounded cursor-pointer focus:outline-none"
                  >
                    <input
                      type="radio"
                      id={key}
                      value={value}
                      {...register("gender")}
                      name="gender"
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
                      <span className="block font-semibold">{key}</span>
                    </span>
                  </label>
                );
              })}
            </div>
            <div className="mt-2">
              {errors.gender?.message && (
                <p className="mt-2 text-sm text-red-400">
                  {errors.gender.message}
                </p>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    </fieldset>
  );
}
