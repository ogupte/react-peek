const STATICS_NAMESPACE = 'peek';
const PROPTYPE_SET = new Set([
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
	'instanceOf',
	'oneOf',
	'oneOfType',
	'arrayOf',
	'objectOf',
	'shape',
]);

const DEFAULT_OPTIONS = {
	removeTemplateLiterals: true,
	minifyStatics: false,
};

const getOpt = (opts = {}, name) =>
	(opts[name] !== undefined ? opts[name] : DEFAULT_OPTIONS[name]);

module.exports = () => {
	return {
		visitor: {
			// replace tagged template expression with just the resolver without the string
			TaggedTemplateExpression(path, { opts }) {
				if (getOpt(opts, 'removeTemplateLiterals')) {
					if (path.node.tag.type === 'Identifier') {
						if (PROPTYPE_SET.has(path.node.tag.name)) {
							path.replaceWith(path.node.tag);
							return;
						}
					}
					if (path.node.tag.type === 'CallExpression') {
						if (path.node.tag.callee.type === 'Identifier') {
							if (PROPTYPE_SET.has(path.node.tag.callee.name)) {
								path.replaceWith(path.node.tag);
								return;
							}
						}
						if (path.node.tag.callee.type === 'MemberExpression') {
							if (path.node.tag.callee.property.type === 'Identifier') {
								if (PROPTYPE_SET.has(path.node.tag.callee.property.name)) {
									path.replaceWith(path.node.tag);
									return;
								}
							}
						}
					}
					if (path.node.tag.type === 'MemberExpression') {
						if (path.node.tag.property.type === 'Identifier') {
							if (
								PROPTYPE_SET.has(path.node.tag.property.name) ||
								path.node.tag.property.name === 'isRequired'
							) {
								path.replaceWith(path.node.tag);
								return;
							}
						}
					}
				}
			},

			// remove metadata object property within 'statics' object
			ObjectProperty(path, { opts }) {
				if (getOpt(opts, 'minifyStatics')) {
					if (path.node.key.type === 'Identifier') {
						if (path.node.key.name === STATICS_NAMESPACE) {
							if (path.parentPath.parentPath.node.type === 'ObjectProperty') {
								if (path.parentPath.parentPath.node.key.type === 'Identifier') {
									if (path.parentPath.parentPath.node.key.name === 'statics') {
										path.remove();
										return;
									}
								}
							}
						}
					}
				}
			},
		},
	};
};
