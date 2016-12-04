function PowerCoupler(module) {
	this.range = module.PowerCouplingRange;
}

function PowerDistributor(module) {
	this.range = module.PowerDistributionRange;
}

function ResourceStore(resource) {
	this.name = resource.name;
	
	this.amount = resource.amount;
	this.maxAmount = resource.maxAmount;
}

function IOResource(resource) {
	this.name = resource.ResourceName;
	this.ratio = resource.Ratio;
}

function InputResource(resource) {
	IOResource.call(this, resource);
}

function OutputResource(resource) {
	IOResource.call(this, resource);
	
	this.dumpExcess = (resource.DumpExcess !== undefined) ? resource.DumpExcess : false;
}

function RequiredResource(resource) {
	IOResource.call(this, resource);
}

function Converter(module) {
	this.name = module.ConverterName;
	
	this.useSpecialistBonus = module.UseSpecialistBonus;
	this.specialistBonusBase = module.SpecialistBonusBase;
	this.specialistEfficiencyFactor = module.SpecialistEfficiencyFactor;
	this.experienceEffect = module.ExperienceEffect;
	
	this.inputs = module.INPUT_RESOURCE.map((resource) => new InputResource(resource));
	this.outputs = module.OUTPUT_RESOURCE.map((resource) => new OutputResource(resource));
	this.required = module.REQUIRED_RESOURCE.map((resource) => new RequiredResource(resource));
}

function LifeSupportRecycler(module) {
	this.name = module.ConverterName;
	
	this.crewCapacity = module.CrewCapacity;
	
	this.recyclePercent = module.RecyclePercent;
	
	this.inputs = module.INPUT_RESOURCE.map((resource) => new InputResource(resource));
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
	
	for (const module of part.MODULE) {
		switch (module.name) {
			case "ModulePowerCoupler":
				this.powerCoupler = new PowerCoupler(module);
				break;
			case "ModulePowerDistributor":
				this.powerDistributor = new PowerDistributor(module);
				break;
			case "ModuleResourceConverter_USI":
				this.converters = this.converters || {};
				this.converters[module.ConverterName] = new Converter(module);
				break;
			case "ModuleLifeSupportRecycler":
				this.lifeSupportRecyclers = this.lifeSupportRecyclers || {};
				this.lifeSupportRecyclers[module.ConverterName] = new LifeSupportRecycler(module);
				break;
			case "ModuleHabitation":
				this.habitation = this.habitation || {};
				this.habitation[module.ConverterName] = new Habitation(module);
				break;
		}
	}
	
	if (part.RESOURCE !== undefined)
	{
		this.resources = {};
		
		for (const resource of part.RESOURCE) {
			this.resources[resource.name] = new ResourceStore(resource);
		}
	}
}
