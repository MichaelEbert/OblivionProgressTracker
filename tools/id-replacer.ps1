
$storedata = convertfrom-json ([String]::Join("",(get-content "C:\Users\Michael\OneDrive\Documents\misc coding projects\oblivion_progress_tracker\data\store.json")))
$stores = new-object -type system.collections.generic.list[object] ; foreach($x in $storedata.elements){foreach($y in $x.elements){$stores.add($y)}}

$bookdata = convertfrom-json ([String]::Join("",(get-content "C:\Users\Michael\OneDrive\Documents\misc coding projects\oblivion_progress_tracker\data\book.json")))
$books = new-object -type system.collections.generic.list[object] ; recurseQuests $bookdata $books

$questdata = convertfrom-json ([String]::Join("",(get-content "C:\Users\Michael\OneDrive\Documents\misc coding projects\oblivion_progress_tracker\data\quest.json")))
function recurseQuests($root,$container){
	if($root.elements -eq $null){
		$container.add($root);
	}
	else{
		foreach($e in $root.elements){
			recurseQuests $e $container;
		}
	}
}

$quests = new-object -type system.collections.generic.list[object]; recurseQuests $questdata $quests


$speedrun = get-content "C:\Users\Michael\OneDrive\Documents\misc coding projects\oblivion_progress_tracker\speedrun-3.html" -Encoding 'utf8'
[regex]$storePattern = 'clid="store[^"]*"';
[regex]$bookPattern = 'clid="book[^"]*"';
[regex]$questPattern = 'clid="quest[^"]*"';

for($i = 0; $i -lt $speedrun.count;$i+=1){
     $line = $speedrun[$i];
     if($line -match 'clid="store[^"]*"([^>]*)>([^<]*)<'){
         $extras = $matches[1]
         $storeName = $Matches[2]
         $storeobj = $stores.find({param($x);return $x.name -eq $storeName})
         if($storeobj -ne $null){
			 $speedrun[$i] = $storePattern.replace($line,('clid="'+($storeObj.formId.ToString())+'"'),1)
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
			 $speedrun[$i] = $bookPattern.replace($line,('clid="'+($storeObj.formId.ToString())+'"'),1);
         }
     }
}

for($i = 0; $i -lt $speedrun.count;$i+=1){
     $line = $speedrun[$i];
     if($line -match 'clid="quest[^"]*"([^>]*)>([^<[]*)\[?([^<]*)<'){
         $extras = $matches[1]
         $storeName = $Matches[2].trim()
         $storeobj = $quests.find({param($x);return $x.name -eq $storeName})
         if($storeob[j -ne $null){
			 $speedrun[$i] = $questPattern.replace($line,('clid="'+($storeObj.formId.ToString())+'"'),1)
         }
     }
}

[System.IO.File]::WriteAllLines("C:\Users\Michael\OneDrive\Documents\misc coding projects\oblivion_progress_tracker\speedrun-3b.html",$speedrun,[System.Text.Encoding]::UTF8)

$speedrun = get-content "C:\Users\Michael\OneDrive\Documents\misc coding projects\oblivion_progress_tracker\speedrun-3.html" -Encoding 'utf8'
#ID generator
$currentPath = new-object -type system.collections.generic.list[string];

for($i = 0; $i -lt $speedrun.count;$i+=1){
	$line = $speedrun[$i];
	if($line -match 'class="section"'){
		$currentPath.clear();
		$currentPath.add("guide");
		
		#get the ID
		$lineTitle = $speedrun[$i+1];
		if(!($lineTitle -match 'sectionTitle')){
			write-error "section title not after section, can't ID line $i"
			continue;
		}
		$lineTitle -match 'sectionTitle">([^<]*)</div>'
		#remove everything that's not letter or number
		$formattedTitle = $matches[1] -replace '[^\w]',''
		$currentPath.add($formattedTitle);
		
		$newId = [String]::join("_",$currentPath);
		$speedrun[$i] = $line -replace 'class="section"\s*>',('class="section" id="'+$newId+'">');
	}
	if($line -match 'class="category"'){
		while($currentPath.count -gt 2){
			$currentPath.removeAt($currentPath.count - 1);
		}
		#get the ID
		$lineTitle = $speedrun[$i+1];
		if(!($lineTitle -match 'categoryTitle')){
			write-error "category title not after section, can't ID line $i"
			continue;
		}
		$lineTitle -match 'categoryTitle">([^<]*)</div>'
		
		#truncate everything after first slash
		$formattedTitle = $matches[1] -replace '/.*','';
		#remove everything that's not letter or number
		$formattedTitle = $formattedTitle -replace '[^\w]','';
		
		$currentPath.add($formattedTitle);
		
		$newId = [String]::join("_",$currentPath);
		$speedrun[$i] = $line -replace 'class="category"\s*>',('class="category" id="'+$newId+'">');
	}
}