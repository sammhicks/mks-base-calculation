angular.module("mks-calculation", ["ngStorage"]).controller("mks-calculation-controller", function($scope, $http, $localStorage, $sessionStorage) {
	config_crawler.set_http($http);
	
	function version_older(a, b)
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
	
	$http.get("https://raw.githubusercontent.com/BobPalmer/MKS/master/FOR_RELEASE/GameData/UmbraSpaceIndustries/MKS/MKS.version").then((response) => {
		var mks_version = response.data.VERSION;
		
		$scope.mks_version = mks_version;
		
		if ($localStorage.mks_version === undefined || $localStorage.parts === undefined || version_older($localStorage.mks_version, mks_version))
		{
			console.log("Importing part configs...");
			
			config_crawler.load_configs().then((parts) => {
				$localStorage.mks_version = mks_version;
				$localStorage.parts = parts;
				
				$scope.parts = parts;
				$scope.$apply();
				
				console.log("Part configs loaded");
			}, () => {
				console.error("Could not import part configs");
			});
		}
		else
		{
			console.log("Using cached part configs");
			
			$scope.parts = $localStorage.parts;
		}
	});
});