"use client";

import * as React from "react";
import { CaretRightIcon } from "@phosphor-icons/react";

import { cn } from "../lib/cn";
import {
  featureCardVariants,
  featureCardLeadingVariants,
  featureCardTrailingVariants,
  featureCardTextVariants,
  featureCardTitleRowVariants,
  featureCardCaretVariants,
} from "./featureCardVariants";

export interface FeatureCardProps extends Omit<
  React.ComponentProps<"a">,
  "title" | "ref"
> {
  /** Title line (`body-02-medium`). Accessible name of an interactive card. */
  title: React.ReactNode;
  /** Optional subtitle line (`body-03`, muted). */
  subtitle?: React.ReactNode;
  /** Optional 24px leading icon slot (decorative, `aria-hidden`). */
  leading?: React.ReactNode;
  /** Optional 24px trailing icon slot (decorative, `aria-hidden`). */
  trailing?: React.ReactNode;
  /** Show the inline caret after the title. Default `true` (matches Figma). */
  caret?: boolean;
  /**
   * Render the single element child as the root (a router `<Link>` / `<a>`),
   * keeping all card styling. Requires exactly one valid element child.
   */
  asChild?: boolean;
  /** Ref forwarded to the root element. */
  ref?: React.Ref<HTMLElement>;
}

/** Assign a node to several refs at once (object or callback form). */
function setRef<T>(ref: React.Ref<T> | undefined, node: T) {
  if (typeof ref === "function") ref(node);
  else if (ref) (ref as React.MutableRefObject<T | null>).current = node;
}

function FeatureCard({
  title,
  subtitle,
  leading,
  trailing,
  caret = true,
  asChild = false,
  href,
  className,
  children,
  ref,
  ...props
}: FeatureCardProps) {
  const interactive = asChild || href != null;

  const content = (
    <>
      {leading != null && (
        <span
          data-slot="feature-card-leading"
          aria-hidden="true"
          className={featureCardLeadingVariants()}
        >
          {leading}
        </span>
      )}
      <span data-slot="feature-card-text" className={featureCardTextVariants()}>
        <span className={featureCardTitleRowVariants()}>
          <span className="body-02-medium truncate text-card-foreground">
            {title}
          </span>
          {caret && (
            <span
              data-slot="feature-card-caret"
              aria-hidden="true"
              className={featureCardCaretVariants()}
            >
              <CaretRightIcon />
            </span>
          )}
        </span>
        {subtitle != null && (
          <span className="body-03 truncate text-card-foreground-muted">
            {subtitle}
          </span>
        )}
      </span>
      {trailing != null && (
        <span
          data-slot="feature-card-trailing"
          aria-hidden="true"
          className={featureCardTrailingVariants()}
        >
          {trailing}
        </span>
      )}
    </>
  );

  const rootClassName = cn(featureCardVariants({ interactive }), className);

  if (asChild) {
    if (!React.isValidElement(children)) {
      throw new Error(
        "FeatureCard: `asChild` requires a single React element child",
      );
    }
    const child = children as React.ReactElement<Record<string, unknown>>;
    const childProps = child.props;
    return React.cloneElement(
      child,
      {
        ...props,
        ...childProps,
        "data-slot": "feature-card",
        ref: (node: HTMLElement | null) => {
          setRef(ref as React.Ref<HTMLElement>, node);
          setRef((childProps as { ref?: React.Ref<HTMLElement> }).ref, node);
        },
        className: cn(
          rootClassName,
          childProps.className as string | undefined,
        ),
        onClick: (event: React.MouseEvent<HTMLElement>) => {
          (
            props as { onClick?: React.MouseEventHandler<HTMLElement> }
          ).onClick?.(event);
          (
            childProps as { onClick?: React.MouseEventHandler<HTMLElement> }
          ).onClick?.(event);
        },
        style: {
          ...(props as { style?: React.CSSProperties }).style,
          ...(childProps as { style?: React.CSSProperties }).style,
        },
      },
      content,
      childProps.children as React.ReactNode,
    );
  }

  if (href != null) {
    return (
      <a
        data-slot="feature-card"
        href={href}
        className={rootClassName}
        ref={ref as React.Ref<HTMLAnchorElement>}
        {...props}
      >
        {content}
      </a>
    );
  }

  return (
    <div
      data-slot="feature-card"
      className={rootClassName}
      ref={ref as React.Ref<HTMLDivElement>}
      {...(props as React.ComponentProps<"div">)}
    >
      {content}
    </div>
  );
}

export { FeatureCard };
