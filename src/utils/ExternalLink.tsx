import React from "react";

const externalLink = (url: string, text: string | React.ReactElement) => (
  <a href={url} target="_blank" rel="noopener noreferrer">
    {text}
  </a>
);

export { externalLink };
