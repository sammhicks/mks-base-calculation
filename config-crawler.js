function configCrawler(httpHandler) {
	var self = this;
	
	var mksPath = "FOR_RELEASE/GameData/UmbraSpaceIndustries/MKS/";
	
	this.httpHandler = httpHandler;
	
	configCrawler.set_http = function(handler)
	{
		httpHandler = handler;
	}
	
	var getContents = (path) => self.httpHandler.get("https://api.github.com/repos/bobpalmer/mks/contents/" + path);
	
	var getFileData = (fileInfo) => new Promise(function(resolve, reject) {
		if (fileInfo.type === "file")
		{
			self.httpHandler.get(fileInfo.download_url).then((file_response) => {
				resolve(file_response.data)
			}, () => {
				console.log("Could not parse \"" + + "\"");
				reject.apply(this, arguments);
			});
		}
		else
		{
			reject("Cannot download file \"" + fileInfo.download_url + "\"");
		}
	});
	
	var loadConfigFile = (fileInfo) => new Promise(function(resolve, reject) {
		getFileData(fileInfo).then((response) => {
			var parse_result = config_parser.config.parse(response);
			
			if (parse_result.status)
			{
				resolve([parse_result.value]);
			}
			else
			{
				resolve([]);
			}
		}, reject);
	});
	
	var loadConfigDir = (dir_info) => new Promise(function(resolve, reject) {
		getContents(dir_info.path).then((response) => {
			Promise.all(response.data.map(loadConfig)).then((responses) => {
				resolve(responses.reduce((a, b) => a.concat(b)));
			}, reject);
		}, reject);
	});
	
	function loadConfig(file)
	{
		switch (file.type)
		{
			case "file": {
				if (file.name.endsWith(".cfg"))
				{
					return loadConfigFile(file);
				}
				else
				{
					return Promise.resolve([]);
				}
			}
			case "dir":
				return loadConfigDir(file);
			default:
				return Promise.resolve([]);
		}
	}
	
	this.loadConfigs = () => loadConfigDir({path: mksPath + "Parts"});
}
