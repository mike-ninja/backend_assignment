/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   index.js                                           :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: mbarutel <mbarutel@student.hive.fi>        +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2023/02/15 14:24:10 by mbarutel          #+#    #+#             */
/*   Updated: 2023/02/16 15:11:37 by mbarutel         ###   ########.fr       */
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
    status: 'in_progress' // Set the initial game status to "in_progress"
  };

  return game;
}

function get_moves(board)
{
	var moves = 0;
	
	for (let i = 0; i < board.length; i++) 
	{
		const char = board.charAt(i);

		if (char == 'X' || char == 'O')
			++moves;
	}
	return moves;
}

function validate_board(board)
{
	if (typeof board !== 'string' || board.length !== 9 || get_moves(board) > 1)
		return false;
	for (let i = 0; i < board.length; i++) 
	{
		const char = board.charAt(i);
		if (char != 'X' && char != 'O' && char != '-')
			return false;
	}
	return true;
}

function validate_move(old_board, new_board)
{
	const old_board_moves = get_moves(old_board);
	const new_board_moves = get_moves(new_board);

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
	if (!games.length)
		res.end(`There are currently ${games.length} games`)
	res.status(200).send(games);
});

app.post('/api/v1/games', (req, res) => {
	
	const board = req.body
	const new_game = createNewGame(board);
	
	console.log('hello here');
	if (!board || !validate_board(board) || !new_game) 
		res.status(400).send({ message: 'New game not created.'})
	else
		games.push(new_game);
	res.status(200).send({
		new_game: `Game at http://localhost:${PORT}/api/v1/games/${new_game.id}`,
		board: `Board status [${new_game.board}]`,
		incoming_board: `${board}`
	});
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
	
	if (!game)
		res.end(`Game ID [/${id}] doesn't exist`);
	else if (!validate_move(game.board, board))
		res.end(`Invalid move`);
	else
	{
		game.board = board;
		res.status(200).send(game);
	}
});

app.listen(
	PORT,
	() => console.log(`Server is alive on http://localhost:${PORT}`)
)