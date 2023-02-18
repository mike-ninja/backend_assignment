/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   index.js                                           :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: mbarutel <mbarutel@student.hive.fi>        +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2023/02/15 14:24:10 by mbarutel          #+#    #+#             */
/*   Updated: 2023/02/16 21:54:40y mbarutel         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

const express = require('express');
const bodyParser = require('body-parser');
const uuid = require('uuid');
const app = express();
const PORT = 8080;

app.use(bodyParser.text());

const games = [];

function createNewGame(board) {
  const game = {
    id: uuid.v4(), // Generate a new UUID for the game ID
    board: board, // Set the initial game board to a string of hyphens
    status: "RUNNING", // Set the initial game status to "in_progress"
	champ: '-', // This is whether computer is X or O
	enemy: '-'
  };

  return game;
}

//-------------------------------------------------------------------------------------------------------------
class Move
{
    constructor()
    {
        let row, col;
    }
}

function isMovesLeft(board)
{
    for(let i = 0; i < 3; i++)
        for(let j = 0; j < 3; j++)
            if (board[i][j] == '-')
                return true;
    return false;
}
 
function evaluate(b, game)
{
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
    if (b[0][0] == b[1][1] && b[1][1] == b[2][2])
    {
        if (b[0][0] == game.champ)
            return +1;
             
        else if (b[0][0] == game.enemy)
            return -1;
    }
  
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

function check_enemy_move(board, game)
{
    for(let i = 0; i < 3; i++)
    {
        for(let j = 0; j < 3; j++)
        {     
            if (board[i][j] == '-')
            {
                board[i][j] = game.enemy;
                let best = evaluate(board, game);
                board[i][j] = '-';
                if (best == 1 || best == -1)
                    return best;
            }
        }
    }
    return 0;
}

function update_game_status(board, game, move)
{
	board[move.row][move.col] = game.champ;
	let ret = evaluate(board, game);
	if (ret == 1)
		game.status = `${game.champ}_WON`;
	else if (ret == -1)
		game.status = `${game.enemy}_WON`;
	else if (ret == 0 && !isMovesLeft)
		game.status = "DRAW";

}
 
function findBestMove(board, game)
{ 
    let bestVal = -1;
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
		return ;
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
	update_game_status(board, game, best_move);
    return best_move;
}

//-------------------------------------------------------------------------------------------------------------

function get_moves(board, board_param)
{
	var moves = 0;
	var row = 0;
	var col = 0;
	
	
	for (let i = 0; i < board.length; i++) 
	{
		const char = board.charAt(i);
		if (board_param)
		{
			if (i)
			{
				row = Math.floor(i / 3);
				col = i % 3;
			}
			const char = board.charAt(i);
			board_param[row][col] = char;
		}
		if (char == 'X' || char == 'O')
			++moves;
	}
	return moves;
}

function validate_board(board, board_param, game)
{
	var 	row = 0;
	var 	col = 0;
	
	if (typeof board !== 'string' || board.length !== 9 || get_moves(board) > 1)
		return false;
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
		game.champ = 'X';
		game.enemy = 'O';
	}
	return 0;
}

function validate_move(old_board, new_board, board_param)
{
	const old_board_moves = get_moves(old_board, 0);
	const new_board_moves = get_moves(new_board, board_param);
	
	if (new_board_moves - old_board_moves != 1)
		return false;
	else
		return true;
}

//-------------------------------------------------------------------------------------------------------------

function start_game(game, board_param)
{
	games.push(game);
	let best_move = findBestMove(board_param, game);
	let index = (best_move.row) * 3 + (best_move.col);
	let arr = game.board.split("");
	arr[index] = game.champ;
	game.board = arr.join("");
}

app.get('/', (req, res) => {
	const message = "Welcome to mbarutel's Tic Tac Toe server!"; // Greeting message
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
		const game_array = games.map(obj => {
			return { id: obj.id, board: obj.board, status: obj.status }
		});
		if (!game_array)
			res.status(404).send({ message: "resource not found." });
		else
			res.status(200).send({ game_array });
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
	else if (!validate_move(game.board, board, board_param))
		res.status(400).send({ reason: "bad request."});
	else
	{
		if (game.status == "RUNNING")
		{
			let best_move = findBestMove(board_param, game);
			if (game.status == "RUNNING" || game.status == `${game.champ}_WON`)
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

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send("Internal server error");
});

app.listen(PORT, () => {console.log(`Server is alive on http://localhost:${PORT}`)});