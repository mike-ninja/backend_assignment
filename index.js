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
		game.status = `DRAW`;

}
 
function findBestMove(board, game)
{ 
    let bestVal = -1;
    let bestMove = new Move();
    bestMove.row = -1;
    bestMove.col = -1;

	if (!isMovesLeft(board))
	{
		let ret = evaluate(board, game);
		if (ret == 1)
			game.status = `${game.champ}_WON`;
		else if (ret == -1)
			game.status = `${game.enemy}_WON`;
		else if (ret == 0)
			game.status = `DRAW`;
		return ;
	}
    console.log(`${board}`);
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
					bestMove.row = i;
					bestMove.col = j;
					update_game_status(board, game, bestMove);
					return (bestMove);
				}
                let moveVal = check_enemy_move(board, game);
                if (moveVal >= bestVal)
                {
					bestVal = moveVal;
					console.log(`moveVal ${moveVal}`);
                    bestMove.row = i;
                    bestMove.col = j;
                }
				board[i][j] = '-';
            }
        }
    }
	update_game_status(board, game, bestMove);
    return bestMove;
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
	var row = 0;
	var col = 0;
	
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
			return false;
	}
	if (game.champ == '-' && game.enemy == '-')
	{
		game.champ = 'X';
		game.enemy = 'O';
	}
	return true;
}

function validate_move(old_board, new_board, board_param)
{
	const old_board_moves = get_moves(old_board, board_param);
	const new_board_moves = get_moves(new_board, board_param);
	
	if (new_board_moves - old_board_moves != 1)
		return false;
	else
		return true;
}

//-------------------------------------------------------------------------------------------------------------

app.get('/', (req, res) => {
	const message = 'Welcome to my Tic Tac Toe server!'; // Greeting message
	res.setHeader('Content-Type', 'text/plain');
	res.end(message);
});

app.get('/api/v1/games', (req, res) => {
	res.status(200).send({
        message: "Active Games",
        games: games
    });
});

app.post('/api/v1/games', (req, res) => {
	
	const board = req.body
	const new_game = createNewGame(board);
	let board_param = [ [ '-', '-', '-' ],
						[ '-', '-', '-' ],
						[ '-', '-', '-' ] ];
	
	if (!board || !validate_board(board, board_param, new_game) || !new_game)
		res.status(400).send({ message: 'New game not created.'});
	else
	{
		games.push(new_game);
		let bestMove = findBestMove(board_param, new_game);
		var index = (bestMove.row) * 3 + (bestMove.col);
		let str = new_game.board;
		let arr = str.split("");
		arr[index] = new_game.champ;
		str = arr.join("");
		new_game.board = str;
		res.status(200).send({
		new_game: `Game at http://localhost:${PORT}/api/v1/games/${new_game.id}`,
		board: `Board status [${new_game.board}]`,
		});
	}
});

app.get('/api/v1/games/:id', (req, res) =>
{
	const id = req.params.id;
	const game = games.find(game => game.id === id);
	
	if (!game)
		res.end(`Game ID [/${id}] doesn't exist`);
	else
		res.status(200).send(games);
});

app.put('/api/v1/games/:id', (req, res) =>
{
	const board = req.body;
	const id = req.params.id;
	const game = games.find(game => game.id === id);
	let board_param = [ [ '-', '-', '-' ],
						[ '-', '-', '-' ],
						[ '-', '-', '-' ] ];
	if (!game)
		res.end(`Game ID [/${id}] doesn't exist`);
	else if (!validate_move(game.board, board, board_param))
		res.end(`Invalid move`);
	else
	{
		if (game.status == "RUNNING")
		{
			let bestMove = findBestMove(board_param, game);
			if (game.status == "RUNNING" || game.status == `${game.champ}_WON`)
			{
				var index = (bestMove.row) * 3 + (bestMove.col);
				let str = board;
				let arr = str.split("");
				arr[index] = game.champ;
				str = arr.join("");
				game.board = str;
			}
			else
				game.board = board;
		}
		res.status(200).send(game);
	}
});

app.listen(
	PORT,
	() => console.log(`Server is alive on http://localhost:${PORT}`)
)