/* create game class */

class Game {
	constructor(aiArray) {
		this._currentPlayer = 1;
		this._currentSticks = 20;
		this.mach = new Machine(aiArray);
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

			// if machine won, add learning to ai array
			if (this._currentPlayer === 2) {
				this.mach.updateAi();
			}
			return true;
		}
		return false;
	}

	reset() {
		this._currentPlayer = 1;
		this._currentSticks = 20;
		this.mach.resetTempAi();
	}

	getCurrentSticks() {
		return this._currentSticks;
	}

	getCurrentPlayer() {
		return this._currentPlayer;
	}
}


class Machine {
	constructor(aiArray) {
		console.log('this array: ');
		console.log(aiArray);
		this.aiArray = aiArray;
		this.tempArray = [];
	}

	playTurn(sticks) {
		/* Use array to pick random number, but based on 
		   previous winning entries (after original seed #'s) */
		let sticksChosen;
		if (this.aiArray) {
			// split comma separated list of moves into array
			let suggMovesArray = this.aiArray[sticks - 1].split(',');
			console.log(suggMovesArray);
			// randomly choose one of the suggested moves, which are
			// weighted towards winning moves
			sticksChosen = suggMovesArray[getRand(0, suggMovesArray.length - 1)]
		} else {
			// choose random #
			let maxSticks = Math.min(3, sticks);
			sticksChosen = getRand(1, maxSticks);
		}

		// update the temp ai array to contain the moves for this game only
		// if the machine wins, these moves will be added to the main ai array
		this.tempArray[sticks - 1] = sticksChosen;

		return sticksChosen;
	}

	updateAi() {
		// the machine won and needs to update the ai array and 
		// write the file using the write_ai.php program
		this.tempArray.forEach(function (moves, ndx) {
			if (this.aiArray[ndx]) {
				this.aiArray[ndx] += ',' + moves;
			} else {
				this.aiArray[ndx] = moves;
			}
		}, this);

		// now that the ai array has been updated, 
		// write the file using the php write_ai.php
		// run jquery to get ai array 
		$.ajax({
			url: 'php/write_ai.php',
			dataType: 'text',
			method: 'POST',
			data: {moves : this.aiArray},
			success: function (response) {
				// might return a code from program to 
				// indicate whether all went well
				/******** check for ok code vs error writing code */
				console.log(response);

			},
			error: function (xhr, status, errorThrown) {
				alert('Unable to write ai array');
				console.log(errorThrown);
			}
		});

	}

	resetTempAi() {
		this.tempArray = [];
	}
}

function getRand(start, end) {
	if (end < start) return false;
	return Math.floor(Math.random() * (end - start + 1) + start)
}

$(document).ready(function ($) {
	var aiArray;
	var game;

	// run jquery to get ai array 
	$.ajax({
		url: 'php/get_ai.php',
		dataType: 'json',
		success: function (response) {
			console.log(response);
			aiArray = response.data;
			var game = new Game(aiArray);

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
				pickSticks.prop('max', 3);
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
		},
		error: function (xhr, status, errorThrown) {
			alert('Unable to load ai array');
			console.log(errorThrown);
		}
	});


});