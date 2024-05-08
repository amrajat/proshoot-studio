"use client";
import { useEffect, useState, useTransition } from "react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import axios from "axios";
import PreviewThumbnail from "@/components/dashboard/studio/PreviewThumbnail";
import ImageUploadingGuideLines from "@/components/dashboard/studio/ImageUploadingGuideLines";
import CoverPage from "@/components/dashboard/CoverPage";
import { IoTrashBin } from "react-icons/io5";
import Error from "@/components/Error";
import Loader from "@/components/Loader";
import useSWR from "swr";
import { getCredits } from "@/lib/supabase/actions/client";
import { redirect } from "next/navigation";
import { v4 as uuidv4 } from "uuid";
import Script from "next/script";
// import fetch from "node-fetch";
export const maxDuration = 300;
// TODO: ADD IMAGE VALIDATION LATER, WITH ALL THE CHECKS SUCH AS NUM. OF MIN/MAX IMAGES. REDO UPLOAD, DELETE IMAGE...MAX SIZE
// FIXME: FORMS SHOULD NOT BE FILLED IF KEY PRESS IS ENTER ON CURRENT STEP, WITHOUT COMPLETING STEP 2.

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
  const [images, setImages] = useState([]);
  const [imageError, setImageError] = useState([false, false]);
  const MIN_NUMBER_IMAGE_UPLOAD = 3;
  const MAX_NUMBER_IMAGE_UPLOAD = 50;
  const MAX_IMAGE_SIZE = 1024 * 1024 * 5; // 5MB

  useEffect(() => {
    // setStudioSuccess(true);
  }, [studioSuccess]);

  const {
    register,
    handleSubmit,
    watch,
    reset,
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

  // if (sessionError) return <Error message="Failed to fetch session" />;
  // if (isLoadingSession) return <Loader />;

  // if (creditsError) return <Error message="Failed to fetch user profile" />;
  // if (!credits || isLoadingCredits) return <Loader />;

  // Fetching credits and user id ends here.

  // fetch data for credits above.

  const handleFileSelected = (e) => {
    if (e.target.files) {
      //convert `FileList` to `File[]`
      const _files = Array.from(e.target.files);
      setImages((prevImages) => [...prevImages, ..._files]);
    }
  };

  const onRemoveImage = (index, e) => {
    event.preventDefault();
    setImages((prevImages) => {
      const updatedImages = [...prevImages];
      updatedImages.splice(index, 1);
      return updatedImages;
    });
  };

  const processForm = async (data) => {
    startTransition(async () => {
      const formData = new FormData();
      images.forEach((file, i) => {
        formData.append("tune[images][]", file);
      });

      formData.append("tune[name]", data.gender);
      formData.append("name", data.name);
      formData.append("credits", JSON.stringify(credits));
      formData.append("plan", data.plan);

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
      <h2 class={`text-2xl dark:text-white ${isPending ? "" : "hidden"}`}>
        Please wait! your Studio is being created...
      </h2>
      {}

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
          onKeyPress={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
            }
          }}
        >
          {currentStep === 0 && (
            <fieldset disabled={isPending}>
              <div>
                <h2 className="text-base font-semibold leading-7 text-gray-900">
                  Personal Information
                </h2>
                <p className="mt-1 text-sm leading-6 text-gray-600">
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
                            {/* <span className="peer-checked:flex hidden absolute top-4 end-4">
                              <span className="block w-5 h-5 flex justify-center items-center rounded-full bg-blue-600">
                                <HiCheck
                                  className="flex-shrink-0 w-3 h-3 text-white"
                                  width={24}
                                  height={24}
                                />
                              </span>
                            </span> */}
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
                    {/* {Object.entries(credits).map(([creditType, creditCount]) => (
                    <div key={creditType}>
                      <input
                        type="radio"
                        id={creditType}
                        name="creditType"
                        value={creditType}
                        // checked={selectedCredit === creditType}
                        // onChange={() => onCreditChange(creditType)}
                      />
                      <label htmlFor={creditType}>
                        {creditType} ({creditCount})
                      </label>
                    </div>
                  ))} */}
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

                  {/* <div className="sm:col-span-3">
                  <input
                    type="number"
                    id="age"
                    {...register("age")}
                    className="py-3 px-4 block w-full border-gray-200 rounded-lg text-sm focus:border-blue-500 focus:ring-blue-500 disabled:opacity-50 disabled:pointer-events-none dark:bg-slate-900 dark:border-gray-700 dark:text-gray-400 dark:focus:ring-gray-600 placeholder-current"
                    placeholder="Please enter your age"
                  />

                  <div className="mt-2">
                    {errors.age?.message && (
                      <p className="mt-2 text-sm text-red-400">
                        {errors.age.message}
                      </p>
                    )}
                  </div>
                </div> */}

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

                  {/* <div className="sm:col-span-3">
                  <div className="relative">
                    <select
                      className="py-3 px-4 pe-9 block w-full border-gray-200 rounded-lg text-sm focus:border-blue-500 focus:ring-blue-500 disabled:opacity-50 disabled:pointer-events-none dark:bg-slate-900 dark:border-gray-700 dark:text-gray-400 dark:focus:ring-gray-600"
                      {...register("hair")}
                      id="hair-color"
                    >
                      <option value="">Choose hair color</option>
                      <option value="black">Black</option>
                      <option value="brown">Brown</option>
                      <option value="dark-brown">Dark Brown</option>
                      <option value="light-brown">Light Brown</option>
                      <option value="blonde">Blonde</option>
                      <option value="golden-blonde">Golden Blonde</option>
                      <option value="strawberry-blonde">
                        Strawberry Blonde
                      </option>
                      <option value="red">Red</option>
                      <option value="auburn">Auburn</option>
                      <option value="chestnut">Chestnut</option>
                      <option value="gray">Gray</option>
                      <option value="white">White</option>
                      <option value="salt-and-pepper">Salt and Pepper</option>
                      <option value="blue-gray">Blue/Gray</option>
                      <option value="ash-brown">Ash Brown</option>
                      <option value="dark-red">Dark Red</option>
                      <option value="caramel-brown">Caramel Brown</option>
                      <option value="honey-blonde">Honey Blonde</option>
                      <option value="other">Other</option>
                    </select>
                  </div>

                  <div className="mt-2">
                    {errors.hair?.message && (
                      <p className="mt-2 text-sm text-red-400">
                        {errors.hair.message}
                      </p>
                    )}
                  </div>
                </div> */}

                  {/* <div className="sm:col-span-3">
                  <div className="relative">
                    <select
                      className="py-3 px-4 pe-9 block w-full border-gray-200 rounded-lg text-sm focus:border-blue-500 focus:ring-blue-500 disabled:opacity-50 disabled:pointer-events-none dark:bg-slate-900 dark:border-gray-700 dark:text-gray-400 dark:focus:ring-gray-600"
                      {...register("ethnicity")}
                      id="ethnicity"
                    >
                      <option value="">Choose ethnicity</option>
                      <option value="caucasian">
                        Caucasian (United States, United Kingdom)
                      </option>
                      <option value="african-american">
                        African American (United States)
                      </option>
                      <option value="hispanic-latino">
                        Hispanic/Latino (Mexico, Brazil)
                      </option>
                      <option value="asian">Asian (China, Japan)</option>
                      <option value="middle-eastern">
                        Middle Eastern (Saudi Arabia, Iran, and more)
                      </option>
                      <option value="south-asian">
                        South Asian (India, Pakistan)
                      </option>
                      <option value="native-american">
                        Native American (United States, Canada, and more)
                      </option>
                      <option value="pacific-islander">
                        Pacific Islander (Fiji, Samoa, and more)
                      </option>
                      <option value="black-caribbean">
                        Black Caribbean (Jamaica, Haiti, and more)
                      </option>
                      <option value="european">
                        European (France, Germany, and more)
                      </option>
                      <option value="east-african">
                        East African (Kenya, Ethiopia, and more)
                      </option>
                      <option value="west-african">
                        West African (Nigeria, Ghana, and more)
                      </option>
                      <option value="caribbean">
                        Caribbean (Trinidad and Tobago, Barbados, and more)
                      </option>
                      <option value="latin-american">
                        Latin American (Argentina, Colombia, and more)
                      </option>
                      <option value="central-asian">
                        Central Asian (Kazakhstan, Uzbekistan, and more)
                      </option>
                      <option value="southeast-asian">
                        Southeast Asian (Thailand, Vietnam, and more)
                      </option>
                      <option value="polynesian">
                        Polynesian (Hawaii, Tonga, and more)
                      </option>
                      <option value="maori">
                        Maori (New Zealand, and more)
                      </option>
                      <option value="inuit">
                        Inuit (Canada, Greenland, and more)
                      </option>
                      <option value="melanesian">
                        Melanesian (Papua New Guinea, Vanuatu, and more)
                      </option>
                      <option value="arab">
                        Arab (Lebanon, Iraq, and more)
                      </option>
                      <option value="jewish">Jewish (Israel, and more)</option>
                      <option value="roma">
                        Roma (Spain, Romania, and more)
                      </option>
                      <option value="afro-latinx">
                        Afro-Latinx (Dominican Republic, Cuba, and more)
                      </option>
                      <option value="biracial">Biracial</option>
                      <option value="multiracial">Multiracial</option>
                      <option value="other">Other</option>
                    </select>
                  </div>

                  <div className="mt-2">
                    {errors.ethnicity?.message && (
                      <p className="mt-2 text-sm text-red-400">
                        {errors.ethnicity.message}
                      </p>
                    )}
                  </div>
                </div> */}

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
                    <p>
                      You can name your studio anything.for simplicity just use
                      your name.
                    </p>
                  </div>
                </div>
              </div>
            </fieldset>
          )}

          {currentStep === 1 && (
            <fieldset disabled={isPending}>
              <div>
                <h2 className="text-base font-semibold leading-7 text-gray-900">
                  Upload Images
                </h2>
                <p className="mt-1 text-sm leading-6 text-gray-600">
                  Provide your high quality images.
                </p>

                <div className="mt-10 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
                  <div className="sm:col-span-full">
                    To produce good results, please follow the image uploading
                    guidelines carefully.
                  </div>
                  <div className="sm:col-span-full">
                    <ImageUploadingGuideLines />
                  </div>
                  <div className="sm:col-span-full">
                    {/* ImageUploading here. */}
                    <div className="flex justify-between items-center">
                      <input
                        type="file"
                        multiple
                        accept="image/png, image/jpeg"
                        onChange={handleFileSelected}
                        className="file:bg-violet-50 file:text-violet-500 hover:file:bg-violet-100
                      file:rounded-lg file:rounded-tr-none file:rounded-br-none
                      file:px-4 file:py-2 file:mr-4 file:border-none hover:cursor-pointer border rounded-lg text-gray-400"
                      />
                      <div>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            setImages([]);
                          }}
                        >
                          <span className="inline-flex items-center gap-x-1.5 py-1.5 px-3 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-800/30 dark:text-red-500">
                            <IoTrashBin />
                            All Images
                          </span>
                        </button>
                      </div>
                    </div>

                    <PreviewThumbnail
                      images={images}
                      onRemoveImage={onRemoveImage}
                      imageError={imageError}
                      setImageError={setImageError}
                      MAX_IMAGE_SIZE={MAX_IMAGE_SIZE}
                    />
                  </div>
                </div>
              </div>
            </fieldset>
          )}

          {currentStep === 2 && (
            <>
              <h2 className="text-base font-semibold leading-7 text-gray-900">
                Complete
              </h2>
              <p
                className={`mt-1 text-sm leading-6 ${
                  studioSuccess ? "text-gray-600" : "text-red-500"
                }`}
              >
                {studioSuccess
                  ? "Thank you!, Your studio has been created"
                  : "We could not create studio for you, please try again or contact us for support."}
              </p>
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
                  currentStep === steps.length - 1 ||
                  (currentStep === 1 &&
                    (images.length < MIN_NUMBER_IMAGE_UPLOAD ||
                      images.length > MAX_NUMBER_IMAGE_UPLOAD)) ||
                  images.some(
                    (image) =>
                      image.size > MAX_IMAGE_SIZE ||
                      !image.type.startsWith("image/")
                  )
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
