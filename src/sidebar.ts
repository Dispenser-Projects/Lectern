import {loadModel} from "./index";

/* Events */
document.getElementById("validateButton").onclick =
    () => loadModel((<HTMLInputElement>document.getElementById("modelInput")).value)

document.getElementById("openButton").onclick = clickButton

document.getElementById("modelInput").onkeydown = pressEnter

document.getElementById("closeButton").onclick = closeNav


let open = false;

function clickButton() {
    if (!open) {
        document.getElementById("mySidebar").style.width = "250px";
        document.getElementById("main").style.marginRight = "250px";
        open = true;
    } else
        closeNav()
}

function closeNav() {
    document.getElementById("mySidebar").style.width = "0";
    document.getElementById("main").style.marginRight = "0";
    open = false;
}

function pressEnter(event: KeyboardEvent) {
    if (event.key === "Enter")
        document.getElementById("validateButton").click()
}