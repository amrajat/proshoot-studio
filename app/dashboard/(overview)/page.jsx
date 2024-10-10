import Link from "next/link";
import Container from "@/components/dashboard/Container";
import { HiChevronRight, HiPlus } from "react-icons/hi2";
import Heading from "@/components/ui/Heading";
import BuyStudio from "../studio/buy/page";

async function Dashboard() {
  return <BuyStudio />;
}

export default Dashboard;
