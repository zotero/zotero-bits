{
        "translatorID": "cde4428-5434-437f-9cd9-2281d14dbf9",
        "label": "Ovid",
        "creator": "Simon Kornblith and Michael Berkowitz",
        "target": "/(gw2|sp[^\\/]+)/ovidweb\\.cgi",
        "minVersion": "1.0.0b3.r1",
        "maxVersion": "",
        "priority": 100,
        "inRepository": true,
        "translatorType": 4,
        "lastUpdated": "2011-05-27 23:37:01"
}

function detectWeb(doc, url) {
	var namespace = doc.documentElement.namespaceURI;
	var nsResolver = namespace ? function(prefix) {
		if (prefix == 'x') return namespace; else return null;
	} : null;
	
	var rmXPath = '//form[@id="nav-results"]';
	if(!doc.evaluate(rmXPath, doc, nsResolver, XPathResult.ANY_TYPE, null).iterateNext()) {
		return false;
	}
	
	var results = doc.evaluate('//div[@class="article-title"]', doc, nsResolver, XPathResult.ANY_TYPE, null);
	var first = results.iterateNext();
	if(first) {
		var second = results.iterateNext();
		if(second) {
			return "multiple";
		} else {
			return "journalArticle";
		}
	}
	
	return false;
}

function senCase(string) {
	var words = string.split(/\b/);
	for (var i = 0 ; i < words.length ; i++) {
		if (words[i].match(/[A-Z]/)) {
			words[i] = words[i][0] + words[i].substring(1).toLowerCase();
		} 
	}
	return words.join("");
}

function doWeb(doc, url) {
	var namespace = doc.documentElement.namespaceURI;
	var nsResolver = namespace ? function(prefix) {
		if (prefix == 'x') return namespace; else return null;
	} : null;
	
	var detect = detectWeb(doc, url);
	var post = "S="+doc.evaluate('.//input[@name="S"]', doc, nsResolver, XPathResult.ANY_TYPE, null).iterateNext().value;

	if(detect == "multiple") {
		var items = new Object();
		
		// Go through rows
		var tableRows = doc.evaluate('//form[@id="nav-results"]//table[contains(@class,"titles-row ")]', doc, nsResolver, XPathResult.ANY_TYPE, null);
		var tableRow;
		while(tableRow = tableRows.iterateNext()) {
			var id = doc.evaluate('.//input[@name="R"]', tableRow, nsResolver, XPathResult.ANY_TYPE,
				null).iterateNext().value;
			items[id] = Zotero.Utilities.trimInternal(doc.evaluate('.//span[@class="titles-title"]', tableRow,
				nsResolver, XPathResult.ANY_TYPE, null).iterateNext().textContent);
		}
		
		var items = Zotero.selectItems(items);
		if(!items) return true;
		
		for(var i in items) {
			post += "&R="+i;
		}
	} else {
		var id = doc.evaluate('.//input[@name="R"]', doc, nsResolver, XPathResult.ANY_TYPE,
			null).iterateNext().value;
		post += "&R="+id;
	}
	/*
	if (detectWeb(doc, url) == "multiple") {
		var selectvar = doc.evaluate('.//input[@name="SELECT"]', doc, nsResolver, XPathResult.ANY_TYPE, null);
		var nextselect = selectvar.iterateNext().value;
		if (next = selectvar.iterateNext()) {
			post += "&SELECT=" + next.value;
		} else {
			post += "&SELECT="+ nextselect;
		}
	} else {
		post += "&SELECT=" + doc.evaluate('.//input[@name="SELECT"]', doc, nsResolver, XPathResult.ANY_TYPE, null).iterateNext().value;
	}*/
	var val = doc.evaluate('.//input[@name="CitManPrev"]', doc, nsResolver, XPathResult.ANY_TYPE,
		null).iterateNext().value.replace(/([^|]*)\|.*/,"$1");
	//post += "&CitMan="+doc.evaluate('.//input[@name="CitMan"]', doc, nsResolver, XPathResult.ANY_TYPE,
	//	null).iterateNext().value;
	post += "&Citation+Action="+val+"&Export+Citation="+val;
	post += "&S="+doc.evaluate('//meta[@name="OvidWS_Session_Cookie"]', doc, nsResolver, XPathResult.ANY_TYPE,
		null).iterateNext().content;
	//post += "&cmRecordSelect=SELECTED&PrintFields=ti&cmFields=ALL&cmFormat=export&cmsave.x=12&cmsave.y=7&doSave=1";
	post += "&PrintFieldsDataList=S.sh.35.42";
	post += "exportType=ris&cmFields=ALL&externalResolverLink=1&jumpstartLink=1&Citation+Page=Export+Citation&PrintFields=ti"
	Zotero.debug(post);
	Zotero.Utilities.HTTP.doPost(url, post, function(text) {
		Zotero.debug(text);
		var lines = text.split("\n");
		var haveStarted = false;
		var newItemRe = /^<[0-9]+>/;
		
		var newItem = new Zotero.Item("journalArticle");
		
		for(var i in lines) {
			if(lines[i].substring(0,3) == "<1>") {
				haveStarted = true;
			} else if(newItemRe.test(lines[i])) {
				newItem.complete();
				
				newItem = new Zotero.Item("journalArticle");
			} else if(lines[i].substr(2, 4) == "  - " && haveStarted) {
				var fieldCode = lines[i].substr(0, 2);
				var fieldContent = Zotero.Utilities.trimInternal(lines[i].substr(6));
				if(fieldCode == "TI") {
					newItem.title = fieldContent.replace(/\. \[\w+\]$/, "");
				} else if(fieldCode == "AU") {
					var names = fieldContent.split(", ");
					
					if(names.length >= 2) {
						// get rid of the weird field codes
						if(names.length == 2) {
							names[1] = names[1].replace(/ [\+\*\S\[\]]+$/, "");
						}
						names[1] = names[1].replace(/ (?:MD|PhD|[BM]Sc|[BM]A|MPH|MB)$/i, "");
						
						newItem.creators.push({firstName:names[1], lastName:names[0], creatorType:"author"});
					} else if (fieldContent.match(/^(.*) [A-Z]{1,3}$/)) {
						names = fieldContent.match(/^(.*) ([A-Z]{1,3})$/);
					  	newItem.creators.push({firstName:names[2], lastName:names[1], creatorType:"author"});
					} else {
						newItem.creators.push({lastName:names[0], isInstitution:true, creatorType:"author"});
					}
				} else if(fieldCode == "SO") {
					if (fieldContent.match(/\d{4}/)) {
						newItem.date = fieldContent.match(/\d{4}/)[0];
					}
					if (fieldContent.match(/(\d+)\((\d+)\)/)) {
						var voliss = fieldContent.match(/(\d+)\((\d+)\)/);
						newItem.volume = voliss[1];
						newItem.issue = voliss[2];
					}
					if (fieldContent.match(/vol\.\s*(\d+)/)) {
						newItem.volume = fieldContent.match(/vol\.\s*(\d+)/)[1];
					}
					if (fieldContent.match(/vol\.\s*\d+\s*,\s*no\.\s*(\d+)/)) {
						newItem.issue = fieldContent.match(/vol\.\s*\d+\s*,\s*no\.\s*(\d+)/)[1];
					}
					if (fieldContent.match(/\d+\-\d+/))
						newItem.pages = fieldContent.match(/\d+\-\d+/)[0];
			  		if (fieldContent.match(/pp\.\s*(\d+\-\d+)/))
						newItem.pages = fieldContent.match(/pp\.\s*(\d+\-\d+)/)[1];
					if (fieldContent.match(/[J|j]ournal/)) {
						newItem.publicationTitle = fieldContent.match(/[J|j]ournal[-\s\w]+/)[0];
					} else {
						newItem.publicationTitle = Zotero.Utilities.trimInternal(fieldContent.split(/(\.|;|(,\s*vol\.))/)[0]);
					}
				} else if(fieldCode == "SB") {
					newItem.tags.push(Zotero.Utilities.superCleanString(fieldContent));
				} else if(fieldCode == "KW") {
					newItem.tags.push(fieldContent.split(/; +/));
				} else if(fieldCode == "DB") {
					newItem.repository = "Ovid ("+fieldContent+")";
				} else if(fieldCode == "DI") {
					newItem.DOI = fieldContent;
				} else if(fieldCode == "DO") {
					newItem.DOI = fieldContent;
				} else if(fieldCode == "DP") {
					newItem.date = fieldContent;
				} else if(fieldCode == "IS") {
					newItem.ISSN = fieldContent;
				} else if(fieldCode == "AB") {
					newItem.abstractNote = fieldContent;
				}
			}
		}
		
		// last item is complete
		if(haveStarted) {
			newItem.complete();
		}
		Zotero.done();
	});
	Zotero.wait();
}