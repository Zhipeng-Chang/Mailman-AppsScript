/**
 * @file A service focused on reading Google Docs as HTML.
 * @author {@link https://github.com/j-rewerts|Jared Rewerts}
 */


/**
 * This service handles reading Google Docs.
 * NOTE: The active user must be authorized to run this!
 *
 * @type {Object}
 */
var DocumentService = {
  openedDocuments: {},

  /**
   * Gets a Google Doc as HTML. Before opening the document, it checks a cache to save time.
   * @param {string} id The id of the Document.
   * @return {string} An HTML string that may include merge tags.
   */
  getDocumentAsHTML: function(id) {
    if (DocumentService.openedDocuments[id]) {
      return openedDocuments[id];
    }

    // Get as HTML
    var url = 'https://docs.google.com/feeds/download/documents/export/Export?id=' + id + '&exportFormat=html';
    var param = {
      method: 'get',
      headers: {
        'Authorization': 'Bearer ' + ScriptApp.getOAuthToken()
      },
      muteHttpExceptions: true,
    };
    var html = UrlFetchApp.fetch(url, param).getContentText();
    logger.info('Loading Doc {DocumentId}', id);
    DocumentService.openedDocuments[id] = html;

    return html;
  },

  /**
   * Gets the thumbnail URL for a Google Doc.
   * @param {string} id The id of the document.
   * @return {string} The URL of the docs thumbnail.
   */
  getThumbnail: function(id) {
    return Drive.Files.get(id).thumbnailLink;
  },

  /**
   * Gets the metadata associated with a Doc.
   * @param {string} id The id of the document.
   * @return {Object} The metadata of the Doc.
   */
  getMetadata: function(id) {
    return Drive.Files.get(id);
  }
};
