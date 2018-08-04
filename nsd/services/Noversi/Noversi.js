// Noversi.js
// Description:
// "Noversi.js" is a online reversi NOOXY service.
// Copyright 2018 NOOXY. All Rights Reserved.
'use strict';

let sqlite3 = require('sqlite3');
let Utils = require('./utilities');

// database obj for accessing database of authenticity.
let Noversidb = function () {
  let _database = null;
  let _cacheduser = {};

  this.MaxCacheSize = 1000; //Users

  function User(userid) {

    this.loadbyUserIdsql = (userid, next) => {

      // sql statement
      let sql = 'SELECT userid, email, gender, phonenumber, birthday, country, address, aboutme FROM users WHERE userid = ?';

      _database.get(sql, [userid], (err, row) => {
        if(err || typeof(row) == 'undefined') {
          this.userid = userid;
          this.exisitence = false;
        }
        else {
          this.exisitence = true;
          this.userid = row.userid;
          this.email = row.email;
          this.gender = row.gender;
          this.phonenumber = row.phonenumber;
          this.birthday = row.birthday;
          this.country = row.country;
          this.address = row.address;
          this.aboutme = row.aboutme;
        }
        next(false);
      })

    };

    // write newest information of user to database.
    this.updatesql = (callback) => {
      let sql = null;
      let err = null;
      if(typeof(this.userid)=='undefined') {
        callback(new Error('userid undefined.'));
      }
      else {
        let datenow = Utils.DatetoSQL(new Date());
        if(this.exisitence) {
          sql = 'UPDATE users SET userid=?, email=?, gender=?, phonenumber=?, birthday=?, country=?, address=?, aboutme=?, modifydate=? WHERE userid=?';
          _database.run(sql, [this.userid, this.email, this.gender, this.phonenumber, this.birthday, this.country, this.address, this.aboutme, datenow, this.userid], (err) => {
            if(err) {
              callback(err);
            }
            else {
              this.exisitence = true;
              callback(false);
            }
          });
        }
        else {
          sql = 'INSERT INTO users(userid, email, gender, phonenumber, birthday, country, address, aboutme, modifydate) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?);'
          _database.run(sql, [this.userid, this.email, this.gender, this.phonenumber, this.birthday, this.country, this.address, this.aboutme, datenow], (err) => {
            if(err) {
              callback(err);
            }
            else {
              this.exisitence = true;
              callback(false);
            }
          });
        }
      }
    };

    // delete the user from database.
    this.delete = (callback) => {
      _database.run('DELETE FROM users WHERE userid=?;', [this.userid], callback)
      this.exisitence = false;
      this.userid = null;
      this.email = null;
      this.gender = null;
      this.phonenumber = null;
      this.birthday = null;
      this.country = null;
      this.address = null;
      this.aboutme = null;
    };
  }

  function Match(userid) {

    this.loadbyUserIdsql = (userid, next) => {

      // sql statement
      let sql = 'SELECT userid, email, gender, phonenumber, birthday, country, address, aboutme FROM users WHERE userid = ?';

      _database.get(sql, [userid], (err, row) => {
        if(err || typeof(row) == 'undefined') {
          this.userid = userid;
          this.exisitence = false;
        }
        else {
          this.exisitence = true;
          this.userid = row.userid;
          this.email = row.email;
          this.gender = row.gender;
          this.phonenumber = row.phonenumber;
          this.birthday = row.birthday;
          this.country = row.country;
          this.address = row.address;
          this.aboutme = row.aboutme;
        }
        next(false);
      })

    };

    // write newest information of user to database.
    this.updatesql = (callback) => {
      let sql = null;
      let err = null;
      if(typeof(this.userid)=='undefined') {
        callback(new Error('userid undefined.'));
      }
      else {
        let datenow = Utils.DatetoSQL(new Date());
        if(this.exisitence) {
          sql = 'UPDATE users SET userid=?, email=?, gender=?, phonenumber=?, birthday=?, country=?, address=?, aboutme=?, modifydate=? WHERE userid=?';
          _database.run(sql, [this.userid, this.email, this.gender, this.phonenumber, this.birthday, this.country, this.address, this.aboutme, datenow, this.userid], (err) => {
            if(err) {
              callback(err);
            }
            else {
              this.exisitence = true;
              callback(false);
            }
          });
        }
        else {
          sql = 'INSERT INTO users(userid, email, gender, phonenumber, birthday, country, address, aboutme, modifydate) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?);'
          _database.run(sql, [this.userid, this.email, this.gender, this.phonenumber, this.birthday, this.country, this.address, this.aboutme, datenow], (err) => {
            if(err) {
              callback(err);
            }
            else {
              this.exisitence = true;
              callback(false);
            }
          });
        }
      }
    };

    // delete the user from database.
    this.delete = (callback) => {
      _database.run('DELETE FROM users WHERE userid=?;', [this.userid], callback)
      this.exisitence = false;
      this.userid = null;
      this.email = null;
      this.gender = null;
      this.phonenumber = null;
      this.birthday = null;
      this.country = null;
      this.address = null;
      this.aboutme = null;
    };
  }

  this.importDatabase = (path) => {
    _database = new sqlite3.Database(path);
  };

  this.createDatabase = (path) => {
    _database = new sqlite3.Database(path);
    let expiredate = Utils.DatetoSQL(Utils.addDays(new Date(), 7));
    _database.run('CREATE TABLE users(userid TEXT, rating INTEGER, wincount INTEGER, phonenumber VARCHAR(50), birthday date, country VARCHAR(160), address text, aboutme text, modifydate datetime)');
  };

  this.getUserbyId = (userid, callback) => {
    let user = new User();
    user.loadbyUserIdsql(userid, (err)=>{
      if(typeof(_cacheduser[user.userid]) == 'undefined') {
          _cacheduser[userid] = user;
      }
      callback(err, _cacheduser[userid]);
    });
  };

  this.close = ()=>{
    _cacheduser = null;
    _database.close();
    _database = null;
  };
}

// the noversi module
function Noversi() {

  const _Noversidb = new Noversidb();
  // Declare parameters
  let defaultkey="NNNNNNNNNNNNNNNNNNNNNNNNNNNBANNNNNNABNNNNNNNNNNNNNNNNNNNNNNNNNNN";
  let matches = {};
  let userstatuslist = {};
  let queueduser = [];
  let operation_timeout = 10000;

  let python_drop_chess = (key, position, row, col , callback)=>{
    let spawn = require("child_process").spawn;
    let pythonProcess = spawn('python3',['./python/drop_chess.py', key, position, row, col], {cwd: __dirname});
    pythonProcess.stdout.on('data', (b) => {
      let data = b.toString('utf8');
      console.log(data);
    // Do something with the data returned from python script
      if(data.split(' ')[0] == 'OK') {
        callback(false, {
          key: data.split(' ')[1],
          p1: parseInt(data.split(' ')[2]),
          p2: parseInt(data.split(' ')[3]),
        });
      }
      else {
        callback(true);
      }
      pythonProcess.kill('SIGINT');
    });
    pythonProcess.stderr.on('data', (data) => {
      // As said before, convert the Uint8Array to a readable string.
      console.log(data.toString('utf8'));
    });
  }

  let python_can_set = (key, position, callback)=>{

  }

  let python_ai = (key, position, callback)=>{

  }

  let updatematch = (match) => {
    this.onMatchUpdate(match.p1, {
      game: {
        me: 0,
        turn: match.turn,
        p1: {
          name: match.p1,
          score: match.p1p,
        },
        p2: {
          name: match.p2,
          score: match.p2p,
        },
        key: match.key
      },
      m: 'all',
      s: 'Opponent\'s turn.'
    });
    this.onMatchUpdate(match.p2, {
      game: {
        me: 1,
        turn: match.turn,
        p1: {
          name: match.p1,
          score: match.p1p,
        },
        p2: {
          name: match.p2,
          score: match.p2p,
        },
        key: match.key
      },
      m: 'all',
      s: 'Opponent\'s turn.'
    });
  };

  // import database from specified path
  this.importDatabase = (path) => {
    _Noversidb.importDatabase(path);
  };

  // create a new database for noversi.
  this.createDatabase = (path) => {
    _Noversidb.createDatabase(path);
  };

  this.getMatchMeta = (matchid, callback) => {
    _Noversidb.getMatchbyId(matchid, (err, match) => {
      let match_meta = {
        matchid: match.matchid,
        p1: match.p1,
        p2: match.p2,
        winner : match.winner,
        history : JSON.parse(match.history),
        date: match.date
      }
      callback(false, match_meta);
    });
  };

  this.getUserMeta = (userid, callback) => {
    _Noversidb.getUserbyId(userid, (err, user) => {
      let user_meta = {
        userid: user.userid,
        rating: user.rating,
        win : user.win,
        lose : user.lose,
        history : JSON.parse(user.history)
      }
      callback(false, user_meta);
    });
  };

  this.joinMatch = (userid) => {
    if(!Object.keys(userstatuslist).includes(userid)) {
      let matchid = Utils.generateGUID();
      if(queueduser.length) {
        let match = {
          id: matchid,
          p1: queueduser.pop(),
          p2: userid,
          p1p: 2,
          p2p: 2,
          turn: 0,
          key: defaultkey,
          history: []
        };
        userstatuslist[match.p1] = {matchid:matchid, position: 0};
        userstatuslist[match.p2] = {matchid:matchid, position: 1};
        matches[matchid] = match;
        let keyold = match.key;
        updatematch(match);
        setTimeout(()=>{
          if(match.key == keyold) {
            this.quitMatch(match.p1);
          }
        }, operation_timeout*2);
        return {matchid:matchid, status:'OK'};
      }
      else {
        queueduser.push(userid);
        userstatuslist[userid] = null;
        return {matchid:matchid, status:'Waiting for a match.'};
      }

    }
    else {
      return {matchid:null, status:'User already in a match.'};
    }
  };

  this.dropChess = (userid, row, col, callback) => {
    let userstatus = userstatuslist[userid];
    let matchid = userstatus.matchid;
    let userposition = userstatus.position;
    if(matchid) {
      let match = matches[matchid];
      if(match.turn == userposition) {
        if(userposition==0){
          python_drop_chess(match.key, 1, row, col, (err, json)=>{
            if(err) {
              callback(false, {s:'Cannot set here.'});
            }
            else {
              callback(false, {s:'OK'});
              match.history = match.history.concat([[userposition, match.key, row, col]]);
              match.key = json.key;
              match.p1p = json.p1;
              match.p2p = json.p2;
              match.turn = match.turn?0:1;
              let keyold = match.key;
              updatematch(match);
              setTimeout(()=>{
                if(match.key == keyold) {
                  this.quitMatch(match.p2);
                }
              }, operation_timeout);
            }
          });
        }
        else {
          python_drop_chess(match.key, -1, row, col, (err, json)=>{
            if(err) {
              callback(false, {s:'Cannot set here.'});
            }
            else {
              callback(false, {s:'OK'});
              match.history = match.history.concat([[userposition, match.key, row, col]]);
              match.key = json.key;
              match.p1p = json.p1;
              match.p2p = json.p2;
              match.turn = match.turn?0:1;
              let keyold = match.key;
              updatematch(match);
              setTimeout(()=>{
                if(match.key == keyold) {
                  this.quitMatch(match.p1);
                }
              }, operation_timeout);
            }
          });
        }
      }
      else {
        callback(false, {s:'Not your turn.'});
      }
    }
    else {
      callback(false, {s:'You aren\'t in any match.'});
    }
  };

  this.quitMatch = (userid) =>{
    if(Object.keys(userstatuslist).includes(userid)&&userstatuslist[userid].matchid!=null) {
      let matchid = userstatuslist[userid].matchid;
      let match = matches[matchid];
      try {
        let p1s, p2s;
        if(userid==match.p1) {
          p1s = 'You Lose.';
          p2s = 'You Win.';
        }
        else {
          p2s = 'You Lose.';
          p1s = 'You Win.';
        }
        delete userstatuslist[match.p1];
        delete userstatuslist[match.p2];
        delete matches[matchid];

        this.onMatchUpdate(match.p1, {
          game: {
            me: 0,
            turn: -1,
            p1: {
              score: 0
            },
            p2: {
              score: 0
            },
            key: defaultkey
          },
          m: 'board',
          s: p1s,
          end: true
        });
        this.onMatchUpdate(match.p2, {
          game: {
            me: 1,
            turn: -1,
            p1: {
              score: 0
            },
            p2: {
              score: 0
            },
            key: defaultkey
          },
          m: 'board',
          s: p2s,
          end: true
        });

      }
      catch (e) {

      }

    }

  };

  this.onMatchUpdate = (userid, json) =>{
    console.log('onMatchUpdate not implemented.');
  };

  this.deleteUser = (userid, callback) => {
    _Noversidb.getUserbyId(userid, (err, user) => {
      user.delete();
      callback(false);
    });
  };

  this.close = () => {
    _Noversidb.close();
  };

};
module.exports = Noversi;
