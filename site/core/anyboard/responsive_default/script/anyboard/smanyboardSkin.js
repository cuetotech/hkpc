/*sns내보내기
function sns_view(){
 if(cnt){
  document.getElementById("snsBtn").style.display="block";
  document.getElementById("snsBtn").style.display="none";
 }else{
  document.getElementById("snsBtn").style.display="hidden";
 }
  
}*/

sns_view = function(){
		if(document.getElementById("snsBtn").style.display == "block"){
			document.getElementById("snsBtn").style.display = "none";
			document.getElementById("AB_viewIconSNS").src = "/core/anyboard/responsive_default/images/bul_arrow_right.png";
		}else{
			document.getElementById("snsBtn").style.display = "block";
			document.getElementById("AB_viewIconSNS").src = "/core/anyboard/responsive_default/images/bul_arrow_left.png";
		}
	}	

/*추천,인쇄 등등*/
tobe_view = function(){
		if(document.getElementById("tobeBtn").style.display == "block"){
			document.getElementById("tobeBtn").style.display = "none";
		}else{
			document.getElementById("tobeBtn").style.display = "block";
		}
	}	

/*첨부파일다운*/ 
addfile_view = function(){
		if(document.getElementById("addfile_Down").style.display == "block"){
			document.getElementById("addfile_Down").style.display = "none";
			document.getElementById("AB_viewIconFileList").src = "/core/anyboard/responsive_default/images/bul_arrow_down.png";
		}else{
			document.getElementById("addfile_Down").style.display = "block";
			document.getElementById("AB_viewIconFileList").src = "/core/anyboard/responsive_default/images/bul_arrow_up.png";
		}
	}	
/*리스트첨부파일다운*/ 
addfile_view01 = function(){
		if(document.getElementById("addfile_Down01").style.display == "block"){
			document.getElementById("addfile_Down01").style.display = "none";
		}else{
			document.getElementById("addfile_Down01").style.display = "block";
			document.getElementById("addfile_Down02").style.display = "none";
		}
	}	
/*리스트첨부파일다운02*/ 
addfile_view02 = function(){
		if(document.getElementById("addfile_Down02").style.display == "block"){
			document.getElementById("addfile_Down02").style.display = "none";
		}else{
			document.getElementById("addfile_Down02").style.display = "block";
			document.getElementById("addfile_Down01").style.display = "none";
		}
	}	


/*게시물 코맨트_답글*/
comment_write01 = function(){
		if(document.getElementById("replyComment01").style.display == "block"){
			document.getElementById("replyComment01").style.display = "none";
		}else{
			document.getElementById("replyComment01").style.display = "block";
		}
	}	

/*게시물 답글수정*/
comment_Modify01 = function(){
		if(document.getElementById("replyModify01").style.display == "block"){
			document.getElementById("replyModify01").style.display = "none";
		}else{
			document.getElementById("replyModify01").style.display = "block";
		}
	}	
	
