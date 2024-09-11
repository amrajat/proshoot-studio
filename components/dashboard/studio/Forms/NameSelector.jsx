import React from "react";
import { motion } from "framer-motion";
import { HiCheck } from "react-icons/hi2";
export default function NameSelector({
  isPending,
  register,
  delta,
  errors,
  watch,
}) {
  const selectedGender = watch("name");
  return (
    <fieldset disabled={isPending}>
      <motion.div
        initial={{ x: delta >= 0 ? "50%" : "-50%", opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
      >
        <h2 className="text-base font-semibold leading-7">Name your Studio.</h2>
        <p className="mt-1 text-sm leading-6">
          Only alphanumeric characters (a-z, A-Z, 0-9) are allowed, no spaces.
        </p>
        <div className="mt-10 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
          <div className="col-span-full">
            <div className="grid grid-flow-col auto-cols-fr gap-2">
              <div>
                <label
                  htmlFor="input-label"
                  className="block text-sm font-medium mb-2"
                >
                  Name your Studio
                </label>
                <input
                  type="text"
                  id="name"
                  {...register("name", {
                    required: "This field is required",
                    pattern: {
                      value: /^[a-zA-Z0-9]*$/,
                      message:
                        "Only alphanumeric characters (a-z, A-Z, 0-9) are allowed",
                    },
                  })}
                  className="py-3 px-4 block w-full border-gray-200 rounded-lg text-sm focus:border-blue-500 focus:ring-blue-500 disabled:opacity-50 disabled:pointer-events-none outline-blue-600"
                  placeholder="Your Name"
                />
              </div>
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
