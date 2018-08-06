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
  let _default_rating = 1000;

  this.MaxCacheSize = 1000; //Users

  function User(userid) {

    this.loadbyUserIdsql = (userid, next) => {
      // sql statement
      let sql = 'SELECT userid, rating, wincount FROM users WHERE userid = ?';

      _database.get(sql, [userid], (err, row) => {
        if(err || typeof(row) == 'undefined') {
          this.userid = userid;
          this.rating = _default_rating;
          this.wincount = 0;
          this.exisitence = false;
        }
        else {
          this.exisitence = true;
          this.userid = row.userid;
          this.rating = row.rating;
          this.wincount = row.wincount;
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
          sql = 'UPDATE users SET userid=?, rating=?, wincount=?, modifydate=? WHERE userid=?';
          _database.run(sql, [this.userid, this.rating, this.wincount, datenow, this.userid], (err) => {
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
          sql = 'INSERT INTO users(userid, rating, wincount, modifydate) VALUES (?, ?, ?, ?);'
          _database.run(sql, [this.userid, this.rating, this.wincount, datenow], (err) => {
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
      this.rating = null;
      this.wincount = null;
    };
  }

  this.addHistory = (matchid, p1, p2, winner, step, boardkey, turn, row, col, callback)=>{
    let datenow = Utils.DatetoSQL(new Date());
    let sql = 'INSERT INTO history(matchid, p1, p2, winner, step, boardkey, turn, droprow, dropcol, date) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?);'
    _database.run(sql, [matchid, p1, p2, winner, step, boardkey, turn, row, col, datenow], (err) => {
      if(err) {
        callback(err);
      }
      else {
        callback(false);
      }
    });
  };

  this.getUserHistory = (userid, callback)=> {
    let sql = 'select * from history where p1 like ? or p2 like ?;';
    _database.all(sql, [userid, userid], (err, rows)=>{
      callback(err, rows);
    });
  }

  this.importDatabase = (path) => {
    _database = new sqlite3.Database(path);
  };

  this.createDatabase = (path) => {
    _database = new sqlite3.Database(path);
    let expiredate = Utils.DatetoSQL(Utils.addDays(new Date(), 7));
    _database.run('CREATE TABLE users(userid TEXT, rating FLOAT, wincount INTEGER, modifydate DATE)');
    _database.run('CREATE TABLE history(matchid VARCHAR(320), p1 VARCHAR(320), p2 VARCHAR(320), winner VARCHAR(320), step INTEGER, boardkey VARCHAR(128), turn INTEGER, droprow INTEGER, dropcol INTEGER, date DATE)');
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

  const noversidb = new Noversidb();
  // Declare parameters
  let defaultkey="NNNNNNNNNNNNNNNNNNNNNNNNNNNBANNNNNNABNNNNNNNNNNNNNNNNNNNNNNNNNNN";
  let matches = {};
  let userstatuslist = {};
  let queueduser = [];
  let operation_timeout = 20000;
  let waiting_timeout = 8000;
  let ai_max_waiting_time = 3000;
  let ai_emoji_p = 0.15;
  let emojies = ['😀','😋','😭','🤔','😡'];
  let ai_names = [];
  let ai_pending = [];

  let python_drop_chess = (key, position, row, col , callback)=>{
    let spawn = require("child_process").spawn;
    let pythonProcess = spawn('python3',['./python/drop_chess.py', key, position, row, col], {cwd: __dirname});
    pythonProcess.stdout.on('data', (b) => {
      let data = b.toString('utf8');
    // Do something with the data returned from python script
      if(data.split(' ')[0] == 'OK') {
        callback(false, {
          key: data.split(' ')[1],
          p1: parseInt(data.split(' ')[2]),
          p2: parseInt(data.split(' ')[3]),
          turn: parseInt(data.split(' ')[4])
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

  let python_ai = (key, position, callback)=>{

      let spawn = require("child_process").spawn;
      let pythonProcess = spawn('python3',['./python/ai.py', key, position], {cwd: __dirname});
      pythonProcess.stdout.on('data', (b) => {
        let data = b.toString('utf8');
      // Do something with the data returned from python script
        if(data.split(' ')[0] == 'OK') {
          callback(false, {
            row: parseInt(data.split(' ')[1]),
            col: parseInt(data.split(' ')[2])
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

  let ai_drop_chess = (ai_name) => {
    // Mimic human
    setTimeout(()=>{
      try {
        let matchid = userstatuslist[ai_name].matchid;
        let match = matches[matchid];
        let key = match.key;
        let position = userstatuslist[ai_name].position;
        python_ai(key, position==0?1:-1, (err, json)=>{
          this.dropChess(ai_name, json.row, json.col, (e)=> {
          });
        });
        // Ai emoji
        if(Math.random()<ai_emoji_p) {
          setTimeout(()=>{
            this.chat(ai_name, emojies[Math.floor(Math.random() * Math.floor(emojies.length))]);
          }, Math.floor(Math.random() * Math.floor(ai_max_waiting_time*2)));
        }
      }
      catch(e) {
        console.log(e);
      }

    }, Math.floor(Math.random() * Math.floor(ai_max_waiting_time)));
  }

  let updatematch = (match) => {
    noversidb.getUserbyId(ai_names.includes(match.p1)?'NoversiAI':match.p1, (err, user1)=>{
      noversidb.getUserbyId(ai_names.includes(match.p2)?'NoversiAI':match.p2, (err, user2)=>{
        this.onMatchUpdate(match.p1, {
          game: {
            me: 0,
            turn: match.turn,
            p1: {
              name: match.p1,
              score: match.p1p,
              r: user1.rating,
              w: user1.wincount
            },
            p2: {
              name: match.p2,
              score: match.p2p,
              r: user2.rating,
              w: user2.wincount
            },
            key: match.key,
            r: match.history.length?(match.history[match.history.length-1])[2]:null,
            c: match.history.length?(match.history[match.history.length-1])[3]:null
          },
          m: 'all',
          s: 'Opponent is thinking.'
        });
        this.onMatchUpdate(match.p2, {
          game: {
            me: 1,
            turn: match.turn,
            p1: {
              name: match.p1,
              score: match.p1p,
              r: user1.rating,
              w: user1.wincount
            },
            p2: {
              name: match.p2,
              score: match.p2p,
              r: user2.rating,
              w: user2.wincount
            },
            key: match.key,
            r: match.history.length?(match.history[match.history.length-1])[2]:null,
            c: match.history.length?(match.history[match.history.length-1])[3]:null
          },
          m: 'all',
          s: 'Opponent is thinking.'
        });
      });
    });

  };

  this.getUserHistory = (userid, callback)=> {
    noversidb.getUserHistory(userid, callback);
  }

  this.RatingAlgo = (p1win, p1rating, p2rating)=> {
    let k = 100;
    let p1p = (1.0/(1.0+Math.pow(10, ((p2rating-p1rating)/400))));
    let p2p = 1- p1p;
    let sum = p1rating+p2rating;
    let p1r = Math.floor(p1rating+k*(p1win-p1p));
    let p2r = sum - p1r;
    return {
      p1: p1r,
      p2: p2r
    }
  }

  this.importAINames = (list) => {
    ai_names = list.slice();
    ai_pending = list.slice();
  }

  this.chat = (userid, content) => {
    if(Object.keys(userstatuslist).includes(userid)&&userstatuslist[userid].matchid!=null) {
      let matchid = userstatuslist[userid].matchid;
      let match = matches[matchid];
      this.onChat(match.p1, userid, content);
      this.onChat(match.p2, userid, content);
    }
  };

  // import database from specified path
  this.importDatabase = (path) => {
    noversidb.importDatabase(path);
  };

  // create a new database for noversi.
  this.createDatabase = (path) => {
    noversidb.createDatabase(path);
  };

  this.getMatchMeta = (matchid, callback) => {
    noversidb.getMatchbyId(matchid, (err, match) => {
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
    noversidb.getUserbyId(userid, (err, user) => {
      let user_meta = {
        r: user.rating,
        win : user.wincount
      }
      callback(false, user_meta);
    });
  };

  this.joinMatch = (userid) => {
    if(userstatuslist[userid]==null) {
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
          if(matches[matchid]) {
            if(matches[matchid].history.length == 0) {
              this.quitMatch(match.p1);
            }
          }
        }, operation_timeout*1.5);
        return {matchid:matchid, status:'OK'};
      }
      else {
        queueduser.push(userid);
        userstatuslist[userid] = {matchid:'pending'};
        let pairAI = () =>{
          setTimeout(()=>{
            if(userstatuslist[userid]!=null) {
              if(userstatuslist[userid].matchid == 'pending') {
                if(ai_pending.length) {
                  queueduser.splice(queueduser.indexOf(userid), 1);
                  let p1n, p2n;
                  let aifirst = false;
                  let aiidx = Math.floor(Math.random() * Math.floor(ai_pending.length));
                  if(Math.floor(Math.random() * Math.floor(2))) {
                    p1n = userid;
                    p2n = ai_pending[aiidx];
                    ai_pending.slice(aiidx);
                  }
                  else {
                    p2n = userid;
                    p1n = ai_pending[aiidx];
                    ai_pending.slice(aiidx);
                    aifirst = true;
                  }
                  let match = {
                    id: matchid,
                    p1: p1n,
                    p2: p2n,
                    p1p: 2,
                    p2p: 2,
                    turn: 0,
                    key: defaultkey,
                    history: []
                  };
                  userstatuslist[match.p1] = {matchid:matchid, position: 0};
                  userstatuslist[match.p2] = {matchid:matchid, position: 1};
                  matches[matchid] = match;
                  updatematch(match);
                  if(aifirst) {
                    ai_drop_chess(match.p1);
                  }
                  setTimeout(()=>{
                    if(matches[matchid]) {
                      if(matches[matchid].history.length == 0) {
                        this.quitMatch(match.p1);
                      }
                    }
                  }, operation_timeout*1.5);
                }
                else {
                  pairAI();
                }
              }
            }
          }, waiting_timeout);
        }
        pairAI();
        return {matchid:matchid, status:'Searching opponent. Be patient'};
      }
    }
    else {
      return {matchid:null, status:'User already in a match.'};
    }
  };

  this.dropChess = (userid, row, col, callback) => {
    let userstatus = userstatuslist[userid];
    if(userstatus) {
      let matchid = userstatus.matchid;
      let userposition = userstatus.position;

      if(matchid) {
        let match = matches[matchid];
        let checkai = (turn)=>{
            if(ai_names.includes(match.p1)&&turn==0) {
              ai_drop_chess(match.p1);
            }
            else if (ai_names.includes(match.p2)&&turn==1) {
              ai_drop_chess(match.p2);
            }
        }

        if(match.turn == userposition) {
          if(userposition==0){
            python_drop_chess(match.key, 1, row, col, (err, json)=>{
              if(err) {
                callback(false, {s:'Cannot set here.'});
              }
              else {
                callback(false, {s:'OK'});
                match.history = match.history.concat([[match.key, userposition, row, col]]);
                match.key = json.key;
                match.p1p = json.p1;
                match.p2p = json.p2;
                if(json.turn == 0) {
                  match.turn = -1;
                }
                else {
                  match.turn = json.turn==1?0:1;
                }
                let hislen = match.history.length;
                updatematch(match);
                if(json.turn==0) {
                  if(json.p1==json.p2) {
                    this.quitMatch(match.p1, 1);
                  }
                  else if(json.p1>json.p2) {
                    this.quitMatch(match.p2);
                  }
                  else {
                    this.quitMatch(match.p1);
                  }
                }
                else {
                  checkai(match.turn);
                  setTimeout(()=>{
                    if(matches[matchid]) {
                      if(matches[matchid].history.length == hislen) {
                        if(match.turn==0) {
                          this.quitMatch(match.p1);
                        }
                        else {
                          this.quitMatch(match.p2);
                        }
                      }
                    };
                  }, operation_timeout);
                }
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
                match.history = match.history.concat([[match.key, userposition, row, col]]);
                match.key = json.key;
                match.p1p = json.p1;
                match.p2p = json.p2;
                if(json.turn == 0) {
                  match.turn = -1;
                }
                else {
                  match.turn = json.turn==1?0:1;
                }
                let hislen = match.history.length;
                updatematch(match);
                if(json.turn==0) {
                  if(json.p1==json.p2) {
                    this.quitMatch(match.p1, 1);
                  }
                  else if(json.p1>json.p2) {
                    this.quitMatch(match.p2);
                  }
                  else {
                    this.quitMatch(match.p1);
                  }
                }
                else {
                  checkai(match.turn);
                  setTimeout(()=>{
                    if(matches[matchid]) {
                      if(matches[matchid].history.length == hislen) {
                        if(match.turn==0) {
                          this.quitMatch(match.p1);
                        }
                        else {
                          this.quitMatch(match.p2);
                        }
                      }
                    };
                  }, operation_timeout);
                }
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
    }
    else {
      callback(false, {s:'You aren\'t in any match.'});
    }
  };

  this.quitMatch = (userid, draw) =>{
    // To slove unknown err
    setTimeout(()=>{
      if(Object.keys(userstatuslist).includes(userid)||ai_names.includes(userid)) {
        if(userstatuslist[userid]!=null||ai_names.includes(userid)) {
          let matchid = userstatuslist[userid].matchid;
          let match = matches[matchid];
          try {
            let p1s, p2s, p1win, aiidx=-1, winnerid;
            if(userid==match.p1) {
              p1s = 'You Lose.';
              p2s = 'You Win.';
              p1win = 0;
              winnerid=ai_names.includes(match.p2)?'NoversiAI':match.p2;
            }
            else {
              p2s = 'You Lose.';
              p1s = 'You Win.';
              p1win = 1;
              winnerid=ai_names.includes(match.p1)?'NoversiAI':match.p1;
            }
            if(draw) {
              p2s = 'Draw.';
              p1s = 'Draw.';
              p1win = 0.5;
              winnerid= null;
            }

            if(ai_names.includes(match.p1)) {
              ai_pending.push(match.p1);
              aiidx = 0;
            }
            if(ai_names.includes(match.p2)) {
              ai_pending.push(match.p2);
              aiidx = 1;
            }

            let user1dbname = aiidx==0?'NoversiAI':match.p1;
            let user2dbname = aiidx==1?'NoversiAI':match.p2;
            noversidb.getUserbyId(user1dbname, (err, user1)=>{
              noversidb.getUserbyId(user2dbname, (err, user2)=>{
                let ratings = this.RatingAlgo(p1win, user1.rating, user2.rating);
                user1.rating = ratings.p1;
                user2.rating = ratings.p2;
                if(p1win == 1) {
                  user1.wincount += 1;
                }
                else if (p1win == 0) {
                  user2.wincount += 1;
                }
                user1.updatesql(()=>{});
                user2.updatesql(()=>{});
                let step = 0;
                let loop = ()=>{
                  if(step<match.history.length) {
                    noversidb.addHistory(match.id, user1dbname, user2dbname, winnerid, step, (match.history[step])[0], (match.history[step])[1], (match.history[step])[2], (match.history[step])[3], ()=>{
                      step++;
                      loop();
                    });
                  }
                }
                loop();
              });
            });


            this.onMatchUpdate(match.p1, {
              game: {
                me: 0,
                turn: -1,
                p1: {
                  score: match.p1p
                },
                p2: {
                  score: match.p2p
                },
                key: match.key
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
                  score: match.p1p
                },
                p2: {
                  score: match.p2p
                },
                key: match.key
              },
              m: 'board',
              s: p2s,
              end: true
            });
            delete userstatuslist[match.p1];
            delete userstatuslist[match.p2];
            matches[matchid].history == [];
            matches[matchid].key == null;
            delete matches[matchid];
          }
          catch (e) {
            console.log(e);
            this.onMatchUpdate(userid, {
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
              s: 'Match ended.',
              end: true
            });
            queueduser.splice(queueduser.indexOf(userid), 1);
            delete userstatuslist[userid];
          }
        }
      }
    }, 100);

  };

  this.onMatchUpdate = (userid, json) =>{
    console.log('onMatchUpdate not implemented.');
  };

  this.onChat = (userid, json) =>{
    console.log('onChat not implemented.');
  };

  this.deleteUser = (userid, callback) => {
    noversidb.getUserbyId(userid, (err, user) => {
      user.delete();
      callback(false);
    });
  };

  this.close = () => {
    noversidb.close();
  };

};
module.exports = Noversi;
