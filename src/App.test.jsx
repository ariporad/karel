import App from './App';

describe('<App />', () => {
  it('renders successfully', () => {
    expect(() => shallow(<App />)).to.not.throw();
  });
});

