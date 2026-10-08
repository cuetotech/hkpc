
// 플레이어 
html5Player = function(playerID, baseID){	
	this.playerID = playerID;				// 플레이어 객체 ID
	this.baseID = baseID;					// 플레이어가 들어갈 ID	
	this.playerType = null;					// 플레이어 형식 1:html5, 2:flash
	this.playerObj = null;					// 플레이어 객체

	this.vodUrl = "";						// 동영상 URL

	this.mainImage = "";					// 동영상 메인 썸네일 이미지
	this.prDocWidth = "100%";				// 플레이어 넓이
	this.prDocHeight = "100%";				// 플레이어 높이
	this.prAutoPlay = 1;					// 자동시작 (0?1)

	// 각 레이어
	this.baseLayer = null;					// 플레이어가 들어갈 레이어
	this.shadowLayer = null;				// 플레이어 감싸는 레이어
	this.controlsLayer = null;				// 콘트롤 레이어
	this.progBar = null;					// 프로그레스바
	this.progLayer = null;					// 프로그레스바 클릭 레이어

	// 버튼들
	this.btnPlay = null;		// 플레이 버튼
	this.btnPause = null;		// 일시 정지 버튼
	this.btnPlayMain = null;	// 플레이 버튼
	this.btnFull = null;		// 전체 화면 버튼
	this.btnSnd = null;			// 사운드 버튼
	this.btnSndOff = null;		// 음 소거 버튼
	this.btnVol = new Array();	// 음량 버튼
	this.speedDown = null;		// 속도느리게
	this.speedUp = null;		// 속도빠르게

	this.strDuration = 0;		// 전체 시간
	this.strCurrentTime = 0;	// 재생 시간
	this.strDurationTxt = null;		// 전체 시간 텍스트
	this.strCurrentTimeTxt = null;	// 재생 시간 텍스트
	this.strSpeedTxt = null;		// 현재재생속도

	this.baseVol = 9;		// 기본 볼륨
	this.currentSpeed = 1;
	this.vodType = "video";
	this.thumbFileExist = "Y";

	// Firefox 이벤트 처리
	if( navigator.userAgent.indexOf('Firefox') >= 0 ) {
		var eventNames = ["mousedown", "mouseover", "mouseout", "mousemove", "mousedrag", "click", "dblclick", "keydown", "keypress", "keyup" ]; 
		for( var i = 0 ; i < eventNames.length; i++ ) {
			window.addEventListener( eventNames[i], function(e) {
				window.event = e;
			}, true );
		}
	}

	// 초기화
	html5Player.prototype.init = function() {
		// ie10 이상만 html5업로드 사용
		if((navigator.appName.indexOf('Microsoft')+1)){
			re = new RegExp("MSIE ([0-9]{1,}[\.0-9]{0,})");
			if (re.exec(navigator.userAgent) != null){ 
				rv = parseFloat(RegExp.$1);
				if(rv < 10){
					this.playerType = 2;
				}else{
					this.playerType = 1;
				}
			}
		}else{
			this.playerType = 1;
		}	// end IE check if

		document.getElementById(this.baseID).innerHTML = "";
		
		if(this.playerType == 1){
			this.getPlayer();	// 플레이어 출력
			if(this.prAutoPlay == 1){
				this.onPlay();
			}
		}else{
			this.getFlash();	// 플레쉬 출력
		}
	}	// end init end	


	// 플레쉬 추출
	html5Player.prototype.getFlash = function() {
		txt = "이 브라우저에서는 재생할 수 없습니다.";		
		document.getElementById(this.baseID).innerHTML = txt;
	}	// end getFlash end


	// 플레쉬 객체 가져오기
	html5Player.prototype.thisMovie = function(movieName){
		if (navigator.appName.indexOf("Microsoft") != -1) {
			return window[movieName]
		}
		else {
			return document[movieName]
		}
	}	// end thisMovie function


	// html5 플레이어 추출
	html5Player.prototype.getPlayer = function() {
		if(this.prDocWidth == "100%"){
			vw = "100%";
		}else{
			vw = ""+this.prDocWidth+"px";
		}
		if(this.prDocHeight == "100%"){
			vh = "100%";
		}else{
			vh = ""+this.prDocHeight+"px";
		}

		// 크롬 버전
		isOldBrowser = false;
		browserVArr = navigator.userAgent.split("Chrome/");
		if(browserVArr.length == 2){
			bArr = browserVArr[1].split(".");
			bv = parseInt(bArr[0]);
			if(!isNaN(bv) && bv < 40){
				isOldBrowser = true;
			}
		}

		// 전체 감싸는 레이어
		wrapLayer = document.createElement("DIV");
		wrapLayer.style.position = 'relative';
		wrapLayer.style.width = vw;
		wrapLayer.style.height = vh;
		wrapLayer.style.margin = "0px";
		wrapLayer.style.padding = "0px";
		document.getElementById(this.baseID).appendChild(wrapLayer);

		// 비디오 태그 감싸는 레이어
		this.baseLayer = document.createElement("DIV");
		this.baseLayer.style.position = 'relative';
		this.baseLayer.style.width = "100%";
		if(!isOldBrowser){
			this.baseLayer.style.height = "100%";
		}
		this.baseLayer.style.margin = "0px";
		this.baseLayer.style.padding = "0px";
		wrapLayer.appendChild(this.baseLayer);

		// 비디오 태그
		if(this.mainImage != "" && this.vodType != "audio"){
			htmlPoster = " poster='"+this.mainImage+"'";
		}else{
			htmlPoster = "";
		}

		html  = "";
		html += "<video width='100%' height='100%' id='"+this.playerID+"' >";
		html += "<source src='"+this.vodUrl+"' type='video/mp4'>";
		html += "</video>";
		if(this.vodType == "audio"){
			if(this.thumbFileExist == "Y"){
				html += "<div id='pauseimg' style='position: absolute; left: 0; top: 0; right: 0; bottom: 0;text-align: center; background: #000 url("+this.mainImage+") center no-repeat; background-size: contain;'></div>";
				html += "<div id='playimg' style='display:none;position: absolute; left: 0; top: 0; right: 0; bottom: 0;text-align: center; background: #000 url("+this.mainImage+") center no-repeat; background-size: contain;'></div>";
			} else {
				html += "<div id='pauseimg' style='position: absolute; left: 0; top: 0; right: 0; bottom: 0;text-align: center; background: #000 url(/core/module/vod/images/audio1.gif) center no-repeat;'></div>";
				html += "<div id='playimg' style='display:none;position: absolute; left: 0; top: 0; right: 0; bottom: 0;text-align: center; background: #000 url(/core/module/vod/images/audio2.gif) center no-repeat;'></div>";
			}
		}

		this.baseLayer.innerHTML = html;
		this.playerObj = document.getElementById(this.playerID);
		if(isOldBrowser && !isApp()){
			this.playerObj.setAttribute("controls", "controls");
			return;
		}

		if(navigator.userAgent.match(/iPhone|iPad/i)){
			if(!isApp()){
				this.playerObj.setAttribute("controls", "controls");
			}else{
				html = "<div style=\"position:absolute; z-index:2; left:0px; top:0px; width:100%; height:100%;\" onclick=\"document.location.href='"+encodeURI(this.vodUrl)+"';\"><img src=\"/core/module/vod/player/images/btn_main_paly_on.png\" style=\"position: absolute; left: 0; top: 0; right: 0; bottom: 0; width: 86px; height: 86px; margin: auto;\"></div>";
				this.baseLayer.innerHTML += html;
			}
			return;
		}


		// 비디오를 클릭하지 못하도록 처리
		this.shadowLayer = document.createElement("DIV");
		this.shadowLayer.style.zIndex = "100";
		this.shadowLayer.style.position = "absolute";
		this.shadowLayer.style.top = "0px";
		this.shadowLayer.style.left = "0px";
		this.shadowLayer.style.right = "0px"
		this.shadowLayer.style.bottom = "0px"
		this.shadowLayer.style.background = "#000000";
		this.shadowLayer.style.backgroundAttachment = "fixed";
		this.shadowLayer.style.opacity = 0;

		// 앱일경우 앱 기본 플레이어에서 재생
		if(isApp()){
			this.btnPlayMain = document.createElement("IMG");
			this.btnPlayMain.style.cssText = "position:absolute; left:50%; top:50%; margin-left:-43px; margin-top:-43px; cursor:pointer; z-index:201;";
			this.btnPlayMain.style.display = "block";
			this.btnPlayMain.src = "/core/module/vod/player/images/btn_main_paly.png";
			wrapLayer.appendChild(this.btnPlayMain);
			this.btnPlayMain.onclick = function(){
				html5Player.vodUrl = html5Player.vodUrl.replace(/ /g, '%20');
				window.webViewCall.vodPlay(html5Player.vodUrl);
			}

			return;
		}


		this.shadowLayer.onclick = function(){ html5Player.hideControls(); };

		this.baseLayer.appendChild(this.shadowLayer);

		this.playerObj.oncanplay = function(){  };			// 재생 가능
		this.playerObj.oncanplaythrough = function(){ html5Player.onCanplaythrough(); };	// 모두 다운로드 완료
		this.playerObj.ondurationchange = function(){ html5Player.onDurationchange(); };	// 재생 시간 확인
		this.playerObj.ontimeupdate = function(){ html5Player.onTimeupdate(); };			// 재생중
		this.playerObj.onended = function(){ html5Player.onEnded(); };					// 재생완료

		if(this.playerObj.canPlayType){		
			html5Player.createControls();
		}
	}	// end getPlayer end


	// 콘트롤 생성
	html5Player.prototype.createControls = function() {
		this.controlsLayer = document.createElement("DIV");
		this.controlsLayer.style.zIndex = "200";
		this.controlsLayer.style.display = "block";
		this.controlsLayer.style.position = "absolute";		
		this.controlsLayer.style.left = "0px";
		this.controlsLayer.style.bottom = "0px"
		this.controlsLayer.style.right = "0px";
		this.controlsLayer.style.height = "65px";
		this.controlsLayer.style.backgroundImage = "url(/core/module/vod/player/images/playerBG.png)";
		this.controlsLayer.style.backgroundRepeat = "repeat";
		this.baseLayer.appendChild(this.controlsLayer);
		this.controlsLayer.innerHTML = "";

		// 프로그레스바
		progBase = document.createElement("DIV");
		progBase.style.cssText = "position:absolute; top:8px; left:10px; right:10px; height:3px; background:url(/core/module/vod/player/images/prgress_dft.png) repeat;";
		this.controlsLayer.appendChild(progBase);

		this.progBar = document.createElement("DIV");
		this.progBar.style.cssText = "position:absolute; z-index:1; left:0px; top:0px; bottom:0px; background:#1ddc00;";
		this.progBar.style.width = "0px";
		progBase.appendChild(this.progBar);

		this.progLayer = document.createElement("DIV");
		this.progLayer.style.cssText = "position:absolute; z-index:2; left:0px; top:-8px; right:0px; height:19px; background-color:#000; cursor:pointer; opacity:0;";
		this.progLayer.onclick = function(){ html5Player.onSeek(event); };
		progBase.appendChild(this.progLayer);


		// 화면 중앙 플레이 버튼
		this.btnPlayMain = document.createElement("IMG");
		this.btnPlayMain.style.cssText = "position:absolute; left:50%; top:50%; margin-left:-43px; margin-top:-43px; cursor:pointer; z-index:201;";
		// this.thumbFileExist == "N" 썸네일 이미지 존재유무
		if(this.vodType == "audio"){
			this.btnPlayMain.style.display = "none";
		} else {
			this.btnPlayMain.style.display = "block";
		}
		this.btnPlayMain.src = "/core/module/vod/player/images/btn_main_paly.png";
		if(!isMobile()){
			this.btnPlayMain.onmouseover = function(){ this.src = "/core/module/vod/player/images/btn_main_paly_on.png"; };
			this.btnPlayMain.onmouseout = function(){ this.src = "/core/module/vod/player/images/btn_main_paly.png"; };
		}
		this.btnPlayMain.onclick = function(){ html5Player.onPlay(); };
		this.baseLayer.appendChild(this.btnPlayMain);

		// 플레이 버튼
		this.btnPlay = document.createElement("IMG");
		this.btnPlay.style.cssText = "position:absolute; left:10px; top:20px; cursor:pointer;";
		this.btnPlay.style.display = "block";
		this.btnPlay.src = "/core/module/vod/player/images/btn_play.png";
		this.btnPlay.onmouseover = function(){ this.src = "/core/module/vod/player/images/btn_play_on.png"; };
		this.btnPlay.onmouseout = function(){ this.src = "/core/module/vod/player/images/btn_play.png"; };
		this.btnPlay.onclick = function(){ html5Player.onPlay(); };
		this.controlsLayer.appendChild(this.btnPlay);

		// 일시 정지 버튼
		this.btnPause = document.createElement("IMG");
		this.btnPause.style.cssText = "position:absolute; left:10px; top:20px; cursor:pointer;";
		this.btnPause.style.display = "none";
		this.btnPause.src = "/core/module/vod/player/images/btn_pause.png";
		this.btnPause.onmouseover = function(){ this.src = "/core/module/vod/player/images/btn_pause_on.png"; };
		this.btnPause.onmouseout = function(){ this.src = "/core/module/vod/player/images/btn_pause.png"; };
		this.btnPause.onclick = function(){ html5Player.onPause(); };
		this.controlsLayer.appendChild(this.btnPause);

		// 전체화면
		this.btnFull = document.createElement("IMG");
		this.btnFull.style.cssText = "position:absolute; right:10px; top:20px; cursor:pointer;";
		this.btnFull.style.display = "block";
		this.btnFull.src = "/core/module/vod/player/images/btn_big.png";
		this.btnFull.onmouseover = function(){ this.src = "/core/module/vod/player/images/btn_big_on.png"; };
		this.btnFull.onmouseout = function(){ this.src = "/core/module/vod/player/images/btn_big.png"; };
		this.btnFull.onclick = function(){ html5Player.onScreenChange(); };
		this.controlsLayer.appendChild(this.btnFull);

		// 시간
		timeLayer = document.createElement("DIV");
		timeLayer.style.cssText = "position:absolute; top:30px; left:65px; height:20px; color:#ffffff; line-height:20px; vertical-align:middle; font-size:14px; font-family:dotum; font-weight:600; letter-spacing:-0.6pt;";
		this.controlsLayer.appendChild(timeLayer);

		// 진행시간
		this.strCurrentTimeTxt = document.createElement("SPAN");
		this.strCurrentTimeTxt.style.cssText = "margin-right:4px; color:#2fe62f;";
		this.strCurrentTimeTxt.innerHTML = "00:00";
		timeLayer.appendChild(this.strCurrentTimeTxt);

		htmlSPAN = document.createElement("SPAN");
		htmlSPAN.innerHTML = "|";
		timeLayer.appendChild(htmlSPAN);

		// 재생시간
		this.strDurationTxt = document.createElement("SPAN");
		this.strDurationTxt.style.cssText = "margin-left:4px; color:#eeeeee;";
		timeLayer.appendChild(this.strDurationTxt);

		// 재생속도
		speedDiv = document.createElement("DIV");
		speedDiv.style.cssText ="position:absolute; top:20px; right:150px; float:left; color:#ffffff; vertical-align:middle; font-size:14px; font-family:dotum; font-weight:600; letter-spacing:-0.6pt;"
		this.controlsLayer.appendChild(speedDiv);
		this.speedDown =  document.createElement("IMG");
		this.speedDown.style.cssText = "float:left; cursor:pointer;";
		this.speedDown.src = "/core/module/vod/player/images/btn_left.png";
		this.speedDown.onmouseover = function(){ this.src = "/core/module/vod/player/images/btn_left_on.png"; };
		this.speedDown.onmouseout = function(){ this.src = "/core/module/vod/player/images/btn_left.png"; };
		this.speedDown.onclick = function(){ html5Player.onSpeed('Down'); };
		speedDiv.appendChild(this.speedDown);

		this.strSpeedTxt = document.createElement("SPAN");
		this.strSpeedTxt.style.cssText = "cursor:pointer;margin:1px 3px; float:left; line-height:40px; color:#ffffff; vertical-align:middle;";
		this.strSpeedTxt.innerHTML = "x1.0";
		speedDiv.appendChild(this.strSpeedTxt);

		this.speedUp =  document.createElement("IMG");
		this.speedUp.style.cssText = "float:left; cursor:pointer;";
		this.speedUp.src = "/core/module/vod/player/images/btn_right.png";
		this.speedUp.onmouseover = function(){ this.src = "/core/module/vod/player/images/btn_right_on.png"; };
		this.speedUp.onmouseout = function(){ this.src = "/core/module/vod/player/images/btn_right.png"; };
		this.speedUp.onclick = function(){ html5Player.onSpeed('Up'); };
		speedDiv.appendChild(this.speedUp);

		// 소리 조절
		sndBase = document.createElement("DIV");
		sndBase.style.cssText = "position:absolute; right:65px;width:80px; top:20px; text-align:right;";
		this.controlsLayer.appendChild(sndBase);

		// 음소거 버튼
		this.btnSnd = document.createElement("IMG");
		this.btnSnd.src = "/core/module/vod/player/images/btn_sound.png";
		this.btnSnd.style.cssText = "float:left; cursor:pointer;";
		this.btnSnd.style.display = "block";
		this.btnSnd.onmouseover = function(){ this.src = "/core/module/vod/player/images/btn_sound_on.png"; };
		this.btnSnd.onmouseout = function(){ this.src = "/core/module/vod/player/images/btn_sound.png"; };
		this.btnSnd.onclick = function(){ html5Player.onMute(true); };
		sndBase.appendChild(this.btnSnd);

		// 음소거 버튼
		this.btnSndOff = document.createElement("IMG");
		this.btnSndOff.src = "/core/module/vod/player/images/btn_sound_off.png";
		this.btnSndOff.style.cssText = "float:left; cursor:pointer;";
		this.btnSndOff.style.display = "none";
		this.btnSndOff.onmouseover = function(){ this.src = "/core/module/vod/player/images/btn_sound_off_on.png"; };
		this.btnSndOff.onmouseout = function(){ this.src = "/core/module/vod/player/images/btn_sound_off.png"; };
		this.btnSndOff.onclick = function(){ html5Player.onMute(false); };
		sndBase.appendChild(this.btnSndOff);

		// 음량
		volLayer = document.createElement("DIV");
		sndBase.appendChild(volLayer);

		// 음량 버튼
		for(i = 0; i < 10; i++){
			vv = i + 1;
			this.btnVol[i] = document.createElement("IMG");
			this.btnVol[i].setAttribute("vv", vv);
			this.btnVol[i].style.cssText = "float:left; cursor:pointer; opacity:1;";
			this.btnVol[i].style.opacity = 1;
			this.btnVol[i].src = "/core/module/vod/player/images/soundBar.png";
			this.btnVol[i].onclick = function(){ html5Player.onVolumeChange(this) };
			volLayer.appendChild(this.btnVol[i]);
		}
		this.onVolumeChange(this.btnVol[this.baseVol]);
	}	// end createControls end


	// 콘트롤 숨기기
	html5Player.prototype.hideControls = function() {
		if(this.controlsLayer.style.display == "block"){
			this.controlsLayer.style.display = "none";
		}else{
			this.controlsLayer.style.display = "block";
		}

	}	// end hideControls end


	// 시간이 지나면 콘트롤 숨기기
	html5Player.prototype.hideControlsTimeout = function() {
		if(!this.playerObj.paused){
			this.hideControls();
		}
	}	// end hideControlsTimeout end


	// 소리 크기 조절
	html5Player.prototype.onVolumeChange = function(obj){
		if(this.playerObj.muted){
			this.playerObj.muted = false;
		}
		this.btnSndOff.style.display = "none";
		this.btnSnd.style.display = "block";

		vol = parseInt(obj.getAttribute("vv")) / 10;
		this.playerObj.volume = vol;

		for(i = 0; i < 10; i++){
			tmpVV = this.playerObj.volume * 10;
			vv = parseInt(this.btnVol[i].getAttribute("vv"));
			if(tmpVV < vv){
				this.btnVol[i].style.opacity = 0.5;
			}else{
				this.btnVol[i].style.opacity = 1;
			}
		}
	}	// end onVolumeChange end


	// 음소거
	html5Player.prototype.onMute = function(mote){
		this.playerObj.muted = mote;
		if(this.playerObj.muted){
			this.btnSnd.style.display = "none";
			this.btnSndOff.style.display = "block";
			for(i = 0; i < 10; i++){
				this.btnVol[i].style.opacity = 0.5;
			}
		}else{
			this.btnSndOff.style.display = "none";
			this.btnSnd.style.display = "block";
			oi = (this.playerObj.volume * 10) - 1;
			this.onVolumeChange(this.btnVol[oi]);
		}
	}	// end onMute end


	// 영상 이동
	html5Player.prototype.onSeek = function(e){
		totalSize = this.progLayer.clientWidth;
		clickPos = (e.offsetX || e.layerX);
		clickPer = clickPos / totalSize;

		seekTime = this.playerObj.duration * clickPer;
		seekMove = seekTime - this.strCurrentTime;
		this.playerObj.currentTime += seekMove;
	}	// end onSeek end


	// 영상 다운로드 완료
	html5Player.prototype.onCanplaythrough = function() {
	}	// end onCanplaythrough end


	// 영상 재생 시간 가져옴
	html5Player.prototype.onDurationchange = function() {
		try{
			this.strDurationTxt.innerHTML = this.rtnTimeText(this.playerObj.duration);
			this.strDuration = this.playerObj.duration;
		}catch(err){
			setTimeout("html5Player.onDurationchange();", 66);
		}
	}	// end onDurationchange end


	// 영상 플레이중
	html5Player.prototype.onTimeupdate = function() {
		this.strCurrentTimeTxt.innerHTML = this.rtnTimeText(this.playerObj.currentTime);
		this.strCurrentTime = this.playerObj.currentTime;

		currentPer = (this.strCurrentTime / this.strDuration) * 100;
		this.progBar.style.width = ""+currentPer+"%";
	}	// end onTimeupdate end	


	// 버튼등 UI 변경
	html5Player.prototype.setUI = function() {
		if(this.playerObj.paused){
			this.btnPause.style.display = "none";
			this.btnPlay.style.display = "block";
		}else{
			this.btnPlay.style.display = "none";
			this.btnPause.style.display = "block";
		}
	}	// end setUI end


	// 재생
	html5Player.prototype.onPlay = function() {
		this.playerObj.play();
		this.setUI();
		this.btnPlayMain.style.display = "none";
		if(this.vodType == "audio"){
			document.getElementById('pauseimg').style.display = 'none';
			document.getElementById('playimg').style.display = 'block';
		}
		document.getElementById(this.playerID).playbackRate = this.currentSpeed;
		if(this.vodType != "audio"){
			setTimeout("html5Player.hideControlsTimeout();", 3000);
		}
	}	// end onPlay end


	// 일시정지
	html5Player.prototype.onPause = function() {
		this.playerObj.pause();
		this.setUI();
		if(this.vodType == "audio"){
			document.getElementById('pauseimg').style.display = 'block';
			document.getElementById('playimg').style.display = 'none';
		}
	}	// end onPause end


	// 재생완료
	html5Player.prototype.onEnded = function() {
		this.playerObj.pause();
		this.setUI();
		this.playerObj.currentTime = 0;
		this.progBar.style.width = "0%";
		if(this.vodType == "audio"){
			document.getElementById('pauseimg').style.display = 'block';
			document.getElementById('playimg').style.display = 'none';
		}
		this.btnPlayMain.style.display = "block";
	}	// end onEnded end

	// 재생속도
	html5Player.prototype.onSpeed = function(direction){
		if(direction == "Down"){
			if(document.getElementById(this.playerID).playbackRate <= 0.6) return;
			document.getElementById(this.playerID).playbackRate -= 0.2;
			this.currentSpeed -= 0.2;
			this.strSpeedTxt.innerHTML = "x " + document.getElementById(this.playerID).playbackRate.toFixed(1);
		} else {
			if(document.getElementById(this.playerID).playbackRate >= 1.8) return;
			document.getElementById(this.playerID).playbackRate += 0.2;
			this.currentSpeed += 0.2;
			this.strSpeedTxt.innerHTML = "x " + document.getElementById(this.playerID).playbackRate.toFixed(1);
		}
	}	// e


	// fullscreen
	html5Player.prototype.onScreenChange = function(){
		if(parent.parent.window.frames.length == 1){
			if(!document.fullscreenElement && !document.mozFullScreenElement && !document.webkitFullscreenElement && !document.msFullscreenElement){
				if(this.baseLayer.requestFullscreen){
					this.baseLayer.requestFullscreen();
				}else if(this.baseLayer.mozRequestFullScreen) {
					this.baseLayer.mozRequestFullScreen();
				}else if(this.baseLayer.webkitRequestFullscreen) {
					this.baseLayer.webkitRequestFullscreen();
				} else if(this.baseLayer.msRequestFullscreen){
					this.baseLayer.msRequestFullscreen();
				} else {
					alert("전체화면이 지원되지 않는 브라우저입니다.");
				}
			}else{
				if(document.exitFullscreen){
					document.exitFullscreen();
				}else if(document.webkitCancelFullScreen){
					document.webkitCancelFullScreen();
				}else if(document.cancelFullScreen){
					document.cancelFullScreen();
				}else if(document.mozCancelFullScreen){
					document.mozCancelFullScreen();
				}else if(document.msExitFullscreen){
					document.msExitFullscreen();
				}
			}
		} else {
			alert("해당스킨에서는 전체화면 기능을 지원하지 않습니다.");
		}
	}	// end onScreenChange end


	// 시간 리턴 함수
	html5Player.prototype.rtnTimeText = function(secInt){
		secInt = parseInt(secInt);
		var min = 0;
		var sec = 0;
		var minStr, secStr;

		min = parseInt(secInt / 60);
		sec = secInt - (min * 60);

		if(min < 10){
			minStr = "0"+min;
		}else{
			minStr = min;
		}
		if(sec < 10){
			secStr = "0"+sec;
		}else{
			secStr = sec;
		}
		return minStr + ":" + secStr;
	}	// end rtnTimeText end
}	// end html5Player
