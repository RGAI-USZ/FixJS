function() {
  var Users = new Schema({
    username: { type: String , index: {unique: true}},
    password: String
  });
  
  var Connections = new Schema({
    user: String,
    hostname: String,
    port: Number,
    ssl: Boolean,
    rejoin: Boolean,
    away: String,
    realName: String,
    selfSigned: Boolean,
    channels: [String],
    nick: String,
    password: String
  });
  
  var Messages = new Schema({
    linkedto: String,
    channel: String,
    server: String,
    user: String,
    message: String,
    date: { type: Date, default: Date.now }
  });
  
  mongoose.model('User', Users);
  mongoose.model('Connection', Connections);
  mongoose.model('Message', Messages);
}