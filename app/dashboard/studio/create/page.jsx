"use client";
import { useState } from "react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import axios from "axios";
import PreviewThumbnail from "@/components/dashboard/studio/PreviewThumbnail";
import ImageUploadingGuideLines from "@/components/dashboard/studio/ImageUploadingGuideLines";
import Container from "@/components/dashboard/Container";
import { IoTrashBin } from "react-icons/io5";

// TODO: ADD IMAGE VALIDATION LATER, WITH ALL THE CHECKS SUCH AS NUM. OF MIN/MAX IMAGES. REDO UPLOAD, DELETE IMAGE...MAX SIZE
// FIXME: FORMS SHOULD NOT BE FILLED IF KEY PRESS IS ENTER ON CURRENT STEP, WITHOUT COMPLETING STEP 2.

// FIXME: FIRST FETCH CREDITS DATA FROM USERS AND THEN ONLY ALLOW USERS TO CREATE STUDIO AFTER SUCCESSFUL SUBMISSION OF STUDIO THE CREDITS SHOULD BE UPDATED ACCORDINGLY

const FormDataSchema = z.object({
  gender: z.string().min(2, "Please select a gender."),
  age: z.string().refine((data) => Number(data) >= 12, {
    message: "Age must be 12 or older",
  }),
  eye: z.string().min(1, "Please select eye color."),
  hair: z.string().min(1, "Please select hair color."),
  name: z.string().min(1, "Please enter name."),
  ethnicity: z.string().min(1, "Please choose your ethnicity."),
});

const steps = [
  {
    id: "Step 1",
    name: "Studio Information",
    fields: ["gender", "age", "eye", "hair", "ethnicity", "name"],
  },
  {
    id: "Step 2",
    name: "Upload Images",
    fields: ["file"],
  },
  { id: "Step 3", name: "Studio Completion" },
];

export default function Form() {
  const [previousStep, setPreviousStep] = useState(0);
  const [currentStep, setCurrentStep] = useState(0); //FIXME: UPDATE TO 0

  const delta = currentStep - previousStep;
  const [images, setImages] = useState([]);
  // FIXME: THE IMAGE ERRORS HAS BE INDEX WISE OTHERWISE IT WON'T WORK.
  const [imageError, setImageError] = useState([false, false]);
  const MIN_NUMBER_IMAGE_UPLOAD = 3;
  const MAX_NUMBER_IMAGE_UPLOAD = 50;
  const MAX_IMAGE_SIZE = 1024 * 1024 * 50; // 1GB

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

  const handleFileSelected = (e) => {
    if (e.target.files) {
      //convert `FileList` to `File[]`
      const _files = Array.from(e.target.files);
      console.log(_files);
      setImages((prevImages) => [...prevImages, ..._files]);
    }
  };

  const onRemoveImage = (index) => {
    setImages((prevImages) => {
      const updatedImages = [...prevImages];
      updatedImages.splice(index, 1);
      return updatedImages;
    });
  };

  const processForm = async (data) => {
    // e.preventDefault();
    console.log(data instanceof FormData);
    // console.log(images);
    const formData = new FormData();
    images.forEach((image, i) => {
      formData.append("", image);
    });

    formData.append("age", data.age);
    formData.append("hair", data.hair);
    formData.append("eye", data.eye);
    formData.append("ethnicity", data.ethnicity);
    formData.append("gender", data.gender);
    formData.append("name", data.name);

    // ADD TRY AND CATCH HERE.
    const response = await axios.post(
      "/dashboard/studio/create/upload",
      formData
    );
    console.log(response);
    reset();
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
    <section className="inset-0 flex flex-col justify-between">
      {/* steps */}
      <nav aria-label="Progress">
        <ol role="list" className="space-y-4 md:flex md:space-x-8 md:space-y-0">
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
      >
        {currentStep === 0 && (
          <div>
            <h2 className="text-base font-semibold leading-7 text-gray-900">
              Personal Information
            </h2>
            <p className="mt-1 text-sm leading-6 text-gray-600">
              Provide your personal details. this will help us better fine
              tuning the model for best results.
            </p>
            <div className="mt-10 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
              <div className="sm:col-span-3">
                {/* Select */}
                <div className="relative">
                  <select
                    className="py-3 px-4 pe-9 block w-full border-gray-200 rounded-lg text-sm focus:border-blue-500 focus:ring-blue-500 disabled:opacity-50 disabled:pointer-events-none dark:bg-slate-900 dark:border-gray-700 dark:text-gray-400 dark:focus:ring-gray-600"
                    {...register("gender")}
                    id="gender"
                  >
                    <option value="">Choose gender</option>
                    <option value="women">Women</option>
                    <option value="man">Man</option>
                    <option value="non-binary">Non - Binary</option>
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
              </div>

              <div className="sm:col-span-3">
                {/* Select */}
                <div className="relative">
                  <select
                    className="py-3 px-4 pe-9 block w-full border-gray-200 rounded-lg text-sm focus:border-blue-500 focus:ring-blue-500 disabled:opacity-50 disabled:pointer-events-none dark:bg-slate-900 dark:border-gray-700 dark:text-gray-400 dark:focus:ring-gray-600"
                    {...register("eye")}
                    id="eye-color"
                  >
                    <option value="">Choose eye color</option>
                    <option value="brown">Brown</option>
                    <option value="blue">Blue</option>
                    <option value="green">Green</option>
                    <option value="hazel">Hazel</option>
                    <option value="gray">Gray</option>
                    <option value="amber">Amber</option>
                    <option value="heterochromia">Heterochromia</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                {/* End Select */}

                <div className="mt-2">
                  {errors.eye?.message && (
                    <p className="mt-2 text-sm text-red-400">
                      {errors.eye.message}
                    </p>
                  )}
                </div>
              </div>

              <div className="sm:col-span-3">
                {/* Select */}
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
                    <option value="strawberry-blonde">Strawberry Blonde</option>
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
                {/* End Select */}

                <div className="mt-2">
                  {errors.hair?.message && (
                    <p className="mt-2 text-sm text-red-400">
                      {errors.hair.message}
                    </p>
                  )}
                </div>
              </div>

              <div className="sm:col-span-3">
                {/* Select */}
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
                    <option value="maori">Maori (New Zealand, and more)</option>
                    <option value="inuit">
                      Inuit (Canada, Greenland, and more)
                    </option>
                    <option value="melanesian">
                      Melanesian (Papua New Guinea, Vanuatu, and more)
                    </option>
                    <option value="arab">Arab (Lebanon, Iraq, and more)</option>
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
                {/* End Select */}

                <div className="mt-2">
                  {errors.ethnicity?.message && (
                    <p className="mt-2 text-sm text-red-400">
                      {errors.ethnicity.message}
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
                    placeholder="Name your studio anything."
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
            </div>
          </div>
        )}

        {currentStep === 1 && (
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
                    <button type="button" onClick={() => setImages([])}>
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
        )}

        {currentStep === 2 && (
          <>
            <h2 className="text-base font-semibold leading-7 text-gray-900">
              Complete
            </h2>
            <p className="mt-1 text-sm leading-6 text-gray-600">
              Thank you for your submission.
            </p>
          </>
        )}
      </form>

      {/* Navigation */}
      <div className="mt-8 pt-5">
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
            {currentStep === 1 ? "Create" : "Next"}
          </button>
        </div>
      </div>
    </section>
  );
}
