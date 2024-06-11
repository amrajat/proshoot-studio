"use client";
import { useEffect, useState, useTransition } from "react";
import { z } from "zod";
import "@uploadthing/react/styles.css";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import axios from "axios";
import ImageUploadingGuideLines from "@/components/dashboard/studio/ImageUploadingGuideLines";
import CoverPage from "@/components/dashboard/CoverPage";
import Error from "@/components/Error";
import Loader from "@/components/Loader";
import useSWR from "swr";
import { getCredits } from "@/lib/supabase/actions/client";
import { redirect } from "next/navigation";
import { v4 as uuidv4 } from "uuid";
import { UploadDropzone } from "@/components/dashboard/uploadthings";
import { NextSSRPlugin } from "@uploadthing/react/next-ssr-plugin";
import { extractRouterConfig } from "uploadthing/server";
import { ourFileRouter } from "@/app/api/uploadthing/core";

export const maxDuration = 60;

const FormDataSchema = z.object({
  gender: z.string().min(2, "Please select a gender."),
  name: z.string().min(1, "Please enter name."),
  profession: z.union([
    z.enum([
      "Legal",
      "Medical",
      "Financial",
      "Tech",
      "Education",
      "Creative",
      "Business",
      "Health-Wellness",
      "Others",
    ]),
  ]),
  plan: z.union([z.enum(["Basic", "Standard", "Premium", "Pro"])]),
});

const steps = [
  {
    id: "Step 1",
    name: "Studio Information",
    fields: ["gender", "name", "plan", "profession"], // Add more form fields if you have
  },
  {
    id: "Step 2",
    name: "Upload Images",
    fields: ["file"],
  },
  { id: "Step 3", name: "Studio Completion" },
];

export default function CreateStudio() {
  const [previousStep, setPreviousStep] = useState(0);
  const [currentStep, setCurrentStep] = useState(0);
  const [studioSuccess, setStudioSuccess] = useState(false);
  const [isPending, startTransition] = useTransition();

  const delta = currentStep - previousStep;
  const [images, setImages] = useState(null);
  const [imageError, setImageError] = useState(null);
  const [sharingPermission, setSharingPermission] = useState(false);

  useEffect(() => {
    setImages((prev) => prev);
    setStudioSuccess((res) => res);
    setImageError((res) => res);
  }, [images, studioSuccess, setImageError]);

  const {
    register,
    handleSubmit,
    trigger,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(FormDataSchema),
  });

  // Fetch Credits and User Id before allow customer to create studio.

  async function fetcher() {
    try {
      const [{ credits }] = await getCredits();
      return credits;
    } catch (error) {
      throw new Error(error.message || "Unable to fetch credits");
    }
  }

  let {
    data: credits,
    error: creditsError,
    isLoading,
  } = useSWR("credits", fetcher);
  if (isLoading) return <Loader />;
  if (!credits)
    return (
      <CoverPage
        title={"Zero Studio Credits."}
        buttonLink={"/dashboard/studio/buy"}
        buttonText={"Buy Studio"}
      >
        You don&apos;t have any credits to create studio please purchase any
        plan first.
      </CoverPage>
    );

  if (!Object.values(credits).some((count) => count > 0))
    return (
      <CoverPage
        title={"Zero Studio Credits."}
        buttonLink={"/dashboard/studio/buy"}
        buttonText={"Buy Studio"}
      >
        You don&apos;t have any credits to create studio please purchase any
        plan first.
      </CoverPage>
    );
  const order = ["Basic", "Standard", "Premium", "Pro"];

  const sortedCredits = Object.entries(credits).sort(
    ([aKey], [bKey]) => order.indexOf(aKey) - order.indexOf(bKey)
  );

  const processForm = async (data) => {
    startTransition(async () => {
      const formData = new FormData();
      images.forEach((file, i) => {
        formData.append("tune[image_urls][]", file);
      });

      formData.append("tune[name]", data.gender);
      formData.append("name", data.name);
      formData.append("credits", JSON.stringify(credits));
      formData.append("plan", data.plan);
      formData.append("cover", images[0]);
      formData.append("sharing_permission", sharingPermission);

      // ADD TRY AND CATCH HERE.

      const response = await axios.post(
        "/dashboard/studio/create/upload",
        formData
      );

      console.log(response.data);

      if (response?.data?.success) {
        setStudioSuccess(true);
        redirect("/dashboard/studio/" + response?.data?.tune_id);
      }
      if (!response?.data?.success) {
        setStudioSuccess(false);
      }
    });
  };

  const next = async () => {
    const fields = steps[currentStep].fields;
    const output = await trigger(fields, { shouldFocus: true });

    if (!output) return;

    if (currentStep < steps.length - 1) {
      if (currentStep === steps.length - 2) {
        await handleSubmit(processForm)();
      }
      setPreviousStep(currentStep);
      setCurrentStep((step) => step + 1);
    }
  };

  const prev = () => {
    if (currentStep > 0) {
      setPreviousStep(currentStep);
      setCurrentStep((step) => step - 1);
    }
  };

  return (
    <>
      <NextSSRPlugin routerConfig={extractRouterConfig(ourFileRouter)} />
      <section
        className={`inset-0 flex flex-col justify-between} ${
          isPending ? "hidden" : ""
        }`}
      >
        {/* steps */}
        <nav aria-label="Progress">
          <ol
            role="list"
            className="space-y-4 md:flex md:space-x-8 md:space-y-0"
          >
            {steps.map((step, index) => (
              <li key={step.name} className="md:flex-1">
                {currentStep > index ? (
                  <div className="group flex w-full flex-col border-l-4 border-sky-600 py-2 pl-4 transition-colors md:border-l-0 md:border-t-4 md:pb-0 md:pl-0 md:pt-4">
                    <span className="text-sm font-medium text-sky-600 transition-colors ">
                      {step.id}
                    </span>
                    <span className="text-sm font-medium">{step.name}</span>
                  </div>
                ) : currentStep === index ? (
                  <div
                    className="flex w-full flex-col border-l-4 border-sky-600 py-2 pl-4 md:border-l-0 md:border-t-4 md:pb-0 md:pl-0 md:pt-4"
                    aria-current="step"
                  >
                    <span className="text-sm font-medium text-sky-600">
                      {step.id}
                    </span>
                    <span className="text-sm font-medium">{step.name}</span>
                  </div>
                ) : (
                  <div className="group flex w-full flex-col border-l-4 border-gray-200 py-2 pl-4 transition-colors md:border-l-0 md:border-t-4 md:pb-0 md:pl-0 md:pt-4">
                    <span className="text-sm font-medium text-gray-500 transition-colors">
                      {step.id}
                    </span>
                    <span className="text-sm font-medium">{step.name}</span>
                  </div>
                )}
              </li>
            ))}
          </ol>
        </nav>

        {/* Form */}
        <form
          className="mt-12 py-12"
          onSubmit={handleSubmit(processForm)}
          encType="multipart/form-data"
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
            }
          }}
        >
          {currentStep === 0 && (
            <fieldset disabled={isPending}>
              <div>
                <h2
                  className="text-base font-semibold leading-7 text-gray-800
        dark:text-gray-200"
                >
                  Personal Information
                </h2>
                <p
                  className="mt-1 text-sm leading-6 text-gray-800
        dark:text-gray-200"
                >
                  Provide your personal details. this will help us better fine
                  tuning the model for best results.
                </p>
                <div className="mt-10 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
                  {/* Select Plan Starts Here */}
                  <div className="col-span-full">
                    <div className="grid grid-cols-4 gap-3">
                      {sortedCredits.map(([PlanName, RemainingCredits]) => {
                        return (
                          <label
                            key={uuidv4()}
                            htmlFor={PlanName}
                            className="relative py-3 px-4 flex border-2 border-transparent rounded-lg cursor-pointer focus:outline-none"
                          >
                            <input
                              disabled={Number(RemainingCredits) <= 0}
                              type="radio"
                              id={PlanName}
                              value={PlanName}
                              // checked={Number(RemainingCredits > 0)}
                              defaultChecked={Number(RemainingCredits > 0)}
                              {...register("plan")}
                              className="peer absolute top-0 start-0 w-full h-full bg-transparent border border-gray-300 rounded-lg cursor-pointer appearance-none focus:ring-white checked:border-2 checked:border-blue-600 checked:hover:border-blue-600 checked:focus:border-blue-600 checked:bg-none checked:text-transparent disabled:opacity-50 pointer-events-none dark:border-neutral-700 dark:checked:border-blue-500 dark:focus:ring-neutral-800 dark:focus:ring-offset-neutral-800

                            before:content-[''] before:top-3.5 before:start-3.5  before:border-blue-600 before:h-5 before:rounded-full dark:before:border-neutral-700"
                              name="credits"
                            />

                            <span className="w-full">
                              <span className="block font-normal text-blue-600 dark:text-neutral-200">
                                {PlanName}
                              </span>

                              <span className="block text-xs leading-relaxed text-blue-600 dark:text-neutral-500 mt-1">
                                {RemainingCredits} available.
                              </span>
                            </span>
                          </label>
                        );
                      })}
                    </div>
                    <div className="mt-2">
                      {errors.plan?.message && (
                        <p className="mt-2 text-sm text-red-400">
                          {errors.plan.message}
                        </p>
                      )}
                    </div>
                  </div>
                  {/* Select Plan Ends Here */}
                  <div className="sm:col-span-3">
                    {/* Select */}
                    <div className="relative">
                      <select
                        className="py-3 px-4 pe-9 block w-full border-gray-200 rounded-lg text-sm focus:border-blue-500 focus:ring-blue-500 disabled:opacity-50 disabled:pointer-events-none dark:bg-slate-900 dark:border-gray-700 dark:text-gray-400 dark:focus:ring-gray-600"
                        {...register("gender")}
                        id="gender"
                      >
                        <option value="">Choose gender</option>
                        <option value="woman">Woman</option>
                        <option value="man">Man</option>
                      </select>
                    </div>
                    {/* End Select */}

                    <div className="mt-2">
                      {errors.gender?.message && (
                        <p className="mt-2 text-sm text-red-400">
                          {errors.gender.message}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="sm:col-span-3">
                    <div className="relative">
                      <select
                        className="py-3 px-4 pe-9 block w-full border-gray-200 rounded-lg text-sm focus:border-blue-500 focus:ring-blue-500 disabled:opacity-50 disabled:pointer-events-none dark:bg-slate-900 dark:border-gray-700 dark:text-gray-400 dark:focus:ring-gray-600"
                        {...register("profession")}
                        id="profession"
                      >
                        <option value="">Choose your profession.</option>
                        <option value="Legal">Legal</option>
                        <option value="Medical">Medical</option>
                        <option value="Financial">Financial</option>
                        <option value="Tech">Tech</option>
                        <option value="Education">Education</option>
                        <option value="Creative">Creative</option>
                        <option value="Business">Business</option>
                        <option value="Health-Wellness">
                          Health & Wellness
                        </option>
                        <option value="Social-Service">Social-Service</option>
                        <option value="Others">Others</option>
                      </select>
                    </div>

                    <div className="mt-2">
                      {errors.profession?.message && (
                        <p className="mt-2 text-sm text-red-400">
                          {errors.profession.message}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="sm:col-span-3">
                    {/* Select */}
                    <div className="relative">
                      <input
                        type="text"
                        id="name"
                        className="py-3 px-4 pe-9 block w-full border-gray-200 rounded-lg text-sm focus:border-blue-500 focus:ring-blue-500 disabled:opacity-50 disabled:pointer-events-none dark:bg-slate-900 dark:border-gray-700 dark:text-gray-400 dark:focus:ring-gray-600 placeholder-current"
                        {...register("name")}
                        placeholder="Name"
                      />
                    </div>
                    {/* End Select */}

                    <div className="mt-2">
                      {errors.name?.message && (
                        <p className="mt-2 text-sm text-red-400">
                          {errors.name.message}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="text-xs sm:col-span-3 flex justify-start items-center">
                    <div className="sm:col-span-9">
                      <div className="grid space-y-3">
                        <div className="relative flex items-start">
                          <div className="flex items-center h-5 mt-1">
                            <input
                              id="permission"
                              name="permission"
                              type="checkbox"
                              className="border-2 border-gray-200 rounded text-blue-600 focus:ring-blue-500 disabled:opacity-50 disabled:pointer-events-none dark:bg-gray-800 dark:border-gray-700 dark:checked:bg-blue-500 dark:checked:border-blue-500 dark:focus:ring-offset-gray-800"
                              aria-describedby="permission-description"
                              // {...register("sharing_permission")}
                              defaultChecked={sharingPermission}
                              onClick={() =>
                                setSharingPermission((value) => !value)
                              }
                            />
                          </div>
                          <label htmlFor="permission" className="ms-3">
                            <span className="block text-sm font-semibold text-gray-800 dark:text-gray-300">
                              Studio Sharing Permission. Please check, this will
                              help us grow.
                            </span>
                            <span
                              id="permission-description"
                              className="block text-xs text-gray-600 dark:text-gray-500"
                            >
                              If Checked. We may share some/all of generated
                              headshots to our showcase.
                              {/* If Checked. We may share your generated headshots,
                            name, company, and website on our website&apos;s
                            showcase to display real headshots created by our
                            users. This helps potential customers decide if our
                            product meets their expectations. Thank you for your
                            contribution! */}
                            </span>
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </fieldset>
          )}

          {currentStep === 1 && (
            <fieldset disabled={isPending}>
              <div>
                <h2
                  className="text-base font-semibold leading-7text-gray-800
        dark:text-gray-200"
                >
                  Upload Images
                </h2>
                <p
                  className="mt-1 text-sm leading-6 text-gray-800
        dark:text-gray-200"
                >
                  To produce good results, please follow the image uploading
                  guidelines carefully.
                </p>

                <div className="mt-10 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
                  <div className="sm:col-span-full">
                    <ImageUploadingGuideLines />
                  </div>
                  <div className="sm:col-span-full">
                    {/* ImageUploading here. */}

                    <UploadDropzone
                      endpoint="imageUploader"
                      onClientUploadComplete={(files) => {
                        // Do something with the response

                        setImages(files.map((file) => file.url));
                        setStudioSuccess(true);
                        setImageError(null);
                      }}
                      onUploadError={(error) => {
                        // Do something with the error.
                        setImageError(`ERROR! ${error.message}`);
                      }}
                    />
                    <p className="text-red-500 text-center">{imageError}</p>
                  </div>
                </div>
              </div>
            </fieldset>
          )}

          {currentStep === 2 && (
            <>
              <h2
                className="text-base font-semibold leading-7 text-gray-800
        dark:text-gray-200"
              >
                Complete
              </h2>
              <h5 className="mt-1 font-semibold text-gray-900 dark:text-gray-50">
                {isPending && studioSuccess && "Your Studio is being created."}
              </h5>
              <h5 className={"mt-1 font-semibold leading-6 text-red-500"}>
                {!studioSuccess &&
                  !isPending &&
                  "We could not create studio for you, please try again or contact us for support."}
              </h5>
            </>
          )}
        </form>

        {/* Navigation */}
        <div className="mt-8 pt-5">
          <fieldset disabled={isPending}>
            <div className="flex justify-between">
              <button
                type="button"
                onClick={prev}
                disabled={currentStep === 0}
                className="py-2 px-3 inline-flex items-center gap-x-2 text-sm font-normal rounded-lg border border-transparent bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:pointer-events-none dark:focus:outline-none dark:focus:ring-1 dark:focus:ring-gray-600"
              >
                Back
              </button>
              <button
                type="button"
                onClick={next}
                disabled={
                  isPending ||
                  currentStep === steps.length - 1 ||
                  (currentStep === steps.length - 2 && !images)
                }
                className="py-2 px-3 inline-flex items-center gap-x-2 text-sm font-normal rounded-lg border border-transparent bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:pointer-events-none dark:focus:outline-none dark:focus:ring-1 dark:focus:ring-gray-600"
              >
                {isPending ? "Creating" : currentStep === 1 ? "Create" : "Next"}
              </button>
            </div>
          </fieldset>
        </div>
      </section>
    </>
  );
}
