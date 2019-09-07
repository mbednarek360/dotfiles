"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const lexer = require("./lexer");
const node = require("./node");
const token = require("./token");
const logger_1 = require("../util/logger");
const error_1 = require("../error");
const subparser_1 = require("./subparser");
function parse(input) {
    const cmd = new node.CommandLine();
    let f = parseLineRange;
    let state = new ParserState(input);
    while (f) {
        f = f(state, cmd);
    }
    return cmd;
}
exports.parse = parse;
function parseLineRange(state, commandLine) {
    const logger = logger_1.Logger.get('Parser');
    while (true) {
        let tok = state.next();
        switch (tok.type) {
            case token.TokenType.Eof:
                return null;
            case token.TokenType.Dot:
            case token.TokenType.Dollar:
            case token.TokenType.Percent:
            case token.TokenType.Comma:
            case token.TokenType.LineNumber:
            case token.TokenType.SelectionFirstLine:
            case token.TokenType.SelectionLastLine:
            case token.TokenType.Mark:
            case token.TokenType.Offset:
            case token.TokenType.Plus:
            case token.TokenType.Minus:
                commandLine.range.addToken(tok);
                continue;
            case token.TokenType.CommandName:
                state.backup();
                return parseCommand;
            // commandLine.command = new node.CommandLineCommand(tok.content, null);
            // continue;
            default:
                logger.warn('Parser: skipping token ' + 'Token(' + tok.type + ',{' + tok.content + '})');
                return null;
        }
    }
}
function parseCommand(state, commandLine) {
    while (!state.isAtEof) {
        const tok = state.next();
        switch (tok.type) {
            case token.TokenType.CommandName:
                const commandParser = subparser_1.commandParsers[tok.content];
                if (!commandParser) {
                    throw error_1.VimError.fromCode(error_1.ErrorCode.E492);
                }
                // TODO: Pass the args, but keep in mind there could be multiple
                // commands, not just one.
                const argsTok = state.next();
                const args = argsTok.type === token.TokenType.CommandArgs ? argsTok.content : null;
                commandLine.command = commandParser(args);
                return null;
            default:
                throw new Error('Not implemented');
        }
    }
    if (!state.isAtEof) {
        state.backup();
        return parseCommand;
    }
    else {
        return null;
    }
}
// Keeps track of parsing state.
class ParserState {
    constructor(input) {
        this.tokens = [];
        this.pos = 0;
        this.lex(input);
    }
    lex(input) {
        this.tokens = lexer.lex(input);
    }
    next() {
        if (this.pos >= this.tokens.length) {
            this.pos = this.tokens.length;
            return new token.Token(token.TokenType.Eof, '__EOF__');
        }
        let tok = this.tokens[this.pos];
        this.pos++;
        return tok;
    }
    backup() {
        this.pos--;
    }
    get isAtEof() {
        return this.pos >= this.tokens.length;
    }
}

//# sourceMappingURL=parser.js.map
