import Fade from "@material-ui/core/Fade";
import {
  createMuiTheme,
  makeStyles,
  ThemeProvider,
} from "@material-ui/core/styles";
import escape from "lodash/escape";
import { useEffect, useReducer } from "react";

import Chant from "@/components/chanting/Chant";
import ChantCloseControls from "@/components/chanting/ChantCloseControls";
import ChantOperationControls from "@/components/chanting/ChantOperationControls";
import ChantDebugControls from "@/components/chanting/ChantDebugControls";
import ChantIdleProvider from "@/components/chanting/ChantIdleProvider";
import ChantPerformanceIndicators from "@/components/chanting/ChantPerformanceIndicators";
import ChantScroller from "@/components/chanting/ChantScroller";
import ChantSettingsPanel from "@/components/chanting/ChantSettingsPanel";
import ChantToc from "@/components/chanting/ChantToc";
import darkTheme from "@/lib/theme";
import { exitFullscreen, requestFullscreen } from "@/lib/util";

const lightTheme = createMuiTheme({
  ...darkTheme,
  palette: {
    type: "light",
  },
});

const useStyles = makeStyles((theme) => ({
  root: ({ state }) => ({
    position: "fixed",
    backgroundColor: theme.palette.background.paper,
    color: theme.palette.text.primary,
    fontSize: "1.25rem",
    ...(state.fullscreen || state.mobile
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

const initialize = ({ chants, mobile, toc }) => ({
  activeIndex: "START",
  chant: null,
  chants,
  close: false,
  debug: false,
  fontSize: 24,
  fullscreen: false,
  highlight: false,
  mobile,
  performance: false,
  playing: false,
  settings: false,
  speed: 1.0,
  themeType: "light",
  toc,
  view: "TOC",
});

const reducer = (state, action) => {
  switch (action.type) {
    case "CLOSE": {
      if (state.settings) {
        return { ...state, settings: false };
      } else if (state.view === "CHANT") {
        return {
          ...state,
          activeIndex: "START",
          chant: null,
          playing: false,
          view: "TOC",
        };
      } else {
        return {
          ...state,
          activeIndex: "START",
          chant: null,
          close: true,
          fullscreen: false,
          playing: false,
        };
      }
    }
    case "INCREMENT_ACTIVE_INDEX": {
      let { activeIndex, chant, playing } = state;
      if (!chant) {
        activeIndex = "START";
      } else if (activeIndex === "START") {
        activeIndex = 0;
      } else if (activeIndex === "END") {
        playing = false;
      } else {
        activeIndex += 1;
        if (activeIndex >= (chant.textCount || 0)) {
          activeIndex = "END";
          playing = false;
        }
      }
      return { ...state, activeIndex, playing };
    }
    case "OPEN_CHANT_FROM_TOC": {
      const chant = getChantFromToc({
        chants: state.chants,
        chantIndex: action.chantIndex,
        partIndex: action.partIndex,
        toc: state.toc,
        volumeIndex: action.volumeIndex,
      });
      if (chant) {
        return {
          ...state,
          activeIndex: chant.startIndex ?? "START",
          chant,
          // TODO handle raw chants explicitly by not showing chant window
          playing: !String(chant.title).match(
            /^(Appendix|Pāli Phonetics|Glossary)/
          ),
          view: "CHANT",
        };
      } else {
        return state;
      }
    }
    case "SET_ACTIVE_INDEX":
      return { ...state, activeIndex: action.activeIndex };
    case "TOGGLE_DEBUG":
      return { ...state, debug: !state.debug };
    case "TOGGLE_HIGHLIGHT":
      return { ...state, highlight: !state.highlight };
    case "TOGGLE_PERFORMANCE":
      return { ...state, performance: !state.performance };
    case "SET_FONT_SIZE":
      return { ...state, fontSize: action.fontSize };
    case "SET_FULLSCREEN":
      return { ...state, fullscreen: action.fullscreen };
    case "SET_SPEED":
      return { ...state, speed: action.speed };
    case "SET_THEME_TYPE":
      return { ...state, themeType: action.themeType };
    case "STOP_PLAYING":
      return { ...state, playing: false };
    case "TOGGLE_PLAYING": {
      if (!state.playing && state.activeIndex === "END") {
        return { ...state, activeIndex: "START", playing: true };
      } else {
        return { ...state, playing: !state.playing };
      }
    }
    case "TOGGLE_SETTINGS":
      return { ...state, controls: !state.settings, settings: !state.settings };
    default:
      throw new Error(`Unknown action type ${action.type}`);
  }
};

const getWordCharCount = (html) => {
  const simple = (html || "")
    .replace(/<[^>]*>/g, "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[-]/g, " ")
    .replace(/[^\sa-zA-Z0-9]/g, "")
    .replace(/\s+/g, " ")
    .trim();
  return [simple.split(" ").length, simple.length];
};

const addChantMeta = (chant) => {
  let textIndex = 0;
  let startIndex = 0;
  const textNodeMap = [];

  const walkNode = (node) => {
    if (node?.html) {
      if (node.type === "raw") return;
      if (node.start) startIndex = textIndex;
      node.textIndex = textIndex++;
      [node.wordCount, node.charCount] = getWordCharCount(node.html);
      if (node.type === "verse") {
        if (node.lang == "pi" || String(node.html).match(/[āīūḷṇṃḍṭṅñ]/)) {
          node.duration = 0.7 + 0.14 * node.charCount;
        } else {
          node.duration = 1.2 + 0.07 * node.charCount;
        }
      } else {
        if (node.html.match(/^bow$/i)) {
          node.duration = 2;
        } else {
          node.duration = 1;
        }
      }
      textNodeMap.push(node);
    } else if (node?.children) {
      node?.children?.forEach?.(walkNode);
    }
  };
  walkNode(chant);

  chant.startIndex = startIndex;
  chant.textCount = textIndex;
  chant.textNodeMap = textNodeMap;
  return chant;
};

const getChantFromToc = ({
  chants,
  chantIndex,
  partIndex,
  toc,
  volumeIndex,
}) => {
  const tocPart = toc[volumeIndex]?.parts?.[partIndex];
  const tocChant = tocPart?.chants?.[chantIndex];
  let chantSet, link, title;
  if (tocChant) {
    chantSet = tocChant.chantSet || tocPart.chantSet;
    link = tocChant.link;
    title = tocPart.title;
  } else {
    chantSet = tocPart.chantSet;
    link = tocPart.link;
    title = tocPart.title;
  }

  const chant = chantSet
    .map((chantId) => chants.chantMap[chantId])
    .filter((chant) => chant)
    .reduce(
      (combined, chant) => {
        combined.children.push({
          type: "h2",
          start: chant.id === link,
          html: escape(chant.title),
        });
        if (chant.type === "raw") {
          combined.children.push({
            type: "raw",
            html: chant.html,
          });
        } else {
          chant.children.forEach((node) => {
            if (String(node?.type).match(/^h\d$/)) {
              node = { ...node, type: "h3" };
            }
            combined.children.push(node);
          });
        }
        combined.id = combined.id ? `${combined.id},${chant.id}` : chant.id;
        combined.lang = combined.lang
          ? combined.lang === chant.lang
            ? chant.lang
            : "mixed"
          : chant.lang;
        return combined;
      },
      { title, id: "", children: [{ type: "h1", html: escape(title) }] }
    );

  return chant.children?.length > 0 ? addChantMeta(chant) : null;
};

// This inner component is needed for the theme to apply.
const ChantWindowInner = ({ dispatch, state }) => {
  const classes = useStyles({ state });
  return (
    <div className={classes.root}>
      <ChantCloseControls dispatch={dispatch} state={state} />
      <ChantDebugControls dispatch={dispatch} state={state} />
      <ChantOperationControls dispatch={dispatch} state={state} />
      <ChantSettingsPanel dispatch={dispatch} state={state} />
      <Fade in={state.view === "CHANT"}>
        <div style={{ position: "absolute", width: "100%", height: "100%" }}>
          <ChantScroller dispatch={dispatch} state={state}>
            <Chant
              chant={state.chant}
              fontSize={state.fontSize}
              highlight={state.highlight}
            />
          </ChantScroller>
        </div>
      </Fade>
      <Fade in={state.view === "TOC"}>
        <div style={{ position: "absolute", width: "100%", height: "100%" }}>
          <ChantToc dispatch={dispatch} state={state} />
        </div>
      </Fade>
      <ChantPerformanceIndicators />
    </div>
  );
};

const ChantWindow = ({
  allowFullscreen = true,
  chants,
  mobile,
  onClose,
  toc,
}) => {
  const reducerDefaults = { chants, mobile, toc };
  const [state, dispatch] = useReducer(reducer, reducerDefaults, initialize);

  useEffect(() => {
    if (allowFullscreen) {
      if (state.fullscreen) {
        requestFullscreen();
      } else {
        exitFullscreen();
      }
    }
  }, [allowFullscreen, state.fullscreen, state.mobile]);

  useEffect(() => {
    if (state.close) onClose();
  }, [state.close]);

  const theme = state.themeType === "dark" ? darkTheme : lightTheme;

  return (
    <ChantIdleProvider>
      <ThemeProvider theme={theme}>
        <ChantWindowInner dispatch={dispatch} state={state} />
      </ThemeProvider>
    </ChantIdleProvider>
  );
};

export default ChantWindow;