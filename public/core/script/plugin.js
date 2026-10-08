<!--

// flash(파일주소, 가로, 세로, 배경색, 윈도우모드, 변수, 경로)
function flashPlugIn(url,w,h,bg,win,vars,base){
	var s=
	"<object classid='clsid:d27cdb6e-ae6d-11cf-96b8-444553540000' codebase='http://fpdownload.macromedia.com/pub/shockwave/cabs/flash/swflash.cab#version=8,0,0,0' width='"+w+"' height='"+h+"' align='middle'>"+
	"<param name='allowScriptAccess' value='always' />"+
	"<param name='movie' value='"+url+"' />"+
	"<param name='wmode' value='"+win+"' />"+
	"<param name='menu' value='false' />"+
	"<param name='quality' value='high' />"+
	"<param name='FlashVars' value='"+vars+"' />"+
	"<param name='bgcolor' value='"+bg+"' />"+
	"<param name='base' value='"+base+"' />"+
	"<embed src='"+url+"' base='"+base+"' wmode='"+win+"' menu='false' quality='high' bgcolor='"+bg+"' width='"+w+"' height='"+h+"' align='middle' type='application/x-shockwave-flash' pluginspage='http://www.macromedia.com/go/getflashplayer' />"+
	"</object>";
	document.write(s);
}

// flash2(파일주소, 가로, 세로, 변수, 경로)
function flashPlugIn2(swf, width, height, flashvars, base)
{
	var strFlashTag = new String();
	if (navigator.appName.indexOf("Microsoft") != -1)
	{
		strFlashTag += '<object classid="clsid:D27CDB6E-AE6D-11cf-96B8-444553540000" ';
		strFlashTag += 'codebase="http://download.macromedia.com/pub/shockwave/cabs/flash/swflash.cab#version=version=8,0,0,0" ';
		strFlashTag += 'width="' + width + '" height="' + height + '">';
		strFlashTag += '<param name="movie" value="' + swf + '"/>';
		strFlashTag += '<param name="flashvars" value="' + flashvars + '"/>';
		strFlashTag += '<param name="base" value="' + base + '"/>';
		strFlashTag += '<param name="quality" value="best"/>';
		strFlashTag += '<param name="menu" value="false"/>';
		strFlashTag += '<param name="salign" value="LT"/>';
		strFlashTag += '<param name="scale" value="noscale"/>';
		strFlashTag += '<param name="wmode" value="transparent"/>';
		strFlashTag += '<param name="allowScriptAccess" value="always"/>';
		strFlashTag += '</object>';
	}
	else
	{
		strFlashTag += '<embed src="' + swf + '" ';
		strFlashTag += 'quality="best" ';
		strFlashTag += 'width="' + width + '" ';
		strFlashTag += 'height="' + height + '" ';
		strFlashTag += 'base="' + base + '" ';
		strFlashTag += 'menu="false" ';
		strFlashTag += 'scale="noscale" ';
		strFlashTag += 'salign="LT" ';
		strFlashTag += 'wmode="transparent" ';
		strFlashTag += 'allowScriptAccess="always" ';
		if(flashvars != null) {strFlashTag += 'flashvars="' + flashvars + '" '};
		strFlashTag += 'type="application/x-shockwave-flash" ';
		strFlashTag += 'pluginspage="http://www.macromedia.com/go/getflashplayer">';
		strFlashTag += '</embed>';
	}
	document.write(strFlashTag);
}


// IE6 png오류 수정
function setPng24(obj) { 
    obj.width=obj.height=1; 
    obj.className=obj.className.replace(/\bpng24\b/i,''); 
    obj.style.filter = 
    "progid:DXImageTransform.Microsoft.AlphaImageLoader(src='"+ obj.src +"',sizingMethod='image');" 
    obj.src='';  
    return ''; 
}

//-->