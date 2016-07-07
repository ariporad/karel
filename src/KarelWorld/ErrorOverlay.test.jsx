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
});
