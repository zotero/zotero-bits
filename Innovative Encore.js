{"translatorID":"f139d8e0-43a1-11df-9879-0800200c9a66","label":"Innovative Encore","creator":"Avram Lyon","target":"/iii/encore/(record|search)","minVersion":"2.0","maxVersion":"","priority":100,"inRepository":"1","translatorType":4,"lastUpdated":"2010-04-12 01:23:21"}

function detectWeb(doc, url){
	var n = doc.documentElement.namespaceURI;
	var ns = n ? function(prefix) {
		if (prefix == 'x') return n; else return null;
	} : null;
	
	if (url.match(/\/search\//)) {
		var results = doc.evaluate('//table[@class="browseResult" or @class="browseBibTable"]//div[@class="dpBibTitle"]', doc, ns, XPathResult.ANY_TYPE, null);
		var result = results.iterateNext();
		if (result === null)
			return false;
		if (results.iterateNext() !== null)
			return "multiple";
		// Now the one result case:
		// TODO: Determine item type. For now, assume book.
		return "book";	
	} else if (url.match(/\/record\//)){
		return "book";
	}
}

function doWeb(doc, url){
	var n = doc.documentElement.namespaceURI;
	var ns = n ? function(prefix) {
		if (prefix == 'x') return n; else return null;
	} : null;
	
	var articles = new Array();
	if (url.match(/\/search\//)) {
		Zotero.debug("Search URL: "+url);
		var results = doc.evaluate('//table[@class="browseResult" or @class="browseBibTable"]//tr', doc, ns, XPathResult.ANY_TYPE, null);
		var items = new Array();
		var result;
		while (result = results.iterateNext()) {
			var link = doc.evaluate('.//div[@class="dpBibTitle"]/a', result, ns, XPathResult.ANY_TYPE, null).iterateNext();
			if (link !== null) {
				var title = Zotero.Utilities.trimInternal(link.textContent);
				//Zotero.debug("Found: " + title + link.href);
				items[link.href] = title;
			}
		}
		items = Zotero.selectItems(items);
		if (!items) return true;
		for (var i in items) {
			articles.push(i);
		}
	} else {
		articles = [url];
	}

	if (articles.length === 0) return false;

	// Now we tweak the URLs to make MARC requests.
	for (var i = 0; i < articles.length; i++) {
		Zotero.debug(articles[i]);
		articles[i] = articles[i].replace(/(\|R[^|]*|%7CR[^%]*).*/,"$1?marcData=Y");
		Zotero.debug(articles[i]);
	}

	Zotero.Utilities.HTTP.doGet(articles, function(text) {
		Zotero.debug("Running MARC...");

		var translator = Zotero.loadTranslator("import");
		translator.setTranslator("a6ee60df-1ddc-4aae-bb25-45e0537be973");
		var marc = translator.getTranslatorObject();

		// and you can create a new MARC record, add fields to it, and convert it
		// into an item, with something like:

		var record = new marc.record();
		record.leader = "00000cam  2200000 a 4500";
		// First split by line:
		lines = text.split("\n");
		for (var i = 0; i < lines.length; i++) {
			if (lines[i].substr(0,3) != "   " && lines[i].substr(0,3) !== "LEA") {
				Zotero.debug(lines[i]);
				var j = i;
				while(++j < lines.length && lines[j].substr(0,3) == "   ") {
					lines[i] += lines[j].replace(/^ */, " ");
					Zotero.debug(lines[i]);
				}
				
				record.addField(lines[i].substr(0,3), lines[i].substr(4,2),
						lines[i].substr(7).replace("|",
							marc.subfieldDelimiter, "g"));
			}
		}
		var newItem = new Zotero.Item();
		record.translate(newItem);
		var domain = url.match(/https?:\/\/([^/]+)/);
		newItem.libraryCatalog = domain[1]+" Library Catalog";
		newItem.complete();
		
		Zotero.done();
	})
	Zotero.wait();
}
