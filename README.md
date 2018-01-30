# react-peek
Gather data by inspecting react components

A drop-in replacement for [Facebook's
prop-types](https://github.com/facebook/prop-types) with added properties on the
resolver functions that store prop type data.

## Install

```
npm i --save react-peek
```

## Usage

Define propTypes for your component.

```javascript
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

```javascript
propTypes.className.peek.type; // 'string'
propTypes.size.peek.type; // 'oneOf'
propTypes.size.peek.isRequired; // true
propTypes.size.peek.args; // ['large', 'small']
propTypes.onClick.peek.type; // 'func'
propTypes.onClick.peek.text; // '\n    Callback function triggered when user clicks on the button.\n  '
```

## Optimizing builds

Template strings can be removed in production builds by using the babel plugin `react-peek/babel`.

Example `.babelrc`:
```json
{
	"env": {
		"test": {
			"plugins": []
		},
		"development": {
			"plugins": []
		},
		"production": {
			"plugins": [
				["react-peek/babel"]
			]
		}
	},
	"presets": [
		"stage-2",
		"es2015",
		"react"
	]
}
```

This will replace this:

```javascript
{
  className: PropTypes.string`
    Passes a custom className through to the component.
  `,

  size: PropTypes.oneOf(['large', 'small']).isRequired`
    Sets the size of the button.
  `,

  onClick: PropTypes.func`
    Callback function triggered when user clicks on the button.
  `
};
```

with this:

```javascript
{
  className: PropTypes.string,
  size: PropTypes.oneOf(['large', 'small']).isRequired,
  onClick: PropTypes.func
};
```
