"use server";
import { signInWithOAuth } from "@/lib/supabase/actions/server";
import { cookies } from "next/headers";
async function OAuth({ provider }) {
  const cookieJar = cookies();
  const lastSignedInMethod = cookieJar.get("lastSignedInMethod")?.value;

  const buttonProvider =
    provider === "google" ? (
      <button
        type="submit"
        className="relative w-full py-3 px-4 inline-flex justify-center items-center gap-x-2 text-sm font-medium rounded border border-gray-200 bg-white text-gray-800 shadow-sm hover:bg-gray-50 disabled:opacity-50 disabled:pointer-events-none       "
      >
        <svg
          className="w-4 h-auto"
          width={46}
          height={47}
          viewBox="0 0 46 47"
          fill="none"
        >
          <path
            d="M46 24.0287C46 22.09 45.8533 20.68 45.5013 19.2112H23.4694V27.9356H36.4069C36.1429 30.1094 34.7347 33.37 31.5957 35.5731L31.5663 35.8669L38.5191 41.2719L38.9885 41.3306C43.4477 37.2181 46 31.1669 46 24.0287Z"
            fill="#4285F4"
          />
          <path
            d="M23.4694 47C29.8061 47 35.1161 44.9144 39.0179 41.3012L31.625 35.5437C29.6301 36.9244 26.9898 37.8937 23.4987 37.8937C17.2793 37.8937 12.0281 33.7812 10.1505 28.1412L9.88649 28.1706L2.61097 33.7812L2.52296 34.0456C6.36608 41.7125 14.287 47 23.4694 47Z"
            fill="#34A853"
          />
          <path
            d="M10.1212 28.1413C9.62245 26.6725 9.32908 25.1156 9.32908 23.5C9.32908 21.8844 9.62245 20.3275 10.0918 18.8588V18.5356L2.75765 12.8369L2.52296 12.9544C0.909439 16.1269 0 19.7106 0 23.5C0 27.2894 0.909439 30.8731 2.49362 34.0456L10.1212 28.1413Z"
            fill="#FBBC05"
          />
          <path
            d="M23.4694 9.07688C27.8699 9.07688 30.8622 10.9863 32.5344 12.5725L39.1645 6.11C35.0867 2.32063 29.8061 0 23.4694 0C14.287 0 6.36607 5.2875 2.49362 12.9544L10.0918 18.8588C11.9987 13.1894 17.25 9.07688 23.4694 9.07688Z"
            fill="#EB4335"
          />
        </svg>
        Continue with Google
        {lastSignedInMethod === "google" && (
          <div className="absolute top-1/2 translate-y-1/2 right-0 whitespace-nowrap ml-8 bg-blue-600/75 px-4 py-1 rounded text-xs text-white">
            Last Used
          </div>
        )}
      </button>
    ) : (
      <button
        type="submit"
        className="relative w-full py-3 px-4 inline-flex justify-center items-center gap-x-2 text-sm font-medium rounded border border-gray-200 bg-white text-gray-800 shadow-sm hover:bg-gray-50 disabled:opacity-50 disabled:pointer-events-none       "
      >
        <span className="flex items-center">
          <svg className="w-5 h-5 mr-2" viewBox="0 0 32 32" fill="none">
            <g>
              <path
                d="M32,30c0,1.104-0.896,2-2,2H2c-1.104,0-2-0.896-2-2V2c0-1.104,0.896-2,2-2h28c1.104,0,2,0.896,2,2V30z"
                fill="#007BB5"
              />
              <g>
                <rect fill="#FFFFFF" height={14} width={4} x={7} y={11} />
                <path
                  d="M20.499,11c-2.791,0-3.271,1.018-3.499,2v-2h-4v14h4v-8c0-1.297,0.703-2,2-2c1.266,0,2,0.688,2,2v8h4v-7    C25,14,24.479,11,20.499,11z"
                  fill="#FFFFFF"
                />
                <circle cx={9} cy={8} fill="#FFFFFF" r={2} />
              </g>
            </g>
            <g />
            <g />
            <g />
            <g />
            <g />
            <g />
          </svg>
          Continue with LinkedIn
        </span>
        {lastSignedInMethod === "linkedin_oidc" && (
          <div className="absolute top-1/2 translate-y-1/2 right-0 whitespace-nowrap ml-8 bg-blue-600/75 px-4 py-1 rounded text-xs text-white">
            Last Used
          </div>
        )}
      </button>
    );
  return (
    <form
      action={async () => {
        "use server";
        await signInWithOAuth(provider);
      }}
    >
      {buttonProvider}
    </form>
  );
}

export default OAuth;
