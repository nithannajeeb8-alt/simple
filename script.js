// Register GSAP plugins
gsap.registerPlugin(ScrollTrigger);

// Set Footer Year
const yearSpan = document.getElementById('year');
if (yearSpan) yearSpan.textContent = new Date().getFullYear();

document.addEventListener("DOMContentLoaded", () => {
    let hasTouch = false;
    window.addEventListener('touchstart', () => { hasTouch = true; }, { once: true, passive: true });

    // ==========================================
    // 1. MOBILE VELVET MENU TOGGLE (With A11y)
    // ==========================================
    const menuBtn = document.querySelector('.mobile-menu-btn');
    const menuOverlay = document.querySelector('.mobile-menu-overlay');
    const mobileLinks = document.querySelectorAll('.mobile-link');

    if (menuBtn && menuOverlay) {
        menuBtn.addEventListener('click', () => {
            const isOpen = menuBtn.classList.toggle('open');
            menuOverlay.classList.toggle('active');
            menuBtn.setAttribute('aria-expanded', isOpen);
            document.body.style.overflow = isOpen ? 'hidden' : '';
        });

        mobileLinks.forEach(link => {
            link.addEventListener('click', () => {
                menuBtn.classList.remove('open');
                menuOverlay.classList.remove('active');
                menuBtn.setAttribute('aria-expanded', 'false');
                document.body.style.overflow = '';
            });
        });
    }

    // ==========================================
    // 2. TEXT SPLITTING (Awwwards Mask Reveal)
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
    // 3. TERMINAL SCRAMBLE EFFECT
    // ==========================================
    const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%&*";
    document.querySelectorAll(".desktop-nav a").forEach(link => {
        // Store the original text on load so we can reference it
        link.dataset.text = link.innerText;

        link.addEventListener("mouseenter", event => {
            let iterations = 0;
            const target = event.target;
            const originalText = target.dataset.text;
            
            clearInterval(target.scrambleInterval);
            
            target.scrambleInterval = setInterval(() => {
                target.innerText = originalText
                    .split("")
                    .map((letter, index) => {
                        if (index < iterations) {
                            return originalText[index];
                        }
                        return letters[Math.floor(Math.random() * letters.length)];
                    })
                    .join("");
                
                if (iterations >= originalText.length) {
                    clearInterval(target.scrambleInterval);
                    target.innerText = originalText; // Final fallback to exact original
                }
                iterations += 1 / 3; // Speed of deciphering
            }, 30);
        });
    });

    // ==========================================
    // 4. SIGNATURE & INTRO TIMELINE
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

        const tl = gsap.timeline({ onComplete: () => ScrollTrigger.refresh() });

        tl.to(wordPath, { strokeDashoffset: 0, duration: 2.5, ease: "power2.inOut" }) 
          .to(dot, { scale: 1, opacity: 1, duration: 0.6, ease: "back.out(1.5)" }, "-=0.2") 
          .to(navElements, { autoAlpha: 1, y: 0, duration: 1.2, stagger: 0.2, ease: "power3.out" }, "-=0.2") 
          .to('.scroll-indicator', { autoAlpha: 1, duration: 1.5, ease: "power2.out" }, "-=0.5"); 
    }

    // ==========================================
    // 5. GSAP MATCHMEDIA (Responsive Animations)
    // ==========================================
    let mm = gsap.matchMedia();

    // --- ALL DEVICES ---
    mm.add("all", () => {
        gsap.utils.toArray('.gs-reveal:not(.parallax-text, .parallax-header)').forEach(elem => {
            gsap.fromTo(elem, 
                { y: 60, opacity: 0 },
                {
                    scrollTrigger: { trigger: elem, start: "top 85%", toggleActions: "play none none reverse" },
                    y: 0, opacity: 1, duration: 1.4, ease: "power3.out"
                }
            );
        });

        gsap.fromTo('.line-inner', 
            { y: "120%", opacity: 0 }, 
            {
                scrollTrigger: { trigger: ".hero-text-section", start: "top 80%" },
                y: "0%", opacity: 1, duration: 1.2, stagger: 0.1, ease: "power4.out"
            }
        );
    });

    // --- DESKTOP ONLY ---
    mm.add("(min-width: 1025px)", () => {
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

        if (!hasTouch) {
            // Tilt Card
            const tiltCard = document.querySelector('.tilt-card');
            const handleTilt = (e) => {
                const rect = tiltCard.getBoundingClientRect();
                const x = e.clientX - rect.left, y = e.clientY - rect.top;
                const centerX = rect.width / 2, centerY = rect.height / 2;
                gsap.to(tiltCard, { rotationX: ((y - centerY) / centerY) * -10, rotationY: ((x - centerX) / centerX) * 10, duration: 0.4, ease: "power2.out" });
            };
            const resetTilt = () => gsap.to(tiltCard, { rotationX: 0, rotationY: 0, duration: 0.8, ease: "elastic.out(1, 0.4)" });
            
            if(tiltCard) {
                tiltCard.addEventListener('mousemove', handleTilt);
                tiltCard.addEventListener('mouseleave', resetTilt);
            }

            // Hover Image Reveal
            const hoverWrapper = document.querySelector('.hover-image-reveal');
            const hoverInner = document.querySelector('.hover-image-inner');
            const setX = gsap.quickSetter(hoverWrapper, "x", "px");
            const setY = gsap.quickSetter(hoverWrapper, "y", "px");
            
            const moveImage = (e) => { setX(e.clientX + 20); setY(e.clientY + 20); };
            window.addEventListener('mousemove', moveImage);

            document.querySelectorAll('.hover-trigger').forEach(item => {
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

            // Magnetic Buttons
            document.querySelectorAll('.magnetic').forEach(btn => {
                btn.addEventListener('mousemove', (e) => {
                    const rect = btn.getBoundingClientRect();
                    gsap.to(btn, { x: (e.clientX - rect.left - rect.width / 2) * 0.3, y: (e.clientY - rect.top - rect.height / 2) * 0.3, duration: 0.4, ease: "power2.out" });
                });
                btn.addEventListener('mouseleave', () => {
                    gsap.to(btn, { x: 0, y: 0, duration: 0.8, ease: "elastic.out(1, 0.4)" });
                });
            });

            // Fluid Cursor
            const cursor = document.querySelector(".cursor-dot");
            const cursorX = gsap.quickSetter(cursor, "x", "px");
            const cursorY = gsap.quickSetter(cursor, "y", "px");
            window.addEventListener("mousemove", (e) => { cursorX(e.clientX); cursorY(e.clientY); });

            document.querySelectorAll("a, button").forEach(el => {
                el.addEventListener("mouseenter", () => gsap.to(cursor, { scale: 2.5, mixBlendMode: "difference", backgroundColor: "#fff", duration: 0.4 }));
                el.addEventListener("mouseleave", () => gsap.to(cursor, { scale: 1, mixBlendMode: "normal", backgroundColor: "var(--accent-gold)", duration: 0.4 }));
            });
        }

        return () => { gsap.set(".cursor-dot", { opacity: 0 }); };
    });
});