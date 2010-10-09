{
    "translatorID"   : "f0cc883d-602b-4ad1-b704-8b21a38158f2",
    "translatorType" : 4,
    "label"          : "LA Times",
    "creator"        : "Erik Hetzner",
    "target"         : "^http://(www\\.|latimesblogs\\.|lakersblog\\.)?latimes\\.com/",
    "minVersion"     : "2.0",
    "maxVersion"     : "",
    "priority"       : 100,
    "inRepository"   : true,
    "lastUpdated"    : "2010-07-01 20:25:59-07:00"
}

//@framework@

function detectWeb(doc, url) { return FW.detectWeb(doc, url); }
function doWeb(doc, url) { return FW.doWeb(doc, url); }

/** Articles */
FW.Scraper({ itemType         : 'newspaperArticle',
             detect           : FW.Xpath('//div[@class="story"]/h1').text(),
             title            : FW.Xpath('//div[@class="story"]/h1').text().trim(),
             abstractNote     : FW.Xpath('/head/meta[@name="description"]/@content').text(),
             attachments      : FW.Url().makeAttachment("text/html", "LA Times Snapshot"),
             creators         : FW.Xpath('//div[@class="byline"]//span[@class="byline"]').text().remove(/^By /).remove(/,.*$/).cleanAuthor("author"),
             date             : FW.Xpath('//div[@class="byline"]//span[@class="dateString"]').text(),
             ISSN             : "0458-3035",
             publicationTitle : "Los Angeles Times",
             section          : FW.Xpath('//span[@id="sectionBreadcrumb"]').text().capitalizeTitle() });

/** Blog posts
 *
 * Cannot get creator usefully from the junk they give us. 
 */
FW.Scraper({ itemType         : 'blogPost',
             detect           : FW.Xpath('//div[@id="blog-header"]'),
             title            : FW.Xpath('//div[@class="entry"]/h1[@class="entry-header"]').text().trim(),
             attachments      : FW.Url().makeAttachment("text/html", "LA Times Snapshot"),
             date             : FW.Xpath('//div[@class="entry"]/div[@class="time"]').text().match(/^(.* [0-9]{4})/),
             publicationTitle : FW.Xpath('//div[@id="blog-header"]/h1').text().prepend("LA Times Blogs: ") });

/** Search results
 * 
 * Not able to get blog results, because they are hosted on different
 * domains, JS gives us an error.
 */
FW.MultiScraper({ itemType  : "multiple",
                  detect    : FW.Xpath('//ul[@class="results-list"]'),
                  titles    : FW.Xpath('//ul[@class="results-list"]//h3').text().trim(),
                  urls      : FW.Xpath('//ul[@class="results-list"]//h3/a').key('href').text() });

