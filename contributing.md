## debug flags

save 'debug' as a localstorage object. `localStorage.setItem('debug','{"disable_hydration":false}')`
options:
debug                       existence turns on a lot of console logs
debug.disable_node_clone    create a new node instead of node.clone. 
debug.disable_hydration     generate the html on the checklist-template page from scratch. Used to populate checklist.html when something changes.
