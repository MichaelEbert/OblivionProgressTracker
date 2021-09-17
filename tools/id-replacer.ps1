
$storedata = convertfrom-json ([String]::Join("",(get-content "C:\Users\Michael\OneDrive\Documents\misc coding projects\oblivion_progress_tracker\data\store.json")))
$stores = new-object -type system.collections.generic.list[object] ; foreach($x in $storedata.elements){foreach($y in $x.elements){$stores.add($y)}}

$books = new-object -type system.collections.generic.list[object] ; foreach($x in $bookdata.elements){$books.add($y)}

$speedrun = get-content "C:\Users\Michael\OneDrive\Documents\misc coding projects\oblivion_progress_tracker\speedrun-3.html" -Encoding 'utf8'
for($i = 0; $i -lt $speedrun.count;$i+=1){
     $line = $speedrun[$i];
     if($line -match 'clid="store[^"]*"([^>]*)>([^<]*)<'){
         $extras = $matches[1]
         $storeName = $Matches[2]
         $storeobj = $stores.find({param($x);return $x.name -eq $storeName})
         if($storeobj -ne $null){
             $speedrun[$i] = $line -replace 'clid="store[^"]*"',('clid="'+($storeObj.formId.ToString())+'"')
         }
     }
}

for($i = 0; $i -lt $speedrun.count;$i+=1){
     $line = $speedrun[$i];
     if($line -match 'clid="book[^"]*"([^>]*)>([^<[]*)\[?([^<]*)<'){
         $extras = $matches[1]
         $storeName = $Matches[2].trim()
         $storeobj = $books.find({param($x);return $x.name -eq $storeName})
         if($storeobj -ne $null){
             $speedrun[$i] = $line -replace 'clid="book[^"]*"',('clid="book'+($storeObj.id.ToString())+'"')
         }
     }
}

[System.IO.File]::WriteAllLines("C:\Users\Michael\OneDrive\Documents\misc coding projects\oblivion_progress_tracker\speedrun-3b.html",$speedrun,[System.Text.Encoding]::UTF8)