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
      const closeTime = 22 * 60;  // 10:00 PM

      const dot = heroBadge.querySelector('.badge-dot');
      const text = heroBadge.querySelector('.badge-text');

      if (day === 4) {
        // Thursday - closed
        dot.classList.add('closed');
        text.textContent = 'Closed today (Thursday)';
      } else if (currentMinutes >= openTime && currentMinutes < closeTime) {
        // Currently open
        dot.classList.remove('closed');
        text.textContent = 'Open now until 10:00 PM';
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
const PHOTO_CACHE_KEY = 'tonari_google_photos';
const PHOTO_CACHE_DURATION = 7 * 24 * 60 * 60 * 1000; // 7 days

// Called by the Google Maps JS API callback
function initPlaces() {
  const cachedReviews = loadCache(CACHE_KEY, CACHE_DURATION);
  const cachedPhotos = loadCache(PHOTO_CACHE_KEY, PHOTO_CACHE_DURATION);

  if (cachedReviews) renderGoogleData(cachedReviews);
  if (cachedPhotos) renderGooglePhotos(cachedPhotos);

  // If both are cached, skip API call
  if (cachedReviews && cachedPhotos) return;

  const div = document.createElement('div');
  const service = new google.maps.places.PlacesService(div);

  service.getDetails({
    placeId: PLACE_ID,
    fields: ['rating', 'user_ratings_total', 'reviews', 'photos']
  }, (place, status) => {
    if (status !== google.maps.places.PlacesServiceStatus.OK || !place) return;

    // Reviews
    if (!cachedReviews) {
      const reviewData = {
        rating: place.rating,
        totalReviews: place.user_ratings_total,
        reviews: (place.reviews || []).map(r => ({
          author: r.author_name,
          rating: r.rating,
          text: r.text,
          time: r.relative_time_description
        }))
      };
      saveCache(CACHE_KEY, reviewData);
      renderGoogleData(reviewData);
    }

    // Photos
    if (!cachedPhotos && place.photos && place.photos.length > 0) {
      const photoUrls = place.photos.slice(0, 10).map(photo => ({
        url: photo.getUrl({ maxWidth: 800 }),
        attribution: photo.html_attributions ? photo.html_attributions[0] || '' : ''
      }));
      saveCache(PHOTO_CACHE_KEY, photoUrls);
      renderGooglePhotos(photoUrls);
    }
  });
}

function loadCache(key, duration) {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (Date.now() - parsed.timestamp > duration) {
      localStorage.removeItem(key);
      return null;
    }
    return parsed.data;
  } catch {
    return null;
  }
}

function saveCache(key, data) {
  try {
    localStorage.setItem(key, JSON.stringify({
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

function renderGooglePhotos(photos) {
  const gallery = document.getElementById('galleryGrid');
  if (!gallery || !photos || photos.length === 0) return;

  // Use up to 9 photos for a clean 3x3 grid
  const galleryPhotos = photos.slice(0, 9);
  const items = galleryPhotos.map(photo => `
    <div class="gallery-item" data-label="Tonari">
      <img src="${photo.url}" sizes="(max-width: 768px) 100vw, 33vw"
           alt="Photo of Tonari restaurant" loading="lazy" width="600" height="400">
    </div>
  `).join('');

  gallery.innerHTML = items;

  // Also populate menu featured photos (use first 3 food-related photos)
  const menuFeatured = document.getElementById('menuFeatured');
  if (menuFeatured && photos.length >= 3) {
    const featuredItems = photos.slice(0, 3).map(photo => `
      <div class="menu-featured-item">
        <img src="${photo.url}" alt="Tonari food" loading="lazy" width="600" height="450">
      </div>
    `).join('');
    menuFeatured.innerHTML = featuredItems;
  }
}
