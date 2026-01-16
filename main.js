document.addEventListener("DOMContentLoaded", () => {
  
  /* 
     1. CONFIGURACIÓN Y REFERENCIAS
   */
  const cartButton = document.querySelector(".icon-button.cart");
  const cartPanel = document.querySelector(".cart-panel");
  const cartClose = document.querySelector(".cart-close");
  const cartCount = document.querySelector(".cart-count");
  const cartItems = document.querySelector(".cart-items");
  const checkoutButton = document.querySelector(".cart-panel-footer .button");

  // Leer carrito o iniciar vacío
  let cart = JSON.parse(localStorage.getItem("loopCart")) || [];
  updateCartUI();

  /* 
     2. LÓGICA DEL CARRITO
      */
  
  function saveCart() {
    localStorage.setItem("loopCart", JSON.stringify(cart));
  }

  function updateCartUI() {
    if (!cartItems) return;

    cartItems.innerHTML = "";
    let totalItems = 0;
    let totalPrice = 0;

    if (cart.length === 0) {
      cartItems.innerHTML = "<p class='empty-cart-msg'>Your order is empty.<br>Add something delicious!</p>";
    } else {
      cart.forEach((item, index) => {
        totalItems += item.qty;
        totalPrice += item.price * item.qty;

        const li = document.createElement("li");
        li.className = "cart-item";
        li.innerHTML = `
          <img src="${item.image}" alt="${item.name}">
          <div class="cart-item-info">
            <strong>${item.name}</strong><br>
            <span>₡${item.price.toLocaleString()}</span> · x${item.qty}
          </div>
          <button class="remove-item" data-index="${index}" aria-label="Delete">×</button>
        `;
        cartItems.appendChild(li);
      });
    }

    if (cartCount) cartCount.textContent = totalItems;

    // Eventos eliminar
    const removeButtons = document.querySelectorAll(".remove-item");
    removeButtons.forEach(btn => {
      btn.addEventListener("click", (e) => {
        removeFromCart(e.target.dataset.index);
      });
    });
  }

  function removeFromCart(index) {
    cart.splice(index, 1);
    saveCart();
    updateCartUI();
  }

  function addToCart(product) {
    const existing = cart.find(item => item.id === product.id);
    if (existing) {
      existing.qty++;
    } else {
      cart.push({ ...product, qty: 1 });
    }
    saveCart();
    updateCartUI();
    if (cartPanel) cartPanel.classList.add("is-open");
    showFeedback(product.name);
  }

  function showFeedback(text) {
    const toast = document.createElement("div");
    toast.className = "toast-notification";
    toast.textContent = `¡${text} At your service!`; 
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
  }

  /*
     3. INTERACCIÓN UI
     */
  
  if (cartButton && cartPanel) {
    cartButton.addEventListener("click", () => cartPanel.classList.add("is-open"));
  }
  if (cartClose && cartPanel) {
    cartClose.addEventListener("click", () => cartPanel.classList.remove("is-open"));
  }

  if (checkoutButton) {
    checkoutButton.addEventListener("click", () => {
      if (cart.length > 0) window.location.href = "checkout.html";
      else alert("Your order is empty.");
    });
  }

  /* 
     4. MODAL DE DETALLES (PLATILLOS) */
  const modal = document.getElementById("product-modal");
  const modalClose = document.querySelector(".close-modal");
  const shopImages = document.querySelectorAll(".shop-image");
  
  if (modal && shopImages.length > 0) {
    shopImages.forEach(img => {
      img.addEventListener("click", (e) => {
        const parentArticle = img.closest(".shop-item");
        const btnData = parentArticle.querySelector("[data-add-to-cart]");
        
        document.getElementById("modal-title").textContent = btnData.dataset.name;
        document.getElementById("modal-price").textContent = "$" + Number(btnData.dataset.price).toLocaleString();
        
       
        let bgImg = img.style.backgroundImage;
        if (!bgImg || bgImg === 'none') {
          bgImg = window.getComputedStyle(img).backgroundImage;
        }
        document.getElementById("modal-img").style.backgroundImage = bgImg;

       
        const modalBtn = document.getElementById("modal-add-btn");
        const newBtn = modalBtn.cloneNode(true);
        modalBtn.parentNode.replaceChild(newBtn, modalBtn);
        
        newBtn.addEventListener("click", () => {
          addToCart({
            id: btnData.dataset.id,
            name: btnData.dataset.name,
            price: Number(btnData.dataset.price),
            image: btnData.dataset.image
          });
          modal.style.display = "none";
        });

        modal.style.display = "flex";
        setTimeout(() => modal.classList.add("is-visible"), 10);
      });
    });

    modalClose.addEventListener("click", () => {
      modal.classList.remove("is-visible");
      setTimeout(() => modal.style.display = "none", 300);
    });
    
    window.addEventListener("click", (e) => {
      if (e.target == modal) {
        modal.classList.remove("is-visible");
        setTimeout(() => modal.style.display = "none", 300);
      }
    });
  }

  // Botones directos
  const addToCartButtons = document.querySelectorAll("[data-add-to-cart]");
  addToCartButtons.forEach(button => {
    button.addEventListener("click", (e) => {
      e.stopPropagation();
      addToCart({
        id: button.dataset.id,
        name: button.dataset.name,
        price: Number(button.dataset.price),
        image: button.dataset.image
      });
    });
  });

  /*
     5. CHECKOUT */
  const checkoutForm = document.getElementById("checkout-form");
  if (checkoutForm) {
    checkoutForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const btn = checkoutForm.querySelector("button[type='submit']");
      btn.textContent = "Sending to kitchen...";
      btn.disabled = true;

      setTimeout(() => {
        localStorage.removeItem("loopCart");
        cart = [];
        updateCartUI();
        alert("Order Confirmed! Your order #FD-" + Math.floor(Math.random() * 10000) + " It is being prepared.");
        window.location.href = "index.html";
      }, 2000);
    });
  }

 
  /*
     6. FILTROS DE MENÚ
      */
  const filterButtons = document.querySelectorAll(".shop-filters button");
  const items = document.querySelectorAll(".shop-item");
  if (filterButtons.length) {
    filterButtons.forEach(btn => {
      btn.addEventListener("click", () => {
      
        const filter = btn.dataset.filter || btn.textContent.toLowerCase();
        
        filterButtons.forEach(b => b.classList.remove("is-active"));
        btn.classList.add("is-active");
        
        items.forEach(item => {
          if (filter === "todo" || item.dataset.category === filter) {
            item.style.display = "block";
          } else {
            item.style.display = "none";
          }
        });
      });
    });
  }

  /*
     7. MENÚ MÓVIL
      */
  const menuToggle = document.querySelector(".menu-toggle");
  const mobileMenu = document.getElementById("mobile-menu");

  if (menuToggle && mobileMenu) {
    menuToggle.addEventListener("click", () => {
      if (mobileMenu.hasAttribute("hidden")) {
        mobileMenu.removeAttribute("hidden");
        menuToggle.querySelector(".menu-toggle-label").textContent = "Cerrar";
      } else {
        mobileMenu.setAttribute("hidden", "");
        menuToggle.querySelector(".menu-toggle-label").textContent = "Menú";
      }
    });
  }

  /* 
     8. ANIMACIONES SCROLL
      */
  const fadeElements = document.querySelectorAll('.fade-in');
  const appearOnScroll = new IntersectionObserver((entries, appearOnScroll) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        appearOnScroll.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15, rootMargin: "0px 0px -50px 0px" });

  fadeElements.forEach(el => appearOnScroll.observe(el));
  
  // Header scroll effect
  const header = document.querySelector(".header");
  window.addEventListener("scroll", () => {
    if (window.pageYOffset > 10) header.classList.add("is-scrolled");
    else header.classList.remove("is-scrolled");
  });


/* 
     9. NEWSLETTER (RECIBIR NOTICIAS)
      */
  const signupBtn = document.getElementById("toggle-signup");
  const signupContainer = document.getElementById("intro-signup");
  const signupForm = document.querySelector(".signup-form");

 
  if (signupBtn && signupContainer) {
    signupBtn.addEventListener("click", () => {
      
      signupBtn.style.display = "none";
      
      signupContainer.removeAttribute("hidden");
      
      const input = signupContainer.querySelector("input");
      if(input) input.focus();
    });
  }

  if (signupForm) {
    signupForm.addEventListener("submit", (e) => {
      e.preventDefault(); 
      
      const emailInput = signupForm.querySelector("input[type='email']");
      
      if (emailInput.value.trim() !== "") {
    
        signupContainer.innerHTML = `
          <div class="signup-success">
            <span style="color: var(--brand-orange); font-size: 24px;">★</span>
            <p><strong>Welcome to the table!</strong><br>We have sent you a confirmation email</p>
          </div>
        `;
      }
    });
  }

  /* =========================================
   SCRIPT DE MAGIA VISUAL
   ========================================= */

// 1. EFECTO PARALLAX EN EL HERO (La imagen se mueve lento)
window.addEventListener('scroll', function() {
  const scrollPosition = window.pageYOffset;
  const heroImage = document.querySelector('.hero-section img');
  
  if (heroImage) {
    // La imagen se mueve a la mitad de velocidad del scroll (0.5)
    heroImage.style.transform = `translateY(${scrollPosition * 0.5}px)`;
  }
});

// 2. DETECTOR DE SCROLL PARA ANIMACIONES (Reveal)
const observerOptions = {
  root: null,
  rootMargin: '0px',
  threshold: 0.15 // Se activa cuando el 15% del elemento es visible
};

const observer = new IntersectionObserver((entries, observer) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      observer.unobserve(entry.target); // Dejar de observar una vez animado
    }
  });
}, observerOptions);

// Buscar todos los elementos que tengan la clase 'animate-up'
document.addEventListener('DOMContentLoaded', () => {
  const animatedElements = document.querySelectorAll('.animate-up');
  animatedElements.forEach(el => observer.observe(el));
});

  });
