export interface Page {
    count: number,
    next: string,
    previous: string,
    elements: Array<Element>
}

interface Element {
    id: string,
    url: string
}
