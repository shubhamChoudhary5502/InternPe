
        const ROWS = 6;
        const COLS = 7;
        let board = [];
        let currentPlayer = 'red';
        let gameActive = true;
        let scores = { red: 0, yellow: 0 };

        function initBoard() {
            board = Array(ROWS).fill(null).map(() => Array(COLS).fill(null));
            const boardEl = document.getElementById('board');
            
            if (!boardEl) {
                console.error('Board element not found!');
                return;
            }
            
            boardEl.innerHTML = '';

            for (let col = 0; col < COLS; col++) {
                const column = document.createElement('div');
                column.className = 'column';
                column.onclick = () => dropDisc(col);
                
                const hoverDisc = document.createElement('div');
                hoverDisc.className = `hover-disc ${currentPlayer}`;
                column.appendChild(hoverDisc);

                for (let row = 0; row < ROWS; row++) {
                    const cell = document.createElement('div');
                    cell.className = 'cell';
                    cell.dataset.row = row;
                    cell.dataset.col = col;
                    column.appendChild(cell);
                }
                boardEl.appendChild(column);
            }
        }

        function dropDisc(col) {
            if (!gameActive) return;

            let row = -1;
            for (let r = ROWS - 1; r >= 0; r--) {
                if (!board[r][col]) {
                    row = r;
                    break;
                }
            }

            if (row === -1) return;

            board[row][col] = currentPlayer;
            
            const cell = document.querySelector(`[data-row="${row}"][data-col="${col}"]`);
            const disc = document.createElement('div');
            disc.className = `disc ${currentPlayer}`;
            cell.appendChild(disc);

            if (checkWin(row, col)) {
                gameActive = false;
                highlightWinningDiscs();
                scores[currentPlayer]++;
                updateScores();
                updateStatus(`${currentPlayer === 'red' ? 'Red' : 'Yellow'} Player Wins! 🎉`);
                return;
            }

            if (checkDraw()) {
                gameActive = false;
                updateStatus("It's a Draw! 🤝");
                return;
            }

            currentPlayer = currentPlayer === 'red' ? 'yellow' : 'red';
            updateStatus(`${currentPlayer === 'red' ? 'Red' : 'Yellow'} Player's Turn`);
            updateHoverDiscs();
        }

        function checkWin(row, col) {
            const directions = [
                [[0, 1], [0, -1]],
                [[1, 0], [-1, 0]],
                [[1, 1], [-1, -1]],
                [[1, -1], [-1, 1]]
            ];

            for (let [dir1, dir2] of directions) {
                let count = 1;
                const cells = [[row, col]];

                for (let [dr, dc] of [dir1, dir2]) {
                    let r = row + dr;
                    let c = col + dc;
                    while (r >= 0 && r < ROWS && c >= 0 && c < COLS && board[r][c] === currentPlayer) {
                        cells.push([r, c]);
                        count++;
                        r += dr;
                        c += dc;
                    }
                }

                if (count >= 4) {
                    window.winningCells = cells;
                    return true;
                }
            }
            return false;
        }

        function highlightWinningDiscs() {
            for (let [row, col] of window.winningCells) {
                const cell = document.querySelector(`[data-row="${row}"][data-col="${col}"]`);
                const disc = cell.querySelector('.disc');
                if (disc) {
                    disc.classList.add('winning');
                }
            }
        }

        function checkDraw() {
            return board[0].every(cell => cell !== null);
        }

        function updateStatus(message) {
            const status = document.getElementById('status');
            status.textContent = message;
            status.className = 'status';
            if (gameActive) {
                status.classList.add(`${currentPlayer}-turn`);
            }
        }

        function updateHoverDiscs() {
            document.querySelectorAll('.hover-disc').forEach(disc => {
                disc.className = `hover-disc ${currentPlayer}`;
            });
        }

        function updateScores() {
            document.getElementById('red-score').textContent = scores.red;
            document.getElementById('yellow-score').textContent = scores.yellow;
        }

        function resetGame() {
            currentPlayer = 'red';
            gameActive = true;
            window.winningCells = [];
            initBoard();
            updateStatus("Red Player's Turn");
        }

        // Initialize the game when DOM is ready
        document.addEventListener('DOMContentLoaded', function() {
            initBoard();
            updateScores();
        });
        
        // Also initialize immediately in case DOM is already loaded
        if (document.readyState === 'loading') {
            // DOM still loading, event listener will handle it
        } else {
            // DOM already loaded
            initBoard();
            updateScores();
        }
    