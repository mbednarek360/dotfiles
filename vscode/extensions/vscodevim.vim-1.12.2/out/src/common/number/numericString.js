"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class NumericString {
    constructor(value, radix, prefix, suffix) {
        this.value = value;
        this.radix = radix;
        this.prefix = prefix;
        this.suffix = suffix;
    }
    static parse(input) {
        for (const { regex, base, prefix } of NumericString.matchings) {
            const match = regex.exec(input);
            if (match == null) {
                continue;
            }
            // Regex to determine if this number has letters around it,
            // if it doesn't then that is easy and no prefix or suffix is needed
            let findNondigits = /[^\d-+]+/g;
            // Regex to find any leading characters before the number
            let findPrefix = /^[^\d-+]+(?=[0-9]+)/g;
            // Regex to find any trailing characters after the number
            let findSuffix = /[^\d]*[\d]*(.*)/g;
            let newPrefix = prefix;
            let newSuffix = '';
            let newNum = input;
            // Only use this section if this is a number surrounded by letters
            if (findNondigits.exec(input) !== null &&
                NumericString.matchings[NumericString.matchings.length - 1].regex === regex) {
                let prefixFound = findPrefix.exec(input);
                let suffixFound = findSuffix.exec(input);
                // Find the prefix if it exists
                if (prefixFound !== null) {
                    newPrefix = prefixFound.toString();
                }
                // Find the suffix if it exists
                if (suffixFound !== null) {
                    newSuffix = suffixFound[1].toString();
                }
                // Obtain just the number with no extra letters
                newNum = newNum.slice(newPrefix.length, newNum.length - newSuffix.length);
            }
            return new NumericString(parseInt(newNum, base), base, newPrefix, newSuffix);
        }
        return null;
    }
    toString() {
        // Allow signed hex represented as twos complement
        if (this.radix === 16) {
            if (this.value < 0) {
                this.value = 0xffffffff + this.value + 1;
            }
        }
        return this.prefix + this.value.toString(this.radix) + this.suffix;
    }
}
exports.NumericString = NumericString;
NumericString.matchings = [
    { regex: /^([-+])?0([0-7]+)$/, base: 8, prefix: '0' },
    { regex: /^([-+])?(\d+)$/, base: 10, prefix: '' },
    { regex: /^([-+])?0x([\da-fA-F]+)$/, base: 16, prefix: '0x' },
    { regex: /\d/, base: 10, prefix: '' },
];

//# sourceMappingURL=numericString.js.map
