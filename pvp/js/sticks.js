/* create game class */

class Game {
	constructor() {
		this.currentPlayer = 1;
		this.currentSticks = 20;
	}

	turn(sticks) {
		console.log(sticks);
		this.currentSticks -= sticks;

		// change player
		this.currentPlayer = (this.currentPlayer === 1) ? 2 : 1;

		if (this.currentSticks === 0) {
			// the player that just moved lost, 
			// so the new current player is the winner
			let winner = this.currentPlayer;
			console.log( `Winner is ${winner}`);
			// display modal with winner and Play Again button
			$('#winner').text(winner);
			$('#modal-layer').css('display', 'flex');
		}

	}

	reset() {
		this.currentPlayer = 1;
		this.currentSticks = 20;
	}
}

$(document).ready(function ($) {
	var game = new Game();

	var pickSticks = $('#pick-sticks');
	var remainSticks = $('#remain');
	var currentPlayer = $('#current');
	var msg = $('#msg');

	$('#pickup-btn').click(function () {
		game.turn(pickSticks.val());
		
		// display new results
		msg.html(`Welcome to the Sticks Game<br>To begin play, select # sticks for Player 1`);
		displayResults();
	});

	$('#close-modal').click(function() {
		$('#modal-layer').css('display', 'none');
		game.reset();
		displayResults();
	})

	function displayResults() {
		remainSticks.text(game.currentSticks);
		pickSticks.prop('max', Math.min(3, game.currentSticks));
		pickSticks.val(1);
		currentPlayer.text(game.currentPlayer);
		msg.html(`Continue Play<br>Select # sticks for Player ${game.currentPlayer}`);
	}
});