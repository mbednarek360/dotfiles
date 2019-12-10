"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs = require("fs");
const path = require("path");
const logger_1 = require("../util/logger");
const configuration_1 = require("../configuration/configuration");
const util_1 = require("util");
const globals_1 = require("./../globals");
class HistoryFile {
    constructor(historyFileName) {
        this._logger = logger_1.Logger.get('HistoryFile');
        this._history = [];
        this._historyFileName = historyFileName;
    }
    get historyFilePath() {
        return path.join(globals_1.Globals.extensionStoragePath, this._historyFileName);
    }
    add(value) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!value || value.length === 0) {
                return;
            }
            // remove duplicates
            let index = this._history.indexOf(value);
            if (index !== -1) {
                this._history.splice(index, 1);
            }
            // append to the end
            this._history.push(value);
            // resize array if necessary
            if (this._history.length > configuration_1.configuration.history) {
                this._history = this._history.slice(this._history.length - configuration_1.configuration.history);
            }
            return this.save();
        });
    }
    get() {
        // resize array if necessary
        if (this._history.length > configuration_1.configuration.history) {
            this._history = this._history.slice(this._history.length - configuration_1.configuration.history);
        }
        return this._history;
    }
    clear() {
        try {
            this._history = [];
            fs.unlinkSync(this.historyFilePath);
        }
        catch (err) {
            this._logger.warn(`Unable to delete ${this.historyFilePath}. err=${err}.`);
        }
    }
    load() {
        return __awaiter(this, void 0, void 0, function* () {
            let data = '';
            try {
                data = yield util_1.promisify(fs.readFile)(this.historyFilePath, 'utf-8');
            }
            catch (err) {
                if (err.code === 'ENOENT') {
                    this._logger.debug(`History does not exist. path=${this.historyFilePath}`);
                }
                else {
                    this._logger.warn(`Failed to load history. path=${this.historyFilePath} err=${err}.`);
                }
                return;
            }
            if (data.length === 0) {
                return;
            }
            try {
                let parsedData = JSON.parse(data);
                if (!Array.isArray(parsedData)) {
                    throw Error('Unexpected format in history file. Expected JSON.');
                }
                this._history = parsedData;
            }
            catch (e) {
                this._logger.warn(`Deleting corrupted history file. path=${this.historyFilePath} err=${e}.`);
                this.clear();
            }
        });
    }
    save() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // create supplied directory. if directory already exists, do nothing and move on
                try {
                    yield util_1.promisify(fs.mkdir)(globals_1.Globals.extensionStoragePath, { recursive: true });
                }
                catch (createDirectoryErr) {
                    if (createDirectoryErr.code !== 'EEXIST') {
                        throw createDirectoryErr;
                    }
                }
                // create file
                yield util_1.promisify(fs.writeFile)(this.historyFilePath, JSON.stringify(this._history), 'utf-8');
            }
            catch (err) {
                this._logger.error(`Failed to save history. filepath=${this.historyFilePath}. err=${err}.`);
                throw err;
            }
        });
    }
}
exports.HistoryFile = HistoryFile;
class SearchHistory extends HistoryFile {
    constructor() {
        super('.search_history');
    }
}
exports.SearchHistory = SearchHistory;
class CommandLineHistory extends HistoryFile {
    constructor() {
        super('.cmdline_history');
    }
}
exports.CommandLineHistory = CommandLineHistory;

//# sourceMappingURL=historyFile.js.map
