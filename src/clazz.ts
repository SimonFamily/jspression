import { ClazzMethod } from "./functions/clazzMethod";

export class Clazz {
    constructor(
        public readonly name: string,
        public readonly superClass: Clazz | null,
        public readonly methods: Map<string, ClazzMethod>
    ) {}
}