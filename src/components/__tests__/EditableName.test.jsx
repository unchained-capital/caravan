import React from "react";
import { fireEvent, render, screen } from "../../utils/test-utils";

import EditableName from "../EditableName";

describe("EditableName", () => {
  const nameValue = "Value";
  let editButton;
  let getByDataCy;
  let queryByDataCy;
  let spy;

  beforeEach(() => {
    spy = jest.fn();
    const element = render(
      <EditableName number={0} name={nameValue} setName={spy} />
    );
    getByDataCy = element.getByDataCy;
    queryByDataCy = element.queryByDataCy;
    editButton = getByDataCy("edit-button");
  });

  test("shows value and edit button", () => {
    expect(screen.getByText(nameValue)).toBeVisible();
    expect(editButton).toBeVisible();
  });

  test("save and cancel buttons are not displayed", () => {
    expect(queryByDataCy("save-button")).toBeNull();
    expect(queryByDataCy("save-button")).not.toBeInTheDocument();
    expect(queryByDataCy("cancel-button")).toBeNull();
    expect(queryByDataCy("cancel-button")).not.toBeInTheDocument();
  });

  describe("edit display", () => {
    let input;
    let saveButton;
    let cancelButton;

    beforeEach(() => {
      fireEvent.click(editButton);
      input = screen.getByDisplayValue(nameValue);
      saveButton = getByDataCy("save-button");
      cancelButton = getByDataCy("cancel-button");
    });

    test("edit button isn't visable", () => {
      expect(queryByDataCy("edit-button")).toBeNull();
      expect(queryByDataCy("edit-button")).not.toBeInTheDocument();
    });

    test("contains input field and buttons", () => {
      expect(input).toBeVisible();
      expect(saveButton).toBeVisible();
      expect(cancelButton).toBeVisible();
    });

    test("the input field should have focus", () => {
      expect(input).toHaveFocus();
    });

    test("name should not be able to be blank", () => {
      fireEvent.change(input, { target: { value: "" } });
      expect(screen.getByText("Name cannot be blank.")).toBeVisible();
      expect(screen.getByText("Name", { selector: "label" })).toHaveClass(
        "Mui-error"
      );
    });

    describe("form interaction", () => {
      const updatedValue = "Updated Value";

      beforeEach(() => {
        fireEvent.change(input, { target: { value: updatedValue } });
      });

      test("clicking cancel restores prior value", () => {
        fireEvent.click(cancelButton);
        expect(spy).not.toBeCalled();
        expect(getByDataCy("editable-name-value")).toHaveTextContent(nameValue);
      });

      test("clicking save calls save callback", () => {
        fireEvent.click(saveButton);
        expect(spy).toHaveBeenCalledTimes(1);
        expect(spy).toHaveBeenCalledWith(0, updatedValue);
      });
    });
  });
});
