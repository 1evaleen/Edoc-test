class SearchResult {
    el = null;
    countEl = null;
    static bemBlock = 'search-result';
    projectId = '';
    documentId = '';
    data = null;

    constructor(data) {
        this.data = data;
        this.projectId = data.projectid;
        this.documentId = data.documentid;

        this.el = document.createElement('li');
        this.el.className = SearchResult.bemBlock;
    
        // for demo purposes all the things re inline. TODO: better UX needed
        const docNameEl = SearchResult.element('__document-name', `${data.documentname} - ${data.litDesc} - ${data.litRef}`)
        const taskCountEl = SearchResult.element('__task-count')
        this.countEl = SearchResult.element('__task-count-value', '', 'span');
        const siteNameEl = SearchResult.element('__site-name', data.sitename);        
        const projectNameEl = SearchResult.element('__project-name', data.projectformname);
        
        this.el.appendChild(docNameEl);
        this.el.appendChild(taskCountEl);
        this.el.appendChild(siteNameEl);
        this.el.appendChild(projectNameEl);
    }

    static element = (bemElement, text, nodeType) => {
        const node = document.createElement(nodeType || 'div');
        node.className = `${SearchResult.bemBlock}${bemElement || ''}`;
        node.appendChild(document.createTextNode(text || ''));
        return node
    }    
}
