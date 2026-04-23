gsap.registerPlugin(ScrollTrigger);

document.addEventListener("DOMContentLoaded", () => {
    // 1. Signature Reveal Intro
    const wordPath = document.querySelector('.signature-word');
    const dot = document.querySelector('.signature-dot');
    const hiddenElements = document.querySelectorAll('.hidden-on-load');

    if (wordPath) {
        const length = wordPath.getTotalLength();
        gsap.set(wordPath, { strokeDasharray: length, strokeDashoffset: length });
        gsap.set(dot, { scale: 0, opacity: 0 });
        gsap.set(hiddenElements, { y: 20, autoAlpha: 0 });

        const tl = gsap.timeline();
        tl.to(wordPath, { strokeDashoffset: 0, duration: 2.2, ease: "power2.inOut" })
          .to(dot, { scale: 1, opacity: 1, duration: 0.4, ease: "back.out(2)" })
          .to(hiddenElements, { autoAlpha: 1, y: 0, duration: 1, stagger: 0.15, onComplete: initScroll });
    }

    // 2. Scroll Trigger Reveal
    function initScroll() {
        gsap.utils.toArray('.gs-reveal').forEach(el => {
            gsap.to(el, { scrollTrigger: { trigger: el, start: "top 90%" }, y: 0, opacity: 1, duration: 1 });
        });
    }

    // 3. Mobile Menu Logic
    const menuToggle = document.getElementById('menuToggle');
    const mobileMenu = document.getElementById('mobileMenu');
    if (menuToggle) {
        menuToggle.addEventListener('click', () => {
            menuToggle.classList.toggle('active');
            mobileMenu.classList.toggle('active');
            document.body.style.overflow = mobileMenu.classList.contains('active') ? 'hidden' : 'auto';
        });
    }

    // 4. Custom Cursor (Desktop Only)
    const cursor = document.querySelector('.cursor-dot');
    if (cursor && window.innerWidth > 768) {
        window.addEventListener('mousemove', (e) => {
            gsap.to(cursor, { x: e.clientX, y: e.clientY, duration: 0.1 });
        });
    }

    // 5. Magnetic Effect
    document.querySelectorAll('.magnetic').forEach(btn => {
        btn.addEventListener('mousemove', (e) => {
            const rect = btn.getBoundingClientRect();
            const x = (e.clientX - rect.left - rect.width/2) * 0.3;
            const y = (e.clientY - rect.top - rect.height/2) * 0.3;
            gsap.to(btn, { x, y, duration: 0.3 });
        });
        btn.addEventListener('mouseleave', () => gsap.to(btn, { x: 0, y: 0, duration: 0.7 }));
    });

    document.getElementById('year').textContent = new Date().getFullYear();
});
