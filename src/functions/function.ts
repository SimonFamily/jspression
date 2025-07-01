import { Callable } from "./callable";
import { Value } from "../values/value";

export abstract class Function implements Callable {
    constructor(
        private readonly name: string,
        private readonly title: string,
        private readonly group: string
    ) {}

    public getName(): string {
        return this.name;
    }

    public getTitle(): string {
        return this.title;
    }

    public getGroup(): string {
        return this.group;
    }

    public abstract arity(): number;

    public abstract call(args: Value[]): Value;
}