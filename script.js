// CONNECTIFY - Main JavaScript File
// Supabase Integration

// Initialize Supabase when library is ready
let supabaseClient = null;

function initializeSupabase() {
  if (window.supabase && window.supabase.createClient) {
    supabaseClient = window.supabase.createClient(
      'https://yfzdlodxwfhbzzvqsaau.supabase.co',
      'sb_publishable_BF1M6x269XZI25QE4ruRPw_Y06C9gHR'
    );
    console.log('✓ Supabase initialized');
    loadAllProviders();
  }
}

// Wait for DOM and Supabase library
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeSupabase);
} else {
  initializeSupabase();
}

// ========== STATE ==========
const appState = {
  providers: [],
  details: {}
};

const domRefs = {
  searchInput: document.querySelector("#searchInput"),
  categoryFilter: document.querySelector("#categoryFilter"),
  areaFilter: document.querySelector("#areaFilter"),
  ratingFilter: document.querySelector("#ratingFilter"),
  verifiedFilter: document.querySelector("#verifiedFilter"),
  filterForm: document.querySelector("#filterForm"),
  providerGrid: document.querySelector("#providerGrid"),
  resultCount: document.querySelector("#resultCount"),
  emptyState: document.querySelector("#emptyState"),
  clearFilters: document.querySelector("#clearProviderFilters"),
  contributionForm: document.querySelector("#contributionForm"),
  formStatus: document.querySelector("#formStatus"),
  modal: document.querySelector("#providerModal"),
  modalContent: document.querySelector("#providerModalContent")
};

let currentProviderId = null;

// ========== SUPABASE FUNCTIONS ==========
async function loadAllProviders() {
  if (!supabaseClient) return;
  
  try {
    const { data, error } = await supabaseClient
      .from('providers')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    
    appState.providers = data || [];
    console.log('✓ Loaded providers:', appState.providers.length);
    
    updateFilterOptions();
    displayProviders();
  } catch (err) {
    console.error('Error loading providers:', err);
  }
}

async function loadProviderDetails(providerId) {
  if (!supabaseClient || appState.details[providerId]) return appState.details[providerId];
  
  try {
    const reviews = await supabaseClient
      .from('reviews')
      .select('*')
      .eq('provider_id', providerId)
      .eq('status', 'approved');
    
    const photos = await supabaseClient
      .from('photos')
      .select('*')
      .eq('provider_id', providerId)
      .eq('status', 'approved');
    
    appState.details[providerId] = {
      reviews: reviews.data || [],
      photos: photos.data || []
    };
    
    return appState.details[providerId];
  } catch (err) {
    console.error('Error loading details:', err);
    return { reviews: [], photos: [] };
  }
}

async function submitNewProvider(formData) {
  if (!supabaseClient) return false;
  
  try {
    await supabaseClient.from('submissions').insert({
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
    
    domRefs.formStatus.textContent = '✓ Thank you! Submitted for review.';
    return true;
  } catch (err) {
    console.error('Error submitting:', err);
    domRefs.formStatus.textContent = '✗ Error submitting. Try again.';
    return false;
  }
}

// ========== UTILITY FUNCTIONS ==========
function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

function phoneLink(phone) {
  return phone.replace(/[^\d+]/g, '');
}

function whatsappLink(phone) {
  let digits = phone.replace(/\D/g, '');
  if (digits.startsWith('0')) digits = '92' + digits.slice(1);
  return 'https://wa.me/' + digits;
}

function refreshIcons() {
  if (window.lucide) window.lucide.createIcons();
}

// ========== FILTER & DISPLAY ==========
function updateFilterOptions() {
  const categories = [...new Set(appState.providers.map(p => p.category))];
  const areas = [...new Set(appState.providers.map(p => p.area))];
  
  domRefs.categoryFilter.innerHTML = '<option value="">All categories</option>' +
    categories.map(c => `<option value="${escapeHtml(c)}">${escapeHtml(c)}</option>`).join('');
  
  domRefs.areaFilter.innerHTML = '<option value="">All areas</option>' +
    areas.map(a => `<option value="${escapeHtml(a)}">${escapeHtml(a)}</option>`).join('');
}

function displayProviders() {
  const search = domRefs.searchInput.value.toLowerCase();
  const category = domRefs.categoryFilter.value;
  const area = domRefs.areaFilter.value;
  const minRating = domRefs.ratingFilter.value ? Number(domRefs.ratingFilter.value) : 0;
  const verified = domRefs.verifiedFilter.value ? domRefs.verifiedFilter.value === 'verified' : null;
  
  let filtered = appState.providers.filter(p => {
    const matchSearch = !search || p.name.toLowerCase().includes(search) || p.category.toLowerCase().includes(search);
    const matchCat = !category || p.category === category;
    const matchArea = !area || p.area === area;
    const matchRating = !minRating || p.rating >= minRating;
    const matchVer = verified === null || p.verified === verified;
    return matchSearch && matchCat && matchArea && matchRating && matchVer;
  });
  
  domRefs.resultCount.textContent = filtered.length + ' provider' + (filtered.length !== 1 ? 's' : '');
  domRefs.emptyState.hidden = filtered.length > 0;
  domRefs.clearFilters.hidden = !(search || category || area || minRating || verified !== null);
  
  domRefs.providerGrid.innerHTML = filtered.map(p => `
    <article class="provider-card" data-id="${escapeHtml(p.id)}" role="button" tabindex="0">
      <div class="provider-header">
        <div class="provider-name">
          <h3>${escapeHtml(p.name)}</h3>
          <p class="provider-category">${escapeHtml(p.category)}</p>
        </div>
        <span class="badge ${p.verified ? 'verified' : 'unverified'}">
          ${p.verified ? '✓ Verified' : 'Community'}
        </span>
      </div>
      <div class="price-rating">
        <span>${escapeHtml(p.price || 'N/A')}</span>
        <span>★ ${Number(p.rating || 4.5).toFixed(1)} · ${p.reviews || 0} reviews</span>
      </div>
      <div class="provider-meta">
        <i data-lucide="phone"></i>
        <span>${escapeHtml(p.phone)}</span>
      </div>
      <div class="provider-actions">
        <a class="btn call-btn" href="tel:${phoneLink(p.phone)}"><i data-lucide="phone-call"></i> Call</a>
        <a class="btn whatsapp-btn" href="${whatsappLink(p.phone)}" target="_blank"><i data-lucide="message-circle"></i> WhatsApp</a>
      </div>
      <p class="card-detail-hint">Tap for details</p>
    </article>
  `).join('');
  
  refreshIcons();
}

async function openModal(providerId) {
  currentProviderId = providerId;
  const details = await loadProviderDetails(providerId);
  const provider = appState.providers.find(p => p.id === providerId);
  
  if (!provider) return;
  
  domRefs.modalContent.innerHTML = `
    <div class="modal-provider-header">
      <h2>${escapeHtml(provider.name)}</h2>
      <div class="modal-meta-row">
        <span class="badge ${provider.verified ? 'verified' : 'unverified'}">
          ${provider.verified ? '✓ Verified' : 'Community'}
        </span>
        <span><i data-lucide="map-pin"></i> ${escapeHtml(provider.area)}</span>
        <span><i data-lucide="star"></i> ${Number(provider.rating || 4.5).toFixed(1)}</span>
      </div>
    </div>
    
    <div class="modal-stat-grid">
      <div><span>Category</span><strong>${escapeHtml(provider.category)}</strong></div>
      <div><span>Price</span><strong>${escapeHtml(provider.price || 'N/A')}</strong></div>
      <div><span>Area</span><strong>${escapeHtml(provider.area)}</strong></div>
      <div><span>Rating</span><strong>★ ${Number(provider.rating || 4.5).toFixed(1)}</strong></div>
    </div>
    
    <div class="modal-overview-grid">
      <div class="modal-info-card">
        <h3>Contact</h3>
        <dl class="detail-list">
          <div>
            <dt>Phone</dt>
            <dd><a href="tel:${phoneLink(provider.phone)}" style="color: var(--gold);">${escapeHtml(provider.phone)}</a></dd>
          </div>
          <div>
            <dt>WhatsApp</dt>
            <dd><a href="${whatsappLink(provider.phone)}" target="_blank" style="color: var(--gold);">Chat on WhatsApp</a></dd>
          </div>
        </dl>
      </div>
    </div>
    
    <div style="margin-top: 20px;">
      <h3>Reviews (${details.reviews.length})</h3>
      ${details.reviews.length === 0 ? '<p class="modal-empty">No reviews yet</p>' : 
        details.reviews.map(r => `
          <div class="thread-card">
            <strong>${escapeHtml(r.author)}</strong>
            <p>${escapeHtml(r.feedback)}</p>
          </div>
        `).join('')}
    </div>
  `;
  
  domRefs.modal.hidden = false;
  refreshIcons();
}

function closeModal() {
  domRefs.modal.hidden = true;
  currentProviderId = null;
}

// ========== EVENT LISTENERS ==========
domRefs.filterForm?.addEventListener('input', displayProviders);
domRefs.filterForm?.addEventListener('change', displayProviders);
domRefs.filterForm?.addEventListener('submit', e => { e.preventDefault(); });

domRefs.clearFilters?.addEventListener('click', () => {
  domRefs.searchInput.value = '';
  domRefs.categoryFilter.value = '';
  domRefs.areaFilter.value = '';
  domRefs.ratingFilter.value = '';
  domRefs.verifiedFilter.value = '';
  displayProviders();
});

domRefs.providerGrid?.addEventListener('click', e => {
  const card = e.target.closest('[data-id]');
  if (card && !e.target.closest('a, button')) {
    openModal(card.dataset.id);
  }
});

domRefs.modal?.addEventListener('click', e => {
  if (e.target.closest('[data-close-provider-modal]')) {
    closeModal();
  }
});

document.addEventListener('keydown', e => {
  if (e.key === 'Escape' && !domRefs.modal?.hidden) {
    closeModal();
  }
});

domRefs.contributionForm?.addEventListener('submit', async e => {
  e.preventDefault();
  const data = Object.fromEntries(new FormData(domRefs.contributionForm));
  const success = await submitNewProvider(data);
  if (success) {
    domRefs.contributionForm.reset();
    setTimeout(() => { domRefs.formStatus.textContent = ''; }, 4000);
  }
});
