import Image from "next/image";

function Logo() {
  return (
    <picture>
      <source
        srcSet={"/logo/logo-no-background-dark.svg"}
        media="(prefers-color-scheme: dark)"
      />
      <Image
        alt="proshoot.co logo"
        className="w-28 h-auto text-center"
        src="/logo/logo-no-background.svg"
        width={116}
        height={32}
      />
    </picture>
  );
}

export default Logo;

{
  /* <picture>
        <source srcSet={MyDarkImage.src} media="(prefers-color-scheme: dark)" />
        <Image
            src={MyLightImage}
            alt="My image"
            width={300}
            height={300}
        />
      </picture> */
}
