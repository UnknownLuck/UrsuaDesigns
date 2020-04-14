var db = {};

var products = [];
var prices = [];
var amounts = []
var totalPrices = [];
var images = [];

setupNavbar();
findProductsAndDetails();
updateCartModal(false);

// Finds details on the page about the products and automates certain tasks
function findProductsAndDetails() {

    var productElements = document.getElementsByClassName('item-title');
    var priceElements = document.getElementsByClassName('product-price');
    var cartButtonElements = document.getElementsByClassName('add-to-cart-button');
    var imageElements = document.getElementsByClassName('item-image');

    // Loop through and find product names
    for (var i = 0; i < productElements.length; i++) {
        var productIT = productElements[i].innerText;
        var str = "";
        for (var j = 0; j < productIT.length; j++) {
            if (productIT[j] != " ") {
                str += productIT[j]
            }
        }
        products.push(str);
    }

    // Loop through and find product prices
    for (var i = 0; i < priceElements.length; i++) {
        //prices.push(priceElements[i].innerText);
    }

    // Loop through each add to cart button
    for (var i = 0; i < cartButtonElements.length; i++) {
        cartButtonElements[i].addEventListener('click', e => { addToCart(e.target); e.target.setAttribute('data-dismiss', 'modal') }, false);
        cartButtonElements[i].classList.add(products[i]);
    }

    // Loop through and find product amounts
    if (getCart(true)) {
        // Loop through each item in the cart
        for (var i = 0; i < Object.keys(getCart(true)).length; i++) {
            var orderData = getCart(true)[i];
            amounts.push(orderData.amount);
        }
    }

    // Loop through and calculate the total price for the selected amount of each product
    for (var i = 0; i < products.length; i++) {
        //totalPrices.push(prices[i].split('$').pop() * amounts[i]);
    }

    // Add database references to products
    for (var i = 0; i < products.length; i++) {
        db[i] = {
            productName: products[i],
            //amount: amounts[i]
        }
    }

    for (var i = 0; i < products.length; i++) {
        images.push(imageElements[i].attributes[1].value);
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

            if (item.productName == "Custom Order") {
                // Display the looped item with costs and details
                productTable.innerHTML +=
                    "<tr id='item-" +
                    i +
                    "'><td class='w-25'><img src='/img/logos/Logo@4x.png'" +
                    "class='img-fluid img-thumbnail' id='product-img-" +
                    i +
                    "' alt=''></td><td id='product-name-" +
                    i +
                    "'><span class='cart-product'>Custom Order</span><span class='price-break'></span><span class='cart-price'>$" +
                    item.price +
                    "</span></td><td id='product-quanity-" +
                    i +
                    "'>" +
                    "<input class='product-quantity' id='product-quantity-" + i + "-value' type='number' min='1' max='10' value='" + item.amount + "' onchange=updateProductCounts() onkeyup=enforceMinMax(this)></td><td class='product-total-price' id='product-total-price-" +
                    i +
                    "'>$" +
                    (item.price * item.amount) +
                    "</td><td><a href='#' id='product-remove-" +
                    i +
                    "' class='btn btn-danger btn-rm' onclick='removeProduct(this.id);'><i class='fa fa-times'></i></a></td></tr>";

            } else {
                // Display the looped item with costs and details
                productTable.innerHTML +=
                    "<tr id='item-" +
                    i +
                    "'><td class='w-25'><img src='" + images[i] + "'" +
                    "class='img-fluid img-thumbnail' id='product-img-" +
                    i +
                    "' alt=''></td><td id='product-name-" +
                    i +
                    "'><span class='cart-product'>" +
                    products[i] +
                    "</span><span class='price-break'></span><span class='cart-price'>" +
                    prices[i] +
                    "</span></td><td id='product-quanity-" +
                    i +
                    "'>" +
                    "<input class='product-quantity' id='product-quantity-" + i + "-value' type='number' min='1' max='10' value='" + amounts[i] + "' onchange=updateProductCounts() onkeyup=enforceMinMax(this)></td><td class='product-total-price' id='product-total-price-" +
                    i +
                    "'>$" +
                    totalPrices[i] +
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

        if (item.productName == "Custom Order") {
            itemPrice = item.price * item.amount;
            itemTaxes = itemPrice * taxPercentage / 100;

        } else {
            // Fetch price, calculate tax
            itemPrice = parseFloat(prices[i].split('$').pop() * amounts[i]);

            itemTaxes = itemPrice * taxPercentage / 100;
        }

        // Update total costs during this iteration
        orderSubtotal += itemPrice;
        orderTaxes += itemTaxes;

    }
    // Update total price for each product
    var totalProductPriceElements = document.getElementsByClassName('product-total-price');

    for (var i = 0; i < totalProductPriceElements.length; i++) {

        if (item.productName == "Custom Order") {
            break;
        }

        var totalProductPrice = totalPrices[i];

        totalProductPriceElements[i].innerText = "$" + totalProductPrice.toFixed(2);

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
function addToCart(button) {

    var classes = button.classList;
    var productKey = "";

    var productName = "";
    var data = {};

    for (var i = 0; i < classes.length; i++) {
        if (classes[i] != "add-to-cart-button" && classes[i] != "sqs-block-button-element") {
            productKey = classes[i];
        }
    }

    var productIndex = 0;

    if (productKey == "CustomOrder") {
        productName = "Custom Order";

        var customOrderPrice = parseFloat(document.getElementById("option-customorder-price").value);

        data = {
            productName: productName,
            amount: 1,
            price: customOrderPrice
        }


    } else {
        for (var i = 0; i < products.length; i++) {
            if (productKey == products[i]) {
                productIndex = i;
            }
        }

        productName = products[productIndex];

        data = {
            productName: productName,
            amount: 1
        };
    }

    // Check for localStorage support
    if (typeof Storage !== "undefined") {
        if (localStorage.getItem("cartData")) {
            var cart = JSON.parse(localStorage.getItem("cartData"));
            var cartCount = Object.keys(cart).length;

            var matchFound = false;

            if (productKey != "CustomOrder") {
                for (var i = 0; i < cartCount; i++) {
                    if (cart[i].productName == data.productName) {
                        matchFound = true;
                        cart[i].amount++;
                        break;
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

    amounts = [];
    totalPrices = [];

    for (var i = 0; i < quantityElements.length; i++) {

        var amount = quantityElements[i];

        var item = cart[i];

        // Check if the amount entered is not a number
        if (!parseInt(amount.value)) {
            // Default amount to 1
            amounts.push(1);
        } else { // Amount entered is a number
            amounts.push(parseInt(amount.value));
        }

        if (item.productName != "Custom Order") {
            totalPrices.push(prices[i].split('$').pop() * amounts[i]);
        }

    }

    for (var i = 0; i < Object.keys(cart).length; i++) {
        cart[i].amount = amounts[i];
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


// Logs the error upon a failed attempted to fetch data
function errData(err) {
    console.log(err);
}

/*$(document).ready(function () {
    $('#cart').modal('show');
});*/