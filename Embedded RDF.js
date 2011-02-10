{
	"translatorID":"951c027d-74ac-47d4-a107-9c3069ab7b48",
	"translatorType":4,
	"label":"Embedded RDF",
	"creator":"Simon Kornblith",
	"target":null,
	"minVersion":"1.0.0b3.r1",
	"maxVersion":"",
	"priority":400,
	"inRepository":true,
	"detectXPath":"//meta[substring(@name, 1, 3)='dc.' or substring(@name, 1, 9)='citation_'] | //link[substring(@rel, 1, 7)='schema.']",
	"lastUpdated":"2011-01-11 04:31:00"
}

// Known formats
// Reverse
var _n = {
	"http://purl.org/net/biblio#":"bib",
	"http://purl.org/dc/elements/1.1/":"dc",
	"http://purl.org/dc/terms/":"dcterms",
	"http://prismstandard.org/namespaces/1.2/basic/":"prism",
	"http://xmlns.com/foaf/0.1/":"foaf",
	"http://nwalsh.com/rdf/vCard#":"vcard",
	"http://www.w3.org/2006/vcard/ns#":"vcard2",	// currently used only for NSF, but is probably
							// very similar to the nwalsh vcard ontology in a
							// different namespace
	"http://purl.org/rss/1.0/modules/link/":"link",
	"http://www.zotero.org/namespaces/export#":"z",
	"http://purl.org/eprint/terms/":"eprint",
	"http://www.zotero.org/namespaces/ghcitation#":"gh" // XXX Hack until we can get a PURL for the citation_ stuff
};

// Maps actual prefix in use to URI
var _prefixes = {};

// These are the ones that we will read without a declared schema
var _dcDefined = false;
var _ghDefined = false;

function getPrefixes(doc) {
	if(_prefixes.length) {
		return _prefixes;
	}

	var links = doc.getElementsByTagName("link");
	for(var i=0; i<links.length; i++) {
		// Look for the schema's URI in our known schemata
		if(links[i].getAttribute("href") in _n) {
			var rel = links[i].getAttribute("rel");
			if(rel) {
				var matches = rel.match(/^schema\.([a-zA-Z]+)/);
				if(matches) {
					Zotero.debug("Prefix '" + matches[1].toLowerCase() +"' => '" + links[i].getAttribute("href") + "'");
					_prefixes[matches[1].toLowerCase()] = _n[links[i].getAttribute("href")];
					if (_n[links[i].getAttribute("href")] == "dc") {
						_dcDefined = true;	
					} else if (_n[links[i].getAttribute("href")] == "gh") {
						_ghDefined = true;
					}
				}
			}
		}
	}
	// We allow prefix-less DC and Google/Highwire
	if (!_dcDefined && !_prefixes["dc"]) {
		_prefixes["dc"] = "http://purl.org/dc/elements/1.1/";
	}
	if (!_ghDefined && !_prefixes["citation"]) {
		_prefixes["citation"] = "http://www.zotero.org/namespaces/ghcitation#"; // XXX Hack until we can get a PURL for the citation_ stuff
	}
	return _prefixes;
}

function detectWeb(doc, url) {
	var prefixes = getPrefixes(doc);
	
	var metaTags = doc.getElementsByTagName("meta");
	for(var i=0; i<metaTags.length; i++) {
		var tag = metaTags[i].getAttribute("name");
		// See if the supposed prefix is there, split by period or underscore
		if(tag && (prefixes[tag.split('.')[0].toLowerCase()] 
				|| prefixes[tag.split('_')[0].toLowerCase()])) {
			return "webpage";
		}
	}
	
	return false;
}

function doWeb(doc, url) {
	var prefixes = getPrefixes(doc);
	
	// load RDF translator, so that we don't need to replicate import code
	var translator = Zotero.loadTranslator("import");
	translator.setTranslator("5e3ad958-ac79-463d-812b-a86a9235c28f");
	translator.setHandler("itemDone", function(obj, newItem) {
		if (!newItem.url) newItem.url = doc.location.href;
		// add attachment
		newItem.attachments.push({document:doc});
		// add access date
		newItem.accessDate = 'CURRENT_TIMESTAMP';
		newItem.complete();
	});
	var rdf = translator.getTranslatorObject();
	
	var metaTags = doc.getElementsByTagName("meta");
	var foundTitle = false;		// We can use the page title if necessary
	for(var i=0; i<metaTags.length; i++) {
		var tag = metaTags[i].getAttribute("name");
		var value = metaTags[i].getAttribute("content");
		// See if the supposed prefix is there, split by period or underscore
		if(tag && (prefixes[tag.split('.')[0].toLowerCase()] 
				|| prefixes[tag.split('_')[0].toLowerCase()])) {
			// Set the delimiter for this tag
			var delim = (prefixes[tag.split('_')[0].toLowerCase()]) ? '_' : '.';
			var pieces = tag.split(delim);
			var prefix = pieces.shift();
			rdf.Zotero.RDF.addStatement(url, prefixes[prefix] + pieces.join(delim).toLowerCase(), value, true);
		}
	}
	
	rdf.defaultUnknownType = "webpage";
	rdf.doImport();
}
