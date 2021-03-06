import FormControl from "@material-ui/core/FormControl";
import FormHelperText from "@material-ui/core/FormHelperText";
import Grid from "@material-ui/core/Grid";
import IconButton from "@material-ui/core/IconButton";
import InputLabel from "@material-ui/core/InputLabel";
import MenuItem from "@material-ui/core/MenuItem";
import Paper from "@material-ui/core/Paper";
import Select from "@material-ui/core/Select";
import { makeStyles } from "@material-ui/core/styles";
import DeleteIcon from "@material-ui/icons/Delete";
import { FastField } from "formik";
import capitalize from "lodash/capitalize";

import FormTextField from "@/components/FormTextField";
import { GROUP_EVENT_DAY_OPTIONS } from "@/lib/validation";

const useStyles = makeStyles((theme) => ({
  root: {
    margin: "1em 0",
    padding: "1em",
  },
  container: {
    minHeight: "5em",
    alignItems: "flex-start",
    justifyContent: "space-between",
  },
  fieldItem: {
    width: "10em",
    "& > div": {
      width: "100%",
    },
  },
}));

const GroupEventFormFragment = ({ namePrefix, onRemove }) => {
  const classes = useStyles();
  return (
    <Paper className={classes.root}>
      <Grid container className={classes.container}>
        <Grid item className={classes.fieldItem}>
          <FastField name={`${namePrefix}.day`}>
            {({ field, meta }) => (
              <FormControl>
                <InputLabel shrink>Day</InputLabel>
                <Select
                  fullWidth
                  required
                  error={meta.error && meta.touched}
                  {...field}
                >
                  {GROUP_EVENT_DAY_OPTIONS.map((option, index) => (
                    <MenuItem key={index} value={option}>
                      {capitalize(option)}
                    </MenuItem>
                  ))}
                </Select>
                {meta.touched && meta.error && (
                  <FormHelperText>{meta.error}</FormHelperText>
                )}
              </FormControl>
            )}
          </FastField>
        </Grid>
        <Grid item className={classes.fieldItem}>
          <FormTextField
            name={`${namePrefix}.startAt`}
            label="Time"
            type="time"
            required
            variant="standard"
            InputLabelProps={{
              shrink: true,
            }}
          />
        </Grid>
        <Grid item className={classes.fieldItem}>
          <FormTextField
            name={`${namePrefix}.duration`}
            label="Duration (minutes)"
            type="number"
            variant="standard"
            InputLabelProps={{
              shrink: true,
            }}
          />
        </Grid>
        <Grid item>
          <IconButton aria-label="delete" onClick={onRemove}>
            <DeleteIcon />
          </IconButton>
        </Grid>
      </Grid>
    </Paper>
  );
};

export default GroupEventFormFragment;
