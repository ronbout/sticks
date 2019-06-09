/* create game class */

class Game {
	constructor(aiArray) {
		this._currentPlayer = 1;
		this._currentSticks = 20;
		this.machines = [new Machine(aiArray),
		new Machine(aiArray)];
	}

	turn(sticks) {
		this._currentSticks -= sticks;

		// change player
		this._currentPlayer = (this._currentPlayer === 1) ? 2 : 1;
	}

	playGame() {
		let gameOver = false;
		let sticksPicked;

		while (!gameOver) {
			sticksPicked = this.machines[this._currentPlayer - 1].playTurn(this._currentSticks);
			/* 			console.log('Player' + this._currentPlayer);
						console.log('sticks left: ' + this._currentSticks);
						console.log('Picked sticks: ' + sticksPicked); */

			this.turn(sticksPicked);
			gameOver = this.checkWin();
		}
	}

	checkWin() {
		if (this._currentSticks === 0) {
			// the player that just moved lost, 
			// so the new current player is the winner

			// Winning machine needs to update stored ai array
			let newAiArray = this.machines[this._currentPlayer - 1].updateAiArray();
			let otherPlayer = (this._currentPlayer === 1) ? 2 : 1;
			this.machines[otherPlayer - 1].setAiArray(newAiArray);
			return true;
		}
		return false;
	}

	reset() {
		this._currentPlayer = 1;
		this._currentSticks = 20;

		this.machines[0].resetTempAi();
		this.machines[1].resetTempAi();
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
			// randomly choose one of the suggested moves, which are
			// weighted towards winning moves
			sticksChosen = suggMovesArray[getRand(0, suggMovesArray.length - 1)];
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

	updateAiArray() {
		// the machine won and needs to update the ai array and 
		// write the file using the write_ai.php program
		this.tempArray.forEach(function (moves, ndx) {
			if (this.aiArray[ndx]) {
				this.aiArray[ndx] += ',' + moves;
			} else {
				this.aiArray[ndx] = moves;
			}
		}, this);

		return this.aiArray;
	}

	writeAiArray() {
		// now that the ai array has been updated, 
		// write the file using the php write_ai.php
		// run jquery to get ai array 
		$.ajax({
			url: 'php/write_ai.php',
			dataType: 'text',
			method: 'POST',
			data: { moves: this.aiArray },
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

	getAiArray() {
		return this.aiArray;
	}

	setAiArray(aiArray) {
		this.aiArray = aiArray;
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
			aiArray = response.data;
			game = new Game(aiArray);

			var playBtn = $('#play-games-btn');
			var msg = $('#msg');
			var welcome = `Welcome to the Sticks Game<br>AI will play AI to learn the game<br>
				Choose how many games to play (100-1000)`;

			msg.html(welcome);
			playBtn.prop('disabled', false);

			playBtn.click(function () {
				let gameCnt = parseInt($('#play-games-cnt').val());
				var $currentCnt = $('#current-game-cnt');
				var $modal = $('#modal-layer');
				$modal.css('display', 'flex');

				var intId = setInterval(function () {
					if ($modal.css('display') == 'flex') {
						clearInterval(intId);
/* 						for (let i = 0; i < gameCnt; i++) {
							game.playGame();
							game.reset();
							if (i % 100 === 0) {
								$currentCnt.html(i);
							}
						} */

						var i = 0;
						var dispInt = 100;
						(function playGames() {
							for (let j=0; j < dispInt; j++) {
								// console.log('i: ' + i);
								// console.log('gameCnt: ' + gameCnt);
								if (++i === gameCnt) {
									break;
								}
								game.playGame();
								game.reset();
							}
							//console.log(i + ' games played');
							$currentCnt.html(i + ' of ' + gameCnt + ' games played');
							if (i < gameCnt) {
								setTimeout(playGames, 1);
							} else {
								// put the write command here instead of after every game
								// otherwise, just too much writing and ajax calls
								game.machines[0].writeAiArray();
								game.machines[1].writeAiArray();
								$modal.hide();
							}
						})();
					}
				}, 5);
			});

		},
		error: function (xhr, status, errorThrown) {
			alert('Unable to load ai array');
			console.log(errorThrown);
		}
	});


});