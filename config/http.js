/**
 * HTTP Server Settings
 * (sails.config.http)
 *
 * Configuration for the underlying HTTP server in Sails.
 * Only applies to HTTP requests (not WebSockets)
 *
 * For more information on configuration, check out:
 * http://sailsjs.org/#!/documentation/reference/sails.config/sails.config.http.html
 */

module.exports.http = {

  /****************************************************************************
     *                                                                           *
     * Express middleware to use for every Sails request. To add custom          *
     * middleware to the mix, add a function to the middleware config object and *
     * add its key to the "order" array. The $custom key is reserved for         *
     * backwards-compatibility with Sails v0.9.x apps that use the               *
     * `customMiddleware` config option.                                         *
     *                                                                           *
     ****************************************************************************/

  middleware: {

    publishRequestObject: (req, res, next) => {
      res.set({
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        Pragma: 'no-cache',
        Expires: '0'
      });

      global.req = req;
      global.res = res;
      global.next = next;

      next();
    },
    // bodyParser: require('skipper')({
    //   maxWaitTimeBeforePassingControlToApp: 1000
    // }),

    /***************************************************************************
         *                                                                          *
         * The order in which middleware should be run for HTTP request. (the Sails *
         * router is invoked by the "router" middleware below.)                     *
         *                                                                          *
         ***************************************************************************/

    order: [
      'startRequestTimer',
      'cookieParser',
      'session',
      'myRequestLogger',
      'bodyParser',
      'handleBodyParserError',
      'compress',
      'methodOverride',
      'poweredBy',
      '$custom',
      'publishRequestObject',
      // 'setTimeZone',
      'router',
      'www',
      'favicon',
      '404',
      '500'
    ],
    customMiddleware: function (app) {
      app.use(function (err, req, res, next) {
        // handle your errors
        // UtilService.log(err);
      });
    },
    /****************************************************************************
         *                                                                           *
         * Example custom middleware; logs each request to the console.              *
         *                                                                           *
         ****************************************************************************/

    myRequestLogger: function (req, res, next) {
      let resBody;
      res.on('finish', function () {
        //if (res.statusCode !== 200)
        // console.log(
        //   'caught the response after being sent but no body :(, working on it'
        // ); // for example
        // console.log('Finished ' + res.statusCode); // for example
        // Do whatever you want
      });
      return next();
    },

    /***************************************************************************
         *                                                                          *
         * The body parser that will handle incoming multipart HTTP requests. By    *
         * default as of v0.10, Sails uses                                          *
         * [skipper](http://github.com/balderdashy/skipper). See                    *
         * http://www.senchalabs.org/connect/multipart.html for other options.      *
         *                                                                          *
         * Note that Sails uses an internal instance of Skipper by default; to      *
         * override it and specify more options, make sure to "npm install skipper" *
         * in your project first.  You can also specify a different body parser or  *
         * a custom function with req, res and next parameters (just like any other *
         * middleware function).                                                    *
         *                                                                          *
         ***************************************************************************/

    // bodyParser: require('skipper')({ strict: true })

    // return bodyParser.xml();

    bodyParser: (function () {


      // Get a Skipper instance (handles URLencoded, JSON-encoded and multipart)
      var skipper = require('skipper')({ strict: true });
      var xmlparser = require('express-xml-bodyparser')();

      return function (req, res, next) {
        // If it looks like XML, parse it as XML
        if (req.headers['content-type'] == 'text/xml' || req.headers['content-type'] == 'application/soap+xml; charset=utf-8' || req.headers['content-type'] == 'application/xml' || req.headers['content-type'] == 'text/xml; charset=utf-8')
          return xmlparser(req, res, next);


        // Otherwise let Skipper handle it
        return skipper(req, res, next);
      };
    })(),

  }

  /***************************************************************************
     *                                                                          *
     * The number of seconds to cache flat files on disk being served by        *
     * Express static middleware (by default, these files are in `.tmp/public`) *
     *                                                                          *
     * The HTTP static cache is only active in a 'production' environment,      *
     * since that's the only time Express will cache flat-files.                *
     *                                                                          *
     ***************************************************************************/

  // cache: 31557600000
};