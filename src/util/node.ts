export class Node<T> {
    constructor(
        public name: string,
        public index: number,
        public info: T | null = null
    ) {}
}