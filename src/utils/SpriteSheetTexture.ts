import * as THREE from "three";
import {McMetaModule} from "../models/McMetaInterface";
import Frame = McMetaModule.Frame;
import {properties} from "../resources/Properties";
import {McTexture} from "../renderer/MinecraftTexture";
import {Texture} from "three";
import {toSlidingWindows} from "./Utils";
import {interpolate} from "./InterpolationManager";
import {Marvin, MarvinImage} from "marvinj-ts";

const computeTime = (tick: number) => 1000 / properties.model.texture_animation_frequency * tick

type CompiledFrame = {
    image: MarvinImage,
    time: number
}

export class SpriteSheetTexture extends Texture {

    constructor(texture: McTexture) {
        super()
        const data = texture.mcmeta
        const srcImage = new MarvinImage()
        let frameWidth = data.animation.width || properties.model.block_size
        let frameHeight = data.animation.height || properties.model.block_size
        let timer: NodeJS.Timer
        let count = 0
        const canvas = document.createElement('canvas')
        let nbKeyFrame: number
        const canvasTexture = new THREE.CanvasTexture(canvas)
        let animation: CompiledFrame[]

        srcImage.load(texture.texture.src, buildAnimation)


        function buildAnimation() {
            nbKeyFrame = data.animation.frames?.length || srcImage.height / frameHeight
            animation = adaptAnimation(data.animation?.frames, data.animation.frametime || 1)

            if(data.animation.interpolate)
                animation = interpolateAnimation(animation)

            console.log(computeTime(animation.length * animation[0].time))

            canvasTexture.magFilter = THREE.NearestFilter
            canvasTexture.minFilter = THREE.LinearFilter

            canvas.width = data.animation.width || srcImage.width
            canvas.height = data.animation.height || (srcImage.height / nbKeyFrame)
            timer = setTimeout(nextFrame, computeTime(animation[0].time))
        }


        function adaptAnimation(animation: Array<Frame | number> | undefined, frametime: number): Array<CompiledFrame> {
            if (animation !== undefined)
                return animation.map(f => toFrame(f, frametime)).map(toMarvinImage)
            return [...Array(nbKeyFrame).keys()].map(i => {
                return toMarvinImage({index: i, time: frametime})
            })
        }

        function toFrame(element: Frame | number, frametime: number): Frame {
            if (typeof element == 'number')
                return {index: element, time: frametime}
            return element
        }

        function nextFrame() {
            const newFrame = animation[count]
            count = (count + 1) % animation.length
            newFrame.image.draw(canvas, 0, 0, null)
            canvasTexture.needsUpdate = true
            timer = setTimeout(nextFrame, computeTime(newFrame.time))
        }

        function interpolateAnimation(data: CompiledFrame[]): Array<CompiledFrame> {
            const bar =[1, 2, 3, 4, 5, 6]
            const foo = toSlidingWindows(bar, 2)
            foo.push([bar.at(-1), bar[0]])
            const slidingWindows = toSlidingWindows(data, 2)
            slidingWindows.push([data.at(-1), data[0]])
            return slidingWindows.flatMap(images => interpolate(images[0].image, images[1].image, images[0].time).slice(0, -1))
                .map(image => {return {image: image, time: 1}})

        }

        function toMarvinImage(frame: Frame): CompiledFrame {
            const newImage = new MarvinImage()
            Marvin.crop(srcImage, newImage, 0, frame.index * frameHeight, frameWidth, frameHeight)
            return {image: newImage, time: frame.time}
        }

        return canvasTexture
    }
}

