import React, { Component } from "react";
import PropTypes from "prop-types";

import QRCode from "qrcode.react";
import { Grid, Button } from "@material-ui/core";

export const HermitQRCode = ({
  width = 640, // px
  index,
  parts,
  onCancel,
  onNext,
  nextText = "Scan",
}) => {
  return (
    <div style={{ padding: "3rem" }}>
      <h6>
        QR Code{" "}
        <span data-testid="quorum">
          {index + 1} of {parts.length}
        </span>
      </h6>
      <div data-testid="qr">
        <QRCode size={width} value={parts[index]} level="L" />
      </div>

      <p>Scan the QR codes above into Hermit.</p>
      {onNext && (
        <p>
          When you are done, hit the &ldquot;{nextText}&rdquot; button to
          continue.
        </p>
      )}
      <Grid container spacing={2}>
        <Grid item xs>
          <Button
            variant="contained"
            color="primary"
            className="mt-2"
            size="large"
            onClick={onCancel}
          >
            Cancel
          </Button>
        </Grid>
        {onNext && (
          <Grid item xs>
            <Button
              variant="contained"
              color="primary"
              className="mt-2"
              size="large"
              onClick={onNext}
            >
              {nextText}
            </Button>
          </Grid>
        )}
      </Grid>
    </div>
  );
};

HermitQRCode.defaultProps = {
  width: 640,
  onNext: null,
};

HermitQRCode.propTypes = {
  width: PropTypes.number,
  index: PropTypes.number.isRequired,
  parts: PropTypes.arrayOf(PropTypes.string.isRequired).isRequired,
  onCancel: PropTypes.func.isRequired,
  onNext: PropTypes.func,
  nextText: PropTypes.string,
};

class HermitDisplayer extends Component {
  constructor(props) {
    super(props);
    this.state = {
      currentIndex: 0,
      timer: null,
      keepPlaying: true,
    };
  }

  componentDidMount() {
    const { rate } = this.props;
    this.setState({
      timer: window.setTimeout(this.incrementIndex, rate),
    });
  }

  componentWillUnmount() {
    const { timer } = this.state;
    window.clearTimeout(timer);
    this.setState({
      keepPlaying: false,
    });
  }

  incrementIndex = () => {
    const { rate, parts } = this.props;
    const { currentIndex, keepPlaying } = this.state;
    if (keepPlaying) {
      this.setState({
        currentIndex: currentIndex === parts.length - 1 ? 0 : currentIndex + 1,
        timer: window.setTimeout(this.incrementIndex, rate),
      });
    }
  };

  render() {
    const { width, parts, onCancel, onNext, nextText } = this.props;
    const { currentIndex } = this.state;
    return (
      <HermitQRCode
        width={width}
        index={currentIndex}
        parts={parts}
        onCancel={onCancel}
        onNext={onNext}
        nextText={nextText}
      />
    );
  }
}

HermitDisplayer.defaultProps = {
  nextText: "Scan",
  width: 120, // in pixels
  rate: 200, // ms per QR code displayed
};

HermitDisplayer.propTypes = {
  rate: PropTypes.number,
  parts: PropTypes.arrayOf(PropTypes.string.isRequired).isRequired,
  onCancel: PropTypes.func.isRequired,
  onNext: PropTypes.func,
  nextText: PropTypes.string.isRequired,
  width: PropTypes.number,
};

export default HermitDisplayer;
