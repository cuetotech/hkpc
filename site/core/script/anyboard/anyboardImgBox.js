<!--
// 게시판 이미지 박스
anyboardImgBox = function(){
	this.imgBoxStart = new Array();
	this.imgBoxEnd = new Array();

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


	// 이미지 박스
	// 이미지 style 0
	//this.imgBoxStart[0] = "<div style='width: 100%;'><ul><li style='position:relative; width: 100%; text-align: center;'><table cellpadding='0' cellspacing='0' border='0' align='center'><tr><td width='100%' align='center' style='padding-top:15px;'><div><ul><li>";
	//this.imgBoxEnd[0] = "</li></ul></div></td></tr></table></li></ul></div>";
	this.imgBoxStart[0] = "";
	this.imgBoxEnd[0] = "";

	// 이미지 style 1
	this.imgBoxStart[1] = "<div class='imgBoxDecorationZ' style='width: 100%;'><ul><li style='position:relative; width: 100%; text-align: center;'><table  cellpadding='0' cellspacing='0' border='0' align='center' style='padding-top:15px;'><tr><td width='100%' align='center' class='AB_borderType000'><div><ul><li>";
	this.imgBoxEnd[1] = "</li></ul></div></td></tr></table></li></ul></div>";

	// 이미지 style 2
	this.imgBoxStart[2] = "<div class='imgBoxDecorationZ' style='width: 100%;'><ul><li style='position:relative; width: 100%; text-align: center;'><table cellpadding='0' cellspacing='0' border='0' align='center' style='padding-top:15px;'><tr><td width='100%' align='center' class='AB_borderType001' ><div><ul><li>";
	this.imgBoxEnd[2] = "</li></ul></div></td></tr></table></li></ul></div>";

	// 이미지 style 3
	this.imgBoxStart[3] = "<div class='imgBoxDecorationZ' style='width: 100%;'><ul><li style='position:relative; width: 100%; text-align: center;'><table class='AB_borderType002' cellpadding='0' cellspacing='0' border='0' align='center' style='padding-top:15px;'><tr><td width='14'><img src='/core/anyboard/common/images/imgBox/border_type002_1.png' alt='' /></td><td style='background:url(/core/anyboard/common/images/imgBox/border_type002_2.png) repeat-x;'></td><td width='14'><img src='/core/anyboard/common/images/imgBox/border_type002_3.png' alt='' /></td></tr><td style='background:url(/core/anyboard/common/images/imgBox/border_type002_4.png) repeat-y;'></td><td><div><ul><li>";
	this.imgBoxEnd[3] = "</li></ul></div></td><td style='background:url(/core/anyboard/common/images/imgBox/border_type002_5.png) repeat-y;'></td><tr><td width='14'><img src='/core/anyboard/common/images/imgBox/border_type002_6.png' alt='' /></td><td style='background:url(/core/anyboard/common/images/imgBox/border_type002_7.png) repeat-x;'></td><td width='14'><img src='/core/anyboard/common/images/imgBox/border_type002_8.png' alt='' /></td></tr></table></li></ul></div>";

	// 이미지 style 4
	this.imgBoxStart[4] = "<div class='imgBoxDecorationZ' style='width: 100%;'><ul><li style='position:relative; width: 100%; text-align: center;'><table class='AB_borderType002' cellpadding='0' cellspacing='0' border='0' align='center' style='padding-top:15px;'><tr><td width='13'><img src='/core/anyboard/common/images/imgBox/border_type003_1.png' alt='' /></td><td style='background:url(/core/anyboard/common/images/imgBox/border_type003_2.png) repeat-x;'></td><td width='13'><img src='/core/anyboard/common/images/imgBox/border_type003_3.png' alt='' /></td></tr><td style='background:url(/core/anyboard/common/images/imgBox/border_type003_4.png) repeat-y;'></td><td><div><ul><li>";
	this.imgBoxEnd[4] = "</li></ul></div></td><td style='background:url(/core/anyboard/common/images/imgBox/border_type003_5.png) repeat-y;'></td><tr><td width='13'><img src='/core/anyboard/common/images/imgBox/border_type003_6.png' alt='' /></td><td style='background:url(/core/anyboard/common/images/imgBox/border_type003_7.png) repeat-x;'></td><td width='13'><img src='/core/anyboard/common/images/imgBox/border_type003_8.png' alt='' /></td></tr></table></li></ul></div>";

	// 이미지 style 5
	this.imgBoxStart[5] = "<div class='imgBoxDecorationZ' style='width: 100%;'><ul><li style='position:relative; width: 100%; text-align: center;'><table cellpadding='0' cellspacing='0' border='0' align='center' style='padding-top:15px;'><tr><td width='100%' align='center' class='AB_borderType005' ><div><ul><li>";
	this.imgBoxEnd[5] = "</li></ul></div></td></tr></table></li></ul></div>";

	// 이미지 style 6
	this.imgBoxStart[6] = "<div class='imgBoxDecorationZ' style='width: 100%;' class=''><ul><li style='position:relative; width: 100%; text-align: center;'><table class='AB_borderType002' cellpadding='0' cellspacing='0' border='0' align='center' style='padding-top:15px;'><tr><td width='16'><img src='/core/anyboard/common/images/imgBox/border_type005_1.png' alt='' /></td><td style='background:url(/core/anyboard/common/images/imgBox/border_type005_2.png) repeat-x;'></td><td width='16'><img src='/core/anyboard/common/images/imgBox/border_type005_3.png' alt='' /></td></tr><td style='background:url(/core/anyboard/common/images/imgBox/border_type005_4.png) repeat-y;'></td><td><div><ul><li>";
	this.imgBoxEnd[6] = "</li></ul></div></td><td style='background:url(/core/anyboard/common/images/imgBox/border_type005_5.png) repeat-y;'></td><tr><td width='16'><img src='/core/anyboard/common/images/imgBox/border_type005_6.png' alt='' /></td><td style='background:url(/core/anyboard/common/images/imgBox/border_type005_7.png) repeat-x;'></td><td width='16'><img src='/core/anyboard/common/images/imgBox/border_type005_8.png' alt='' /></td></tr></table></li></ul></div>";


	// 게시판 이미지 레이어창 초기화
	anyboardImgBox.prototype.init = function(objID, boxCode){
		obj = document.getElementById(objID);
		
		objHTML = obj.outerHTML;
		reHTML = this.imgBoxStart[boxCode]+objHTML+this.imgBoxEnd[boxCode];


		if((navigator.appName.indexOf('Microsoft')+1)){
			prObj = obj.parentElement;
		}else{
			prObj = document.getElementById("AB_viewContent");
		}
		prHTML = prObj.innerHTML;

		newHTML = prHTML.replace(objHTML, reHTML);
		prObj.innerHTML = newHTML;
	}	// end init function

}

//-->