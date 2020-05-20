import React from "react";

export default (url, text) => (
  <a href={url} target="_blank" rel="noopener noreferrer">
    {text}
  </a>
);
