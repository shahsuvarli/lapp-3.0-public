import Link from "next/link";
import { redirect } from "next/navigation";

export default async function Home() {
  redirect("/projects/create");
  // return (
  //   <main>
  //     <h1>Welcome to the Lapp</h1>
  //     <Link href={"/projects"}>
  //       <button>go to projects &gt;</button>
  //     </Link>
  //   </main>
  // );
}
