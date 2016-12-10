"use strict";

angular.module("mksCalculation").service("parts", [function() {
	var parts = this;
	this.ResourceStore = class {
		constructor(resource) {
			this.name = resource.name;
			
			this.amount = resource.amount;
			this.maxAmount = resource.maxAmount;
		}
	}

	this.IOResource = class {
		constructor(resource) {
			this.name = resource.ResourceName;
			this.ratio = resource.Ratio;
		}
	}

	this.InputResource = class extends parts.IOResource {
		constructor(resource) {
			super(resource);
		}
	}

	this.OutputResource = class extends parts.IOResource {
		constructor(resource) {
			super(resource);
			
			this.dumpExcess = (resource.DumpExcess !== undefined) ? resource.DumpExcess : false;
		}
	}

	this.RequiredResource = class extends parts.IOResource {
		constructor(resource) {
			super(resource);
		}
	}

	this.Converter = class {
		constructor(module) {
			this.name = module.ConverterName;
			
			this.useSpecialistBonus = module.UseSpecialistBonus;
			this.specialistBonusBase = module.SpecialistBonusBase;
			this.specialistEfficiencyFactor = module.SpecialistEfficiencyFactor;
			this.experienceEffect = module.ExperienceEffect;
			
			this.inputs = (module.INPUT_RESOURCE || []).map((resource) => new parts.InputResource(resource));
			this.outputs = (module.OUTPUT_RESOURCE || []).map((resource) => new parts.OutputResource(resource));
			this.required = (module.REQUIRED_RESOURCE || []).map((resource) => new parts.RequiredResource(resource));
		}
	}

	this.LifeSupportExtender = class extends parts.Converter {
		constructor(module) {
			super(module);
			
			this.partOnly = module.PartOnly;
			this.restrictedClass = module.restrictedClass;
			this.timeMultiplier = module.TimeMultiplier;
		}
	}

	this.LifeSupportRecycler = class extends parts.Converter {
		constructor(module) {
			super(module);
			
			this.crewCapacity = module.CrewCapacity;
			
			this.recyclePercent = module.RecyclePercent;
		}
	}

	this.Habitation = class extends parts.Converter {
		constructor (module) {
			super(module);
			
			this.baseKerbalMonths = module.BaseKerbalMonths;
			this.crewCapacity = module.CrewCapacity;
			this.baseHabMultiplier = module.BaseHabMultiplier;
			this.inputResource = module.INPUT_RESOURCE;
		}
	}

	this.Bay = class {
		constructor(module, isDefault) {
			this.name = module.bayName;
			this.typeName = module.typeName;
			this.isDefault = isDefault;
		}
	}

	this.MKSPart = class {
		constructor(part) {
			this.foo = (x) => x + 1;
			this.name = part.name;
			this.title = part.title;
			
			this.eTag = part.eTag;
			this.eMultiplier = part.eMultiplier;
			
			var self = this;
			
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
			
			for (var module of part.MODULE) {
				switch (module.name) {
					case "ModuleResourceConverter_USI":
						addConverter(module.ConverterName, new parts.Converter(module));
						break;
					case "ModuleLifeSupportExtender":
						addConverter(module.ConverterName, new parts.LifeSupportExtender(module));
						break;
					case "ModuleLifeSupportRecycler":
						addConverter(module.ConverterName, new parts.LifeSupportRecycler(module));
						break;
					case "ModuleHabitation":
						addConverter(module.ConverterName, new parts.Habitation(module));
						break;
					case "ModuleSwappableConverter":
						addBay(module.bayName, new parts.Bay(module, false));
				}
			}
			
			
			if (self.converters !== undefined) {
				var firstConverter;
				
				for (var converterName in self.converters) {
					firstConverter = converterName;
				}
				
				if (this.bays === undefined) {
					var bayName = "Bay";
					
					addBay(bayName, new parts.Bay({name: bayName, typeName: ""}, true));
					
					self.bays[bayName].selectedConverter = self.converters[firstConverter];
				}
			}
			
			if (part.RESOURCE !== undefined)
			{
				this.resources = {};
				
				for (var resource of part.RESOURCE) {
					this.resources[resource.name] = new parts.ResourceStore(resource);
				}
			}
		}
	}
}]);