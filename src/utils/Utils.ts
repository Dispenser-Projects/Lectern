/**
 * @param inputArray an array to slide on
 * @param size the side of the window
 * @return a sliding window on the specified array. Example, for table <code>[1, 2, 3, 4]</code> and size 2, the result is <code>[[1, 2], [2, 3], [3, 4]]</code>
 */
export function toSlidingWindows<T>(inputArray: Array<T>, size: number): Array<Array<T>> {
    return Array.from(
        {length: inputArray.length - (size - 1)},
        (_, index) => inputArray.slice(index, index+size)
    )
}
