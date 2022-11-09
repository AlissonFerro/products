const ENV = require("../../env");
const getTableName = require("../../utils/env");

describe('test environment', () => {
  it('return table name', () => {
    const table = getTableName('teste');
    expect(table).toContain('teste');
  });
});