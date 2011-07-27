{
        "translatorID": "04d763aa-5595-43d5-9010-2114a52910ec",
        "label": "Email",
        "creator": "Avram Lyon",
        "target": "null",
        "minVersion": "2.0",
        "maxVersion": "",
        "priority": 100,
        "configOptions": {
                "getCollections": "false",
                "dataMode": "line"
        },
        "inRepository": true,
        "translatorType": 5,
        "lastUpdated": "2011-05-28 00:30:35"
}

function doImport() {
	var out = readMail();
	if (!out) return false;
	
	var headers = out[0];
	var content = out[1];
	
	// bare minimum
	if (headers["date"] && headers["from"] && headers["subject"]) {
		var item = new Zotero.Item("email");
		item.date = headers["date"];
		// we may need to decode here...
		item.subject = headers["subject"];
		item.creators.push({lastName:headers["from"], fieldMode:1, type: "author"});
		item.creators.push({lastName:headers["to"], fieldMode:1, type: "recipient"});
		item.complete();
	} else {
		return false;
	}
}

function detectImport() {
	var out = readMail();
	if (!out) return false;
	
	var headers = out[0];
	var content = out[1];
	
	// bare minimum
	if (headers["date"] && headers["from"] && headers["subject"]) {
		return true;
	} else {
		return false;
	}
}

function readMail() {
	var line;
	var text = "";
	var header = false;
	var data = "";
	var headers = {};
	var hedx = /^([A-Za-z0-9-]+):(.*)$/;

	var content = "";

	while((line = Zotero.read().trim()) == "") {
		continue;
	}
	
	var headmatch = line.match(hedx);
	if (!headmatch) {
		// The first non-blank line should be a header
		return false;
	}
	
	header = headmatch[1].toLowerCase();
	data = headmatch[2];

	// We intentionally stop with first blank line-- that's the end of the headers
	while(line = Zotero.read()) {
		headmatch = line.match(hedx);
		if (headmatch) {
			//Zotero.debug(header + " => " + data);
			headers[header] = data;
			data = headmatch[2];
			header = headmatch[1].toLowerCase();
		} else {
			data += line;
		}
	}
	
	// the remainder is content, at least for now
	while(line = Zotero.read()) {
		content += line;
	}
	
	return [headers, content];
}