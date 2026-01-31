// ========================================
// TONARI - Restaurant Website Scripts
// ========================================

document.addEventListener('DOMContentLoaded', () => {

  // --- Loading screen ---
  const loader = document.getElementById('loader');
  setTimeout(() => {
    loader.classList.add('hidden');
  }, 1200);

  // --- Navbar scroll effect ---
  const nav = document.getElementById('nav');
  const onScroll = () => {
    nav.classList.toggle('scrolled', window.scrollY > 50);
  };
  window.addEventListener('scroll', onScroll, { passive: true });

  // --- Mobile menu toggle ---
  const navToggle = document.getElementById('navToggle');
  const navLinks = document.getElementById('navLinks');

  const overlay = document.createElement('div');
  overlay.className = 'nav-overlay';
  document.body.appendChild(overlay);

  const toggleMenu = () => {
    navLinks.classList.toggle('open');
    overlay.classList.toggle('active');
    document.body.classList.toggle('menu-open');
  };

  navToggle.addEventListener('click', toggleMenu);
  overlay.addEventListener('click', toggleMenu);

  navLinks.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      navLinks.classList.remove('open');
      overlay.classList.remove('active');
      document.body.classList.remove('menu-open');
    });
  });

  // --- Menu category tabs ---
  const menuTabs = document.querySelectorAll('.menu-tab');
  const menuItems = document.querySelectorAll('.menu-item');

  menuTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const category = tab.dataset.category;
      menuTabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      menuItems.forEach(item => {
        if (item.dataset.category === category) {
          item.classList.remove('hidden');
        } else {
          item.classList.add('hidden');
        }
      });
    });
  });

  // --- Smooth reveal on scroll ---
  const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);

  document.querySelectorAll('.section').forEach(section => {
    section.style.opacity = '0';
    section.style.transform = 'translateY(30px)';
    section.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    observer.observe(section);
  });

  const style = document.createElement('style');
  style.textContent = `.revealed { opacity: 1 !important; transform: translateY(0) !important; }`;
  document.head.appendChild(style);

  // --- Active nav link on scroll ---
  const sections = document.querySelectorAll('.section, .hero');
  const navAnchors = document.querySelectorAll('.nav-links a:not(.nav-cta)');

  const updateActiveNav = () => {
    let current = '';
    sections.forEach(section => {
      const top = section.offsetTop - 200;
      if (window.scrollY >= top) {
        current = section.getAttribute('id');
      }
    });

    navAnchors.forEach(a => {
      a.style.color = '';
      if (a.getAttribute('href') === `#${current}`) {
        a.style.color = 'var(--color-accent)';
      }
    });
  };

  window.addEventListener('scroll', updateActiveNav, { passive: true });

  // --- Hero hours badge ---
  const heroBadge = document.getElementById('heroBadge');
  if (heroBadge) {
    const updateHoursBadge = () => {
      const now = new Date();
      // Get Malaysia time
      const myTime = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Kuala_Lumpur' }));
      const day = myTime.getDay(); // 0=Sun, 4=Thu
      const hours = myTime.getHours();
      const minutes = myTime.getMinutes();
      const currentMinutes = hours * 60 + minutes;

      const openTime = 17 * 60 + 30;  // 5:30 PM
      const closeTime = 23 * 60 + 30;  // 11:30 PM

      const dot = heroBadge.querySelector('.badge-dot');
      const text = heroBadge.querySelector('.badge-text');

      if (day === 4) {
        // Thursday - closed
        dot.classList.add('closed');
        text.textContent = 'Closed today (Thursday)';
      } else if (currentMinutes >= openTime && currentMinutes < closeTime) {
        // Currently open
        dot.classList.remove('closed');
        text.textContent = 'Open now until 11:30 PM';
      } else if (currentMinutes < openTime) {
        // Before opening
        dot.classList.add('closed');
        text.textContent = 'Opens today at 5:30 PM';
      } else {
        // After closing
        dot.classList.add('closed');
        const tomorrow = (day + 1) % 7;
        if (tomorrow === 4) {
          text.textContent = 'Closed tomorrow — Opens Friday 5:30 PM';
        } else {
          text.textContent = 'Closed now — Opens tomorrow 5:30 PM';
        }
      }
    };

    updateHoursBadge();
    // Update every minute
    setInterval(updateHoursBadge, 60000);
  }

  // --- Mobile CTA bar visibility ---
  const mobileCta = document.getElementById('mobileCta');
  const heroSection = document.getElementById('hero');

  if (mobileCta && heroSection) {
    const ctaObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          mobileCta.classList.remove('visible');
        } else {
          mobileCta.classList.add('visible');
        }
      });
    }, { threshold: 0.1 });

    ctaObserver.observe(heroSection);
  }

  // --- Reservation form ---
  const form = document.getElementById('reservationForm');
  const dateInput = document.getElementById('resDate');

  if (form && dateInput) {
    // Set minimum date to today (Malaysia time)
    const now = new Date();
    const myNow = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Kuala_Lumpur' }));
    const year = myNow.getFullYear();
    const month = String(myNow.getMonth() + 1).padStart(2, '0');
    const day = String(myNow.getDate()).padStart(2, '0');
    dateInput.min = `${year}-${month}-${day}`;

    // Thursday warning
    dateInput.addEventListener('change', () => {
      const selected = new Date(dateInput.value + 'T12:00:00');
      const existingWarning = dateInput.parentNode.querySelector('.form-thursday-warning');
      if (existingWarning) existingWarning.remove();

      if (selected.getDay() === 4) {
        const warning = document.createElement('p');
        warning.className = 'form-thursday-warning';
        warning.textContent = 'We are closed on Thursdays. Please select another date.';
        dateInput.parentNode.appendChild(warning);
        dateInput.setCustomValidity('We are closed on Thursdays');
      } else {
        dateInput.setCustomValidity('');
      }
    });

    // Form submission via mailto
    form.addEventListener('submit', (e) => {
      e.preventDefault();

      const name = document.getElementById('resName').value;
      const phone = document.getElementById('resPhone').value;
      const date = document.getElementById('resDate').value;
      const time = document.getElementById('resTime').value;
      const guests = document.getElementById('resGuests').value;
      const notes = document.getElementById('resNotes').value;

      const subject = encodeURIComponent(`Reservation Request — ${name} — ${date}`);
      const body = encodeURIComponent(
        `New Reservation Request\n` +
        `========================\n\n` +
        `Name: ${name}\n` +
        `Phone: ${phone}\n` +
        `Date: ${date}\n` +
        `Time: ${time}\n` +
        `Party Size: ${guests}\n` +
        `Special Requests: ${notes || 'None'}\n\n` +
        `— Sent from Tonari website`
      );

      window.location.href = `mailto:tonari.cafe.penang@gmail.com?subject=${subject}&body=${body}`;

      // Show confirmation
      const btn = form.querySelector('.form-submit');
      const originalText = btn.textContent;
      btn.textContent = 'Opening email client...';
      btn.style.background = '#4ade80';
      btn.style.color = '#0a0a0a';

      setTimeout(() => {
        btn.textContent = originalText;
        btn.style.background = '';
        btn.style.color = '';
      }, 3000);
    });
  }

  // --- Fetch TripAdvisor score from static JSON ---
  fetch('data/ratings.json')
    .then(res => res.json())
    .then(data => {
      const taEl = document.getElementById('taRatingNumber');
      if (taEl && data.tripadvisor) {
        taEl.textContent = data.tripadvisor.toFixed(1);
      }
    })
    .catch(() => {}); // Fail silently, keep placeholder

});

// ========================================
// Google Places API — Reviews & Rating
// ========================================
const PLACE_ID = 'ChIJbRXLF8XDSjARvamq0guvAOQ';
const CACHE_KEY = 'tonari_google_reviews';
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours

// Called by the Google Maps JS API callback
function initPlaces() {
  const cached = loadCachedReviews();
  if (cached) {
    renderGoogleData(cached);
    return;
  }

  // PlacesService needs a DOM element (can be a hidden div)
  const div = document.createElement('div');
  const service = new google.maps.places.PlacesService(div);

  service.getDetails({
    placeId: PLACE_ID,
    fields: ['rating', 'user_ratings_total', 'reviews']
  }, (place, status) => {
    if (status === google.maps.places.PlacesServiceStatus.OK && place) {
      const data = {
        rating: place.rating,
        totalReviews: place.user_ratings_total,
        reviews: (place.reviews || []).map(r => ({
          author: r.author_name,
          rating: r.rating,
          text: r.text,
          time: r.relative_time_description
        }))
      };
      cacheReviews(data);
      renderGoogleData(data);
    }
    // If API fails, placeholder reviews stay visible
  });
}

function loadCachedReviews() {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (Date.now() - parsed.timestamp > CACHE_DURATION) {
      localStorage.removeItem(CACHE_KEY);
      return null;
    }
    return parsed.data;
  } catch {
    return null;
  }
}

function cacheReviews(data) {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify({
      timestamp: Date.now(),
      data
    }));
  } catch {}
}

function renderGoogleData(data) {
  // Update Google rating in About section
  const ratingNum = document.getElementById('googleRatingNumber');
  const ratingLabel = document.getElementById('googleRatingLabel');
  if (ratingNum && data.rating) {
    ratingNum.textContent = data.rating.toFixed(1);
  }
  if (ratingLabel && data.totalReviews) {
    ratingLabel.textContent = `Google (${data.totalReviews} reviews)`;
  }

  // Render reviews into testimonials grid
  const grid = document.getElementById('reviewsGrid');
  if (!grid || !data.reviews || data.reviews.length === 0) return;

  // Build star SVG
  const starSvg = '<svg viewBox="0 0 20 20" width="18" height="18" fill="#d4a574"><path d="M10 1l2.39 4.84 5.34.78-3.87 3.77.91 5.32L10 13.28l-4.77 2.51.91-5.32L2.27 6.7l5.34-.78z"/></svg>';
  const emptyStarSvg = '<svg viewBox="0 0 20 20" width="18" height="18" fill="#3a3530"><path d="M10 1l2.39 4.84 5.34.78-3.87 3.77.91 5.32L10 13.28l-4.77 2.51.91-5.32L2.27 6.7l5.34-.78z"/></svg>';

  const cards = data.reviews.slice(0, 4).map(review => {
    const stars = Array.from({ length: 5 }, (_, i) =>
      i < review.rating ? starSvg : emptyStarSvg
    ).join('');

    const text = review.text.length > 200
      ? review.text.substring(0, 200).trim() + '...'
      : review.text;

    return `
      <div class="testimonial-card">
        <div class="testimonial-stars">${stars}</div>
        <p class="testimonial-text">"${text.replace(/"/g, '&quot;').replace(/</g, '&lt;')}"</p>
        <div class="testimonial-author">
          <span class="testimonial-name">${review.author.replace(/</g, '&lt;')}</span>
          <span class="testimonial-source"><span class="review-source-badge">Google</span> ${review.time || ''}</span>
        </div>
      </div>
    `;
  }).join('');

  grid.innerHTML = cards;
}
