import ViewGeneratedImage from "@/components/dashboard/studio/ViewGeneratedImage";

async function ViewStudio({ params }) {
  const headers = { Authorization: `Bearer ${process.env.ASTRIA_API_KEY}` };
  const response = await fetch(
    `https://api.astria.ai/tunes/${params.id}/prompts`,
    {
      headers: headers,
    }
  );
  const prompts = await response.json();
  console.log(prompts);

  return (
    // male has 90 prompts, and female has
    <div className="max-w-7xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14 mx-auto">
      {prompts.map((prompt) => {
        return (
          <div key={prompt.id} className="mb-8 p-4">
            {/* <>{JSON.stringify(prompt)}</> */}
            <p>{prompt.id}</p>
            <p>{prompt.text}</p>
            {/* Grid */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Card */}
              {prompt.images.map((image) => (
                <ViewGeneratedImage key={image} image={image} />
              ))}
              {/* End Card */}
            </div>
            {/* End Grid */}
          </div>
        );
      })}
    </div>
  );
}

export default ViewStudio;
