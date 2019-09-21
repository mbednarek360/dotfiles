interface IVSCodeApi {
    getState(): any;
    setState(state: any): void;
    postMessage(message: object): void;
}

declare function acquireVsCodeApi(): IVSCodeApi;

export default acquireVsCodeApi();