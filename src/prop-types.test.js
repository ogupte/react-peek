const PropTypes = require('prop-types');
const reactPeekPropTypes = require('./prop-types');

describe('Prop-Types', () => {

	describe('#string', () => {

		it('should have the peek property', () => {

			expect(reactPeekPropTypes.string).toHaveProperty('peek');

		});

		it('should have peek.type = string', () => {

			expect(reactPeekPropTypes.string.peek).toEqual({ type: 'string' });

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

			return PropTypes.checkPropTypes(propsTypes, props, 'prop', 'MyComponent');

		});

		it('should have isRequired property', () => {

			expect(reactPeekPropTypes.string).toHaveProperty('isRequired');
			expect(reactPeekPropTypes.string.isRequired.isRequired).toBeUndefined();

		});

		it('isRequired should set isRequired = true ', () => {

			const propsTypes = {
				name: reactPeekPropTypes.string.isRequired,
			}

			const props = {
				name: 'My Name',
			}

			expect(reactPeekPropTypes.string.isRequired.peek).toEqual({ type: 'string', isRequired: true });

		});

	});

});
