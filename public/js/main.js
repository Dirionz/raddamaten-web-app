$(document).ready(function() {

  // Load more products
  var productsframe = $("div#productsframe").length;
  if (productsframe) {
    nextpage = 2;
    hideLoadMoreIfLessThanLimit($(this));
    $('#load_more').click(function(event) {
      loadMoreProducts();
    });
  }

  // Date inputs
  $('input#date').bootstrapMaterialDatePicker({ format : 'YYYY-MM-DD HH:mm' });
  
  // Add product on order page.
  $('.add-product-btn').click(function() {
    addToOrder($(this));
  });
  // Remove product on order page.
  $('div.order-list').on('click', '.delete-product-btn', function() {
    removeFromOrder($(this));
  })
});

function addToOrder(btn) {
  var orderId = btn.data('orderid') // The order id
  var productId = btn.data('productid'); // The product to be added
  
  var baseurl = $('div#baseurl').data('internalbaseurl');
  btn.button('loading');

  // Retains compatibility for those with no javascript
  event.preventDefault()

  $.get("/order/product/add/?productId="+ productId +"&orderId="+ orderId, function(html) {
    if (html) {
      $("div.order-list").html(html); // Replace the html in order-list
    } else {
      btn.hide();
    }
    btn.button('reset');
  });

}

function removeFromOrder(btn) {
  var orderId = btn.data('orderid') // The order id
  var productId = btn.data('productid'); // The product to be added
  
  var baseurl = $('div#baseurl').data('internalbaseurl');
  btn.button('loading');

  // Retains compatibility for those with no javascript
  event.preventDefault()

  $.get("/order/product/delete/?productId="+ productId +"&orderId="+ orderId, function(html) {
    if (html) {
      $("div.order-list").html(html); // Replace the html in order-list
    } else {
      btn.hide();
    }
    btn.button('reset');
  });

}

// Load more products on restaurant page and on the main page
function loadMoreProducts() {

  var baseurl = $('div#baseurl').data('internalbaseurl');

  const loadmoreBtn = $('#load_more.btn');
  loadmoreBtn.button('loading');

  // Retains compatibility for those with no javascript
  event.preventDefault()
  var limit = getLimit()
  // Fetch the data
  $.get(baseurl + nextpage + '?limit=' + limit, function(html){
    if (html) {
      hideLoadMoreIfLessThanLimit($(html));
      // Put the data where it belongs. I like it more this way
      $("div#productsframe").append(html)
      // Keep the counter up-to-date
      nextpage++;
    } else {
      loadmoreBtn.hide();
    }
    loadmoreBtn.button('reset');
  });
}

function getLimit() {
  var w = window.innerWidth;
  var limit; 
  if (w >= 991) {
    limit = 16;
  } else if (w <= 767) {
    limit = 8;
  } else {
    if (nextpage === 2) {
      limit = 14;
    } else {
      limit = 12;
    }
  }
  return limit;
}

function hideLoadMoreIfLessThanLimit(htmlObject) {
  const loadmoreBtn = $('#load_more.btn');
  var objectsReturned = htmlObject.find(".product-img").length;
  if (objectsReturned < getLimit()) {
    loadmoreBtn.hide();
  }
}