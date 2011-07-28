{
	"translatorID":"c159dcfe-8a53-4301-a499-30f6549c340d",
	"translatorType":4,
	"label":"DOI/ISBN",
	"creator":"Simon Kornblith",
	"target":null,
	"minVersion":"1.0.10",
	"maxVersion":"",
	"priority":300,
	"inRepository":true,
	"lastUpdated":"2011-05-06 01:44:18"
}

var items = {};
var selectArray = {};

// builds a list of DOIs
function getDOIs(doc) {
	// TODO Detect DOIs more correctly.
	// The actual rules for DOIs are very lax-- but we're more strict.
	// Specifically, we should allow space characters, and all Unicode
	// characters except for control characters. Here, we're cheating
	// by not allowing ampersands, to fix an issue with getting DOIs
	// out of URLs.
	// Description at: http://www.doi.org/handbook_2000/appendix_1.html#A1-4
	const DOIre = /\b(10\.[\w.]+\/[^\s&]+)\.?\b/igm;
	const DOIXPath = "//text()[contains(., '10.')]";
	
	DOIre.lastMatch = 0;
	var DOIs = [];
	
	var node, m;
	var results = doc.evaluate(DOIXPath, doc, null, XPathResult.ANY_TYPE, null);
	while(node = results.iterateNext()) {
		while(m = DOIre.exec(node.nodeValue)) {
			var DOI = m[1];
			if(DOI.substr(-1) == ")" && DOI.indexOf("(") == -1) {
				DOI = DOI.substr(0, DOI.length-1);
			}
			// only add new DOIs
			if(DOIs.indexOf(DOI) == -1) {
				DOIs.push(DOI);
			}
		}
	}
	
	return DOIs;
}

// builds a list of ISBNs
function getISBNs(doc) {
	const ISBNre = /[0-9]{3}[0-9-‐‑‒–—―]{3,13}[0-9X]/gim;
	
	var source = doc.documentElement.innerHTML;

	ISBNre.lastMatch = 0;
	var ISBNs = [];
	var badIDs = [];
	
	var m;
	while(m = ISBNre.exec(source)) {
		var ISBN = m[0];
		ISBN = ISBN.replace(/[^0-9xX]/g,'').toUpperCase();
		// only add new ISBNs, not previously found to be bad
		// We handle ISBN-13 only to eliminate false positives
		if(ISBN.length == 13
				&& ISBNs.indexOf(ISBN) == -1
				&& badIDs.indexOf(ISBN) == -1) {
			var checked = idCheck(ISBN);
			if (checked["isbn13"]) {
				ISBNs.push(checked["isbn13"]);
			} else {
				badIDs.push(ISBN);
				Zotero.debug("Discarding invalid ISBN " + ISBN);
			}
		}
	}
	
	return ISBNs;
}

function detectWeb(doc, url) {
	const blacklistRe = /^https?:\/\/[^/]*google\.com/i;
	
	if(!blacklistRe.test(url)) {
		var ISBNs = getISBNs(doc);
		var DOIs = getDOIs(doc);
		if (DOIs.length + ISBNs.length > 1) {
			return "multiple";
		}
		if(DOIs.length) {
			return "journalArticle";
		}
		if(ISBNs.length) {
			return "book";
		}
	}
	return false;
}

function retrieveNextIdentifier(ids, doc) {
	if(ids.doi.length) {
		// retrieve DOI
		var DOI = ids.doi.shift();
		var translate = Zotero.loadTranslator("search");
		translate.setTranslator("11645bd1-0420-45c1-badb-53fb41eeb753");
		var item = {"itemType":"journalArticle", "DOI":DOI};
		translate.setSearch(item);
		// don't save when item is done
		translate.setHandler("itemDone", function(translate, item) {
			item.repository = "CrossRef";
			items[DOI] = item;
			selectArray[DOI] = item.title;
		});
		translate.setHandler("done", function(translate) {
			retrieveNextIdentifier(ids, doc);
		});
		translate.translate();
	} else if (ids.isbn.length) {
		// retrieve ISBN
		var ISBN = ids.isbn.shift();
		var translate = Zotero.loadTranslator("search");
		translate.setTranslator("c73a4a8c-3ef1-4ec8-8229-7531ee384cc4");
		var item = {"itemType":"book", "ISBN":ISBN};
		translate.setSearch(item);
		// don't save when item is done
		translate.setHandler("itemDone", function(translate, item) {
			item.repository = "Open WorldCat";
			items[ISBN] = item;
			selectArray[ISBN] = item.title;
		});
		translate.setHandler("done", function(translate) {
			retrieveNextIdentifier(ids, doc);
		});
		translate.translate();
	} else {
		// all identifiers retrieved now
		// check to see if there is more than one identifier
		var numIDs = 0;
		for(var ID in selectArray) {
			numIDs++;
			if(numIDs == 2) break;
		}
		if(numIDs == 0) {
			throw "Identifier Translator: could not find identifier";
		} else if(numIDs == 1) {
			// do we want to add URL of the page?
			items[ID].url = doc.location.href;
			items[ID].attachments = [{document:doc}];
			items[ID].complete();
		} else {
			selectArray = Zotero.selectItems(selectArray);
			for(var ID in selectArray) {
				items[ID].complete();
			}
		}
		Zotero.done();
	}
}

function doWeb(doc, url) {
	var DOIs = getDOIs(doc);
	var ISBNs = getISBNs(doc);
	// retrieve full items asynchronously
	Zotero.wait();
	retrieveNextIdentifier({doi:DOIs, isbn:ISBNs}, doc);
}

// Implementation of ISBN and ISSN check-digit verification
// Based on ISBN Users' Manual (http://www.isbn.org/standards/home/isbn/international/html/usm4.htm)
// and the Wikipedia treatment of ISBN (http://en.wikipedia.org/wiki/International_Standard_Book_Number)
// and the Wikipedia treatment of ISSN (http://en.wikipedia.org/wiki/International_Standard_Serial_Number)

// This will also check ISMN validity, although it does not distinguish from their
// neighbors in namespace, ISBN-13. It does not handle pre-2008 M-prefixed ISMNs; see
// http://en.wikipedia.org/wiki/International_Standard_Music_Number

// This does not validate multiple identifiers in one field,
// but it will gracefully ignore all non-number detritus,
// such as extraneous hyphens, spaces, and comments.

// It currently maintains hyphens in non-initial and non-final position,
// discarding consecutive ones beyond the first as well.

// It also adds the customary hyphen to valid ISSNs.

// Takes the first 8 valid digits and tries to read an ISSN,
// takes the first 10 valid digits and tries to read an ISBN 10 or a UPC-A,
// and takes the first 13 valid digits to try to read an ISBN 13 or EAN
// Returns an object with five attributes:
// 	"issn" 
// 	"isbn10"
// 	"isbn13"
// 	"upc"
//	"ean"
// Each will be set to a valid identifier if found, and otherwise be a
// boolean false.

// The UPC logic is for a 10-digit UPC-A; the newer EAN system is equivalent
// to the isbn13 algorithm.

// There could conceivably be a valid ISBN-13 with an ISBN-10
// substring; this should probably be interpreted as the latter, but it is a
// client UI issue.
idCheck = function(isbn) {
	// For ISBN 10, multiple by these coefficients, take the sum mod 11
	// and subtract from 11
	var isbn10 = [10, 9, 8, 7, 6, 5, 4, 3, 2];

	// For ISBN 13, multiple by these coefficients, take the sum mod 10
	// and subtract from 10
	var isbn13 = [1, 3, 1, 3, 1, 3, 1, 3, 1, 3, 1, 3];

	// For ISSN, multiply by these coefficients, take the sum mod 11
	// and subtract from 11
	var issn =   [8, 7, 6, 5, 4, 3, 2];
	
	// For UPC, multiply by these coefficients, take the sum mod 10
	// and subtract from 10
	var upc =   [3, 1, 3, 1, 3, 1, 3, 1, 3];

	// We make a single pass through the provided string, interpreting the
	// first 10 valid characters as an ISBN-10, and the first 13 as an
	// ISBN-13. We then return an array of booleans and valid detected
	// ISBNs.

	var j = 0;
	var sum8 = 0;
	var num8 = "";
	var sum10 = 0;
	var sum_upc = 0;
	var num10 = "";
	var sum13 = 0;
	var num13 = "";
	var chars = [];

	for (var i=0; i < isbn.length; i++) {
		if (isbn.charAt(i) == " ") {
			// Since the space character evaluates as a number,
			// it is a special case.
		} else if (j > 0 && isbn.charAt(i) == "-" && isbn.charAt(i-1) != "-") {
			// Preserve hyphens, except in initial and final position
			// Also discard consecutive hyphens
			if(j < 7) num8 += "-";
			if(j < 10) num10 += "-";
			if(j < 13) num13 += "-";
		} else if (j < 7 && ((isbn.charAt(i) - 0) == isbn.charAt(i))) {
			sum8 += isbn.charAt(i) * issn[j];
			sum10 += isbn.charAt(i) * isbn10[j];
			sum_upc += isbn.charAt(i) * upc[j];
			sum13 += isbn.charAt(i) * isbn13[j];
			num8 += isbn.charAt(i);
			num10 += isbn.charAt(i);
			num13 += isbn.charAt(i);
			j++;
		} else if (j == 7 &&
			(isbn.charAt(i) == "X" || isbn.charAt(i) == "x" ||
				((isbn.charAt(i) - 0) == isbn.charAt(i)))) {
			// In ISSN, an X represents the check digit "10".
			if(isbn.charAt(i) == "X" || isbn.charAt(i) == "x") {
				var check8 = 10;
				num8 += "X";
			} else {
				var check8 = isbn.charAt(i);
				sum10 += isbn.charAt(i) * isbn10[j];
				sum_upc += isbn.charAt(i) * upc[j];
				sum13 += isbn.charAt(i) * isbn13[j];
				num8 += isbn.charAt(i);
				num10 += isbn.charAt(i);
				num13 += isbn.charAt(i);
				j++;
			}
		} else if (j < 9 && ((isbn.charAt(i) - 0) == isbn.charAt(i))) {
			sum10 += isbn.charAt(i) * isbn10[j];
			sum_upc += isbn.charAt(i) * upc[j];
			sum13 += isbn.charAt(i) * isbn13[j];
			num10 += isbn.charAt(i);
			num13 += isbn.charAt(i);
			j++;
		} else if (j == 9 &&
			(isbn.charAt(i) == "X" || isbn.charAt(i) == "x" ||
				((isbn.charAt(i) - 0) == isbn.charAt(i)))) {
			// In ISBN-10, an X represents the check digit "10".
			if(isbn.charAt(i) == "X" || isbn.charAt(i) == "x") {
				var check10 = 10;
				num10 += "X";
			} else {
				var check10 = isbn.charAt(i);
				var check_upc = isbn.charAt(i);
				sum13 += isbn.charAt(i) * isbn13[j];
				num10 += isbn.charAt(i);
				num13 += isbn.charAt(i);
				j++;
			}
		} else if(j < 12 && ((isbn.charAt(i) - 0) == isbn.charAt(i))) {
			sum13 += isbn.charAt(i) * isbn13[j];
			num13 += isbn.charAt(i);
			j++;
		} else if (j == 12 && ((isbn.charAt(i) - 0) == isbn.charAt(i))) {
			var check13 = isbn.charAt(i);
			num13 += isbn.charAt(i);
		}
	}
	var valid8  = ((11 - sum8 % 11) % 11) == check8;
	var valid10 = ((11 - sum10 % 11) % 11) == check10;
	var valid_upc = ((10 - sum_upc % 10) % 10) == check_upc;
	var valid13 = ((10 - sum13 % 10) % 10) == check13;
	var matches = false;
	
	// Since ISSNs have a standard hyphen placement, we can add a hyphen
	if (valid8 && (matches = num8.match(/([0-9]{4})([0-9]{3}[0-9Xx])/))) {
		num8 = matches[1] + '-' + matches[2];
	} 

	var num_upc = num10;
	var num_ean = num13;

	if(!valid8) {num8 = false};
	if(!valid10) {num10 = false};
	if(!valid_upc) {num_upc = false};
	if(!valid13) {num_ean = false; num13 = false;};
	// Enforce that UPC-13 is an EAN from Bookland, with prefix 978 or 979
	if(num13 && num13.substr(0,3) != "978"
	 		    && num13.substr(0,3) != "979") num13 = false;
	return {"isbn10" : num10, "isbn13" : num13, "issn" : num8, "upc" : num_upc, "ean" : num_ean};
}
