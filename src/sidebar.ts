import {dispGrid, dispAxes, dispBlockFrame, loadModel} from "./index";
import {Backend} from "./backend/Backend";
import {ServerBackend} from "./backend/ServerBackend";

import resolveConfig from 'tailwindcss/resolveConfig'
//@ts-ignore
import tailwindConfig from '/tailwind.config.js'
const themeConfig = resolveConfig(tailwindConfig)

import "./styles/sidebar.css"
import { properties } from "./resources/Properties";

interface ValidateButton extends HTMLButtonElement{
    changeState: (target: 'validate'|'loading'|'error') => void;
}

const backend: Backend = new ServerBackend();

let sidebar = document.getElementById("sidebar")
let modelButton = <ValidateButton>document.getElementById("modelValidateButton")
let modelInput = <HTMLInputElement>document.getElementById("modelInput")

window.onload = function(){
    sidebar.style.display = null
    sidebar.classList.add('open')
}

modelButton.onclick = () => {
    modelButton.changeState('loading')
    modelButton.disabled = true;
    loadModel(modelInput.value)
        .then(() => modelButton.changeState('validate'))
        .catch(() => modelButton.changeState('error'))
        .finally(() => modelButton.disabled = false)
}
document.getElementById("sidebarOpenButton").onclick = clickNavButton
backend.getAllModel().then(list => autocomplete(modelInput, list))

// document.getElementById("sidebarCloseButton").onclick = closeNav
const dispAxesButton = <HTMLInputElement>document.getElementById("dispAxes")
dispAxesButton.checked = properties.default_settings.display_axes
dispAxesButton.onchange = () => dispAxes(dispAxesButton.checked)
const dispGridButton = <HTMLInputElement>document.getElementById("dispGrid")
dispGridButton.checked = properties.default_settings.display_grid
dispGridButton.onchange = () => dispGrid(dispGridButton.checked)
const dispBlockFrameButton = <HTMLInputElement>document.getElementById("dispBlockFrame")
dispBlockFrameButton.checked = properties.default_settings.display_block_frame
dispBlockFrameButton.onchange = () => dispBlockFrame(dispBlockFrameButton.checked)
export let rotatingAnim = properties.default_settings.rotate_anim
const rotateAnimButton = <HTMLInputElement>document.getElementById("rotateAnim")
rotateAnimButton.checked = rotatingAnim
rotateAnimButton.onchange = () => rotatingAnim = rotateAnimButton.checked

modelInput.value = properties.default_settings.model

let appVersion = require('./../package.json').version;
let appVersionNode = document.getElementById('appVersion');
appVersionNode.innerText = appVersion
appVersionNode.classList.remove('d-none');

// @ts-ignore
const transitionSidebarDelay = themeConfig.theme.transitionDuration['150']
sidebar.parentElement.style.backgroundColor = properties.background_color

function clickNavButton() {
    if (!sidebar.classList.contains('open')) {
        sidebar.classList.add('open')
        sidebar.parentElement.style.transitionDelay = transitionSidebarDelay
        sidebar.parentElement.style.paddingRight = `${sidebar.getBoundingClientRect().width}px`
    } else {
        closeNav()
        sidebar.parentElement.style.transitionDelay = '0s'
        sidebar.parentElement.style.paddingRight = '0px'
    }
}

const resizeObserver = new ResizeObserver(entries => {
    let entry = entries[0]
    if (sidebar.classList.contains('open')) {
        sidebar.parentElement.style.transitionDelay = transitionSidebarDelay
        sidebar.parentElement.style.paddingRight = `${entry.contentRect.width}px`
    } else {
        sidebar.parentElement.style.transitionDelay = '0s'
        sidebar.parentElement.style.paddingRight = '0px'

    }
    
  });

resizeObserver.observe(sidebar);


function closeNav() {
    sidebar.classList.remove('open')
    // sidebar.style.marginRight = `-${sidebar.offsetWidth}px`

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
    let selectedItem: HTMLElement = null
    const styleSelectedItem = "selected"

    function selectAutocomplete(target: HTMLElement){
        if ( !(target) ){return;}
        textInput.value = target.dataset.name
        closeAutocompleteList()
        validateButton.click()
    }

    function deselectItem(){
        selectedItem?.classList.remove(styleSelectedItem)
        selectedItem = null
    }

    /*Close the autocomplete list if the focus is lost*/
    function closeOnBlur(event: FocusEvent){
        const relatedTarget = <HTMLElement>event.relatedTarget;
        if (relatedTarget && (autocompleteList.contains(relatedTarget) || relatedTarget == textInput)) {return;}
        deselectItem()
        closeAutocompleteList()
    }

    function calculateHeightAutocompleteList(){
        autocompleteList.style.maxHeight = `calc(${sidebar.clientHeight - autocompleteList.getBoundingClientRect().top}px - 1.75rem)`
    }

    function toHtmlElement(str: string, searchedValue: string): HTMLLIElement {
        let b = document.createElement("li");
        b.setAttribute('role', 'option')
        // b.setAttribute('tabindex', '0')
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
        if (!inputValue) { closeAutocompleteList(); return false;}

        autocompleteList.classList.remove("hidden")
        autocompleteList.innerHTML = ''
        deselectItem()
        
        /*for each item in the array...*/
        arr.filter(e => e.includes(inputValue.toLowerCase()))
        .map(s => [levenshteinDistance(inputValue, s), s] as [number, string])
        .sort((s1, s2) => s1[0] - s2[0])
        .map(s => toHtmlElement(s[1], inputValue))
        .forEach(v => autocompleteList.append(v))
        
        calculateHeightAutocompleteList()
        autocompleteList.scrollTo({top: 0});
    }

    function selectItem(target: any){
        if ( !(target instanceof HTMLElement) ){
            return
        }
        selectedItem?.classList.remove(styleSelectedItem)
        selectedItem = target
        selectedItem.classList.add(styleSelectedItem)

        textInput.value = selectedItem.dataset.name
        textInput.focus()
        textInput.selectionStart = 0
        textInput.selectionEnd = textInput.value.length;

        selectedItem.scrollIntoView({behavior: "smooth", block: "nearest", inline: "nearest"})
    }

    let userLastInput: string
    function returnToLastUserValue(){
        textInput.value = userLastInput
        deselectItem()
        textInput.focus()
    }

    function textInputKey(event: KeyboardEvent) {
        switch (event.key){
            case "ArrowDown":
            case "ArrowUp":
                switch (event.key){
                    case "ArrowDown":
                        if (selectedItem && document.body.contains(selectedItem)){
                            selectItem(selectedItem.nextElementSibling)
                            break
                        }
                        userLastInput = textInput.value
                        selectItem(autocompleteList.firstElementChild)
                        break
                    case "ArrowUp":
                        if (autocompleteList.firstElementChild == selectedItem && userLastInput){
                            event.preventDefault()
                            returnToLastUserValue()
                            return
                        }
                        if (selectedItem && selectedItem.previousElementSibling){
                            selectItem(selectedItem.previousElementSibling)
                            break
                        }
                        textInput.focus()
                        return
                }
                event.preventDefault()
                break
                
            case "Enter":
                selectAutocomplete(selectedItem)
                validateButton.click()
                textInput.blur()
                event.preventDefault()
                break
            case "Escape":
                event.preventDefault()
                if (selectedItem && userLastInput){
                    returnToLastUserValue()
                    break
                }
                textInput.blur()
                break
        }
    }

    textInput.onkeydown = textInputKey

    autocompleteList.onfocus = function(event: FocusEvent){
        if (selectedItem){
            validateButton.focus()
            return
        }
        event.preventDefault();
        selectItem(autocompleteList.firstElementChild)
    }

    autocompleteList.onkeydown = textInputKey

    function closeAutocompleteList(){
        autocompleteList.classList.add("hidden")
        autocompleteList.innerHTML = ''
        selectedItem = null
    }

    /*When the focus is lost*/
    textInput.onblur = autocompleteList.onblur = closeOnBlur


    function changeState(state: 'validate'|'loading'|'error'){
        const currentState = validateButton.querySelector('.current-state')
        currentState.classList.add('hidden')
        currentState.classList.remove('current-state')

        const icon = validateButton.querySelector(`[data-icon=${state}]`)
        icon.classList.remove('hidden')
        icon.classList.add('current-state')
    }    

    Object.defineProperty(validateButton, 'changeState', {
        value: changeState
    })

}
