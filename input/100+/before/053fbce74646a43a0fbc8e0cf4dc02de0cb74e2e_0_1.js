function MuxDemux () {

  function createID() {
    return (
      Math.random().toString(16).slice(2) +
      Math.random().toString(16).slice(2)
    )
  }

  var streams = {}, streamCount = 0
  var md = es.through(function (data) {
    var id = data.shift()
    var event = data[0]
    var s = streams[id]
    if(!s) {
      if(event != 'new')
        return md.emit('error', new Error('does not have stream:' + id))
      md.emit('connection', createStream(id, data[1].meta, data[1].opts))
    } 
    else if (event === 'pause')
      s.paused = true
    else if (event === 'resume') {
      var p = s.paused
      s.paused = false
      if(p) s.emit('drain')
    }
    else {
      s.emit.apply(s, data)
    }
  })


  md.once('close', function () {
    var err = new Error ('unexpected disconnection')
    for (var i in streams) {
      var s = streams[i]
      s.emit('error', err)
      s.destroy()
    } 
  })

  function createStream(id, meta, opts) {
    var s = es.through(function (data) {
      if(!this.writable)
        throw new Error('stream is not writable')
      md.emit('data', [s.id, 'data', data])
    }, function () {
      md.emit('data', [s.id, 'end']) 
    })
    s.pause = function () {
      md.emit('data', [s.id, 'pause'])
    }
    s.resume = function () {
      md.emit('data', [s.id, 'resume'])
    } 
    s.once('close', function () {
      md.emit('data', [s.id, 'close'])
      delete streams[id]
    })
    s.writable = opts.writable
    s.readable = opts.readable
    streams[s.id = id] = s
    s.meta = meta
    return s 
  }

  var outer = es.connect(es.split(), es.parse(), md, es.stringify())
  if(md !== outer)
    md.on('connection', function (stream) {
      outer.emit('connection', stream)
    })

  outer.createStream = function (meta, opts) {
    opts = opts || {writable: true, readable: true}
    var s = createStream(createID(), meta, opts)
    var _opts = {writable: opts.readable, readable: opts.writable}
    md.emit('data', [s.id, 'new', {meta: meta, opts: _opts}]) 
    return s
  }
  outer.createWriteStream = function (meta) {
    return outer.createStream(meta, {writable: true, readable: false})
  }
  outer.createReadStream = function (meta) {
    return outer.createStream(meta, {writable: false, readable: true})
  }

  return outer
}