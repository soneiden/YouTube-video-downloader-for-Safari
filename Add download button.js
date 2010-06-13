var videoID = document.URL.substring(document.URL.search("v=")+2, document.URL.search("v=")+13);
var htmlSource = document.getElementsByTagName("html")[0].innerHTML;
var tLocation = htmlSource.search('"t":')+6;
var tValue = htmlSource.substring(tLocation, tLocation+44);
var baseVideoURL = "http://www.youtube.com/get_video?video_id=" + videoID + "&t=" + tValue + "&fmt=";

var listOfFormats = new Array();
listOfFormats["18"] = "Standard MP4";
listOfFormats["34"] = "Standard FLV";
listOfFormats["35"] = "Large FLV (480p)";
listOfFormats["22"] = "HD MP4 (720p)";
listOfFormats["37"] = "Full HD MP4 (1080p)";

var fmtMapLocation = htmlSource.search('fmt_map":');
var fmtMap = htmlSource.substring(fmtMapLocation+11).split('", ', 1)[0].split(",");
var downloadString = "Downloads: ";
for (var i = 0; i < fmtMap.length; i++) {
	var fmt = fmtMap[i].split("/")[0];
	if (fmt != "5") {
		downloadString += '<a href="' + baseVideoURL + fmt + '" title="Download as ' + listOfFormats[fmt] + ' by Option-clicking" name="video-download-link">' + listOfFormats[fmt] + "</a>, ";
	}
}
downloadString = downloadString.substring(0, downloadString.length-2);

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

var downloadDiv = document.createElement("div");
downloadDiv.id = "downloadDiv";
downloadDiv.style.display = "none";
downloadDiv.style.paddingBottom = "4px";
if (htmlSource.search("vevo") != -1) {
	downloadDiv.style.backgroundColor = "#FFFFFF";
	downloadDiv.style.marginBottom = "8px";
	downloadDiv.style.padding = "4px";
}
downloadDiv.innerHTML = '<p><strong>' + downloadString + '</strong></p>'
	+ "<p>Option-click on a link to download the video in that format.</p>";
document.getElementById("watch-headline").insertBefore(downloadDiv, document.getElementById("watch-headline-user-info"));

var downloadButton = document.createElement("button");
downloadButton.type = "button";
downloadButton.setAttribute("class", "yt-uix-button");
downloadButton.setAttribute("onclick", "displayDownloadLinks()");
downloadButton.id = "downloadVideoButton";
downloadButton.innerHTML = '<span class="yt-uix-button-content">Download Video</span>';
document.getElementById("watch-headline-user-info").appendChild(downloadButton);