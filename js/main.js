var _default_points = {
	"1": {"triple":1000, "single":100},
	"2": {"triple":200,  "single":0},
	"3": {"triple":300,  "single":0},
	"4": {"triple":400,  "single":0},
	"5": {"triple":500,  "single":50},
	"6": {"triple":600,  "single":0},
}

var default_dice_faces = [1, 2, 3, 4, 5, 6]

function Player(name){
  this.name  = name
  this.score = 0
}

// Comment
generate_dice_pool = function(dice_faces){
  dice_pool = []
  initial_total = dice_faces.length
  final_total   = initial_total > 5 ? 5 : initial_total

  for (var i=0; i<initial_total; i++){
    face = dice_faces[i]
    for (var j=0; j<final_total; j++){
      dice_pool.push(face)
    }    
  }
  return dice_pool
}

bind_roll = function(player_id, array_of_faces){
  $("#roll-button").click(function(){
    var _number_picks    = roll(array_of_faces)
    var _dice_images     = []
    var _processed_picks = []    
    var _score           = 0

    _dice_frequency = dice_by_frequency(_number_picks)
    
    for (var i=0; i < _number_picks.length; i++){
      _pick   = _number_picks[i]
      _points = _default_points[_pick]
      _partial_results = partial_score(_dice_frequency[_pick], _points.triple, _points.single)
      
      if (_processed_picks.indexOf(_pick) == -1){
        _score += _partial_results.score
        _processed_picks.push(_pick)
      }      
      
      _added_in_score = (_partial_results.triple != 0 || _partial_results.rest != 0)
      // BUG : 4 two's, 4 three's
      _dice_images.push(generate_dice_face(_pick, _added_in_score))
    }

    $("#score").html(_score)
    $("#results").html(_dice_images.join(" "))

    p1.score += _score
    console.log(p1.score)

    // localStorage
    update_player_score(player_id, _score)
    $("#" + player_id + "_score").html(localStorage.getObject("greed_online")[0][player_id].score)
    //exit()
  });
}

exit = function(){
  console.log(p1)
}
// array_of_faces
roll = function(array_of_faces){
  dice_pool = generate_dice_pool(array_of_faces) //don't generate this everytime
  total     = array_of_faces.length > 5 ? 5 : array_of_faces.length // TODO: Refactor
  
  return dice_pool.sample(total)
}

generate_dice_face = function(number, scoring_face){
  if (scoring_face == true){
    result = '<div class="dice scoring">' +
                '<p class="single_dice face_' + number + '"/>' +
              '</div>'
  }else{
    result = '<p class="single_dice face_' + number + '"/>'
  }

  return result
}

// Returns a hash
dice_by_frequency = function(picks){
  hashed_picks = {}
  for (var i = 0; i < picks.length; i++){
    pick = picks[i].toString()
    if (hashed_picks[pick] == undefined){
      hashed_picks[pick] = 1
    }else{
      hashed_picks[pick]++
    }
  }
  
  return hashed_picks
}

partial_score = function(number_frequency, triple_score, single_score){
	result_for_triple = Math.floor(number_frequency/3) * triple_score
  is_triple = result_for_triple != 0 ? 3 : 0
	
  mod = number_frequency % 3
  result_for_single = mod * single_score
  is_single = result_for_single != 0 ? mod : 0
  
  return {
    "score": result_for_triple + result_for_single,    
    "triple": is_triple,
    "rest":   is_single
  }
}

collect_players = function(){
  number_of_players = prompt("Greetings! \nPlease enter the number of players. \nMax number is 4", 0)
  if (number_of_players > 0){
    players           = []
    players_to_html   = []
    data              = {}

    for (var i=0; i<number_of_players; i++){
      players.push(prompt("Player " + (i+1), "Player " + (i+1)))
    }
    $("#start-game").hide()
    $("#roll-button").show()
    $(".content").show()
    for (var i=0; i<players.length; i++){
      data["player_" + (i + 1)] = {"name":players[i], "score": 0}
      players_to_html.push('<tr>' + 
        '<td>' + players[i] + '</td>' + 
        '<td id="player_'+ (i+1) + '_score">0</td>' + 
        '</tr>'
      )
    }
    $("#players").html(players_to_html.join(""))    
    localStorage.setObject("greed_online", [data, {"rolling": "player_1", "times_rolled": 0}])
    //console.log(localStorage.getObject("greed_online"))
    // local storage stuff
  }
}

update_player_score = function(player_id, score){
  storage = localStorage.getObject("greed_online")
  //console.log(storage[0][player_id].score)
  //console.log(player_id)
  storage[0][player_id].score += score
  localStorage.setObject("greed_online", storage)
}

bind_start_game = function(){
  $("#start-game").click(function(){
    collect_players()
  })
  run_game()
}
run_game = function(){
  rolling_player = localStorage.getObject("greed_online")[1].rolling
  bind_roll(rolling_player, default_dice_faces)
}

$(document).ready(function(){
  window.p1 = new Player("Rz")
  bind_start_game()
})
