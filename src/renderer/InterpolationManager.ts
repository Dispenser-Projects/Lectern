import {MarvinImage} from "marvinj-ts";

/**
 * Create intermediate images between the two images passed in parameter following a linear interpolation
 * @param image1 the starting image of the interpolation
 * @param image2 the ending image of the interpolation
 * @param nbImage the number of images desired, including starting and ending images
 * @return an array of images where the first image is the starting image, the last image is the ending image and all images between these two are interpolated images
 */
export function interpolate(image1: MarvinImage, image2: MarvinImage, nbImage: number): Array<MarvinImage> {
    nbImage--
    const array: Array<MarvinImage> = []
    for(let i = 0; i <= nbImage; i++)
        array.push(computeImage(image1, image2, nbImage, i))
    return array
}

/**
 * Compute the nth image of the interpolation array
 * @param image1 the starting image of the interpolation
 * @param image2 the ending image of the interpolation
 * @param nbImage the number of images desired, including starting and ending images
 * @param desiredImagePosition the index of the desired image between <i>image1</i> (index 0) and <i>image2</i> (index nbImage - 1)
 * @return the nth interpolated image between <i>image1</i> and <i>image2</i>
 */
function computeImage(image1: MarvinImage, image2: MarvinImage, nbImage: number, desiredImagePosition: number): MarvinImage {
    const img = image1.clone()
    for(let y = 0; y < image1.getHeight(); y++) {
        for(let x = 0; x < image1.getWidth(); x++) {
            const red = numberLinearInterpolation(image1.getIntComponent0(x, y), image2.getIntComponent0(x, y), nbImage, desiredImagePosition);
            const green = numberLinearInterpolation(image1.getIntComponent1(x, y), image2.getIntComponent1(x, y), nbImage, desiredImagePosition);
            const blue = numberLinearInterpolation(image1.getIntComponent2(x, y), image2.getIntComponent2(x, y), nbImage, desiredImagePosition);
            const alpha = numberLinearInterpolation(image1.getAlphaComponent(x, y), image2.getAlphaComponent(x, y), nbImage, desiredImagePosition);
            img.setIntColor(x, y, alpha, red, green, blue);
        }
    }
    return img
}

/**
 * Compute the nth interpolated value between <i>value1</i> and <i>value2</i>
 * @param value1 the starting value of the interpolation
 * @param value2 the ending value of the interpolation
 * @param nbValue the number of value of the interpolation
 * @param n the wanted value position in the interpolation
 */
function numberLinearInterpolation(value1: number, value2: number, nbValue: number, n: number) {
    return (value2 - value1) / nbValue * n + value1
}
