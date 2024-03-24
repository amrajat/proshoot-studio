"use client";
import { useState } from "react";
import { getStripe } from "@/lib/stripe/stripe";
import { HSSelect } from "preline";
import { PLANS } from "@/lib/data";
import ToolTip from "@/components/homepage/ToolTip";
import Container from "@/components/dashboard/Container";

function BuyStudio() {
  const [plan, setPlan] = useState(0);
  const [planType, setPlanType] = useState("Individual");
  const [quantity, setQuantity] = useState(1);

  window.addEventListener("load", (event) => {
    const planEl = HSSelect.getInstance("#plan");
    planEl.on("change", (val) => setPlan(Number(val)));

    const planTypeEl = HSSelect.getInstance("#planType");
    planTypeEl.on("change", (val) => setPlanType(val));

    const quantityEl = HSInputNumber.getInstance("#quantity");
    quantityEl.on("change", ({ inputValue }) =>
      setQuantity(Number(inputValue))
    );
  });

  async function checkout(data) {
    const stripe = await getStripe();

    const checkOutData = {
      plan,
      planType,
      quantity,
    };

    try {
      const response = await fetch("/dashboard/stripe", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(checkOutData),
      });

      const stripeSession = await response.json();

      if (stripe) {
        const result = await stripe.redirectToCheckout({
          sessionId: stripeSession.id,
        });

        if (result.error) {
          // toast.error("Payment Failed");
        }
      }
    } catch (error) {
      console.log("Error: ", error);
    }
  }
  return (
    <Container>
      <div className="flex justify-center items-center">
        <form className="mt-5 sm:mt-8" action={checkout}>
          <div className="py-6 first:pt-0 last:pb-0 border-t first:border-transparent border-gray-200 dark:border-gray-700 dark:first:border-transparent">
            <div className="lg:max-w-lg lg:mx-auto lg:me-0 ms-auto">
              <div className="max-w-7xl p-4 sm:p-7 flex flex-col bg-white rounded-2xl shadow-lg dark:bg-slate-900">
                <div className="text-center">
                  <h1 className="block text-2xl font-bold text-gray-800 dark:text-white">
                    Buy Studio
                  </h1>
                </div>
                <div className="mt-5">
                  <div className="flex flex-col gap-4">
                    <div>
                      <div className="relative">
                        <select
                          id="plan"
                          data-hs-select='{
"placeholder": "Select Plan",
"toggleTag": "<button type=\"button\"></button>",
"toggleClasses": "hs-select-disabled:pointer-events-none hs-select-disabled:opacity-50 relative py-3 px-4 pe-9 flex text-nowrap w-full cursor-pointer bg-white border border-gray-200 rounded-lg text-start text-sm focus:border-blue-500 focus:ring-blue-500 before:absolute before:inset-0 before:z-[1] dark:bg-slate-900 dark:border-gray-700 dark:text-gray-400 dark:focus:outline-none dark:focus:ring-1 dark:focus:ring-gray-600",
"dropdownClasses": "mt-2 z-50 w-full max-h-[300px] p-1 space-y-0.5 bg-white border border-gray-200 rounded-lg overflow-hidden overflow-y-auto dark:bg-slate-900 dark:border-gray-700",
"optionClasses": "py-2 px-4 w-full text-sm text-gray-800 cursor-pointer hover:bg-gray-100 rounded-lg focus:outline-none focus:bg-gray-100 dark:bg-slate-900 dark:hover:bg-slate-800 dark:text-gray-200 dark:focus:bg-slate-800",
"optionTemplate": "<div class=\"flex justify-between items-center w-full\"><span data-title></span><span class=\"hidden hs-selected:block\"><svg class=\"flex-shrink-0 w-3.5 h-3.5 text-blue-600 dark:text-blue-500\" xmlns=\"http:.w3.org/2000/svg\" width=\"24\" height=\"24\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><polyline points=\"20 6 9 17 4 12\"/></svg></span></div>"
    }'
                          className="hidden"
                        >
                          {/* <option value="">Choose</option> */}
                          <option value="0">Basic</option>
                          <option value="1">Standard</option>
                          <option value="2">Premium</option>
                        </select>
                        <div className="absolute top-1/2 end-3 -translate-y-1/2">
                          <svg
                            className="flex-shrink-0 w-3.5 h-3.5 text-gray-500 dark:text-gray-500"
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
                            <path d="m7 15 5 5 5-5" />
                            <path d="m7 9 5-5 5 5" />
                          </svg>
                        </div>
                      </div>
                    </div>
                    <div>
                      <div className="relative">
                        <select
                          id="planType"
                          data-hs-select='{
"placeholder": "Plan Type",
"toggleTag": "<button type=\"button\"></button>",
"toggleClasses": "hs-select-disabled:pointer-events-none hs-select-disabled:opacity-50 relative py-3 px-4 pe-9 flex text-nowrap w-full cursor-pointer bg-white border border-gray-200 rounded-lg text-start text-sm focus:border-blue-500 focus:ring-blue-500 before:absolute before:inset-0 before:z-[1] dark:bg-slate-900 dark:border-gray-700 dark:text-gray-400 dark:focus:outline-none dark:focus:ring-1 dark:focus:ring-gray-600",
"dropdownClasses": "mt-2 z-50 w-full max-h-[300px] p-1 space-y-0.5 bg-white border border-gray-200 rounded-lg overflow-hidden overflow-y-auto dark:bg-slate-900 dark:border-gray-700",
"optionClasses": "py-2 px-4 w-full text-sm text-gray-800 cursor-pointer hover:bg-gray-100 rounded-lg focus:outline-none focus:bg-gray-100 dark:bg-slate-900 dark:hover:bg-slate-800 dark:text-gray-200 dark:focus:bg-slate-800",
"optionTemplate": "<div class=\"flex justify-between items-center w-full\"><span data-title></span><span class=\"hidden hs-selected:block\"><svg class=\"flex-shrink-0 w-3.5 h-3.5 text-blue-600 dark:text-blue-500\" xmlns=\"http:.w3.org/2000/svg\" width=\"24\" height=\"24\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><polyline points=\"20 6 9 17 4 12\"/></svg></span></div>"
    }'
                          className="hidden"
                        >
                          {/* <option value="">Choose</option> */}
                          <option value="Individual">Individual</option>
                          <option value="Team">Company Team</option>
                        </select>
                        <div className="absolute top-1/2 end-3 -translate-y-1/2">
                          <svg
                            className="flex-shrink-0 w-3.5 h-3.5 text-gray-500 dark:text-gray-500"
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
                            <path d="m7 15 5 5 5-5" />
                            <path d="m7 9 5-5 5 5" />
                          </svg>
                        </div>
                      </div>
                    </div>

                    <div className="col-span-full">
                      <div className="relative">
                        {/* Input Number */}
                        <div
                          id="quantity"
                          className="py-2 px-3 bg-white border border-gray-200 rounded-lg dark:bg-slate-900 dark:border-gray-700"
                          data-hs-input-number=""
                        >
                          <div className="w-full flex justify-between items-center gap-x-3">
                            <div>
                              <span className="block font-normal text-sm text-gray-800 dark:text-white">
                                Studio Quantity
                                <ToolTip>Image quantity per person.</ToolTip>
                              </span>
                              <span className="block text-xs text-gray-500 dark:text-gray-400">
                                ${PLANS[plan].planPrice} per studio x {quantity}
                              </span>
                            </div>
                            <div className="flex items-center gap-x-1.5">
                              <button
                                type="button"
                                className="w-6 h-6 inline-flex justify-center items-center gap-x-2 text-sm font-medium rounded-md border border-gray-200 bg-white text-gray-800 shadow-sm hover:bg-gray-50 disabled:opacity-50 disabled:pointer-events-none dark:bg-slate-900 dark:border-gray-700 dark:text-white dark:hover:bg-gray-800 dark:focus:outline-none dark:focus:ring-1 dark:focus:ring-gray-600"
                                data-hs-input-number-decrement=""
                              >
                                <svg
                                  className="flex-shrink-0 w-3.5 h-3.5"
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
                                  <path d="M5 12h14" />
                                </svg>
                              </button>
                              <input
                                className="p-0 w-6 bg-transparent border-0 text-gray-800 text-center focus:ring-0 dark:text-white"
                                type="text"
                                defaultValue={1}
                                data-hs-input-number-input=""
                              />
                              <button
                                type="button"
                                className="w-6 h-6 inline-flex justify-center items-center gap-x-2 text-sm font-medium rounded-md border border-gray-200 bg-white text-gray-800 shadow-sm hover:bg-gray-50 disabled:opacity-50 disabled:pointer-events-none dark:bg-slate-900 dark:border-gray-700 dark:text-white dark:hover:bg-gray-800 dark:focus:outline-none dark:focus:ring-1 dark:focus:ring-gray-600"
                                data-hs-input-number-increment=""
                              >
                                <svg
                                  className="flex-shrink-0 w-3.5 h-3.5"
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
                                  <path d="M5 12h14" />
                                  <path d="M12 5v14" />
                                </svg>
                              </button>
                            </div>
                          </div>
                        </div>
                        {/* End Input Number */}
                      </div>
                    </div>
                  </div>

                  <div className="mt-5">
                    {/* Card */}
                    <div className="flex flex-col bg-white border shadow-sm rounded-xl p-4 md:p-5 dark:bg-slate-900 dark:border-gray-700 dark:shadow-slate-700/[.7]">
                      <h4 className="font-medium text-lg text-gray-800 dark:text-gray-200">
                        {planType}
                      </h4>
                      <p className="mt-2 text-sm text-gray-500">
                        Qty. {quantity} - Price ${PLANS[plan].planPrice}
                      </p>
                      <span className="mt-7 font-bold text-3xl md:text-4xl xl:text-5xl text-gray-800 dark:text-gray-200">
                        {PLANS[plan].planName}
                      </span>
                      <p className="mt-2 text-sm text-gray-500">
                        {PLANS[plan].description}
                      </p>
                      <ul className="mt-7 space-y-2.5 text-sm">
                        {PLANS[plan].features.map((feature) => {
                          return (
                            <li key={feature} className="flex space-x-2">
                              <svg
                                className="flex-shrink-0 mt-0.5 h-4 w-4 text-violet-900"
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
                                <polyline points="20 6 9 17 4 12" />
                              </svg>
                              <span className="text-gray-800 dark:text-gray-400">
                                {feature}
                              </span>
                            </li>
                          );
                        })}
                      </ul>
                    </div>
                    {/* End Card */}
                  </div>

                  <div className="mt-5">
                    <button
                      type="submit"
                      disabled={!quantity}
                      className="w-full py-3 px-4 inline-flex justify-center items-center gap-x-2 text-sm font-semibold rounded-lg border border-transparent bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:pointer-events-none dark:focus:outline-none dark:focus:ring-1 dark:focus:ring-gray-600"
                    >
                      Pay ${PLANS[plan].planPrice * quantity}
                    </button>
                  </div>
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
