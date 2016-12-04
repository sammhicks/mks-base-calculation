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
	
	this.hasConverters = false;
	this.converters = {};
	
	for (const module of part.MODULE) {
		switch (module.name) {
			case "ModulePowerCoupler":
				this.powerCoupler = new PowerCoupler(module);
				break;
			case "ModulePowerDistributor":
				this.powerDistributor = new PowerDistributor(module);
				break;
			case "ModuleResourceConverter_USI":
				this.converters[module.ConverterName] = module;
				this.hasConverters = true;
				break;
		}
	}
	
	this.hasResources = part.RESOURCE != undefined;
	this.resources = {};
	
	if (this.has_resources)
	{
		for (const resource of part.RESOURCE) {
			this.resources[resource.name] = resource;
		}
	}
}
