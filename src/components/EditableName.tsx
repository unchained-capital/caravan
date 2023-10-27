import React from "react";
import { Grid, IconButton, TextField } from "@mui/material";
import { Check, Clear, Edit } from "@mui/icons-material";

interface EditableNameProps {
  number: number;
  name: string;
  setName: (number: number, name: string) => void;
}

interface EditableNameState {
  editing: boolean;
  newName: string;
  error: string;
}

class EditableName extends React.Component<
  EditableNameProps,
  EditableNameState
> {
  constructor(props: EditableNameProps) {
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
              variant="standard"
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

  startEditing = (
    event: React.MouseEvent<HTMLSpanElement | HTMLButtonElement>
  ) => {
    const { name } = this.props;
    event.preventDefault();
    this.setState({ editing: true, newName: name });
  };

  handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newName = event.target.value;
    let error = "";
    if (!newName) {
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

export default EditableName;
