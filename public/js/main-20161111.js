$(document).ready(function() {

  // Load more products
  var productsframe = $("div#productsframe").length;
  if (productsframe) {
    hideLoadMoreIfLessThanLimit($(this));
    $('#load_more').click(function(event) {
      loadMoreProducts();
    });
  }

  // Load more orders
  hideLoadMoreIfLessThanLimit($(this));
  const loadmoreBtn = $('.btn.orders_load_more');
  hideLoadMoreIfLessThanLimit($(this), ".order-for-count", loadmoreBtn, 16);
  loadmoreBtn.click(function(event) {
    loadMoreOrders();
  });

  // Date inputs
  $('input#date').bootstrapMaterialDatePicker({ format : 'YYYY-MM-DD HH:mm' });
  
  // Add product on order page.
  $('.add-product-btn').click(function() {
    addToOrder($(this));
  });
  // Show description button
  $('.info-product-btn').click(function() {
    showDescription($(this));
  });
  // Remove product on order page.
  $('div.orders').on('click', '.delete-product-btn', function() {
    removeFromOrder($(this));
  })
  // Hide order when in small screen
  $('.order-list-header').click(function(e) {  
    $('.orders').toggleClass('orders-xs-collapse');
    $('.checkout').toggleClass('checkout-xs-collapse');
    $('.order-list').toggleClass('toggle-xs-cart');
  });

  // Restaurant/orders search box
  $('.dropdown-toggle').click(function() {

    $('#search-dropdown-ID').click(function() {
      $('#search_concept').html('ID ');
      $('input#search_param').val('ID');
    });

    $('#search-dropdown-Email').click(function() {
      $('#search_concept').html('Email ');
      $('input#search_param').val('Email');

    });
    $('#search-dropdown-Today').click(function() {
      $('#search_concept_date').html('Idag ');
      $('input#search_param_date').val('Today');
    });
    
    $('#search-dropdown-Alltime').click(function() {
      $('#search_concept_date').html('Alla ');
      $('input#search_param_date').val('Alltime');
    });
  });

  $(window).on("orientationchange",function(event){
    setTimeout(function () {
      $grid.isotope().isotope('layout');
    }, 500); // Better solution for this?
  });


});

var $container = $('#container'),
    $body = $('body'),
    colW = 23,
    columns = null
// ISOTOPE Layout
var $grid = $('#productsframe').isotope({
  itemSelector: '.product-container',
  layoutMode: 'masonry',
  masonry: {
    fitWidth: true
  }
});

function addToOrder(btn) {
  var orderId = btn.data('orderid') // The order id
  var productId = btn.data('productid'); // The product to be added
  
  var baseurl = $('div#baseurl').data('internalbaseurl');
  //btn.button('loading');
  btn.css('background', 'lightgray');
  btn.prop("disabled",true);

  // Retains compatibility for those with no javascript
  event.preventDefault()

  $.get("/order/product/add/?productId="+ productId +"&orderId="+ orderId, function(html) {
    if (html) {
      $("div.orders").html(html); // Replace the html in order-list
      var w = window.innerWidth;
      if (w < 576) {
        $("div.order-list-header").fadeIn(100).fadeOut(100).fadeIn(100);
      }
    } else {
      btn.hide();
    }
    //btn.button('reset');
    btn.prop("disabled",false);
    btn.removeAttr("style");
  });
}

function showDescription(btn) {
  descElm = btn.parent().parent().find('div.desctiption-horizontal')
  descElm.toggleClass( 'desctiption-horizontal-hidden' );
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
      $("div.orders").html(html); // Replace the html in order-list
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
  event.preventDefault();
  var limit = getLimit();
  var currentCount = $grid.children('div').length;
  // Fetch the data
  $.get(baseurl + currentCount + '?limit=' + limit, function(html){
    if (html) {
      hideLoadMoreIfLessThanLimit($(html), ".product-img", loadmoreBtn, limit);
      // Put the data where it belongs. I like it more this way
      //$("div#productsframe").append(html);
      html = $(html);
      $grid.isotope()
        .append( html )
        .isotope( 'appended', html )
        .isotope('layout');
    } else {
      loadmoreBtn.hide();
    }
    loadmoreBtn.button('reset');
  })
  .fail(function() {
    loadmoreBtn.button('reset');
  });
}

function getLimit() {
  var w = window.innerWidth;
  var limit; 
  if (w >= 1200) {
    limit = 16;
  } else if (w <= 992) {
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

function hideLoadMoreIfLessThanLimit(htmlObject, objectToFind, loadmoreBtn, limit) {
  var objectsReturned = htmlObject.find(objectToFind).length;
  if (objectsReturned < limit) {
    loadmoreBtn.hide();
  }
}

// Load more orders on restaurant orders page
function loadMoreOrders() {
  var baseurl = $('div#baseurl').data('internalbaseurl');
  var query = $('div#query').data('internalbasequery');

  const loadmoreBtn = $('.btn.orders_load_more');
  loadmoreBtn.button('loading');

  // Retains compatibility for those with no javascript
  event.preventDefault();
  var limit = 16;
  var currentCount = $("tbody.orderscontainer").children('tr.order-row').length;
  // Fetch the data
  $.get(baseurl + '?skip=' + currentCount + query, function(html){
    if (html) {
      hideLoadMoreIfLessThanLimit($(html), ".order-for-count", loadmoreBtn, limit);
      // Put the data where it belongs. I like it more this way
      $("tbody.orderscontainer").append(html);
    } else {
      loadmoreBtn.hide();
    }
    loadmoreBtn.button('reset');
  })
  .fail(function() {
    loadmoreBtn.button('reset');
  });
}

function validateInputFile(){
    var inp = document.getElementById('upload');
    if(inp.files.length == 0){
        alert("Bild krävs");
        inp.focus();
        return false;
    }
}


