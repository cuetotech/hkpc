

// 방송 내용 부분
vod = function(pageCode){	
	this.pageCode = pageCode;		// 페이지코드

	this.shadow = null;			// 그림자 레이어
	this.shadowInt = null;		// 그림자 레이어 크기조절

	this.baseLayer = null;		// base레이어
	this.baseInt = null;		// base레이어 크기조절

	this.docXML;				// XML데이터 return 값
	this.callback = null;		// XML결과 return함수
	this.httpRequest = null;	// httpRequest객체

	this.conf = new Array();		// 방송 설정
	this.num = null;				// 번호
	this.vodType = null;			// 방송타입
	this.playerType = null;			// 플레이어 형식
	this.viewType = "popup";		// 방송보기 형식 (popup : layer : view)
	this.popSkin = "default";		// 방송팝업 스킨 (default : search)
	this.playerWidth = 700;			// 플레이어 전체 넓이
	this.playerHeight = 700;		// 플레이어 전체 높이
	this.isStreaming = "N";			// 스트리밍 가능한지 체크
	this.isListOpen = "open";
	this.prAutoPlay = 1;		// AUTOSTART

	var uanaVigatorOs = navigator.userAgent;
	var AgentUserOs= uanaVigatorOs.replace(/ /g,'');

	// 브라우져 호환성 체크 (IE9 이상은 IE이외 브라우져로 체크함)
	this.isIE = false;
	if((navigator.appName.indexOf('Microsoft')+1)){
		re = new RegExp("MSIE ([0-9]{1,}[\.0-9]{0,})");
		if (re.exec(navigator.userAgent) != null){ 
			rv = parseFloat(RegExp.$1);
			if(rv < 10) this.isIE = true;
		}
	}else{
		this.isIE = false;
	}	// end IE check if


	// httpRequest 객체 생성 함수
	vod.prototype.getXMLHttpRequest = function() {
		if (window.ActiveXObject) {
			try {
				return new ActiveXObject("Msxml2.XMLHTTP");
			} catch(e) {
				try {
					return new ActiveXObject("Microsoft.XMLHTTP");
				} catch(e1) { return null; }
			}
		} else if (window.XMLHttpRequest) {
			return new XMLHttpRequest();
		} else {
			return null;
		}
	}	//	end getXMLHttpRequest function
	
	// httpRequest send 함수
	vod.prototype.sendRequest = function(url, params, callback, method) {
		this.callback = callback;

		this.httpRequest = this.getXMLHttpRequest();
		var httpMethod = method ? method : 'GET';
		if (httpMethod != 'GET' && httpMethod != 'POST') {
			httpMethod = 'GET';
		}
		var httpParams = (params == null || params == '') ? null : params;
		var httpUrl = url;
		if (httpMethod == 'GET' && httpParams != null) {
			httpUrl = httpUrl + "?" + httpParams;
		}
		this.httpRequest.open(httpMethod, httpUrl, true);
		this.httpRequest.setRequestHeader(
			'Content-Type', 'application/x-www-form-urlencoded');
		
		var request = this;
		this.httpRequest.onreadystatechange = function() {
			request.onStateChange.call(request);
		}
		this.httpRequest.send(httpMethod == 'POST' ? httpParams : null);	
	}	// end sendRequest function

	// httpRequest return 함수
	vod.prototype.onStateChange = function() {
		this.callback(this.httpRequest);
	}	// end onStateChange end

	// 리스트xml호출
	vod.prototype.requestXML = function(){
		params  = "pageCode=" + this.pageCode;
		params += "&num=" + this.num;
		params += "&vodType=" + this.vodType;
		this.sendRequest("/core/xml/vod/vodInfo.xml.html", params, this.resultXML, "POST");
	}	// end requestXML function

	// 신고글 체크 
	vod.prototype.reportCheck = function(tableName, num){
		params = "&pageCode=" + this.pageCode;
		params += "&tableName="+tableName;
		params += "&num="+num;
		this.sendRequest("/core/xml/vod/vodReport.xml.html", params, this.resultXML, "POST");
	}	// end reportCheck function

	// XML결과
	vod.prototype.resultXML = function(){
		if(this.httpRequest.readyState == 4){
			if(this.httpRequest.status == 200){

				//alert(this.httpRequest.responseText);
				
				this.docXML = this.httpRequest.responseXML;
				code = this.docXML.getElementsByTagName("code").item(0).firstChild.nodeValue;	// 결과코드

				// 결과 실행
				switch (code){
					case 'ErrorMsg':
						message = this.docXML.getElementsByTagName("message").item(0).firstChild.nodeValue;	// 리턴메시지
						alert(message);
						break;

					case 'vodInfo':
						this.init();
						break;

					case 'noEvent':									
						break;

					// 신고글 체크
					case 'reportCheck':
						this.reportOpen();
						break;

					default:
						alert("결과코드 없음");
						break;
				}
			}
		}
	}	// end resultXML function


	// player생성
	vod.prototype.init = function(){
		vodFile = this.docXML.getElementsByTagName("vodFile").item(0).firstChild.nodeValue;
		vodPath = this.docXML.getElementsByTagName("vodPath").item(0).firstChild.nodeValue;
		playerType = this.docXML.getElementsByTagName("playerType").item(0).firstChild.nodeValue;
		isStreaming = this.docXML.getElementsByTagName("isStreaming").item(0).firstChild.nodeValue;
		thumbFile = this.docXML.getElementsByTagName("thumbFile").item(0).firstChild.nodeValue;
		thumbFileImg = this.docXML.getElementsByTagName("thumbFileImg").item(0).firstChild.nodeValue;
		thumbFileExist = this.docXML.getElementsByTagName("thumbFileExist").item(0).firstChild.nodeValue;
		vodServer = this.docXML.getElementsByTagName("vodServer").item(0).firstChild.nodeValue;
		resType = this.docXML.getElementsByTagName("resType").item(0).firstChild.nodeValue;
		this.playerType = playerType;
		this.resType = resType;
		this.isStreaming = isStreaming;
		this.setPlayerSize();

		// 확장자 추출
		var ext = "";
		var len = vodFile.length;
		var last = vodFile.lastIndexOf(".");
		if( last != -1 ){
			var ext = vodFile.substring(last, len);
			ext = ext.toLowerCase();
		}

		switch(playerType){
			case 'flash':
				if(this.isStreaming == "Y" && !this.isIE){
					//this.playerTag(vodPath, playerType, isStreaming, thumbFile, vodServer);
					this.playerTag(vodPath, "video", this.isStreaming, thumbFile, thumbFileExist, vodServer);	
					this.playerType = "tag";
				}else{
					// 170120 오지숙 산본아름다운교회 요청으로 외부영상 비디오태그로 재생되도록 수정
					if(this.isIE){
						this.playerFlash(vodFile, playerType, this.isStreaming, thumbFile, vodServer);
					}else{
						this.playerTagOut(vodFile, playerType, isStreaming, thumbFile, vodServer);
					}
					//this.playerFlash(vodFile, playerType, this.isStreaming, thumbFile, vodServer);
				}
				break;

			case 'wmp':
				if(ext == ".mp3" && !this.isIE){
					if(isMobile() && !isApp()){
						this.playerType = "tagAudio";
						var agent = navigator.userAgent.toLowerCase(); 
						if (agent.indexOf("chrome") == 96 ) {							
							this.playerTag(vodFile, "audio", isStreaming, thumbFile, thumbFileExist, "");
						} else {
							this.playerTagAudio(vodFile, this.playerType, isStreaming, thumbFile, vodServer);
						}
					} else {
						if(isApp()){
							this.playerTag(vodFile, "audio", isStreaming, thumbFile, thumbFileExist, "");
						} else if( AgentUserOs.indexOf("Mac") != -1){
							this.playerTagAudio(vodFile, this.playerType, isStreaming, thumbFile, vodServer);
						} else {
							this.playerTag(vodFile, "audio", isStreaming, thumbFile, thumbFileExist, "");
						}
					}
				}else{
					this.playerWMP(vodFile, playerType, isStreaming, thumbFile);
				}
				break;

			case 'iframe':
				this.playerFrame(vodFile, playerType, isStreaming, thumbFile);
				break;

			default:
				alert("영상을 재생할수 없습니다.");
				break;
		}

	}	// end init function


	// 방송보기 선택
	vod.prototype.vodView = function(num, vodType){

		// 반응형 
		document.location.href = document.location.pathname + document.location.search + "&Mode=view&num="+num+"&vodType="+vodType;

	}	// end vodView function

	// 파일다운로드보기
	vod.prototype.downView = function(objID){
		
		if(document.getElementById(objID).style.display == "none"){
			document.getElementById(objID).style.display = "block";
		}else{
			document.getElementById(objID).style.display = "none";
		}		
	}	// end downView function


	// 비디오 테그
	//vod.prototype.playerTag = function(vodPath, playerType, isStreaming, thumbFile, vodServer){
	vod.prototype.playerTag = function(vodPath, playerType, isStreaming, thumbFile, thumbFileExist, vodServer){
		html5Player = new html5Player("vodPlayer", "playerArea");
		//html5Player.vodUrl = "http://"+vodServer+"/"+vodPath;
		if(vodPath.substring(0, 7) != "http://"){
			//if (document.location.protocol == 'https:') {
			if(vodServer == "vod.hanaroch.org"){
				html5Player.vodUrl = "https://"+vodServer+"/"+vodPath;
			} else {
				html5Player.vodUrl = "http://"+vodServer+"/"+vodPath;
			}
			if(vodPath.substring(0, 8) == "https://") {
				html5Player.vodUrl = vodPath;		
			}
		} else {
			html5Player.vodUrl = vodPath;
		}

		if(this.prAutoPlay == "AUTOPLAY"){
			this.prAutoPlay = 1;
		}
		html5Player.vodType = playerType;
		html5Player.thumbFileExist = thumbFileExist;
		html5Player.mainImage = thumbFile;
		html5Player.prAutoPlay = this.prAutoPlay;	
		html5Player.init();

		/*txt  = "";
		txt += "<video style='width:100%; height:100%;' oncontextmenu='return false;' controls>";
		txt += "<source src='http://"+vodServer+"/"+vodPath+"' type='video/mp4'>";
		txt += "</video>";
		
		document.getElementById("playerArea").innerHTML = txt;
		*/
	}	// end playerTag function

	// 비디오 테그 외부서버
	vod.prototype.playerTagOut = function(vodFile, playerType, isStreaming, thumbFile, vodServer){
		txt  = "";
		txt += "<video style='width:100%; height:100%;' oncontextmenu='return false;' controls>";
		txt += "<source src='"+vodFile+"' type='video/mp4'>";
		txt += "</video>";
		
		document.getElementById("playerArea").innerHTML = txt;
	}	// end playerTag function


	// 오디오 테그
	vod.prototype.playerTagAudio = function(vodPath, playerType, isStreaming, thumbFile, vodServer){
		this.listClose("A");
		txt  = "";
		txt += "<audio controls autoplay style='width:100%;'>";
		txt += "<source src='"+vodFile+"' type='audio/mp3'>";
		txt += "</audio>";		
		document.getElementById("playerArea").innerHTML = txt;
	}	// end playerTagAudio function


	// 플레쉬 플레이어
	vod.prototype.playerFlash = function(vodFile, playerType, isStreaming, thumbFile, vodServer){
		if(isStreaming == "Y"){
			swfUrl = "/core/ucc/player/vodPlayer.swf";	// 로딩될 파일명
		}else{
			swfUrl = "/core/ucc/player/anyPlayerUrl.swf";	// 로딩될 파일명
		}
		swfID = "vodPlayer";		// 플레쉬 객체 ID
		vodUrl = vodFile;			// 동영상 URL
		mainImage = thumbFile;		// 동영상 메인 썸네일 이미지
		loadScript = "";			// 영상 로딩후 스크립트 처리
		prDocWidth = this.playerWidth;		// swf넓이
		prDocHeight = this.playerHeight;	// swf높이
		prAutoPlay = this.prAutoPlay;					// 자동시작

		vars  = "vodUrl="+vodUrl;
		vars += "&vodServer="+vodServer;
		vars += "&mainImage="+mainImage;
		vars += "&loadScript="+loadScript;
		vars += "&prDocWidth="+prDocWidth;
		vars += "&prDocHeight="+prDocHeight;
		vars += "&prAutoPlay="+prAutoPlay;

		if ((navigator.appName.indexOf('Microsoft')+1)) {
			var txt = '<object classid="clsid:D27CDB6E-AE6D-11cf-96B8-444553540000" codebase="http://fpdownload.macromedia.com/pub/shockwave/cabs/flash/swflash.cab#version=8,0,0,0" width="'+prDocWidth+'" height="'+prDocHeight+'" id="'+swfID+'" align="middle">';
			txt+= '<param name="allowScriptAccess" value="always" />';
			txt+= '<param name="flashVars" value="'+vars+'" />';
			txt+= '<param name="movie" value="'+swfUrl+'" />';
			txt+= '<param name="quality" value="high" />';
			txt+= '<param name="wmode" value="window" />';
			txt+= '<param name="allowFullScreen" value="true" />';
			txt+= '<embed src="'+swfUrl+'" allowFullScreen="true" quality="high" wmode="window" style="width:'+prDocWidth+'px; height:'+prDocHeight+'px;" align="middle" allowScriptAccess="always" showLiveConnect="true" name="'+swfID+'" type="application/x-shockwave-flash" pluginspage="http://www.macromedia.com/go/getflashplayer" flashVars="'+vars+'"></embed>';
			txt+= '</object>';
		} else {
			txt = '<embed id="'+swfID+'" src="'+swfUrl+'" allowFullScreen="true" quality="high" wmode="window" style="width:'+prDocWidth+'px; height:'+prDocHeight+'px;" align="middle" allowScriptAccess="always" showLiveConnect="true" name="'+swfID+'" type="application/x-shockwave-flash" pluginspage="http://www.macromedia.com/go/getflashplayer" flashVars="'+vars+'"></embed>';
		}
		document.getElementById("playerArea").innerHTML = txt;
	}	// end playerFlash function


	// 윈도우미디어 플레이어
	vod.prototype.playerWMP = function(vodFile, playerType, isStreaming, thumbFile){
		mediaID = "vodPlayer";		// 미디어플레이어 객체
		prDocWidth = this.playerWidth;		// 넓이
		prDocHeight = this.playerHeight;	// 높이

		if(this.viewType == "view") prDocWidth = this.playerWidth - 330;

		var txt = "";
		if ((navigator.appName.indexOf('Microsoft')+1)) {
			txt += "<object classid='CLSID:6BF52A52-394A-11d3-B153-00C04F79FAA6' codebase='http://activex.microsoft.com/activex/controls/mplayer/en/nsmp2inf.cab#Version=7.00.00.000' autoStart='"+prAutoPlay+"' enabled='1' enableContextMenu='0' uiMode='full' stretchToFit='1' width='"+prDocWidth+"' height='"+prDocHeight+"' id='"+mediaID+"'>";
			txt += "<param name='animationatstart' value='true' />";
			txt += "<param name='transparentatstart' value='true' />";
			txt += "<param name='URL' value=\""+vodFile+"\" />";
			txt += "<param name='autoStart' value='"+this.prAutoPlay+"' />";
			txt += "<param name='enabled' value='1' />";
			txt += "<param name='enableContextMenu' value='0' />";
			txt += "<param name='uiMode' value='full' />";
			txt += "<param name='stretchToFit' value='1' />";
			txt += "<param name='width' value='"+prDocWidth+"' />";
			txt += "<param name='height' value='"+prDocHeight+"' />";
			txt += "<param name='id' value='"+mediaID+"' />";
			txt += "<param name='windowlessVideo' value='true' />";
			txt += "<param name='wmode' value='transparent' />";
			txt += "</object>";
		}else{
			txt += "<embed src=\""+vodFile+"\" autoStart='"+this.prAutoPlay+"' windowlessVideo='true' wmode='transparent' bgcolor='white' enabled='1' enableContextMenu='0' uiMode='full' stretchToFit='1' width='"+prDocWidth+"' height='"+prDocHeight+"' id='"+mediaID+"' type='application/x-mplayer2' pluginspage='http://microsoft.com/windows/mediaplayer/en/download/'></embed>";
		}
		document.getElementById("playerArea").innerHTML = txt;
	}	// end playerWMP function


	// iframe 플레이어
	vod.prototype.playerFrame = function(vodFile, playerType, isStreaming, thumbFile){
		mediaID = "vodPlayer";		// 미디어플레이어 객체
		prDocWidth = this.playerWidth;	// 넓이
		prDocHeight = this.playerHeight;// 높이
		prAutoPlay = (this.autoPlay == "Y") ? "1" : "0";

		var txt = "<iframe frameborder='0' name='"+mediaID+"' id='"+mediaID+"' scrolling='no' width='"+prDocWidth+"' height='"+prDocHeight+"' src='"+vodFile+"' webkitallowfullscreen mozallowfullscreen allowfullscreen></iframe>";
		document.getElementById("playerArea").innerHTML = txt;

		searchWord = vodFile.search(/vimeo/g);
		if(searchWord > 0){
			var options = {
	//			id: 345270068,
				width: 640,
				loop: true
			};

			var player = new Vimeo.Player("playerArea", options);
			//player.setVolume(0);

			player.on('play', function() {
				console.log('played the video!');
			});

			if(!isApp('ios') && isMobile()){
				shadowHTML = "<div style=\"position:absolute; left:0px; top: 0px; right:0px; bottom:0px; background-color:#fff; opacity:0; z-index:999;\" onclick=\"document.location.href='"+vodFile+"';\"></div>";
				document.getElementById("playerArea").innerHTML += shadowHTML;
			} else if(isApp('ios') && isMobile()){
				shadowHTML = "<div style=\"position:absolute; left:0px; top: 0px; right:0px; bottom:0px; background-color:#fff; opacity:0; z-index:999;\"></div>";
				document.getElementById("playerArea").innerHTML += shadowHTML;
				
				$(".playZone").on("click", function () {
					var player = new Vimeo.Player("playerArea", options);
					player.play();//재생
				});
			}
		}

		this.resizePlayer();
	}	// end iframe function


	// 방송플레이어 resize
	vod.prototype.resizePlayer = function(resizeType){

		// 오디오 테그
		if(this.playerType == "tagAudio"){
			this.listClose('A');
			return;
		}

		if(!document.getElementById("vodPlayer") && this.playerType != "tag"){
			nextScript = "vod.resizePlayer("+resizeType+");";
			setTimeout(nextScript, 1000);
			return false;
		}
		this.setPlayerSize();		

		switch(this.playerType){
			case 'flash':
				this.thisMovie("vodPlayer").style.width = '' + this.playerWidth + 'px';
				this.thisMovie("vodPlayer").style.height = '' + this.playerHeight + 'px';
				try{
					this.thisMovie("vodPlayer").callResize(this.playerWidth, this.playerHeight);
				}catch(e){
					nextScript = "vod.resizePlayer("+resizeType+");";
					setTimeout(nextScript, 1000);
					return false;
				}
				break;

			case 'wmp':
				document.getElementById("vodPlayer").setAttribute("width", this.playerWidth);
				document.getElementById("vodPlayer").setAttribute("height", this.playerHeight);
				break;

			case 'iframe':
				document.getElementById("vodPlayer").setAttribute("width", this.playerWidth);
				document.getElementById("vodPlayer").setAttribute("height", this.playerHeight);				
				break;
		}
		
		nextScript = "vod.resizePlayer("+resizeType+");";
		setTimeout(nextScript, 33);
	}	// end resizePlayer function	


	// 플레이어 크기 정리
	vod.prototype.setPlayerSize = function(){		
		this.playerWidth = document.getElementById("playerArea").offsetWidth;
		if(this.resType == "4-3"){
			this.playerHeight = parseInt(this.playerWidth * 0.75) + 30
		}else{
			this.playerHeight = parseInt(this.playerWidth * 0.5625) + 30
		}

		// 400 이하의 경우 리스트 항목 삭제
		vodBasePlayerWidth = document.getElementById("vodBasePlayer").offsetWidth;
		if(vodBasePlayerWidth < 800){			
			this.listClose('A');
		}else{
			if(this.isListOpen == "open"){
				this.listOpen();
			}else{
				this.listClose('N');
			}
		}
	}	// end setPlayerSize function


	// 플레쉬 객체 가져오기
	vod.prototype.thisMovie = function(movieName){
		if (window.document[movieName]){
			return window.document[movieName];
		}
		if (navigator.appName.indexOf("Microsoft Internet")==-1){
			if (document.embeds && document.embeds[movieName])
			return document.embeds[movieName]; 
		}else{
			return document.getElementById(movieName);
		}
		return false;
	}	// end thisMovie function


	// SNS연동
	vod.prototype.goSNS = function(snsSvc, msg, url, msg2, vtype){
		switch(snsSvc){
			case 'facebook':
				openUrl = "http://www.facebook.com/sharer.php?title_nobase64="+ msg +"&u="+url + "&p[images][0]=" + msg2;
				break;

			case 'twitter':
				var openUrl = "http://twitter.com/home?status=" + msg + " " + url;	 
				break;

			case 'me2day':
				openUrl = "http://me2day.net/posts/new?new_post[body]=&quot;"+msg+"&quot;:"+url+"&new_post[tags]="+msg2;
				break;

			case 'cyworld':
				openUrl = "http://csp.cyworld.com/bi/bi_recommend_pop.php?url=" + url + "&corpid=etoos&summary_nobase64=" + msg2 + "&title_nobase64=" + msg;			
				break;

			case 'yozm':
				openUrl = "http://yozm.daum.net/api/popup/prePost?link="+msg2+"&prefix="+msg;			
				break;

			case 'kakaostory':
				openUrl = "https://story.kakao.com/share?url="+url+"&referrer="+msg;			
				break;

			case 'kakaotalk':
				openUrl = "/core/mobile/broadcast/sns/kakaolink.html?pageCode="+msg+"&num="+msg2+"&url="+url+"&vtype="+vtype;
				break;

			case 'band':
				openUrl = "http://www.band.us/plugin/share?body="+msg+encodeURIComponent('\n')+url+"&route="+msg2;	
				break;

			case 'googleplus':
				openUrl = "https://plus.google.com/share?url="+url+"&btmpl=popup";	
				break;

		}
		if(!isApp()){
			var a = window.open(openUrl, "sns");			 
			if ( a ) {	 
				a.focus();	 
			}
		}else{
			document.location.href=openUrl;
		}
	}	// end goSNS function

	// 액션 목록
	vod.prototype.tobeAct = function(act, num){

		switch(act){
			// 주소복사
			case 'url':
				if((navigator.appName.indexOf('Microsoft')+1)){
					window.clipboardData.setData('Text', num);
					alert("주소가 복사되었습니다. \'Ctrl+V\'를 눌러 붙여넣기 해주세요.");
				}else{
					temp = prompt("이 글의 트랙백 주소입니다. Ctrl+C를 눌러 클립보드로 복사하세요", num);
				}
				break;
		}		
	}	// end tobeAct function



	// sns 아이콘 보기
	vod.prototype.snsIconView = function(t){
		if(t == 'm'){
			if(document.getElementById("AB_viewSNSMo").style.display == "block"){
				document.getElementById("AB_viewSNSMo").style.display = "none";
			}else{
				document.getElementById("AB_viewSNSMo").style.display = "block";
			}
		}else{
			if(document.getElementById("AB_viewSNS").style.display == ""){
				document.getElementById("AB_viewSNS").style.display = "none";
				document.getElementById("AB_viewIconSNS").src = "/core/module/vod/responsive_default/images/bul_arrow_left.png";
			}else{
				document.getElementById("AB_viewSNS").style.display = "";
				document.getElementById("AB_viewIconSNS").src = "/core/module/vod/responsive_default/images/bul_arrow_right.png";
			}
		}
	}	// end snsIconView function

	// 리사이즈 체크
	vod.prototype.snsResizeCheck = function(){

		pWidth = document.body.scrollWidth;

		if(pWidth < 513){
			document.getElementById("AB_viewSNS").style.display = "none";
			document.getElementById("AB_viewIconSNS").src = "/core/module/vod/responsive_default/images/bul_arrow_left.png";
			document.getElementById("AB_viewSNS").style.display = "none";
			document.getElementById("AB_viewSNSBtnMo").style.display = "";
		}else{
			document.getElementById("AB_viewSNSMo").style.display = "none";
			document.getElementById("AB_viewSNSBtnMo").style.display = "none";
			document.getElementById("AB_viewSNS").style.display = "";
		}
		setTimeout("vod.snsResizeCheck();", 66);
	}	// end snsResizeCheck function


	// 댓글 체크
	vod.prototype.commentWriteCheck = function(form, act, idx){		

		// 작성자를 체크
		if(act != 'commentDelete'){
			if(trim(form.name.value) == ""){
				alert("\작성자를 입력하세요. ");
				form.name.focus();
				return false;
			}
		}

		// 비밀번호 체크
		if(trim(form.password.value) == ""){
			alert("\비밀번호를 입력하세요. ");
			form.password.focus();
			return false;
		}

		// 내용 체크
		if(act != 'commentDelete'){
			if(trim(form.content.value) == ""){
				alert("\내용을 입력하세요. ");
				form.content.focus();
				return false;
			}
		}

		actForm = document.commentForm;
		if(act != 'commentDelete'){
			actForm.name.value = form.name.value;		
			actForm.content.value = form.content.value;
		}
		actForm.processType.value = act;
		actForm.commentNum.value = idx;
		actForm.password.value = form.password.value;
		new cryptSubmit(actForm, actForm.cryptKey); // 글등록
	}	// end commentWriteCheck function


	// 코멘트 답변 또는 수정 폼 생성
	vod.prototype.commentFormSet = function(idx, act){

		switch(act){
			// 코멘트 수정
			case 'commentModify':
				if(document.getElementById("comment_modify_"+idx).style.display != "block"){
					document.getElementById("comment_modify_"+idx).style.display = "block";
					document.getElementById("comment_reply_"+idx).style.display = "none";
					//document.getElementById("comment_delete_"+idx).style.display = "none";
					document.getElementById("comment_modify_"+idx).innerHTML = document.getElementById(act).innerHTML;			
					document.forms["comment_modify_"+idx].name.value = document.getElementById("comment_name_"+idx).innerHTML;
					document.forms["comment_modify_"+idx].content.value = document.getElementById("comment_content_"+idx).value;
					document.forms["comment_modify_"+idx].inputBtn.onclick = function(){ vod.commentWriteCheck(document.forms["comment_modify_"+idx], 'commentModify', idx); }
				}else{
					document.getElementById("comment_modify_"+idx).style.display = "none";
				}
				break;

			// 댓글의 댓글
			case 'commentReply':
				if(document.getElementById("comment_reply_"+idx).style.display != "block"){
					document.getElementById("comment_reply_"+idx).style.display = "block";
					document.getElementById("comment_modify_"+idx).style.display = "none";
					//document.getElementById("comment_delete_"+idx).style.display = "none";
					document.getElementById("comment_reply_"+idx).innerHTML = document.getElementById(act).innerHTML;
					document.forms["comment_reply_"+idx].inputBtn.onclick = function(){ vod.commentWriteCheck(document.forms["comment_reply_"+idx], 'commentReply', idx); }
				}else{
					document.getElementById("comment_reply_"+idx).style.display = "none";
				}
				break;

			// 코멘트 삭제
			case 'commentDelete':
				/*if(document.getElementById("comment_delete_"+idx).style.display != "block"){
					document.getElementById("comment_delete_"+idx).style.display = "block";
					document.getElementById("comment_modify_"+idx).style.display = "none";
					document.getElementById("comment_reply_"+idx).style.display = "none";
					document.getElementById("comment_delete_"+idx).innerHTML = document.getElementById(act).innerHTML;
					document.forms["comment_delete_"+idx].inputBtn.onclick = function(){ vod.commentWriteCheck(document.forms["comment_delete_"+idx], 'commentDelete', idx); }
				}else{
					document.getElementById("comment_delete_"+idx).style.display = "none";
				}
				*/
				break;

			////
			default:
				alert("잘못된 값입니다.");
				break;
		}		
	}	// end commentFormSet function


	// 코멘트 삭제
	vod.prototype.commentDelete = function(num){
		if(confirm("정말로 삭제하시겠습니까?")){
			actForm = document.commentForm;
			actForm.processType.value = 'commentDelete';
			actForm.commentNum.value = num;
			new cryptSubmit(actForm, actForm.cryptKey);
		}
	}	// end commentDelete function


	// 댓글 보기
	vod.prototype.commentView = function(){
		if(document.getElementById("AB_commentView").style.display == "block"){
			document.getElementById("AB_commentView").style.display = "none";
		}else{
			document.getElementById("AB_commentView").style.display = "block";
		}
	}	// end commentView function


	// 리스트 형식 변경
	vod.prototype.listTypeChange = function(listType){
		boardListTypeKey = "VODLIST_"+this.pageCode;
		setCookie(boardListTypeKey, listType, 365, null);
		document.location.reload();
	}	// end listType function


	// 방송보기 페이지에서 리스트 열기
	vod.prototype.listOpen = function(){
		document.getElementById("vodPlayLeft").style.paddingRight = "400px";
		document.getElementById("vodPlayRight").style.display = "block";
		document.getElementById("vodSideOpen").style.display = "block";
		document.getElementById("vodSideClose").style.display = "none";
		document.getElementById("vodPlaySide").style.display = "block";
		document.getElementById("playerParent").style.paddingRight = "17px";
		this.isListOpen = "open";
	}	// end listOpen function


	// 방송보기 페이지에서 리스트 닫기
	vod.prototype.listClose = function(ct){
		document.getElementById("vodPlayLeft").style.paddingRight = "0px";
		document.getElementById("vodPlayRight").style.display = "none";
		document.getElementById("vodSideOpen").style.display = "none";
		document.getElementById("vodSideClose").style.display = "block";

		// 전체 닫기
		if(ct == "A"){
			document.getElementById("vodPlaySide").style.display = "none";
			document.getElementById("playerParent").style.paddingRight = "0px";
		}else{
			document.getElementById("vodPlaySide").style.display = "block";
			document.getElementById("playerParent").style.paddingRight = "17px";
			this.isListOpen = "close";
		}
	}	// end listClose function


	/************** 이미지 크기 위치 조절 list2 ****************/

	// 이미지 크기 조절 실행
	vod.prototype.setImageResizeListType = function(num){
		setTimeout("vod.imageResizeListType('"+num+"');", 300);
	}	// end setImageResizeListType function


	vod.prototype.imageResizeListType = function(num){
		boxObj = document.getElementById("imageBox_"+num);
		imgObj = document.getElementById("ab_imageBox_"+num);

		img = new Image();
		img.src = imgObj.src;
		imgWidth = img.width;
		imgHeight = img.height;

		boxWidth = boxObj.clientWidth;
		boxHeight = boxObj.clientHeight;		
		
		if((boxWidth / boxHeight) > (imgWidth / imgHeight)){
			imgW = boxWidth;
			imgH = (boxWidth / imgWidth) * imgHeight;

			imgT = parseInt((imgH - boxHeight) / 2);
			imgTop = "-"+imgT+"px";
			imgLeft = "0px";
		}else{
			imgW = (boxHeight / imgHeight) * imgWidth;
			imgH = boxHeight;

			imgL = parseInt((imgW - boxWidth) / 2);
			imgTop = "0px";
			imgLeft = "-"+imgL+"px";			
		}

		imgObj.style.width = ""+parseInt(imgW)+"px";
		imgObj.style.height = ""+parseInt(imgH)+"px";
		imgObj.style.top = imgTop;
		imgObj.style.left = imgLeft;
		setTimeout("vod.imageResizeListType('"+num+"');", 16);
	}	// end imageResizeListType function


	// 레이어 그림자 생성
	vod.prototype.shadowCreate = function() {
		if(this.shadow != null){
			return;
		}
		
		docBody = document.body;
		this.shadow = document.createElement("DIV");
		docBody.appendChild(this.shadow); 
		this.shadow.style.zIndex = "900";
		this.shadow.style.position = "absolute";
		this.shadow.style.top = "0px";
		this.shadow.style.left = "0px";
		this.shadow.style.width = ((document.documentElement.scrollWidth > document.body.scrollWidth) ? document.documentElement.scrollWidth : document.body.scrollWidth) + 'px';
		this.shadow.style.height = ((document.documentElement.scrollHeight > document.body.scrollHeight) ? document.documentElement.scrollHeight : document.body.scrollHeight) + 'px';
		this.shadow.style.background = "#333333";
		this.shadow.style.display = "block";
		this.shadow.style.backgroundAttachment = "fixed";
		this.shadow.setAttribute('id', 'contextShadow');
		this.shadowInt = setInterval("vod.shadowResize();", 100);
	}	//	end createShadow function


	// 레이어 그림자 크기 조절
	vod.prototype.shadowResize = function(){
		if(this.shadow != null){
			this.shadow.style.width = ((document.documentElement.scrollWidth > document.body.scrollWidth) ? document.documentElement.scrollWidth : document.body.scrollWidth) + 'px';
			this.shadow.style.height = ((document.documentElement.scrollHeight > document.body.scrollHeight) ? document.documentElement.scrollHeight : document.body.scrollHeight) + 'px';		
		}
	}	// end shadowResize function


	// 레이어 그림자 삭제
	vod.prototype.shadowRemove = function(){
		this.shadowInt = null;
		if(this.shadow != null){
			document.body.removeChild(this.shadow);
		}
		this.shadow = null;
	}	// end createShadow function


	// 객체 X좌표찾기
	vod.prototype.findPosX = function(obj){
		var curleft = 0;
		if(obj.offsetParent){
			while(obj.offsetParent){
				curleft += obj.offsetLeft;
				obj = obj.offsetParent;
			}
		}else if(obj.x) curleft += obj.x;

		return curleft;
	}	// end findPosX	function

	// 신고하기 레이어 열기
	vod.prototype.reportOpen = function(){
		tableName = this.docXML.getElementsByTagName("tableName").item(0).firstChild.nodeValue;
		num = this.docXML.getElementsByTagName("num").item(0).firstChild.nodeValue;

		htmlDIV = document.createElement('DIV');
		htmlDIV.setAttribute("id", "reportDiv");
		document.getElementById("reportArea").appendChild(htmlDIV);

		htmlP = document.createElement('P');
		htmlDIV.appendChild(htmlP);

		htmlSPAN = document.createElement('SPAN');
		htmlSPAN.innerHTML = "신고하기";
		htmlSPAN.style.color = "black";
		htmlP.appendChild(htmlSPAN);

		htmlSPAN2 = document.createElement('SPAN');
		htmlSPAN2.className = "reportClose";
		htmlSPAN2.innerHTML = "<img src='/core/mobile/images/close001.png' onclick='vod.reportClose();'>";
		htmlP.appendChild(htmlSPAN2);

		htmlSPAN3 = document.createElement('SPAN');
		htmlSPAN3.innerHTML = "1. 신고대상을 선택하세요";
		htmlSPAN3.style.color = "black";
		htmlDIV.appendChild(htmlSPAN3);

		htmlDIV2 = document.createElement('DIV');
		htmlDIV2.className = "type";
		htmlDIV.appendChild(htmlDIV2);

		reportType = this.docXML.getElementsByTagName("reportType").length;
		for(i = 0;  i < reportType; i++){
			typeObj = this.docXML.getElementsByTagName("reportType").item(i);
			typeKey = typeObj.getAttribute('key');
			typeText = typeObj.getAttribute('typeText');
			typeVal = typeObj.firstChild.nodeValue;
			
			if(typeText == "board") {
				isChecked = "checked";
			} else {
				isChecked = "";
			}
			htmlLABEL = document.createElement('LABEL');
			htmlLABEL.className = "reportLabel";
			htmlLABEL.innerHTML = "<input type='radio' name='reportType' value='"+typeKey+"' "+isChecked+" onclick=\"vod.reportTypeChange('"+typeText+"');\"><i class='type2'></i><span>"+typeVal+"</span>&nbsp;&nbsp;&nbsp;&nbsp;";
			htmlDIV2.appendChild(htmlLABEL);
		}

		htmlSPAN5 = document.createElement('SPAN');
		htmlSPAN5.innerHTML = "2. 신고항목을 선택하세요";
		htmlSPAN5.style.color = "black";
		htmlDIV.appendChild(htmlSPAN5);

		htmlDIVBOARD = document.createElement('DIV');
		htmlDIVBOARD.className = "cate";
		htmlDIVBOARD.setAttribute("id", "boardItemArea");
		htmlDIVBOARD.style.display = "";
		htmlDIV.appendChild(htmlDIVBOARD);

		boardItem = this.docXML.getElementsByTagName("boardItem").length;
		for(i = 0;  i < boardItem; i++){
			itemObj = this.docXML.getElementsByTagName("boardItem").item(i);
			itemKey = itemObj.getAttribute('key');
			itemVal = itemObj.firstChild.nodeValue;

			cateLABEL = document.createElement('LABEL');
			cateLABEL.className = "reportLabel";
			cateLABEL.innerHTML = "<input type='radio' name='reportCategory' value='"+itemKey+"'><i class='type2'></i><span>"+itemVal+"</span>";
			htmlDIVBOARD.appendChild(cateLABEL);
		}
		
		htmlDIVWRITER = document.createElement('DIV');
		htmlDIVWRITER.className = "cate";
		htmlDIVWRITER.setAttribute("id", "writerItemArea");
		htmlDIVWRITER.style.display = "none";
		htmlDIV.appendChild(htmlDIVWRITER);

		writerItem = this.docXML.getElementsByTagName("writerItem").length;
		for(i = 0;  i < writerItem; i++){
			itemObj = this.docXML.getElementsByTagName("writerItem").item(i);
			itemKey = itemObj.getAttribute('key');
			itemVal = itemObj.firstChild.nodeValue;

			cateLABEL = document.createElement('LABEL');
			cateLABEL.className = "reportLabel";
			cateLABEL.innerHTML = "<input type='radio' name='reportCategory' value='"+itemKey+"'><i class='type2'></i><span>"+itemVal+"</span>";
			htmlDIVWRITER.appendChild(cateLABEL);
		}

		htmlSPAN4 = document.createElement('SPAN');
		htmlSPAN4.innerHTML = "3. 신고 내용을 입력하세요";
		htmlSPAN4.style.color = "black";
		htmlDIV.appendChild(htmlSPAN4);

		htmlTEXTAREA = document.createElement('TEXTAREA');
		htmlTEXTAREA.setAttribute("name", "reportContent");
		htmlTEXTAREA.setAttribute("id", "reportContent");
		htmlTEXTAREA.setAttribute("placeholder", "신고 내용을 입력하세요");
		htmlDIV.appendChild(htmlTEXTAREA);

		htmlDIV4 = document.createElement('DIV');
		htmlDIV4.className = "reportBtn";
		htmlDIV.appendChild(htmlDIV4);

		htmlP2 = document.createElement('P');
		htmlP2.className = "reportBtn1";
		htmlP2.innerHTML = "신고내용 보내기";
		htmlP2.onclick = function() { vod.reportWriteCheck(tableName, num); }
		htmlDIV4.appendChild(htmlP2);

		document.getElementById("reportArea").style.display = "";
	}

	vod.prototype.reportTypeChange = function(typeText){
		reportCategory = document.getElementsByName("reportCategory");
		for(i=1; i<reportCategory.length; i++){
			if(reportCategory[i].checked){
				reportCategory[i].checked = false;
			}
		}
		if(typeText == "board") {
			document.getElementById("boardItemArea").style.display = "";
			document.getElementById("writerItemArea").style.display = "none";
		} else if (typeText == "writer") {
			document.getElementById("boardItemArea").style.display = "none";
			document.getElementById("writerItemArea").style.display = "";
		}
	}

	// 신고하기 레이어 닫기
	vod.prototype.reportClose = function(){
		var reportArea = document.getElementById("reportArea");
		var reportDiv = document.getElementById("reportDiv");
		reportArea.removeChild(reportDiv);
		document.getElementById("reportArea").style.display = "none";
	}

	// 신고하기 폼 체크
	vod.prototype.reportWriteCheck = function(tableName, num){
		form = document.reportForm;
		if(!form) {
			form = parent.reportForm;
		}
		form.processType.value = 'reportWrite';
		form.tableName.value = tableName;
		form.num.value = num;
		form.reportContent.value = document.getElementById('reportContent').value;

		var reportType = document.getElementsByName('reportType');
		var reportTypeChk = "";
		for(var j=0; j<reportType.length; j++) {
			if(reportType[j].checked) {
				reportTypeChk = reportType[j].value;
			}
		}
		if(!reportTypeChk) {
			alert("신고 대상을 선택해주세요");
			return false;
		} else {
			form.reportType.value = reportTypeChk;
		}

		var reportCategory = document.getElementsByName('reportCategory');
		var reportCategoryChk = "";
		for(var j=0; j<reportCategory.length; j++) {
			if(reportCategory[j].checked) {
				reportCategoryChk = reportCategory[j].value;
			}
		}
		if(!reportCategoryChk) {
			alert("신고 항목을 선택해주세요");
			return false;
		} else {
			form.reportCategory.value = reportCategoryChk;
		}

		if(form.reportContent.value == "") {
			alert('신고 내용을 입력해주세요');
			return false;
		}

		new cryptSubmit(form, form.cryptKey);
	}
}	// end vod




// 방송리스트
vodList = function(pageCode, viewType){	
	this.pageCode = pageCode;	// 페이지코드
	this.viewType = viewType;

	this.docXML;				// XML데이터 return 값
	this.callback = null;		// XML결과 return함수
	this.httpRequest = null;	// httpRequest객체
	
	this.totalRecord = 0;		// 전체 레코드수	
	this.Page = 1;				// 초기 페이지
	this.Block = 1;				// 초기 블럭
	this.pageBlock = 6;			// 이동할 페이지 개수
	this.listBlock = 10;		// 한페이지 목록수
	this.totalBlock = 0;		// 전체 블럭수
	this.totalPage;				// 전체 페이지 수
	this.totalLine;				// 전체 라인수
	this.firstRow;				// 첫번째 레코드
	this.lastRow;				// 마지막 레코드
	this.listCount;				// 리스트 레코드수

	this.playNum = "";			// 재생중인 방송 코드
	this.playViewType = "";		// 재생중인 방송 파일

	// 브라우져 호환성 체크 (IE9 이상은 IE이외 브라우져로 체크함)
	this.isIE = false;
	if((navigator.appName.indexOf('Microsoft')+1)){
		re = new RegExp("MSIE ([0-9]{1,}[\.0-9]{0,})");
		if (re.exec(navigator.userAgent) != null){ 
			rv = parseFloat(RegExp.$1);
			if(rv < 10) this.isIE = true;
		}
	}else{
		this.isIE = false;
	}	// end IE check if


	// httpRequest 객체 생성 함수
	vodList.prototype.getXMLHttpRequest = function() {
		if (window.ActiveXObject) {
			try {
				return new ActiveXObject("Msxml2.XMLHTTP");
			} catch(e) {
				try {
					return new ActiveXObject("Microsoft.XMLHTTP");
				} catch(e1) { return null; }
			}
		} else if (window.XMLHttpRequest) {
			return new XMLHttpRequest();
		} else {
			return null;
		}
	}	//	end getXMLHttpRequest function
	
	// httpRequest send 함수
	vodList.prototype.sendRequest = function(url, params, callback, method) {
		this.callback = callback;

		this.httpRequest = this.getXMLHttpRequest();
		var httpMethod = method ? method : 'GET';
		if (httpMethod != 'GET' && httpMethod != 'POST') {
			httpMethod = 'GET';
		}
		var httpParams = (params == null || params == '') ? null : params;
		var httpUrl = url;
		if (httpMethod == 'GET' && httpParams != null) {
			httpUrl = httpUrl + "?" + httpParams;
		}
		this.httpRequest.open(httpMethod, httpUrl, true);
		this.httpRequest.setRequestHeader(
			'Content-Type', 'application/x-www-form-urlencoded');
		
		var request = this;
		this.httpRequest.onreadystatechange = function() {
			request.onStateChange.call(request);
		}
		this.httpRequest.send(httpMethod == 'POST' ? httpParams : null);	
	}	// end sendRequest function

	// httpRequest return 함수
	vodList.prototype.onStateChange = function() {
		this.callback(this.httpRequest);
	}	// end onStateChange end

	// 리스트xml호출
	vodList.prototype.requestXML = function(){
		if(this.Page == ""){
			this.Page = 1;	// 초기 페이지 설정
		}

		params  = "pageCode=" + this.pageCode;
		params += "&code=vodList";
		this.sendRequest("/core/xml/vod/vodList.xml.html", params, this.resultXML, "POST");
	}	// end requestXML function


	// XML결과
	vodList.prototype.resultXML = function(){
		if(this.httpRequest.readyState == 4){
			if(this.httpRequest.status == 200){
				
				this.docXML = this.httpRequest.responseXML;
				code = this.docXML.getElementsByTagName("code").item(0).firstChild.nodeValue;	// 결과코드

				// 결과 실행
				switch (code){
					case 'ErrorMsg':
						message = this.docXML.getElementsByTagName("message").item(0).firstChild.nodeValue;	// 리턴메시지
						alert(message);
						break;

					case 'vodList':
						this.totalRecord = this.docXML.getElementsByTagName("vodList").length;	// 전체 레코드수

						this.fSet();	// 페이지 설정 및 디스플레이
						break;

					case 'noEvent':									
						break;

					default:
						alert("결과코드 없음");
						break;
				}
			}
		}
	}	// end resultXML function


	// 초기 페이지 설정
	vodList.prototype.fSet = function(){
		if(this.totalRecord != 0){
			// 총 페이지수
			perPa = this.totalRecord % this.listBlock;
			this.totalPage = parseInt(this.totalRecord / this.listBlock);
			if(perPa > 0) this.totalPage++;
			
			// 총 블럭수
			perBl = this.totalPage % this.pageBlock;
			this.totalBlock = parseInt(this.totalPage / this.pageBlock);
			if(perBl > 0) this.totalBlock++;

			// 처음/마지막 페이지
			this.firstPage = (this.Block * this.pageBlock) - (this.pageBlock -1);
			this.lastPage = this.Block * this.pageBlock;

			if(this.totalPage < this.lastPage){
				this.lastPage = this.totalPage;
			}			
		}else{			
			this.firstPage = 1;
			this.lastPage = 1;
			this.Block = 1;
			this.totalBlock = 1;
			this.totalPage = 1;
		}
		this.displayPage(this.Page);
	}	// end fSet function


	// 페이지 선택
	vodList.prototype.displayPage = function(uPage){
		this.Page = uPage;
		document.getElementById('pagingArea').innerHTML = "";

		// 첫페이지가 마지막 페이지가 아닐경우
		if(this.firstPage != 1){
			document.getElementById('pagingArea').innerHTML += "<span class='listPrev' onclick='vodList.prevBlock();'><img src='/core/module/vod/responsive_default/images/vodlistprev.gif'></span> ";
		}

		for(i = this.firstPage; i <=this.lastPage; i++){
			if(this.Page == i){
				document.getElementById('pagingArea').innerHTML += "<span class='listPageOn'>" + i + "</span> ";
			}else{
				document.getElementById('pagingArea').innerHTML += "<span class='listPageOff' onclick=\"vodList.displayPage(" + i + ");\">" + i + "</span> ";
			}

			if(this.lastPage != i){
				//document.getElementById('pagingArea').innerHTML += "&nbsp; ";
			}
		}

		if(this.totalPage != this.lastPage){
			document.getElementById('pagingArea').innerHTML += "<span class='listNext' onclick='vodList.nextBlock();'><img src='/core/module/vod/responsive_default/images/vodlistnext.gif'></span>";
		}
		
		// 출력범위 설정
		this.firstRow = (this.Page - 1) * this.listBlock;
		this.lastRow = this.firstRow + this.listBlock;
		if(this.lastRow > this.totalRecord) this.lastRow = this.totalRecord;
		this.listCount = this.lastRow - this.firstRow;		
		
		this.removeList();		// 이전항목 삭제
		this.createList();		// 리스트 목록 생성

	}	// end displayPage function


	// 이전블록
	vodList.prototype.prevBlock = function(){
		if(this.Block != 1){
			this.Block--;
			this.firstPage = (this.Block * this.pageBlock) - (this.pageBlock -1);
			this.lastPage = this.Block * this.pageBlock;
			this.Page = this.lastPage;
			this.displayPage(this.Page);
		}
	}	// end prevBlock function

	// 다음블록
	vodList.prototype.nextBlock = function(){
		if(this.lastPage != this.totalPage){
			this.Block++;
			this.firstPage = (this.Block * this.pageBlock) - (this.pageBlock -1);
			this.lastPage = this.Block * this.pageBlock;

			if(this.totalPage < this.lastPage){
				this.lastPage = this.totalPage;
			}
			this.Page = this.firstPage;
			this.displayPage(this.Page);
		}
	}	// end nextBlock function


	// 이전항목 삭제
	vodList.prototype.removeList = function(){
		document.getElementById("vodListArea").innerHTML = "";
	}	// end removeList function


	// 리스트 생성
	vodList.prototype.createList = function(){
		baseTable = document.getElementById("vodListArea");

		urlArr = document.location.href.split("?");
		selfUrl = urlArr[0];

		// 전체 목록
		totalList = this.docXML.getElementsByTagName("vodList").length;

		if(this.totalRecord == 0) return;

		for(i = this.firstRow; i < this.lastRow; i++){
			num = this.docXML.getElementsByTagName("num").item(i).firstChild.nodeValue;						// 번호
			subject = this.docXML.getElementsByTagName("subject").item(i).firstChild.nodeValue;				// 제목
			word = this.docXML.getElementsByTagName("word").item(i).firstChild.nodeValue;					// 내용
			preacher = this.docXML.getElementsByTagName("preacher").item(i).firstChild.nodeValue;			// 설교자
			vodType = this.docXML.getElementsByTagName("vodType").item(i).firstChild.nodeValue;				// 방송리스트코드
			thumbFile = this.docXML.getElementsByTagName("thumbFile").item(i).firstChild.nodeValue;			// 이미지
			date = this.docXML.getElementsByTagName("date").item(i).firstChild.nodeValue;					// 날짜
			vodTypeArr = this.docXML.getElementsByTagName("vodTypeArr").item(i).firstChild.nodeValue;		// 해당 방송
			commentCount = this.docXML.getElementsByTagName("commentCount").item(i).firstChild.nodeValue;	// 댓글수

			if(thumbFile == "/core/images/etc/noimg_main.gif"){
				thumbFile = "/core/module/vod/responsive_default/images/noimg.jpg";
			}

			if(num == this.playNum){
				clsName = "listOn";
			}else{
				clsName = "listOff";
			}

			date = date.replace(/-/gi, ".");

			// 기본 방송 링크
			link = selfUrl + "?pageCode="+this.pageCode+"&Mode=view&num="+num+"&page="+this.Page+"&vodType="+vodType;

			htmlTag  = "";
			htmlTag += "<li class='"+clsName+"'>";
			htmlTag += "\t<a href='"+link+"'>";
			htmlTag += "\t\t<span class='listThumb'><img src='"+thumbFile+"'><span class='mask'></span></span>";
			htmlTag += "\t</a>";
			htmlTag += "\t<ul class='ulList mt15'>";
			htmlTag += "\t\t<li class='vodCaptionPlay'><a href='"+link+"'>"+subject+"</a></li>";
			htmlTag += "\t\t<li class='vodDate'>"+date+"</li>";
			htmlTag += "\t\t<li class='vodIconWrap'>";		

			// 파일 종류 링크
			vtArr = vodTypeArr.split("|");
			for(j = 0; j < vtArr.length; j++){
				vt = vtArr[j];
				if(vt == ""){
					continue;
				}
				strArr = vt.split("-");
				vodType = strArr[0];
				vodIcon = strArr[1];

				if(vodType == this.playViewType && num == this.playNum){
					vtStyle = " style='opacity:0.4;'";
				}else{
					vtStyle = "";
				}

				link = selfUrl + "?pageCode="+this.pageCode+"&Mode=view&num="+num+"&vodType="+vodType;
				htmlTag += "\t\t\t<span class='videoIcon'"+vtStyle+" onclick=\"document.location.href='"+link+"';\"><img src='/core/module/vod/responsive_default/images/vodButton/"+vodIcon+".png'></span>";
			}

			htmlTag += "\t\t</li>";
			htmlTag += "\t</ul>";
			htmlTag += "</li>";

			baseTable.innerHTML += htmlTag;
		}
	}	// end createList function	
}	// end vodList
