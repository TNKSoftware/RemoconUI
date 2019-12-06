// Based on string-format Copyright (c) 2018 David Chambers

export var formatString = function(template){
  var args = Array.prototype.slice.call(arguments, 1);
  var idx = 0;
  var state = 'UNDEFINED';

  return template.replace(/([{}])\1|[{](.*?)(?:!(.+?))?[}]/g,
    function(match, literal, _key, xf){
      if (literal != null) return literal;

      var key = _key;
      if (key.length > 0) {
        if (state === 'IMPLICIT') {
          throw new Error('cannot switch from implicit to explicit numbering');
        }
        state = 'EXPLICIT';
      } else {
        if (state === 'EXPLICIT') {
          throw new Error('cannot switch from explicit to implicit numbering');
        }
        state = 'IMPLICIT';
        key = String(idx);
        idx += 1;
      }

      var path = key.split('.'), transformers;
      var value = (/^\d+$/.test(path[0]) ? path : ['0'].concat(path))
        .reduce(function(maybe, key) {
          return maybe.reduce(function(_, x) {
            return x != null && key in Object(x) ?
              [typeof x[key] === 'function' ? x[key]() : x[key]] : [];
          }, []);
        }, [args]).reduce (function(_, x){ return x; }, '');
      
      if (xf == null) {
        return value;
      } else if (Object.prototype.hasOwnProperty.call(transformers, xf)){
        return transformers[xf](value);
      } else {
        throw new Error('no transformer named "' + xf + '"');
      }
    }
  );
}