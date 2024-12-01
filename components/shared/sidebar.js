"use client";

import Link from "next/link";
import { menu } from "utils/menu";
import { MdExpandLess } from "react-icons/md";
import { useRouter } from "next/navigation";
import { useState } from "react";

const Children = ({ item }) => {
  const [open, setOpen] = useState(item.open);
  const router = useRouter();
  return (
    <li
      key={item.id}
      className="mb-2 hover:cursor-pointer"
      onClick={() => {
        setOpen(!open);
        item.children.length || router.push(item.link);
      }}
    >
      <div className="rounded-sm flex flex-row justify-between items-center px-3 py-2 hover:bg-[#dededd]">
        <div className="flex flex-row justify-between gap-3">
          <span>{item.img}</span>
          <p>{item.displayName}</p>
        </div>
        <MdExpandLess
          size={25}
          style={{
            transform: open ? "rotate(0deg)" : "rotate(180deg)",
            transition: "all 0.3s ease-in-out",
            display: item.children.length ? "block" : "none",
          }}
        />
      </div>
      <ul className={`${open ? "flex flex-col" : "hidden"}`}>
        {item.children.map((child) => (
          <Link href={child.link} key={child.id} passHref>
            <li className="no-underline text-[#313131] pl-12 hover:bg-[#dededd] py-2">
              <div
                className={
                  router.pathname === child.link
                    ? "bg-[#f089381a] items-center px-3 py-2"
                    : "bg-transparent"
                }
              >
                <p>- {child.displayName}</p>
              </div>
            </li>
          </Link>
        ))}
      </ul>
    </li>
  );
};

export const Sidebar = () => {
  return (
    <div className="bg-[#f7f6f3] w-72 h-screen rounded-md box-border lg:flex flex-col hidden">
      <span className="text-xl p-4 text-black w-full">
        <p>Main Navigation</p>
      </span>
      <ul>
        {menu.map((item) => (
          <Children item={item} key={item.id} />
        ))}
      </ul>
    </div>
  );
};
