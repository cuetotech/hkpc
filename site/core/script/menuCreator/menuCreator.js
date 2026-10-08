<!--

// 메뉴 생성기
menuCreator = function(){
	this.docXML = null;			// XML데이터 return 값
	this.callback = null;		// XML결과 return함수
	this.httpRequest = null;	// httpRequest객체
	this.xmlFile = "/core/xml/menu.xml.html";
	this.mainLayerArray = new Array();	// 메인메뉴 layers
	this.subLayerArray = new Array();	// 서브메뉴 layers
	this.mainImageArray = new Array();	// 메인메뉴 이미지
	this.subImageArray = new Array();	// 서브메뉴 이미지
	this.subBaseArray = new Array();	// 서브전체 레이어틀
	this.selectedCode = "";		// 메뉴 선택 코드
	this.selectedMain = null;	// 선택되어있는 메인 코드
	this.selectedSub = null;	// 선택되어있는 서브 코드
	this.selectedTimeout = null;	// 메뉴 아웃시 초기 메뉴로 돌아가는 action timeout 객체


	// 메뉴 액션 움직임 처리
	this.subBaseAction = "";	// 서브메뉴틀 액션 처리

	// 메뉴정보
	this.baseObj = null;				// 전체 메뉴 base	
	this.baseWidth = 700;				// 메뉴 div 넓이
	this.baseHeight = 50;				// 메뉴 div 높이
	this.baseFontType = "fontImage";	// 글자 형태(이미지, 웹폰트)
	this.subBaseObj = null;				// 서브메뉴가 객체
	this.mainFontCode = 1;				// 메인메뉴 폰트
	this.mainFontFamily = "";			// 메인메뉴 폰트
	this.mainFontSize = 12;				// 메인메뉴 폰트 크기
	this.mainFontColor = "000000";		// 메인메뉴 색상
	this.mainFontWeight = "";			// 메인메뉴 굵기
	this.mainFontSpace = "";			// 메인메뉴 글자간격
	this.mainFontCodeOver = 1;			// 메인메뉴 폰트 (over)
	this.mainFontFamilyOver = "";		// 메인메뉴 폰트 (over)
	this.mainFontSizeOver = 12;			// 메인메뉴 폰트 크기 (over)
	this.mainFontColorOver = "000000";	// 메인메뉴 색상 (over)
	this.mainFontWeightOver = "";		// 메인메뉴 굵기 (over)
	this.mainFontSpaceOver = "";		// 메인메뉴 글자간격 (over)
	this.mainAlign = "justify";			// 메인메뉴 정렬
	this.mainAlignPos = 0;				// 메인메뉴 정렬후 마진
	this.mainDistance = 30;				// 메인메뉴간 간격
	this.mainTopPos = 5;				// 메인메뉴 상단 위치
	this.subFontCode = 1;				// 서브메뉴 폰트
	this.subFontFamily = "";			// 서브메뉴 폰트
	this.subFontSize = 10;				// 서브메뉴 폰트 크기
	this.subFontColor = "000000";		// 서브메뉴 색상
	this.subFontWeight = "";			// 서브메뉴 굵기
	this.subFontSpace = "";				// 서브메뉴 글자간격
	this.subFontCodeOver = 1;			// 서브메뉴 폰트 (over)
	this.subFontFamilyOver = "";		// 서브메뉴 폰트 (over)
	this.subFontSizeOver = 10;			// 서브메뉴 폰트 크기 (over)
	this.subFontColorOver = "000000";	// 서브메뉴 색상 (over)
	this.subFontWeightOver = "";		// 서브메뉴 굵기 (over)
	this.subFontSpaceOver = "";			// 서브메뉴 글자간격 (over)
	this.subAlign = "justify";			// 서브메뉴 정렬
	this.subAlignPos = 0;				// 서브메뉴 정렬후 마진
	this.subDistance = 15;				// 서브메뉴간 간격
	this.subTopPos = 30;				// 서브메뉴 상단 위치

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
	menuCreator.prototype.getXMLHttpRequest = function() {
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
	menuCreator.prototype.sendRequest = function(url, params, callback, method) {
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
	menuCreator.prototype.onStateChange = function() {
		this.callback(this.httpRequest);
	}	// end onStateChange end	


	// 리스트xml호출
	menuCreator.prototype.requestXML = function(){
		params  = "action=getMenu";		
		params += "&baseFontType="+this.baseFontType;
		params += "&mainFontCode="+this.mainFontCode;
		params += "&mainFontSize="+this.mainFontSize;
		params += "&mainFontColor="+this.mainFontColor;
		params += "&mainFontCodeOver="+this.mainFontCodeOver;
		params += "&mainFontSizeOver="+this.mainFontSizeOver;
		params += "&mainFontColorOver="+this.mainFontColorOver;
		params += "&subFontCode="+this.subFontCode;
		params += "&subFontSize="+this.subFontSize;
		params += "&subFontColor="+this.subFontColor;
		params += "&subFontCodeOver="+this.subFontCodeOver;
		params += "&subFontSizeOver="+this.subFontSizeOver;
		params += "&subFontColorOver="+this.subFontColorOver;

		this.sendRequest(this.xmlFile, params, this.resultXML, "POST");
	}	// end requestXML function


	// XML결과
	menuCreator.prototype.resultXML = function(){
		if(this.httpRequest.readyState == 4){
			if(this.httpRequest.status == 200){
				//alert(this.httpRequest.responseText);
				this.docXML = this.httpRequest.responseXML;

				if(this.baseFontType != "fontWeb"){
					// 이미지 폰트
					this.createMenu();
				}else{
					// 웹폰트
					this.createMenuWebFont();
				}
			}
		}
	}	// end resultXML function


	menuCreator.prototype.displayMenu = function(menuBaseID){
		this.baseObj = document.getElementById(menuBaseID);
		this.baseObj.style.width = ""+this.baseWidth+"px";
		this.baseObj.style.height = ""+this.baseHeight+"px";

		// 웹폰트일경우 css파일 미리 불러옴
		if(this.baseFontType == "fontWeb"){
			cssFile = document.createElement("LINK");
			cssFile.setAttribute("href", "/core/fonts/webfonts/"+this.mainFontCode);
			cssFile.setAttribute("type", "text/css");
			cssFile.setAttribute("rel", "stylesheet");
			document.getElementsByTagName("head")[0].appendChild(cssFile);

			cssFile = document.createElement("LINK");
			cssFile.setAttribute("href", "/core/fonts/webfonts/"+this.mainFontCodeOver);
			cssFile.setAttribute("type", "text/css");
			cssFile.setAttribute("rel", "stylesheet");
			document.getElementsByTagName("head")[0].appendChild(cssFile);

			cssFile = document.createElement("LINK");
			cssFile.setAttribute("href", "/core/fonts/webfonts/"+this.subFontCode);
			cssFile.setAttribute("type", "text/css");
			cssFile.setAttribute("rel", "stylesheet");
			document.getElementsByTagName("head")[0].appendChild(cssFile);

			cssFile = document.createElement("LINK");
			cssFile.setAttribute("href", "/core/fonts/webfonts/"+this.subFontCodeOver);
			cssFile.setAttribute("type", "text/css");
			cssFile.setAttribute("rel", "stylesheet");
			document.getElementsByTagName("head")[0].appendChild(cssFile);
		}

		this.requestXML();
	}	// end displayMenu function


	menuCreator.prototype.createMenu = function(){		

		// 초기화
		while(true){
			if(this.baseObj.childNodes.length == 0) break;
			this.baseObj.removeChild(this.baseObj.childNodes[0]);
		}
				
		this.mainLayerArray = null;
		this.subLayerArray = null;
		this.mainLayerArray = new Array();
		this.subLayerArray = new Array();
		this.mainImageArray = null;
		this.subImageArray = null;
		this.subBaseArray = null;
		this.mainImageArray = new Array();
		this.subImageArray = new Array();
		this.subBaseArray = new Array();

		mTotal = this.docXML.getElementsByTagName("depth1").length;
		sTotal = this.docXML.getElementsByTagName("depth2").length;

		// 서브메뉴가 들어갈 위치 레이어 추가
		this.subBaseObj = document.createElement("DIV");
		this.subBaseObj.style.position = "absolute";
		this.subBaseObj.style.padding = "0px";
		this.subBaseObj.style.margin = "0px";
		this.subBaseObj.style.left = "0px";
		this.subBaseObj.style.top = "0px";
		this.subBaseObj.style.width = ""+this.baseWidth+"px";
		this.subBaseObj.style.height = ""+this.baseHeight+"px";
		this.baseObj.appendChild(this.subBaseObj);


		// 메인메뉴 이미지 처리
		for(i = 0; i < mTotal; i++){
			mainObj = this.docXML.getElementsByTagName("depth1").item(i);
			mainName = mainObj.getAttribute('name');
			mainImageFile = mainObj.getAttribute('mainImageFile');
			mainImageFileOver = mainObj.getAttribute('mainImageFileOver');

			// over out 배열 분리
			this.mainImageArray[i] = new Array();
			this.mainLayerArray[i] = new Array();
			this.subImageArray[i] = new Array();
			this.subLayerArray[i] = new Array();

			this.mainImageArray[i]['n'] = new Image();
			if(trim(mainImageFile) == ""){
				this.mainImageArray[i]['n'].src = "/core/fonts/text.html?fontCode="+this.mainFontCode+"&fontSize="+this.mainFontSize+"&fontColor="+this.mainFontColor+"&marginLeft=0&marginRight=0&marginTop=0&marginBottom=0&imageWidth=0&imageHeight=0&textAlign=2&text="+mainName;
			}else{
				this.mainImageArray[i]['n'].src = mainImageFile
			}
			this.mainImageArray[i]['n'].setAttribute("mainCode", i);
			this.mainImageArray[i]['n'].setAttribute("imgType", "n");

			this.mainImageArray[i]['o'] = new Image();
			if(trim(mainImageFileOver) == ""){
				this.mainImageArray[i]['o'].src = "/core/fonts/text.html?fontCode="+this.mainFontCodeOver+"&fontSize="+this.mainFontSizeOver+"&fontColor="+this.mainFontColorOver+"&marginLeft=0&marginRight=0&marginTop=0&marginBottom=0&imageWidth=0&imageHeight=0&textAlign=2&text="+mainName;
			}else{
				this.mainImageArray[i]['o'].src = mainImageFileOver;
			}
			this.mainImageArray[i]['o'].setAttribute("mainCode", i);
			this.mainImageArray[i]['o'].setAttribute("imgType", "o");
		}

		// 서브메뉴 이미지 처리
		for(i = 0; i < mTotal; i++){
			mainObj = this.docXML.getElementsByTagName("depth1").item(i);			
			subTotal = mainObj.childNodes.length;
			j = 0;
			for(x = 0; x < subTotal; x++){
				if(mainObj.childNodes[x].nodeType != 1) continue;
				subObj = mainObj.childNodes.item(x);
				subName = subObj.getAttribute('name');		// 메뉴명
				subImageFile = subObj.getAttribute('subImageFile');
				subImageFileOver = subObj.getAttribute('subImageFileOver');

				this.subImageArray[i][j] = new Array();
				this.subLayerArray[i][j] = new Array();

				this.subImageArray[i][j]['n'] = new Image();
				if(trim(subImageFile) == ""){
					this.subImageArray[i][j]['n'].src = "/core/fonts/text.html?fontCode="+this.subFontCode+"&fontSize="+this.subFontSize+"&fontColor="+this.subFontColor+"&marginLeft=0&marginRight=0&marginTop=0&marginBottom=0&imageWidth=0&imageHeight=0&textAlign=2&text="+subName;
				}else{
					this.subImageArray[i][j]['n'].src = subImageFile;
				}
				this.subImageArray[i][j]['n'].setAttribute("mainCode", i);
				this.subImageArray[i][j]['n'].setAttribute("subCode", j);
				this.subImageArray[i][j]['n'].setAttribute("imgType", "n");

				this.subImageArray[i][j]['o'] = new Image();
				if(trim(subImageFileOver) == ""){
					this.subImageArray[i][j]['o'].src = "/core/fonts/text.html?fontCode="+this.subFontCodeOver+"&fontSize="+this.subFontSizeOver+"&fontColor="+this.subFontColorOver+"&marginLeft=0&marginRight=0&marginTop=0&marginBottom=0&imageWidth=0&imageHeight=0&textAlign=2&text="+subName;
				}else{
					this.subImageArray[i][j]['o'].src = subImageFileOver;
				}				

				this.subImageArray[i][j]['o'].setAttribute("mainCode", i);
				this.subImageArray[i][j]['o'].setAttribute("subCode", j);
				this.subImageArray[i][j]['o'].setAttribute("imgType", "o");
				j++;			
			}
		}


		// 메뉴 생성
		for(i = 0; i < mTotal; i++){
			mainObj = this.docXML.getElementsByTagName("depth1").item(i);
			mainTarget = mainObj.getAttribute('target');	// 타겟
			mainLink = mainObj.getAttribute('link');		// 링크
			mainName = mainObj.getAttribute('name');		// 메뉴명
			mainFontWidth = parseInt(mainObj.getAttribute('mainFontWidth'));			// 폰트 넓이
			mainFontWidthOver = parseInt(mainObj.getAttribute('mainFontWidthOver'));	// 폰트 over넓이
			mainFontHeight = parseInt(mainObj.getAttribute('mainFontHeight'));			// 폰트 높이
			mainFontHeightOver = parseInt(mainObj.getAttribute('mainFontHeightOver'));	// 폰트 over높이

			// 큰레이어 기준으로 레이어 만듬
			mainDivWidth = (mainFontWidth > mainFontWidthOver) ? mainFontWidth : mainFontWidthOver;
			mainDivHeight = (mainFontHeight > mainFontHeightOver) ? mainFontHeight : mainFontHeightOver;

			/*
			메인메뉴 일반
			*/
			mainDIV = document.createElement("DIV");
			mainDIV.setAttribute("id", "mainMenuDIV_"+i);
			mainDIV.setAttribute("mainCode", i);
			mainDIV.style.position = "absolute";
			mainDIV.style.textAlign = "center";
			mainDIV.style.display = "none";
			mainDIV.style.width = ""+mainDivWidth+"px";
			mainDIV.style.height = ""+mainDivHeight+"px";
			mainDIV.style.backgroundPosition = "center";
			mainDIV.style.backgroundRepeat = "no-repeat";
			mainDIV.style.backgroundImage = "url("+this.mainImageArray[i]['n'].src+")";
			mainDIV.style.top = ""+this.mainTopPos+"px";
			mainDIV.onmouseover = function(){ menuCreator.mainOver(this); };			
			this.baseObj.appendChild(mainDIV);
			this.mainLayerArray[i]['n'] = mainDIV;

			/*
			메인메뉴 over
			*/
			mainDIV = document.createElement("DIV");
			mainDIV.setAttribute("id", "mainMenuOverDIV_"+i);
			mainDIV.setAttribute("mainCode", i);
			mainDIV.style.position = "absolute";
			mainDIV.style.textAlign = "center";
			mainDIV.style.display = "none";
			mainDIV.style.width = ""+mainDivWidth+"px";
			mainDIV.style.height = ""+mainDivHeight+"px";
			mainDIV.style.backgroundPosition = "center";
			mainDIV.style.backgroundRepeat = "no-repeat";
			mainDIV.style.backgroundImage = "url("+this.mainImageArray[i]['o'].src+")";
			mainDIV.style.top = ""+this.mainTopPos+"px";
			mainDIV.onmouseout = function(){ menuCreator.menuOut(); };

			this.baseObj.appendChild(mainDIV);
			this.mainLayerArray[i]['o'] = mainDIV;

			mainA = document.createElement("A");
			mainA.setAttribute("target", mainTarget);
			mainA.setAttribute("href", this.urlDecode(mainLink));
			mainA.style.display = "block";
			mainA.style.width = ""+mainDivWidth+"px";
			mainA.style.height = ""+mainDivHeight+"px";
			mainDIV.appendChild(mainA);

			/*
			메인메뉴에 해당되는 서브메뉴 생성
			*/
			// 서브 메뉴 감싸는 레이어 생성
			subBase = document.createElement("DIV");
			subBase.setAttribute("id", "subBaseDIV_"+i);
			subBase.setAttribute("mainCode", i);
			subBase.style.position = "absolute";
			subBase.style.overflow = "hidden";
			subBase.style.display = "none";
			subBase.style.width = ""+this.baseWidth+"px";
			subBase.style.height = "0px";
			subBase.style.top = ""+this.subTopPos+"px";
			subBase.style.left = "0px";
			this.subBaseObj.appendChild(subBase);
			this.subBaseArray[i] = subBase;

			subTotal = mainObj.childNodes.length;
			j = 0;
			maxHeight = 0;
			for(x = 0; x < subTotal; x++){
				if(mainObj.childNodes[x].nodeType != 1) continue;
				subObj = mainObj.childNodes.item(x);
				subTarget = subObj.getAttribute('target');	// 타겟
				subLink = subObj.getAttribute('link');		// 링크
				subName = subObj.getAttribute('name');		// 메뉴명
				subFontWidth = parseInt(subObj.getAttribute('subFontWidth'));			// 폰트 넓이
				subFontWidthOver = parseInt(subObj.getAttribute('subFontWidthOver'));	// 폰트 over넓이
				subFontHeight = parseInt(subObj.getAttribute('subFontHeight'));			// 폰트 높이
				subFontHeightOver = parseInt(subObj.getAttribute('subFontHeightOver'));	// 폰트 over높이

				// 큰레이어 기준으로 레이어 만듬
				subDivWidth = (subFontWidth > subFontWidthOver) ? subFontWidth : subFontWidthOver;
				subDivHeight = (subFontHeight > subFontHeightOver) ? subFontHeight : subFontHeightOver;

				if(subDivHeight > maxHeight) maxHeight = subDivHeight;

				/*
				서브메뉴 일반
				*/
				subDIV = document.createElement("DIV");
				subDIV.setAttribute("id", "subMenuDIV_"+i+"_"+j);
				subDIV.setAttribute("mainCode", i);
				subDIV.setAttribute("subCode", j);
				subDIV.style.position = "absolute";
				subDIV.style.display = "none";
				subDIV.style.width = ""+subDivWidth+"px";
				subDIV.style.height = ""+subDivHeight+"px";
				subDIV.style.backgroundPosition = "center";
				subDIV.style.backgroundRepeat = "no-repeat";
				subDIV.style.backgroundImage = "url("+this.subImageArray[i][j]['n'].src+")";
				subDIV.style.top = "0px";
				subDIV.onmouseover = function(){ menuCreator.subOver(this); };				
				subBase.appendChild(subDIV);
				this.subLayerArray[i][j]['n'] = subDIV;

				/*
				서브메뉴 over
				*/
				subDIV = document.createElement("DIV");
				subDIV.setAttribute("id", "subMenuOverDIV_"+i+"_"+j);
				subDIV.setAttribute("mainCode", i);
				subDIV.setAttribute("subCode", j);
				subDIV.style.position = "absolute";
				subDIV.style.display = "none";
				subDIV.style.width = ""+subDivWidth+"px";
				subDIV.style.height = ""+subDivHeight+"px";
				subDIV.style.backgroundPosition = "center";
				subDIV.style.backgroundRepeat = "no-repeat";
				subDIV.style.backgroundImage = "url("+this.subImageArray[i][j]['o'].src+")";
				subDIV.style.top = "0px";
				subDIV.onmouseout = function(){ menuCreator.menuOut(); };
				subBase.appendChild(subDIV);
				this.subLayerArray[i][j]['o'] = subDIV;

				subA = document.createElement("A");
				subA.setAttribute("target", subTarget);
				subA.setAttribute("href", this.urlDecode(subLink));
				subA.style.display = "block";
				subA.style.width = ""+subDivWidth+"px";
				subA.style.height = ""+subDivHeight+"px";
				subDIV.appendChild(subA);

				j++;
			}
			subBase.style.height = ""+maxHeight+"px";
		}
		this.setMainMenu();	// 메인메뉴 정리
		this.setSubMenu();	// 서브메뉴 정리
		this.setSelectedMenu();
	}	// end createMenu function


	menuCreator.prototype.createMenuWebFont = function(){		

		// 초기화
		while(true){
			if(this.baseObj.childNodes.length == 0) break;
			this.baseObj.removeChild(this.baseObj.childNodes[0]);
		}
				
		this.mainLayerArray = null;
		this.subLayerArray = null;
		this.mainLayerArray = new Array();
		this.subLayerArray = new Array();
		this.subBaseArray = null;
		this.subBaseArray = new Array();

		mTotal = this.docXML.getElementsByTagName("depth1").length;
		sTotal = this.docXML.getElementsByTagName("depth2").length;

		// 서브메뉴가 들어갈 위치 레이어 추가
		this.subBaseObj = document.createElement("DIV");
		this.subBaseObj.style.position = "absolute";
		this.subBaseObj.style.padding = "0px";
		this.subBaseObj.style.margin = "0px";
		this.subBaseObj.style.left = "0px";
		this.subBaseObj.style.top = "0px";
		this.subBaseObj.style.width = ""+this.baseWidth+"px";
		this.subBaseObj.style.height = ""+this.baseHeight+"px";
		this.baseObj.appendChild(this.subBaseObj);


		// 메인메뉴 이미지 처리
		for(i = 0; i < mTotal; i++){
			mainObj = this.docXML.getElementsByTagName("depth1").item(i);
			mainName = this.base64Decode(mainObj.getAttribute('name'));

			// over out 배열 분리
			this.mainLayerArray[i] = new Array();
			this.subLayerArray[i] = new Array();			
		}
		
				// 서브메뉴 이미지 처리
		for(i = 0; i < mTotal; i++){
			mainObj = this.docXML.getElementsByTagName("depth1").item(i);			
			subTotal = mainObj.childNodes.length;
			j = 0;
			for(x = 0; x < subTotal; x++){
				if(mainObj.childNodes[x].nodeType != 1) continue;
				subObj = mainObj.childNodes.item(x);
				subName = this.base64Decode(subObj.getAttribute('name'));		// 메뉴명
				this.subLayerArray[i][j] = new Array();				
				j++;			
			}
		}


		// 메뉴 생성
		for(i = 0; i < mTotal; i++){
			mainObj = this.docXML.getElementsByTagName("depth1").item(i);
			mainTarget = mainObj.getAttribute('target');	// 타겟
			mainLink = mainObj.getAttribute('link');		// 링크
			mainName = this.base64Decode(mainObj.getAttribute('name'));		// 메뉴명

			// text div
			mainTextDiv = document.createElement("DIV");
			mainTextDiv.style.position = 'absolute';
			mainTextDiv.style.left = '5px';
			mainTextDiv.style.top = '-300px';
			mainTextDiv.style.padding = '0px';
			mainTextDiv.style.margin = '0px';
			mainTextDiv.style.cursor = 'pointer';
			mainTextDiv.style.color = "#"+this.mainFontColor;
			mainTextDiv.style.fontSize = ""+this.mainFontSize+"px";
			mainTextDiv.style.fontFamily = this.mainFontFamily;
			if(this.mainFontWeight != ""){
				mainTextDiv.style.fontWeight = this.mainFontWeight;
			}
			if(this.mainFontSpace != ""){
				mainTextDiv.style.letterSpacing = ""+this.mainFontSpace+"px";
			}
			mainTextDiv.innerHTML = mainName;
			mainTextDiv.style.display = "block";
			document.body.appendChild(mainTextDiv);
			mainFontWidth = mainTextDiv.clientWidth + 5;
			mainFontHeight = mainTextDiv.clientHeight;


			// text div over
			mainTextDivOver = document.createElement("DIV");
			mainTextDivOver.style.position = 'absolute';
			mainTextDivOver.style.left = '5px';
			mainTextDivOver.style.top = '-300px';
			mainTextDivOver.style.padding = '0px';
			mainTextDivOver.style.margin = '0px';
			mainTextDivOver.style.cursor = 'pointer';
			mainTextDivOver.style.color = "#"+this.mainFontColorOver;
			mainTextDivOver.style.fontSize = ""+this.mainFontSizeOver+"px";
			mainTextDivOver.style.fontFamily = this.mainFontFamilyOver;
			if(this.mainFontWeightOver != ""){
				mainTextDivOver.style.fontWeight = this.mainFontWeightOver;
			}
			if(this.mainFontSpaceOver != ""){
				mainTextDivOver.style.letterSpacing = ""+this.mainFontSpaceOver+"px";
			}
			mainTextDivOver.innerHTML = mainName;
			mainTextDivOver.style.display = "block";
			document.body.appendChild(mainTextDivOver);
			mainFontWidthOver = mainTextDivOver.clientWidth + 5;
			mainFontHeightOver = mainTextDivOver.clientHeight;


			// 큰레이어 기준으로 레이어 만듬
			mainDivWidth = (mainFontWidth > mainFontWidthOver) ? mainFontWidth : mainFontWidthOver;
			mainDivHeight = (mainFontHeight > mainFontHeightOver) ? mainFontHeight : mainFontHeightOver;
			mainDivWidth = mainDivWidth + 8;
			mainDivHeight = mainDivHeight + 8;

			/*
			메인메뉴 일반
			*/
			// 임시 텍스트 레이어 삭제 및 위치값 재정의
			document.body.removeChild(mainTextDiv);
			divLeft = parseInt((mainDivWidth - mainFontWidth) / 2);
			divTop = parseInt((mainDivHeight - mainFontHeight) / 2);
			mainTextDiv.style.left = ""+divLeft+"px";
			mainTextDiv.style.top = ""+divTop+"px";
			mainDIV = document.createElement("DIV");
			mainDIV.setAttribute("id", "mainMenuDIV_"+i);
			mainDIV.setAttribute("mainCode", i);
			mainDIV.style.position = "absolute";
			mainDIV.style.textAlign = "center";
			mainDIV.style.display = "none";
			mainDIV.style.cursor = "pointer";
			mainDIV.style.width = ""+mainDivWidth+"px";
			mainDIV.style.height = ""+mainDivHeight+"px";
			mainDIV.style.top = ""+this.mainTopPos+"px";
			mainDIV.onmouseover = function(){ menuCreator.mainOver(this); };
			mainDIV.appendChild(mainTextDiv);
			this.baseObj.appendChild(mainDIV);
			this.mainLayerArray[i]['n'] = mainDIV;

			/*
			메인메뉴 over
			*/
			// 임시 텍스트 레이어 삭제 및 위치값 재정의
			document.body.removeChild(mainTextDivOver);
			divLeft = parseInt((mainDivWidth - mainFontWidthOver) / 2);
			divTop = parseInt((mainDivHeight - mainFontHeightOver) / 2);
			mainTextDivOver.style.left = ""+divLeft+"px";
			mainTextDivOver.style.top = ""+divTop+"px";
			mainDIV = document.createElement("DIV");
			mainDIV.setAttribute("id", "mainMenuOverDIV_"+i);
			mainDIV.setAttribute("mainCode", i);
			mainDIV.style.position = "absolute";
			mainDIV.style.textAlign = "center";
			mainDIV.style.display = "none";
			mainDIV.style.cursor = "pointer";
			mainDIV.style.width = ""+mainDivWidth+"px";
			mainDIV.style.height = ""+mainDivHeight+"px";			
			mainDIV.style.top = ""+this.mainTopPos+"px";
			mainDIV.onmouseout = function(){ menuCreator.menuOut(); };
			mainDIV.appendChild(mainTextDivOver);

			this.baseObj.appendChild(mainDIV);
			this.mainLayerArray[i]['o'] = mainDIV;

			mainA = document.createElement("A");
			mainA.setAttribute("target", mainTarget);
			mainA.setAttribute("href", this.urlDecode(mainLink));
			mainA.style.display = "block";
			mainA.style.position = "absolute";
			mainA.style.left = "1px";
			mainA.style.top = "1px";
			mainA.style.zIndex = "1";
			mainA.style.backgroundColor = "#000000";
			mainA.style.width = ""+mainDivWidth+"px";
			mainA.style.height = ""+mainDivHeight+"px";
			mainA.style.filter = "Alpha(Opacity:0);";
			mainA.style.opacity = 0;
			mainDIV.appendChild(mainA);

			/*
			메인메뉴에 해당되는 서브메뉴 생성
			*/
			// 서브 메뉴 감싸는 레이어 생성
			subBase = document.createElement("DIV");
			subBase.setAttribute("id", "subBaseDIV_"+i);
			subBase.setAttribute("mainCode", i);
			subBase.style.position = "absolute";
			subBase.style.overflow = "hidden";
			subBase.style.display = "none";
			subBase.style.width = ""+this.baseWidth+"px";
			subBase.style.height = "0px";
			subBase.style.top = ""+this.subTopPos+"px";
			subBase.style.left = "0px";
			this.subBaseObj.appendChild(subBase);
			this.subBaseArray[i] = subBase;

			subTotal = mainObj.childNodes.length;
			j = 0;
			maxHeight = 0;
			for(x = 0; x < subTotal; x++){
				if(mainObj.childNodes[x].nodeType != 1) continue;
				subObj = mainObj.childNodes.item(x);
				subTarget = subObj.getAttribute('target');	// 타겟
				subLink = subObj.getAttribute('link');		// 링크
				subName = this.base64Decode(subObj.getAttribute('name'));		// 메뉴명

				// text div
				subTextDiv = document.createElement("DIV");
				subTextDiv.style.position = 'absolute';
				subTextDiv.style.left = '5px';
				subTextDiv.style.top = '-300px';
				subTextDiv.style.padding = '0px';
				subTextDiv.style.margin = '0px';
				subTextDiv.style.cursor = 'pointer';
				subTextDiv.style.color = "#"+this.subFontColor;
				subTextDiv.style.fontSize = ""+this.subFontSize+"px";
				subTextDiv.style.fontFamily = this.subFontFamily;
				if(this.subFontWeight != ""){
					subTextDiv.style.fontWeight = this.subFontWeight;
				}
				if(this.subFontSpace != ""){
					subTextDiv.style.letterSpacing = ""+this.subFontSpace+"px";
				}
				subTextDiv.innerHTML = subName;
				subTextDiv.style.display = "block";
				document.body.appendChild(subTextDiv);
				subFontWidth = subTextDiv.clientWidth + 5;
				subFontHeight = subTextDiv.clientHeight;


				// text div over
				subTextDivOver = document.createElement("DIV");
				subTextDivOver.style.position = 'absolute';
				subTextDivOver.style.left = '5px';
				subTextDivOver.style.top = '-300px';
				subTextDivOver.style.padding = '0px';
				subTextDivOver.style.margin = '0px';
				subTextDivOver.style.cursor = 'pointer';
				subTextDivOver.style.color = "#"+this.subFontColorOver;
				subTextDivOver.style.fontSize = ""+this.subFontSizeOver+"px";
				subTextDivOver.style.fontFamily = this.subFontFamilyOver;
				if(this.subFontWeightOver != ""){
					subTextDivOver.style.fontWeight = this.subFontWeightOver;
				}
				if(this.subFontSpaceOver != ""){
					subTextDivOver.style.letterSpacing = ""+this.subFontSpaceOver+"px";
				}
				subTextDivOver.innerHTML = subName;
				subTextDivOver.style.display = "block";
				document.body.appendChild(subTextDivOver);
				subFontWidthOver = subTextDivOver.clientWidth + 5;
				subFontHeightOver = subTextDivOver.clientHeight;


				// 큰레이어 기준으로 레이어 만듬
				subDivWidth = (subFontWidth > subFontWidthOver) ? subFontWidth : subFontWidthOver;
				subDivHeight = (subFontHeight > subFontHeightOver) ? subFontHeight : subFontHeightOver;
				subDivWidth = subDivWidth + 4;
				subDivHeight = subDivHeight + 4;

				if(subDivHeight > maxHeight) maxHeight = subDivHeight;

				/*
				서브메뉴 일반
				*/
				// 임시 텍스트 레이어 삭제 및 위치값 재정의
				document.body.removeChild(subTextDiv);
				divLeft = parseInt((subDivWidth - subFontWidth) / 2);
				divTop = parseInt((subDivHeight - subFontHeight) / 2);
				subTextDiv.style.left = ""+divLeft+"px";
				subTextDiv.style.top = ""+divTop+"px";
				subDIV = document.createElement("DIV");
				subDIV.setAttribute("id", "subMenuDIV_"+i+"_"+j);
				subDIV.setAttribute("mainCode", i);
				subDIV.setAttribute("subCode", j);
				subDIV.style.position = "absolute";
				subDIV.style.display = "none";
				subDIV.style.cursor = "pointer";
				subDIV.style.width = ""+subDivWidth+"px";
				subDIV.style.height = ""+subDivHeight+"px";
				subDIV.style.top = "0px";
				subDIV.onmouseover = function(){ menuCreator.subOver(this); };				
				subDIV.appendChild(subTextDiv);
				subBase.appendChild(subDIV);
				this.subLayerArray[i][j]['n'] = subDIV;

				/*
				서브메뉴 over
				*/
				// 임시 텍스트 레이어 삭제 및 위치값 재정의
				document.body.removeChild(subTextDivOver);
				divLeft = parseInt((subDivWidth - subFontWidthOver) / 2);
				divTop = parseInt((subDivHeight - subFontHeightOver) / 2);
				subTextDivOver.style.left = ""+divLeft+"px";
				subTextDivOver.style.top = ""+divTop+"px";
				subDIV = document.createElement("DIV");
				subDIV.setAttribute("id", "subMenuOverDIV_"+i+"_"+j);
				subDIV.setAttribute("mainCode", i);
				subDIV.setAttribute("subCode", j);
				subDIV.style.position = "absolute";
				subDIV.style.display = "none";
				subDIV.style.cursor = "pointer";
				subDIV.style.width = ""+subDivWidth+"px";
				subDIV.style.height = ""+subDivHeight+"px";				
				subDIV.style.top = "0px";
				subDIV.onmouseout = function(){ menuCreator.menuOut(); };
				subDIV.appendChild(subTextDivOver);
				subBase.appendChild(subDIV);
				this.subLayerArray[i][j]['o'] = subDIV;

				subA = document.createElement("A");
				subA.setAttribute("target", subTarget);
				subA.setAttribute("href", this.urlDecode(subLink));
				subA.style.display = "block";
				subA.style.position = "absolute";
				subA.style.left = "1px";
				subA.style.top = "1px";
				subA.style.zIndex = "1";
				subA.style.backgroundColor = "#000000";
				subA.style.width = ""+subDivWidth+"px";
				subA.style.height = ""+subDivHeight+"px";
				subA.style.filter = "Alpha(Opacity:0);";
				subA.style.opacity = 0;
				subDIV.appendChild(subA);

				j++;
			}
			subBase.style.height = ""+maxHeight+"px";
		}
		this.setMainMenu();	// 메인메뉴 정리
		this.setSubMenu();	// 서브메뉴 정리
		this.setSelectedMenu();
	}	// end createMenuWebFont function


	// 메인메뉴 정리
	menuCreator.prototype.setMainMenu = function(){		
		
		// 전체 메뉴수
		mTotal = this.mainLayerArray.length;

		// 각 메뉴의 전체 넓이 값
		totalWidth = 0;
		for(i = 0; i < mTotal; i++){
			totalWidth += parseInt(this.mainLayerArray[i]['o'].style.width);
		}

		// 양쪽정렬
		if(this.mainAlign == "justify" || (totalWidth+this.mainAlignPos) > this.baseWidth){
			xPos = this.mainAlignPos;
			distance = parseInt( (this.baseWidth - totalWidth - this.mainAlignPos) / (mTotal-1) );

		// 오른쪽정렬
		}else if(this.mainAlign == "right"){
			xPos = this.baseWidth - totalWidth - this.mainAlignPos - (this.mainDistance * (mTotal-1));
			distance = this.mainDistance;

		// 왼쪽 정렬
		}else{
			xPos = this.mainAlignPos;
			distance = this.mainDistance;
		}


		for(i = 0; i < mTotal; i++){
			this.mainLayerArray[i]['n'].style.left = ""+xPos+"px";
			this.mainLayerArray[i]['n'].style.display = "block";
			this.mainLayerArray[i]['o'].style.left = ""+xPos+"px";
			this.mainLayerArray[i]['o'].style.display = "none";
			layerWidth = parseInt(this.mainLayerArray[i]['o'].style.width);
			xPos = parseInt(xPos) + parseInt(layerWidth) + parseInt(distance);			
		}		
	}	// end setMainMenu function


	// 서브메뉴 정리
	menuCreator.prototype.setSubMenu = function(){
		// menuCode, mainWidth, mainLeft

		// 큰메뉴수
		mTotal = this.mainLayerArray.length;
		for(i = 0; i < mTotal; i++){

			mainWidth = parseInt(this.mainLayerArray[i]['o'].style.width);
			mainLeft = parseInt(this.mainLayerArray[i]['o'].style.left);
			mainCenter = mainLeft + parseInt(mainWidth / 2);
			mainRight = mainLeft + mainWidth;

			// 전체 서브메뉴수
			sTotal = this.subLayerArray[i].length;

			// 메뉴 전체 크기
			sTotalWidth = 0;
			for(j = 0; j < sTotal; j++){
				sTotalWidth += parseInt(this.subLayerArray[i][j]['o'].style.width);
				if(j != 0){
					sTotalWidth += parseInt(this.subDistance);
				}
			}

			// 중양 정렬
			if(this.subAlign == "center"){
				xPos = mainCenter - parseInt(sTotalWidth / 2) - parseInt(this.subAlignPos);
				if(xPos < 0) xPos = 0;
				if((xPos + sTotalWidth) > this.baseWidth) xPos = this.baseWidth - sTotalWidth;

			// 오른쪽정렬
			}else if(this.subAlign == "right"){
				xPos = mainRight - sTotalWidth + parseInt(this.subAlignPos);
				if(xPos < 0) xPos = 0;
			// 왼쪽 정렬
			}else{
				xPos = mainLeft - parseInt(this.subAlignPos);
				if((xPos + sTotalWidth) > this.baseWidth) xPos = this.baseWidth - sTotalWidth;
			}
			if(sTotalWidth > this.baseWidth) xPos = 0;


			for(j = 0; j < sTotal; j++){				
				this.subLayerArray[i][j]['n'].style.left = ""+xPos+"px";
				this.subLayerArray[i][j]['o'].style.left = ""+xPos+"px";
				this.subLayerArray[i][j]['n'].style.display = "block";
				this.subLayerArray[i][j]['o'].style.display = "none";
				xPos = xPos + parseInt(this.subLayerArray[i][j]['o'].style.width) + parseInt(this.subDistance);
			}
		}
	}	// end setSubMenu function


	// 초기 메뉴 코드
	menuCreator.prototype.setSelectedMenu = function(){
		if(this.selectedCode.length != 6) return;

		mainCode = parseInt(this.selectedCode.substr(0, 2));
		subCode = parseInt(this.selectedCode.substr(2, 2));

		mi = mainCode - 1;
		this.mainOver(this.mainLayerArray[mi]['o']);

		sj = subCode - 1;
		this.subOver(this.subLayerArray[mi][sj]['o']);
	}	// end setSelectedMenu function


	// 메뉴 아웃시 초기 메뉴 활성화
	menuCreator.prototype.menuOut = function(){		
		
		// 초기 메뉴이동 요청시 취소
		if(this.selectedTimeout != null){
			clearTimeout(this.selectedTimeout);
			this.selectedTimeout = null;
		}
		this.selectedTimeout = setTimeout("menuCreator.setSelectedMenu();", 1000);		
	}	// end menuOut function	


	// 메인 마우스 오버
	menuCreator.prototype.mainOver = function(obj){

		// 초기 메뉴이동 요청시 취소
		if(this.selectedTimeout != null){
			clearTimeout(this.selectedTimeout);
			this.selectedTimeout = null;
		}

		mTotal = this.mainLayerArray.length;
		this.selectedMain = parseInt(obj.getAttribute("mainCode"));

		// 메인메뉴 출력
		for(i = 0; i < mTotal; i++){
			if(this.selectedMain == i){
				this.mainLayerArray[i]['o'].style.display = "block";
				this.mainLayerArray[i]['n'].style.display = "none";
			}else{
				this.mainLayerArray[i]['n'].style.display = "block";
				this.mainLayerArray[i]['o'].style.display = "none";
			}
		}

		// 서브메뉴 출력
		if(this.subBaseAction != ""){
			setTimeout(this.subBaseAction, 1);
		}else{
			for(i = 0; i < mTotal; i++){
				if(this.selectedMain == i){
					this.subBaseArray[i].style.display = "block";
				}else{
					this.subBaseArray[i].style.display = "none";
				}
			}
		}
	}	// end mainOver function


	// 서브 마우스 오버
	menuCreator.prototype.subOver = function(obj){

		// 초기 메뉴이동 요청시 취소
		if(this.selectedTimeout != null){
			clearTimeout(this.selectedTimeout);
			this.selectedTimeout = null;
		}

		mainCode = parseInt(obj.getAttribute("mainCode"));
		this.selectedSub = parseInt(obj.getAttribute("subCode"));
		sTotal = this.subLayerArray[mainCode].length;

		for(i = 0; i < sTotal; i++){
			if(this.selectedSub == i){
				this.subLayerArray[mainCode][i]['o'].style.display = "block";
				this.subLayerArray[mainCode][i]['n'].style.display = "none";
			}else{
				this.subLayerArray[mainCode][i]['n'].style.display = "block";
				this.subLayerArray[mainCode][i]['o'].style.display = "none";
			}
		}
	}	// end subOver function


	// url 디코딩
	menuCreator.prototype.urlDecode = function(data){
	  var lsRegExp = /\+/g;
	  return decodeURIComponent(String(data).replace(lsRegExp, " "));
	}	// end urlDecode function


	// base64 디코딩
	menuCreator.prototype.base64Decode = function(input){
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
	menuCreator.prototype.base64Utf8Decode = function(utftext){
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


	
}	// end menuCreator Class
//-->