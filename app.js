import {
    showScreen
} from "./menu.js";

import {
    initReactionGame
} from "./games/reaction.js";


document.addEventListener("DOMContentLoaded", () => {

    const gameButtons =
        document.querySelectorAll("[data-game]");


    // Spiele aus dem Menü starten

    gameButtons.forEach(button => {

        button.addEventListener("click", () => {

            const game = button.dataset.game;

            if (game === "reaction") {

                showScreen("reaction-screen");

                initReactionGame();
            }

        });

    });

});
