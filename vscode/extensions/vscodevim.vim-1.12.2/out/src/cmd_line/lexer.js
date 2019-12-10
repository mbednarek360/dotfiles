"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const scanner_1 = require("./scanner");
const token_1 = require("./token");
function lex(input) {
    // We use a character scanner as state for the lexer.
    const state = new scanner_1.Scanner(input);
    let tokens = [];
    let f = LexerFunctions.lexRange;
    while (f) {
        // Each lexing function returns the next lexing function or null.
        f = f(state, tokens);
    }
    return tokens;
}
exports.lex = lex;
function emitToken(type, state) {
    const content = state.emit();
    return content.length > 0 ? new token_1.Token(type, content) : null;
}
var LexerFunctions;
(function (LexerFunctions) {
    // Starts lexing a Vim command line and delegates on other lexer functions as needed.
    function lexRange(state, tokens) {
        while (true) {
            if (state.isAtEof) {
                break;
            }
            const c = state.next();
            switch (c) {
                case ',':
                case ';':
                    tokens.push(emitToken(token_1.TokenType.Comma, state));
                    continue;
                case '%':
                    tokens.push(emitToken(token_1.TokenType.Percent, state));
                    continue;
                case '$':
                    tokens.push(emitToken(token_1.TokenType.Dollar, state));
                    continue;
                case '.':
                    tokens.push(emitToken(token_1.TokenType.Dot, state));
                    continue;
                case '/':
                    return lexForwardSearch;
                case '?':
                    return lexReverseSearch;
                case '0':
                case '1':
                case '2':
                case '3':
                case '4':
                case '5':
                case '6':
                case '7':
                case '8':
                case '9':
                    if (tokens.length < 1) {
                        // special case - first digitey token is always a line number
                        return lexDigits(token_1.TokenType.LineNumber);
                    }
                    else {
                        // otherwise, use previous token to determine which flavor of digit lexer should be used
                        const previousTokenType = tokens[tokens.length - 1].type;
                        if (previousTokenType === token_1.TokenType.Plus || previousTokenType === token_1.TokenType.Minus) {
                            return lexDigits(token_1.TokenType.Offset);
                        }
                        else {
                            return lexDigits(token_1.TokenType.LineNumber);
                        }
                    }
                case '+':
                    tokens.push(emitToken(token_1.TokenType.Plus, state));
                    continue;
                case '-':
                    tokens.push(emitToken(token_1.TokenType.Minus, state));
                    continue;
                case '*':
                    state.emit();
                    tokens.push(new token_1.Token(token_1.TokenType.SelectionFirstLine, '<'));
                    tokens.push(new token_1.Token(token_1.TokenType.Comma, ','));
                    tokens.push(new token_1.Token(token_1.TokenType.SelectionLastLine, '>'));
                    continue;
                case "'":
                    return lexMark;
                default:
                    return lexCommand;
            }
        }
        return null;
    }
    LexerFunctions.lexRange = lexRange;
    function lexMark(state, tokens) {
        // The first token has already been lexed.
        if (state.isAtEof) {
            return null;
        }
        const c = state.next();
        switch (c) {
            case '<':
                tokens.push(emitToken(token_1.TokenType.SelectionFirstLine, state));
                break;
            case '>':
                tokens.push(emitToken(token_1.TokenType.SelectionLastLine, state));
                break;
            default:
                if (/[a-zA-Z]/.test(c)) {
                    state.emit();
                    tokens.push(new token_1.Token(token_1.TokenType.Mark, c));
                }
                else {
                    state.backup();
                }
                break;
        }
        return lexRange;
    }
    /**
     * when we're lexing digits, it could either be a line number or an offset, depending on whether
     * our previous token was a + or a -
     *
     * so it's lexRange's job to specify which token to emit.
     */
    function lexDigits(tokenType) {
        return function (state, tokens) {
            // The first digit has already been lexed.
            while (true) {
                if (state.isAtEof) {
                    tokens.push(emitToken(tokenType, state));
                    return null;
                }
                if (!/[0-9]/.test(state.next())) {
                    state.backup();
                    tokens.push(emitToken(tokenType, state));
                    return lexRange;
                }
            }
        };
    }
    function lexCommand(state, tokens) {
        // The first character of the command's name has already been lexed.
        while (true) {
            if (state.isAtEof) {
                tokens.push(emitToken(token_1.TokenType.CommandName, state));
                break;
            }
            const c = state.next().toLowerCase();
            if (c >= 'a' && c <= 'z') {
                continue;
            }
            else {
                state.backup();
                tokens.push(emitToken(token_1.TokenType.CommandName, state));
                while (!state.isAtEof) {
                    state.next();
                }
                // TODO(guillermooo): We need to parse multiple commands.
                const args = emitToken(token_1.TokenType.CommandArgs, state);
                if (args) {
                    tokens.push(args);
                }
                break;
            }
        }
        return null;
    }
    function lexForwardSearch(state, tokens) {
        // The first slash has already been lexed.
        state.skip('/'); // XXX: really?
        let escaping = false;
        let searchTerm = '';
        while (!state.isAtEof) {
            const c = state.next();
            if (c === '/' && !escaping) {
                break;
            }
            if (c === '\\') {
                escaping = true;
                continue;
            }
            else {
                escaping = false;
            }
            searchTerm += c !== '\\' ? c : '\\\\';
        }
        tokens.push(new token_1.Token(token_1.TokenType.ForwardSearch, searchTerm));
        state.ignore();
        if (!state.isAtEof) {
            state.skip('/');
        }
        return lexRange;
    }
    function lexReverseSearch(state, tokens) {
        // The first question mark has already been lexed.
        state.skip('?'); // XXX: really?
        let escaping = false;
        let searchTerm = '';
        while (!state.isAtEof) {
            const c = state.next();
            if (c === '?' && !escaping) {
                break;
            }
            if (c === '\\') {
                escaping = true;
                continue;
            }
            else {
                escaping = false;
            }
            searchTerm += c !== '\\' ? c : '\\\\';
        }
        tokens.push(new token_1.Token(token_1.TokenType.ReverseSearch, searchTerm));
        state.ignore();
        if (!state.isAtEof) {
            state.skip('?');
        }
        return lexRange;
    }
})(LexerFunctions || (LexerFunctions = {}));

//# sourceMappingURL=lexer.js.map
