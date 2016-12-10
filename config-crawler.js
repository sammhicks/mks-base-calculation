"use strict";

angular.module("mksCalculation").factory("configCrawler", ["$http", function($http) {
	var mksPath = "FOR_RELEASE/GameData/UmbraSpaceIndustries/MKS/";
	
	var getContents = (path) => $http.get("https://api.github.com/repos/bobpalmer/mks/contents/" + path);
	
	function getFileData(fileInfo) {
		if (fileInfo.type === "file") {
			return $http.get(fileInfo.download_url).then((file_response) => file_response.data
			, function(e) {
				console.log("Could not parse \"" + fileInfo.name + "\"");
				return e;
			});
		} else {
			return Promise.reject("Cannot download file \"" + fileInfo.download_url + "\"");
		}
	}
	
	var loadConfigFile = (fileInfo) => getFileData(fileInfo).then(function(response) {
		var parse_result = configParser.config.parse(response);
		
		if (parse_result.status) {
			return Promise.resolve([parse_result.value]);
		} else {
			var message = "Could not parse \"" + fileInfo.name + "\"";
			
			console.error(message, parse_result);
			return Promise.reject(message);
		}
	});
	
	var union = (a, b) => a.concat(b);
	
	var arrayUnion = (array) => array.reduce(union);
	
	var loadConfigDir = (dir_info) => getContents(dir_info.path).then(loadConfigs).then(arrayUnion);
	
	var loadConfigs = (files) => Promise.all(files.data.map(loadConfig));
	
	function loadConfig(file) {
		switch (file.type) {
			case "file":
				return (file.name.endsWith(".cfg")) ? loadConfigFile(file) : Promise.resolve([]);
			case "dir":
				return loadConfigDir(file);
			default:
				return Promise.resolve([]);
		}
	}
	
	return {
		loadConfigs: () => loadConfigDir({path: mksPath + "Parts"})
	};
}]);
