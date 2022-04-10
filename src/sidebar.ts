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


// document.getElementById("sidebarCloseButton").onclick = closeNav
const dispAxesButton = document.getElementById("dispAxes") as HTMLInputElement
dispAxesButton.onchange = () => dispAxes(dispAxesButton.checked)
const dispGridButton = document.getElementById("dispGrid") as HTMLInputElement
dispGridButton.onchange = () => dispGrid(dispGridButton.checked)
const dispBlockFrameButton = document.getElementById("dispBlockFrame") as HTMLInputElement
dispBlockFrameButton.onchange = () => dispBlockFrame(dispBlockFrameButton.checked)

let modelInput = document.getElementById("modelInput")
backend.getAllModel().then(list => autocomplete(modelInput as HTMLInputElement, list))

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

function autocomplete(textInput: HTMLInputElement, arr: string[]) {
    /*the autocomplete function takes two arguments,
    the text field element and an array of possible autocompleted values:*/

    /*Get the autocomplete list specified in the `data-autocomplete` attribute*/
    let autocompleteList: HTMLElement = document.querySelector(textInput.dataset.autocomplete)
    if (!(autocompleteList)) {
        console.error('missing autocompletion list')
        return
    }

    /*Get the validate button specified in the `data-validate` attribute*/
    let validateButton: HTMLElement = document.querySelector(textInput.dataset.validate)

    function selectAutocomplete(target: HTMLElement){
        textInput.value = target.dataset.name
        closeAutocompleteList()
        validateButton.click()
    }

    /*Close the autocomplete list if the focus is lost*/
    function closeOnBlur(event: FocusEvent){
        const relatedTarget = event.relatedTarget;
        if (relatedTarget && relatedTarget instanceof HTMLElement && (autocompleteList.contains(relatedTarget) || relatedTarget == textInput)) {return;}
        closeAutocompleteList()
    }

    function calculateHeightAutocompleteList(){
        console.log(sidebar.clientHeight - autocompleteList.getBoundingClientRect().top + "px")
        autocompleteList.style.maxHeight = `calc(${sidebar.clientHeight - autocompleteList.getBoundingClientRect().top}px - 1.75rem)`
    }

    function toHtmlElement(str: string, searchedValue: string): HTMLLIElement {
        let b = document.createElement("li");
        b.setAttribute('role', 'option')
        b.setAttribute('tabindex', '0')
        /*make the matching letters bold:*/
        const index = str.toLowerCase().indexOf(searchedValue.toLowerCase())
        b.innerHTML = str.substr(0, index)
        b.innerHTML += "<strong>" + str.substr(index, searchedValue.length) + "</strong>";
        b.innerHTML += str.substr(index + searchedValue.length);
        /*save the name*/
        b.dataset.name = str;

        b.addEventListener("click", function(_: any) {
            selectAutocomplete(this)
        });
        b.addEventListener("keyup", function(event) {
            if (event.key === "Enter") {
                selectAutocomplete(this)
            }
        });
        b.onblur = closeOnBlur

        return b
    }

    /*execute a function when someone writes in the text field:*/
    textInput.oninput = function() {
        let inputValue = textInput.value;
        /*close any already open lists of autocompleted inputValueues*/
        autocompleteOpen = true
        if (!inputValue) { return false;}

        autocompleteList.classList.remove("hidden")
        autocompleteList.innerHTML = ''
        
        /*for each item in the array...*/
        arr.filter(e => e.includes(inputValue.toLowerCase()))
        .map(s => [levenshteinDistance(inputValue, s), s] as [number, string])
        .sort((s1, s2) => s1[0] - s2[0])
        .map(s => toHtmlElement(s[1], inputValue))
        .forEach(v => autocompleteList.append(v))
        
        calculateHeightAutocompleteList()
        autocompleteList.scrollTo({top: 0});
    }

    textInput.onkeyup = function(event: KeyboardEvent) {
        switch (event.key){
            case "ArrowDown":
                const firstItem =  autocompleteList.firstElementChild
                if ( !(firstItem instanceof HTMLElement)) {return;}
                firstItem.focus()
                break
            case "Escape":
                textInput.blur()
                break
            case "Enter":
                validateButton.click()
                textInput.blur()
                break
        }
    }

    function closeAutocompleteList(){
        autocompleteList.classList.add("hidden")
    }

    /*When the focus is lost*/
    textInput.onblur = autocompleteList.onblur = closeOnBlur

    autocompleteList.onkeyup = function(event: KeyboardEvent) {
        const target: EventTarget = event.target;
        if ( !(target instanceof HTMLElement) ) {return;}
    
        switch (event.key) {
            case "ArrowDown":
                if (target.nextElementSibling instanceof HTMLElement){
                    target.nextElementSibling.focus()
                }
                event.preventDefault()
                break;
            case "ArrowUp":
                if (target.previousElementSibling instanceof HTMLElement){
                    target.previousElementSibling.focus()
                }
                else{
                    textInput.focus()
                }
                event.preventDefault()
                break;
            case "Escape":
                textInput.focus();
                break
        }
    }

}
