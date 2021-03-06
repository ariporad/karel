import * as enzyme from 'enzyme';
import sinon from 'sinon';
import chai from 'chai';
import dirtyChai from 'dirty-chai';
import chaiEnzyme from 'chai-enzyme';
import sinonChai from 'sinon-chai';

// https://github.com/mochajs/mocha/issues/1348#issuecomment-69261444
chai.config.truncateThreshold = 0;

chai.use(dirtyChai);
chai.use(chaiEnzyme());
//chai.use(sinonChai());

chai.should();

global.shallow = enzyme.shallow;
global.render = enzyme.render;
global.mount = enzyme.mount;

global.expect = chai.expect;

global.sinon = sinon;

// Load all the test files
const req = require.context('../src', true, /\.test\.jsx?$/);
req.keys().map(req);

