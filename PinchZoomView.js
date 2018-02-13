import React from 'react';
import PropTypes from 'prop-types';
import { ScrollView } from 'react-native';

class PinchZoomView extends React.Component {
  state = {
    lastTouchStartNativeEvent: {},
    lastTouchEndTimestamp: 0,
    lastZoomActionTimestamp: 0,
    isZoomed: false,
  };

  onScroll = (e) => {
    this.props.onScrollOrZoom(e);
    this.setState({ isZoomed: e.nativeEvent.zoomScale > 1 });
  };

  onTouchStart = (e) => {
    if (this.isMultiTouch(e)) return;

    this.setState({ lastTouchStartNativeEvent: e.nativeEvent });
  };

  onTouchEnd = (e) => {
    const { timestamp } = e.nativeEvent;
    const { zoomInTrigger, zoomOutTrigger } = this.props;

    const trigger = this.state.isZoomed ? zoomOutTrigger : zoomInTrigger;
    const actionToPerform = this.state.isZoomed ? this.zoomOut : this.zoomIn;

    if (this.isLongPress(e) || this.isMoving(e) || this.isMultiTouch(e)) return;

    // switch (trigger) {
    //   case 'singletap':
    //     actionToPerform(e);
    //     break;
    //   case 'doubletap':
    //     if (this.isSecondTap(e)) actionToPerform(e);
    //     break;
    //   default:
    // }

    this.setState({ lastTouchEndTimestamp: timestamp });
  };

  zoomIn = (e) => {
    const { locationX: x, locationY: y, timestamp } = e.nativeEvent;
    const coords = { x, y, width: 0, height: 0 };

    if (this.isAlreadyZooming(e)) return;

    this.scrollView.scrollResponderZoomTo(coords);
    this.setState({ lastZoomActionTimestamp: timestamp });
  };

  zoomOut = (e) => {
    const { locationX: x, locationY: y, timestamp } = e.nativeEvent;
    const coords = { x, y, width: 10000, height: 10000 };

    if (this.isAlreadyZooming(e)) return;

    this.scrollView.scrollResponderZoomTo(coords);
    this.setState({ lastZoomActionTimestamp: timestamp });
  };

  isSecondTap = (e) => {
    const { timestamp } = e.nativeEvent;

    return timestamp - this.state.lastTouchEndTimestamp <= 300;
  };

  isLongPress = (e) => {
    console.log('e', e.nativeEvent);
    const { timestamp } = e.nativeEvent;
    const { timestamp: lastTimestamp } = this.state.lastTouchStartNativeEvent;

    return timestamp - lastTimestamp >= 300;
  };

  isMoving = (e) => {
    const { locationX, locationY } = e.nativeEvent;
    const { locationX: lastLocationX, locationY: lastLocationY } = this.state.lastTouchStartNativeEvent;

    return locationX !== lastLocationX && locationY !== lastLocationY;
  };

  isMultiTouch = ({ nativeEvent: { touches } }) => touches.length > 1;

  isAlreadyZooming = (e) => {
    const { timestamp } = e.nativeEvent;

    return timestamp - this.state.lastZoomActionTimestamp <= 500;
  };

  render() {
    return (
      <ScrollView
        ref={(ref) => { this.scrollView = ref; }}
        onLayout={this.props.onLayout}
        onScroll={this.onScroll}
        onTouchStart={this.onTouchStart}
        onTouchEnd={this.onTouchEnd}
        scrollEventThrottle={100}
        scrollsToTop={false}
        alwaysBounceVertical={false}
        alwaysBounceHorizontal={false}
        automaticallyAdjustContentInsets={false}
        showsHorizontalScrollIndicator={false}
        showsVerticalScrollIndicator={false}
        maximumZoomScale={this.props.zoomScale}
        // centerContent
      >
        {this.props.children}
      </ScrollView>
    );
  }
}

PinchZoomView.propTypes = {
  children: PropTypes.element.isRequired,
  onLayout: PropTypes.func,
  onScrollOrZoom: PropTypes.func,
  zoomScale: PropTypes.number,
  zoomInTrigger: PropTypes.oneOf(['singletap', 'doubletap', 'longpress']),
  zoomOutTrigger: PropTypes.oneOf(['singletap', 'doubletap', 'longpress']),
};

PinchZoomView.defaultProps = {
  onLayout: () => {},
  onScrollOrZoom: () => {},
  zoomScale: 4,
  zoomInTrigger: 'doubletap',
  zoomOutTrigger: 'singletap',
};

export default PinchZoomView;