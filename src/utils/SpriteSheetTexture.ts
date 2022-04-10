import * as THREE from "three";
import {McMetaModule} from "../models/McMetaInterface";
import McMeta = McMetaModule.McMeta;
import Frame = McMetaModule.Frame;
import {properties} from "../resources/Properties";

export class SpriteSheetTexture {

    private count: number
    private readonly nbFrame: number
    private y: number
    private animation: Array<Frame>

    constructor(image: HTMLImageElement, data: McMeta) {
        let frameWidth = data.animation.width || properties.block_size
        let frameHeight = data.animation.height || properties.block_size
        let timer: NodeJS.Timer
        const canvas = document.createElement('canvas')

        const ctx = canvas.getContext('2d')

        const canvasTexture = new THREE.CanvasTexture(canvas)
        image.onload = () => {
            canvas.width = data.animation.width || image.width

            canvas.height = data.animation.height || (image.height / frameWidth)
            timer = setTimeout(this.nextFrame)
        }
        this.y = this.count = 0
        this.nbFrame = data.animation.frames.length || image.height / frameHeight
        this.animation = this.adaptAnimation(data.animation?.frames, data.animation.frametime || 1)
        const startFrame = this.animation[0].index
    }

    adaptAnimation(animation: Array<Frame | number> | undefined, frametime: number): Array<Frame> {
        if(animation !== undefined)
            return animation.map(f => this.getFrameData(f, frametime))
        return [...Array(this.nbFrame).keys()].map(i => {return {index: i, time: frametime}})
    }

    getFrameData(element: Frame | number, frametime: number): Frame {
        if(typeof element == 'number')
            return { index: element, time: frametime }
        return element
    }

    nextFrame() {
        this.count = (this.count + 1) % this.nbFrame


    }

}
