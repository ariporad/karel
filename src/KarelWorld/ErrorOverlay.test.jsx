import ErrorOverlay from './ErrorOverlay';

describe('<ErrorOverlay />', () => {
  it('renders successfully', () => {
    expect(() => shallow(
      <ErrorOverlay err={{ message: '', line: 0, cmd: '' }} height={5} width={5} size={100} />
    )).to.not.throw();
  });

  it('covers the whole screen', () => {
    const el = mount(
      <ErrorOverlay err={{ message: 'Test Passed!', line: 42, cmd: 'test();' }} height={9} width={5} size={100} />
    ).find('rect').first();
    expect(el).to.have.attr('width', '500');
    expect(el).to.have.attr('height', '900');
  });

  it('prints the message', () => {
    expect(render(
      <ErrorOverlay err={{ message: 'Test Passed!', line: 42, cmd: 'test();' }} height={4} width={2} size={100} />
    ).text()).to.contain('Test Passed!');
  });

  it('prints the command and the line', () => {
    const text = render(
      <ErrorOverlay err={{ message: 'Test Passed!', line: 42, cmd: 'test();' }} height={4} width={2} size={100} />
    ).text();
    expect(text).to.contain('test();');
    expect(text).to.contain('42');
  });

  it('does reasonable things when there\'s no command', () => {
    const text = render(
      <ErrorOverlay err={{ message: 'Test Passed!', line: 42 }} height={4} width={2} size={100} />
    ).text();
    expect(text).to.not.contain('At'); // Not At cmd.
    expect(text).to.contain('On'); // Caps, because it's the start of the sentace.
    // Still prints the line
    expect(text).to.contain('42');
    expect(text).to.contain('line');
  });

  it('does reasonable things when there\'s no line', () => {
    const el = mount(
      <ErrorOverlay err={{ message: 'Test Passed!' }} height={4} width={2} size={100} />
    );
    expect(el.find('text').length).to.equal(1);
    expect(el.text()).to.contain('Test Passed!');
  });
});
