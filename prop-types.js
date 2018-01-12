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

const createDescriptiveValidator = (propTypeValidator, metaData={}, isRequired, namespace=NAMESPACE) => {
	return Object.assign((...args) => {
		if (typeof args[0] === 'string') {
			return createDescriptiveValidator(propTypeValidator, Object.assign({}, metaData, {
				description: args[0].trim(),
			}), isRequired);
		} else if (Array.isArray(args[0]) && args[0].raw) {
			return createDescriptiveValidator(propTypeValidator, Object.assign({}, metaData, {
				description: String.raw(...args).trim(),
			}), isRequired);
		} else {
			return propTypeValidator(...args);
		}
	}, namespace ? {[namespace]: metaData} : metaData, {isRequired});
};

const createStaticMetaPropType = (propType) => {
	const isRequired = createDescriptiveValidator(PropTypes[propType].isRequired, {
		type: propType,
		isRequired: true,
	});

	return createDescriptiveValidator(PropTypes[propType], {
		type: propType,
	}, isRequired);
};

const createDynamicMetaPropType = (propType) => {
	return (...args) => {
		const isRequired = createDescriptiveValidator(PropTypes[propType](...args).isRequired, {
			type: propType,
			args: args,
			isRequired: true,
		});

		return createDescriptiveValidator(PropTypes[propType](...args), {
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

const applyDescriptions = (propTypes, ...descriptionObjs) => {
	return descriptionObjs.reduce((nextPropTypes, descriptionObj) => {
		if (descriptionObj) {
			const appliedDescriptions = Object.keys(descriptionObj).reduce((acc, propTypeKey) => {
				if (propTypes[propTypeKey]) {
					acc[propTypeKey] = propTypes[propTypeKey](descriptionObj[propTypeKey]);
					return acc;
				}
				return acc;
			}, {});

			return Object.assign(nextPropTypes, appliedDescriptions);
		}
		return nextPropTypes;
	}, Object.assign({}, propTypes));
};

module.exports = Object.assign({}, PropTypes, staticMetaPropTypes, dynamicMetaPropTypes, {
	createDescriptiveValidator,
	applyDescriptions,
});
