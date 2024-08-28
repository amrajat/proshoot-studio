import { HiPlay } from "react-icons/hi2";

function AnnouncementBanner() {
  return (
    <div className="bg-gradient-to-r from-blue-600 to-blue-700 py-1">
      <div className="max-w-[85rem] sm:px-3 lg:px-4 mx-auto">
        {/* Grid */}
        <div className="grid justify-center md:grid-cols-3 md:justify-between md:items-center gap-2">
          <div className="text-center md:text-start md:order-2 md:flex md:justify-start md:items-center">
            <p className="me-5 inline-block text-xs font-normal text-white">
              Trusted by 7000+ Happy Customers.
            </p>
          </div>
          {/* End Col */}

          <div className="text-center md:text-start md:order-2 md:flex md:justify-center md:items-center">
            <p className="me-5 inline-block text-xs font-normal text-white">
              100% Satisfaction & 100% Money Back Guarantee.
            </p>
          </div>
          {/* End Col */}

          <div className="text-center md:text-start md:order-2 md:flex md:justify-end md:items-center">
            <p className="me-5 inline-block text-xs font-normal text-white">
              Generated 400000+ Professional Headshots.
            </p>
          </div>
          {/* End Col */}
        </div>
        {/* End Grid */}
      </div>
    </div>
  );
}

export default AnnouncementBanner;
