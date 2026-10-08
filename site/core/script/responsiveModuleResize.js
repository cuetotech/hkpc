<!--


// 반응형 css파일 교체 처리
responsiveModuleResize = function(){
	this.cssID = "responsiveCss";
	this.lastCss = null;	// 마지막 불러온 파일
	this.cssSel = null;		// 선택된 css파일
	this.cssFile = new Array();
	this.cssWidth = new Array();

	// 이벤트 핸들러 생성
	responsiveModuleResize.prototype.addListener = function(element, name, observer, useCapture) {
		useCapture = useCapture || false;

		if (element.addEventListener) {
			element.addEventListener(name, observer, useCapture);
		} else if (element.attachEvent) {
			element.attachEvent('on' + name, observer);
		}
	}	// end addListener function


	// resizeCheck
	responsiveModuleResize.prototype.resizeCheck = function() {
		responsiveModuleResize.cssLoad();
	}	//	end resizeCheck function

	// cssLoad
	responsiveModuleResize.prototype.cssLoad = function() {

		w = document.getElementById("responsiveContentsBaseLayer").offsetWidth;
		w = parseInt(w);

		totalCss = this.cssFile.length;
		for(cc = 0;  cc < totalCss; cc++){
			cFile = this.cssFile[cc];
			cWidth = parseInt(this.cssWidth[cc]);

			if(cWidth >= w){
				this.cssSel = cFile;
				break;
			}

			if(cWidth == 0){
				this.cssSel = cFile;
				break;
			}
		}

		if(this.cssSel != null && this.cssSel != this.lastCss){
			this.lastCss = this.cssSel;
			document.getElementById(this.cssID).setAttribute("href", this.cssSel);
		}
		//setTimeout("responsiveModuleResize.cssLoad();", 33);
	}	//	end cssLoad function


	this.addListener(window, "resize", this.resizeCheck);
	try{
		this.addListener(window, "load", this.resizeCheck);
	}catch(err){
	}
}	// end responsiveModuleResize class


//-->
