import Box from "@material-ui/core/Box";

import ChannelRecording from "@/components/ChannelRecording";

const ChannelRecordingsList = ({ channel, state = "curated" }) => {
  let recordings;
  if (state === "curated") {
    recordings = (channel?.curatedRecordings || [])
      // TODO Remove curated recordings where recording is null; this would
      // better be done in the query.
      .filter((curatedRecording) => curatedRecording.recording)
      .map((curatedRecording) => curatedRecording.recording);
  } else {
    recordings = channel?.recordings || [];
  }

  if (recordings.length > 0) {
    return (
      <Box>
        {recordings.map((recording, index) => (
          <ChannelRecording key={index} recording={recording} />
        ))}
      </Box>
    );
  } else {
    return null;
  }
};

export default ChannelRecordingsList;
