standUP.filter('reverser', function() {
  return function(items) {
    console.log(items)
    if (!angular.isArray(items)) return items; 
    return items.slice().reverse();
  };
});