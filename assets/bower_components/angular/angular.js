/**
 * @license AngularJS v1.5.8
 * (c) 2010-2016 Google, Inc. http://angularjs.org
 * License: MIT
 */
(function(window) {'use strict';

/**
 * @description
 *
 * This object provides a utility for producing rich Error messages within
 * Angular. It can be called as follows:
 *
 * var exampleMinErr = minErr('example');
 * throw exampleMinErr('one', 'This {0} is {1}', foo, bar);
 *
 * The above creates an instance of minErr in the example namespace. The
 * resulting error will have a namespaced error code of example.one.  The
 * resulting error will replace {0} with the value of foo, and {1} with the
 * value of bar. The object is not restricted in the number of arguments it can
 * take.
 *
 * If fewer arguments are specified than necessary for interpolation, the extra
 * interpolation markers will be preserved in the final string.
 *
 * Since data will be parsed statically during a build step, some restrictions
 * are applied with respect to how minErr instances are created and called.
 * Instances should have names of the form namespaceMinErr for a minErr created
 * using minErr('namespace') . Error codes, namespaces and template strings
 * should all be static strings, not variables or general expressions.
 *
 * @param {string} module The namespace to use for the new minErr instance.
 * @param {function} ErrorConstructor Custom error constructor to be instantiated when returning
 *   error from returned function, for cases when a particular type of error is useful.
 * @returns {function(code:string, template:string, ...templateArgs): Error} minErr instance
 */

function minErr(module, ErrorConstructor) {
  ErrorConstructor = ErrorConstructor || Error;
  return function() {
    var SKIP_INDEXES = 2;

    var templateArgs = arguments,
      code = templateArgs[0],
      message = '[' + (module ? module + ':' : '') + code + '] ',
      template = templateArgs[1],
      paramPrefix, i;

    message += template.replace(/\{\d+\}/g, function(match) {
      var index = +match.slice(1, -1),
        shiftedIndex = index + SKIP_INDEXES;

      if (shiftedIndex < templateArgs.length) {
        return toDebugString(templateArgs[shiftedIndex]);
      }

      return match;
    });

    message += '\nhttp://errors.angularjs.org/1.5.8/' +
      (module ? module + '/' : '') + code;

    for (i = SKIP_INDEXES, paramPrefix = '?'; i < templateArgs.length; i++, paramPrefix = '&') {
      message += paramPrefix + 'p' + (i - SKIP_INDEXES) + '=' +
        encodeURIComponent(toDebugString(templateArgs[i]));
    }

    return new ErrorConstructor(message);
  };
}

/* We need to tell jshint what variables are being exported */
/* global angular: true,
  msie: true,
  jqLite: true,
  jQuery: true,
  slice: true,
  splice: true,
  push: true,
  toString: true,
  ngMinErr: true,
  angularModule: true,
  uid: true,
  REGEX_STRING_REGEXP: true,
  VALIDITY_STATE_PROPERTY: true,

  lowercase: true,
  uppercase: true,
  manualLowercase: true,
  manualUppercase: true,
  nodeName_: true,
  isArrayLike: true,
  forEach: true,
  forEachSorted: true,
  reverseParams: true,
  nextUid: true,
  setHashKey: true,
  extend: true,
  toInt: true,
  inherit: true,
  merge: true,
  noop: true,
  identity: true,
  valueFn: true,
  isUndefined: true,
  isDefined: true,
  isObject: true,
  isBlankObject: true,
  isString: true,
  isNumber: true,
  isDate: true,
  isArray: true,
  isFunction: true,
  isRegExp: true,
  isWindow: true,
  isScope: true,
  isFile: true,
  isFormData: true,
  isBlob: true,
  isBoolean: true,
  isPromiseLike: true,
  trim: true,
  escapeForRegexp: true,
  isElement: true,
  makeMap: true,
  includes: true,
  arrayRemove: true,
  copy: true,
  equals: true,
  csp: true,
  jq: true,
  concat: true,
  sliceArgs: true,
  bind: true,
  toJsonReplacer: true,
  toJson: true,
  fromJson: true,
  convertTimezoneToLocal: true,
  timezoneToOffset: true,
  startingTag: true,
  tryDecodeURIComponent: true,
  parseKeyValue: true,
  toKeyValue: true,
  encodeUriSegment: true,
  encodeUriQuery: true,
  angularInit: true,
  bootstrap: true,
  getTestability: true,
  snake_case: true,
  bindJQuery: true,
  assertArg: true,
  assertArgFn: true,
  assertNotHasOwnProperty: true,
  getter: true,
  getBlockNodes: true,
  hasOwnProperty: true,
  createMap: true,

  NODE_TYPE_ELEMENT: true,
  NODE_TYPE_ATTRIBUTE: true,
  NODE_TYPE_TEXT: true,
  NODE_TYPE_COMMENT: true,
  NODE_TYPE_DOCUMENT: true,
  NODE_TYPE_DOCUMENT_FRAGMENT: true,
*/

////////////////////////////////////

/**
 * @ngdoc module
 * @name ng
 * @module ng
 * @installation
 * @description
 *
 * # ng (core module)
 * The ng module is loaded by default when an AngularJS application is started. The module itself
 * contains the essential components for an AngularJS application to function. The table below
 * lists a high level breakdown of each of the services/factories, filters, directives and testing
 * components available within this core module.
 *
 * <div doc-module-components="ng"></div>
 */

var REGEX_STRING_REGEXP = /^\/(.+)\/([a-z]*)$/;

// The name of a form control's ValidityState property.
// This is used so that it's possible for internal tests to create mock ValidityStates.
var VALIDITY_STATE_PROPERTY = 'validity';

var hasOwnProperty = Object.prototype.hasOwnProperty;

var lowercase = function(string) {return isString(string) ? string.toLowerCase() : string;};
var uppercase = function(string) {return isString(string) ? string.toUpperCase() : string;};


var manualLowercase = function(s) {
  /* jshint bitwise: false */
  return isString(s)
      ? s.replace(/[A-Z]/g, function(ch) {return String.fromCharCode(ch.charCodeAt(0) | 32);})
      : s;
};
var manualUppercase = function(s) {
  /* jshint bitwise: false */
  return isString(s)
      ? s.replace(/[a-z]/g, function(ch) {return String.fromCharCode(ch.charCodeAt(0) & ~32);})
      : s;
};


// String#toLowerCase and String#toUpperCase don't produce correct results in browsers with Turkish
// locale, for this reason we need to detect this case and redefine lowercase/uppercase methods
// with correct but slower alternatives. See https://github.com/angular/angular.js/issues/11387
if ('i' !== 'I'.toLowerCase()) {
  lowercase = manualLowercase;
  uppercase = manualUppercase;
}


var
    msie,             // holds major version number for IE, or NaN if UA is not IE.
    jqLite,           // delay binding since jQuery could be loaded after us.
    jQuery,           // delay binding
    slice             = [].slice,
    splice            = [].splice,
    push              = [].push,
    toString          = Object.prototype.toString,
    getPrototypeOf    = Object.getPrototypeOf,
    ngMinErr          = minErr('ng'),

    /** @name angular */
    angular           = window.angular || (window.angular = {}),
    angularModule,
    uid               = 0;

/**
 * documentMode is an IE-only property
 * http://msdn.microsoft.com/en-us/library/ie/cc196988(v=vs.85).aspx
 */
msie = window.document.documentMode;


/**
 * @private
 * @param {*} obj
 * @return {boolean} Returns true if `obj` is an array or array-like object (NodeList, Arguments,
 *                   String ...)
 */
function isArrayLike(obj) {

  // `null`, `undefined` and `window` are not array-like
  if (obj == null || isWindow(obj)) return false;

  // arrays, strings and jQuery/jqLite objects are array like
  // * jqLite is either the jQuery or jqLite constructor function
  // * we have to check the existence of jqLite first as this method is called
  //   via the forEach method when constructing the jqLite object in the first place
  if (isArray(obj) || isString(obj) || (jqLite && obj instanceof jqLite)) return true;

  // Support: iOS 8.2 (not reproducible in simulator)
  // "length" in obj used to prevent JIT error (gh-11508)
  var length = "length" in Object(obj) && obj.length;

  // NodeList objects (with `item` method) and
  // other objects with suitable length characteristics are array-like
  return isNumber(length) &&
    (length >= 0 && ((length - 1) in obj || obj instanceof Array) || typeof obj.item == 'function');

}

/**
 * @ngdoc function
 * @name angular.forEach
 * @module ng
 * @kind function
 *
 * @description
 * Invokes the `iterator` function once for each item in `obj` collection, which can be either an
 * object or an array. The `iterator` function is invoked with `iterator(value, key, obj)`, where `value`
 * is the value of an object property or an array element, `key` is the object property key or
 * array element index and obj is the `obj` itself. Specifying a `context` for the function is optional.
 *
 * It is worth noting that `.forEach` does not iterate over inherited properties because it filters
 * using the `hasOwnProperty` method.
 *
 * Unlike ES262's
 * [Array.prototype.forEach](http://www.ecma-international.org/ecma-262/5.1/#sec-15.4.4.18),
 * providing 'undefined' or 'null' values for `obj` will not throw a TypeError, but rather just
 * return the value provided.
 *
   ```js
     var values = {name: 'misko', gender: 'male'};
     var log = [];
     angular.forEach(values, function(value, key) {
       this.push(key + ': ' + value);
     }, log);
     expect(log).toEqual(['name: misko', 'gender: male']);
   ```
 *
 * @param {Object|Array} obj Object to iterate over.
 * @param {Function} iterator Iterator function.
 * @param {Object=} context Object to become context (`this`) for the iterator function.
 * @returns {Object|Array} Reference to `obj`.
 */

function forEach(obj, iterator, context) {
  var key, length;
  if (obj) {
    if (isFunction(obj)) {
      for (key in obj) {
        // Need to check if hasOwnProperty exists,
        // as on IE8 the result of querySelectorAll is an object without a hasOwnProperty function
        if (key != 'prototype' && key != 'length' && key != 'name' && (!obj.hasOwnProperty || obj.hasOwnProperty(key))) {
          iterator.call(context, obj[key], key, obj);
        }
      }
    } else if (isArray(obj) || isArrayLike(obj)) {
      var isPrimitive = typeof obj !== 'object';
      for (key = 0, length = obj.length; key < length; key++) {
        if (isPrimitive || key in obj) {
          iterator.call(context, obj[key], key, obj);
        }
      }
    } else if (obj.forEach && obj.forEach !== forEach) {
        obj.forEach(iterator, context, obj);
    } else if (isBlankObject(obj)) {
      // createMap() fast path --- Safe to avoid hasOwnProperty check because prototype chain is empty
      for (key in obj) {
        iterator.call(context, obj[key], key, obj);
      }
    } else if (typeof obj.hasOwnProperty === 'function') {
      // Slow path for objects inheriting Object.prototype, hasOwnProperty check needed
      for (key in obj) {
        if (obj.hasOwnProperty(key)) {
          iterator.call(context, obj[key], key, obj);
        }
      }
    } else {
      // Slow path for objects which do not have a method `hasOwnProperty`
      for (key in obj) {
        if (hasOwnProperty.call(obj, key)) {
          iterator.call(context, obj[key], key, obj);
        }
      }
    }
  }
  return obj;
}

function forEachSorted(obj, iterator, context) {
  var keys = Object.keys(obj).sort();
  for (var i = 0; i < keys.length; i++) {
    iterator.call(context, obj[keys[i]], keys[i]);
  }
  return keys;
}


/**
 * when using forEach the params are value, key, but it is often useful to have key, value.
 * @param {function(string, *)} iteratorFn
 * @returns {function(*, string)}
 */
function reverseParams(iteratorFn) {
  return function(value, key) {iteratorFn(key, value);};
}

/**
 * A consistent way of creating unique IDs in angular.
 *
 * Using simple numbers allows us to generate 28.6 million unique ids per second for 10 years before
 * we hit number precision issues in JavaScript.
 *
 * Math.pow(2,53) / 60 / 60 / 24 / 365 / 10 = 28.6M
 *
 * @returns {number} an unique alpha-numeric string
 */
function nextUid() {
  return ++uid;
}


/**
 * Set or clear the hashkey for an object.
 * @param obj object
 * @param h the hashkey (!truthy to delete the hashkey)
 */
function setHashKey(obj, h) {
  if (h) {
    obj.$$hashKey = h;
  } else {
    delete obj.$$hashKey;
  }
}


function baseExtend(dst, objs, deep) {
  var h = dst.$$hashKey;

  for (var i = 0, ii = objs.length; i < ii; ++i) {
    var obj = objs[i];
    if (!isObject(obj) && !isFunction(obj)) continue;
    var keys = Object.keys(obj);
    for (var j = 0, jj = keys.length; j < jj; j++) {
      var key = keys[j];
      var src = obj[key];

      if (deep && isObject(src)) {
        if (isDate(src)) {
          dst[key] = new Date(src.valueOf());
        } else if (isRegExp(src)) {
          dst[key] = new RegExp(src);
        } else if (src.nodeName) {
          dst[key] = src.cloneNode(true);
        } else if (isElement(src)) {
          dst[key] = src.clone();
        } else {
          if (!isObject(dst[key])) dst[key] = isArray(src) ? [] : {};
          baseExtend(dst[key], [src], true);
        }
      } else {
        dst[key] = src;
      }
    }
  }

  setHashKey(dst, h);
  return dst;
}

/**
 * @ngdoc function
 * @name angular.extend
 * @module ng
 * @kind function
 *
 * @description
 * Extends the destination object `dst` by copying own enumerable properties from the `src` object(s)
 * to `dst`. You can specify multiple `src` objects. If you want to preserve original objects, you can do so
 * by passing an empty object as the target: `var object = angular.extend({}, object1, object2)`.
 *
 * **Note:** Keep in mind that `angular.extend` does not support recursive merge (deep copy). Use
 * {@link angular.merge} for this.
 *
 * @param {Object} dst Destination object.
 * @param {...Object} src Source object(s).
 * @returns {Object} Reference to `dst`.
 */
function extend(dst) {
  return baseExtend(dst, slice.call(arguments, 1), false);
}


/**
* @ngdoc function
* @name angular.merge
* @module ng
* @kind function
*
* @description
* Deeply extends the destination object `dst` by copying own enumerable properties from the `src` object(s)
* to `dst`. You can specify multiple `src` objects. If you want to preserve original objects, you can do so
* by passing an empty object as the target: `var object = angular.merge({}, object1, object2)`.
*
* Unlike {@link angular.extend extend()}, `merge()` recursively descends into object properties of source
* objects, performing a deep copy.
*
* @param {Object} dst Destination object.
* @param {...Object} src Source object(s).
* @returns {Object} Reference to `dst`.
*/
function merge(dst) {
  return baseExtend(dst, slice.call(arguments, 1), true);
}



function toInt(str) {
  return parseInt(str, 10);
}


function inherit(parent, extra) {
  return extend(Object.create(parent), extra);
}

/**
 * @ngdoc function
 * @name angular.noop
 * @module ng
 * @kind function
 *
 * @description
 * A function that performs no operations. This function can be useful when writing code in the
 * functional style.
   ```js
     function foo(callback) {
       var result = calculateResult();
       (callback || angular.noop)(result);
     }
   ```
 */
function noop() {}
noop.$inject = [];


/**
 * @ngdoc function
 * @name angular.identity
 * @module ng
 * @kind function
 *
 * @description
 * A function that returns its first argument. This function is useful when writing code in the
 * functional style.
 *
   ```js
   function transformer(transformationFn, value) {
     return (transformationFn || angular.identity)(value);
   };

   // E.g.
   function getResult(fn, input) {
     return (fn || angular.identity)(input);
   };

   getResult(function(n) { return n * 2; }, 21);   // returns 42
   getResult(null, 21);                            // returns 21
   getResult(undefined, 21);                       // returns 21
   ```
 *
 * @param {*} value to be returned.
 * @returns {*} the value passed in.
 */
function identity($) {return $;}
identity.$inject = [];


function valueFn(value) {return function valueRef() {return value;};}

function hasCustomToString(obj) {
  return isFunction(obj.toString) && obj.toString !== toString;
}


/**
 * @ngdoc function
 * @name angular.isUndefined
 * @module ng
 * @kind function
 *
 * @description
 * Determines if a reference is undefined.
 *
 * @param {*} value Reference to check.
 * @returns {boolean} True if `value` is undefined.
 */
function isUndefined(value) {return typeof value === 'undefined';}


/**
 * @ngdoc function
 * @name angular.isDefined
 * @module ng
 * @kind function
 *
 * @description
 * Determines if a reference is defined.
 *
 * @param {*} value Reference to check.
 * @returns {boolean} True if `value` is defined.
 */
function isDefined(value) {return typeof value !== 'undefined';}


/**
 * @ngdoc function
 * @name angular.isObject
 * @module ng
 * @kind function
 *
 * @description
 * Determines if a reference is an `Object`. Unlike `typeof` in JavaScript, `null`s are not
 * considered to be objects. Note that JavaScript arrays are objects.
 *
 * @param {*} value Reference to check.
 * @returns {boolean} True if `value` is an `Object` but not `null`.
 */
function isObject(value) {
  // http://jsperf.com/isobject4
  return value !== null && typeof value === 'object';
}


/**
 * Determine if a value is an object with a null prototype
 *
 * @returns {boolean} True if `value` is an `Object` with a null prototype
 */
function isBlankObject(value) {
  return value !== null && typeof value === 'object' && !getPrototypeOf(value);
}


/**
 * @ngdoc function
 * @name angular.isString
 * @module ng
 * @kind function
 *
 * @description
 * Determines if a reference is a `String`.
 *
 * @param {*} value Reference to check.
 * @returns {boolean} True if `value` is a `String`.
 */
function isString(value) {return typeof value === 'string';}


/**
 * @ngdoc function
 * @name angular.isNumber
 * @module ng
 * @kind function
 *
 * @description
 * Determines if a reference is a `Number`.
 *
 * This includes the "special" numbers `NaN`, `+Infinity` and `-Infinity`.
 *
 * If you wish to exclude these then you can use the native
 * [`isFinite'](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/isFinite)
 * method.
 *
 * @param {*} value Reference to check.
 * @returns {boolean} True if `value` is a `Number`.
 */
function isNumber(value) {return typeof value === 'number';}


/**
 * @ngdoc function
 * @name angular.isDate
 * @module ng
 * @kind function
 *
 * @description
 * Determines if a value is a date.
 *
 * @param {*} value Reference to check.
 * @returns {boolean} True if `value` is a `Date`.
 */
function isDate(value) {
  return toString.call(value) === '[object Date]';
}


/**
 * @ngdoc function
 * @name angular.isArray
 * @module ng
 * @kind function
 *
 * @description
 * Determines if a reference is an `Array`.
 *
 * @param {*} value Reference to check.
 * @returns {boolean} True if `value` is an `Array`.
 */
var isArray = Array.isArray;

/**
 * @ngdoc function
 * @name angular.isFunction
 * @module ng
 * @kind function
 *
 * @description
 * Determines if a reference is a `Function`.
 *
 * @param {*} value Reference to check.
 * @returns {boolean} True if `value` is a `Function`.
 */
function isFunction(value) {return typeof value === 'function';}


/**
 * Determines if a value is a regular expression object.
 *
 * @private
 * @param {*} value Reference to check.
 * @returns {boolean} True if `value` is a `RegExp`.
 */
function isRegExp(value) {
  return toString.call(value) === '[object RegExp]';
}


/**
 * Checks if `obj` is a window object.
 *
 * @private
 * @param {*} obj Object to check
 * @returns {boolean} True if `obj` is a window obj.
 */
function isWindow(obj) {
  return obj && obj.window === obj;
}


function isScope(obj) {
  return obj && obj.$evalAsync && obj.$watch;
}


function isFile(obj) {
  return toString.call(obj) === '[object File]';
}


function isFormData(obj) {
  return toString.call(obj) === '[object FormData]';
}


function isBlob(obj) {
  return toString.call(obj) === '[object Blob]';
}


function isBoolean(value) {
  return typeof value === 'boolean';
}


function isPromiseLike(obj) {
  return obj && isFunction(obj.then);
}


var TYPED_ARRAY_REGEXP = /^\[object (?:Uint8|Uint8Clamped|Uint16|Uint32|Int8|Int16|Int32|Float32|Float64)Array\]$/;
function isTypedArray(value) {
  return value && isNumber(value.length) && TYPED_ARRAY_REGEXP.test(toString.call(value));
}

function isArrayBuffer(obj) {
  return toString.call(obj) === '[object ArrayBuffer]';
}


var trim = function(value) {
  return isString(value) ? value.trim() : value;
};

// Copied from:
// http://docs.closure-library.googlecode.com/git/local_closure_goog_string_string.js.source.html#line1021
// Prereq: s is a string.
var escapeForRegexp = function(s) {
  return s.replace(/([-()\[\]{}+?*.$\^|,:#<!\\])/g, '\\$1').
           replace(/\x08/g, '\\x08');
};


/**
 * @ngdoc function
 * @name angular.isElement
 * @module ng
 * @kind function
 *
 * @description
 * Determines if a reference is a DOM element (or wrapped jQuery element).
 *
 * @param {*} value Reference to check.
 * @returns {boolean} True if `value` is a DOM element (or wrapped jQuery element).
 */
function isElement(node) {
  return !!(node &&
    (node.nodeName  // We are a direct element.
    || (node.prop && node.attr && node.find)));  // We have an on and find method part of jQuery API.
}

/**
 * @param str 'key1,key2,...'
 * @returns {object} in the form of {key1:true, key2:true, ...}
 */
function makeMap(str) {
  var obj = {}, items = str.split(','), i;
  for (i = 0; i < items.length; i++) {
    obj[items[i]] = true;
  }
  return obj;
}


function nodeName_(element) {
  return lowercase(element.nodeName || (element[0] && element[0].nodeName));
}

function includes(array, obj) {
  return Array.prototype.indexOf.call(array, obj) != -1;
}

function arrayRemove(array, value) {
  var index = array.indexOf(value);
  if (index >= 0) {
    array.splice(index, 1);
  }
  return index;
}

/**
 * @ngdoc function
 * @name angular.copy
 * @module ng
 * @kind function
 *
 * @description
 * Creates a deep copy of `source`, which should be an object or an array.
 *
 * * If no destination is supplied, a copy of the object or array is created.
 * * If a destination is provided, all of its elements (for arrays) or properties (for objects)
 *   are deleted and then all elements/properties from the source are copied to it.
 * * If `source` is not an object or array (inc. `null` and `undefined`), `source` is returned.
 * * If `source` is identical to `destination` an exception will be thrown.
 *
 * <br />
 * <div class="alert alert-warning">
 *   Only enumerable properties are taken into account. Non-enumerable properties (both on `source`
 *   and on `destination`) will be ignored.
 * </div>
 *
 * @param {*} source The source that will be used to make a copy.
 *                   Can be any type, including primitives, `null`, and `undefined`.
 * @param {(Object|Array)=} destination Destination into which the source is copied. If
 *     provided, must be of the same type as `source`.
 * @returns {*} The copy or updated `destination`, if `destination` was specified.
 *
 * @example
  <example module="copyExample">
    <file name="index.html">
      <div ng-controller="ExampleController">
        <form novalidate class="simple-form">
          <label>Name: <input type="text" ng-model="user.name" /></label><br />
          <label>Age:  <input type="number" ng-model="user.age" /></label><br />
          Gender: <label><input type="radio" ng-model="user.gender" value="male" />male</label>
                  <label><input type="radio" ng-model="user.gender" value="female" />female</label><br />
          <button ng-click="reset()">RESET</button>
          <button ng-click="update(user)">SAVE</button>
        </form>
        <pre>form = {{user | json}}</pre>
        <pre>master = {{master | json}}</pre>
      </div>
    </file>
    <file name="script.js">
      // Module: copyExample
      angular.
        module('copyExample', []).
        controller('ExampleController', ['$scope', function($scope) {
          $scope.master = {};

          $scope.reset = function() {
            // Example with 1 argument
            $scope.user = angular.copy($scope.master);
          };

          $scope.update = function(user) {
            // Example with 2 arguments
            angular.copy(user, $scope.master);
          };

          $scope.reset();
        }]);
    </file>
  </example>
 */
function copy(source, destination) {
  var stackSource = [];
  var stackDest = [];

  if (destination) {
    if (isTypedArray(destination) || isArrayBuffer(destination)) {
      throw ngMinErr('cpta', "Can't copy! TypedArray destination cannot be mutated.");
    }
    if (source === destination) {
      throw ngMinErr('cpi', "Can't copy! Source and destination are identical.");
    }

    // Empty the destination object
    if (isArray(destination)) {
      destination.length = 0;
    } else {
      forEach(destination, function(value, key) {
        if (key !== '$$hashKey') {
          delete destination[key];
        }
      });
    }

    stackSource.push(source);
    stackDest.push(destination);
    return copyRecurse(source, destination);
  }

  return copyElement(source);

  function copyRecurse(source, destination) {
    var h = destination.$$hashKey;
    var key;
    if (isArray(source)) {
      for (var i = 0, ii = source.length; i < ii; i++) {
        destination.push(copyElement(source[i]));
      }
    } else if (isBlankObject(source)) {
      // createMap() fast path --- Safe to avoid hasOwnProperty check because prototype chain is empty
      for (key in source) {
        destination[key] = copyElement(source[key]);
      }
    } else if (source && typeof source.hasOwnProperty === 'function') {
      // Slow path, which must rely on hasOwnProperty
      for (key in source) {
        if (source.hasOwnProperty(key)) {
          destination[key] = copyElement(source[key]);
        }
      }
    } else {
      // Slowest path --- hasOwnProperty can't be called as a method
      for (key in source) {
        if (hasOwnProperty.call(source, key)) {
          destination[key] = copyElement(source[key]);
        }
      }
    }
    setHashKey(destination, h);
    return destination;
  }

  function copyElement(source) {
    // Simple values
    if (!isObject(source)) {
      return source;
    }

    // Already copied values
    var index = stackSource.indexOf(source);
    if (index !== -1) {
      return stackDest[index];
    }

    if (isWindow(source) || isScope(source)) {
      throw ngMinErr('cpws',
        "Can't copy! Making copies of Window or Scope instances is not supported.");
    }

    var needsRecurse = false;
    var destination = copyType(source);

    if (destination === undefined) {
      destination = isArray(source) ? [] : Object.create(getPrototypeOf(source));
      needsRecurse = true;
    }

    stackSource.push(source);
    stackDest.push(destination);

    return needsRecurse
      ? copyRecurse(source, destination)
      : destination;
  }

  function copyType(source) {
    switch (toString.call(source)) {
      case '[object Int8Array]':
      case '[object Int16Array]':
      case '[object Int32Array]':
      case '[object Float32Array]':
      case '[object Float64Array]':
      case '[object Uint8Array]':
      case '[object Uint8ClampedArray]':
      case '[object Uint16Array]':
      case '[object Uint32Array]':
        return new source.constructor(copyElement(source.buffer), source.byteOffset, source.length);

      case '[object ArrayBuffer]':
        //Support: IE10
        if (!source.slice) {
          var copied = new ArrayBuffer(source.byteLength);
          new Uint8Array(copied).set(new Uint8Array(source));
          return copied;
        }
        return source.slice(0);

      case '[object Boolean]':
      case '[object Number]':
      case '[object String]':
      case '[object Date]':
        return new source.constructor(source.valueOf());

      case '[object RegExp]':
        var re = new RegExp(source.source, source.toString().match(/[^\/]*$/)[0]);
        re.lastIndex = source.lastIndex;
        return re;

      case '[object Blob]':
        return new source.constructor([source], {type: source.type});
    }

    if (isFunction(source.cloneNode)) {
      return source.cloneNode(true);
    }
  }
}


/**
 * @ngdoc function
 * @name angular.equals
 * @module ng
 * @kind function
 *
 * @description
 * Determines if two objects or two values are equivalent. Supports value types, regular
 * expressions, arrays and objects.
 *
 * Two objects or values are considered equivalent if at least one of the following is true:
 *
 * * Both objects or values pass `===` comparison.
 * * Both objects or values are of the same type and all of their properties are equal by
 *   comparing them with `angular.equals`.
 * * Both values are NaN. (In JavaScript, NaN == NaN => false. But we consider two NaN as equal)
 * * Both values represent the same regular expression (In JavaScript,
 *   /abc/ == /abc/ => false. But we consider two regular expressions as equal when their textual
 *   representation matches).
 *
 * During a property comparison, properties of `function` type and properties with names
 * that begin with `$` are ignored.
 *
 * Scope and DOMWindow objects are being compared only by identify (`===`).
 *
 * @param {*} o1 Object or value to compare.
 * @param {*} o2 Object or value to compare.
 * @returns {boolean} True if arguments are equal.
 *
 * @example
   <example module="equalsExample" name="equalsExample">
     <file name="index.html">
      <div ng-controller="ExampleController">
        <form novalidate>
          <h3>User 1</h3>
          Name: <input type="text" ng-model="user1.name">
          Age: <input type="number" ng-model="user1.age">

          <h3>User 2</h3>
          Name: <input type="text" ng-model="user2.name">
          Age: <input type="number" ng-model="user2.age">

          <div>
            <br/>
            <input type="button" value="Compare" ng-click="compare()">
          </div>
          User 1: <pre>{{user1 | json}}</pre>
          User 2: <pre>{{user2 | json}}</pre>
          Equal: <pre>{{result}}</pre>
        </form>
      </div>
    </file>
    <file name="script.js">
        angular.module('equalsExample', []).controller('ExampleController', ['$scope', function($scope) {
          $scope.user1 = {};
          $scope.user2 = {};
          $scope.result;
          $scope.compare = function() {
            $scope.result = angular.equals($scope.user1, $scope.user2);
          };
        }]);
    </file>
  </example>
 */
function equals(o1, o2) {
  if (o1 === o2) return true;
  if (o1 === null || o2 === null) return false;
  if (o1 !== o1 && o2 !== o2) return true; // NaN === NaN
  var t1 = typeof o1, t2 = typeof o2, length, key, keySet;
  if (t1 == t2 && t1 == 'object') {
    if (isArray(o1)) {
      if (!isArray(o2)) return false;
      if ((length = o1.length) == o2.length) {
        for (key = 0; key < length; key++) {
          if (!equals(o1[key], o2[key])) return false;
        }
        return true;
      }
    } else if (isDate(o1)) {
      if (!isDate(o2)) return false;
      return equals(o1.getTime(), o2.getTime());
    } else if (isRegExp(o1)) {
      if (!isRegExp(o2)) return false;
      return o1.toString() == o2.toString();
    } else {
      if (isScope(o1) || isScope(o2) || isWindow(o1) || isWindow(o2) ||
        isArray(o2) || isDate(o2) || isRegExp(o2)) return false;
      keySet = createMap();
      for (key in o1) {
        if (key.charAt(0) === '$' || isFunction(o1[key])) continue;
        if (!equals(o1[key], o2[key])) return false;
        keySet[key] = true;
      }
      for (key in o2) {
        if (!(key in keySet) &&
            key.charAt(0) !== '$' &&
            isDefined(o2[key]) &&
            !isFunction(o2[key])) return false;
      }
      return true;
    }
  }
  return false;
}

var csp = function() {
  if (!isDefined(csp.rules)) {


    var ngCspElement = (window.document.querySelector('[ng-csp]') ||
                    window.document.querySelector('[data-ng-csp]'));

    if (ngCspElement) {
      var ngCspAttribute = ngCspElement.getAttribute('ng-csp') ||
                    ngCspElement.getAttribute('data-ng-csp');
      csp.rules = {
        noUnsafeEval: !ngCspAttribute || (ngCspAttribute.indexOf('no-unsafe-eval') !== -1),
        noInlineStyle: !ngCspAttribute || (ngCspAttribute.indexOf('no-inline-style') !== -1)
      };
    } else {
      csp.rules = {
        noUnsafeEval: noUnsafeEval(),
        noInlineStyle: false
      };
    }
  }

  return csp.rules;

  function noUnsafeEval() {
    try {
      /* jshint -W031, -W054 */
      new Function('');
      /* jshint +W031, +W054 */
      return false;
    } catch (e) {
      return true;
    }
  }
};

/**
 * @ngdoc directive
 * @module ng
 * @name ngJq
 *
 * @element ANY
 * @param {string=} ngJq the name of the library available under `window`
 * to be used for angular.element
 * @description
 * Use this directive to force the angular.element library.  This should be
 * used to force either jqLite by leaving ng-jq blank or setting the name of
 * the jquery variable under window (eg. jQuery).
 *
 * Since angular looks for this directive when it is loaded (doesn't wait for the
 * DOMContentLoaded event), it must be placed on an element that comes before the script
 * which loads angular. Also, only the first instance of `ng-jq` will be used and all
 * others ignored.
 *
 * @example
 * This example shows how to force jqLite using the `ngJq` directive to the `html` tag.
 ```html
 <!doctype html>
 <html ng-app ng-jq>
 ...
 ...
 </html>
 ```
 * @example
 * This example shows how to use a jQuery based library of a different name.
 * The library name must be available at the top most 'window'.
 ```html
 <!doctype html>
 <html ng-app ng-jq="jQueryLib">
 ...
 ...
 </html>
 ```
 */
var jq = function() {
  if (isDefined(jq.name_)) return jq.name_;
  var el;
  var i, ii = ngAttrPrefixes.length, prefix, name;
  for (i = 0; i < ii; ++i) {
    prefix = ngAttrPrefixes[i];
    if (el = window.document.querySelector('[' + prefix.replace(':', '\\:') + 'jq]')) {
      name = el.getAttribute(prefix + 'jq');
      break;
    }
  }

  return (jq.name_ = name);
};

function concat(array1, array2, index) {
  return array1.concat(slice.call(array2, index));
}

function sliceArgs(args, startIndex) {
  return slice.call(args, startIndex || 0);
}


/* jshint -W101 */
/**
 * @ngdoc function
 * @name angular.bind
 * @module ng
 * @kind function
 *
 * @description
 * Returns a function which calls function `fn` bound to `self` (`self` becomes the `this` for
 * `fn`). You can supply optional `args` that are prebound to the function. This feature is also
 * known as [partial application](http://en.wikipedia.org/wiki/Partial_application), as
 * distinguished from [function currying](http://en.wikipedia.org/wiki/Currying#Contrast_with_partial_function_application).
 *
 * @param {Object} self Context which `fn` should be evaluated in.
 * @param {function()} fn Function to be bound.
 * @param {...*} args Optional arguments to be prebound to the `fn` function call.
 * @returns {function()} Function that wraps the `fn` with all the specified bindings.
 */
/* jshint +W101 */
function bind(self, fn) {
  var curryArgs = arguments.length > 2 ? sliceArgs(arguments, 2) : [];
  if (isFunction(fn) && !(fn instanceof RegExp)) {
    return curryArgs.length
      ? function() {
          return arguments.length
            ? fn.apply(self, concat(curryArgs, arguments, 0))
            : fn.apply(self, curryArgs);
        }
      : function() {
          return arguments.length
            ? fn.apply(self, arguments)
            : fn.call(self);
        };
  } else {
    // In IE, native methods are not functions so they cannot be bound (note: they don't need to be).
    return fn;
  }
}


function toJsonReplacer(key, value) {
  var val = value;

  if (typeof key === 'string' && key.charAt(0) === '$' && key.charAt(1) === '$') {
    val = undefined;
  } else if (isWindow(value)) {
    val = '$WINDOW';
  } else if (value &&  window.document === value) {
    val = '$DOCUMENT';
  } else if (isScope(value)) {
    val = '$SCOPE';
  }

  return val;
}


/**
 * @ngdoc function
 * @name angular.toJson
 * @module ng
 * @kind function
 *
 * @description
 * Serializes input into a JSON-formatted string. Properties with leading $$ characters will be
 * stripped since angular uses this notation internally.
 *
 * @param {Object|Array|Date|string|number} obj Input to be serialized into JSON.
 * @param {boolean|number} [pretty=2] If set to true, the JSON output will contain newlines and whitespace.
 *    If set to an integer, the JSON output will contain that many spaces per indentation.
 * @returns {string|undefined} JSON-ified string representing `obj`.
 * @knownIssue
 *
 * The Safari browser throws a `RangeError` instead of returning `null` when it tries to stringify a `Date`
 * object with an invalid date value. The only reliable way to prevent this is to monkeypatch the
 * `Date.prototype.toJSON` method as follows:
 *
 * ```
 * var _DatetoJSON = Date.prototype.toJSON;
 * Date.prototype.toJSON = function() {
 *   try {
 *     return _DatetoJSON.call(this);
 *   } catch(e) {
 *     if (e instanceof RangeError) {
 *       return null;
 *     }
 *     throw e;
 *   }
 * };
 * ```
 *
 * See https://github.com/angular/angular.js/pull/14221 for more information.
 */
function toJson(obj, pretty) {
  if (isUndefined(obj)) return undefined;
  if (!isNumber(pretty)) {
    pretty = pretty ? 2 : null;
  }
  return JSON.stringify(obj, toJsonReplacer, pretty);
}


/**
 * @ngdoc function
 * @name angular.fromJson
 * @module ng
 * @kind function
 *
 * @description
 * Deserializes a JSON string.
 *
 * @param {string} json JSON string to deserialize.
 * @returns {Object|Array|string|number} Deserialized JSON string.
 */
function fromJson(json) {
  return isString(json)
      ? JSON.parse(json)
      : json;
}


var ALL_COLONS = /:/g;
function timezoneToOffset(timezone, fallback) {
  // IE/Edge do not "understand" colon (`:`) in timezone
  timezone = timezone.replace(ALL_COLONS, '');
  var requestedTimezoneOffset = Date.parse('Jan 01, 1970 00:00:00 ' + timezone) / 60000;
  return isNaN(requestedTimezoneOffset) ? fallback : requestedTimezoneOffset;
}


function addDateMinutes(date, minutes) {
  date = new Date(date.getTime());
  date.setMinutes(date.getMinutes() + minutes);
  return date;
}


function convertTimezoneToLocal(date, timezone, reverse) {
  reverse = reverse ? -1 : 1;
  var dateTimezoneOffset = date.getTimezoneOffset();
  var timezoneOffset = timezoneToOffset(timezone, dateTimezoneOffset);
  return addDateMinutes(date, reverse * (timezoneOffset - dateTimezoneOffset));
}


/**
 * @returns {string} Returns the string representation of the element.
 */
function startingTag(element) {
  element = jqLite(element).clone();
  try {
    // turns out IE does not let you set .html() on elements which
    // are not allowed to have children. So we just ignore it.
    element.empty();
  } catch (e) {}
  var elemHtml = jqLite('<div>').append(element).html();
  try {
    return element[0].nodeType === NODE_TYPE_TEXT ? lowercase(elemHtml) :
        elemHtml.
          match(/^(<[^>]+>)/)[1].
          replace(/^<([\w\-]+)/, function(match, nodeName) {return '<' + lowercase(nodeName);});
  } catch (e) {
    return lowercase(elemHtml);
  }

}


/////////////////////////////////////////////////

/**
 * Tries to decode the URI component without throwing an exception.
 *
 * @private
 * @param str value potential URI component to check.
 * @returns {boolean} True if `value` can be decoded
 * with the decodeURIComponent function.
 */
function tryDecodeURIComponent(value) {
  try {
    return decodeURIComponent(value);
  } catch (e) {
    // Ignore any invalid uri component.
  }
}


/**
 * Parses an escaped url query string into key-value pairs.
 * @returns {Object.<string,boolean|Array>}
 */
function parseKeyValue(/**string*/keyValue) {
  var obj = {};
  forEach((keyValue || "").split('&'), function(keyValue) {
    var splitPoint, key, val;
    if (keyValue) {
      key = keyValue = keyValue.replace(/\+/g,'%20');
      splitPoint = keyValue.indexOf('=');
      if (splitPoint !== -1) {
        key = keyValue.substring(0, splitPoint);
        val = keyValue.substring(splitPoint + 1);
      }
      key = tryDecodeURIComponent(key);
      if (isDefined(key)) {
        val = isDefined(val) ? tryDecodeURIComponent(val) : true;
        if (!hasOwnProperty.call(obj, key)) {
          obj[key] = val;
        } else if (isArray(obj[key])) {
          obj[key].push(val);
        } else {
          obj[key] = [obj[key],val];
        }
      }
    }
  });
  return obj;
}

function toKeyValue(obj) {
  var parts = [];
  forEach(obj, function(value, key) {
    if (isArray(value)) {
      forEach(value, function(arrayValue) {
        parts.push(encodeUriQuery(key, true) +
                   (arrayValue === true ? '' : '=' + encodeUriQuery(arrayValue, true)));
      });
    } else {
    parts.push(encodeUriQuery(key, true) +
               (value === true ? '' : '=' + encodeUriQuery(value, true)));
    }
  });
  return parts.length ? parts.join('&') : '';
}


/**
 * We need our custom method because encodeURIComponent is too aggressive and doesn't follow
 * http://www.ietf.org/rfc/rfc3986.txt with regards to the character set (pchar) allowed in path
 * segments:
 *    segment       = *pchar
 *    pchar         = unreserved / pct-encoded / sub-delims / ":" / "@"
 *    pct-encoded   = "%" HEXDIG HEXDIG
 *    unreserved    = ALPHA / DIGIT / "-" / "." / "_" / "~"
 *    sub-delims    = "!" / "$" / "&" / "'" / "(" / ")"
 *                     / "*" / "+" / "," / ";" / "="
 */
function encodeUriSegment(val) {
  return encodeUriQuery(val, true).
             replace(/%26/gi, '&').
             replace(/%3D/gi, '=').
             replace(/%2B/gi, '+');
}


/**
 * This method is intended for encoding *key* or *value* parts of query component. We need a custom
 * method because encodeURIComponent is too aggressive and encodes stuff that doesn't have to be
 * encoded per http://tools.ietf.org/html/rfc3986:
 *    query       = *( pchar / "/" / "?" )
 *    pchar         = unreserved / pct-encoded / sub-delims / ":" / "@"
 *    unreserved    = ALPHA / DIGIT / "-" / "." / "_" / "~"
 *    pct-encoded   = "%" HEXDIG HEXDIG
 *    sub-delims    = "!" / "$" / "&" / "'" / "(" / ")"
 *                     / "*" / "+" / "," / ";" / "="
 */
function encodeUriQuery(val, pctEncodeSpaces) {
  return encodeURIComponent(val).
             replace(/%40/gi, '@').
             replace(/%3A/gi, ':').
             replace(/%24/g, '$').
             replace(/%2C/gi, ',').
             replace(/%3B/gi, ';').
             replace(/%20/g, (pctEncodeSpaces ? '%20' : '+'));
}

var ngAttrPrefixes = ['ng-', 'data-ng-', 'ng:', 'x-ng-'];

function getNgAttribute(element, ngAttr) {
  var attr, i, ii = ngAttrPrefixes.length;
  for (i = 0; i < ii; ++i) {
    attr = ngAttrPrefixes[i] + ngAttr;
    if (isString(attr = element.getAttribute(attr))) {
      return attr;
    }
  }
  return null;
}

/**
 * @ngdoc directive
 * @name ngApp
 * @module ng
 *
 * @element ANY
 * @param {angular.Module} ngApp an optional application
 *   {@link angular.module module} name to load.
 * @param {boolean=} ngStrictDi if this attribute is present on the app element, the injector will be
 *   created in "strict-di" mode. This means that the application will fail to invoke functions which
 *   do not use explicit function annotation (and are thus unsuitable for minification), as described
 *   in {@link guide/di the Dependency Injection guide}, and useful debugging info will assist in
 *   tracking down the root of these bugs.
 *
 * @description
 *
 * Use this directive to **auto-bootstrap** an AngularJS application. The `ngApp` directive
 * designates the **root element** of the application and is typically placed near the root element
 * of the page - e.g. on the `<body>` or `<html>` tags.
 *
 * There are a few things to keep in mind when using `ngApp`:
 * - only one AngularJS application can be auto-bootstrapped per HTML document. The first `ngApp`
 *   found in the document will be used to define the root element to auto-bootstrap as an
 *   application. To run multiple applications in an HTML document you must manually bootstrap them using
 *   {@link angular.bootstrap} instead.
 * - AngularJS applications cannot be nested within each other.
 * - Do not use a directive that uses {@link ng.$compile#transclusion transclusion} on the same element as `ngApp`.
 *   This includes directives such as {@link ng.ngIf `ngIf`}, {@link ng.ngInclude `ngInclude`} and
 *   {@link ngRoute.ngView `ngView`}.
 *   Doing this misplaces the app {@link ng.$rootElement `$rootElement`} and the app's {@link auto.$injector injector},
 *   causing animations to stop working and making the injector inaccessible from outside the app.
 *
 * You can specify an **AngularJS module** to be used as the root module for the application.  This
 * module will be loaded into the {@link auto.$injector} when the application is bootstrapped. It
 * should contain the application code needed or have dependencies on other modules that will
 * contain the code. See {@link angular.module} for more information.
 *
 * In the example below if the `ngApp` directive were not placed on the `html` element then the
 * document would not be compiled, the `AppController` would not be instantiated and the `{{ a+b }}`
 * would not be resolved to `3`.
 *
 * `ngApp` is the easiest, and most common way to bootstrap an application.
 *
 <example module="ngAppDemo">
   <file name="index.html">
   <div ng-controller="ngAppDemoController">
     I can add: {{a}} + {{b}} =  {{ a+b }}
   </div>
   </file>
   <file name="script.js">
   angular.module('ngAppDemo', []).controller('ngAppDemoController', function($scope) {
     $scope.a = 1;
     $scope.b = 2;
   });
   </file>
 </example>
 *
 * Using `ngStrictDi`, you would see something like this:
 *
 <example ng-app-included="true">
   <file name="index.html">
   <div ng-app="ngAppStrictDemo" ng-strict-di>
       <div ng-controller="GoodController1">
           I can add: {{a}} + {{b}} =  {{ a+b }}

           <p>This renders because the controller does not fail to
              instantiate, by using explicit annotation style (see
              script.js for details)
           </p>
       </div>

       <div ng-controller="GoodController2">
           Name: <input ng-model="name"><br />
           Hello, {{name}}!

           <p>This renders because the controller does not fail to
              instantiate, by using explicit annotation style
              (see script.js for details)
           </p>
       </div>

       <div ng-controller="BadController">
           I can add: {{a}} + {{b}} =  {{ a+b }}

           <p>The controller could not be instantiated, due to relying
              on automatic function annotations (which are disabled in
              strict mode). As such, the content of this section is not
              interpolated, and there should be an error in your web console.
           </p>
       </div>
   </div>
   </file>
   <file name="script.js">
   angular.module('ngAppStrictDemo', [])
     // BadController will fail to instantiate, due to relying on automatic function annotation,
     // rather than an explicit annotation
     .controller('BadController', function($scope) {
       $scope.a = 1;
       $scope.b = 2;
     })
     // Unlike BadController, GoodController1 and GoodController2 will not fail to be instantiated,
     // due to using explicit annotations using the array style and $inject property, respectively.
     .controller('GoodController1', ['$scope', function($scope) {
       $scope.a = 1;
       $scope.b = 2;
     }])
     .controller('GoodController2', GoodController2);
     function GoodController2($scope) {
       $scope.name = "World";
     }
     GoodController2.$inject = ['$scope'];
   </file>
   <file name="style.css">
   div[ng-controller] {
       margin-bottom: 1em;
       -webkit-border-radius: 4px;
       border-radius: 4px;
       border: 1px solid;
       padding: .5em;
   }
   div[ng-controller^=Good] {
       border-color: #d6e9c6;
       background-color: #dff0d8;
       color: #3c763d;
   }
   div[ng-controller^=Bad] {
       border-color: #ebccd1;
       background-color: #f2dede;
       color: #a94442;
       margin-bottom: 0;
   }
   </file>
 </example>
 */
function angularInit(element, bootstrap) {
  var appElement,
      module,
      config = {};

  // The element `element` has priority over any other element.
  forEach(ngAttrPrefixes, function(prefix) {
    var name = prefix + 'app';

    if (!appElement && element.hasAttribute && element.hasAttribute(name)) {
      appElement = element;
      module = element.getAttribute(name);
    }
  });
  forEach(ngAttrPrefixes, function(prefix) {
    var name = prefix + 'app';
    var candidate;

    if (!appElement && (candidate = element.querySelector('[' + name.replace(':', '\\:') + ']'))) {
      appElement = candidate;
      module = candidate.getAttribute(name);
    }
  });
  if (appElement) {
    config.strictDi = getNgAttribute(appElement, "strict-di") !== null;
    bootstrap(appElement, module ? [module] : [], config);
  }
}

/**
 * @ngdoc function
 * @name angular.bootstrap
 * @module ng
 * @description
 * Use this function to manually start up angular application.
 *
 * For more information, see the {@link guide/bootstrap Bootstrap guide}.
 *
 * Angular will detect if it has been loaded into the browser more than once and only allow the
 * first loaded script to be bootstrapped and will report a warning to the browser console for
 * each of the subsequent scripts. This prevents strange results in applications, where otherwise
 * multiple instances of Angular try to work on the DOM.
 *
 * <div class="alert alert-warning">
 * **Note:** Protractor based end-to-end tests cannot use this function to bootstrap manually.
 * They must use {@link ng.directive:ngApp ngApp}.
 * </div>
 *
 * <div class="alert alert-warning">
 * **Note:** Do not bootstrap the app on an element with a directive that uses {@link ng.$compile#transclusion transclusion},
 * such as {@link ng.ngIf `ngIf`}, {@link ng.ngInclude `ngInclude`} and {@link ngRoute.ngView `ngView`}.
 * Doing this misplaces the app {@link ng.$rootElement `$rootElement`} and the app's {@link auto.$injector injector},
 * causing animations to stop working and making the injector inaccessible from outside the app.
 * </div>
 *
 * ```html
 * <!doctype html>
 * <html>
 * <body>
 * <div ng-controller="WelcomeController">
 *   {{greeting}}
 * </div>
 *
 * <script src="angular.js"></script>
 * <script>
 *   var app = angular.module('demo', [])
 *   .controller('WelcomeController', function($scope) {
 *       $scope.greeting = 'Welcome!';
 *   });
 *   angular.bootstrap(document, ['demo']);
 * </script>
 * </body>
 * </html>
 * ```
 *
 * @param {DOMElement} element DOM element which is the root of angular application.
 * @param {Array<String|Function|Array>=} modules an array of modules to load into the application.
 *     Each item in the array should be the name of a predefined module or a (DI annotated)
 *     function that will be invoked by the injector as a `config` block.
 *     See: {@link angular.module modules}
 * @param {Object=} config an object for defining configuration options for the application. The
 *     following keys are supported:
 *
 * * `strictDi` - disable automatic function annotation for the application. This is meant to
 *   assist in finding bugs which break minified code. Defaults to `false`.
 *
 * @returns {auto.$injector} Returns the newly created injector for this app.
 */
function bootstrap(element, modules, config) {
  if (!isObject(config)) config = {};
  var defaultConfig = {
    strictDi: false
  };
  config = extend(defaultConfig, config);
  var doBootstrap = function() {
    element = jqLite(element);

    if (element.injector()) {
      var tag = (element[0] === window.document) ? 'document' : startingTag(element);
      // Encode angle brackets to prevent input from being sanitized to empty string #8683.
      throw ngMinErr(
          'btstrpd',
          "App already bootstrapped with this element '{0}'",
          tag.replace(/</,'&lt;').replace(/>/,'&gt;'));
    }

    modules = modules || [];
    modules.unshift(['$provide', function($provide) {
      $provide.value('$rootElement', element);
    }]);

    if (config.debugInfoEnabled) {
      // Pushing so that this overrides `debugInfoEnabled` setting defined in user's `modules`.
      modules.push(['$compileProvider', function($compileProvider) {
        $compileProvider.debugInfoEnabled(true);
      }]);
    }

    modules.unshift('ng');
    var injector = createInjector(modules, config.strictDi);
    injector.invoke(['$rootScope', '$rootElement', '$compile', '$injector',
       function bootstrapApply(scope, element, compile, injector) {
        scope.$apply(function() {
          element.data('$injector', injector);
          compile(element)(scope);
        });
      }]
    );
    return injector;
  };

  var NG_ENABLE_DEBUG_INFO = /^NG_ENABLE_DEBUG_INFO!/;
  var NG_DEFER_BOOTSTRAP = /^NG_DEFER_BOOTSTRAP!/;

  if (window && NG_ENABLE_DEBUG_INFO.test(window.name)) {
    config.debugInfoEnabled = true;
    window.name = window.name.replace(NG_ENABLE_DEBUG_INFO, '');
  }

  if (window && !NG_DEFER_BOOTSTRAP.test(window.name)) {
    return doBootstrap();
  }

  window.name = window.name.replace(NG_DEFER_BOOTSTRAP, '');
  angular.resumeBootstrap = function(extraModules) {
    forEach(extraModules, function(module) {
      modules.push(module);
    });
    return doBootstrap();
  };

  if (isFunction(angular.resumeDeferredBootstrap)) {
    angular.resumeDeferredBootstrap();
  }
}

/**
 * @ngdoc function
 * @name angular.reloadWithDebugInfo
 * @module ng
 * @description
 * Use this function to reload the current application with debug information turned on.
 * This takes precedence over a call to `$compileProvider.debugInfoEnabled(false)`.
 *
 * See {@link ng.$compileProvider#debugInfoEnabled} for more.
 */
function reloadWithDebugInfo() {
  window.name = 'NG_ENABLE_DEBUG_INFO!' + window.name;
  window.location.reload();
}

/**
 * @name angular.getTestability
 * @module ng
 * @description
 * Get the testability service for the instance of Angular on the given
 * element.
 * @param {DOMElement} element DOM element which is the root of angular application.
 */
function getTestability(rootElement) {
  var injector = angular.element(rootElement).injector();
  if (!injector) {
    throw ngMinErr('test',
      'no injector found for element argument to getTestability');
  }
  return injector.get('$$testability');
}

var SNAKE_CASE_REGEXP = /[A-Z]/g;
function snake_case(name, separator) {
  separator = separator || '_';
  return name.replace(SNAKE_CASE_REGEXP, function(letter, pos) {
    return (pos ? separator : '') + letter.toLowerCase();
  });
}

var bindJQueryFired = false;
function bindJQuery() {
  var originalCleanData;

  if (bindJQueryFired) {
    return;
  }

  // bind to jQuery if present;
  var jqName = jq();
  jQuery = isUndefined(jqName) ? window.jQuery :   // use jQuery (if present)
           !jqName             ? undefined     :   // use jqLite
                                 window[jqName];   // use jQuery specified by `ngJq`

  // Use jQuery if it exists with proper functionality, otherwise default to us.
  // Angular 1.2+ requires jQuery 1.7+ for on()/off() support.
  // Angular 1.3+ technically requires at least jQuery 2.1+ but it may work with older
  // versions. It will not work for sure with jQuery <1.7, though.
  if (jQuery && jQuery.fn.on) {
    jqLite = jQuery;
    extend(jQuery.fn, {
      scope: JQLitePrototype.scope,
      isolateScope: JQLitePrototype.isolateScope,
      controller: JQLitePrototype.controller,
      injector: JQLitePrototype.injector,
      inheritedData: JQLitePrototype.inheritedData
    });

    // All nodes removed from the DOM via various jQuery APIs like .remove()
    // are passed through jQuery.cleanData. Monkey-patch this method to fire
    // the $destroy event on all removed nodes.
    originalCleanData = jQuery.cleanData;
    jQuery.cleanData = function(elems) {
      var events;
      for (var i = 0, elem; (elem = elems[i]) != null; i++) {
        events = jQuery._data(elem, "events");
        if (events && events.$destroy) {
          jQuery(elem).triggerHandler('$destroy');
        }
      }
      originalCleanData(elems);
    };
  } else {
    jqLite = JQLite;
  }

  angular.element = jqLite;

  // Prevent double-proxying.
  bindJQueryFired = true;
}

/**
 * throw error if the argument is falsy.
 */
function assertArg(arg, name, reason) {
  if (!arg) {
    throw ngMinErr('areq', "Argument '{0}' is {1}", (name || '?'), (reason || "required"));
  }
  return arg;
}

function assertArgFn(arg, name, acceptArrayAnnotation) {
  if (acceptArrayAnnotation && isArray(arg)) {
      arg = arg[arg.length - 1];
  }

  assertArg(isFunction(arg), name, 'not a function, got ' +
      (arg && typeof arg === 'object' ? arg.constructor.name || 'Object' : typeof arg));
  return arg;
}

/**
 * throw error if the name given is hasOwnProperty
 * @param  {String} name    the name to test
 * @param  {String} context the context in which the name is used, such as module or directive
 */
function assertNotHasOwnProperty(name, context) {
  if (name === 'hasOwnProperty') {
    throw ngMinErr('badname', "hasOwnProperty is not a valid {0} name", context);
  }
}

/**
 * Return the value accessible from the object by path. Any undefined traversals are ignored
 * @param {Object} obj starting object
 * @param {String} path path to traverse
 * @param {boolean} [bindFnToScope=true]
 * @returns {Object} value as accessible by path
 */
//TODO(misko): this function needs to be removed
function getter(obj, path, bindFnToScope) {
  if (!path) return obj;
  var keys = path.split('.');
  var key;
  var lastInstance = obj;
  var len = keys.length;

  for (var i = 0; i < len; i++) {
    key = keys[i];
    if (obj) {
      obj = (lastInstance = obj)[key];
    }
  }
  if (!bindFnToScope && isFunction(obj)) {
    return bind(lastInstance, obj);
  }
  return obj;
}

/**
 * Return the DOM siblings between the first and last node in the given array.
 * @param {Array} array like object
 * @returns {Array} the inputted object or a jqLite collection containing the nodes
 */
function getBlockNodes(nodes) {
  // TODO(perf): update `nodes` instead of creating a new object?
  var node = nodes[0];
  var endNode = nodes[nodes.length - 1];
  var blockNodes;

  for (var i = 1; node !== endNode && (node = node.nextSibling); i++) {
    if (blockNodes || nodes[i] !== node) {
      if (!blockNodes) {
        blockNodes = jqLite(slice.call(nodes, 0, i));
      }
      blockNodes.push(node);
    }
  }

  return blockNodes || nodes;
}


/**
 * Creates a new object without a prototype. This object is useful for lookup without having to
 * guard against prototypically inherited properties via hasOwnProperty.
 *
 * Related micro-benchmarks:
 * - http://jsperf.com/object-create2
 * - http://jsperf.com/proto-map-lookup/2
 * - http://jsperf.com/for-in-vs-object-keys2
 *
 * @returns {Object}
 */
function createMap() {
  return Object.create(null);
}

var NODE_TYPE_ELEMENT = 1;
var NODE_TYPE_ATTRIBUTE = 2;
var NODE_TYPE_TEXT = 3;
var NODE_TYPE_COMMENT = 8;
var NODE_TYPE_DOCUMENT = 9;
var NODE_TYPE_DOCUMENT_FRAGMENT = 11;

/**
 * @ngdoc type
 * @name angular.Module
 * @module ng
 * @description
 *
 * Interface for configuring angular {@link angular.module modules}.
 */

function setupModuleLoader(window) {

  var $injectorMinErr = minErr('$injector');
  var ngMinErr = minErr('ng');

  function ensure(obj, name, factory) {
    return obj[name] || (obj[name] = factory());
  }

  var angular = ensure(window, 'angular', Object);

  // We need to expose `angular.$$minErr` to modules such as `ngResource` that reference it during bootstrap
  angular.$$minErr = angular.$$minErr || minErr;

  return ensure(angular, 'module', function() {
    /** @type {Object.<string, angular.Module>} */
    var modules = {};

    /**
     * @ngdoc function
     * @name angular.module
     * @module ng
     * @description
     *
     * The `angular.module` is a global place for creating, registering and retrieving Angular
     * modules.
     * All modules (angular core or 3rd party) that should be available to an application must be
     * registered using this mechanism.
     *
     * Passing one argument retrieves an existing {@link angular.Module},
     * whereas passing more than one argument creates a new {@link angular.Module}
     *
     *
     * # Module
     *
     * A module is a collection of services, directives, controllers, filters, and configuration information.
     * `angular.module` is used to configure the {@link auto.$injector $injector}.
     *
     * ```js
     * // Create a new module
     * var myModule = angular.module('myModule', []);
     *
     * // register a new service
     * myModule.value('appName', 'MyCoolApp');
     *
     * // configure existing services inside initialization blocks.
     * myModule.config(['$locationProvider', function($locationProvider) {
     *   // Configure existing providers
     *   $locationProvider.hashPrefix('!');
     * }]);
     * ```
     *
     * Then you can create an injector and load your modules like this:
     *
     * ```js
     * var injector = angular.injector(['ng', 'myModule'])
     * ```
     *
     * However it's more likely that you'll just use
     * {@link ng.directive:ngApp ngApp} or
     * {@link angular.bootstrap} to simplify this process for you.
     *
     * @param {!string} name The name of the module to create or retrieve.
     * @param {!Array.<string>=} requires If specified then new module is being created. If
     *        unspecified then the module is being retrieved for further configuration.
     * @param {Function=} configFn Optional configuration function for the module. Same as
     *        {@link angular.Module#config Module#config()}.
     * @returns {angular.Module} new module with the {@link angular.Module} api.
     */
    return function module(name, requires, configFn) {
      var assertNotHasOwnProperty = function(name, context) {
        if (name === 'hasOwnProperty') {
          throw ngMinErr('badname', 'hasOwnProperty is not a valid {0} name', context);
        }
      };

      assertNotHasOwnProperty(name, 'module');
      if (requires && modules.hasOwnProperty(name)) {
        modules[name] = null;
      }
      return ensure(modules, name, function() {
        if (!requires) {
          throw $injectorMinErr('nomod', "Module '{0}' is not available! You either misspelled " +
             "the module name or forgot to load it. If registering a module ensure that you " +
             "specify the dependencies as the second argument.", name);
        }

        /** @type {!Array.<Array.<*>>} */
        var invokeQueue = [];

        /** @type {!Array.<Function>} */
        var configBlocks = [];

        /** @type {!Array.<Function>} */
        var runBlocks = [];

        var config = invokeLater('$injector', 'invoke', 'push', configBlocks);

        /** @type {angular.Module} */
        var moduleInstance = {
          // Private state
          _invokeQueue: invokeQueue,
          _configBlocks: configBlocks,
          _runBlocks: runBlocks,

          /**
           * @ngdoc property
           * @name angular.Module#requires
           * @module ng
           *
           * @description
           * Holds the list of modules which the injector will load before the current module is
           * loaded.
           */
          requires: requires,

          /**
           * @ngdoc property
           * @name angular.Module#name
           * @module ng
           *
           * @description
           * Name of the module.
           */
          name: name,


          /**
           * @ngdoc method
           * @name angular.Module#provider
           * @module ng
           * @param {string} name service name
           * @param {Function} providerType Construction function for creating new instance of the
           *                                service.
           * @description
           * See {@link auto.$provide#provider $provide.provider()}.
           */
          provider: invokeLaterAndSetModuleName('$provide', 'provider'),

          /**
           * @ngdoc method
           * @name angular.Module#factory
           * @module ng
           * @param {string} name service name
           * @param {Function} providerFunction Function for creating new instance of the service.
           * @description
           * See {@link auto.$provide#factory $provide.factory()}.
           */
          factory: invokeLaterAndSetModuleName('$provide', 'factory'),

          /**
           * @ngdoc method
           * @name angular.Module#service
           * @module ng
           * @param {string} name service name
           * @param {Function} constructor A constructor function that will be instantiated.
           * @description
           * See {@link auto.$provide#service $provide.service()}.
           */
          service: invokeLaterAndSetModuleName('$provide', 'service'),

          /**
           * @ngdoc method
           * @name angular.Module#value
           * @module ng
           * @param {string} name service name
           * @param {*} object Service instance object.
           * @description
           * See {@link auto.$provide#value $provide.value()}.
           */
          value: invokeLater('$provide', 'value'),

          /**
           * @ngdoc method
           * @name angular.Module#constant
           * @module ng
           * @param {string} name constant name
           * @param {*} object Constant value.
           * @description
           * Because the constants are fixed, they get applied before other provide methods.
           * See {@link auto.$provide#constant $provide.constant()}.
           */
          constant: invokeLater('$provide', 'constant', 'unshift'),

           /**
           * @ngdoc method
           * @name angular.Module#decorator
           * @module ng
           * @param {string} name The name of the service to decorate.
           * @param {Function} decorFn This function will be invoked when the service needs to be
           *                           instantiated and should return the decorated service instance.
           * @description
           * See {@link auto.$provide#decorator $provide.decorator()}.
           */
          decorator: invokeLaterAndSetModuleName('$provide', 'decorator'),

          /**
           * @ngdoc method
           * @name angular.Module#animation
           * @module ng
           * @param {string} name animation name
           * @param {Function} animationFactory Factory function for creating new instance of an
           *                                    animation.
           * @description
           *
           * **NOTE**: animations take effect only if the **ngAnimate** module is loaded.
           *
           *
           * Defines an animation hook that can be later used with
           * {@link $animate $animate} service and directives that use this service.
           *
           * ```js
           * module.animation('.animation-name', function($inject1, $inject2) {
           *   return {
           *     eventName : function(element, done) {
           *       //code to run the animation
           *       //once complete, then run done()
           *       return function cancellationFunction(element) {
           *         //code to cancel the animation
           *       }
           *     }
           *   }
           * })
           * ```
           *
           * See {@link ng.$animateProvider#register $animateProvider.register()} and
           * {@link ngAnimate ngAnimate module} for more information.
           */
          animation: invokeLaterAndSetModuleName('$animateProvider', 'register'),

          /**
           * @ngdoc method
           * @name angular.Module#filter
           * @module ng
           * @param {string} name Filter name - this must be a valid angular expression identifier
           * @param {Function} filterFactory Factory function for creating new instance of filter.
           * @description
           * See {@link ng.$filterProvider#register $filterProvider.register()}.
           *
           * <div class="alert alert-warning">
           * **Note:** Filter names must be valid angular {@link expression} identifiers, such as `uppercase` or `orderBy`.
           * Names with special characters, such as hyphens and dots, are not allowed. If you wish to namespace
           * your filters, then you can use capitalization (`myappSubsectionFilterx`) or underscores
           * (`myapp_subsection_filterx`).
           * </div>
           */
          filter: invokeLaterAndSetModuleName('$filterProvider', 'register'),

          /**
           * @ngdoc method
           * @name angular.Module#controller
           * @module ng
           * @param {string|Object} name Controller name, or an object map of controllers where the
           *    keys are the names and the values are the constructors.
           * @param {Function} constructor Controller constructor function.
           * @description
           * See {@link ng.$controllerProvider#register $controllerProvider.register()}.
           */
          controller: invokeLaterAndSetModuleName('$controllerProvider', 'register'),

          /**
           * @ngdoc method
           * @name angular.Module#directive
           * @module ng
           * @param {string|Object} name Directive name, or an object map of directives where the
           *    keys are the names and the values are the factories.
           * @param {Function} directiveFactory Factory function for creating new instance of
           * directives.
           * @description
           * See {@link ng.$compileProvider#directive $compileProvider.directive()}.
           */
          directive: invokeLaterAndSetModuleName('$compileProvider', 'directive'),

          /**
           * @ngdoc method
           * @name angular.Module#component
           * @module ng
           * @param {string} name Name of the component in camel-case (i.e. myComp which will match as my-comp)
           * @param {Object} options Component definition object (a simplified
           *    {@link ng.$compile#directive-definition-object directive definition object})
           *
           * @description
           * See {@link ng.$compileProvider#component $compileProvider.component()}.
           */
          component: invokeLaterAndSetModuleName('$compileProvider', 'component'),

          /**
           * @ngdoc method
           * @name angular.Module#config
           * @module ng
           * @param {Function} configFn Execute this function on module load. Useful for service
           *    configuration.
           * @description
           * Use this method to register work which needs to be performed on module loading.
           * For more about how to configure services, see
           * {@link providers#provider-recipe Provider Recipe}.
           */
          config: config,

          /**
           * @ngdoc method
           * @name angular.Module#run
           * @module ng
           * @param {Function} initializationFn Execute this function after injector creation.
           *    Useful for application initialization.
           * @description
           * Use this method to register work which should be performed when the injector is done
           * loading all modules.
           */
          run: function(block) {
            runBlocks.push(block);
            return this;
          }
        };

        if (configFn) {
          config(configFn);
        }

        return moduleInstance;

        /**
         * @param {string} provider
         * @param {string} method
         * @param {String=} insertMethod
         * @returns {angular.Module}
         */
        function invokeLater(provider, method, insertMethod, queue) {
          if (!queue) queue = invokeQueue;
          return function() {
            queue[insertMethod || 'push']([provider, method, arguments]);
            return moduleInstance;
          };
        }

        /**
         * @param {string} provider
         * @param {string} method
         * @returns {angular.Module}
         */
        function invokeLaterAndSetModuleName(provider, method) {
          return function(recipeName, factoryFunction) {
            if (factoryFunction && isFunction(factoryFunction)) factoryFunction.$$moduleName = name;
            invokeQueue.push([provider, method, arguments]);
            return moduleInstance;
          };
        }
      });
    };
  });

}

/* global shallowCopy: true */

/**
 * Creates a shallow copy of an object, an array or a primitive.
 *
 * Assumes that there are no proto properties for objects.
 */
function shallowCopy(src, dst) {
  if (isArray(src)) {
    dst = dst || [];

    for (var i = 0, ii = src.length; i < ii; i++) {
      dst[i] = src[i];
    }
  } else if (isObject(src)) {
    dst = dst || {};

    for (var key in src) {
      if (!(key.charAt(0) === '$' && key.charAt(1) === '$')) {
        dst[key] = src[key];
      }
    }
  }

  return dst || src;
}

/* global toDebugString: true */

function serializeObject(obj) {
  var seen = [];

  return JSON.stringify(obj, function(key, val) {
    val = toJsonReplacer(key, val);
    if (isObject(val)) {

      if (seen.indexOf(val) >= 0) return '...';

      seen.push(val);
    }
    return val;
  });
}

function toDebugString(obj) {
  if (typeof obj === 'function') {
    return obj.toString().replace(/ \{[\s\S]*$/, '');
  } else if (isUndefined(obj)) {
    return 'undefined';
  } else if (typeof obj !== 'string') {
    return serializeObject(obj);
  }
  return obj;
}

/* global angularModule: true,
  version: true,

  $CompileProvider,

  htmlAnchorDirective,
  inputDirective,
  inputDirective,
  formDirective,
  scriptDirective,
  selectDirective,
  styleDirective,
  optionDirective,
  ngBindDirective,
  ngBindHtmlDirective,
  ngBindTemplateDirective,
  ngClassDirective,
  ngClassEvenDirective,
  ngClassOddDirective,
  ngCloakDirective,
  ngControllerDirective,
  ngFormDirective,
  ngHideDirective,
  ngIfDirective,
  ngIncludeDirective,
  ngIncludeFillContentDirective,
  ngInitDirective,
  ngNonBindableDirective,
  ngPluralizeDirective,
  ngRepeatDirective,
  ngShowDirective,
  ngStyleDirective,
  ngSwitchDirective,
  ngSwitchWhenDirective,
  ngSwitchDefaultDirective,
  ngOptionsDirective,
  ngTranscludeDirective,
  ngModelDirective,
  ngListDirective,
  ngChangeDirective,
  patternDirective,
  patternDirective,
  requiredDirective,
  requiredDirective,
  minlengthDirective,
  minlengthDirective,
  maxlengthDirective,
  maxlengthDirective,
  ngValueDirective,
  ngModelOptionsDirective,
  ngAttributeAliasDirectives,
  ngEventDirectives,

  $AnchorScrollProvider,
  $AnimateProvider,
  $CoreAnimateCssProvider,
  $$CoreAnimateJsProvider,
  $$CoreAnimateQueueProvider,
  $$AnimateRunnerFactoryProvider,
  $$AnimateAsyncRunFactoryProvider,
  $BrowserProvider,
  $CacheFactoryProvider,
  $ControllerProvider,
  $DateProvider,
  $DocumentProvider,
  $ExceptionHandlerProvider,
  $FilterProvider,
  $$ForceReflowProvider,
  $InterpolateProvider,
  $IntervalProvider,
  $$HashMapProvider,
  $HttpProvider,
  $HttpParamSerializerProvider,
  $HttpParamSerializerJQLikeProvider,
  $HttpBackendProvider,
  $xhrFactoryProvider,
  $jsonpCallbacksProvider,
  $LocationProvider,
  $LogProvider,
  $ParseProvider,
  $RootScopeProvider,
  $QProvider,
  $$QProvider,
  $$SanitizeUriProvider,
  $SceProvider,
  $SceDelegateProvider,
  $SnifferProvider,
  $TemplateCacheProvider,
  $TemplateRequestProvider,
  $$TestabilityProvider,
  $TimeoutProvider,
  $$RAFProvider,
  $WindowProvider,
  $$jqLiteProvider,
  $$CookieReaderProvider
*/


/**
 * @ngdoc object
 * @name angular.version
 * @module ng
 * @description
 * An object that contains information about the current AngularJS version.
 *
 * This object has the following properties:
 *
 * - `full` – `{string}` – Full version string, such as "0.9.18".
 * - `major` – `{number}` – Major version number, such as "0".
 * - `minor` – `{number}` – Minor version number, such as "9".
 * - `dot` – `{number}` – Dot version number, such as "18".
 * - `codeName` – `{string}` – Code name of the release, such as "jiggling-armfat".
 */
var version = {
  full: '1.5.8',    // all of these placeholder strings will be replaced by grunt's
  major: 1,    // package task
  minor: 5,
  dot: 8,
  codeName: 'arbitrary-fallbacks'
};


function publishExternalAPI(angular) {
  extend(angular, {
    'bootstrap': bootstrap,
    'copy': copy,
    'extend': extend,
    'merge': merge,
    'equals': equals,
    'element': jqLite,
    'forEach': forEach,
    'injector': createInjector,
    'noop': noop,
    'bind': bind,
    'toJson': toJson,
    'fromJson': fromJson,
    'identity': identity,
    'isUndefined': isUndefined,
    'isDefined': isDefined,
    'isString': isString,
    'isFunction': isFunction,
    'isObject': isObject,
    'isNumber': isNumber,
    'isElement': isElement,
    'isArray': isArray,
    'version': version,
    'isDate': isDate,
    'lowercase': lowercase,
    'uppercase': uppercase,
    'callbacks': {$$counter: 0},
    'getTestability': getTestability,
    '$$minErr': minErr,
    '$$csp': csp,
    'reloadWithDebugInfo': reloadWithDebugInfo
  });

  angularModule = setupModuleLoader(window);

  angularModule('ng', ['ngLocale'], ['$provide',
    function ngModule($provide) {
      // $$sanitizeUriProvider needs to be before $compileProvider as it is used by it.
      $provide.provider({
        $$sanitizeUri: $$SanitizeUriProvider
      });
      $provide.provider('$compile', $CompileProvider).
        directive({
            a: htmlAnchorDirective,
            input: inputDirective,
            textarea: inputDirective,
            form: formDirective,
            script: scriptDirective,
            select: selectDirective,
            style: styleDirective,
            option: optionDirective,
            ngBind: ngBindDirective,
            ngBindHtml: ngBindHtmlDirective,
            ngBindTemplate: ngBindTemplateDirective,
            ngClass: ngClassDirective,
            ngClassEven: ngClassEvenDirective,
            ngClassOdd: ngClassOddDirective,
            ngCloak: ngCloakDirective,
            ngController: ngControllerDirective,
            ngForm: ngFormDirective,
            ngHide: ngHideDirective,
            ngIf: ngIfDirective,
            ngInclude: ngIncludeDirective,
            ngInit: ngInitDirective,
            ngNonBindable: ngNonBindableDirective,
            ngPluralize: ngPluralizeDirective,
            ngRepeat: ngRepeatDirective,
            ngShow: ngShowDirective,
            ngStyle: ngStyleDirective,
            ngSwitch: ngSwitchDirective,
            ngSwitchWhen: ngSwitchWhenDirective,
            ngSwitchDefault: ngSwitchDefaultDirective,
            ngOptions: ngOptionsDirective,
            ngTransclude: ngTranscludeDirective,
            ngModel: ngModelDirective,
            ngList: ngListDirective,
            ngChange: ngChangeDirective,
            pattern: patternDirective,
            ngPattern: patternDirective,
            required: requiredDirective,
            ngRequired: requiredDirective,
            minlength: minlengthDirective,
            ngMinlength: minlengthDirective,
            maxlength: maxlengthDirective,
            ngMaxlength: maxlengthDirective,
            ngValue: ngValueDirective,
            ngModelOptions: ngModelOptionsDirective
        }).
        directive({
          ngInclude: ngIncludeFillContentDirective
        }).
        directive(ngAttributeAliasDirectives).
        directive(ngEventDirectives);
      $provide.provider({
        $anchorScroll: $AnchorScrollProvider,
        $animate: $AnimateProvider,
        $animateCss: $CoreAnimateCssProvider,
        $$animateJs: $$CoreAnimateJsProvider,
        $$animateQueue: $$CoreAnimateQueueProvider,
        $$AnimateRunner: $$AnimateRunnerFactoryProvider,
        $$animateAsyncRun: $$AnimateAsyncRunFactoryProvider,
        $browser: $BrowserProvider,
        $cacheFactory: $CacheFactoryProvider,
        $controller: $ControllerProvider,
        $document: $DocumentProvider,
        $exceptionHandler: $ExceptionHandlerProvider,
        $filter: $FilterProvider,
        $$forceReflow: $$ForceReflowProvider,
        $interpolate: $InterpolateProvider,
        $interval: $IntervalProvider,
        $http: $HttpProvider,
        $httpParamSerializer: $HttpParamSerializerProvider,
        $httpParamSerializerJQLike: $HttpParamSerializerJQLikeProvider,
        $httpBackend: $HttpBackendProvider,
        $xhrFactory: $xhrFactoryProvider,
        $jsonpCallbacks: $jsonpCallbacksProvider,
        $location: $LocationProvider,
        $log: $LogProvider,
        $parse: $ParseProvider,
        $rootScope: $RootScopeProvider,
        $q: $QProvider,
        $$q: $$QProvider,
        $sce: $SceProvider,
        $sceDelegate: $SceDelegateProvider,
        $sniffer: $SnifferProvider,
        $templateCache: $TemplateCacheProvider,
        $templateRequest: $TemplateRequestProvider,
        $$testability: $$TestabilityProvider,
        $timeout: $TimeoutProvider,
        $window: $WindowProvider,
        $$rAF: $$RAFProvider,
        $$jqLite: $$jqLiteProvider,
        $$HashMap: $$HashMapProvider,
        $$cookieReader: $$CookieReaderProvider
      });
    }
  ]);
}

/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
 *     Any commits to this file should be reviewed with security in mind.  *
 *   Changes to this file can potentially create security vulnerabilities. *
 *          An approval from 2 Core members with history of modifying      *
 *                         this file is required.                          *
 *                                                                         *
 *  Does the change somehow allow for arbitrary javascript to be executed? *
 *    Or allows for someone to change the prototype of built-in objects?   *
 *     Or gives undesired access to variables likes document or window?    *
 * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */

/* global JQLitePrototype: true,
  addEventListenerFn: true,
  removeEventListenerFn: true,
  BOOLEAN_ATTR: true,
  ALIASED_ATTR: true,
*/

//////////////////////////////////
//JQLite
//////////////////////////////////

/**
 * @ngdoc function
 * @name angular.element
 * @module ng
 * @kind function
 *
 * @description
 * Wraps a raw DOM element or HTML string as a [jQuery](http://jquery.com) element.
 *
 * If jQuery is available, `angular.element` is an alias for the
 * [jQuery](http://api.jquery.com/jQuery/) function. If jQuery is not available, `angular.element`
 * delegates to Angular's built-in subset of jQuery, called "jQuery lite" or **jqLite**.
 *
 * jqLite is a tiny, API-compatible subset of jQuery that allows
 * Angular to manipulate the DOM in a cross-browser compatible way. jqLite implements only the most
 * commonly needed functionality with the goal of having a very small footprint.
 *
 * To use `jQuery`, simply ensure it is loaded before the `angular.js` file. You can also use the
 * {@link ngJq `ngJq`} directive to specify that jqlite should be used over jQuery, or to use a
 * specific version of jQuery if multiple versions exist on the page.
 *
 * <div class="alert alert-info">**Note:** All element references in Angular are always wrapped with jQuery or
 * jqLite (such as the element argument in a directive's compile / link function). They are never raw DOM references.</div>
 *
 * <div class="alert alert-warning">**Note:** Keep in mind that this function will not find elements
 * by tag name / CSS selector. For lookups by tag name, try instead `angular.element(document).find(...)`
 * or `$document.find()`, or use the standard DOM APIs, e.g. `document.querySelectorAll()`.</div>
 *
 * ## Angular's jqLite
 * jqLite provides only the following jQuery methods:
 *
 * - [`addClass()`](http://api.jquery.com/addClass/) - Does not support a function as first argument
 * - [`after()`](http://api.jquery.com/after/)
 * - [`append()`](http://api.jquery.com/append/)
 * - [`attr()`](http://api.jquery.com/attr/) - Does not support functions as parameters
 * - [`bind()`](http://api.jquery.com/bind/) - Does not support namespaces, selectors or eventData
 * - [`children()`](http://api.jquery.com/children/) - Does not support selectors
 * - [`clone()`](http://api.jquery.com/clone/)
 * - [`contents()`](http://api.jquery.com/contents/)
 * - [`css()`](http://api.jquery.com/css/) - Only retrieves inline-styles, does not call `getComputedStyle()`.
 *   As a setter, does not convert numbers to strings or append 'px', and also does not have automatic property prefixing.
 * - [`data()`](http://api.jquery.com/data/)
 * - [`detach()`](http://api.jquery.com/detach/)
 * - [`empty()`](http://api.jquery.com/empty/)
 * - [`eq()`](http://api.jquery.com/eq/)
 * - [`find()`](http://api.jquery.com/find/) - Limited to lookups by tag name
 * - [`hasClass()`](http://api.jquery.com/hasClass/)
 * - [`html()`](http://api.jquery.com/html/)
 * - [`next()`](http://api.jquery.com/next/) - Does not support selectors
 * - [`on()`](http://api.jquery.com/on/) - Does not support namespaces, selectors or eventData
 * - [`off()`](http://api.jquery.com/off/) - Does not support namespaces, selectors or event object as parameter
 * - [`one()`](http://api.jquery.com/one/) - Does not support namespaces or selectors
 * - [`parent()`](http://api.jquery.com/parent/) - Does not support selectors
 * - [`prepend()`](http://api.jquery.com/prepend/)
 * - [`prop()`](http://api.jquery.com/prop/)
 * - [`ready()`](http://api.jquery.com/ready/)
 * - [`remove()`](http://api.jquery.com/remove/)
 * - [`removeAttr()`](http://api.jquery.com/removeAttr/)
 * - [`removeClass()`](http://api.jquery.com/removeClass/) - Does not support a function as first argument
 * - [`removeData()`](http://api.jquery.com/removeData/)
 * - [`replaceWith()`](http://api.jquery.com/replaceWith/)
 * - [`text()`](http://api.jquery.com/text/)
 * - [`toggleClass()`](http://api.jquery.com/toggleClass/) - Does not support a function as first argument
 * - [`triggerHandler()`](http://api.jquery.com/triggerHandler/) - Passes a dummy event object to handlers
 * - [`unbind()`](http://api.jquery.com/unbind/) - Does not support namespaces or event object as parameter
 * - [`val()`](http://api.jquery.com/val/)
 * - [`wrap()`](http://api.jquery.com/wrap/)
 *
 * ## jQuery/jqLite Extras
 * Angular also provides the following additional methods and events to both jQuery and jqLite:
 *
 * ### Events
 * - `$destroy` - AngularJS intercepts all jqLite/jQuery's DOM destruction apis and fires this event
 *    on all DOM nodes being removed.  This can be used to clean up any 3rd party bindings to the DOM
 *    element before it is removed.
 *
 * ### Methods
 * - `controller(name)` - retrieves the controller of the current element or its parent. By default
 *   retrieves controller associated with the `ngController` directive. If `name` is provided as
 *   camelCase directive name, then the controller for this directive will be retrieved (e.g.
 *   `'ngModel'`).
 * - `injector()` - retrieves the injector of the current element or its parent.
 * - `scope()` - retrieves the {@link ng.$rootScope.Scope scope} of the current
 *   element or its parent. Requires {@link guide/production#disabling-debug-data Debug Data} to
 *   be enabled.
 * - `isolateScope()` - retrieves an isolate {@link ng.$rootScope.Scope scope} if one is attached directly to the
 *   current element. This getter should be used only on elements that contain a directive which starts a new isolate
 *   scope. Calling `scope()` on this element always returns the original non-isolate scope.
 *   Requires {@link guide/production#disabling-debug-data Debug Data} to be enabled.
 * - `inheritedData()` - same as `data()`, but walks up the DOM until a value is found or the top
 *   parent element is reached.
 *
 * @knownIssue You cannot spy on `angular.element` if you are using Jasmine version 1.x. See
 * https://github.com/angular/angular.js/issues/14251 for more information.
 *
 * @param {string|DOMElement} element HTML string or DOMElement to be wrapped into jQuery.
 * @returns {Object} jQuery object.
 */

JQLite.expando = 'ng339';

var jqCache = JQLite.cache = {},
    jqId = 1,
    addEventListenerFn = function(element, type, fn) {
      element.addEventListener(type, fn, false);
    },
    removeEventListenerFn = function(element, type, fn) {
      element.removeEventListener(type, fn, false);
    };

/*
 * !!! This is an undocumented "private" function !!!
 */
JQLite._data = function(node) {
  //jQuery always returns an object on cache miss
  return this.cache[node[this.expando]] || {};
};

function jqNextId() { return ++jqId; }


var SPECIAL_CHARS_REGEXP = /([\:\-\_]+(.))/g;
var MOZ_HACK_REGEXP = /^moz([A-Z])/;
var MOUSE_EVENT_MAP= { mouseleave: "mouseout", mouseenter: "mouseover"};
var jqLiteMinErr = minErr('jqLite');

/**
 * Converts snake_case to camelCase.
 * Also there is special case for Moz prefix starting with upper case letter.
 * @param name Name to normalize
 */
function camelCase(name) {
  return name.
    replace(SPECIAL_CHARS_REGEXP, function(_, separator, letter, offset) {
      return offset ? letter.toUpperCase() : letter;
    }).
    replace(MOZ_HACK_REGEXP, 'Moz$1');
}

var SINGLE_TAG_REGEXP = /^<([\w-]+)\s*\/?>(?:<\/\1>|)$/;
var HTML_REGEXP = /<|&#?\w+;/;
var TAG_NAME_REGEXP = /<([\w:-]+)/;
var XHTML_TAG_REGEXP = /<(?!area|br|col|embed|hr|img|input|link|meta|param)(([\w:-]+)[^>]*)\/>/gi;

var wrapMap = {
  'option': [1, '<select multiple="multiple">', '</select>'],

  'thead': [1, '<table>', '</table>'],
  'col': [2, '<table><colgroup>', '</colgroup></table>'],
  'tr': [2, '<table><tbody>', '</tbody></table>'],
  'td': [3, '<table><tbody><tr>', '</tr></tbody></table>'],
  '_default': [0, "", ""]
};

wrapMap.optgroup = wrapMap.option;
wrapMap.tbody = wrapMap.tfoot = wrapMap.colgroup = wrapMap.caption = wrapMap.thead;
wrapMap.th = wrapMap.td;


function jqLiteIsTextNode(html) {
  return !HTML_REGEXP.test(html);
}

function jqLiteAcceptsData(node) {
  // The window object can accept data but has no nodeType
  // Otherwise we are only interested in elements (1) and documents (9)
  var nodeType = node.nodeType;
  return nodeType === NODE_TYPE_ELEMENT || !nodeType || nodeType === NODE_TYPE_DOCUMENT;
}

function jqLiteHasData(node) {
  for (var key in jqCache[node.ng339]) {
    return true;
  }
  return false;
}

function jqLiteCleanData(nodes) {
  for (var i = 0, ii = nodes.length; i < ii; i++) {
    jqLiteRemoveData(nodes[i]);
  }
}

function jqLiteBuildFragment(html, context) {
  var tmp, tag, wrap,
      fragment = context.createDocumentFragment(),
      nodes = [], i;

  if (jqLiteIsTextNode(html)) {
    // Convert non-html into a text node
    nodes.push(context.createTextNode(html));
  } else {
    // Convert html into DOM nodes
    tmp = fragment.appendChild(context.createElement("div"));
    tag = (TAG_NAME_REGEXP.exec(html) || ["", ""])[1].toLowerCase();
    wrap = wrapMap[tag] || wrapMap._default;
    tmp.innerHTML = wrap[1] + html.replace(XHTML_TAG_REGEXP, "<$1></$2>") + wrap[2];

    // Descend through wrappers to the right content
    i = wrap[0];
    while (i--) {
      tmp = tmp.lastChild;
    }

    nodes = concat(nodes, tmp.childNodes);

    tmp = fragment.firstChild;
    tmp.textContent = "";
  }

  // Remove wrapper from fragment
  fragment.textContent = "";
  fragment.innerHTML = ""; // Clear inner HTML
  forEach(nodes, function(node) {
    fragment.appendChild(node);
  });

  return fragment;
}

function jqLiteParseHTML(html, context) {
  context = context || window.document;
  var parsed;

  if ((parsed = SINGLE_TAG_REGEXP.exec(html))) {
    return [context.createElement(parsed[1])];
  }

  if ((parsed = jqLiteBuildFragment(html, context))) {
    return parsed.childNodes;
  }

  return [];
}

function jqLiteWrapNode(node, wrapper) {
  var parent = node.parentNode;

  if (parent) {
    parent.replaceChild(wrapper, node);
  }

  wrapper.appendChild(node);
}


// IE9-11 has no method "contains" in SVG element and in Node.prototype. Bug #10259.
var jqLiteContains = window.Node.prototype.contains || function(arg) {
  // jshint bitwise: false
  return !!(this.compareDocumentPosition(arg) & 16);
  // jshint bitwise: true
};

/////////////////////////////////////////////
function JQLite(element) {
  if (element instanceof JQLite) {
    return element;
  }

  var argIsString;

  if (isString(element)) {
    element = trim(element);
    argIsString = true;
  }
  if (!(this instanceof JQLite)) {
    if (argIsString && element.charAt(0) != '<') {
      throw jqLiteMinErr('nosel', 'Looking up elements via selectors is not supported by jqLite! See: http://docs.angularjs.org/api/angular.element');
    }
    return new JQLite(element);
  }

  if (argIsString) {
    jqLiteAddNodes(this, jqLiteParseHTML(element));
  } else {
    jqLiteAddNodes(this, element);
  }
}

function jqLiteClone(element) {
  return element.cloneNode(true);
}

function jqLiteDealoc(element, onlyDescendants) {
  if (!onlyDescendants) jqLiteRemoveData(element);

  if (element.querySelectorAll) {
    var descendants = element.querySelectorAll('*');
    for (var i = 0, l = descendants.length; i < l; i++) {
      jqLiteRemoveData(descendants[i]);
    }
  }
}

function jqLiteOff(element, type, fn, unsupported) {
  if (isDefined(unsupported)) throw jqLiteMinErr('offargs', 'jqLite#off() does not support the `selector` argument');

  var expandoStore = jqLiteExpandoStore(element);
  var events = expandoStore && expandoStore.events;
  var handle = expandoStore && expandoStore.handle;

  if (!handle) return; //no listeners registered

  if (!type) {
    for (type in events) {
      if (type !== '$destroy') {
        removeEventListenerFn(element, type, handle);
      }
      delete events[type];
    }
  } else {

    var removeHandler = function(type) {
      var listenerFns = events[type];
      if (isDefined(fn)) {
        arrayRemove(listenerFns || [], fn);
      }
      if (!(isDefined(fn) && listenerFns && listenerFns.length > 0)) {
        removeEventListenerFn(element, type, handle);
        delete events[type];
      }
    };

    forEach(type.split(' '), function(type) {
      removeHandler(type);
      if (MOUSE_EVENT_MAP[type]) {
        removeHandler(MOUSE_EVENT_MAP[type]);
      }
    });
  }
}

function jqLiteRemoveData(element, name) {
  var expandoId = element.ng339;
  var expandoStore = expandoId && jqCache[expandoId];

  if (expandoStore) {
    if (name) {
      delete expandoStore.data[name];
      return;
    }

    if (expandoStore.handle) {
      if (expandoStore.events.$destroy) {
        expandoStore.handle({}, '$destroy');
      }
      jqLiteOff(element);
    }
    delete jqCache[expandoId];
    element.ng339 = undefined; // don't delete DOM expandos. IE and Chrome don't like it
  }
}


function jqLiteExpandoStore(element, createIfNecessary) {
  var expandoId = element.ng339,
      expandoStore = expandoId && jqCache[expandoId];

  if (createIfNecessary && !expandoStore) {
    element.ng339 = expandoId = jqNextId();
    expandoStore = jqCache[expandoId] = {events: {}, data: {}, handle: undefined};
  }

  return expandoStore;
}


function jqLiteData(element, key, value) {
  if (jqLiteAcceptsData(element)) {

    var isSimpleSetter = isDefined(value);
    var isSimpleGetter = !isSimpleSetter && key && !isObject(key);
    var massGetter = !key;
    var expandoStore = jqLiteExpandoStore(element, !isSimpleGetter);
    var data = expandoStore && expandoStore.data;

    if (isSimpleSetter) { // data('key', value)
      data[key] = value;
    } else {
      if (massGetter) {  // data()
        return data;
      } else {
        if (isSimpleGetter) { // data('key')
          // don't force creation of expandoStore if it doesn't exist yet
          return data && data[key];
        } else { // mass-setter: data({key1: val1, key2: val2})
          extend(data, key);
        }
      }
    }
  }
}

function jqLiteHasClass(element, selector) {
  if (!element.getAttribute) return false;
  return ((" " + (element.getAttribute('class') || '') + " ").replace(/[\n\t]/g, " ").
      indexOf(" " + selector + " ") > -1);
}

function jqLiteRemoveClass(element, cssClasses) {
  if (cssClasses && element.setAttribute) {
    forEach(cssClasses.split(' '), function(cssClass) {
      element.setAttribute('class', trim(
          (" " + (element.getAttribute('class') || '') + " ")
          .replace(/[\n\t]/g, " ")
          .replace(" " + trim(cssClass) + " ", " "))
      );
    });
  }
}

function jqLiteAddClass(element, cssClasses) {
  if (cssClasses && element.setAttribute) {
    var existingClasses = (' ' + (element.getAttribute('class') || '') + ' ')
                            .replace(/[\n\t]/g, " ");

    forEach(cssClasses.split(' '), function(cssClass) {
      cssClass = trim(cssClass);
      if (existingClasses.indexOf(' ' + cssClass + ' ') === -1) {
        existingClasses += cssClass + ' ';
      }
    });

    element.setAttribute('class', trim(existingClasses));
  }
}


function jqLiteAddNodes(root, elements) {
  // THIS CODE IS VERY HOT. Don't make changes without benchmarking.

  if (elements) {

    // if a Node (the most common case)
    if (elements.nodeType) {
      root[root.length++] = elements;
    } else {
      var length = elements.length;

      // if an Array or NodeList and not a Window
      if (typeof length === 'number' && elements.window !== elements) {
        if (length) {
          for (var i = 0; i < length; i++) {
            root[root.length++] = elements[i];
          }
        }
      } else {
        root[root.length++] = elements;
      }
    }
  }
}


function jqLiteController(element, name) {
  return jqLiteInheritedData(element, '$' + (name || 'ngController') + 'Controller');
}

function jqLiteInheritedData(element, name, value) {
  // if element is the document object work with the html element instead
  // this makes $(document).scope() possible
  if (element.nodeType == NODE_TYPE_DOCUMENT) {
    element = element.documentElement;
  }
  var names = isArray(name) ? name : [name];

  while (element) {
    for (var i = 0, ii = names.length; i < ii; i++) {
      if (isDefined(value = jqLite.data(element, names[i]))) return value;
    }

    // If dealing with a document fragment node with a host element, and no parent, use the host
    // element as the parent. This enables directives within a Shadow DOM or polyfilled Shadow DOM
    // to lookup parent controllers.
    element = element.parentNode || (element.nodeType === NODE_TYPE_DOCUMENT_FRAGMENT && element.host);
  }
}

function jqLiteEmpty(element) {
  jqLiteDealoc(element, true);
  while (element.firstChild) {
    element.removeChild(element.firstChild);
  }
}

function jqLiteRemove(element, keepData) {
  if (!keepData) jqLiteDealoc(element);
  var parent = element.parentNode;
  if (parent) parent.removeChild(element);
}


function jqLiteDocumentLoaded(action, win) {
  win = win || window;
  if (win.document.readyState === 'complete') {
    // Force the action to be run async for consistent behavior
    // from the action's point of view
    // i.e. it will definitely not be in a $apply
    win.setTimeout(action);
  } else {
    // No need to unbind this handler as load is only ever called once
    jqLite(win).on('load', action);
  }
}

//////////////////////////////////////////
// Functions which are declared directly.
//////////////////////////////////////////
var JQLitePrototype = JQLite.prototype = {
  ready: function(fn) {
    var fired = false;

    function trigger() {
      if (fired) return;
      fired = true;
      fn();
    }

    // check if document is already loaded
    if (window.document.readyState === 'complete') {
      window.setTimeout(trigger);
    } else {
      this.on('DOMContentLoaded', trigger); // works for modern browsers and IE9
      // we can not use jqLite since we are not done loading and jQuery could be loaded later.
      // jshint -W064
      JQLite(window).on('load', trigger); // fallback to window.onload for others
      // jshint +W064
    }
  },
  toString: function() {
    var value = [];
    forEach(this, function(e) { value.push('' + e);});
    return '[' + value.join(', ') + ']';
  },

  eq: function(index) {
      return (index >= 0) ? jqLite(this[index]) : jqLite(this[this.length + index]);
  },

  length: 0,
  push: push,
  sort: [].sort,
  splice: [].splice
};

//////////////////////////////////////////
// Functions iterating getter/setters.
// these functions return self on setter and
// value on get.
//////////////////////////////////////////
var BOOLEAN_ATTR = {};
forEach('multiple,selected,checked,disabled,readOnly,required,open'.split(','), function(value) {
  BOOLEAN_ATTR[lowercase(value)] = value;
});
var BOOLEAN_ELEMENTS = {};
forEach('input,select,option,textarea,button,form,details'.split(','), function(value) {
  BOOLEAN_ELEMENTS[value] = true;
});
var ALIASED_ATTR = {
  'ngMinlength': 'minlength',
  'ngMaxlength': 'maxlength',
  'ngMin': 'min',
  'ngMax': 'max',
  'ngPattern': 'pattern'
};

function getBooleanAttrName(element, name) {
  // check dom last since we will most likely fail on name
  var booleanAttr = BOOLEAN_ATTR[name.toLowerCase()];

  // booleanAttr is here twice to minimize DOM access
  return booleanAttr && BOOLEAN_ELEMENTS[nodeName_(element)] && booleanAttr;
}

function getAliasedAttrName(name) {
  return ALIASED_ATTR[name];
}

forEach({
  data: jqLiteData,
  removeData: jqLiteRemoveData,
  hasData: jqLiteHasData,
  cleanData: jqLiteCleanData
}, function(fn, name) {
  JQLite[name] = fn;
});

forEach({
  data: jqLiteData,
  inheritedData: jqLiteInheritedData,

  scope: function(element) {
    // Can't use jqLiteData here directly so we stay compatible with jQuery!
    return jqLite.data(element, '$scope') || jqLiteInheritedData(element.parentNode || element, ['$isolateScope', '$scope']);
  },

  isolateScope: function(element) {
    // Can't use jqLiteData here directly so we stay compatible with jQuery!
    return jqLite.data(element, '$isolateScope') || jqLite.data(element, '$isolateScopeNoTemplate');
  },

  controller: jqLiteController,

  injector: function(element) {
    return jqLiteInheritedData(element, '$injector');
  },

  removeAttr: function(element, name) {
    element.removeAttribute(name);
  },

  hasClass: jqLiteHasClass,

  css: function(element, name, value) {
    name = camelCase(name);

    if (isDefined(value)) {
      element.style[name] = value;
    } else {
      return element.style[name];
    }
  },

  attr: function(element, name, value) {
    var nodeType = element.nodeType;
    if (nodeType === NODE_TYPE_TEXT || nodeType === NODE_TYPE_ATTRIBUTE || nodeType === NODE_TYPE_COMMENT) {
      return;
    }
    var lowercasedName = lowercase(name);
    if (BOOLEAN_ATTR[lowercasedName]) {
      if (isDefined(value)) {
        if (!!value) {
          element[name] = true;
          element.setAttribute(name, lowercasedName);
        } else {
          element[name] = false;
          element.removeAttribute(lowercasedName);
        }
      } else {
        return (element[name] ||
                 (element.attributes.getNamedItem(name) || noop).specified)
               ? lowercasedName
               : undefined;
      }
    } else if (isDefined(value)) {
      element.setAttribute(name, value);
    } else if (element.getAttribute) {
      // the extra argument "2" is to get the right thing for a.href in IE, see jQuery code
      // some elements (e.g. Document) don't have get attribute, so return undefined
      var ret = element.getAttribute(name, 2);
      // normalize non-existing attributes to undefined (as jQuery)
      return ret === null ? undefined : ret;
    }
  },

  prop: function(element, name, value) {
    if (isDefined(value)) {
      element[name] = value;
    } else {
      return element[name];
    }
  },

  text: (function() {
    getText.$dv = '';
    return getText;

    function getText(element, value) {
      if (isUndefined(value)) {
        var nodeType = element.nodeType;
        return (nodeType === NODE_TYPE_ELEMENT || nodeType === NODE_TYPE_TEXT) ? element.textContent : '';
      }
      element.textContent = value;
    }
  })(),

  val: function(element, value) {
    if (isUndefined(value)) {
      if (element.multiple && nodeName_(element) === 'select') {
        var result = [];
        forEach(element.options, function(option) {
          if (option.selected) {
            result.push(option.value || option.text);
          }
        });
        return result.length === 0 ? null : result;
      }
      return element.value;
    }
    element.value = value;
  },

  html: function(element, value) {
    if (isUndefined(value)) {
      return element.innerHTML;
    }
    jqLiteDealoc(element, true);
    element.innerHTML = value;
  },

  empty: jqLiteEmpty
}, function(fn, name) {
  /**
   * Properties: writes return selection, reads return first value
   */
  JQLite.prototype[name] = function(arg1, arg2) {
    var i, key;
    var nodeCount = this.length;

    // jqLiteHasClass has only two arguments, but is a getter-only fn, so we need to special-case it
    // in a way that survives minification.
    // jqLiteEmpty takes no arguments but is a setter.
    if (fn !== jqLiteEmpty &&
        (isUndefined((fn.length == 2 && (fn !== jqLiteHasClass && fn !== jqLiteController)) ? arg1 : arg2))) {
      if (isObject(arg1)) {

        // we are a write, but the object properties are the key/values
        for (i = 0; i < nodeCount; i++) {
          if (fn === jqLiteData) {
            // data() takes the whole object in jQuery
            fn(this[i], arg1);
          } else {
            for (key in arg1) {
              fn(this[i], key, arg1[key]);
            }
          }
        }
        // return self for chaining
        return this;
      } else {
        // we are a read, so read the first child.
        // TODO: do we still need this?
        var value = fn.$dv;
        // Only if we have $dv do we iterate over all, otherwise it is just the first element.
        var jj = (isUndefined(value)) ? Math.min(nodeCount, 1) : nodeCount;
        for (var j = 0; j < jj; j++) {
          var nodeValue = fn(this[j], arg1, arg2);
          value = value ? value + nodeValue : nodeValue;
        }
        return value;
      }
    } else {
      // we are a write, so apply to all children
      for (i = 0; i < nodeCount; i++) {
        fn(this[i], arg1, arg2);
      }
      // return self for chaining
      return this;
    }
  };
});

function createEventHandler(element, events) {
  var eventHandler = function(event, type) {
    // jQuery specific api
    event.isDefaultPrevented = function() {
      return event.defaultPrevented;
    };

    var eventFns = events[type || event.type];
    var eventFnsLength = eventFns ? eventFns.length : 0;

    if (!eventFnsLength) return;

    if (isUndefined(event.immediatePropagationStopped)) {
      var originalStopImmediatePropagation = event.stopImmediatePropagation;
      event.stopImmediatePropagation = function() {
        event.immediatePropagationStopped = true;

        if (event.stopPropagation) {
          event.stopPropagation();
        }

        if (originalStopImmediatePropagation) {
          originalStopImmediatePropagation.call(event);
        }
      };
    }

    event.isImmediatePropagationStopped = function() {
      return event.immediatePropagationStopped === true;
    };

    // Some events have special handlers that wrap the real handler
    var handlerWrapper = eventFns.specialHandlerWrapper || defaultHandlerWrapper;

    // Copy event handlers in case event handlers array is modified during execution.
    if ((eventFnsLength > 1)) {
      eventFns = shallowCopy(eventFns);
    }

    for (var i = 0; i < eventFnsLength; i++) {
      if (!event.isImmediatePropagationStopped()) {
        handlerWrapper(element, event, eventFns[i]);
      }
    }
  };

  // TODO: this is a hack for angularMocks/clearDataCache that makes it possible to deregister all
  //       events on `element`
  eventHandler.elem = element;
  return eventHandler;
}

function defaultHandlerWrapper(element, event, handler) {
  handler.call(element, event);
}

function specialMouseHandlerWrapper(target, event, handler) {
  // Refer to jQuery's implementation of mouseenter & mouseleave
  // Read about mouseenter and mouseleave:
  // http://www.quirksmode.org/js/events_mouse.html#link8
  var related = event.relatedTarget;
  // For mousenter/leave call the handler if related is outside the target.
  // NB: No relatedTarget if the mouse left/entered the browser window
  if (!related || (related !== target && !jqLiteContains.call(target, related))) {
    handler.call(target, event);
  }
}

//////////////////////////////////////////
// Functions iterating traversal.
// These functions chain results into a single
// selector.
//////////////////////////////////////////
forEach({
  removeData: jqLiteRemoveData,

  on: function jqLiteOn(element, type, fn, unsupported) {
    if (isDefined(unsupported)) throw jqLiteMinErr('onargs', 'jqLite#on() does not support the `selector` or `eventData` parameters');

    // Do not add event handlers to non-elements because they will not be cleaned up.
    if (!jqLiteAcceptsData(element)) {
      return;
    }

    var expandoStore = jqLiteExpandoStore(element, true);
    var events = expandoStore.events;
    var handle = expandoStore.handle;

    if (!handle) {
      handle = expandoStore.handle = createEventHandler(element, events);
    }

    // http://jsperf.com/string-indexof-vs-split
    var types = type.indexOf(' ') >= 0 ? type.split(' ') : [type];
    var i = types.length;

    var addHandler = function(type, specialHandlerWrapper, noEventListener) {
      var eventFns = events[type];

      if (!eventFns) {
        eventFns = events[type] = [];
        eventFns.specialHandlerWrapper = specialHandlerWrapper;
        if (type !== '$destroy' && !noEventListener) {
          addEventListenerFn(element, type, handle);
        }
      }

      eventFns.push(fn);
    };

    while (i--) {
      type = types[i];
      if (MOUSE_EVENT_MAP[type]) {
        addHandler(MOUSE_EVENT_MAP[type], specialMouseHandlerWrapper);
        addHandler(type, undefined, true);
      } else {
        addHandler(type);
      }
    }
  },

  off: jqLiteOff,

  one: function(element, type, fn) {
    element = jqLite(element);

    //add the listener twice so that when it is called
    //you can remove the original function and still be
    //able to call element.off(ev, fn) normally
    element.on(type, function onFn() {
      element.off(type, fn);
      element.off(type, onFn);
    });
    element.on(type, fn);
  },

  replaceWith: function(element, replaceNode) {
    var index, parent = element.parentNode;
    jqLiteDealoc(element);
    forEach(new JQLite(replaceNode), function(node) {
      if (index) {
        parent.insertBefore(node, index.nextSibling);
      } else {
        parent.replaceChild(node, element);
      }
      index = node;
    });
  },

  children: function(element) {
    var children = [];
    forEach(element.childNodes, function(element) {
      if (element.nodeType === NODE_TYPE_ELEMENT) {
        children.push(element);
      }
    });
    return children;
  },

  contents: function(element) {
    return element.contentDocument || element.childNodes || [];
  },

  append: function(element, node) {
    var nodeType = element.nodeType;
    if (nodeType !== NODE_TYPE_ELEMENT && nodeType !== NODE_TYPE_DOCUMENT_FRAGMENT) return;

    node = new JQLite(node);

    for (var i = 0, ii = node.length; i < ii; i++) {
      var child = node[i];
      element.appendChild(child);
    }
  },

  prepend: function(element, node) {
    if (element.nodeType === NODE_TYPE_ELEMENT) {
      var index = element.firstChild;
      forEach(new JQLite(node), function(child) {
        element.insertBefore(child, index);
      });
    }
  },

  wrap: function(element, wrapNode) {
    jqLiteWrapNode(element, jqLite(wrapNode).eq(0).clone()[0]);
  },

  remove: jqLiteRemove,

  detach: function(element) {
    jqLiteRemove(element, true);
  },

  after: function(element, newElement) {
    var index = element, parent = element.parentNode;
    newElement = new JQLite(newElement);

    for (var i = 0, ii = newElement.length; i < ii; i++) {
      var node = newElement[i];
      parent.insertBefore(node, index.nextSibling);
      index = node;
    }
  },

  addClass: jqLiteAddClass,
  removeClass: jqLiteRemoveClass,

  toggleClass: function(element, selector, condition) {
    if (selector) {
      forEach(selector.split(' '), function(className) {
        var classCondition = condition;
        if (isUndefined(classCondition)) {
          classCondition = !jqLiteHasClass(element, className);
        }
        (classCondition ? jqLiteAddClass : jqLiteRemoveClass)(element, className);
      });
    }
  },

  parent: function(element) {
    var parent = element.parentNode;
    return parent && parent.nodeType !== NODE_TYPE_DOCUMENT_FRAGMENT ? parent : null;
  },

  next: function(element) {
    return element.nextElementSibling;
  },

  find: function(element, selector) {
    if (element.getElementsByTagName) {
      return element.getElementsByTagName(selector);
    } else {
      return [];
    }
  },

  clone: jqLiteClone,

  triggerHandler: function(element, event, extraParameters) {

    var dummyEvent, eventFnsCopy, handlerArgs;
    var eventName = event.type || event;
    var expandoStore = jqLiteExpandoStore(element);
    var events = expandoStore && expandoStore.events;
    var eventFns = events && events[eventName];

    if (eventFns) {
      // Create a dummy event to pass to the handlers
      dummyEvent = {
        preventDefault: function() { this.defaultPrevented = true; },
        isDefaultPrevented: function() { return this.defaultPrevented === true; },
        stopImmediatePropagation: function() { this.immediatePropagationStopped = true; },
        isImmediatePropagationStopped: function() { return this.immediatePropagationStopped === true; },
        stopPropagation: noop,
        type: eventName,
        target: element
      };

      // If a custom event was provided then extend our dummy event with it
      if (event.type) {
        dummyEvent = extend(dummyEvent, event);
      }

      // Copy event handlers in case event handlers array is modified during execution.
      eventFnsCopy = shallowCopy(eventFns);
      handlerArgs = extraParameters ? [dummyEvent].concat(extraParameters) : [dummyEvent];

      forEach(eventFnsCopy, function(fn) {
        if (!dummyEvent.isImmediatePropagationStopped()) {
          fn.apply(element, handlerArgs);
        }
      });
    }
  }
}, function(fn, name) {
  /**
   * chaining functions
   */
  JQLite.prototype[name] = function(arg1, arg2, arg3) {
    var value;

    for (var i = 0, ii = this.length; i < ii; i++) {
      if (isUndefined(value)) {
        value = fn(this[i], arg1, arg2, arg3);
        if (isDefined(value)) {
          // any function which returns a value needs to be wrapped
          value = jqLite(value);
        }
      } else {
        jqLiteAddNodes(value, fn(this[i], arg1, arg2, arg3));
      }
    }
    return isDefined(value) ? value : this;
  };

  // bind legacy bind/unbind to on/off
  JQLite.prototype.bind = JQLite.prototype.on;
  JQLite.prototype.unbind = JQLite.prototype.off;
});


// Provider for private $$jqLite service
function $$jqLiteProvider() {
  this.$get = function $$jqLite() {
    return extend(JQLite, {
      hasClass: function(node, classes) {
        if (node.attr) node = node[0];
        return jqLiteHasClass(node, classes);
      },
      addClass: function(node, classes) {
        if (node.attr) node = node[0];
        return jqLiteAddClass(node, classes);
      },
      removeClass: function(node, classes) {
        if (node.attr) node = node[0];
        return jqLiteRemoveClass(node, classes);
      }
    });
  };
}

/**
 * Computes a hash of an 'obj'.
 * Hash of a:
 *  string is string
 *  number is number as string
 *  object is either result of calling $$hashKey function on the object or uniquely generated id,
 *         that is also assigned to the $$hashKey property of the object.
 *
 * @param obj
 * @returns {string} hash string such that the same input will have the same hash string.
 *         The resulting string key is in 'type:hashKey' format.
 */
function hashKey(obj, nextUidFn) {
  var key = obj && obj.$$hashKey;

  if (key) {
    if (typeof key === 'function') {
      key = obj.$$hashKey();
    }
    return key;
  }

  var objType = typeof obj;
  if (objType == 'function' || (objType == 'object' && obj !== null)) {
    key = obj.$$hashKey = objType + ':' + (nextUidFn || nextUid)();
  } else {
    key = objType + ':' + obj;
  }

  return key;
}

/**
 * HashMap which can use objects as keys
 */
function HashMap(array, isolatedUid) {
  if (isolatedUid) {
    var uid = 0;
    this.nextUid = function() {
      return ++uid;
    };
  }
  forEach(array, this.put, this);
}
HashMap.prototype = {
  /**
   * Store key value pair
   * @param key key to store can be any type
   * @param value value to store can be any type
   */
  put: function(key, value) {
    this[hashKey(key, this.nextUid)] = value;
  },

  /**
   * @param key
   * @returns {Object} the value for the key
   */
  get: function(key) {
    return this[hashKey(key, this.nextUid)];
  },

  /**
   * Remove the key/value pair
   * @param key
   */
  remove: function(key) {
    var value = this[key = hashKey(key, this.nextUid)];
    delete this[key];
    return value;
  }
};

var $$HashMapProvider = [function() {
  this.$get = [function() {
    return HashMap;
  }];
}];

/**
 * @ngdoc function
 * @module ng
 * @name angular.injector
 * @kind function
 *
 * @description
 * Creates an injector object that can be used for retrieving services as well as for
 * dependency injection (see {@link guide/di dependency injection}).
 *
 * @param {Array.<string|Function>} modules A list of module functions or their aliases. See
 *     {@link angular.module}. The `ng` module must be explicitly added.
 * @param {boolean=} [strictDi=false] Whether the injector should be in strict mode, which
 *     disallows argument name annotation inference.
 * @returns {injector} Injector object. See {@link auto.$injector $injector}.
 *
 * @example
 * Typical usage
 * ```js
 *   // create an injector
 *   var $injector = angular.injector(['ng']);
 *
 *   // use the injector to kick off your application
 *   // use the type inference to auto inject arguments, or use implicit injection
 *   $injector.invoke(function($rootScope, $compile, $document) {
 *     $compile($document)($rootScope);
 *     $rootScope.$digest();
 *   });
 * ```
 *
 * Sometimes you want to get access to the injector of a currently running Angular app
 * from outside Angular. Perhaps, you want to inject and compile some markup after the
 * application has been bootstrapped. You can do this using the extra `injector()` added
 * to JQuery/jqLite elements. See {@link angular.element}.
 *
 * *This is fairly rare but could be the case if a third party library is injecting the
 * markup.*
 *
 * In the following example a new block of HTML containing a `ng-controller`
 * directive is added to the end of the document body by JQuery. We then compile and link
 * it into the current AngularJS scope.
 *
 * ```js
 * var $div = $('<div ng-controller="MyCtrl">{{content.label}}</div>');
 * $(document.body).append($div);
 *
 * angular.element(document).injector().invoke(function($compile) {
 *   var scope = angular.element($div).scope();
 *   $compile($div)(scope);
 * });
 * ```
 */


/**
 * @ngdoc module
 * @name auto
 * @installation
 * @description
 *
 * Implicit module which gets automatically added to each {@link auto.$injector $injector}.
 */

var ARROW_ARG = /^([^\(]+?)=>/;
var FN_ARGS = /^[^\(]*\(\s*([^\)]*)\)/m;
var FN_ARG_SPLIT = /,/;
var FN_ARG = /^\s*(_?)(\S+?)\1\s*$/;
var STRIP_COMMENTS = /((\/\/.*$)|(\/\*[\s\S]*?\*\/))/mg;
var $injectorMinErr = minErr('$injector');

function stringifyFn(fn) {
  // Support: Chrome 50-51 only
  // Creating a new string by adding `' '` at the end, to hack around some bug in Chrome v50/51
  // (See https://github.com/angular/angular.js/issues/14487.)
  // TODO (gkalpak): Remove workaround when Chrome v52 is released
  return Function.prototype.toString.call(fn) + ' ';
}

function extractArgs(fn) {
  var fnText = stringifyFn(fn).replace(STRIP_COMMENTS, ''),
      args = fnText.match(ARROW_ARG) || fnText.match(FN_ARGS);
  return args;
}

function anonFn(fn) {
  // For anonymous functions, showing at the very least the function signature can help in
  // debugging.
  var args = extractArgs(fn);
  if (args) {
    return 'function(' + (args[1] || '').replace(/[\s\r\n]+/, ' ') + ')';
  }
  return 'fn';
}

function annotate(fn, strictDi, name) {
  var $inject,
      argDecl,
      last;

  if (typeof fn === 'function') {
    if (!($inject = fn.$inject)) {
      $inject = [];
      if (fn.length) {
        if (strictDi) {
          if (!isString(name) || !name) {
            name = fn.name || anonFn(fn);
          }
          throw $injectorMinErr('strictdi',
            '{0} is not using explicit annotation and cannot be invoked in strict mode', name);
        }
        argDecl = extractArgs(fn);
        forEach(argDecl[1].split(FN_ARG_SPLIT), function(arg) {
          arg.replace(FN_ARG, function(all, underscore, name) {
            $inject.push(name);
          });
        });
      }
      fn.$inject = $inject;
    }
  } else if (isArray(fn)) {
    last = fn.length - 1;
    assertArgFn(fn[last], 'fn');
    $inject = fn.slice(0, last);
  } else {
    assertArgFn(fn, 'fn', true);
  }
  return $inject;
}

///////////////////////////////////////

/**
 * @ngdoc service
 * @name $injector
 *
 * @description
 *
 * `$injector` is used to retrieve object instances as defined by
 * {@link auto.$provide provider}, instantiate types, invoke methods,
 * and load modules.
 *
 * The following always holds true:
 *
 * ```js
 *   var $injector = angular.injector();
 *   expect($injector.get('$injector')).toBe($injector);
 *   expect($injector.invoke(function($injector) {
 *     return $injector;
 *   })).toBe($injector);
 * ```
 *
 * # Injection Function Annotation
 *
 * JavaScript does not have annotations, and annotations are needed for dependency injection. The
 * following are all valid ways of annotating function with injection arguments and are equivalent.
 *
 * ```js
 *   // inferred (only works if code not minified/obfuscated)
 *   $injector.invoke(function(serviceA){});
 *
 *   // annotated
 *   function explicit(serviceA) {};
 *   explicit.$inject = ['serviceA'];
 *   $injector.invoke(explicit);
 *
 *   // inline
 *   $injector.invoke(['serviceA', function(serviceA){}]);
 * ```
 *
 * ## Inference
 *
 * In JavaScript calling `toString()` on a function returns the function definition. The definition
 * can then be parsed and the function arguments can be extracted. This method of discovering
 * annotations is disallowed when the injector is in strict mode.
 * *NOTE:* This does not work with minification, and obfuscation tools since these tools change the
 * argument names.
 *
 * ## `$inject` Annotation
 * By adding an `$inject` property onto a function the injection parameters can be specified.
 *
 * ## Inline
 * As an array of injection names, where the last item in the array is the function to call.
 */

/**
 * @ngdoc method
 * @name $injector#get
 *
 * @description
 * Return an instance of the service.
 *
 * @param {string} name The name of the instance to retrieve.
 * @param {string=} caller An optional string to provide the origin of the function call for error messages.
 * @return {*} The instance.
 */

/**
 * @ngdoc method
 * @name $injector#invoke
 *
 * @description
 * Invoke the method and supply the method arguments from the `$injector`.
 *
 * @param {Function|Array.<string|Function>} fn The injectable function to invoke. Function parameters are
 *   injected according to the {@link guide/di $inject Annotation} rules.
 * @param {Object=} self The `this` for the invoked method.
 * @param {Object=} locals Optional object. If preset then any argument names are read from this
 *                         object first, before the `$injector` is consulted.
 * @returns {*} the value returned by the invoked `fn` function.
 */

/**
 * @ngdoc method
 * @name $injector#has
 *
 * @description
 * Allows the user to query if the particular service exists.
 *
 * @param {string} name Name of the service to query.
 * @returns {boolean} `true` if injector has given service.
 */

/**
 * @ngdoc method
 * @name $injector#instantiate
 * @description
 * Create a new instance of JS type. The method takes a constructor function, invokes the new
 * operator, and supplies all of the arguments to the constructor function as specified by the
 * constructor annotation.
 *
 * @param {Function} Type Annotated constructor function.
 * @param {Object=} locals Optional object. If preset then any argument names are read from this
 * object first, before the `$injector` is consulted.
 * @returns {Object} new instance of `Type`.
 */

/**
 * @ngdoc method
 * @name $injector#annotate
 *
 * @description
 * Returns an array of service names which the function is requesting for injection. This API is
 * used by the injector to determine which services need to be injected into the function when the
 * function is invoked. There are three ways in which the function can be annotated with the needed
 * dependencies.
 *
 * # Argument names
 *
 * The simplest form is to extract the dependencies from the arguments of the function. This is done
 * by converting the function into a string using `toString()` method and extracting the argument
 * names.
 * ```js
 *   // Given
 *   function MyController($scope, $route) {
 *     // ...
 *   }
 *
 *   // Then
 *   expect(injector.annotate(MyController)).toEqual(['$scope', '$route']);
 * ```
 *
 * You can disallow this method by using strict injection mode.
 *
 * This method does not work with code minification / obfuscation. For this reason the following
 * annotation strategies are supported.
 *
 * # The `$inject` property
 *
 * If a function has an `$inject` property and its value is an array of strings, then the strings
 * represent names of services to be injected into the function.
 * ```js
 *   // Given
 *   var MyController = function(obfuscatedScope, obfuscatedRoute) {
 *     // ...
 *   }
 *   // Define function dependencies
 *   MyController['$inject'] = ['$scope', '$route'];
 *
 *   // Then
 *   expect(injector.annotate(MyController)).toEqual(['$scope', '$route']);
 * ```
 *
 * # The array notation
 *
 * It is often desirable to inline Injected functions and that's when setting the `$inject` property
 * is very inconvenient. In these situations using the array notation to specify the dependencies in
 * a way that survives minification is a better choice:
 *
 * ```js
 *   // We wish to write this (not minification / obfuscation safe)
 *   injector.invoke(function($compile, $rootScope) {
 *     // ...
 *   });
 *
 *   // We are forced to write break inlining
 *   var tmpFn = function(obfuscatedCompile, obfuscatedRootScope) {
 *     // ...
 *   };
 *   tmpFn.$inject = ['$compile', '$rootScope'];
 *   injector.invoke(tmpFn);
 *
 *   // To better support inline function the inline annotation is supported
 *   injector.invoke(['$compile', '$rootScope', function(obfCompile, obfRootScope) {
 *     // ...
 *   }]);
 *
 *   // Therefore
 *   expect(injector.annotate(
 *      ['$compile', '$rootScope', function(obfus_$compile, obfus_$rootScope) {}])
 *    ).toEqual(['$compile', '$rootScope']);
 * ```
 *
 * @param {Function|Array.<string|Function>} fn Function for which dependent service names need to
 * be retrieved as described above.
 *
 * @param {boolean=} [strictDi=false] Disallow argument name annotation inference.
 *
 * @returns {Array.<string>} The names of the services which the function requires.
 */




/**
 * @ngdoc service
 * @name $provide
 *
 * @description
 *
 * The {@link auto.$provide $provide} service has a number of methods for registering components
 * with the {@link auto.$injector $injector}. Many of these functions are also exposed on
 * {@link angular.Module}.
 *
 * An Angular **service** is a singleton object created by a **service factory**.  These **service
 * factories** are functions which, in turn, are created by a **service provider**.
 * The **service providers** are constructor functions. When instantiated they must contain a
 * property called `$get`, which holds the **service factory** function.
 *
 * When you request a service, the {@link auto.$injector $injector} is responsible for finding the
 * correct **service provider**, instantiating it and then calling its `$get` **service factory**
 * function to get the instance of the **service**.
 *
 * Often services have no configuration options and there is no need to add methods to the service
 * provider.  The provider will be no more than a constructor function with a `$get` property. For
 * these cases the {@link auto.$provide $provide} service has additional helper methods to register
 * services without specifying a provider.
 *
 * * {@link auto.$provide#provider provider(name, provider)} - registers a **service provider** with the
 *     {@link auto.$injector $injector}
 * * {@link auto.$provide#constant constant(name, obj)} - registers a value/object that can be accessed by
 *     providers and services.
 * * {@link auto.$provide#value value(name, obj)} - registers a value/object that can only be accessed by
 *     services, not providers.
 * * {@link auto.$provide#factory factory(name, fn)} - registers a service **factory function**
 *     that will be wrapped in a **service provider** object, whose `$get` property will contain the
 *     given factory function.
 * * {@link auto.$provide#service service(name, Fn)} - registers a **constructor function**
 *     that will be wrapped in a **service provider** object, whose `$get` property will instantiate
 *      a new object using the given constructor function.
 * * {@link auto.$provide#decorator decorator(name, decorFn)} - registers a **decorator function** that
 *      will be able to modify or replace the implementation of another service.
 *
 * See the individual methods for more information and examples.
 */

/**
 * @ngdoc method
 * @name $provide#provider
 * @description
 *
 * Register a **provider function** with the {@link auto.$injector $injector}. Provider functions
 * are constructor functions, whose instances are responsible for "providing" a factory for a
 * service.
 *
 * Service provider names start with the name of the service they provide followed by `Provider`.
 * For example, the {@link ng.$log $log} service has a provider called
 * {@link ng.$logProvider $logProvider}.
 *
 * Service provider objects can have additional methods which allow configuration of the provider
 * and its service. Importantly, you can configure what kind of service is created by the `$get`
 * method, or how that service will act. For example, the {@link ng.$logProvider $logProvider} has a
 * method {@link ng.$logProvider#debugEnabled debugEnabled}
 * which lets you specify whether the {@link ng.$log $log} service will log debug messages to the
 * console or not.
 *
 * @param {string} name The name of the instance. NOTE: the provider will be available under `name +
                        'Provider'` key.
 * @param {(Object|function())} provider If the provider is:
 *
 *   - `Object`: then it should have a `$get` method. The `$get` method will be invoked using
 *     {@link auto.$injector#invoke $injector.invoke()} when an instance needs to be created.
 *   - `Constructor`: a new instance of the provider will be created using
 *     {@link auto.$injector#instantiate $injector.instantiate()}, then treated as `object`.
 *
 * @returns {Object} registered provider instance

 * @example
 *
 * The following example shows how to create a simple event tracking service and register it using
 * {@link auto.$provide#provider $provide.provider()}.
 *
 * ```js
 *  // Define the eventTracker provider
 *  function EventTrackerProvider() {
 *    var trackingUrl = '/track';
 *
 *    // A provider method for configuring where the tracked events should been saved
 *    this.setTrackingUrl = function(url) {
 *      trackingUrl = url;
 *    };
 *
 *    // The service factory function
 *    this.$get = ['$http', function($http) {
 *      var trackedEvents = {};
 *      return {
 *        // Call this to track an event
 *        event: function(event) {
 *          var count = trackedEvents[event] || 0;
 *          count += 1;
 *          trackedEvents[event] = count;
 *          return count;
 *        },
 *        // Call this to save the tracked events to the trackingUrl
 *        save: function() {
 *          $http.post(trackingUrl, trackedEvents);
 *        }
 *      };
 *    }];
 *  }
 *
 *  describe('eventTracker', function() {
 *    var postSpy;
 *
 *    beforeEach(module(function($provide) {
 *      // Register the eventTracker provider
 *      $provide.provider('eventTracker', EventTrackerProvider);
 *    }));
 *
 *    beforeEach(module(function(eventTrackerProvider) {
 *      // Configure eventTracker provider
 *      eventTrackerProvider.setTrackingUrl('/custom-track');
 *    }));
 *
 *    it('tracks events', inject(function(eventTracker) {
 *      expect(eventTracker.event('login')).toEqual(1);
 *      expect(eventTracker.event('login')).toEqual(2);
 *    }));
 *
 *    it('saves to the tracking url', inject(function(eventTracker, $http) {
 *      postSpy = spyOn($http, 'post');
 *      eventTracker.event('login');
 *      eventTracker.save();
 *      expect(postSpy).toHaveBeenCalled();
 *      expect(postSpy.mostRecentCall.args[0]).not.toEqual('/track');
 *      expect(postSpy.mostRecentCall.args[0]).toEqual('/custom-track');
 *      expect(postSpy.mostRecentCall.args[1]).toEqual({ 'login': 1 });
 *    }));
 *  });
 * ```
 */

/**
 * @ngdoc method
 * @name $provide#factory
 * @description
 *
 * Register a **service factory**, which will be called to return the service instance.
 * This is short for registering a service where its provider consists of only a `$get` property,
 * which is the given service factory function.
 * You should use {@link auto.$provide#factory $provide.factory(getFn)} if you do not need to
 * configure your service in a provider.
 *
 * @param {string} name The name of the instance.
 * @param {Function|Array.<string|Function>} $getFn The injectable $getFn for the instance creation.
 *                      Internally this is a short hand for `$provide.provider(name, {$get: $getFn})`.
 * @returns {Object} registered provider instance
 *
 * @example
 * Here is an example of registering a service
 * ```js
 *   $provide.factory('ping', ['$http', function($http) {
 *     return function ping() {
 *       return $http.send('/ping');
 *     };
 *   }]);
 * ```
 * You would then inject and use this service like this:
 * ```js
 *   someModule.controller('Ctrl', ['ping', function(ping) {
 *     ping();
 *   }]);
 * ```
 */


/**
 * @ngdoc method
 * @name $provide#service
 * @description
 *
 * Register a **service constructor**, which will be invoked with `new` to create the service
 * instance.
 * This is short for registering a service where its provider's `$get` property is a factory
 * function that returns an instance instantiated by the injector from the service constructor
 * function.
 *
 * Internally it looks a bit like this:
 *
 * ```
 * {
 *   $get: function() {
 *     return $injector.instantiate(constructor);
 *   }
 * }
 * ```
 *
 *
 * You should use {@link auto.$provide#service $provide.service(class)} if you define your service
 * as a type/class.
 *
 * @param {string} name The name of the instance.
 * @param {Function|Array.<string|Function>} constructor An injectable class (constructor function)
 *     that will be instantiated.
 * @returns {Object} registered provider instance
 *
 * @example
 * Here is an example of registering a service using
 * {@link auto.$provide#service $provide.service(class)}.
 * ```js
 *   var Ping = function($http) {
 *     this.$http = $http;
 *   };
 *
 *   Ping.$inject = ['$http'];
 *
 *   Ping.prototype.send = function() {
 *     return this.$http.get('/ping');
 *   };
 *   $provide.service('ping', Ping);
 * ```
 * You would then inject and use this service like this:
 * ```js
 *   someModule.controller('Ctrl', ['ping', function(ping) {
 *     ping.send();
 *   }]);
 * ```
 */


/**
 * @ngdoc method
 * @name $provide#value
 * @description
 *
 * Register a **value service** with the {@link auto.$injector $injector}, such as a string, a
 * number, an array, an object or a function. This is short for registering a service where its
 * provider's `$get` property is a factory function that takes no arguments and returns the **value
 * service**. That also means it is not possible to inject other services into a value service.
 *
 * Value services are similar to constant services, except that they cannot be injected into a
 * module configuration function (see {@link angular.Module#config}) but they can be overridden by
 * an Angular {@link auto.$provide#decorator decorator}.
 *
 * @param {string} name The name of the instance.
 * @param {*} value The value.
 * @returns {Object} registered provider instance
 *
 * @example
 * Here are some examples of creating value services.
 * ```js
 *   $provide.value('ADMIN_USER', 'admin');
 *
 *   $provide.value('RoleLookup', { admin: 0, writer: 1, reader: 2 });
 *
 *   $provide.value('halfOf', function(value) {
 *     return value / 2;
 *   });
 * ```
 */


/**
 * @ngdoc method
 * @name $provide#constant
 * @description
 *
 * Register a **constant service** with the {@link auto.$injector $injector}, such as a string,
 * a number, an array, an object or a function. Like the {@link auto.$provide#value value}, it is not
 * possible to inject other services into a constant.
 *
 * But unlike {@link auto.$provide#value value}, a constant can be
 * injected into a module configuration function (see {@link angular.Module#config}) and it cannot
 * be overridden by an Angular {@link auto.$provide#decorator decorator}.
 *
 * @param {string} name The name of the constant.
 * @param {*} value The constant value.
 * @returns {Object} registered instance
 *
 * @example
 * Here a some examples of creating constants:
 * ```js
 *   $provide.constant('SHARD_HEIGHT', 306);
 *
 *   $provide.constant('MY_COLOURS', ['red', 'blue', 'grey']);
 *
 *   $provide.constant('double', function(value) {
 *     return value * 2;
 *   });
 * ```
 */


/**
 * @ngdoc method
 * @name $provide#decorator
 * @description
 *
 * Register a **decorator function** with the {@link auto.$injector $injector}. A decorator function
 * intercepts the creation of a service, allowing it to override or modify the behavior of the
 * service. The return value of the decorator function may be the original service, or a new service
 * that replaces (or wraps and delegates to) the original service.
 *
 * You can find out more about using decorators in the {@link guide/decorators} guide.
 *
 * @param {string} name The name of the service to decorate.
 * @param {Function|Array.<string|Function>} decorator This function will be invoked when the service needs to be
 *    provided and should return the decorated service instance. The function is called using
 *    the {@link auto.$injector#invoke injector.invoke} method and is therefore fully injectable.
 *    Local injection arguments:
 *
 *    * `$delegate` - The original service instance, which can be replaced, monkey patched, configured,
 *      decorated or delegated to.
 *
 * @example
 * Here we decorate the {@link ng.$log $log} service to convert warnings to errors by intercepting
 * calls to {@link ng.$log#error $log.warn()}.
 * ```js
 *   $provide.decorator('$log', ['$delegate', function($delegate) {
 *     $delegate.warn = $delegate.error;
 *     return $delegate;
 *   }]);
 * ```
 */


function createInjector(modulesToLoad, strictDi) {
  strictDi = (strictDi === true);
  var INSTANTIATING = {},
      providerSuffix = 'Provider',
      path = [],
      loadedModules = new HashMap([], true),
      providerCache = {
        $provide: {
            provider: supportObject(provider),
            factory: supportObject(factory),
            service: supportObject(service),
            value: supportObject(value),
            constant: supportObject(constant),
            decorator: decorator
          }
      },
      providerInjector = (providerCache.$injector =
          createInternalInjector(providerCache, function(serviceName, caller) {
            if (angular.isString(caller)) {
              path.push(caller);
            }
            throw $injectorMinErr('unpr', "Unknown provider: {0}", path.join(' <- '));
          })),
      instanceCache = {},
      protoInstanceInjector =
          createInternalInjector(instanceCache, function(serviceName, caller) {
            var provider = providerInjector.get(serviceName + providerSuffix, caller);
            return instanceInjector.invoke(
                provider.$get, provider, undefined, serviceName);
          }),
      instanceInjector = protoInstanceInjector;

  providerCache['$injector' + providerSuffix] = { $get: valueFn(protoInstanceInjector) };
  var runBlocks = loadModules(modulesToLoad);
  instanceInjector = protoInstanceInjector.get('$injector');
  instanceInjector.strictDi = strictDi;
  forEach(runBlocks, function(fn) { if (fn) instanceInjector.invoke(fn); });

  return instanceInjector;

  ////////////////////////////////////
  // $provider
  ////////////////////////////////////

  function supportObject(delegate) {
    return function(key, value) {
      if (isObject(key)) {
        forEach(key, reverseParams(delegate));
      } else {
        return delegate(key, value);
      }
    };
  }

  function provider(name, provider_) {
    assertNotHasOwnProperty(name, 'service');
    if (isFunction(provider_) || isArray(provider_)) {
      provider_ = providerInjector.instantiate(provider_);
    }
    if (!provider_.$get) {
      throw $injectorMinErr('pget', "Provider '{0}' must define $get factory method.", name);
    }
    return providerCache[name + providerSuffix] = provider_;
  }

  function enforceReturnValue(name, factory) {
    return function enforcedReturnValue() {
      var result = instanceInjector.invoke(factory, this);
      if (isUndefined(result)) {
        throw $injectorMinErr('undef', "Provider '{0}' must return a value from $get factory method.", name);
      }
      return result;
    };
  }

  function factory(name, factoryFn, enforce) {
    return provider(name, {
      $get: enforce !== false ? enforceReturnValue(name, factoryFn) : factoryFn
    });
  }

  function service(name, constructor) {
    return factory(name, ['$injector', function($injector) {
      return $injector.instantiate(constructor);
    }]);
  }

  function value(name, val) { return factory(name, valueFn(val), false); }

  function constant(name, value) {
    assertNotHasOwnProperty(name, 'constant');
    providerCache[name] = value;
    instanceCache[name] = value;
  }

  function decorator(serviceName, decorFn) {
    var origProvider = providerInjector.get(serviceName + providerSuffix),
        orig$get = origProvider.$get;

    origProvider.$get = function() {
      var origInstance = instanceInjector.invoke(orig$get, origProvider);
      return instanceInjector.invoke(decorFn, null, {$delegate: origInstance});
    };
  }

  ////////////////////////////////////
  // Module Loading
  ////////////////////////////////////
  function loadModules(modulesToLoad) {
    assertArg(isUndefined(modulesToLoad) || isArray(modulesToLoad), 'modulesToLoad', 'not an array');
    var runBlocks = [], moduleFn;
    forEach(modulesToLoad, function(module) {
      if (loadedModules.get(module)) return;
      loadedModules.put(module, true);

      function runInvokeQueue(queue) {
        var i, ii;
        for (i = 0, ii = queue.length; i < ii; i++) {
          var invokeArgs = queue[i],
              provider = providerInjector.get(invokeArgs[0]);

          provider[invokeArgs[1]].apply(provider, invokeArgs[2]);
        }
      }

      try {
        if (isString(module)) {
          moduleFn = angularModule(module);
          runBlocks = runBlocks.concat(loadModules(moduleFn.requires)).concat(moduleFn._runBlocks);
          runInvokeQueue(moduleFn._invokeQueue);
          runInvokeQueue(moduleFn._configBlocks);
        } else if (isFunction(module)) {
            runBlocks.push(providerInjector.invoke(module));
        } else if (isArray(module)) {
            runBlocks.push(providerInjector.invoke(module));
        } else {
          assertArgFn(module, 'module');
        }
      } catch (e) {
        if (isArray(module)) {
          module = module[module.length - 1];
        }
        if (e.message && e.stack && e.stack.indexOf(e.message) == -1) {
          // Safari & FF's stack traces don't contain error.message content
          // unlike those of Chrome and IE
          // So if stack doesn't contain message, we create a new string that contains both.
          // Since error.stack is read-only in Safari, I'm overriding e and not e.stack here.
          /* jshint -W022 */
          e = e.message + '\n' + e.stack;
        }
        throw $injectorMinErr('modulerr', "Failed to instantiate module {0} due to:\n{1}",
                  module, e.stack || e.message || e);
      }
    });
    return runBlocks;
  }

  ////////////////////////////////////
  // internal Injector
  ////////////////////////////////////

  function createInternalInjector(cache, factory) {

    function getService(serviceName, caller) {
      if (cache.hasOwnProperty(serviceName)) {
        if (cache[serviceName] === INSTANTIATING) {
          throw $injectorMinErr('cdep', 'Circular dependency found: {0}',
                    serviceName + ' <- ' + path.join(' <- '));
        }
        return cache[serviceName];
      } else {
        try {
          path.unshift(serviceName);
          cache[serviceName] = INSTANTIATING;
          return cache[serviceName] = factory(serviceName, caller);
        } catch (err) {
          if (cache[serviceName] === INSTANTIATING) {
            delete cache[serviceName];
          }
          throw err;
        } finally {
          path.shift();
        }
      }
    }


    function injectionArgs(fn, locals, serviceName) {
      var args = [],
          $inject = createInjector.$$annotate(fn, strictDi, serviceName);

      for (var i = 0, length = $inject.length; i < length; i++) {
        var key = $inject[i];
        if (typeof key !== 'string') {
          throw $injectorMinErr('itkn',
                  'Incorrect injection token! Expected service name as string, got {0}', key);
        }
        args.push(locals && locals.hasOwnProperty(key) ? locals[key] :
                                                         getService(key, serviceName));
      }
      return args;
    }

    function isClass(func) {
      // IE 9-11 do not support classes and IE9 leaks with the code below.
      if (msie <= 11) {
        return false;
      }
      // Support: Edge 12-13 only
      // See: https://developer.microsoft.com/en-us/microsoft-edge/platform/issues/6156135/
      return typeof func === 'function'
        && /^(?:class\b|constructor\()/.test(stringifyFn(func));
    }

    function invoke(fn, self, locals, serviceName) {
      if (typeof locals === 'string') {
        serviceName = locals;
        locals = null;
      }

      var args = injectionArgs(fn, locals, serviceName);
      if (isArray(fn)) {
        fn = fn[fn.length - 1];
      }

      if (!isClass(fn)) {
        // http://jsperf.com/angularjs-invoke-apply-vs-switch
        // #5388
        return fn.apply(self, args);
      } else {
        args.unshift(null);
        return new (Function.prototype.bind.apply(fn, args))();
      }
    }


    function instantiate(Type, locals, serviceName) {
      // Check if Type is annotated and use just the given function at n-1 as parameter
      // e.g. someModule.factory('greeter', ['$window', function(renamed$window) {}]);
      var ctor = (isArray(Type) ? Type[Type.length - 1] : Type);
      var args = injectionArgs(Type, locals, serviceName);
      // Empty object at position 0 is ignored for invocation with `new`, but required.
      args.unshift(null);
      return new (Function.prototype.bind.apply(ctor, args))();
    }


    return {
      invoke: invoke,
      instantiate: instantiate,
      get: getService,
      annotate: createInjector.$$annotate,
      has: function(name) {
        return providerCache.hasOwnProperty(name + providerSuffix) || cache.hasOwnProperty(name);
      }
    };
  }
}

createInjector.$$annotate = annotate;

/**
 * @ngdoc provider
 * @name $anchorScrollProvider
 *
 * @description
 * Use `$anchorScrollProvider` to disable automatic scrolling whenever
 * {@link ng.$location#hash $location.hash()} changes.
 */
function $AnchorScrollProvider() {

  var autoScrollingEnabled = true;

  /**
   * @ngdoc method
   * @name $anchorScrollProvider#disableAutoScrolling
   *
   * @description
   * By default, {@link ng.$anchorScroll $anchorScroll()} will automatically detect changes to
   * {@link ng.$location#hash $location.hash()} and scroll to the element matching the new hash.<br />
   * Use this method to disable automatic scrolling.
   *
   * If automatic scrolling is disabled, one must explicitly call
   * {@link ng.$anchorScroll $anchorScroll()} in order to scroll to the element related to the
   * current hash.
   */
  this.disableAutoScrolling = function() {
    autoScrollingEnabled = false;
  };

  /**
   * @ngdoc service
   * @name $anchorScroll
   * @kind function
   * @requires $window
   * @requires $location
   * @requires $rootScope
   *
   * @description
   * When called, it scrolls to the element related to the specified `hash` or (if omitted) to the
   * current value of {@link ng.$location#hash $location.hash()}, according to the rules specified
   * in the
   * [HTML5 spec](http://www.w3.org/html/wg/drafts/html/master/browsers.html#an-indicated-part-of-the-document).
   *
   * It also watches the {@link ng.$location#hash $location.hash()} and automatically scrolls to
   * match any anchor whenever it changes. This can be disabled by calling
   * {@link ng.$anchorScrollProvider#disableAutoScrolling $anchorScrollProvider.disableAutoScrolling()}.
   *
   * Additionally, you can use its {@link ng.$anchorScroll#yOffset yOffset} property to specify a
   * vertical scroll-offset (either fixed or dynamic).
   *
   * @param {string=} hash The hash specifying the element to scroll to. If omitted, the value of
   *                       {@link ng.$location#hash $location.hash()} will be used.
   *
   * @property {(number|function|jqLite)} yOffset
   * If set, specifies a vertical scroll-offset. This is often useful when there are fixed
   * positioned elements at the top of the page, such as navbars, headers etc.
   *
   * `yOffset` can be specified in various ways:
   * - **number**: A fixed number of pixels to be used as offset.<br /><br />
   * - **function**: A getter function called everytime `$anchorScroll()` is executed. Must return
   *   a number representing the offset (in pixels).<br /><br />
   * - **jqLite**: A jqLite/jQuery element to be used for specifying the offset. The distance from
   *   the top of the page to the element's bottom will be used as offset.<br />
   *   **Note**: The element will be taken into account only as long as its `position` is set to
   *   `fixed`. This option is useful, when dealing with responsive navbars/headers that adjust
   *   their height and/or positioning according to the viewport's size.
   *
   * <br />
   * <div class="alert alert-warning">
   * In order for `yOffset` to work properly, scrolling should take place on the document's root and
   * not some child element.
   * </div>
   *
   * @example
     <example module="anchorScrollExample">
       <file name="index.html">
         <div id="scrollArea" ng-controller="ScrollController">
           <a ng-click="gotoBottom()">Go to bottom</a>
           <a id="bottom"></a> You're at the bottom!
         </div>
       </file>
       <file name="script.js">
         angular.module('anchorScrollExample', [])
           .controller('ScrollController', ['$scope', '$location', '$anchorScroll',
             function ($scope, $location, $anchorScroll) {
               $scope.gotoBottom = function() {
                 // set the location.hash to the id of
                 // the element you wish to scroll to.
                 $location.hash('bottom');

                 // call $anchorScroll()
                 $anchorScroll();
               };
             }]);
       </file>
       <file name="style.css">
         #scrollArea {
           height: 280px;
           overflow: auto;
         }

         #bottom {
           display: block;
           margin-top: 2000px;
         }
       </file>
     </example>
   *
   * <hr />
   * The example below illustrates the use of a vertical scroll-offset (specified as a fixed value).
   * See {@link ng.$anchorScroll#yOffset $anchorScroll.yOffset} for more details.
   *
   * @example
     <example module="anchorScrollOffsetExample">
       <file name="index.html">
         <div class="fixed-header" ng-controller="headerCtrl">
           <a href="" ng-click="gotoAnchor(x)" ng-repeat="x in [1,2,3,4,5]">
             Go to anchor {{x}}
           </a>
         </div>
         <div id="anchor{{x}}" class="anchor" ng-repeat="x in [1,2,3,4,5]">
           Anchor {{x}} of 5
         </div>
       </file>
       <file name="script.js">
         angular.module('anchorScrollOffsetExample', [])
           .run(['$anchorScroll', function($anchorScroll) {
             $anchorScroll.yOffset = 50;   // always scroll by 50 extra pixels
           }])
           .controller('headerCtrl', ['$anchorScroll', '$location', '$scope',
             function ($anchorScroll, $location, $scope) {
               $scope.gotoAnchor = function(x) {
                 var newHash = 'anchor' + x;
                 if ($location.hash() !== newHash) {
                   // set the $location.hash to `newHash` and
                   // $anchorScroll will automatically scroll to it
                   $location.hash('anchor' + x);
                 } else {
                   // call $anchorScroll() explicitly,
                   // since $location.hash hasn't changed
                   $anchorScroll();
                 }
               };
             }
           ]);
       </file>
       <file name="style.css">
         body {
           padding-top: 50px;
         }

         .anchor {
           border: 2px dashed DarkOrchid;
           padding: 10px 10px 200px 10px;
         }

         .fixed-header {
           background-color: rgba(0, 0, 0, 0.2);
           height: 50px;
           position: fixed;
           top: 0; left: 0; right: 0;
         }

         .fixed-header > a {
           display: inline-block;
           margin: 5px 15px;
         }
       </file>
     </example>
   */
  this.$get = ['$window', '$location', '$rootScope', function($window, $location, $rootScope) {
    var document = $window.document;

    // Helper function to get first anchor from a NodeList
    // (using `Array#some()` instead of `angular#forEach()` since it's more performant
    //  and working in all supported browsers.)
    function getFirstAnchor(list) {
      var result = null;
      Array.prototype.some.call(list, function(element) {
        if (nodeName_(element) === 'a') {
          result = element;
          return true;
        }
      });
      return result;
    }

    function getYOffset() {

      var offset = scroll.yOffset;

      if (isFunction(offset)) {
        offset = offset();
      } else if (isElement(offset)) {
        var elem = offset[0];
        var style = $window.getComputedStyle(elem);
        if (style.position !== 'fixed') {
          offset = 0;
        } else {
          offset = elem.getBoundingClientRect().bottom;
        }
      } else if (!isNumber(offset)) {
        offset = 0;
      }

      return offset;
    }

    function scrollTo(elem) {
      if (elem) {
        elem.scrollIntoView();

        var offset = getYOffset();

        if (offset) {
          // `offset` is the number of pixels we should scroll UP in order to align `elem` properly.
          // This is true ONLY if the call to `elem.scrollIntoView()` initially aligns `elem` at the
          // top of the viewport.
          //
          // IF the number of pixels from the top of `elem` to the end of the page's content is less
          // than the height of the viewport, then `elem.scrollIntoView()` will align the `elem` some
          // way down the page.
          //
          // This is often the case for elements near the bottom of the page.
          //
          // In such cases we do not need to scroll the whole `offset` up, just the difference between
          // the top of the element and the offset, which is enough to align the top of `elem` at the
          // desired position.
          var elemTop = elem.getBoundingClientRect().top;
          $window.scrollBy(0, elemTop - offset);
        }
      } else {
        $window.scrollTo(0, 0);
      }
    }

    function scroll(hash) {
      hash = isString(hash) ? hash : $location.hash();
      var elm;

      // empty hash, scroll to the top of the page
      if (!hash) scrollTo(null);

      // element with given id
      else if ((elm = document.getElementById(hash))) scrollTo(elm);

      // first anchor with given name :-D
      else if ((elm = getFirstAnchor(document.getElementsByName(hash)))) scrollTo(elm);

      // no element and hash == 'top', scroll to the top of the page
      else if (hash === 'top') scrollTo(null);
    }

    // does not scroll when user clicks on anchor link that is currently on
    // (no url change, no $location.hash() change), browser native does scroll
    if (autoScrollingEnabled) {
      $rootScope.$watch(function autoScrollWatch() {return $location.hash();},
        function autoScrollWatchAction(newVal, oldVal) {
          // skip the initial scroll if $location.hash is empty
          if (newVal === oldVal && newVal === '') return;

          jqLiteDocumentLoaded(function() {
            $rootScope.$evalAsync(scroll);
          });
        });
    }

    return scroll;
  }];
}

var $animateMinErr = minErr('$animate');
var ELEMENT_NODE = 1;
var NG_ANIMATE_CLASSNAME = 'ng-animate';

function mergeClasses(a,b) {
  if (!a && !b) return '';
  if (!a) return b;
  if (!b) return a;
  if (isArray(a)) a = a.join(' ');
  if (isArray(b)) b = b.join(' ');
  return a + ' ' + b;
}

function extractElementNode(element) {
  for (var i = 0; i < element.length; i++) {
    var elm = element[i];
    if (elm.nodeType === ELEMENT_NODE) {
      return elm;
    }
  }
}

function splitClasses(classes) {
  if (isString(classes)) {
    classes = classes.split(' ');
  }

  // Use createMap() to prevent class assumptions involving property names in
  // Object.prototype
  var obj = createMap();
  forEach(classes, function(klass) {
    // sometimes the split leaves empty string values
    // incase extra spaces were applied to the options
    if (klass.length) {
      obj[klass] = true;
    }
  });
  return obj;
}

// if any other type of options value besides an Object value is
// passed into the $animate.method() animation then this helper code
// will be run which will ignore it. While this patch is not the
// greatest solution to this, a lot of existing plugins depend on
// $animate to either call the callback (< 1.2) or return a promise
// that can be changed. This helper function ensures that the options
// are wiped clean incase a callback function is provided.
function prepareAnimateOptions(options) {
  return isObject(options)
      ? options
      : {};
}

var $$CoreAnimateJsProvider = function() {
  this.$get = noop;
};

// this is prefixed with Core since it conflicts with
// the animateQueueProvider defined in ngAnimate/animateQueue.js
var $$CoreAnimateQueueProvider = function() {
  var postDigestQueue = new HashMap();
  var postDigestElements = [];

  this.$get = ['$$AnimateRunner', '$rootScope',
       function($$AnimateRunner,   $rootScope) {
    return {
      enabled: noop,
      on: noop,
      off: noop,
      pin: noop,

      push: function(element, event, options, domO