"use client";

import Image from "next/image";
import Link from "next/link";
import { signOut, useSession } from "next-auth/react";
import { PiSignOutFill } from "react-icons/pi";

function Header() {
  const { data: session, status } = useSession();

  return (
    <div className="w-full h-20 bg-[#f7f6f3] flex flex-row justify-between items-center sticky top-0 z-40 border-solid border-b-[0.5px] border-b-[#00000054]">
      <div className="h-full ml-12 flex items-center hover:cursor-pointer">
        <Link href={"/"}>
          <Image
            src={"/logo.png"}
            width={100}
            height={100}
            alt="logo"
            className="object-contain w-auto h-auto"
            priority
          />
        </Link>
      </div>
      {status === "authenticated" ? (
        <div className="flex flex-row items-center mr-8 gap-2 max-w-[310px]">
          <span
            onClick={() => signOut()}
            className="hover:cursor-pointer rounded-full p-2"
          >
            <PiSignOutFill size={27} color="#e7914e" />
          </span>
          <span className="opacity-60">
            <Image
              width={40}
              height={40}
              alt="user"
              src={session?.user.image || "/user.png"}
              className="border border-solid border-[#d5d5d5] rounded-full"
            />
          </span>

          <div className="hidden sm:block">
            <p className="text-[17px] font-medium text-[#313131ab]">
              {session?.user.name}
            </p>
            <p className="text-base  text-ellipsis overflow-hidden whitespace-nowrap text-[#999998]">
              {session?.user?.position}
            </p>
          </div>
        </div>
      ) : status === "unauthenticated" ? (
        <div className="flex flex-row items-center mr-8 gap-2 max-w-[310px]">
          <Link href={"/auth"} legacyBehavior>
            <a className="text-[#313131] font-medium text-[17px] hover:cursor-pointer">
              Login
            </a>
          </Link>
        </div>
      ) : (
        <div>loading</div>
      )}
    </div>
  );
}

export default Header;
