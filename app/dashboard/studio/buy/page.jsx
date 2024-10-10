"use client";
import { useState, useTransition } from "react";
import ToolTip from "@/components/homepage/ToolTip";
import Container from "@/components/dashboard/Container";
import { HiMiniPlus, HiMiniMinus } from "react-icons/hi2";
import { PLANS } from "@/lib/data";
import { createCheckoutLS } from "@/lib/supabase/actions/server";

function BuyStudio() {
  const [plan, setPlan] = useState("Premium");
  const [quantity, setQuantity] = useState(1);
  const [pending, startTransaction] = useTransition();

  const handleOptionChange = (event) => {
    setPlan(event.target.value);
  };

  function decrementNumber() {
    setQuantity((value) => value - 1);
  }

  function incrementNumber() {
    setQuantity((value) => value + 1);
  }

  const handleQuantityChange = (event) => {
    const value = parseInt(event.target.value, 10);
    if (!isNaN(value) && value >= 1) {
      setQuantity(value);
    }
  };

  async function checkout(data) {
    startTransaction(async () => {
      try {
        await createCheckoutLS(plan, quantity, PLANS[plan]["variantId"]);
      } catch (error) {
        console.log("Error: ", error);
      }
    });
  }
  return (
    <Container cls="py-0 lg:py-0">
      <div className="flex justify-center items-start">
        <form className="" action={checkout}>
          <div className="py-6 first:pt-0 last:pb-0 border-t first:border-transparent border border-gray-200 shadow-sm">
            <div className="lg:max-w-lg lg:mx-auto lg:me-0 ms-auto">
              <div className="max-w-7xl p-4 sm:p-7 flex flex-col bg-white rounded shadow-lg ">
                <div className="text-center">
                  <h1 className="block text-2xl font-bold ">
                    Buy Headshots Package
                  </h1>
                </div>
                <div className="mt-5">
                  <div className="flex flex-col gap-4">
                    <div className="grid grid-cols-2 gap-3">
                      {/* Checkbox */}
                      <label
                        htmlFor="hs-pro-gpromf"
                        className="relative py-3 px-4 flex border-2 border-transparent rounded cursor-pointer focus:outline-none"
                      >
                        <input
                          type="radio"
                          id="hs-pro-gpromf"
                          className="peer absolute top-0 start-0 w-full h-full bg-transparent border border-gray-300 rounded cursor-pointer appearance-none focus:ring-white checked:border-2 checked:border-blue-600 checked:hover:border-blue-600 checked:focus:border-blue-600 checked:bg-none checked:text-transparent disabled:opacity-50 pointer-events-none

                            before:content-[''] before:top-3.5 before:start-3.5  before:border-blue-600 before:h-5 before:rounded "
                          value="Basic"
                          name="hs-pro-gpromn"
                          onChange={handleOptionChange}
                        />
                        <span className="peer-checked:flex hidden absolute top-4 end-4">
                          <span className="block w-5 h-5 flex justify-center items-center rounded bg-blue-600">
                            <svg
                              className="flex-shrink-0 w-3 h-3 text-white"
                              xmlns="http://www.w3.org/2000/svg"
                              width={24}
                              height={24}
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth={4}
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            >
                              <polyline points="20 6 9 17 4 12" />
                            </svg>
                          </span>
                        </span>
                        <span className="w-full">
                          <svg
                            className="w-[34px] h-[30px] mb-2 sm:mb-8"
                            width={34}
                            height={30}
                            viewBox="0 0 34 30"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <rect
                              y={5}
                              width={20}
                              height={20}
                              rx={10}
                              fill="currentColor"
                              className="fill-blue-300 "
                            />
                          </svg>
                          <span className="block font-semibold">Basic</span>
                          <span className="inline-flex items-center py-1.5 text-sm font-medium bg-white shadow-sm   ">
                            $ {PLANS["Basic"]["planPrice"]}
                          </span>
                          <span className="block text-sm leading-relaxed">
                            {/* FIXME: UPDATE ALL THESE DESCRIPTIONS */}
                            {PLANS["Basic"]["headshots"]} Headshots
                          </span>
                        </span>
                      </label>
                      {/* End Checkbox */}
                      {/* Checkbox */}
                      <label
                        htmlFor="hs-pro-gproms"
                        className="relative py-3 px-4 flex border-2 border-transparent rounded cursor-pointer focus:outline-none"
                      >
                        <input
                          type="radio"
                          id="hs-pro-gproms"
                          className="peer absolute top-0 start-0 w-full h-full bg-transparent border border-gray-300 rounded cursor-pointer appearance-none focus:ring-white checked:border-2 checked:border-blue-600 checked:hover:border-blue-600 checked:focus:border-blue-600 checked:bg-none checked:text-transparent disabled:opacity-50 pointer-events-none

                            before:content-[''] before:top-3.5 before:start-3.5  before:border-blue-600 before:h-5 before:rounded "
                          value="Standard"
                          name="hs-pro-gpromn"
                          onChange={handleOptionChange}
                        />
                        <span className="peer-checked:flex hidden absolute top-4 end-4">
                          <span className="block w-5 h-5 flex justify-center items-center rounded bg-blue-600">
                            <svg
                              className="flex-shrink-0 w-3 h-3 text-white"
                              xmlns="http://www.w3.org/2000/svg"
                              width={24}
                              height={24}
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth={4}
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            >
                              <polyline points="20 6 9 17 4 12" />
                            </svg>
                          </span>
                        </span>
                        <span className="w-full">
                          <svg
                            className="w-[34px] h-[30px] mb-2 sm:mb-8"
                            width={34}
                            height={30}
                            viewBox="0 0 34 30"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <rect
                              y={5}
                              width={20}
                              height={20}
                              rx={10}
                              fill="currentColor"
                              className="fill-blue-300 "
                            />
                            <rect
                              x={14}
                              y={5}
                              width={20}
                              height={20}
                              rx={10}
                              fill="currentColor"
                              className="fill-blue-500 "
                            />
                          </svg>
                          <span className="block font-semibold">Standard</span>
                          <span className="inline-flex items-center py-1.5 text-sm font-medium bg-white shadow-sm   ">
                            $ {PLANS["Standard"]["planPrice"]}
                          </span>
                          <span className="block text-sm leading-relaxed">
                            {PLANS["Standard"]["headshots"]} Headshots
                          </span>
                        </span>
                      </label>
                      {/* End Checkbox */}
                      {/* Checkbox */}
                      <label
                        htmlFor="hs-pro-gpromt"
                        className="relative py-3 px-4 flex border-2 border-transparent rounded cursor-pointer focus:outline-none"
                      >
                        <input
                          type="radio"
                          id="hs-pro-gpromt"
                          className="peer absolute top-0 start-0 w-full h-full bg-transparent border border-gray-300 rounded cursor-pointer appearance-none focus:ring-white checked:border-2 checked:border-blue-600 checked:hover:border-blue-600 checked:focus:border-blue-600 checked:bg-none checked:text-transparent disabled:opacity-50 pointer-events-none

                            before:content-[''] before:top-3.5 before:start-3.5  before:border-blue-600 before:h-5 before:rounded "
                          value="Premium"
                          name="hs-pro-gpromn"
                          onChange={handleOptionChange}
                          defaultChecked={true}
                        />
                        <span className="peer-checked:flex hidden absolute top-4 end-4">
                          <span className="block w-5 h-5 flex justify-center items-center rounded bg-blue-600">
                            <svg
                              className="flex-shrink-0 w-3 h-3 text-white"
                              xmlns="http://www.w3.org/2000/svg"
                              width={24}
                              height={24}
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth={4}
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            >
                              <polyline points="20 6 9 17 4 12" />
                            </svg>
                          </span>
                        </span>
                        <span className="w-full">
                          <svg
                            className="w-[34px] h-[30px] mb-2 sm:mb-8"
                            width={34}
                            height={30}
                            viewBox="0 0 34 30"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <rect
                              x={7}
                              width={20}
                              height={20}
                              rx={10}
                              fill="currentColor"
                              className="fill-blue-200 "
                            />
                            <rect
                              y={10}
                              width={20}
                              height={20}
                              rx={10}
                              fill="currentColor"
                              className="fill-blue-300 "
                            />
                            <rect
                              x={14}
                              y={10}
                              width={20}
                              height={20}
                              rx={10}
                              fill="currentColor"
                              className="fill-blue-500 "
                            />
                          </svg>
                          <span className="block font-semibold">
                            Premium &nbsp;
                            <span className="py-1 px-1.5 inline-flex items-center gap-x-1 text-xs font-normal bg-blue-100 text-blue-600 rounded  ">
                              <svg
                                className="flex-shrink-0 size-3"
                                xmlns="http://www.w3.org/2000/svg"
                                width={24}
                                height={24}
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth={2}
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              >
                                <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
                                <polyline points="16 7 22 7 22 13" />
                              </svg>
                              most popular
                            </span>
                          </span>
                          <span className="inline-flex items-center py-1.5 text-sm font-medium bg-white shadow-sm   ">
                            $ {PLANS["Premium"]["planPrice"]}
                          </span>
                          <span className="block text-sm leading-relaxed">
                            {PLANS["Premium"]["headshots"]} Headshots
                          </span>
                        </span>
                      </label>
                      {/* End Checkbox */}
                      {/* Checkbox */}
                      <label
                        htmlFor="hs-pro-gprome"
                        className="relative py-3 px-4 flex border-2 border-transparent rounded cursor-pointer focus:outline-none"
                      >
                        <input
                          type="radio"
                          id="hs-pro-gprome"
                          className="peer absolute top-0 start-0 w-full h-full bg-transparent border border-gray-300 rounded cursor-pointer appearance-none focus:ring-white checked:border-2 checked:border-blue-600 checked:hover:border-blue-600 checked:focus:border-blue-600 checked:bg-none checked:text-transparent disabled:opacity-50 pointer-events-none

                            before:content-[''] before:top-3.5 before:start-3.5  before:border-blue-600 before:h-5 before:rounded "
                          value="Pro"
                          name="hs-pro-gpromn"
                          onChange={handleOptionChange}
                        />
                        <span className="peer-checked:flex hidden absolute top-4 end-4">
                          <span className="block w-5 h-5 flex justify-center items-center rounded bg-blue-600">
                            <svg
                              className="flex-shrink-0 w-3 h-3 text-white"
                              xmlns="http://www.w3.org/2000/svg"
                              width={24}
                              height={24}
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth={4}
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            >
                              <polyline points="20 6 9 17 4 12" />
                            </svg>
                          </span>
                        </span>
                        <span className="w-full">
                          <svg
                            className="w-[34px] h-[30px] mb-2 sm:mb-8"
                            width={34}
                            height={30}
                            viewBox="0 0 34 30"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <rect
                              width={20}
                              height={20}
                              rx={10}
                              fill="currentColor"
                              className="fill-blue-200 "
                            />
                            <rect
                              y={10}
                              width={20}
                              height={20}
                              rx={10}
                              fill="currentColor"
                              className="fill-blue-300 "
                            />
                            <rect
                              x={14}
                              y={10}
                              width={20}
                              height={20}
                              rx={10}
                              fill="currentColor"
                              className="fill-blue-400 "
                            />
                            <rect
                              x={14}
                              width={20}
                              height={20}
                              rx={10}
                              fill="currentColor"
                              className="fill-blue-600 "
                            />
                          </svg>
                          <span className="block font-semibold">Pro</span>
                          <span className="inline-flex items-center py-1.5 text-sm font-medium bg-white shadow-sm   ">
                            $ {PLANS["Pro"]["planPrice"]}
                          </span>

                          <span className="block text-sm leading-relaxed">
                            {PLANS["Pro"]["headshots"]} Headshots
                          </span>
                        </span>
                      </label>
                      {/* End Checkbox */}
                    </div>

                    <div className="col-span-full">
                      <div className="relative">
                        {/* Input Number */}
                        <div
                          id="quantity"
                          className="py-2 px-3 bg-white border border-gray-200 rounded  "
                        >
                          <div className="w-full flex justify-between items-center gap-x-3">
                            <div>
                              <span className="block font-normal text-sm ">
                                Quantity
                                <ToolTip>
                                  Each unit generates images for one single
                                  person.
                                </ToolTip>
                              </span>
                              <span className="block text-xs text-gray-700 ">
                                {quantity}
                              </span>
                            </div>
                            <div className="flex items-center gap-x-1.5">
                              <button
                                type="button"
                                className="w-6 h-6 inline-flex justify-center items-center gap-x-2 border-gray-200 font-medium rounded border text-base bg-white shadow-sm hover:bg-gray-50 disabled:opacity-50 disabled:pointer-events-none       "
                                onClick={decrementNumber}
                                disabled={quantity <= 1}
                              >
                                <HiMiniMinus />
                              </button>
                              <input
                                className="p-0 w-6 bg-transparent border-0 text-center focus:ring-0  [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                type="number"
                                min={1}
                                value={quantity}
                                onChange={handleQuantityChange}
                              />
                              <button
                                type="button"
                                className="w-6 h-6 inline-flex justify-center items-center gap-x-2 border-gray-200 font-medium rounded border text-base bg-white shadow-sm hover:bg-gray-50 disabled:opacity-50 disabled:pointer-events-none       "
                                onClick={incrementNumber}
                              >
                                <HiMiniPlus />
                              </button>
                            </div>
                          </div>
                        </div>
                        {/* End Input Number */}
                      </div>
                    </div>
                  </div>

                  <div className="mt-5">
                    <button
                      type="submit"
                      disabled={!quantity || pending}
                      className="w-full py-3 px-4 inline-flex justify-center items-center gap-x-2 text-sm font-semibold rounded border border-transparent bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:pointer-events-none   "
                    >
                      {pending
                        ? "Redirecting"
                        : `Pay $${Math.trunc(
                            quantity * PLANS[plan]["planPrice"]
                          )}`}
                    </button>
                  </div>
                  <ol className="mt-2">
                    <li className="text-xs">
                      1. After payment, you'll be redirected to create your
                      headshots.
                    </li>
                    <li className="text-xs">
                      2. If you have any discount code your can redeem at next
                      checkout page.
                    </li>
                  </ol>
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>
    </Container>
  );
}

export default BuyStudio;
