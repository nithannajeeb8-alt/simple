// Register GSAP plugins
gsap.registerPlugin(ScrollTrigger);

// Set Footer Year
const yearSpan = document.getElementById('year');
if (yearSpan) yearSpan.textContent = new Date().getFullYear();

document.addEventListener("DOMContentLoaded", () => {
    let hasTouch = false;
    window.addEventListener('touchstart', () => { hasTouch = true; }, { once: true, passive: true });

    // ==========================================
    // 1. MOBILE VELVET MENU TOGGLE
    // ==========================================
    const menuBtn = document.querySelector('.mobile-menu-btn');
    const menuOverlay = document.querySelector('.mobile-menu-overlay');
    const mobileLinks = document.querySelectorAll('.mobile-link');

    if (menuBtn && menuOverlay) {
        menuBtn.addEventListener('click', () => {
            menuBtn.classList.toggle('open');
            menuOverlay.classList.toggle('active');
            document.body.style.overflow = menuOverlay.classList.contains('active') ? 'hidden' : '';
        });

        mobileLinks.forEach(link => {
            link.addEventListener('click', () => {
                menuBtn.classList.remove('open');
                menuOverlay.classList.remove('active');
                document.body.style.overflow = '';
            });
        });
    }

    // ==========================================
    // 2. TEXT SPLITTING (For Awwwards Mask Reveal)
    // ==========================================
    const heroDescs = document.querySelectorAll('.hero-desc');
    heroDescs.forEach(desc => {
        const text = desc.innerHTML;
        const splitText = text.split('. ').map(sentence => {
            const formatted = sentence.endsWith('.') ? sentence : sentence + '.';
            return `<span class="line-wrapper"><span class="line-inner">${formatted}</span></span>`;
        }).join(' ');
        desc.innerHTML = splitText;
    });

    // ==========================================
    // 3. SIGNATURE & INTRO TIMELINE
    // ==========================================
    const wordPath = document.querySelector('.signature-word');
    const dot = document.querySelector('.signature-dot');
    const navElements = document.querySelectorAll('.nav-left.hidden-on-load, .nav-right.hidden-on-load');

    if (wordPath && dot) {
        const length = wordPath.getTotalLength();

        gsap.set(wordPath, { strokeDasharray: length, strokeDashoffset: length });
        gsap.set(dot, { scale: 0, opacity: 0, transformOrigin: "center center" });
        gsap.set(navElements, { autoAlpha: 0, y: -20 });
        gsap.set('.scroll-indicator', { autoAlpha: 0 });

        const tl = gsap.timeline({
            onComplete: () => {
                initScrollReveals();
                initParallax(); 
            }
        });

        tl.to(wordPath, { strokeDashoffset: 0, duration: 2.5, ease: "power2.inOut" }) 
          .to(dot, { scale: 1, opacity: 1, duration: 0.6, ease: "back.out(1.5)" }, "-=0.2") 
          .to(navElements, { autoAlpha: 1, y: 0, duration: 1.2, stagger: 0.2, ease: "power3.out" }, "-=0.2") 
          .to('.scroll-indicator', { autoAlpha: 1, duration: 1.5, ease: "power2.out" }, "-=0.5"); 
    } else {
        gsap.set(navElements, { autoAlpha: 1 });
        gsap.set('.scroll-indicator', { autoAlpha: 1 });
        initScrollReveals();
        initParallax();
    }

    // ==========================================
    // 4. ENVIRONMENTAL ANIMATIONS
    // ==========================================
    function initParallax() {
        if (window.innerWidth > 768) {
            gsap.utils.toArray('.parallax-header').forEach(header => {
                gsap.to(header, {
                    x: 100, 
                    scrollTrigger: { trigger: header.parentElement, start: "top bottom", end: "bottom top", scrub: 1.5 }
                });
            });
            
            gsap.to('.parallax-text', {
                y: -50, 
                scrollTrigger: { trigger: '.hero-text-section', start: "top center", end: "bottom top", scrub: 1 }
            });
        }
    }

    const tiltCard = document.querySelector('.tilt-card');
    if (tiltCard && !hasTouch && window.innerWidth > 1024) {
        tiltCard.addEventListener('mousemove', (e) => {
            const rect = tiltCard.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            const rotateX = ((y - centerY) / centerY) * -10; 
            const rotateY = ((x - centerX) / centerX) * 10;
            gsap.to(tiltCard, { rotationX: rotateX, rotationY: rotateY, duration: 0.4, ease: "power2.out" });
        });
        tiltCard.addEventListener('mouseleave', () => {
            gsap.to(tiltCard, { rotationX: 0, rotationY: 0, duration: 0.8, ease: "elastic.out(1, 0.4)" });
        });
    }

    const hoverWrapper = document.querySelector('.hover-image-reveal');
    const hoverInner = document.querySelector('.hover-image-inner');
    const projectItems = document.querySelectorAll('.hover-trigger');
    
    if (hoverWrapper && !hasTouch && window.innerWidth > 1024) {
        const setX = gsap.quickSetter(hoverWrapper, "x", "px");
        const setY = gsap.quickSetter(hoverWrapper, "y", "px");
        
        window.addEventListener('mousemove', (e) => {
            setX(e.clientX + 20);
            setY(e.clientY + 20);
        });

        projectItems.forEach(item => {
            item.addEventListener('mouseenter', () => {
                const imgUrl = item.getAttribute('data-img');
                if (imgUrl) hoverInner.style.backgroundImage = `url(${imgUrl})`;
                hoverWrapper.classList.add('active');
                gsap.to(".cursor-dot", { opacity: 0, duration: 0.2 });
            });
            
            item.addEventListener('mouseleave', () => {
                hoverWrapper.classList.remove('active');
                gsap.to(".cursor-dot", { opacity: 1, duration: 0.2 });
            });
        });
    }

    // ==========================================
    // 5. MASKED SCROLL REVEALS (FIXED FOR MOBILE)
    // ==========================================
    function initScrollReveals() {
        // Standard elements slide up and fade
        gsap.utils.toArray('.gs-reveal:not(.parallax-text, .parallax-header)').forEach(elem => {
            gsap.fromTo(elem, 
                { y: 60, opacity: 0 },
                {
                    scrollTrigger: { trigger: elem, start: "top 85%", toggleActions: "play none none reverse" },
                    y: 0, opacity: 1, duration: 1.4, ease: "power3.out"
                }
            );
        });

        // The elegant Awwwards mask reveal for the paragraph lines
        gsap.fromTo('.line-inner', 
            { y: "120%", opacity: 0 }, 
            {
                scrollTrigger: { trigger: ".hero-text-section", start: "top 80%" },
                y: "0%", opacity: 1, duration: 1.2, stagger: 0.1, ease: "power4.out"
            }
        );

        ScrollTrigger.refresh();
    }

    // ==========================================
    // 6. FLUID CURSOR TRACKING
    // ==========================================
    const cursor = document.querySelector(".cursor-dot");
    if (cursor && window.innerWidth > 768 && !hasTouch) { 
        const cursorX = gsap.quickSetter(cursor, "x", "px");
        const cursorY = gsap.quickSetter(cursor, "y", "px");

        window.addEventListener("mousemove", (e) => { cursorX(e.clientX); cursorY(e.clientY); });

        const interactives = document.querySelectorAll("a, button");
        interactives.forEach(el => {
            el.addEventListener("mouseenter", () => {
                gsap.to(cursor, { scale: 2.5, mixBlendMode: "difference", backgroundColor: "#fff", duration: 0.4 });
            });
            el.addEventListener("mouseleave", () => {
                gsap.to(cursor, { scale: 1, mixBlendMode: "normal", backgroundColor: "var(--accent-gold)", duration: 0.4 });
            });
        });
    }

    // ==========================================
    // 7. MAGNETIC GLASS BUTTONS
    // ==========================================
    document.querySelectorAll('.magnetic').forEach(btn => {
        btn.addEventListener('mousemove', (e) => {
            if (hasTouch || window.innerWidth <= 768) return;
            const rect = btn.getBoundingClientRect();
            const x = (e.clientX - rect.left - rect.width / 2) * 0.3; 
            const y = (e.clientY - rect.top - rect.height / 2) * 0.3;
            gsap.to(btn, { x: x, y: y, duration: 0.4, ease: "power2.out" });
        });
        
        btn.addEventListener('mouseleave', () => {
            if (hasTouch || window.innerWidth <= 768) return;
            gsap.to(btn, { x: 0, y: 0, duration: 0.8, ease: "elastic.out(1, 0.4)" });
        });
    });
});
