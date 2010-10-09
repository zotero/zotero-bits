{
	"translatorID":"a573f7e1-d7be-4337-b06e-f6066966b0fb",
	"translatorType":4,
	"label":"Catalogue Collectif de France (CCFr)",
	"creator":"Florian Ziche",
	"target":"ccfr.bnf.fr/portailccfr",
	"minVersion":"1.0.0b3.r1",
	"maxVersion":"",
	"priority":100,
	"inRepository":true,
	"lastUpdated":"2010-10-08 18:10:00"
}


/**
 * Demo for the usage of Marc2.js. I tried to separate custom screen-scraping code
 * from the doWeb which is now largely boilerplate and should go unaffected
 * by minor site changes.
 * */

var Marc;	//imported from Marc2.js

/**
 * Get the div containing the actual data.
 */
function getNotice(doc) {
	var namespace = doc.documentElement.namespaceURI;
	var nsResolver = namespace ? function(prefix) {
		if (prefix == 'x') return namespace; else return null;
	} : null;

	var xpath = "//div[@class=\"notice-contenu-int\"]";
	var div = doc.evaluate(xpath, doc, nsResolver, XPathResult.ANY_TYPE, null).iterateNext();
	if(div) {
		Zotero.debug("Notice found");
	}
	else {
		Zotero.debug("No notice found");
	}
	return div;
};

/**
 * Get the div containing the search results.
 */
function getResultTable(doc) {
	var namespace = doc.documentElement.namespaceURI;
	var nsResolver = namespace ? function(prefix) {
		if (prefix == 'x') return namespace; else return null;
	} : null;

	var xpath = "//div[@class=\"IdentArray\"]";
	var div = doc.evaluate(xpath, doc, nsResolver, XPathResult.ANY_TYPE, null).iterateNext();
	if(div) {
		Zotero.debug("Result list found");
	}
	else {
		Zotero.debug("No result list found");
	}
	return div;
};


/** Get item type from a div notice element. */
function getItemType(div) {
	return "book";
};

/**
 * Get an array of Marc URLs from a document, each linking to a document containing 
 * the actual Marc data for one item.
 * @returns {String[]} an array of URIs for individual item pages with MARC code on them
 */
function extractMarcUrls(doc) {
	Zotero.debug("extractMarcUrls");
	var uris = new Array();
	var div = getNotice(doc);
	//Single result
	if(div) {
		var url = doc.location.href;
		Zotero.debug(url);
		var match = /^(.+?)\/servlet\/.+?record=([^&]+)/.exec(url);
		if(match) {
			Zotero.debug(match[2].split(":"));
//			http://www.ccfr.bnf.fr/portailccfr/jsp/ccfr/view/z3950_sudoc_pro.jsp?recordId=z3950_sudoc:SUDOC:rset-RS250|show%2049&ongletRank=2&stamp=1286534403066
			url = match[1];
			url += "/jsp/ccfr/view/"
				+ match[2].split(":")[0] + "_pro.jsp?recordId="
				+ match[2];
			Zotero.debug(url);
			uris.push(url);
		}
	}
	//Multible results
	else {
		div = getResultTable(doc);
		if(div) {
			var items = new Object();
			var namespace = doc.documentElement.namespaceURI;
			var nsResolver = namespace ? function(prefix) {
				if (prefix == 'x') return namespace; else return null;
			} : null;
			var xpath = ".//td[@class=\"Ident\"]//a";
			var links = doc.evaluate(xpath, div, nsResolver, XPathResult.ANY_TYPE, null);
			var link;
			if(links) {
				while(link = links.iterateNext()) {
					var param = /record=([^&]+)/.exec(link.href);
					if(param) {
						var url = "http://"
							+ doc.domain
							+"/portailccfr/jsp/ccfr/view/"
							+ param[1].split(":")[0] + "_pro.jsp?recordId="
							+ param[1];
						var title = Zotero.Utilities.trimInternal(link.textContent);
						title = title.replace(/[\n\t]/g, "");
						items[url] = title;
						Zotero.debug(url + " => " + title);
					}
				}
			}
			items = Zotero.selectItems(items);
			for(var i in items) {
				uris.push(i);
			}
		}
	}
	return uris;
	
};

/** Parse an individual result page, locate the MARC code portion and breaks
 * it into clean tag/value pairs 
 * @param {Document} doc an individual result document
 * @returns {Array} an array of Marc {tag, value} objects from a document.
 * */
function extractMarcFields(doc) {
	var fields = new Array();

	var namespace = doc.documentElement.namespaceURI;
	var nsResolver = namespace ? function(prefix) {
		if (prefix == 'x') return namespace; else return null;
	} : null;
	
	var xpath = "//table//tr";
	var rows = doc.evaluate(xpath, doc, nsResolver, XPathResult.ANY_TYPE, null);

	var row;
	while(row = rows.iterateNext()) {
		var tag = Zotero.Utilities.superCleanString(doc.evaluate('./th', row, nsResolver, XPathResult.ANY_TYPE, null).iterateNext().textContent);
		Zotero.debug("Found tag: \"" + tag + "\"");
		switch(tag) {
		case "LABEL":
			tag = "000";
			break;
		case "LDR":
			tag = "000";
			break;
		}
		var indicator = "";
		if(tag.substr(0, 2) != "00") {
			var cell = doc.evaluate("./td[1]", row, nsResolver, XPathResult.ANY_TYPE, null).iterateNext();
			if(cell) {
				indicator = cell.textContent; 
				indicator = indicator.replace(/[ \n]+/g, "");
				indicator = indicator.replace(/[\xA0]/g, " ");
				indicator = Zotero.Utilities.lpad(indicator, " ", 2);
			}
		}
		var values = doc.evaluate("./td[2]//text()", row, nsResolver, XPathResult.ANY_TYPE, null);
		
		var v;
		var value = "";
		if(values) {
			while(v = values.iterateNext()) {
				value += v.textContent.trim();
			}
			value = value.replace(/\$([a-z0-9])/g, Marc.Delimiters.SUBFIELD_DELIMITER + "$1");
		}
		
		fields.push({tag: tag, value: indicator + value});
	}
	return fields;
}


/**
 * Postprocess an item after standard MARC contents are handled. Though the record object is
 * supplied, this is rather meant to add information from other parts of the document. If
 * you wish to modify or enhance the way a record is translated into a Zotero item, subclassing
 * the ImportConverter might be the preferred way.
 * @param {Zotero.Item} item
 * @param {Marc.Record} record
 * @param {Document} doc
 * @returns {Zotero.Item}
 */
function postprocessItem(item, record, doc) {
	item.libraryCatalog = "Catalogue Collectif de France";

	// 20091210 : We try to get a permalink on the record
//	var perma = uri.match(/(https?:\/\/[^/]+.*ipac\.jsp\?).*(uri\=[^&]*)/);
//	var profile = uri.match(/(profile\=[^&]*)/);
//	if (perma && perma[1] && perma[2]) {
//		var permalink = perma[1] + perma[2];
//		// Sometimes, for libraries with multiple profiles, it can be useful
//		// to store the permalink with the profile used
//		if (profile) {
//			permalink = permalink + "&" + profile[1];
//		}
//		item.url = permalink;
//	}
//	else {
//		Zotero.debug("Unable to create permalink on " + uri);
//	}
	return item;
};

/** Constructor for a converter class. */
var converterClass;

/** Get a converter for a given record. This might be a derived class, 
 * overriding some base class methods, or simply the result of calling 
 * Marc.Converters.getImportConverter(record). */
function getImportConverter(record) {
	//In this example, we slightly tweak the Unimarc converter
	if(Marc.Unimarc.isUnimarc(record)) {
		//Subclass the importer
		if(!converterClass) {
			converterClass = Marc.Converters.subclassImportConverter(record,
				//Overwrite base class methods
				{
					//Get some non-standard subfields
					_getAbstract : function(record, item) {
						var value = record.getValue([Marc.Unimarc.Tags.DISSERTATION_THESIS_NOTE,
						                             Marc.Unimarc.Tags.SUMMARY_OR_ABSTRACT], 
				                             "abced",
				                             {fieldJoin: "\n"});
						if(value) {
							item.abstractNote = value;
						};
					}
				});
		};
	}
	//Create instance
	return converterClass 
		? new converterClass							//our subclass 
		: Marc.Converters.getImportConverter(record);   //default
}



function detectWeb(doc, url) {
	//Check for single result
	var noticeDiv = getNotice(doc);
	if(noticeDiv) {
		return getItemType(noticeDiv);
	}
	else {
		noticeDiv = getResultTable(doc);
		if(noticeDiv) {
			return "multiple";
		}
	}
};


function doWeb(doc, url) {
	//Get URIs
	Zotero.debug("Calling extractMarcUrls");
	var uris = extractMarcUrls(doc);
	if(0 == uris.length) {
		return true;
	}
	
	//Load MARC2
	var translator = Zotero.loadTranslator("import");
	translator.setTranslator("d2c86970-04f7-4ba5-9de6-bec897930eb5");
	Marc = translator.getTranslatorObject().Marc;
	var importer = Marc.IO.getImporter();
	
	//Marc document loop
	Zotero.Utilities.processDocuments(uris, function(newDoc) {
		var fields = extractMarcFields(newDoc);
		if(fields && fields.length > 0) {
			//Build record
			var record = importer.parseFields(fields, record);
			record.dump();
			
			//Translate record
			var importConverter = getImportConverter(record);
			var item = importConverter.convert(record);
			
			//Postprocess item
			postprocessItem(item, record, newDoc);
			
			item.complete();
		}
	}, function() { Zotero.done() }, null);
	
	Zotero.wait();
}   