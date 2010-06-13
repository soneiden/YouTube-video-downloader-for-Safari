var htmlSource = document.getElementsByTagName("html")[0].innerHTML;
if (document.URL.search("/user/") == -1) {
	var videoID = document.URL.substring(document.URL.search("v=")+2, document.URL.search("v=")+13);
	var tLocation = htmlSource.search('"t":')+6;
	var tValue = htmlSource.substring(tLocation, tLocation+44);
} else {
	var videoIDLoc = htmlSource.search('"video_id":');
	var videoID = htmlSource.substring(videoIDLoc).split('"')[3];
	var tLocation = htmlSource.search('"token":')+10;
	var tValue = htmlSource.substring(tLocation, tLocation+43) + "=";
}

var baseVideoURL = "http://www.youtube.com/get_video?video_id=" + videoID + "&t=" + tValue + "&fmt=";

var listOfFormats = new Array();
listOfFormats["18"] = "Standard MP4";
listOfFormats["34"] = "Standard FLV";
listOfFormats["35"] = "Large FLV (480p)";
listOfFormats["22"] = "HD MP4 (720p)";
listOfFormats["37"] = "Full HD MP4 (1080p)";

var fmtMapLocation = htmlSource.search('fmt_map":');
if (document.URL.search("/user/") == -1) {
	var fmtMap = htmlSource.substring(fmtMapLocation+11).split('", ', 1)[0].split(",");
} else {
	var fmtMap = htmlSource.substring(fmtMapLocation+11).split('", ', 1)[0].split("%2C");
}
var downloadString = "Downloads: ";
for (var i = 0; i < fmtMap.length; i++) {
	if (document.URL.search("/user/") != -1) {
		fmtMap[i] = fmtMap[i].replace("%2F", "/");
	}
	var fmt = fmtMap[i].split("/")[0];
	if (fmt != "5") {
		downloadString += '<a href="' + baseVideoURL + fmt + '" title="Download as ' + listOfFormats[fmt] + ' by Option-clicking" name="video-download-link">' + listOfFormats[fmt] + "</a>, ";
	}
}
downloadString = downloadString.substring(0, downloadString.length-2);

var downloadDiv = document.createElement("div");
downloadDiv.id = "downloadDiv";
downloadDiv.style.marginBottom = "4px";
if (htmlSource.search("vevo") != -1) {
	downloadDiv.style.backgroundColor = "#FFFFFF";
	downloadDiv.style.marginBottom = "8px";
	downloadDiv.style.padding = "4px";
}
if (document.URL.search("/user/") != -1) {
	downloadDiv.style.marginTop = "8px";
}
downloadDiv.innerHTML = '<p><strong>' + downloadString + '</strong> </p>'
	+ "<p>Option-click on a link to download the video in that format.</p>";
if (document.URL.search("/user/") == -1) {
	downloadDiv.style.display = "none";
	document.getElementById("watch-headline").insertBefore(downloadDiv, document.getElementById("watch-headline-user-info"));
} else {
	downloadDiv.style.display = "block";
	document.getElementById("user_playlist_navigator").insertBefore(downloadDiv, document.getElementById("playnav-body"));
}

if (document.URL.search("/user/") == -1) {
	var downloadFunction = document.createElement("script");
	downloadFunction.type = "application/x-javascript";
	downloadFunction.textContent = "function displayDownloadLinks () { "
		+ "var visibility = document.getElementById('downloadDiv').style.display;"
		+ "if (visibility == 'none') { "
			+ "document.getElementById('downloadDiv').style.display = 'block'; "
			+ "document.getElementById('downloadVideoButton').innerHTML = '<span class=\"yt-uix-button-content\">Hide Download Links</span>'; "
		+ "} else { "
			+ "document.getElementById('downloadDiv').style.display = 'none'; "
			+ "document.getElementById('downloadVideoButton').innerHTML = '<span class=\"yt-uix-button-content\">Download Video</span>'; "
		+ "} "
	+ "}";
	document.getElementsByTagName("head")[0].appendChild(downloadFunction);
	
	var downloadButton = document.createElement("button");
	downloadButton.type = "button";
	downloadButton.setAttribute("class", "yt-uix-button");
	downloadButton.setAttribute("onclick", "displayDownloadLinks()");
	downloadButton.id = "downloadVideoButton";
	downloadButton.innerHTML = '<span class="yt-uix-button-content">Download Video</span>';
	document.getElementById("watch-headline-user-info").appendChild(downloadButton);
}