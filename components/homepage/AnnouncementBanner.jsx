import { HiPlay } from "react-icons/hi2";

function AnnouncementBanner() {
  return (
    <div className="bg-gradient-to-r from-purple-600 to-blue-400">
      <div className="max-w-[85rem] px-2 py-2 sm:px-3 lg:px-4 mx-auto">
        {/* Grid */}
        <div className="grid justify-center md:grid-cols-2 md:justify-between md:items-center gap-2">
          <div className="text-center md:text-start md:order-2 md:flex md:justify-end md:items-center">
            <p className="me-5 inline-block text-xs font-normal text-white">
              Use code on payment checkout page.
            </p>
            <a
              className="py-2 px-3 inline-flex items-center gap-x-2 text-xs font-normal rounded-lg border-2 border-white text-white hover:border-white/70 hover:text-white/70 disabled:opacity-50 disabled:pointer-events-none"
              href="#"
            >
              PH500
            </a>
          </div>
          {/* End Col */}
          <div className="flex items-center">
            <a
              className="py-2 px-3 inline-flex justify-center items-center gap-2 rounded-lg font-normal text-white hover:bg-white/[.1] focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 transition-all text-xs"
              href="#"
            >
              <HiPlay width={24} height={24} className="flex-shrink-0 size-4" />
              LAUNCH
            </a>
            <span className="inline-block border-e border-white/[.3] w-px h-5 mx-2" />
            <a
              className="py-2 px-3 inline-flex justify-center items-center gap-2 rounded-lg font-normal text-white hover:bg-white/[.1] focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 transition-all text-xs"
              href="#"
            >
              Receive 50% Discount on all our plans.
            </a>
          </div>
          {/* End Col */}
        </div>
        {/* End Grid */}
      </div>
    </div>
  );
}

export default AnnouncementBanner;
