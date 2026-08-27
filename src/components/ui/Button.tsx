import Link from "next/link";
import type { ButtonHTMLAttributes, MouseEventHandler, ReactNode } from "react";
import { cn } from "@/lib/utils";

type ButtonVariant = "gold" | "amber" | "navy" | "outline" | "ghost" | "white";

const variants: Record<ButtonVariant, string> = {
  amber: "bg-gradient-to-r from-amber-600 to-amber-500 text-white border border-amber-500/20 shadow-[0_4px_14px_0_rgba(217,119,6,0.25)] hover:shadow-[0_6px_20px_0_rgba(217,119,6,0.35)] hover:brightness-105",
  gold: "bg-gradient-to-r from-gold to-amber-500 text-white border border-gold/20 shadow-[0_4px_14px_0_rgba(196,150,42,0.2)] hover:shadow-[0_6px_20px_0_rgba(196,150,42,0.3)] hover:brightness-105",
  navy: "bg-gradient-to-r from-navy via-navy-light to-navy-dark dark:from-navy-dark dark:via-navy dark:to-[var(--surface)] text-white border border-white/10 shadow-md hover:shadow-lg hover:brightness-110",
  outline: "border border-amber-500/40 text-amber-600 dark:text-amber-400 hover:bg-amber-500/10 backdrop-blur-sm hover:border-amber-500",
  ghost: "text-text-secondary hover:text-amber-500 hover:bg-amber-500/10",
  white: "backdrop-blur-md bg-white/10 border border-white/20 text-white hover:bg-white/20 hover:border-white/30 shadow-sm hover:shadow-md",
};

type SharedProps = {
  children: ReactNode;
  variant?: ButtonVariant;
  className?: string;
};

type LinkButtonProps = SharedProps & {
  href: string;
  onClick?: MouseEventHandler<HTMLAnchorElement>;
  type?: never;
  disabled?: never;
};

type NativeButtonProps = SharedProps &
  ButtonHTMLAttributes<HTMLButtonElement> & {
    href?: never;
  };

export function Button(props: LinkButtonProps | NativeButtonProps) {
  const { children, variant = "amber", className } = props;
  const classes = cn(
    "inline-flex min-h-10 items-center justify-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold transition-all duration-200 hover:-translate-y-0.5 disabled:pointer-events-none disabled:opacity-60 cursor-pointer",
    variants[variant],
    className
  );

  if ((props as LinkButtonProps).href) {
    const { href, onClick } = props as LinkButtonProps;
    return (
      <Link href={href} className={classes} onClick={onClick}>
        {children}
      </Link>
    );
  }

  const { href: _href, variant: _variant, className: _className, children: _children, ...buttonProps } = props as NativeButtonProps;

  return (
    <button className={classes} {...buttonProps}>
      {children}
    </button>
  );
}

export default Button;
