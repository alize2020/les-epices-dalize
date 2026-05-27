import { db, firebaseConfig } from './firebase-config.js';
import { collection, getDocs } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";

const productsContainer = document.getElementById('products-container');

// Mock data (fallback si Firebase n'est pas configuré)
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
  productsContainer.innerHTML = ''; // Vide le conteneur (retire le loader)

  // Vérifie si Firebase est configuré, sinon mode Démo
  if (firebaseConfig.apiKey === "VOTRE_API_KEY") {
    showDemoBanner();
    mockProducts.forEach(product => {
      productsContainer.innerHTML += createProductCard(product);
    });
    return;
  }

  try {
    const querySnapshot = await getDocs(collection(db, "products"));
    if (querySnapshot.empty) {
      productsContainer.innerHTML = '<p class="text-center">Aucun produit disponible pour le moment.</p>';
      return;
    }

    querySnapshot.forEach((doc) => {
      const product = doc.data();
      product.id = doc.id;
      productsContainer.innerHTML += createProductCard(product);
    });
  } catch (error) {
    console.error("Erreur lors de la récupération des produits :", error);
    productsContainer.innerHTML = '<p class="text-center text-danger">Erreur de chargement des produits. Veuillez réessayer plus tard.</p>';
  }
}

function showDemoBanner() {
  const banner = document.createElement('div');
  banner.className = 'bg-danger text-white text-center py-2 fw-bold';
  banner.innerHTML = '⚠️ MODE DÉMO : Firebase n\'est pas encore configuré. Les produits affichés sont des exemples. <a href="admin.html" class="text-white text-decoration-underline">Configurer l\'administration</a>';
  document.body.prepend(banner);
}

// Lancer le chargement
document.addEventListener('DOMContentLoaded', loadProducts);
