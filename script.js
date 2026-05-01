gsap.registerPlugin(ScrollTrigger);

const yearSpan = document.getElementById("year");
if (yearSpan) yearSpan.textContent = new Date().getFullYear();

document.addEventListener("DOMContentLoaded", () => {
  const hiddenElements = document.querySelectorAll(".hidden-on-load");
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const cursor = document.querySelector(".cursor-dot");
  const signatureText = document.querySelector(".signature-text");
  const signatureFlourish = document.querySelector(".signature-flourish");
  const signatureDot = document.querySelector(".signature-dot");

  let hasTouch = false;
  window.addEventListener(
    "touchstart",
    () => {
      hasTouch = true;
    },
    { once: true, passive: true }
  );

  function initScrollReveals() {
    gsap.utils.toArray(".gs-reveal").forEach((elem) => {
      gsap.fromTo(
        elem,
        { y: 42, opacity: 0 },
        {
          scrollTrigger: {
            trigger: elem,
            start: "top 85%",
            toggleActions: "play none none reverse",
          },
          y: 0,
          opacity: 1,
          duration: 1,
          ease: "power3.out",
        }
      );
    });
  }

  function revealInstant() {
    gsap.set(hiddenElements, { autoAlpha: 1, y: 0 });
    gsap.set(".gs-reveal", { opacity: 1, y: 0 });
    if (signatureDot) gsap.set(signatureDot, { opacity: 1, scale: 1 });
    initScrollReveals();
  }

  if (reduceMotion) {
    revealInstant();
  } else {
    if (signatureFlourish) {
      const length = signatureFlourish.getTotalLength();
      gsap.set(signatureFlourish, {
        strokeDasharray: length,
        strokeDashoffset: length,
      });
    }

    gsap.set(signatureText, {
      autoAlpha: 0,
      y: 10,
      rotate: -1,
      transformOrigin: "left center",
    });

    gsap.set(signatureDot, {
      autoAlpha: 0,
      scale: 0,
      transformOrigin: "center center",
    });

    gsap.set(hiddenElements, {
      y: 18,
      autoAlpha: 0,
    });

    const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

    if (signatureFlourish) {
      tl.to(signatureFlourish, {
        strokeDashoffset: 0,
        duration: 1.4,
      });
    }

    tl.to(
      signatureText,
      {
        autoAlpha: 1,
        y: 0,
        rotate: 0,
        duration: 0.65,
      },
      "-=0.82"
    )
      .to(
        signatureDot,
        {
          autoAlpha: 1,
          scale: 1,
          duration: 0.34,
          ease: "back.out(2.4)",
        },
        "-=0.22"
      )
      .to(
        hiddenElements,
        {
          autoAlpha: 1,
          y: 0,
          duration: 0.9,
          stagger: 0.12,
        },
        "-=0.12"
      )
      .add(initScrollReveals, "-=0.18");
  }

  if (cursor && window.innerWidth > 768 && !hasTouch) {
    const cursorX = gsap.quickSetter(cursor, "x", "px");
    const cursorY = gsap.quickSetter(cursor, "y", "px");

    window.addEventListener("mousemove", (e) => {
      cursorX(e.clientX);
      cursorY(e.clientY);
    });

    const interactives = document.querySelectorAll("a, button, .project-item, .blog-card");
    interactives.forEach((el) => {
      el.addEventListener("mouseenter", () => {
        gsap.to(cursor, {
          scale: 2.3,
          backgroundColor: "#fff",
          duration: 0.25,
        });
      });

      el.addEventListener("mouseleave", () => {
        gsap.to(cursor, {
          scale: 1,
          backgroundColor: "#fff",
          duration: 0.25,
        });
      });
    });
  }

  document.querySelectorAll(".magnetic").forEach((btn) => {
    btn.addEventListener("mousemove", (e) => {
      if (hasTouch || window.innerWidth <= 768) return;

      const rect = btn.getBoundingClientRect();
      const x = (e.clientX - rect.left - rect.width / 2) * 0.28;
      const y = (e.clientY - rect.top - rect.height / 2) * 0.28;

      gsap.to(btn, {
        x,
        y,
        duration: 0.28,
        ease: "power2.out",
      });
    });

    btn.addEventListener("mouseleave", () => {
      if (hasTouch || window.innerWidth <= 768) return;

      gsap.to(btn, {
        x: 0,
        y: 0,
        duration: 0.7,
        ease: "elastic.out(1, 0.32)",
      });
    });
  });
});