import { authOptions } from "utils/auth";
import { getServerSession } from "next-auth";

export default async function page() {
  const session = await getServerSession(authOptions);

  if (session?.user.role !== "admin") {
    return (
      <div className="flex flex-col gap-5 animate-[rise_1s_ease-in-out] lg:w-[calc(100%-310px)] w-full bg-[#f7f6f3] p-4 rounded-md">
        Unauthorized
      </div>
    );
  }
  return (
    <div className="flex flex-col gap-5 animate-[rise_1s_ease-in-out] lg:w-[calc(100%-310px)] w-full bg-[#f7f6f3] p-4 rounded-md">
      Admin very important data
    </div>
  );
}
