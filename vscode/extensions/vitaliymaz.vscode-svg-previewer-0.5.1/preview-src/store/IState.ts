export type ISettings = { showBoundingBox: boolean };
export type ISource = { uri: string, data: string, settings: ISettings };
export type IBackground = 'dark' | 'light' | 'transparent';

export interface IState {
    source: ISource;
    scale: number;
    background: IBackground;
    sourceImageValidity: boolean;
}