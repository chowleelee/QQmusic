
var dataLists = require("../../utils/util.js");
var app = getApp();

Page({
  data: {
    navArr: ["推荐", "排行榜", "搜索"],
    closeShow: false,
    containerShow: false,
    historyShow: false,
    searchValue:'',
    index: 0,
    timer: null,
    timer2: null
  },

  onLoad: function(){
    var that = this;
    
    /*加载推荐数据*/
    dataLists.requestTJ(function(data){
      that.setData({
        radioList: data.data.radioList,
        slider: data.data.slider,
        songList: data.data.songList
      })
    });

    /*加载排行榜数据*/
    dataLists.requestPHB(function(data){
      that.setData({
        topList: data
      })
    });

    /*加载搜索数据*/
    dataLists.requestSS(function(data){
      that.setData({
        specialkey: data.data.special_key,
        hotkey: data.data.hotkey.slice(0, 10)
      })
    });

    wx.getSystemInfo({
      success: function (res) {
        that.setData({
          screenWidth: res.screenWidth,
          screenHeight: res.screenHeight
        });
      }
    }); 

    this.monitorMusic();
  },

  /*监听音乐播放*/
  monitorMusic: function(){
    var that = this;
    clearInterval(this.data.timer2);
    this.data.timer2 = setInterval(function(){
      that.setData({
        imgUrl: app.globalData.imgUrl,
        isPlayingMusic: app.globalData.isPlayingMusic,
        songname:app.globalData.songname,
        songmid: app.globalData.songmid,
        indexs: app.globalData.indexs
      });
    },1000)
  },

  /*切换tab*/
  onNavTap: function(ev){
    var index = ev.currentTarget.dataset.index;
    var offLeft = ev.currentTarget.offsetLeft;
    this.setData({
      currentTab: index,
      offLeft: offLeft
    })
  },

  onPlayTap: function(){
    var isPlayingMusic = this.data.isPlayingMusic;
    if(isPlayingMusic){
      wx.pauseBackgroundAudio();
      this.setData({
        isPlayingMusic: false
      });
    }else{
      wx.playBackgroundAudio({
        dataUrl: 'http://ws.stream.qqmusic.qq.com/C100' + this.data.songmid + '.m4a?fromtag=38'
      });
      this.setData({
        isPlayingMusic: true
      });
    };
    app.globalData.isPlayingMusic = this.data.isPlayingMusic;
  },

  onBindChange: function(ev){
    var index = ev.detail.current;
    this.setData({
      offLeft: this.data.screenWidth/3*index
    })
  },

  onMusicAreaTap: function(){
    if(this.data.imgUrl){
      wx.navigateTo({
        url: '../playMusic/playMusic'
      })
    }
  },

  onSongListTap: function(ev){
    var id = ev.currentTarget.dataset.id;
    wx.navigateTo({
      url: '../cdList/cdList?id=' + id
    });
  },


  /*点击排行榜items跳转到相应页面*/
  onTopListTap: function(ev){
    var id = ev.currentTarget.dataset.id;
    wx.navigateTo({
      url: '../topList/topList?id=' + id
    })
  },

  /*鼠标点击input时*/
  onBindFocus: function(ev){
    this.setData({
      closeShow: true
    });
    if(!this.data.containerShow){
      this.getHistory();
    }
  },

  /*获取搜索历史*/
  getHistory: function(){
    var historyItems = wx.getStorageSync('search_history');
    if(historyItems && historyItems.length > 0){
      this.setData({
        historyShow: true,
        historyItems: historyItems
      });
    };
  },

  /*键盘输入时*/
  onBindInput: function(ev){
    this.setData({
      searchValue: ev.detail.value
    })
  },

  /*点击取消*/
  onCloseTap: function(){
    this.setData({
      searchValue: '',
      closeShow: false,
      containerShow: false,
      historyShow: false
    })
  },

  /*清除input内容*/
  onClearTap: function(){
    this.setData({
      searchValue: '',
      containerShow: false,
      historyShow: true
    });
    this.getHistory();
  },

  /*回车*/
  onBindConfirm: function(ev){
    var text = ev.detail.value;
    this.searchResult(text);
  },

  /*搜索结果*/
  searchResult: function(text){
    var that = this;
    this.setData({
      containerShow: true,
      historyShow: false,
      page: 1,
      text: text
    });
    dataLists.requestSearch(text, this.data.page, function(data){
      that.setData({
        song: data.data.song.list,
        page: ++that.data.page
      })
    });

    this.searchHistory(text);
  },

  /**/
  searchHistory: function(text){
    var that = this;
    var historyItems = wx.getStorageSync('search_history');
    if(historyItems){
      if(historyItems.indexOf(text) != -1){
        historyItems.splice(historyItems.indexOf(text), 1);
      }
    }else{
      historyItems = [];
    };
    historyItems.push(text);
    wx.setStorageSync('search_history', historyItems);
  },

  /*清除所有搜索历史*/
  onClearAllTap: function(){
    wx.removeStorageSync('search_history');
    this.setData({
      historyShow: false
    })
  },

  /*删除单个搜索记录*/
  onClearHistoryTap: function(ev){
    var that = this;
    wx.getStorage({
        key: 'search_history',
        success: function (res) {
            var historyItems = res.data;
            historyItems.splice(ev.currentTarget.dataset.index, 1);
            that.setData({
              historyItems: historyItems
            });
            if(historyItems.length == 0){
              that.setData({
                historyShow: false
              });
              wx.removeStorageSync('search_history');
              return;
            }
            wx.setStorageSync('search_history', historyItems);
        }
    })
  },

  /*点击搜索历史项*/
  onHistoryTap: function(ev){
    var that = this;
    var text = this.data.historyItems[ev.currentTarget.dataset.index];
    this.setData({
      searchValue: text,
      containerShow: true,
      historyShow: false,
      page: 1,
      text: text
    });
    dataLists.requestSearch(text, this.data.page, function(data){
      that.setData({
        song: data.data.song.list,
        page: ++that.data.page
      })
    });
  },

  /*点击热词*/
  onHotkeyTap: function(ev){
    var text = ev.currentTarget.dataset.index;
    this.setData({
      closeShow: true,
      searchValue: text
    });
    this.searchResult(text);
  },

  /*下拉刷新*/
  onScrollLower: function(){
    var that = this;
    clearTimeout(this.data.timer);
    this.data.timer = setTimeout(function(){
      dataLists.requestSearch(that.data.text, that.data.page, function(data){
        that.setData({
          song: that.data.song.concat(data.data.song.list),
          page: ++that.data.page
        })
      }); 
    }, 100);
  },

  /*点击搜索结果item*/
  onResultTap: function(ev){
    var index = ev.currentTarget.dataset.index;
    app.globalData.songlist = this.data.song;
    app.globalData.index = index;
    wx.navigateTo({
      url: '../playMusic/playMusic'
    })
  }
})