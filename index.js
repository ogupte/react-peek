const path = require('path');
const _ = require('lodash');
const React = require('react');
const PropTypes = require('./prop-types.js');

require('babel-core/register')({
	presets: [
		['es2015', {
			modules: 'commonjs',
		}],
		'react',
	],
	plugins: [],
});

const isReactComponent = (value) => {
	try {
		return typeof value === 'function' && !!new value().isReactComponent;	
	} catch (err) {
		return false;
	}
};

const NAMESPACE = 'peek';

const mapModuleToComponentData = (componentModule, componentModulePath, namespace=NAMESPACE) => {
	const component = componentModule.default;
	return mapComponentToComponentData(component, componentModulePath && path.basename(componentModulePath, path.extname(componentModulePath)), namespace);
}

const mapComponentToComponentData = (component, baseName, namespace=NAMESPACE) => {
	const displayName = component.displayName || component.name || null;
	const defaultProps = component.defaultProps || (component.getDefaultProps  &&
		component.getDefaultProps()) || (component.definition &&
		component.definition.getDefaultProps &&
		component.definition.getDefaultProps()) || {};

	const propTypes = _.fromPairs(_.map(component.propTypes, (value, key) => [
		key,
		value[namespace] || {},
	]));

	const childComponents = _.reduce(component, (acc, propertyValue, propertyKey) => {
		if (isReactComponent(propertyValue)) {
			return acc.concat([{
				value: propertyValue,
				key: propertyKey,
			}]);
		}
		return acc;
	}, []);

	return Object.assign({
			baseName,
			displayName,
			propTypes: _.mapValues(propTypes, (value, key) => Object.assign({}, value, {
				default: _.get(defaultProps, key),
			})),
		},
		component[namespace] || null,
		_.has(component, [namespace, 'description']) ? {
			description: _.get(component, [namespace, 'description']).trim(),
		} : null,
		!_.isEmpty(childComponents) ? {childComponents: _.map(childComponents, ({value, key}) => mapComponentToComponentData(value, key))} : null
	);
};

const loadComponentData = (modulePath, mapFunc=mapModuleToComponentData) => new Promise((resolve, reject) => {
	const absoluteModulePath = path.isAbsolute(modulePath) ?
		modulePath :
		path.resolve(process.cwd(), modulePath);
	try {
		resolve(mapFunc(require(absoluteModulePath), absoluteModulePath));
	} catch (err) {
		reject(err);
	}
})

const loadComponentDataList = (modulePaths, mapFunc=mapModuleToComponentData) => Promise.all(_.map(
	modulePaths,
	(modulePath) => loadComponentData(modulePath, mapFunc))
);

module.exports = {
	mapModuleToComponentData,
	loadComponentData,
	loadComponentDataList,
	PropTypes,
};
