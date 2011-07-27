{
        "translatorID": "ea531652-cdeb-4ec2-940e-627d4b107263",
        "label": "AlterNet",
        "creator": "Jesse Johnson",
        "target": "^http://(?:www\\.)alternet.org",
        "minVersion": "1.0.0b4.r1",
        "maxVersion": "",
        "priority": 100,
        "inRepository": "1",
        "translatorType": 4,
        "lastUpdated": "2011-04-02 14:14:32"
}

/*
    Alternet - translator for Zotero
    Copyright (C) 2011 Jesse Johnson

    This program is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with this program.  If not, see <http://www.gnu.org/licenses/>.
*/

/****START STANDARD BLOCK****/
/**
    Copyright (c) 2010, Erik Hetzner

    This program is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with this program.  If not, see <http://www.gnu.org/licenses/>.
*/

function flatten(a) {
    var retval = new Array();
    for (var i in a) {
        var entry = a[i];
        if (entry instanceof Array) {
            retval = retval.concat(flatten(entry));
        } else {
            retval.push(entry);
        }
    }
    return retval;
}

/* Generic code */
var FW = {
    _scrapers : new Array()
};

FW._Base = function () {
    this.callHook = function (hookName, item, doc, url) {
        if (typeof this['hooks'] === 'object') {
            var hook = this['hooks'][hookName];
            if (typeof hook === 'function') {
                hook(item, doc, url);
            }
        }
    };

    this.evaluateThing = function(val, doc, url) {
        var valtype = typeof val;
        if (valtype === 'string') {
            return val;
        } else if (valtype === 'object') {
            if (val instanceof Array) {
                /* map over each array val */
                /* this.evaluate gets out of scope */
                var parentEval = this.evaluateThing;
                var retval = val.map ( function(i) { return parentEval (i, doc, url); } );
                return flatten(retval);
            } else {
                return val.evaluate(doc, url);
            }
        } else if (valtype === 'function') {
            return val(doc, url);
        } else {
            return undefined;
        }
    };

    this.evaluate = function (key, doc, url) {
        return this.evaluateThing(this[key], doc, url);
    };
};

FW.Scraper = function (init) { 
    FW._scrapers.push(new FW._Scraper(init));
};

FW._Scraper = function (init) {
    for (x in init) {
        this[x] = init[x];
    }

    this._singleFieldNames = [
        "abstractNote",
        "applicationNumber",
        "archive",
        "archiveLocation",
        "artworkMedium",
        "artworkSize",
        "assignee",
        "audioFileType",
        "audioRecordingType",
        "billNumber",
        "blogTitle",
        "bookTitle",
        "callNumber",
        "caseName",
        "code",
        "codeNumber",
        "codePages",
        "codeVolume",
        "committee",
        "company",
        "conferenceName",
        "country",
        "court",
        "date",
        "dateDecided",
        "dateEnacted",
        "dictionaryTitle",
        "distributor",
        "docketNumber",
        "documentNumber",
        "DOI",
        "edition",
        "encyclopediaTitle",
        "episodeNumber",
        "extra",
        "filingDate",
        "firstPage",
        "forumTitle",
        "genre",
        "history",
        "institution",
        "interviewMedium",
        "ISBN",
        "ISSN",
        "issue",
        "issueDate",
        "issuingAuthority",
        "journalAbbreviation",
        "label",
        "language",
        "legalStatus",
        "legislativeBody",
        "letterType",
        "libraryCatalog",
        "manuscriptType",
        "mapType",
        "medium",
        "meetingName",
        "nameOfAct",
        "network",
        "number",
        "numberOfVolumes",
        "numPages",
        "pages",
        "patentNumber",
        "place",
        "postType",
        "presentationType",
        "priorityNumbers",
        "proceedingsTitle",
        "programTitle",
        "programmingLanguage",
        "publicLawNumber",
        "publicationTitle",
        "publisher",
        "references",
        "reportNumber",
        "reportType",
        "reporter",
        "reporterVolume",
        "rights",
        "runningTime",
        "scale",
        "section",
        "series",
        "seriesNumber",
        "seriesText",
        "seriesTitle",
        "session",
        "shortTitle",
        "studio",
        "subject",
        "system",
        "thesisType",
        "title",
        "type",
        "university",
        "url",
        "version",
        "videoRecordingType",
        "volume",
        "websiteTitle",
        "websiteType" ];

    this.makeItems = function (doc, url) {
        var item = new Zotero.Item(this.itemType);
        item.url = url;
        for (var i in this._singleFieldNames) {
            var field = this._singleFieldNames[i];
            if (this[field]) {
                var fieldVal = this.evaluate(field, doc, url);
                if (fieldVal instanceof Array) {
                    item[field] = fieldVal[0];
                } else {
                    item[field] = fieldVal;
                }
            }
        }
        var multiFields = ["creators", "attachments", "tags"];
        for (var j in multiFields) {
            var key = multiFields[j];
            var val = this.evaluate(key, doc, url);
            if (val) {
                for (var k in val) {
                    item[key].push(val[k]);
                }
            }
        }
        return [item];
    };
};

FW._Scraper.prototype = new FW._Base;

FW.MultiScraper = function (init) { 
    FW._scrapers.push(new FW._MultiScraper(init));
};

FW._MultiScraper = function (init) {
    for (x in init) {
        this[x] = init[x];
    }

    this._mkSelectItems = function(titles, urls) {
        var items = new Object;
        for (var i in titles) {
            items[urls[i]] = titles[i];
        }
        return items;
    };

    this._selectItems = function(titles, urls) {
        var items = new Array();
        for (var j in Zotero.selectItems(this._mkSelectItems(titles, urls))) {
            items.push(j);
        }
       return items;
    };

    this._mkAttachments = function(doc, url, urls) {
        var attachmentsArray = this.evaluate('attachments', doc, url);
        var attachmentsDict = new Object();
        if (attachmentsArray) {
            for (var i in urls) {
                attachmentsDict[urls[i]] = attachmentsArray[i];
            }
        }
        return attachmentsDict;
    };

    this.makeItems = function(doc, url) {
        Zotero.debug("Entering MultiScraper.makeItems");
        if (this.beforeFilter) {
            var newurl = this.beforeFilter(doc, url);
            if (newurl != url) {
                return this.makeItems(Zotero.Utilities.retrieveDocument(url), newurl);
            }
        }
        var titles = this.evaluate('titles', doc, url);
        var urls = this.evaluate('urls', doc, url);
        var itemsToUse = this._selectItems(titles, urls);
        var attachments = this._mkAttachments(doc, url, urls);
        if(!itemsToUse) {
	    Zotero.done(true);
	    return [];
	} else {
            var madeItems = new Array();
            for (var i in itemsToUse) {
                var url1 = itemsToUse[i];
                var doc1 = Zotero.Utilities.retrieveDocument(url1);
                var itemTrans;
                if (this.itemTrans) {
                    itemTrans = this.itemTrans;                    
                } else {
                    itemTrans = FW.getScraper(doc1, url1);                    
                }
                var items = itemTrans.makeItems(doc1, url1, attachments[url1]);
                madeItems.push(items[0]);
            }
            return madeItems;
        }
    };
};

FW._MultiScraper.prototype = new FW._Base;

FW.DelegateTranslator = function (init) { 
    return new FW._DelegateTranslator(init);
};

FW._DelegateTranslator = function (init) {
    for (x in init) {
        this[x] = init[x];
    }
    
    this._translator = Zotero.loadTranslator(this.translatorType);
    this._translator.setTranslator(this.translatorId);
    
    this.makeItems = function(doc, url, attachments) {
        Zotero.debug("Entering DelegateTranslator.makeItems");
        var tmpItem;
        var text = Zotero.Utilities.retrieveSource(url);
        this._translator.setHandler("itemDone", function(obj, item) { 
                                        tmpItem = item;
                                        /* this does not seem to be working */
                                        if (attachments) { item.attachments = attachments; }
                                    });
	this._translator.setString(text);
        this._translator.translate();
        Zotero.debug("Leaving DelegateTranslator.makeItems");
        return [tmpItem];
    };
};

FW.DelegateTranslator.prototype = new FW._Scraper;

FW._StringMagic = function () {
    this._filters = new Array();

    this.addFilter = function(filter) {
        this._filters.push(filter);
        return this;
    };

    this.split = function(re) {
        return this.addFilter(function(s) {
            return s.split(re).filter(function(e) { return (e != ""); });
        });
    };

    this.replace = function(s1, s2, flags) {
        return this.addFilter(function(s) {
            if (s.match(s1)) {
                return s.replace(s1, s2, flags);
            } else {
                return s;
            }
        });
    };

    this.prepend = function(prefix) {
        return this.replace(/^/, prefix);
    };

    this.append = function(postfix) {
        return this.replace(/$/, postfix);
    };

    this.remove = function(toStrip, flags) {
        return this.replace(toStrip, '', flags);
    };

    this.trim = function() {
        return this.addFilter(function(s) { return Zotero.Utilities.trim(s); });
    };

    this.trimInternal = function() {
        return this.addFilter(function(s) { return Zotero.Utilities.trimInternal(s); });
    };

    this.match = function(re, group) {
        if (!group) group = 0;
        return this.addFilter(function(s) { 
                                  var m = s.match(re);
                                  if (m === undefined) { return undefined; }
                                  else { return m[group]; } 
                              });
    };

    this.cleanAuthor = function(type, useComma) {
        return this.addFilter(function(s) { return Zotero.Utilities.cleanAuthor(s, type, useComma); });
    };

    this.key = function(field) {
        return this.addFilter(function(n) { return n[field]; });
    };

    this.capitalizeTitle = function() {
        return this.addFilter(function(s) { return Zotero.Utilities.capitalizeTitle(s); });
    };

    this.unescapeHTML = function() {
        return this.addFilter(function(s) { return Zotero.Utilities.unescapeHTML(s); });
    };

    this.unescape = function() {
        return this.addFilter(function(s) { return unescape(s); });
    };

    this.makeAttachment = function(type, title) {
        var filter = function(url) {
            if (url) {
                return { url   : url,
                         type  : type,
                         title : title };
            } else {
                return undefined;
            }
        };
        return this.addFilter(filter);
    };

    this._applyFilters = function(a, doc1) {
        Zotero.debug("Entering StringMagic._applyFilters");
        for (i in this._filters) {
            a = flatten(a);
            /* remove undefined or null array entries */
            a = a.filter(function(x) { return ((x !== undefined) && (x !== null)); });
            for (var j = 0 ; j < a.length ; j++) {
                try {
                    if ((a[j] === undefined) || (a[j] === null)) { continue; }
                    else { a[j] = this._filters[i](a[j], doc1); }
                } catch (x) {
                    a[j] = undefined;
                    Zotero.debug("Caught exception " + x + "on filter: " + this._filters[i]);
                }
            }
            /* remove undefined or null array entries */
            /* need this twice because they could have become undefined or null along the way */
            a = a.filter(function(x) { return ((x !== undefined) && (x !== null)); });
        }
        return a;
    };
};

FW.PageText = function () {
    return new FW._PageText();
};

FW._PageText = function() {
    this._filters = new Array();

    this.evaluate = function (doc) {        
        var a = [doc.documentElement.innerHTML];
        a = this._applyFilters(a, doc);
        if (a.length == 0) { return false; }
        else { return a; }
    };
};

FW._PageText.prototype = new FW._StringMagic();

FW.Url = function () { return new FW._Url(); };

FW._Url = function () {
    this._filters = new Array();

    this.evaluate = function (doc, url) {        
        var a = [url];
        a = this._applyFilters(a, doc);
        if (a.length == 0) { return false; }
        else { return a; }
    };
};

FW._Url.prototype = new FW._StringMagic();

FW.Xpath = function (xpathExpr) { return new FW._Xpath(xpathExpr); };

FW._Xpath = function (_xpath) {
    this._xpath = _xpath;
    this._filters = new Array();

    this.text = function() {
        var filter = function(n) {
            if (typeof n === 'object' && n.textContent) { return n.textContent; }
            else { return n; }
        };
        this.addFilter(filter);
        return this;
    };

    this.sub = function(xpath) {
        var filter = function(n, doc) {
            var result = doc.evaluate(xpath, n, null, XPathResult.ANY_TYPE, null);
            if (result) {
                return result.iterateNext();
            } else {
                return undefined;               
            }
        };
        this.addFilter(filter);
        return this;
    };

    this.evaluate = function (doc) {
        var it = doc.evaluate(this._xpath, doc, null, XPathResult.ANY_TYPE, null);
        var a = new Array();
        var x;
        while (x = it.iterateNext()) { a.push(x); }
        a = this._applyFilters(a, doc);
        if (a.length == 0) { return false; }
        else { return a; }
    };
};

FW._Xpath.prototype = new FW._StringMagic();

FW.detectWeb = function (doc, url) {
    for (var i in FW._scrapers) {
	var scraper = FW._scrapers[i];
	var itemType = scraper.evaluate('itemType', doc, url);
	if (!scraper.detect) {
	    return itemType;
	} else {
	    var v = scraper.evaluate('detect', doc, url);
            if (v.length > 0 && v[0]) {
		return itemType;
	    }
	}
    }
    return undefined;
};

FW.getScraper = function (doc, url) {
    var itemType = FW.detectWeb(doc, url);
    return FW._scrapers.filter(function(s) {
        return (s.evaluate('itemType', doc, url) == itemType)
	&& (s.evaluate('detect', doc, url))
    })[0];
};

FW.doWeb = function (doc, url) {
    Zotero.debug("Entering FW.doWeb");
    var scraper = FW.getScraper(doc, url);
    var items = scraper.makeItems(doc, url);
    for (var i in items) {
        scraper.callHook('scraperDone', items[i], doc, url);
        items[i].complete();
    }
    Zotero.debug("Leaving FW.doWeb");
};

/* End generic code */
/****END STANDARD BLOCK****/

function detectWeb(doc, url) { 
		return FW.detectWeb(doc, url);
}
function doWeb(doc, url) { return FW.doWeb(doc, url); }


/** Articles */
FW.Scraper({ itemType         : 'magazineArticle',
             detect           : FW.Xpath('//div[@class="headline"]/h1'),
             title 	      : FW.Xpath('//div[@class="headline"]/h1').text(),
             creators         : FW.Xpath('//meta[@name="author"]/@content').text().split(',').cleanAuthor("author"),
             date             : FW.Xpath('//div[@class="story-date"]/em').text(),
             abstractNote     : FW.Xpath('//div[@class="teaser"]').text().trim(),
             extra 	      : FW.Xpath('//meta[@name="source"]/@content').text().prepend("Source of article: "),
             tags 	      : FW.Xpath('//meta[@name="keywords"]/@content').text().split(",").trim(),
	     attachments      : [ FW.Xpath('//div[@class="story_tools_print"]/a').key("href").makeAttachment("text/html", "AlterNet Article Snapshot") ],
	     publicationTitle : "AlterNet",
	     url 	      : FW.Url(),
});

/** Blogs 
FW.Scraper({ itemType         : 'blogPost',
             detect           : FW.Url.match(/blogs\.alternet/),
	     title	      : FW.Xpath('//meta[@name="author"]/@content').text(),
});
*/

/** Search results 
Erik's framework won't work, since the results are in an iframe
This will need to be done the traditional way, or the framework will need to be extended
FW.MultiScraper({ itemType  : "multiple",
                  detect    : FW.Url().match(/google\.com.*search_results\.html/),
                  titles    : FW.Xpath('//div[@id="res"]//ol/li//h2/a').text(),
                  urls      : FW.Xpath('//div[@id="res"]//ol/li//h2/a').key('href').text()
});*/
