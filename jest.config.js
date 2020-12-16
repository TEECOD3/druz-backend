module.exports = {
  roots: ["./src"],
  transform: {
    "^.+\\.ts?$": "ts-jest",
  },
  testTimeout: 50000,
  testRegex: "(/__tests__/.*|(\\.|/)(test|spec))\\.ts?$",
  moduleFileExtensions: ["ts", "tsx", "js", "jsx", "json", "node"],
};
