import ErrorPage from './ErrorPage';

// From https://gist.github.com/Aldredcz/4d63b0a9049b00f54439f8780be7f0d8
const logError = (Component, error) => {
  const errorMsg = `Error while rendering component. Check render() method of component '${Component.displayName || Component.name || '[unidentified]'}'.`;

  console.error(errorMsg, '\nError details:', error); // eslint-disable-line
}

const monkeypatchRender = (prototype) => {
  if (prototype && prototype.render && !prototype.render.__handlingErrors) {
    const originalRender = prototype.render;

    prototype.render = function monkeypatchedRender() {
      try {
        return originalRender.call(this);
      } catch (error) {
        logError(prototype.constructor, error);

        return <ErrorPage err={error} />;
      }
    };

    prototype.render.__handlingErrors = true; // flag render method so it's not wrapped multiple times
  }
}

const originalCreateElement = React.createElement;
React.createElement = (Component, ...rest) => {
  if (typeof Component === 'function') {

    if (typeof Component.prototype.render === 'function') {
      monkeypatchRender(Component.prototype);
    }

    // stateless functional component
    if (!Component.prototype.render) {
      const originalStatelessComponent = Component;
      Component = (...args) => {
        try {
          return originalStatelessComponent(...args);
        } catch (error) {
          logError(originalStatelessComponent, error);

          return <ErrorPage error={err} />;
        }
      };
    }
  }

  return originalCreateElement.call(React, Component, ...rest);
};


// allowing hot reload
const originalForceUpdate = React.Component.prototype.forceUpdate;
React.Component.prototype.forceUpdate = function monkeypatchedForceUpdate() {
  monkeypatchRender(this);
  originalForceUpdate.call(this);
};
