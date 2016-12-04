angular.module("mks-calculation", ["ngStorage"]).controller("mks-calculation-controller", function($scope, $http, $localStorage, $sessionStorage) {	
	function versionOlder(a, b)
	{
		switch (Math.sign(a.MAJOR - b.MAJOR)) {
			case -1:
				return true;
			case 0:
				break;
			case 1:
				return false;
		}
		
		switch (Math.sign(a.MINOR - b.MINOR)) {
			case -1:
				return true;
			case 0:
				break;
			case 1:
				return false;
		}
		
		switch (Math.sign(a.PATCH - b.PATCH)) {
			case -1:
				return true;
			case 0:
				break;
			case 1:
				return false;
		}
		
		return false;
	}
	
	var hasModule = (part, moduleName) => part.MODULE !== undefined && part.MODULE.some((module) => module.name === moduleName);
	
	var hasAnyModule = (part, moduleNames) => moduleNames.some((moduleName) => hasModule(part, moduleName));
	
	var valid_part =(part) => hasAnyModule(part, [
		"MKSModule",
		"ModuleResourceHarvester_USI"
	]);
	
	function mapParts()
	{
		$scope.parts = $localStorage.parts.filter(valid_part).map((part) => new MKSPart(part));
	}
	
	$http.get("https://raw.githubusercontent.com/BobPalmer/MKS/master/FOR_RELEASE/GameData/UmbraSpaceIndustries/MKS/MKS.version").then(function(response) {
		var mksVersion = response.data.VERSION;
		
		$scope.mksVersion = mksVersion;
		
		if ($localStorage.mksVersion === undefined || $localStorage.parts === undefined || versionOlder($localStorage.mksVersion, mksVersion))
		{
			console.log("Importing part configs...");
			
			new configCrawler($http).loadConfigs().then(function(parts) {
				$localStorage.mksVersion = mksVersion;
				$localStorage.parts = parts;
				
				mapParts();
				
				console.log("Part configs loaded");
			}, function(response) {
				console.error("Could not import part configs - \"" + response + "\"");
			});
		}
		else
		{
			console.log("Using cached part configs");
			
			mapParts();
		}
	}, function() {
		console.error("Could not load version");
	});
});
