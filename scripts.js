function load_version(http){
	return http.get("https://raw.githubusercontent.com/BobPalmer/MKS/master/FOR_RELEASE/GameData/UmbraSpaceIndustries/MKS/MKS.version");
}

var app = angular.module('mks-calculation', []);
app.controller('mks-calculation-controller', function($scope, $http) {
	load_version($http).then((response) => {
		$scope.version = response.data.VERSION;
		$scope.ksp_version = response.data.KSP_VERSION;
	});
});