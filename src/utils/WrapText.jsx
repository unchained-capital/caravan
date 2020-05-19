import React from "react";

export default function wrapText(text, columns) {
  const lines = [];
  let index = 0;
  let element = 0;
  while (index <= text.length) {
    lines.push(
      <span key={element}>{text.slice(index, (index += columns || 64))}</span>
    );
    lines.push(<br key={element + 1} />);
    element += 2;
  }
  return lines;
}
