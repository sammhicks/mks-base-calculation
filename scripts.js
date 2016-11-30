var app = angular.module('mks-calculation', []);
app.controller('mks-calculation-controller', function($scope, $http) {
	function load_version() {
		return $http.get("https://raw.githubusercontent.com/BobPalmer/MKS/master/FOR_RELEASE/GameData/UmbraSpaceIndustries/MKS/MKS.version");
	}
	
	function load_config(config_location)
	{
		return new Promise(function(resolve, reject){
			$http.get(config_location).catch(reject).then((response) => {
				var parse_result = config_parser.config.parse(response.data);
				
				if (parse_result.status)
				{
					resolve(parse_result.value);
				}
				else
				{
					reject(parse_result);
				}
			});
		});
	}
	
	load_version().then((response) => {
		$scope.version = response.data.VERSION;
		$scope.ksp_version = response.data.KSP_VERSION;
	}).then(() => {
		load_config("https://raw.githubusercontent.com/BobPalmer/MKS/master/FOR_RELEASE/GameData/UmbraSpaceIndustries/MKS/Parts/Duna_Agriculture.cfg").then((response) => {
			console.log(response);
		});
	});
});