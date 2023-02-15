/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   index.js                                           :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: mbarutel <mbarutel@student.hive.fi>        +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2023/02/15 14:24:10 by mbarutel          #+#    #+#             */
/*   Updated: 2023/02/15 21:21:05 by mbarutel         ###   ########.fr       */
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

function validate_board(board) {
	var moves = 0;
	
  if (typeof board !== 'string' || board.length !== 9) {
    return false;
  }
  for (let i = 0; i < board.length; i++) 
  {
    const char = board.charAt(i);

	if (char == 'X' || char == 'O')
	{
		++moves;
		if (moves > 1)
			return false;
	}
    if (char != 'X' && char != 'O' && char != '-')
		return false;
  }
  return true;
}

app.get('/', (req, res) => {
	const message = 'Welcome to my server!'; // Greeting message
	
	res.setHeader('Content-Type', 'text/plain');
	res.end(message);
});

app.get('/api/v1/games', (req, res) => {
	if (!games.length)
		res.end(`There are currently ${games.length}`)
	res.status(200).send(games)	

});

app.post('/api/v1/games', (req, res) => {
	
	const board = req.body
	const new_game = createNewGame(board);
	
	console.log('hello here');
	if (!board || !validate_board(board) || !new_game) {
		res.status(400).send({ message: 'New game not created.'})
	}
	else
		games.push(new_game);
	res.status(200).send({
		new_game: `Game at http://localhost:${PORT}/${new_game.id}`,
		board: `Board status [${new_game.board}]`,
		incoming_board: `${board}`
	});
});

app.listen(
	PORT,
	() => console.log(`Server is alive on http://localhost:${PORT}`)
)