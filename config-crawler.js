(function (config_crawler) {
	var MKS_path = "FOR_RELEASE/GameData/UmbraSpaceIndustries/MKS/";
	
	var http_handler = undefined;
	
	config_crawler.set_http = function(handler)
	{
		http_handler = handler;
	}
	
	var get_contents = (path) => http_handler.get("https://api.github.com/repos/bobpalmer/mks/contents/" + path);
	
	var get_file_data = (file_info) => new Promise(function(resolve, reject) {
		if (file_info.type === "file")
		{
			http_handler.get(file_info.download_url).then((file_response) => {
				resolve(file_response.data)
			}, () => {
				console.log("Could not parse \"" + + "\"");
				reject.apply(this, arguments);
			});
		}
		else
		{
			reject("Cannot download file \"" + file_info.download_url + "\"");
		}
	});
	
	var load_config_file = (file_info) => new Promise(function(resolve, reject) {
		get_file_data(file_info).then((response) => {
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
	
	var load_config_dir = (dir_info) => new Promise(function(resolve, reject) {
		get_contents(dir_info.path).then((response) => {
			Promise.all(response.data.map(load_config)).then((responses) => {
				resolve(responses.reduce((a, b) => a.concat(b)));
			}, reject);
		}, reject);
	});
	
	function load_config(file)
	{
		switch (file.type)
		{
			case "file": {
				if (file.name.endsWith(".cfg"))
				{
					return load_config_file(file);
				}
				else
				{
					return Promise.resolve([]);
				}
			}
			case "dir":
				return load_config_dir(file);
			default:
				return Promise.resolve([]);
		}
	}
	
	config_crawler.load_configs = () => load_config_dir({path: MKS_path + "Parts"});
}(window.config_crawler = window.config_crawler || {}));
