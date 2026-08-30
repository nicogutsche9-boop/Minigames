export function showScreen(screenId) {

    const screens =
        document.querySelectorAll(".screen");

    screens.forEach(screen => {
        screen.classList.remove("active");
    });


    const screen =
        document.getElementById(screenId);

    if (screen) {
        screen.classList.add("active");
    }
}
