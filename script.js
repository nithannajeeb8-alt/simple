// Register GSAP plugins
gsap.registerPlugin(ScrollTrigger);

// Set Footer Year
const yearSpan = document.getElementById('year');
if (yearSpan) yearSpan.textContent = new Date().getFullYear();

document.addEventListener("DOMContentLoaded", () => {
    let hasTouch = false;
    window.addEventListener('touchstart', () => { hasTouch = true; }, { once: true, passive: true });

    // ==========================================
    // 1. NAVBAR SIGNATURE & INTRO ANIMATION
    // ==========================================
    const wordPath = document.querySelector('.signature-word');
    const dot = document.querySelector('.signature-dot');
    const hiddenElements = document.querySelectorAll('.hidden-on-load');

    if (wordPath && dot) {
        // Calculate the exact length of the SVG path
        const length = wordPath.getTotalLength();

        // Prepare the signature to be completely hidden
        gsap.set(wordPath, { strokeDasharray: length, strokeDashoffset: length });
        gsap.set(dot, { scale: 0, opacity: 0, transformOrigin: "center center" });
        
        // Push the main website elements down slightly for a slide-up fade effect
        gsap.set(hiddenElements, { y: 20, autoAlpha: 0 });

        const tl = gsap.timeline();

        // Step 1: Draw the signature in the Navbar smoothly
        tl.to(wordPath, {
            strokeDashoffset: 0,
            duration: 2.2, 
            ease: "power2.inOut"
        })
        // Step 2: Pop the dot onto the 'i'
        .to(dot, {
            scale: 1,
            opacity: 1,
            duration: 0.4,
            ease: "back.out(2)"
        })
        // Step 3: Fade in the rest of the Website sequentially
        .to(hiddenElements, {
            autoAlpha: 1, 
            y: 0,
            duration: 1,
            stagger: 0.15, // Fades them in one after another
            ease: "power3.out",
            onComplete: initScrollReveals // Start scroll animations once intro is done
        }, "+=0.2"); 
    } else {
        // Fallback if no signature exists on the page
        gsap.set('.hidden-on-load', { autoAlpha: 1 });
        initScrollReveals();
    }

    // ==========================================
    // 2. SCROLL REVEAL LOGIC
    // ==========================================
    function initScrollReveals() {
        gsap.utils.toArray('.gs-reveal').forEach(elem => {
            gsap.fromTo(elem, 
                { y: 40, opacity: 0 },
                {
                    scrollTrigger: {
                        trigger: elem,
                        start: "top 85%", // Triggers when element is 85% down the viewport
                        toggleActions: "play none none reverse"
                    },
                    y: 0,
                    opacity: 1,
                    duration: 1,
                    ease: "power3.out"
                }
            );
        });
    }

    // ==========================================
    // 3. FLUID CURSOR TRACKING
    // ==========================================
    const cursor = document.querySelector(".cursor-dot");
    
    if (cursor && window.innerWidth > 768 && !hasTouch) { 
        const cursorX = gsap.quickSetter(cursor, "x", "px");
        const cursorY = gsap.quickSetter(cursor, "y", "px");

        window.addEventListener("mousemove", (e) => {
            cursorX(e.clientX);
            cursorY(e.clientY);
        });

        // Expand cursor when hovering over interactive elements
        const interactives = document.querySelectorAll("a, button, .project-item");
        interactives.forEach(el => {
            el.addEventListener("mouseenter", () => {
                gsap.to(cursor, { scale: 2.5, mixBlendMode: "difference", backgroundColor: "#fff", duration: 0.3 });
            });
            el.addEventListener("mouseleave", () => {
                gsap.to(cursor, { scale: 1, mixBlendMode: "normal", backgroundColor: "#fff", duration: 0.3 });
            });
        });
    }

    // ==========================================
    // 4. MAGNETIC GLASS BUTTONS
    // ==========================================
    document.querySelectorAll('.magnetic').forEach(btn => {
        btn.addEventListener('mousemove', (e) => {
            if (hasTouch || window.innerWidth <= 768) return;
            const rect = btn.getBoundingClientRect();
            // Calculate how far the mouse is from the center of the button
            const x = (e.clientX - rect.left - rect.width / 2) * 0.3; 
            const y = (e.clientY - rect.top - rect.height / 2) * 0.3;
            
            // Gently pull the button towards the mouse
            gsap.to(btn, { x: x, y: y, duration: 0.3, ease: "power2.out" });
        });
        
        btn.addEventListener('mouseleave', () => {
            if (hasTouch || window.innerWidth <= 768) return;
            // Snap back to original position
            gsap.to(btn, { x: 0, y: 0, duration: 0.7, ease: "elastic.out(1, 0.3)" });
        });
    });

    // ==========================================
    // 5. FLUID HOVER REVEAL LOGIC (PROJECTS)
    // ==========================================
    const hoverReveal = document.querySelector(".hover-reveal");
    const revealImg = document.querySelector(".reveal-img");
    const projectItems = document.querySelectorAll(".project-item");

    if (hoverReveal && revealImg && window.innerWidth > 768 && !hasTouch) {
        let mouseX = 0, mouseY = 0;
        let revealX = 0, revealY = 0;

        window.addEventListener("mousemove", (e) => {
            mouseX = e.clientX;
            mouseY = e.clientY;
        });

        // Smooth trailing animation loop using GSAP's internal ticker
        gsap.ticker.add(() => {
            revealX += (mouseX - revealX) * 0.1; // The 0.1 controls the "lag" or fluidity
            revealY += (mouseY - revealY) * 0.1;
            gsap.set(hoverReveal, { x: revealX, y: revealY });
        });

        projectItems.forEach(item => {
            item.addEventListener("mouseenter", () => {
                // Get the gradient color specific to this project
                const bgGradient = item.getAttribute("data-color");
                if (bgGradient) revealImg.style.background = bgGradient;
                
                // Fade in and scale up the box
                gsap.to(hoverReveal, { opacity: 1, scale: 1, duration: 0.4, ease: "power3.out" });
                // Scale down the inner image for a parallax effect
                gsap.fromTo(revealImg, { scale: 1.2 }, { scale: 1, duration: 0.6, ease: "power3.out" });
            });
            
            item.addEventListener("mouseleave", () => {
                // Fade out and shrink
                gsap.to(hoverReveal, { opacity: 0, scale: 0.8, duration: 0.4, ease: "power3.out" });
            });
        });
    }
});
