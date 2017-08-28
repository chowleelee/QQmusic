var dataLists = require("../../utils/util.js");
var app = getApp();

Page({
	data:{
	},

	onLoad: function(option){
		var that = this;
		var id = option.id;
		dataLists.requestCDList(id, function(data){
	      that.setData({
	      	cdList: data.songlist,
	      	desc: data.desc,
	      	nickname: data.nickname,
	      	visitnum: data.visitnum,
	      	dissname: data.dissname,
	      	tags: data.tags,
	      	bg: data.logo
	      });
	      dataLists.calculateBgColor(data.logo, function(data){
	      	that.setData({
	      		color: ('#' + data.magic_color.toString(16)) == '#0' ? '#000000' : ('#' + data.magic_color.toString(16)) 
	      	});
	      })
	    });
	},

	onMusicTap: function(ev){
	    var index = ev.currentTarget.dataset.index;
	    app.globalData.songlist = this.data.cdList;
	    app.globalData.index = index;
	    wx.navigateTo({
	      url: '../playMusic/playMusic'
	    })
	}
})