import React from "react";
import PropTypes from "prop-types";
import { Grid, IconButton, TextField } from "@material-ui/core";
import { Check, Clear, Edit } from "@material-ui/icons";

class EditableName extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      editing: false,
      newName: "",
      error: "",
    };
  }

  componentDidMount = () => {
    const { name } = this.props;
    this.setState({ newName: name });
  };

  render = () => {
    const { name } = this.props;
    const { editing, newName, error } = this.state;
    if (editing) {
      // <Form onSubmit={this.submit} inline>
      return (
        <Grid container alignItems="center">
          <Grid item>
            <TextField
              autoFocus
              label="Name"
              value={newName}
              onChange={this.handleChange}
              onFocus={(event) => {
                setTimeout(event.target.select.bind(event.target), 20);
              }}
              onKeyDown={(e) => (e.key === "Enter" ? this.submit() : null)}
              error={this.hasError()}
              helperText={error}
            />
          </Grid>

          <Grid item>
            <IconButton
              data-cy="save-button"
              size="small"
              onClick={this.submit}
              disabled={this.hasError()}
            >
              <Check />
            </IconButton>
          </Grid>

          <Grid item>
            <IconButton
              data-cy="cancel-button"
              color="secondary"
              size="small"
              onClick={this.cancel}
            >
              <Clear />
            </IconButton>
          </Grid>
        </Grid>
      );
    }
    return (
      <span>
        <IconButton
          data-cy="edit-button"
          size="small"
          onClick={this.startEditing}
        >
          <Edit />
        </IconButton>
        &nbsp;
        {/* eslint-disable-next-line jsx-a11y/click-events-have-key-events,jsx-a11y/no-static-element-interactions */}
        <span
          data-cy="editable-name-value"
          style={{ cursor: "pointer" }}
          onClick={this.startEditing}
        >
          {name}
        </span>
      </span>
    );
  };

  hasError = () => {
    const { error } = this.state;
    return error !== "";
  };

  startEditing = (event) => {
    const { name } = this.props;
    event.preventDefault();
    this.setState({ editing: true, newName: name });
  };

  handleChange = (event) => {
    const newName = event.target.value;
    let error = "";
    if (newName === null || newName === undefined || newName === "") {
      error = "Name cannot be blank.";
    }
    this.setState({ newName, error });
  };

  submit = () => {
    const { setName, number } = this.props;
    const { newName } = this.state;
    setName(number, newName);
    this.setState({ editing: false });
  };

  cancel = () => {
    const { name } = this.props;
    this.setState({ error: "", newName: name, editing: false });
  };
}

EditableName.propTypes = {
  number: PropTypes.number.isRequired,
  name: PropTypes.string.isRequired,
  setName: PropTypes.func.isRequired,
};

export default EditableName;
