{
	"translatorID":"90afa695-152f-4880-9e33-0413f8e4dbaa",
	"translatorType":4,
	"label":"Library Catalog (Dynix) 2",
	"creator":"Simon Kornblith, updated by Sylvain Machefert, updated for Marc2.js by Florian Ziche",
	"target":"ipac\\.jsp\\?.*(?:uri=(?:link|full)=[0-9]|menu=search)",
	"minVersion":"1.0.0b3.r1",
	"maxVersion":"",
	"priority":100,
	"inRepository":false,
	"lastUpdated":"2009-12-10 07:10:00"
}


/**
 * Demo for the usage of Marc2.js. I tried to separate custom screen-scraping code
 * from the doWeb which is now largely boilerplate and should go unaffected
 * by minor site changes.
 * */

var Marc;	//imported from Marc2.js

/**
 * Get an array of Marc URLs from a document, each linking to a document containing 
 * the actual Marc data for one item.
 * @returns {String[]} an array of URIs for individual item pages with MARC code on them
 */
function extractMarcUrls(doc) {
	var namespace = doc.documentElement.namespaceURI;
	var nsResolver = namespace ? function(prefix) {
		if (prefix == 'x') return namespace; else return null;
	} : null;

	var uri = doc.location.href;
	var detailsRe = new RegExp('ipac\.jsp\?.*uri=(?:full|link)=[0-9]');
	
	var uris = new Array();
	if(detectWeb(doc,uri) == "book") {
		uris.push(uri+'&fullmarc=true');
	} else {
		var items = Zotero.Utilities.getItemArray(doc, doc, "ipac\.jsp\?.*uri=(?:full|link)=[0-9]|^javascript:buildNewList\\('.*uri%3Dfull%3D[0-9]", "Show details");
		items = Zotero.selectItems(items);
		
		if(!items) {
			return uris;
		}
		
		var buildNewList = new RegExp("^javascript:buildNewList\\('([^']+)");
		
		var uris = new Array();
		for(var i in items) {
			var m = buildNewList.exec(i);
			if(m) {
				uris.push(unescape(m[1]+'&fullmarc=true'));
			} else {
				uris.push(i+'&fullmarc=true');
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
	
	var xpath = '//form/table[@class="tableBackground"]/tbody/tr/td/table[@class="tableBackground"]/tbody/tr[td[1]/a[@class="normalBlackFont1" or @class="boldBlackFont1"]]';
	var rows = doc.evaluate(xpath, doc, nsResolver, XPathResult.ANY_TYPE, null);

	var row;
	while(row = rows.iterateNext()) {
		var tag = Zotero.Utilities.superCleanString(doc.evaluate('./td[1]/a[1]/text()[1]', row, nsResolver, XPathResult.ANY_TYPE, null).iterateNext().nodeValue);
		var value = doc.evaluate('./td[2]/table[1]/tbody[1]/tr[1]/td[1]/a[1]', row, nsResolver, XPathResult.ANY_TYPE, null).iterateNext();
		// value = null for non-Marc table entries w/ that xpath
		if (!value) {
			value = '';
		} else {
			value = value.textContent;
		}
		
		// Sometimes, the field contains "LDR: ", "001: ". We can delete these extra characters
		tag = tag.replace(/[\s:]/g, "");
		
		if (tag == "LDR") {
			fields.push({tag: "000", value: value});
		} 
		else if(tag != "FMT") {
			// In french catalogs (in unimarc), the delimiter isn't the $ but \xA4 is used. Added there
			// Also added the fact that subfield codes can be numerics
			value = value.replace(/[\xA4\$]([a-z0-9]) /g, 
					Marc.Delimiters.SUBFIELD_DELIMITER + "$1");  //Marc2
			var code = tag.substring(0, 3);
			//Make sure indicator is prepended to value 
			if(code.substr(0,2) != "00") {
				//Indicator as part of field tag?
				if(tag.length > 3) {
					var ind = tag[3];
					if(tag.length > 4) {
						ind += tag[4];
					}
					else {
						ind += " ";
					}
					value = ind + value;
				}
			}
			fields.push({tag: code, value: value});
		}
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
	var uri = doc.location.href;

	var domain = uri.match(/https?:\/\/([^/]+)/);
	item.libraryCatalog = domain[1]+" Library Catalog";

	// 20091210 : We try to get a permalink on the record
	var perma = uri.match(/(https?:\/\/[^/]+.*ipac\.jsp\?).*(uri\=[^&]*)/);
	var profile = uri.match(/(profile\=[^&]*)/);
	if (perma && perma[1] && perma[2]) {
		var permalink = perma[1] + perma[2];
		// Sometimes, for libraries with multiple profiles, it can be useful
		// to store the permalink with the profile used
		if (profile) {
			permalink = permalink + "&" + profile[1];
		}
		item.url = permalink;
	}
	else {
		Zotero.debug("Unable to create permalink on " + uri);
	}
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
	  var namespace = doc.documentElement.namespaceURI;
		var nsResolver = namespace ? function(prefix) {
			if (prefix == 'x') return namespace; else return null;
		} : null;
		// make sure there are multiple results, check to see if the search results number exists
		var xpath = '/html/body/table[4]/tbody/tr[2]/td[1]/table/tbody/tr[2]/td/a/b[1]';
		
		var detailsRe = new RegExp('ipac\.jsp\?.*uri=(?:full|link)=[0-9]');
		if(detailsRe.test(doc.location.href)) {
			return "book";
		} else if(!doc.evaluate(xpath, doc, nsResolver, XPathResult.ANY_TYPE, null).iterateNext()) { // this hack catches search results w/ single items
		  return "book";
		} else {
			return "multiple";
		}
	};


function doWeb(doc, url) {
	//Get URIs
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