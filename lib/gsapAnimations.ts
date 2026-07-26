import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { motion, motionSelectors } from "@/lib/motion/config";
import { prefersReducedMotion } from "@/lib/motion/reduced-motion";

let registered = false;

function registerGsap() {
  if (registered || typeof window === "undefined") return;
  gsap.registerPlugin(ScrollTrigger);
  registered = true;
}

function revealImmediately(root: ParentNode) {
  gsap.set(
    root.querySelectorAll(
      `${motionSelectors.hero},${motionSelectors.sections},${motionSelectors.cards}`,
    ),
    { clearProps: "all", autoAlpha: 1 },
  );
}

export function initWebsiteMotion(scope: HTMLElement) {
  registerGsap();
  if (prefersReducedMotion()) {
    revealImmediately(scope);
    return () => undefined;
  }

  const context = gsap.context(() => {
    const hero = gsap.utils.toArray<HTMLElement>(motionSelectors.hero, scope);
    if (hero.length) {
      gsap.from(hero.slice(0, 8), {
        y: motion.distance.hero,
        autoAlpha: 0,
        duration: motion.duration.hero,
        ease: motion.ease.entrance,
        stagger: motion.stagger.hero,
        clearProps: "transform,opacity,visibility",
      });
    }

    gsap.utils
      .toArray<HTMLElement>(motionSelectors.sections, scope)
      .slice(0, 36)
      .forEach((section) => {
        gsap.from(section, {
          y: motion.distance.section,
          autoAlpha: 0,
          duration: motion.duration.section,
          ease: motion.ease.smooth,
          clearProps: "transform,opacity,visibility",
          scrollTrigger: {
            trigger: section,
            start: "top 88%",
            once: true,
          },
        });
      });

    const cards = gsap.utils
      .toArray<HTMLElement>(motionSelectors.cards, scope)
      .slice(0, 48);
    const groups = new Map<Element, HTMLElement[]>();
    cards.forEach((card) => {
      const parent = card.parentElement ?? scope;
      groups.set(parent, [...(groups.get(parent) ?? []), card]);
    });
    groups.forEach((items, group) => {
      gsap.from(items.slice(0, 8), {
        y: motion.distance.small,
        autoAlpha: 0,
        duration: motion.duration.reveal,
        ease: motion.ease.smooth,
        stagger: motion.stagger.normal,
        clearProps: "transform,opacity,visibility",
        scrollTrigger: {
          trigger: group,
          start: "top 90%",
          once: true,
        },
      });
    });

    gsap.utils
      .toArray<HTMLElement>(
        ".success-state, .login-alert.success, [data-motion='success']",
        scope,
      )
      .forEach((element) => {
        gsap.from(element, {
          scale: 0.96,
          autoAlpha: 0,
          duration: motion.duration.success,
          ease: motion.ease.entrance,
          clearProps: "transform,opacity,visibility",
        });
      });

    gsap.utils
      .toArray<HTMLElement>(
        ".login-alert.error, .auth-alert.error, [role='alert']",
        scope,
      )
      .forEach((element) => {
        gsap.from(element, {
          x: -5,
          autoAlpha: 0,
          duration: motion.duration.reveal,
          ease: motion.ease.smooth,
          clearProps: "transform,opacity,visibility",
        });
      });
  }, scope);

  ScrollTrigger.refresh();
  return () => {
    context.revert();
    ScrollTrigger.getAll().forEach((trigger) => {
      if (scope.contains(trigger.trigger as Node | null)) trigger.kill();
    });
  };
}

export const initHomepageAnimations = () => {
  const scope = document.querySelector<HTMLElement>(".kp-approved-home");
  return scope ? initWebsiteMotion(scope) : () => undefined;
};
