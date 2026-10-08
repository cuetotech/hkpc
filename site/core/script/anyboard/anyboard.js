<!--
// 게시물 입력, 수정 체크
anyboard = function(boardID, Mode){
	this.docXML;				// XML데이터 return 값
	this.callback = null;		// XML결과 return함수
	this.httpRequest = null;	// httpRequest객체
	this.boardID = boardID;		// 게시판 ID	
	this.boardInfo = new Array();	// 게시판 정보
	this.boardOpt = new Array();	// 옵션 정보
	this.fileListLayer = null;		// 파일 리스트 영역
	this.Mode = (Mode != "") ? Mode : "list";	// 게시판 모드
	this.imgWin = null;		// 이미지창
	this.boardBlock = new Array();	// 차단단어 정보

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
	anyboard.prototype.getXMLHttpRequest = function() {
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
	anyboard.prototype.sendRequest = function(url, params, callback, method) {
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
	anyboard.prototype.onStateChange = function() {
		this.callback(this.httpRequest);
	}	// end onStateChange end


	// 게시판 정보 호출
	anyboard.prototype.requestInfo = function(){
		params  = "action=getInfo";
		params += "&boardID="+this.boardID;
		params += "&Mode="+this.Mode;
		this.sendRequest("/core/xml/anyboard.xml.html", params, this.resultXML, "POST");
	}	// end requestXML function


	// 스크랩
	anyboard.prototype.scrap = function(num){
		params  = "action=scrap";
		params += "&boardID="+this.boardID;
		params += "&Mode=view";
		params += "&num="+num;
		this.sendRequest("/core/xml/anyboard.xml.html", params, this.resultXML, "POST");
	}	// end scrap function

	// 추천
	anyboard.prototype.recom = function(num){
		params  = "action=recom";
		params += "&boardID="+this.boardID;
		params += "&Mode=view";
		params += "&num="+num;
		this.sendRequest("/core/xml/anyboard.xml.html", params, this.resultXML, "POST");
	}	// end 추천 function

	// 권한확인
	anyboard.prototype.permitCheck = function(mode, num, page, keyfield, key, bCate){
		params = "action=permitCheck";
		params += "&boardID="+this.boardID;
		params += "&num="+num;
		params += "&Mode="+mode;
		params += "&page="+page;
		params += "&keyfield="+keyfield;
		params += "&key="+key;
		params += "&bCate="+bCate;
		this.sendRequest("/core/xml/anyboard.xml.html", params, this.resultXML, "POST");
	}

	// 차단단어 체크
	anyboard.prototype.getBlock = function(){
		params = "action=getBlock";
		params += "&boardID=0";
		this.sendRequest("/core/xml/anyboardBlock.xml.html", params, this.resultXML, "POST");
	}	// end blockCheck function

	// 일괄 다운로드 파일 리스트 확인
	anyboard.prototype.fileListCheck = function(num){
		params = "action=getFileList";
		params += "&boardID="+this.boardID;
		params += "&num="+num;
		params += "&Mode=down";
		params += "&nextAct=download";
		this.sendRequest("/core/xml/anyboard.xml.html", params, this.resultXML, "POST");
	}	// end blockCheck function

	// 신고글 체크 
	anyboard.prototype.reportCheck = function(tableName, num){
		params = "action=reportCheck";
		params += "&Mode=reportCheck";
		params += "&boardID="+this.boardID;
		params += "&tableName="+tableName;
		params += "&num="+num;
		this.sendRequest("/core/xml/anyboard.xml.html", params, this.resultXML, "POST");
	}	// end blockCheck function

	// XML결과
	anyboard.prototype.resultXML = function(){
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

					// 게시판 정보 추출
					case 'getInfo':
						this.setBoardInfo();						
						break;

					// 게시판 정보 추출
					case 'getFileList':
						nextAct = this.docXML.getElementsByTagName("nextAct").item(0).firstChild.nodeValue;
						if(nextAct == "download") {
							totalFile = this.docXML.getElementsByTagName("fileInfo").length;
							for(i = 0;  i < totalFile; i++){
								fileObj = this.docXML.getElementsByTagName("fileInfo").item(i);
								fileNum = fileObj.getAttribute('num');
								var downFrame = document.createElement("iframe");
								downFrame.setAttribute("name", "downFrame"+fileNum);
								downFrame.setAttribute("id", "downFrame"+fileNum);
								downFrame.setAttribute("style", "display: none");
								document.body.appendChild(downFrame);
								if(parent.document.getElementById("downFrame"+fileNum)) {
									frameObj = parent.document.getElementById("downFrame"+fileNum);
								} else {
									frameObj = document.getElementById("downFrame"+fileNum);
								}
								frameObj.contentWindow.location.href = "/core/anyboard/download.php?boardID="+this.boardID+"&fileNum="+fileNum;
							}
						} else {
							this.displayFileList();						
						}
						break;

					// 권한확인
					case 'permitCheck':
						chkresult = this.docXML.getElementsByTagName("chkresult").item(0).firstChild.nodeValue;

						switch (chkresult)
						{
							case "1":
								window.alert("글보기 권한이 없습니다.");
								break;
							case "2":
								window.alert("글보기 권한이 없습니다. \n 로그인 후 이용해 주세요.");
								openPage.createPage(window.event, '500', '216', '/core/module/membership/membership.html?Mode=login', 'auto',-1,'-1');
								break;
							default:
								info = this.docXML.getElementsByTagName("info").item(0);
								boardID = info.firstChild.nodeValue;
								page = info.getAttribute("page");
								num = info.getAttribute("num");
								mode= info.getAttribute("mode");
								keyfield= info.getAttribute("keyfield");
								key= info.getAttribute("key");
								bCate= info.getAttribute("bCate");

								if(boardID.substring(0,4) == "cafe" && boardID != "cafeBoard"){
									location.href='/core/cafe/view/sub.html?Mode='+mode+'&boardID='+boardID+'&num='+num+'&page='+page+'&keyfield='+keyfield+'&key='+key+'&bCate='+bCate;
								} else {
									location.href=location.pathname + '?Mode='+mode+'&boardID='+boardID+'&num='+num+'&page='+page+'&keyfield='+keyfield+'&key='+key+'&bCate='+bCate;
								}
								break;
						}
						break;

					// 차단단어 체크
					case 'getBlock':
						blockInfo = this.docXML.getElementsByTagName("blockInfo").length;
						for(i=0; i<blockInfo; i++){
							infoObj = this.docXML.getElementsByTagName("blockInfo").item(i);
							infoVal = infoObj.firstChild.nodeValue;
							this.boardBlock[i] = infoVal;
						}
						break;

					case 'downPermitChk':
						permit = this.docXML.getElementsByTagName("permit").item(0).firstChild.nodeValue;
						if(permit == 0) {
							anyboard.downPermit = "false";
						} else {
							anyboard.downPermit = "true";
						}
						break;

					// 신고글 체크
					case 'reportCheck':
						this.reportOpen();
						break;

					// 게시판 초기화 완료
					case 'resetResult':
						if(confirm("게시판 초기화가 완료되었습니다.")){
							parent.location.reload();
						}
						break;

					default:
						alert("결과코드 없음");
						break;
				}
			}
		}
	}	// end resultXML function


	// 게시판 정보
	anyboard.prototype.setBoardInfo = function(){

		// 게시판 정보
		totalInfo = this.docXML.getElementsByTagName("boardInfo").length;
		for(i = 0; i < totalInfo; i++){
			infoObj = this.docXML.getElementsByTagName("boardInfo").item(i);
			infoVal = infoObj.firstChild.nodeValue;
			infoKey = infoObj.getAttribute('gid');
			this.boardInfo[infoKey] = infoVal;
		}

		// 게시판 추가 옵션
		totalOpt = this.docXML.getElementsByTagName("boardOpt").length;
		for(i = 0; i < totalOpt; i++){
			opt = this.docXML.getElementsByTagName("boardOpt").item(i);
			optVal = opt.firstChild.nodeValue;
			num = opt.getAttribute('num');
			boardID = opt.getAttribute('boardID');
			optCheckUse = opt.getAttribute('optCheckUse');
			optCheckEss = opt.getAttribute('optCheckEss');
			optPnt = opt.getAttribute('optPnt');
			optTitle = opt.getAttribute('optTitle');

			this.boardOpt[i] = new Array();
			this.boardOpt[i]['optVal'] = optVal;
			this.boardOpt[i]['num'] = num;
			this.boardOpt[i]['boardID'] = this.urlDecode(boardID);
			this.boardOpt[i]['optCheckUse'] = this.urlDecode(optCheckUse);
			this.boardOpt[i]['optCheckEss'] = this.urlDecode(optCheckEss);
			this.boardOpt[i]['optPnt'] = this.urlDecode(optPnt);
			this.boardOpt[i]['optTitle'] = this.urlDecode(optTitle);
		}		
		this.getBlock();
	}	// end setBoardInfo function


	anyboard.prototype.optCheck = function(){
		totalOpt = this.boardOpt.length;
		var form = document.anyboardForm;

		for(i = 0; i < totalOpt; i++){
			opt = this.boardOpt[i];
			if(opt['optCheckEss'] == "N") continue;
			optObj = document.getElementById("BOPT_"+opt['num']);

			if(opt['optPnt'] == "text" || opt['optPnt'] == "textM" || opt['optPnt'] == "combo"){
				if(trim(optObj.value) == ""){
					alert("`"+opt['optTitle'] + "`항목을 입력하세요");
					optObj.focus();
					return false;
				}
			}else{
				if(opt['optPnt'] == "radio" || opt['optPnt'] == "radioM"){
					var chk = false;
					for(j = 0; j < form.elements['BOPT_'+opt['num']].length; j++){
						if(form.elements['BOPT_'+opt['num']][j].checked == true){
							chk = true;
						}
					}
					if(chk == false){
						alert("`"+opt['optTitle'] + "`항목을 선택하세요");
						return false;
					}
				}

				if(opt['optPnt'] == "checkbox" || opt['optPnt'] == "checkboxM"){
					var chk = false;
					for(j = 0; j < form.elements['BOPT_'+opt['num']+'[]'].length; j++){
						if(form.elements['BOPT_'+opt['num']+'[]'][j].checked == true){
							chk = true;
						}
					}
					if(chk == false){
						alert("`"+opt['optTitle'] + "`항목을 선택하세요");
						return false;
					}
				}
			}
		}
		return true;
	}	// end optCheck function

	anyboard.prototype.blockCheck = function() {
		var form = document.anyboardForm;
		var totalOpt = this.boardOpt.length;
		var name = form.name.value;
		var email = form.email.value;
		var subject = form.subject.value;
		if(form.optEditor.value != "Y"){
			var content = form.content.value;		
		}else{
			var content = boardEditor.outputBodyHTML();
		}
		for(i=0; i<this.boardBlock.length; i++) {
			if(name.indexOf(this.boardBlock[i]) != -1) {
				alert("작성자에 차단 단어 '"+this.boardBlock[i]+"' 포함되어 있습니다.");
				return false;
			}
			if(email.indexOf(this.boardBlock[i]) != -1) {
				alert("이메일에 차단 단어 '"+this.boardBlock[i]+"' 포함되어 있습니다.");
				return false;
			}
			if(subject.indexOf(this.boardBlock[i]) != -1) {
				alert("제목에 차단 단어 '"+this.boardBlock[i]+"' 포함되어 있습니다.");
				return false;
			}
			if(content.indexOf(this.boardBlock[i]) != -1) {
				alert("내용에 차단 단어 '"+this.boardBlock[i]+"' 포함되어 있습니다.");
				return false;
			}
			for(j=0; j<totalOpt; j++){
				opt = this.boardOpt[j];
				optObj = document.getElementById("BOPT_"+opt['num']);

				if(opt['optPnt'] == "text" || opt['optPnt'] == "textM"){
					optVal = optObj.value;
					if(optVal.indexOf(this.boardBlock[i]) != -1) {
						alert("`"+opt['optTitle'] + "` 항목에 차단 단어 '"+this.boardBlock[i]+"' 포함되어 있습니다.");
						return false;
					}
				}
			}
		}
		return true;
	}	// end blockCheck function

	anyboard.prototype.commentBlockCheck = function(form) {
		var name = form.name.value;
		var content = form.content.value;
		for(i=0; i<this.boardBlock.length; i++) {
			if(name.indexOf(this.boardBlock[i]) != -1) {
				alert("작성자에 차단 단어 '"+this.boardBlock[i]+"' 포함되어 있습니다.");
				return false;
			}
			if(content.indexOf(this.boardBlock[i]) != -1) {
				alert("내용에 차단 단어 '"+this.boardBlock[i]+"' 포함되어 있습니다.");
				return false;
			}
		}
		return true;
	}	// end commentBlockCheck function


	// 글 등록 체크
	anyboard.prototype.writeCheck = function(){
		var form = document.anyboardForm;
		// 작성자 체크
		if(trim(form.name.value) == ""){
			alert("\n작성자를 입력하세요. ");
			form.name.focus();
			return false;
		}

		// 이메일 체크
		if(trim(form.email.value) != ""){
			if(!emailCheck(trim(form.email.value))){
				alert("잘못된 이메일 주소입니다.");
				form.email.focus();
				return false;
			}
		}

		// 제목 체크
		if(trim(form.subject.value) == ""){
			alert("\n제목을 입력하세요. ");
			form.subject.focus();
			return false;
		}

		if(form.category){
			// 카테고리 선택 체크
			if(trim(form.category.value) == ""){
				alert("\n카테고리를 선택하세요. ");
				form.category.focus();
				return false;
			}
		}

		// 추가 항목 체크
		if(!this.optCheck()){
			return false;
		}
		
		// 내용 체크(에디터 사용할경우
		if(form.optEditor.value != "Y"){
			if(trim(form.content.value) == ""){
				alert("\n내용을 입력하세요. ");
				form.content.focus();
				return false;
			}			
		}else{
			form.content.value = boardEditor.outputBodyHTML();
			if(trim(form.content.value) == ""){
				alert("내용을 입력하세요");
				return false;
			}
		}

		// 비밀번호를 입력하세요
		if(trim(form.password.value) == ""){
			alert("\비밀번호를 입력하세요. ");
			form.password.focus();
			return false;
		}

		// 차단 단어 체크
		if(!this.blockCheck()){
			return false;
		}

		// 첨부파일 등록시
		if(this.boardInfo['optUpload'] == "Y"){
			
			// 앨번형 게시판의 경우 이미 파일첨부
			//11.01.10 앨범게시판 수정시 오류로 인하여 && this.Mode == 'write' 삭제(process.php도 수정)
			if(this.boardInfo['boardType'] == "album"){
				// HTML형태 게시판
				if(typeof form.elements['boardFile[]'] != "undefined"){
					var chk = false;
					if(typeof form.elements['numFileMemo[]'] == "object"){
						chk = true;
					}
					if(form.elements['boardFile[]'].length){
						for(j = 0; j < form.elements['boardFile[]'].length; j++){
							if(form.elements['boardFile[]'][j].value != ""){
								chk = true;
							}
						}
					}else{
						if(form.elements['boardFile[]'].value != ""){
							chk = true;
						}
					}
					if(chk == false){
						alert("첨부 이미지를 입력하세요.");
						return false;
					}
				}else{
					// flex게시판
					if(form.processType.value == "modify"){
						if(trim(form.uploadFiles.value) == "" && parseInt(form.uploadedCount.value) == 0){
							alert("첨부 이미지를 입력하세요.");
							return false;
						}
					}else{
						if(trim(form.uploadFiles.value) == ""){
							alert("첨부 이미지를 입력하세요.");
							return false;
						}
					}
				}
			}
		}

		document.getElementById('dataBtnArea').style.display='none';
		document.getElementById('dataTxtArea').style.display='block';

		new cryptSubmit(form, form.cryptKey, true); // 글등록
	}	// end checkValue function


	// 삭제체크
	anyboard.prototype.deleteCheck = function(num, dire){		
		// 권한자 바로삭제
		if(dire == 0){
			if(confirm("정말로 삭제하시겠습니까?")){
				// 삭제폼
				form = document.anyboardAct;
				form.chNum.value = num;
				form.processType.value = 'delete';
				new cryptSubmit(form, form.cryptKey);
			}
		// 비밀번호 입력 체크
		}else{
			// 삭제폼
			form = document.anyboardForm;

			// 비밀번호를 입력하세요
			if(trim(form.password.value) == ""){
				alert("\비밀번호를 입력하세요. ");
				form.password.focus();
				return false;
			}
			if(confirm("정말로 삭제하시겠습니까?")){
				new cryptSubmit(form, form.cryptKey);
			}
		}
	}	// end deleteCheck function


	// 모바일에서 회원이 삭제
	anyboard.prototype.deleteCheckMobile = function(num){
		form = document.anyboardAct;
		form.chNum.value = num;
		form.processType.value = 'delete';
		new cryptSubmit(form, form.cryptKey);
	}	// end deleteCheckMobile function


	// 첨부파일 삭제
	anyboard.prototype.fileDeleteCheck = function(num){
		if(confirm("정말로 선택한 파일을 삭제하시겠습니까?")){
			// 삭제폼
			form = document.anyboardAct;
			form.chNum.value = num;
			form.processType.value = 'fileDelete';
			form.password.value = document.anyboardForm.password.value;
			new cryptSubmit(form, form.cryptKey);
		}
	}	// end fileDeleteCheck function


	// 첨부파일 다운로드
	anyboard.prototype.fileDown = function(fileNum){
		document.fileForm.action = "/core/anyboard/download.php?boardID="+this.boardID+"&fileNum="+fileNum;
		document.fileForm.submit();
	}	// end fileDown function


	// 댓글 체크
	anyboard.prototype.commentWriteCheck = function(form, act, idx){		

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

		// 차단 단어 체크
		if(!this.commentBlockCheck(form)){
			return false;
		}

		actForm = document.commentForm;
		if(act != 'commentDelete'){
			actForm.name.value = form.name.value;		
			actForm.content.value = form.content.value;
		}
		
		actForm.processType.value = act;
		actForm.commentNum.value = idx;
		actForm.password.value = form.password.value;

		document.getElementById('dataBtnArea').style.display='none';
		document.getElementById('dataTxtArea').style.display='block';

		new cryptSubmit(actForm, actForm.cryptKey, true); // 글등록
	}	// end commentWriteCheck function


	// 코멘트 답변 또는 수정 폼 생성
	anyboard.prototype.commentFormSet = function(idx, act){

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
					document.forms["comment_modify_"+idx].inputBtn.onclick = function(){ anyboard.commentWriteCheck(document.forms["comment_modify_"+idx], 'commentModify', idx); }
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
					document.forms["comment_reply_"+idx].inputBtn.onclick = function(){ anyboard.commentWriteCheck(document.forms["comment_reply_"+idx], 'commentReply', idx); }
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
					document.forms["comment_delete_"+idx].inputBtn.onclick = function(){ anyboard.commentWriteCheck(document.forms["comment_delete_"+idx], 'commentDelete', idx); }
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
	anyboard.prototype.commentDelete = function(num){
		if(confirm("정말로 삭제하시겠습니까?")){
			actForm = document.commentForm;
			actForm.processType.value = 'commentDelete';
			actForm.commentNum.value = num;
			new cryptSubmit(actForm, actForm.cryptKey);
		}
	}	// end fileDeleteCheck function


	// 등록된 이미지 이미지 박스 생성 및 이벤트 처리
	anyboard.prototype.contentImageEvent = function(imgBoxVal){
		baseObj = document.getElementById("AB_viewContent");

		childs = baseObj.getElementsByTagName("IMG");
		totalChild = childs.length; 
		
		// 이미지 테두리 처리
		for(i = 0; i < totalChild; i++){
			childObj = childs[i];

			objID = childObj.getAttribute("id");
			if(!objID) continue;
			if(objID.substr(0, 17) != "ANYBOARDVIEWIMAGE") continue;

			actScript = "anyboardImgBox.init('"+objID+"', "+imgBoxVal+");";
			setTimeout(actScript, 1);
		}

		setTimeout("anyboard.contentImageAction();", 500);
	}	// end contentImageEvent function


	// 등록된 이미지 이벤트 처리
	anyboard.prototype.contentImageAction = function(){

		// 관리자 페이지는  새창으로 이미지 보기 처리
		ptHost = document.location.host;
		ptHost = ptHost.toLowerCase();
		if(ptHost.substr(0, 5) == "admin"){
			popPage = true;
		}else{
			popPage = false;
		}

		baseObj = document.getElementById("AB_viewContent");

		childs = baseObj.getElementsByTagName("IMG");
		totalChild = childs.length; 
		
		// 이미지 테두리 처리
		for(i = 0; i < totalChild; i++){
			childObj = childs[i];

			objID = childObj.getAttribute("id");
			if(!objID) continue;
			if(objID.substr(0, 17) != "ANYBOARDVIEWIMAGE") continue;

			childObj.style.cursor = "pointer";
			childObj.style.height = "auto";
			if(this.boardInfo['albumPop'] == 1 || popPage == true){
				childObj.onclick = function(){ anyboard.contentImageOpen(this); };
			}else{
				if(isMobile()){
					childObj.onclick = function(){ anyboard.contentImageOpen(this); };
				} else {
					childObj.onclick = function(){ anyboard.contentImageLayer(this); };
				}
			}		
		}
	}	// end contentImageAction function


	// 이미지 오픈 레이어
	anyboard.prototype.contentImageLayer = function(obj){

		try{
			anyboardLayer.init(obj, document.getElementById("AB_viewContent"));
		}catch(err){
			imageLayerOpen(obj);
			
		}
	}	// end contentImageLayer function


	// 이미지 창띄우기
	anyboard.prototype.contentImageOpen = function(obj){
		img = new Image();
		img.src = obj.src;
		orgW = img.width;
		orgH = img.height;

		if(orgW == 0 || orgH == 0){
			orgW = obj.getAttribute("orgwidth");
			orgH = obj.getAttribute("orgheight");
		}
		imgSrc = Base64.encode(obj.src);

		orgW = parseInt(orgW);
		orgH = parseInt(orgH);
		if(orgW < 100) orgW = 100;
		if(orgH < 100) orgH = 100;

		anyboard.imageOpen(orgW, orgH, imgSrc);
	}	// end contentImageOpen function


	// 이미지 열기
	anyboard.prototype.imageOpen = function(width, height, imgSrc){
		screenWidth = window.screen.width; // 윈도우 넓이
		screenHeight = window.screen.height; // 윈도우 높이

		// 이미지 크기가 윈도우 사이즈보다 클경우
		if(width >= screenWidth && height < screenHeight){
			openWidth = screenWidth;
			openHeight = (screenWidth/width)*height;
		}else if(width < screenWidth && height >= screenHeight){
			openHeight = screenHeight -110 ;
			openWidth = (screenHeight/height)*width;
		}else if(width >= screenWidth && height >= screenHeight){
			openHeight = ((screenHeight/height)*height)-110;
			openWidth = (screenHeight/height)*width;
		}else{
			openWidth = width;
			openHeight = height;
		}
		if(openHeight >= screenHeight){
			openWidth = (screenHeight/openHeight)*openWidth;
			openHeight = screenHeight;
		}
		openWidth = parseInt(openWidth);
		openHeight = parseInt(openHeight);
		openLeft = (screenWidth-openWidth)/2;
		openLeft = parseInt(openLeft);
		openTop = (screenHeight-openHeight)/3;		
		openTop = parseInt(openTop);
		popID = imgSrc.substr(0, 7);

		// 모바일 페이지의경우 이미지 오픈 페이지 이동
		hostName = document.location.host;
		if(hostName.substr(0, 2) == "m."){
			document.location.href = '/core/mobile/boardSkin/imageOpen.html?width='+openWidth+'&height='+openHeight+'&imgSrc='+imgSrc;
		}else{
			if(this.imgWin != null){
				this.imgWin.close();
			}
			this.imgWin = window.open('/core/anyboard/imageOpen.php?width='+openWidth+'&height='+openHeight+'&imgSrc='+imgSrc, popID, 'left='+openLeft+',top='+openTop+',height='+openHeight+',width='+openWidth+',toolbar=no,directories=no,status=no,linemenubar=no,scrollbars=no,resizable=no,modal=yes,dependent=yes');
		}

	}	// end imageOpen function


	// 모바일 view페이지 이미지 이벤트
	anyboard.prototype.mobileImageEvent = function(){
		baseObj = document.getElementById("AB_viewContent");

		childs = baseObj.getElementsByTagName("IMG");
		totalChild = childs.length; 
		
		// 이미지 테두리 처리
		for(i = 0; i < totalChild; i++){
			childObj = childs[i];

			objID = childObj.getAttribute("id");
			if(!objID) continue;
			if(objID.substr(0, 17) != "ANYBOARDVIEWIMAGE") continue;
			childObj.style.height = "auto";
			childObj.onclick = function(){ anyboard.contentImageOpen(this); };
		}
	}	// end mobileImageEvent function


	// 리스트 부분 파일 정보보기
	anyboard.prototype.fileListView = function(e, num){
		this.fileListRemove();	// 이전 레이어 삭제

		this.fileListLayer = document.createElement("DIV");
		this.fileListLayer.setAttribute('id', 'anyboardFileListLayer');
		this.fileListLayer.style.position = 'absolute';		
		this.fileListLayer.style.zIndex = '9999';
		this.fileListLayer.style.border = '1px solid #C6CAFF';
		this.fileListLayer.style.backgroundColor = 'EFF3FF';
		this.fileListLayer.style.padding = '5px';
		this.fileListLayer.style.textAlign = 'left';
		this.fileListLayer.style.lineHeight = '18px';
		this.fileListLayer.style.width = "220px";

		pX = (!window.event) ? e.pageX : document.documentElement.scrollLeft + window.event.clientX;
		pY = (!window.event) ? e.pageY : document.documentElement.scrollTop + window.event.clientY;
		pX -= 110;
		pY -= 2;
		pX += "px";
		pY += "px";

		this.fileListLayer.style.left = pX;
		this.fileListLayer.style.top = pY;
		this.fileListLayer.innerHTML = "";
		//this.fileListLayer.onmouseout = function(){ anyboard.fileListRemove(); };
		document.body.appendChild(this.fileListLayer);


		params  = "action=getFileList";
		params += "&boardID="+this.boardID;
		params += "&Mode=list";
		params += "&num="+num;
		this.sendRequest("/core/xml/anyboard.xml.html", params, this.resultXML, "POST");
	}	// end fileListView function

	// 파일 리스트 부분 없애기
	anyboard.prototype.fileListRemove = function(){
		if(this.fileListLayer != null){
			document.body.removeChild(this.fileListLayer);
			this.fileListLayer = null;
		}
	}	// end fileListRemove function


	// 파일 리스트 부분 출력
	anyboard.prototype.displayFileList = function(){
		totalFile = this.docXML.getElementsByTagName("fileInfo").length;
		this.fileListLayer.innerHTML += "<img src=\"/core/images/etc/icon_filelist_close.gif\" title=\"닫기\" style=\"cursor:pointer;\" onClick=\"anyboard.fileListRemove();\" align='right'><br />";
		for(i = 0;  i < totalFile; i++){
			fileObj = this.docXML.getElementsByTagName("fileInfo").item(i);
			fileName = fileObj.firstChild.nodeValue;
			fileSize = fileObj.getAttribute('fileSize');
			fileNum = fileObj.getAttribute('num');

			tmpNum = i+1;
			

			this.fileListLayer.innerHTML += "<span style=\"cursor:pointer; font-size:12px; color:#333333;\" onClick=\"ABHiddenFrame.document.location.href='/core/anyboard/download.php?boardID=" + this.boardID + "&fileNum=" + fileNum + "';\" onMouseover=\"this.style.color='#FF07F2';\" onMouseout=\"this.style.color='#333333';\">" + tmpNum + ". " + fileName + " ("+fileSize+") <br></span>";
		}	

	}	// end displayFileList function


	// 파일전체 완료후
	anyboard.prototype.fileUploadComplete = function(str){
		str = decodeURIComponent(str);
		document.anyboardForm.uploadFiles.value = str;
	}	// end fileUploadComplete function


	// 파일 삭제 (flex전용)
	anyboard.prototype.fileUploadedDelete = function(key, fileNum){
		delObj = document.anyboardForm.deleteFiles;
		if(delObj.value == ""){
			delObj.value = fileNum;
		}else{
			delObj.value = delObj.value+"-"+fileNum;
		}
	}	// end fileUploadedDelete function



	// 리스트 형식 변경
	anyboard.prototype.listTypeChange = function(listType){
		boardListTypeKey = "ANYBOARD_"+this.boardID;
		setCookie(boardListTypeKey, listType, 365, null);
		document.location.reload();
	}	// end listType function


	// SNS연동
	anyboard.prototype.goSNS = function(snsSvc, msg, url, msg2){
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

			case 'band':
				url = this.rawurldecode(url);
				params = this.getUrlParams(url);
				arr = url.split("?");
				url = arr[0]+"?"+params;
				url = this.rawurlencode(url);
				openUrl = "http://www.band.us/plugin/share?body="+msg+encodeURIComponent('\n')+url+"&route="+msg2;
				break;

			case 'kakaotalk':
				openUrl = "/core/mobile/boardSkin/sns/kakaolink.html?boardID="+msg+"&num="+url;
				break;

			case 'kakaotalk_responsive':
				openUrl = "/core/anyboard/responsive_default/sns/kakaolink.html?boardID="+msg+"&num="+url;
				break;

			case 'googleplus':
				openUrl = "https://plus.google.com/share?url="+url+"&btmpl=popup";
				break;
		}

		if(!isApp() || snsSvc != "kakaotalk"){
			var a = window.open(openUrl, "sns");			 
			if ( a ) {	 
				a.focus();	 
			}
		}else{
			//window.open(openUrl, "sns");
			document.location.href=openUrl;
		}
	}	// end goSNS function


	anyboard.prototype.rawurldecode = function(str) {

		return decodeURIComponent((str + '').replace(/%(?![\da-f]{2})/gi, function() {
				return '%25';
			}));

	}

	anyboard.prototype.rawurlencode = function(str) {

		str = (str + '').toString();

		return encodeURIComponent(str)
			.replace(/!/g, '%21')
			.replace(/'/g, '%27')
			.replace(/\(/g, '%28')
			.replace(/\)/g, '%29')
			.replace(/\*/g, '%2A');
	}

	anyboard.prototype.getUrlParams = function(url){
		var paramsf = "";
		var params = "";
		url.replace(/[?&]+([^=&]+)=([^&]*)/gi, function(str, key, value) { 
			if(key == "num" || key == "boardID" || key == "Mode" ){
				if(key == "num"){
					paramsf = key+"="+value; 
				} else {
					params += "&"+key+"="+value; 
				}
			}
		});
	    return paramsf+params;
	}

	
	// urlDecode
	anyboard.prototype.urlDecode = function(data){
		var lsRegExp = /\+/g;
		return decodeURIComponent(String(data).replace(lsRegExp, " "));
	}	// end urlDecode function

	// pwdCheck
	anyboard.prototype.pwdCheck = function(){
		var form = document.anyboardForm;
		// 작성자 체크
		if(trim(form.password.value) == ""){
			alert("\n비밀번호를 입력하세요. ");
			form.password.focus();
			return false;
		}

		document.getElementById('dataBtnArea').style.display='none';
		document.getElementById('dataTxtArea').style.display='block';

		new cryptSubmit(form, form.cryptKey); // 글등록
	}	// end pwdCheck function

	
	// 리스트 페이지에서 체크 all
	anyboard.prototype.listCheckAll = function(obj){
		form = document.anyboardListForm;

		listTotal = form.elements['boardNum[]'].length;
		if(listTotal){
			for(i = 0; i < listTotal; i++){
				form.elements['boardNum[]'][i].checked = obj.checked;
			}
		}else{
			form.elements['boardNum[]'].checked = obj.checked;
		}
	}	// end listCheckAll function


	// 멀티삭제 체크
	anyboard.prototype.multiDeleteCheck = function(){
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

		if(confirm("정말로 선택된 게시물을 삭제하시겠습니까?")){
			form.processType.value = "multiDelete";
			new cryptSubmit(form, form.cryptKey);
		}
	}	// end multiDeleteCheck function


	// 선택이동 체크
	anyboard.prototype.multiMoveCheck = function(){
		form = document.anyboardListForm;
		rtnID = document.getElementById('boardListSel').value;

		if(!rtnID){
			alert("이동할 메뉴를 선택하세요");
			document.getElementById('boardListSel').focus();
			return false;
		}else{
			if(confirm("정말로 선택된 게시물을 이동시키겠습니까?")){
				form.processType.value = "multiMove";
				form.rtnID.value = rtnID;
				new cryptSubmit(form, form.cryptKey);
			}
		}
	}	// end multiMoveSet function


	// 자료 백업
	anyboard.prototype.backupOpen = function(e){
		openPage.createPage(e, '500', '240', '/core/anyboard/backup.html?boardID='+this.boardID, 'auto', '-1', '-1');				
	}	// end backupOpen function

	// 게시물 재정렬
	anyboard.prototype.resort = function(){
		document.getElementById("adminBtnArea").style.display = "none";
		document.resortForm.submit();
	}

	// 게시판 초기화 팝업 열기
	anyboard.prototype.resetOpen = function(e){
		openPage.createPage(e, '480', '230', '/core/anyboard/reset.html?boardID='+this.boardID, 'auto', '-1', '-1');				
	}	// end resetOpen

	// 게시판 초기화
	anyboard.prototype.boardReset = function(){
		params = "action=boardReset";
		params += "&boardID="+this.boardID;
		this.sendRequest("/core/xml/anyboard.xml.html", params, this.resultXML, "POST");
	}	// end boardReset

	anyboard.prototype.dateChange = function(obj){
		if(obj.checked){
			document.getElementById("dateChangeArea").style.display = "";
		} else {
			document.getElementById("dateChangeArea").style.display = "none";
		}
	}
	
	// 다운로드 권한 체크
	anyboard.prototype.downPermitChk = function(num){
		params = "action=downPermitChk";
		params += "&boardID="+this.boardID;
		params += "&Mode=view";
		params += "&num="+num;
		this.sendRequest("/core/xml/anyboard.xml.html", params, this.resultXML, "POST");
	}

	// 신고하기 레이어 열기
	anyboard.prototype.reportOpen = function(){
		$(".reportWrap").fadeIn(100);
		tableName = this.docXML.getElementsByTagName("tableName").item(0).firstChild.nodeValue;
		num = this.docXML.getElementsByTagName("num").item(0).firstChild.nodeValue;

		htmlDIV = document.createElement('DIV');
		htmlDIV.setAttribute("id", "reportDiv");
		document.getElementById("reportArea").appendChild(htmlDIV);

		htmlP = document.createElement('P');
		htmlDIV.appendChild(htmlP);

		htmlSPAN = document.createElement('SPAN');
		if(this.boardInfo['boardSkin'] != "english") {
			htmlSPAN.innerHTML = "신고하기";
		} else {
			htmlSPAN.innerHTML = "Report it";		
		}
		htmlSPAN.style.color = "black";
		htmlP.appendChild(htmlSPAN);

		htmlSPAN2 = document.createElement('SPAN');
		htmlSPAN2.className = "reportClose";
		htmlSPAN2.innerHTML = "<img src='/core/anyboard/default/images/close001.png' onclick='anyboard.reportClose();'>";
		htmlP.appendChild(htmlSPAN2);

		htmlSPAN3 = document.createElement('SPAN');
		if(this.boardInfo['boardSkin'] != "english") {
			htmlSPAN3.innerHTML = "1. 신고대상을 선택하세요";
		} else {
			htmlSPAN3.innerHTML = "1. Please select a report target";		
		}
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
			htmlLABEL.innerHTML = "<input type='radio' name='reportType' value='"+typeKey+"' "+isChecked+" onclick=\"anyboard.reportTypeChange('"+typeText+"');\"><i class='type2'></i><span>"+typeVal+"</span>&nbsp;&nbsp;&nbsp;&nbsp;";
			htmlDIV2.appendChild(htmlLABEL);
		}

		htmlSPAN5 = document.createElement('SPAN');
		if(this.boardInfo['boardSkin'] != "english") {
			htmlSPAN5.innerHTML = "2. 신고항목을 선택하세요";
		} else {
			htmlSPAN5.innerHTML = "2. Please select a report item";
		}
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
		if(this.boardInfo['boardSkin'] != "english") {
			htmlSPAN4.innerHTML = "3. 신고 내용을 입력하세요";
		} else {
			htmlSPAN4.innerHTML = "3. Please enter your report";		
		}
		htmlSPAN4.style.color = "black";
		htmlDIV.appendChild(htmlSPAN4);

		htmlTEXTAREA = document.createElement('TEXTAREA');
		htmlTEXTAREA.setAttribute("name", "reportContent");
		htmlTEXTAREA.setAttribute("id", "reportContent");
		if(this.boardInfo['boardSkin'] != "english") {
			htmlTEXTAREA.setAttribute("placeholder", "신고 내용을 입력하세요");
		} else {
			htmlTEXTAREA.setAttribute("placeholder", "Please enter your report");

		}
		htmlDIV.appendChild(htmlTEXTAREA);

		htmlDIV4 = document.createElement('DIV');
		htmlDIV4.className = "reportBtn";
		htmlDIV.appendChild(htmlDIV4);

		htmlP2 = document.createElement('P');
		htmlP2.className = "reportBtn1";
		if(this.boardInfo['boardSkin'] != "english") {
			htmlP2.innerHTML = "신고내용 보내기";
		} else {
			htmlP2.innerHTML = "Send report";
		}
		htmlP2.onclick = function() { anyboard.reportWriteCheck(tableName, num); }
		htmlDIV4.appendChild(htmlP2);

		document.getElementById("reportArea").style.display = "";
	}

	anyboard.prototype.reportTypeChange = function(typeText){
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
	anyboard.prototype.reportClose = function(){
		var reportArea = document.getElementById("reportArea");
		var reportDiv = document.getElementById("reportDiv");
		reportArea.removeChild(reportDiv);
		document.getElementById("reportArea").style.display = "none";
	}

	// 신고하기 폼 체크
	anyboard.prototype.reportWriteCheck = function(tableName, num){
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

		new cryptSubmit(form, form.cryptKey, true);
	}
	
	this.requestInfo();
}

//-->