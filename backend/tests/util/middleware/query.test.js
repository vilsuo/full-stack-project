const { DEFAULT_PAGE_NUMBER, DEFAULT_PAGE_SIZE } = require('../../../src/constants');
const { pagination } = require('../../../src/util/middleware/query');
const { callMiddleware, createRequest } = require('../../helpers/middleware');
const parser = require('../../../src/util/parser');
const { ParseError } = require('../../../src/util/error');

const next = jest.fn();

const parsePageNumberSpy = jest.spyOn(parser, 'parseNonNegativeInteger');
const parseSizeNumberSpy = jest.spyOn(parser, 'parsePositiveInteger');

const createQueryRequest = (query = {}) => createRequest({ query });

describe('pagination', () => {
  const pageParam = 'pageNumber';
  const sizeParam = 'pageSize';

  const callPagnationParser = async (request) => callMiddleware(pagination, request, next);

  const expectToThrow = async (request) => {
    expect(() => callPagnationParser(request))
      .rejects.toThrow(ParseError);
  };

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
    const invalidPageNumbers = ['-1', '0.1', '5.5', 'a', '', ' '];

    test(`valid parameter is set to the request.${pageParam}`, async () => {
      await Promise.all(validPageNumbers.map(async (value) => {
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
      await Promise.all(invalidPageNumbers.map(async (value) => {
        const request = createQueryRequest({ page: value });

        expectToThrow(request);
        expect(next).not.toHaveBeenCalled();
      }));
    });
  });

  describe('parameter size', () => {
    const validPageSizes = ['1', '2', '10', '100'];
    const invalidPageSizes = ['-1', '0', '0.1', '5.5', 'a', '', ' '];

    test(`valid parameter is set to the request.${pageParam}`, async () => {
      await Promise.all(validPageSizes.map(async (value) => {
        const request = createQueryRequest({ size: value });
        await callPagnationParser(request);

        // page number stays default
        expect(request[pageParam]).toBe(DEFAULT_PAGE_NUMBER);

        // page size is set
        expect(request[sizeParam]).toBe(Number(value));

        expect(next).toHaveBeenCalled();
      }));
    });

    test('invalid parameter throws', async () => {
      await Promise.all(invalidPageSizes.map(async (value) => {
        const request = createQueryRequest({ size: value });

        expectToThrow(request);
        expect(next).not.toHaveBeenCalled();
      }));
    });
  });
});
