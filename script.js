// ============ STATE & REFS ============
const state = {
  categories: [],
  providers: [],
  submissions: [],
  providerDetails: {},
  loading: true
};

const refs = {
  categoryGrid: document.querySelector("#categoryGrid"),
  categoryFilter: document.querySelector("#categoryFilter"),
  areaFilter: document.querySelector("#areaFilter"),
  ratingFilter: document.querySelector("#ratingFilter"),
  verifiedFilter: document.querySelector("#verifiedFilter"),
  searchInput: document.querySelector("#searchInput"),
  filterForm: document.querySelector("#filterForm"),
  providerGrid: document.querySelector("#providerGrid"),
  resultCount: document.querySelector("#resultCount"),
  clearProviderFilters: document.querySelector("#clearProviderFilters"),
  emptyState: document.querySelector("#emptyState"),
  contributionForm: document.querySelector("#contributionForm"),
  formStatus: document.querySelector("#formStatus"),
  providerModal: document.querySelector("#providerModal"),
  providerModalContent: document.querySelector("#providerModalContent")
};

let activeProviderId = null;
let activeProviderTab = "overview";

// ============ SUPABASE FUNCTIONS ============
async function fetchProviders() {
  try {
    state.loading = true;
    const { data, error } = await supabase
      .from('providers')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    state.providers = data || [];
    renderFilters();
    renderProviders();
  } catch (error) {
    console.error('Error fetching providers:', error.message);
    showNotification('Failed to load providers', 'error');
  } finally {
    state.loading = false;
  }
}

async function fetchProviderDetails(providerId) {
  try {
    if (state.providerDetails[providerId]) {
      return state.providerDetails[providerId];
    }

    const [reviewsResult, photosResult] = await Promise.all([
      supabase
        .from('reviews')
        .select('*')
        .eq('provider_id', providerId)
        .eq('status', 'approved')
        .order('created_at', { ascending: false }),
      supabase
        .from('photos')
        .select('*')
        .eq('provider_id', providerId)
        .eq('status', 'approved')
        .order('created_at', { ascending: false })
    ]);

    if (reviewsResult.error) throw reviewsResult.error;
    if (photosResult.error) throw photosResult.error;

    state.providerDetails[providerId] = {
      reviews: reviewsResult.data || [],
      photos: photosResult.data || []
    };

    return state.providerDetails[providerId];
  } catch (error) {
    console.error('Error fetching provider details:', error.message);
    return { reviews: [], photos: [] };
  }
}

async function submitReview(providerId, reviewData, images) {
  try {
    const reviewId = crypto.randomUUID();
    
    // Insert review
    const { error: reviewError } = await supabase
      .from('reviews')
      .insert({
        id: reviewId,
        provider_id: providerId,
        author: reviewData.author,
        rating: Number(reviewData.rating),
        feedback: reviewData.feedback,
        status: 'approved',
        created_at: new Date().toISOString()
      });

    if (reviewError) throw reviewError;

    // Upload images if any
    if (images.length > 0) {
      for (const image of images) {
        const fileName = `${providerId}/${reviewId}/${crypto.randomUUID()}.jpg`;
        const { error: uploadError } = await supabase.storage
          .from('review-images')
          .uploadBinary(fileName, await fetch(image.src).then(r => r.blob()));

        if (uploadError) console.error('Image upload error:', uploadError);
      }
    }

    showNotification('Review submitted successfully!', 'success');
    return true;
  } catch (error) {
    console.error('Error submitting review:', error.message);
    showNotification('Failed to submit review', 'error');
    return false;
  }
}

async function submitPhotos(providerId, caption, images) {
  try {
    const uploadPromises = images.map(async (image) => {
      const fileName = `${providerId}/${crypto.randomUUID()}.jpg`;
      const { data, error } = await supabase.storage
        .from('provider-photos')
        .uploadBinary(fileName, await fetch(image.src).then(r => r.blob()));

      if (error) throw error;

      return supabase
        .from('photos')
        .insert({
          id: crypto.randomUUID(),
          provider_id: providerId,
          image_url: `${SUPABASE_URL}/storage/v1/object/public/provider-photos/${fileName}`,
          caption: caption,
          official: false,
          status: 'approved',
          created_at: new Date().toISOString()
        });
    });

    const results = await Promise.all(uploadPromises);
    
    results.forEach(({ error }) => {
      if (error) throw error;
    });

    showNotification('Photos submitted successfully!', 'success');
    return true;
  } catch (error) {
    console.error('Error submitting photos:', error.message);
    showNotification('Failed to submit photos', 'error');
    return false;
  }
}

async function submitContribution(formData) {
  try {
    const { error } = await supabase
      .from('submissions')
      .insert({
        id: crypto.randomUUID(),
        resident_name: formData.residentName,
        provider_name: formData.providerName,
        service_type: formData.serviceType,
        phone: formData.phone,
        area: formData.area,
        review: formData.review,
        personally_used: formData.used === 'Yes',
        status: 'pending',
        created_at: new Date().toISOString()
      });

    if (error) throw error;
    showNotification('✓ Thank you! Submitted for admin review.', 'success');
    return true;
  } catch (error) {
    console.error('Error submitting contribution:', error.message);
    showNotification('Failed to submit contribution', 'error');
    return false;
  }
}

// ============ UTILITIES ============
function showNotification(message, type = 'info') {
  if (refs.formStatus) {
    refs.formStatus.textContent = message;
    refs.formStatus.className = `form-status ${type}`;
    if (type === 'success') {
      setTimeout(() => {
        refs.formStatus.textContent = '';
      }, 5000);
    }
  }
}

function phoneLink(phone) {
  return phone.replace(/[^\d+]/g, "");
}

function whatsappLink(phone) {
  let digits = phone.replace(/\D/g, "");
  if (digits.startsWith("0")) digits = `92${digits.slice(1)}`;
  return `https://wa.me/${digits}`;
}

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function formatDate(value) {
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric"
  }).format(new Date(value));
}

function renderStars(rating) {
  const value = Number(rating) || 0;
  return Array.from({ length: 5 }, (_, index) => index < value ? "★" : "☆").join("");
}

// ============ FILTERS & RENDERING ============
function renderFilters() {
  const categories = [...new Set(state.providers.map((p) => p.category))];
  const areas = [...new Set(state.providers.map((p) => p.area))];

  refs.categoryFilter.innerHTML = '<option value="">All categories</option>' +
    categories.map((c) => `<option value="${escapeHtml(c)}">${escapeHtml(c)}</option>`).join("");

  refs.areaFilter.innerHTML = '<option value="">All areas</option>' +
    areas.map((a) => `<option value="${escapeHtml(a)}">${escapeHtml(a)}</option>`).join("");

  refreshIcons();
}

function renderProviders() {
  const search = refs.searchInput.value.toLowerCase().trim();
  const category = refs.categoryFilter.value;
  const area = refs.areaFilter.value;
  const minRating = refs.ratingFilter.value ? Number(refs.ratingFilter.value) : 0;
  const verified = refs.verifiedFilter.value ? refs.verifiedFilter.value === "verified" : null;

  let filtered = state.providers.filter((p) => {
    const matchesSearch = !search || p.name.toLowerCase().includes(search) || p.category.toLowerCase().includes(search);
    const matchesCategory = !category || p.category === category;
    const matchesArea = !area || p.area === area;
    const matchesRating = !minRating || p.rating >= minRating;
    const matchesVerified = verified === null || p.verified === verified;
    return matchesSearch && matchesCategory && matchesArea && matchesRating && matchesVerified;
  });

  refs.resultCount.textContent = `${filtered.length} provider${filtered.length !== 1 ? "s" : ""}`;
  refs.clearProviderFilters.hidden = !(search || category || area || minRating || verified !== null);
  refs.emptyState.hidden = filtered.length > 0;

  refs.providerGrid.innerHTML = filtered.map((provider) => `
    <article class="provider-card" data-provider-id="${escapeHtml(provider.id)}" role="button" tabindex="0">
      <div class="provider-header">
        <div class="provider-name">
          <h3>${escapeHtml(provider.name)}</h3>
          <p class="provider-category">${escapeHtml(provider.category)}</p>
        </div>
        <span class="badge ${provider.verified ? "verified" : "unverified"}">
          ${provider.verified ? "✓ Verified" : "Community"}
        </span>
      </div>
      <div class="price-rating">
        <span>${escapeHtml(provider.price || "N/A")}</span>
        <span>★ ${Number(provider.rating || 4.5).toFixed(1)} rating · ${provider.reviews || 0} reviews</span>
      </div>
      <div class="provider-meta">
        <i data-lucide="phone"></i>
        <span>${escapeHtml(provider.phone)}</span>
      </div>
      <div class="provider-actions">
        <a class="btn call-btn" href="tel:${phoneLink(provider.phone)}"><i data-lucide="phone-call"></i> Call</a>
        <a class="btn whatsapp-btn" href="${whatsappLink(provider.phone)}" target="_blank" rel="noreferrer"><i data-lucide="message-circle"></i> WhatsApp</a>
      </div>
      <p class="card-detail-hint">Tap for details, reviews & photos</p>
    </article>
  `).join("");
  refreshIcons();
}

function refreshIcons() {
  if (window.lucide) {
    window.lucide.createIcons();
  }
}

// ============ MODAL ============
async function openProviderModal(providerId) {
  activeProviderId = providerId;
  activeProviderTab = "overview";
  
  // Fetch details
  await fetchProviderDetails(providerId);
  renderProviderModal(providerId, "overview");
  
  refs.providerModal.hidden = false;
  document.body.style.overflow = "hidden";
}

function closeProviderModal() {
  refs.providerModal.hidden = true;
  document.body.style.overflow = "";
  activeProviderId = null;
}

async function renderProviderModal(providerId, tab) {
  const provider = state.providers.find((p) => p.id === providerId);
  if (!provider) return;

  const details = state.providerDetails[providerId] || { reviews: [], photos: [] };

  let content = `
    <div class="modal-provider-header">
      <h2>${escapeHtml(provider.name)}</h2>
      <div class="modal-meta-row">
        <span class="badge ${provider.verified ? "verified" : "unverified"}">
          ${provider.verified ? "✓ Verified" : "Community"}
        </span>
        <span><i data-lucide="map-pin"></i>${escapeHtml(provider.area)}</span>
        <span><i data-lucide="star"></i>${Number(provider.rating || 4.5).toFixed(1)} (${provider.reviews || 0})</span>
      </div>
    </div>

    <div class="modal-stat-grid">
      <div>
        <span>Category</span>
        <strong>${escapeHtml(provider.category)}</strong>
      </div>
      <div>
        <span>Price Range</span>
        <strong>${escapeHtml(provider.price || "N/A")}</strong>
      </div>
      <div>
        <span>Area</span>
        <strong>${escapeHtml(provider.area)}</strong>
      </div>
      <div>
        <span>Rating</span>
        <strong>★ ${Number(provider.rating || 4.5).toFixed(1)}</strong>
      </div>
    </div>

    <div class="modal-tabs">
      <button type="button" data-provider-tab="overview" class="modal-tab-btn ${tab === "overview" ? "active" : ""}">Overview</button>
      <button type="button" data-provider-tab="reviews" class="modal-tab-btn ${tab === "reviews" ? "active" : ""}">Reviews</button>
      <button type="button" data-provider-tab="photos" class="modal-tab-btn ${tab === "photos" ? "active" : ""}">Photos</button>
    </div>

    <div class="modal-tab-panel">
  `;

  if (tab === "overview") {
    content += `
      <div class="modal-overview-grid">
        <div class="modal-info-card">
          <h3>Contact Information</h3>
          <dl class="detail-list">
            <div>
              <dt>Phone</dt>
              <dd>
                <a href="tel:${phoneLink(provider.phone)}" style="color: var(--gold); font-weight: 900;">${escapeHtml(provider.phone)}</a>
              </dd>
            </div>
            <div>
              <dt>WhatsApp</dt>
              <dd>
                <a href="${whatsappLink(provider.phone)}" target="_blank" rel="noreferrer" style="color: var(--gold); font-weight: 900;">Chat on WhatsApp</a>
              </dd>
            </div>
            <div>
              <dt>Area</dt>
              <dd>${escapeHtml(provider.area)}</dd>
            </div>
          </dl>
        </div>
      </div>
    `;
  } else if (tab === "reviews") {
    content += `
      <form class="review-form" id="reviewForm">
        <label>
          <span>Your Name</span>
          <input name="author" required placeholder="Your name" minlength="2">
        </label>
        <label>
          <span>Rating</span>
          <select name="rating" required>
            <option value="">Select rating</option>
            <option value="5">★★★★★ Excellent</option>
            <option value="4">★★★★ Good</option>
            <option value="3">★★★ Average</option>
            <option value="2">★★ Poor</option>
            <option value="1">★ Terrible</option>
          </select>
        </label>
        <label>
          <span>Your Review</span>
          <textarea name="feedback" required placeholder="Share your experience..." minlength="10" rows="4"></textarea>
        </label>
        <button type="submit" class="btn btn-primary wide">Submit Review</button>
      </form>

      <div style="margin-top: 20px;">
        <h3 style="margin: 0 0 12px; font-size: 16px; font-weight: 900;">Community Reviews</h3>
        ${details.reviews.length === 0 ? '<p class="modal-empty">No reviews yet. Be the first!</p>' : ''}
        ${details.reviews.map((review) => `
          <div class="thread-card">
            <div class="thread-card-top">
              <div>
                <strong>${escapeHtml(review.author)}</strong>
                <span>${formatDate(review.created_at)}</span>
              </div>
              <span class="stars">${renderStars(review.rating)}</span>
            </div>
            <p>${escapeHtml(review.feedback)}</p>
          </div>
        `).join("")}
      </div>
    `;
  } else if (tab === "photos") {
    content += `
      <form class="photo-form" id="photoForm">
        <label>
          <span>Photo Caption</span>
          <input name="caption" placeholder="Describe this photo..." maxlength="100">
        </label>
        <button type="submit" class="btn btn-primary wide">Submit Photos</button>
      </form>

      <div style="margin-top: 20px;">
        <h3 style="margin: 0 0 12px; font-size: 16px; font-weight: 900;">Photo Gallery</h3>
        ${details.photos.length === 0 ? '<p class="modal-empty">No photos yet</p>' : ''}
        <div class="photo-gallery">
          ${details.photos.map((photo) => `
            <figure>
              <img src="${escapeHtml(photo.image_url)}" alt="${escapeHtml(photo.caption)}" loading="lazy" style="aspect-ratio: 4/3; object-fit: cover;">
              <figcaption>
                <span>${escapeHtml(photo.caption)}</span>
              </figcaption>
            </figure>
          `).join("")}
        </div>
      </div>
    `;
  }

  content += `</div></div>`;
  refs.providerModalContent.innerHTML = content;
  refreshIcons();

  // Attach form handlers
  if (tab === "reviews") {
    const reviewForm = document.querySelector("#reviewForm");
    if (reviewForm) {
      reviewForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        const formData = Object.fromEntries(new FormData(reviewForm));
        const success = await submitReview(providerId, formData, []);
        if (success) {
          reviewForm.reset();
          await fetchProviderDetails(providerId);
          renderProviderModal(providerId, "reviews");
        }
      });
    }
  }
}

// ============ EVENT LISTENERS ============
["input", "change"].forEach((eventName) => {
  refs.filterForm.addEventListener(eventName, renderProviders);
});

refs.filterForm.addEventListener("submit", (event) => {
  event.preventDefault();
  renderProviders();
});

refs.clearProviderFilters.addEventListener("click", () => {
  refs.searchInput.value = "";
  refs.categoryFilter.value = "";
  refs.areaFilter.value = "";
  refs.ratingFilter.value = "";
  refs.verifiedFilter.value = "";
  renderProviders();
});

refs.providerGrid.addEventListener("click", (event) => {
  if (event.target.closest("a, button")) return;
  const card = event.target.closest("[data-provider-id]");
  if (!card) return;
  openProviderModal(card.dataset.providerId);
});

refs.providerGrid.addEventListener("keydown", (event) => {
  if (event.key !== "Enter" && event.key !== " ") return;
  const card = event.target.closest("[data-provider-id]");
  if (!card) return;
  event.preventDefault();
  openProviderModal(card.dataset.providerId);
});

refs.providerModal.addEventListener("click", (event) => {
  if (event.target.closest("[data-close-provider-modal]")) {
    closeProviderModal();
  }
});

refs.providerModalContent.addEventListener("click", (event) => {
  const tabButton = event.target.closest("[data-provider-tab]");
  if (tabButton) {
    activeProviderTab = tabButton.dataset.providerTab;
    renderProviderModal(activeProviderId, activeProviderTab);
  }
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && !refs.providerModal.hidden) {
    closeProviderModal();
  }
});

refs.contributionForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const formData = Object.fromEntries(new FormData(refs.contributionForm));
  const success = await submitContribution(formData);
  if (success) {
    refs.contributionForm.reset();
  }
});

// ============ INITIALIZE ============
fetchProviders();
