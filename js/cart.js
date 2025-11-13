// Cart Implementation
(function() {
    const STORAGE_KEY = 'foodxpress_cart';
    const WHATSAPP_NUMBER = '2348143693532';

    let cart = [];

    // Load cart from localStorage
    function loadCart() {
        const savedCart = localStorage.getItem(STORAGE_KEY);
        if (savedCart) {
            try {
                cart = JSON.parse(savedCart);
                updateCartCount();
            } catch (e) {
                console.error('Error loading cart:', e);
                cart = [];
            }
        }
    }

    // Save cart to localStorage
    function saveCart() {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(cart));
        updateCartCount();
    }

    // Update cart count badge
    function updateCartCount() {
        const count = cart.reduce((total, item) => total + item.quantity, 0);
        $('.cart-count').text(count || '0');
    }

    // Format price with commas
    function formatPrice(price) {
        return '₦' + price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    }

    // Add item to cart
    function addToCart(name, price, quantity) {
        const existingItem = cart.find(item => item.name === name);
        
        if (existingItem) {
            existingItem.quantity += quantity;
        } else {
            cart.push({
                name,
                price,
                quantity
            });
        }
        
        saveCart();
        updateCartUI();
        $('#cartModal').modal('show');
    }

    // Update cart UI
    function updateCartUI() {
        const $cartItems = $('#cartItems');
        $cartItems.empty();

        if (cart.length === 0) {
            $cartItems.html('<p class="text-muted">Your cart is empty</p>');
            $('#cartTotal').text('₦0');
            $('#checkoutBtn').prop('disabled', true);
            return;
        }

        let total = 0;

        cart.forEach((item, index) => {
            const itemTotal = item.price * item.quantity;
            total += itemTotal;

            $cartItems.append(`
                <div class="cart-item d-flex justify-content-between align-items-center mb-3">
                    <div>
                        <h6 class="mb-0">${item.name}</h6>
                        <small class="text-muted">${formatPrice(item.price)} × ${item.quantity}</small>
                    </div>
                    <div class="d-flex align-items-center">
                        <span class="mr-3">${formatPrice(itemTotal)}</span>
                        <button class="btn btn-sm btn-outline-danger remove-item" data-index="${index}">
                            <i class="fa fa-trash"></i>
                        </button>
                    </div>
                </div>
            `);
        });

        $('#cartTotal').text(formatPrice(total));
        $('#checkoutBtn').prop('disabled', false);
    }

    // Send order to WhatsApp
    function sendOrder() {
        const items = cart.map(item => 
            `${item.name} x${item.quantity} (${formatPrice(item.price * item.quantity)})`
        ).join('\n');
        
        const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        const message = `*New Order from Food Xpress*\n\n${items}\n\n*Total: ${formatPrice(total)}*`;
        
        const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
        window.open(url, '_blank');
    }

    // Initialize cart functionality
    function initCart() {
        // Load saved cart
        loadCart();

        // Inject cart modal
        if (!$('#cartModal').length) {
            $('body').append(`
                <div class="modal fade" id="cartModal" tabindex="-1" role="dialog">
                    <div class="modal-dialog" role="document">
                        <div class="modal-content">
                            <div class="modal-header">
                                <h5 class="modal-title">Shopping Cart</h5>
                                <button type="button" class="close" data-dismiss="modal">
                                    <span>&times;</span>
                                </button>
                            </div>
                            <div class="modal-body">
                                <div id="cartItems"></div>
                                <div class="d-flex justify-content-between mt-4">
                                    <h5>Total:</h5>
                                    <h5 id="cartTotal">₦0</h5>
                                </div>
                            </div>
                            <div class="modal-footer">
                                <button type="button" class="btn btn-secondary" data-dismiss="modal">Continue Shopping</button>
                                <button type="button" class="btn btn-danger" id="clearCart">Clear Cart</button>
                                <button type="button" class="btn btn-success" id="checkoutBtn">Checkout via WhatsApp</button>
                            </div>
                        </div>
                    </div>
                </div>
            `);
        }

        // Update cart badge
        if (!$('.cart_link .cart-count').length) {
            $('.cart_link').append('<span class="cart-count badge badge-danger">0</span>');
        }
        updateCartCount();

        // Event Listeners
        $(document).on('click', '.qty-btn', function() {
            const $input = $(this).closest('.input-group').find('.qty-input');
            const currentVal = parseInt($input.val()) || 1;
            
            if ($(this).data('action') === 'increase') {
                $input.val(Math.min(currentVal + 1, 99));
            } else {
                $input.val(Math.max(currentVal - 1, 1));
            }
        });

        $(document).on('click', '.add-to-cart', function() {
            const name = $(this).data('name');
            const price = parseInt($(this).data('price'));
            const quantity = parseInt($(this).closest('.box').find('.qty-input').val()) || 1;
            
            addToCart(name, price, quantity);
        });

        $('.cart_link').click(function(e) {
            e.preventDefault();
            $('#cartModal').modal('show');
        });

        $(document).on('click', '.remove-item', function() {
            const index = $(this).data('index');
            cart.splice(index, 1);
            saveCart();
            updateCartUI();
        });

        $('#clearCart').click(function() {
            cart = [];
            saveCart();
            updateCartUI();
        });

        $('#checkoutBtn').click(function() {
            sendOrder();
        });
    }

    // Initialize when document is ready
    $(document).ready(initCart);
})();