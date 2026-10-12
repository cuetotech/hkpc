/* Static capture navigation: no legacy /core/xml/menu.xml.html dependency. */
(function () {
  "use strict";
  var sections = [
    { name:"교회소개", links:[["인사말","/main/sub__pageCode-1.html"],["섬기는사람들","/main/sub__pageCode-3.html"],["예배 및 모임","/main/sub__pageCode-4.html"],["오시는길","/main/sub__pageCode-5.html"]] },
    { name:"말씀", links:[["예배설교","/main/sub__pageCode-6.html"]] },
    { name:"교회소식", links:[["교회소식","/main/sub__pageCode-13.html"],["교회앨범","/main/sub__pageCode-15.html"],["자료실","/main/sub__pageCode-17.html"]] }
  ];
  function a(label,href){ var node=document.createElement("a");node.textContent=label;node.href=href;return node; }
  function init(){
    /* Stop captured legacy scripts retrying forever against a missing menu XML. */
    if(window.menu){
      window.menu.createMobileFullMenu=function(){};
      window.menu.createTabletMenu=function(){};
      window.menu.siteMapOpen=function(){if(window.hkpcOpenMenu)window.hkpcOpenMenu();};
      window.menu.siteMapClose=function(){if(window.hkpcCloseMenu)window.hkpcCloseMenu();};
    }
    /* Legacy capture lacks the menu XML; replace its empty 980px desktop menu. */
    var desktop=document.getElementById("mainMenu");
    if(desktop){
      desktop.classList.add("hkpc-desktop-nav");
      desktop.replaceChildren();
      var ul=document.createElement("ul");
      sections.forEach(function(section){
        var li=document.createElement("li");
        li.appendChild(a(section.name,section.links[0][1]));
        var sub=document.createElement("ul");sub.className="hkpc-subnav";
        section.links.forEach(function(link){var item=document.createElement("li");item.appendChild(a(link[0],link[1]));sub.appendChild(item);});
        li.appendChild(sub);ul.appendChild(li);
      });desktop.appendChild(ul);
    }
    var mobile=document.getElementById("moFullMenu");
    if(mobile){
      mobile.replaceChildren();
      sections.forEach(function(section,i){
        var li=document.createElement("li");li.className="w100 menuOff";
        var button=document.createElement("button");button.type="button";button.textContent=section.name;button.setAttribute("aria-expanded","false");
        var id="hkpc-mobile-section-"+i;
        button.setAttribute("aria-controls",id);
        var sub=document.createElement("ul");sub.id=id;sub.hidden=true;
        section.links.forEach(function(link){var item=document.createElement("li");item.appendChild(a(link[0],link[1]));sub.appendChild(item);});
        button.addEventListener("click",function(){var open=button.getAttribute("aria-expanded")==="true";button.setAttribute("aria-expanded",String(!open));sub.hidden=open;li.className=open?"w100 menuOff":"w100 menuOn";});
        li.appendChild(button);li.appendChild(sub);mobile.appendChild(li);
      });
      var panel=document.getElementById("mobileSiteMap");
      var close=panel&&panel.querySelector(".allmenuclose");
      function dismiss(){if(panel){panel.style.display="none";document.body.style.overflowY="auto";document.body.style.overflow="";}}
      if(close){
        var closeButton=document.createElement("button");
        closeButton.type="button";closeButton.setAttribute("aria-label","메뉴 닫기");closeButton.className="hkpc-close-menu";
        closeButton.textContent="×";close.replaceWith(closeButton);
        closeButton.addEventListener("click",dismiss);
      }
      if(panel){
        panel.addEventListener("click",function(event){if(event.target===panel)dismiss();});
        document.addEventListener("keydown",function(event){if(event.key==="Escape"&&panel.style.display!=="none")dismiss();});
      }
      window.hkpcCloseMenu=dismiss;
      window.hkpcOpenMenu=function(){if(panel){panel.style.display="block";document.body.style.overflowY="hidden";var first=panel.querySelector("button");if(first)first.focus();}};
      var openers=document.querySelectorAll(".tableTopmenu .sitemap a, .hntopMenu a[href*='siteMapOpen']");
      openers.forEach(function(opener){opener.setAttribute("href","#mobileSiteMap");opener.setAttribute("aria-label","전체메뉴 열기");opener.addEventListener("click",function(event){event.preventDefault();window.hkpcOpenMenu();});});
    }
    /* Override missing relative legacy stylesheets for every captured route. */
    if(window.responsiveStyle && typeof window.responsiveStyle.cssLoad==="function"){
      var inner=!!document.querySelector(".cwrap");
      var dir="/core/design/responsive019/css/";
      window.responsiveStyle.cssFile=[dir+(inner?"s_mobile.css":"mobile.css"),dir+(inner?"s_tablet.css":"tablet.css"),dir+(inner?"s_pc.css":"pc.css")];
      window.responsiveStyle.lastCss=null;
      window.responsiveStyle.cssLoad();
    }
  }
  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",init,{once:true});else init();
}());
