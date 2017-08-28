var dataLists = require("../../utils/util.js");
var app = getApp();

Page({
	data:{

	},

	onLoad: function(option){
		var that = this;
		var id = option.id;
		dataLists.requestTopList(id, function(data){
      that.setData({
        topListDetail: {
          songlist: data.songlist,
            update_time: data.update_time,
            topinfo: data.topinfo,
            color: ('#' + data.color.toString(16)) == '#0' ? '#000000' : ('#' + data.color.toString(16)) 
        }
      })
    });
	},

  onMusicTap: function(ev){
    console.log(ev);
    var index = ev.currentTarget.dataset.index;
    app.globalData.songlist = this.data.topListDetail.songlist;
    app.globalData.index = index;
    wx.navigateTo({
      url: '../playMusic/playMusic'
    })
  }
  
   
})