import Image from "next/image";

function Logo({ type = "black" }) {
  return (
    <Image
      alt="proshoot.co logo"
      className="w-28 h-auto text-center"
      src={`/logo/logo-${type}.svg`}
      width={116}
      height={32}
    />
  );
}

export default Logo;
