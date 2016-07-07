import KarelError from './KarelError';

describe('KarelError()', () => {
  it('should be an instance of Error', () => {
    expect(KarelError('', { cmd: '', line: 0 })).to.be.an.instanceof(Error);
  });

  it('.karel === true', () => {
    expect(KarelError('', { cmd: '', line: 0 }).karel).to.be.true();
  });

  it('.line === line', () => {
    expect(KarelError('', { cmd: '', line: 42 }).line).to.be.equal(42);
  });

  it('.cmd === cmd', () => {
    expect(KarelError('', { cmd: 'fooBar();', line: 0 }).cmd).to.be.equal('fooBar();');
  });

  it('.stack is something reasonable', () => {
    const stack = KarelError('It Exploded!', { cmd: 'explode();', line: 42 }).stack.toLowerCase();
    expect(stack).to.contain(42);
    expect(stack).to.contain('explode();');
    expect(stack).to.contain('at');
    expect(stack).to.contain('line');
  });
});
