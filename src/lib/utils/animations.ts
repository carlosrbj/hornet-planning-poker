import type { Variants } from 'framer-motion'

export const cardFlip: Variants = {
  hidden: { rotateY: 0 },
  visible: { rotateY: 180 },
}

export const cardSelect: Variants = {
  idle: { scale: 1, boxShadow: 'none' },
  selected: {
    scale: 1.08,
    boxShadow: '0 0 20px rgba(245, 158, 11, 0.6)',
    transition: { type: 'spring', stiffness: 300, damping: 20 },
  },
}

export const shake: Variants = {
  idle: { x: 0 },
  shake: {
    x: [-5, 5, -5, 5, 0],
    transition: { duration: 0.4 },
  },
}

export const popIn: Variants = {
  hidden: { scale: 0, opacity: 0 },
  visible: {
    scale: 1,
    opacity: 1,
    transition: { type: 'spring', stiffness: 400, damping: 15 },
  },
}

export const fadeSlideUp: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.3 },
  },
  exit: {
    opacity: 0,
    y: -20,
    transition: { duration: 0.2 },
  },
}

export const emojiFloat: Variants = {
  initial: { opacity: 1, y: 0, x: 0 },
  animate: {
    opacity: 0,
    y: -100,
    transition: { duration: 2, ease: 'easeOut' },
  },
}

export const staggerContainer: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.1,
    },
  },
}
