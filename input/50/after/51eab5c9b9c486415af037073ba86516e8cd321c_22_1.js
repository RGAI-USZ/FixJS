function(milliseconds, callback) {
  if (typeof milliseconds === 'function') {
    return callback(new Error('Error: not a valid time to wait'));
  }else {
    setTimeout(callback, milliseconds);
  }
}