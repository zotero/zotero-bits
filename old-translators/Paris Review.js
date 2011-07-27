{
        "translatorID":"b24ee183-58a6-443d-b8f9-c5cd5a3a0f73",
        "label":"Paris Review",
        "creator":"Avram Lyon",
        "target":"^http://www\\.theparisreview\\.org/",
        "minVersion":"1.0",
        "maxVersion":"",
        "priority":100,
        "inRepository":"1",
        "translatorType":4,
        "lastUpdated":"2010-10-31 21:49:18"
}

function detectWeb(doc, url){
	if (url.match(/\/(interviews|poetry|fiction|letters-essays)\/\d+\//)) {
		return "magazineArticle";
	} else if (url.match(/\/blog\/\d+\//)) {
		return "blogPost";
	} else if (url.match(/\/(blog|interviews|current-issue|letters-essays|poetry|fiction)($|\/)/)|| url.match(/\/search\?/) ){
		return "multiple";
	} else return false;
}

function doWeb(doc, url){
	var n = doc.documentElement.namespaceURI;
	var ns = n ? function(prefix) {
		if (prefix == 'x') return n; else return null;
	} : null;
	
	var articles = new Array();
	if (detectWeb(doc, url) == "multiple") {
		var items = new Array();
		
		var aTags = doc.getElementsByTagName("a");
                for(var i=0; i<aTags.length; i++) {
	                var type = detectWeb(doc,aTags[i].href);
	                if(type && type != "multiple") {
		                items[aTags[i].href]=aTags[i].textContent;
	                }
                }

		items = Zotero.selectItems(items);
		if(!items) return true;
		for (var i in items) {
			articles.push(i);
		}
		Zotero.Utilities.processDocuments(articles, scrape, function() {Zotero.done();});
	} else {
		scrape(doc,url);
	}
	
	Zotero.wait();
}

function scrape (doc,url) {
	if (!url) url = doc.location.href;
	switch (detectWeb(doc,url)) {
		case "blogPost": blogPost(doc, url); break;
		case "magazineArticle":magazineArticle(doc,url);break;
	}
}

function magazineArticle(doc,url) {
	    var n = doc.documentElement.namespaceURI;
    var ns = n ? function(prefix) {
        if (prefix == 'x') return n; else return null;
    } : null;
		var item = new Zotero.Item("magazineArticle");
		item.title = doc.evaluate('//div[@id="left"]//h3[1]', doc, ns, XPathResult.ANY_TYPE, null).iterateNext().textContent;
		if (url.match(/\/interviews\//)) {
			item.creators.push(Zotero.Utilities.cleanAuthor(item.title.match(/.*?,/)[0],"contributor"));
			item.creators.push(Zotero.Utilities.cleanAuthor(doc.evaluate('//div[@id="left"]//p[1]', doc, ns, XPathResult.ANY_TYPE, null).iterateNext().textContent.match(/Interviewed by (.*)/)[1],"author"));
		} else {
			item.creators.push(Zotero.Utilities.cleanAuthor(doc.evaluate('//div[@id="left"]/div/p', doc, ns, XPathResult.ANY_TYPE, null).iterateNext().textContent,"author"));
		}
		item.date = doc.evaluate('//div[@class="moreonissue-right"]/h3/text()[1]', doc, ns, XPathResult.ANY_TYPE, null).iterateNext().textContent;
		item.issue = doc.evaluate('//div[@class="moreonissue-right"]/h3/text()[2]', doc, ns, XPathResult.ANY_TYPE, null).iterateNext().textContent.match(/[0-9]+/)[0];
		item.publicationTitle = "Paris Review";
		item.url = url;
		item.ISSN="0031-2037";
		item.attachments.push({url:url})
		item.complete();
}

function blogPost(doc,url) {
		    var n = doc.documentElement.namespaceURI;
    var ns = n ? function(prefix) {
        if (prefix == 'x') return n; else return null;
    } : null;
		var item = new Zotero.Item("blogPost");
		item.title = doc.evaluate('//h2[@class="blog-title"]', doc, ns, XPathResult.ANY_TYPE, null).iterateNext().textContent;
		item.creators.push(Zotero.Utilities.cleanAuthor(doc.evaluate('//p[@class="blog-date"]/a', doc, ns, XPathResult.ANY_TYPE, null).iterateNext().textContent,"author"));
		item.date = doc.evaluate('//p[@class="blog-date"]/text()[1]', doc, ns, XPathResult.ANY_TYPE, null).iterateNext().textContent.match(/(.*)\|/)[1];
		item.blogTitle = "Paris Review Daily";
		item.url = url;
		item.attachments.push({url:url})
				item.complete();
}
