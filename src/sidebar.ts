import {dispGrid, dispAxes, dispBlockFrame, loadModel} from "./index";
import {Backend} from "./backend/Backend";
import {ServerBackend} from "./backend/ServerBackend";

import "./styles/sidebar.css"

const backend: Backend = new ServerBackend();

let sidebar = document.getElementById("sidebar")
/* Events */
document.getElementById("modelValidateButton").onclick =
    () => loadModel((<HTMLInputElement>document.getElementById("modelInput")).value)

document.getElementById("sidebarOpenButton").onclick = clickButton

const input: HTMLInputElement = document.getElementById("modelInput") as HTMLInputElement

input.onkeydown = event => pressEnter(event, input)
//input.onblur = () => closeAllLists(null, input)

let modelAutocompleteList = document.getElementById('modelAutocomplete');

// document.getElementById("sidebarCloseButton").onclick = closeNav
const dispAxesButton = document.getElementById("dispAxes") as HTMLInputElement
dispAxesButton.onclick = () => dispAxes(dispAxesButton.checked)
const dispGridButton = document.getElementById("dispGrid") as HTMLInputElement
dispGridButton.onclick = () => dispGrid(dispGridButton.checked)
const dispBlockFrameButton = document.getElementById("dispBlockFrame") as HTMLInputElement
dispBlockFrameButton.onclick = () => dispBlockFrame(dispBlockFrameButton.checked)

backend.getAllModel().then(list => autocomplete(document.getElementById("modelInput") as HTMLInputElement, list))

let appVersion = require('./../package.json').version;
let appVersionNode = document.getElementById('appVersion');
appVersionNode.innerText = appVersion
appVersionNode.classList.remove('d-none');


let autocompleteOpen = false

function clickButton() {
    if (!sidebar.classList.contains('open')) {
        sidebar.classList.add('open')
    } else
        closeNav()
}

function closeNav() {
    sidebar.classList.remove('open')
}

function pressEnter(event: KeyboardEvent, input: HTMLInputElement) {
    if (event.key === "Enter" && input === document.activeElement) {
        document.getElementById("modelValidateButton").click()
        closeAllLists(null, input)
    }
}

function levenshteinDistance(str1: string, str2: string): number {
    const track = Array(str2.length + 1).fill(null).map(() =>
        Array(str1.length + 1).fill(null));
    for (let i = 0; i <= str1.length; i += 1) {
        track[0][i] = i;
    }
    for (let j = 0; j <= str2.length; j += 1) {
        track[j][0] = j;
    }
    for (let j = 1; j <= str2.length; j += 1) {
        for (let i = 1; i <= str1.length; i += 1) {
            const indicator = str1[i - 1] === str2[j - 1] ? 0 : 1;
            track[j][i] = Math.min(
                track[j][i - 1] + 1, // deletion
                track[j - 1][i] + 1, // insertion
                track[j - 1][i - 1] + indicator, // substitution
            );
        }
    }
    return track[str2.length][str1.length];
}

function autocomplete(inp: HTMLInputElement, arr: string[]) {
    /*the autocomplete function takes two arguments,
    the text field element and an array of possible autocompleted values:*/
    let currentFocus: number;
    /*execute a function when someone writes in the text field:*/
    inp.addEventListener("input", function(_) {
        let a: any, b: any, val = this.value;
        /*close any already open lists of autocompleted values*/
        closeAllLists(null, inp);
        autocompleteOpen = true
        if (!val) { return false;}
        currentFocus = -1;
        a = modelAutocompleteList
        modelAutocompleteList.classList.remove("hidden")
        a.innerHTML = ''
        /*create a DIV element that will contain the items (values):*/
        // a = document.createElement("DIV");
        // a.setAttribute("id", this.id + "autocomplete-list");
        // a.setAttribute("class", "autocomplete-items");
        /*append the DIV element as a child of the autocomplete container:*/
        // this.parentNode.appendChild(a);
        /*for each item in the array...*/
        arr.filter(e => e.includes(val.toLowerCase()))
            .map(s => [levenshteinDistance(val, s), s] as [number, string])
            .sort((s1, s2) => s1[0] - s2[0])
            .map(s => toHtmlElement(s[1], val, b))
            .forEach(v => a.append(v))

    });

    function toHtmlElement(str: string, searchedValue: string, b: any): string {
        b = document.createElement("li");
        /*make the matching letters bold:*/
        const index = str.toLowerCase().indexOf(searchedValue.toLowerCase())
        b.innerHTML = str.substr(0, index)
        b.innerHTML += "<strong>" + str.substr(index, searchedValue.length) + "</strong>";
        b.innerHTML += str.substr(index + searchedValue.length);
        /*insert a input field that will hold the current array item's value:*/
        b.innerHTML += "<input type='hidden' value='" + str + "'>";
        /*execute a function when someone clicks on the item value (DIV element):*/
        b.addEventListener("click", function(_: any) {
            /*insert the value for the autocomplete text field:*/
            inp.value = this.getElementsByTagName("input")[0].value;
            /*close the list of autocompleted values,
            (or any other open lists of autocompleted values:*/
            closeAllLists(null);
        });
        return b
    }

    /*execute a function presses a key on the keyboard:*/
    inp.addEventListener("keydown", function(e) {
        let x: any = document.getElementById(this.id + "autocomplete-list");
        if (x) x = x.getElementsByTagName("div");
        if (e.code == 'ArrowDown') {
            /*If the arrow DOWN key is pressed,
            increase the currentFocus variable:*/
            currentFocus++;
            /*and and make the current item more visible:*/
            addActive(x);
        } else if (e.code === 'ArrowUp') { //up
            /*If the arrow UP key is pressed,
            decrease the currentFocus variable:*/
            currentFocus--;
            /*and and make the current item more visible:*/
            addActive(x);
        } else if (e.code == 'Enter') {
            /*If the ENTER key is pressed, prevent the form from being submitted,*/
            e.preventDefault();
            if (currentFocus > -1) {
                /*and simulate a click on the "active" item:*/
                if (x) x[currentFocus].click();
            }
        }
    });
    function addActive(x: any) {
        /*a function to classify an item as "active":*/
        if (!x) return false;
        /*start by removing the "active" class on all items:*/
        removeActive(x);
        if (currentFocus >= x.length) currentFocus = 0;
        if (currentFocus < 0) currentFocus = (x.length - 1);
        /*add class "autocomplete-active":*/
        x[currentFocus].classList.add("autocomplete-active");
    }
    function removeActive(x: any) {
        /*a function to remove the "active" class from all autocomplete items:*/
        for (let i = 0; i < x.length; i++) {
            x[i].classList.remove("autocomplete-active");
        }
    }
    /*execute a function when someone clicks in the document:*/
    document.addEventListener("click", (e) => closeAllLists(e.target, inp));
}

function closeAllLists(element: EventTarget, inp: HTMLInputElement) {
    /*close all autocomplete lists in the document,
    except the one passed as an argument:*/
    if (!element) {
        modelAutocompleteList.classList.add("hidden")
    }
    let x = document.getElementsByClassName("autocomplete-items");
    for (let i = 0; i < x.length; i++) {
        if (element !== x[i] && element !== inp) {
            x[i].parentNode.removeChild(x[i]);
        }
    }
    autocompleteOpen = false
}

