import type { ComponentProps } from "react";
import Image from "next/image";
import Link from "next/link";

type BrandLogoProps = {
  href?: ComponentProps<typeof Link>["href"];
  priority?: boolean;
  className?: string;
  imageClassName?: string;
};

export function BrandLogo({ href = "/", priority = false, className = "", imageClassName = "" }: BrandLogoProps) {
  return (
    <Link href={href} aria-label="Young & Hungry home" className={`inline-flex items-center ${className}`.trim()}>
      <Image
        src="/young-and-hungry-horizontal-logo.svg"
        alt="Young & Hungry"
        width={1200}
        height={300}
        priority={priority}
        className={`h-10 w-auto object-contain object-left ${imageClassName}`.trim()}
      />
    </Link>
  );
}
