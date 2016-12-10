"use strict";

angular.module("mksCalculation").factory("loadData", ["$http", "configCrawler", "parts", "$localStorage", function($http, configCrawler, parts, $localStorage) {
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
	
	var valid_part = (part) => hasAnyModule(part, [
		"MKSModule",
		"ModuleResourceHarvester_USI"
	]);
	
	return (scope) => $http.get("https://raw.githubusercontent.com/BobPalmer/MKS/master/FOR_RELEASE/GameData/UmbraSpaceIndustries/MKS/MKS.version").then(function(response) {
		var mksVersion = response.data.VERSION;
		
		scope.mksVersion = mksVersion;
		
		if ($localStorage.mksVersion === undefined || $localStorage.parts === undefined || versionOlder($localStorage.mksVersion, mksVersion))
		{
			console.log("Importing part configs...");
			
			return configCrawler.loadConfigs().then(function(parts) {
				$localStorage.mksVersion = mksVersion;
				$localStorage.parts = parts;
				
				console.log("Part configs loaded");
			}, function(response) {
				console.error("Could not import part configs - \"" + response + "\"");
			});
		}
		else
		{
			console.log("Using cached part configs");
			
			return Promise.resolve();
		}
	}, function(error) {
		console.error("Could not load version");
		
		return Promise.reject(error);
	}).then(function() {
		scope.parts = $localStorage.parts.filter(valid_part).map((part) => new parts.MKSPart(part));
		
		var calculateUnion = (sets) => sets.reduce((a, b) => new Set([...a, ...b]), [])
		
		var moduleInputResources = (module) => new Set((module.INPUT_RESOURCE || []).map((resource) => resource.ResourceName));
		
		var moduleOutputResources = (module) => new Set((module.OUTPUT_RESOURCE || []).map((resource) => resource.ResourceName));
		
		var moduleResources = (module) => calculateUnion([moduleInputResources(module), moduleOutputResources(module), module.ResourceName ? [module.ResourceName] : [] ]);
		
		var partResources = (part) => calculateUnion((part.MODULE || []).map(moduleResources));
		
		scope.resources = Array.from(calculateUnion($localStorage.parts.map(partResources))).sort();
		
		var moduleHarvestableResources = (module) => module.name === "ModuleResourceHarvester_USI" ? new Set([module.ResourceName]) : new Set();
		
		var partHarvestableResources = (part) => calculateUnion((part.MODULE || []).map(moduleHarvestableResources));
		
		scope.harvestableResources = Array.from(calculateUnion($localStorage.parts.map(partHarvestableResources))).sort();
	});
}]);
