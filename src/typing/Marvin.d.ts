declare module 'marvinj/marvinj/src/image/MarvinImage' {

    export type MarvinImage = {
        image: HTMLImageElement,
        canvas: HTMLCanvasElement,
        ctx: CanvasRenderingContext2D,
        data: any,
        getIntComponent0: (x: number, y: number) => number,
        getIntComponent1: (x: number, y: number) => number,
        getIntComponent2: (x: number, y: number) => number,
        getAlphaComponent: (x: number, y: number) => number,
        setIntColor: (x: number, y: number, alpha: number, red: number, green: number, blue: number) => void
        clone: () => MarvinImage
        getHeight: () => number
        getWidth: () => number
    }
}