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
    q: "Could you please provide me with an invoice?",
    a: "Certainly, you can obtain an invoice for your purchase. You will get email with invoice.pdf from our payment partner Lemon Squeezy.",
  },
  {
    q: "What kind of photos should I upload?",
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
