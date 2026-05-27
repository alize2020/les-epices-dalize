import { db, storage, auth, firebaseConfig } from './firebase-config.js';
import { collection, getDocs, addDoc, deleteDoc, doc } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";
import { ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-storage.js";
import { signInWithEmailAndPassword, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-auth.js";

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

// Mode Démo check
const isDemoMode = firebaseConfig.apiKey === "VOTRE_API_KEY";

// --- GESTION DE L'AUTHENTIFICATION ---
if (isDemoMode) {
  demoBanner.classList.remove('d-none');
  demoBanner.innerHTML = "⚠️ MODE DÉMO ACTIF : Firebase n'est pas configuré. Connectez-vous avec n'importe quel email/mot de passe pour tester l'interface. Les ajouts ne seront pas sauvegardés.";
  
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
  // Real Firebase Auth
  onAuthStateChanged(auth, (user) => {
    if (user) {
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
    
    try {
      await signInWithEmailAndPassword(auth, email, password);
      loginError.classList.add('d-none');
    } catch (error) {
      loginError.classList.remove('d-none');
      console.error(error);
    }
  });

  logoutBtn.addEventListener('click', async () => {
    await signOut(auth);
  });
}

// --- GESTION DES PRODUITS ---

// Charger les produits
async function loadAdminProducts() {
  adminLoading.style.display = 'block';
  adminProductsList.innerHTML = '';

  if (isDemoMode) {
    adminLoading.style.display = 'none';
    adminProductsList.innerHTML = `
      <tr>
        <td colspan="4" class="text-center text-muted">
          En mode démo, la liste est vide. Vous pouvez tester l'ajout d'un produit ci-contre, il apparaîtra ici temporairement.
        </td>
      </tr>
    `;
    return;
  }

  try {
    const querySnapshot = await getDocs(collection(db, "products"));
    adminLoading.style.display = 'none';
    
    if (querySnapshot.empty) {
      adminProductsList.innerHTML = '<tr><td colspan="4" class="text-center text-muted">Aucun produit dans la base de données.</td></tr>';
      return;
    }

    querySnapshot.forEach((docSnap) => {
      const product = docSnap.data();
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td><img src="${product.image}" alt="${product.name}" class="img-thumbnail" style="width: 50px; height: 50px; object-fit: cover;"></td>
        <td class="fw-bold">${product.name}</td>
        <td>${product.price}</td>
        <td class="text-end">
          <button class="btn btn-sm btn-danger delete-btn" data-id="${docSnap.id}">
            <i class="bi bi-trash"></i>
          </button>
        </td>
      `;
      adminProductsList.appendChild(tr);
    });

    // Attacher les events de suppression
    document.querySelectorAll('.delete-btn').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        if(confirm("Voulez-vous vraiment supprimer ce produit ?")) {
          const id = e.currentTarget.getAttribute('data-id');
          await deleteDoc(doc(db, "products", id));
          loadAdminProducts(); // Recharger
        }
      });
    });

  } catch (error) {
    console.error(error);
    adminLoading.style.display = 'none';
    adminProductsList.innerHTML = '<tr><td colspan="4" class="text-center text-danger">Erreur de chargement. Vérifiez vos règles Firestore.</td></tr>';
  }
}

// Ajouter un produit
addProductForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const name = document.getElementById('product-name').value;
  const price = document.getElementById('product-price').value;
  const imageUrl = document.getElementById('product-image').value;

  if (isDemoMode) {
    // Mode démo: on ajoute juste visuellement au tableau
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td><span class="badge bg-secondary">Image Simulée</span></td>
      <td class="fw-bold">${name}</td>
      <td>${price}</td>
      <td class="text-end"><button class="btn btn-sm btn-danger" onclick="this.closest('tr').remove()"><i class="bi bi-trash"></i></button></td>
    `;
    if(adminProductsList.innerHTML.includes("En mode démo")) adminProductsList.innerHTML = '';
    adminProductsList.prepend(tr);
    addProductForm.reset();
    return;
  }

  submitBtn.disabled = true;
  submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Enregistrement...';

  try {
    // Save info directly to Firestore without uploading image to Storage
    await addDoc(collection(db, "products"), {
      name: name,
      price: price,
      image: imageUrl,
      createdAt: new Date()
    });

    addProductForm.reset();
    loadAdminProducts();
  } catch (error) {
    console.error("Erreur d'ajout:", error);
    alert("Une erreur est survenue lors de l'ajout.");
  } finally {
    submitBtn.disabled = false;
    submitBtn.innerHTML = 'Enregistrer';
  }
});

refreshBtn.addEventListener('click', loadAdminProducts);
