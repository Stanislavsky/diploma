import React from 'react';
import { motion } from 'framer-motion';

// Анимация для карточки (при открытии и закрытии)
export const cardAnimation = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: {duration: 0.5, ease: 'easeOut' },
};

// Анимация для чата (при открытии и закрытии)
export const chatAnimation = {
  initial: { opacity: 0, scale: 0.9 },
  animate: { opacity: 1, scale: 1 },
  transition: {duration: 0.5, ease: 'easeOut' } // Плавный переход

};

// Оборачиваем motion.div с анимацией в отдельную функцию для использования в компонентах
export const AnimatedDiv = ({ children, animation }) => (
  <motion.div {...animation}>{children}</motion.div>
);