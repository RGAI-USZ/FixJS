function(data) {
              if (page !== "users/profile") {
                cache.set(page, data, {
                  ┬ásecondsToLive: 10 * 60
                });
              }
              return callback(data);
            }