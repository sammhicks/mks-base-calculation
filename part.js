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
	
	this.inputs = (module.INPUT_RESOURCE || []).map((resource) => new InputResource(resource));
	this.outputs = (module.OUTPUT_RESOURCE || []).map((resource) => new OutputResource(resource));
	this.required = (module.REQUIRED_RESOURCE || []).map((resource) => new RequiredResource(resource));
}

function LifeSupportExtender(module) {
	Converter.call(this, module);
	
	this.partOnly = module.PartOnly;
	this.restrictedClass = module.restrictedClass;
	this.timeMultiplier = module.TimeMultiplier;
}

function LifeSupportRecycler(module) {
	Converter.call(this, module);
	
	this.crewCapacity = module.CrewCapacity;
	
	this.recyclePercent = module.RecyclePercent;
}

function Habitation(module) {
	Converter.call(this, module);
	
	this.baseKerbalMonths = module.BaseKerbalMonths;
	this.crewCapacity = module.CrewCapacity;
	this.baseHabMultiplier = module.BaseHabMultiplier;
	this.inputResource = module.INPUT_RESOURCE;
}

function Bay(module) {
	this.name = module.bayName;
	this.typeName = module.typeName;
}

function MKSPart(part) {
	var self = this;
	
	this.name = part.name;
	this.title = part.title;
	
	this.eTag = part.eTag;
	this.eMultiplier = part.eMultiplier;
	
	function addConverter(name, converter) {
		self.converters = self.converters || {};
		self.converters[name] = converter;
		
		if (self.selectedConverter === undefined) {
			self.selectedConverter = converter;
		}
	}
	
	function addBay(name, bay) {
		self.bays = self.bays || {};
		self.bays[name] = bay;
	}
	
	for (const module of part.MODULE) {
		switch (module.name) {
			case "ModuleResourceConverter_USI":
				addConverter(module.ConverterName, new Converter(module));
				break;
			case "ModuleLifeSupportExtender":
				addConverter(module.ConverterName, new LifeSupportExtender(module));
				break;
			case "ModuleLifeSupportRecycler":
				addConverter(module.ConverterName, new LifeSupportRecycler(module));
				break;
			case "ModuleHabitation":
				addConverter(module.ConverterName, new Habitation(module));
				break;
			case "ModuleSwappableConverter":
				addBay(module.bayName, new Bay(module));
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
