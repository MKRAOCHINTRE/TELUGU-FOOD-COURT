
// Load cart from localStorage (works across all pages)
let cart = JSON.parse(localStorage.getItem('tfcCart')) || [];

// Save cart every time it changes
function saveCart() {
    localStorage.setItem('tfcCart', JSON.stringify(cart));
}

// Update cart display
function updateCart() {
    const cartItems = document.getElementById('cartItems');
    const cartTotal = document.getElementById('cartTotal');
    const cartCount = document.getElementById('cartCount');
    const placeOrderBtn = document.getElementById('placeOrderBtn');

    if (!cartItems || !cartTotal || !cartCount || !placeOrderBtn) return;

    if (cart.length === 0) {
        cartItems.innerHTML = '<p class="text-center text-muted">Your cart is empty</p>';
        cartTotal.textContent = '₹0';
        cartCount.textContent = '0';
        placeOrderBtn.disabled = true;
        return;
    }

    let total = 0;
    let html = '';
    cart.forEach((item, i) => {
        const subtotal = item.price * item.qty;
        total += subtotal;
        html += `
            <div class="d-flex align-items-center mb-3 pb-3 border-bottom">
                <img src="${item.img}" class="rounded me-3" style="width:70px;height:70px;object-fit:cover;">
                <div class="flex-grow-1">
                    <strong style="color:#6B3E1A;">${item.name}</strong><br>
                    <small class="text-muted">${item.qty} × ₹${item.price} each = <strong class="text-success">₹${subtotal}</strong></small>
                </div>
                <button class="btn btn-danger btn-sm rounded-circle" onclick="removeItem(${i})">
                    <i class="fas fa-trash"></i>
                </button>
            </div>`;
    });

    cartItems.innerHTML = html;
    cartTotal.textContent = `₹${total}`;
    cartCount.textContent = cart.length;
    placeOrderBtn.disabled = false;
}

function removeItem(index) {
    cart.splice(index, 1);
    saveCart();
    updateCart();
}

// Run on page load
document.addEventListener('DOMContentLoaded', updateCart);

// Normal items
document.querySelectorAll('.btn-order:not(.order-with-plate)').forEach(btn => {
    btn.addEventListener('click', () => {
        const name = btn.dataset.name;
        const price = parseInt(btn.dataset.price.trim(), 10);
        const img = btn.dataset.img;

        const qty = parseInt(prompt(`How many ${name}? (₹${price} each)`, "1") || "0");
        if (qty <= 0) return alert("Invalid quantity!");

        const existing = cart.find(item => item.name === name);
        if (existing) existing.qty += qty;
        else cart.push({ name, price, qty, img });

        saveCart();
        updateCart();
        alert(`${qty} × ${name} added!`);
    });
});

// Plate selection items (Fry Biryani etc.)
document.querySelectorAll('.order-with-plate').forEach(btn => {
    btn.addEventListener('click', () => {
        const baseName = btn.dataset.baseName;
        const img = btn.dataset.img;

        const radio = btn.closest('.card-body').querySelector('input.plate-radio:checked');
        if (!radio) return alert("Please select Half or Full plate!");

        const plateType = radio.value === 'full' ? 'Full Plate' : 'Half Plate';
        const price = parseInt(radio.dataset.price.trim(), 10);
        const fullName = `${baseName} - ${plateType}`;

        const qty = parseInt(prompt(`How many ${fullName}? (₹${price} each)`, "1") || "0");
        if (qty <= 0) return alert("Invalid quantity!");

        const existing = cart.find(item => item.name === fullName);
        if (existing) existing.qty += qty;
        else cart.push({ name: fullName, price, qty, img });

        saveCart();
        updateCart();
        alert(`${qty} × ${fullName} added!`);
    });
});

// FINAL FIXED: Place Order → Direct Redirect to WhatsApp (No Popup Block)
document.getElementById('placeOrderBtn').addEventListener('click', () => {
    if (cart.length === 0) return alert("Your cart is empty!");

    const wantsMore = confirm("Are You Ready for order or Do you want to add more items?\nOK = Ready For Order\nCancel = Add More Items");
    if (!wantsMore) {
        window.location.href = "menucard.html"; // Your main menu page
        return;
    }

    const address = prompt("Enter your delivery address:");
    if (!address?.trim()) return alert("Address required!");

      let message = "*🍛 New Order - Telugu Food Court*\n\n";
    message+="📋 Order Details:\n"
    let total = 0;
    cart.forEach(item => {
        const amt = item.price * item.qty;
        total += amt;
        message += `• ${item.name} × ${item.qty} = ₹${amt}\n`;
    });
    message += `\n*💰 Total Amount: ₹${total}*\n`;
    message += `*📍 Delivery Address:* ${address.trim()}\n\nThank you for your order! 🙏 We'll prepare it fresh `;

    // Fill copy box for desktop fallback
    const copyBox = document.getElementById('copyMessage');
    if (copyBox) copyBox.textContent = message;

    const phone = "918881112204"; // ← Your WhatsApp number
    const encoded = encodeURIComponent(message);
    const whatsappURL = `https://wa.me/${phone}?text=${encoded}`;

    // DIRECT REDIRECT — No popup blocker!
    window.location.href = whatsappURL;

    // Clear cart after redirect
    setTimeout(() => {
        if (confirm("Order sent! Clear cart?")) {
            cart = [];
            saveCart();
            updateCart();
        }
    }, 10000);
});



