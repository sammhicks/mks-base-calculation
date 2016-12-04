function PowerCoupler(part) {
	this.range = part.PowerCouplingRange;
}

function PowerDistributor(part) {
	this.range = part.PowerDistributionRange;
}

function MKSPart(part) {
	this.name = part.name;
	this.title = part.title;
	
	this.eTag = part.eTag;
	this.eMultiplier = part.eMultiplier;
	
	var powerCoupler = part.MODULE.filter((module) => module.name === "ModulePowerCoupler")[0];
	if (powerCoupler !== undefined) {
		this.powerCoupler = new PowerCoupler(powerCoupler);
	}
	
	var powerDistributor = part.MODULE.filter((module) => module.name === "ModulePowerDistributor")[0];
	if (powerDistributor !== undefined) {
		this.powerDistributor = new PowerDistributor(powerDistributor);
	}
	
	this.has_resources = part.RESOURCE != undefined;
	this.resources = {};
	
	if (this.has_resources)
	{
		for (const resource of part.RESOURCE){
			this.resources[resource.name] = resource;
		}
	}
	
	var isConverter = (module) => module.name === "ModuleResourceConverter_USI";
	
	this.hasConverter = part.MODULE.some(isConverter);
	this.converters = {};
	
	if (this.hasConverter)
	{
		for (const module of part.MODULE) {
			if (isConverter(module)) {
				this.converters[module.ConverterName] = module;
			}
		}
	}
}
