// supabase-admin.js – admin panel with Supabase
import { supabase } from './supabase-config.js';

// DOM Elements
const loginSection = document.getElementById('login-section');
const dashboardSection = document.getElementById('dashboard-section');
const loginForm = document.getElementById('login-form');
const loginError = document.getElementById('login-error');
const logoutBtn = document.getElementById('logout-btn');
const addProductForm = document.getElementById('add-product-form');
const adminProductsList = document.getElementById('admin-products-list');
const adminLoading = document.getElementById('admin-loading');
const refreshBtn = document.getElementById('refresh-btn');
const demoBanner = document.getElementById('demo-banner');
const submitBtn = document.getElementById('submit-product-btn');

// Demo mode: if Supabase URL or anon key missing (unlikely here), keep simple demo UI
const isDemoMode = false; // Set to true only for local testing without Supabase

// -------------------- Auth --------------------
if (isDemoMode) {
  demoBanner.classList.remove('d-none');
  demoBanner.innerHTML = "⚠️ MODE DÉMO ACTIF : Supabase non configuré. Utilisez n'importe quel email/mot de passe pour tester l'interface. Les ajouts ne seront pas sauvegardés.";

  // Fake login for demo
  loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    loginSection.style.display = 'none';
    dashboardSection.style.display = 'block';
    loadAdminProducts();
  });
  logoutBtn.addEventListener('click', () => {
    loginSection.style.display = 'flex';
    dashboardSection.style.display = 'none';
  });
} else {
  // Real Supabase Auth – email/password sign‑in
  supabase.auth.onAuthStateChange((_event, session) => {
    if (session && session.user) {
      loginSection.style.display = 'none';
      dashboardSection.style.display = 'block';
      loadAdminProducts();
    } else {
      loginSection.style.display = 'flex';
      dashboardSection.style.display = 'none';
    }
  });

  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      loginError.classList.remove('d-none');
      console.error(error);
    } else {
      loginError.classList.add('d-none');
    }
  });

  logoutBtn.addEventListener('click', async () => {
    await supabase.auth.signOut();
  });
}

// -------------------- Products --------------------
async function loadAdminProducts() {
  adminLoading.style.display = 'block';
  adminProductsList.innerHTML = '';

  if (isDemoMode) {
    adminLoading.style.display = 'none';
    adminProductsList.innerHTML = `<tr><td colspan="4" class="text-center text-muted">En mode démo, la liste est vide. Vous pouvez tester l'ajout d'un produit ci‑contre, il apparaîtra ici temporairement.</td></tr>`;
    return;
  }

  const { data: products, error } = await supabase.from('products').select('*').order('created_at', { ascending: false });
  adminLoading.style.display = 'none';
  if (error) {
    console.error(error);
    adminProductsList.innerHTML = `<tr><td colspan="4" class="text-center text-danger">Erreur de chargement. Vérifiez vos règles Supabase.</td></tr>`;
    return;
  }
  if (products.length === 0) {
    adminProductsList.innerHTML = `<tr><td colspan="4" class="text-center text-muted">Aucun produit dans la base de données.</td></tr>`;
    return;
  }
  products.forEach((product) => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td><img src="${product.image_url}" alt="${product.name}" class="img-thumbnail" style="width: 50px; height: 50px; object-fit: cover;"/></td>
      <td class="fw-bold">${product.name}</td>
      <td>${product.price}</td>
      <td class="text-end"><button class="btn btn-sm btn-danger delete-btn" data-id="${product.id}"><i class="bi bi-trash"></i></button></td>
    `;
    adminProductsList.appendChild(tr);
  });
  document.querySelectorAll('.delete-btn').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      if (!confirm('Voulez‑vous vraiment supprimer ce produit ?')) return;
      const id = e.currentTarget.getAttribute('data-id');
      const { error } = await supabase.from('products').delete().eq('id', id);
      if (error) console.error(error);
      else loadAdminProducts();
    });
  });
}

addProductForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const name = document.getElementById('product-name').value;
  const price = document.getElementById('product-price').value;
  const imageFile = document.getElementById('product-image').files[0];

  if (isDemoMode) {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td><span class="badge bg-secondary">Image Simulée</span></td>
      <td class="fw-bold">${name}</td>
      <td>${price}</td>
      <td class="text-end"><button class="btn btn-sm btn-danger" onclick="this.closest('tr').remove()"><i class="bi bi-trash"></i></button></td>
    `;
    if (adminProductsList.innerHTML.includes('En mode démo')) adminProductsList.innerHTML = '';
    adminProductsList.prepend(tr);
    addProductForm.reset();
    return;
  }

  submitBtn.disabled = true;
  submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Enregistrement...';

  try {
    // 1️⃣ Upload image to Supabase Storage
    const filePath = `${Date.now()}_${imageFile.name}`;
    const { error: uploadErr } = await supabase.storage.from('product-images').upload(filePath, imageFile);
    if (uploadErr) throw uploadErr;
    const { data: publicUrlData } = supabase.storage.from('product-images').getPublicUrl(filePath);
    const imageUrl = publicUrlData.publicUrl;

    // 2️⃣ Insert product record
    const { error: insertErr } = await supabase.from('products').insert({ name, price, image_url: imageUrl });
    if (insertErr) throw insertErr;

    addProductForm.reset();
    loadAdminProducts();
  } catch (err) {
    console.error(err);
    alert('Une erreur est survenue lors de l\'ajout du produit.');
  } finally {
    submitBtn.disabled = false;
    submitBtn.innerHTML = 'Enregistrer';
  }
});

refreshBtn.addEventListener('click', loadAdminProducts);
