Array.prototype.sample = function(n){
  if (typeof n == "undefined") n = 1
  
  results = []
  for (var i = 0; i < n; i++){
    results.push(this[Math.floor(Math.random()*this.length)])
  }

  return results
}

// Returns a hash (number:frequency) having the numbers as keys and their frequency as values
Array.prototype.to_frequency = function(){
  hashed_picks = {}
  for (var i = 0; i < this.length; i++){
    pick = this[i].toString()
    if (hashed_picks[pick] == undefined){
      hashed_picks[pick] = 1
    }else{
      hashed_picks[pick]++
    }
  }
  
  return hashed_picks
}

// Multiply the array by a number of times dictated by the 'n' parameter
Array.prototype.multiply = function(n){
  results = []
  for (var i = 0; i < this.length; i++){
    for (var j = 0; j < n; j++){
      results.push(this[i])
    }
  }

  return results
}

// Storage.prototype.setObject = function(key, value) {
  // this.setItem(key, JSON.stringify(value));
// }
// 
// Storage.prototype.getObject = function(key) {
  // return JSON.parse(this.getItem(key));
//}