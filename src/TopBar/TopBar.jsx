import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { next, playOut, debug, run } from '../Editor/duck';
import { nextWorld } from '../apiDuck';

const styles = {
  container: {
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'flex-start',
  },
  button: {
    margin: 5,
    backgroundColor: 'green',
    height: 30,
    width: 30,
    padding: 5,
    textAlign: 'center',
    borderRadius: 5,
    display: 'inline-block',
  },
  titleContainer: {
    margin: 5,
    flexGrow: 100,
    flexShrink: 100,
  },
  title: {
    marginTop: 0,
    marginLeft: 0,
    marginRight: 0,
    marginBottom: 5,
    padding: 0,
  },
  desc: {
    margin: 0,
    padding: 0,
  },
  text: {
    fontFamily: 'Arial, sans-serif',
  },
  buttonContainer: {
    height: '100%',
    display: 'flex',
    alignItems: 'flex-end',
    justifyContent: 'space-around',
  },
  buttons: {
    run: {
    },
    debug: {
      backgroundColor: 'orange',
    },
    next: {
      backgroundColor: 'orange',
    },
    playOut: {
    },
    nextWorld: {
      height: 30,
      width: 70, // width * 2 + margin * 2
      color: 'white',
      backgroundColor: 'blue',
    },
  },
};

const RunButton = Radium(({ run }) => (
  <div alt='Run' onClick={run} style={[styles.button, styles.buttons.run]}>
    <svg height={30} width={30}>
      <polygon points={[[2.5, 0], [2.5, 30], [30, 15]]} fill='white'/>
    </svg>
  </div>
));

// Modified From: https://commons.wikimedia.org/wiki/File:High-contrast-bug-buddy.svg
// This is as a string so react doesn't reactify all the properites.
const DEBUG_ICON = `
<g transform='scale(0.625)'>
<path style="stroke:#000000;stroke-width:3;stroke-linecap:butt;stroke-linejoin:miter;stroke-miterlimit:4;stroke-dasharray:none;stroke-opacity:1" d="M 41.5,42.41691 L 7.2724874,5.4999996"></path>
<path style="stroke:#000000;stroke-width:3.00000048;stroke-linecap:butt;stroke-linejoin:miter;stroke-miterlimit:4;stroke-dasharray:none;stroke-opacity:1" d="M 3.0733193,26.5 L 45.127417,26.5"></path>
<path style="stroke:#000000;stroke-width:3;stroke-linecap:butt;stroke-linejoin:miter;stroke-miterlimit:4;stroke-dasharray:none;stroke-opacity:1" d="M 6.500003,42.153538 L 40.727515,5.236628"></path>
<path style="opacity:1;fill:#ffffff;fill-opacity:1;stroke:#000000;stroke-width:3.3404119;stroke-linecap:round;stroke-linejoin:miter;stroke-miterlimit:4;stroke-dasharray:none;stroke-dashoffset:0;stroke-opacity:1" id="path4916" d="M 45.214287 23.214285 A 17.428572 17.428572 0 1 1  10.357143,23.214285 A 17.428572 17.428572 0 1 1  45.214287 23.214285 z" transform="matrix(0.8032787,0,0,1.0040983,1.1803276,2.6905748)"></path>
<path style="stroke:#000000;stroke-width:4;stroke-linecap:butt;stroke-linejoin:miter;stroke-miterlimit:4;stroke-dasharray:none;stroke-opacity:1" d="M 24,20 L 24,43.52"></path>
<path style="fill:#000000;fill-opacity:1;fill-rule:evenodd;" d="M 8.5625,21 L 38.4375,21 C 38.4375,21 35.5,6.9999996 23.6875,7.0624996 C 11.8125,7.1249996 8.5625,21 8.5625,21 z "></path>
</g>
`;

const DebugButton = Radium(({ debug }) => (
  <div alt='debug' onClick={debug} style={[styles.button, styles.buttons.debug]}>
    <svg height={30} width={30} dangerouslySetInnerHTML={{__html: DEBUG_ICON}}/>
  </div>
));

let NextButton = Radium(({ next }) => (
  <div alt='next' onClick={next} style={[styles.button, styles.buttons.next]}>
    <svg height={30} width={30}>
      <polygon points={[[2.5, 0], [2.5, 30], [30, 15]]} fill='white'/>
      <rect x={26} y={0} width={4} height={30} fill='white'/>
    </svg>
  </div>
));

const PlayOutButton = Radium(({ playOut }) => (
  <div alt='Play Out' onClick={playOut} style={[styles.button, styles.buttons.playOut]}>
    <svg height={30} width={30}>
      <polygon points={[[2.5, 0], [2.5, 30], [30, 15]]} fill='white'/>
    </svg>
  </div>
));

const NextWorldButton = Radium(({ nextWorld }) => (
  <div alt='Next World' onClick={nextWorld} style={[styles.button, styles.buttons.nextWorld]}>
    Next
  </div>
));

let TopBar = Radium(({
  // TopBar settings
  title,
  desc,
  style,

  // State
  running,
  debugging,
  won,
  hasNextWorld,

  // Action Creators
  run,
  debug,
  next,
  playOut,
  nextWorld,
}) => {
  if (!Array.isArray(style)) style = [style];
  let buttons = [];
  if (running) {
    if (debugging) {
      buttons.push(<NextButton key='next' next={next} />);
      buttons.push(<PlayOutButton key='playOut' playOut={playOut} />);
    }
  } else {
    buttons.push(<DebugButton key='debug' debug={debug} />);
    buttons.push(<RunButton key='run' run={run} />);
  }
  return (
    <div style={[...style, styles.container]}>
      <div style={[styles.titleContainer]}>
        <h2 style={[styles.title, styles.text]}>{title}</h2>
        {/* Desc is truseted, it comes from the world. */}
        <p style={[styles.desc, styles.text]} dangerouslySetInnerHTML={{ __html: desc }} />
      </div>
      <div style={[styles.buttonContainer]}>
        {won && hasNextWorld && <NextWorldButton nextWorld={nextWorld} />}
        {buttons}
      </div>
    </div>
  );
});

TopBar = connect(
  ({
    Editor: { running, debugging },
    TopBar: { title, desc },
    KarelWorld: { won },
    api: { worlds },
  }) => (
    { running, title, desc, debugging, won, hasNextWorld: worlds.length > 0 }
  ),
  dispatch => bindActionCreators({ next, playOut, debug, run, nextWorld }, dispatch)
)(TopBar);

export default TopBar;
