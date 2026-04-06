"use client";

import Link from "next/link";
import { ReactNode } from "react";

interface ButtonLinkProps {
    url: string;
    text: string;
    icon?: ReactNode;
}

export default function BackButton({ url, text, icon }: ButtonLinkProps) {
    return (
        <Link href={url}>
            <button
                className="flex items-center float-right gap-2 cursor-pointer
                bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-primary-darker)] hover:from-[var(--color-primary-dark)] 
                hover:to-[var(--color-secondary-darker)] transition-all 
              text-white px-4 py-2 rounded-md font-semibold"
            >
                {icon}
                {text}
            </button>
        </Link>
    );
}
