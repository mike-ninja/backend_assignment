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
    status: 'in_progress', // Set the initial game status to "in_progress"
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
 
// This function returns true if there are moves
// remaining on the board. It returns false if
// there are no moves left to play.
//function isMovesLeft(board)
//{
    //for(let i = 0; i < 3; i++)
        //for(let j = 0; j < 3; j++)
            //if (board[i][j] == '-')
                //return true;
                 
    //return false;
//}
 
function evaluate(b, game)
{
     
    // Checking for Rows for X or O victory.
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
  
    // Checking for Columns for X or O victory.
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
  
    // Checking for Diagonals for X or O victory.
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
  
    // Else if none of them have
    // won then return 0
    return 0;
}

function check_enemy_move(board, game)
{
    let eval = 0;

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
    return eval;
}
 
function findBestMove(board, game)
{ 
    let bestVal = 0;
    let bestMove = new Move();
    bestMove.row = -1;
    bestMove.col = -1;

    console.log(`${board}`);
    for(let i = 0; i < 3; i++)
    {
        for(let j = 0; j < 3; j++)
        {
            if (board[i][j] == '-')
            {
                let moveVal = check_enemy_move(board, game);
                if (moveVal < bestVal)
                {
                    console.log(`PROTECTION row ${i} col ${j} moveVal ${moveVal}`);
                    bestMove.row = i;
                    bestMove.col = j;
                }
                board[i][j] = game.champ;
                let ret = evaluate(board, game);
                board[i][j] = '-';
                if (ret == 1 || bestVal == 0)
                {
                    console.log(`FOR WIN row ${i} col ${j} moveVal ${ret}`);
                    bestMove.row = i;
                    bestMove.col = j;
                }
            }
        }
    }
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
	return true;
}

function validate_move(old_board, new_board, board_param)
{
	const old_board_moves = get_moves(old_board, board_param);
	const new_board_moves = get_moves(new_board, board_param);
	
	if (new_board_moves - old_board_moves != 1)
		return false;
	return true;
}

app.get('/', (req, res) => {
	const message = 'Welcome to my server!'; // Greeting message
	
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
    {
		res.status(400).send({ message: 'New game not created.'});

    }
	else
	{
		games.push(new_game);
		
		let bestMove = findBestMove(board_param, new_game);
		var index = (bestMove.row) * 3 + (bestMove.col);
		//console.log(`col ${bestMove.col} row ${bestMove.row} ${new_game.champ} pos ${new_game.board[(bestMove.col) * (bestMove.row)]}`);

		// convert the string to an array
		let str = new_game.board;

		let arr = str.split("");

		// update the character at index 2
		arr[index] = new_game.champ;

		// convert the array back to a string
		str = arr.join("");
		new_game.board = str;

		//console.log(`board ${new_game.board} val ${new_game.board[(bestMove.col + 1) * (bestMove.row + 1)]}`);
		
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
		let bestMove = findBestMove(board_param, game);
		var index = (bestMove.row) * 3 + (bestMove.col);
		
		// convert the string to an array
		let str = board;
		
		let arr = str.split("");
		
		// update the character at index 2
		//console.log(`col ${bestMove.col} row ${bestMove.row} ${game.champ} pos ${game.board[(bestMove.col) * (bestMove.row)]}`);
		arr[index] = game.champ;

		// convert the array back to a string
		str = arr.join("");
		game.board = str;
		console.log(`${game.board}`);
		res.status(200).send(game);
	}
});

app.listen(
	PORT,
	() => console.log(`Server is alive on http://localhost:${PORT}`)
)