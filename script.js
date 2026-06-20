// ============ SUPABASE INITIALIZATION ============

let supabase;

function initSupabase() {
  if (!window.supabase || !window.supabase.createClient) {
    setTimeout(initSupabase, 50);
    return;
  }
  
  supabase = window.supabase.createClient(
    'https://yfzdlodxwfhbzzvqsaau.supabase.co',
    'sb_publishable_BF1M6x269XZI25QE4ruRPw_Y06C9gHR'
  );
  
  console.log('✓ Supabase ready');
  fetchProviders();
}

// Start initialization
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initSupabase);
} else {
  initSupabase();
}

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
    const response = await supabase
      .from('providers')
      .select('*')
      .order('created_at', { ascending: false });
    
    const data = response.data;
    const error = response.error;
    
    if (error) throw error;
    state.providers = data || [];
    console.log('✓ Loaded', state.providers.length, 'providers');
    renderFilters();
    renderProviders();
  } catch (error) {
    console.error('❌ Error fetching providers:', error.message);
  }
}

async function fetchProviderDetails(providerId) {
  try {
    if (state.providerDetails[providerId]) {
      return state.providerDetails[providerId];
    }

    const reviewsRes = await supabase
      .from('reviews')
      .select('*')
      .eq('provider_id', providerId)
      .eq('status', 'approved')
      .order('created_at', { ascending: false });

    const photosRes = await supabase
      .from('photos')
      .select('*')
      .eq('provider_id', providerId)
      .eq('status', 'approved')
      .order('created_at', { ascending: false });

    state.providerDetails[providerId] = {
      reviews: reviewsRes.data || [],
      photos: photosRes.data || []
    };

    return state.providerDetails[providerId];
  } catch (error) {
    console.error('Error fetching details:', error.message);
    return { reviews: [], photos: [] };
  }
}

async function submitContribution(formData) {
  try {
    await supabase
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

    refs.formStatus.textContent = '✓ Thank you! Submitted for review.';
    refs.formStatus.style.display = 'block';
    setTimeout(() => {
      refs.formStatus.textContent = '';
    }, 5000);
    return true;
  } catch (error) {
    console.error('Error submitting:', error.message);
    return false;
  }
}

// ============ UTILITIES ============
function escapeHtml(text) {
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  };
  return String(text).replace(/[&<>"']/g, m => map[m]);
}

function phoneLink(phone) {
  return phone.replace(/[^\d+]/g, "");
}

function whatsappLink(phone) {
  let digits = phone.replace(/\D/g, "");
  if (digits.startsWith("0")) digits = "92" + digits.slice(1);
  return "https://wa.me/" + digits;
}

// ============ RENDER FUNCTIONS ============
function renderFilters() {
  const categories = [...new Set(state.providers.map(p => p.category))];
  const areas = [...new Set(state.providers.map(p => p.area))];

  refs.categoryFilter.innerHTML = '<option value="">All categories</option>' +
    categories.map(c => '<option value="' + escapeHtml(c) + '">' + escapeHtml(c) + '</option>').join("");

  refs.areaFilter.innerHTML = '<option value="">All areas</option>' +
    areas.map(a => '<option value="' + escapeHtml(a) + '">' + escapeHtml(a) + '</option>').join("");
}

function renderProviders() {
  const search = refs.searchInput.value.toLowerCase();
  const category = refs.categoryFilter.value;
  const area = refs.areaFilter.value;
  const minRating = refs.ratingFilter.value ? Number(refs.ratingFilter.value) : 0;
  const verified = refs.verifiedFilter.value ? refs.verifiedFilter.value === "verified" : null;

  let filtered = state.providers.filter(p => {
    const matchesSearch = !search || p.name.toLowerCase().includes(search) || p.category.toLowerCase().includes(search);
    const matchesCategory = !category || p.category === category;
    const matchesArea = !area || p.area === area;
    const matchesRating = !minRating || p.rating >= minRating;
    const matchesVerified = verified === null || p.verified === verified;
    return matchesSearch && matchesCategory && matchesArea && matchesRating && matchesVerified;
  });

  refs.resultCount.textContent = filtered.length + ' provider' + (filtered.length !== 1 ? 's' : '');
  refs.clearProviderFilters.hidden = !(search || category || area || minRating || verified !== null);
  refs.emptyState.hidden = filtered.length > 0;

  refs.providerGrid.innerHTML = filtered.map(provider => '<article class="provider-card" data-provider-id="' + escapeHtml(provider.id) + '" role="button" tabindex="0"><div class="provider-header"><div class="provider-name"><h3>' + escapeHtml(provider.name) + '</h3><p class="provider-category">' + escapeHtml(provider.category) + '</p></div><span class="badge ' + (provider.verified ? 'verified' : 'unverified') + '">' + (provider.verified ? '✓ Verified' : 'Community') + '</span></div><div class="price-rating"><span>' + escapeHtml(provider.price || 'N/A') + '</span><span>★ ' + Number(provider.rating || 4.5).toFixed(1) + ' rating · ' + (provider.reviews || 0) + ' reviews</span></div><div class="provider-meta"><i data-lucide="phone"></i><span>' + escapeHtml(provider.phone) + '</span></div><div class="provider-actions"><a class="btn call-btn" href="tel:' + phoneLink(provider.phone) + '"><i data-lucide="phone-call"></i> Call</a><a class="btn whatsapp-btn" href="' + whatsappLink(provider.phone) + '" target="_blank" rel="noreferrer"><i data-lucide="message-circle"></i> WhatsApp</a></div><p class="card-detail-hint">Tap for details, reviews & photos</p></article>').join("");
  
  if (window.lucide) {
    window.lucide.createIcons();
  }
}

async function openProviderModal(providerId) {
  activeProviderId = providerId;
  activeProviderTab = "overview";
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
  const provider = state.providers.find(p => p.id === providerId);
  if (!provider) return;

  const details = state.providerDetails[providerId] || { reviews: [], photos: [] };

  let content = '<div class="modal-provider-header"><h2>' + escapeHtml(provider.name) + '</h2><div class="modal-meta-row"><span class="badge ' + (provider.verified ? 'verified' : 'unverified') + '">' + (provider.verified ? '✓ Verified' : 'Community') + '</span><span><i data-lucide="map-pin"></i>' + escapeHtml(provider.area) + '</span><span><i data-lucide="star"></i>' + Number(provider.rating || 4.5).toFixed(1) + ' (' + (provider.reviews || 0) + ')</span></div></div>';

  content += '<div class="modal-stat-grid"><div><span>Category</span><strong>' + escapeHtml(provider.category) + '</strong></div><div><span>Price</span><strong>' + escapeHtml(provider.price || 'N/A') + '</strong></div><div><span>Area</span><strong>' + escapeHtml(provider.area) + '</strong></div><div><span>Rating</span><strong>★ ' + Number(provider.rating || 4.5).toFixed(1) + '</strong></div></div>';

  content += '<div class="modal-tabs"><button type="button" data-provider-tab="overview" class="modal-tab-btn ' + (tab === "overview" ? "active" : "") + '">Overview</button><button type="button" data-provider-tab="reviews" class="modal-tab-btn ' + (tab === "reviews" ? "active" : "") + '">Reviews</button><button type="button" data-provider-tab="photos" class="modal-tab-btn ' + (tab === "photos" ? "active" : "") + '">Photos</button></div>';

  content += '<div class="modal-tab-panel">';

  if (tab === "overview") {
    content += '<div class="modal-overview-grid"><div class="modal-info-card"><h3>Contact</h3><dl class="detail-list"><div><dt>Phone</dt><dd><a href="tel:' + phoneLink(provider.phone) + '" style="color: var(--gold);">' + escapeHtml(provider.phone) + '</a></dd></div><div><dt>WhatsApp</dt><dd><a href="' + whatsappLink(provider.phone) + '" target="_blank" style="color: var(--gold);">Chat</a></dd></div></dl></div></div>';
  } else if (tab === "reviews") {
    content += '<div style="margin-top: 20px;"><h3>Reviews</h3>' + (details.reviews.length === 0 ? '<p class="modal-empty">No reviews yet</p>' : details.reviews.map(r => '<div class="thread-card"><strong>' + escapeHtml(r.author) + '</strong><p>' + escapeHtml(r.feedback) + '</p></div>').join('')) + '</div>';
  } else if (tab === "photos") {
    content += '<div style="margin-top: 20px;"><h3>Photos</h3>' + (details.photos.length === 0 ? '<p class="modal-empty">No photos yet</p>' : '<div class="photo-gallery">' + details.photos.map(p => '<figure><img src="' + escapeHtml(p.image_url) + '" alt="Photo" loading="lazy" style="aspect-ratio: 4/3; object-fit: cover;"><figcaption>' + escapeHtml(p.caption) + '</figcaption></figure>').join('') + '</div>') + '</div>';
  }

  content += '</div></div>';
  refs.providerModalContent.innerHTML = content;
  
  if (window.lucide) {
    window.lucide.createIcons();
  }
}

// ============ EVENT LISTENERS ============
refs.filterForm.addEventListener('input', renderProviders);
refs.filterForm.addEventListener('change', renderProviders);
refs.filterForm.addEventListener('submit', e => { e.preventDefault(); renderProviders(); });

refs.clearProviderFilters.addEventListener('click', () => {
  refs.searchInput.value = "";
  refs.categoryFilter.value = "";
  refs.areaFilter.value = "";
  refs.ratingFilter.value = "";
  refs.verifiedFilter.value = "";
  renderProviders();
});

refs.providerGrid.addEventListener('click', event => {
  if (event.target.closest('a, button')) return;
  const card = event.target.closest('[data-provider-id]');
  if (card) openProviderModal(card.dataset.providerId);
});

refs.providerModal.addEventListener('click', event => {
  if (event.target.closest('[data-close-provider-modal]')) {
    closeProviderModal();
  }
});

refs.providerModalContent.addEventListener('click', event => {
  const btn = event.target.closest('[data-provider-tab]');
  if (btn) {
    activeProviderTab = btn.dataset.providerTab;
    renderProviderModal(activeProviderId, activeProviderTab);
  }
});

document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && !refs.providerModal.hidden) {
    closeProviderModal();
  }
});

refs.contributionForm.addEventListener('submit', async event => {
  event.preventDefault();
  const formData = new FormData(refs.contributionForm);
  const data = Object.fromEntries(formData);
  const success = await submitContribution(data);
  if (success) {
    refs.contributionForm.reset();
  }
});
