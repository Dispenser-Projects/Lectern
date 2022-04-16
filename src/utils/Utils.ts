function toSlidingWindows<T>(inputArray: Array<T>, size: number): Array<Array<T>> {
    return Array.from(
        {length: inputArray.length - (size - 1)},
        (_, index) => inputArray.slice(index, index+size)
    )
}

export {toSlidingWindows}
