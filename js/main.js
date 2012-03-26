// How many rounds were played
var round = 1
var active_animation = false

// Tresholds
var final_score_treshold = 3000 // End game score
var first_roll_treshold  = 300 // First roll score limit

var players        = []
var current_player = null
var winner         = null
var tie_players    = []

var _default_points = {
  "1": {"triple":1000, "single":100},
  "2": {"triple":200,  "single":0},
  "3": {"triple":300,  "single":0},
  "4": {"triple":400,  "single":0},
  "5": {"triple":500,  "single":50},
  "6": {"triple":600,  "single":0},
}

var dice_faces = [1, 2, 3, 4, 5, 6]

function Player(id, name){
  this.id    = id
  this.name  = name
  this.score = 0
  this.pending_score         = 0
  this.remaining_dice_number = 5 // default
}

Player.prototype.update_table_with_score = function(){
  $("#player_" + this.id + "_score").html(this.score)
}

// TODO: xyz
roll = function(number_of_dice){
  return dice_faces.multiply(number_of_dice).sample(number_of_dice)
}

process_rolled_dice = function(rolled_dice, re_roll){
  var _dice_images     = []
  var _processed_picks = []
  //var _colored_dice    = {}
  var _score           = 0
  var _remaining_dice_number  = 0
  _dice_frequency = rolled_dice.to_frequency()

  for (var i=0; i < rolled_dice.length; i++){
    _pick   = rolled_dice[i]
    _points = _default_points[_pick]
    _partial_results = partial_score(_dice_frequency[_pick.toString()], _points.triple, _points.single)

    if (_processed_picks.indexOf(_pick) == -1){
      _score += _partial_results.score
      _processed_picks.push(_pick)
    }
    
     
    _should_color = (_partial_results.triple != 0 || _partial_results.rest != 0)
    if (_should_color == false) _remaining_dice_number++
    // if (_should_color){
      // if (_colored_dice[_pick.toString()] == undefined){
        // //console.log(_pick + " does not exist")
        // _colored_dice[_pick.toString()] = 1
      // }else{
        // //console.log("~" + _colored_dice[_pick.toString()])
        // //console.log("~" + _dice_frequency[_pick.toString()])
        // if (_colored_dice[_pick.toString()] == _dice_frequency[_pick.toString()]){
          // //console.log(_pick + " EQL")
          // _should_color = false
        // }else{
          // ///console.log(_pick + " Increment")
          // _colored_dice[_pick.toString()]++
        // }
      // }
    // } else {
      // console.log("WTF")
      // _remaining_dice_number++
    // }
    // console.log("-------------")
    // BUG : 4 two's, 4 three's
    _dice_images.push(generate_dice_face(_pick, _should_color))
  }

  if (_score > 0) manage_special_buttons("show")
  
  current_player.pending_score += _score
  current_player.remaining_dice_number = _remaining_dice_number
  
  $("#results").html(_dice_images.join(" "))
  $("#rolled-score").html(_score)
  
  if (re_roll) {
    $("#pending-score").html(current_player.pending_score)
    if (_score == 0) {
      $(".zero-score-message").show()
      current_player.pending_score = 0
      setTimeout(change_player, 3000);
    }
  }
}

generate_dice_face = function(face_number, scoring_face){
  result = '<p class="single_dice face_' + face_number + '"/>'
  if (scoring_face){
    result = '<div class="dice scoring">' + result + '</div>'
  }

  return result
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
    $(".playground").show()
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

change_player = function(){
  // Don't count the score if it's less than 300. This applies to the players with their score = 0
  // Before starting to sum the scores a score of 300 in a single turn is required
  if (current_player.score == 0 && current_player.pending_score < first_roll_treshold){
    current_player.pending_score = 0
  }
  current_player.score += current_player.pending_score // add the pending score to the current score
  current_player.pending_score         = 0   // reset the pending score
  current_player.remaining_dice_number = 5  // default the number of dice
  current_player.update_table_with_score() // Update the table containing the scores
  
  // Store the info of the current player into the window.players hash.
  window.players["player_" + current_player.id] = current_player
  
  // Detect the next player
  next_player = players["player_" + (current_player.id + 1)]
  if (next_player == undefined){
    change_round()
  }else{
    set_current_player(players["player_" + next_player.id])
    re_draw() // Redraw the playing board
  }
}

change_round = function(){
  game_status = check_if_game_ended()
  switch(game_status){
    case false:
      // Change the current player
      set_current_player(players["player_1"])
      round++
      if (active_animation) { setTimeout(play_round_fight_animation, 500) }
      re_draw()
    break;
    case true:
      announce_winner()
    break;
    case "tie":
      console.log("TIE")
    break;
  }
}

// TODO: Comment
set_current_player = function(player){
  window.current_player = player
}

announce_winner = function(){
  $(".playing-board").hide()
  $(".winner").html("<h3>Congratulations " + winner.name + "! You won with " + winner.score + " points.</h3>")
  $(".winner").show()
}

//=======================================================

// Redraw the playing board
re_draw = function(){
  manage_special_buttons("hide") // hide the re-roll & next_player buttons and show the roll one.
  $(".round").html(round) // update the round
  $(".rolling-player").html(current_player.name) // update the current rolling player
  $("#rolled-score").html(0)   // reset the score
  $("#pending-score").html(0) // reset the pending score
  $("#results").html("")     // clean the previous dice results
  $(".zero-score-message").hide()
}

play_round_fight_animation = function(){
  $(".round").html(round)
  $(".overlay").show();
  $("#round-number").fadeIn(3000, function(){
    $("#round-number").hide()
    $("#fight-animation").fadeIn(3000, function(){
      $("#fight-animation").hide();
      $(".overlay").fadeOut(1000);
    });
  })
}

/*
 * Return options: true, false, "tie"
 */
check_if_game_ended = function(){
  tie_players = []
  for (var player in players){
    if (players[player].score > final_score_treshold) { tie_players.push(players[player]) }
  }

  if (tie_players.length > 1){
    return "tie"
  }else{
    if (tie_players.length == 1){
      winner = tie_players[0]
      return true
    }else{
      return false
    }
  }
}

bind_roll_buttons = function(){
  $("#roll-button, #re-roll-button").click(function(){
    rolled_dice = roll(current_player.remaining_dice_number)
    process_rolled_dice(rolled_dice, this.id == "re-roll-button")
  });
  
  $("#next-player-button").click(function(){
    change_player()
  });
}

bind_start_game = function(){
  $("#start-game").click(function(){
    collect_players()
    if (active_animation) { setTimeout(play_round_fight_animation, 500) }
    re_draw()
    bind_roll_buttons()
  })
}

$(document).ready(function(){
  bind_start_game()
})
