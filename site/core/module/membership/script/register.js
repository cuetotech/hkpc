<!--

// 회원가입관련 스크립트
register = function(){
	this.docXML;				// XML데이터 return 값
	this.callback = null;		// XML결과 return함수
	this.httpRequest = null;	// httpRequest객체
	this.itemInterior = new Array();	// 회원가입폼 내국인
	this.itemOversea = new Array();		// 회원가입폼 해외거주자
	this.itemAgreement = new Array();	// 회원가입폼 약관
	this.itemOpt = new Array();			// 회원가입폼 추가 옵션
	this.isIE = (navigator.appName.indexOf('Microsoft')+1) ? true : false;	// 브라우져 IE 또는 기타
	this.secEnhance = "";		// 비밀번호강화

	// httpRequest 객체 생성 함수
	register.prototype.getXMLHttpRequest = function() {
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
	register.prototype.sendRequest = function(url, params, callback, method) {
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
	register.prototype.onStateChange = function() {
		this.callback(this.httpRequest);
	}	// end onStateChange end


	// 내용xml호출
	register.prototype.requestXML = function(action){		
		params  = "action="+action;
		this.sendRequest("/core/module/membership/xml/register.xml.html", params, this.resultXML, "POST");
	}	// end requestXML function	


	// 아이디 중복 체크
	register.prototype.idCheck = function() {
		params  = "action=idCheck";
		params += "&id="+encodeURIComponent(anySecure.strEncode(document.registerForm.id.value));
		this.sendRequest("/core/module/membership/xml/register.xml.html", params, this.resultXML, "POST");
	}	// end idCheck end


	// XML결과
	register.prototype.resultXML = function(){
		if(this.httpRequest.readyState == 4){
			if(this.httpRequest.status == 200){

				//alert(this.httpRequest.responseText);

				this.docXML = this.httpRequest.responseXML;
				code = this.docXML.getElementsByTagName("code").item(0).firstChild.nodeValue;	// 결과코드

				// 결과 실행
				switch (code){
					case 'alertMsg':
						message = this.docXML.getElementsByTagName("message").item(0).firstChild.nodeValue;	// 리턴메시지
						alert(message);
						break;

					// 아이디 사용가능
					case 'sendID':
						message = this.docXML.getElementsByTagName("message").item(0).firstChild.nodeValue;	// 리턴메시지
						alert(message);
						document.registerForm.idCheck.value = "Y";
						break;
					
					// 아이디에러
					case 'errorID':
						message = this.docXML.getElementsByTagName("message").item(0).firstChild.nodeValue;	// 리턴메시지
						alert(message);
						document.registerForm.idCheck.value = "N";
						break;

					case 'itemList':
						this.itemArray();
						break;

					default:
						alert("결과코드 없음");
						break;
				}
			}
		}
	}	// end resultXML function


	// 폼내용 배열 
	register.prototype.itemArray = function(){

		totalItem = this.docXML.getElementsByTagName("item").length;
		x = 0;
		for(i = 0; i < totalItem; i++){
			itemForm = this.docXML.getElementsByTagName("item").item(i);
			itemName = itemForm.firstChild.nodeValue;
			formCode = itemForm.getAttribute('formCode');
			itemCode = itemForm.getAttribute('itemCode');
			checkUse = itemForm.getAttribute('checkUse');
			checkEss = itemForm.getAttribute('checkEss');

			switch(formCode){
				case 'Interior':
					this.itemInterior[itemCode] = new Array();
					this.itemInterior[itemCode]['itemName'] = itemName;
					this.itemInterior[itemCode]['checkUse'] = checkUse;
					this.itemInterior[itemCode]['checkEss'] = checkEss;
					break;

				case 'Oversea':
					this.itemOversea[itemCode] = new Array();
					this.itemOversea[itemCode]['itemName'] = itemName;
					this.itemOversea[itemCode]['checkUse'] = checkUse;
					this.itemOversea[itemCode]['checkEss'] = checkEss;
					break;

				case 'Agreement':
					this.itemAgreement[itemCode] = new Array();
					this.itemAgreement[itemCode]['itemName'] = itemName;
					this.itemAgreement[itemCode]['checkUse'] = checkUse;
					this.itemAgreement[itemCode]['checkEss'] = checkEss;
					break;

				case 'FormOpt':
					this.itemOpt[x] = new Array();
					this.itemOpt[x]['itemCode'] = itemCode;
					this.itemOpt[x]['itemName'] = itemName;
					this.itemOpt[x]['checkUse'] = checkUse;
					this.itemOpt[x]['checkEss'] = checkEss;
					x++;
					break;

			}
		}
	}	// end itemArray function


	// 주민등록번호 체크 및 외국인 등록번호 체크
	register.prototype.ssnCheck = function(s1, s2){
		n = 2;
		sum = 0;
		for (i=0; i<s1.length; i++) { sum += parseInt(s1.substr(i, 1)) * n++; }
		for (i=0; i<s2.length-1; i++) {
			sum += parseInt(s2.substr(i, 1)) * n++;
			if (n == 10) n = 2;
		}
		c = 11 - sum % 11;
		if (c == 11) { c = 1 };
		if (c == 10) { c = 0 };
		if (c != parseInt(s2.substr(6, 1))) { 
			return false; 
		}else{ 
			return true; 
		}
	}	// end ssnCheck function


	// 외국인등록번호 체크
	register.prototype.foreignerCheck = function(s1, s2){
		var sum = 0;
		var odd = 0;
		regNo = s1+s2;

		buf = new Array(13);
		for (i = 0; i < 13; i++) buf[i] = parseInt(regNo.charAt(i));

		odd = buf[7]*10 + buf[8];

		if (odd%2 != 0) {
			return false;
		}

		if ((buf[11] != 6)&&(buf[11] != 7)&&(buf[11] != 8)&&(buf[11] != 9)) {
			return false;
		}

		multipliers = [2,3,4,5,6,7,8,9,2,3,4,5];
		for (i = 0, sum = 0; i < 12; i++) sum += (buf[i] *= multipliers[i]);

		sum=11-(sum%11);

		if (sum>=10) sum-=10;

		sum += 2;

		if (sum>=10) sum-=10;

		if ( sum != buf[12]) {
			return false;
		} else {
			return true;
		}
	}	// end foreignerCheck function


	// 회원가입약관 체크 
	register.prototype.agreeCheck = function(agreeType){
		form = document.agreeForm;
		if(form.agreeChk1[0].checked == false){
			form.agreeChk1[0].focus();
			alert("서비스 이용약관에 동의하셔야 회원가입이 가능합니다.");
			return false;
		}
		if(form.agreeChk2[0].checked == false){
			form.agreeChk2[0].focus();
			alert("개인정보 수집에 동의하셔야 회원가입이 가능합니다.");
			return false;
		}
		
		if(form.agreeChk3) {
			if(form.agreeChk3[0].checked == false){
				form.agreeChk3[0].focus();
				alert("개인정보 취급위탁에 동의하셔야 회원가입이 가능합니다.");
				return false;
			}
		}
		if(typeof form.kidJoinAgree === "object"){
			if(typeof form.kidJoinAgree[0] === "object" ){
				if(form.kidJoinAgree[0].checked == false){
					form.kidJoinAgree[0].focus();
					alert("보호자(법정대리인) 동의하셔야 회원가입이 가능합니다.");
					return false;
				}

				if(trim(form.parentName.value) == ""){
					form.parentName.focus();
					alert("보호자성명을 입력해 주세요");
					return false;
				}

				if(trim(form.parentBirth.value) == ""){
					form.parentBirth.focus();
					alert("보호자생년월일을 입력해 주세요");
					return false;
				} else {
					parentBirth = trim(form.parentBirth.value);
					var now = new Date();
					syear = now.getFullYear() - 90;
					sdate = syear+"0101";
					eyear = now.getFullYear() - 20;
					edate = eyear+"1231";
					if(parseInt(parentBirth) <= sdate || parseInt(parentBirth) > edate){
						alert("보호자생년월일"+sdate+"~"+edate+"사이만 가능합니다.");
						return false;
					}
				}

				if(trim(form.parentEmail.value) == ""){
					form.parentEmail.focus();
					alert("보호자 이메일을 입력해 주세요");
					return false;
				}
			} else if(typeof form.kidJoinAgree === "object"){
				if(form.kidJoinAgree.checked == false){
					form.kidJoinAgree.focus();
					alert("보호자(법정대리인) 동의하셔야 회원가입이 가능합니다.");
					return false;
				}

				if(trim(form.parentName.value) == ""){
					form.parentName.focus();
					alert("보호자성명을 입력해 주세요");
					return false;
				}

				if(trim(form.parentBirth.value) == ""){
					form.parentBirth.focus();
					alert("보호자생년월일을 입력해 주세요");
					return false;
				} else {
					parentBirth = trim(form.parentBirth.value);
					var now = new Date();
					syear = now.getFullYear() - 90;
					sdate = syear+"0101";
					eyear = now.getFullYear() - 20;
					edate = eyear+"1231";
					if(parseInt(parentBirth) <= sdate || parseInt(parentBirth) > edate){
						alert("보호자생년월일"+sdate+"~"+edate+"사이만 가능합니다.");
						return false;
					}
				}

				if(trim(form.parentEmail.value) == ""){
					form.parentEmail.focus();
					alert("보호자 이메일을 입력해 주세요");
					return false;
				}
			}
		}



		if(agreeType == 'oversea'){
			form.registerType.value = agreeType;
		}else{
			form.registerType.value = agreeType;
		}

		new cryptSubmit(form, form.cryptKey);
	}	// end agreeCheck function


	// 우편번호찾기
	register.prototype.postSearch = function(){
		//window.open('/core/module/membership/default/postSearch.html','postSearch','width=516, height=283, toolbar=no, resizeable=no, scrolling=no, scrollbars=yes, top=200, left=200');
		window.open('/core/module/membership/default/searchPost.html','postSearch','width=560, height=800, toolbar=no, resizeable=no, scrolling=no, scrollbars=yes, top=0, left=50');
	}


	// 그룹찾기
	register.prototype.groupSearch = function(){
		window.open('/core/module/membership/default/groupSearch.html?gCode='+document.registerForm.memberGroup.value,'groupSearch','width=516, height=240, toolbar=no, resizeable=no, scrolling=no, scrollbars=yes, top=200, left=200');
	}


	// 추가항목체크
	register.prototype.optCheck = function(){
		totalOpt = this.itemOpt.length;
		var form = document.registerForm;

		for(i = 0; i < totalOpt; i++){
			opt = this.itemOpt[i];
			if(opt['checkEss'] == "N") continue;
			itemCode = opt['itemCode'];
			optObj = document.getElementsByName("BOPT_"+itemCode+"[]");
			if(optObj.length == 0 ){
				optObj2 = document.getElementById("BOPT_"+i);
				if(trim(optObj2.value) == ""){
					alert("`"+opt['itemName'] + "`항목을 입력하세요.");
					optObj.focus();
					return false;
				}
			} else {
				var chk = "";
				for(j = 0; j < optObj.length; j++){
					if(optObj[j].checked){
						chk = "T";
					} 
				}

				if(chk != "T"){
					alert("`"+opt['itemName'] + "`항목을 입력하세요");
					optObj.focus();
					return false;
				}
			}
		}
		return true;
	}	// end optCheck function


	// 14세 미만 체크
	register.prototype.under14Check = function(){
		var form = document.registerForm;
		var gDate = new Date();
		var gYear = gDate.getFullYear();
		var gMonth = gDate.getMonth() + 1;
		var gDay = gDate.getDate();
		if(('' + gMonth).length == 1) gMonth = '0' + gMonth;
		if(('' + gDay).length == 1) gDay = '0' + gDay;
		var gToday = ''+gYear+gMonth+gDay;

		var sYear = form.bYear.value;
		var sMonth = form.bMonth.value;
		var sDay = form.bDay.value;
		if(sMonth.length == 1) sMonth = '0' + sMonth;
		if(sDay.length == 1) sDay = '0' + sDay;
		var sDate = ''+sYear+sMonth+sDay;

		var chkDate = parseInt(gToday) - parseInt(sDate);

		if(chkDate < 140000){
			//alert("14세 미만");
		}


		return true;
	}	// end under14Check function


	// 국내거주자 체크
	register.prototype.interiorCheck = function(){
		form = document.registerForm;

		if(this.itemInterior['nickName']['checkEss'] == "Y"){
			if(trim(form.nickName.value) == ""){
				alert("닉네임을 입력하세요");
				form.nickName.focus();
				return false;
			}
		}

//		if(this.itemInterior['ssn']['checkEss'] == "Y"){
//			if(!this.ssnCheck(form.ssn1.value, form.ssn2.value) && !this.foreignerCheck(form.ssn1.value, form.ssn2.value)){
//				alert("주민등록번호가 잘못되었습니다.\n\n주민등록번호 또는 외국인 등록번호를 확인하세요  ");
//				form.ssn1.focus();
//				return false;
//			}
//		}

		if(this.itemInterior['address']['checkEss'] == "Y"){
			if(trim(form.zipCode.value) == ""){
				alert("우편번호 찾기를 이용해서 주소를 입력하세요");
				return false;
			}

			if(trim(form.addr2.value) == ""){
				alert("나머지 주소를 입력하세요");
				form.addr2.focus();
				return false;
			}
		}

		if(this.itemInterior['phone']['checkEss'] == "Y"){
			if(trim(form.phone1.value) == "" || trim(form.phone2.value) == "" || trim(form.phone3.value) == ""){
				alert("전화번호를 입력하세요");
				form.phone1.focus();
				return false;
			}
		}

		if(this.itemInterior['hphone']['checkEss'] == "Y"){
			if(trim(form.hphone1.value) == "" || trim(form.hphone2.value) == "" || trim(form.hphone3.value) == ""){
				alert("핸드폰번호를 입력하세요");
				form.hphone1.focus();
				return false;
			}
		}

		if(this.itemInterior['homepage']['checkEss'] == "Y"){
			if(trim(form.homepage.value) == ""){
				alert("홈페이지 주소를 입력하세요");
				form.homepage.focus();
				return false;
			}
		}

		if(this.itemInterior['job']['checkEss'] == "Y"){
			if(trim(form.job.value) == ""){
				alert("직업을 입력하세요");
				form.job.focus();
				return false;
			}
		}

		if(this.itemInterior['duty']['checkEss'] == "Y"){
			if(trim(form.duty.value) == ""){
				alert("직책을 입력하세요");
				form.duty.focus();
				return false;
			}
		}

		if(this.itemInterior['memo']['checkEss'] == "Y"){
			if(trim(form.memo.value) == ""){
				alert("메모를 입력하세요");
				form.memo.focus();
				return false;
			}
		}

		return true;
	}	// end interiorCheck function


	// 해외거주자 체크
	register.prototype.overseaCheck = function(){
		form = document.registerForm;

		if(this.itemOversea['nickName']['checkEss'] == "Y"){
			if(trim(form.nickName.value) == ""){
				alert("닉네임을 입력하세요");
				form.nickName.focus();
				return false;
			}
		}

		if(this.itemOversea['address']['checkEss'] == "Y"){
			if(trim(form.address.value) == ""){
				alert("주소를 입력하세요");
				form.address.focus();
				return false;
			}
		}

		if(this.itemOversea['phone']['checkEss'] == "Y"){
			if(trim(form.phone1.value) == "" || trim(form.phone2.value) == "" || trim(form.phone3.value) == ""){
				alert("전화번호를 입력하세요");
				form.phone1.focus();
				return false;
			}
		}

		if(this.itemOversea['hphone']['checkEss'] == "Y"){
			if(trim(form.hphone1.value) == "" || trim(form.hphone2.value) == "" || trim(form.hphone3.value) == ""){
				alert("핸드폰번호를 입력하세요");
				form.hphone1.focus();
				return false;
			}
		}

		if(this.itemOversea['homepage']['checkEss'] == "Y"){
			if(trim(form.homepage.value) == ""){
				alert("홈페이지 주소를 입력하세요");
				form.homepage.focus();
				return false;
			}
		}

		if(this.itemOversea['job']['checkEss'] == "Y"){
			if(trim(form.job.value) == ""){
				alert("직업을 입력하세요");
				form.job.focus();
				return false;
			}
		}

		if(this.itemOversea['duty']['checkEss'] == "Y"){
			if(trim(form.duty.value) == ""){
				alert("직책을 입력하세요");
				form.duty.focus();
				return false;
			}
		}

		if(this.itemOversea['memo']['checkEss'] == "Y"){
			if(trim(form.memo.value) == ""){
				alert("메모를 입력하세요");
				form.memo.focus();
				return false;
			}
		}

		return true;
	}	// end overseaCheck function


	// 회원가입체크
	register.prototype.registerCheck = function(registerType){
		form = document.registerForm;

		if(trim(form.name.value) == ""){
			alert("이름을 입력하세요");
			form.name.focus();
			return false;
		}
		
		if(trim(form.id.value) == ""){
			alert("아이디를 입력하세요");
			form.id.focus();
			return false;
		}

		if(form.idCheck.value == "N"){
			alert("아이디 중복체크를 하세요");
			form.id.focus();
			return false;
		}

		if(trim(form.password.value) == ""){
			alert("비밀번호를 입력하세요");
			form.password.focus();
			return false;
		}
		str = form.password.value;
		if(this.secEnhance == "Y"){
			if(str.length < 9 || str.length > 16){
				alert("9~16자의 영문 대소문자, 숫자, 특수문자의 조합으로 설정이 가능합니다.");
				form.password.focus();
				return false;
			}
//			if(!/[0-9]/.test(str) || !/[a-zA-Z]/.test(str) || !/[!@#$%^*+=-]/.test(str)){
			if(!/[0-9]/.test(str) || !/[a-zA-Z]/.test(str) || !/[!@#$%^*+=-_{}|(:"<>?)&]/.test(str)){
				alert("9~16자의 영문 대소문자, 숫자, 특수문자의 조합으로 설정이 가능합니다.");
				form.password.focus();
				return false;
			}
		} else {
			if(str.length < 4){
				alert("4자리 이상으로 입력해주셔야 합니다.");
				form.password.focus();
				return false;
			}
		}

		if(form.password.value != form.password2.value){
			alert("비밀번호 재입력이 틀립니다.");
			form.password.focus();
			return false;
		}
		
		if(!isApp()){

			if(trim(form.email.value) == ""){
				alert("이메일을 입력하세요");
				form.email.focus();
				return false;
			}

			if(!emailCheck(form.email.value)){
				alert("잘못된 이메일 주소입니다.");
				form.email.focus();
				return false;
			}

			if(trim(form.bYear.value) == ""){
				alert("생년월일을 선택하세요");
				form.bYear.focus();
				return false;
			}

			if(trim(form.bMonth.value) == ""){
				alert("생년월일을 선택하세요");
				form.bMonth.focus();
				return false;
			}

			if(trim(form.bDay.value) == ""){
				alert("생년월일을 선택하세요");
				form.bDay.focus();
				return false;
			}
		}

		if(trim(form.passQuestion.value) == ""){
			alert("패스워드분실 질문을 선택하세요");
			form.passQuestion.focus();
			return false;
		}

		if(trim(form.passAnswer.value) == ""){
			alert("패스워드분실 답변을 선택하세요");
			form.passAnswer.focus();
			return false;
		}


		// 국내거주자 체크
		if(registerType=='interior'){
			if(!this.interiorCheck()){
				return false;
			}
		}

		// 해외거주자 체크
		if(registerType=='oversea'){
			if(!this.overseaCheck()){
				return false;
			}
		}


		// 추가 항목 체크
		if(!this.optCheck()){
			return false;
		}

		document.getElementById('dataBtnArea').style.display='none';
		document.getElementById('dataTxtArea').style.display='block';

		new cryptSubmit(form, form.cryptKey, true);
	}	// end registerCheck function


	// 회원정보 체크
	register.prototype.registerEdit = function(registerType){
		form = document.registerForm;

		
		if(trim(form.password.value) != ""){
			str = form.password.value;
			if(this.secEnhance == "Y"){
				if(str.length < 9 || str.length > 16){
					alert("9~16자의 영문 대소문자, 숫자, 특수문자의 조합으로 설정이 가능합니다.");
					form.password.focus();
					return false;
				}
//				if(!/[0-9]/.test(str) || !/[a-zA-Z]/.test(str) || !/[!@#$%^*+=-]/.test(str)){
				if(!/[0-9]/.test(str) || !/[a-zA-Z]/.test(str) || !/[!@#$%^*+=-_{}|(:"<>?)&]/.test(str)){
					alert("9~16자의 영문 대소문자, 숫자, 특수문자의 조합으로 설정이 가능합니다.");
					form.password.focus();
					return false;
				}
			} else {
				if(str.length < 4 || str.length > 16){
					alert("4~16자의 영문, 숫자의 조합으로 설정이 가능합니다.");
					form.password.focus();
					return false;
				}
			}

			if(form.password.value != form.password2.value){
				alert("비밀번호 재입력이 틀립니다.");
				form.password.focus();
				return false;
			}
		}		

		if(!isAdmin()){
			if(trim(form.email.value) == ""){
				alert("이메일을 입력하세요");
				form.email.focus();
				return false;
			}

			if(!emailCheck(form.email.value)){
				alert("잘못된 이메일 주소입니다.");
				form.email.focus();
				return false;
			}
		}

		if(trim(form.passQuestion.value) == ""){
			alert("패스워드분실 질문을 선택하세요");
			form.passQuestion.focus();
			return false;
		}

		if(trim(form.passAnswer.value) == ""){
			alert("패스워드분실 답변을 선택하세요");
			form.passAnswer.focus();
			return false;
		}


		// 국내거주자 체크
		if(registerType=='interior'){
			if(!this.interiorCheck()){
				return false;
			}
		}

		// 해외거주자 체크
		if(registerType=='oversea'){
			if(!this.overseaCheck()){
				return false;
			}
		}


		// 추가 항목 체크
		if(!this.optCheck()){
			return false;
		}

		document.getElementById('dataBtnArea').style.display='none';
		document.getElementById('dataTxtArea').style.display='block';

		new cryptSubmit(form, form.cryptKey, true);
	}	// end registerEdit function
	
	// 회원가입 선택 체크
	register.prototype.joinSelect = function(type){
		if(type == "") {
			return false;
		}
		form = document.joinSelectForm;
		form.joinType.value = type;

		new cryptSubmit(form, form.cryptKey, true);
	}

	this.requestXML('getItems');
}	// end register Class

register = new register();
//-->