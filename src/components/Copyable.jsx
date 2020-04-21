import PropTypes from "prop-types";
import React, { useState, useEffect } from "react";

// Components
import CopyToClipboard from "react-copy-to-clipboard";
import { FileCopy } from "@material-ui/icons";
import { IconButton, makeStyles } from "@material-ui/core";

const useStyles = makeStyles(() => ({
  copyText: {
    "&:hover": { cursor: "pointer" },
  },
  code: {
    fontSize: "1rem",
  },
}));

const Copyable = ({ newline, text, children, showIcon, showText, code }) => {
  const [copied, setCopied] = useState(false);
  const [timer, setTimer] = useState(null);

  useEffect(() => {
    if (timer) clearTimeout(timer);
    // eslint-disable-next-line
  }, []);

  const classes = useStyles();

  const onCopy = () => {
    const timerTimeout = setTimeout(() => {
      setCopied(false);
      setTimer(null);
    }, 1000);

    setCopied(true);
    setTimer(timerTimeout);
  };

  const TextComponent = () => {
    if (code) return <code className={classes.code}>{text}</code>;
    return <span>{text}</span>;
  };

  return (
    // eslint-disable-next-line jsx-a11y/click-events-have-key-events,jsx-a11y/no-static-element-interactions
    <span onClick={(e) => e.stopPropagation()}>
      <CopyToClipboard
        text={text}
        onCopy={onCopy}
        options={{ format: "text/plain" }}
      >
        <span
          style={{ fontStyle: copied ? "italic" : "inherit" }}
          className={`copyable ${classes.copyText}`}
        >
          {children}
          {showText && <TextComponent />}
          {newline && <br />}
          {showIcon && (
            <IconButton>
              <FileCopy
                fontSize="small"
                color={copied ? "primary" : "action"}
              />
            </IconButton>
          )}
        </span>
      </CopyToClipboard>
    </span>
  );
};

Copyable.propTypes = {
  // defaults
  newline: PropTypes.bool,
  // parent
  text: PropTypes.string.isRequired,
  children: PropTypes.node,
  showIcon: PropTypes.bool,
  showText: PropTypes.bool,
  code: PropTypes.bool,
};

Copyable.defaultProps = {
  newline: false,
  showIcon: false,
  children: React.createElement("span"),
  showText: true,
  code: false,
};
export default Copyable;
