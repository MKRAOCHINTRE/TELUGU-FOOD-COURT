
// Simple Cart System
let cart = [];

// Add to cart when "Order Now" is clicked
document.querySelectorAll('.btn-order').forEach(btn => {
    btn.addEventListener('click', () => {
        const name = btn.getAttribute('data-name');
        const price = parseInt(btn.getAttribute('data-price'));
        const img = btn.getAttribute('data-img');

        const qtyInput = prompt(`How many ${name} do you want?`, "1");
        const qty = parseInt(qtyInput);

        if (qtyInput === null) return; // Cancelled
        if (isNaN(qty) || qty <= 0) {
            alert("Please enter a valid quantity!");
            return;
        }

        // Check if item already in cart
        const existingItem = cart.find(item => item.name === name);
        if (existingItem) {
            existingItem.qty += qty;
        } else {
            cart.push({ name, price, qty, img });
        }

        updateCart();
        alert(`${qty} × ${name} added to cart! 🛒`);
    });
});

function updateCart() {
    const cartItems = document.getElementById('cartItems');
    const cartTotal = document.getElementById('cartTotal');
    const cartCount = document.getElementById('cartCount');
    const placeOrderBtn = document.getElementById('placeOrderBtn');

    if (cart.length === 0) {
        cartItems.innerHTML = '<p class="text-center text-muted">Your cart is empty</p>';
        cartTotal.textContent = '₹0';
        cartCount.textContent = '0';
        placeOrderBtn.disabled = true;
        return;
    }

    let total = 0;
    let html = '';

    cart.forEach((item, index) => {
        const itemTotal = item.price * item.qty;
        total += itemTotal;

        html += `
            <div class="cart-item d-flex align-items-center mb-3">
                <img src="${item.img}" alt="${item.name}" class="rounded">
                <div class="ms-3 flex-grow-1">
                    <strong>${item.name}</strong><br>
                    <small class="text-muted">${item.qty} × ₹${item.price} = ₹${itemTotal}</small>
                </div>
                <button class="btn btn-danger btn-sm" onclick="removeFromCart(${index})">
                    <i class="fas fa-trash"></i>
                </button>
            </div>`;
    });

    cartItems.innerHTML = html;
    cartTotal.textContent = `₹${total}`;
    cartCount.textContent = cart.length;
    placeOrderBtn.disabled = false;
}

function removeFromCart(index) {
    cart.splice(index, 1);
    updateCart();
}


// FIXED: Place Order → Opens WhatsApp with full details
document.getElementById('placeOrderBtn').addEventListener('click', () => {
    if (cart.length === 0) {
        alert("Your cart is empty!");
        return;
    }
    

    const address = prompt("📍 Please enter your delivery address:");
    if (!address || address.trim() === "") {
        alert("Address is required to place the order!");
        return;
    }

    let message = "*🍛 New Order - Telugu Food Court*%0A%0A";
    message += "*📋 Order Details:*%0A";

    let total = 0;
    cart.forEach(item => {
        const itemTotal = item.price * item.qty;
        total += itemTotal;
        message += `• ${item.name} × ${item.qty} = ₹${itemTotal}%0A`;
    });

    message += `%0A*💰 Total Amount: ₹${total}*%0A`;
    message += `*📍 Delivery Address:*%0A${encodeURIComponent(address.trim())}%0A%0A`;
    message += "*Thank you for your order! 🙏 We'll prepare it fresh.*";

    // REPLACE WITH YOUR ACTUAL RESTAURANT WHATSAPP NUMBER
    const phoneNumber = "918247544593";  // ← Change this to your real number (with country code, no + or spaces)

    const whatsappURL = `https://api.whatsapp.com/send?phone=${phoneNumber}&text=${message}`;

    // Open WhatsApp in new tab/window
    window.open(whatsappURL, '_blank');

    // Optional: Clear cart after sending
    setTimeout(() => {
        if (confirm("Order sent! Do you want to clear your cart?")) {
            cart = [];
            updateCart();
            bootstrap.Modal.getInstance(document.getElementById('cartModal')).hide();
        }
    }, 1000);
});
