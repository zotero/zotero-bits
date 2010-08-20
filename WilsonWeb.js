{
"translatorID":"ae649eda-99de-4679-811e-12e19bf5e0b8",
"label":"WilsonWeb",
"creator":"Brinda Shah",
"target":"http://(vnweb|webbeta|verityqa|verityqa2|atg-dev05).hwwilsonweb.com/hww/results/",
"minVersion":"1.0",
"maxVersion":"",
"priority":100,
"inRepository":"1",
"translatorType":4,
"lastUpdated":"2010-08-20 11:37:02"
}

var dispType='brief';
var titleObj= new Object();
var resultType = 'journalArticle';
var articles = new Array();	
var pgSize;

function detectWeb(doc, url) {
	var namespace = doc.documentElement.namespaceURI; var nsResolver = namespace ? 
	function(prefix) {
	if (prefix == "x" )
		 return namespace;
	else 
		return null;
	} : null;
	
	if(doc.title.match("Search Results")) {
		var dispElePath = "//input[@name='displayType']";
		var dispEle = doc.evaluate(dispElePath , doc, nsResolver, XPathResult.ANY_TYPE, null).iterateNext();
		if(dispEle) {			
			dispType=dispEle.value;					
		}	
		
		var cxpath = getXPath(dispType, 'cxpath');
		var tClass = doc.evaluate(cxpath, doc, nsResolver, XPathResult.ANY_TYPE, null).iterateNext().textContent;
		
		if(tClass.match("BIBL"))
			resultType = "journalArticle";
		else if(tClass.match("BOOK"))
			resultType = "book";
		else if(tClass.match("ART"))
			resultType = "artwork";
		
									
		var xpath = '//input[@name="pageSize"]';
		var eleObj = doc.evaluate(xpath, doc, nsResolver, XPathResult.ANY_TYPE, null);
		var ele;
		if(ele = eleObj.iterateNext()) {
			if(ele) {
				pgSize= ele.value;
				
				if(pgSize > 1) {
					if(resultType == 'journalArticle')
						return "multiple";
				}				
				else 			
					return resultType;				
					
			}
		}
		
	}

}

function doWeb(doc, url) {
	
	var namespace = doc.documentElement.namespaceURI;
	var nsResolver = namespace ? 
	function(prefix) {
	if (prefix == 'x') 
		return namespace;
	 else 
	 	return null;
	} : null;
	
	if (detectWeb(doc, url) == "multiple") {	

		if(resultType == "journalArticle"){
			var nextTitle;
			var c = 0;
	
			var titles = doc.evaluate(getXPath(dispType,'ti'), doc, nsResolver, XPathResult.ANY_TYPE, null);
			while (nextTitle= titles.iterateNext()) {	
				c++;
				titleObj[c] = nextTitle.textContent;					
			}		
			titleObj = Zotero.selectItems(titleObj);
		
			for (var t in titleObj ) {				
				articles.push(t);			
				var newArticle = new Zotero.Item('journalArticle');				
				newArticle.url = doc.location.href;
				newArticle.title = titleObj[t];				
				associateBIBLData(doc,newArticle,t);
				newArticle.complete();
			}
		}	
	}
	else {
		//saves single page items
		articles = [url]; 
	}
	
	Zotero.Utilities.processDocuments(articles, scrape, function(){Zotero.done();});
	
	Zotero.wait();
	
}

function associateBIBLData(doc,newArticle,t) {	
	var namespace = doc.documentElement.namespaceURI;
	var nsResolver = namespace ? 
	function(prefix) {
	if (prefix == 'x') 
		return namespace;
	 else 
	 	return null;
	} : null;
	
	
	//author
	var authorPath = getXPath(dispType,'au',t);	
	var authorObj = doc.evaluate(authorPath, doc, nsResolver, XPathResult.ANY_TYPE, null).iterateNext();			
	
	if(authorObj) {
		associateAuthorData(newArticle, authorObj);
	}		
	
	//journal		
	var journalPath = getXPath(dispType, 'jn', t);
	var journalObj = doc.evaluate(journalPath, doc, nsResolver, XPathResult.ANY_TYPE, null).iterateNext();			
	if(journalObj ) {
		associateFieldData(newArticle, journalObj, 'journalAbbreviation');			
	}
	
	//source
	var sourcePath = getXPath(dispType,'so',t);
	if(sourcePath != '') {
		var sourceObj = doc.evaluate(sourcePath, doc, nsResolver, XPathResult.ANY_TYPE, null).iterateNext();
		if(sourceObj)
			associateSourceData(newArticle, sourceObj);
	}
	
	//subject
	var tagsContent = new Array();
	var suPath = getXPath(dispType, 'su', t);
	if(suPath != '') {
		var subject;	
		var suObj = doc.evaluate(suPath, doc, nsResolver, XPathResult.ANY_TYPE, null);		
		while(subject = suObj.iterateNext()) {			
			tagsContent.push(subject.textContent);
		}
		for (var i = 0; i < tagsContent.length; i++) {
			newArticle.tags[i] = tagsContent[i];
		}
	}
	
	//issn
	var issnPath = getXPath(dispType, 'issn', t);
	if(issnPath != '') {
		var issnObj = doc.evaluate(issnPath, doc, nsResolver, XPathResult.ANY_TYPE, null).iterateNext();			
		if(issnObj) {
			associateFieldData(newArticle, issnObj, 'ISSN');				
		}
	}	
	
	//la
	var laPath = getXPath(dispType, 'la', t);
	if(laPath != '') {
		var laObj = doc.evaluate(laPath, doc, nsResolver, XPathResult.ANY_TYPE, null).iterateNext();			
		if(laObj) {
			associateFieldData(newArticle, laObj, 'language');				
		}
	}	
	
	//abstract
	var absPath = getXPath(dispType, 'abs', t);
	if(absPath != '') {
		var absObj = doc.evaluate(absPath, doc, nsResolver, XPathResult.ANY_TYPE, null).iterateNext();			
		if(absObj) {
			associateFieldData(newArticle, absObj, 'abstractNote');				
		}
	}
	
	//doi
	var doiPath = getXPath(dispType, 'doi', t);
	if(doiPath != '') {
		var doiObj = doc.evaluate(doiPath, doc, nsResolver, XPathResult.ANY_TYPE, null).iterateNext();			
		if(doiObj) {
			associateFieldData(newArticle, doiObj, 'DOI');				
		}
	}
	
	//inst
	var instPath = getXPath(dispType, 'inst', t);
	if(instPath != '') {
		var instObj = doc.evaluate(instPath, doc, nsResolver, XPathResult.ANY_TYPE, null).iterateNext();			
		if(instObj ) {
			associateFieldData(newArticle, instObj , 'institution');				
		}
	}
	
	//publisher
	var pbPath = getXPath(dispType, 'pb', t);
	if(pbPath != '') {
		var pbObj = doc.evaluate(pbPath, doc, nsResolver, XPathResult.ANY_TYPE, null).iterateNext();			
		if(pbObj) {
			associateFieldData(newArticle, pbObj, 'publisher');				
		}
	}
	
	//note
	var ntPath = getXPath(dispType, 'nt', t);
	if(ntPath != '') {
		var ntObj = doc.evaluate(ntPath, doc, nsResolver, XPathResult.ANY_TYPE, null).iterateNext();			
		if(ntObj) {
			associateFieldData(newArticle, ntObj, 'notes');				
		}
	}
}

function associateAuthorData(zoteroItem, zoteroObj) {
	
	var author = zoteroObj.textContent;	
	if (author.match("; ")) {
		var authors = author.split(";");
		for (var i in authors) {
			zoteroItem.creators.push(Zotero.Utilities.cleanAuthor(authors[i], "author",true));
		}
	} else {
		zoteroItem.creators.push(Zotero.Utilities.cleanAuthor(author, "author",true));
	}
}

function associateSourceData(zoteroItem, zoteroObj) {
	//source
	var source = zoteroObj.textContent;		

	//volume 
	var vol = source.match(/[v].\s*\d+/);
	if(vol) 
		zoteroItem["volume"] =  vol[0].match(/\d+/);
		
	//issue
	var issue = source.match(/[no]..\s*\d+[/]*\d+/);
	if(issue)
		zoteroItem["issue"] = issue[0].match(/\d+[/]*\d+/);
	
	//date
	var date = source.match(/\b\w+\s*\d*\s*\d{4}\b/);	
	zoteroItem["date"] = date;	
	
	//pages
	var pages = source.match(/[p].\s*\d+[-]*\d+/);	
	if(pages)	
		zoteroItem["pages"] = pages[0].match(/\d+[-]*\d+/);

	zoteroItem["source"] = source;
}

function associateFieldData(zoteroItem, zoteroObj, zoteroField) {
	var fieldValue = zoteroObj.textContent;	
	zoteroItem[zoteroField] = fieldValue;
}



function getXPath(dispType,field,p) {
	var xPath = "";
	var pos = "";
	if(p)
		pos = "[" + p + "]";

	if(dispType == 'brief') {
		
		switch(field){
			
			case 'cxpath' : xPath = '//div[@id="results"]/table[1]/tbody/tr[1]/td[2]/table/tbody/tr/td/p/@class';
						break;
			case 'chk' : xPath = '//input[@name="checkbox"][@type="checkbox"]';
						break;
			case 'ti': 	xPath = "//span[contains(@class,'ti')][1]";
					break;
			case 'au': xPath =  '//table[@class="rectable"]'+ pos +'/tbody/tr/td[2]/table/tbody/tr/td/p/table[1]/tbody/tr/td/span[contains(@class,"au")]';
					break;
			case 'jn': xPath =  '//table[@class="rectable"]'+ pos +'/tbody/tr/td[2]/table/tbody/tr/td/p/table[1]/tbody/tr/td/span[@class="so"]/span[contains(@class,"jn")]';
					break;
			case 'voliss' : xPath =  '//table[@class="rectable"]'+ pos +'/tbody/tr/td[2]/table/tbody/tr/td/p/table[1]/tbody/tr/td/span[@class="so"]/span[contains(@class,"ji")]';
						break;
			case 'ppg' : xPath =  '//table[@class="rectable"]'+ pos +'/tbody/tr/td[2]/table/tbody/tr/td/p/table[1]/tbody/tr/td/span[@class="so"]/span[contains(@class,"ppg")]';
						break;
			case 'date' : xPath = '//table[@class="rectable"]'+ pos +'/tbody/tr/td[2]/table/tbody/tr/td/p/table[1]/tbody/tr/td/span[@class="so"]/span[contains(@class,"ji")][2]';
						break;
			case 'so' : xPath = '//table[@class="rectable"]'+ pos +'/tbody/tr/td[2]/table/tbody/tr/td/p/table[1]/tbody/tr/td/span[contains(@class,"so")]';
						break;
		}
		
	}		
	else {
		
		switch(field) {
			
			case 'cxpath' : xPath = '//div[@id="results"]/table/tbody/tr[2]/td/table/@class';
						break;
			case 'ti': if(pgSize > 1)
						xPath = '//table[@id="recData"]/tbody/tr/td[@id="ti"]/a[contains(@class,"tilink")]';
					else
						xPath = '//table[@id="recData"]/tbody/tr/td[@id="ti"]/span[contains(@class,"recTitle")]';
					break;
			case 'au' : xPath = '//table[@class="rectable"]' + pos + '/tbody/tr[2]/td/table/tbody/tr[2]/td/table/tbody/tr/td/a[contains(@class,"aulink")]';
					break;
			case 'jn': xPath =  '//table[@class="rectable"]' + pos + '/tbody/tr[2]/td/table/tbody/tr[2]/td/table/tbody/tr/td/a[contains(@class,"jilink")]';
					break;
			
			case 'su' : xPath = '//table[@class="rectable"]' + pos + '/tbody/tr[2]/td/table/tbody/tr[2]/td/table/tbody/tr/td/a[contains(@class,"sulink")]';
					break;
			case 'so' : 
			case 'issn' :
			case 'la' : 
			case 'abs' :
			case 'doi' : 
			case 'inst' : 
			case 'pb' : 
			case 'nt' :	xPath = '//table[@class="rectable"]' + pos + '/tbody/tr[2]/td/table/tbody/tr[2]/td/table/tbody/tr/td[contains(@id, "' + field + '")]';
						break;
		}
		
	}	
	return xPath;
}

function scrape(doc, url) {
	var namespace = doc.documentElement.namespaceURI;
	var nsResolver = namespace ? 
	function(prefix) {
		if (prefix == 'x') 
			return namespace; 
		else 
			return null;
	} : null;
		
	var newItem = new Zotero.Item(resultType);
	newItem.url = doc.location.href;
	
	var titleObj = doc.evaluate(getXPath(dispType,'ti'), doc, nsResolver, XPathResult.ANY_TYPE, null).iterateNext();
	newItem.title = titleObj.textContent;
	
	associateBIBLData(doc, newItem, 1);

	newItem.complete();
	
	
}