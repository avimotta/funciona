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

// Initialize grid with empty grey squares
function initializeGrid() {
    // Clear existing grid
    grilla.innerHTML = '';

    // Create 5 rows of grey squares
    for (let i = 0; i < 5; i++) {
        const fila = document.createElement("div");
        fila.classList.add("fila-palabra");

        // Create grey squares for the length of the secret word
        for (let j = 0; j < (secretWord ? secretWord.length : 5); j++) {
            const letraElemento = document.createElement("span");
            letraElemento.classList.add('absent');
            fila.appendChild(letraElemento);
        }

        grilla.appendChild(fila);
    }
}

function reinitGame() {
    // Reset attempts
    intentosRestantes = 5;

    // Select a new secret word
    setSecretWord();

    // Reinitialize grid
    initializeGrid();

    // Reset input
    input.value = '';

    // Re-enable send button and input
    send.disabled = false;
    input.disabled = false;
    goBack.disabled = false;

    // Hide modal
    modalFinal.style.display = "none";

    // Reset game message
    gameMessage.textContent = `Adiviná la palabra de ${secretWord.length} letras`;
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
    
    // Completely reset the game state
    initGame();
    
    // Reset UI elements
    send.disabled = false;
    input.disabled = false;
    goBack.disabled = true;
    input.value = '';
});

// Keyboard event listeners
document.querySelectorAll('.key').forEach(button => {
    button.addEventListener('click', () => {
        let letter = button.dataset.letter;
        if (input.value.length < secretWord.length) {
            input.value += letter;
        }
    goBack.disabled = true;
    });
});

// Delete button event listener
document.getElementById('borrar-wordle').addEventListener('click', () => {
    input.value = input.value.slice(0, -1);
});

// Send/Guess button event listener
send.addEventListener("click", () => {
    let playerGuess = input.value.toLowerCase(); // Convert to lowercase

    // Validate input length
    if (playerGuess.length !== secretWord.length) {
        gameMessage.textContent = `Debe ingresar una palabra de ${secretWord.length} letras`;
        return;
    }

    // Find the first empty row
    const rows = grilla.querySelectorAll('.fila-palabra');
    const currentRowIndex = 5 - intentosRestantes;
    const currentRow = rows[currentRowIndex];

    // Clear the current row
    currentRow.innerHTML = '';

    // Create an array to track letter states
    const letterStates = new Array(secretWord.length).fill('absent');
    const secretWordArray = secretWord.split('');

    // First pass: mark correct letters
    playerGuess.split('').forEach((letra, index) => {
        if (letra === secretWord[index]) {
            letterStates[index] = 'correct';
            secretWordArray[index] = null; // Mark as used
        }
    });

    // Second pass: mark present letters
    playerGuess.split('').forEach((letra, index) => {
        if (letterStates[index] === 'absent' && secretWordArray.includes(letra)) {
            const presentIndex = secretWordArray.indexOf(letra);
            if (presentIndex !== -1) {
                letterStates[index] = 'present';
                secretWordArray[presentIndex] = null; // Mark as used
            }
        }
    });

    // Create letter elements with appropriate classes
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
        intentosRestantes--; // Reduce remaining attempts
        input.value = ''; // Clear input

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
    gameMessage.textContent = `Adiviná la palabra de ${wordLength} letras`;
}

function initGame() {
    // Reset remaining attempts
    intentosRestantes = 5;

    // Select and set a new secret word
    setSecretWord();

    // Initialize the grid
    initializeGrid();

    // Re-enable send button and input
    send.disabled = false;
    input.disabled = false;
    goBack.disabled = false;
    input.value = '';
}

// Start the game
initGame();