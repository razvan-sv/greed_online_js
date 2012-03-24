Array.prototype.sample = function(n){
  if (typeof n == "undefined") n = 1
  
  results = []
  for (var i = 0; i < n; i++){  
    results.push(this[Math.floor(Math.random()*this.length)])
  }

  return results
}
Storage.prototype.setObject = function(key, value) {
    this.setItem(key, JSON.stringify(value));
}

Storage.prototype.getObject = function(key) {
    return JSON.parse(this.getItem(key));
}