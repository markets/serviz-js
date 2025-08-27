/**
 * Serviz - Minimalistic Service Class Interface for JavaScript
 * A port of the Ruby gem serviz
 */

const { Base } = require('./base.cjs');
const { Workflow } = require('./workflow.cjs');



// Default export for convenience


module.exports = { Base, Workflow };
module.exports.default = { Base, Workflow };