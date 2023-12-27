const { paginationParser } = require('../../../src/util/middleware/parser');

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