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
const _ = require("lodash");
const fs = require("fs");
const path = require("path");
const vimrcKeyRemappingBuilder_1 = require("./vimrcKeyRemappingBuilder");
class VimrcImpl {
    /**
     * Fully resolved path to the user's .vimrc
     */
    get vimrcPath() {
        return this._vimrcPath;
    }
    load(config) {
        return __awaiter(this, void 0, void 0, function* () {
            const _path = config.vimrc.path
                ? VimrcImpl.expandHome(config.vimrc.path)
                : VimrcImpl.findDefaultVimrc();
            if (!_path || !fs.existsSync(_path)) {
                // TODO: we may want to offer to create the file for them
                throw new Error(`Unable to find .vimrc file`);
            }
            this._vimrcPath = _path;
            // Remove all the old remappings from the .vimrc file
            VimrcImpl.removeAllRemapsFromConfig(config);
            // Add the new remappings
            const lines = fs.readFileSync(this.vimrcPath, { encoding: 'utf8' }).split(/\r?\n/);
            for (const line of lines) {
                const remap = yield vimrcKeyRemappingBuilder_1.vimrcKeyRemappingBuilder.build(line);
                if (remap) {
                    VimrcImpl.addRemapToConfig(config, remap);
                }
            }
        });
    }
    /**
     * Adds a remapping from .vimrc to the given configuration
     */
    static addRemapToConfig(config, remap) {
        const remaps = (() => {
            switch (remap.keyRemappingType) {
                case 'nmap':
                    return config.normalModeKeyBindings;
                case 'vmap':
                    return config.visualModeKeyBindings;
                case 'imap':
                    return config.insertModeKeyBindings;
                case 'nnoremap':
                    return config.normalModeKeyBindingsNonRecursive;
                case 'vnoremap':
                    return config.visualModeKeyBindingsNonRecursive;
                case 'inoremap':
                    return config.insertModeKeyBindingsNonRecursive;
                default:
                    return undefined;
            }
        })();
        // Don't override a mapping present in settings.json; those are more specific to VSCodeVim.
        if (remaps && !remaps.some(r => _.isEqual(r.before, remap.keyRemapping.before))) {
            remaps.push(remap.keyRemapping);
        }
    }
    static removeAllRemapsFromConfig(config) {
        const remapCollections = [
            config.normalModeKeyBindings,
            config.visualModeKeyBindings,
            config.insertModeKeyBindings,
            config.normalModeKeyBindingsNonRecursive,
            config.visualModeKeyBindingsNonRecursive,
            config.insertModeKeyBindingsNonRecursive,
        ];
        for (const remaps of remapCollections) {
            _.remove(remaps, remap => remap.source === 'vimrc');
        }
    }
    static findDefaultVimrc() {
        if (process.env.HOME) {
            let vimrcPath = path.join(process.env.HOME, '.vimrc');
            if (fs.existsSync(vimrcPath)) {
                return vimrcPath;
            }
            vimrcPath = path.join(process.env.HOME, '_vimrc');
            if (fs.existsSync(vimrcPath)) {
                return vimrcPath;
            }
        }
        return undefined;
    }
    static expandHome(filePath) {
        if (!process.env.HOME) {
            return filePath;
        }
        if (!filePath.startsWith('~')) {
            return filePath;
        }
        return path.join(process.env.HOME, filePath.slice(1));
    }
}
exports.vimrc = new VimrcImpl();

//# sourceMappingURL=vimrc.js.map
