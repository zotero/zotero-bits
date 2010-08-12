{
	"translatorID":"57a00950-f0d1-4b41-b6ba-44ff0fc30289",
	"translatorType":4,
	"label":"Google Scholar",
	"creator":"Simon Kornblith, Frank Bennett",
	"target":"http://scholar\\.google\\.(?:com|com?\\.[a-z]{2}|[a-z]{2}|co\\.[a-z]{2})/scholar(?:_case)*",
	"minVersion":"1.0.0b3.r1",
	"maxVersion":"",
	"priority":100,
	"inRepository":true,
	"lastUpdated":"2010-05-02 15:55:00"
}

// Test pages
//
// Searches of Google Scholar with the following terms should yield a folder
// icon that works.  Check that unlinked ([CITATION]) items that provide
// no BibTeX data (there is currently one under "Marbury v. Madison") are
// dropped from the listings:
//
//   marbury v madison
//   kelo
//   smith
//   view of the cathedral
//
// "How cited" pages should NOT yield a page or folder icon.  The
// Urls to these currently look like this:
//
//   http://scholar.google.co.jp/scholar_case?about=1101424605047973909&q=kelo&hl=en&as_sdt=2002
//
// Case pages should present a document icon that works:
//
//   http://scholar.google.co.jp/scholar_case?case=18273389148555376997&hl=en&as_sdt=2002&kqfp=13204897074208725174&kql=186&kqpfp=16170611681001262513#kq


// Translator-global var, used by scrapeListing()
var haveBibTexLinks;

var detectWeb = function (doc, url) {
	// Am I a case, a search listing, or something else?
	if (url.match(/scholar_case/)) {
		if (url.match(/about=/)) {
			//Listings of case cross-references are not directly scrapable
			return false;
		} else {
			return "case";
		}
	} else {
		return "multiple";
	}
};

// This gets instantiated once per item.
// Used in both scrapeCase() and scrapeListing()
var ItemFactory = function (citeletString, attachmentLinks, titleString, bibtexLink) {
	// (false if found empty)

	// var strings
	this.v = {};
	this.v.title = titleString;
	this.v.number = false;
	this.v.court = false;
	this.v.extra = false;
	this.v.date = undefined;
	this.v.jurisdiction = false;
	this.v.docketNumber = false;
	this.v.volRepPag = [];
	// portable array
	this.attachmentLinks = attachmentLinks;
	// working strings
	this.citelet = citeletString;
	this.bibtexLink = bibtexLink;
	this.bibtexData = undefined;
	// simple arrays of strings
	this.hyphenSplit = false;
	this.commaSplit = false;
	this.colonSplit = false;
	this.attachments = false;
};

ItemFactory.prototype.getDate = function () {
	var i, m;
	if (!this.hyphenSplit) {
		this.hyphenSplit = this.citelet.split(/\s+-\s+/);
	}
	if (!this.v.date && this.v.date !== false) {
		this.v.date = false;
		for (i = this.hyphenSplit.length - 1; i > -1; i += -1) {
			m = this.hyphenSplit[i].match(/(.*)\s+([0-9]{4})$/);
			if (m) {
				this.v.date = m[2];
				this.hyphenSplit[i] = m[1];
				this.hyphenSplit = this.hyphenSplit.slice(0, i + 1);
				break;
			}
		}
	}
	return this.v.date;
};

ItemFactory.prototype.hasInitials = function () {
	if (this.hyphenSplit.length && this.hyphenSplit[0].match(/[A-Z] /)) {
		return true;
	}
	return false;
}

ItemFactory.prototype.hasUsefulData = function () {
	if (this.getDate()) {
		return true;
	}
	// If no year found in the citelet, this could
	// be a citation that provides BibTeX without any
	// useful hints in the citelet (looking at you,
	// Harvard Law Review).
	//
	// We could check the BibTeX entry directly, but
	// raising traffic on the GS server can trigger
	// a lockout of the user.  As a second-best
	// alternative, we check the first hyphen split
	// of the citelet for all-caps strings (author
	// initials), which suggest a non-case, and drop
	// only items for which none are found.
	if (this.hasInitials()) {
		return true;
	}
	return false;
};

ItemFactory.prototype.getBibtexData = function () {
	if (!this.bibtexData) {
		if (this.bibtexData !== false) {
			var bibtexData = Zotero.Utilities.retrieveSource(this.bibtexLink);
			if (!bibtexData.match(/title={{}}/)) {
				this.bibtexData = bibtexData;
			} else {
				this.bibtexData = false;
			}
		}
	}
	return this.bibtexData;
};

ItemFactory.prototype.getAttachments = function () {
	var attachments, i, ilen;
	attachments = [];
	for (i = 0, ilen = this.attachmentLinks.length; i < ilen; i += 1) {
		attachments.push({title:"Google Scholar Linked Page", type:"text/html",
			                  url:this.attachmentLinks[i]});

	}
	return attachments;
};

ItemFactory.prototype.getCourt = function () {
	var s, m;
	s = this.hyphenSplit.pop().replace(/,\s*$/, "").replace(/\u2026\s*$/, "Court");
	m = s.match(/(?:([a-zA-Z]+):\s*)*(.*)/);
	if (m) {
		this.v.court = m[2].replace("_", " ", "g");
		if (m[1]) {
			this.v.extra = "{:jurisdiction: " + m[1] + "}";
		}
	}
	return this.v.court;
};

ItemFactory.prototype.getVolRepPag = function () {
	var i, m;
	if (this.hyphenSplit.length) {
		this.commaSplit = this.hyphenSplit.slice(-1)[0].split(/\s*,\s+/);
		var gotOne = false;
		for (i = this.commaSplit.length - 1; i > -1; i += -1) {
			m = this.commaSplit[i].match(/^([0-9]+)\s+(.*)\s+(.*)/);
			if (m) {
				var volRepPag = {};
				volRepPag.volume = m[1];
				volRepPag.reporter = m[2];
				volRepPag.pages = m[3].replace(/\s*$/, "");
				this.commaSplit.pop();
				if (!volRepPag.pages.match(/[0-9]$/) && (i > 0 || gotOne)) {
					continue;
				}
				gotOne = true;
				this.v.volRepPag.push(volRepPag);
			} else {
				break;
			}
		}
	}
}

ItemFactory.prototype.getTitle = function () {
	if (this.commaSplit) {
		this.v.title = this.commaSplit.join(", ");
	}
}

ItemFactory.prototype.setTitle = function (title) {
	this.v.title = title;
}

ItemFactory.prototype.hasReporter = function () {
	if (this.v.volRepPag.length > 0) {
		return true;
	}
	return false;
};

ItemFactory.prototype.getDocketNumber = function () {
	var doc;
	// Needs doc fetch and xpath
	doc = Zotero.Utilities.retrieveDocument(this.attachmentLinks[0]);
	var nsResolver = doc.createNSResolver(doc.documentElement);
	if (doc) {
		var docNumFrag = doc.evaluate('//center[preceding-sibling::center//h3[@id="gsl_case_name"]]', doc, nsResolver, XPathResult.ANY_TYPE, null).iterateNext();
		if (docNumFrag) {
			this.v.docketNumber = docNumFrag.textContent.replace(/^\s*[Nn][Oo](?:.|\s+)\s*/, "").replace(/\.\s*$/, "");
		}
	}
};

ItemFactory.prototype.saveItem = function () {
	var i, ilen, key;
	if (this.v.title) {
		if (this.v.volRepPag.length) {
			for (i = 0, ilen = this.v.volRepPag.length; i < ilen; i += 1) {
				this.item = new Zotero.Item("case");
				for (key in this.v.volRepPag[i]) {
					if (this.v.volRepPag[i][key]) {
						this.item[key] = this.v.volRepPag[i][key];
					}
				}
				this.saveItemCommonVars();
				if (i === (this.v.volRepPag.length - 1)) {
					this.item.attachments = this.getAttachments();
				}
				this.item.complete();
			};
		} else {
			this.item = new Zotero.Item("case");
			this.saveItemCommonVars();
			this.item.attachments = this.getAttachments();
			this.item.complete();
		}
	}
};

ItemFactory.prototype.saveItemCommonVars = function () {
	for (key in this.v) {
		if (this.v[key]) {
			if (key === "volRepPag") {
				continue;
			} else {
				this.item[key] = this.v[key];
			}
		}
	}
};

ItemFactory.prototype.parseCaseCitelet = function () {
	// citelet looks kind of like this
	// Powell v. McCormack, 395 US 486 - Supreme Court 1969
	this.getDate();
	this.getCourt();
	this.getVolRepPag();
	this.getTitle();
};

ItemFactory.prototype.parseListingCitelet = function () {
	this.getCourt();
	this.getVolRepPag();
};


// Cases are cross-referenced. Need to be able to fetch some kind of
// metadata out of target pages to take advantage of linked
// references in research.
var scrapeCase = function (doc, url) {
	// Citelet is identified by
	// id="gsl_reference"
	var nsResolver = doc.createNSResolver(doc.documentElement);
	var refFrag = doc.evaluate('//div[@id="gsl_reference"]', doc, nsResolver, XPathResult.ANY_TYPE, null).iterateNext();
	if (refFrag) {
		var item = new Zotero.Item("case");
		var factory = new ItemFactory(refFrag.textContent, [url]);
		factory.parseCaseCitelet();
		factory.saveItem();
	}
};

var scrapeListing = function (doc) {
	var nsResolver = doc.createNSResolver(doc.documentElement);

	// XML fragment lists
	var titleFrags = doc.evaluate('//div[@class="gs_r"]//h3', doc, nsResolver, XPathResult.ANY_TYPE, null);
	var citeletFrags = doc.evaluate('//span[@class="gs_a"]', doc, nsResolver, XPathResult.ANY_TYPE, null);
	var  bibtexFrags = doc.evaluate('//a[contains(@href, "scholar.bib")]',
				doc, nsResolver, XPathResult.ANY_TYPE, null);

	var labels = [];
	var factories = [];

	while (true) {
		var titleFrag = titleFrags.iterateNext();
		if (!titleFrag) {
			break;
		}
		// initialize argument values
		var titleString = titleFrag.textContent;
		var citeletString = citeletFrags.iterateNext().textContent;
		var bibtexLink = bibtexFrags.iterateNext().href;
		var attachmentFrag = doc.evaluate('.//a',
				titleFrag, nsResolver, XPathResult.ANY_TYPE, null).iterateNext();
		if (attachmentFrag) {
			var attachmentLinks = [attachmentFrag.href];
		} else {
			var attachmentLinks = [];
		}

		// Instantiate item factory with available data
		var iFactory = new ItemFactory(citeletString, attachmentLinks, titleString, bibtexLink);

		if (!iFactory.hasUsefulData()) {
			continue;
		}
		// (Feed the array used in the selection list)
		labels.push(titleString);
		factories.push(iFactory);
	}

	var items = Zotero.selectItems(labels);

	if(!items) {
		return false;
	}

	// The only supplementary translator we use is BibTeX
	var translator = Zotero.loadTranslator("import");
	translator.setTranslator("9cb70025-a888-4a29-a210-93ec52da40d4");
	translator.setHandler("itemDone", function(obj, item) {
		item.attachments = attachments;
		item.complete();
	});

	for(var i in items) {
		var factory = factories[i];
		var res = factory.getBibtexData();
		if (res) {
			// Has BibTeX data with title, pass it through to the BibTeX translator
			var attachments = factory.getAttachments();
			translator.setString(res);
			translator.translate();
		} else {
			// If BibTeX is empty, this is some kind of case, if anything.
			// Metadata from the citelet, supplemented by the target
			// document for the docket number, if necessary.
			factory.parseListingCitelet();
			factory.setTitle(items[i]);
			if (!factory.hasReporter()) {
				factory.getDocketNumber();
			}
			factory.saveItem();
		}
	}
	return true;
};

function doWeb(doc, url) {
	var nsResolver = doc.createNSResolver(doc.documentElement);
	if (url.match(/scholar_case/)) {
		scrapeCase(doc, url);
	} else {
		// SR: force use bibtex data, English version of page
		haveBibTexLinks = doc.evaluate('//a[contains(@href, "scholar.bib")]',
			doc, nsResolver, XPathResult.ANY_TYPE, null).iterateNext();
		if(!haveBibTexLinks) {
			url = url.replace (/hl\=[^&]*&?/, "");
			url = url.replace("scholar?", "scholar_setprefs?hl=en&scis=yes&scisf=4&submit=Save+Preferences&");
			haveBibTexLinks = true;
			doc = Zotero.Utilities.retrieveDocument(url);
		}
		scrapeListing(doc);
	}
}
