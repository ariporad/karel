import ace from 'brace';
import { Style } from 'radium';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { setCode } from './duck';

import 'brace/mode/javascript';
import 'brace/theme/github';

// https://github.com/thlorenz/brace/issues/37
const Range = ace.acequire('ace/range').Range;

const styles = {
  editor: {
    width: '100%',
    height: '100%',
  },
  activeLine: {
    position: 'absolute',
    zIndex: 20,
    background: 'orange',
  },
};

class Editor extends React.Component {

  constructor(props) {
    super();
    this.editorDiv = <div ref='editor' key='editor' style={[styles.editor]} id='ace-editor' />
    // So we don't cause a re-render in resonse to our changes.
    this.updating = false;
  }

  componentDidMount() {
    this.editor = ace.edit('ace-editor');
    this.editor.$blockScrolling = Infinity;
    this.editor.getSession().setMode('ace/mode/javascript');
    this.editor.setTheme('ace/theme/monokai');

    const session = this.editor.getSession();

    // Don't show warnings in the gutter
    session.on('changeAnnotation', () => {
      session.getAnnotations().length > 0 && session.setAnnotations([])
    });

    // Keep props in sync
    this.editor.getSession().on('change', () => {
      if (!this.updating) {
        this.props.setCode(this.editor.getValue())
      }
    });

  }

  shouldComponentUpdate(nextProps) {
    this.updating = true;
    this.editor.setReadOnly(nextProps.running);
    this.editor.setValue(nextProps.code);

    const session = this.editor.getSession();
    const markers = session.getMarkers(false);

    // For some reason, it starts by hightlighting everything. Fix that.
    for (const id in markers) {
      if (
        // It starts out by highlighting the code when you use set value.
        markers[id].clazz === 'ace_selection' ||
        // Un-highlight the old line
        markers[id].clazz === 'active-line'
      ) session.removeMarker(id);
    }

    // Hightlight the active line
    if (nextProps.running && nextProps.activeLine) {
      session.addMarker(new Range(nextProps.activeLine - 1, 0, nextProps.activeLine, 0), 'active-line', true);
    }
    this.updating = false;
    // Don't update, it would break the editor
    return false;
  }

  render() {
    return (
      <div style={this.props.style}>
        <div ref='editor' style={[styles.editor]} id='ace-editor' />
        <Style rules={{ '.active-line': styles.activeLine }} />
      </div>
    );
  }
};

Editor = connect(
  ({ Editor: { code, running, line } }) => ({ code, running, activeLine: line }),
  dispatch => bindActionCreators({ setCode }, dispatch)
)(Radium(Editor));

export default Editor;

