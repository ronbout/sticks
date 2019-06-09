/* create game class */

class Game {
	constructor() {
		this._currentPlayer = 1;
		this._currentSticks = 20;
		this.mach = new Machine();
		this._players = ['Human', 'Machine'];
	}

	turn(sticks) {
		this._currentSticks -= sticks;

		// change player
		this._currentPlayer = (this._currentPlayer === 1) ? 2 : 1;
	}

	checkWin() {
		if (this._currentSticks === 0) {
			// the player that just moved lost, 
			// so the new current player is the winner
			let winner = this._players[this._currentPlayer - 1];
			console.log(`Winner is ${winner}`);
			// display modal with winner and Play Again button
			$('#winner').text(winner);
			$('#modal-layer').css('display', 'flex');
			return true;
		}
		return false;
	}

	reset() {
		this._currentPlayer = 1;
		this._currentSticks = 20;
	}

	getCurrentSticks() {
		return this._currentSticks;
	}

	getCurrentPlayer() {
		return this._currentPlayer;
	}
}


class Machine {
	playTurn(sticks) {
		/* Dumb mach will  rand pick 1-3 (or #sticks) */

		// choose random #
		let maxSticks = Math.min(3, sticks);
		let sticksChosen = Math.floor(Math.random() * maxSticks) + 1;

		return sticksChosen;
	}
}

$(document).ready(function ($) {
	var game = new Game();

	var pickSticks = $('#pick-sticks');
	var pickBtn = $('#pickup-btn');
	var remainSticks = $('#remain');
	var currentPlayer = $('#current');
	var msg = $('#msg');
	var welcome = 'Welcome to the Sticks Game<br>To begin play, select # sticks for Player 1';

	pickBtn.click(function () {
		game.turn(pickSticks.val());

		if (!game.checkWin()) {
			// game not over so perform machine turn
			pickSticks.prop('disabled', true);
			pickBtn.prop('disabled', true);

			let machSticks = game.mach.playTurn(game.getCurrentSticks());
			game.turn(machSticks);

			if (!game.checkWin()) {
				let displayMsg = `Computer chose ${machSticks} sticks.<br>Select # sticks for Player 1 (human)`;
				pickSticks.prop('max', Math.min(3, game.getCurrentSticks()));
				displayResults(displayMsg);
				pickSticks.prop('disabled', false);
				pickBtn.prop('disabled', false);
			}

		}

	});

	$('#close-modal').click(function () {
		$('#modal-layer').css('display', 'none');
		game.reset();
		pickSticks.prop('disabled', false);
		pickBtn.prop('disabled', false);
		msg.html(welcome);
		displayResults();
	})

	function displayResults(displayMsg) {
		remainSticks.text(game.getCurrentSticks());
		pickSticks.val(1);
		currentPlayer.text(game.getCurrentPlayer());
		msg.html(displayMsg);
	}
});