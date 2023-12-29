const { ParameterError, IllegalStateError } = require('../../../src/util/error');
const { parseParamId, paginationParser } = require('../../../src/util/middleware/parser');

describe('id parsing', () => {
  const minId = 1;
  const maxId = 2147483647;

  const interiors = [minId + 1, 10, 2023, 58000, maxId - 1];

  describe('string parameters', () => {
    describe('invalid digits test', () => {
      test('can not contain ".', () => {
        const values = ['.1', '10.0', '10.', '1000.00'];

        values.forEach(value =>
          expect(() => parseParamId(value).toThrow(ParameterError))
        );
      });

      test('can not contain letters', () => {
        const values = ['hello', '12a', 'a12', '1a2'];

        values.forEach(value =>
          expect(() => parseParamId(value).toThrow(ParameterError))
        );
      });

      test('can not contain whitespace', () => {
        const values = ['', ' ', ' 10', '10 '];

        values.forEach(value =>
          expect(() => parseParamId(value).toThrow(ParameterError))
        );
      });

      test('can not contain signs', () => {
        const values = ['+10', '-10'];

        values.forEach(value =>
          expect(() => parseParamId(value).toThrow(ParameterError))
        );
      });
    });

    describe('range test', () => {
      // one too small/large
      test(`"${minId - 1}" is not valid id`, () => {
        expect(() => parseParamId((minId - 1).toString())).toThrow(ParameterError);
      });

      test(`"${maxId + 1}" is not valid id`, () => {
        expect(() => parseParamId((maxId + 1).toString())).toThrow(ParameterError);
      });

      // boundary
      test(`"${minId}" is valid id`, () => {
        expect(parseParamId(minId.toString())).toBe(minId);
      });

      test(`"${maxId}" is valid id`, () => {
        expect(parseParamId(maxId.toString())).toBe(maxId);
      });

      // in range
      test('interior values', () => {
        interiors.forEach(value =>
          expect(parseParamId(value.toString())).toBe(value)
        );
      });
    });
  });

  describe('non-string parameters', () => {
    const numbers = [-999, -10, -1.1, 0.7, 1.0, 1.1, 10.01, NaN];
    const others = [null, undefined, false, true, [], [6], {}, { 1: 2 }];

    test('number parameters', () => {
      [ ...interiors, ...numbers ].forEach(value =>
        expect(() => parseParamId(value).toThrow(IllegalStateError))
      );
    });

    test('other parameters', () => {
      others.forEach(value =>
        expect(() => parseParamId(value).toThrow(IllegalStateError))
      );
    });
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