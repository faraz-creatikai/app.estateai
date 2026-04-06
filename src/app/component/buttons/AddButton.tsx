"use client";

import Link from "next/link";
import { ReactNode } from "react";
import LoaderCircle from "../LoaderCircle"

interface ButtonLinkProps {
  url: string;
  text: string;
  icon?: ReactNode;
}

export default function AddButton({ url, text, icon }: ButtonLinkProps) {
  return (
    <Link href={url}>
     
      <button
        className="flex items-center float-right gap-2 bg-gradient-to-r cursor-pointer 
        from-[var(--color-primary-dark)] to-[var(--color-secondary)] 
        hover:from-[var(--color-primary-darker)] hover:to-[var(--color-secondary-dark)] 
        text-white px-4 py-2 rounded-md font-semibold"
      >
        {icon}
        {text}
      </button>
    </Link>
  );
}
