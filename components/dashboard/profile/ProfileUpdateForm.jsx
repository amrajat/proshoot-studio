"use client";
import Image from "next/image";
import {
  getCurrentUserProfile,
  updateCurrentUserProfile,
} from "@/lib/supabase/actions/server";

import { useFormState } from "react-dom";
import useSWR from "swr";
import { useState, useTransition } from "react";

import ToolTip from "@/components/homepage/ToolTip";
import Loader from "@/components/Loader";
import Error from "@/components/Error";

function ProfileUpdateForm({ id }) {
  //  Form Validation
  const initialState = {
    message: "",
  };
  const [isUpdating, setIsUpdating] = useState(false);
  const [state, formAction] = useFormState(updateUser, initialState);
  const [pending, startTransaction] = useTransition();

  const fetcher = async () => {
    try {
      if (!id) return null;
      const [userData] = await getCurrentUserProfile(id);
      return userData;
    } catch (error) {
      throw new Error("Failed to fetch user profile");
    }
  };

  const {
    data: user,
    error,
    isValidating,
    isLoading,
  } = useSWR(id ? ["getUserProfile", id] : null, fetcher, {
    revalidateOnFocus: false, // Revalidate data when window gets focused
    onErrorRetry: (error, key, config, revalidate, { retryCount }) => {
      console.log(`Retrying to fetch data... (attempt ${retryCount})`);
      if (retryCount >= 3) {
        console.error("Max retry count reached, giving up");
        return;
      }
      setTimeout(() => revalidate({ retryCount }), 1000); // Retry after 1 second
    },
  });

  if (error) return <Error message="Failed to fetch user profile" />;
  if (!user && !isValidating) return <Error message="No user profile found" />;
  if (!user || isValidating || isLoading) return <Loader />;

  //FIXME: delete previous profile image before uploading new one.

  async function updateUser(prevState, formData) {
    // TODO: server validation goes here.
    try {
      await updateCurrentUserProfile(formData);
    } catch (error) {
    } finally {
    }
  }

  return (
    <form action={(formData) => startTransaction(() => formAction(formData))}>
      {/* Grid */}
      <div className="grid sm:grid-cols-12 gap-2 sm:gap-6">
        <div className="sm:col-span-3">
          <label className="inline-block text-sm text-gray-800 mt-2.5 dark:text-gray-200">
            Profile Photo
          </label>
          <ToolTip />
        </div>
        {/* End Col */}
        <div className="sm:col-span-9">
          <div className="flex items-center gap-5">
            <Image
              className="inline-block h-16 w-16 rounded-full ring-2 ring-white dark:ring-gray-800"
              src={user?.avatar ? user.avatar : "/default-user.jpg"}
              alt="avatar"
              height={256}
              width={256}
            />
            <div className="flex gap-x-2">
              <div>
                <label className="block">
                  <span className="sr-only">Choose profile photo</span>
                  <input
                    type="file"
                    name="avatar"
                    accept="image/*"
                    className="block w-full text-sm text-gray-500 file:me-4 file:py-2 file:px-4 file:rounded-lg file:border-0
file:text-sm file:font-semibold
file:bg-blue-600 file:text-white
hover:file:bg-blue-700
file:disabled:opacity-50 file:disabled:pointer-events-none
dark:file:bg-blue-500
dark:hover:file:bg-blue-400
    "
                  />
                </label>
              </div>
            </div>
          </div>
        </div>
        {/* FullName Start */}
        <div className="sm:col-span-3">
          <label
            htmlFor="name"
            className="inline-block text-sm text-gray-800 mt-2.5 dark:text-gray-200"
          >
            Full Name
          </label>
          <ToolTip />
        </div>
        <div className="sm:col-span-9">
          <div className="sm:flex">
            <input
              id="f_name"
              type="text"
              className="py-2 px-3 pe-11 block w-full border-gray-200 shadow-sm -mt-px -ms-px first:rounded-t-lg last:rounded-b-lg sm:first:rounded-s-lg sm:mt-0 sm:first:ms-0 sm:first:rounded-se-none sm:last:rounded-es-none sm:last:rounded-e-lg text-sm relative focus:z-10 focus:border-blue-500 focus:ring-blue-500 disabled:opacity-50 disabled:pointer-events-none dark:bg-slate-900 dark:border-gray-700 dark:text-gray-400 dark:focus:ring-gray-600"
              placeholder="First name"
              name="f_name"
              defaultValue={user?.f_name}
            />
            <input
              id="l_name"
              type="text"
              className="py-2 px-3 pe-11 block w-full border-gray-200 shadow-sm -mt-px -ms-px first:rounded-t-lg last:rounded-b-lg sm:first:rounded-s-lg sm:mt-0 sm:first:ms-0 sm:first:rounded-se-none sm:last:rounded-es-none sm:last:rounded-e-lg text-sm relative focus:z-10 focus:border-blue-500 focus:ring-blue-500 disabled:opacity-50 disabled:pointer-events-none dark:bg-slate-900 dark:border-gray-700 dark:text-gray-400 dark:focus:ring-gray-600"
              placeholder="Last name"
              name="l_name"
              defaultValue={user?.l_name}
            />
          </div>
        </div>
        {/* FullName End */}

        {/* Company / Position Start */}
        <div className="sm:col-span-3">
          <label
            htmlFor="company-position"
            className="inline-block text-sm text-gray-800 mt-2.5 dark:text-gray-200"
          >
            Company / Position
          </label>
          <ToolTip />
        </div>
        <div className="sm:col-span-9">
          <div className="sm:flex">
            <input
              id="company"
              type="text"
              className="py-2 px-3 pe-11 block w-full border-gray-200 shadow-sm -mt-px -ms-px first:rounded-t-lg last:rounded-b-lg sm:first:rounded-s-lg sm:mt-0 sm:first:ms-0 sm:first:rounded-se-none sm:last:rounded-es-none sm:last:rounded-e-lg text-sm relative focus:z-10 focus:border-blue-500 focus:ring-blue-500 disabled:opacity-50 disabled:pointer-events-none dark:bg-slate-900 dark:border-gray-700 dark:text-gray-400 dark:focus:ring-gray-600"
              placeholder="Acme Corporation"
              name="company"
              defaultValue={user?.company}
            />
            <input
              id="position"
              type="text"
              className="py-2 px-3 pe-11 block w-full border-gray-200 shadow-sm -mt-px -ms-px first:rounded-t-lg last:rounded-b-lg sm:first:rounded-s-lg sm:mt-0 sm:first:ms-0 sm:first:rounded-se-none sm:last:rounded-es-none sm:last:rounded-e-lg text-sm relative focus:z-10 focus:border-blue-500 focus:ring-blue-500 disabled:opacity-50 disabled:pointer-events-none dark:bg-slate-900 dark:border-gray-700 dark:text-gray-400 dark:focus:ring-gray-600"
              placeholder="CEO & Founder"
              name="position"
              defaultValue={user?.position}
            />
          </div>
        </div>
        {/* Company / Position End */}

        {/* Website Start */}
        <div className="sm:col-span-3">
          <label
            htmlFor="website"
            className="inline-block text-sm text-gray-800 mt-2.5 dark:text-gray-200"
          >
            Website
          </label>
          <ToolTip />
        </div>
        <div className="sm:col-span-9">
          <input
            id="website"
            type="text"
            className="py-2 px-3 pe-11 block w-full border-gray-200 shadow-sm text-sm rounded-lg focus:border-blue-500 focus:ring-blue-500 disabled:opacity-50 disabled:pointer-events-none dark:bg-slate-900 dark:border-gray-700 dark:text-gray-400 dark:focus:ring-gray-600"
            placeholder="acme.org"
            name="website"
            defaultValue={user?.website}
          />
        </div>

        <div className="sm:col-span-3">
          <label
            htmlFor="email"
            className="inline-block text-sm text-gray-800 mt-2.5 dark:text-gray-200"
          >
            Email
          </label>
        </div>
        <div className="sm:col-span-9">
          <input
            id="email"
            type="email"
            className="py-2 px-3 pe-11 block w-full border-gray-200 shadow-sm text-sm rounded-lg focus:border-blue-500 focus:ring-blue-500 disabled:opacity-50 disabled:pointer-events-none dark:bg-slate-900 dark:border-gray-700 dark:text-gray-400 dark:focus:ring-gray-600"
            placeholder={user?.email}
            name="email"
            disabled
          />
        </div>

        {/* Website End */}
        {/* X Username Start */}

        <div className="sm:col-span-3">
          <label
            htmlFor="x_username"
            className="inline-block text-sm text-gray-800 mt-2.5 dark:text-gray-200"
          >
            X Username
          </label>
        </div>
        <div className="sm:col-span-9">
          <input
            id="x_username"
            type="text"
            className="py-2 px-3 pe-11 block w-full border-gray-200 shadow-sm text-sm rounded-lg focus:border-blue-500 focus:ring-blue-500 disabled:opacity-50 disabled:pointer-events-none dark:bg-slate-900 dark:border-gray-700 dark:text-gray-400 dark:focus:ring-gray-600"
            placeholder="@elonmusk"
            name="x_username"
            defaultValue={user?.x_username}
          />
        </div>

        {/* X Username End */}

        {/* Permission Start */}

        <div className="sm:col-span-3">
          <label
            htmlFor="permission"
            className="inline-block text-sm text-gray-800 mt-2.5 dark:text-gray-200"
          >
            Permission
          </label>
          <ToolTip />
        </div>
        <div className="sm:col-span-9">
          <div className="grid space-y-3">
            <div className="relative flex items-start">
              <div className="flex items-center h-5 mt-1">
                <input
                  id="permission"
                  name="permission"
                  type="checkbox"
                  className="border-gray-200 rounded text-blue-600 focus:ring-blue-500 disabled:opacity-50 disabled:pointer-events-none dark:bg-gray-800 dark:border-gray-700 dark:checked:bg-blue-500 dark:checked:border-blue-500 dark:focus:ring-offset-gray-800"
                  aria-describedby="permission-description"
                  defaultChecked={user?.permission}
                />
              </div>
              <label htmlFor="permission" className="ms-3">
                <span className="block text-sm font-semibold text-gray-800 dark:text-gray-300">
                  Please Check
                </span>
                <span
                  id="permission-description"
                  className="block text-xs text-gray-600 dark:text-gray-500"
                >
                  If Checked. We may share your generated headshots, name,
                  company, and website on our website&apos;s showcase to display
                  real headshots created by our users. This helps potential
                  customers decide if our product meets their expectations.
                  Thank you for your contribution!
                </span>
              </label>
            </div>
          </div>
        </div>
        {/* Permission End */}
      </div>
      {/* End Grid */}
      {/* START RESET AND SAVE CHANGES BUTTON */}
      <div className="mt-5 flex justify-end gap-x-2">
        {/* <button
          type="button"
          className="py-2 px-3 inline-flex items-center gap-x-2 text-sm font-medium rounded-lg border border-gray-200 bg-white text-gray-800 shadow-sm hover:bg-gray-50 disabled:opacity-50 disabled:pointer-events-none dark:bg-slate-900 dark:border-gray-700 dark:text-white dark:hover:bg-gray-800 dark:focus:outline-none dark:focus:ring-1 dark:focus:ring-gray-600"
        >
          Reset
        </button> */}
        <button
          type="submit"
          className="py-2 px-3 inline-flex items-center gap-x-2 text-sm font-semibold rounded-lg border border-transparent bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:pointer-events-none dark:focus:outline-none dark:focus:ring-1 dark:focus:ring-gray-600"
          disabled={isUpdating}
        >
          {pending ? "Saving" : "Save changes"}
        </button>
      </div>
      {/* START RESET AND SAVE CHANGES BUTTON */}
    </form>
  );
}

export default ProfileUpdateForm;
