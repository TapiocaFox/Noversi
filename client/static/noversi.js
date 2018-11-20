uuid = ""
havepass = 0
function initmap() {
  x=document.getElementById('reversi-map-1');
  let inner = "";
  for (let x=0; x<8; x++) {
    for (let y=0; y<8; y++) {
      if((x+y)%2) {
        inner=inner+'<div id="r'+x+'c'+y+'" onclick="drop('+x+', '+y+')" class="reversi-map-block-0"> </div>';
      }
      else {
        inner=inner+'<div id="r'+x+'c'+y+'" onclick="drop('+x+', '+y+')" class="reversi-map-block"> </div>';
      }

    }
  }
  x.innerHTML = inner;
};

function guid() {
  return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
    s4() + '-' + s4() + s4() + s4();
}

function s4() {
  return Math.floor((1 + Math.random()) * 0x10000)
    .toString(16)
    .substring(1);
}
function reversi_turn_red_em (id) {
  x=document.getElementById(id);
  x.innerHTML = "<div class=\"reversi-map-red-em\"></div>";
}
function reversi_turn_red (id) {
  x=document.getElementById(id);
  x.innerHTML = "<div class=\"reversi-map-red\"></div>";
}
function reversi_turn_blue (id) {
  x=document.getElementById(id);
  x.innerHTML = "<div class=\"reversi-map-blue\"></div>";
}
function reversi_turn_red_em (id) {
  x=document.getElementById(id);
  x.innerHTML = "<div class=\"reversi-map-red-em\"></div>";
}
function reversi_turn_blue_em (id) {
  x=document.getElementById(id);
  x.innerHTML = "<div class=\"reversi-map-blue-em\"></div>";
}
function reversi_turn_none (id) {
  x=document.getElementById(id);
  x.innerHTML = " ";
}
function set_right_point (point) {
  x=document.getElementById("point-right");
  x.innerHTML =point;
}
function set_left_point (point) {
  x=document.getElementById("point-left");
  x.innerHTML =point;
}
function set_p1_meta (name, rating, win) {
  document.getElementById("p1-username").innerHTML =name;
  document.getElementById("p1-rating").innerHTML =rating;
  document.getElementById("p1-win").innerHTML =win;
}
function set_p2_meta (name, rating, win) {
  document.getElementById("p2-username").innerHTML =name;
  document.getElementById("p2-rating").innerHTML =rating;
  document.getElementById("p2-win").innerHTML =win;
}
function flash(status) {
  flasher=document.getElementById("flash");
  flasher.classList.remove("style-hidden");
  box=document.getElementById("flash-status-box");
  box.classList.remove("style-hidden");
  document.getElementById("flash-status").innerHTML = status;
  setTimeout(()=>{
    box=document.getElementById("flash-status-box");
    box.classList.add("style-hidden");
    flasher.classList.add("style-hidden");
  }, 450);
}
function close_coverer() {
  coverer=document.getElementById("coverer");
  coverer_loader=document.getElementById("coverer-loader");
  coverer.classList.add("style-hidden");
  coverer_loader.classList.add("style-hidden");
}
function open_coverer(status) {
  coverer=document.getElementById("coverer");
  coverer.classList.remove("style-hidden");
  coverer_loader=document.getElementById("coverer-loader");
  coverer_loader.classList.remove("style-hidden");
  document.getElementById("status").innerHTML = status;
}
function draw_map (key) {
  for (let x=0; x<8; x++) {
    for (let y=0; y<8; y++) {
      switch (key[x*8+y]) {
        case 'A':
          reversi_turn_blue("r"+(x)+"c"+(y));
          break;
        case 'B':
          reversi_turn_red("r"+(x)+"c"+(y));
          break;
        case 'N':
          reversi_turn_none("r"+(x)+"c"+(y));
          break;
      }
    }
  }
}

let as;
function drop (r, c) {
  as.call('dropChess', {r:r, c:c}, (err, json)=>{
    flash(json.s);
  });
}
function chat (string) {
  as.call('chat', {c:string}, (err, json)=>{
    flash(string);
  });
}
function quit () {
  open_coverer('Quiting...');
  as.call('quitMatch', null, (err, json)=>{
    flash('Quited. You will lose your rating.');
  });
}
var mykey="NNNNNNNNNNNNNNNNNNNNNNNNNNNBANNNNNNABNNNNNNNNNNNNNNNNNNNNNNNNNNN";
//initailize
function initailize () {
  let _NSc = new NSc();
  _NSc.connect('127.0.0.1', '1487');
  _NSc.setDebug(true);
  uuid = guid();
  initmap();
  set_right_point(0);
  set_left_point(0);
  open_coverer('connecting to Noversi Service...');
  _NSc.createActivitySocket('Noversi', (err, a)=>{
    as = a;
    let joinMatch = ()=>{
      open_coverer('Joining match...');
      as.call('joinMatch', null, (err, json)=>{
        if(err) {
          console.log(err);
        }
        else {
          if(json.s!='OK') {
            open_coverer(json.s);
          }
          else {
            console.log(json.s);
          }
        }
      });
    };
    as.onClose = () => {
      open_coverer('Disconnected.');
    };
    as.onData = (data) => {
      let renderBoard = ()=>{
        draw_map(data.game.key);
        if(data.game.r) {
          if(data.game.turn == 0) {
            reversi_turn_red_em("r"+(data.game.r)+"c"+(data.game.c));
          }
          else if (data.game.turn == 1){
            reversi_turn_blue_em("r"+(data.game.r)+"c"+(data.game.c));
          }
        }
        set_right_point(data.game.p2.score);
        set_left_point(data.game.p1.score);
        if(data.end) {
          open_coverer(data.s+' new match in 5 sec.');
          setTimeout(joinMatch, 5000);
        }
        else if(data.game.me == data.game.turn) {
          close_coverer();
        }
        else {
          open_coverer(data.s);
        }
      }

      if(data.m=='all') {
        renderBoard();
        set_p1_meta(data.game.p1.name, data.game.p1.r, data.game.p1.w);
        set_p2_meta(data.game.p2.name, data.game.p2.r, data.game.p2.w);
      }
      else if (data.m=='board') {
        renderBoard();
      }
      else if (data.m=='chat') {
        flash(data.c);
      }
    }
    open_coverer('Joining match...');
    joinMatch();
  });

  // pass();
}
