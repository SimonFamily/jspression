import { Scanner } from "../../src/parser/scanner"
import { Token } from "../../src/parser/token";

describe("scanner test", () => {
    it("test", () => {
        const src = 'a + b * c - 100 / 5 ** 2 ** 1';
        const scanner = new Scanner(src)
        const tokens = scanner.scanTokens()
        expect(tokens.length).toBe(14)
        for (let token of tokens) {
            console.log(tokens)
        }
    })
})