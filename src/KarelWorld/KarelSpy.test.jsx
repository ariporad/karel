import KarelSpy from './KarelSpy';

describe('<KarelSpy />', () => {
  it('renders successfully', () => {
    expect(() => shallow(<KarelSpy cx={100} cy={100} size={100} dir={0} />)).to.not.throw();
  });

  it('renders something different for each direction', () => {
    const left = shallow(<KarelSpy cx={100} cy={100} size={100} dir={0} />).html();
    const up = shallow(<KarelSpy cx={100} cy={100} size={100} dir={1} />).html();
    const right = shallow(<KarelSpy cx={100} cy={100} size={100} dir={2} />).html();
    const down = shallow(<KarelSpy cx={100} cy={100} size={100} dir={3} />).html();

    // There has to be a better way to do this.
    expect([up, right, down]).to.not.include(left);
    expect([left, right, down]).to.not.include(up);
    expect([left, up, down]).to.not.include(right);
    expect([left, up, right]).to.not.include(down);
  });
});
