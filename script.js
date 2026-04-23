document.addEventListener("DOMContentLoaded", () => {
    // 1. SIGNATURE & REVEAL
    const wordPath = document.querySelector('.signature-word');
    const dot = document.querySelector('.signature-dot');
    
    if (wordPath) {
        const length = wordPath.getTotalLength();
        gsap.set(wordPath, { strokeDasharray: length, strokeDashoffset: length });
        gsap.set(dot, { scale: 0, opacity: 0 });

        const tl = gsap.timeline();
        tl.to(wordPath, { strokeDashoffset: 0, duration: 2.5, ease: "power2.inOut" })
          .to(dot, { scale: 1, opacity: 1, duration: 0.4, ease: "back.out(2)" })
          .to('.hidden-on-load', { autoAlpha: 1, y: 0, duration: 1, stagger: 0.2, onComplete: () => {
              gsap.utils.toArray('.gs-reveal').forEach(el => {
                  gsap.to(el, { scrollTrigger: el, opacity: 1, y: 0, duration: 1 });
              });
          }});
    }

    // 2. MOBILE MENU TOGGLE
    const menuToggle = document.getElementById('menuToggle');
    const mobileMenu = document.getElementById('mobileMenu');
    
    if (menuToggle) {
        menuToggle.addEventListener('click', () => {
            menuToggle.classList.toggle('active');
            mobileMenu.classList.toggle('active');
            document.body.style.overflow = mobileMenu.classList.contains('active') ? 'hidden' : 'auto';
        });
    }

    // 3. CURSOR
    const cursor = document.querySelector('.cursor-dot');
    window.addEventListener('mousemove', (e) => {
        gsap.to(cursor, { x: e.clientX, y: e.clientY, duration: 0.1 });
    });
});
