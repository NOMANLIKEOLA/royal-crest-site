import type { ButtonHTMLAttributes, ReactNode } from "react";
import s from "./ui.module.css";

interface Props extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "className"> {
  variant?: "primary" | "pay" | "ghost";
  href?: string;
  children: ReactNode;
}

/** Renders a link when `href` is given, otherwise a button. */
export function Button({ variant = "primary", href, children, ...rest }: Props) {
  const cls = `${s.button} ${s[variant]}`;
  if (href) {
    const external = href.startsWith("http");
    return (
      <a className={cls} href={href} {...(external ? { target: "_blank", rel: "noreferrer" } : {})}>
        {children}
      </a>
    );
  }
  return <button className={cls} {...rest}>{children}</button>;
}