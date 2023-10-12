import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";
import { Grid, IconButton, TextField } from "@mui/material";
import { Check, Clear, Edit } from "@mui/icons-material";

const EditableName = ({ name, setName, number }) => {
  const [editing, setEditing] = useState(false);
  const [newName, setNewName] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    setNewName(name);
  }, []);

  const hasError = () => {
    return error !== "";
  };

  const startEditing = (event) => {
    event.preventDefault();
    setEditing(true);
    setNewName(name);
  };

  const handleChange = (event) => {
    setNewName(event.target.value);

    if (newName === null || newName === undefined || newName === "") {
      setError("Name cannot be blank.");
    }
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
      // <Form onSubmit={this.submit} inline>
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
        {/* eslint-disable-next-line jsx-a11y/click-events-have-key-events,jsx-a11y/no-static-element-interactions */}
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

EditableName.propTypes = {
  number: PropTypes.number.isRequired,
  name: PropTypes.string.isRequired,
  setName: PropTypes.func.isRequired,
};

export default EditableName;
