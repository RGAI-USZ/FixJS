function (path, port) {
  var project = new (require('../project'))(path)
    , port = parseInt(port || 3000, 10)

  /**
   * GUI will not be launched if the path is not within an initialized project
   */

  if (!project.exists()) {
    console.error('\n   You are not within an initiliazed project\n')
    process.exit(0)
  }

  // Pre-conditions

  app.param('title', routes.title)

  // Routes

  app.get('/', routes.tasks)
  app.get('/task/:title', routes.task)
  app.get('/docs', routes.docs)
  app.post('/', routes.tasks)

  // Make server listen for incoming requests

  app.listen(port)
  console.log('\n   Go to http://localhost:'+port+'/')

  // Kill gui gracefully with ^C

  process.stdin.resume()
  process.stdin.setRawMode(true)
  process.stdin.on('keypress', function(c, key) {
    if (key && key.ctrl && 'c' === key.name) {
      console.log('\n   See you!\n')
      process.exit()
    }
  }).resume()
}