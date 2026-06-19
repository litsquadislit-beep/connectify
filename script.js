const defaultCategories = [
  { name: "Plumber", icon: "&#128295;" },
  { name: "Electrician", icon: "&#9889;" },
  { name: "Technician", icon: "&#128736;" },
  { name: "Cleaner", icon: "&#129529;" },
  { name: "Carpenter", icon: "&#129690;" },
  { name: "AC Service", icon: "&#10052;" },
  { name: "Painter", icon: "&#127912;" },
  { name: "Mason", icon: "&#129521;" },
  { name: "Mechanic", icon: "&#128663;" },
  { name: "Tutor", icon: "&#128218;" },
  { name: "Medical", icon: "&#9877;" },
  { name: "Delivery", icon: "&#128230;" },
  { name: "Local Business", icon: "&#127978;" },
  { name: "Emergency Services", icon: "&#128680;" },
  { name: "More Services", icon: "&#10133;" }
];

const defaultProviders = [
  {
    id: "bahria-rapid-plumbers",
    name: "Bahria Rapid Plumbers",
    category: "Plumber",
    phone: "+92 300 111 2233",
    area: "Phase 7",
    verified: true,
    price: "Rs. 1,000 - 3,500",
    rating: 4.9,
    reviews: 128
  },
  {
    id: "safewire-electric-works",
    name: "SafeWire Electric Works",
    category: "Electrician",
    phone: "+92 301 222 3344",
    area: "Phase 8",
    verified: true,
    price: "Rs. 1,500 - 6,000",
    rating: 4.8,
    reviews: 94
  },
  {
    id: "coolfix-ac-experts",
    name: "CoolFix AC Experts",
    category: "AC Service",
    phone: "+92 302 333 4455",
    area: "Safari Villas",
    verified: true,
    price: "Rs. 2,500 - 9,500",
    rating: 4.7,
    reviews: 76
  },
  {
    id: "spark-home-technicians",
    name: "Spark Home Technicians",
    category: "Technician",
    phone: "+92 303 444 5566",
    area: "Phase 4",
    verified: false,
    price: "Rs. 1,200 - 5,000",
    rating: 4.4,
    reviews: 41
  },
  {
    id: "brightnest-cleaning",
    name: "BrightNest Cleaning",
    category: "Cleaner",
    phone: "+92 304 555 6677",
    area: "Phase 6",
    verified: true,
    price: "Rs. 2,000 - 8,000",
    rating: 4.9,
    reviews: 113
  },
  {
    id: "prime-tutors-bahria",
    name: "Prime Tutors Bahria",
    category: "Tutor",
    phone: "+92 305 666 7788",
    area: "Phase 5",
    verified: false,
    price: "Rs. 8,000 - 22,000/month",
    rating: 4.6,
    reviews: 52
  },
  {
    id: "bahria-med-assist",
    name: "Bahria Med Assist",
    category: "Medical",
    phone: "+92 306 777 8899",
    area: "Phase 8",
    verified: true,
    price: "Rs. 1,500 - 7,000",
    rating: 4.8,
    reviews: 67
  },
  {
    id: "quickcart-local-delivery",
    name: "QuickCart Local Delivery",
    category: "Delivery",
    phone: "+92 307 888 9900",
    area: "Phase 3",
    verified: true,
    price: "Rs. 250 - 1,200",
    rating: 4.5,
    reviews: 156
  },
  {
    id: "bahria-emergency-response",
    name: "Bahria Emergency Response",
    category: "Emergency Services",
    phone: "+92 308 999 0011",
    area: "All Bahria",
    verified: true,
    price: "Case based",
    rating: 4.9,
    reviews: 88
  }
];

const categoryVisuals = {
  "Plumber": { className: "plumber", icon: "wrench", detail: "Pipes, taps & leaks" },
  "Electrician": { className: "electrician", icon: "zap", detail: "Wiring & power fixes" },
  "Technician": { className: "technician", icon: "monitor-cog", detail: "Device repair support" },
  "Cleaner": { className: "cleaner", icon: "spray-can", detail: "Home deep cleaning" },
  "Carpenter": { className: "carpenter", icon: "hammer", detail: "Woodwork & fittings" },
  "AC Service": { className: "ac", icon: "snowflake", detail: "Cooling & maintenance" },
  "Painter": { className: "painter", icon: "paint-roller", detail: "Walls, polish & finishes" },
  "Mason": { className: "mason", icon: "brick-wall", detail: "Brickwork & repairs" },
  "Mechanic": { className: "mechanic", icon: "car", detail: "Vehicle maintenance" },
  "Tutor": { className: "tutor", icon: "graduation-cap", detail: "Learning at home" },
  "Medical": { className: "medical", icon: "stethoscope", detail: "Care & assistance" },
  "Delivery": { className: "delivery", icon: "truck", detail: "Fast local drop-offs" },
  "Local Business": { className: "business", icon: "store", detail: "Shops & neighborhood stores" },
  "Emergency Services": { className: "emergency", icon: "siren", detail: "Urgent help access" },
  "More Services": { className: "more", icon: "layout-grid", detail: "Explore every contact" }
};

const state = {
  categories: readStore("connectifyCategories", defaultCategories),
  providers: readStore("connectifyProviders", defaultProviders),
  submissions: readStore("connectifySubmissions", []),
  providerDetails: readStore("connectifyProviderDetails", {})
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
  showAllCategories: document.querySelector("#showAllCategories"),
  showAllProvidersList: document.querySelector("#showAllProvidersList"),
  emptyState: document.querySelector("#emptyState"),
  contributionForm: document.querySelector("#contributionForm"),
  formStatus: document.querySelector("#formStatus"),
  providerModal: document.querySelector("#providerModal"),
  providerModalContent: document.querySelector("#providerModalContent")
};

let activeProviderId = null;
let activeProviderTab = "overview";
let pendingReviewImages = [];
let pendingPhotoImages = [];
let pendingOfficialImages = [];

const MOBILE_PREVIEW_LIMIT = 3;
const mobileBreakpoint = window.matchMedia("(max-width: 919px)");
const mobileSectionState = {
  categoriesExpanded: false,
  providersExpanded: false
};

function isMobileView() {
  return mobileBreakpoint.matches;
}

function getPreviewItems(items, expanded) {
  if (!isMobileView() || expanded || items.length <= MOBILE_PREVIEW_LIMIT) {
    return items;
  }
  return items.slice(0, MOBILE_PREVIEW_LIMIT);
}

function updateSectionShowAllButton(button, totalCount, expanded, singularLabel) {
  if (!button) return;

  const shouldShow = isMobileView() && totalCount > MOBILE_PREVIEW_LIMIT;
  button.hidden = !shouldShow;
  if (!shouldShow) return;

  const remaining = totalCount - MOBILE_PREVIEW_LIMIT;
  const icon = expanded ? "chevron-up" : "chevron-down";
  const label = expanded
    ? `Show Less`
    : `Show All ${singularLabel} (${remaining} more)`;

  button.innerHTML = `<i data-lucide="${icon}"></i> ${label}`;
  button.setAttribute("aria-expanded", String(expanded));
}

function readStore(key, fallback) {
  try {
    return JSON.parse(localStorage.getItem(key)) || fallback;
  } catch {
    return fallback;
  }
}

function writeStore(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

function saveAll() {
  writeStore("connectifyCategories", state.categories);
  writeStore("connectifyProviders", state.providers);
  writeStore("connectifySubmissions", state.submissions);
  writeStore("connectifyProviderDetails", state.providerDetails);
}

function phoneLink(phone) {
  return phone.replace(/[^\d+]/g, "");
}

function whatsappLink(phone) {
  let digits = phone.replace(/\D/g, "");
  if (digits.startsWith("0")) digits = `92${digits.slice(1)}`;
  return `https://wa.me/${digits}`;
}

function isAdminUnlocked() {
  return sessionStorage.getItem("connectifyAdminUnlocked") === "true";
}

function getProviderDetails(providerId) {
  if (!state.providerDetails[providerId]) {
    state.providerDetails[providerId] = {
      reviews: [],
      photos: [],
      adminNotes: ""
    };
  }
  return state.providerDetails[providerId];
}

function getActiveProvider() {
  return state.providers.find((provider) => provider.id === activeProviderId);
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

function statusLabel(status) {
  return status === "approved" ? "Approved" : "Pending review";
}

function renderStars(rating) {
  const value = Number(rating) || 0;
  return Array.from({ length: 5 }, (_, index) => index < value ? "&#9733;" : "&#9734;").join("");
}

function fileListToDataUrls(files, callback) {
  const selected = [...files].filter((file) => file.type.startsWith("image/"));
  if (!selected.length) {
    callback([]);
    return;
  }

  Promise.all(selected.map((file) => new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = () => resolve({ src: reader.result, name: file.name });
    reader.readAsDataURL(file);
  }))).then(callback);
}

function renderImagePreview(images, targetId) {
  const target = document.querySelector(`#${targetId}`);
  if (!target) return;
  target.innerHTML = images.map((image) => `<img src="${image.src}" alt="${escapeHtml(image.name || "Upload preview")}">`).join("");
}

function renderFilters() {
  const selectedCategory = refs.categoryFilter.value;
  const selectedArea = refs.areaFilter.value;
  const categories = [...new Set(state.categories.map((item) => item.name))].sort();
  const areas = [...new Set(state.providers.map((item) => item.area))].sort();

  refs.categoryFilter.innerHTML = `<option value="">All categories</option>${categories.map((category) => `<option value="${category}">${category}</option>`).join("")}`;
  refs.areaFilter.innerHTML = `<option value="">All areas</option>${areas.map((area) => `<option value="${area}">${area}</option>`).join("")}`;
  refs.categoryFilter.value = categories.includes(selectedCategory) ? selectedCategory : "";
  refs.areaFilter.value = areas.includes(selectedArea) ? selectedArea : "";
}

function renderCategories() {
  const categories = state.categories;
  const visibleCategories = getPreviewItems(categories, mobileSectionState.categoriesExpanded);

  refs.categoryGrid.innerHTML = visibleCategories.map((category) => {
    const count = state.providers.filter((provider) => provider.category === category.name).length;
    const visual = categoryVisuals[category.name] || { className: "more", icon: "badge-plus", detail: "Community trusted service" };
    return `
      <article class="category-card category-card--${visual.className}" data-category="${category.name}" tabindex="0">
        <div class="category-copy">
          <h3>${category.name}</h3>
          <p>${count} trusted contact${count === 1 ? "" : "s"}</p>
          <span>${visual.detail}</span>
        </div>
        <div class="category-visual category-visual--${visual.className}" aria-hidden="true">
          <span class="category-visual-glow"></span>
          <i data-lucide="${visual.icon}"></i>
        </div>
      </article>
    `;
  }).join("");

  updateSectionShowAllButton(
    refs.showAllCategories,
    categories.length,
    mobileSectionState.categoriesExpanded,
    "Categories"
  );
  refreshIcons();
}

function getFilteredProviders() {
  const query = refs.searchInput.value.trim().toLowerCase();
  const category = refs.categoryFilter.value;
  const area = refs.areaFilter.value;
  const minRating = Number(refs.ratingFilter.value || 0);
  const verified = refs.verifiedFilter.value;

  return state.providers.filter((provider) => {
    const matchesQuery = [provider.name, provider.category, provider.area, provider.phone]
      .join(" ")
      .toLowerCase()
      .includes(query);
    const matchesCategory = !category || provider.category === category;
    const matchesArea = !area || provider.area === area;
    const matchesRating = Number(provider.rating) >= minRating;
    const matchesVerified = !verified || (verified === "verified" ? provider.verified : !provider.verified);
    return matchesQuery && matchesCategory && matchesArea && matchesRating && matchesVerified;
  });
}

function renderProviderModal(providerId = activeProviderId, tab = activeProviderTab) {
  const provider = state.providers.find((item) => item.id === providerId);
  if (!provider) return;

  activeProviderId = providerId;
  activeProviderTab = tab;
  const details = getProviderDetails(provider.id);
  const approvedReviews = details.reviews.filter((review) => isAdminUnlocked() || review.status === "approved");
  const approvedPhotos = details.photos.filter((photo) => isAdminUnlocked() || photo.status === "approved");
  const tabs = [
    ["overview", "Overview"],
    ["reviews", "Reviews / Threads"],
    ["photos", "Photos"],
    ["admin", "Admin Notes"]
  ];

  refs.providerModalContent.innerHTML = `
    <header class="modal-provider-header">
      <div>
        <p class="eyebrow">${escapeHtml(provider.category)}</p>
        <h2 id="providerModalTitle">${escapeHtml(provider.name)}</h2>
        <div class="modal-meta-row">
          <span><i data-lucide="map-pin"></i>${escapeHtml(provider.area)}</span>
          <span><i data-lucide="phone"></i>${escapeHtml(provider.phone)}</span>
          <span class="badge ${provider.verified ? "verified" : "unverified"}">${provider.verified ? "Verified" : "Unverified"}</span>
        </div>
      </div>
      <div class="modal-action-row">
        <a class="btn call-btn" href="tel:${phoneLink(provider.phone)}"><i data-lucide="phone-call"></i> Call</a>
        <a class="btn whatsapp-btn" href="${whatsappLink(provider.phone)}" target="_blank" rel="noreferrer"><i data-lucide="message-circle"></i> WhatsApp</a>
      </div>
    </header>

    <div class="modal-stat-grid">
      <div><span>Price / Status</span><strong>${escapeHtml(provider.price)}</strong></div>
      <div><span>Average rating</span><strong>&#9733; ${Number(provider.rating).toFixed(1)}</strong></div>
      <div><span>Total reviews</span><strong>${provider.reviews}</strong></div>
      <div><span>Community threads</span><strong>${approvedReviews.length}</strong></div>
    </div>

    <nav class="modal-tabs" aria-label="Provider detail tabs">
      ${tabs.map(([id, label]) => `<button class="${id === tab ? "active" : ""}" type="button" data-provider-tab="${id}">${label}</button>`).join("")}
    </nav>

    <div class="modal-tab-panel">
      ${renderProviderTab(provider, details, tab)}
    </div>
  `;
  refreshIcons();
}

function renderProviderTab(provider, details, tab) {
  if (tab === "reviews") return renderReviewsTab(provider, details);
  if (tab === "photos") return renderPhotosTab(provider, details);
  if (tab === "admin") return renderAdminNotesTab(provider, details);
  return renderOverviewTab(provider, details);
}

function renderOverviewTab(provider, details) {
  const latestReviews = details.reviews
    .filter((review) => isAdminUnlocked() || review.status === "approved")
    .sort((a, b) => Number(b.pinned) - Number(a.pinned) || new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 2);

  return `
    <div class="modal-overview-grid">
      <section class="modal-info-card">
        <h3>Provider details</h3>
        <dl class="detail-list">
          <div><dt>Business / Provider</dt><dd>${escapeHtml(provider.name)}</dd></div>
          <div><dt>Category</dt><dd>${escapeHtml(provider.category)}</dd></div>
          <div><dt>Area</dt><dd>${escapeHtml(provider.area)}</dd></div>
          <div><dt>Phone</dt><dd>${escapeHtml(provider.phone)}</dd></div>
          <div><dt>Verification</dt><dd>${provider.verified ? "Verified provider" : "Community submitted, needs confirmation"}</dd></div>
        </dl>
      </section>
      <section class="modal-info-card">
        <h3>Recent community threads</h3>
        ${latestReviews.length ? latestReviews.map(renderReviewCard).join("") : `<p class="modal-empty">No reviews yet.</p>`}
      </section>
    </div>
  `;
}

function renderReviewsTab(provider, details) {
  const visibleReviews = details.reviews
    .filter((review) => isAdminUnlocked() || review.status === "approved")
    .sort((a, b) => Number(b.pinned) - Number(a.pinned) || new Date(b.createdAt) - new Date(a.createdAt));

  return `
    <section class="modal-info-card">
      <h3>Start a review/thread</h3>
      <form class="review-form" id="reviewForm">
        <div class="form-row">
          <input name="author" required placeholder="Your name">
          <select name="rating" required>
            <option value="5">5 stars</option>
            <option value="4">4 stars</option>
            <option value="3">3 stars</option>
            <option value="2">2 stars</option>
            <option value="1">1 star</option>
          </select>
        </div>
        <textarea name="feedback" required rows="4" placeholder="Share your experience, pricing, punctuality, and quality."></textarea>
        <label class="upload-field">
          <i data-lucide="image-plus"></i>
          <span>Upload experience pictures</span>
          <input id="reviewImages" type="file" accept="image/*" multiple>
        </label>
        <div class="image-preview-grid" id="reviewPreview"></div>
        <button class="btn btn-primary" type="submit"><i data-lucide="send"></i> Submit Review</button>
        <p class="form-status" id="reviewStatus" role="status"></p>
      </form>
    </section>

    <section class="modal-info-card">
      <h3>Community reviews / threads</h3>
      ${visibleReviews.length ? visibleReviews.map(renderReviewCard).join("") : `<p class="modal-empty">No reviews yet.</p>`}
    </section>
  `;
}

function renderReviewCard(review) {
  const pictures = review.pictures?.length ? `
    <div class="thread-photo-row">
      ${review.pictures.map((picture) => `<img src="${picture.src}" alt="${escapeHtml(picture.name || "Review photo")}">`).join("")}
    </div>
  ` : "";

  return `
    <article class="thread-card ${review.pinned ? "pinned" : ""}">
      <div class="thread-card-top">
        <div>
          <strong>${escapeHtml(review.author)}</strong>
          <span>${formatDate(review.createdAt)} &middot; <span class="stars">${renderStars(review.rating)}</span></span>
        </div>
        <div class="thread-flags">
          ${review.pinned ? `<span class="mini-badge gold">Pinned</span>` : ""}
          ${isAdminUnlocked() ? `<span class="mini-badge">${statusLabel(review.status)}</span>` : ""}
        </div>
      </div>
      <p>${escapeHtml(review.feedback)}</p>
      ${pictures}
      ${isAdminUnlocked() ? `
        <div class="admin-inline-actions">
          <button class="btn btn-dark" type="button" data-pin-review="${review.id}">${review.pinned ? "Unpin" : "Pin"}</button>
          ${review.status !== "approved" ? `<button class="btn btn-dark" type="button" data-approve-review="${review.id}">Approve</button>` : ""}
          <button class="btn call-btn" type="button" data-reject-review="${review.id}">Remove</button>
        </div>
      ` : ""}
    </article>
  `;
}

function renderPhotosTab(provider, details) {
  const visiblePhotos = details.photos
    .filter((photo) => isAdminUnlocked() || photo.status === "approved")
    .sort((a, b) => Number(b.official) - Number(a.official) || new Date(b.createdAt) - new Date(a.createdAt));

  return `
    <section class="modal-info-card">
      <h3>Upload experience photos</h3>
      <form class="photo-form" id="photoForm">
        <input name="caption" placeholder="Caption or short note">
        <label class="upload-field">
          <i data-lucide="image-plus"></i>
          <span>Select photos</span>
          <input id="photoImages" type="file" accept="image/*" multiple>
        </label>
        <div class="image-preview-grid" id="photoPreview"></div>
        <button class="btn btn-primary" type="submit"><i data-lucide="upload"></i> Submit Photos</button>
        <p class="form-status" id="photoStatus" role="status"></p>
      </form>
    </section>

    ${isAdminUnlocked() ? `
      <section class="modal-info-card">
        <h3>Admin official photos</h3>
        <form class="photo-form" id="officialPhotoForm">
          <input name="caption" placeholder="Official photo caption">
          <label class="upload-field">
            <i data-lucide="badge-plus"></i>
            <span>Add official provider/service photos</span>
            <input id="officialPhotoImages" type="file" accept="image/*" multiple>
          </label>
          <div class="image-preview-grid" id="officialPhotoPreview"></div>
          <button class="btn btn-dark" type="submit"><i data-lucide="image-up"></i> Add Official Photos</button>
        </form>
      </section>
    ` : ""}

    <section class="modal-info-card">
      <h3>Service/business photos</h3>
      ${visiblePhotos.length ? `
        <div class="photo-gallery">
          ${visiblePhotos.map((photo) => `
            <figure>
              <img src="${photo.src}" alt="${escapeHtml(photo.caption || "Provider photo")}">
              <figcaption>
                <strong>${photo.official ? "Official" : "Community"}</strong>
                <span>${escapeHtml(photo.caption || "No caption")} ${isAdminUnlocked() ? `&middot; ${statusLabel(photo.status)}` : ""}</span>
              </figcaption>
              ${isAdminUnlocked() ? `
                <div class="admin-inline-actions">
                  ${photo.status !== "approved" ? `<button class="btn btn-dark" type="button" data-approve-photo="${photo.id}">Approve</button>` : ""}
                  <button class="btn call-btn" type="button" data-remove-photo="${photo.id}">Remove</button>
                </div>
              ` : ""}
            </figure>
          `).join("")}
        </div>
      ` : `<p class="modal-empty">No photos uploaded yet.</p>`}
    </section>
  `;
}

function renderAdminNotesTab(provider, details) {
  if (!isAdminUnlocked()) {
    return `
      <section class="modal-info-card">
        <h3>Admin Notes</h3>
        <p class="modal-empty">Admin notes are only visible after admin PIN access.</p>
      </section>
    `;
  }

  return `
    <section class="modal-info-card">
      <h3>Edit provider details</h3>
      <form class="provider-edit-form" id="modalProviderEditForm">
        <input name="name" required value="${escapeHtml(provider.name)}" placeholder="Provider name">
        <input name="category" required value="${escapeHtml(provider.category)}" placeholder="Category">
        <input name="phone" required value="${escapeHtml(provider.phone)}" placeholder="Phone">
        <input name="area" required value="${escapeHtml(provider.area)}" placeholder="Area">
        <input name="price" required value="${escapeHtml(provider.price)}" placeholder="Estimated price / status">
        <input name="rating" type="number" min="0" max="5" step="0.1" required value="${provider.rating}" placeholder="Average rating">
        <input name="reviews" type="number" min="0" step="1" required value="${provider.reviews}" placeholder="Total reviews">
        <select name="verified">
          <option value="true" ${provider.verified ? "selected" : ""}>Verified</option>
          <option value="false" ${!provider.verified ? "selected" : ""}>Unverified</option>
        </select>
        <button class="btn btn-dark" type="submit"><i data-lucide="save"></i> Save Provider Details</button>
      </form>
    </section>

    <section class="modal-info-card">
      <h3>Admin notes</h3>
      <form id="adminNotesForm">
        <textarea name="adminNotes" rows="5" placeholder="Internal provider notes, CNIC status, quality flags, follow-up reminders...">${escapeHtml(details.adminNotes || "")}</textarea>
        <button class="btn btn-primary" type="submit"><i data-lucide="sticky-note"></i> Save Notes</button>
        <p class="form-status" id="adminNotesStatus" role="status"></p>
      </form>
    </section>
  `;
}

function openProviderModal(providerId) {
  activeProviderId = providerId;
  activeProviderTab = "overview";
  pendingReviewImages = [];
  pendingPhotoImages = [];
  pendingOfficialImages = [];
  refs.providerModal.hidden = false;
  document.body.classList.add("modal-open");
  renderProviderModal(providerId, "overview");
}

function closeProviderModal() {
  refs.providerModal.hidden = true;
  document.body.classList.remove("modal-open");
}

function renderProviders() {
  const providers = getFilteredProviders();
  const visibleProviders = getPreviewItems(providers, mobileSectionState.providersExpanded);

  refs.resultCount.textContent = `${providers.length} provider${providers.length === 1 ? "" : "s"}`;
  refs.clearProviderFilters.hidden = !(
    refs.categoryFilter.value ||
    refs.searchInput.value ||
    refs.areaFilter.value ||
    refs.ratingFilter.value ||
    refs.verifiedFilter.value
  );
  refs.emptyState.style.display = providers.length ? "none" : "block";
  refs.providerGrid.innerHTML = visibleProviders.map((provider) => `
    <article class="provider-card provider-card-clickable" data-provider-id="${provider.id}" tabindex="0" aria-label="Open details for ${escapeHtml(provider.name)}">
      <div class="provider-top">
        <div>
          <h3>${provider.name}</h3>
          <div class="provider-meta">
            <span><i data-lucide="briefcase"></i>${provider.category}</span>
            <span><i data-lucide="map-pin"></i>${provider.area}</span>
          </div>
        </div>
        <span class="badge ${provider.verified ? "verified" : "unverified"}">
          ${provider.verified ? "Verified" : "Unverified"}
        </span>
      </div>
      <div class="price-rating">
        <span>${provider.price}</span>
        <span>&#9733; ${Number(provider.rating).toFixed(1)} rating &middot; ${provider.reviews} reviews</span>
      </div>
      <div class="provider-meta">
        <span><i data-lucide="phone"></i>${provider.phone}</span>
      </div>
      <div class="provider-actions">
        <a class="btn call-btn" href="tel:${phoneLink(provider.phone)}"><i data-lucide="phone-call"></i> Call</a>
        <a class="btn whatsapp-btn" href="${whatsappLink(provider.phone)}" target="_blank" rel="noreferrer"><i data-lucide="message-circle"></i> WhatsApp</a>
      </div>
      <p class="card-detail-hint">Tap card for full details, reviews, and photos.</p>
    </article>
  `).join("");

  updateSectionShowAllButton(
    refs.showAllProvidersList,
    providers.length,
    mobileSectionState.providersExpanded,
    "Providers"
  );
  refreshIcons();
}

function refreshIcons() {
  if (window.lucide) {
    window.lucide.createIcons();
  }
}

["input", "change"].forEach((eventName) => {
  refs.filterForm.addEventListener(eventName, () => {
    mobileSectionState.providersExpanded = false;
    renderProviders();
  });
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
  mobileSectionState.providersExpanded = false;
  renderProviders();
});

refs.showAllCategories.addEventListener("click", () => {
  mobileSectionState.categoriesExpanded = !mobileSectionState.categoriesExpanded;
  renderCategories();
});

refs.showAllProvidersList.addEventListener("click", () => {
  mobileSectionState.providersExpanded = !mobileSectionState.providersExpanded;
  renderProviders();
});

mobileBreakpoint.addEventListener("change", () => {
  if (!mobileBreakpoint.matches) {
    mobileSectionState.categoriesExpanded = false;
    mobileSectionState.providersExpanded = false;
  }
  renderCategories();
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

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && !refs.providerModal.hidden) {
    closeProviderModal();
  }
});

refs.providerModalContent.addEventListener("click", (event) => {
  const tabButton = event.target.closest("[data-provider-tab]");
  if (tabButton) {
    activeProviderTab = tabButton.dataset.providerTab;
    pendingReviewImages = [];
    pendingPhotoImages = [];
    pendingOfficialImages = [];
    renderProviderModal(activeProviderId, activeProviderTab);
    return;
  }

  const details = getProviderDetails(activeProviderId);
  const reviewId = event.target.closest("[data-pin-review], [data-approve-review], [data-reject-review]")?.dataset;
  const photoId = event.target.closest("[data-approve-photo], [data-remove-photo]")?.dataset;

  if (reviewId?.pinReview) {
    const review = details.reviews.find((item) => item.id === reviewId.pinReview);
    if (review) review.pinned = !review.pinned;
    saveAll();
    renderProviderModal(activeProviderId, activeProviderTab);
  }

  if (reviewId?.approveReview) {
    const review = details.reviews.find((item) => item.id === reviewId.approveReview);
    if (review) review.status = "approved";
    saveAll();
    renderProviderModal(activeProviderId, activeProviderTab);
  }

  if (reviewId?.rejectReview) {
    details.reviews = details.reviews.filter((item) => item.id !== reviewId.rejectReview);
    saveAll();
    renderProviderModal(activeProviderId, activeProviderTab);
  }

  if (photoId?.approvePhoto) {
    const photo = details.photos.find((item) => item.id === photoId.approvePhoto);
    if (photo) photo.status = "approved";
    saveAll();
    renderProviderModal(activeProviderId, activeProviderTab);
  }

  if (photoId?.removePhoto) {
    details.photos = details.photos.filter((item) => item.id !== photoId.removePhoto);
    saveAll();
    renderProviderModal(activeProviderId, activeProviderTab);
  }
});

refs.providerModalContent.addEventListener("change", (event) => {
  if (event.target.id === "reviewImages") {
    fileListToDataUrls(event.target.files, (images) => {
      pendingReviewImages = images;
      renderImagePreview(pendingReviewImages, "reviewPreview");
    });
  }

  if (event.target.id === "photoImages") {
    fileListToDataUrls(event.target.files, (images) => {
      pendingPhotoImages = images;
      renderImagePreview(pendingPhotoImages, "photoPreview");
    });
  }

  if (event.target.id === "officialPhotoImages") {
    fileListToDataUrls(event.target.files, (images) => {
      pendingOfficialImages = images;
      renderImagePreview(pendingOfficialImages, "officialPhotoPreview");
    });
  }
});

refs.providerModalContent.addEventListener("submit", (event) => {
  event.preventDefault();
  const provider = getActiveProvider();
  const details = getProviderDetails(activeProviderId);

  if (event.target.id === "reviewForm") {
    const data = Object.fromEntries(new FormData(event.target));
    details.reviews.unshift({
      id: crypto.randomUUID(),
      author: data.author.trim(),
      rating: Number(data.rating),
      feedback: data.feedback.trim(),
      pictures: pendingReviewImages,
      pinned: false,
      status: isAdminUnlocked() ? "approved" : "pending",
      createdAt: new Date().toISOString()
    });
    pendingReviewImages = [];
    saveAll();
    renderProviderModal(activeProviderId, "reviews");
  }

  if (event.target.id === "photoForm") {
    const data = Object.fromEntries(new FormData(event.target));
    details.photos.unshift(...pendingPhotoImages.map((image) => ({
      id: crypto.randomUUID(),
      src: image.src,
      caption: data.caption.trim(),
      official: false,
      status: isAdminUnlocked() ? "approved" : "pending",
      createdAt: new Date().toISOString()
    })));
    pendingPhotoImages = [];
    saveAll();
    renderProviderModal(activeProviderId, "photos");
  }

  if (event.target.id === "officialPhotoForm" && isAdminUnlocked()) {
    const data = Object.fromEntries(new FormData(event.target));
    details.photos.unshift(...pendingOfficialImages.map((image) => ({
      id: crypto.randomUUID(),
      src: image.src,
      caption: data.caption.trim(),
      official: true,
      status: "approved",
      createdAt: new Date().toISOString()
    })));
    pendingOfficialImages = [];
    saveAll();
    renderProviderModal(activeProviderId, "photos");
  }

  if (event.target.id === "modalProviderEditForm" && isAdminUnlocked() && provider) {
    const data = Object.fromEntries(new FormData(event.target));
    Object.assign(provider, {
      name: data.name.trim(),
      category: data.category.trim(),
      phone: data.phone.trim(),
      area: data.area.trim(),
      price: data.price.trim(),
      rating: Number(data.rating),
      reviews: Number(data.reviews),
      verified: data.verified === "true"
    });
    saveAll();
    renderProviders();
    renderProviderModal(activeProviderId, "admin");
  }

  if (event.target.id === "adminNotesForm" && isAdminUnlocked()) {
    const data = Object.fromEntries(new FormData(event.target));
    details.adminNotes = data.adminNotes.trim();
    saveAll();
    renderProviderModal(activeProviderId, "admin");
  }
});

refs.categoryGrid.addEventListener("click", (event) => {
  const card = event.target.closest(".category-card");
  if (!card) return;
  refs.categoryFilter.value = card.dataset.category;
  mobileSectionState.providersExpanded = false;
  renderProviders();
  document.querySelector("#providers").scrollIntoView({ behavior: "smooth" });
});

refs.categoryGrid.addEventListener("keydown", (event) => {
  if (event.key !== "Enter" && event.key !== " ") return;
  const card = event.target.closest(".category-card");
  if (!card) return;
  event.preventDefault();
  card.click();
});

refs.contributionForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const data = Object.fromEntries(new FormData(refs.contributionForm));
  state.submissions.unshift({ id: crypto.randomUUID(), ...data });
  saveAll();
  refs.contributionForm.reset();
  refs.formStatus.textContent = "Submitted for admin review.";
});

renderFilters();
renderCategories();
renderProviders();
refreshIcons();
