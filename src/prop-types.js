const PropTypes = require('prop-types');

const STATIC_PROPTYPES = [
	'any',
	'array',
	'bool',
	'func',
	'number',
	'object',
	'string',
	'symbol',
	'node',
	'element',
];

const DYNAMIC_PROPTYPES = [
	'instanceOf',
	'oneOf',
	'oneOfType',
	'arrayOf',
	'objectOf',
	'shape',
];

const NAMESPACE = 'peek';

const interweave = (array0, array1) => {
	const result = [];
	const maxLength = Math.max(array0.length, array1.length);
	for(let i = 0; i < maxLength; i++) {
		if (i < array0.length) {
			result.push(array0[i]);
		}
		if (i < array1.length) {
			result.push(array1[i]);
		}
	}
	return result;
};

const createValidator = (propTypeValidator, metaData={}, isRequired, namespace=NAMESPACE) => {
	return Object.assign((...args) => {
		if (typeof args[0] === 'string') {
			return createValidator(propTypeValidator, Object.assign({}, metaData, {
				text: args[0],
			}), isRequired);
		} else if (Array.isArray(args[0]) && args[0].raw) {
			const [callSite, ...substitutions] = args;
			return createValidator(propTypeValidator, Object.assign({}, metaData, {
				text: interweave(callSite, substitutions).join(''),
			}), isRequired);
		} else {
			return propTypeValidator(...args);
		}
	}, namespace ? {[namespace]: metaData} : metaData, {isRequired}, {
		assign: (...args) => createValidator(
			propTypeValidator,
			Object.assign({}, metaData, ...args),
			isRequired,
			namespace
		),
	});
};

const createStaticMetaPropType = (propType) => {
	const isRequired = createValidator(PropTypes[propType].isRequired, {
		type: propType,
		isRequired: true,
	});

	return createValidator(PropTypes[propType], {
		type: propType,
	}, isRequired);
};

const createDynamicMetaPropType = (propType) => {
	return (...args) => {
		const isRequired = createValidator(PropTypes[propType](...args).isRequired, {
			type: propType,
			args: args,
			isRequired: true,
		});

		return createValidator(PropTypes[propType](...args), {
			type: propType,
			args: args,
		}, isRequired);
	};
};

const staticMetaPropTypes = STATIC_PROPTYPES.reduce((acc, propType) => Object.assign(acc, {
	[propType]: createStaticMetaPropType(propType),
}), {});

const dynamicMetaPropTypes = DYNAMIC_PROPTYPES.reduce((acc, propType) => Object.assign(acc, {
	[propType]: createDynamicMetaPropType(propType),
}), {});

const applyText = (propTypes, ...textObjs) => {
	return textObjs.reduce((nextPropTypes, textObj) => {
		if (textObj) {
			const appliedDescriptions = Object.keys(textObj).reduce((acc, propTypeKey) => {
				if (propTypes[propTypeKey]) {
					acc[propTypeKey] = propTypes[propTypeKey](textObj[propTypeKey]);
					return acc;
				}
				return acc;
			}, {});

			return Object.assign(nextPropTypes, appliedDescriptions);
		}
		return nextPropTypes;
	}, Object.assign({}, propTypes));
};

const defaultExport = Object.assign({}, PropTypes, staticMetaPropTypes, dynamicMetaPropTypes, {
	createValidator,
	applyText,
	PROPTYPES: [...STATIC_PROPTYPES, ...DYNAMIC_PROPTYPES],
});

defaultExport.__esModule = true;
defaultExport.default = defaultExport;

module.exports = defaultExport;
