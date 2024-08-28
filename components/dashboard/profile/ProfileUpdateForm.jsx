"use client";
import Image from "next/image";
import {
  getCurrentUserProfile,
  updateCurrentUserProfile,
} from "@/lib/supabase/actions/server";

import { useFormState } from "react-dom";
import useSWR from "swr";
import { useState, useTransition } from "react";

import Loader from "@/components/Loader";
import Error from "@/components/Error";
import { figtree } from "@/lib/utils";

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
    mutate,
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

  async function updateUser(prevState, formData) {
    // TODO: server validation goes here.
    try {
      await updateCurrentUserProfile(formData, user.id);
      mutate();
    } catch (error) {
      console.log(error);
    }
  }

  return (
    <form action={(formData) => startTransaction(() => formAction(formData))}>
      {/* Grid */}
      <div className="grid sm:grid-cols-12 gap-2 sm:gap-6">
        {/* FullName Start */}
        <div className="sm:col-span-3">
          <label htmlFor="name" className="inline-block text-sm mt-2.5 ">
            Full Name
          </label>
        </div>
        <div className="sm:col-span-9">
          <div className="sm:flex">
            <input
              id="f_name"
              type="text"
              className="py-2 px-3 pe-11 block w-full border-2 border-gray-200 shadow-sm -mt-px -ms-px first:rounded-t last:rounded-b sm:first:rounded-s sm:mt-0 sm:first:ms-0 sm:first:rounded-se-none sm:last:rounded-es-none sm:last:rounded-e text-sm relative focus:z-10 focus:border-blue-500 focus:ring-blue-500 disabled:opacity-50 disabled:pointer-events-none    "
              placeholder="First name"
              name="f_name"
              defaultValue={user.metadata.f_name}
            />
            <input
              id="l_name"
              type="text"
              className="py-2 px-3 pe-11 block w-full border-2 border-gray-200 shadow-sm -mt-px -ms-px first:rounded-t last:rounded-b sm:first:rounded-s sm:mt-0 sm:first:ms-0 sm:first:rounded-se-none sm:last:rounded-es-none sm:last:rounded-e text-sm relative focus:z-10 focus:border-blue-500 focus:ring-blue-500 disabled:opacity-50 disabled:pointer-events-none    "
              placeholder="Last name"
              name="l_name"
              defaultValue={user.metadata.l_name}
            />
          </div>
        </div>
        {/* FullName End */}

        {/* Company / Position Start */}
        <div className="sm:col-span-3">
          <label
            htmlFor="company-position"
            className="inline-block text-sm mt-2.5 "
          >
            Company / Position
          </label>
        </div>
        <div className="sm:col-span-9">
          <div className="sm:flex">
            <input
              id="company"
              type="text"
              className="py-2 px-3 pe-11 block w-full border-2 border-gray-200 shadow-sm -mt-px -ms-px first:rounded-t last:rounded-b sm:first:rounded-s sm:mt-0 sm:first:ms-0 sm:first:rounded-se-none sm:last:rounded-es-none sm:last:rounded-e text-sm relative focus:z-10 focus:border-blue-500 focus:ring-blue-500 disabled:opacity-50 disabled:pointer-events-none    "
              placeholder="Acme Corporation"
              name="company"
              defaultValue={user.metadata.company}
            />
            <input
              id="position"
              type="text"
              className="py-2 px-3 pe-11 block w-full border-2 border-gray-200 shadow-sm -mt-px -ms-px first:rounded-t last:rounded-b sm:first:rounded-s sm:mt-0 sm:first:ms-0 sm:first:rounded-se-none sm:last:rounded-es-none sm:last:rounded-e text-sm relative focus:z-10 focus:border-blue-500 focus:ring-blue-500 disabled:opacity-50 disabled:pointer-events-none    "
              placeholder="CEO & Founder"
              name="position"
              defaultValue={user.metadata.position}
            />
          </div>
        </div>
        {/* Company / Position End */}

        {/* Website Start */}
        <div className="sm:col-span-3">
          <label htmlFor="website" className="inline-block text-sm mt-2.5 ">
            Website
          </label>
        </div>
        <div className="sm:col-span-9">
          <input
            id="website"
            type="text"
            className="py-2 px-3 pe-11 block w-full border-2 border-gray-200 shadow-sm text-sm rounded focus:border-blue-500 focus:ring-blue-500 disabled:opacity-50 disabled:pointer-events-none    "
            placeholder="acme.org"
            name="website"
            defaultValue={user.metadata.website}
          />
        </div>

        <div className="sm:col-span-3">
          <label htmlFor="email" className="inline-block text-sm mt-2.5 ">
            Email
          </label>
        </div>
        <div className="sm:col-span-9">
          <input
            id="email"
            type="email"
            className="py-2 px-3 pe-11 block w-full border-2 border-gray-200 shadow-sm text-sm rounded focus:border-blue-500 focus:ring-blue-500 disabled:opacity-50 disabled:pointer-events-none    "
            placeholder={user?.email}
            name="email"
            disabled
          />
        </div>

        {/* Website End */}
        {/* X Username Start */}

        <div className="sm:col-span-3">
          <label htmlFor="x_username" className="inline-block text-sm mt-2.5 ">
            X Username
          </label>
        </div>
        <div className="sm:col-span-9">
          <input
            id="x_username"
            type="text"
            className="py-2 px-3 pe-11 block w-full border-2 border-gray-200 shadow-sm text-sm rounded focus:border-blue-500 focus:ring-blue-500 disabled:opacity-50 disabled:pointer-events-none    "
            placeholder="@elonmusk"
            name="x_username"
            defaultValue={user.metadata.x_username}
          />
        </div>

        {/* X Username End */}
        {/* Linkedin Username Start */}

        <div className="sm:col-span-3">
          <label
            htmlFor="linkedin_username"
            className="inline-block text-sm mt-2.5 "
          >
            LinkedIn Username
          </label>
        </div>
        <div className="sm:col-span-9">
          <input
            id="linkedin_username"
            type="text"
            className="py-2 px-3 pe-11 block w-full border-2 border-gray-200 shadow-sm text-sm rounded focus:border-blue-500 focus:ring-blue-500 disabled:opacity-50 disabled:pointer-events-none    "
            placeholder="linkedin username"
            name="linkedin_username"
            defaultValue={user.metadata.linkedin_username}
          />
        </div>

        {/* Linkedin Username End */}
        {/* Instagram Username Start */}

        <div className="sm:col-span-3">
          <label
            htmlFor="instagram_username"
            className="inline-block text-sm mt-2.5 "
          >
            Instagram Username
          </label>
        </div>
        <div className="sm:col-span-9">
          <input
            id="instagram_username"
            type="text"
            className="py-2 px-3 pe-11 block w-full border-2 border-gray-200 shadow-sm text-sm rounded focus:border-blue-500 focus:ring-blue-500 disabled:opacity-50 disabled:pointer-events-none    "
            placeholder="your IG handle"
            name="instagram_username"
            defaultValue={user.metadata.instagram_username}
          />
        </div>

        {/* Instagram Username End */}
      </div>
      {/* End Grid */}
      {/* START RESET AND SAVE CHANGES BUTTON */}
      <div className="mt-5 flex justify-end gap-x-2">
        <button
          type="submit"
          className={
            figtree.className +
            " py-2 px-3 inline-flex items-center gap-x-2 text-sm font-semibold rounded border border-transparent bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:pointer-events-none   "
          }
          disabled={isUpdating}
        >
          {pending ? "Saving" : "Save Changes"}
        </button>
      </div>
      {/* START RESET AND SAVE CHANGES BUTTON */}
    </form>
  );
}

export default ProfileUpdateForm;
