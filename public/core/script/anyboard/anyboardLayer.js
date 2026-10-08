<!--
// 게시판 레이어 보기
anyboardLayer = function(boardID){
	this.boardID = boardID;		// 게시판 ID
	this.shadow = null;			// 그림자 레이어
	this.shadowInt = null;		// 그림자 레이어 크기조절
	this.baseLayer = null;		// base레이어
	this.baseInt = null;		// base레이어 크기조절
	this.imageLayer = null;		// 이미지 레이어
	this.imageObj = null;		// 이미지 객체
	this.imagePid = 0;			// 이미지 pid
	this.imagePos = new Array(0, 0);	// 이미지 위치 (XY)
	this.imageArray = new Array();		// 이미지 배열
	this.eventPos = new Array(0, 0);	// 마우스 움직임 위치
	this.toolArray = new Array();		// 이미지 툴들

	// 브라우져 호환성 체크 (IE9 이상은 IE이외 브라우져로 체크함)
	this.isIE = false;
	if((navigator.appName.indexOf('Microsoft')+1)){
		re = new RegExp("MSIE ([0-9]{1,}[\.0-9]{0,})");
		if (re.exec(navigator.userAgent) != null){ 
			rv = parseFloat(RegExp.$1);
			if(rv < 9) this.isIE = true;
		}
	}else{
		this.isIE = false;
	}	// end IE check if

	if(parent.document.getElementById("contentsFrame")){
		frameW = parent.window;
		frameD = parent.document;
	}else{
		frameW = window;
		frameD = document;
	}


	// 이벤트 핸들러 생성
	anyboardLayer.prototype.addListener = function(element, name, observer, useCapture) {
		useCapture = useCapture || false;

		if (element.addEventListener) {
			element.addEventListener(name, observer, useCapture);
		} else if (element.attachEvent) {
			element.attachEvent('on' + name, observer);
		}
	}	// end addListener function

	// 이벤트 핸들러 제거
	anyboardLayer.prototype.removeListener = function(element, name, observer) {
		if (element.removeEventListener) {
			element.removeEventListener(name, observer, false);
		} else if (element.detachEvent) {
			element.detachEvent('on' + name, observer);
		}
	}	// end removeListener function


	// 게시판 이미지 레이어창 초기화
	anyboardLayer.prototype.init = function(obj, baseObj){
		this.shadowCreate();

		posX = (frameW.pageXOffset) ? frameW.pageXOffset : frameD.documentElement.scrollLeft;
		posY = (frameW.pageYOffset) ? frameW.pageYOffset : frameD.documentElement.scrollTop;
		
		sW = (frameW.innerWidth) ? frameW.innerWidth : frameD.documentElement.clientWidth;
		sH = (frameW.innerHeight) ? frameW.innerHeight : frameD.documentElement.clientHeight;

		if(parent.document.getElementById("contentsFrame")){
			layerType = "contentsFrame.anyboardLayer";
		}else{
			layerType = "anyboardLayer";
		}
		// 이미지 전체 프레임
		this.baseLayer = frameD.createElement("DIV");
		this.baseLayer.style.zIndex = "901";
		this.baseLayer.style.position = "absolute";
		this.baseLayer.style.overflow = "hidden";
		this.baseLayer.style.top = ""+posY+"px";
		this.baseLayer.style.left = ""+posX+"px";
		this.baseLayer.style.width = ""+sW+"px";
		this.baseLayer.style.height = ""+sH+"px";
		this.baseLayer.setAttribute('id', 'ANYBOARDIMAGELAYER');
		frameD.body.appendChild(this.baseLayer); 
		this.baseInt = setInterval("anyboardLayer.baseResize();", 100);

		// 이미지툴 레이어
		// 좌우 이미지 툴 높이값
		toolTop = parseInt((sH / 2) - 40);

		toolLayer = frameD.createElement("DIV");
		toolLayer.style.zIndex = "903";
		toolLayer.style.position = "absolute";
		toolLayer.style.top = ""+toolTop+"px";
		toolLayer.style.left = "0px";
		this.baseLayer.appendChild(toolLayer); 
		toolLayer.innerHTML = "<img src='/core/anyboard/common/images/layerTool/layerimage_btn_left.png' style='cursor:pointer;' onclick='"+layerType+".imageChage(-1);' />";
		this.toolArray[0] = toolLayer;

		toolLayer = frameD.createElement("DIV");
		toolLayer.style.zIndex = "904";
		toolLayer.style.position = "absolute";
		toolLayer.style.top = ""+toolTop+"px";
		toolLayer.style.right = "18px";
		this.baseLayer.appendChild(toolLayer); 
		toolLayer.innerHTML = "<img src='/core/anyboard/common/images/layerTool/layerimage_btn_right.png' style='cursor:pointer;' onclick='"+layerType+".imageChage(1);' />";
		this.toolArray[1] = toolLayer;

		toolLayer = frameD.createElement("DIV");
		toolLayer.style.zIndex = "905";
		toolLayer.style.position = "absolute";
		toolLayer.style.top = "10px";
		toolLayer.style.right = "28px";
		this.baseLayer.appendChild(toolLayer); 
		toolLayer.innerHTML = "<img src='/core/anyboard/common/images/layerTool/layerimage_btn_close.png' style='cursor:pointer;' onclick='"+layerType+".layerClose();' />";
		this.toolArray[2] = toolLayer;

		toolLayer = frameD.createElement("DIV");
		toolLayer.style.zIndex = "906";
		toolLayer.style.position = "absolute";
		toolLayer.style.top = "10px";
		toolLayer.style.right = "83px";
		this.baseLayer.appendChild(toolLayer); 
		toolLayer.innerHTML = "<img src='/core/anyboard/common/images/layerTool/layerimage_btn_zoomin.png' style='cursor:pointer;' onclick='"+layerType+".displayOrgImage();' id='ANYBOARDVIEWZOOMINOUT' />";
		this.toolArray[3] = toolLayer;
		

		// 페이지내 전체 이미지 추출
		childs = baseObj.getElementsByTagName("IMG");
		totalChild = childs.length; 
		x = 0;
		for(i = 0; i < totalChild; i++){
			childObj = childs[i];
			objID = childObj.getAttribute("id");
			if(!objID) continue;
			if(objID.substr(0, 17) != "ANYBOARDVIEWIMAGE") continue;
			this.imageArray[x] = childObj;

			if(obj == childObj){
				this.imagePid = x;
			}
			x++;
		}

		// 이미지 레이어 객체 
		this.imageLayer = frameD.createElement("DIV");
		this.imageLayer.style.zIndex = "902";
		this.imageLayer.style.position = "absolute";
		this.imageLayer.style.cursor = "move";
		this.setImage(obj);	// 초기 이미지
		this.baseLayer.appendChild(this.imageLayer);

		this.addListener(this.imageLayer, "mousedown", this.setEvent);

		// 스크롤 없애기
		re = new RegExp("Firefox");
		if (re.exec(navigator.userAgent) != null){ 
			eventText = "DOMMouseScroll";
		}else{
			eventText = "mousewheel";
		}
		this.addListener(this.imageLayer, eventText, this.wheelStop, true);
		this.addListener(this.baseLayer, eventText, this.wheelStop, true);
	}	// end init function


	// 종료
	anyboardLayer.prototype.layerClose = function(){

		// 스크롤 생성
		re = new RegExp("Firefox");
		if (re.exec(navigator.userAgent) != null){ 
			eventText = "DOMMouseScroll";
		}else{
			eventText = "mousewheel";
		}
		this.removeListener(this.imageLayer, eventText, this.wheelStop);
		this.removeListener(this.baseLayer, eventText, this.wheelStop);

		this.shadowRemove();

		if(this.baseInt != null){
			clearInterval(this.baseInt);
		}		
		if(this.baseLayer != null){
			frameD.body.removeChild(this.baseLayer);
		}
		this.baseInt = null;
		this.baseLayer = null;		
	}	// end layerClose function


	// 휠 이벤트
	anyboardLayer.prototype.wheelStop = function(evt){
		e = evt ? evt:event;
		e.preventDefault();
	}	// end wheelStop function


	// 이벤트 생성
	anyboardLayer.prototype.setEvent = function(e){
		var event = frameW.event || e;

		anyboardLayer.eventPos[0] = event.clientX;
		anyboardLayer.eventPos[1] = event.clientY;

		anyboardLayer.toolDisplay('none');

		imgX = parseInt(anyboardLayer.imageLayer.style.left);
		imgY = parseInt(anyboardLayer.imageLayer.style.top);
		anyboardLayer.imagePos[0] = imgX;
		anyboardLayer.imagePos[1] = imgY;
		anyboardLayer.addListener(frameD, "mousemove", anyboardLayer.imageMove);
		anyboardLayer.addListener(frameD, "mouseup", anyboardLayer.clearEvent);
	}	// end setEvent function


	// 이벤트 삭제
	anyboardLayer.prototype.clearEvent = function(){
		anyboardLayer.imagePos[0] = 0;
		anyboardLayer.imagePos[1] = 0;
		anyboardLayer.removeListener(frameD, "mousemove", anyboardLayer.imageMove);
		anyboardLayer.removeListener(frameD, "mouseup", anyboardLayer.clearEvent);
		anyboardLayer.toolDisplay('block');
	}	// end clearEvent function


	// 툴 보이기 / 숨기기
	anyboardLayer.prototype.toolDisplay = function(att){
		for(i = 0; i < this.toolArray.length; i++){
			this.toolArray[i].style.display = att;
		}
	}	// end toolDisplay function


	// 이미지 이동
	anyboardLayer.prototype.imageMove = function(e){
		var event = frameW.event || e;

		var mouseX = event.clientX;
		var mouseY = event.clientY;

		oldX = anyboardLayer.eventPos[0];
		oldY = anyboardLayer.eventPos[1];

		newX = anyboardLayer.imagePos[0] - oldX + mouseX;
		newY = anyboardLayer.imagePos[1] - oldY + mouseY;

		anyboardLayer.imageLayer.style.top = ""+newY+"px";
		anyboardLayer.imageLayer.style.left = ""+newX+"px";
	}	// end imageMove function
	

	// 이미지 변경
	anyboardLayer.prototype.imageChage = function(val){
		newPid = this.imagePid + val;
		if(newPid < 0){
			this.imagePid = this.imageArray.length - 1;
		}else if(newPid >= this.imageArray.length){
			this.imagePid = 0;
		}else{
			this.imagePid = newPid;
		}

		imageObj = this.imageArray[this.imagePid];
		this.setImage(imageObj);
	}	// end imageChage function	


	// 이미지 초기화 
	anyboardLayer.prototype.setImage = function(obj){
		this.imageObj = new Image();
		this.imageObj.src = obj.src;
		if(this.isIE){
			this.displayImage();
		}else{
			this.imageObj.onload = function(){ anyboardLayer.displayImage(); };
		}
	}	// end setimage function


	// 이미지 초기 출력 
	anyboardLayer.prototype.displayImage = function(){

		scW = (frameW.innerWidth) ? frameW.innerWidth : frameD.documentElement.clientWidth;
		scH = (frameW.innerHeight) ? frameW.innerHeight : frameD.documentElement.clientHeight;
		sW = scW;
		sH = scH;

		if(sW > 200) sW = sW-100;
		if(sH > 200) sH = sH-80;

		this.imageObj.setAttribute("orgWidth", this.imageObj.width);
		this.imageObj.setAttribute("orgHeight", this.imageObj.height);

		if(sW < this.imageObj.width){
			imgW = sW;
			imgH = parseInt((this.imageObj.height * imgW) / this.imageObj.width);
		}else{
			imgW = this.imageObj.width;
			imgH = this.imageObj.height;
		}

		if(sH < imgH){
			imgH = sH;
			imgW = parseInt((this.imageObj.width * imgH) / this.imageObj.height);
		}

		// 이미지 포지션
		imgX = parseInt((scW - imgW) / 2);
		imgY = parseInt((scH - imgH) / 2);

		this.imageLayer.style.top = ""+imgY+"px";
		this.imageLayer.style.left = ""+imgX+"px";
		this.imageLayer.style.width = ""+imgW+"px";
		this.imageLayer.style.height = ""+imgH+"px";
		this.imageLayer.innerHTML = "<img src='"+this.imageObj.src+"' width='"+imgW+"' height='"+imgH+"' reWidth='"+imgW+"' reHeight='"+imgH+"' ondragstart='return false;' sizeType='re' id='ANYBOARDIMAGETAG' />";

		frameD.getElementById("ANYBOARDVIEWZOOMINOUT").src = "/core/anyboard/common/images/layerTool/layerimage_btn_zoomin.png";
	}	// end displayImage function


	// 이미지 원본 보기	
	anyboardLayer.prototype.displayOrgImage = function(){
		obj = frameD.getElementById("ANYBOARDIMAGETAG");
		sType = obj.getAttribute('sizeType');
		reWidth = obj.getAttribute('reWidth');
		reHeight = obj.getAttribute('reHeight');

		// 원본보기
		if(sType == 're'){
			obj.setAttribute('sizeType', 'org');
			obj.setAttribute('width', this.imageObj.width);
			obj.setAttribute('height', this.imageObj.height);
			frameD.getElementById("ANYBOARDVIEWZOOMINOUT").src = "/core/anyboard/common/images/layerTool/layerimage_btn_zoomout.png";
		}else{
			this.displayImage();
		}
	}	// end displayOrgImage function
	


	// 게시판 이미지 레이어창 크기 조절
	anyboardLayer.prototype.baseResize = function(){

		posX = (frameW.pageXOffset) ? frameW.pageXOffset : frameD.documentElement.scrollLeft;
		posY = (frameW.pageYOffset) ? frameW.pageYOffset : frameD.documentElement.scrollTop;
		
		sW = (frameW.innerWidth) ? frameW.innerWidth : frameD.documentElement.clientWidth;
		sH = (frameW.innerHeight) ? frameW.innerHeight : frameD.documentElement.clientHeight;

		this.baseLayer.style.top = ""+posY+"px";
		this.baseLayer.style.left = ""+posX+"px";
		this.baseLayer.style.width = ""+sW+"px";
		this.baseLayer.style.height = ""+sH+"px";
	}	// end baseResize function



	// 레이어 그림자 생성
	anyboardLayer.prototype.shadowCreate = function() {
		if(this.shadow != null){
			return;
		}
		
		docBody = frameD.body;
		this.shadow = frameD.createElement("DIV");
		docBody.appendChild(this.shadow); 
		this.shadow.style.zIndex = "900";
		this.shadow.style.position = "absolute";
		this.shadow.style.top = "0px";
		this.shadow.style.left = "0px";
		this.shadow.style.width = ((frameD.documentElement.scrollWidth > frameD.body.scrollWidth) ? frameD.documentElement.scrollWidth : frameD.body.scrollWidth) + 'px';
		this.shadow.style.height = ((frameD.documentElement.scrollHeight > frameD.body.scrollHeight) ? frameD.documentElement.scrollHeight : frameD.body.scrollHeight) + 'px';
		this.shadow.style.background = "#000000";
		this.shadow.style.display = "block";
		this.shadow.style.backgroundAttachment = "fixed";

		this.shadow.setAttribute('id', 'contextShadow');
		this.shadow.style.filter = "Alpha(Opacity:80);";
		this.shadow.style.opacity = 0.8;
		this.shadowInt = setInterval("anyboardLayer.shadowResize();", 100);
	}	//	end createShadow function


	// 레이어 그림자 크기 조절
	anyboardLayer.prototype.shadowResize = function(){
		if(this.shadow != null){
			this.shadow.style.width = ((frameD.documentElement.scrollWidth > frameD.body.scrollWidth) ? frameD.documentElement.scrollWidth : frameD.body.scrollWidth) + 'px';
			this.shadow.style.height = ((frameD.documentElement.scrollHeight > frameD.body.scrollHeight) ? frameD.documentElement.scrollHeight : frameD.body.scrollHeight) + 'px';		
		}
	}	// end shadowResize function


	// 레이어 그림자 삭제
	anyboardLayer.prototype.shadowRemove = function(){
		this.shadowInt = null;
		if(this.shadow != null){
			frameD.body.removeChild(this.shadow);
		}
		this.shadow = null;
	}	// end createShadow function
}


//-->