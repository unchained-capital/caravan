import React from "react";
import { connect } from "react-redux";
import { PropTypes } from "prop-types";

import { TextField } from "@material-ui/core";
import { setKeystoreNote } from "../../actions/keystoreActions";
import { setTestRunNote } from "../../actions/testRunActions";

const KEYSTORE_MODE = "keystore";
const TEST_RUN_MODE = "testRun";

class NoteBase extends React.Component {
  handleChange = (event) => {
    const { setNote, mode, testRunIndex } = this.props;
    const newNote = event.target.value;
    if (mode === TEST_RUN_MODE) {
      setNote(testRunIndex, newNote);
    } else {
      setNote(newNote);
    }
  };

  render() {
    const { note } = this.props;
    return (
      <TextField
        name="notes"
        label="Notes"
        value={note}
        onChange={this.handleChange}
        multiline
        fullWidth
        rows={3}
      />
    );
  }
}

NoteBase.propTypes = {
  note: PropTypes.string.isRequired,
  mode: PropTypes.string.isRequired,
  setNote: PropTypes.func.isRequired,
  testRunIndex: PropTypes.number,
};

NoteBase.defaultProps = {
  testRunIndex: 0,
};

const mapStateToKeystoreNoteProps = (state) => {
  return {
    note: state.keystore.note,
    mode: KEYSTORE_MODE,
  };
};

const mapDispatchToKeystoreNoteProps = {
  setNote: setKeystoreNote,
};

const mapStateToTestRunNoteProps = (state) => {
  return {
    mode: TEST_RUN_MODE,
    testRunIndex: state.testSuiteRun.currentTestRunIndex,
    note:
      state.testSuiteRun.testRuns[state.testSuiteRun.currentTestRunIndex].note,
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
