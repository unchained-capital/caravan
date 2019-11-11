import React from 'react';
import PropTypes from 'prop-types';

// Components
import { Grid, IconButton, TextField } from '@material-ui/core';
import { Check, Clear, Edit } from '@material-ui/icons';

class EditableName extends React.Component {

  static propTypes =  {
    number: PropTypes.number.isRequired,
    name: PropTypes.string.isRequired,
    setName: PropTypes.func.isRequired,
  };

  state = {
    editing: false,
    newName: '',
    error: '',
  };

  componentDidMount = () => {
    const {name} = this.props;
    this.setState({newName: name});
  }

  render = () => {
    const {name} = this.props;
    const {editing, newName, error} = this.state;
    if (editing) {
      // <Form onSubmit={this.submit} inline>
      return (
        <Grid container alignItems="center">

          <Grid item>
            <TextField
              label="Name"
              value={newName}
              onChange={this.handleChange}
              error={this.hasError()}
              helperText={error}
            />
          </Grid>

          <Grid item>
            <IconButton size="small" onClick={this.submit} disabled={this.hasError()}>
              <Check />
            </IconButton>
          </Grid>

          <Grid item>
            <IconButton color="secondary" size="small" onClick={this.cancel}>
              <Clear />
            </IconButton>
          </Grid>
        </Grid>
      );
    } else {
      return (
        <span>
          <IconButton size="small" onClick={this.startEditing}>
            <Edit />
          </IconButton>
          &nbsp;
          {name}
        </span>
      );
    }
  }

  hasError = () => (this.state.error !== '')

  startEditing = (event) => {
    const {name} = this.props;
    event.preventDefault();
    this.setState({editing: true, newName: name});
  }

  handleChange = (event) => {
    const newName = event.target.value;
    let error = '';
    if (newName === null || newName === undefined || newName === '') {
      error =  "Name cannot be blank.";
    }
    this.setState({newName, error});
  }

  submit = () => {
    const {setName, number} = this.props;
    const {newName} = this.state;
    setName(number, newName);
    this.setState({editing: false});
  }

  cancel = () => {
    const {name} = this.props;
    this.setState({error: '', newName: name, editing: false});
  }

}

export default EditableName;
