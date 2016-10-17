$(document).ready(function() {

  var productsframe = $("div#productsframe").length;
  if (productsframe) {
    nextpage = 2;
    $('#load_more').click(function(event) {
      loadMoreProducts();
    });
  }
  $('#date');

});

function loadMoreProducts() {

  const loadmoreBtn = $('#load_more.btn');
  loadmoreBtn.button('loading');

  // Retains compatibility for those with no javascript
  event.preventDefault()
  var limit = getLimit()
  // Fetch the data
  $.get('/restaurant/products/' + nextpage + '?limit=' + limit, function(html){
    if (html) {
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