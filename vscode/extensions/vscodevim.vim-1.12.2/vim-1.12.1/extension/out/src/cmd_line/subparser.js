"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const close_1 = require("./subparsers/close");
const deleteRange_1 = require("./subparsers/deleteRange");
const digraph_1 = require("./subparsers/digraph");
const fileCmd = require("./subparsers/file");
const nohl_1 = require("./subparsers/nohl");
const only_1 = require("./subparsers/only");
const quit_1 = require("./subparsers/quit");
const read_1 = require("./subparsers/read");
const register_1 = require("./subparsers/register");
const setoptions_1 = require("./subparsers/setoptions");
const sort_1 = require("./subparsers/sort");
const substitute_1 = require("./subparsers/substitute");
const tabCmd = require("./subparsers/tab");
const wall_1 = require("./subparsers/wall");
const write_1 = require("./subparsers/write");
const writequit_1 = require("./subparsers/writequit");
const writequitall_1 = require("./subparsers/writequitall");
const fileInfo_1 = require("./subparsers/fileInfo");
const marks_1 = require("./subparsers/marks");
const smile_1 = require("./subparsers/smile");
const history_1 = require("./subparsers/history");
exports.commandParsers = {
    write: {
        abbrev: 'w',
        parser: write_1.parseWriteCommandArgs,
    },
    wall: {
        abbrev: 'wa',
        parser: wall_1.parseWallCommandArgs,
    },
    nohlsearch: {
        abbrev: 'noh',
        parser: nohl_1.parseNohlCommandArgs,
    },
    close: {
        abbrev: 'clo',
        parser: close_1.parseCloseCommandArgs,
    },
    quit: {
        abbrev: 'q',
        parser: quit_1.parseQuitCommandArgs,
    },
    qall: {
        abbrev: 'qa',
        parser: quit_1.parseQuitAllCommandArgs,
    },
    quitall: {
        abbrev: 'quita',
        parser: quit_1.parseQuitAllCommandArgs,
    },
    wq: {
        parser: writequit_1.parseWriteQuitCommandArgs,
    },
    x: {
        parser: writequit_1.parseWriteQuitCommandArgs,
    },
    wqall: {
        abbrev: 'wqa',
        parser: writequitall_1.parseWriteQuitAllCommandArgs,
    },
    xall: {
        abbrev: 'xa',
        parser: writequitall_1.parseWriteQuitAllCommandArgs,
    },
    tabnext: {
        abbrev: 'tabn',
        parser: tabCmd.parseTabNCommandArgs,
    },
    tabprevious: {
        abbrev: 'tabp',
        parser: tabCmd.parseTabPCommandArgs,
    },
    tabNext: {
        abbrev: 'tabN',
        parser: tabCmd.parseTabPCommandArgs,
    },
    tabfirst: {
        abbrev: 'tabfir',
        parser: tabCmd.parseTabFirstCommandArgs,
    },
    tablast: {
        abbrev: 'tabl',
        parser: tabCmd.parseTabLastCommandArgs,
    },
    tabedit: {
        abbrev: 'tabe',
        parser: tabCmd.parseTabNewCommandArgs,
    },
    tabnew: {
        parser: tabCmd.parseTabNewCommandArgs,
    },
    tabclose: {
        abbrev: 'tabc',
        parser: tabCmd.parseTabCloseCommandArgs,
    },
    tabonly: {
        abbrev: 'tabo',
        parser: tabCmd.parseTabOnlyCommandArgs,
    },
    tabmove: {
        abbrev: 'tabm',
        parser: tabCmd.parseTabMovementCommandArgs,
    },
    substitute: {
        abbrev: 's',
        parser: substitute_1.parseSubstituteCommandArgs,
    },
    smile: {
        parser: smile_1.parseSmileCommandArgs,
    },
    edit: {
        abbrev: 'e',
        parser: fileCmd.parseEditFileCommandArgs,
    },
    enew: {
        abbrev: 'ene',
        parser: fileCmd.parseEditNewFileCommandArgs,
    },
    split: {
        abbrev: 'sp',
        parser: fileCmd.parseEditFileInNewHorizontalWindowCommandArgs,
    },
    vsplit: {
        abbrev: 'vs',
        parser: fileCmd.parseEditFileInNewVerticalWindowCommandArgs,
    },
    new: {
        parser: fileCmd.parseEditNewFileInNewHorizontalWindowCommandArgs,
    },
    vnew: {
        abbrev: 'vne',
        parser: fileCmd.parseEditNewFileInNewVerticalWindowCommandArgs,
    },
    only: {
        abbrev: 'on',
        parser: only_1.parseOnlyCommandArgs,
    },
    set: {
        abbrev: 'se',
        parser: setoptions_1.parseOptionsCommandArgs,
    },
    read: {
        abbrev: 'r',
        parser: read_1.parseReadCommandArgs,
    },
    registers: {
        abbrev: 'reg',
        parser: register_1.parseRegisterCommandArgs,
    },
    display: {
        abbrev: 'reg',
        parser: register_1.parseRegisterCommandArgs,
    },
    digraphs: {
        abbrev: 'dig',
        parser: digraph_1.parseDigraphCommandArgs,
    },
    delete: {
        abbrev: 'd',
        parser: deleteRange_1.parseDeleteRangeLinesCommandArgs,
    },
    sort: {
        abbrev: 'sor',
        parser: sort_1.parseSortCommandArgs,
    },
    file: {
        abbrev: 'f',
        parser: fileInfo_1.parseFileInfoCommandArgs,
    },
    marks: {
        parser: marks_1.parseMarksCommandArgs,
    },
    history: {
        abbrev: 'his',
        parser: history_1.parseHistoryCommandArgs,
    },
};
/**
 * Returns a command parser for the given `input`, if one exists.
 * Resolves `q`, `qu`, `qui`, and `quit` the same.
 */
function getParser(input) {
    if (input === '') {
        return undefined;
    }
    for (const fullName of Object.keys(exports.commandParsers)) {
        const parserMapping = exports.commandParsers[fullName];
        if (parserMapping.abbrev !== undefined) {
            if (input.startsWith(parserMapping.abbrev) && fullName.startsWith(input)) {
                return parserMapping.parser;
            }
        }
        else {
            if (input === fullName) {
                return parserMapping.parser;
            }
        }
    }
    return undefined;
}
exports.getParser = getParser;

//# sourceMappingURL=subparser.js.map
