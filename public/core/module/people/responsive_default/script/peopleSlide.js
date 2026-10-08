<!--

// 섬기는 분들 내용 슬라이드
peopleSlide = function(){
	this.slideStep = 7;

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


	// 슬라이드 체크
	peopleSlide.prototype.slideCheck = function(num){

		objBox = document.getElementById("modTextBox_"+num);
		objData = document.getElementById("modTextData_"+num);
		objLine = document.getElementById("modTextLine_"+num);
		objImg = document.getElementById("modTextImg_"+num);

		//objBox.style.height = ""+objData.scrollHeight+"px";
		//objBox.style.height = ""+objData.scrollHeight+"px";

		if(parseInt(objBox.style.height) == 0){
			//objLine.style.borderTop = "1px solid #8cc152;";
			objLine.className = "p_btn_open";
			objImg.src = objImg.getAttribute("openImage");
			peopleSlide.slideOpen(num);
		}

		if(parseInt(objBox.style.height) == parseInt(objData.scrollHeight)){
			//objLine.style.borderTop = "1px solid #d4d4d4;";
			objLine.className = "p_btn";
			objImg.src = "/core/module/people/responsive_default/images/btn_default.png";
			peopleSlide.slideClose(num);
		}
	}	// end slideCheck function	


	// 슬라이드 열기
	peopleSlide.prototype.slideOpen = function(num){

		objBox.style.display = "block";
		objBox = document.getElementById("modTextBox_"+num);
		objData = document.getElementById("modTextData_"+num);

		objBoxHeight = parseInt(objBox.style.height);
		objBoxHeight = objBoxHeight + this.slideStep;
		objDataHeight = parseInt(objData.scrollHeight);		

		if(objBoxHeight >= objDataHeight){
			objBoxHeight = objDataHeight;
			objBox.style.height = ""+objBoxHeight+"px";			
		}else{
			objBox.style.height = ""+objBoxHeight+"px";
			scriptText = "peopleSlide.slideOpen('"+num+"');";
			setTimeout(scriptText, 16);
		}
	}	// end slideOpen function	


	// 슬라이드 닫기
	peopleSlide.prototype.slideClose = function(num){

		objBox = document.getElementById("modTextBox_"+num);
		objData = document.getElementById("modTextData_"+num);

		objBoxHeight = parseInt(objBox.style.height);
		objBoxHeight = objBoxHeight - this.slideStep;
		objDataHeight = parseInt(objData.scrollHeight);

		if(objBoxHeight <= 0){
			objBoxHeight = 0;
			objBox.style.height = ""+objBoxHeight+"px";
			objBox.style.display = "none";
		}else{
			objBox.style.height = ""+objBoxHeight+"px";
			scriptText = "peopleSlide.slideClose('"+num+"');";
			setTimeout(scriptText, 16);
		}
	}	// end slideClose function	


}	// end peopleSlide Class

var peopleSlide = new peopleSlide();

//-->
