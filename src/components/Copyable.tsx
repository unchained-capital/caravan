import React, { useState, useEffect, ReactNode } from "react";

// Components
import CopyToClipboard from "react-copy-to-clipboard";
import { FileCopy } from "@mui/icons-material";
import { IconButton } from "@mui/material";
import { makeStyles } from "@mui/styles";
import { enqueueSnackbar } from "notistack";

const useStyles = makeStyles(() => ({
  copyText: {
    "&:hover": { cursor: "pointer" },
  },
  code: {
    fontSize: "1rem",
  },
}));

interface CopyableProps {
  newline?: boolean;
  text: string;
  children?: ReactNode;
  showIcon?: boolean;
  showText?: boolean;
  code?: boolean;
}

const Copyable = ({
  newline = false,
  text,
  children = React.createElement("span"),
  showIcon = false,
  showText = true,
  code = false,
  ...otherProps
}: CopyableProps) => {
  const [copied, setCopied] = useState<boolean>(false);
  const [timer, setTimer] = useState<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (timer) clearTimeout(timer);
    // eslint-disable-next-line
  }, []);

  const classes = useStyles();

  const showSnackbarMessage = () => {
    const MAX_LENGTH = 25;
    const shortenedText =
      text.length > MAX_LENGTH ? `${text.substring(0, MAX_LENGTH)}...` : text;

    enqueueSnackbar(`Copied ${shortenedText} to clipboard`, {
      preventDuplicate: true,
    });
  };

  const onCopy = () => {
    const timerTimeout = setTimeout(() => {
      setCopied(false);
      setTimer(null);
    }, 1000);

    setCopied(true);
    setTimer(timerTimeout);

    showSnackbarMessage();
  };

  const TextComponent = () => {
    if (code) return <code className={classes.code}>{text}</code>;
    return <span>{text}</span>;
  };

  return (
    <span
      onClick={(e: React.MouseEvent) => e.stopPropagation()}
      {...otherProps}
    >
      <CopyToClipboard
        text={text}
        onCopy={onCopy}
        options={{ format: "text/plain" }}
      >
        <span
          style={{
            fontStyle: copied ? "italic" : "inherit",
            overflowWrap: "break-word",
          }}
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

export default Copyable;
