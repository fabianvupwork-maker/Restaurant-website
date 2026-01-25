document.addEventListener("DOMContentLoaded", () => {
  
  /*1. REFERENCIAS Y CONFIGURACIÓN*/

  const cartButton = document.querySelector(".icon-button.cart");
  const cartPanel = document.querySelector(".cart-panel");
  const cartClose = document.querySelector(".cart-close");
  const cartCount = document.querySelector(".cart-count");
  const cartItemsContainer = document.querySelector(".cart-items");
  const cartTotalLabel = document.getElementById("cart-total-price");
  const checkoutButton = document.getElementById("checkout-btn");
  const modal = document.getElementById("product-modal");

  
  let cart = JSON.parse(localStorage.getItem("dawnCart")) || [];
  
  updateCartUI();
  updateYear();

  
  function saveCart() {
    localStorage.setItem("dawnCart", JSON.stringify(cart));
  }

  function updateCartUI() {
    if (!cartItemsContainer) return;

    cartItemsContainer.innerHTML = "";
    let totalItems = 0;
    let totalPrice = 0;

    if (cart.length === 0) {
      cartItemsContainer.innerHTML = `
        <div class='empty-cart-msg'>
          <p>Your dining selection is empty.</p>
          <a href="shop.html" class="button button--outline button--small">Browse Menu</a>
        </div>`;
      if (checkoutButton) checkoutButton.disabled = true;
    } else {
      if (checkoutButton) checkoutButton.disabled = false;
      
      cart.forEach((item, index) => {
        totalItems += item.qty;
        totalPrice += item.price * item.qty;

        const li = document.createElement("li");
        li.className = "cart-item";
        li.innerHTML = `
          <div class="cart-item-img" style="background-image: url('${item.image}')"></div>
          <div class="cart-item-info">
            <div class="cart-item-header">
              <strong>${item.name}</strong>
              <button class="remove-item" data-index="${index}" aria-label="Remove">×</button>
            </div>
            <div class="cart-item-details">
              <span>$${item.price.toFixed(2)}</span>
              <div class="qty-controls">
                <span class="qty-label">x${item.qty}</span>
              </div>
            </div>
          </div>
        `;
        cartItemsContainer.appendChild(li);
      });
    }

   
    if (cartCount) {
      cartCount.textContent = totalItems;
      cartCount.style.display = totalItems > 0 ? 'block' : 'none';
    }
    
    if (cartTotalLabel) {
      cartTotalLabel.textContent = "$" + totalPrice.toFixed(2);
    }

   
    document.querySelectorAll(".remove-item").forEach(btn => {
      btn.addEventListener("click", (e) => removeFromCart(e.target.dataset.index));
    });
  }

  function removeFromCart(index) {
    cart.splice(index, 1);
    saveCart();
    updateCartUI();
  }

 
  window.addToCart = function(product) {
    const existing = cart.find(item => item.id === product.id);
    if (existing) {
      existing.qty++;
    } else {
      cart.push({ ...product, qty: 1 });
    }
    saveCart();
    updateCartUI();
    
    
    if (cartPanel) cartPanel.classList.add("is-open");
    
    
    showToast(`${product.name} added to your selection`);
  };

  /*3. INTERFAZ DE USUARIO (UX)*/

  // Toast
  function showToast(message) {
    let toast = document.getElementById("toast-notification");
    if (!toast) {
      toast = document.createElement("div");
      toast.id = "toast-notification";
      document.body.appendChild(toast);
    }
    
    toast.textContent = message;
    toast.classList.add("show");
    
    setTimeout(() => {
      toast.classList.remove("show");
    }, 3000);
  }

  // Toggle 
  if (cartButton && cartPanel) {
    cartButton.addEventListener("click", () => cartPanel.classList.add("is-open"));
  }
  if (cartClose && cartPanel) {
    cartClose.addEventListener("click", () => cartPanel.classList.remove("is-open"));
  }
  
  // (overlay)
  document.addEventListener("click", (e) => {
    if (cartPanel && cartPanel.classList.contains("is-open") && 
        !cartPanel.contains(e.target) && 
        !cartButton.contains(e.target) &&
        !e.target.closest(".add-to-cart-btn")) {
      cartPanel.classList.remove("is-open");
    }
  });

  // Móvil
  const menuToggle = document.querySelector(".menu-toggle");
  const mobileMenu = document.getElementById("mobile-menu");
  
  if (menuToggle && mobileMenu) {
    menuToggle.addEventListener("click", () => {
      const isHidden = mobileMenu.hidden;
      mobileMenu.hidden = !isHidden;
      
      const label = menuToggle.querySelector(".menu-toggle-label");
      if (label) label.textContent = isHidden ? "Close" : "Menu";
      menuToggle.classList.toggle("is-active", isHidden);
    });
  }

  // Header
  const header = document.querySelector(".header");
  window.addEventListener("scroll", () => {
    if (window.scrollY > 50) {
      header.classList.add("is-scrolled");
    } else {
      header.classList.remove("is-scrolled");
    }
  });

  /*4. CHECKOUT (WhatsApp)*/
  if (checkoutButton) {
    checkoutButton.addEventListener("click", () => {
      if (cart.length === 0) return;

      const phoneNumber = "50688403178";
      let message = "Hello, Flavors of Dawn. I would like to place an order:\n\n";
      let total = 0;

      cart.forEach((item) => {
        const subtotal = item.price * item.qty;
        total += subtotal;
        message += `• ${item.qty}x ${item.name} - $${subtotal.toFixed(2)}\n`;
      });

      message += `\n*TOTAL: $${total.toFixed(2)}*`;
      message += "\n\nMy name is: ";

      const encodedMessage = encodeURIComponent(message);
      const url = `https://wa.me/${phoneNumber}?text=${encodedMessage}`;
      
      window.open(url, '_blank');
    });
  }

  /*5. MODAL DE PRODUCTOS*/
  const shopItems = document.querySelectorAll(".shop-item");
  
  if (modal && shopItems.length > 0) {
    const modalClose = document.querySelector(".close-modal");
    const modalAddBtn = document.getElementById("modal-add-btn");
    

    let currentProductData = null;

   
    const closeModal = () => {
      modal.classList.remove("is-visible");
      setTimeout(() => modal.style.display = "none", 300);
    };

    if(modalClose) modalClose.addEventListener("click", closeModal);
    window.addEventListener("click", (e) => {
      if (e.target == modal) closeModal();
    });

    if (modalAddBtn) {
      modalAddBtn.addEventListener("click", () => {
        if (currentProductData) {
          addToCart(currentProductData);
          closeModal();
        }
      });
    }

    shopItems.forEach(item => {
      const dataBtn = item.querySelector("[data-add-to-cart]");
      if (!dataBtn) return;

    
      const triggerAreas = [item.querySelector(".shop-image"), item.querySelector("h3")];
      
      triggerAreas.forEach(trigger => {
        if(trigger) {
          trigger.addEventListener("click", () => {
  
            document.getElementById("modal-title").textContent = dataBtn.dataset.name;
            document.getElementById("modal-price").textContent = "$" + dataBtn.dataset.price;
            
            const modalImg = document.getElementById("modal-img");
            let bgImage = window.getComputedStyle(item.querySelector(".shop-image")).backgroundImage;
            modalImg.style.backgroundImage = bgImage;

            currentProductData = {
                id: dataBtn.dataset.id,
                name: dataBtn.dataset.name,
                price: Number(dataBtn.dataset.price),
                image: dataBtn.dataset.image || 'assets/default-plate.jpg'
            };

         
            modal.style.display = "flex";
            setTimeout(() => modal.classList.add("is-visible"), 10);
          });
        }
      });
    });
  }

  const directButtons = document.querySelectorAll("[data-add-to-cart]");
  directButtons.forEach(btn => {
    btn.addEventListener("click", (e) => {
      e.stopPropagation(); 
      addToCart({
        id: btn.dataset.id,
        name: btn.dataset.name,
        price: Number(btn.dataset.price),
        image: btn.dataset.image
      });
    });
  });

  function updateYear() {
    const yearSpan = document.getElementById("year");
    if(yearSpan) yearSpan.textContent = new Date().getFullYear();
  }

  /*6. FILTROS DEL MENÚ*/

  const filterButtons = document.querySelectorAll('.shop-filters button');
  const allShopItems = document.querySelectorAll('.shop-item');

  if (filterButtons.length > 0) {
    filterButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        
        filterButtons.forEach(b => b.classList.remove('is-active'));
        
        btn.classList.add('is-active');

        
        const category = btn.dataset.filter;

        
        allShopItems.forEach(item => {
          if (category === 'todo' || item.dataset.category === category) {
            item.style.display = 'block'; 
            setTimeout(() => item.style.opacity = '1', 50);
          } else {
            item.style.display = 'none'; 
            item.style.opacity = '0';
          }
        });
      });
    });
  }

}); 