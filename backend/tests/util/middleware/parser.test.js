const { Relation } = require('../../../src/models');
const { ParseError } = require('../../../src/util/error');
const { parseId, paginationParser, parseRelationType } = require('../../../src/util/middleware/parser');

describe('id parser', () => {
  // valid numbers
  const minId = 1;
  const maxId = 2147483647;

  const interiors = [minId + 1, 10, 2023, 58000, maxId - 1];

  const decimalZeroes = [1.0, 10.00, 100.000];

  // invalid numbers
  const trueDecimals = [0.7, 1.1, 10.01];
  const negatives = [-999, -10, -1.1];

  const expectToThrow = (value) => expect(() => parseId(value)).toThrow(ParseError);

  describe('string parameters', () => {
    describe('invalid strings', () => {
      test('true decimals are not allowed', () => {
        trueDecimals.forEach(value => expectToThrow(value.toString()));
      });

      test('negatives are not allowed', () => {
        negatives.forEach(value => expectToThrow(value.toString()));
      });

      test('can not contain letters', () => {
        const values = ['hello', '12a', 'a12', '1a2'];

        values.forEach(value => expectToThrow(value));
      });

      test('can not contain non-leading or non-trailing whitespace', () => {
        const values = ['', ' ', '1 0'];

        values.forEach(value => expectToThrow(value));
      });

      test('just out of range', () => {
        expectToThrow((minId - 1).toString());
        expectToThrow((maxId + 1).toString());
      });
    });

    describe('valid strings', () => {
      test('numbers with decimal zero', () => {
        decimalZeroes.forEach(value => expect(parseId(value.toString())).toBe(value));
      });

      test('can contain positive sign', () => {
        expect(parseId('+10')).toBe(10);
      });

      test('can contain leading and trailing whitespace', () => {
        const values = ['10 ', ' 10', ' 10 '];

        values.forEach(value => expect(parseId(value)).toBe(10));
      });

      test('min/max', () => {
        expect(parseId(minId.toString())).toBe(minId);
        expect(parseId(maxId.toString())).toBe(maxId);
      });

      test('interior', () => {
        interiors.forEach(value => expect(parseId(value.toString())).toBe(value));
      });
    });
  });

  describe('number parameters', () => {
    describe('invalid numbers', () => {
      test('true decimals are not allowed', () => {
        trueDecimals.forEach(value => expectToThrow(value));
      });

      test('negatives are not allowed', () => {
        negatives.forEach(value => expectToThrow(value));
      });

      test('NaN is not allowed', () => {
        expectToThrow(NaN);
      });

      test('just out of range', () => {
        expectToThrow(minId - 1);
        expectToThrow(maxId + 1);
      });
    });

    describe('valid numbers', () => {
      test('numbers with decimal zero', () => {
        decimalZeroes.forEach(value => expect(parseId(value)).toBe(value));
      })

      test('min/max', () => {
        expect(parseId(minId)).toBe(minId);
        expect(parseId(maxId)).toBe(maxId);
      });

      test('interior', () => {
        interiors.forEach(value => expect(parseId(value)).toBe(value));
      });
    });
  });

  test('other parameters', () => {
    const others = [null, undefined, false, true, [], [6], {}, { 1: 2 }];

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