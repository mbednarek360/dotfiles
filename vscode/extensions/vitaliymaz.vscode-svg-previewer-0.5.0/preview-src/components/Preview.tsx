import { h, FunctionalComponent, Ref } from 'preact';

import { ISettings } from '../store/IState';

interface PreviewProps {
    data: string;
    settings: ISettings;
    attachRef: Ref<HTMLImageElement>;
    dimension: { width: number, height: number, units: string };
    onWheel: JSX.WheelEventHandler;
    background: string;
}

const Preview: FunctionalComponent<PreviewProps> = ({ 
    data, 
    attachRef,
    dimension: { width, height, units }, 
    onWheel,
    background,
    settings
}) => {
    const styles = {
        width: `${width}${units}`,
        minWidth: `${width}${units}`,
        height: `${height}${units}`,
        minHeight: `${height}${units}`
    };
    return (
        <div className={`preview ${background} ${settings.showBoundingBox? 'bounding-box' : ''}`} onWheel={onWheel}>
            <img
                src={`data:image/svg+xml,${encodeURIComponent(data)}`}
                ref={attachRef}
                style={styles}
                alt=""
            />
        </div>
    );
};

export default Preview;