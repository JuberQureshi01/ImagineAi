
import { useState, useEffect, useRef } from 'react';

export const useIntersectionObserver = (options) => {
  const ref = useRef(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setIsVisible(true);
        observer.unobserve(entry.target);
      }
    }, options);

    const currentElement = ref.current;
    if (currentElement) {
      observer.observe(currentElement);
    }

    return () => {
      if (currentElement) {
        observer.unobserve(currentElement);
      }
    };
  }, [ref, options]);

  return [ref, isVisible];
};

export const useAnimatedCounter = (targetValue, duration = 2000) => {
  const [count, setCount] = useState(0);
  const [ref, isVisible] = useIntersectionObserver({ threshold: 0.5, triggerOnce: true });

  useEffect(() => {
    if (isVisible) {
      let start = 0;
      const end = targetValue;
      if (start === end) return;

      const totalFrames = duration / (1000 / 60);
      const increment = end / totalFrames;
      let current = 0;

      const timer = setInterval(() => {
        current += increment;
        if (current >= end) {
          clearInterval(timer);
          setCount(end);
        } else {
          setCount(Math.ceil(current));
        }
      }, 16);

      return () => clearInterval(timer);
    }
  }, [isVisible, targetValue, duration]);

  return [ref, count];
};

