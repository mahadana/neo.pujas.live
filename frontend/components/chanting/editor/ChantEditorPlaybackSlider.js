import Slider from "@material-ui/core/Slider";
import { makeStyles } from "@material-ui/core/styles";
import Typography from "@material-ui/core/Typography";
import { memo, useEffect, useState } from "react";

const PLAYBACK_RATE_STEP_SIZE = 0.1;
const MIN_PLAYBACK_RATE = 0.5;
const MAX_PLAYBACK_RATE = 3.0;

const useStyles = makeStyles((theme) => ({
  label: {
    margin: 0,
    fontSize: "0.8rem",
  },
  slider: {
    height: "1em",
    padding: "0.9em 0 0 0",
    verticalAlign: "middle",
  },
}));

const ChantEditorPlaybackSlider = memo(
  ({ dispatch, state }) => {
    const [playbackRate, setPlaybackRate] = useState(state.playbackRate);
    const classes = useStyles();

    useEffect(() => setPlaybackRate(state.playbackRate), [state.playbackRate]);

    const onChange = (event, value) => setPlaybackRate(value);
    const onChangeCommited = (event, value) =>
      dispatch({ type: "SET_PLAYBACK_RATE", playbackRate: value });
    const valueLabelFormat = (value) => value.toFixed(1);

    return (
      <>
        <Typography
          className={classes.label}
          id="chant-editor-playback-slider"
          gutterBottom
        >
          Playback Rate
        </Typography>
        <Slider
          aria-labelledby="chant-editor-playback-slider"
          className={classes.slider}
          getAriaValueText={valueLabelFormat}
          max={MAX_PLAYBACK_RATE}
          min={MIN_PLAYBACK_RATE}
          onChange={onChange}
          onChangeCommitted={onChangeCommited}
          step={PLAYBACK_RATE_STEP_SIZE}
          value={playbackRate}
          valueLabelDisplay="auto"
          valueLabelFormat={valueLabelFormat}
        />
      </>
    );
  },
  (prev, next) =>
    prev.dispatch === next.dispatch &&
    prev.state.playbackRate === next.state.playbackRate
);

ChantEditorPlaybackSlider.displayName = "ChantEditorPlaybackSlider";

export default ChantEditorPlaybackSlider;
