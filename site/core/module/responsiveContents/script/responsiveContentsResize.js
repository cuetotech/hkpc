<!--


// 반응형 css파일 교체 처리
responsiveContentsResize = function(){
	this.cellObj = null;


	// 이벤트 핸들러 생성
	responsiveContentsResize.prototype.addListener = function(element, name, observer, useCapture) {
		useCapture = useCapture || false;

		if (element.addEventListener) {
			element.addEventListener(name, observer, useCapture);
		} else if (element.attachEvent) {
			element.attachEvent('on' + name, observer);
		}
	}	// end addListener function


	// resizeCheck
	responsiveContentsResize.prototype.resizeCheck = function() {
		responsiveContentsResize.cssLoad();
	}	//	end resizeCheck function


	// cssLoad
	responsiveContentsResize.prototype.cssLoad = function() {

		// 객체 배열
		if(this.cellObj == null){
			this.cellObj = new Array();

			childs = document.getElementById("responsiveContentsBaseLayer").getElementsByTagName("DIV");
			totalChild = childs.length; 
			si = 0;
			for(i = 0; i < totalChild; i++){
				childObj = childs[i];
				childCheck = ((childObj.getAttribute("isResCell") == "Y")) ? true : false;
				if(childCheck == true){
					this.cellObj[si] = childObj;
					si++;
				}
			}
		}

		w = document.getElementById("responsiveContentsBaseLayer").offsetWidth;
		w = parseInt(w);


		for(z = 0; z < this.cellObj.length; z++){
			cObj = this.cellObj[z];
			cCount = parseInt(cObj.getAttribute("cellCount"));
			cSize = parseInt(cObj.getAttribute("cellSize"));

			if(w < 600){
				cObj.style.width = "100%";
			}else if(w < 900){
				if(cCount == 4){
					cObj.style.width = "50%";
				}else{
					cObj.style.width = ""+cSize+"%";
				}
			}else{
				cObj.style.width = ""+cSize+"%";
			}
		}
	}	//	end cssLoad function

	this.cssLoad();
	this.addListener(window, "resize", this.resizeCheck);
}	// end responsiveContentsResize class


//-->
