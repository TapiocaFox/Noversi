"use strict";

let _NSc = new NSc();
String.prototype.replaceAll = function(search, replacement) {
    var target = this;
    return target.replace(new RegExp(search, 'g'), replacement);
};
$(()=>{
  let updateTable = (rows)=>{
    $("#noversi-history-table tr").remove();
    $('#noversi-history-table > tbody:last-child').append('<tr><th>Matchid</th><th>Player0</th><th>Player1</th><th>Winner</th><th>Step</th><th>Board</th><th>Turn</th><th>DropRow</th>  <th>DropCol</th><th>Date</th></tr>');
    for(let i in rows) {
      let board = '';
      for(let j=0; j<8; j++) {
        board = board + rows[i].boardkey.slice(j*8, (j+1)*8)+'<br>';
      }
      board = board.replaceAll('A', '<span style="color:#1E88E5">A</span>');
      board = board.replaceAll('B', '<span style="color:#D81B60">B</span>');
      board = board.replaceAll('N', '<span style="color:#455A64">N</span>');
      $('#noversi-history-table > tbody:last-child').append('<tr><th>'+
      rows[i].matchid
      +'</th><th>'+
      rows[i].p1
      +'</th><th>'+
      rows[i].p2
      +'</th><th>'+
      rows[i].winner
      +'</th><th>'+
      rows[i].step
      +'</th><th>'+
      board
      +'</th><th>'+
      rows[i].turn
      +'</th><th>'+
      rows[i].droprow
      +'</th><th>'+
      rows[i].dropcol
      +'</th><th>'+
      rows[i].date
      +'</th></tr>');
    };
  };
  let loading = ()=>{
    $("#noversi-history-table tr").remove();
    $('#noversi-history-table > tbody:last-child').append('<tr><th>loading...</th></tr>');
  };
  let updateUserMeta = (uname, meta)=>{
    $("#username").html(uname);
    $("#user-rating").html(meta.r);
    $("#user-win").html(meta.win);
  };
  _NSc.connect('127.0.0.1', 'WebSocket');
  _NSc.createActivitySocket('Noversi', (err, as)=>{
    let update_user = (username)=>{
      as.call('getHistory', {u: username}, (err, json)=>{
        updateTable(json);
      });
      as.call('getUserMeta', {u: username}, (err, json)=>{
        updateUserMeta(username, json);
      });
    };
    loading();
    update_user(_NSc.returnUserName());
    let input = $('#search-input');
    $('#searchform').submit(()=> {
      if (input.val() != '') {
          let username = input.val();
          loading();
          update_user(username);
          input.val('');
      }
      return false;
    });
  });
})
