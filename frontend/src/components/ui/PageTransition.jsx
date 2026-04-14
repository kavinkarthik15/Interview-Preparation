import { useEffect, useState, useRef } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * 🎬 PageTransition – Smooth page transition wrapper
 *
 * Wraps route content with enter/exit animations.
 * Uses CSS classes for GPU-accelerated transitions.
 */
export function PageTransition({ children }) {
  const location = useLocation();
  const [displayedChildren, setDisplayedChildren] = useState(children);
  const [transitionState, setTransitionState] = useState('entered'); // 'entering' | 'entered' | 'exiting'
  const prevPathRef = useRef(location.pathname);
  const enterTimerRef = useRef(null);

  useEffect(() => {
    if (location.pathname !== prevPathRef.current) {
      // Start exit
      setTransitionState('exiting');

      const exitTimer = setTimeout(() => {
        setDisplayedChildren(children);
        setTransitionState('entering');
        prevPathRef.current = location.pathname;

        // Entering -> entered
        enterTimerRef.current = setTimeout(() => {
          setTransitionState('entered');
        }, 300);
      }, 150);

      return () => {
        clearTimeout(exitTimer);
        clearTimeout(enterTimerRef.current);
      };
    } else {
      setDisplayedChildren(children);
    }
  }, [children, location.pathname]);

  const transitionClasses = {
    entering: 'ds-page-enter',
    entered: 'ds-page-entered',
    exiting: 'ds-page-exit',
  };

  return (
    <div className={`ds-page-transition ${transitionClasses[transitionState]}`}>
      {displayedChildren}
    </div>
  );
}

export default PageTransition;
