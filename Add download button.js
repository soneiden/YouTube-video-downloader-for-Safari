Array.prototype.indexOf = function (variable) {
	for (i = 0; i < this.length; i++) {
		if (this[i] == variable) return i;
	}
	return -1;
}
Array.prototype.contains = function (variable) {
	if (this.indexOf(variable) == -1) {
		return false;
	} else {
		return true;
	}
}
function formatMapSorter (a, b) {
	return formatDescriptions[a][0] - formatDescriptions[b][0];
}
function formatSorterHTMLFive (a, b) {
	return formatDescriptions[a[3]][0] - formatDescriptions[b[3]][0];
}
// get the HTML source of the video page for later use
var htmlSource = document.getElementsByTagName("html")[0].innerHTML;
// determine if the page is a channel/user page
var isChannel = false;
if (document.URL.search("/user/") != -1) isChannel = true;
// determine if page is using HTML 5 beta
var htmlFive = false;
if (htmlSource.search("html5-player") != -1) htmlFive = true;
// set array of format descriptions
var formatDescriptions = new Array();
formatDescriptions["5"] = [8, "Low quality FLV"];
formatDescriptions["43"] = [7, "Standard WebM"];
formatDescriptions["18"] = [6, "Standard MP4"];
formatDescriptions["34"] = [5, "Standard FLV"];
formatDescriptions["35"] = [4, "Large FLV (480p)"];
formatDescriptions["45"] = [3, "HD WebM (720p)"];
formatDescriptions["22"] = [2, "HD MP4 (720p)"];
formatDescriptions["37"] = [1, "Full HD MP4 (1080p)"];

// Assemble the base URL
if (!isChannel) {
	// get video ID
	var videoID = document.URL.substring(document.URL.search("v=")+2, document.URL.search("v=")+13);
	if (!htmlFive) {
		// get token
		var tokenIndex = htmlSource.search('"t":')+6;
		var token = htmlSource.substring(tokenIndex, tokenIndex+44);
	} else {
		// isolate the HTML5 player script and get its source
		var scripts = document.getElementsByTagName("script");
		var scriptSource = scripts[scripts.length - 4].innerHTML;
		// find where format function is, split into parts
		var formats = scriptSource.split('videoPlayer.setAvailableFormat("');
		// remove first piece, doesn't relate to formats
		formats.splice(0, 1);
		if (formats.length > 1) {
			var downloadString = "Downloads: ";
		} else {
			var downloadString = "Download: ";
		}
		// clean up formats
		for (var i = 0; i < formats.length; i++) {
			formats[i] = formats[i].split('");')[0];
			formats[i] = formats[i].split('", "');
		}
		// sort them
		formats.sort(formatSorterHTMLFive);
		// add them to the download string
		for (var i = 0; i < formats.length; i++) {
			var videoURL = formats[i][0];
			if (formats[i][3] in formatDescriptions) {
				var formatDescription = formatDescriptions[formats[i][3]][1];
			} else {
				var formatDescription = "Unknown format";
			}
			downloadString += '<a href="' + videoURL + '" title="Download as ' + formatDescription + ' by Option-clicking">' + formatDescription + '</a>, ';
		}
		downloadString = downloadString.substring(0, downloadString.length-2);
	}
	// defines the displayDownloadLinks() function
	var downloadFunction = document.createElement("script");
	downloadFunction.type = "application/x-javascript";
	downloadFunction.textContent = "function displayDownloadLinks () { "
		+ "var divVisibility = document.getElementById('downloadDiv').style.display;"
		+ "if (divVisibility == 'none') { "
			+ "document.getElementById('downloadDiv').style.display = 'block'; "
			+ "document.getElementById('downloadVideoButton').innerHTML = '<span class=\"yt-uix-button-content\">Hide Download Links</span>'; "
		+ "} else { "
			+ "document.getElementById('downloadDiv').style.display = 'none'; "
			+ "document.getElementById('downloadVideoButton').innerHTML = '<span class=\"yt-uix-button-content\">Download Video</span>'; "
		+ "} "
	+ "}";
	document.getElementsByTagName("head")[0].appendChild(downloadFunction);
	// create the Download button
	var downloadButton = document.createElement("button");
	downloadButton.type = "button";
	downloadButton.setAttribute("class", "yt-uix-button");
	downloadButton.setAttribute("onclick", "displayDownloadLinks()");
	downloadButton.id = "downloadVideoButton";
	downloadButton.innerHTML = '<span class="yt-uix-button-content">Download Video</span>';
	document.getElementById("watch-headline-user-info").appendChild(downloadButton);
} else {
	// on channel pages, get videoID and token of primary video
	var videoIDIndex = htmlSource.search('"video_id":');
	var videoID = htmlSource.substring(videoIDIndex).split('"', 4)[3];
	var tokenIndex = htmlSource.search('"token":')+10;
	var token = htmlSource.substring(tokenIndex, tokenIndex+43) + "=";
}
if (!htmlFive) {
	var baseVideoURL = "http://www.youtube.com/get_video?video_id=" + videoID + "&t=" + token + "&fmt=";
	// get the supported formats of video, split it into an array
	var formatMapIndex = htmlSource.search('"fmt_map":')+12;
	if (!isChannel) {
		var formatMap = htmlSource.substring(formatMapIndex).split('", ', 1)[0].split(",");
	} else {
		var formatMap = htmlSource.substring(formatMapIndex).split('", ', 1)[0].split("%2C");
	}
	// clean up the formatMap array
	for (var i = 0; i < formatMap.length; i++) {
		if (isChannel) formatMap[i] = formatMap[i].replace("%2F", "/");
		formatMap[i] = formatMap[i].split("/", 1)[0];
	}
	// assume that if Standard FLV is supported, so is Standard MP4
	if (formatMap.contains("34") && !formatMap.contains("18")) formatMap.push("18");
	formatMap.sort(formatMapSorter);
	// low quality FLV could also be removed here:
	// formatMap.splice(formatMap.indexOf("5"), 1);
	// create a string of links to the downloads
	if (formatMap.length > 1) {
		var downloadString = "Downloads: ";
	} else {
		var downloadString = "Download: ";
	}
	for (var i = 0; i < formatMap.length; i++) {
		if (formatMap[i] in formatDescriptions) {
			fmtDescription = formatDescriptions[formatMap[i]][1];
		} else {
			// for slight forward compatibility, cleans up an undefined format
			fmtDescription = "Unknown format";
		}
		downloadString += '<a href="' + baseVideoURL + formatMap[i] + '" title="Download as ' + fmtDescription + ' by Option-clicking">' + fmtDescription + "</a>, ";
	}
	downloadString = downloadString.substring(0, downloadString.length-2);
}
// adds the links and some instructions to a DIV, adds the DIV to the YouTube page
var downloadDiv = document.createElement("div");
downloadDiv.id = "downloadDiv";
downloadDiv.innerHTML = '<p><strong>' + downloadString + '</strong> </p>'
	+ "<p>Option-click on a link to download the video in that format.</p>";
downloadDiv.style.marginBottom = "4px";
// if it's Vevo, give it a white background so it's more visible
if (htmlSource.search("vevo") != -1) {
	downloadDiv.style.backgroundColor = "#FFFFFF";
	downloadDiv.style.marginBottom = "8px";
	downloadDiv.style.padding = "4px";
}
if (!isChannel) {
	downloadDiv.style.display = "none";
	document.getElementById("watch-headline").insertBefore(downloadDiv, document.getElementById("watch-headline-user-info"));
} else {
	downloadDiv.style.marginTop = "8px";
	downloadDiv.style.display = "block";
	document.getElementById("user_playlist_navigator").insertBefore(downloadDiv, document.getElementById("playnav-body"));
}