# react-peek
Gather data by inspecting react components

A drop-in replacement for [Facebook's
prop-types](https://github.com/facebook/prop-types) with added properties on the
resolver functions that store prop type data.

## Example Usage
Define propTypes for your component.
```
import PropTypes from 'react-peek/prop-types';

const propTypes = {
  className: PropTypes.string,

  size: PropTypes.oneOf(['large', 'small']).isRequired,

  onClick: PropTypes.func`
    Callback function triggered when user clicks on the button.
  `
};
```

then inspect the `peek` property to get info about a particular propType.

```
propTypes.className.peek.type; // 'string'
propTypes.size.peek.type; // 'oneOf'
propTypes.size.peek.isRequired; // true
propTypes.size.peek.args; // ['large', 'small']
propTypes.onClick.peek.type; // 'func'
propTypes.onClick.peek.description; // 'Callback function triggered when user clicks on the button.'
```
