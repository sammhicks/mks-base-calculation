angular.module("mks-calculation", ["ngStorage"]).controller("mks-calculation-controller", function($scope, $http, $localStorage, $sessionStorage) {
	configCrawler.set_http($http);
	
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
	
	function valid_part(part)
	{
		return hasAnyModule(part, [
			"MKSModule",
			"ModulePowerCoupler"
		]);
	}
	
	function mapParts()
	{
		$scope.parts = $localStorage.parts.filter(valid_part).map((part) => new MKSPart(part));
	}
	
	$http.get("https://raw.githubusercontent.com/BobPalmer/MKS/master/FOR_RELEASE/GameData/UmbraSpaceIndustries/MKS/MKS.version").then((response) => {
		var mksVersion = response.data.VERSION;
		
		$scope.mksVersion = mksVersion;
		
		if ($localStorage.mksVersion === undefined || $localStorage.parts === undefined || versionOlder($localStorage.mksVersion, mksVersion))
		{
			console.log("Importing part configs...");
			
			configCrawler.loadConfigs().then((parts) => {
				$localStorage.mksVersion = mksVersion;
				$localStorage.parts = parts;
				
				mapParts();
				$scope.$apply();
				
				console.log("Part configs loaded");
			}, () => {
				console.error("Could not import part configs");
			});
		}
		else
		{
			console.log("Using cached part configs");
			
			mapParts();
		}
	});
});
