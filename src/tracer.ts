import { StringUtils } from './util/stringUtils';

class Entry {
    constructor(
        public timeMillis: number,
        public id: number
    ) {}
}

export class Tracer {
    private enable: boolean = false;
    private stack: Entry[] = [];
    private printer: (msg: string) => void;

    constructor();
    constructor(printer: (msg: string) => void);
    constructor(printer?: (msg: string) => void) {
        this.printer = printer || ((msg: string) => console.log(msg));
        this.stack.push(new Entry(Date.now(), 0));
    }

    public isEnable(): boolean {
        return this.enable;
    }

    public setEnable(isTrace: boolean): void {
        this.enable = isTrace;
    }

    public println(message: string, ...args: any[]): void {
        message = `[trace] ${message || ""}`;
        this.printTrace(message);
    }

    public startTimer(): void;
    public startTimer(message: string, ...args: any[]): void;
    public startTimer(message?: string, ...args: any[]): void {
        if (!this.enable) return;
        
        const entry = this.newTimeEntry();
        this.stack.push(entry);
        
        const blanks = this.makeBlank(entry.id - 1);
        let msg = `${blanks}[trace${entry.id}]start `;
        
        if (message && StringUtils.isNotEmpty(message)) {
            msg += this.format(message, ...args);
        }
        
        this.printTrace(msg);
    }

    public endTimer(message?: string, ...args: any[]): void {
        if (!this.enable) return;
        
        const entry = this.stack.pop()!;
        const time = Date.now() - entry.timeMillis;
        const blanks = this.makeBlank(entry.id - 1);
        
        let msg = `${blanks}[trace${entry.id}]end:${time}ms `;
        
        if (message && StringUtils.isNotEmpty(message)) {
            msg += this.format(message, ...args);
        }
        
        this.printTrace(msg);
        
        if (this.stack.length === 0) {
            this.stack.push(new Entry(Date.now(), 0));
        }
    }

    private newTimeEntry(): Entry {
        const lastId = this.stack[this.stack.length - 1].id;
        return new Entry(Date.now(), lastId + 1);
    }

    private printTrace(message: string): void {
        if (this.printer) {
            this.printer(message + "\n");
        }
    }

    private makeBlank(n: number): string {
        if (n <= 0) return "";
        return " ".repeat(n);
    }

    private format(message: string, ...args: any[]): string {
        return message.replace(/%s/g, () => String(args.shift()));
    }
}