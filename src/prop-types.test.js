const PropTypes = require('prop-types');
const reactPeekPropTypes = require('./prop-types');

describe('Prop-Types', () => {

	let consoleErrorSpy;

	beforeEach(() => {
		consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => { });
	});

	afterEach(() => {
		consoleErrorSpy.mockRestore();
	});

	describe('#string', () => {

		it('should have the peek property', () => {

			expect(reactPeekPropTypes.string).toHaveProperty('peek');

		});

		it('should have peek.type = string', () => {

			expect(reactPeekPropTypes.string.peek).toEqual({ type: 'string' });

		});

		it('should validate strings', () => {

			const propsTypes = {
				name: reactPeekPropTypes.string,
			}

			const props = {
				name: 'My Name',
			}

			PropTypes.checkPropTypes(propsTypes, props, 'prop', 'MyComponent');

			expect(consoleErrorSpy).not.toBeCalled();

		});

		it('should have text', () => {

			const prop = reactPeekPropTypes.string`String Description`;

			expect(prop.peek).toEqual({ type: 'string', text: 'String Description' });

		});

		it('should have isRequired property', () => {

			expect(reactPeekPropTypes.string).toHaveProperty('isRequired');
			expect(reactPeekPropTypes.string.isRequired.isRequired).toBeUndefined();

		});

		it('isRequired should set isRequired = true', () => {

			const propsTypes = {
				name: reactPeekPropTypes.string.isRequired,
			}

			const props = {
				name: 'My Name',
			}

			expect(reactPeekPropTypes.string.isRequired.peek).toEqual({ type: 'string', isRequired: true });

		});

		it('should have assign function property', () => {

			expect(reactPeekPropTypes.string).toHaveProperty('assign');
			expect(reactPeekPropTypes.string.assign).toBeInstanceOf(Function);

		});

		it('assign should set arbitrary keys and values', () => {

			const propsTypes = {
				name: reactPeekPropTypes.string.assign({
					meta: ['data'],
				}),
			};

			expect(propsTypes.name.peek).toEqual({ type: 'string', meta: ['data'] });

		});

		it('assign should only be additive', () => {

			expect(reactPeekPropTypes.string.assign({
					meta: ['data'],
			}).peek)
				.toMatchObject(reactPeekPropTypes.string.peek)

		});

	});

	describe('isRequired', () => {

		it('should validate after using isRequired', () => {

			const propsTypes = {
				name: reactPeekPropTypes.string.isRequired,
			}

			const props = {}

			PropTypes.checkPropTypes(propsTypes, props, 'prop', 'MyComponent');

			expect(consoleErrorSpy).toBeCalledWith('Warning: Failed prop type: The prop `name` is marked as required in `MyComponent`, but its value is `undefined`.');

		});

	});

	describe('assign', () => {

		it('should still validate after using assign', () => {

			const propsTypes = {
				name: reactPeekPropTypes.string.assign({ size: 'large' }),
			}

			const props = {
				name: 'My Name',
			}

			PropTypes.checkPropTypes(propsTypes, props, 'prop', 'MyComponent');

			expect(consoleErrorSpy).not.toBeCalled();

		});

	});

});
