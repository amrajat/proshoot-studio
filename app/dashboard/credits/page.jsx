import Container from "@/components/dashboard/Container";
import { getCredits, getPurchaseHistory } from "@/lib/supabase/actions/server";

async function Credits() {
  const [{ purchase_history }] = await getPurchaseHistory();
  const [{ credits }] = await getCredits();
  // FIXME: Need to pass unique uuid for each transaction for future reference.
  if (purchase_history.length < 1)
    return (
      <Container>
        <div className="bg-white rounded-xl shadow p-4 sm:p-7 dark:bg-slate-900">
          <div className="mb-8">
            <div className="h-full flex flex-col bg-white border shadow-sm rounded-xl dark:bg-slate-900 dark:border-gray-700 dark:shadow-slate-700/[.7]">
              <div className="flex flex-auto flex-col justify-center items-center p-4 md:p-5">
                <svg
                  className="size-10 text-gray-500"
                  xmlns="http://www.w3.org/2000/svg"
                  width={24}
                  height={24}
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={1}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <line x1={22} x2={2} y1={12} y2={12} />
                  <path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z" />
                  <line x1={6} x2="6.01" y1={16} y2={16} />
                  <line x1={10} x2="10.01" y1={16} y2={16} />
                </svg>
                <p className="mt-5 text-sm text-gray-800 dark:text-gray-300">
                  No data, Buy one of our plan to see details here.
                </p>
              </div>
            </div>
          </div>
        </div>
      </Container>
    );

  return (
    <Container>
      <div className="bg-white rounded-xl shadow p-4 sm:p-7 dark:bg-slate-900">
        <div className="mb-8">
          <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200">
            Credits
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            View your available credits and transaction history.
          </p>
          {/* Credits Stats here */}
          <div className="my-8">
            <>
              {/* Card Section */}
              <div className="max-w-[85rem] px-4 py-10 sm:px-6 lg:px-8 lg:py-14 mx-auto">
                {/* Grid */}
                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                  {/* Card */}
                  <div className="flex flex-col border rounded-xl dark:border-gray-800">
                    <div className="p-4 md:p-5">
                      <div className="flex items-center gap-x-2">
                        <p className="text-sm font-semibold text-gray-500">
                          Basic
                        </p>
                      </div>
                      <h3 className="mt-2 text-2xl sm:text-3xl lg:text-4xl text-gray-800 dark:text-gray-200">
                        <span className="font-semibold">{credits.basic}</span>
                        {/* <span className="text-gray-500">/ 1</span> */}
                      </h3>
                    </div>
                  </div>
                  {/* End Card */}
                  {/* Card */}
                  <div className="flex flex-col border rounded-xl dark:border-gray-800">
                    <div className="p-4 md:p-5">
                      <div className="flex items-center gap-x-2">
                        <p className="text-sm font-semibold text-gray-500">
                          Standard
                        </p>
                      </div>
                      <h3 className="mt-2 text-2xl sm:text-3xl lg:text-4xl text-gray-800 dark:text-gray-200">
                        <span className="font-semibold">
                          {credits.standard}
                        </span>
                        {/* <span className="text-gray-500">/ 10</span> */}
                      </h3>
                    </div>
                  </div>
                  {/* End Card */}
                  {/* Card */}
                  <div className="flex flex-col border rounded-xl dark:border-gray-800">
                    <div className="p-4 md:p-5">
                      <div className="flex items-center gap-x-2">
                        <p className="text-sm font-semibold text-gray-500">
                          Premium
                        </p>
                      </div>
                      <h3 className="mt-2 text-2xl sm:text-3xl lg:text-4xl text-gray-800 dark:text-gray-200">
                        <span className="font-semibold">{credits.premium}</span>
                        {/* <span className="text-gray-500">/ 10</span> */}
                      </h3>
                    </div>
                  </div>
                  {/* End Card */}
                  {/* Card */}
                  <div className="flex flex-col border rounded-xl dark:border-gray-800">
                    <div className="p-4 md:p-5">
                      <div className="flex items-center gap-x-2">
                        <p className="text-sm font-semibold text-gray-500">
                          Professional
                        </p>
                      </div>
                      <h3 className="mt-2 text-2xl sm:text-3xl lg:text-4xl text-gray-800 dark:text-gray-200">
                        <span className="font-semibold">
                          {credits.professional}
                        </span>
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
            <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200">
              Transaction History
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              View your available credits and transaction history.
            </p>
            <div className="my-8">
              <div className="flex flex-col">
                <div className="-m-1.5 overflow-x-auto">
                  <div className="p-1.5 min-w-full inline-block align-middle">
                    <div className="overflow-hidden">
                      <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
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
                              Plan Name
                            </th>
                            <th
                              scope="col"
                              className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase"
                            >
                              Plan Price
                            </th>
                            <th
                              scope="col"
                              className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase"
                            >
                              # Headshots
                            </th>
                            <th
                              scope="col"
                              className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase"
                            >
                              Plan Type
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
                            className="divide-y divide-gray-200 dark:divide-gray-700"
                          >
                            <tr>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-800 dark:text-gray-200">
                                {transaction.qty}
                              </td>
                              {/* Parse the plan JSON within the data */}
                              {transaction.plan && (
                                <>
                                  {Object.entries(
                                    JSON.parse(transaction.plan)
                                  ).map(([key, value]) => {
                                    if (
                                      key === "planName" ||
                                      key === "planPrice" ||
                                      key == "headshots"
                                    ) {
                                      return (
                                        <td
                                          className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-800 dark:text-gray-200"
                                          key={key}
                                        >
                                          {value}
                                        </td>
                                      );
                                    }
                                  })}
                                </>
                              )}
                              {/* <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-800 dark:text-gray-200">
                                {transaction.session[0]}
                              </td> */}
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-800 dark:text-gray-200">
                                {transaction.planType}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-end font-medium text-gray-800 dark:text-gray-200">
                                {new Date(transaction.timestamp).toUTCString()}
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
