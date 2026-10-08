<!--

// ID, Password찾기
idpwSearch = function(){
	this.docXML;				// XML데이터 return 값
	this.callback = null;		// XML결과 return함수
	this.httpRequest = null;	// httpRequest객체
	this.isIE = (navigator.appName.indexOf('Microsoft')+1) ? true : false;	// 브라우져 IE 또는 기타

	// httpRequest 객체 생성 함수
	idpwSearch.prototype.getXMLHttpRequest = function() {
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
	idpwSearch.prototype.sendRequest = function(url, params, callback, method) {
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
	idpwSearch.prototype.onStateChange = function() {
		this.callback(this.httpRequest);
	}	// end onStateChange end


	// 내용xml호출
	idpwSearch.prototype.idSearch = function(){
		form = document.idSearchForm;

		putName = anySecure.strEncode(form.name.value);
		params  = "action="+anySecure.strEncode("idSearch");
		params += "&name="+encodeURIComponent(putName);

		// 이메일로찾기
		if(form.idSearchType[0].checked == true){
			putEmail = anySecure.strEncode(form.email.value);
			params += "&searchType="+anySecure.strEncode("email");
			params += "&searchKey="+encodeURIComponent(putEmail);			
		// 바로 찾기
		}else{
			//ssn = anySecure.strEncode(form.ssn1.value + "-" + form.ssn2.value);
			putHphone = anySecure.strEncode(form.hphone.value);
			putEmail = anySecure.strEncode(form.email.value);			
			if(form.hphone.value!=""){
				params += "&searchType="+anySecure.strEncode("hphone");
				params += "&searchKey="+encodeURIComponent(putHphone);	
			} else if(form.email.value!=""){
				params += "&searchType="+anySecure.strEncode("email");
				params += "&searchKey="+encodeURIComponent(putEmail);	
			}
		}

		document.getElementById("idSearch1_1").style.display = "none";
		document.getElementById("idSearch1_2").style.display = "block";

		this.sendRequest("/core/module/membership/xml/idpwSearch.xml.html", params, this.resultXML, "POST");
	}	// end requestXML function

	
	// 아이디 찾기 변경
	idpwSearch.prototype.idTypeChange = function(){
		if(document.idSearchForm.idSearchType[0].checked == true){
			document.getElementById("idType_1").style.display = "block";
			document.getElementById("idType_3").style.display = "none";
		}else{
			document.getElementById("idType_3").style.display = "block";
			document.getElementById("idType_1").style.display = "none";

			if(getEle("label01").getAttribute('hphoneUse')=="Y") {
				getEle("idType_1").style.display = "none";
				getEle("idType_3").style.display = "block";
			} else {
				getEle("idType_1").style.display = "block";
				getEle("idType_3").style.display = "none";
			}
		}
		pageResize();
	}	// end idTypeChange function


	// 비밀번호찾기 요청
	idpwSearch.prototype.pwSearch = function(){
		form = document.pwSearchForm;
		params  = "action="+anySecure.strEncode("pwSearch");
		params += "&name="+encodeURIComponent(anySecure.strEncode(form.name.value));
		params += "&id="+encodeURIComponent(anySecure.strEncode(form.id.value));

		// 이메일로찾기
		if(form.pwSearchType[0].checked == true){
			params += "&searchType="+anySecure.strEncode("email");
			params += "&email="+encodeURIComponent(anySecure.strEncode(form.email.value));
			
		// 주민등록 번호로 찾기
		}else{
			params += "&searchType="+anySecure.strEncode("quest");
			params += "&passQuestion="+encodeURIComponent(anySecure.strEncode(form.passQuestion.value));
			params += "&passAnswer="+encodeURIComponent(anySecure.strEncode(form.passAnswer.value));
		}
			
		document.getElementById("idSearch2_1").style.display = "none";
		document.getElementById("idSearch2_2").style.display = "block";

		this.sendRequest("/core/module/membership/xml/idpwSearch.xml.html", params, this.resultXML, "POST");
	}	// end pwSearch function


	// 비밀번호 찾기 변경
	idpwSearch.prototype.pwTypeChange = function(){
		if(document.pwSearchForm.pwSearchType[0].checked == true){
			document.getElementById("pwType_1").style.display = "block";
			document.getElementById("pwType_2").style.display = "none";
			document.getElementById("pwType_3").style.display = "none";
		}else{
			document.getElementById("pwType_1").style.display = "none";
			document.getElementById("pwType_2").style.display = "block";
			document.getElementById("pwType_3").style.display = "block";
		}
		pageResize();
	}	// end pwTypeChange function


	// XML결과
	idpwSearch.prototype.resultXML = function(){
		if(this.httpRequest.readyState == 4){
			if(this.httpRequest.status == 200){
				//alert(this.httpRequest.responseText);
				this.docXML = this.httpRequest.responseXML;
				code = this.docXML.getElementsByTagName("code").item(0).firstChild.nodeValue;	// 결과코드

				// 결과 실행
				switch (code){
					case 'alertMsg':
						action = this.docXML.getElementsByTagName("action").item(0).firstChild.nodeValue;	// 확인방법
						searchType = this.docXML.getElementsByTagName("searchType").item(0).firstChild.nodeValue;	// 확인방법
						message = this.docXML.getElementsByTagName("message").item(0).firstChild.nodeValue;	// 리턴메시지
						alert(message);
						document.idSearchForm.reset();
						document.pwSearchForm.reset();
						// 아이디찾기
						if(action == 'idSearch'){
							form = document.idSearchForm;
							if(searchType == 'email'){
								form.idSearchType[0].checked = true;
							} else {
								form.idSearchType[1].checked = true;
							}
							this.idTypeChange();

							document.getElementById("idSearch1_1").style.display = "block";
							document.getElementById("idSearch1_2").style.display = "none";

						} else {
						// 비밀번호 찾기
							form = document.pwSearchForm;
							if(searchType == 'email'){
								form.pwSearchType[0].checked = true;
							} else {
								form.pwSearchType[1].checked = true;
							}
							this.pwTypeChange();

							document.getElementById("idSearch2_1").style.display = "block";
							document.getElementById("idSearch2_2").style.display = "none";
						}

						
						break;					

					default:
						alert("결과코드 없음");
						break;
				}
			}
		}
	}	// end resultXML function	
}	// end idpwSearch Class

idpwSearch = new idpwSearch();
//-->