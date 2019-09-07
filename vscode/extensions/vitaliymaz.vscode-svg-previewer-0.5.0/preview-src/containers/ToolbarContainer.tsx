import { h, Component } from 'preact';
import { connect } from 'redux-zero/preact';
import Toolbar from '../components/Toolbar';
import { actions, IState, ISource } from '../store';
import { getByteCountByContent, humanFileSize } from '../utils/fileSize';
import telemetryReporter from '../messaging/telemetry';

const SCALE_STEP = 0.5;

interface ToolbarContainerProps {
    changeBackground: Function;
    zoomIn: Function;
    zoomOut: Function;
    zoomReset: Function;
    source: ISource;
    sourceImageValidity: boolean;
}

interface ToolbarContainerState {
    activeBtn?: string;
}

class ToolbarContainer extends Component<ToolbarContainerProps, ToolbarContainerState> {

    componentDidMount() {
        window.document.addEventListener('mouseup', this.onBtnMouseUp);
    }

    componentWillUnmount() {
        window.document.removeEventListener('mouseup', this.onBtnMouseUp);
    }

    onChangeBackgroundButtonClick = (e: MouseEvent) => {
        this.props.changeBackground(e.srcElement!.getAttribute('name'));
    }

    getFileSize() {
        return this.props.source.data ?  humanFileSize(getByteCountByContent(this.props.source.data)) : '0 B';
    }

    onBtnMouseDown = (e: MouseEvent) => {
        this.setState({ activeBtn: (e.currentTarget as HTMLButtonElement)!.name });
    }

    onBtnMouseUp = () => {
        this.setState({ activeBtn: '' });
    }

    zoomIn = () => {
        this.props.zoomIn(SCALE_STEP);
        telemetryReporter.sendZoomEvent('in', 'toolbar');
    }

    zoomOut = () => {
        this.props.zoomOut(SCALE_STEP);
        telemetryReporter.sendZoomEvent('out', 'toolbar');
    }

    render() {
        return (
            <Toolbar 
                onChangeBackgroundButtonClick={this.onChangeBackgroundButtonClick}
                zoomIn={this.zoomIn}
                zoomOut={this.zoomOut}
                zoomReset={this.props.zoomReset}
                fileSize={this.getFileSize()}
                sourceImageValidity={this.props.sourceImageValidity}
                onBtnMouseDown={this.onBtnMouseDown}
                activeBtn={this.state.activeBtn}
            />
        );
    }
}

const mapToProps = (state: IState) => ({ source: state.source, sourceImageValidity: state.sourceImageValidity });

export default connect(mapToProps, actions)(ToolbarContainer);