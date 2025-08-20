document.addEventListener('DOMContentLoaded', () => {
    const loadingOverlay = document.getElementById('loading-overlay');
    const modeToggle = document.getElementById('mode-toggle');
    const navLinks = document.querySelectorAll('.nav-link');
    const sections = document.querySelectorAll('section[id]');
    const scrollPrompt = document.getElementById('scroll-prompt');
    const homeSection = document.getElementById('home');
    const emailAddressLink = document.getElementById('email-address-link');
    const copyEmailAction = document.getElementById('copy-email-action');
    const copyMessage = document.getElementById('copy-message');

    // --- Theme Handling ---
    // Hide loading overlay after 1.5 seconds
    setTimeout(() => {
        loadingOverlay.classList.add('hidden');
        // Ensure body content is visible after loading overlay hides
        document.body.style.visibility = 'visible';
    }, 1500);

    // Set initial theme based on local storage or system preference
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

    if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
        document.body.classList.add('dark');
        modeToggle.innerHTML = '☀️ Light Mode';
    } else {
        document.body.classList.remove('dark');
        modeToggle.innerHTML = '🌙 Dark Mode';
    }

    // Theme toggle functionality
    modeToggle.addEventListener('click', () => {
        document.body.classList.toggle('dark');
        if (document.body.classList.contains('dark')) {
            localStorage.setItem('theme', 'dark');
            modeToggle.innerHTML = '☀️ Light Mode';
        } else {
            localStorage.setItem('theme', 'light');
            modeToggle.innerHTML = '🌙 Dark Mode';
        }
        // Update gradients on theme change
        updateSectionGradients();
    });

    // Function to update section gradients based on theme
    function updateSectionGradients() {
        const homeSectionDiv = document.querySelector('#home > div:first-child');
        const contactSectionDiv = document.querySelector('#contact > div:first-child');

        if (document.body.classList.contains('dark')) {
            homeSectionDiv.className = 'absolute inset-0 rounded-2xl bg-gradient-to-br from-[var(--gradient-dark-from)] to-[var(--gradient-dark-to)]';
            contactSectionDiv.className = 'absolute inset-0 rounded-2xl bg-gradient-to-br from-[var(--gradient-dark-to)] to-[var(--gradient-dark-from)]'; /* Reversed for contact */
        } else {
            // Light mode: Use light home gradients for home/contact
            homeSectionDiv.className = 'absolute inset-0 rounded-2xl bg-gradient-to-br from-[var(--light-home-gradient-from)] to-[var(--light-home-gradient-to)]';
            contactSectionDiv.className = 'absolute inset-0 rounded-2xl bg-gradient-to-br from-[var(--light-home-gradient-to)] to-[var(--light-home-gradient-from)]'; /* Reversed for contact */
        }
    }
    // Call on initial load
    updateSectionGradients();


    // --- Custom Scroll Animation Logic (Reverted to non-interruptible) ---

    // Easing function for a "a tiny bit slower" acceleration and "even harder" deceleration (Quantic ease-out)
    function easeOutQuint(t) {
        return 1 - Math.pow(1 - t, 5);
    }

    // Custom scroll function that scrolls the entire window (non-interruptible)
    function scrollToTarget(targetElement, duration) {
        const startPosition = window.scrollY; // Current scroll position of the window
        // Calculate target position, accounting for sticky header's height (100px due to smaller header)
        const targetPosition = targetElement.getBoundingClientRect().top + window.scrollY - 100;
        const distance = targetPosition - startPosition;
        let startTime = null;

        function animation(currentTime) {
            if (startTime === null) startTime = currentTime;
            const timeElapsed = currentTime - startTime;
            const progress = Math.min(timeElapsed / duration, 1); // Clamp progress between 0 and 1
            const easedProgress = easeOutQuint(progress); // Apply easing function

            window.scrollTo(0, startPosition + distance * easedProgress);

            if (timeElapsed < duration) {
                requestAnimationFrame(animation);
            }
        }
        requestAnimationFrame(animation); // Start the animation
    }

    const homeP = document.querySelector('#home p');
    if (homeP) {
           homeP.style.animation = 'fadeInUp 1.2s ease-out 0.3s forwards';
    }


    // --- Intersection Observer for scroll-in animations (only for section visibility) ---
    const scrollObserverOptions = {
        root: null, // viewport
        rootMargin: '0px',
        threshold: 0.1 // Trigger when 10% of the item is visible
    };

    const scrollObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');
            } else {
                // Optionally, remove 'is-visible' if elements should re-animate on scroll out and back in
                // entry.target.classList.remove('is-visible');
            }
        });
    }, scrollObserverOptions);

    // Apply observer to all elements with 'scroll-in-animation' class
    sections.forEach(element => { // 'sections' is already defined and contains all section elements
        scrollObserver.observe(element);
    });

    // Initial check for elements already in view on load
    scrollObserver.takeRecords().forEach(entry => { // Process existing intersections
        if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
        }
    });


    // --- Intersection Observer for Active Navigation Link ---
    // This observer watches sections and updates the active nav link when a section is in view
    const navObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const sectionId = `#${entry.target.id}`;
                navLinks.forEach(link => {
                    if (link.getAttribute('href') === sectionId) {
                        link.classList.add('active');
                    } else {
                        link.classList.remove('active');
                    }
                });
            }
        });
    }, {
        root: null, // viewport
        rootMargin: '-50% 0px -49% 0px', // Trigger when section crosses the middle of the viewport
        threshold: 0 // Will trigger as soon as it crosses
    });

    sections.forEach(section => {
        navObserver.observe(section);
    });

    // --- Navigation Link Click Handler (manual activation and custom smooth scroll) ---
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault(); // Prevent default anchor jump

            // Remove 'active' from all nav links
            navLinks.forEach(nav => nav.classList.remove('active'));

            // Add 'active' to the clicked link
            this.classList.add('active');

            // Use custom scroll function
            const targetId = this.getAttribute('href');
            const targetSection = document.querySelector(targetId);
            if (targetSection) {
                scrollToTarget(targetSection, 4000); // Retained 4000ms duration for smoother feel
            }
        });
    });

    // Set initial active link if page loads at a specific section or default to home
    const initialHash = window.location.hash;
    if (initialHash) {
        const initialNavLink = document.querySelector(`.nav-link[href="${initialHash}"]`);
        if (initialNavLink) {
            navLinks.forEach(nav => nav.classList.remove('active'));
            initialNavLink.classList.add('active');
            const targetSection = document.querySelector(initialHash);
            if (targetSection) {
                scrollToTarget(targetSection, 100); // Shorter duration for initial load
            }
        }
    } else {
        // Default to home being active on load if no hash
        const homeNavLink = document.querySelector('.nav-link[href="#home"]');
        if (homeNavLink) {
            homeNavLink.classList.add('active');
        }
    }

    // --- Scroll Prompt Functionality (always visible) ---
    if (scrollPrompt) {
        scrollPrompt.addEventListener('click', (e) => {
            e.preventDefault();
            const activeNavLink = document.querySelector('.nav-link.active');
            if (activeNavLink) {
                const currentSectionId = activeNavLink.getAttribute('href');
                let currentIndex = Array.from(navLinks).findIndex(link => link.getAttribute('href') === currentSectionId);

                if (currentIndex < navLinks.length - 1) {
                    currentIndex++;
                } else {
                    currentIndex = 0; // Loop back to home
                }

                const nextTargetId = navLinks[currentIndex].getAttribute('href');
                const nextTargetSection = document.querySelector(nextTargetId);

                if (nextTargetSection) {
                    navLinks.forEach(nav => nav.classList.remove('active'));
                    navLinks[currentIndex].classList.add('active');
                    scrollToTarget(nextTargetSection, 4000); // 4000ms duration for smoother feel
                }
            }
        });
    }

    // --- "DNK" Logo click to scroll to top ---
    document.getElementById('title').addEventListener('click', () => {
        scrollToTarget(document.getElementById('home'), 1500); // Use custom scroll to home
    });

    // --- Email Copy to Clipboard Functionality ---
    // The emailAddressLink's default mailto: behavior is now preserved.
    // The copyEmailAction span is solely responsible for copying.
    if (emailAddressLink) {
        // Remove the preventDefault from the mailto link's direct event listener.
        // This allows the mailto: protocol to be handled by the browser directly.
        // The current setup has no direct listener on emailAddressLink, which is good.
        // If there were one, it would look like:
        // emailAddressLink.addEventListener('click', function(e) {
        //    // e.preventDefault(); // THIS LINE WOULD BE REMOVED
        // });
    }


    if (copyEmailAction) {
        copyEmailAction.addEventListener('click', function(e) {
            e.preventDefault(); // Prevent default action for the span itself
            const email = "davidnoel.kruska@outlook.de";
            const tempInput = document.createElement('textarea');
            tempInput.value = email;
            document.body.appendChild(tempInput);
            tempInput.select();
            try {
                document.execCommand('copy');
                copyMessage.textContent = 'Copied!';
                copyMessage.classList.add('opacity-100');
                setTimeout(() => {
                    copyMessage.classList.remove('opacity-100');
                    copyMessage.textContent = ''; // Clear text after fading out
                }, 1500);
            } catch (err) {
                console.error('Failed to copy text: ', err);
                copyMessage.textContent = 'Failed to copy!';
                copyMessage.classList.add('opacity-100');
                setTimeout(() => {
                    copyMessage.classList.remove('opacity-100');
                    copyMessage.textContent = '';
                }, 1500);
            } finally {
                document.body.removeChild(tempInput);
            }
        });
    }

    // --- KONTAKTFORMULAR JAVASCRIPT LOGIK ---
// WICHTIG: Die IDs der Formularfelder wurden von 'name', 'email', 'subject', 'message'
//          zu 'form-name', 'form-email', 'form-subject', 'form-message' geändert,
//          um Konflikte mit anderen IDs auf der Seite zu vermeiden.
//          Stelle sicher, dass deine HTML-Formularfelder diese neuen IDs haben.
const contactForm = document.getElementById('contactForm');
const formStatusMessage = document.getElementById('form-status-message');

if (contactForm && formStatusMessage) {
    contactForm.addEventListener('submit', async function(event) {
        event.preventDefault(); // Verhindert das Standardverhalten des Formulars (Seitenneuladung)

        const name = document.getElementById('form-name').value.trim();
        const email = document.getElementById('form-email').value.trim();
        const subject = document.getElementById('form-subject').value.trim();
        const message = document.getElementById('form-message').value.trim();

        // Einfache Validierung
        if (!name || !email || !subject || !message) {
            displayFormStatus('Bitte füllen Sie alle Felder aus.', 'error');
            return;
        }

        if (!isValidEmail(email)) {
            displayFormStatus('Bitte geben Sie eine gültige E-Mail-Adresse ein.', 'error');
            return;
        }

        displayFormStatus('Sende Ihre Nachricht...', 'info');

        // ECHTER API-AUFRUF
        const formData = {
            name: name,
            email: email,
            subject: subject,
            message: message,
        };

        try {
            // HIER IST DIE KORRIGIERTE URL FÜR DEIN BACKEND
            const response = await fetch('https://website-holy-haze-9007.fly.dev/api/send_email', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });

            const result = await response.json();

            if (response.ok) {
                displayFormStatus('Ihre Nachricht wurde erfolgreich gesendet! Ich melde mich in Kürze bei Ihnen.', 'success');
                contactForm.reset();
            } else {
                displayFormStatus(`Fehler: ${result.detail}`, 'error');
            }
        } catch (error) {
            console.error('Fetch Error:', error);
            displayFormStatus('Ein Verbindungsfehler ist aufgetreten. Bitte versuchen Sie es später erneut.', 'error');
        }
    });
}

/**
 * Zeigt eine Statusmeldung für das Kontaktformular an.
 * @param {string} message - Die anzuzeigende Nachricht.
 * @param {'success' | 'error' | 'info'} type - Der Nachrichtentyp (bestimmt das Styling).
 */
function displayFormStatus(message, type) {
    formStatusMessage.textContent = message;
    // Alle vorherigen Statusklassen und den versteckten Zustand entfernen
    formStatusMessage.classList.remove('hidden', 'form-status-success', 'form-status-error', 'form-status-info');

    // Die entsprechende Klasse basierend auf dem Nachrichtentyp hinzufügen
    if (type === 'success') {
        formStatusMessage.classList.add('form-status-success');
    } else if (type === 'error') {
        formStatusMessage.classList.add('form-status-error');
    } else if (type === 'info') {
        formStatusMessage.classList.add('form-status-info');
    }
    formStatusMessage.classList.remove('hidden'); // Sicherstellen, dass die Nachricht sichtbar ist

    // Erfolgs-/Fehlermeldungen nach ein paar Sekunden automatisch ausblenden
    if (type === 'success' || type === 'error') {
        setTimeout(() => {
            formStatusMessage.classList.add('hidden');
        }, 5000); // Nachricht verschwindet nach 5 Sekunden
    }
}

/**
 * Validiert das Format einer E-Mail-Adresse.
 * @param {string} email - Der zu validierende E-Mail-String.
 * @returns {boolean} True, wenn die E-Mail gültig ist, sonst False.
 */
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}
});