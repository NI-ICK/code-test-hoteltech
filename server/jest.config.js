const { defaults: tsjPreset } = require("ts-jest")

module.exports = {
  testEnvironment: "node",
  transform: {
    "^.+\\.tsx?$": ["ts-jest", {}],
  },
}
