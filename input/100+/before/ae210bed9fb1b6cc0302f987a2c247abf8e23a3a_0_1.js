function contextMenuHandler(event) {
  var nodeName = event.target.nodeName,
      menuToResponse = new Array();

  if (event.target.parentElement.nodeName === 'A') {
    menuToResponse.push({type: 'link', src: event.target.parentElement.href});
  }
  switch (nodeName) {
    case 'A':
      menuToResponse.push({type: 'link', src: event.target.href});
      break;
    case 'IMG':
      menuToResponse.push({type: 'image', src: event.target.src});
      break;
    default:
      break;
  }
  
  console.log(menuToResponse);
  safari.self.tab.setContextMenuEventUserInfo(event, menuToResponse);
}