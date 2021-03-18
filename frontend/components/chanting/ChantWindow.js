import { makeStyles } from "@material-ui/core/styles";
import { useState } from "react";

import ChantFontStyle from "@/components/chanting/ChantFontStyle";
import ChantScrollerWrapper from "@/components/chanting/ChantScrollerWrapper";
import ChantTocWrapper from "@/components/chanting/ChantTocWrapper";

const useStyles = makeStyles((theme) => ({
  root: ({ maximize }) => ({
    position: "fixed",
    backgroundColor: theme.palette.background.paper,
    color: theme.palette.text.primary,
    overflow: "hidden",
    fontSize: "1.25rem",
    ...(maximize
      ? {
          width: "100%",
          height: "100%",
          top: 0,
          left: 0,
        }
      : {
          width: "90vw",
          height: "92vh",
          top: "50%",
          left: "50%",
          marginLeft: "max(-45vw,-24rem)",
          marginTop: "-46vh",
          maxWidth: "48rem",
          borderRadius: "0.25rem",
          boxShadow: "1px 1px 6px rgb(0 0 0 / 80%)",
        }),
  }),
}));

const ChantWindow = ({
  chantData,
  disableAudio,
  onClose,
  parentFullScreen,
}) => {
  const [chantSet, setChantSet] = useState(null);
  const [maximize, setMaximize] = useState(false);
  const classes = useStyles({ maximize });

  const resetChantSet = () => setChantSet(null);

  return (
    <div className={classes.root}>
      <ChantFontStyle />
      <ChantScrollerWrapper
        chantData={chantData}
        chantSet={chantSet}
        disableAudio={disableAudio}
        onClose={resetChantSet}
        parentFullScreen={parentFullScreen}
        setMaximize={setMaximize}
      />
      <ChantTocWrapper
        chantSet={chantSet}
        onClose={onClose}
        onOpen={setChantSet}
        toc={chantData.toc}
      />
    </div>
  );
};

export default ChantWindow;
