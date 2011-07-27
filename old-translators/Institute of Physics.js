{
        "translatorID":"9346ddef-126b-47ec-afef-8809ed1972ab",
        "label":"Institute of Physics",
        "creator":"Michael Berkowitz and Avram Lyon",
        "target":"^http://iopscience\\.iop\\.org/[0-9\\-]+/.+",
        "minVersion":"1.0.0b4.r5",
        "maxVersion":"",
        "priority":99,
        "inRepository":"1",
        "translatorType":4,
        "lastUpdated":"2010-06-13 20:05:41"
}

function detectWeb(doc, url) {
	if (url.indexOf("search") == -1) {
		return "journalArticle";
	} else {
		return "multiple";
	}
}

function fetchForDOI(DOI) { 
	var articleID = DOI.slice(DOI.indexOf('/')+1);
	var pdfURL = "http://iopscience.iop.org/"+articleID+"/pdf/"+articleID.replace("/","_","g")+".pdf";
	
	var postVars = "exportFormat=iopexport_ris&exportType=abs&articleId="+articleID;
	Zotero.Utilities.HTTP.doPost("http://iopscience.iop.org/export", postVars, function(text){
			// load translator for RIS
			var ristranslator = Zotero.loadTranslator ("import");
			ristranslator.setTranslator("32d59d2d-b65a-4da4-b0a3-bdd3cfb979e7");
			ristranslator.setString(text);
			ristranslator.setHandler("itemDone", function(obj, item) { 
				item.url = "http://iopscience.iop.org/"+articleID;
				item.attachments.push({url:pdfURL, title:"IOP Full Text PDF", mimeType:"application/pdf"});
				item.DOI = DOI;
				item.complete();
				});
			ristranslator.translate();
		}, function() {}); 
	Zotero.wait();
}

function doWeb(doc, url) {
	var namespace = doc.documentElement.namespaceURI;
	var nsResolver = namespace ? function(prefix) {
		if (prefix == "x") return namespace; else return null;
	} : null;
	
	var arts = new Array();
	if (detectWeb(doc, url) == "multiple") {
		var items = new Object();
		var results = doc.evaluate('//div[@class="searchResCol1"]', doc, nsResolver, XPathResult.ANY_TYPE, null);
		var result;
		while (result = results.iterateNext()) {
			var title = doc.evaluate('.//h4/a', result, nsResolver, XPathResult.ANY_TYPE, null).iterateNext().textContent;
			var doi = doc.evaluate('.//span[@class="doi"]/strong/a', result, nsResolver, XPathResult.ANY_TYPE, null).iterateNext().textContent;
			Zotero.debug(title + doi);
			items[doi] = title;
		}
		items = Zotero.selectItems(items);
		if(!items) return true;
		for (var i in items) {
			arts.push(i);
		}
	} else {
		var doi = doc.evaluate('//meta[@name="citation_doi"]', doc, nsResolver, XPathResult.ANY_TYPE, null).iterateNext().content;
		arts = [doi];
	}
	for each (var doi in arts) {
		fetchForDOI(doi);
	}
}
