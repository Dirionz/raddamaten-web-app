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
    var productId = $(this).data('productid');
    var productName = $(this).data('productname');
    var productQuantity = $(this).data('productquantity');
    var productPrice = $(this).data('productprice');
    var html = '<p>' + productName + '</p>'
    $('.order-list').append(html);
  });

});

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