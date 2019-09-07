"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function createCancellationToken() {
    let resolver;
    const result = new Promise((resolve) => resolver = resolve);
    return [result, resolver];
}
function createScheduler(executer, resolve, reject) {
    const maxConcurrentTasks = 4;
    // The running task queue.
    const q = [];
    return async (...args) => {
        const [cancelPromise, cancel] = createCancellationToken();
        if (q.length < maxConcurrentTasks) {
            // We can schedule the execution immediately.
            q.push(cancel);
        }
        else {
            // Cancel the oldest task.
            q[0]();
            q.shift();
            q.push(cancel);
        }
        let resolveAction;
        try {
            const result = await executer(cancelPromise, ...args);
            resolveAction = () => resolve(result);
        }
        catch (error) {
            resolveAction = () => reject(error);
        }
        // Get the index of the current task in the task queue.
        const index = q.indexOf(cancel);
        if (index < 0) {
            // This task is obsolete, ignore the result.
        }
        else {
            // Cancel obselete tasks.
            for (let i = 0; i < index; i++) {
                q[i]();
            }
            // Remove obselete and current task.
            q.splice(0, index + 1);
            resolveAction();
        }
    };
}
exports.createScheduler = createScheduler;
//# sourceMappingURL=scheduler.js.map