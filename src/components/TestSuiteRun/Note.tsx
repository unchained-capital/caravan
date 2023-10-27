import React from "react";
import { connect } from "react-redux";

import { TextField } from "@mui/material";
import { setKeystoreNote } from "../../actions/keystoreActions";
import { setTestRunNote } from "../../actions/testRunActions";

const KEYSTORE_MODE = "keystore";
const TEST_RUN_MODE = "testRun";

interface NoteBaseProps {
  note: string;
  mode: string;
  setNote: (note: string) => void;
  testRunIndex?: number;
  testSuiteRun?: {
    currentTestRunIndex: number;
    started: boolean;
    testRuns: any[];
  };
}

const NoteBase = ({ note, mode, setNote, testRunIndex = 0 }: NoteBaseProps) => {
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newNote = event.target.value;
    if (mode === TEST_RUN_MODE) {
      setNote(String(testRunIndex));
    } else {
      setNote(newNote);
    }
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

const mapStateToKeystoreNoteProps = (state: { keystore: NoteBaseProps }) => {
  return {
    note: state.keystore.note,
    mode: KEYSTORE_MODE,
  };
};

const mapDispatchToKeystoreNoteProps = {
  setNote: setKeystoreNote,
};

const mapStateToTestRunNoteProps = (state: {
  testSuiteRun: {
    testRuns: any[];
    currentTestRunIndex: number;
  };
  keystore: NoteBaseProps;
}) => {
  return {
    mode: TEST_RUN_MODE,
    testRunIndex: state.testSuiteRun.currentTestRunIndex,
    note: state.testSuiteRun.testRuns[state.testSuiteRun.currentTestRunIndex]
      .note,
  };
};

const mapDispatchToTestRunNoteProps = {
  setNote: setTestRunNote,
};

const KeystoreNote = connect(
  mapStateToKeystoreNoteProps,
  mapDispatchToKeystoreNoteProps
)(NoteBase);
const TestRunNote = connect(
  mapStateToTestRunNoteProps,
  mapDispatchToTestRunNoteProps
)(NoteBase);

export { KeystoreNote, TestRunNote };
