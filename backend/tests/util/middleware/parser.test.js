const { Relation } = require('../../../src/models');
const { ParseError } = require('../../../src/util/error');
const { parseId, paginationParser, parseRelationType } = require('../../../src/util/middleware/parser');

describe('id parser', () => {
  const expectToThrow = (value) => expect(() => parseId(value)).toThrow(ParseError);

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
        zeroes.forEach(value => expect(parseId(value)).toBe(0));
      });

      test('positive integers are allowed', () => {
        positiveIntegers.forEach(value => expect(parseId(value)).toBe(value));
      });

      test('positive integer floats are allowed', () => {
        positiveIntegerfloats.forEach(value => expect(parseId(value)).toBe(value));
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
        zeroes.forEach(value => expect(parseId(value.toString())).toBe(0));
      });

      test('positive integers are allowed', () => {
        positiveIntegers.forEach(value => expect(parseId(value.toString())).toBe(value));
      });

      test('positive integer floats are allowed', () => {
        positiveIntegerfloats.forEach(value => expect(parseId(value.toString())).toBe(value));
      });

      test('leading zeroes are allowed', () => {
        const leadingZeroes = ['09', '0010', '0000098'];
        leadingZeroes.forEach(value => expect(parseId(value)).toBe(Number(value)));
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

describe('pagination parser', () => {
  const defaultPageNumber = 0;
  const defaultPageSize = 10;

  const callPagnationParser = (request) => {
    const next = () => undefined;
    const response = {};

    paginationParser(request, response, next)
  };

  test('without query parameters, the default values are set', () => {
    const request = { query: {} };

    callPagnationParser(request);

    expect(request.pageNumber).toBe(defaultPageNumber);
    expect(request.pageSize).toBe(defaultPageSize);
  });

  describe('setting query parameter page', () => {
    const validPageNumbers = [0, 1, 2, 10, 100];
    const invalidPageNumbers = [-1, 0.1, '-1', 'a', '', null, undefined];

    test('non-negative number sets pageNumber', () => {
      validPageNumbers.forEach((pageNumber) => {
        const request = { query: { page: pageNumber } };

        callPagnationParser(request);
  
        expect(request.pageNumber).toBe(pageNumber);
    
        // page size is default
        expect(request.pageSize).toBe(defaultPageSize);
      });
    });

    test('non-negative string sets pageNumber', () => {
      validPageNumbers.forEach((pageNumber) => {
        const request = { query: { page: pageNumber.toString() } };

        callPagnationParser(request);
  
        expect(request.pageNumber).toBe(pageNumber);
    
        // page size is default
        expect(request.pageSize).toBe(defaultPageSize);
      });
    });

    test('if page is not a non-negative number, then pageNumber is set to default', () => {
      invalidPageNumbers.forEach((pageNumber) => {
        const request = { query: { page: pageNumber } };

        callPagnationParser(request);
  
        // fallback to default
        expect(request.pageNumber).toBe(defaultPageNumber);

        expect(request.pageSize).toBe(defaultPageSize);
      });
    });
  });

  describe('setting page size', () => {
    const validPageSizes = [1, 2, 10, 100];
    const invalidPageSizes = [-1, 0.1, 0, '-1', 'a', '', null, undefined];

    test('positive number sets pageSize', () => {
      validPageSizes.forEach((pageSize) => {
        const request = { query: { size: pageSize } };

        callPagnationParser(request);
  
        // page number is default
        expect(request.pageNumber).toBe(defaultPageNumber);
    
        expect(request.pageSize).toBe(pageSize);
      });
    });

    test('positive string sets pageSize', () => {
      validPageSizes.forEach((pageSize) => {
        const request = { query: { size: pageSize.toString() } };

        callPagnationParser(request);
  
        // page number is default
        expect(request.pageNumber).toBe(defaultPageNumber);
    
        expect(request.pageSize).toBe(pageSize);
      });
    });

    test('if size is not a positve number, then pageSize is set to default', () => {
      invalidPageSizes.forEach((pageSize) => {
        const request = { query: { size: pageSize } };

        callPagnationParser(request);
  
        expect(request.pageNumber).toBe(defaultPageNumber);

        // fallback to default
        expect(request.pageSize).toBe(defaultPageSize);
      });
    });
  });
});
