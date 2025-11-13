// to get current year
function getYear() {
    var currentDate = new Date();
    var currentYear = currentDate.getFullYear();
    document.querySelector("#displayYear").innerHTML = currentYear;
}

getYear();


// isotope js
// expose the isotope grid as a global so search/filter can use it
$(window).on('load', function () {
    $('.filters_menu li').click(function () {
        $('.filters_menu li').removeClass('active');
        $(this).addClass('active');

        var data = $(this).attr('data-filter');
        if (window.$isoGrid) {
            window.$isoGrid.isotope({ filter: data });
        }
    });

    window.$isoGrid = $(".grid").isotope({
        itemSelector: ".all",
        percentPosition: false,
        masonry: {
            columnWidth: ".all"
        }
    });
});

// nice select
$(document).ready(function() {
    $('select').niceSelect();
  });

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
        // ensure UI reflects current cart immediately
        try { updateCartUI(); } catch (e) { /* safe guard if UI not ready */ }
    }

    // Update cart count badge
    function updateCartCount() {
        const count = cart.reduce((total, item) => total + item.quantity, 0);
        $('.cart-count').text(count);
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
        if($('.cart_link .cart-count').length === 0){
            $('.cart_link').append('<span class="cart-count badge badge-danger">0</span>');
        }
        updateCartCount();
        // Render cart UI immediately so saved items show on load
        updateCartUI();

        // Event Listeners (use delegated handlers so dynamically-created controls work)
        $(document).on('click', '.qty-btn', function() {
            const $input = $(this).closest('.input-group').find('.qty-input');
            const currentVal = parseInt($input.val());
            if (isNaN(currentVal)) {
                $input.val(1);
                return;
            }
            if ($(this).data('action') === 'increase') {
                $input.val(Math.min(currentVal + 1, 99)).trigger('change');
            } else {
                $input.val(Math.max(currentVal - 1, 1)).trigger('change');
            }
        });

        // delegate add-to-cart clicks
        $(document).on('click', '.add-to-cart', function() {
            const $itemBox = $(this).closest('.box');
            const name = $(this).data('name') || $.trim($itemBox.find('.detail-box h5').text());
            const price = parseFloat($(this).data('price')) || (parseFloat($(this).data('price')) === 0 ? 0 : parseInt(($itemBox.find('h6').text()||'').replace(/[^0-9]/g,'')));
            const quantity = parseInt($itemBox.find('.qty-input').val()) || 1;
            addToCart(name, price, quantity);
            // hide inline selector after add
            $(this).closest('.cart-inline').slideUp(120);
        });

        $('.cart_link').click(function(e) {
            e.preventDefault();
            $('#cartModal').modal('show');
        });

        $('#cartItems').on('click', '.remove-item', function() {
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

        // Convert existing SVG/cart links to circular cart buttons + inject inline qty UI
        $('.grid .all').each(function(){
            var $card = $(this);
            var $options = $card.find('.options');
            if(!$options.length) return;

            var name = $.trim($card.find('.detail-box h5').text()) || '';
            // extract numeric price from h6
            var priceText = ($options.find('h6').text()||'').replace(/[^0-9]/g,'');
            var price = parseInt(priceText) || 0;

            // replace old svg link if present
            var $svgLink = $options.find('a:has(svg)').first();
            if($svgLink.length){
                var btnHtml = '<button type="button" class="cart-toggle btn btn-outline-primary" title="Add" style="width:40px;height:40px;border-radius:50%;padding:0;display:inline-flex;align-items:center;justify-content:center;margin-left:8px;"><i class="fa fa-shopping-cart"></i></button>';
                $svgLink.replaceWith(btnHtml);
            } else {
                // if there is no svg link but also no visible cart toggle, add one
                if(!$options.find('.cart-toggle').length){
                    $options.append('<button type="button" class="cart-toggle btn btn-outline-primary" title="Add" style="width:40px;height:40px;border-radius:50%;padding:0;display:inline-flex;align-items:center;justify-content:center;margin-left:8px;"><i class="fa fa-shopping-cart"></i></button>');
                }
            }

            // if no add-to-cart exists inside options, append hidden inline controls
            if($options.find('.add-to-cart').length === 0){
                var inline = '\n<div class="cart-inline" style="display:none;margin-top:8px;">\n  <div class="d-flex align-items-center">\n    <div class="input-group input-group-sm mr-2" style="width:100px;">\n      <div class="input-group-prepend">\n        <button class="btn btn-outline-secondary qty-btn" type="button" data-action="decrease">-</button>\n      </div>\n      <input type="number" class="form-control text-center qty-input" value="1" min="1" max="99">\n      <div class="input-group-append">\n        <button class="btn btn-outline-secondary qty-btn" type="button" data-action="increase">+</button>\n      </div>\n    </div>\n    <button class="btn btn-sm btn-success add-to-cart" data-name="'+escapeHtml(name)+'" data-price="'+price+'">Add to Cart</button>\n  </div>\n</div>\n';
                $options.append(inline);
            } else {
                // if controls exist, ensure they are wrapped and hidden initially
                var $existingControls = $options.find('.add-to-cart').closest('.d-flex');
                if($existingControls.length && !$existingControls.parent().hasClass('cart-inline')){
                    $existingControls.wrap('<div class="cart-inline" style="display:none;margin-top:8px;"></div>');
                }
                // ensure add-to-cart has data-name and data-price
                var $existingAdd = $options.find('.add-to-cart').first();
                if(!$existingAdd.data('name')) $existingAdd.data('name', name);
                if(!$existingAdd.data('price')) $existingAdd.data('price', price);
            }
        });

        // toggle inline on cart-toggle click
        $(document).on('click', '.cart-toggle', function(e){
            e.preventDefault();
            e.stopPropagation();
            var $options = $(this).closest('.options');
            var $inline = $options.find('.cart-inline');
            // hide other open inlines
            $('.cart-inline').not($inline).slideUp(120);
            $inline.slideToggle(120);
        });

        // close inline when clicking outside
        $(document).on('click', function(e){
            if(!$(e.target).closest('.options').length){
                $('.cart-inline').slideUp(120);
            }
        });

        // helper to escape html in injected attributes
        function escapeHtml(text){
            if(!text) return '';
            return text.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;');
        }
    }

    // Initialize search functionality
function initSearch(){
    var $form = $('#headerSearchForm');
    var $input = $('#headerSearchInput');
    var $toggle = $('#toggleSearch');

    // Debounce helper
    function debounce(fn, wait) {
        var t;
        return function() {
            var args = arguments;
            var ctx = this;
            clearTimeout(t);
            t = setTimeout(function(){ fn.apply(ctx, args); }, wait);
        };
    }

    // Remove previous highlights (un-wrap <mark.search-highlight>)
    function removeHighlights($container){
        $container.find('mark.search-highlight').each(function(){
            var $m = $(this);
            $m.replaceWith($m.text());
        });
    }

    // Walk text nodes and wrap whole-word matches with a mark element
    function highlightWithin(node, regex){
        // node: DOM element (not jQuery)
        // regex should be global and case-insensitive (we pass 'gi')
        var walker = document.createTreeWalker(node, NodeFilter.SHOW_TEXT, null, false);
        var n, textNodes = [];
        while(n = walker.nextNode()){
            textNodes.push(n);
        }
        // traverse backwards to avoid offsets pollution
        for(var i = textNodes.length - 1; i >= 0; i--){
            var textNode = textNodes[i];
            var parent = textNode.parentNode;
            // skip if inside existing highlight
            if(parent && parent.closest && parent.closest('mark.search-highlight')) continue;
            var text = textNode.nodeValue;
            var match;
            var frag = document.createDocumentFragment();
            var lastIndex = 0;
            regex.lastIndex = 0;
            var found = false;
            while((match = regex.exec(text)) !== null){
                found = true;
                var mStart = match.index;
                var mEnd = regex.lastIndex;

                // append text before
                if(mStart > lastIndex){
                    frag.appendChild(document.createTextNode(text.slice(lastIndex, mStart)));
                }
                // matched text - preserve original case
                var mark = document.createElement('mark');
                mark.className = 'search-highlight';
                mark.textContent = text.slice(mStart, mEnd);
                frag.appendChild(mark);
                lastIndex = mEnd;
            }
            if(found){
                // append remaining text
                if(lastIndex < text.length){
                    frag.appendChild(document.createTextNode(text.slice(lastIndex)));
                }
                parent.replaceChild(frag, textNode);
            }
        }
    }

    // Create an Isotope filter function using the query q (string)
    function setIsotopeFilterByQuery(q){
        // If isotope instance not available, fallback to show/hide
        var iso = window.$isoGrid;
        var qtrim = (q||'').trim();
        if(!iso || qtrim === ''){
            // reset: show all
            if(iso) iso.isotope({ filter: '*' });
            $('.filters_menu li').removeClass('active');
            $('.filters_menu li[data-filter="*"]').addClass('active');
            $('.no-results').remove();
            // remove highlights
            $('.grid .all').each(function(){
                removeHighlights($(this));
            });
            return;
        }

        // Build regex (allow substring matching)
        function escapeRegExp(string) {
            return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        }
        var words = qtrim.split(/\s+/).filter(Boolean);
        if(words.length === 0){
            iso.isotope({ filter: '*' });
            return;
        }
        var pattern = words.map(function(w){ return escapeRegExp(w); }).join('|');
        var regex = new RegExp(pattern, 'gi');

        // set isotope filter fn
        iso.isotope({
            filter: function(){
                var $this = $(this);
                var name = ($this.find('.detail-box h5').text()||'');
                var desc = ($this.find('.detail-box p').text()||'');
                var searchable = name + ' ' + desc;
                return regex.test(searchable);
            }
        });

        // after layout, apply highlights to visible items
        // run with small delay to let isotope layout
        setTimeout(function(){
            $('.no-results').remove();
            // remove highlights from all items first
            $('.grid .all').each(function(){
                removeHighlights($(this));
            });
            // highlight only the currently visible items that match
            $('.grid .all:visible').each(function(){
                highlightWithin(this.querySelector('.detail-box h5'), regex);
                highlightWithin(this.querySelector('.detail-box p'), regex);
            });

            // show no-results if none visible
            var visibleCount = $('.grid .all:visible').length;
            if(visibleCount === 0){
                $('.grid').after('<div class="no-results">No results found for "<strong>' + $('<div>').text(qtrim).html() + '</strong>"</div>');
            } else {
                $('.no-results').remove();
            }
        }, 180);
    }

    var debouncedFilter = debounce(function(val){
        setIsotopeFilterByQuery(val);
    }, 200);

    $toggle.on('click', function(){
        if($form.hasClass('d-none')){
            $form.removeClass('d-none').addClass('d-flex');
            $input.focus();
            $toggle.attr('aria-expanded','true');
        } else {
            $form.removeClass('d-flex').addClass('d-none');
            $input.val('');
            setIsotopeFilterByQuery('');
            $toggle.attr('aria-expanded','false');
        }
    });

    // live search-as-you-type (debounced)
    $input.on('input', function(e){
        var q = $input.val();
        debouncedFilter(q);
    });

    // still support Enter and Escape explicitly
    $input.on('keydown', function(e){
        if(e.key === 'Enter'){
            e.preventDefault();
            setIsotopeFilterByQuery($input.val().trim());
        } else if(e.key === 'Escape'){
            $toggle.trigger('click');
        }
    });
}

    // Initialize when document is ready
    $(document).ready(function(){ initCart(); initSearch(); });
})();


/** google_map js **/
function myMap() {
    var mapProp = {
        center: new google.maps.LatLng(40.712775, -74.005973),
        zoom: 18,
    };
    var map = new google.maps.Map(document.getElementById("googleMap"), mapProp);
}

// client section owl carousel
$(".client_owl-carousel").owlCarousel({
    loop: true,
    margin: 0,
    dots: false,
    nav: true,
    navText: [],
    autoplay: true,
    autoplayHoverPause: true,
    navText: [
        '<i class="fa fa-angle-left" aria-hidden="true"></i>',
        '<i class="fa fa-angle-right" aria-hidden="true"></i>'
    ],
    responsive: {
        0: {
            items: 1
        },
        768: {
            items: 2
        },
        1000: {
            items: 2
        }
    }
});