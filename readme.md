# Proof of concept interactive website for Oblivion 100% speedrun

# Installation
To run locally:
1. Install python3
2. Download files + unzip
3. in root directory (the one with index.html), run python -m http.server 9000
4. in web browser, go to localhost:9000 to view

# Contributing
The codebase is simple js+html


## Adding interactive elements to speedrun page:
Major one is \<span class="replaceable" clid="">foo\</span>.
This will replace foo with a link to the item specified by the clid parameter. How to find clid? (stands for CheckList ID) look at the JSON files under the /data/ directory. 
For example, the book [Thief] would be clid="book5", as it has id 5 in data/books.js.
To link NPCs specifically, surround with \<span class="npc">\</span>

## Adding new elements to JSON files
### Required parameters:
"id": must be a number. Preferably sequential, but not required. if its too large (>1000), the save might become too large and cookies might break.
"name": name of the thing

### Optional parameters:
"link": overrides the default UESP link with a different one.
"notes": will show a warning symbol next to the item with mouseover text.
"type": change the HTML input type from checkbox to something else. E.g. "type":"number" for save numbers or number of places discovered.