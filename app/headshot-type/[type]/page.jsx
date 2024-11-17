import Image from "next/image";
import { notFound } from "next/navigation";

const headshotTypes = {
  "linkedin-headshots": {
    title: "LinkedIn Headshots",
    image: "/placeholder.svg",
    content: `
      <p>LinkedIn headshots are professional portraits used on your LinkedIn profile. They should be high-quality, well-lit images that present you in a professional manner, typically showing your face and shoulders against a simple background.</p>
      
      <h2>Why LinkedIn Headshots Matter</h2>
      <ol>
        <li>First Impressions: Your headshot is often the first thing people see on your profile.</li>
        <li>Professionalism: A good headshot demonstrates your commitment to your career.</li>
        <li>Brand Consistency: It helps maintain a consistent personal brand across platforms.</li>
        <li>Networking: It makes you more approachable and memorable to potential connections.</li>
      </ol>
      
      <h2>Tips for a Great LinkedIn Headshot</h2>
      <ul>
        <li>Dress professionally and appropriately for your industry</li>
        <li>Use a simple, non-distracting background</li>
        <li>Ensure good lighting that highlights your features</li>
        <li>Smile naturally to appear approachable</li>
        <li>Make eye contact with the camera</li>
      </ul>
      
      <p>Our AI-generated LinkedIn headshots take these factors into account, providing you with a professional, high-quality image that will make your profile stand out.</p>
    `,
  },
  "model-headshots": {
    title: "Model Headshots",
    image: "/placeholder.svg",
    content: `
      <p>Model headshots are essential for aspiring and professional models. These images showcase your facial features, expressions, and versatility. They should be high-quality, well-lit, and highlight your best attributes.</p>
      
      <h2>Key Elements of Model Headshots</h2>
      <ul>
        <li>Variety of expressions and angles</li>
        <li>High-quality lighting to accentuate features</li>
        <li>Minimal makeup to show natural beauty</li>
        <li>Simple backgrounds to keep focus on the model</li>
        <li>Both close-up and full face shots</li>
      </ul>
      
      <p>Our AI-generated model headshots are designed to capture your unique look and help you stand out in the competitive modeling industry.</p>
    `,
  },
  // Add similar HTML content for other headshot types
};

export default function HeadshotTypePage({ params }) {
  const headshot = headshotTypes[params.type];

  if (!headshot) {
    notFound();
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 text-center">{headshot.title}</h1>
      <div className="grid md:grid-cols-2 gap-8 items-start">
        <div>
          <Image
            src={headshot.image}
            alt={headshot.title}
            width={600}
            height={400}
            className="rounded-lg shadow-lg"
          />
        </div>
        <div
          className="prose max-w-none"
          dangerouslySetInnerHTML={{ __html: headshot.content }}
        />
      </div>
    </div>
  );
}

export function generateStaticParams() {
  return Object.keys(headshotTypes).map((type) => ({ type }));
}
