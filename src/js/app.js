import { Preferences } from '@capacitor/preferences';

function hideAllSections() {
    Array.from(document.querySelectorAll(".game")).concat([document.getElementById("main"), document.getElementById("perfil")])
        .forEach (element => element.classList.add("nodisp"));
}

function showSection(sectionId) {
    document.getElementById(sectionId).classList.remove("nodisp");
}

function setupButtons() {
    document.querySelectorAll(".game")
        .forEach(elementId => {
            const id = elementId.getAttribute("id");
            document.getElementById(`btn-${id}`).addEventListener("click", () => {
                hideAllSections();
                showSection(id);
            });
            document.getElementById(`btn-${id}-back`).addEventListener("click", () => {
                hideAllSections();
                showSection("main");
            });
        })
}

//leo la preferencia,  si tengo null devuelvo null (muestro la pág del perfil) y sino agarro un string lo convierto en objeto y devuelvo eso (pág d game)
async function getPreference(key) {
    const { value } = await Preferences.get({ key });
    return value === null ? null : JSON.parse(value);
}

//guardo, tienen q ser strings por eso hacemos stringify
async function setPreference(key, obj) {
    await Preferences.set({ key, value: JSON.stringify(obj) });
}

function initApp() {
    setupButtons();

    getPreference("config").then(config => {
        if (config ===null) {
            hideAllSections();
            showSection("perfil");
        } else {
            hideAllSections();
            showSection("main");
        }
    });
}

document.getElementById("savePreferences").addEventListener("click", e => {
    e.preventDefault();
    const config = {
        name: document.getElementById("name").value,
        nick: document.getElementById("nick").value
    };
    if (config.name.length === 0 || config.nick.length === 0) {
        alert("debe completar ambos campos");
    } else {
        setPreference("config", config).then(() => {
        hideAllSections();
        showSection("main");
        });
    }
});

document.addEventListener("DOMContentLoaded", initApp());
