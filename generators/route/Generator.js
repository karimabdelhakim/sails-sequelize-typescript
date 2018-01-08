/**
 * Module dependencies
 */

var util = require('util');
var _ = require('lodash');
_.defaults = require('merge-defaults');
//var cmd = require('node-cmd');
var Sails = require('sails').constructor;
var fs = require('fs');


/**
 * sails-generate-route
 *
 * Usage:
 * `sails generate route`
 *
 * @description Generates a route
 * @help See http://links.sailsjs.org/docs/generators
 * 
 * command paramters
 * 
 * @param method
 * @param route
 * @param controller_name
 * @param function
 */

module.exports = {

  before: function (scope, cb) {

    input = parseInput(scope.args);

    let myApp = new Sails();

    myApp.lift({ port: 1337 }, (err) => {
      if (err) {
        return cb(new Error('Couldnt lift app'));
      }

      insertRouteinDB(input, (err, entity_operation) => {
        if (err) throw err;

        createRoute(input);

        myApp.lower((err) => {
          if (err) throw err;
        });

        console.log(`Route ` + input.route + ` has been created Successfully`);
      });

    });

    // scope.rootPath is the base path for this generator
    //
    // e.g. if this generator specified the target:
    // './Foobar.md': { copy: 'Foobar.md' }
    //
    // And someone ran this generator from `/Users/dbowie/sailsStuff`,
    // then `/Users/dbowie/sailsStuff/Foobar.md` would be created.
    if (!scope.rootPath) {
      return cb(INVALID_SCOPE_VARIABLE('rootPath'));
    }


    // Attach defaults
    _.defaults(scope, {
      createdAt: new Date()
    });


    // Add other stuff to the scope for use in our templates:
    scope.whatIsThis = 'an example file created at ' + scope.createdAt;

    // When finished, we trigger a callback with no error
    // to begin generating files/folders as specified by
    // the `targets` below.
    cb();
  },



  /**
   * The files/folders to generate.
   * @type {Object}
   */

  targets: {

    // Usage:
    // './path/to/destination.foo': { someHelper: opts }

    // Creates a dynamically-named file relative to `scope.rootPath`
    // (defined by the `filename` scope variable).
    //
    // The `template` helper reads the specified template, making the
    // entire scope available to it (uses underscore/JST/ejs syntax).
    // Then the file is copied into the specified destination (on the left).
    // './:filename': { template: 'example.template.js' },

    // Creates a folder at a static path
    // './hey_look_a_folder': { folder: {} }

  },


  /**
   * The absolute path to the `templates` for this generator
   * (for use with the `template` helper)
   *
   * @type {String}
   */
  templatesDirectory: require('path').resolve(__dirname, './templates'),
};





/**
 * INVALID_SCOPE_VARIABLE()
 *
 * Helper method to put together a nice error about a missing or invalid
 * scope variable. We should always validate any required scope variables
 * to avoid inadvertently smashing someone's filesystem.
 *
 * @param {String} varname [the name of the missing/invalid scope variable]
 * @param {String} details [optional - additional details to display on the console]
 * @param {String} message [optional - override for the default message]
 * @return {Error}
 * @api private
 */

function INVALID_SCOPE_VARIABLE(varname, details, message) {
  var DEFAULT_MESSAGE =
    'Issue encountered in generator "route":\n' +
    'Missing required scope variable: `%s`"\n' +
    'If you are the author of `sails-generate-route`, please resolve this ' +
    'issue and publish a new patch release.';

  message = (message || DEFAULT_MESSAGE) + (details ? '\n' + details : '');
  message = util.inspect(message, varname);

  return new Error(message);
}


/*********************************************************/

function parseInput(args) {
  let method = '';
  let route = '';
  let controller = '';
  let func = '';
  let variable = '';
  let needs_approval = 'false';

  for (input of args) {

    input = input.split('=');

    method = (input[0] == 'method') ? input[1] : method;
    route = (input[0] == 'route') ? input[1] : route;
    controller = (input[0] == 'controller') ? input[1] : controller;
    func = (input[0] == 'function') ? input[1] : func;
    variable = (input[0] == 'variable') ? input[1] : variable;
    needs_approval = (input[0] == 'approval') ? input[1] : needs_approval;
  }

  needs_approval = (needs_approval == 'false') ? false : true;

  if (method == '')
    throw new Error('method missing');
  if (route == '')
    throw new Error('route missing');
  if (controller == '')
    throw new Error('controller missing');
  if (func == '')
    throw new Error('function missing');

  return { method: method, route: route, controller: controller, function: func, variable: variable, approval: needs_approval };
}


function createRoute(inputs) {
  path = 'config/routes.js';

  let route = inputs.route;
  let first_char = route.charAt(0);

  if (first_char != '/')
    route = '/' + route;

  route = `  '${inputs.method} ${route}/${inputs.variable}': '${inputs.controller}.${inputs.function}',
  //<generated routes here>`;

  addRouteToFile('config/routes.js', route, '  //<generated routes here>');
}


function insertRouteinDB(inputs, cb) {
  // route follow the following convention
  // /api/version/web/entity/operation/?variable
  route = inputs.route;
  first_char = route.charAt(0);

  needs_approval = (inputs.approval) ? inputs.approval : false;

  // making a slash at the beginning of the route name if it didn't exist
  if (first_char != '/')
    route = '/' + route;

  input_splitted = inputs.route.split('/');
  op_name = input_splitted[input_splitted.length - 1];
  entity_name = input_splitted[input_splitted.length - 2];

  Operations.findOrCreate({
    name: op_name
  }, {
      name: op_name,
      needs_approval: needs_approval
    }, (err, operation) => {
      if (err) throw err;

      entity_object = {
        entity_name: entity_name,
        operation: operation.id
      };

      Entity_operations.findOrCreate(entity_object, entity_object, (err, entity) => {
        if (err) throw err;
        cb(null, entity);
      });

    });

}


function addRouteToFile(path, input_string, replacer_string) {

  let data = fs.readFileSync(path, 'utf-8');

  fs.writeFileSync(path, data.replace(replacer_string, input_string));
}