/* eslint-disable import/no-extraneous-dependencies */
import { render, queries } from "@testing-library/react";
import "@testing-library/jest-dom";
/* eslint-enable */

import * as customQueries from "./custom-test-queries";

const customRender = (ui, options) =>
  render(ui, { queries: { ...queries, ...customQueries }, ...options });

// re-export everything
// eslint-disable-next-line import/no-extraneous-dependencies
export * from "@testing-library/react";

// override render method
export { customRender as render };
