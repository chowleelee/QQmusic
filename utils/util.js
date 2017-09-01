function requestTJ(callback){
  wx.request({
    url: 'https://c.y.qq.com/musichall/fcgi-bin/fcg_yqqhomepagerecommend.fcg',
    data: {},
    method: "GET",
    header: { 
        "content-type":"json"
    }, 
    success: function(res){
    	if(res.statusCode == "200"){
            var data = res.data;
            var songlist = data.data.songList;
            for (var i = 0; i < songlist.length; i++) {
              songlist[i].accessnum = formatWan(songlist[i].accessnum);
            }
    		callback(data);
    	}
    }		
  })
}

function formatWan(n) {
  n = n.toString();
  return (n / 10000).toFixed(1) + '万';
}

/*function processSinger(){
  var singers = '';
  for (var j = 0; j < songlist[i].data.singer.length; j++) {
    if(j < songlist[i].data.singer.length - 2){
      singers += (songlist[i].data.singer[j].name + '/');
    }else{
      singers += songlist[i].data.singer[j].name;
    }
  }
  songlist[i].data.singers = singers;
}*/

function requestPHB(callback){
  wx.request({
    url: 'https://c.y.qq.com/v8/fcg-bin/fcg_myqq_toplist.fcg',
    data: {
        g_tk:5381,
        uin:0,
        format:"json",
        inCharset:"utf-8",
        outCharset:"utf-8",
        notice:0,
        platform:"h5",
        needNewCode:1
    },
    method: "GET",
    header: { 
        "content-type":"json"
    }, 
    success: function(res){
    	if(res.statusCode == "200"){
        var data = res.data;
        var topList = data.data.topList;
        for (var i = 0; i < topList.length; i++) {
          topList[i].listenCount = formatWan(topList[i].listenCount);
        }
        callback(topList);
    	}
    }		
  })
}

function requestSS(callback){
  wx.request({
    url: 'https://c.y.qq.com/splcloud/fcgi-bin/gethotkey.fcg',
    data: {},
    method: "GET",
    header: { 
        "content-type":"json"
    }, 
    success: function(res){
    	if(res.statusCode == "200"){
    		callback(res.data);
    	}
    }		
  })
}

function requestTopList(id, callback){
  wx.request({
    url: 'https://c.y.qq.com/v8/fcg-bin/fcg_v8_toplist_cp.fcg',
    data: {
        g_tk:5381,
        uin:0,
        format:'json',
        inCharset:'utf-8',
        outCharset:'utf-8',
        notice:0,
        platform:'h5',
        needNewCode:1,
        tpl:3,
        page:'detail',
        type:'top',
        topid:id,  
    },
    method: "GET",
    header: { 
        "content-type":"json"
    }, 
    success: function(res){
    	if(res.statusCode == "200"){
        var data = res.data;
        var songlist = data.songlist;
        for (var i = 0; i < songlist.length; i++) {
          var singers = '';
          for (var j = 0; j < songlist[i].data.singer.length; j++) {
            if(j < songlist[i].data.singer.length - 2){
              singers += (songlist[i].data.singer[j].name + '/');
            }else{
              singers += songlist[i].data.singer[j].name;
            }
          }
          songlist[i].data.singers = singers;
        }
    		callback(data);
    	}
    }		
  })
}

function requestCDList(id, callback){
  wx.request({
    url: 'https://c.y.qq.com/qzone/fcg-bin/fcg_ucc_getcdinfo_byids_cp.fcg',
    data: {
      g_tk: 5381,
      uin: 0,
      format: 'json',
      inCharset: 'utf-8',
      outCharset: 'utf-8',
      notice: 0,
      platform: 'h5',
      needNewCode: 1,
      new_format: 1,
      pic: 500,
      disstid: id,
      type: 1,
      json: 1,
      utf8: 1,
      onlysong: 0,
      nosign: 1,
      _: new Date().getTime()
    },
    method: "GET",
    header: { 
        "content-type":"json"
    }, 
    success: function(res){
        if(res.statusCode == "200"){
            var data = res.data;
            var cdlist = data.cdlist;
            for (var i = 0; i < cdlist.length; i++) {
              cdlist[i].visitnum = formatWan(cdlist[i].visitnum);
              var singers = '';
              for (var k = 0; k < cdlist[i].songlist.length; k++) {
                var singers = '';
                for (var j = 0; j < cdlist[i].songlist[k].singer.length; j++) {
                  if(j < cdlist[i].songlist[k].singer.length - 2){
                    singers += (cdlist[i].songlist[k].singer[j].name + '/');
                  }else{
                    singers += cdlist[i].songlist[k].singer[j].name;
                  }
                }
                cdlist[i].songlist[k].singers = singers;
              }
            }
            callback(cdlist[0]);
        }
    }       
  })
}

function calculateBgColor(pic_url, callback) {
  wx.request({
    url: 'https://c.y.qq.com/splcloud/fcgi-bin/fcg_gedanpic_magiccolor.fcg',
    data: {
      g_tk: 5381,
      uin: 0,
      format: 'json',
      inCharset: 'utf-8',
      outCharset: 'utf-8',
      notice: 0,
      platform: 'h5',
      needNewCode: 1,
      pic_url: pic_url,
      _: new Date().getTime()
    },
    method: 'GET',
    header: { 'content-type': 'application/json' },
    success: function (res) {
      if (res.statusCode == 200) {
        var data = res.data;
        callback(res.data);
      }
    }
  });
}

function requestSearch(text, page, callback){
  wx.request({
    url: 'https://c.y.qq.com/soso/fcgi-bin/search_for_qq_cp',
    data: {
        g_tk:5381,
        uin:0,
        format:"json",
        inCharset:"utf-8",
        outCharset:"utf-8",
        notice:0,
        platform:"h5",
        needNewCode:1,
        w:text,
        zhidaqu:1,
        catZhida:1,
        t:0,
        flag:1,
        ie:"utf-8",
        sem:1,
        aggr:0,
        perpage:20,
        n:20,
        p:page,
        remoteplace:"txt.mqq.all"
    },
    method: "GET",
    header: { 
        "content-type":"json"
    }, 
    success: function(res){
        if(res.statusCode == "200"){
            callback(res.data);
        }
    }       
  })
}

function requestGC(id, callback){
    wx.request({
    url: 'https://route.showapi.com/213-2',
    data: {
      musicid: id,
      showapi_appid: '23654',
      showapi_timestamp: new Date().getTime(),
      showapi_sign: 'd23793312daf46ad88a06294772b7aac'
    },
    method: "GET",
    header: { 
        'content-type': 'application/x-www-form-urlencoded'
    }, 
    success: function(res){
        if(res.statusCode == "200"){
            callback(res.data);
        }
    }       
  })
}


module.exports = {
	requestTJ: requestTJ,
	requestPHB: requestPHB,
	requestSS: requestSS,
  requestCDList: requestCDList,
	requestTopList: requestTopList,
  calculateBgColor: calculateBgColor,
  requestSearch: requestSearch,
  requestGC: requestGC
}