import React, { useState } from "react";
import { Grid, IconButton, TextField } from "@mui/material";
import { Check, Clear, Edit } from "@mui/icons-material";

interface EditableNameProps {
  number: number;
  name: string;
  setName: (number: number, name: string) => void;
}

const EditableName = ({ name, setName, number }: EditableNameProps) => {
  const [editing, setEditing] = useState(false);
  const [newName, setNewName] = useState(name);
  const [error, setError] = useState("");

  const hasError = () => {
    return error !== "";
  };

  const startEditing = (
    event: React.MouseEvent<HTMLSpanElement | HTMLButtonElement>
  ) => {
    event.preventDefault();
    setEditing(true);
    setNewName(name);
  };

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const updatedName = event.target.value;

    if (
      updatedName === null ||
      updatedName === undefined ||
      updatedName === ""
    ) {
      setError("Name cannot be blank.");
    }
    setNewName(updatedName);
  };

  const submit = () => {
    setName(number, newName);
    setEditing(false);
  };

  const cancel = () => {
    setEditing(false);
    setNewName(name);
    setError("");
  };

  const renderEditableName = () => {
    if (editing) {
      return (
        <Grid container alignItems="center">
          <Grid item>
            <TextField
              autoFocus
              label="Name"
              value={newName}
              variant="standard"
              onChange={handleChange}
              onFocus={(event) => {
                setTimeout(event.target.select.bind(event.target), 20);
              }}
              onKeyDown={(e) => (e.key === "Enter" ? submit() : null)}
              error={hasError()}
              helperText={error}
            />
          </Grid>

          <Grid item>
            <IconButton
              data-cy="save-button"
              size="small"
              onClick={submit}
              disabled={hasError()}
            >
              <Check />
            </IconButton>
          </Grid>

          <Grid item>
            <IconButton
              data-cy="cancel-button"
              color="secondary"
              size="small"
              onClick={cancel}
            >
              <Clear />
            </IconButton>
          </Grid>
        </Grid>
      );
    }
    return (
      <span>
        <IconButton data-cy="edit-button" size="small" onClick={startEditing}>
          <Edit />
        </IconButton>
        &nbsp;
        <span
          data-cy="editable-name-value"
          style={{ cursor: "pointer" }}
          onClick={startEditing}
        >
          {name}
        </span>
      </span>
    );
  };
  return renderEditableName();
};

export default EditableName;
