var dataLists = require("../../utils/util.js");
var app = getApp();
Page({
  data:{
      timer: null,
      timer2: null
  },

  onLoad: function(){
    this.setData({
      songs: app.globalData.songlist,
      index: app.globalData.index
    });
    if(app.globalData.indexs == this.data.index){
      this.setData({
        isPlayingMusic: app.globalData.isPlayingMusic
      });
    }else{
      this.setData({
        isPlayingMusic: false
      });
    }
    this.init();
  },

  init: function(){
    clearInterval(app.globalData.timer);
    var that = this;
    var songs = this.data.songs;
    var index = this.data.index;
    this.setData({
      time: {
        s: '00',
        m: '00'
      },
      tTime: {
        s: '00',
        m: '00'
      },
      song: songs[index].data || songs[index],
      flag: -1
     });
    this.setData({
      imgUrl: 'http://y.gtimg.cn/music/photo_new/T002R150x150M000' + (this.data.song.albummid || this.data.song.album.mid) + '.jpg'
    });

    app.globalData.imgUrl = this.data.imgUrl;
    app.globalData.songname = this.data.song.songname || this.data.song.title;
    app.globalData.songmid = this.data .song.songmid || this.data.song.file.media_mid;
    app.globalData.indexs = index;
    app.globalData.index = index;

    
    wx.getSystemInfo({ 
     success: function (res) { 
      that.setData({ 
       screenWidth: res.windowWidth,
       screenHeight: res.windowHeight
      }); 
     } 
    }); 

    this.autoPlay();
    this.barMove();

    dataLists.requestGC(this.data.song.songid || this.data.song.id, function(data){
      var lyric = data.showapi_res_body.lyric;
      lyric = that.reconvert(lyric);
      lyric = that.parseLyric(lyric);
      for(var i = 0; i < lyric.length - 1; i++){
        lyric[i].endTime = lyric[i+1].time;
      }
      lyric[lyric.length-1].endTime = that.data.duration;

      that.setData({
        lyric:lyric
      });

      that.GCMove();
    });

  },

  reconvert: function(lyric){
    var str = lyric.replace(/(\\u)(\w{1,4})/gi, function ($0) {
      return (String.fromCharCode(parseInt((escape($0).replace(/(%5Cu)(\w{1,4})/g, "$2")), 16)));
    });
    str = lyric.replace(/(&#x)(\w{1,4});/gi, function ($0) {
      return String.fromCharCode(parseInt(escape($0).replace(/(%26%23x)(\w{1,4})(%3B)/g, "$2"), 16));
    });
    str = lyric.replace(/(&#)(\d{1,6});/gi, function ($0) {
      return String.fromCharCode(parseInt(escape($0).replace(/(%26%23)(\d{1,6})(%3B)/g, "$2")));
    });
    return str;
  },

  parseLyric: function(lyric){
    var lyrics = lyric.split("\n");
    var lrcArr = [];
    var lrcObj = {};
    for(var i = 0; i < lyrics.length; i++){
      var timeReg = /\[\d*:\d*((\.|\:)\d*)*\]/g;
      var timeRegExpArr = lyrics[i].match(timeReg);
      var clause = lyrics[i].replace(timeReg, '');
      if (!timeRegExpArr) 
        continue;
      if(clause.length > 0){
        for (var k = 0, h = timeRegExpArr.length; k < h; k++) {
          var t = timeRegExpArr[k];
          var min = Number(String(t.match(/\[\d*/i)).slice(1)),
            sec = Number(String(t.match(/\:\d*/i)).slice(1));
          var time = min * 60 + sec;
          lrcObj = {
            time: time,
            clause: clause
          }
          lrcArr.push(lrcObj);
        }
      }
    }
    return lrcArr;
  },

  /*歌词滚屏*/
  GCMove: function(){
    var that = this;
    this.data.timer2 = setInterval(function(){
      for(var i = 3; i < that.data.lyric.length; i++){
        if(that.data.currentPosition == that.data.lyric[i].time || that.data.currentPosition < that.data.lyric[i].endTime){
          if(that.data.flag == i){
            break;
          }
          that.setData({
            flag: i,
            scrollTop: 42 * (i-3),
          });
          break;
        } 
      };
    }, 300)
  },

  /*进度条移动*/
  barMove: function(){
    var that = this;
    clearInterval(this.data.timer);
    this.data.timer = setInterval(function(){
      wx.getBackgroundAudioPlayerState({
        success: function(res) {
            that.setData({
              duration: res.duration,
              currentPosition: res.currentPosition,
              time: that.processTime(res.currentPosition),
              tTime: that.processTime(res.duration),
              width: that.processWidth(res.currentPosition, res.duration)
            });
            app.globalData.timer = that.data.timer;
            if(res.duration && res.currentPosition && res.duration == res.currentPosition){
              clearInterval(that.data.timer);
              that.setData({
                songs: app.globalData.songlist,
                index: that.data.index+1,
                isPlayingMusic:false
              });
              app.globalData.isPlayingMusic = that.data.isPlayingMusic;
              that.init();
            }
        }
      })
    }, 800);
  },


  processTime: function(data){
    var time = {};
    time.s = data % 60 < 10 ? '0' + data % 60 : data % 60;
    time.m = parseInt(data / 60) < 10 ? '0' + parseInt(data / 60) : parseInt(data / 60);
    return time;
  },

  processWidth: function(cur, dur){
    return cur / dur * 100 + '%'
  },

  /*手指离开进度条*/
  onTouchEnd: function(){
    this.GCMove();
  },

  /*手指拖动进度条*/
  onTouchMove: function(ev){
    clearInterval(this.data.timer2);
    var that = this;
    var moveX = ev.touches["0"].pageX - ev.currentTarget.offsetLeft;
    var barWidth = this.data.screenWidth - ev.currentTarget.offsetLeft * 2;
    if(moveX > barWidth){
      moveX = barWidth;
    }else if(moveX < 0){
      moveX = 0;
    }

    this.setData({
      width: this.processWidth(moveX, barWidth),
      time: this.processTime(parseInt((this.data.width.substring(0, that.data.width.indexOf('%')) / 100) * this.data.duration), this.data.duration)
    });

    wx.seekBackgroundAudio({
      position: parseInt((this.data.width.substring(0, that.data.width.indexOf('%')) / 100) * this.data.duration)
    });

  },

  /*点击播放暂停按钮*/
  onMusicTap: function(){
    var isPlayingMusic = this.data.isPlayingMusic;
    if(isPlayingMusic){
      wx.pauseBackgroundAudio();
      this.setData({
        isPlayingMusic: false
      });
      clearInterval(this.data.timer2);
    }else{
      wx.playBackgroundAudio({
        dataUrl: 'http://ws.stream.qqmusic.qq.com/C100' + (this.data.song.songmid || this.data.song.file.media_mid) + '.m4a?fromtag=38'
      });
      this.setData({
        isPlayingMusic: true
      });
      this.GCMove();
    }
    app.globalData.isPlayingMusic = this.data.isPlayingMusic;
  },

  /*自动播放音乐*/
  autoPlay: function(){
  	var isPlayingMusic = this.data.isPlayingMusic;
  	if(isPlayingMusic){
  		return;
  	}else{
  		wx.playBackgroundAudio({
	        dataUrl: 'http://ws.stream.qqmusic.qq.com/C100' + (this.data.song.songmid || this.data.song.file.media_mid) + '.m4a?fromtag=38'
	    });
      console.log(this.data.song.songmid || this.data.song.file.media_mid);
	    this.setData({
	    	isPlayingMusic: true
	    })
  	}
    app.globalData.isPlayingMusic = this.data.isPlayingMusic;
  },

  /*----------音乐播放列表------------*/

  /*缓慢出现音乐列表*/
  onSonglistTap: function(){
    this.setData({
      songlistShow: true
    })
  },

  /*关闭音乐列表*/
  onSonglistCloseTap: function(){
    this.setData({
      songlistShow: false
    })
  },

  /*点击音乐列表中的音乐*/
  onSongListItemTap: function(ev){
    var that = this;
    this.setData({
      songs: app.globalData.songlist,
      index: ev.currentTarget.dataset.index,
      isPlayingMusic:false
    });
    app.globalData.isPlayingMusic = this.data.isPlayingMusic;
    this.init();
  }

})