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

const state = {
  categories: readStore("connectifyCategories", defaultCategories),
  providers: readStore("connectifyProviders", defaultProviders),
  submissions: readStore("connectifySubmissions", [])
};

const refs = {
  adminGate: document.querySelector("#adminGate"),
  adminPinForm: document.querySelector("#adminPinForm"),
  adminPin: document.querySelector("#adminPin"),
  adminStatus: document.querySelector("#adminStatus"),
  adminDashboard: document.querySelector("#adminDashboard"),
  pinAdminForm: document.querySelector("#pinAdminForm"),
  pinStatus: document.querySelector("#pinStatus"),
  categoryAdminForm: document.querySelector("#categoryAdminForm"),
  providerAdminForm: document.querySelector("#providerAdminForm"),
  clearProviderForm: document.querySelector("#clearProviderForm"),
  adminProviderList: document.querySelector("#adminProviderList"),
  submissionList: document.querySelector("#submissionList"),
  csvUploadForm: document.querySelector("#csvUploadForm"),
  csvFile: document.querySelector("#csvFile"),
  csvPreview: document.querySelector("#csvPreview"),
  csvImportBtn: document.querySelector("#csvImportBtn"),
  csvStatus: document.querySelector("#csvStatus")
};

let csvData = [];

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
}

function getAdminPin() {
  return localStorage.getItem("connectifyAdminPin") || "56180";
}

function refreshIcons() {
  if (window.lucide) {
    window.lucide.createIcons();
  }
}

function renderAdminProviders() {
  refs.adminProviderList.innerHTML = state.providers.map((provider) => `
    <div class="admin-row">
      <div>
        <strong>${provider.name}</strong>
        <p>${provider.category} &middot; ${provider.area} &middot; ${provider.price} &middot; &#9733; ${provider.rating} &middot; ${provider.reviews} reviews &middot; ${provider.verified ? "Verified" : "Unverified"}</p>
      </div>
      <div class="admin-row-actions">
        <button class="btn btn-dark" data-edit-provider="${provider.id}" type="button"><i data-lucide="pencil"></i> Edit</button>
        <button class="btn btn-secondary" data-toggle-provider="${provider.id}" type="button"><i data-lucide="badge-check"></i> Mark ${provider.verified ? "Unverified" : "Verified"}</button>
        <button class="btn call-btn" data-delete-provider="${provider.id}" type="button"><i data-lucide="trash-2"></i> Delete</button>
      </div>
    </div>
  `).join("");
  refreshIcons();
}

function renderSubmissions() {
  refs.submissionList.innerHTML = state.submissions.length ? state.submissions.map((submission) => `
    <div class="admin-row">
      <div>
        <strong>${submission.providerName}</strong>
        <p>${submission.serviceType} &middot; ${submission.phone} &middot; ${submission.area} &middot; Used: ${submission.used}</p>
        <p>${submission.review}</p>
        <p>Submitted by ${submission.residentName}</p>
      </div>
      <div class="admin-row-actions">
        <button class="btn btn-dark" data-approve-submission="${submission.id}" type="button"><i data-lucide="check"></i> Approve</button>
        <button class="btn call-btn" data-reject-submission="${submission.id}" type="button"><i data-lucide="x"></i> Reject</button>
      </div>
    </div>
  `).join("") : `<div class="admin-row"><p>No submitted contacts yet.</p></div>`;
  refreshIcons();
}

function renderAll() {
  renderAdminProviders();
  renderSubmissions();
}

function unlockDashboard() {
  sessionStorage.setItem("connectifyAdminUnlocked", "true");
  refs.adminGate.hidden = true;
  refs.adminDashboard.hidden = false;
  renderAll();
  refreshIcons();
}

refs.adminPinForm.addEventListener("submit", (event) => {
  event.preventDefault();
  if (refs.adminPin.value.trim() !== getAdminPin()) {
    refs.adminStatus.textContent = "Invalid PIN.";
    refs.adminPin.value = "";
    return;
  }
  unlockDashboard();
});

refs.pinAdminForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const data = Object.fromEntries(new FormData(refs.pinAdminForm));

  if (data.currentPin.trim() !== getAdminPin()) {
    refs.pinStatus.textContent = "Current PIN is incorrect.";
    return;
  }

  if (data.newPin.trim() !== data.confirmPin.trim()) {
    refs.pinStatus.textContent = "New PIN and confirmation do not match.";
    return;
  }

  if (data.newPin.trim().length < 4) {
    refs.pinStatus.textContent = "PIN must be at least 4 digits.";
    return;
  }

  localStorage.setItem("connectifyAdminPin", data.newPin.trim());
  refs.pinAdminForm.reset();
  refs.pinStatus.textContent = "Admin PIN updated.";
});

refs.categoryAdminForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const data = Object.fromEntries(new FormData(refs.categoryAdminForm));
  const categoryName = data.categoryName.trim();

  if (!state.categories.some((category) => category.name.toLowerCase() === categoryName.toLowerCase())) {
    state.categories.push({ name: categoryName, icon: data.categoryIcon.trim() || "&bull;" });
    saveAll();
    renderAll();
  }

  refs.categoryAdminForm.reset();
});

refs.providerAdminForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const data = Object.fromEntries(new FormData(refs.providerAdminForm));
  const provider = {
    id: data.providerId || crypto.randomUUID(),
    name: data.name.trim(),
    category: data.category.trim(),
    phone: data.phone.trim(),
    area: data.area.trim(),
    price: data.price.trim(),
    rating: Number(data.rating),
    reviews: Number(data.reviews),
    verified: data.verified === "true"
  };
  const existingIndex = state.providers.findIndex((item) => item.id === provider.id);

  if (existingIndex >= 0) {
    state.providers[existingIndex] = provider;
  } else {
    state.providers.unshift(provider);
  }

  if (!state.categories.some((category) => category.name.toLowerCase() === provider.category.toLowerCase())) {
    state.categories.push({ name: provider.category, icon: "&bull;" });
  }

  refs.providerAdminForm.reset();
  saveAll();
  renderAll();
});

refs.clearProviderForm.addEventListener("click", () => {
  refs.providerAdminForm.reset();
  refs.providerAdminForm.providerId.value = "";
});

refs.adminProviderList.addEventListener("click", (event) => {
  const editButton = event.target.closest("[data-edit-provider]");
  const toggleButton = event.target.closest("[data-toggle-provider]");
  const deleteButton = event.target.closest("[data-delete-provider]");

  if (editButton) {
    const provider = state.providers.find((item) => item.id === editButton.dataset.editProvider);
    if (!provider) return;
    Object.entries(provider).forEach(([key, value]) => {
      if (refs.providerAdminForm[key]) refs.providerAdminForm[key].value = String(value);
    });
    refs.providerAdminForm.providerId.value = provider.id;
  }

  if (toggleButton) {
    const provider = state.providers.find((item) => item.id === toggleButton.dataset.toggleProvider);
    if (!provider) return;
    provider.verified = !provider.verified;
    saveAll();
    renderAll();
  }

  if (deleteButton) {
    state.providers = state.providers.filter((item) => item.id !== deleteButton.dataset.deleteProvider);
    saveAll();
    renderAll();
  }
});

refs.submissionList.addEventListener("click", (event) => {
  const approveButton = event.target.closest("[data-approve-submission]");
  const rejectButton = event.target.closest("[data-reject-submission]");
  const id = approveButton?.dataset.approveSubmission || rejectButton?.dataset.rejectSubmission;
  if (!id) return;
  const submission = state.submissions.find((item) => item.id === id);

  if (approveButton && submission) {
    state.providers.unshift({
      id: crypto.randomUUID(),
      name: submission.providerName,
      category: submission.serviceType,
      phone: submission.phone,
      area: submission.area,
      verified: false,
      price: "To be confirmed",
      rating: 4.0,
      reviews: 1
    });

    if (!state.categories.some((category) => category.name.toLowerCase() === submission.serviceType.toLowerCase())) {
      state.categories.push({ name: submission.serviceType, icon: "&bull;" });
    }
  }

  state.submissions = state.submissions.filter((item) => item.id !== id);
  saveAll();
  renderAll();
});

// ========== CSV IMPORT FUNCTIONS ==========
function parseCSV(text) {
  const lines = text.trim().split('\n');
  const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
  const data = [];

  for (let i = 1; i < lines.length; i++) {
    if (!lines[i].trim()) continue;
    
    const values = lines[i].split(',').map(v => v.trim());
    const row = {};
    
    headers.forEach((header, idx) => {
      row[header] = values[idx] || '';
    });
    
    data.push(row);
  }
  
  return data;
}

function validateCSVRow(row) {
  return {
    isValid: row.name && row.phone && row.category && row.area,
    errors: [
      !row.name && 'Missing name',
      !row.phone && 'Missing phone',
      !row.category && 'Missing category',
      !row.area && 'Missing area'
    ].filter(Boolean)
  };
}

function renderCSVPreview(data) {
  if (data.length === 0) {
    refs.csvPreview.innerHTML = '<p class="csv-error">No valid data found</p>';
    return;
  }

  const validRows = data.filter(row => validateCSVRow(row).isValid);
  const duplicates = validRows.filter(row => 
    state.providers.some(p => p.phone.replace(/\D/g, '') === row.phone.replace(/\D/g, ''))
  );

  refs.csvPreview.innerHTML = `
    <div class="csv-preview-summary">
      <p><strong>${validRows.length}</strong> valid entries found</p>
      ${duplicates.length > 0 ? `<p class="csv-warning">⚠️ ${duplicates.length} duplicates (by phone) - will be skipped</p>` : ''}
    </div>
    <div class="csv-preview-table">
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Phone</th>
            <th>Category</th>
            <th>Area</th>
            <th>Price</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          ${validRows.map(row => {
            const isDupe = duplicates.some(d => d.phone === row.phone);
            return `
              <tr ${isDupe ? 'class="csv-duplicate"' : ''}>
                <td>${row.name}</td>
                <td>${row.phone}</td>
                <td>${row.category}</td>
                <td>${row.area}</td>
                <td>${row.price || 'N/A'}</td>
                <td>${isDupe ? '🔄 Duplicate' : '✓ New'}</td>
              </tr>
            `;
          }).join('')}
        </tbody>
      </table>
    </div>
  `;

  refs.csvImportBtn.hidden = false;
}

function importCSV() {
  const validRows = csvData.filter(row => validateCSVRow(row).isValid);
  let imported = 0;
  let skipped = 0;

  validRows.forEach(row => {
    const isDupe = state.providers.some(p => 
      p.phone.replace(/\D/g, '') === row.phone.replace(/\D/g, '')
    );

    if (!isDupe) {
      state.providers.unshift({
        id: crypto.randomUUID(),
        name: row.name,
        category: row.category,
        phone: row.phone,
        area: row.area,
        price: row.price || 'To be confirmed',
        rating: Number(row.rating) || 4.0,
        reviews: Number(row.reviews) || 0,
        verified: row.verified === 'true' || row.verified === 'yes'
      });

      if (!state.categories.some(c => c.name.toLowerCase() === row.category.toLowerCase())) {
        state.categories.push({ name: row.category, icon: '&bull;' });
      }

      imported++;
    } else {
      skipped++;
    }
  });

  saveAll();
  refs.csvStatus.textContent = `✓ Imported ${imported} providers${skipped > 0 ? ` (${skipped} duplicates skipped)` : ''}`;
  refs.csvFile.value = '';
  refs.csvPreview.innerHTML = '';
  refs.csvImportBtn.hidden = true;
  csvData = [];
  
  setTimeout(() => {
    refs.csvStatus.textContent = '';
    renderAll();
  }, 2000);
}

refs.csvUploadForm?.addEventListener('change', (e) => {
  const file = refs.csvFile.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (event) => {
    try {
      csvData = parseCSV(event.target.result);
      renderCSVPreview(csvData);
    } catch (err) {
      refs.csvPreview.innerHTML = `<p class="csv-error">Error parsing CSV: ${err.message}</p>`;
    }
  };
  reader.readAsText(file);
});

refs.csvImportBtn?.addEventListener('click', importCSV);

refreshIcons();
