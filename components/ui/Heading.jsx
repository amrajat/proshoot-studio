import { figtree } from "@/lib/utils";

function Heading({ children, type = "h2", cls = "" }) {
  const Tag = ["h1", "h2", "h3", "h4"].includes(type) ? type : "h2";
  const Style = {
    h1: `text-4xl xs:text-6xl xl:text-7xl`,
    h2: `text-3xl xs:text-5xl xl:text-6xl`,
    h3: `text-2xl xs:text-4xl xl:text-5xl`,
    h4: `text-xl xs:text-3xl xl:text-4xl`,
    h5: `text-lg xs:text-2xl xl:text-3xl`,
  };

  return (
    <Tag
      className={`${Style[type]} tracking-tight font-medium text-[#1D1F1E] drop-shadow-sm ${figtree.className} ${cls}`}
    >
      {children}
    </Tag>
  );
}

export default Heading;

export function SubHeading({ children, cls = "", align = "center" }) {
  const textAlign = {
    left: "text-left",
    center: "text-center",
    right: "text-right",
  };
  return (
    <p
      className={
        "text-base md:text-lg md:mt-4 mt-2 lg:text-lg my-6 md:my-12 bg-clip-text bg-gradient-to-r from-blue-600 to-violet-500 text-transparent lowercase " +
        textAlign[align] +
        " " +
        +cls
      }
    >
      {children}
    </p>
  );
}
