gsap.registerPlugin(ScrollTrigger);

document.addEventListener("DOMContentLoaded", () => {
    
    // 1. Footer Year
    const yearSpan = document.getElementById('year');
    if (yearSpan) yearSpan.textContent = new Date().getFullYear();

    // Touch Check
    let hasTouch = false;
    window.addEventListener('touchstart', () => { hasTouch = true; }, { once: true, passive: true });

    // ==========================================
    // 2. MASTER INTRO: SIGNATURE & REVEAL
    // ==========================================
    const wordPath = document.querySelector('.signature-word');
    const dot = document.querySelector('.signature-dot');
    const hiddenElements = document.querySelectorAll('.hidden-on-load');

    if (wordPath && dot) {
        const length = wordPath.getTotalLength();

        gsap.set(wordPath, { strokeDasharray: length, strokeDashoffset: length });
        gsap.set(dot, { scale: 0, opacity: 0 });
        gsap.set(hiddenElements, { y: 15, autoAlpha: 0 });

        const tl = gsap.timeline();

        // Draw Signature
        tl.to(wordPath, { strokeDashoffset: 0, duration: 2.2, ease: "power2.inOut" })
          .to(dot, { scale: 1, opacity: 1, duration: 0.4, ease: "back.out(2)" })
          // Fade in the links and content
          .to(hiddenElements, {
              autoAlpha: 1, y: 0, duration: 0.8, stagger: 0.1, ease: "power3.out",
              onComplete: initScrollAnimations
          }, "+=0.2"); 
    } else {
        gsap.set('.hidden-on-load', { autoAlpha: 1 });
        initScrollAnimations();
    }

    // ==========================================
    // 3. SCROLL REVEALS
    // ==========================================
    function initScrollAnimations() {
        gsap.utils.toArray('.gs-reveal').forEach(elem => {
            gsap.fromTo(elem, 
                { y: 30, opacity: 0 },
                {
                    scrollTrigger: {
                        trigger: elem,
                        start: "top 90%",
                        toggleActions: "play none none reverse"
                    },
                    y: 0, opacity: 1, duration: 1, ease: "power3.out"
                }
            );
        });
    }

    // ==========================================
    // 4. MAGNETIC GLASS BUTTONS (Desktop Only)
    // ==========================================
    const magnets = document.querySelectorAll('.magnetic');
    
    if (window.innerWidth > 768 && !hasTouch) {
        magnets.forEach(btn => {
            btn.addEventListener('mousemove', (e) => {
                const rect = btn.getBoundingClientRect();
                const x = (e.clientX - rect.left - rect.width / 2) * 0.35;
                const y = (e.clientY - rect.top - rect.height / 2) * 0.35;
                gsap.to(btn, { x: x, y: y, duration: 0.3, ease: "power2.out" });
            });
            btn.addEventListener('mouseleave', () => {
                gsap.to(btn, { x: 0, y: 0, duration: 0.8, ease: "elastic.out(1, 0.3)" });
            });
        });
    }

    // ==========================================
    // 5. FLUID CURSOR (Desktop Only)
    // ==========================================
    const cursor = document.querySelector(".cursor-dot");
    
    if (cursor && window.innerWidth > 768 && !hasTouch) {
        const xSetter = gsap.quickSetter(cursor, "x", "px");
        const ySetter = gsap.quickSetter(cursor, "y", "px");

        window.addEventListener("mousemove", (e) => {
            xSetter(e.clientX); ySetter(e.clientY);
        });

        const activeHover = document.querySelectorAll('a, button, .project-item');
        activeHover.forEach(el => {
            el.addEventListener('mouseenter', () => {
                gsap.to(cursor, { scale: 3, mixBlendMode: "difference", duration: 0.3 });
            });
            el.addEventListener('mouseleave', () => {
                gsap.to(cursor, { scale: 1, mixBlendMode: "normal", duration: 0.3 });
            });
        });
    }
});
