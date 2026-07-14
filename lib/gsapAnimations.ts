import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

export function initHomepageAnimations() {
  gsap.registerPlugin(ScrollTrigger);

  const ctx = gsap.context(() => {
    const mm = gsap.matchMedia();
    mm.add("(prefers-reduced-motion: reduce)", () => {
      gsap.set(".hero-reveal, .reveal-up, .stagger-item, .dashboard-reveal", { clearProps: "all", opacity: 1 });
    });
    mm.add("(prefers-reduced-motion: no-preference)", () => {
    gsap.from(".hero-reveal", {
      y: 34,
      opacity: 0,
      duration: 0.9,
      ease: "power3.out",
      stagger: 0.12,
    });

    gsap.to(".phone-float", {
      y: -18,
      duration: 2.8,
      repeat: -1,
      yoyo: true,
      ease: "sine.inOut",
    });

    gsap.to(".qr-pattern-layer, .qr-strip", {
      backgroundPositionX: "72px",
      scrollTrigger: {
        trigger: ".hero-section",
        scrub: 1.2,
      },
    });

    gsap.to(".floating-card-slow, .floating-card", {
      y: -10,
      x: 4,
      duration: 3.4,
      repeat: -1,
      yoyo: true,
      ease: "sine.inOut",
      stagger: 0.25,
    });

    gsap.utils.toArray<HTMLElement>(".reveal-up").forEach((el) => {
      gsap.from(el, {
        y: 42,
        opacity: 0,
        duration: 0.85,
        ease: "power3.out",
        scrollTrigger: {
          trigger: el,
          start: "top 82%",
        },
      });
    });

    gsap.utils.toArray<HTMLElement>(".stagger-group").forEach((group) => {
      gsap.from(group.querySelectorAll(".stagger-item"), {
        y: 30,
        opacity: 0,
        duration: 0.7,
        stagger: 0.08,
        ease: "power3.out",
        scrollTrigger: {
          trigger: group,
          start: "top 78%",
        },
      });
    });

    gsap.utils.toArray<HTMLElement>(".dashboard-reveal").forEach((el) => {
      gsap.from(el, {
        y: 60,
        opacity: 0,
        scale: 0.96,
        duration: 1,
        ease: "power3.out",
        scrollTrigger: {
          trigger: el,
          start: "top 80%",
        },
      });
    });

    gsap.utils.toArray<HTMLElement>(".parallax-soft").forEach((el) => {
      gsap.to(el, {
        yPercent: -8,
        ease: "none",
        scrollTrigger: {
          trigger: el,
          start: "top bottom",
          end: "bottom top",
          scrub: true,
        },
      });
    });
    });
    return () => mm.revert();
  });

  return () => ctx.revert();
}
