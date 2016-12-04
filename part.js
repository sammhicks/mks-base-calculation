function PowerCoupler(module) {
	this.range = module.PowerCouplingRange;
}

function PowerDistributor(module) {
	this.range = module.PowerDistributionRange;
}

function Habitation(module) {
	this.name = module.ConverterName;
	this.baseKerbalMonths = module.BaseKerbalMonths;
	this.crewCapacity = module.CrewCapacity;
	this.baseHabMultiplier = module.BaseHabMultiplier;
	this.inputResource = module.INPUT_RESOURCE;
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
			case "ModuleHabitation":
				if (this.habitation === undefined) {
					this.habitation = {};
				}
				this.habitation[module.ConverterName] = new Habitation(module);
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
