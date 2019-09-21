import createStore from 'redux-zero';
import { IState } from './IState';
import vscodeApi from '../vscode-api';

const initialState: IState = {
    source: {
        uri: vscodeApi.getState() ? vscodeApi.getState().uri : null,
        data: vscodeApi.getState() ? vscodeApi.getState().data : null,
        settings: vscodeApi.getState()? vscodeApi.getState().settings : { showBoundingBox: false }
    },
    scale: 1,
    background: document.querySelector('body')!.classList.contains('vscode-dark') ? 'dark' : 'light',
    sourceImageValidity: false,
};

export default createStore(initialState);
export { actions } from './actions';
export { IState, ISource } from './IState';