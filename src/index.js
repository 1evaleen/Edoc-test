const LOGIN_API = "https://edocsapi.azurewebsites.net/Auth/api/Login";
const API = "https://edocsapi.azurewebsites.net/Core6/api";
const appToken = "xikxafatwae";
let token = sessionStorage.getItem('edocs_token');

if(!token) {
    authenticate();
}

const loginDetails = {
 username: "testuser1@edocuments.co.uk",
 password: "20DemoPass20"
};

const searchResultsListEl = document.getElementById('results');
const searchInput = document.getElementById('search');
const btnSearch = document.getElementById('btnSearch');
const docsEl = document.getElementById('documents');

btnSearch.addEventListener('click', () => {
    const headers = buildHeaders(token);
    let searchTerm = searchInput.value.trim();
    getSearchResultsByName(searchTerm, headers).then(results => {
        const searchResultsElements = results.map(r => new SearchResult(r));
        const projectIds = results.reduce((prev, next) => {
            prev[next.projectid] = true;
            return prev;
        }, {});
        const docFrag = searchResultsElements.reduce((prev, next) => {
            prev.appendChild(next.el);
            return prev;
        }, document.createDocumentFragment());

        searchResultsListEl.appendChild(docFrag);

        Object.keys(projectIds).forEach(pid => {
            // It will allways fail: Project not found. The supplied ID is either invalid or you may not have access to the project.
            // see the separate example for counting the document's tasks
            fetch(`${API}/Reports/ByProjectId/${pid}`, { headers }).then(res => res.json()).then(data => {
                console.log('Data ', data);
            })
        })
    })
})

const buildSearchEndpoint = searchTerm => `${API}/AzureSearch/Search?searchText=${searchTerm}&filter=(siteid eq '00000000-0000-0000-0000-000000000000') and not (fileid eq '')&facet=`;

const buildHeaders = token => {
    return {
        'Content-Type': 'application/json',
        'Authorization': `Digest username="${appToken}" realm="_root_" password="${token || ''}"`
    }
}

const refreshPage = () => {
    window.location.reload();
}

const authenticate = () => {
    fetch(LOGIN_API, {
        method: 'POST',
        headers: buildHeaders(),
        body: JSON.stringify(loginDetails)
    }).then(res => {
        res.json().then(data => {
            sessionStorage.setItem('edocs_token', data.Result.auth.token);
            refreshPage()
        })
    })   
}

const getSearchResultsByName = (term, headers) => {
    return new Promise((resolve, reject) => {
        fetch(buildSearchEndpoint(term), { headers }).then(res => res.json()).then(data => {
            resolve(data.Result.searchdata.value)
        }).catch(err => {
            console.error('Could not load the data', err);
            reject(null);
        })
    })
}

// load documents by project id 565c19a3-aab1-4e02-a640-ac8331708831
fetch(`${API}/Reports/ByProjectId/565c19a3-aab1-4e02-a640-ac8331708831`, {headers: buildHeaders(token)}).then(res => res.json()).then(data => {
    const docTaskCountMap = data.Result.report.tasks.reduce((prev, next) => {
        prev[next.docId] = prev[next.docId] ? prev[next.docId] + 1 : 1
        return prev
    }, {});

    const els = data.Result.report.documents.map(d => {
        const el = document.createElement('p');
        el.appendChild(document.createTextNode(`${d.name} - Task count: ${docTaskCountMap[d.id] || 'N/A'}`));
        return el;
    }, {});

    const docFrag = els.reduce((prev, next) => {
        prev.appendChild(next)
        return prev
    }, document.createDocumentFragment());

    docsEl.appendChild(docFrag);
});

