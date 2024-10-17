let dados;
let dadosSeleccionados;

const initGame = () => {
    dados = [0, 0, 0, 0, 0];
    dadosSeleccionados = [false, false, false, false, false];

    document.querySelectorAll(".container-generala .dado").forEach((diceElement, index) => {
        diceElement.addEventListener("click", () => azarSeleccion(index));
    });

    document.getElementById('vaso').addEventListener('click', tirarDados);

    dibujarDados();
}

const dibujarDados = () => {
    dados.forEach((dado, i) => {
        const diceElement = document.querySelector(`.container-generala .dado.d${i}`);
        diceElement.innerHTML = dado;
        diceElement.classList.toggle('selected', dadosSeleccionados[i]);
    });
}

const tirarDados = () => {
    dados.forEach((_, i) => {
        if (!dadosSeleccionados[i]) {
            dados[i] = Math.floor((Math.random() * 6) + 1);
        }
    });
    dibujarDados();
}

const azarSeleccion = (index) => {
    dadosSeleccionados[index] = !dadosSeleccionados[index];
    dibujarDados();
}

document.addEventListener("DOMContentLoaded", initGame);