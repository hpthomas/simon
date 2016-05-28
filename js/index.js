"use strict";

//TODO : generated tones that can play continuously (current sounds don't last length of button press)
//possible in internet explorer?
function delay(time) {
  return new Promise(function (res, rej) {
    return setTimeout(res, time);
  });
}
"use strict";
var s,
    game = {
  status: {
    clear_delay: null, //promise for when a button push can be ended. null if no current button push
    strict: true,
    time: 0,
    sequence: [],
    input: [],
    enabled: false, //buttons enabled
    playing_sequence: false
  },

  /* Adds listeners to DOM buttons, handles click and touch input. 
  down() and up() do the actual work, they are called from the listeners. */
  set_play_buttons: function set_play_buttons() {
    function down() {
      if (s.enabled) {
        s.enabled = false;
        s.input.push(this);
        game.flash(this);
        s.clear_delay = delay(100);
        var this_delay = s.clear_delay; //remember specific delay we set
        delay(2500).then(function () {
          //we have closure over 'this_delay'. if this_delay === s.clear_delay, an element has stayed clicked for 2.5s
          if (this_delay === s.clear_delay) {
            up.call(game); //unclick it
          }
        });
      }
    }
    function up() {
      var _this = this;

      if (s.clear_delay) {
        s.clear_delay.then(function () {
          s.enabled = true;
          s.clear_delay = null;
          _this.clear();
          _this.verify();
        });
      }
    }

    //add listeners for both mouse and touch events,
    //preventDefault() stops mouse event from firing if touch was fired
    [].forEach.call(this.buttons, function (button) {
      button.addEventListener("mousedown", down);
      button.addEventListener("touchstart", function (event) {
        down.call(this);
        event.preventDefault();
      });
    });
    window.addEventListener("mouseup", up.bind(this));
    window.addEventListener("touchend", up.bind(this));
  },
  set_control_buttons: function set_control_buttons() {
    var _this2 = this;

    document.querySelector("#start").addEventListener("click", function () {
      return _this2.start(1000);
    });
    document.querySelector("#reset").addEventListener("click", this.reset.bind(this));
  },
  set_strict_button: function set_strict_button() {
    document.querySelector("#toggle_strict").addEventListener("click", function () {
      game.status.strict = !game.status.strict;
      document.querySelector("#strict_display").innerText = game.status.strict ? "On" : "Off";
      document.querySelector("#strict_display").className = game.status.strict ? "strict_on" : "strict_off";
    });
  },
  //remembers DOM elements and adds listeners
  init: function init() {
    this.buttons = document.querySelectorAll(".play");
    this.sounds = {
      'top_left': document.getElementById("s1"),
      'top_right': document.getElementById("s2"),
      'bottom_left': document.getElementById("s3"),
      'bottom_right': document.getElementById("s4")
    };
    this.set_play_buttons();
    this.set_control_buttons();
    this.set_strict_button();
    s = this.status;
  },

  start: function start(time) {
    var _this3 = this;

    s.time = time || 1000;
    this.reset().then(function () {
      _this3.add();
      _this3.play_sequence();
    });
  },
  reset: function reset() {
    document.querySelector("#count").innerText = 0;
    s.sequence = [];
    s.input = [];
    this.clear();
    if (s.playing) {
      s.playing = false;
      return delay(s.time);
    } else {
      return delay(0);
    }
  },

  play_sequence: function play_sequence() {
    var _this4 = this;

    s.playing = true;
    var p = Promise.resolve();
    s.sequence.forEach(function (element) {
      p = p.then(function () {
        if (!s.playing) {
          _this4.clear();
          return Promise.reject("Playback cancelled - game state reset during sequence playback");
        }
      }).then(_this4.flash.bind(_this4, element)).then(function () {
        return delay(s.time * .75);
      }).then(_this4.clear.bind(_this4)).then(function () {
        return delay(s.time * .25);
      });
    });
    p.then(function () {
      game.clear();
      s.time = s.time >= 250 ? s.time - 50 : s.time;
      s.playing = false;
      s.input = [];
      s.enabled = true;
    }).catch(function (err) {
      return console.log(err);
    });
  },

  verify: function verify() {
    var _this5 = this;

    var right = true;
    s.input.forEach(function (e, i) {
      if (s.sequence[i] !== e) {
        right = false;
      }
    });
    if (!right) {
      s.enabled = false;
      [].forEach.call(this.buttons, function (button) {
        return _this5.flash(button);
      });
      delay(s.time).then(this.clear.bind(this)) //after 1x time, clear board
      .then(function () {
        return delay(s.time / 2);
      }) //after 1/2 time, replay sequence if not strict
      .then(s.strict ? null : this.play_sequence.bind(this));
    } else if (s.sequence.length == s.input.length) {
      s.enabled = false;
      document.querySelector("#count").innerText = s.sequence.length;
      this.add();
      delay(s.time).then(this.play_sequence.bind(this));
    }
  },
  add: function add() {
    s.sequence.push(this.buttons[Math.floor(Math.random() * 4)]);
  },
  flash: function flash(ele) {
    var sound = this.sounds[ele.id];
    sound.pause();
    delay(0).then(function () {
      sound.currentTime = 0;
      sound.play();
    });
    ele.classList.add(ele.id + "_flash");
  },
  clear: function clear() {
    [].forEach.call(this.buttons, function (button) {
      return button.classList.remove(button.id + "_flash");
    });
  }
};
window.onload = function () {
  game.init();
};