<!--
// 기본 게시판 스크립트
anyboardSkin = function(boardID, Mode){
	this.docXML;				// XML데이터 return 값
	this.callback = null;		// XML결과 return함수
	this.httpRequest = null;	// httpRequest객체
	this.boardID = boardID;		// 게시판 ID
	this.Mode = (Mode != "") ? Mode : "list";	// 게시판 모드
	this.lastFileList = null;
	this.shadow = null;				// 그림자 레이어
	this.shadowInt = null;			// 그림자 레이어 크기조절 이벤트
	this.fileCountImage = 0;		// 이미지파일 리스트
	this.fileCount = 0;				// 일반파일 리스트수

	// 업로드 관련
	this.keyPos = 0;				// 임시파일 키 적용
	this.isGetInfo = 0;				// 임시파일 가져오는지 체크
	this.keyArray = new Array();	// 키 배열
	this.countAll = 0;
	this.countImage = 0;
	this.countFile = 0;
	this.uploadLocation = null;

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
	anyboardSkin.prototype.getXMLHttpRequest = function() {
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
	anyboardSkin.prototype.sendRequest = function(url, params, callback, method) {
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
	anyboardSkin.prototype.onStateChange = function() {
		this.callback(this.httpRequest);
	}	// end onStateChange end
	
	// sns 아이콘 보기
	anyboardSkin.prototype.snsIconView = function(){
		if(document.getElementById("snsBtn").style.display == "block"){
			document.getElementById("snsBtn").style.display = "none";
			document.getElementById("AB_viewIconSNS").src = "/core/anyboard/responsive_default/images/bul_arrow_right.png";
		}else{
			document.getElementById("snsBtn").style.display = "block";
			document.getElementById("AB_viewIconSNS").src = "/core/anyboard/responsive_default/images/bul_arrow_left.png";
		}
	}	// end snsIconView function


	// 액션 목록
	anyboardSkin.prototype.tobeView = function(){
		if(document.getElementById("tobeBtn").style.display == "block"){
			document.getElementById("tobeBtn").style.display = "none";
		}else{
			document.getElementById("tobeBtn").style.display = "block";
		}
	}	// end tobeView function


	// 댓글 보기
	anyboardSkin.prototype.commentView = function(){
		if(document.getElementById("AB_commentView").style.display == "block"){
			document.getElementById("AB_commentView").style.display = "none";
		}else{
			document.getElementById("AB_commentView").style.display = "block";
		}
	}	// end commentView function


	// 포토앨범 보이기
	anyboardSkin.prototype.contentView = function(albumID, dsp){
		document.getElementById(albumID).style.display = dsp;
	}	// end contentView function


	// 파일목록 보기
	anyboardSkin.prototype.fileListView = function(e, listID){
		if(this.lastFileList != listID){
			if(this.lastFileList != null){
				document.getElementById(this.lastFileList).style.display = "none";
			}
			this.lastFileList = listID;
		}
		if(document.getElementById(listID).style.display == "block"){
			document.getElementById(listID).style.display = "none";
		}else{
			document.getElementById(listID).style.display = "block";
		}
	}	// end fileListView function


	// 액션 목록
	anyboardSkin.prototype.tobeAct = function(act, num){
		document.getElementById("tobeBtn").style.display = "none";

		switch(act){
			// 추천
			case 'recom':
				anyboard.recom(num);
				/*txt = document.getElementById("AB_viewRecomText").innerHTML;
				txtArr = txt.split(" ");
				recnt = parseInt(txtArr[1]) + 1;
				document.getElementById("AB_viewRecomText").innerHTML = "추천 "+recnt;*/
				break;

			// 스크랩
			case 'scrap':
				anyboard.scrap(num);
				break;

			// 인쇄
			case 'print':
				initBody = document.body.innerHTML;
				document.body.innerHTML = document.getElementById("AB_viewPrintArea").innerHTML;
				window.print();
				document.body.innerHTML = initBody;
				break;

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


	// 삭제 폼 오픈
	anyboardSkin.prototype.delFormOpen = function(e, comNum){
		this.shadowCreate();

		pX = (!window.event) ? e.pageX : document.documentElement.scrollLeft + document.body.scrollLeft + window.event.clientX;
		pY = (!window.event) ? e.pageY : document.documentElement.scrollTop + document.body.scrollTop + window.event.clientY;		
		
		formObj = document.getElementById("deleteBoxForm");
		pNode = formObj.parentNode;
		pNodeX = this.findPosX(pNode);
		pNodeY = this.findPosY(pNode);
		pX = pX-400-parseInt(pNodeX);
		pY = pY-20-parseInt(pNodeY);
		formObj.style.top = ""+pY+"px";
		formObj.style.left = ""+pX+"px";
		formObj.style.display = "block";
		document.anyboardForm.reset();
		document.anyboardForm.commentNum.value = comNum;
		document.anyboardForm.password.focus();
	}	// end delFormOpen function


	// 삭제 폼 닫기
	anyboardSkin.prototype.delFormClose = function(){
		formObj = document.getElementById("deleteBoxForm");
		formObj.style.display = "none";
		this.shadowRemove();
	}	// end delFormClose function


	// 페이지 이동 폼 오픈
	anyboardSkin.prototype.multiMoveFormOpen = function(){

		form = document.anyboardListForm;
		listTotal = form.elements['boardNum[]'].length;
		chk = false;

		if(listTotal){
			for(i = 0; i < listTotal; i++){
				if(form.elements['boardNum[]'][i].checked){
					chk = true;
				}
			}
		}else{
			if(form.elements['boardNum[]']){
				if(form.elements['boardNum[]'].checked){
					chk = true;
				}
			}
		}
		if(!chk){
			alert("선택한 게시물이 없습니다.");
			return;
		}

		if(!this.isIE){
			this.shadowCreate();
		}
		formObj = document.getElementById("multiMoveFormBox");
		formObj.style.zIndex = "99999";
		formObj.style.display = "block";
	}	// end multiMoveFormOpen function


	// 페이지 이동 폼 오픈
	anyboardSkin.prototype.multiMoveFormClose = function(){
		formObj = document.getElementById("multiMoveFormBox");
		formObj.style.display = "none";
		this.shadowRemove();
	}	// end multiMoveFormClose function


	// 페이지 이동 폼 오픈
	anyboardSkin.prototype.uploadOpen = function(e){
		maxCount = parseInt(anyboard.boardInfo['uploadCount']);
		saveFileCount = parseInt(this.fileCountImage + this.fileCount);
		if(maxCount <= saveFileCount){
			alert("최대 업로드 가능한 파일 수 "+maxCount+"개를 초과하여 파일 추가가 불가합니다.");
			return;
		}
		this.shadowCreate();
		evtX = (!window.event) ? e.pageX : document.documentElement.scrollLeft + window.event.clientX;
		evtY = (!window.event) ? e.pageY : document.documentElement.scrollTop + window.event.clientY;		

		// 업로드 위치
		upX = evtX - 550;
		upY = evtY - 535;
		if(upX < 0) upX = 0;
		if(upY < 0) upY = 0;

		htmlDIV = document.createElement("DIV");		
		htmlDIV.style.zIndex = "999";
		htmlDIV.style.position = "absolute";
		htmlDIV.style.top = ""+upY+"px";
		htmlDIV.style.left = ""+upX+"px";
		htmlDIV.style.width = "550px";
		htmlDIV.style.height = "535px";
		htmlDIV.style.padding = "0px";
		htmlDIV.style.margin = "0px";
		htmlDIV.setAttribute('id', 'ANYBOARDUPLOADFRAME');
		
		htmlDIV.innerHTML = "<iframe name='anyboardUploadFrame' frameborder='0' scrolling='no' width='550' height='535' bgcolor='#FFFFFF' src='/core/anyboard/upload.php?boardID="+this.boardID+"&saveFileCount="+saveFileCount+"'></iframe>";

		document.body.appendChild(htmlDIV); 
	}	// end uploadStart function


	// 페이지 이동 폼 오픈
	anyboardSkin.prototype.uploadClose = function(){
		frameObj = document.getElementById("ANYBOARDUPLOADFRAME");
		document.body.removeChild(frameObj); 
		this.shadowRemove();
	}	// end uploadStart function

	// 폼사이즈가 크면 에디터 닫기
	anyboardSkin.prototype.editorToolResize = function(){
		if(boardEditor.cheditor.mode == "rich"){
			editorWidth = document.getElementById("boardEditorTable").clientWidth;
			if(editorWidth < 600){
				boardEditor.cheditor.toolbarWrapper.style.display = "none";
			}else{
				boardEditor.cheditor.toolbarWrapper.style.display = "block";
			}
		}
		setTimeout("anyboardSkin.editorToolResize();", 30);
	}	// end uploadStart function


	/************** 이미지 크기 위치 조절  ****************/

	// 이미지 크기 조절 실행
	anyboardSkin.prototype.setImageResizeListType = function(num){
		setTimeout("anyboardSkin.imageResizeListType('"+num+"');", 300);
	}	// end setImageResizeListType function


	anyboardSkin.prototype.imageResizeListType = function(num){
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
		setTimeout("anyboardSkin.imageResizeListType('"+num+"');", 16);
	}	// end imageResizeListType function


	/************** 첨부파일 관련 ****************/
	// 파일 콘텐츠 등록
	anyboardSkin.prototype.fileInsertCheck = function(imageLink, key){
		fileObj = document.getElementById("uploadMainDiv_"+key);
		isImage = fileObj.getAttribute("isImage");
		if(isImage == 1) {
			insertTxt = "이미지를";
		} else if(isImage == 2) {
			insertTxt = "동영상을";
		} else if(isImage == 3) {
			insertTxt = "음성을";
		}
		if(confirm("선택한 "+insertTxt+" 추가로 더 등록하시겠습니까?")){
			this.fileInsertInit(imageLink, key);
		}
	}	// end fileInsertInit function


	// 파일 콘텐츠 등록
	anyboardSkin.prototype.fileInsertInit = function(imageLink, key){
		listObj = document.getElementById("uploadMainDiv_"+key);
		imgWidth = listObj.getAttribute("orgWidth");
		imgHeight = listObj.getAttribute("orgHeight");
		this.fileInsertImage(imageLink, key, imgWidth, imgHeight);
	}	// end fileInsertInit function


	// 이미지 등록 체크
	anyboardSkin.prototype.fileInsertImage = function(imageLink, key, imgWidth, imgHeight){
		randKey = Math.floor(Math.random()*1000000);
		html = "";

		// 영상, 음성 파일 인지 체크
		fileObj = document.getElementById("uploadMainDiv_"+key);
		isImage = fileObj.getAttribute("isImage");

		if(isImage == 2){
			html += "<div align='center'>";

			var lastIndex = -1;
			lastIndex = imageLink.lastIndexOf('.');
			var extension = "";

			if(lastIndex != -1){
				extension = imageLink.substring( lastIndex+1, imageLink.len );
			}else{
				extension = "";
			}
			extension = extension.toLowerCase();

			if(extension == "mp4"){
				html += "<video controls autoplay style='width:600;' width='450' controlsList='nodownload' id='ANYBOARDVIEWIMAGE_"+randKey+"'>";
				html += "<source src='"+imageLink+"' type='video/mp4'>";
				html += "</video>";		
			} else {
				html += "<embed src='"+imageLink+"' autoStart='1' windowlessVideo='1' enabled='1' enableContextMenu='1' uiMode='full' stretchToFit='1' width='307' id='ANYBOARDVIEWIMAGE_"+randKey+"' pluginspage='http://www.microsoft.com/korea/windows/windowsmedia/'  type='video/x-ms-asf-plugin'></embed>";
			}
			html += "</div>";
		} else if(isImage == 3){
			html += "<div align='center'>";
			html += "<audio controls autoplay style='width:340;' controlsList='nodownload' id='ANYBOARDVIEWIMAGE_"+randKey+"'>";
			html += "<source src='"+imageLink+"' type='audio/mp3'>";
			html += "</audio>";	
			html += "</div>";
		} else {
			if(imgWidth < 320){
				imgW = imgWidth;
				imgH = imgHeight;
			}else{
				imgW = "100%";
			}

			imgMemo = "";
			html += "<div align='center'>";
			html += "<img width='"+ imgW +"' orgwidth='"+ imgWidth +"' orgheight='"+ imgHeight +"' style='border: currentColor;' src='"+ imageLink +"' id='ANYBOARDVIEWIMAGE_"+randKey+"' />";
			try{
				if(trim(imgMemo) != ""){
					html += "<p style='font-weight:bold;'>"+imgMemo+"</p>";
				}
			}catch(err){
			}
			html += "</div>";
		}
		// 에디터 모드가 아닐경우
		if(anyboard.boardInfo['optEditor'] == "N"){
			document.anyboardForm.content.value += "\n"+html;
		}else{			

			if((navigator.appName.indexOf('Microsoft')+1)){					
				boardEditor.insertContents(html);
			}else{					
				try{
					if(boardEditor.cheditor.mode == "rich"){
						boardEditor.insertHTML(html);
					} else {
						document.anyboardForm.content.value = boardEditor.outputBodyHTML();
						document.anyboardForm.content.value += html;
						boardEditor.resetEditArea();
					}
				}catch(err){
					// 에러시 컨텐츠에 등록
					document.anyboardForm.content.value = boardEditor.outputBodyHTML();
					document.anyboardForm.content.value += html;
					boardEditor.resetEditArea();					
				}
			}
		}		

		// 마지막 p테크 추가
		html = "<p>&nbsp;</p>";
		if(anyboard.boardInfo['optEditor'] == "N"){
			document.anyboardForm.content.value += "\n"+html;
		}else{			

			if((navigator.appName.indexOf('Microsoft')+1)){					
				boardEditor.insertContents(html);
			}else{					
				try{
					boardEditor.insertHTML(html);
				}catch(err){
					// 에러시 컨텐츠에 등록
					document.anyboardForm.content.value = boardEditor.outputBodyHTML();
					document.anyboardForm.content.value += html;
					boardEditor.resetEditArea();					
				}
			}
		}
		try{
			boardEditor.setImageEvent(true);
			boardEditor.editArea.document.body.scrollTop = boardEditor.editArea.document.body.scrollHeight;
		}catch(err){
		}
	}	// end fileInsertEditor function


	// 파일정보 추출
	anyboardSkin.prototype.getFileInfo = function() {
		if(this.isGetInfo == 1) return;
		if(this.keyArray.length > this.keyPos){
			fKey = this.keyArray[this.keyPos];
			if(document.getElementById("uploadMainDiv_"+fKey)){
				fObj = document.getElementById("uploadMainDiv_"+fKey);
				sName = fObj.getAttribute("saveName");
				this.isGetInfo = 1;
				this.keyPos++;

				params  = "action=getTempFileInfo";
				params += "&key=" + fKey;
				params += "&saveName=" + sName;
				params += "&boardID=" + this.boardID;
				params += "&Mode=write";
				params += "&uploadLocation=" + this.uploadLocation;
				this.sendRequest("/core/xml/anyboard.xml.html", params, this.resultXML, "POST");

			}else{
				this.keyPos++;
				this.getFileInfo();
			}
		}
	}	//	end getFileInfo function


	// XML결과
	anyboardSkin.prototype.resultXML = function(){
		if(this.httpRequest.readyState == 4){
			if(this.httpRequest.status == 200){

				//alert(this.httpRequest.responseText);
				
				this.docXML = this.httpRequest.responseXML;
				code = this.docXML.getElementsByTagName("code").item(0).firstChild.nodeValue;	// 결과코드

				// 결과 실행
				switch (code){
					case 'getTempFileInfo':

						fileKey = this.docXML.getElementsByTagName("fileKey").item(0).firstChild.nodeValue;		// 파일키
						fileSize = this.docXML.getElementsByTagName("fileSize").item(0).firstChild.nodeValue;	// 파일크기
						isImage = this.docXML.getElementsByTagName("isImage").item(0).firstChild.nodeValue;		// 이미지여부
						imgWidth = this.docXML.getElementsByTagName("imgWidth").item(0).firstChild.nodeValue;	// 이미지 넓이
						imgHeight = this.docXML.getElementsByTagName("imgHeight").item(0).firstChild.nodeValue;	// 이미지 높이
						imgLink = this.docXML.getElementsByTagName("imgLink").item(0).firstChild.nodeValue;		// 이미지 링크
						imgUrl = this.docXML.getElementsByTagName("imgUrl").item(0).firstChild.nodeValue;		// 이미지 URL
						fileSize = parseInt(fileSize);
						isImage = parseInt(isImage);
						imgWidth = parseInt(imgWidth);
						imgHeight = parseInt(imgHeight);

						fileObj = document.getElementById("uploadMainDiv_"+fileKey);
						fileObj.setAttribute("fileSize", fileSize);
						fileObj.setAttribute("isImage", isImage);
						fileObj.setAttribute("imageLink", imgLink);
						fileObj.setAttribute("imageUrl", imgUrl);
						fileObj.setAttribute("orgWidth", imgWidth);
						fileObj.setAttribute("orgHeight", imgHeight);
						
						this.fileDisplay(fileKey);

						break;

					default:
						alert("결과코드 없음");
						break;
				}
			}
		}
	}	// end resultXML function


	// 업로드 HTML 생성 함수
	anyboardSkin.prototype.fileCreate = function(key, fileName, fileSize) {

		// 파일이 이미지 인지 체크
		var lastIndex = -1;
		lastIndex = fileName.lastIndexOf('.');
		var extension = "";

		if(lastIndex != -1){
			extension = fileName.substring( lastIndex+1, fileName.len );
		}else{
			extension = "";
		}
		extension = extension.toLowerCase();

		if(extension == "jpg" || extension == "gif" || extension == "png"){
			isImage = 1;
		} else if(this.uploadLocation=="user" && (extension == "mp4" || extension == "wmv" || extension == "avi" || extension == "mpg")){
			isImage = 2;
		} else if(this.uploadLocation=="user" && (extension == "mp3" || extension == "wma")){
			isImage = 3;
		} else{
			isImage = 0;
		}

		fileName = decodeURIComponent(fileName);

		// 이미지 일경우 이미지 위치 처리
		if(isImage == 1 || isImage == 2 || isImage == 3){
			listBase = document.getElementById("AB_FILEIMAGEBASE");
			listBase.style.display = "block";

			mainDiv = document.createElement("DIV");
			mainDiv.className = "loadingPlace";
			htmlData = "";
			htmlData += "\t<p class=\"upArea upAeaCount\" id='progressBar_"+key+"'>업로드 대기중</p>";
			htmlData += "\t<span class=\"delBtn\"><img src=\"/core/anyboard/responsive_default/images/del.gif\" onclick='anyboardSkin.fileCancel("+key+");'></span>";
			mainDiv.innerHTML = htmlData;
			listBase.appendChild(mainDiv);			

		// 일반 첨부파일
		}else{
			document.getElementById("AB_FILEBASELAYER").style.display = "block";

			listBase = document.getElementById("AB_FILEBASE");

			mainDiv = document.createElement("LI");
			mainDiv.className = "file_load";
			htmlData = "";
			htmlData += "\t<p class='load_subject' style='background:url(/core/anyboard/responsive_default/images/loadingbar.jpg) no-repeat; background-size:0%;' id='progressBar_"+key+"'>";
			htmlData += "\t<span class='span_p_left' style='color:#fff;'>"+fileName + " (" + fileSize+")<span></p>";
			htmlData += "\t<p class='file_cancel'><span class='add_listCan' onclick='anyboardSkin.fileCancel("+key+");'>취소</span></p>";
			mainDiv.innerHTML = htmlData;

			listBase.appendChild(mainDiv);
		}

		mainDiv.setAttribute("id", "uploadMainDiv_"+key);
		mainDiv.setAttribute("key", key);
		mainDiv.setAttribute("fileName", fileName);
		mainDiv.setAttribute("fileSize", fileSize);
		mainDiv.setAttribute("isImage", isImage);
		mainDiv.setAttribute("orgWidth", 0);
		mainDiv.setAttribute("orgHeight", 0);
		mainDiv.setAttribute("status", "0");

		this.fileUploadCount();

	}	//	end fileCreate function


	// 업로드 중일때 함수
	anyboardSkin.prototype.fileProgress = function(key, bytesLoaded, bytesTotal) {
		fileObj = document.getElementById("uploadMainDiv_"+key);
		isImage = fileObj.getAttribute("isImage");

		if(isImage == 1 || isImage == 2 || isImage == 3){
			prog = parseInt((bytesLoaded / bytesTotal) * 100);
			document.getElementById("progressBar_"+key).innerHTML = "" + prog + "% 업로드중";
		}else{
			prog = parseInt((bytesLoaded / bytesTotal) * 100);
			document.getElementById("progressBar_"+key).style.backgroundSize = "" + prog + "%";
		}
	}	//	end fileProgress function	


	// 업로드 완료후 실행 함수(단일)
	anyboardSkin.prototype.fileDisplay = function(key) {
		fileObj = document.getElementById("uploadMainDiv_"+key);
		fileName = fileObj.getAttribute("fileName");
		fileSize = fileObj.getAttribute("fileSize");
		isImage = fileObj.getAttribute("isImage");
		imageLink = fileObj.getAttribute("imageLink");
		imageUrl = fileObj.getAttribute("imageUrl");
		saveName = fileObj.getAttribute("saveName");
		orgWidth = fileObj.getAttribute("orgWidth");
		orgHeight = fileObj.getAttribute("orgHeight");
	//	keyVal = Number(key)+1;
		keyVal = Number(key);
		
		fileObj.innerHTML = "";	// 리스트 초기화

		htmlData = "";
		if(isImage == 1){
			fileObj.className = "sm_FileImageBase";

			htmlData += "\t<img src='"+imageLink+"' id='imagePreview_"+key+"'>";
			htmlData += "\t<p class='imgTitArea delAeaText'><label><input type='checkbox' name='mainImgCheckTemp[]' class='mdFloatnone' value='"+keyVal+"'>대표이미지</label></p>";	//171011추가
			htmlData += "\t<span class='delBtn'><img src='/core/anyboard/responsive_default/images/del.gif' onclick='anyboardSkin.fileCancel("+key+");'></span>";
			htmlData += "\t<p class='delArea delAeaText' onclick=\"anyboardSkin.fileInsertCheck('"+imageLink+"', "+key+");\">본문에 삽입</p>";

			fileObj.innerHTML = htmlData;

			this.fileInsertImage(imageLink, key, orgWidth, orgHeight);	// 에디터에 이미지 삽입

		}  else if(isImage == 2 || isImage == 3){
			fileObj.className = "sm_FileImageBase";
			if(isImage==2) {
				thumImg = "videoDef.jpg";
			} else {
				thumImg = "audioDef.jpg";
			}

			htmlData += "\t<img src='/core/anyboard/common/images/upload/"+thumImg+"' id='imagePreview_"+key+"'>";
			htmlData += "\t<p class='imgTitArea delAeaText'><label><input type='checkbox' name='mainImgCheckTemp[]' class='mdFloatnone' value='"+keyVal+"'>"+fileName+"</label></p>";	//171011추가
			htmlData += "\t<span class='delBtn'><img src='/core/anyboard/responsive_default/images/del.gif' onclick='anyboardSkin.fileCancel("+key+");'></span>";
			htmlData += "\t<p class='delArea delAeaText' onclick=\"anyboardSkin.fileInsertCheck('"+imageLink+"', "+key+");\">본문에 삽입</p>";

			fileObj.innerHTML = htmlData;

			this.fileInsertImage(imageLink, key, orgWidth, orgHeight);	// 에디터에 이미지 삽입
		} else{

			fileObj.className = "file_up";

			htmlData += "\t<p class='file_subject'><span class='span_p_left'>"+fileName+" ("+fileSize+")</span></p>";
			htmlData += "\t<p class='file_delete'><span class='add_listDel' onclick='anyboardSkin.fileCancel("+key+");'>삭제</span></p>";

			fileObj.innerHTML = htmlData;
		}

		this.isGetInfo = 0;
		this.getFileInfo();

		if(parseInt(fileSize) == 0){
			alert("`"+fileName+"` 파일 업로드에 실패 했습니다.");
			this.fileCancel(key);
		}
	}	//	end fileComplete function


	// 업로드 완료후 실행 함수(단일)
	anyboardSkin.prototype.fileComplete = function(key, saveName) {
		fileObj = document.getElementById("uploadMainDiv_"+key);
		fileObj.setAttribute("saveName", saveName);
		ki = this.keyArray.length;
		this.keyArray[ki] = key;
		this.getFileInfo();
	}	//	end fileComplete function


	// 업로드 완료후 실행 함수(전체)
	anyboardSkin.prototype.fileUploadComplete = function(str) {
		document.anyboardForm.uploadFiles.value = str;
	}	//	end fileUploadComplete function


	// 파일 등록 취소또는 삭제
	anyboardSkin.prototype.fileCancel = function(key){
		fileObj = document.getElementById("uploadMainDiv_"+key);
		imageLink = fileObj.getAttribute("imageLink");
		isImage = fileObj.getAttribute("isImage");
		
		if(isImage == 1 || isImage == 2 || isImage == 3){
			listBase = document.getElementById("AB_FILEIMAGEBASE");		
		}else{
			listBase = document.getElementById("AB_FILEBASE");		
		}

		try{
			listBase.removeChild(fileObj);
		}catch(err){
			document.getElementById("AB_FILEIMAGEBASE").removeChild(fileObj);
		}
/*
		try{
			try{
				simpleUpload.fileCancel(key);				
			}catch(err1){
			}
		}catch(err){
			try{
				simpleUpload.thisMovie(simpleUpload.swfID).callCancel(key);
			}catch(err2){
			}
		}
*/
		if(parseInt(key) < 1000){
			simpleUpload.fileCancel(key);
		}else{
			simpleUpload.prMaxUploadCount++;
		}

		if(imageLink != null && (isImage == 1 || isImage == 2 || isImage == 3)){

			// 에디터에 있는 이미지 삭제
			baseObj = boardEditor.editArea.document.body;
			if(isImage == 1) {
				childs = baseObj.getElementsByTagName("IMG");
			} else if(isImage == 2) {
				childs = baseObj.getElementsByTagName("VIDEO");			
			} else if(isImage == 3) {
				childs = baseObj.getElementsByTagName("AUDIO");			
			}
			if(childs.length == 0) {
				childs = baseObj.getElementsByTagName("EMBED");				
			}
			totalChild = childs.length; 

			// 이미지 찾아 삭제
			for(i = (totalChild-1); i >= 0; i--){
				childObj = childs[i];

				objID = childObj.getAttribute("id");
				if(!objID) continue;
				if(objID.substr(0, 17) != "ANYBOARDVIEWIMAGE") continue;

				if(isImage==2 || isImage==3){
					objSrc = childObj.currentSrc;
				}else{
					objSrc = childObj.src;
				}
				linkLength = imageLink.length;
				srcLength = objSrc.length;
				linkMargin = srcLength - linkLength;
				if((isImage==1 || isImage==2 || isImage==3) && imageLink == objSrc.substr(linkMargin, srcLength)){
					parEle = childObj.parentElement;
					parEle.removeChild(childObj);
				}
			}
		}

		this.fileUploadCount();

		try{
			num = fileObj.getAttribute("num");
			anyboard.fileUploadedDelete(key, num);
		}catch(err){
		}

	}	// end fileCancel function


	// 전체 삭제
	anyboardSkin.prototype.deleteAll = function(){
		listBase = document.getElementById("AB_FILEIMAGEBASE");
		childs = listBase.getElementsByTagName("DIV");
		totalChild = childs.length; 
		
		// 이미지 찾아 삭제
		for(i = (totalChild-1); i >= 0; i--){
			childObj = childs[i];

			objID = childObj.getAttribute("id");
			if(!objID) continue;
			if(objID.substr(0, 14) != "uploadMainDiv_") continue;
			key = childObj.getAttribute("key");
			scriptStr = "anyboardSkin.fileCancel("+key+");";
			setTimeout(scriptStr, 10);
		}

		// 일반파일 삭제
		listBase = document.getElementById("AB_FILEBASE");
		childs = listBase.getElementsByTagName("LI");
		totalChild = childs.length;
		for(i = (totalChild-1); i >= 0; i--){
			childObj = childs[i];

			objID = childObj.getAttribute("id");
			if(!objID) continue;
			if(objID.substr(0, 14) != "uploadMainDiv_") continue;
			key = childObj.getAttribute("key");
			scriptStr = "anyboardSkin.fileCancel("+key+");";
			setTimeout(scriptStr, 10);
		}
	}	// end deleteAll function


	// 파일 업로드 카운트
	anyboardSkin.prototype.fileUploadCount = function(){		
		this.countAll = 0;
		this.countImage = 0;
		this.countFile = 0;
		
		// 이미지 카운트
		listBase = document.getElementById("AB_FILEIMAGEBASE");
		childs = listBase.getElementsByTagName("DIV");
		totalChild = childs.length;
		for(i = (totalChild-1); i >= 0; i--){
			childObj = childs[i];

			objID = childObj.getAttribute("id");
			if(!objID) continue;
			if(objID.substr(0, 14) != "uploadMainDiv_") continue;
			this.countAll++;
			this.countImage++;
		}
		if(this.countImage == 0){
			listBase.style.display = "none";
		}else{
			listBase.style.display = "block";
		}

		// 파일카운트
		listBase = document.getElementById("AB_FILEBASE");
		childs = listBase.getElementsByTagName("LI");
		totalChild = childs.length;
		for(i = (totalChild-1); i >= 0; i--){
			childObj = childs[i];

			objID = childObj.getAttribute("id");
			if(!objID) continue;
			if(objID.substr(0, 14) != "uploadMainDiv_") continue;
			this.countAll++;
			this.countFile++;
		}
		if(this.countFile == 0){
			document.getElementById("AB_FILEBASELAYER").style.display = "none";
		}else{
			document.getElementById("AB_FILEBASELAYER").style.display = "block";
		}

		if(document.getElementById("AB_DELETEALLBUTTON") != null){
			if(this.countAll == 0){
				document.getElementById("AB_DELETEALLBUTTON").style.display = "none";
			}else{
				document.getElementById("AB_DELETEALLBUTTON").style.display =  "inline-block";
			}
		}

		document.getElementById("AB_FILEUPCOUNT").innerHTML = this.countAll;
		return this.countAll;
	}	// end fileUploadCount function

	/************** 첨부파일 관련 끝 ****************/


	// 삭제 체크
	anyboardSkin.prototype.delCheck = function(){
		form = document.anyboardForm;

		if(parseInt(form.commentNum.value) == 0){
			form.processType.value = "delete";
			anyboard.deleteCheck(form.num.value, 1);
		}else{
			form.processType.value = "commentDelete";
			if(trim(form.password.value) == ""){
				alert("\비밀번호를 입력하세요. ");
				form.password.focus();
				return false;
			}
			new cryptSubmit(form, form.cryptKey); // 글등록
		}
	}	// end delCheck function


	// 레이어 그림자 생성
	anyboardSkin.prototype.shadowCreate = function() {

		docBody = document.body;
		this.shadow = document.createElement("DIV");		
		this.shadow.style.zIndex = "900";
		this.shadow.style.position = "absolute";
		this.shadow.style.top = "0px";
		this.shadow.style.left = "0px";
		this.shadow.style.width = ((document.documentElement.scrollWidth > document.body.scrollWidth) ? document.documentElement.scrollWidth : document.body.scrollWidth) + 'px';
		this.shadow.style.height = ((document.documentElement.scrollHeight > document.body.scrollHeight) ? document.documentElement.scrollHeight : document.body.scrollHeight) + 'px';
		this.shadow.style.background = "#000000";
		this.shadow.style.backgroundAttachment = "fixed";
		this.shadow.setAttribute('id', 'pageShadow');
		this.shadow.style.filter = "Alpha(Opacity:30);";
		this.shadow.style.opacity = 0.3;
		docBody.appendChild(this.shadow); 
		this.shadow.style.display = "block";		
		this.shadowInt = setInterval("anyboardSkin.shadowResize();", 200);
	}	//	end createShadow function


	// 레이어 그림자 크기 조절
	anyboardSkin.prototype.shadowResize = function(){
		if(this.shadow != null){
			this.shadow.style.width = ((document.documentElement.scrollWidth > document.body.scrollWidth) ? document.documentElement.scrollWidth : document.body.scrollWidth) + 'px';
			this.shadow.style.height = ((document.documentElement.scrollHeight > document.body.scrollHeight) ? document.documentElement.scrollHeight : document.body.scrollHeight) + 'px';
		}
	}	// end shadowResize function


	// 레이어 그림자 삭제
	anyboardSkin.prototype.shadowRemove = function(){
		if(this.shadow != null){
			this.shadowInt = null;
			document.body.removeChild(this.shadow);
			this.shadow = null;
		}
	}	// end createShadow function


	// 객체 Y좌표 찾기
	anyboardSkin.prototype.findPosY = function(obj){
		var curtop = 0;
		if(obj.offsetParent){
			while(obj.offsetParent){
				curtop += obj.offsetTop;
				obj = obj.offsetParent;
			}
		}else if(obj.y) curtop += obj.y;

		return curtop;
	}	// end findPosY


	// 객체 X좌표찾기
	anyboardSkin.prototype.findPosX = function(obj){
		var curleft = 0;
		if(obj.offsetParent){
			while(obj.offsetParent){
				curleft += obj.offsetLeft;
				obj = obj.offsetParent;
			}
		}else if(obj.x) curleft += obj.x;

		return curleft;
	}	// end findPosX


	// 글쓰기 체크
	anyboardSkin.prototype.writeCheck = function(){
		try{
			if(simpleUpload.isUploading()){
				alert("파일 전송중입니다.\n\n파일 전송 완료후 등록하기 버튼을 눌러주세요");
				return;
			}
			anyboard.writeCheck();
		}catch(err){
			anyboard.writeCheck();
		}
	}	// end writeCheck


}	// end anyboardSkin class


//-->