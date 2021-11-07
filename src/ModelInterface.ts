export module McModel {

    export interface Model {
        parent: string
        ambientOcclusion: boolean
        display: {
            [position in PositionEnum]: Position
        }
        textures: {
            particle: string
            [variable: string]: string
        }
        elements: Element[]
    }

    export interface Position {
        rotation: number[]
        translation: number[]
        scale: number[]
    }

    export interface Element {

        from: number[]
        to: number[]
        rotation: {
            origin: number[]
            axis: Axis
            angle: number
            rescale: boolean
        }
        shade: boolean
        faces: {
            [face in FaceEnum]: Face
        }
    }

    export interface Face {
        uv: number[]
        texture: string
        cullface: CullFace
        rotation: number
        tintindex: number
    }

    export enum PositionEnum {
        THIRDPERSON_RIGHTHAND = 'thirdperson_righthand',
        THIRDPERSON_LEFTHAND = 'thirdperson_lefthand',
        FIRSTPERSON_RIGHTHAND = 'firstperson_righthand',
        FIRSTPERSON_LEFTHAND = 'firstperson_lefthand',
        GUI = 'gui',
        HEAD = 'head',
        GROUND = 'ground',
        FIXED = 'fixed'
    }

    export enum CullFace {
        DOWN = 'down', UP = 'up', NORTH = 'north', SOUTH = 'south', WEST = 'west', EAST = 'east', BOTTOM = 'bottom'
    }

    export enum FaceEnum {
        DOWN = 'down', UP = 'up', NORTH = 'north', SOUTH = 'south', WEST = 'west', EAST = 'east'
    }

    export enum Axis {
        X = 'x', Y = 'y', Z = 'z'
    }
}
