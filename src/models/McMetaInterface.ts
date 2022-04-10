export module McMetaModule {

    export interface McMeta {
        animation: Animation
    }

    export interface Animation {
        interpolate: boolean,
        width?: number,
        height?: number,
        frametime: number,
        frames: Array<number | Frame>
    }

    export interface Frame {
        index: number
        time: number
    }

}
