//var vBridgePath = "http://localhost/bridge";

var vBridgePath = "http://" + location.href.split("/")[2] + "/bridge";

var picUrl = "./widgets/facebook_0.1/logo.png";



function startOAuth()
{
    $('#result').append("<h3>Step 1</h3>");
    
    var url = 'https://graph.facebook.com/oauth/device?type=device_code&client_id=150792241632891&scope=email,read_stream';
    
    // use bridge to call send the post command
    fXMLHttpRequest(vBridgePath,
		    "post",
		    {cmd : "GetUrl",
		     url : url},
		    function(vData) {
			var jsonDoc = $.xml2json(vData);
			var jsonDevice = jQuery.parseJSON(jsonDoc["data"]["value"]);
			$('#result').append("<b>code: </b>" + jsonDevice["code"] + "<br />");
			$('#result').append("<b>user_code: </b>" + jsonDevice["user_code"] + "<br />");
			$('#result').append("<b>verification_uri: </b>" + jsonDevice["verification_uri"] + "<br />");
			
			
			/*
			fXMLHttpRequest(vBridgePath, "post", {cmd : "ControlPanel", data : "<value>Javascript \"fWidgetMsg('Please go to http://www.facebook.com/device to enter the following code.<p>" + jsonDevice["user_code"] + "')\"</value>"}, function(vData) {
				console.log("-----------------------------")
				console.log(vData)
				console.log("-----------------------------")
			});
			*/
			//~ fXMLHttpRequest(vBridgePath, "post", {cmd : "TickerEvent", data : "<message>" + "Please go to http://www.facebook.com/device to enter the following code.<p>" + jsonDevice["user_code"] +  "</message>"+ "<image>"+picUrl+"</image>" + "<type>foroauth</type>"}, function(vData) {
			fXMLHttpRequest(vBridgePath, "post", {cmd : "TickerEvent", data : "<message>" + "Please go to http://www.facebook.com/device to enter the following code. " + jsonDevice["user_code"] + "</message><type>foroauth</type>"}, function(vData) {
				
			});
			
			waitingOAuth(jsonDevice["code"]);
		    });
    
}


function waitingOAuth(code)
{
    $('#result').append("<h3>Step 2</h3>");

    var url = "https://graph.facebook.com/oauth/device?type=device_token&client_id=150792241632891&code=" + code;

    // use bridge to call send the post command
    fXMLHttpRequest(vBridgePath,
		    "post",
		    {cmd : "GetUrl",
		     url : url},
		    function(vData) {
			processOAuthData(vData, url);
		    });
    
}



function processOAuthData(vData, url) 
{
    var jsonDoc = $.xml2json(vData);
    console.log(JSON.stringify(jsonDoc));
    var jsonAuth = jQuery.parseJSON(jsonDoc["data"]["value"]);
    //console.log(JSON.stringify(jsonAuth));
    
    if (!jsonAuth["error"])
    {
	var access_token = jsonAuth["access_token"];
	$('result').append("<b>Access Token: </b>" + access_token + "<br />");
	saveAccessToken(access_token);
		fXMLHttpRequest(vBridgePath, "post", {cmd : "TickerEvent", data : "<message>Authentication is successful!</message><type>foroauth</type>"}, function(vData) {
			
		});
    } else {
	console.log(typeof jsonAuth["error"]);
	errMsg = jsonAuth["error"]["message"];
	$('#result').append("<b>Auth Message: </b>" + errMsg + "<br />");
	setTimeout(OAuthGain(url), 5000);
    }
}


function OAuthGain(url)
{
    fXMLHttpRequest(vBridgePath,
		    "post",
		    {cmd : "GetUrl",
		     url : url},
		    function(vData) {
			processOAuthData(vData, url);
		    });
}




function saveAccessToken(access_token)
{
    fXMLHttpRequest(vBridgePath,
		    "post",
		    {cmd : "SetParam",
		     data : "<facebook_access_token>"+access_token+"</facebook_access_token>"},
		    function(vData) {
			var jsonDoc = $.xml2json(vData);
			console.log(JSON.stringify(jsonDoc));
			$('#result').append("<b>Access Token Saved: </b>" + JSON.stringify(jsonDoc) + "<br />");
			getAccessTokenOAuthTrue();
		    });
}

