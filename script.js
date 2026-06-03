// Register GSAP plugins
gsap.registerPlugin(ScrollTrigger);

// Set Footer Year
const yearSpan = document.getElementById('year');
if (yearSpan) yearSpan.textContent = new Date().getFullYear();

// ==========================================
// 0. ASSET PRELOADING (Performance)
// ==========================================
window.addEventListener('load', () => {
    document.querySelectorAll('.hover-trigger').forEach(item => {
        const imgUrl = item.getAttribute('data-img');
        if (imgUrl) {
            const img = new Image();
            img.src = imgUrl;
        }
    });
});

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
                    target.innerText = originalText; 
                }
                iterations += 1 / 3; 
            }, 30);
        });
    });

    // ==========================================
    // 4. SIGNATURE & INTRO TIMELINE
    // ==========================================
    const wordPath = document.querySelector('.signature-word');
    const dot = document.querySelector('.signature-dot');
    const navElements = document.querySelectorAll('.nav-left.hidden-on-load, .nav-right.hidden-on-load, .brand-logo.hidden-on-load, .mobile-menu-btn.hidden-on-load');

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
                    y: 0, opacity: 1, duration: 1.4, ease: "power3.out",
                    clearProps: "will-change" // OPTIMIZED: Clears GPU memory after animating
                }
            );
        });

        gsap.fromTo('.line-inner', 
            { y: "120%", opacity: 0 }, 
            {
                scrollTrigger: { trigger: ".hero-text-section", start: "top 80%" },
                y: "0%", opacity: 1, duration: 1.2, stagger: 0.1, ease: "power4.out",
                clearProps: "will-change" // OPTIMIZED: Clears GPU memory after animating
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

            document.querySelectorAll("a, button, .hover-trigger").forEach(el => {
                el.addEventListener("mouseenter", () => gsap.to(cursor, { scale: 2.5, mixBlendMode: "difference", backgroundColor: "#fff", duration: 0.4 }));
                el.addEventListener("mouseleave", () => gsap.to(cursor, { scale: 1, mixBlendMode: "normal", backgroundColor: "var(--accent-gold)", duration: 0.4 }));
            });
        }

        return () => { gsap.set(".cursor-dot", { opacity: 0 }); };
    });

    // ==========================================
    // 6. NEOFETCH EASTER EGG LOGIC
    // ==========================================
    const terminalOverlay = document.querySelector('.terminal-overlay');
    const terminalInput = document.getElementById('terminal-input');
    const terminalOutput = document.getElementById('terminal-output');

    if (terminalOverlay && terminalInput && terminalOutput) {
        window.addEventListener('keydown', (e) => {
            if (e.key === '`') {
                const isActive = terminalOverlay.classList.toggle('active');
                if (isActive) {
                    document.body.style.overflow = 'hidden';
                    setTimeout(() => terminalInput.focus(), 100);
                } else {
                    document.body.style.overflow = '';
                    terminalInput.blur();
                }
            }
        });

        terminalInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                const cmd = terminalInput.value.trim().toLowerCase();
                terminalInput.value = ''; 
                
                let response = '';
                
                if (cmd === 'whoami') {
                    response = 'Nithan Najeeb (alias: Rubin Stellar).\nWeb Architect. Student (B.Com).';
                } else if (cmd === 'projects') {
                    response = 'Active Modules:\n- Mind Atlas\n- Forenexa\n- Born Legend\n- Ollama Uplink';
                } else if (cmd === 'clear') {
                    terminalOutput.innerHTML = '';
                    return;
                } else if (cmd === 'neofetch' || cmd === 'sysinfo') {
                    response = `
       /\\         OS: Arch Linux x86_64 
      /  \\        Host: Mind Atlas Node
     /\\   \\       Uptime: Active
    /      \\      User: Rubin Stellar
   /   ,,   \\     Shell: bash
  /   |  |   \\    DE: Hyprland / Openbox
 /_-''    ''-_\\   Theme: Alabaster Glass
                    `;
                } else if (cmd !== '') {
                    response = `Command not found: ${cmd}. Try 'whoami', 'projects', 'neofetch', or 'clear'.`;
                }

                if (response) {
                    terminalOutput.innerHTML += `<div><span style="color:var(--accent-gold)">rubin@stellar</span>:~$ ${cmd}</div>`;
                    terminalOutput.innerHTML += `<div style="margin-bottom: 15px; white-space: pre-wrap; font-family: var(--mono);">${response}</div>`;
                    terminalOutput.scrollTop = terminalOutput.scrollHeight;
                }
            }
        });
    }
        // ==========================================
    // 7. HORIZONTAL GALLERY SCROLL & PARALLAX
    // ==========================================
    const gallerySection = document.querySelector('.gallery-section');
    const galleryTrack = document.querySelector('.gallery-track');
    const galleryImages = document.querySelectorAll('.parallax-img');

    if (gallerySection && galleryTrack) {
        
        function getScrollAmount() {
            let trackWidth = galleryTrack.scrollWidth;
            return -(trackWidth - window.innerWidth);
        }

        const tween = gsap.to(galleryTrack, {
            x: getScrollAmount,
            duration: 3,
            ease: "none"
        });

        ScrollTrigger.create({
            trigger: gallerySection,
            start: "top top",
            end: () => `+=${getScrollAmount() * -1}`,
            pin: true,
            animation: tween,
            scrub: 1, 
            invalidateOnRefresh: true
        });

        galleryImages.forEach(img => {
            gsap.to(img, {
                xPercent: 10,
                ease: "none",
                scrollTrigger: {
                    trigger: gallerySection,
                    start: "top top",
                    end: () => `+=${getScrollAmount() * -1}`,
                    scrub: 1,
                    invalidateOnRefresh: true
                }
            });
        });
    }
});
