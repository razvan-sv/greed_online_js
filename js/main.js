// How many rounds were played
var round = 0

var _default_points = {
	"1": {"triple":1000, "single":100},
	"2": {"triple":200,  "single":0},
	"3": {"triple":300,  "single":0},
	"4": {"triple":400,  "single":0},
	"5": {"triple":500,  "single":50},
	"6": {"triple":600,  "single":0},
}

var default_dice_faces = [1, 2, 3, 4, 5, 6]

function Player(id, name){
  this.id    = id
  this.name  = name
  this.score = 0
  this.pending_score  = 0
  this.remaining_dice = default_dice_faces
}

Player.prototype.update_table_with_score = function(){
  console.log(this.pending_score)
  $("#player_" + this.id + "_score").html(this.score)
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

bind_roll_buttons = function(){  
  $("#roll-button").click(function(){
    rolled_dice = roll(current_player.remaining_dice)
    process_rolled_dice(rolled_dice, false)
  });
  $("#re-roll-button").click(function(){
    rolled_dice = roll(current_player.remaining_dice)
    process_rolled_dice(rolled_dice, true)
  });
}

// array_of_faces
roll = function(array_of_faces){
  dice_pool = generate_dice_pool(array_of_faces) //don't generate this everytime
  total     = array_of_faces.length > 5 ? 5 : array_of_faces.length // TODO: Refactor
  
  return dice_pool.sample(total)
}

process_rolled_dice = function(rolled_dice, re_roll){
    var _dice_images     = []
    var _processed_picks = []
    var _score           = 0
    var _remaining_dice  = []
    _dice_frequency = dice_by_frequency(rolled_dice)
    
    for (var i=0; i < rolled_dice.length; i++){
      _pick   = rolled_dice[i]
      _points = _default_points[_pick]
      _partial_results = partial_score(_dice_frequency[_pick], _points.triple, _points.single)
      
      if (_processed_picks.indexOf(_pick) == -1){
        _score += _partial_results.score
        _processed_picks.push(_pick)
      }      
      
      _added_in_score = (_partial_results.triple != 0 || _partial_results.rest != 0)
      if (_added_in_score == false) _remaining_dice.push(_pick)
      // BUG : 4 two's, 4 three's
      _dice_images.push(generate_dice_face(_pick, _added_in_score))
    }

    if (_score > 0) manage_special_buttons("show")

    current_player.pending_score += _score
    current_player.remaining_dice = _remaining_dice

    $("#results").html(_dice_images.join(" "))
    $("#rolled-score").html(_score)
    if (re_roll) {
      $("#pending-score").html(current_player.pending_score)
      if (_score == 0) {
        current_player.pending_score = 0
        change_player()
      }
    }
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
  number_of_players = 2 //10
  //while (number_of_players > 4){
  //  number_of_players = prompt("Greetings! \nPlease enter the number of players. \nMax number is 4", 0)
  //}
  if (number_of_players > 0){
    window.players    = {}
    players_to_html   = []
    data              = {}

    for (var i=1; i<=number_of_players; i++){
      name = "Rz-" + i //prompt("Enter Player " + i + "'s name", "Player " + i)
      players["player_" + i] = new Player(i, name)
      players_to_html.push('<tr>' +
        '<td>' + name + '</td>' +
        '<td id="player_'+ i + '_score">0</td>' +
        '</tr>'
      )
    }
    $("#start-game").hide()
    manage_roll_button("show")
    $(".content").show()
    $("#players").html(players_to_html.join(""))
    // set current player
    set_current_player(players["player_1"])
  }
}

manage_roll_button = function(action){
  if(action == "show"){
    $("#roll-button").show()
  }else{
    $("#roll-button").hide()
  }
}

manage_special_buttons = function(action){
  if(action == "show"){
    $(".special-buttons").show()
    manage_roll_button("hide")
  }else{
    $(".special-buttons").hide()
    manage_roll_button("show")
  }
}

bind_next_player_button = function(){
  $("#next-player-button").click(function(){
    change_player()
  })
}

change_player = function(){  
  // Detect the next player
  next_player = players["player_" + (current_player.id + 1)]
  if (next_player == undefined) next_player = players["player_1"]
  
  current_player.score += current_player.pending_score
  current_player.pending_score = 0
  current_player.remaining_dice = default_dice_faces
  // Update the table containing the scores
  current_player.update_table_with_score()
  // Store the info of the current player into the window.players
  window.players["player_" + current_player.id] = current_player
  
  // Change the current player
  set_current_player(players["player_" + next_player.id])
  // Redraw the divs
  re_draw()
}

// 
set_current_player = function(player){
  window.current_player = player
}

//=======================================================

re_draw = function(){
  $(".rolling-player").html(current_player.name)
  manage_special_buttons("hide")
  $("#rolled-score").html(0)
  $("#pending-score").html(0)
  $("#results").html("")
}

bind_start_game = function(){
  $("#start-game").click(function(){
    collect_players()
    re_draw()
    bind_roll_buttons()
    bind_next_player_button()
  })  
}

$(document).ready(function(){
  bind_start_game()
})
