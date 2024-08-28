import Container from "@/components/dashboard/Container";
import Error from "@/components/Error";

import { getCredits, getPurchaseHistory } from "@/lib/supabase/actions/server";
import { MdErrorOutline } from "react-icons/md";
import ShowLocalTimeStamp from "@/components/dashboard/ShowLocalTimeStamp";

import Link from "next/link";
import Heading from "@/components/ui/Heading";
import { figtree } from "@/lib/utils";

async function Credits() {
  let purchase_history;
  let credits;
  try {
    [{ purchase_history = [] } = {}] = await getPurchaseHistory();
    [{ credits = [] } = {}] = await getCredits();
  } catch (error) {
    return (
      <Container>
        <Error message="Something went wrong." />
      </Container>
    );
  }
  if (purchase_history.length < 1)
    return (
      <Container>
        <div className="bg-white rounded shadow p-4 sm:p-7 ">
          <div className="mb-8">
            <div className="h-full flex flex-col bg-white border shadow-sm rounded   ">
              <div className="flex flex-auto flex-col justify-center items-center p-4 md:p-5">
                <MdErrorOutline className="size-10 text-gray-500" />
                <p className="mt-5 text-sm text-gray-800 ">
                  No data, Buy one of our plan to see details here.
                </p>
                <Link href="/dashboard/studio/buy" className="mt-6">
                  <button
                    type="button"
                    className="py-2 px-3 inline-flex items-center gap-x-2 text-sm font-semibold rounded border border-transparent bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:pointer-events-none   "
                  >
                    Buy Studio
                  </button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </Container>
    );

  return (
    <Container>
      <div className="bg-white rounded shadow p-4 sm:p-7 ">
        <div className="mb-8">
          <Heading type="h5">Credits</Heading>
          <p className="text-sm text-gray-600 ">View your available credits.</p>
          {/* Credits Stats here */}
          <div className="my-8">
            <>
              {/* Card Section */}
              <div className="max-w-[85rem] px-4 py-10 sm:px-6 lg:px-8 lg:py-14 mx-auto">
                {/* Grid */}
                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                  {/* Card */}
                  <div className="flex flex-col border rounded ">
                    <div className="p-4 md:p-5">
                      <div className="flex items-center gap-x-2">
                        <p
                          className={
                            figtree.className +
                            " text-sm font-semibold text-gray-500"
                          }
                        >
                          Basic
                        </p>
                      </div>
                      <h3 className="mt-2 text-2xl sm:text-3xl lg:text-4xl text-gray-800 ">
                        <span className="font-semibold">
                          {credits["Basic"]}
                        </span>
                        {/* <span className="text-gray-500">/ 1</span> */}
                      </h3>
                    </div>
                  </div>
                  {/* End Card */}
                  {/* Card */}
                  <div className="flex flex-col border rounded ">
                    <div className="p-4 md:p-5">
                      <div className="flex items-center gap-x-2">
                        <p
                          className={
                            figtree.className +
                            " text-sm font-semibold text-gray-500"
                          }
                        >
                          Standard
                        </p>
                      </div>
                      <h3 className="mt-2 text-2xl sm:text-3xl lg:text-4xl text-gray-800 ">
                        <span className="font-semibold">
                          {credits["Standard"]}
                        </span>
                        {/* <span className="text-gray-500">/ 10</span> */}
                      </h3>
                    </div>
                  </div>
                  {/* End Card */}
                  {/* Card */}
                  <div className="flex flex-col border rounded ">
                    <div className="p-4 md:p-5">
                      <div className="flex items-center gap-x-2">
                        <p
                          className={
                            figtree.className +
                            " text-sm font-semibold text-gray-500"
                          }
                        >
                          Premium
                        </p>
                      </div>
                      <h3 className="mt-2 text-2xl sm:text-3xl lg:text-4xl text-gray-800 ">
                        <span className="font-semibold">
                          {credits["Premium"]}
                        </span>
                        {/* <span className="text-gray-500">/ 10</span> */}
                      </h3>
                    </div>
                  </div>
                  {/* End Card */}
                  {/* Card */}
                  <div className="flex flex-col border rounded ">
                    <div className="p-4 md:p-5">
                      <div className="flex items-center gap-x-2">
                        <p
                          className={
                            figtree.className +
                            " text-sm font-semibold text-gray-500"
                          }
                        >
                          Pro
                        </p>
                      </div>
                      <h3 className="mt-2 text-2xl sm:text-3xl lg:text-4xl text-gray-800 ">
                        <span className="font-semibold">{credits["Pro"]}</span>
                        {/* <span className="text-gray-500">/ 0</span> */}
                      </h3>
                    </div>
                  </div>
                  {/* End Card */}
                </div>
                {/* End Grid */}
              </div>
              {/* End Card Section */}
            </>
          </div>
          {/* Credits Ends here */}

          <div className="mb-8">
            <Heading type="h5"> Transaction History</Heading>
            <p className="text-sm text-gray-600 ">View transaction history.</p>
            <div className="my-8">
              <div className="flex flex-col">
                <div className="-m-1.5 overflow-x-auto">
                  <div className="p-1.5 min-w-full inline-block align-middle">
                    <div className="overflow-hidden">
                      <table className="min-w-full divide-y divide-gray-200 ">
                        <thead>
                          <tr>
                            <th
                              scope="col"
                              className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase"
                            >
                              Qty.
                            </th>
                            <th
                              scope="col"
                              className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase"
                            >
                              Plan
                            </th>

                            <th
                              scope="col"
                              className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase"
                            >
                              Payment ID
                            </th>

                            <th
                              scope="col"
                              className="px-6 py-3 text-end text-xs font-medium text-gray-500 uppercase"
                            >
                              Timestamp
                            </th>
                          </tr>
                        </thead>

                        {purchase_history.map((transaction, index) => (
                          <tbody
                            key={index}
                            className="divide-y divide-gray-200 "
                          >
                            <tr>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-800 ">
                                {transaction.qty}
                              </td>

                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-800 ">
                                {transaction.plan}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-800 ">
                                {transaction.session}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-end font-medium text-gray-800 ">
                                {
                                  <ShowLocalTimeStamp
                                    ts={transaction.timestamp}
                                  />
                                }
                              </td>
                            </tr>
                          </tbody>
                        ))}
                      </table>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Container>
  );
}

export default Credits;
