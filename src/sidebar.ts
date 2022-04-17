import {dispGrid, dispAxes, dispBlockFrame, loadModel, dispModelNotFound} from "./index";
import {Backend} from "./backend/Backend";
import {ServerBackend} from "./backend/ServerBackend";

import resolveConfig from 'tailwindcss/resolveConfig'
//@ts-ignore
import tailwindConfig from '/tailwind.config.js'
const themeConfig = resolveConfig(tailwindConfig)

import "./styles/sidebar.css"
import { properties } from "./resources/Properties";
import {playAnimationState} from "./renderer/AnimatedTexture";
import { createToast } from "./toast";

interface ValidateButton extends HTMLButtonElement{
    changeState: (target: 'validate'|'loading'|'error') => void;
}

const backend: Backend = new ServerBackend();

let sidebar = document.getElementById("sidebar")
let modelButton = <ValidateButton>document.getElementById("modelValidateButton")
let modelInput = <HTMLInputElement>document.getElementById("modelInput")


const sidebarOpenButton = document.getElementById("sidebarOpenButton")
sidebarOpenButton.onclick = clickNavButton

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
const playTextureAnimationButton = <HTMLInputElement>document.getElementById("playTextureAnimation")
playTextureAnimationButton.checked = properties.model.play_texture_animation
playTextureAnimationButton.onchange = () => playAnimationState.setValue(playTextureAnimationButton.checked)

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
        openNav()
    } else {
        closeNav()
    }
}

const resizeObserver = new ResizeObserver(entries => {
    let entry = entries[0]
    calculateSidebarVisibility()
    if (sidebar.classList.contains('open')) {
        sidebar.parentElement.style.transitionDelay = transitionSidebarDelay
        sidebar.parentElement.style.paddingRight = `${entry.contentRect.width}px`
    }
    
  });

resizeObserver.observe(sidebar);

export function openNav() {
    if ( sidebar.classList.contains('open') ) {return}
    sidebar.classList.add('open')
    sidebar.parentElement.style.transitionDelay = transitionSidebarDelay
    sidebar.parentElement.style.paddingRight = `${sidebar.getBoundingClientRect().width}px`
}

export function closeNav() {
    if ( !(sidebar.classList.contains('open')) ) {return}
    sidebar.classList.remove('open')
    sidebar.parentElement.style.transitionDelay = '0s'
    sidebar.parentElement.style.paddingRight = '0px'

}

export function closeNavIfMobile(){
    if (document.body.classList.contains('mobile-sidebar')){
        closeNav()
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

    function selectAutocomplete(target: HTMLElement, validate: boolean = true){
        if ( !(target) ){return;}
        selectItem(target)
        textInput.value = selectedItem.dataset.name
        closeAutocompleteList()
        if (validate){
            validateButton.click()
        }
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

    function toHtmlElement(result: MatchResult): HTMLLIElement {
        
        const typed = result.id.slice(result.startIndex, result.endIndex)
        
        let b = document.createElement("li");
        b.setAttribute('role', 'option')
        b.appendChild(document.createTextNode(result.id.slice(0, result.startIndex)))
        let ba = document.createElement("span")
        ba.classList.add('text-text')
        ba.textContent = typed
        b.appendChild(ba)
        b.appendChild(document.createTextNode(result.id.slice(result.endIndex, result.id.length)))

        /*save the name*/
        b.dataset.name = result.id;

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

    type MatchResult = {id: string, startIndex: number, endIndex: number}

    /*execute a function when someone writes in the text field:*/
    textInput.oninput = function() {
        let inputValue = textInput.value;
        if (!inputValue) { closeAutocompleteList(); return false;}

        autocompleteList.classList.remove("hidden")
        autocompleteList.innerHTML = ''
        deselectItem()
        
        /*for each item in the array...*/
        arr.map(e => wordStartWith(inputValue.toLowerCase(), e))
            .filter(e => e !== undefined)
            .map(s => [levenshteinDistance(inputValue, s.id), s] as [number, MatchResult])
            .sort((s1, s2) => s1[0] - s2[0])
            .map(s => toHtmlElement(s[1]))
            .forEach(v => autocompleteList.append(v))

        calculateHeightAutocompleteList()
        selectItem(autocompleteList.firstElementChild)
    }

    function wordStartWith(input: string, id: string): MatchResult | undefined {
        if(!input.match(/[a-z0-9_]/))
            return
        const regex = new RegExp(`(?<=^|_)${input}`)
        const match = regex.exec(id)

        return match ? { id: id, startIndex: match.index, endIndex: match.index + input.length } : undefined
    }

    function selectItem(target: any){
        if ( !(target instanceof HTMLElement) ){
            return
        }
        selectedItem?.classList.remove(styleSelectedItem)
        selectedItem = target
        selectedItem.classList.add(styleSelectedItem)

        selectedItem.scrollIntoView({behavior: "smooth", block: "nearest", inline: "nearest"})
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
                        selectItem(autocompleteList.firstElementChild)
                        break
                    case "ArrowUp":
                        if (autocompleteList.firstElementChild == selectedItem){
                            event.preventDefault()
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
                event.preventDefault()

                if (selectedItem){
                    selectAutocomplete(selectedItem)
                    textInput.blur()
                    break
                }

                validateButton.click()
                
                break
            case "Escape":
                event.preventDefault()
                textInput.blur()
                break
            case "Tab":
                event.preventDefault()
                selectAutocomplete(selectedItem, false)
                break
        }
    }

    textInput.onkeydown = autocompleteList.onkeydown = textInputKey

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

        if (state == 'validate' || state == 'error'){
            modelButton.disabled = false;
        }
    }

    Object.defineProperty(validateButton, 'changeState', {
        value: changeState
    })

    textInput.disabled = false

}

function calculateSidebarVisibility(): boolean{
    sidebar.style.maxWidth = window.innerWidth - sidebarOpenButton.getBoundingClientRect().width + 'px'
    if (sidebar.getBoundingClientRect().width > window.innerWidth / 2){
        if (document.body.classList.contains('mobile-sidebar')) {return}
        document.body.classList.add('mobile-sidebar')
        closeNav()
        return true
    }
    document.body.classList.remove('mobile-sidebar')
    return false
}



window.addEventListener("load", () => {
    backend.getAllModel().then(list => {
        autocomplete(modelInput, list)
        modelButton.changeState('validate')
    })

    modelButton.onclick = () => {
        modelButton.changeState('loading')
        modelButton.disabled = true;
        loadModel(modelInput.value)
            .then(() => {
                modelButton.changeState('validate')
                closeNavIfMobile()
            })
            .catch(e => { 
                console.error(e);
                modelButton.changeState('error');
                dispModelNotFound()
                if (e.message){
                    createToast('Error', e.message, 3000)
                }
            })
            .finally(() => modelButton.disabled = false)
    }

    sidebar.style.display = null
    if ( !(calculateSidebarVisibility() )) {
        openNav()
    }

})

window.addEventListener("resize", calculateSidebarVisibility)
