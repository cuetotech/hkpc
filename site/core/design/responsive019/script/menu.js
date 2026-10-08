<!--

// 메뉴 생성기
menu = function(){
	this.docXML = null;			// XML데이터 return 값
	this.callback = null;		// XML결과 return함수
	this.httpRequest = null;	// httpRequest객체
	this.xmlFile = "/core/xml/menu.xml.html";
	this.selectedCode = "";		// 메뉴 선택 코드
	this.fullMstrArray = new Array();
	this.smInt = null;			// 화면크기에 따른 사이트맵 출력
	this.smMode = null;			// 사이트맵 형식
	this.smLayer = null;
	this.mstrCode = null;
	this.pageCode = null;
	this.upperCode = null;

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


	// httpRequest 객체 생성 함수
	menu.prototype.getXMLHttpRequest = function() {
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
	menu.prototype.sendRequest = function(url, params, callback, method) {
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
	menu.prototype.onStateChange = function() {
		this.callback(this.httpRequest);
	}	// end onStateChange end	


	// 리스트xml호출
	menu.prototype.requestXML = function(){
		params  = "action=getMenu";
		this.sendRequest(this.xmlFile, params, this.resultXML, "POST");
	}	// end requestXML function


	// XML결과
	menu.prototype.resultXML = function(){
		if(this.httpRequest.readyState == 4){
			if(this.httpRequest.status == 200){
				//alert(this.httpRequest.responseText);
				this.docXML = this.httpRequest.responseXML;
			}
		}
	}	// end resultXML function


	// 상단메뉴 생성
	menu.prototype.createTopMenu = function(){
		if(this.docXML == null){
			setTimeout("menu.createTopMenu();", 50);
			return;
		}

		baseLayer = document.getElementById("topMenuLayer");
		baseLayer.innerHTML = "";

		// 1단 메인메뉴
		naviHeight = 0;
		mTotal = this.docXML.getElementsByTagName("depth1").length;
		for(i = 0; i < mTotal; i++){
			mainObj = this.docXML.getElementsByTagName("depth1").item(i);
			mainTarget = mainObj.getAttribute('target');					// 타겟
			mainLink = this.urlDecode(mainObj.getAttribute('link'));		// 링크
			mainName = this.base64Decode(mainObj.getAttribute('name'));		// 메뉴명
			isMemberMenu = mainObj.getAttribute('isMemberMenu');		// 회원메뉴인지 체크
			if(isMemberMenu == "Y"){
				continue;
			}

			mainLayer = document.createElement("DIV");
			mainLayer.className = "mainMenu";
			mainLayer.innerHTML = " <a class=\"depth1\" href=\""+mainLink+"\" target=\""+mainTarget+"\">"+mainName+"</a>";
			baseLayer.appendChild(mainLayer);


			// 2단
			subTotal = mainObj.childNodes.length;
			subCount = 0;
			for(x = 0; x < subTotal; x++){
				if(mainObj.childNodes[x].nodeType != 1) continue;
				subObj = mainObj.childNodes.item(x);
				subTarget = subObj.getAttribute('target');					// 타겟
				subLink = this.urlDecode(subObj.getAttribute('link'));		// 링크
				subName = this.base64Decode(subObj.getAttribute('name'));	// 메뉴명

				// 2단메뉴 감싸는 부분
				if(subCount == 0){
					subUL = document.createElement("UL");
					subUL.style.paddingBottom = "30px";
					mainLayer.appendChild(subUL);
				}

				subLI = document.createElement("LI");
				subLI.innerHTML = "<a class=\"depth2\" href=\""+subLink+"\" target=\""+subTarget+"\">"+subName+"</a>";
				subUL.appendChild(subLI);

				// 3단메뉴
				depth3Total = subObj.childNodes.length;
				depth3Count = 0;
				for(j = 0; j < depth3Total; j++){
					if(subObj.childNodes[j].nodeType != 1) continue;
					depth3Obj = subObj.childNodes.item(j);
					depth3Target = depth3Obj.getAttribute('target');				// 타겟
					depth3Link = this.urlDecode(depth3Obj.getAttribute('link'));	// 링크
					depth3Name = this.base64Decode(depth3Obj.getAttribute('name'));	// 메뉴명


					// 3단메뉴 감싸는 부분
					if(depth3Count == 0){
						depth3UL = document.createElement("UL");
						depth3UL.style.paddingBottom = "10px";
						subLI.appendChild(depth3UL);
					}

					depth3LI = document.createElement("LI");
					depth3LI.innerHTML = "<a class=\"depth3\" href=\""+depth3Link+"\" target=\""+depth3Target+"\">- "+depth3Name+"</a>";
					depth3UL.appendChild(depth3LI);

					depth3Count++;
				}	// end for 3단 메뉴

				subCount++;
			}	// end for 서브메뉴

			try{
				tmpHeight = mainLayer.clientHeight;
			}catch(err){
				tmpHeight = mainLayer.offsetHeight;
			}

			if(naviHeight < tmpHeight){
				naviHeight = tmpHeight;
			}
		}	// end for 메인메뉴

		$(".mainMenu").css("width", ($(".menu").width() / $(".mainMenu").length));
		$(".navi").mouseenter(function(){
			$(".navi").stop(true, false).animate({height:$(".menuHeight").height()},500);
		}); 		
		$(".navi").mouseleave(function(){
			$(".navi").stop(true, false).animate({height:54},500);
		});
	}	// end createTopMenu function


	// 테블릿 메뉴
	menu.prototype.createTabletMenu = function(){
		if(this.docXML == null){
			setTimeout("menu.createTabletMenu();", 65);
			return;
		}

		mstrCode = this.selectedCode.substr(0, 2);
		selMstr = parseInt(mstrCode);

		subCode = this.selectedCode.substr(2, 2);
		selSub = parseInt(subCode);

		depth3Code = this.selectedCode.substr(4, 2);
		selDepth3 = parseInt(depth3Code);

		baseMstr = document.getElementById("taMstrMenu");
		baseMstr.innerHTML = "";

		mstrTotal = this.docXML.getElementsByTagName("depth1").length;

		for(i = 0; i < mstrTotal; i++){

			mainObj = this.docXML.getElementsByTagName("depth1").item(i);
			mainTarget = mainObj.getAttribute('target');					// 타겟
			mainLink = this.urlDecode(mainObj.getAttribute('link'));		// 링크
			mainName = this.base64Decode(mainObj.getAttribute('name'));		// 메뉴명

			// 2단메뉴 등록
			if(i == (selMstr - 1)){

				baseSub = document.getElementById("taSubMenu");
				subTotal = mainObj.childNodes.length;
				subNum = 0;
				for(x = 0; x < subTotal; x++){
					if(mainObj.childNodes[x].nodeType != 1) continue;
					subNum++;
					subObj = mainObj.childNodes.item(x);
					subTarget = subObj.getAttribute('target');					// 타겟
					subLink = this.urlDecode(subObj.getAttribute('link'));		// 링크
					subName = this.base64Decode(subObj.getAttribute('name'));	// 메뉴명

					// 3단메뉴
					if(subNum == selSub){
						
						baseDepth3 = document.getElementById("taDepth3Menu");
						depth3Total = subObj.childNodes.length;
						depth3Num = 0;
						for(j = 0; j < depth3Total; j++){
							if(subObj.childNodes[j].nodeType != 1) continue;
							depth3Obj = subObj.childNodes.item(j);
							depth3Target = depth3Obj.getAttribute('target');				// 타겟
							depth3Link = this.urlDecode(depth3Obj.getAttribute('link'));	// 링크
							depth3Name = this.base64Decode(depth3Obj.getAttribute('name'));	// 메뉴명
							depth3Num++;

							document.getElementById("subdepth3").style.display = "inline-block";

							htmlLI3 = document.createElement("LI");
							htmlLI3.innerHTML = "<a href=\""+depth3Link+"\" target=\""+depth3Target+"\">"+depth3Name+"</a>";
							baseDepth3.appendChild(htmlLI3);
						}
						//continue;
					}

					htmlLI = document.createElement("LI");
					htmlLI.innerHTML = "<a href=\""+subLink+"\" target=\""+subTarget+"\">"+subName+"</a>";
					baseSub.appendChild(htmlLI);					
				}
				//continue;
			}


			htmlLI = document.createElement("LI");
			htmlLI.innerHTML = "<a href=\""+mainLink+"\" target=\""+mainTarget+"\">"+mainName+"</a>";
			baseMstr.appendChild(htmlLI);
		}	// end for

	}	// end createTabletMenu function


	// 모바일 메뉴
	menu.prototype.createMobileMenu = function(){
		if(this.docXML == null){
			setTimeout("menu.createMobileMenu();", 65);
			return;
		}

		mstrCode = this.selectedCode.substr(0, 2);
		selMstr = parseInt(mstrCode);

		subCode = this.selectedCode.substr(2, 2);
		selSub = parseInt(subCode);

		depth3Code = this.selectedCode.substr(4, 2);
		selDepth3 = parseInt(depth3Code);

		baseMstr = document.getElementById("moMstrMenu2");
		baseMstr.innerHTML = "";

		mstrTotal = this.docXML.getElementsByTagName("depth1").length;
		for(i = 0; i < mstrTotal; i++){

			mainObj = this.docXML.getElementsByTagName("depth1").item(i);
			mainTarget = mainObj.getAttribute('target');					// 타겟
			mainLink = this.urlDecode(mainObj.getAttribute('link'));		// 링크
			mainName = this.base64Decode(mainObj.getAttribute('name'));		// 메뉴명
			mainMstr = parseInt(mainObj.getAttribute('mstrCode'));

			menuCode = i + 1;

			htmlDIV = document.createElement("DIV");
			htmlDIV.setAttribute("id", "cssmenu");
			baseMstr.appendChild(htmlDIV);

			htmlUL = document.createElement("UL");
			htmlDIV.appendChild(htmlUL);

			htmlLI = document.createElement("LI");
			htmlLI.className = "active has-sub";
			htmlLI.setAttribute("menuCode", menuCode);
			htmlLI.setAttribute("id", "fullMstr2_"+menuCode);
			htmlLI.innerHTML = "<a href=\"#\"><span>"+mainName+"</span></a>";
			htmlLI.onclick = function(){ menu.MobileFullMenuClick2(this); };
			htmlUL.appendChild(htmlLI);

			subTotal = mainObj.childNodes.length;
			subCount = 0;
			for(x = 0; x < subTotal; x++){
				if(mainObj.childNodes[x].nodeType != 1) continue;
				subObj = mainObj.childNodes.item(x);
				subTarget = subObj.getAttribute('target');					// 타겟
				subLink = this.urlDecode(subObj.getAttribute('link'));		// 링크
				subName = this.base64Decode(subObj.getAttribute('name'));	// 메뉴명
				subCode = parseInt(mainObj.getAttribute('pageCode'));
				subMstr = parseInt(mainObj.getAttribute('mstrCode'));

				subCode = subCount + 1;

				// 2단메뉴 감싸는 부분
				if(subCount == 0){
					htmlUL2 = document.createElement("UL");
					htmlUL2.setAttribute("id", "fullSub2_"+menuCode);
					htmlUL2.style.display = "none";
					htmlLI.appendChild(htmlUL2);
				}				

				htmlLI2 = document.createElement("LI");
				//htmlLI2.className = "has-sub";
				htmlLI2.innerHTML = "<a href=\""+subLink+"\" target=\""+subTarget+"\"><span>"+subName+"</span></a>";
				htmlUL2.appendChild(htmlLI2);	

				subCount++;
			}
			//continue;
		}	// end for

	}	// end createMobileMenu function


	menu.prototype.MobileFullMenuClick2 = function(mstrObj){
		totalMenu = this.fullMstrArray.length;
		for(i = 0; i < totalMenu; i++){
			menuCode = this.fullMstrArray[i].getAttribute("menuCode");
			if(mstrObj.getAttribute("menuCode") ==menuCode){
				if(document.getElementById("fullSub2_"+menuCode).style.display == "block"){
					this.fullMstrArray[i].className = "w100 menuOff";
					document.getElementById("fullSub2_"+menuCode).style.display = "none";
				}else{
					this.fullMstrArray[i].className = "w100 menuOn";
					document.getElementById("fullSub2_"+menuCode).style.display = "block";
				}
			}else{
				this.fullMstrArray[i].className = "w100 menuOff";
				document.getElementById("fullSub2_"+menuCode).style.display = "none";
			}
		}
	}	// end MobileFullMenuClick2 function


	// 상단 모바일 full메뉴
	menu.prototype.createMobileFullMenu = function(){
		if(this.docXML == null){
			setTimeout("menu.createMobileFullMenu();", 35);
			return;
		}

		mstrCode = this.selectedCode.substr(0, 2);
		selMstr = parseInt(mstrCode);
		if(isNaN(selMstr)) selMstr = 0;

		subCode = this.selectedCode.substr(2, 2);
		selSub = parseInt(subCode);
		if(isNaN(selSub)) selSub = 0;

		depth3Code = this.selectedCode.substr(4, 2);
		selDepth3 = parseInt(depth3Code);
		if(isNaN(selDepth3)) selDepth3 = 0;

		menuBase = document.getElementById("moFullMenu");
		menuBase.innerHTML = "";

		mTotal = this.docXML.getElementsByTagName("depth1").length;
		// 1단
		for(i = 0; i < mTotal; i++){
			mainObj = this.docXML.getElementsByTagName("depth1").item(i);
			mainTarget = mainObj.getAttribute('target');					// 타겟
			mainLink = this.urlDecode(mainObj.getAttribute('link'));		// 링크
			mainName = this.base64Decode(mainObj.getAttribute('name'));		// 메뉴명

			menuCode = i + 1;
			mainMenu = document.createElement("LI");
			mainMenu.setAttribute("menuCode", menuCode);
			mainMenu.setAttribute("id", "fullMstr_"+menuCode);
			mainMenu.className = "w100 menuOff";
			mainMenu.style.cssText = "height: 30px; padding-top:5px; background: url(../core/design/responsive019/images/_main/menubg2.png) right top no-repeat; border-bottom: 1px solid #7b7e8e;";
			if(mainTarget == "_blank"){
				mainMenu.innerHTML = "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<a href=\"#\">"+mainName+"</a>";
			}else{
				mainMenu.innerHTML = "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<a style=\"font-size: 15px;\" href=\""+mainLink+"\" target=\""+mainTarget+"\">"+mainName+"</a>";
			}

			mainMenu.onclick = function(){ menu.MobileFullMenuClick(this); };
			menuBase.appendChild(mainMenu);
			this.fullMstrArray[i] = mainMenu;

			// 2단메뉴
			subTotal = mainObj.childNodes.length;
			subCount = 0;
			for(x = 0; x < subTotal; x++){
				if(mainObj.childNodes[x].nodeType != 1) continue;
				subObj = mainObj.childNodes.item(x);
				subTarget = subObj.getAttribute('target');					// 타겟
				subLink = this.urlDecode(subObj.getAttribute('link'));		// 링크
				subName = this.base64Decode(subObj.getAttribute('name'));	// 메뉴명

				subCode = subCount + 1;

				// 2단메뉴 감싸는 부분
				if(subCount == 0){
					subLI = document.createElement("LI");
					subLI.setAttribute("id", "fullSub_"+menuCode);
					subLI.className = "w100";
					subLI.style.display = "none";
					menuBase.appendChild(subLI);

					htmlUL = document.createElement("UL");
					htmlUL.className = "ul";
					htmlUL.style.cssText = "padding-left: 30px;";
					subLI.appendChild(htmlUL);

					htmlLI = document.createElement("LI");
					htmlLI.className = "w100";
					htmlLI.style.cssText = "padding: 10px 0 20px 0;";
					htmlUL.appendChild(htmlLI);
				}

				htmlP = document.createElement("P");
				htmlP.innerHTML = "<a style=\"font-size: 15px; line-height: 2;\" href=\""+subLink+"\" target=\""+subTarget+"\">"+subName+"</a>";
				htmlLI.appendChild(htmlP);

				// 3단메뉴
				depth3Total = subObj.childNodes.length;
				depth3Count = 0;
				for(j = 0; j < depth3Total; j++){
					if(subObj.childNodes[j].nodeType != 1) continue;
					depth3Obj = subObj.childNodes.item(j);
					depth3Target = depth3Obj.getAttribute('target');				// 타겟
					depth3Link = this.urlDecode(depth3Obj.getAttribute('link'));	// 링크
					depth3Name = this.base64Decode(depth3Obj.getAttribute('name'));	// 메뉴명
					depth3Code = depth3Count + 1;

					// 3단메뉴 감싸는 부분
					if(depth3Count == 0){
						depth3UL = document.createElement("UL");
						depth3UL.className = "ul";
						depth3UL.style.cssText = "padding-left: 10px; margin-bottom: 10px;";
						htmlLI.appendChild(depth3UL);
					}

					depth3LI = document.createElement("LI");
					depth3LI.className = "w100";
					if(selDepth3 == depth3Code){
						depth3LI.innerHTML = "<a href=\""+depth3Link+"\" target=\""+depth3Target+"\">- "+depth3Name+"</a>";
					}else{
						depth3LI.innerHTML = "<a href=\""+depth3Link+"\" target=\""+depth3Target+"\">- "+depth3Name+"</a>";
					}
					depth3UL.appendChild(depth3LI);

					depth3Count++;
				}	// end for 3단 메뉴
				subCount++;
			}	// end for 서브메뉴
		}	// end for 메인메뉴

		if(selMstr != 0){
			this.MobileFullMenuClick(document.getElementById("fullMstr_"+selMstr));
		}
	}	// end createMobileFullMenu function


	// 메뉴 클릭 선택
	menu.prototype.MobileFullMenuClick = function(mstrObj){
		totalMenu = this.fullMstrArray.length;
		for(i = 0; i < totalMenu; i++){
			menuCode = this.fullMstrArray[i].getAttribute("menuCode");
			if(mstrObj == this.fullMstrArray[i]){
				if(document.getElementById("fullSub_"+menuCode)) {
					if(document.getElementById("fullSub_"+menuCode).style.display == "block"){
						this.fullMstrArray[i].className = "w100 menuOff";
						document.getElementById("fullSub_"+menuCode).style.display = "none";
					}else{
						this.fullMstrArray[i].className = "w100 menuOn";
						document.getElementById("fullSub_"+menuCode).style.display = "block";
					}
				}
			}else{
				this.fullMstrArray[i].className = "w100 menuOff";
				if(document.getElementById("fullSub_"+menuCode)) {
					document.getElementById("fullSub_"+menuCode).style.display = "none";
				}
			}
		}
	}	// end MobileFullMenuClick function	


	// 사이트맵 오픈
	menu.prototype.siteMapOpen = function(){
		document.body.style.overflowY = "hidden";

		if(window.innerWidth < 1199){
			document.getElementById("mobileSiteMap").style.display = "block";
			this.smMode = "M";
		}else{
			this.pcMenuOpen();
			this.smMode = "P";
		}

		this.smInt = setInterval("menu.siteMapCheck();", 50);

	}	// end siteMapOpen function	


	// 사이트맵 닫기
	menu.prototype.siteMapClose = function(){
		clearInterval(this.smInt);
		document.body.style.overflowY = "auto";
		document.getElementById("mobileSiteMap").style.display = "none";
		this.pcMenuClose();
	}	// end siteMapOpen function	


	// PC용 사이트맵 열기
	menu.prototype.pcMenuOpen = function(){
		openPage.shadowCreate();

		if(this.smLayer != null){
			this.smLayer.style.display = "block";
			return;
		}

		this.smLayer = document.createElement("DIV");
		this.smLayer.setAttribute("id", "pcSiteMapLayer");
		this.smLayer.style.zIndex = "9999";
		this.smLayer.style.position = "fixed";
		this.smLayer.style.top = "70px";
		this.smLayer.style.width = '100%';
		this.smLayer.style.display = "block";
		document.body.appendChild(this.smLayer); 

		innerLayer = document.createElement("DIV");
		innerLayer.style.position = "relative";
		innerLayer.style.top = "0px";
		innerLayer.style.width = '950px';
		innerLayer.style.margin = '0 auto';
		innerLayer.style.backgroundColor = "#ffffff";
		innerLayer.innerHTML = "<iframe src='/core/module/sitemap/sitemap.html' id='innerSetFrame' name='innerSetFrame' border='0' frameborder='0' scrolling='no' width='950' height='690'></iframe>";
		this.smLayer.appendChild(innerLayer);

	}	// end pcMenuOpen function	


	// PC용 사이트맵 닫기
	menu.prototype.pcMenuClose = function(){
		this.smLayer.style.display = "none";
		openPage.shadowRemove();
	}	// end pcMenuClose function	


	// 사이트맵 크기 체크
	menu.prototype.siteMapCheck = function(){
		if(window.innerWidth < 1199){
			if(this.smMode == "M") return;
			this.pcMenuClose();
			document.getElementById("mobileSiteMap").style.display = "block";
			this.smMode = "M";
		}else{
			if(this.smMode == "P") return;
			document.getElementById("mobileSiteMap").style.display = "none";
			this.pcMenuOpen();

			this.smMode = "P";
		}
	}	// end pcMenuClose function	

	// url 디코딩
	menu.prototype.urlDecode = function(data){
	  var lsRegExp = /\+/g;
	  return decodeURIComponent(String(data).replace(lsRegExp, " "));
	}	// end urlDecode function


	// base64 디코딩
	menu.prototype.base64Decode = function(input){
		_keyStr = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/="

		var output = "";
		var chr1, chr2, chr3;
		var enc1, enc2, enc3, enc4;
		var i = 0;

		input = input.replace(/[^A-Za-z0-9\+\/\=]/g, "");

		while (i < input.length) {

			enc1 = _keyStr.indexOf(input.charAt(i++));
			enc2 = _keyStr.indexOf(input.charAt(i++));
			enc3 = _keyStr.indexOf(input.charAt(i++));
			enc4 = _keyStr.indexOf(input.charAt(i++));

			chr1 = (enc1 << 2) | (enc2 >> 4);
			chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
			chr3 = ((enc3 & 3) << 6) | enc4;

			output = output + String.fromCharCode(chr1);

			if (enc3 != 64) {
				output = output + String.fromCharCode(chr2);
			}
			if (enc4 != 64) {
				output = output + String.fromCharCode(chr3);
			}
		}

		output = this.base64Utf8Decode(output);

		return output;

	}	// end base64Decode function	


	// base64 디코딩
	menu.prototype.base64Utf8Decode = function(utftext){
		var string = "";
		var i = 0;
		var c = c1 = c2 = 0;

		while ( i < utftext.length ) {

			c = utftext.charCodeAt(i);

			if (c < 128) {
				string += String.fromCharCode(c);
				i++;
			}
			else if((c > 191) && (c < 224)) {
				c2 = utftext.charCodeAt(i+1);
				string += String.fromCharCode(((c & 31) << 6) | (c2 & 63));
				i += 2;
			}
			else {
				c2 = utftext.charCodeAt(i+1);
				c3 = utftext.charCodeAt(i+2);
				string += String.fromCharCode(((c & 15) << 12) | ((c2 & 63) << 6) | (c3 & 63));
				i += 3;
			}

		}

		return string;

	}	// end base64Utf8Decode function




	this.requestXML();
	
}	// end menu Class
//-->