const { Relation } = require('../../src/models');
const { ParseError } = require('../../src/util/error');
const { parseRelationType, parseNonNegativeInteger } = require('../../src/util/parser');

describe('parseNonNegativeInteger', () => {
  const expectToThrow = (value) => expect(() => parseNonNegativeInteger(value))
    .toThrow(ParseError);

  const positiveIntegers = [1, 702, 9000, 301240];
  const negativeIntegers = positiveIntegers.map(x => -x);

  const positiveIntegerfloats = [1.0, 7., 10.00, 1092.0, 17902.00000];
  const negativeIntegerfloats = positiveIntegerfloats.map(x => -x);

  const positivefloats = [0.0009, .01, .6, 0.9, 12.7, 987.001, 120730.999];
  const negativefloats = positivefloats.map(x => -x);

  const zeroes = [0, 0.0];

  describe('number parameters', () => {
    describe('allowed values are returned as it is', () => {
      test('zeroes are allowed', () => {
        zeroes.forEach(value => expect(parseNonNegativeInteger(value)).toBe(0));
      });

      test('positive integers are allowed', () => {
        positiveIntegers.forEach(value => 
          expect(parseNonNegativeInteger(value)).toBe(value)
        );
      });

      test('positive integer floats are allowed', () => {
        positiveIntegerfloats.forEach(value =>
          expect(parseNonNegativeInteger(value)).toBe(value)
        );
      });
    });

    describe('invalid values throw', () => {
      test('positive floats are not allowed', () => {
        positivefloats.forEach(value => expectToThrow(value));
      });

      test('negative values are not allowed', () => {
        negativeIntegers.forEach(value => expectToThrow(value));
        negativeIntegerfloats.forEach(value => expectToThrow(value));
        negativefloats.forEach(value => expectToThrow(value));
      });

      test('NaN is not allowed', () => {
        expectToThrow(NaN);
      });

      test('infinities are not allowed', () => {
        expectToThrow(Infinity);
        expectToThrow(-Infinity);
      });
    });
  });

  describe('string parameters', () => {
    describe('allowed values are converted into numbers', () => {
      test('zeroes are allowed', () => {
        zeroes.forEach(value => 
          expect(parseNonNegativeInteger(value.toString())).toBe(0)
        );
      });

      test('positive integers are allowed', () => {
        positiveIntegers.forEach(value => 
          expect(parseNonNegativeInteger(value.toString())).toBe(value)
        );
      });

      test('positive integer floats are allowed', () => {
        positiveIntegerfloats.forEach(value => 
          expect(parseNonNegativeInteger(value.toString())).toBe(value)
        );
      });

      test('leading zeroes are allowed', () => {
        const leadingZeroes = ['09', '0010', '0000098'];
        leadingZeroes.forEach(value => 
          expect(parseNonNegativeInteger(value)).toBe(Number(value))
        );
      });
    });

    describe('invalid values throw', () => {
      test('positive floats are not allowed', () => {
        positivefloats.forEach(value => expectToThrow(value.toString()));
      });
      
      test('negative values are not allowed', () => {
        negativeIntegers.forEach(value => expectToThrow(value.toString()));
        negativeIntegerfloats.forEach(value => expectToThrow(value.toString()));
        negativefloats.forEach(value => expectToThrow(value.toString()));
      });

      test('white space is not allowed', () => {
        const whitespaces = ['', ' ', ' 10', '90 '];
        whitespaces.forEach(value => expectToThrow(value));
      });

      test('letters are not allowed', () => {
        const letters = ['a', '298h', 'e19', '4r9'];
        letters.forEach(value => expectToThrow(value));
      });
    });
  });

  test('other parameters', () => {
    const others = [null, undefined, false, true, [], [6], ['12'], {}, { 1: 2 }];

    others.forEach(value => expectToThrow(value));
  });
});

describe('relation type parser', () => {
  const relationTypes = Relation.getAttributes().type.values;

  const expectToThrow = (value) => expect(() => parseRelationType(value)).toThrow(ParseError);

  test.each(relationTypes)('parsing valid relation type %s returns the type', (type) => {
    expect(parseRelationType(type)).toBe(type);
  });

  test('missing relation throws error', () => {
    expectToThrow();
  });

  test('invalid strings throws error', () => {
    const invalidTypes = ['', 'public', 'private', 'blok', 'follower'];

    invalidTypes.forEach(value => expectToThrow(value));
  });

  test('other invalid values throws error', () => {
    const other = [false, true, undefined, [], ['follow'], relationTypes, {}];

    other.forEach(value => expectToThrow(value));
  });
});