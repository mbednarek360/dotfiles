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
const logger_1 = require("./util/logger");
class TaskQueue {
    constructor() {
        this._logger = logger_1.Logger.get('TaskQueue');
        this._taskQueue = {};
    }
    isRunning(queueName) {
        return (this._taskQueue[queueName] &&
            this._taskQueue[queueName].tasks.filter(x => x.isRunning).length > 0);
    }
    numHighPriority(queueName) {
        if (!this._taskQueue[queueName]) {
            return 0;
        }
        return this._taskQueue[queueName].tasks.filter(x => x.isHighPriority).length;
    }
    runTasks(queueName) {
        return __awaiter(this, void 0, void 0, function* () {
            while (this._taskQueue[queueName].tasks.length > 0) {
                let task = this._taskQueue[queueName].tasks[0];
                try {
                    task.isRunning = true;
                    yield task.promise();
                    task.isRunning = false;
                }
                catch (e) {
                    this._logger.error(`Error running task. ${e.message}.`);
                }
                finally {
                    this.dequeueTask(task);
                }
            }
        });
    }
    /**
     * Dequeues a task from the task queue.
     *
     * Note: If the task is already running, the semantics of
     *       promises don't allow you to stop it.
     */
    dequeueTask(task) {
        this._taskQueue[task.queue].tasks = this._taskQueue[task.queue].tasks.filter(t => t !== task);
    }
    /**
     * Adds a task to the task queue.
     */
    enqueueTask(action, queueName = 'default', isHighPriority = false) {
        let task = {
            promise: action,
            queue: queueName,
            isHighPriority: isHighPriority,
            isRunning: false,
        };
        if (!this._taskQueue[queueName]) {
            this._taskQueue[queueName] = {
                tasks: [],
            };
        }
        if (isHighPriority) {
            // Insert task as the last high priotity task.
            const numHighPriority = this.numHighPriority(queueName);
            this._taskQueue[queueName].tasks.splice(numHighPriority, 0, task);
        }
        else {
            this._taskQueue[queueName].tasks.push(task);
        }
        if (!this.isRunning(queueName)) {
            this.runTasks(queueName);
        }
    }
}
exports.taskQueue = new TaskQueue();

//# sourceMappingURL=taskQueue.js.map
