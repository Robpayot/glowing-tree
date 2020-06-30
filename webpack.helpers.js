const handlebarsLayouts = require("handlebars-layouts");

const handlebarsContext = {};
function _handlebarsEqualHelper(name, value, options) {
  return handlebarsContext[name] === value ? options.fn(this) : options.inverse(this);
}

function _handlebarsVariablesHelper(name, options) {
  const content = options.fn(this);
  handlebarsContext[name] = content;
}

function registerHandlersHelpers(Handlebars) {
  Handlebars.registerHelper("equal", _handlebarsEqualHelper);
  Handlebars.registerHelper("set", _handlebarsVariablesHelper);
  handlebarsLayouts.register(Handlebars);
}

module.exports = {
  registerHandlersHelpers
};
