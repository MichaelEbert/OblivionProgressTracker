#insert navbar element into all pages (that already have it)


function replaceText{
[CmdletBinding()]
Param(
	[Parameter(ValueFromPipeline=$true)][System.IO.FileSystemInfo[]]$files,
	[string]$beginKey,
	[string]$endKey,
	[string]$replacementText)
Begin{
	if(!$replacementText.startsWith($beginKey) -or !$replacementText.endsWith($endKey)){
		throw "replacement must begin and end with the same text used to match on!"
	}
}
Process{
	foreach($file in $files){
		$contents = [System.IO.File]::ReadAllText($file.fullname,[System.Text.Encoding]::UTF8);
		if(!$contents.contains($beginKey)){
			$relPath = resolve-path -relative $file.fullname;
			write-verbose "$relPath does not contain $beginKey, skipping" 
			continue;
		}
		$relPath = resolve-path -relative $file.fullname;
		write-verbose "Executing replacement in $relPath" 
		$regex = $beginKey +".*"+$endKey;
		$contents2 = [Regex]::replace($contents,$regex,$replacementText,[System.Text.RegularExpressions.RegexOptions]::Singleline)
		[System.IO.File]::WriteAllText($file.fullname,$contents2,(new-object -type System.Text.UTF8Encoding -ArgumentList $false));
	}
}
}

$replacementText = [System.IO.File]::ReadAllText((get-item navbar.html).fullname);
get-childitem "../" "*.html" -recurse | replaceText -beginKey '<!-- begin topbar-->' -endKey '<!-- end topbar-->' -replacementText $replacementText


	
		