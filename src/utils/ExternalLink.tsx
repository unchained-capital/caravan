import React from "react";

export const externalLink = (
  url: string,
  text: string | React.ReactElement
) => (
  <a href={url} target="_blank" rel="noopener noreferrer">
    {text}
  </a>
);
