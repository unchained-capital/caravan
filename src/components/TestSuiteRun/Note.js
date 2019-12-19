import React from 'react';
import {connect} from "react-redux";

import {
  setKeystoreNote,
} from "../../actions/keystoreActions";
import {
  setTestRunNote,
} from "../../actions/testRunActions";

import { 
  TextField,
} from '@material-ui/core';
import { Info, Warning, Error } from '@material-ui/icons';

const KEYSTORE_MODE = "keystore";
const TEST_RUN_MODE = "testRun";

class NoteBase extends React.Component {

  render() {
    const {note} = this.props;
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

  handleChange = (event) => {
    const {setNote, mode, testRunIndex, note} = this.props;
    const newNote = event.target.value;
    if (mode === TEST_RUN_MODE) {
      setNote(testRunIndex, newNote);
    } else {
      setNote(newNote);
    }
  }

}

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
    note: state.testSuiteRun.testRuns[state.testSuiteRun.currentTestRunIndex].note,
  };
};

const mapDispatchToTestRunNoteProps = {
  setNote: setTestRunNote,
};

const KeystoreNote = connect(mapStateToKeystoreNoteProps, mapDispatchToKeystoreNoteProps)(NoteBase);
const TestRunNote = connect(mapStateToTestRunNoteProps, mapDispatchToTestRunNoteProps)(NoteBase);

export {KeystoreNote, TestRunNote};
