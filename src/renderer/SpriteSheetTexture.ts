import * as THREE from "three";
import {McMetaModule} from "../models/McMetaInterface";
import Frame = McMetaModule.Frame;
import {properties} from "../resources/Properties";
import {McTexture} from "./MinecraftTexture";
import {CanvasTexture} from "three";
import {toSlidingWindows} from "../utils/Utils";
import {interpolate} from "./InterpolationManager";
import {Marvin, MarvinImage} from "marvinj-ts";
import McMeta = McMetaModule.McMeta;

/**
 * Function to convert tick to milliseconds
 * @param tick
 */
const computeTime = (tick: number) => 1000 / properties.model.texture_animation_frequency * tick

/**
 * A type to represent a Frame where image has been loaded
 */
type LoadedFrame = {
    image: MarvinImage,
    time: number
}

/**
 * New type of Texture to handle animated textures
 */
export class SpriteSheetTexture extends CanvasTexture {

    /** The canvas of the CanvasTexture where to draw texture */
    readonly canvas: HTMLCanvasElement
    /** The height of one frame */
    readonly frameHeight: number
    /** The width of one frame */
    readonly frameWidth: number
    /** The loaded animation to play for this texture */
    animation: LoadedFrame[]
    /** The animation timer */
    timer: NodeJS.Timer


    /**
     * @param texture the Minecraft texture to animate
     */
    constructor(texture: McTexture) {
        const canvas = document.createElement('canvas')
        super(canvas)
        this.canvas = canvas
        const data = texture.mcmeta

        const srcImage = new MarvinImage()
        this.frameWidth = data.animation.width || properties.model.block_size
        this.frameHeight = data.animation.height || properties.model.block_size

        const buildAndRun = () => {
            this.animation = this.buildAnimation(data, srcImage)
            this.nextFrame(0)
        }
        srcImage.load(texture.texture.src, buildAndRun)
    }

    /**
     * Build the animation by loading all textures
     * @param data the MCMETA data describing the animation to play
     * @param srcImage the based Minecraft image where all keyframes are
     * @return all preloaded frames and their time to play in the animation
     */
    buildAnimation(data: McMeta, srcImage: MarvinImage): LoadedFrame[] {
        const nbKeyFrame = data.animation.frames?.length || srcImage.height / this.frameHeight
        let animation = this.loadAnimation(data.animation?.frames, data.animation.frametime || 1, nbKeyFrame, srcImage)

        if(data.animation.interpolate)
            animation = this.interpolateAnimation(animation)

        this.magFilter = THREE.NearestFilter
        this.minFilter = THREE.LinearFilter

        this.canvas.width = data.animation.width || srcImage.width
        this.canvas.height = data.animation.height || (srcImage.height / nbKeyFrame)

        return animation
    }

    /**
     * Normalize all the frame of the animation to Frame type and load all the keyframes of this animation
     * @param animation the animation to load, if undefined, the function create a new animation with the specified number of keyframe displayed the specified number of time
     * @param frametime the default display time to apply if the frame is not of Frame type or if the animation is undefined
     * @param nbKeyFrame the number of keyframe in the animation
     * @param srcImage the based image where load animation textures
     */
    loadAnimation(animation: Array<Frame | number> | undefined, frametime: number, nbKeyFrame: number, srcImage: MarvinImage): Array<LoadedFrame> {
        if (animation !== undefined)
            return animation.map(f => this.toFrame(f, frametime))
                .map(i => this.toMarvinImage(i, srcImage))
        return [...Array(nbKeyFrame).keys()]
            .map(i => {
                return this.toMarvinImage({index: i, time: frametime}, srcImage)
            })
    }

    /**
     * Normalize a MCMETA frame. In MCMETA file, a frame can be a number (index of the frame) or a pair (index, time to display)
     * If the frame <i>element</i> is a pair (see Frame type), return it, else return a pair where the time value is the <i>frametime</i> passed in parameter
     * @param element a Frame of a number
     * @param frametime the default time to apply if <i>element</i> is a number
     * @return a normalized frame of type Frame
     */
    toFrame(element: Frame | number, frametime: number): Frame {
        if (typeof element == 'number')
            return {index: element, time: frametime}
        return element
    }

    /**
     * Display the next frame and run the timer for the following frame if animation is activated
     * @param count the frame's index to display, must be between 0 and the number of frame (exclude)
     */
    nextFrame(count: number) {
        const newFrame = this.animation[count]
        newFrame.image.draw(this.canvas, 0, 0, null)
        this.needsUpdate = true
        this.timer = setTimeout(() => this.nextFrame((count + 1) % this.animation.length), computeTime(newFrame.time))
    }

    /**
     * Create intermediate images between all images of <i>data</i> following a linear interpolation between image n and image n+1.
     * There are as much intermediate images between image n and image n+1 as the display time of the image n (minus one) so all frames (including keyframes) of an interpolated animation are displayed during one tick
     * @param data the animation to interpolate
     * @return <i>data</i> with interpolated frames
     */
    interpolateAnimation(data: LoadedFrame[]): Array<LoadedFrame> {
        const slidingWindows = toSlidingWindows(data, 2)
        slidingWindows.push([data.at(-1), data[0]])
        return slidingWindows.flatMap(images => interpolate(images[0].image, images[1].image, images[0].time + 1).slice(0, -1))
            .map(image => {return {image: image, time: 1}})

    }

    /**
     * Load a frame
     * @param frame the frame to load
     * @param srcImage the image where load texture for this frame
     * @return a loaded frame
     */
    toMarvinImage(frame: Frame, srcImage: MarvinImage): LoadedFrame {
        const newImage = new MarvinImage()
        Marvin.crop(srcImage, newImage, 0, frame.index * this.frameHeight, this.frameWidth, this.frameHeight)
        return {image: newImage, time: frame.time}
    }
}

