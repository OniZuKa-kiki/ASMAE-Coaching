const easeOut = [0.22, 1, 0.36, 1] as const;

export const fadeFast = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
  transition: { duration: 0.18, ease: easeOut },
};

/** Glissement latéral discret — sans rebond */
export const slideFromLeft = {
  initial: { x: "-100%" },
  animate: { x: 0 },
  exit: { x: "-100%" },
  transition: { duration: 0.22, ease: easeOut },
};

export const dropdownMenu = {
  initial: { opacity: 0, y: -4 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -4 },
  transition: { duration: 0.16, ease: easeOut },
};
