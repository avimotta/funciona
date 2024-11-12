const DICE_SIZE = 100;
const DOT_RADIUS = 0.1 * DICE_SIZE;
const AT_QUARTER = 0.25 * DICE_SIZE;
const AT_HALF = 0.5 * DICE_SIZE;
const AT_3QUARTER = 0.75 * DICE_SIZE;

const modalConfirm = document.getElementById("modal-confirm-generala");
const modalConfirmMessage = document.getElementById("modal-confirm-message");
const confirmAddX = document.getElementById("confirm-add-x");
const cancelAddX = document.getElementById("cancel-add-x");
const reinitGenerala = document.getElementById("reinit-generala");
const goBackGenerala = document.getElementById("go-back-generala");
const modalTachar = document.getElementById("modal-tachar-generala");
const modalAnotar = document.getElementById("modal-anotar-generala");
const modalGanaste = document.getElementById("modal-ganaste-generala");
const modalOcupado = document.getElementById("modal-ocupado-generala");

const game = {
    dices: [0, 0, 0, 0, 0],
    selectedDices: [false, false, false, false, false],
    players: 2,
    turn: 1,
    moves: 1,
    scores: [],
    round: 1,
}

const reEscalera = /12345|23456|13456/;
const reGenerala = /1{5}|2{5}|3{5}|4{5}|5{5}|6{5}/;
const rePoker = /1{4}[23456]|12{4}|2{4}[3456]|[12]3{4}|3{4}[456]|[123]4{4}|4{4}[56]|[1234]5{4}|5{4}6|[12345]6{4}/;
const reFull = /1{3}(2{2}|3{2}|4{2}|5{2}|6{2})|1{2}(2{3}|3{3}|4{3}|5{3}|6{3})|2{3}(3{2}|4{2}|5{2}|6{2})|2{2}(3{3}|4{3}|5{3}|6{3})|3{3}(4{2}|5{2}|6{2})|3{2}(4{3}|5{3}|6{3})|4{3}(5{2}|6{2})|4{2}(5{3}|6{3})|5{3}6{2}|5{2}6{3}/;

const initGame = () => {
    game.dices = [0, 0, 0, 0, 0]; 
    game.selectedDices = [false, false, false, false, false];
    game.turn = 1;
    game.moves = 0;
    game.scores = [];
    game.round = 1;

    for (let p = 0; p < game.players; p++) {
        game.scores[p] = Array(12).fill(" "); 
        game.scores[p][11] = 0; 
    }

    // copia nueva de cada dado para que cuando se reinicie no se interpongan los viejos listeners
    document.querySelectorAll(".container-generala .dados").forEach((diceElement) => {
        const newElement = diceElement.cloneNode(true);
        diceElement.parentNode.replaceChild(newElement, diceElement);
    });

    // agregar nuevos listeners a las nuevas copias
    document.querySelectorAll(".container-generala .dados").forEach((diceElement, i) => {
        diceElement.addEventListener("click", () => toggleDiceSelection(i));
    });

    drawDices();
    drawState();
    drawScores();
}

const drawScores = () => {
    // header
    const contHeader = document.querySelector("#g2 .scores table thead tr");
    contHeader.innerHTML = "";
    const cellGame = document.createElement("th");
    cellGame.innerHTML = "juego";
    contHeader.appendChild(cellGame);
    
    for (let i = 0; i < game.players; i++) {
        const cellPlayerName = document.createElement("th");
        cellPlayerName.innerHTML = `J${i + 1}`;
        contHeader.appendChild(cellPlayerName);
    }

    // juegos
    const contGames = document.querySelector("#g2 .scores table tbody");
    contGames.innerHTML = ""; 
    
    // fila para cada juego
    for (let j = 0; j < 11; j++) {
        const contGame = document.createElement("tr");
        const cellGameName = document.createElement("th");
        cellGameName.innerHTML = getGameName(j);
        contGame.appendChild(cellGameName);
        
        for (let p = 0; p < game.players; p++) {
            const cellPlayerScore = document.createElement("td");
            cellPlayerScore.innerHTML = game.scores[p][j];
            contGame.appendChild(cellPlayerScore);

            if (p === game.turn - 1) {
                cellPlayerScore.classList.add("markPlayerTurn");
            }
        }

        contGames.appendChild(contGame);
        contGame.addEventListener("click", () => {
            if (game.dices.some(dice => dice === 0)) {
                return;
            }
       
            if (game.scores[game.turn - 1][j] !== " ") {
                modalOcupado.style.display = "block";
                return;
            } else {
                const score = calcScore(j); // Cambia calcScore por calculateScore si es necesario
       
                if (score === 0) {
                    modalConfirm.style.display = "block";
                    modalConfirmMessage.innerHTML = `No tiene el juego ${getGameName(j)}. ¿Quiere tacharlo?`;
                   
                    confirmAddX.onclick = () => {
                        modalConfirm.style.display = "none";
                        game.scores[game.turn - 1][j] = "X"; // Marca como tachado
                        changeTurn();
                        drawScores();
                    };
       
                    cancelAddX.onclick = () => {
                        modalConfirm.style.display = "none";
                    };

                    if (getGameName(j) === "G" && game.scores[game.turn - 1][10] !== "X") {
                        modalTachar.style.display = "block";
                        document.querySelector(".modal-tachar-generala .close").onclick = function() {
                            document.getElementById("modal-tachar-generala").style.display = "none";
                        };
                        modalConfirm.style.display = "none";
                    }
                   
                    } else {
                    if (getGameName(j) === "D" && game.scores[game.turn - 1][9] === " ") {
                        // Show modal to indicate that Generala must be scored first
                        modalAnotar.style.display = "block";
                        document.querySelector(".modal-anotar-generala .close").onclick = function() {
                            document.getElementById("modal-anotar-generala").style.display = "none";
                        };
                        return; // Prevent scoring until user closes modal
                    } else {
                        game.scores[game.turn - 1][j] = score;
                        game.scores[game.turn - 1][11] += score;
                        changeTurn();
                        drawScores();
                    }
                }
            }
        });
    }

 
    
    //fila del total
    const contTotal = document.createElement("tr");
    const cellTotalName = document.createElement("th");
    cellTotalName.innerHTML = "total";
    contTotal.appendChild(cellTotalName);
    for (let p = 0; p < game.players; p++) {
        const cellPlayerTotal = document.createElement("td");
        cellPlayerTotal.innerHTML = game.scores[p][11];
        contTotal.appendChild(cellPlayerTotal);
    }
    contGames.appendChild(contTotal);
};

    document.querySelector(".modal-ocupado-generala .close").onclick = function() {
        modalOcupado.style.display = "none";
    };
    

    window.onclick = function(event) {
        if (event.target === document.getElementById("modal-ocupado")) {
            modalOcupado.style.display = "none";
    };
};

const isGameMatch = regex => {
    return game.dices.slice().sort((d1, d2) => d1 - d2).join("").match(regex) !== null;//hago una copia del array, lo ordena, lo convierte en un string y lo matchea con la expresion regular de la generala
}

const highlightPossibleScores = () => {
    // Remove previous highlights
    document.querySelectorAll('.potential-score').forEach(cell => {
        cell.classList.remove('potential-score');
    });

    // Only highlight if there are actual dice values (not all zeros)
    if (game.dices.some(dice => dice === 0)) return;

    // Get all score cells for current player
    const scoreCells = document.querySelectorAll('#g2 .scores table tbody tr');
    
    // Check each possible game (0-10)
    scoreCells.forEach((row, index) => {
        if (index >= 11) return; // Skip total row
        
        // Get the cell for current player
        const playerCell = row.children[game.turn];
        
        // Only proceed if the cell is empty (contains space)
        if (playerCell && playerCell.textContent.trim() === "") {
            const score = calcScore(index);
            if (score > 0) { // Only highlight if there's a positive score
                playerCell.classList.add('potential-score');
                // Optionally show the potential score
            }
        }
    });
};

const calcScore = whichGame => {
    let score = 0;
    switch (whichGame) {
        case 6:
            if (isGameMatch(reEscalera)) {
                score = game.moves === 2 ? 25 : 20;
            }
            //coincide con reEscalera
            //y primer tiro, devuelve 25, sino 20
            break;
        case 7:
            if (isGameMatch(reFull)) {
                score = game.moves === 2 ? 35 : 30;
            }
            //coincide con reFull
            //y primer tiro, devuelve 35, sino 30
            break;
        case 8:
            if (isGameMatch(rePoker)) {
                score = game.moves === 2 ? 45 : 40;
            }
            //coincide con rePoker
            //y primer tiro, devuelve 45, sino 40
            break;
        case 9:
            if (isGameMatch(reGenerala)) {
                score = game.moves === 2 ? 55 : 50;
            }
            //coincide con reGenerala
            //y primer tiro, devuelve 55, sino 50
            break;
        case 10:
            if (isGameMatch(reGenerala)) {
                score = game.moves === 2 ? 100 : 105;
            }
            //coincide con reGenerala
            //y primer tiro, devuelve 100, sino 105
            break;
        default: //0123456
        score = game.dices.filter(dice => dice === whichGame + 1).reduce((acc, cur) => acc + cur, 0);
        //selecciona los dados que quiero y los pone en otro array
    }
    return score;
}

const drawDices = () => {
    game.dices.forEach((dice, i) => {
        const diceElement = document.querySelector(`.container-generala .dado-${i + 1}`);
        if (diceElement) {
            showDice(diceElement, dice);
            if (game.selectedDices[i]) {
                diceElement.classList.add("dadosSeleccionados");
            } else {
                diceElement.classList.remove("dadosSeleccionados");
            }
        }
    });
};

const drawState = () => {
    document.getElementById("player-generala").innerHTML = game.turn;
    document.getElementById("moves-generala").innerHTML = game.moves;
}

const rollDices = () => {
    if (game.moves >= 3) return; 
    for (let i = 0; i < game.dices.length; i++) {
        if (game.moves === 0 || (game.moves > 0 && !game.selectedDices[i])) {
            game.dices[i] = Math.floor(Math.random() * 6) + 1;
        }
    }
    drawDices();
    game.moves++;
    if (game.moves === 1) document.getElementById("btn-g2-back").setAttribute("disabled", "disabled");
    if (game.moves === 3) document.getElementById("roll-btn").setAttribute("disabled", "disabled");
    drawState();

    highlightPossibleScores();
};

const changeTurn = () => {
    game.dices = [0, 0, 0, 0, 0];
    game.selectedDices = [false, false, false, false, false];
    game.moves = 0;
    game.turn++;
    
    if(game.turn > game.players) {
        game.turn = 1;
        game.round++;
        console.log(`${game.round}`);
        if (game.round === 12) {
            gameOver();
        };
    };
    document.getElementById("roll-btn").removeAttribute("disabled" );
    drawDices();
    drawState();
};

const gameOver = () => {
    document.getElementById("roll-btn").setAttribute("disabled", "disabled");

    let winner = 0;
    let winningScore = game.scores[0][11]; // primero con el puntaje del primer jugador
    let empate = false;

    // el más alto??
    for (let i = 1; i < game.players; i++) {
        if (game.scores[i][11] > winningScore) {
            winningScore = game.scores[i][11];
            winner = i;
            empate = false;
        } else if (game.scores[i][11] === winningScore) {
            empate = true;
        }
    }

    const mensajeGanador = empate
        ? `¡Es un empate con ${winningScore} puntos!`
        : `Ganó el Jugador ${winner + 1} con ${winningScore} puntos`;

    document.getElementById("ganador-texto").innerHTML = mensajeGanador;
    modalGanaste.style.display = "block";
    
    reinitGenerala.onclick = () => {
        initGame();
        modalGanaste.style.display = "none";
    };

    goBackGenerala.onclick = () => {
        modalGanaste.style.display = "none";
        hideAllSections();
        showSection("main");
        initGame();
    };
};

document.querySelector(".modal-ganaste-generala .close").onclick = function() {
    modalGanaste.style.display = "none";
};

function hideAllSections() {
    Array.from(document.querySelectorAll(".game")).concat([document.getElementById("main")])
        .forEach (element => element.classList.add("nodisp"));
}

function showSection(sectionId) {
    document.getElementById(sectionId).classList.remove("nodisp");
}

const getGameName = whichGame => {
    const games = ['1', '2', '3', '4', '5', '6', 'E', 'F', 'P', 'G', 'D'];
    return games[whichGame];
};
 
//alternar selección de dado específico cuando usuario hace clic, toggleDiceSelection está específicamente para manejar la interacción directa con cada dado cuando el usuario lo selecciona o deselecciona. Sin él, la interfaz no podría reflejar cuáles dados están "congelados" y cuáles no, y no se podría personalizar qué dados lanzar en la siguiente tirada.
const toggleDiceSelection = diceNumber => {
    game.selectedDices[diceNumber] = !game.selectedDices[diceNumber];
    const diceElement = document.querySelector(`.container-generala .dado-${diceNumber + 1}`);
    if (game.selectedDices[diceNumber]) {
        diceElement.classList.add("dadosSeleccionados");
    } else {
        diceElement.classList.remove("dadosSeleccionados");
    }
};

const showDices = (contDiv, number) => {
    contDiv.innerHTML = ''; 
    const img = document.createElement("img");
    img.setAttribute("width", DICE_SIZE);
    img.setAttribute("height", DICE_SIZE);
    img.setAttribute("alt", `dice ${number}`);
    img.setAttribute("src", `./assets/imgs/cara${number}.svg`); 
    contDiv.appendChild(img);
};

/* Draw dices code begins */
const drawDot = (ctx, x, y) => {
    ctx.beginPath();
    ctx.arc(x, y, DOT_RADIUS, 0, 2 * Math.PI, false);
    ctx.fillStyle = "#F48B89";
    ctx.fill();
    ctx.closePath();
}
 
const showDice = (contDiv, number) => {
    contDiv.innerHTML = null;
    let canvas = document.createElement("canvas");
    canvas.setAttribute("width", "" + DICE_SIZE);
    canvas.setAttribute("height", "" + DICE_SIZE);
    drawDice(canvas, number);
    contDiv.appendChild(canvas);
}
 
const drawDice = (cont, number) => {
    let ctx = cont.getContext("2d");
    const radius = 20; // Radio de las esquinas redondeadas
 
    // Borro
    ctx.clearRect(0, 0, DICE_SIZE, DICE_SIZE);
 
    // Dibujo el dado con bordes redondeados
    ctx.beginPath();
    ctx.moveTo(radius, 0); // Esquina superior izquierda
    ctx.lineTo(DICE_SIZE - radius, 0); // Línea superior
    ctx.arcTo(DICE_SIZE, 0, DICE_SIZE, radius, radius); // Esquina superior derecha
    ctx.lineTo(DICE_SIZE, DICE_SIZE - radius); // Línea derecha
    ctx.arcTo(DICE_SIZE, DICE_SIZE, DICE_SIZE - radius, DICE_SIZE, radius); // Esquina inferior derecha
    ctx.lineTo(radius, DICE_SIZE); // Línea inferior
    ctx.arcTo(0, DICE_SIZE, 0, DICE_SIZE - radius, radius); // Esquina inferior izquierda
    ctx.lineTo(0, radius); // Línea izquierda
    ctx.arcTo(0, 0, radius, 0, radius); // Esquina superior izquierda
    ctx.fillStyle = "#FFE5B4";
    ctx.fill();
    ctx.closePath();
 
    // Dibujo los puntos según el número
    switch (number) {
        case 1:
            drawDot(ctx, AT_HALF, AT_HALF);
            break;
        case 2:
            drawDot(ctx, AT_3QUARTER, AT_QUARTER);
            drawDot(ctx, AT_QUARTER, AT_3QUARTER);
            break;
        case 3:
            drawDot(ctx, AT_HALF, AT_HALF);
            drawDot(ctx, AT_3QUARTER, AT_QUARTER);
            drawDot(ctx, AT_QUARTER, AT_3QUARTER);
            break;
        case 4:
            drawDot(ctx, AT_3QUARTER, AT_QUARTER);
            drawDot(ctx, AT_QUARTER, AT_3QUARTER);
            drawDot(ctx, AT_QUARTER, AT_QUARTER);
            drawDot(ctx, AT_3QUARTER, AT_3QUARTER);
            break;
        case 5:
            drawDot(ctx, AT_HALF, AT_HALF);
            drawDot(ctx, AT_3QUARTER, AT_QUARTER);
            drawDot(ctx, AT_QUARTER, AT_3QUARTER);
            drawDot(ctx, AT_QUARTER, AT_QUARTER);
            drawDot(ctx, AT_3QUARTER, AT_3QUARTER);
            break;
        case 6:
            drawDot(ctx, AT_3QUARTER, AT_QUARTER);
            drawDot(ctx, AT_QUARTER, AT_3QUARTER);
            drawDot(ctx, AT_QUARTER, AT_QUARTER);
            drawDot(ctx, AT_3QUARTER, AT_3QUARTER);
            drawDot(ctx, AT_QUARTER, AT_HALF);
            drawDot(ctx, AT_3QUARTER, AT_HALF);
    }
};

/* Draw dices code ends */

document.getElementById("roll-btn").addEventListener("click", rollDices);

document.addEventListener("DOMContentLoaded", () => {
    initGame();
});