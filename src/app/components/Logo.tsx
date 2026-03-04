"use client";

import Image from "next/image";
import logo from "@/utils/logo.png";

interface LogoProps {
  /** Size variant: 'sm' (52px), 'md' (64px), 'lg' (82px) */
  size?: "sm" | "md" | "lg";
  /** Optional wrapper className (e.g. for sidebar, navbar) */
  className?: string;
  /** Show subtle hover animation */
  hover?: boolean;
}

const sizes = {
  sm: 52,
  md: 64,
  lg: 82,
};

export default function Logo({ size = "sm", className = "", hover = true }: LogoProps) {
  const px = sizes[size];
  return (
    <div
      className={`logo-mark ${className}`}
      style={{
        width: px,
        height: px,
        minWidth: px,
        minHeight: px,
        transition: hover ? "box-shadow 0.22s ease, transform 0.22s ease" : undefined,
      }}
      title="جامعة العاصمة"
    >
      <Image
        src={logo}
        alt="شعار جامعة العاصمة"
        width={px}
        height={px}
        sizes={`${px}px`}
        priority
        style={{ objectFit: "contain", imageRendering: "crisp-edges" }}
      />
    </div>
  );
}
