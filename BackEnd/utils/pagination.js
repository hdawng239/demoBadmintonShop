const parsePagination = (pageValue, limitValue, defaultLimit = 10, maxLimit = 100) => {
    const parsedPage = Number.parseInt(pageValue, 10);
    const parsedLimit = Number.parseInt(limitValue, 10);
    return {
        page: Number.isInteger(parsedPage) && parsedPage > 0 ? Math.min(parsedPage, 10_000) : 1,
        limit: Number.isInteger(parsedLimit) && parsedLimit > 0
            ? Math.min(parsedLimit, maxLimit)
            : defaultLimit,
    };
};

module.exports = { parsePagination };
