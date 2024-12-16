let gameMessage = document.getElementById("game-message-wordle");
let gameEnd = document.getElementById("fin-texto-wordle");
const input = document.querySelector("#input-wordle");
const send = document.querySelector("#enviar-wordle");
const reinit = document.querySelector("#reinit-wordle");
const reiniciar = document.querySelector("#reiniciar-wordle");
const goBack = document.querySelector("#go-back-wordle");
let intentosRestantes = 5;
let secretWord;
let modalFinal = document.querySelector("#modal-fin-wordle");
const grilla = document.getElementById("grilla-adivinar");
const back = document.getElementById("btn-g3-back");

const words5 = [
    "voces", "gatos", "fruta", "arroz", "playa",
    "nieve", "tecla", "fuego", "piano", "lugar",
    "carta", "perro", "cable", "coral", "rosas",
    "rampa", "avena", "cielo", "rocas", "verde"
];
const words6 = [
    "fresco", "escala", "tierno", "cancha", "maceta",
    "sombra", "pasado", "puerta", "celosa", "cuadra",
    "tierra", "viento", "musica", "abuelo", "saltar",
    "brillo", "corcho", "pintor", "toalla", "correr"
];

//crear grilla
function initializeGrid() {
    grilla.innerHTML = '';

    // filas
    for (let i = 0; i < 5; i++) {
        const fila = document.createElement("div");
        fila.classList.add("fila-palabra");

        // cada cuadrado en la fila
        for (let j = 0; j < (secretWord ? secretWord.length : 5); j++) {
            const letraElemento = document.createElement("span");
            letraElemento.classList.add('absent');
            fila.appendChild(letraElemento);
        }
        grilla.appendChild(fila);
    }
}

function reinitGame() {
    initGame();
    modalFinal.style.display = "none";
    gameMessage.textContent = `adiviná la palabra de ${secretWord.length} letras`;
    back.removeAttribute("disabled");
}

reinit.addEventListener('click', () => {
    reinitGame();
});

reiniciar.addEventListener('click', () => {
    reinitGame();
});


function showSection(sectionId) {
    document.getElementById(sectionId).classList.remove("nodisp");
}

function hideAllSections() {
    Array.from(document.querySelectorAll(".game")).concat([document.getElementById("main")])
        .forEach (element => element.classList.add("nodisp"));
}

goBack.addEventListener('click', () => {
    modalFinal.style.display = "none";
    hideAllSections();
    showSection("main");
    initGame();
    send.disabled = false;
    input.disabled = false;
    input.value = '';
    back.removeAttribute("disabled");
});

document.querySelectorAll('.key').forEach(button => {
    button.addEventListener('click', () => {
        let letter = button.dataset.letter;
        if (input.value.length < secretWord.length) {
            input.value += letter;
            back.setAttribute("disabled", "disabled");
        }
    });
});

document.getElementById('borrar-wordle').addEventListener('click', () => {
    input.value = input.value.slice(0, -1);
});

send.addEventListener("click", () => {
    let playerGuess = input.value.toLowerCase();

    if (playerGuess.length !== secretWord.length) {
        gameMessage.textContent = `ingresá una palabra de ${secretWord.length} letras`;
        return;
    }

    // encontrar la primera fila vacía
    const rows = grilla.querySelectorAll('.fila-palabra');
    const currentRowIndex = 5 - intentosRestantes;
    const currentRow = rows[currentRowIndex];
    currentRow.innerHTML = '';
    const letterStates = new Array(secretWord.length).fill('absent');
    const secretWordArray = secretWord.split('');

    playerGuess.split('').forEach((letra, index) => {
        if (letra === secretWord[index]) {
            letterStates[index] = 'correct';
            secretWordArray[index] = null;
        }
    });

    playerGuess.split('').forEach((letra, index) => {
        if (letterStates[index] === 'absent' && secretWordArray.includes(letra)) {
            const presentIndex = secretWordArray.indexOf(letra);
            if (presentIndex !== -1) {
                letterStates[index] = 'present';
                secretWordArray[presentIndex] = null; 
            }
        }
    });

    playerGuess.split('').forEach((letra, index) => {
        const letraElemento = document.createElement("span");
        letraElemento.textContent = letra;
        letraElemento.classList.add(letterStates[index]);
        currentRow.appendChild(letraElemento);
    });

    if (playerGuess === secretWord) {
        gameEnd.textContent = "¡adivinaste!"; 
        goBack.disabled = false;
        setTimeout(() => {
            modalFinal.style.display = "block";
        }, 1000);
    } else {
        intentosRestantes--; 
        input.value = ''; 

        if (intentosRestantes > 0) {
            gameMessage.textContent = `seguí intentando. intentos restantes: ${intentosRestantes}`;
        } else {
            gameEnd.textContent = `perdiste. la palabra era: ${secretWord}`;
            goBack.disabled = false;
            setTimeout(() => {
                modalFinal.style.display = "block";
            }, 1000);
        }
    }
});

function setSecretWord() {
    const wordLength = Math.random() < 0.5 ? 5 : 6;
    
    if (wordLength === 5) {
        secretWord = words5[Math.floor(Math.random() * words5.length)];
    } else {
        secretWord = words6[Math.floor(Math.random() * words6.length)];
    }

    console.log(secretWord);
    gameMessage.textContent = `adiviná la palabra de ${wordLength} letras`;
}

function initGame() {
    intentosRestantes = 5;
    setSecretWord();
    initializeGrid();
    send.disabled = false;
    input.disabled = false;
    input.value = '';
}

initGame();