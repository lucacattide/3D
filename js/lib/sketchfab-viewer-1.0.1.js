(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory();
	else if(typeof define === 'function' && define.amd)
		define([], factory);
	else if(typeof exports === 'object')
		exports["Sketchfab"] = factory();
	else
		root["Sketchfab"] = factory();
})(this, function() {
return /******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// identity function for calling harmony imports with the correct context
/******/ 	__webpack_require__.i = function(value) { return value; };
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "/static/builds/web/dist/";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 1);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
var API = function ( members, apiClient ) {
    // populate this with method
    members.forEach( function ( name ) {

        this[ name ] = function () {

            var requestId = apiClient._requestIdCounter++;

            var args = Array.prototype.slice.call( arguments );
            var callback;

            if ( args.length > 0 ) {

                var lastArg = args[ args.length - 1 ];

                if ( typeof lastArg === 'function' ) {
                    callback = args.pop();
                }

            }

            // no callback no need to maintain a pending request
            if ( callback )
                apiClient._pendingRequests[ requestId ] = callback.bind( this );

            apiClient._target.postMessage( {
                type: 'api.request',
                instanceId: apiClient.getIdentifier(),
                requestId: requestId,
                member: name,
                arguments: args
            }, '*' );

        };
    }, this );

    this.addEventListener = function ( name, callback ) {
        // If the 'viewerready' event has already beend triggered we want to
        // execute the user's callback right away.
        if (name === 'viewerready' && apiClient.isViewerReady) {
            callback();
        }

        if ( !apiClient._eventListeners[ name ] )
            apiClient._eventListeners[ name ] = [];

        apiClient._eventListeners[ name ].push( callback );
    };

    this.removeEventListener = function ( name, callback ) {

        if ( !apiClient._eventListeners[ name ] )
            return;

        var index = apiClient._eventListeners[ name ].indexOf( callback );
        if ( index !== -1 ) {
            apiClient._eventListeners[ name ].splice( index, 1 );
        }
    };
};


var APIClient = function ( target ) {

    this._target = target;
    this._requestIdCounter = 0;
    this._pendingRequests = {};
    this._eventListeners = {};
    this._ready = false;

    var identifier = Math.random().toString();
    this._identifier = identifier.substr( identifier.indexOf( '.' ) + 1 );

    this.listenServer();
};


APIClient.prototype = {

    getIdentifier: function () {
        return this._identifier;
    },

    use: function ( version, callback ) {

        this._version = version;

        // we need to delay this call to be sure the server is ready
        var initializeAPI = function ( version, callback ) {

            var requestId = this._requestIdCounter++;

            // function to initialize the api when the server will answer
            this._pendingRequests[ requestId ] = function ( err, instanceId, members ) {

                if ( err ) {
                    callback.call( this, err );
                } else {
                    callback.call( this, null, new API( members, this ) );
                }

            }.bind( this );

            this._target.postMessage( {
                type: 'api.initialize',
                requestId: requestId,
                name: version
            }, '*' );

        }.bind( this );


        var callInitAPI = function () {

            initializeAPI( version, callback );

        }.bind( this );

        // if the api is ready we can execute now the initialize.
        // If not we will intialize the api after the server part is ready.
        // see the code in the message function
        if ( this._ready )
            callInitAPI();
        else
            this.initAPI = callInitAPI;
    },


    listenServer: function () {

        window.addEventListener( 'message', function ( e ) {

            if ( e.data.type !== 'api.ready' &&
                e.data.type !== 'api.initialize.result' &&
                e.data.type !== 'api.request.result' &&
                e.data.type !== 'api.event' )
                return;

            if ( e.data.instanceId !== this.getIdentifier() )
                return;

            // initialize the api only when the server is ready
            if ( e.data.type === 'api.ready' ) {

                if ( !this._ready ) {

                    this._ready = true;

                    // it's possible client has not yet called use
                    // so it means that initAPI is undefined
                    if ( this.initAPI )
                        this.initAPI();
                }
            }

            // if it's an event dont check the request
            if ( e.data.type === 'api.event' ) {

                var args = e.data.results;
                var eventName = args[ 0 ];

                // handle listener that listen all or * events
                if ( this._eventListeners[ '*' ] || this._eventListeners.all ) {
                    [ '*', 'all' ].forEach( function ( eventAll ) {

                        if ( this._eventListeners[ eventAll ] ) {
                            this._eventListeners[ eventAll ].forEach( function ( callback ) {
                                // callback is used as this to maintain a potential callback
                                // where the user would binded its own this
                                callback.apply( callback, args );
                            } );
                        }

                    }, this );
                    return;
                }

                // for localised listener ( not all events )
                var argumentsWithoutEventName = args.slice( 1 );
                if ( this._eventListeners[ eventName ] ) {

                    // execute all callback listening eventName
                    this._eventListeners[ eventName ].forEach( function ( callback ) {
                        // callback is used as this to maintain a potential callback
                        // where the user would binded its own this
                        callback.apply( callback, argumentsWithoutEventName );
                    } );
                } else if (eventName === 'viewerready') {
                    this.isViewerReady = true;
                }

            } else {

                if ( !this._pendingRequests[ e.data.requestId ] )
                    return;

                this._pendingRequests[ e.data.requestId ].apply( null, e.data.results );
            }

        }.bind( this ) );

    }

};

/* harmony default export */ __webpack_exports__["default"] = (APIClient);


/***/ }),
/* 1 */
/***/ (function(module, exports, __webpack_require__) {

var APIClient = __webpack_require__( 0 ).default;

var Sketchfab = function ( version, target ) {
    this._target = target;
    this._version = version || '1.0.0';
    this._url = 'https://sketchfab.com/models/XXXX/embed';
    this._client = undefined;
    this._options = undefined;
};

Sketchfab.prototype = {

    getEmbedURL: function ( urlid, options ) {

        var url = this._url + '?api_version=' + this._version + '&api_id=' + this._client.getIdentifier();

        if ( options ) {

            Object.keys( options ).forEach( function ( key ) {

                // filter options
                if ( options[ key ] == null ||
                    typeof options[ key ] === 'function' ) {
                    return;
                }

                url += '&' + key.toString() + '=' + options[ key ].toString();

            } );
        }

        return url.replace( 'XXXX', urlid );
    },

    init: function ( urlid, options ) {

        this._options = options;
        this._client = new APIClient( this._target.contentWindow );

        window.addEventListener( 'message', function ( e ) {

            if ( e.data.type !== 'api.ready' )
                return;

            if ( e.data.instanceId !== this._client.getIdentifier() )
                return;

            this._client.use( this._version, function ( err, api ) {

                if ( err )
                    throw err;

                this.success.call( this, api );

            }.bind( this ) );

        }.bind( this ) );

        this._target.src = this.getEmbedURL( urlid, options );

    },

    success: function ( api ) {
        // api ready to use
        if ( this._options.success && typeof this._options.success === 'function' ) {
            this._options.success( api );
        }

    },
    error: function ( api ) {
        // api error
        if ( this._options.error && typeof this._options.error === 'function' ) {
            this._options.error( api );
        }

    }

};

// /!\ Has to be defined as a comonjs module as webpack.output.library puts it
// on the window.
module.exports = Sketchfab;


/***/ })
/******/ ]);
});
//# sourceMappingURL=sketchfab-viewer-1.0.0.js.map