/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   index.js                                           :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: mbarutel <mbarutel@student.hive.fi>        +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2023/02/15 14:24:10 by mbarutel          #+#    #+#             */
/*   Updated: 2023/02/20 11:07:17 by mbarutel         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

const express = require('express');
const bodyParser = require('body-parser');
const uuid = require('uuid');
const app = express();
const PORT = 8080;

app.use(bodyParser.text());

const games = []; // Array of games

/**
 * Creates a new game object.
 * 
 * @param board - board from request
 * @returns The new game object.
 */
function createNewGame(board) {
  const game = {
    id: uuid.v4(),
    board: board,
    status: "RUNNING",
	champ: '-',
	enemy: '-',
	first_move: false
  };
  return game;
}

/* A Move object has a row and a column. */
class Move
{
    constructor()
    {
        let row;
		let col;
    }
}

/*								Algorithm								 */

/**
 * If there is a move left, return true, else return false
 * 
 * @param board - The current state of the board.
 * @returns true if there are moves left, false otherwise
 */
function isMovesLeft(board)
{
    for(let i = 0; i < 3; i++)
	{
		for(let j = 0; j < 3; j++)
		{
			if (board[i][j] == '-')
			return true;
		}
	}
    return false;
}
 
/**
 * It checks if the game has been won by the champion or the enemy
 * 
 * @param b - The board
 * @param game - The game object
 * @returns 0 if no winner, +1 if champ won, -1 if enemy won.
 */
function evaluate(b, game)
{
	// Checking horizontally
    for(let row = 0; row < 3; row++)
    {
        if (b[row][0] == b[row][1] &&
            b[row][1] == b[row][2])
        {
            if (b[row][0] == game.champ)
                return +1;
                 
            else if (b[row][0] == game.enemy)
                return -1;
        }
    }
	// Checking vertically
    for(let col = 0; col < 3; col++)
    {
        if (b[0][col] == b[1][col] &&
            b[1][col] == b[2][col])
        {
            if (b[0][col] == game.champ)
                return +1;
  
            else if (b[0][col] == game.enemy)
                return -1;
        }
    }
	// Checking diagonally left to right
	if (b[0][0] == b[1][1] && b[1][1] == b[2][2])
    {
        if (b[0][0] == game.champ)
            return +1;
             
        else if (b[0][0] == game.enemy)
            return -1;
    }
	// Checking diagonally right to left
    if (b[0][2] == b[1][1] &&
        b[1][1] == b[2][0])
    {
        if (b[0][2] == game.champ)
            return +1;
             
        else if (b[0][2] == game.enemy)
            return -1;
    }
    return 0;
}

/**
 * It checks if the enemy can win in the next move.
 * @param board - The current state of the board.
 * @param game - The game object
 * @returns The best move for the enemy.
 */
function check_enemy_move(board, game)
{
	let lowest_val = 0;
    for(let i = 0; i < 3; i++)
    {
        for(let j = 0; j < 3; j++)
        {     
            if (board[i][j] == '-')
            {
                board[i][j] = game.enemy;
                let best = evaluate(board, game);
                board[i][j] = '-';
				if (best < lowest_val)
					lowest_val = best;
            }
        }
    }
    return lowest_val;
}

/**
 * It updates the game status based on the current board and the move made.
 * 
 * @param board - The current state of the board.
 * @param game - This is the game object.
 * @param move - The move that the player has made.
 */
function update_game_status(board, game, move)
{
	board[move.row][move.col] = game.champ;
	let ret = evaluate(board, game);
	console.log(`ret ${ret} pos ${board[move.row][move.col]} row ${move.row} col ${move.col}`);
	console.log(`board ${board}`);
	if (ret == 1)
		game.status = `${game.champ}_WON`;
	else if (ret == -1)
		game.status = `${game.enemy}_WON`;
	else if (ret == 0 && !isMovesLeft(board))
		game.status = "DRAW";
}

/**
 * It generates a random number between 0 and 2, and then checks if the board at that position is
 * empty. If it is, it returns the move. If it isn't, it generates another random number and checks
 * again
 * @param board - a 2D array of the current state of the board.
 * @param move - This is the move object that you'll be returning. It has two properties: row and col.
 * @returns The move object is being returned.
 */
function random_move(board, move)
{
	const max = 2;
	const min = 0;
	while (true)
	{
		let rand_row = Math.floor(Math.random() * (max - min + 1)) + min;
		let rand_col = Math.floor(Math.random() * (max - min + 1)) + min;
		console.log(`row ${rand_row} col ${rand_col}`);
		if (board[rand_row][rand_col] == '-')
		{
			move.row = rand_row;
			move.col = rand_col;
			return (move);
		}
	}
}
 
/**
 * It checks if the game is over, if not, it checks all the possible moves and returns the best move.
 * Will priotitize getting a move value of either +1 or 0 whilst avoiding -1.
 * 
 * @param board - The current state of the board.
 * @param game - The game object
 * @returns The best move for the AI to make.
 */
function findBestMove(board, game)
{ 
    let bestVal = -1;
	let	randomizer = true;
    let best_move = new Move();

	best_move.row = -1;
    best_move.col = -1;
	if (!isMovesLeft(board))
	{
		let ret = evaluate(board, game);
		if (ret == 1)
			game.status = `${game.champ}_WON`;
		else if (ret == -1)
			game.status = `${game.enemy}_WON`;
		else if (ret == 0)
			game.status = "DRAW";
		return (best_move);
	}
    for(let i = 0; i < 3; i++)
    {
        for(let j = 0; j < 3; j++)
        {
            if (board[i][j] == '-')
            {
				board[i][j] = game.champ;
				let ret = evaluate(board, game);
				if (ret == 1)
				{
					best_move.row = i;
					best_move.col = j;
					update_game_status(board, game, best_move);
					return (best_move);
				}
                let moveVal = check_enemy_move(board, game);
				if (moveVal == -1)
					randomizer = false;
                if (moveVal >= bestVal)
                {
					bestVal = moveVal;
                    best_move.row = i;
                    best_move.col = j;
                }
				board[i][j] = '-';
            }
        }
    }
	if (randomizer)
		best_move = random_move(board, best_move);
	update_game_status(board, game, best_move);
    return (best_move);
}

/*								UTILS								 */

/**
 * Checks the board and returns the number of moves that have been made.
 * 
 * @param board - The current state of the game board.
 * @param board_param - This is a 2D array that will be used to store the board.
 * @returns The number of moves made on the board.
 */
function get_moves(board)
{
	var moves = 0;
	
	for (let i = 0; i < board.length; i++) 
	{
		const char = board.charAt(i);
		if (char == 'X' || char == 'O')
			++moves;
	}	return moves;
}

/**
 * It takes a string, checks if it's a valid board, and if it is, it returns 0, 
 * otherwise it returns an error message. At the same time it populates board_param.
 * 
 * @param board - The current state of the board.
 * @param board_param - The current board state in a 2D array
 * @param game - This is the object that contains the game state.
 * @returns 0 is the board is valid. Otherwise, return an error message.
 */
function validate_board(board, board_param, game)
{
	var 	row = 0;
	var 	col = 0;
	
	if (typeof board !== 'string' || board.length !== 9 || get_moves(board) > 1)
	{
		let err_msg = `board is in incorrect format`;
		return (err_msg); 
	}
	for (let i = 0; i < board.length; i++) 
	{
		if (i)
		{
			row = Math.floor(i / 3);
			col = i % 3;
		}
		const char = board.charAt(i);
		board_param[row][col] = char;
		if ((char == 'O' || char == 'X') && game.champ == '-')
		{
			game.enemy = char;
			if (char == 'X')
				game.champ = 'O';
			else
				game.champ = 'X';
		}
		if (char != 'X' && char != 'O' && char != '-')
		{
			let err_msg = `Incorrect character -> ${char}`;
			return (err_msg); 
		}
	}
	if (game.champ == '-' && game.enemy == '-')
	{
		game.first_move = true;
		game.champ = 'X';
		game.enemy = 'O';
	}
	return 0;
}

/**
 * It checks if the number of moves in the new board is one more 
 * than the number of moves in the old board.
 * 
 * @param old_board - The board before the move was made.
 * @param new_board - The board after the move has been made.
 * @param board_param - The current board state in a 2D array
 * @returns true if valid amount of moves were made, false otherwise.
 */
function validate_move(new_board, board_param, game)
{
	let		row = 0;
	let		col = 0;
	let		champ_moves = 0;
	let		enemy_moves = 0;
	
	if (typeof new_board !== 'string' || new_board.length !== 9)
	{
		let err_msg = `board is in incorrect format`;
		return (err_msg); 
	}
	for (let i = 0; i < new_board.length; i++) 
	{
		const char = new_board.charAt(i);
		if (i)
		{
			row = Math.floor(i / 3);
			col = i % 3;
		}
		board_param[row][col] = char;
		if (char == game.champ)
			champ_moves++;
		else if (char == game.enemy)
			enemy_moves++;
		if (char != 'X' && char != 'O' && char != '-')
		{
			let err_msg = `Incorrect character -> ${char}`;
			return (err_msg); 
		}
	}
	if (game.first_move && enemy_moves == champ_moves)
		return (0);
	else if (!game.first_move && (enemy_moves - champ_moves) == 1)
		return (0);
	else
	{
		let err_msg = `Incorrect moves`;
		return (err_msg); 
	}
}

/**
 * Push game object into array, find the best move, and then updates the board with
 * the best move.
 * 
 * @param game - The game object that contains the board
 * @param board_param - The current board state in a 2D array
 */
function start_game(game, board_param)
{
	games.push(game);
	let best_move = findBestMove(board_param, game);
	let index = (best_move.row) * 3 + (best_move.col);
	console.log(`index ${index} champ ${game.champ}`);
	let arr = game.board.split("");
	arr[index] = game.champ;
	game.board = arr.join("");
	console.log(`row ${game.board}`);
}

/*								Endpoint Handlers						 */

app.get('/', (req, res) => {
	const message = "Welcome to mbarutel's Tic Tac Toe server!";
	res.setHeader('Content-Type', 'text/plain');
	res.end(message);
	res.status(200);
});

app.get('/api/v1/games', (req, res) => {

	if (!games)
		res.status(404).send({ message: "resource not found." });
	else
	{
		const game_array = games.map(obj => {
			return { id: obj.id, board: obj.board, status: obj.status }
		});
		if (!game_array)
			res.status(400).send({ message: "Bad request." });
		else
			res.status(200).send({ game_array });
	}
});

app.post('/api/v1/games', (req, res) => {
	const	board = req.body
	let 	board_param = [ [ '-', '-', '-' ],
							[ '-', '-', '-' ],
							[ '-', '-', '-' ] ];
	

	if (!board)	
		res.status(400).send({ reason: "game can't start without a board."});
	const new_game = createNewGame(board);
	const err_msg = validate_board(board, board_param, new_game);	
	if (err_msg)
		res.status(400).send({ reason: `${err_msg}`});
	else if (!new_game)
		res.status(404).send({ reason: "resource not found."});
	else
	{
		start_game(new_game, board_param);	
		res.status(201).send({ location: new_game.id, board: new_game.board });
	}
});

app.get('/api/v1/games/:id', (req, res) =>
{
	const id = req.params.id;
	const game = games.find(game => game.id === id);
	
	if (!id)
		res.status(400).send({ reason: "bad request."});
	else if (!game)
		res.status(404).send({ reason: "resource not found."});
	else
	{
		res.status(200).send({
			id: game.id,
			board: game.board,
			status: game.status
		});
	}
});

app.put('/api/v1/games/:id', (req, res) =>
{
	var 	game;
	const 	board = req.body;
	const 	id = req.params.id;
	let 	board_param = [ [ '-', '-', '-' ],
							[ '-', '-', '-' ],
							[ '-', '-', '-' ] ];

	if (!board || !id)
		res.status(400).send({ reason: "bad request."});
	game = games.find(game => game.id === id);
	if (!game)
		res.status(404).send({ reason: "resource not found."});
	let err_msg = validate_move(board, board_param, game);
	if (game.status == "RUNNING" && err_msg)
	{
		res.status(400).send({ 
			reason: "bad request.",
			message: `${err_msg}`
		});
	}
	else
	{
		if (game.status == "RUNNING")
		{
			let best_move = findBestMove(board_param, game);
			if (game.status == "RUNNING" || game.status == `${game.champ}_WON` 
			|| (game.status == "DRAW" && best_move.row != -1 && best_move.col != -1))
			{
				let index = (best_move.row) * 3 + (best_move.col);
				let arr = board.split("");
				arr[index] = game.champ;
				game.board = arr.join("");
			}
			else
				game.board = board;
			console.log(`${game.board} row ${best_move.row} col ${best_move.col}`);
		}
		res.status(200).send({ 
			id: game.id, 
			board: game.board, 
			status: game.status
		});
	}
});

app.delete('/api/v1/games/:id', (req, res) =>
{
	var 	game;
	const 	id = req.params.id;

	if (!id)
		res.status(400).send({ reason: "bad request."});
	game = games.find(game => game.id === id);
	if (!game)
		res.status(404).send({ reason: "resource not found."});
	else
	{
		const	id_to_delete = game.id;
		const	index_to_delete = games.findIndex(obj => obj.id == id_to_delete);

		if (index_to_delete > -1)
			games.splice(index_to_delete, 1);
		res.status(200).send({ 
			message: "Game succesfully deleted"
		});
	}
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send("Internal server error");
});

app.listen(PORT, () => {console.log(`Server is alive on http://localhost:${PORT}`)});