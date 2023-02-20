Tic Tac Toe : mbarutel backend server

Description
    Tic Tac Toe backend server using node, node express, && javascript with the
    decision making algorithm using the minimax method.

To run the server, follow these steps:
    Install node if you don't have it.
    Make sure you are in the root directory and run "node ."
    I use insomnia API to send my request, feel free to use which ever you want.

How to Use
    Start a game by sending POST request to "http://localhost:8080/api/v1/games" either with "---------" (No move) or "--------X" (Starting Move).
    Continue game by sending a PUT request with a board with your new move plus the moves made by the computer to "http://localhost:8080/api/v1/games/id".
    GET request to "http://localhost:8080/api/v1/games" returns all the games, whilst GET request for specific ID returns the game if it exist.
    DELETE request to delete the game if it exist.

Enjoy!