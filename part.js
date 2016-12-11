"use strict";

angular.module("mksCalculation").service("parts", [function() {
	var parts = this;
	
	parts.Part = class {
		constructor(design) {
			if (design.reconstructionName != undefined) {
				for (var k in design) {
					this[k] = design[k];
				}
			}
		}
	}
	parts.Part.reconstruct = function(design) {
		return new parts[design.reconstructionName](design);
	}
	
	parts.ResourceStore = class extends parts.Part {
		constructor(resource) {
			super(resource);
			
			if (resource.reconstructionName === undefined) {
				this.reconstructionName = "ResourceStore";
				
				this.name = resource.name;
				
				this.amount = resource.amount;
				this.maxAmount = resource.maxAmount;
			}
		}
	}

	parts.IOResource = class extends parts.Part {
		constructor(resource) {
			super(resource);
			
			if (resource.reconstructionName === undefined) {
				this.reconstructionName = "IOResource";
				
				this.name = resource.ResourceName;
				this.ratio = resource.Ratio;
			}
		}
	}

	parts.InputResource = class extends parts.IOResource {
		constructor(resource) {
			super(resource);
			
			if (resource.reconstructionName === undefined) {
				this.reconstructionName = "InputResource";
			}
		}
	}

	parts.OutputResource = class extends parts.IOResource {
		constructor(resource) {
			super(resource);
			
			if (resource.reconstructionName === undefined) {
				this.reconstructionName = "OutputResource";
				
				this.dumpExcess = (resource.DumpExcess !== undefined) ? resource.DumpExcess : false;
			}
		}
	}

	parts.RequiredResource = class extends parts.IOResource {
		constructor(resource) {
			super(resource);
			
			if (resource.reconstructionName === undefined) {
				this.reconstructionName = "RequiredResource";
			}
		}
	}

	parts.Converter = class extends parts.Part {
		constructor(module) {
			super(module);
			
			var self = this;
			
			if (module.reconstructionName === undefined) {
				this.reconstructionName = "Converter";
				
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
	}

	parts.ResourceHarvester = class extends parts.Converter {
		constructor(module) {
			super(module);
			
			if (module.reconstructionName === undefined) {
				this.reconstructionName = "ResourceHarvester";
				
				this.resourceName = module.ResourceName;
			}
			
			this.outputs = [new parts.OutputResource({
				ResourceName: this.resourceName,
				Ratio: 1.0,
				DumpExcess: true
			})];
		}
	}

	parts.LifeSupportExtender = class extends parts.Converter {
		constructor(module) {
			super(module);
			
			if (module.reconstructionName === undefined) {
				this.reconstructionName = "LifeSupportExtender";
				
				this.partOnly = module.PartOnly;
				this.restrictedClass = module.restrictedClass;
				this.timeMultiplier = module.TimeMultiplier;
			}
		}
	}

	parts.LifeSupportRecycler = class extends parts.Converter {
		constructor(module) {
			super(module);
			
			if (module.reconstructionName === undefined) {
				this.reconstructionName = "LifeSupportRecycler";
				
				this.crewCapacity = module.CrewCapacity;
				
				this.recyclePercent = module.RecyclePercent;
			}
		}
	}

	parts.Habitation = class extends parts.Converter {
		constructor (module) {
			super(module);
			
			if (module.reconstructionName === undefined) {
				this.reconstructionName = "Habitation";
				
				this.baseKerbalMonths = module.BaseKerbalMonths;
				this.crewCapacity = module.CrewCapacity;
				this.baseHabMultiplier = module.BaseHabMultiplier;
				this.inputResource = module.INPUT_RESOURCE;
			}
		}
	}

	parts.Bay = class extends parts.Part {
		constructor(module) {
			super(module);
			
			if (module.reconstructionName === undefined) {
				this.reconstructionName = "Bay";
				
				this.name = module.bayName;
				this.typeName = module.typeName;
				this.isDefault = module.isDefault;
			}
		}
	}

	parts.MKSPart = class extends parts.Part {
		constructor(part) {
			super(part);
			
			var self = this;
			
			if (part.reconstructionName === undefined) {
				this.reconstructionName = "MKSPart";
				
				this.name = part.name;
				this.title = part.title;
				
				this.eTag = part.eTag;
				this.eMultiplier = part.eMultiplier;
				
				function addConverter(name, converter) {
					self.converters = self.converters || {};
					self.converters[name] = converter;
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
						case "ModuleResourceHarvester_USI":
							addConverter(module.ConverterName, new parts.ResourceHarvester(module));
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
							module.isDefault = false;
							addBay(module.bayName, new parts.Bay(module));
							break;
					}
				}
				
				if (self.converters !== undefined) {
					if (self.bays === undefined) {
						var bayName = "Bay";
						
						addBay(bayName, new parts.Bay({name: bayName, typeName: "", isDefault: true}));
					}
					
					for (var bayName in self.bays) {
						for (var converterName in self.converters) {
							self.bays[bayName].selectedConverter = self.converters[converterName].name;
							break;
						}
					}
				}
				
				if (part.RESOURCE !== undefined)
				{
					this.resources = {};
					
					for (var resource of part.RESOURCE) {
						this.resources[resource.name] = new parts.ResourceStore(resource);
					}
				}
			} else {
				if (self.converters != undefined) {
					var newConverters = {};
					for (var converterName in self.converters) {
						newConverters[converterName] = parts.Part.reconstruct(self.converters[converterName]);
					}
					
					self.converters = newConverters;
				}
				
				var newBays  = {};
				for (var bayName in self.bays) {
					newBays[bayName] = parts.Part.reconstruct(self.bays[bayName]);
					
					newBays[bayName].selectedConverter = self.converters[newBays[bayName].selectedConverter].name;
				}
				
				self.bays = newBays;
			}
		}
	}
}]);