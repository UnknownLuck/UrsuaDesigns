var db = {};

var products = [];
var images = [];

document.addEventListener("DOMContentLoaded", function () {
    var lazyImages = [].slice.call(document.querySelectorAll("img.lazy"));

    if ("IntersectionObserver" in window) {
        let lazyImageObserver = new IntersectionObserver(function (entries, observer) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting) {
                    let lazyImage = entry.target;
                    lazyImage.src = lazyImage.dataset.src;
                    lazyImage.srcset = lazyImage.dataset.srcset;
                    lazyImage.classList.remove("lazy");
                    lazyImageObserver.unobserve(lazyImage);
                }
            });
        });

        lazyImages.forEach(function (lazyImage) {
            lazyImageObserver.observe(lazyImage);
        });
    } else {
        // Possibly fall back to a more compatible method here
    }
});

setupNavbar();
findProductsAndDetails();
updateCartModal(false);

// Finds details on the page about the products and automates certain tasks
function findProductsAndDetails() {

    var productElementTitles = document.getElementsByClassName('item-title');
    var cartButtonElements = document.getElementsByClassName('add-to-cart-button');
    var imageElements = document.getElementsByClassName('item-image');

    // Loop through and find product names
    for (var i = 0; i < productElementTitles.length; i++) {
        var productIT = productElementTitles[i].innerText;
        var str = "";
        for (var j = 0; j < productIT.length; j++) {
            if (productIT[j] != " ") {
                str += productIT[j]
            } else {
                str += "-";
            }
        }

        var price;
        var image;
        var modalElement = document.getElementById(str);

        if (productElementTitles[i].innerText == "Custom Order") {
            price = "Variable";
            // Correct price gathered at "Add to Cart" events
        } else {
            price = modalElement.querySelectorAll(".product-price")[0].innerText;
        }

        image = imageElements[i].attributes[2].value;

        products.push([productElementTitles[i].innerText, price, image]);
    }

    // Loop through each add to cart button
    for (var i = 0; i < cartButtonElements.length; i++) {
        cartButtonElements[i].addEventListener('click', e => { addToCart(e.target); e.target.setAttribute('data-dismiss', 'modal') }, false);

        var innerText = products[i][0];
        var str = "";

        for (var j = 0; j < innerText.length; j++) {
            if (innerText[j] != " ") {
                str += products[i][0][j];
            } else {
                str += "-";
            }
        }

        cartButtonElements[i].classList.add(str);
    }

    // Add database references to products
    for (var i = 0; i < products.length; i++) {
        db[i] = {
            productName: products[i][0],
            //amount: amounts[i]
        }
    }

    for (var i = 0; i < products.length; i++) {
        images.push(imageElements[i].attributes[2].value);
    }

    // Push database to storage
    localStorage.setItem("storedData", JSON.stringify(db));

}

// Setup navbar behavior
function setupNavbar() {
    // Start use strict
    "use strict";

    // Smooth scrolling using jQuery easing
    $('a.js-scroll-trigger[href*="#"]:not([href="#"])').click(function () {
        if (location.pathname.replace(/^\//, '') == this.pathname.replace(/^\//, '') && location.hostname == this.hostname) {
            var target = $(this.hash);
            target = target.length ? target : $('[name=' + this.hash.slice(1) + ']');
            if (target.length) {
                $('html, body').animate({
                    scrollTop: (target.offset().top - 54)
                }, 1000, "easeInOutExpo");
                return false;
            }
        }
    });

    // Closes responsive menu when a scroll trigger link is clicked
    $('.js-scroll-trigger').click(function () {
        $('.navbar-collapse').collapse('hide');
    });

    // Activate scrollspy to add active class to navbar items on scroll
    $('body').scrollspy({
        target: '#nav',
        offset: 56
    });

    // Collapses the navbar
    var navbarCollapse = function () {
        if ($("#nav").offset().top > 100) {
            $("#nav").addClass("navbar-shrink");
        } else {
            $("#nav").removeClass("navbar-shrink");
        }
    };

    // Collapse if not at the top of the page
    navbarCollapse();

    // Collapse the navbar when the page is scrolled
    $(window).scroll(navbarCollapse);

} (jQuery); // End use strict

// Called when an item has been added/removed from the cart
function updateCartModal(updateOnlyPrices) {

    var cart = getCart(true);
    var storedData = JSON.parse(localStorage.getItem("storedData"));

    // Exit if no cart
    if (!cart) {
        return console.log("No cart data");
    }

    if (!updateOnlyPrices) {
        var productTable = document.getElementById("product-table");
        productTable.innerHTML = "";

        // Loop through each item in the cart
        for (var i = 0; i < Object.keys(cart).length; i++) {

            // Looped item from cart
            var item = cart[i];
            var orderData = getCart(true)[i];

            // Used to map item in the cart to the index of that type of item in the list of products
            var identifier = 0;

            for (var j = 0; j < products.length; j++) {
                if (item.productName == products[j][0]) {
                    identifier = j;
                }
            }

            if (item.productName == "Custom Order") {
                // Display the looped item with costs and details
                productTable.innerHTML +=
                    "<tr id='item-" +
                    i +
                    "'><td class='w-25'><img src='" +
                    products[identifier][2] +
                    "'" +
                    "class='img-fluid img-thumbnail' id='product-img-" +
                    i +
                    "' alt=''></td><td id='product-name-" +
                    i +
                    "'><span class='cart-product'>Custom Order</span><span class='price-break'></span><span class='cart-product-price'>$" +
                    item.price +
                    "</span></td><td id='product-quanity-" +
                    i +
                    "'>" +
                    "<input class='product-quantity' id='product-quantity-" + i + "-value' type='number' min='1' max='10' value='" + item.amount + "' onchange=updateProductCounts() onkeyup=enforceMinMax(this)></td><td class='product-total-price' id='product-total-price-" +
                    i +
                    "'>$" +
                    getTotalPriceAtCartIndex(i) +
                    "</td><td><a href='#' id='product-remove-" +
                    i +
                    "' class='btn btn-danger btn-rm' onclick='removeProduct(this.id);'><i class='fa fa-times'></i></a></td></tr>";

            } else {

                // Get options if any
                var options = "";

                for (var j = 0; j < Object.keys(item.options).length; j++) {
                    options += Object.keys(item.options)[j] + ": " + item.options[Object.keys(item.options)[j]];
                    if (j != Object.keys(item.options).length - 1) {
                        options += " / ";
                    }
                }

                // Display the looped item with costs and details
                productTable.innerHTML +=
                    "<tr id='item-" +
                    i +
                    "'><td class='w-25'><img src='" + products[identifier][2] + "'" +
                    "class='img-fluid img-thumbnail' id='product-img-" +
                    i +
                    "' alt=''></td><td id='product-name-" +
                    i +
                    "'><span class='cart-product'>" +
                    products[identifier][0] +
                    "</span><span class='price-break'></span><span class='cart-product-price'>" +
                    products[identifier][1] +
                    "</span><span class='price-break'></span><span class='product-options'>" +
                    options +
                    "</span></td><td id='product-quanity-" +
                    i +
                    "'>" +
                    "<input class='product-quantity' id='product-quantity-" + i + "-value' type='number' min='1' max='10' value='" +
                    cart[i].amount +
                    "' onchange=updateProductCounts() onkeyup=enforceMinMax(this)></td><td class='product-total-price' id='product-total-price-" +
                    i +
                    "'>$" +
                    getTotalPriceAtCartIndex(i) +
                    "</td><td><a href='#' id='product-remove-" +
                    i +
                    "' class='btn btn-danger btn-rm' onclick='removeProduct(this.id);'>	<i class='fa fa-times'></i></a></td></tr>";
            }
        }
    }

    // Enter the sales tax to be applied to the order
    var taxPercentage = 6.5;

    // Reset order costs
    orderSubtotal = 0;
    orderTaxes = 0;

    // Loop through each item in the cart
    for (var i = 0; i < Object.keys(cart).length; i++) {
        // Looped item from cart
        var item = cart[i];
        var orderData = getCart(true)[i];

        var itemPrice = 0;
        var itemTaxes = 0;

        // Calculate prices / taxes accordingly
        if (item.productName == "Custom Order") {
            itemPrice = item.price * item.amount;
            itemTaxes = itemPrice * taxPercentage / 100;

        } else {
            // Fetch price, calculate tax
            itemPrice = parseFloat(getTotalPriceAtCartIndex(i))

            itemTaxes = itemPrice * taxPercentage / 100;
        }

        // Update total costs during this iteration
        orderSubtotal += itemPrice;
        orderTaxes += itemTaxes;

    }

    // Gather and calculate costs
    var shipping = parseFloat(document.getElementById('shipping-options').value);
    var tax = orderTaxes + shipping * taxPercentage / 100;
    var total = orderSubtotal + shipping + tax;

    // Get the document location to display the costs
    var cartSubtotal = document.getElementById("cart-subtotal");
    var cartShipping = document.getElementById("cart-shipping");
    var cartTaxes = document.getElementById("cart-taxes");
    var cartTotal = document.getElementById("cart-total");

    // Display the costs
    cartSubtotal.innerText = "$" + orderSubtotal.toFixed(2);
    cartShipping.innerText = "$" + shipping.toFixed(2);
    cartTaxes.innerText = "$" + tax.toFixed(2);
    cartTotal.innerText = "$" + total.toFixed(2);
}

// Add item to cart
async function addToCart(button) {

    var classes = button.classList;
    var productKey = "";

    var productName = "";
    var data = {};

    
    // Determine type of item added
    for (var i = 0; i < classes.length; i++) {
        if (classes[i] != "add-to-cart-button" && classes[i] != "sqs-block-button-element") {
            productKey = classes[i];
        }
    }

    
    var optionElements = document.getElementById('options-container-' + productKey).querySelectorAll('.option');
    
    // Options, if any, of the item added
    var options = {};
    for (var i = 0; i < optionElements.length; i++) {
        
        var oeChildren = optionElements[i].children;
        
        var optionName = "";
        var optionIndex = 0;
        var optionType = "";
        
        // Gather info for selected item options
        for (var j = 0; j < oeChildren.length; j++) {
            if (oeChildren[j].localName == "h4") {
                optionName = oeChildren[j].innerText;
            } else {
                optionIndex = j;
                optionType = oeChildren[j].localName;
            }
        }
        
        // Option data
        var val = "";
        
        if (optionType == "select" || (optionType == "input" && oeChildren[optionIndex].type == "text")) {
            val = oeChildren[optionIndex].value;
        }
        
        options[optionName] = val;
    }
    
    // Special case for custom order
    if (productKey == "Custom-Order") {
        productName = "Custom Order";
    } else { // Get product name of item added
        var productIndex = 0;

        var str = "";

        for (var i = 0; i < productKey.length; i++) {
            if (productKey[i] == "-") {
                str += " ";
            } else {
                str += productKey[i];
            }
        }
        
        for (var i = 0; i < products.length; i++) {
            if (str == products[i][0]) {
                productIndex = i;
            }
        }
        
        productName = products[productIndex][0];
    }
    
    // Template data for cart addition
    data = {
        productName: productName,
        amount: 1,
        options: options
    };
    
    // Handle custom order
    if (productName == "Custom Order") {
        data.price = parseFloat(document.getElementById("option-customorder-price").value);
    }

    // Check for localStorage support
    if (typeof Storage !== "undefined") {
        if (localStorage.getItem("cartData")) {
            var cart = JSON.parse(localStorage.getItem("cartData"));
            var cartCount = Object.keys(cart).length;

            // Used to determine if matches exist between the item being added and others in the cart
            var matchFound = false;

            // Loop through all items in the cart
            for (var i = 0; i < cartCount; i++) {
                if (cart[i].productName == data.productName) {
                    // Handle custom order
                    if (productKey == "Custom-Order") {
                        // If equal, item matches ones in cart
                        if (cart[i].price == data.price) {
                            matchFound = true;
                            cart[i].amount++;
                            break;
                        }
                    } else {
                        // Loop through each option for the item
                        for (var j = 0; j < Object.keys(data['options']).length; j++) {


                            var keyName = Object.keys(data['options'])[j];
                            var keyData = data['options'][keyName];

                            // Check if option data is matching, reveals if item is identical to an entry in the cart
                            if (keyData != cart[i].options[keyName]) {
                                break;
                            }

                            if (j == Object.keys(data['options']).length - 1) {
                                matchFound = true;
                                cart[i].amount++;
                                break;
                            }

                        }
                    }
                }
            }

            if (!matchFound) {
                cart[cartCount] = data;
            }

            var newCart = JSON.stringify(cart);
            localStorage.setItem("cartData", newCart);
        } else {
            var cart = { 0: data };
            var newCart = JSON.stringify(cart);
            localStorage.setItem("cartData", newCart);
        }
    }

    updateCartModal(false);
}

// Return cart price
function getCartPrice() {
    return document.getElementById('cart-total').innerText.split('$').pop();
}

// Get cart data
function getCart(isParsed) {
    if (typeof Storage !== "undefined") {
        var cartData = localStorage.getItem("cartData");
        if (cartData) {
            if (isParsed) {
                return JSON.parse(cartData);
            } else {
                return cartData;
            }
        } else {
            return false;
        }
    }
}

// Set cart data
function setCart(data) {
    if (typeof Storage !== "undefined") {
        localStorage.setItem("cartData", data);
    }
    updateCartModal(false);
}

// Clear all cart data
function clearCart() {
    setCart("{}");
}

// Remove item from cart
function removeProduct(index) {
    index = index.split("-").pop();

    var cart = getCart(true);
    var newCart = {};

    delete cart[index];

    for (var i = 0, altI = 0; i < Object.keys(cart).length; i++, altI++) {
        if (!cart[i]) {
            altI += 1;
        }
        newCart[i] = cart[altI];
    }

    setCart(JSON.stringify(newCart));

    updateCartModal(false);
}

// Updates totals when a quantity is changed
function updateProductCounts() {
    var cart = getCart(true);
    var newCart = {};

    var quantityElements = document.getElementsByClassName('product-quantity');


    // Loop through quantities of each item in the cart
    for (var i = 0; i < Object.keys(cart).length; i++) {
        var amount = quantityElements[i];
        var item = cart[i];

        if (!parseInt(amount.value)) {
            cart[i].amount = 1;
        } else {
            cart[i].amount = parseInt(amount.value);
        }
    }

    newCart = cart;

    setCart(JSON.stringify(newCart));

    updateCartModal(true);
}

// Check if a quantity value is outside the acceptable range
function enforceMinMax(el) {
    if (el.value != "") {
        if (parseInt(el.value) < parseInt(el.min)) {
            el.value = el.min;
        }
        if (parseInt(el.value) > parseInt(el.max)) {
            el.value = el.max;
        }
    }
}


// ===== Handle Collapsible Content =====
var collapsibles = document.getElementsByClassName("collapsible");

for (var i = 0; i < collapsibles.length; i++) {
    collapsibles[i].addEventListener("click", function () {
        this.classList.toggle("collapsibleActive");
        var content = this.nextElementSibling;
        if (content.style.maxHeight) {
            content.style.maxHeight = null;
        } else {
            content.style.maxHeight = content.scrollHeight + "px";
        }
    });
}

// ===== End Handle Collapsible Content =====



// Submit order upon payment completion
function submitOrder(details) {

    var billingName = "";
    if (details.payer.name.given_name + " " + details.payer.name.surname) {
        billingName = details.payer.name.given_name + " " + details.payer.name.surname;
    }
    var shippingName = "";
    if (details.purchase_units[0].shipping.name.full_name) {
        shippingName = details.purchase_units[0].shipping.name.full_name;
    }

    var billingEmail = "";
    if (details.payer.email_address) {
        billingEmail = details.payer.email_address;
    }

    var billingPhoneNumber = "";
    if (details.payer.phone) {
        billingPhoneNumber = details.payer.phone.phone_number.national_number;
    }

    var billingAddress = "";
    var shippingAddress = "";

    // Get billing address
    if (details.payer.address.address_line_2) {
        billingAddress =
            details.payer.address.address_line_1 +
            ", " +
            details.payer.address.address_line_2 +
            ", " +
            details.payer.address.admin_area_2 +
            ", " +
            details.payer.address.admin_area_1 +
            ", " +
            details.payer.address.country_code +
            " " +
            details.payer.address.postal_code;
    } else {
        billingAddress =
            details.payer.address.address_line_1 +
            ", " +
            details.payer.address.admin_area_2 +
            ", " +
            details.payer.address.admin_area_1 +
            ", " +
            details.payer.address.country_code +
            " " +
            details.payer.address.postal_code;
    }

    // Get shipping address
    if (details.purchase_units[0].shipping.address.address_line_2) {
        shippingAddress =
            details.purchase_units[0].shipping.address.address_line_1 +
            ", " +
            details.purchase_units[0].shipping.address.address_line_2 +
            ", " +
            details.purchase_units[0].shipping.address.admin_area_2 +
            ", " +
            details.purchase_units[0].shipping.address.admin_area_1 +
            ", " +
            details.purchase_units[0].shipping.address.country_code +
            " " +
            details.purchase_units[0].shipping.address.postal_code;
    } else {
        shippingAddress =
            details.purchase_units[0].shipping.address.address_line_1 +
            ", " +
            details.purchase_units[0].shipping.address.admin_area_2 +
            ", " +
            details.purchase_units[0].shipping.address.admin_area_1 +
            ", " +
            details.purchase_units[0].shipping.address.country_code +
            " " +
            details.purchase_units[0].shipping.address.postal_code;
    }

    var orderInfo = {
        billing: {
            name: billingName,
            email: billingEmail,
            phone_number: billingPhoneNumber,
            address: billingAddress
        },
        cart: getCart(true),
        shipping: {
            name: shippingName,
            address: shippingAddress
        }
    }

    $.ajax({
        url:
            "https://script.google.com/macros/s/AKfycbxmCjhwVd1e_306CCDWEAXvBU7DVDZZtzRRT6HSYHipCn1p68G8/exec",
        data: {
            CartData: JSON.stringify(orderInfo.cart),
            Name: orderInfo.billing.name,
            Address: orderInfo.shipping.address,
            Email: orderInfo.billing.email,
            Subtotal: parseFloat(document.getElementById("cart-subtotal").innerText.split('$')[1]).toFixed(2),
            Shipping: parseFloat(document.getElementById("cart-shipping").innerText.split('$')[1]).toFixed(2),
            Taxes: parseFloat(document.getElementById("cart-taxes").innerText.split('$')[1]).toFixed(2),
            Total: parseFloat(document.getElementById("cart-total").innerText.split('$')[1]).toFixed(2),
            Details: JSON.stringify(details)
        },
        type: "GET",
        success: function (d) { },
        error: function (x, y, z) {
            console.error(x, y, z);
        }
    });

    clearCart();
}

// Returns the total price for a given index in the cart
function getTotalPriceAtCartIndex(cartIndex) {
    var cart = getCart(true);

    var value = 0;

    // Determine total price
    if (cart[cartIndex].productName == "Custom Order") {
        value = cart[cartIndex].price * cart[cartIndex].amount;
    } else {
        for (var j = 0; j < products.length; j++) {
            if (cart[cartIndex].productName == products[j][0]) {
                value = products[j][1].split('$').pop() * cart[cartIndex].amount;
            }
        }
    }

    return value.toFixed(2);
}

// Logs the error upon a failed attempted to fetch data
function errData(err) {
    console.log(err);
}

/*$(document).ready(function () {
    $('#cart').modal('show');
});*/