// supabase-app.js – front‑end product display
import { supabase } from './supabase-config.js';

const productsContainer = document.getElementById('products-container');

// Demo fallback products (used only if Supabase not configured)
const mockProducts = [
  { id: '1', name: 'Mélange de 10 épices', price: '1500 FCFA', image: 'melange.jpg' },
  { id: '2', name: 'Piment Tankwa', price: '1500 FCFA', image: 'piment.jpg' },
  { id: '3', name: 'Soumbala', price: '1500 FCFA', image: 'soumbala.jpg' },
  { id: '4', name: 'Poivre moulu', price: '1500 FCFA', image: '1.png' },
  { id: '5', name: 'Curcuma', price: '1500 FCFA', image: '2.png' }
];

function createProductCard(product) {
  const message = encodeURIComponent(`Bonjour, je veux commander ${product.name}`);
  return `
    <div class="col-md-4">
      <div class="card h-100 shadow-sm border-0">
        <img src="${product.image}" class="card-img-top" alt="${product.name}" style="height: 250px; object-fit: cover;">
        <div class="card-body text-center d-flex flex-column">
          <h5 class="card-title fw-bold">${product.name}</h5>
          <p class="text-primary fw-bold fs-5 mb-4">${product.price}</p>
          <a class="btn btn-success mt-auto fw-bold" href="https://wa.me/22652092000?text=${message}" target="_blank">
            <i class="bi bi-whatsapp"></i> Commander
          </a>
        </div>
      </div>
    </div>
  `;
}

async function loadProducts() {
  productsContainer.innerHTML = '';

  // If Supabase URL or anon key missing, fall back to mock data
  if (!supabase) {
    mockProducts.forEach(p => productsContainer.innerHTML += createProductCard(p));
    return;
  }

  try {
    const { data: products, error } = await supabase.from('products').select('*').order('created_at', { ascending: false });
    if (error) throw error;
    if (!products || products.length === 0) {
      productsContainer.innerHTML = '<p class="text-center">Aucun produit disponible pour le moment.</p>';
      return;
    }
    products.forEach(product => {
      // Ensure the image field matches the front‑end expectation
      const img = product.image_url || product.image;
      const cardProduct = { ...product, image: img };
      productsContainer.innerHTML += createProductCard(cardProduct);
    });
  } catch (err) {
    console.error('Erreur lors du chargement des produits :', err);
    productsContainer.innerHTML = '<p class="text-center text-danger">Erreur de chargement des produits. Veuillez réessayer plus tard.</p>';
  }
}

document.addEventListener('DOMContentLoaded', loadProducts);
