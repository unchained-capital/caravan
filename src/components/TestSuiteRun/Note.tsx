import React from "react";
import { useSelector, useDispatch } from "react-redux";

import { TextField } from "@mui/material";
import { setKeystoreNote as setKeystoreNoteAction } from "../../actions/keystoreActions";
import { setTestRunNote as setTestRunNoteAction } from "../../actions/testRunActions";

import { getKeystore } from "../../selectors/keystore";
import { getTestSuiteRun } from "../../selectors/testSuiteRun";

export const KeystoreNote = () => {
  const note = useSelector(getKeystore).note;
  const dispatch = useDispatch();
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newNote = event.target.value;

    dispatch(setKeystoreNoteAction(newNote));
  };

  return (
    <TextField
      name="notes"
      label="Notes"
      value={note}
      variant="standard"
      onChange={handleChange}
      multiline
      fullWidth
      rows={3}
    />
  );
};

export const TestRunNote = () => {
  const testRunIndex = useSelector(getTestSuiteRun).currentTestRunIndex | 0;
  const note = useSelector(getTestSuiteRun).testRuns[testRunIndex].note;
  const dispatch = useDispatch();
  const handleChange = () => {
    dispatch(setTestRunNoteAction(String(testRunIndex)));
  };

  return (
    <TextField
      name="notes"
      label="Notes"
      value={note}
      variant="standard"
      onChange={handleChange}
      multiline
      fullWidth
      rows={3}
    />
  );
};
