// Register GSAP plugins
gsap.registerPlugin(ScrollTrigger);

// Set Footer Year
const yearSpan = document.getElementById('year');
if (yearSpan) yearSpan.textContent = new Date().getFullYear();

document.addEventListener("DOMContentLoaded", () => {
    let hasTouch = false;
    window.addEventListener('touchstart', () => { hasTouch = true; }, { once: true, passive: true });

    // ==========================================
    // 1. MOBILE MENU TOGGLE LOGIC
    // ==========================================
    const menuBtn = document.querySelector('.mobile-menu-btn');
    const menuOverlay = document.querySelector('.mobile-menu-overlay');
    const mobileLinks = document.querySelectorAll('.mobile-link');

    if (menuBtn && menuOverlay) {
        menuBtn.addEventListener('click', () => {
            menuBtn.classList.toggle('open');
            menuOverlay.classList.toggle('active');
            // Prevent scrolling when menu is open
            document.body.style.overflow = menuOverlay.classList.contains('active') ? 'hidden' : '';
        });

        // Close menu when a link is clicked
        mobileLinks.forEach(link => {
            link.addEventListener('click', () => {
                menuBtn.classList.remove('open');
                menuOverlay.classList.remove('active');
                document.body.style.overflow = '';
            });
        });
    }

    // ==========================================
    // 2. SIGNATURE INITIALIZATION SEQUENCE
    // ==========================================
    const wordPath = document.querySelector('.signature-word');
    const dot = document.querySelector('.signature-dot');
    
    // We only fade in the top navigation immediately after the signature draws
    const navElements = document.querySelectorAll('.nav-left.hidden-on-load, .nav-right.hidden-on-load');

    if (wordPath && dot) {
        const length = wordPath.getTotalLength();

        // Setup hidden states
        gsap.set(wordPath, { strokeDasharray: length, strokeDashoffset: length });
        gsap.set(dot, { scale: 0, opacity: 0, transformOrigin: "center center" });
        gsap.set(navElements, { autoAlpha: 0, y: -20 });

        const tl = gsap.timeline({
            onComplete: initScrollReveals // Initialize scroll-triggered text only AFTER drawing is done
        });

        // Step 1: Draw the massive signature
        tl.to(wordPath, {
            strokeDashoffset: 0,
            duration: 2.5, // Slightly slower for luxury feel
            ease: "power2.inOut"
        })
        // Step 2: Pop the elegant gold dot
        .to(dot, {
            scale: 1,
            opacity: 1,
            duration: 0.6,
            ease: "back.out(1.5)"
        }, "-=0.2")
        // Step 3: Gently drop down the navigation buttons
        .to(navElements, {
            autoAlpha: 1, 
            y: 0,
            duration: 1.2,
            stagger: 0.2,
            ease: "power3.out"
        }, "-=0.2"); 
    } else {
        gsap.set(navElements, { autoAlpha: 1 });
        initScrollReveals();
    }

    // ==========================================
    // 3. SCROLL REVEAL (Hero Text & Beyond)
    // ==========================================
    function initScrollReveals() {
        gsap.utils.toArray('.gs-reveal').forEach(elem => {
            gsap.fromTo(elem, 
                { y: 50, opacity: 0 },
                {
                    scrollTrigger: {
                        trigger: elem,
                        start: "top 85%", 
                        toggleActions: "play none none reverse"
                    },
                    y: 0,
                    opacity: 1,
                    duration: 1.2, // Smooth, slow reveal
                    ease: "power3.out"
                }
            );
        });
        // Recalculate ScrollTrigger in case DOM shifted
        ScrollTrigger.refresh();
    }

    // ==========================================
    // 4. FLUID CURSOR TRACKING
    // ==========================================
    const cursor = document.querySelector(".cursor-dot");
    
    if (cursor && window.innerWidth > 768 && !hasTouch) { 
        const cursorX = gsap.quickSetter(cursor, "x", "px");
        const cursorY = gsap.quickSetter(cursor, "y", "px");

        window.addEventListener("mousemove", (e) => {
            cursorX(e.clientX);
            cursorY(e.clientY);
        });

        const interactives = document.querySelectorAll("a, button, .project-item");
        interactives.forEach(el => {
            el.addEventListener("mouseenter", () => {
                gsap.to(cursor, { scale: 2.5, mixBlendMode: "difference", backgroundColor: "#fff", duration: 0.4 });
            });
            el.addEventListener("mouseleave", () => {
                // Return to gold dot state
                gsap.to(cursor, { scale: 1, mixBlendMode: "normal", backgroundColor: "var(--accent-gold)", duration: 0.4 });
            });
        });
    }

    // ==========================================
    // 5. MAGNETIC GLASS BUTTONS
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
