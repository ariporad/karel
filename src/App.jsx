import { Style } from 'radium';
import KarelWorld from './KarelWorld/KarelWorld';
import Editor from './Editor/Editor';
import TopBar from './TopBar/TopBar';

const styles = {
  container: {
    display: 'flex',
    alignItems: 'center',
  },
  topBar: {
    height: '15%',
    width: '100%',
    border: '1px solid black',
  },
  paine: {
    width: '50%',
    height: '85%',
    display: 'inline-block',
  },
  editor: {
  },
  world: {
  },
  fillParent: {
    width: '100%',
    height: '100%',
    margin: 0,
    padding: 0,
  },
}
let App = Radium((/* props */) => {
  return (
    <div style={[styles.fillParent]}>
      <TopBar style={[styles.topBar]} />
      <Editor style={[styles.paine, styles.editor]}/>
      <KarelWorld size={100} style={[styles.paine, styles.world]}/>
      <Style rules={{ 'html, body, #root': styles.fillParent }} />
    </div>
  );
});

export default App;

