import { useEffect, useRef, useState } from 'react';
import type { RefObject } from 'react';

interface UseScrollAnimationOptions {
  threshold?: number;
  rootMargin?: string;
  triggerOnce?: boolean;
}

export const useScrollAnimation = <T extends HTMLElement>(
  options: UseScrollAnimationOptions = {}
): [RefObject<T | null>, boolean] => {
  const { threshold = 0.1, rootMargin = '0px 0px -50px 0px', triggerOnce = true } = options;

  const ref = useRef<T>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
            if (triggerOnce) {
              observer.unobserve(element);
            }
          } else if (!triggerOnce) {
            setIsVisible(false);
          }
        });
      },
      { threshold, rootMargin }
    );

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, [threshold, rootMargin, triggerOnce]);

  return [ref, isVisible];
};

// Hook for animating multiple elements
export const useScrollAnimationList = (count: number, delay: number = 100) => {
  const [visibleItems, setVisibleItems] = useState<Set<number>>(new Set());
  const [isContainerVisible, setIsContainerVisible] = useState(false);
  const [containerNode, setContainerNode] = useState<HTMLDivElement | null>(null);

  // Use a callback ref to track when the container is attached/detached
  const containerRef = (node: HTMLDivElement | null) => {
    setContainerNode(node);
  };

  // Set up IntersectionObserver when container is available
  useEffect(() => {
    if (!containerNode) return;

    // If already visible, don't re-observe
    if (isContainerVisible) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsContainerVisible(true);
            observer.unobserve(containerNode);
          }
        });
      },
      { threshold: 0.1 }
    );

    observer.observe(containerNode);

    return () => observer.disconnect();
  }, [containerNode, isContainerVisible]);

  // Animate items when container becomes visible
  useEffect(() => {
    if (!isContainerVisible) return;

    const timeouts: ReturnType<typeof setTimeout>[] = [];

    for (let i = 0; i < count; i++) {
      const timeout = setTimeout(() => {
        setVisibleItems((prev) => new Set([...prev, i]));
      }, i * delay);
      timeouts.push(timeout);
    }

    return () => {
      timeouts.forEach((timeout) => clearTimeout(timeout));
    };
  }, [isContainerVisible, count, delay]);

  return { containerRef, visibleItems, isContainerVisible };
};
