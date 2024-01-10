const { DEFAULT_PAGE_NUMBER, DEFAULT_PAGE_SIZE } = require("../../../src/constants");
const { paginationParser } = require("../../../src/util/middleware/query");
const { callMiddleware, createRequest } = require("../../helpers/middleware");
const parser = require('../../../src/util/parser');
const { ParseError } = require("../../../src/util/error");

const next = jest.fn();

const parsePageNumberSpy = jest.spyOn(parser, 'parseNonNegativeInteger');
const parseSizeNumberSpy = jest.spyOn(parser, 'parsePositiveInteger');

const createQueryRequest = (query = {}) => createRequest({}, query);

describe('pagination parser', () => {

  const pageParam = 'pageNumber';
  const sizeParam = 'pageSize';

  const callPagnationParser = async (request) => {
    return await callMiddleware(paginationParser, request, next);
  };

  const expectToThrow = async (request) => 
    await expect(() => callPagnationParser(request))
      .rejects.toThrow(ParseError);

  describe('without query parameters', () => {
    let request;

    beforeEach(async () => {
      request = createQueryRequest();
      await callPagnationParser(request);
    });

    test('the default values are set', async () => {
      expect(request[pageParam]).toBe(DEFAULT_PAGE_NUMBER);
      expect(request[sizeParam]).toBe(DEFAULT_PAGE_SIZE);
  
      expect(next).toHaveBeenCalled();
    });

    test('parsers are not called', () => {
      expect(parsePageNumberSpy).not.toHaveBeenCalled();
      expect(parseSizeNumberSpy).not.toHaveBeenCalled();
    });
  });

  describe('parameter page', () => {
    const validPageNumbers = ['0', '1', '2', '10', '100'];
    const invalidPageNumbers = ['-1', '0.1', 'a', '', ' '];

    test(`valid parameter is set to the request.${pageParam}`, async () => {
      await Promise.all(validPageNumbers.map(async value => {
        const request = createQueryRequest({ page: value });
        await callPagnationParser(request);

         // page number is set
         expect(request[pageParam]).toBe(Number(value));

         // page size stays default
         expect(request[sizeParam]).toBe(DEFAULT_PAGE_SIZE);
 
         expect(next).toHaveBeenCalled();
      }));
    });

    test('invalid parameter throws', async () => {
      await Promise.all(invalidPageNumbers.map(async value => {
        const request = createQueryRequest({ page: value });

        expectToThrow(request);
        expect(next).not.toHaveBeenCalled();
      }));
    });
  });

  /*
  describe('parameter size', () => {
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
  */
});