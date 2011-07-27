{
        "translatorID":"86dc0725-3091-4d59-97a9-5538ee8efd32",
        "label":"RAMBI",
        "creator":"Pierpaolo Bertalotto",
        "target":"aleph3\\.libnet\\.ac\\.il",
        "minVersion":"1.0",
        "maxVersion":"",
        "priority":1,
        "inRepository":"1",
        "translatorType":4,
        "lastUpdated":"2011-03-08 11:06:23"
}

function detectWeb(doc, url) {
	var ini = url.search(/func\=short/);
	if (ini>-1){
		return 'multiple';
	}
	else{
		var type = doc.evaluate('.//th[contains(.,"Source")]', doc, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null).snapshotItem(0).textContent;
		if (type.search(/journal/)>-1){
			return 'journalArticle';
		}
		else if (type.search(/book/)>-1){
			return 'bookSection';
		}
	}	
}
	

function doWeb(doc, url) {
	var type  = detectWeb(doc,url);
	if (type=="journalArticle"){
		createJournalArticle(doc,url);
	}
	else if (type=="bookSection"){
		createBookSection(doc,url)
	}
	else if (type=="multiple"){
		createMultipleEntries(doc,url);
	}
}

function addSubjects(item,url){
	var marcURL = url.replace(/format\=999/,"format=001");
	var marcDocument = Zotero.Utilities.retrieveDocument(marcURL);
	var subjectNodes = marcDocument.evaluate('.//th[contains(.,"650 4")]/parent::node()//td', marcDocument, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);
	var subjects = new Array();
	for (var i = 0; i<subjectNodes.snapshotLength; i++){
		var currentSubject = subjectNodes.snapshotItem(i).textContent.replace(/\|a /,"");
		subjects.push(currentSubject);
	}
	item.tags = subjects;
}

function createJournalArticle(doc,url){
	var item = new Zotero.Item("journalArticle");
	addSubjects(item,url);
	var author = doc.evaluate('.//th[contains(.,"Author")]/parent::node()//a', doc, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null).snapshotItem(0).textContent;
	item.creators.push(Zotero.Utilities.cleanAuthor(author, "author",true));
	item.title = doc.evaluate('.//th[contains(.,"Title")]/parent::node()//a', doc, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null).snapshotItem(0).textContent;
	var source = doc.evaluate('.//th[contains(.,"In")]/parent::node()//td', doc, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null).snapshotItem(0).textContent;
	item.publicationTitle = source.match(/^[A-ZÀÁÈÉÌÍÒÓÙÚÜa-zàèéìíáòóùúü ]*/)[0];
	var volumeIssue = source.match(/\s\d+.{0,1}\d*\-{0,1}\d*\s/)[0];
	if (volumeIssue.search(/\,/)>-1){
		var volume = volumeIssue.split(",")[0].replace(/\s/,"");
		var issue = volumeIssue.split(",")[1].replace(/\s/,"");
	}
	else{
		var volume = volumeIssue.replace(/\s/,"");
		var issue = null;
	}
	item.volume = volume;
	item.issue = issue;
	item.date = source.match(/\(\d{4}\)/)[0].replace(/[\(\)]/g,"");
	var pages = source.match(/\s\d+\-\d+.*/)[0];
	pages = pages.replace(/\s/g,"");
	item.pages = pages;
	item.complete();
}

function createBookSection(doc,url){
	var addedAuthor = doc.evaluate('.//th[contains(.,"Added Author")]/parent::node()//a', doc, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);
	if (addedAuthor.snapshotLength==0){
		var item = new Zotero.Item("bookSection");
		addSubjects(item,url);
		var author = doc.evaluate('.//th[contains(.,"Author")]/parent::node()//a', doc, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null).snapshotItem(0).textContent;
		item.creators.push(Zotero.Utilities.cleanAuthor(author, "author",true));
		var title = doc.evaluate('.//th[contains(.,"Title")]/parent::node()//a', doc, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null).snapshotItem(0).textContent;
		title = title.replace(/\s\:\s/,": ");
		item.title = title;
		var source = doc.evaluate('.//th[contains(.,"Source")]/parent::node()//td', doc, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null).snapshotItem(0).textContent;
		//Zotero.debug(source);
		var pubTitle =  source.match(/^[A-Za-z0-9\?\:\s\;\,\-\’\'\"\’ÀÁÈÉÌÍÒÓÙÚÜàèéìíáòóùúü]*\.\s/)[0];
		pubTitle = pubTitle.replace(/^\s/,"");
		pubTitle = pubTitle.replace(/\.\s$/,"");
		pubTitle = pubTitle.replace(";",":");
		item.publicationTitle = pubTitle;
		var place = source.match(/\.(\s[A-ZÀÁÈÉÌÍÒÓÙÚÜ][a-zàèéìíáòóùúü]+)+(\s([a-zàèéìíáòóùúüA-ZÀÁÈÉÌÍÒÓÙÚÜ]+\.)*)?(\,\s[ÀÁÈÉÌÍÒÓÙÚÜA-Za-z]+)*\:\s/)[0];
		place = place.replace(/^\.\s/,"");
		place = place.replace(/\:\s$/,"");
		item.place = place;
		var publisher = source.match(/\:\s[A-ZÀÁÈÉÌÍÒÓÙÚÜa-zàèéìíáòóùúü\&\s\-\.]*\,\s\d{4}/)[0];
		publisher = publisher.replace(/\:\s/,"");
		publisher = publisher.replace(/\,\s\d{4}/,"");
		item.publisher = publisher;
		var editorsString = source.match(/((Hrsg.: )|(A cura di )|(Edited by )|(Ed\. by )|(Ed\. By )|(Ed\.\: )|(Eds\.\: ))((([A-ZÀÁÈÉÌÍÒÓÙÚÜ][a-zàèéìíáòóùúü]+ [A-ZÀÁÈÉÌÍÒÓÙÚÜ][a-zàèéìíáòóùúü]+ ([A-ZÀÁÈÉÌÍÒÓÙÚÜ][a-zàèéìíáòóùúü]+)+)|([A-ZÀÁÈÉÌÍÒÓÙÚÜ][a-zàèéìíáòóùúü]+ ([A-ZÀÁÈÉÌÍÒÓÙÚÜ][a-zàèéìíáòóùúü]+)+)|(([A-ZÀÁÈÉÌÍÒÓÙÚÜ]\.\s*)+([A-ZÀÁÈÉÌÍÒÓÙÚÜ][a-zàèéìíáòóùúü]+)+)|([A-ZÀÁÈÉÌÍÒÓÙÚÜ][a-zàèéìíáòóùúü]+ ([A-ZÀÁÈÉÌÍÒÓÙÚÜ]\.\s*)+([A-ZÀÁÈÉÌÍÒÓÙÚÜ][a-zàèéìíáòóùúü]+)+))((\, )|( and )|(\, and )|(\s&\s))*)+\./)[0];
		editorsString = editorsString.replace(/(Hrsg.: )|(A cura di )|(Edited by )|(Ed\. by )|(Ed\. By )|(Ed\.\: )|(Eds\.\: )/,"");
		Zotero.debug(editorsString);
		var editors = editorsString.match(/((([A-ZÀÁÈÉÌÍÒÓÙÚÜ][a-zàèéìíáòóùúü]+ [A-ZÀÁÈÉÌÍÒÓÙÚÜ][a-zàèéìíáòóùúü]+ ([A-ZÀÁÈÉÌÍÒÓÙÚÜ][a-zàèéìíáòóùúü]+)+)|([A-ZÀÁÈÉÌÍÒÓÙÚÜ][a-zàèéìíáòóùúü]+ ([A-ZÀÁÈÉÌÍÒÓÙÚÜ][a-zàèéìíáòóùúü]+)+)|(([A-ZÀÁÈÉÌÍÒÓÙÚÜ]\.\s*)+([A-ZÀÁÈÉÌÍÒÓÙÚÜ][a-zàèéìíáòóùúü]+)+)|([A-ZÀÁÈÉÌÍÒÓÙÚÜ][a-zàèéìíáòóùúü]+ ([A-ZÀÁÈÉÌÍÒÓÙÚÜ]\.\s*)+([A-ZÀÁÈÉÌÍÒÓÙÚÜ][a-zàèéìíáòóùúü]+)+)))+/g);
		for (var counter = 0; counter<editors.length; counter++){
			item.creators.push(Zotero.Utilities.cleanAuthor(editors[counter], "editor"));
		}
		var bSource = doc.evaluate('.//th[contains(.,"In")]/parent::node()//td', doc, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null).snapshotItem(0).textContent;
		item.date = bSource.match(/\(\d{4}\)/)[0].replace(/[\(\)]/g,"");
		var pages = bSource.match(/\s\d+\-\d+.*$/)[0];
		pages = pages.replace(/\s/g,"");
		item.pages = pages;
		item.complete();
	}
	
}

function createMultipleEntries(doc,url){
	var docs = doc.evaluate('//td[@class="btnRecord"]//a', doc, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);
	for (var i = 0; i<docs.snapshotLength; i++){
		var newURL = docs.snapshotItem(i).href
		var newDoc = Zotero.Utilities.retrieveDocument(newURL);
		doWeb(newDoc,newURL);
	}
}
