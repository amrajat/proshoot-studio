import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

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
    q: "What kind of photos should I upload?",
    a: "Upload minimum 4-10 (we recommend 10 or more) clearly visible, frontal face photos taken at different times, with different outfits, and maximum background variations with no noise if possible. A more detailed version of this information will be available, along with our face detection tool, which will assist you in uploading suitable images.",
  },
  {
    q: "Is it possible for me to delete my data?",
    a: "After 30 days, we will delete your training images from our database. We use signed encryption to secure your images, ensuring they cannot be accessed by anyone. You also have the option to request the deletion of your studio/account at any time by sending us an email.",
  },
  {
    q: "Where is my data stored?",
    a: "Data is stored securely on servers in the United States by highly vetted third-party partners who maintain thorough security standards.",
  },
  {
    q: "What happens to my photos after they are used for training purposes?",
    a: "We use the photos to train a personal model that generates images of you alone. Additionally, your training images are encrypted, so they remain secure and are not accessible to anyone else. They are not used for any other purpose after the training process and get deleted after 30 days.",
  },
  {
    q: "Is the payment process secure?",
    a: "Our payment gateway is Lemon Squeezy, ensuring secure transactions. We do not store any financial information.",
  },
  {
    q: "How many high-quality and realistic photos I can expect?",
    a: "We guarantee at least 1 to 5 profile-worthy headshots per order. If you can't find at least one usable image, please take advantage of our 100% money-back guarantee, and we will refund the full amount.",
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
    a: "We only support the following image formats: JPG, JPEG, and PNG. If needed, you can easily convert your images to these formats using free online tools.",
  },
  {
    q: "My question is not listed above.",
    a: "You can always email us. support@proshoot.co",
  },
];

export default function FAQs() {
  return (
    <section
      id="faqs"
      className="bg-gradient-to-b from-secondary to-background py-16 sm:py-24 md:py-16 lg:py-24"
    >
      <div className="container px-4 sm:px-6 lg:px-8 mx-auto max-w-7xl">
        <div className="grid gap-8 md:gap-12">
          <div className="space-y-4 text-center md:text-left">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
              FAQs
            </h2>
            <p className="text-base sm:text-lg text-muted-foreground max-w-prose mx-auto md:mx-0">
              Answers to the most frequently asked questions.
            </p>
          </div>
          <div>
            <Accordion type="single" collapsible className="w-full">
              {faqsList.map((faq, index) => (
                <AccordionItem
                  key={index}
                  value={`item-${index}`}
                  className="border-b border-muted"
                >
                  <AccordionTrigger className="text-base sm:text-lg py-4 hover:no-underline text-left">
                    {faq.q}
                  </AccordionTrigger>
                  <AccordionContent className="text-sm sm:text-base text-muted-foreground pb-4">
                    {faq.a}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </div>
      </div>
    </section>
  );
}
