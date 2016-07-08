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
  }

  componentDidMount() {
    this.editor = ace.edit('ace-editor');
    global.editor = this.editor;
    global.Range = Range;
    this.editor.getSession().setMode('ace/mode/javascript');
    this.editor.setTheme('ace/theme/monokai');

    const session = this.editor.getSession();

    // Don't show warnings in the gutter
    session.on('changeAnnotation', () => session.getAnnotations().length > 0 && session.setAnnotations([]));

    // Keep props in sync
    this.editor.setValue(this.props.code);
    this.editor.getSession().on('change', () => this.props.setCode(this.editor.getValue()));

    // For some reason, it starts by hightlighting everything. Fix that.
    const markers = session.getMarkers(false);
    for (const id in markers) {
      if (markers[id].clazz === 'ace_selection') session.removeMarker(id);
    }
  }

  componentDidUpdate() {
    this.editor.setReadOnly(this.props.running);

    const session = this.editor.getSession();
    const markers = session.getMarkers(false);
    for (const id in markers) {
      if (markers[id].clazz === 'active-line') session.removeMarker(id);
    }
    if (this.props.running && this.props.activeLine) {
      session.addMarker(new Range(this.props.activeLine - 1, 0, this.props.activeLine, 0), 'active-line', true);
    }
  }

  render() {
    return (
      <div style={this.props.style}>
        {this.editorDiv}
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

