"use client";

import Script from "next/script";

function TallyContactForm() {
  return (
    <>
      <iframe
        data-tally-src="https://tally.so/embed/wkARae?hideTitle=1&transparentBackground=1&dynamicHeight=1"
        loading="lazy"
        width="100%"
        height={1}
        frameBorder={0}
        marginHeight={0}
        marginWidth={0}
        title="Contact Us"
      />

      <Script
        id="tally-js"
        src="https://tally.so/widgets/embed.js"
        onLoad={() => {
          Tally.loadEmbeds();
        }}
      />
    </>
  );
}

export default TallyContactForm;
