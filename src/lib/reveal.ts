const STAGGER_MS = 50;
const STAGGER_CAP = 4;

export function initReveal() {
  const targets = Array.from(document.querySelectorAll<HTMLElement>('[data-reveal]'));

  if (targets.length === 0) {
    return;
  }

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    for (const target of targets) {
      target.classList.add('is-revealed');
    }
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) {
          continue;
        }

        const target = entry.target as HTMLElement;
        const group = target.closest<HTMLElement>('[data-reveal-group]');

        if (group) {
          const siblings = Array.from(group.querySelectorAll<HTMLElement>('[data-reveal]'));
          const index = Math.min(siblings.indexOf(target), STAGGER_CAP);
          target.style.transitionDelay = `${Math.max(0, index) * STAGGER_MS}ms`;
        }

        target.classList.add('is-revealed');
        observer.unobserve(target);
      }
    },
    { threshold: 0.12, rootMargin: '0px 0px -8% 0px' }
  );

  for (const target of targets) {
    observer.observe(target);
  }
}
