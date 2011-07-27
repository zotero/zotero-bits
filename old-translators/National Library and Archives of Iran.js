{
        "translatorID":"f07d24c1-f161-4900-8bf1-fde274bbef95",
        "label":"National Library and Archives of Iran",
        "creator":"CRCIS",
        "target":"http://opac.nlai.ir/opac-prod/search/",
        "minVersion":"1.0",
        "maxVersion":"",
        "priority":100,
        "inRepository":"1",
        "translatorType":4,
        "lastUpdated":"2010-12-27 11:42:40"
}

//most of the code is from "Library Catalog (Voyager)" by "Simon Kornblith"
//this zotero translator detects items in search results page of www.nlai.ir
//IRANMARC translator is needed to translate the IRANMARC records from "nlai.ir"


function detectWeb(doc, url)  {
	var namespace = doc.documentElement.namespaceURI;
	var nsResolver = namespace ? function(prefix) {
	if (prefix == 'x') return namespace; else return null;
	} : null;
	Zotero.debug(namespace);
	var XPath='//x:table[@id="table10"]/x:tbody/x:tr[3]/x:td[2]/select/option[3]';
	Zotero.debug(XPath);
	var theXPathObject=doc.evaluate(XPath,doc,nsResolver, XPathResult.ANY_TYPE, null);
	Zotero.debug(theXPathObject);
	var option;
	option=theXPathObject.iterateNext();
	isoStrFa="ایزو";
	isoStrEn="ISO format";
	if (((option.textContent.indexOf(isoStrFa))>=0) || ((option.textContent.indexOf(isoStrEn))>=0)) {
		return "multiple";
	} else {
		return null;
	}	
}


function doWeb(doc, url) {
	var namespace = doc.documentElement.namespaceURI;
	var nsResolver = namespace ? function(prefix) {
	if (prefix == 'x') return namespace; else return null;
	} : null;
	var postString = 'sortKeyValue1=sortkey_title&sortKeyValue2=sortkey_author&';
	var form=doc.forms[0];
	var newUri=form.action;
	Zotero.debug(newUri);
	
	var articles = new Array();
	var items = new Object();
	var checkboxes=new Array();
	var nextTitle;
	var n=0;
	if (detectWeb(doc, url) == "multiple") {
		var XPath1='//table[@id="table"]/tbody/tr/td[3]/a';
		var XPath2='//table[@id="table"]/tbody/tr/td[1]/input';
		var Xtitles = doc.evaluate(XPath1, doc, nsResolver, XPathResult.ANY_TYPE, null);
		var Xcheckboxes=doc.evaluate(XPath2, doc, nsResolver, XPathResult.ANY_TYPE, null);
		while (nextTitle = Xtitles.iterateNext()) {
			var nextCheckBox=Xcheckboxes.iterateNext();
			//replace ommits spaces 
			items[n] = nextTitle.textContent.replace(/^\s*|\s*$/g, ''); 
			checkboxes[n]=nextCheckBox;
			n++;
		}
		items = Zotero.selectItems(items);
		for (var i in items) {
			articles.push(i);
			postString+=checkboxes[i].name+"=on"+"&";
		}
	}
	for(var i=0; i<form.elements.length; i++) {
		if(form.elements[i].type && form.elements[i].type.toLowerCase() == 'hidden') {
			if (form.elements[i].name=="command") {
				postString+='command=SAVE_PRINT&';
			} else {
			 	postString += escape(form.elements[i].name)+'='+escape(form.elements[i].value)+'&';
			}
		}
	}
	postString+="selectionRows=2&selectionFormat=5&pageSize=15";
	var responseCharset = 'UTF-8';
	var Headers=new Object();
	Headers.Referer=url;
	
	Zotero.Utilities.HTTP.doPost(newUri,postString, function(text) {
		// load translator for MARC
		Zotero.debug(text);

	
		var marc = Zotero.loadTranslator("import");
		//marc.setTranslator("a6ee60df-1ddc-4aae-bb25-45e0537be973");
		marc.setTranslator("0dc5fbe8-f6b0-46e4-aafb-73b3a75c7e59"); //IRANMARC
		marc.setString(text);
		
		var domain = url.match(/https?:\/\/([^/]+)/);
		marc.setHandler("itemDone", function(obj, item) {
			Zotero.debug(item);
			item.repository = domain[1]+" Library Catalog";
			item.complete();
			Zotero.debug(item);
		});
		

		marc.translate();

		
		Zotero.done();
	}, Headers,responseCharset);
	Zotero.wait();

}