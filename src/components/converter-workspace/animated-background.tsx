"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { Children, cloneElement, useId, type ReactElement } from "react";

interface AnimatedBackgroundProps {
  children: ReactElement<{ "data-id": string; className?: string; children?: React.ReactNode }>[];
  value: string;
}

// Adapted from https://motion-primitives.com/docs/animated-background for controlled tabs.
export function AnimatedBackground({ children, value }: AnimatedBackgroundProps) {
  const id = useId();
  const reduceMotion = useReducedMotion();

  return Children.map(children, (child) => {
    const selected = child.props["data-id"] === value;

    return cloneElement(
      child,
      {
        className: `${child.props.className ?? ""} animated-tab`,
      },
      <>
        <AnimatePresence initial={false}>
          {selected && (
            <motion.span
              aria-hidden="true"
              className="animated-tab-background"
              layoutId={`tab-background-${id}`}
              transition={reduceMotion ? { duration: 0 } : { duration: 0.22 }}
            />
          )}
        </AnimatePresence>
        <span className="animated-tab-label">{child.props.children}</span>
      </>,
    );
  });
}
