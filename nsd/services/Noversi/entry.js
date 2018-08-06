// NSF/services/youservice/entry.js
// Description:
// "youservice/entry.js" description.
// Copyright 2018 NOOXY. All Rights Reserved.

let files_path;
let settings;
let Noversi = require('./Noversi');
// Your service entry point
function start(api) {
  let noversi = new Noversi();
  // Get the service socket of your service
  let ss = api.Service.ServiceSocket;
  // BEWARE! To prevent callback error crash the system.
  // If you call an callback function which is not API provided. Such as setTimeout(callback, timeout).
  // You need to wrap the callback funciton by api.SafeCallback.
  // E.g. setTimeout(api.SafeCallback(callback), timeout)
  let safec = api.SafeCallback;
  // Please save and manipulate your files in this directory
  files_path = api.Me.FilesPath;
  // Your settings in manifest file.
  settings = api.Me.Settings;

  // Access another service on this daemon
  let admin_daemon_asock = api.Service.ActivitySocket.createDefaultAdminDeamonSocket('Another Service', (err, activitysocket)=> {
    // accessing other service
  });

  let ai_names = ['littleboy', 'fatman', 'kamikaze', 'jerry', 'moji', 'miko', 'taiwanvalue', 'noowyee', 'yves', 'youknowwhoiam', 'ganninia', 'nihaoma', 'tiger', 'hitler', 'anny'];
  let userid_entityids = {};

  noversi.importAINames(ai_names);

  let getname = (p1name, p2name, callback) => {
    if(!ai_names.includes(p1name)) {
      api.Authenticity.getUsernamebyId(p1name, (err, p1n)=>{
        if(!ai_names.includes(p2name)) {
          api.Authenticity.getUsernamebyId(p2name, (err, p2n)=>{
            callback(p1n, p2n);
          });
        }
        else {
          callback(p1n, p2name);
        }
      });
    }else {
      api.Authenticity.getUsernamebyId(p2name, (err, p2n)=>{
        callback(p1name, p2n);
      });
    }
  };

  noversi.onMatchUpdate = (userid, json) => {
    let sendall = ()=>{
      let entityids = userid_entityids[userid];
      for(let i in entityids) {
        try {
          ss.sendData(entityids[i], json);
        } catch (e) {

        }
      }
    };
    if(json.m == 'all') {
      getname(json.game.p1.name, json.game.p2.name, safec((p1n, p2n)=>{
        json.game.p1.name = p1n;
        json.game.p2.name = p2n;
        sendall();
      }));
    }
    else {
      sendall();
    }
  }

  noversi.onChat = (userid, emitter, chat) => {
    api.Authenticity.getUsernamebyId(emitter, (err, name)=>{
      if(ai_names.includes(emitter)) {
        name = emitter;
      }
      let data = {
        m: 'chat',
        c: name+': '+chat
      }
      let sendall = ()=>{
        let entityids = userid_entityids[userid];
        for(let i in entityids) {
          try {
            ss.sendData(entityids[i], data);
          } catch (e) {
          }
        }
      };
      sendall();
    });
  }

  // JSONfunction is a function that can be defined, which others entities can call.
  // It is a NOOXY Service Framework Standard
  ss.def('joinMatch', (json, entityID, returnJSON)=>{

    // Return Value for JSONfunction call. Otherwise remote will not recieve funciton return value.
    let json_be_returned = {
      s: ''
    }
    // Get Username and process your work.
    let username = api.Service.Entity.returnEntityOwner(entityID);
      api.Authorization.Authby.Token(entityID, (err, pass)=>{
        if(pass) {
          let userid = null;
          // Get userid from API
          api.Authenticity.getUserID(username, (err, id) => {
            if(userid_entityids[id]) {
              if(!userid_entityids[id].includes(entityID)) {
                userid_entityids[id] = userid_entityids[id].concat([entityID]);
              }
            }
            else {
              userid_entityids[id] = [entityID];
            }
            let result = noversi.joinMatch(id);
            returnJSON(false, {s:result.status});
          });
        }

      });
  });

  ss.def('dropChess', (json, entityID, returnJSON)=>{

    // Return Value for JSONfunction call. Otherwise remote will not recieve funciton return value.
    let json_be_returned = {
      s: ''
    }
    // Get Username and process your work.
    let username = api.Service.Entity.returnEntityOwner(entityID);

      api.Authorization.Authby.Token(entityID, (err, pass)=>{
        if(pass) {
          let userid = null;
          // Get userid from API
          api.Authenticity.getUserID(username, (err, id) => {
            noversi.dropChess(id, json.r, json.c, safec((err, json)=>{
              returnJSON(false, json);
            }));
          });
        }
      });
  });

  ss.def('chat', (json, entityID, returnJSON)=>{

    // Return Value for JSONfunction call. Otherwise remote will not recieve funciton return value.
    let json_be_returned = {
      s: ''
    }
    // Get Username and process your work.
    let username = api.Service.Entity.returnEntityOwner(entityID);
      api.Authorization.Authby.Token(entityID, (err, pass)=>{
        if(pass) {
          let userid = null;
          // Get userid from API
          api.Authenticity.getUserID(username, (err, id) => {
            noversi.chat(id, json.c);
          });
        }

      });
  });

  ss.def('quitMatch', (json, entityID, returnJSON)=>{

    // Return Value for JSONfunction call. Otherwise remote will not recieve funciton return value.
    let json_be_returned = {
      s: ''
    }
    // Get Username and process your work.
    let username = api.Service.Entity.returnEntityOwner(entityID);
      api.Authorization.Authby.Token(entityID, (err, pass)=>{
        if(pass) {
          let userid = null;
          // Get userid from API
          api.Authenticity.getUserID(username, (err, id) => {
            noversi.quitMatch(id);
          });
        }

      });
  });

  // Safe define a JSONfunction.
  ss.sdef('SafeJSONfunction', (json, entityID, returnJSON)=>{
    // Code here for JSONfunciton
    // Return Value for JSONfunction call. Otherwise remote will not recieve funciton return value.
    let json_be_returned = {
      d: 'Hello! NOOXY Service Framework!'
    }
    // First parameter for error, next is JSON to be returned.
    returnJSON(false, json_be_returned);
  },
  // In case fail.
  ()=>{
    console.log('Auth Failed.');
  });

  // ServiceSocket.onData, in case client send data to this Service.
  // You will need entityID to Authorize remote user. And identify remote.
  ss.onData = (entityID, data) => {
    // Get Username and process your work.
    let username = api.Service.Entity.returnEntityOwner(entityID);
    // To store your data and associated with userid INSEAD OF USERNAME!!!
    // Since userid can be promised as a unique identifer!!!
    let userid = null;
    // Get userid from API
    api.Authenticity.getUserID(username, (err, id) => {
      userid = id;
    });
    // process you operation here
    console.log('recieve a data');
    console.log(data);
  }
  // Send data to client.
  // ss.sendData('A entity ID', 'My data to be transfer.');
  // ServiceSocket.onConnect, in case on new connection.
  ss.onConnect = (entityID, callback) => {
    // Do something.
    // report error;
    callback(false);
  }
  // ServiceSocket.onClose, in case connection close.
  ss.onClose = (entityID, callback) => {
    // Get Username and process your work.
    let username = api.Service.Entity.returnEntityOwner(entityID);
    // Get userid from API
    api.Authenticity.getUserID(username, (err, id) => {
      let entityids = userid_entityids[id];
      entityids.splice(entityids.indexOf(entityID), 1);
      noversi.quitMatch(id);
      callback(false);
    });
    // process you operation here
    // report error;

  }
}

// If the daemon stop, your service recieve close signal here.
function close() {
  // Saving state of you service.
  // Please save and manipulate your files in this directory
}

// Export your work for system here.
module.exports = {
  start: start,
  close: close
}
