function(){b.showTab(a.id);return false};if(a.icon!=="")c.style.backgroundImage="url("+a.icon+")";c.id="pulse-tab-link-"+a.id;c.name=a.name;c.style.cssText="height: 30px; padding: 0px 10px; line-height: 30px; display: inline-block; text-decoration: none; color: #ccc;";a.container.style.display="none";this.tabbarLinks[a.id]=c;this.tabbar.appendChild(c);this.tabholder.appendChild(a.container)},removeTab:function(a){