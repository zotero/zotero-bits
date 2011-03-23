{
        "translatorID":"312bbb0e-bfb6-4563-a33c-085445d391ed",
        "label":"DIE ZEIT",
        "creator":"Martin Meyerhoff",
        "target":"^http://www.zeit.de/",
        "minVersion":"1.0",
        "maxVersion":"",
        "priority":100,
        "inRepository":"1",
        "translatorType":4,
        "lastUpdated":"2011-03-17 19:37:59"
}

// Copyleft: This is GPL Code. 

// Diese Funktion bestimmt, ob gesucht wird, und wenn ja, was
function detectWeb(doc, url) {

	// I use XPaths. Therefore, I need the following block.
	
	var namespace = doc.documentElement.namespaceURI;
	var nsResolver = namespace ? function(prefix) {
		if (prefix == 'x') return namespace; else return null;
	} : null;
	
	var Zeit_ArticleTools_XPath = ".//*[@id='informatives']/ul[@class='tools']/li";
	var product_XPath = '//meta[contains(@name, "zeit::product-name")]'
	
	// Testet, ob der XPath oben was drin hat (also ob "Artikel-Tools" vorhanden sind)
	
	if (doc.evaluate(Zeit_ArticleTools_XPath, doc, null, XPathResult.ANY_TYPE, null).iterateNext() && 
		doc.evaluate(product_XPath, doc, null, XPathResult.ANY_TYPE, null).iterateNext() ){ // Diese Zeile verhindert die aus dem Tagesspiegel übernommenen Artikel!
		Zotero.debug("newspaperArticle");
		return "newspaperArticle";
	} 
}
function scrape(doc, url) {
	var namespace = doc.documentElement.namespaceURI;
	var nsResolver = namespace ? function(prefix) {
		if (prefix == 'x') return namespace; else return null;
	} : null;
	
	var newItem = new Zotero.Item("newspaperArticle");
	newItem.url = doc.location.href; 

	
	// This is for the title!
	
	var title_XPath = '//meta[contains(@name, "DC.title")]'
	var title = doc.evaluate(title_XPath, doc, nsResolver, XPathResult.ANY_TYPE, null).iterateNext().content;
	newItem.title = title.split("|")[0];
	
	
	// Now for the Author

	var author_XPath = '//li[contains(@class, "author first")]'; // I can't get the span selection to work. Help is appreciated.
	if (doc.evaluate(author_XPath, doc, null, XPathResult.ANY_TYPE, null).iterateNext()) {
		var author  = doc.evaluate(author_XPath, doc, nsResolver, XPathResult.ANY_TYPE, null).iterateNext().textContent;
		author = author.replace(/^\s*Von\s|\s*$/g, ''); // remove whitespace around the author and the "Von "at the beginning
	} else {
		var author = "Die Zeit";
	}
	var author = author.split(" | "); // this seems to work even if there's no |
	for (var i in author) {
				newItem.creators.push(Zotero.Utilities.cleanAuthor(author[i], "author"));
	}
	
	// Now for the Tags

	var tags_XPath = '//li[contains(@class, "tags")]'; // I can't get the span selection to work. Help is appreciated.
	if (doc.evaluate(tags_XPath, doc, null, XPathResult.ANY_TYPE, null).iterateNext()) {
		var tags = doc.evaluate(tags_XPath, doc, nsResolver, XPathResult.ANY_TYPE, null).iterateNext().textContent;
		tags = tags.replace(/^\s*Schlagworte\s|\s*$/g, ''); // remove whitespace around the author and the "Von "at the beginning
	} else {
		var tags = "";
	}
	var tags= tags.split("|"); // this seems to work even if there's no |
	for (var i in tags) {
		tags[i] = tags[i].replace(/^\s*|\s*$/g, '') // remove whitespace around the tags
		newItem.tags.push(tags[i]);
	} 
	
	// Date
	var date_XPath = '//meta[contains(@name, "date_first_released")]'
	var date = doc.evaluate(date_XPath, doc, nsResolver, XPathResult.ANY_TYPE, null).iterateNext().content;
	date = date.split("T")[0];
	newItem.date = date;

	
	// Summary
	var summary_XPath = ".//p[@class='excerpt']"
	var summary = doc.evaluate(summary_XPath, doc, nsResolver, XPathResult.ANY_TYPE, null).iterateNext().textContent;	
	newItem.abstractNote = summary;
	
	// Produkt (Zeit, Zeit online etc.)
	product_XPath = '//meta[contains(@name, "zeit::product-name")]'
	var product = doc.evaluate(product_XPath, doc, nsResolver, XPathResult.ANY_TYPE, null).iterateNext().content;
	newItem.publicationTitle = product;

	
	// Section
	var section_XPath = '//meta[contains(@name, "zeit::ressort")]'
	var section = doc.evaluate(section_XPath, doc, nsResolver, XPathResult.ANY_TYPE, null).iterateNext().content;
	newItem.section= section;

	newItem.attachments.push({url:doc.location.href+"?page=all&print=true", title:doc.title, mimeType:"text/html"});
	newItem.complete()
				
}
 
function doWeb(doc, url) {
	var namespace = doc.documentElement.namespaceURI;
	var nsResolver = namespace ? function(prefix) {
		if (prefix == 'x') return namespace; else return null;
	} : null;

	var articles = new Array();
	var items = new Object();
	var nextTitle;
	
	if (detectWeb(doc, url) == "newspaperArticle") {
		scrape(doc, url);
	}
	Zotero.wait()
}


