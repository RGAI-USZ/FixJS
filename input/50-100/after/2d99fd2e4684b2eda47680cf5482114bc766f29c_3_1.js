function(){
          var cb, __i, __ref, __len, __yet, __results = [];
          for (__yet = true, __i = 0, __len = (__ref = $callbacks).length; __i < __len; ++__i) {
            cb = __ref[__i];
            __yet = false;
            __results.push(cb.apply(this, arguments));
          } if (__yet) {
            return $queue.push(arguments);
          }
          return __results;
        }