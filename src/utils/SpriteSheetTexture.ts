import * as THREE from "three";
import {McMetaModule} from "../models/McMetaInterface";
import Frame = McMetaModule.Frame;
import {properties} from "../resources/Properties";
import {McTexture} from "../renderer/MinecraftTexture";
import {Texture} from "three";

const computeTime = (tick: number) => 1000 / properties.model.texture_animation_frequency * tick

export class SpriteSheetTexture extends Texture {

    constructor(texture: McTexture) {
        super()
        const data = texture.mcmeta
        const image = texture.texture

        let frameWidth = data.animation.width || properties.model.block_size
        let frameHeight = data.animation.height || properties.model.block_size
        let timer: NodeJS.Timer
        let y = 0;
        let count = 0

        const canvas = document.createElement('canvas')

        const ctx = canvas.getContext('2d')
        const canvasTexture = new THREE.CanvasTexture(canvas)
        const nbFrame = data.animation.frames?.length || image.height / frameHeight
        const animation = adaptAnimation(data.animation?.frames, data.animation.frametime || 1)

        canvasTexture.magFilter = THREE.NearestFilter
        canvasTexture.minFilter = THREE.LinearFilter

        image.onload = () => {
            canvas.width = data.animation.width || image.width
            canvas.height = data.animation.height || (image.height / nbFrame)
            timer = setTimeout(nextFrame, computeTime(animation[0].time))
        }


        function adaptAnimation(animation: Array<Frame | number> | undefined, frametime: number): Array<Frame> {
            if (animation !== undefined)
                return animation.map(f => getFrameData(f, frametime))
            return [...Array(nbFrame).keys()].map(i => {
                return {index: i, time: frametime}
            })
        }

        function getFrameData(element: Frame | number, frametime: number): Frame {
            if (typeof element == 'number')
                return {index: element, time: frametime}
            return element
        }

        function nextFrame() {
            y = animation[count].index * frameHeight
            count = (count + 1) % nbFrame

            ctx.clearRect(0, 0, frameWidth, frameHeight)
            ctx.drawImage(image, 0, y, frameWidth, frameHeight, 0, 0, frameWidth, frameHeight)

            canvasTexture.needsUpdate = true
            timer = setTimeout(nextFrame, computeTime(animation[count].time))
        }

        return canvasTexture
    }
}

