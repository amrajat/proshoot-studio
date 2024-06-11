import { HiMiniPlus, HiMiniMinus } from "react-icons/hi2";

const faqsList = [
  {
    q: "Do you display all the images created on your platform?",
    a: "No, we will always ask for your permission before displaying your images on our website. You can manage your consent settings on your account's profile page.",
  },
  {
    q: "Do your special plans for bulk using.",
    a: "Yes we do! Please email us at support@proshoot.co",
  },
  {
    q: "Could you please provide me with an invoice?",
    a: "Certainly, you can obtain an invoice for your purchase. You will get email with invoice.pdf from our payment partner Lemon Squeezy.",
  },
  {
    q: "What kind of photos should I upload?",
    // a: "Please ensure to upload both portrait and full-body shots of the person. It is recommended to use 26 pictures of your subject, ideally cropped to a 1:1 aspect ratio. Out of these, 6 photos should showcase the full body or entire object, while 10 medium shot photos from the chest up and 10 close-ups should also be included. Variation is key in creating a comprehensive collection, so make sure to change body poses for every picture, and use pictures from different days, backgrounds, and lighting. Every picture of your subject should introduce new information about them. To prevent the model from learning unnecessary features, avoid uploading pictures taken at the same hour or day. For example, using multiple pictures with the same shirt will make the model learn the shirt as well as part of the subject. It is also important to always use a new background. Please do not upload pictures mixed with other people or funny faces.",
    a: "Just use minimum 3 camera facing everyday selfies/photos taken on different time and place. Don't worry! We will guide you at time of studio creation with our guidelines.",
  },
  {
    q: "Is it possible for me to delete my data?",
    a: "After 30 days from the date of creating your studio, we will delete it along with any images from our database. You can also request deletion of your studio at any time by emailing us manually.",
  },
  {
    q: "Could you please inform me about the location of my data storage?",
    a: "Data is stored securely on servers in the United States by highly secure third-party partners who undergo a thorough vetting process.",
  },
  {
    q: "What happens to my photos after they are used for training purposes?",
    a: "We use input photos to train our AI model, create headshots, and delete all data within 30 days of studio creation. You can email us anytime to have your data deleted.",
  },
  {
    q: "Is the payment process secure?",
    a: "Our payment gateway is Lemon Squeezy, ensuring secure transactions. We do not store any financial information.",
  },
  {
    q: "How many high-quality and realistic photos I can expect?",
    a: "Our photography service strives to provide you with the best possible experience, however, just like a real photo shoot, not every photo will turn out perfect. You may come across some photos with distortions. Nonetheless, we guarantee to deliver 4-10 exceptional profile-worthy headshots per order.",
  },
  {
    q: "Who has the ownership of the generated images?",
    a: "We grant you full ownership and a commercial license for your photos.",
  },
  {
    q: "Do you offer refunds?",
    a: "Yes, we do. Please read our refund policy.",
  },
  {
    q: "Will the training be completed within 2 hours or might it take longer?",
    a: "Training time for the model varies depending on input images and usually takes around 30 minutes.",
  },
  {
    q: "What formats of photos can I upload to your platform?",
    a: "We only support the following image formats: JPG, JPEG, PNG, HEIC, and WebP. If needed, you can easily convert your images to these formats using free online tools.",
  },
  {
    q: "My question is not listed above.",
    a: "You can always email us. support@proshoot.co",
  },
];
const NUMBERS = [
  "one",
  "two",
  "three",
  "four",
  "five",
  "six",
  "seven",
  "eight",
  "nine",
  "ten",
  "eleven",
  "twelve",
  "thirteen",
  "fourteen",
  "fifteen",
];

function FAQs() {
  return (
    <>
      <div
        id="faqs"
        className="max-w-[85rem] px-4 py-10 sm:px-6 lg:px-8 lg:py-14 mx-auto"
      >
        {/* <!-- Grid --> */}
        <div className="grid md:grid-cols-6 gap-6">
          <div className="md:col-span-2">
            <div className="max-w-xs">
              <h2 className="text-2xl font-bold md:text-3xl md:leading-tight dark:text-white">
                Frequently
                <br />
                asked questions
              </h2>
              <p className="mt-1 hidden md:block text-gray-600 dark:text-gray-400">
                Answers to the most frequently asked questions.
              </p>
            </div>
          </div>
          {/* <!-- End Col --> */}

          <div className="md:col-span-4">
            {/* <!-- Accordion --> */}
            <div className="hs-accordion-group divide-y divide-gray-200 dark:divide-gray-700">
              {faqsList.map((faq, index) => {
                return (
                  <div
                    key={index}
                    className={`hs-accordion pb-3 ${
                      index === 0 ? "active" : "pt-6"
                    }`}
                    id={`hs-basic-with-title-and-arrow-stretched-heading-${NUMBERS[index]}`}
                  >
                    <button
                      className="hs-accordion-toggle group pb-3 inline-flex items-center justify-between gap-x-3 w-full md:text-lg font-semibold text-start text-gray-800 rounded-lg transition hover:text-gray-500 dark:text-gray-200 dark:hover:text-gray-400 dark:focus:outline-none dark:focus:ring-1 dark:focus:ring-gray-600"
                      aria-controls={`hs-basic-with-title-and-arrow-stretched-collapse-${NUMBERS[index]}`}
                    >
                      {faq.q}
                      <HiMiniPlus
                        width={24}
                        height={24}
                        className="hs-accordion-active:hidden block flex-shrink-0 w-5 h-5 text-gray-600 group-hover:text-gray-500 dark:text-gray-400"
                      />

                      <HiMiniMinus
                        className="hs-accordion-active:block hidden flex-shrink-0 w-5 h-5 text-gray-600 group-hover:text-gray-500 dark:text-gray-400"
                        width={24}
                        height={24}
                      />
                    </button>
                    <div
                      id={`hs-basic-with-title-and-arrow-stretched-collapse-${NUMBERS[index]}`}
                      className={`hs-accordion-content ${
                        index === 0 ? "" : "hidden"
                      } w-full overflow-hidden transition-[height] duration-300`}
                      aria-labelledby={`hs-basic-with-title-and-arrow-stretched-heading-${NUMBERS[index]}`}
                    >
                      <p className="text-gray-600 dark:text-gray-400">
                        {faq.a}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
            {/* <!-- End Accordion --> */}
          </div>
          {/* <!-- End Col --> */}
        </div>
        {/* <!-- End Grid --> */}
      </div>
    </>
  );
}

export default FAQs;
