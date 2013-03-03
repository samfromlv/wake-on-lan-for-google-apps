function doGet(e) {
  var app = UiApp.createApplication();
  app.add(app.loadComponent("MyGui"));
  return app;
  var mac = getMac();
  buildMenuForm(app, mac);
  buildRegisterForm(app, mac);
  return app;
}

function getMac()
{
  var currentUser = Session.getActiveUser();
  return ScriptProperties.getProperty(currentUser.getUserLoginId());
}

function buildMenuForm(app, mac)
{
  var menuForm = app.createVerticalPanel().setId('menuForm').setVisible(mac != null);
  
  var wakeHandler = app.createServerClickHandler('wakePc');
  menuForm.add(app.createButton('Wake my PC', wakeHandler));
  
  var editMacHandler = app.createServerClickHandler('editMac');
  menuForm.add(app.createButton('Edit my PC details', editMacHandler));
  menuForm.add(app.createLabel().setId("wakeResultLabel").setVisible(false));
  app.add(menuForm);
}

function buildRegisterForm(app, mac)
{
  var registerForm = app.createVerticalPanel().setId('registerForm').setVisible(mac == null);
  registerForm.add(app.createLabel('Please enter your PC MAC Address (e.g 11-22-33-44-55-66)'));
  
  var macText = "";
  if (mac != null)
  {
    macText = mac;
  }
  
  var macTextBox = app.createTextBox().setName('macTextBox').setId('macTextBox').setText(macText);
  registerForm.add(macTextBox);
  
  var buttonPanel = app.createHorizontalPanel();
  
  var saveMacHandler = app.createServerClickHandler('saveMac');
  saveMacHandler.addCallbackElement(registerForm);
  buttonPanel.add(app.createButton('Save', saveMacHandler));
  
  var cancelEditHandler = app.createServerClickHandler('cancelEdit');
  buttonPanel.add(app.createButton('Cancel', cancelEditHandler).setId('cancelEditButton').setVisible(mac != null));
  
  registerForm.add(buttonPanel);
  
  registerForm.add(app.createLabel('Mac has incorrect format').setStyleAttribute('color', '#f00').setId('statusLabel').setVisible(false));
  app.add(registerForm);
}


function saveMac(e)
{
  var app = UiApp.getActiveApplication();
  var mac = e.parameter.macTextBox;
  var regex = new RegExp("^([0-9a-fA-F][0-9a-fA-F]-){5}([0-9a-fA-F][0-9a-fA-F])$",'i');
  if (regex.test(mac))
  {
    var currentUser = Session.getActiveUser();
    ScriptProperties.setProperty(currentUser.getUserLoginId(), mac.toUpperCase());
    goToMenu(app);
  }
  else
  {
    app.getElementById('statusLabel').setVisible(true);
  }
  return app;
}

function goToMenu(app)
{
    app.getElementById('registerForm').setVisible(false);
    app.getElementById('menuForm').setVisible(true);
}

function goToEdit(app)
{
    resetEditForm(app);
    app.getElementById('registerForm').setVisible(true);
    app.getElementById('menuForm').setVisible(false);
}

function resetEditForm(app)
{
   var mac = getMac();
   app.getElementById('macTextBox').setText(mac);
   app.getElementById('statusLabel').setVisible(false);
   app.getElementById('cancelEditButton').setVisible(mac != "");
}

function wakePc()
{
  var app = UiApp.getActiveApplication();
  
  var requestRes = sendWakeRequest(getMac());
  app.getElementById('wakeResultLabel').setVisible(true).setText(requestRes);
  
  return app;
}

function sendWakeRequest(mac)
{
   var url = ScriptProperties.getProperty('service_address');
  
   var options = 
       {
         "method": "post",
         "payload": getWakePayload(mac)
       };

  var result = UrlFetchApp.fetch(url, options);
  var resString = "";
  var rCode = result.getResponseCode();
  if (rCode == 200)
  {
     resString = result.getContentText();
  }
  else
  {
     resString = rCode.toString();
  }
  return resString;
}


function getWakePayload(mac)
{
   var secret = ScriptProperties.getProperty("service_secret");
   var nonce = Math.floor(Math.random()*1000000000);
   var timestamp =  (new Date().getTime());
   var dataForHash = mac+nonce.toString()+timestamp.toString();
   var token = Utilities.base64Encode(Utilities.computeHmacSha256Signature(dataForHash, secret));
       
   var body = "mac=" + urlEncode(mac)
       + "&nonce="+urlEncode(nonce)
       + "&timestamp="+urlEncode(timestamp)
       + "&token="+urlEncode(token);
  
  return body;
}

function urlEncode( s )
{
    return encodeURIComponent( s ).replace( /\%20/g, '+' ).replace( /!/g, '%21' ).replace( /'/g, '%27' ).replace( /\(/g, '%28' ).replace( /\)/g, '%29' ).replace( /\*/g, '%2A' ).replace( /\~/g, '%7E' );
}
   


function editMac()
{
  var app = UiApp.getActiveApplication();
  goToEdit(app);
  return app;
}

function cancelEdit()
{
  var app = UiApp.getActiveApplication();
  goToMenu(app);
  return app;
}


