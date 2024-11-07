const DICE_SIZE = 100;
const DOT_RADIUS = 0.1 * DICE_SIZE;
const AT_QUARTER = 0.25 * DICE_SIZE;
const AT_HALF = 0.5 * DICE_SIZE;
const AT_3QUARTER = 0.75 * DICE_SIZE

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

    // Initialize scores as a 2D array
    game.scores = [];
    for (let p = 0; p < game.players; p++) {
        game.scores[p] = Array(12).fill(" "); // Create array for each player with 12 spaces
        game.scores[p][11] = 0; // Set the total (last position) to 0
    }

    document.querySelectorAll(".container-generala .dados").forEach((diceElement, i) => {
        diceElement.addEventListener("click", () => toggleDiceSelection(i));
    });

    drawDices();
    drawState();
    drawScores();
}

const drawScores = () => {
    // Header
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

    // Games
    const contGames = document.querySelector("#g2 .scores table tbody");
    contGames.innerHTML = ""; // Clear existing content
    
    // Add rows for each game (0-10)
    for (let j = 0; j < 11; j++) {
        const contGame = document.createElement("tr");
        const cellGameName = document.createElement("th");
        cellGameName.innerHTML = getGameName(j);
        contGame.appendChild(cellGameName);
        
        for (let p = 0; p < game.players; p++) {
            const cellPlayerScore = document.createElement("td");
            cellPlayerScore.innerHTML = game.scores[p][j];
            contGame.appendChild(cellPlayerScore);
        }
        contGames.appendChild(contGame);
        contGame.addEventListener("click", () => {
            if (game.dices.some(dice => dice === 0)) {
                return;
            };
            if (game.scores[game.turn - 1][j] !== " ") {
                document.getElementById("modal-ocupado").style.display = "block";
                return;
            } else {
                const score = calcScore(j);
                game.scores[game.turn - 1][j] = score === 0 ? "X" : score;
                game.scores[game.turn - 1][11] += score;
                drawScores();
                changeTurn();
            }
        });
    };
    
    // Total row
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
        document.getElementById("modal-ocupado").style.display = "none";
    };
    
    // Close modal if clicked outside
    window.onclick = function(event) {
        if (event.target === document.getElementById("modal-ocupado")) {
            document.getElementById("modal-ocupado").style.display = "none";
    };
};

const isGameMatch = regex => {
    return game.dices.slice().sort((d1, d2) => d1 - d2).join("").match(regex) !== null;//hago una copia del array, lo ordena, lo convierte en un string y lo matchea con la expresion regular de la generala
}

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
            showDice(diceElement, dice);  // Call showDice to render the dice
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
    if (game.moves >= 3) return;  // Evita tirar más de 3 veces
    for (let i = 0; i < game.dices.length; i++) {
        if (game.moves === 0 || (game.moves > 0 && !game.selectedDices[i])) {
            game.dices[i] = Math.floor(Math.random() * 6) + 1;
        }
    }
    drawDices();
    game.moves++;
    if (game.moves === 3) document.getElementById("roll-btn").setAttribute("disabled", "disabled");
    drawState();
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
    let winningScore = game.scores[0][11]; // Inicializa con el puntaje del primer jugador
    let empate = false;

    // Determinar el jugador con el puntaje más alto
    for (let i = 1; i < game.players; i++) {
        if (game.scores[i][11] > winningScore) {
            winningScore = game.scores[i][11];
            winner = i;
            empate = false;
        } else if (game.scores[i][11] === winningScore) {
            empate = true;
        }
    }

    // Crear el mensaje del ganador o empate
    const mensajeGanador = empate
        ? `¡Es un empate con ${winningScore} puntos!`
        : `Ganó el Jugador ${winner + 1} con ${winningScore} puntos`;

    // Mostrar el mensaje en el modal
    document.getElementById("ganador-texto").innerHTML = mensajeGanador;
    document.getElementById("modal-ganaste").style.display = "block";
};

// Función para cerrar el modal al hacer clic en el botón de cerrar
document.querySelector(".modal-ganaste-generala .close").onclick = function() {
    document.getElementById("modal-ganaste").style.display = "none";
};

// Cerrar el modal si se hace clic fuera de él
window.onclick = function(event) {
    if (event.target === document.getElementById("modal-ganaste")) {
        document.getElementById("modal-ganaste").style.display = "none";
    }
};

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

const changeSelection = (index) => {
    if (game.moves > 1 && game.moves <= 3) {
        game.selectedDices[index] = !game.selectedDices[index];
        drawDices();
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
    ctx.fillStyle = "#000000";
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
 
    // Borro
    ctx.clearRect(0, 0, DICE_SIZE, DICE_SIZE);
 
    // Dado
    ctx.beginPath();
    ctx.rect(0, 0, DICE_SIZE, DICE_SIZE);
    ctx.fillStyle = "#ffffff";
    ctx.fill();
    ctx.closePath();
 
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
}
/* Draw dices code ends */

document.getElementById("roll-btn").addEventListener("click", rollDices);

document.addEventListener("DOMContentLoaded", () => {
    initGame();
});