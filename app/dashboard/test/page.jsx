import { getStudioAttributes } from "@/lib/supabase/actions/server";
import { json } from "stream/consumers";
async function page() {
  const result = await getStudioAttributes("qnegytvnjxrm40chrpjraktksm");
  return <p>{JSON.stringify(result)}</p>;
}

export default page;
