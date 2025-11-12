var candies = ["rds", "lake", "ec2", "s3", "event", "cloud9"];
var board = [];
var rows = 9;
var columns = 9;

var currTile;
var otherTile;

window.onload = function() {
    const scoreElement = document.getElementById("score");
    const timerElement = document.getElementById("timer");
    const commentsElement = document.getElementById("comments");
    const crushSound = document.getElementById("crushSound");

    let score = 0;
    let timer = 120;

    startGame();

    window.setInterval(function() {
        crushCandy();
        slideCandy();
        generateCandy();
    }, 100);

    // Update timer
    const timerInterval = setInterval(() => {
        if (timer > 0) {
            timer--;
            timerElement.innerText = timer;
        } else {
            clearInterval(timerInterval);
            alert("Time's up! Your score is " + score);
            score = 0;
            timer = 120; // Reset timer for next game if needed
        }
    }, 1000);

    // Update score
    function updateScore(points) {
        score += points;
        scoreElement.textContent = score;
    }

    function randomCandy() {
        return candies[Math.floor(Math.random() * candies.length)];
    }

    function startGame() {
        for (let r = 0; r < rows; r++) {
            let row = [];
            for (let c = 0; c < columns; c++) {
                let tile = document.createElement("img");
                tile.id = `${r}-${c}`;
                tile.src = `./images/${randomCandy()}.png`;

                tile.addEventListener("dragstart", dragStart);
                tile.addEventListener("dragover", dragOver);
                tile.addEventListener("dragenter", dragEnter);
                tile.addEventListener("dragleave", dragLeave);
                tile.addEventListener("drop", dragDrop);
                tile.addEventListener("dragend", dragEnd);

                // Add touch event listeners
                tile.addEventListener("touchstart", touchStart);
                tile.addEventListener("touchend", touchEnd);
                tile.addEventListener("touchmove", touchMove);

                document.getElementById("board").append(tile);
                row.push(tile);
            }
            board.push(row);
        }
    }

    function dragStart() {
        currTile = this;
    }

    function dragOver(e) {
        e.preventDefault();
    }

    function dragEnter(e) {
        e.preventDefault();
    }

    function dragLeave() {}

    function dragDrop() {
        otherTile = this;
    }

    function dragEnd() {
        if (currTile.src.includes("blank") || otherTile.src.includes("blank")) {
            return;
        }

        let currCoords = currTile.id.split("-");
        let r = parseInt(currCoords[0]);
        let c = parseInt(currCoords[1]);

        let otherCoords = otherTile.id.split("-");
        let r2 = parseInt(otherCoords[0]);
        let c2 = parseInt(otherCoords[1]);

        let moveLeft = c2 === c - 1 && r === r2;
        let moveRight = c2 === c + 1 && r === r2;
        let moveUp = r2 === r - 1 && c === c2;
        let moveDown = r2 === r + 1 && c === c2;

        let isAdjacent = moveLeft || moveRight || moveUp || moveDown;

        if (isAdjacent) {
            let currImg = currTile.src;
            let otherImg = otherTile.src;
            currTile.src = otherImg;
            otherTile.src = currImg;

            let validMove = checkValid();
            if (!validMove) {
                currTile.src = currImg;
                otherTile.src = otherImg;
            }
        }
    }

    function touchStart(e) {
        e.preventDefault();
        currTile = e.target;
    }

    function touchEnd(e) {
        e.preventDefault();
        if (!currTile) return;

        let touch = e.changedTouches[0];
        let touchElement = document.elementFromPoint(touch.clientX, touch.clientY);
        otherTile = touchElement;

        if (currTile && otherTile && currTile !== otherTile) {
            dragEnd();
        }
    }

    function touchMove(e) {
        e.preventDefault();
        // Optional: You can add logic here to visualize dragging, if desired
    }

    function crushCandy() {
        crushThree();
        scoreElement.innerText = score;
    }

    function crushThree() {
        let crushed = false;

        for (let r = 0; r < rows; r++) {
            for (let c = 0; c < columns - 2; c++) {
                let candy1 = board[r][c];
                let candy2 = board[r][c + 1];
                let candy3 = board[r][c + 2];
                if (candy1.src === candy2.src && candy2.src === candy3.src && !candy1.src.includes("blank")) {
                    let service = getServiceName(candy1.src);
                    displayComment(service);
                    playServiceSound(candy1.src);
                    candy1.src = "./images/blank.png";
                    candy2.src = "./images/blank.png";
                    candy3.src = "./images/blank.png";
                    score += 30;
                    crushed = true;
                }
            }
        }

        for (let c = 0; c < columns; c++) {
            for (let r = 0; r < rows - 2; r++) {
                let candy1 = board[r][c];
                let candy2 = board[r + 1][c];
                let candy3 = board[r + 2][c];
                if (candy1.src === candy2.src && candy2.src === candy3.src && !candy1.src.includes("blank")) {
                    let service = getServiceName(candy1.src);
                    displayComment(service);
                    playServiceSound(candy1.src);
                    candy1.src = "./images/blank.png";
                    candy2.src = "./images/blank.png";
                    candy3.src = "./images/blank.png";
                    score += 30;
                    crushed = true;
                }
            }
        }

        if (crushed) {
            commentsElement.style.display = 'block';
            setTimeout(() => {
                commentsElement.style.display = 'none';
            }, 2000);
        }
    }

    function playServiceSound(serviceSrc) {
        crushSound.pause(); // Pause if already playing
        crushSound.currentTime = 0; // Reset to start
        crushSound.play();
    }

    function getServiceName(src) {
        return src.split('/').pop().split('.').shift();
    }

    function displayComment(service) {
        let comment = '';
        switch (service) {
            case 'RDS':
                comment = 'Aurora DB service crushed!';
                break;
            case 'lake':
                comment = 'Lake Formation service crushed!';
                break;
            case 'ec2':
                comment = 'EC2 service crushed!';
                break;
            case 's3':
                comment = 'S3 service crushed!';
                break;
            case 'event':
                comment = 'EventBridge service crushed!';
                break;
            case 'cloud9':
                comment = 'Cloud9 IDE service crushed!';
                break;
            default:
                comment = 'Service crushed!';
        }
        commentsElement.innerText = comment;
    }

    function checkValid() {
        for (let r = 0; r < rows; r++) {
            for (let c = 0; c < columns - 2; c++) {
                let candy1 = board[r][c];
                let candy2 = board[r][c + 1];
                let candy3 = board[r][c + 2];
                if (candy1.src === candy2.src && candy2.src === candy3.src && !candy1.src.includes("blank")) {
                    return true;
                }
            }
        }

        for (let c = 0; c < columns; c++) {
            for (let r = 0; r < rows - 2; r++) {
                let candy1 = board[r][c];
                let candy2 = board[r + 1][c];
                let candy3 = board[r + 2][c];
                if (candy1.src === candy2.src && candy2.src === candy3.src && !candy1.src.includes("blank")) {
                    return true;
                }
            }
        }

        return false;
    }

    function slideCandy() {
        for (let c = 0; c < columns; c++) {
            let ind = rows - 1;
            for (let r = columns - 1; r >= 0; r--) {
                if (!board[r][c].src.includes("blank")) {
                    board[ind][c].src = board[r][c].src;
                    ind -= 1;
                }
            }

            for (let r = ind; r >= 0; r--) {
                board[r][c].src = "./images/blank.png";
            }
        }
    }

    function generateCandy() {
        for (let c = 0; c < columns; c++) {
            if (board[0][c].src.includes("blank")) {
                board[0][c].src = `./images/${randomCandy()}.png`;
            }
        }
    }
};
