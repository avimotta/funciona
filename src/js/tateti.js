const statusDisplay = document.querySelector(".ganador");
const cells = document.querySelectorAll(".celda");
const resetButton = document.getElementById("reset");
const reinitTateti = document.getElementById("reinit-tateti");
const goBackTateti = document.getElementById("go-back-tateti");
const modalGanaste = document.getElementById("modal-ganaste-tateti");
const ganadorTexto = document.getElementById("ganador-texto-tateti");
const goBack = document.getElementById("btn-g1-back");

const winConditions = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6]
]; 

let jugador = "X";
let gameOver = false;

function tirarMoneda() {
    return Math.random() > 0.5 ? 'X' : 'O';
}

cells.forEach(cell => {
    cell.addEventListener("click", handleCellClick);
});

resetButton.addEventListener("click", resetGame);

function changeTurn() {
    jugador = jugador === "X" ? "O" : "X";
    document.getElementById("jugador").textContent = jugador; 
}

function handleCellClick(event) {
    const cell = event.target; // identifica celda tocada
    if (gameOver || cell.textContent !== "") {
        return;
    }

    goBack.disabled = true;

    cell.textContent = jugador;
    cell.classList.add('bloqueada');

    if (checkWin()) {
        gameOver = true;
        ganadorTexto.textContent = `¡GANÓ ${jugador}!`;
        setTimeout(() => {
            modalGanaste.style.display = "block";
        }, 1000);
    } else if (checkTie()) {
        gameOver = true;
        ganadorTexto.textContent = "EMPATE";
        setTimeout(() => {
            modalGanaste.style.display = "block";
        }, 1000);
    } else {
        changeTurn();
    }
}

function checkWin() {
    let isWin = false;
    winConditions.forEach(condition => {
        if (cells[condition[0]].textContent === jugador &&
            cells[condition[1]].textContent === jugador &&
            cells[condition[2]].textContent === jugador) {
            isWin = true;
            marcarCeldasGanadoras(condition);
        }
    });
    return isWin;
}

function marcarCeldasGanadoras(condition) {
    condition.forEach(index => {
        cells[index].classList.add("celdas-ganadoras")
    });
}

function checkTie() { 
    return Array.from(cells).every(cell => cell.textContent !== "");
}

function resetGame() {
    cells.forEach(cell => {
        cell.textContent = "";
        cell.style.backgroundColor = "";
        cell.classList.remove('bloqueada');
        cell.classList.remove('celdas-ganadoras');
    });
    modalGanaste.style.display = "none";
    jugador = tirarMoneda();
    gameOver = false;
    resetButton.disabled = false;
    goBack.disabled = false;
}

function hideAllSections() {
    Array.from(document.querySelectorAll(".game")).concat([document.getElementById("main")])
        .forEach(element => element.classList.add("nodisp"));
}

function showSection(sectionId) {
    document.getElementById(sectionId).classList.remove("nodisp");
}

reinitTateti.onclick = () => {
    resetGame();
};

goBackTateti.onclick = () => {
    modalGanaste.style.display = "none";
    hideAllSections();
    showSection("main");
    resetGame();
};

resetButton.disabled = false; //habilitar botón