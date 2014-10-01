define([], function () {

	// The dynamicMapServiceUrl is used by several layers, make sure if you change it all layers and layer ids are still working
	// The dynamicMapServiceUrl is currently being used by the following layers (by key):
	// ifl, peat, tfcs, ldcover, legal, oilPerm, logPerm, minePerm, woodPerm
	var dynamicMapServiceUrl = "http://gis-potico.wri.org/arcgis/rest/services/CommoditiesAnalyzer/moremaps2_EN/MapServer",
			treeCoverGainUrl = "http://50.18.182.188:6080/arcgis/rest/services/ForestGain_2000_2012/ImageServer",
			treeCoverLossUrl = "http://50.18.182.188:6080/arcgis/rest/services/ForestCover_lossyear/ImageServer",
			formaAlertsUrl = "http://gis-potico.wri.org/arcgis/rest/services/CommoditiesAnalyzer/FORMA50/ImageServer",
			activeFiresUrl = "http://gis-potico.wri.org/arcgis/rest/services/Fires/Global_Fires/MapServer",
			treeCoverDensityUrl = "http://50.18.182.188:6080/arcgis/rest/services/TreeCover2000/ImageServer",
			protectedAreasUrl = "http://gis-potico.wri.org/arcgis/rest/services/CommoditiesAnalyzer/protectedareas/MapServer",
			mapOverlaysUrl = "http://gis-potico.wri.org/arcgis/rest/services/CommoditiesAnalyzer/mapfeatures/MapServer",
			primaryForestUrl = "http://gis-potico.wri.org/arcgis/rest/services/CommoditiesAnalyzer/primary_forest_extent/ImageServer",
			customSuitabilityUrl = "http://gis-potico.wri.org/arcgis/rest/services/suitabilitymapper/kp_mosaic2/ImageServer";

	return {

		mapOptions: {
			basemap: 'gray',
			centerX: 114,
			centerY: 3,
			zoom: 5,
			sliderPosition: "top-right"
		},

		// Layers which are not part of the Master Layer UI List Widget (Colored Categories Stripes across top of the map) go below

		overlays: {
			id: "MapOverlaysLayer",
			url: mapOverlaysUrl 
		},

		road: {
			layerId: 8 
		},
		river: {
			layerId: 11
		},
		settle: {
			layerId: 1
		},
		poBounds: {
			layerId: 5
		},

		// The Following Layers are used by the Wizard

		customGraphicsLayer: {
			id: "CustomFeatures",
			infoTemplate: {
				content: "<table><tr><td>Unique ID:</td><td>${WRI_ID:checkAvailable}</td></tr></table>"
			}
		},

		wizardGraphicsLayer: {
			id: "WizardTempGraphics"
		},

		
		// Only Add One of these below that have the id WizardDynamicLayer
		// Only one layer but separate config makes easier to work with in other areas of application
		adminUnitsLayer: {
			id: 'WizardDynamicLayer',
			url: mapOverlaysUrl,
			whereField: 'NAME_0',
			layerId: 7,
			infoTemplate: {
				content: "<table><tr><td>Name:</td><td>${NAME_1}</td></tr></table>"
			}
		},

		certificationSchemeLayer: {
			id: 'WizardDynamicLayer',
			url: mapOverlaysUrl,
			whereField: 'CERT_SCHEME',
			layerId: 13,
			infoTemplate: {
				content: "<table><tr><td>Group:</td><td>${GROUP_NAME}</td></tr>" +
								 "<tr><td>Type:</td><td>${TYPE}</td></tr></table>"
			}
		},

		// Info Template for this layer is immediately above this
		commercialEntitiesLayer: {
			id: 'WizardDynamicLayer',
			url: mapOverlaysUrl,
			whereField: 'TYPE',
			layerId: 13
		},

		// End Normal Layers not part of the Master Layer UI List
		// Keys Match list below which builds the Master Layer UI List
		// NOTE: If a item is specified in the layersUI below it needs to have a key defined here
		// If they are on the same layer, give them the same id and url and only add that layer to the map once
		// the toolsNode is for layers that have custom tools to work with them, it is the root dom node of the toolbox
		// If the layer is an image service layer that needs to pull a legend from a dynamic layer, look at 
		// LayerController.refreshLegendWidget, it will need to add the config for the layer to the confItems array
		// This way it will know that when that layer is shown or hidden, refresh with the appropriate legendLayerId
		tcc: {
			id: "TreeCoverChange"
		},
		gain: {
			id: "Gain",
			url: treeCoverGainUrl,
			legendLayerId: 31
		},
		loss: {
			id: "Loss",
			url: treeCoverLossUrl,
			legendLayerId: 11,
			defaultRange: [1, 13],
			colormap: [[1, 219, 101, 152]],
			toolsNode: "treecover_change_toolbox"
		},
		forma: {
			id: "FormaAlerts",
			url: formaAlertsUrl,
			legendLayerId: 30,
			defaultRange: [1, 19],
			colormap: [[1, 255, 0, 197]],
			toolsNode: "forma_toolbox"
		},
		fires: {
			id: "ActiveFires",
			url: activeFiresUrl,
			defaultLayers: [0, 1, 2, 3],
			toolsNode: "fires_toolbox",
			infoTemplate: {
				content: "<table><tr><td>Latitude: </td><td>${LATITUDE}</td></tr>" + 
								 "<tr><td>Longitude: </td><td>${LONGITUDE}</td></tr>" + 
								 "<tr><td>Brightness: </td><td>${BRIGHTNESS}</td></tr>" + 
								 "<tr><td>Confidence: </td><td>${CONFIDENCE}</td></tr>" + 
								 "<tr><td>Acquisition Date: </td><td>${ACQ_DATE}</td></tr>" + 
								 "<tr><td>Acquisition Time: </td><td>${ACQ_TIME}</td></tr></table>"
			}
		},
		tcd: {
			id: "TreeCoverDensity",
			url: treeCoverDensityUrl,
			legendLayerId: 29
		},
		primForest: {
			id: "PrimaryForest",
			url: primaryForestUrl,
			legendLayerId: 33
		},

		suit: {
			id: "CustomSuitability",
			url: customSuitabilityUrl,
			legendLayerId: 17,
			toolsNode: "suitability_toolbox"
		},

		/***** THE FOLLOWING ARE ALL PART OF THE SAME DYNAMIC LAYER UNDER FORESTCOVER *****/
		ifl: {
			id: "ForestCover",
			url: dynamicMapServiceUrl,
			layerId: 24
		},
		peat: {
			id: "ForestCover",
			url: dynamicMapServiceUrl,
			layerId: 1
		},
		tfcs: {
			id: "ForestCover",
			url: dynamicMapServiceUrl,
			layerId: 23
		},
		ldcover: {
			id: "ForestCover",
			url: dynamicMapServiceUrl,
			layerId: 22
		},
		legal: {
			id: "ForestCover",
			url: dynamicMapServiceUrl,
			layerId: 9
		},
		/***** THE PREVIOUS ARE ALL PART OF THE SAME DYNAMIC LAYER UNDER FORESTCOVER *****/
		/***** THE FOLLOWING ARE ALL PART OF THE SAME DYNAMIC LAYER UNDER FORESTUSE *****/
		oilPerm: {
			id: "ForestUse",
			url: dynamicMapServiceUrl,
			layerId: 32,
			infoTemplate: {
				content: "<table><tr><td>Concession Type: </td><td>${TYPE}</td></tr>" + 
								 "<tr><td>Country: </td><td>${Country}</td></tr>" + 
								 "<tr><td>Group: </td><td>${GROUP_NAME:checkAvailable}</td></tr>" + 
								 "<tr><td>Certification Status: </td><td>${CERT_STAT:checkAvailable}</td></tr>" + 
								 "<tr><td>GIS Calculated Area (ha): </td><td>${AREA_HA:NumberFormat}</td></tr>" + 
								 "<tr><td>Source: </td><td>${Source:checkAvailable}</td></tr></table>"
			}
		},
		logPerm: {
			id: "ForestUse",
			url: dynamicMapServiceUrl,
			layerId: 10
		},
		minePerm: {
			id: "ForestUse",
			url: dynamicMapServiceUrl,
			layerId: 26
		},
		woodPerm: {
			id: "ForestUse",
			url: dynamicMapServiceUrl,
			layerId: 28
		},
		/***** THE PREVIOUS ARE ALL PART OF THE SAME DYNAMIC LAYER UNDER FORESTUSE *****/
		pal: {
			id: "ProtectedAreas",
			url: protectedAreasUrl,
			infoTemplate: {
				content: "<table><tr><td>Local Name:</td><td>${ORIG_NAME}</td></tr>" +
								 "<tr><td>Local Designation:</td><td>${DESIG_ENG}</td></tr>" + 
								 "<tr><td>WDPA ID:</td><td>${WDPAID}</td></tr>" + 
								 "<tr><td>Source:</td><td>${Source:checkAvailable}</td></tr></table>"
			}
		},
		/***** THE FOLLOWING ARE ALL PART OF THE SAME DYNAMIC LAYER UNDER AGRICULTURAL SUITABILITY *****/
		opsd: { // Oil Palm Suitability Default
			id: "AgriculturalSuitability",
			url: dynamicMapServiceUrl,
			layerId: 12
		},
		cons: { //Conservation Areas
			id: "AgriculturalSuitability",
			url: dynamicMapServiceUrl,
			layerId: 2
		},
		elev: { // Elevation
			id: "AgriculturalSuitability",
			url: dynamicMapServiceUrl,
			layerId: 3
		},
		slope: { // Slope
			id: "AgriculturalSuitability",
			url: dynamicMapServiceUrl,
			layerId: 4
		},
		rain: { // Rainfall
			id: "AgriculturalSuitability",
			url: dynamicMapServiceUrl,
			layerId: 5
		},
		soilDr: { // Soil Drainage
			id: "AgriculturalSuitability",
			url: dynamicMapServiceUrl,
			layerId: 6
		},
		soilDe: { // Soil Depth
			id: "AgriculturalSuitability",
			url: dynamicMapServiceUrl,
			layerId: 7
		},
		soilAc: { // Soil Acidity
			id: "AgriculturalSuitability",
			url: dynamicMapServiceUrl,
			layerId: 8
		},
		soilTy: { // Soil Type
			id: "AgriculturalSuitability",
			url: dynamicMapServiceUrl,
			layerId: 14
		},
		/***** THE PREVIOUS ARE ALL PART OF THE SAME DYNAMIC LAYER UNDER AGRICULTURAL SUITABILITY *****/

		/*** 
			This does not map to any UI elements, it is a hidden layer whose 
			sole purpose is showing legends for ImageService layers
		***/
		legendLayer: {
			id: 'LegendLayer',
			url: dynamicMapServiceUrl
		},

		// BELOW IS the data structure that will build the layer list widget
		// The Keys below match the keys above and tie these UI elements to the correct layer config
		// If the layer does nothing or is none, then no key needs to be provided above
		// Required properties are key, title, subtitle, filter, and type

		layersUI: [
			{
	      key: "tcc",
	      title: "Tree Cover Change",
	      subtitle: "(annual, 30m, global, Hansen/UMD/Google/USGS/NASA)",
	      filter: "forest-change",
	      type: "radio",
	      layerType: "none",
	      children: [
	      	{
	          key: "loss",
	          title: "Loss",
	          subtitle: "",
	          filter: "forest-change",
	          type: "check",
	          layerType: "image"
	        },
	        {
	          key: "gain",
	          title: "Gain",
	          subtitle: "",
	          filter: "forest-change",
	          type: "check",
	          layerType: "image"
	        }
	      ]
	    },
	    {
	      key: "forma",
	      title: "FORMA Alerts",
	      subtitle: "(monthly, 500m, humid tropics)",
	      filter: "forest-change",
	      type: "radio",
	      layerType: "image"
	    },
	    {
	      key: "fires",
	      title: "Active Fires",
	      subtitle: "(past 7 days, 1km, global; NASA)",
	      filter: "forest-change",
	      type: "radio",
	      layerType: "dynamic"
	    },
	    {
	      key: "none_fc",
	      title: "None",
	      subtitle: "",
	      filter: "forest-change",
	      type: "radio",
	      layerType: "none"
	    },
	    {
	      key: "tcd",
	      title: "Tree Cover Density",
	      subtitle: "(year 2000, 30m global)",
	      filter: "forest-cover",
	      type: "radio",
	      layerType: "image"
	    },
	    {
	      key: "ifl",
	      title: "Intact Forest Landscapes",
	      subtitle: "(year 2000, 30m global)",
	      filter: "forest-cover",
	      type: "radio",
	      layerType: "dynamic"
	    },
	    {
	      key: "peat",
	      title: "Peat Lands",
	      subtitle: "(year 2002, Indonesia)",
	      filter: "forest-cover",
	      type: "radio",
	      layerType: "dynamic"
	    },
	    {
	      key: "tfcs",
	      title: "Tropical Carbon Stocks",
	      subtitle: "(early 2000s, 1km, tropics)",
	      filter: "forest-cover",
	      type: "radio",
	      layerType: "dynamic"
	    },
	    {
	      key: "primForest",
	      title: "Primary Forests",
	      subtitle: "(2000, 30m, Indonesia)",
	      filter: "forest-cover",
	      type: "radio",
	      layerType: "image"
	    },
	    {
	      key: "ldcover",
	      title: "Land Cover",
	      subtitle: "(mid 2000s, global)",
	      filter: "forest-cover",
	      type: "radio",
	      layerType: "dynamic"
	    },
	    {
	      key: "legal",
	      title: "Legal Classifications",
	      subtitle: "(year 2010, select countries)",
	      filter: "forest-cover",
	      type: "radio",
	      layerType: "dynamic"
	    },
	    {
	      key: "none_fco",
	      title: "None",
	      subtitle: "",
	      filter: "forest-cover",
	      type: "radio",
	      layerType: "none"
	    },
	    {
	      key: "oilPerm",
	      title: "Oil Palm",
	      subtitle: "(varies, select countries)",
	      filter: "forest-use",
	      type: "check",
	      layerType: "dynamic"
	    },
	    {
	      key: "logPerm",
	      title: "Logging",
	      subtitle: "(varies, select countries)",
	      filter: "forest-use",
	      type: "check",
	      layerType: "dynamic"
	    },
	    {
	      key: "minePerm",
	      title: "Mining",
	      subtitle: "(varies, select countries)",
	      filter: "forest-use",
	      type: "check",
	      layerType: "dynamic"
	    },
	    {
	      key: "woodPerm",
	      title: "Wood fiber plantations",
	      subtitle: "(varies, select countries)",
	      filter: "forest-use",
	      type: "check",
	      layerType: "dynamic"
	    },
	    {
	      key: "pal",
	      title: "Protected areas",
	      subtitle: "(varies, global)",
	      filter: "conservation",
	      type: "check",
	      layerType: "tiled"
	    },
	    {
	      key: "suit",
	      title: "Custom Suitability Map",
	      subtitle: "",
	      filter: "agro-suitability",
	      type: "check",
	      layerType: "image"
	    },
	    {
	      key: "opsd",
	      title: "Oil Palm suitability default",
	      subtitle: "",
	      filter: "agro-suitability",
	      type: "radio",
	      layerType: "dynamic"
	    },
	    {
	      key: "cons",
	      title: "Conservation Areas",
	      subtitle: "",
	      filter: "agro-suitability",
	      type: "radio",
	      layerType: "dynamic"
	    },
	    {
	      key: "elev",
	      title: "Elevation",
	      subtitle: "",
	      filter: "agro-suitability",
	      type: "radio",
	      layerType: "dynamic"
	    },
	    {
	      key: "slope",
	      title: "Slope",
	      subtitle: "",
	      filter: "agro-suitability",
	      type: "radio",
	      layerType: "dynamic"
	    },
	    {
	      key: "rain",
	      title: "Rainfall",
	      subtitle: "",
	      filter: "agro-suitability",
	      type: "radio",
	      layerType: "dynamic"
	    },
	    {
	      key: "soilDr",
	      title: "Soil Drainage",
	      subtitle: "",
	      filter: "agro-suitability",
	      type: "radio",
	      layerType: "dynamic"
	    },
	    {
	      key: "soilDe",
	      title: "Soil Depth",
	      subtitle: "",
	      filter: "agro-suitability",
	      type: "radio",
	      layerType: "dynamic"
	    },
	    {
	      key: "soilAc",
	      title: "Soil Acidity",
	      subtitle: "",
	      filter: "agro-suitability",
	      type: "radio",
	      layerType: "dynamic"
	    },
	    {
	      key: "soilTy",
	      title: "Soil Type",
	      subtitle: "",
	      filter: "agro-suitability",
	      type: "radio",
	      layerType: "dynamic"
	    },
	    {
	      key: "none_agro",
	      title: "None",
	      subtitle: "",
	      filter: "agro-suitability",
	      type: "radio",
	      layerType: "none"
	    }
		],

		// Miscellaneous Settings
		treeCoverLossSlider: {
			baseYear: 2000,
			numYears: 12
		},

		customSuitabilityDefaults: {
			computeBinaryRaster: [
				// Land Cover
				{
					id: 0,
					values: '1,2,3',
					classCount: 32,
					operator: 'in',
					name: 'LCInpR'
				},
				// Peat
				{
					id: 1,
					values: '0',
					classCount: 32,
					operator: 'in',
					name: 'PeatInpR'
				},
				// Slope
				{
					id: 2,
					values: '30',
					operator: 'lt',
					name: 'SlopeInpR'
				},
				// Conservation 500 - 5000
				{
					id: 3,
					values: '1000',
					operator: 'gt',
					name: 'ConsInpR'
				},
				// Water
				{
					id: 4,
					values: '100',
					operator: 'gt',
					name: 'WaterInpR'
				},
				// Elevation
				{
					id: 5,
					values: '1000',
					operator: 'lt',
					name: 'ElevInpR'
				},
				// Rainfall
				{
					id: 6,
					values: '1500,7000',
					operator: 'between',
					name: 'RainfallInpR'
				},
				// Soil Drain
				{
					id: 7,
					values: '2,3,4',
					classCount: 32,
					operator: 'in',
					name: 'SDrainInpR'
				},
				// Soil Depth
				{
					id: 8,
					values: '4,5,6,7',
					classCount: 32,
					operator: 'in',
					name: 'SDepthInpR'
				},
				// Soil Acidity
				{
					id: 9,
					values: '1,2,3,4,5,6,7',
					classCount: 32,
					operator: 'in',
					name: 'SAcidInpR'
				},
				// Soil Type
				{
					id: 10,
					values: '1,2,3,5,6,7,8,9',
					classCount: 32,
					operator: 'in',
					name: 'STypeInpR'
				}
			]
		},

		checkboxItems: [
			{
				node: 'grassland-shrub-check',
				name: 'landcover-checkbox',
				value: '1',
				checked: true
			},
			{
				node: 'plantations-check',
				name: 'landcover-checkbox',
				value: '2',
				checked: true
			},
			{
				node: 'agriculture-check',
				name: 'landcover-checkbox',
				value: '3',
				checked: true
			},
			{
				node: 'settlements-other-check',
				name: 'landcover-checkbox',
				value: '4',
				checked: false
			},
			{
				node: 'primary-forest-check',
				name: 'landcover-checkbox',
				value: '5',
				checked: false
			},
			{
				node: 'secondary-forest-check',
				name: 'landcover-checkbox',
				value: '6',
				checked: false
			},
			{
				node: 'wetlands-check',
				name: 'landcover-checkbox',
				value: '7',
				checked: false
			},
			{
				node: 'inceptisol-check',
				name: 'soil-type-checkbox',
				value: '1',
				checked: true
			},
			{
				node: 'oxisol-check',
				name: 'soil-type-checkbox',
				value: '7',
				checked: true
			},
			{
				node: 'alfisol-check',
				name: 'soil-type-checkbox',
				value: '5',
				checked: true
			},
			{
				node: 'ultisol-check',
				name: 'soil-type-checkbox',
				value: '2',
				checked: true
			},
			{
				node: 'spodosol-check',
				name: 'soil-type-checkbox',
				value: '8',
				checked: true
			},
			{
				node: 'entisol-check',
				name: 'soil-type-checkbox',
				value: '3',
				checked: true
			},
			{
				node: 'histosol-check',
				name: 'soil-type-checkbox',
				value: '4',
				checked: false
			},
			{
				node: 'mollisol-check',
				name: 'soil-type-checkbox',
				value: '9',
				checked: true
			},
			{
				node: 'rock-check',
				name: 'soil-type-checkbox',
				value: '10',
				checked: false
			}
		],

		suitabilitySliderTooltips: {
			"peat":{
        0: "0 cm",
        1: "200 cm",
        2: "400 cm",
        3: "600 cm",
        4: "800 cm",
        5: "1,000 cm",
        6: "1,200 cm"
      },
      "rainfall":{
        "label": "mm/yr"
      },
      "drainage":{
        1: "very poor",
        2: "poor, imperfect",
        3: "well, moderately well",
        4: "excessive, slightly excessive"
      },
      "depth":{
        1: "none, very shallow (0-10 cm)",
        2: "shallow (11-25 cm)",
        3: "mod shallow (26-50 cm)",
        4: "mod deep (51-75 cm)",
        5: "deep (76-100 cm)",
        6: "very deep (101-150 cm)",
        7: "extremely deep (> 150 cm)"
      },
      "acidity":{
        1: "excessively acid (< 4.0)",
        2: "extremely acid (4.0 - 4.5)",
        3: "very strongly acid (4.6 - 5.0)",
        4: "strongly acid (5.1 - 5.5)",
        5: "moderately acid (5.6 - 6.0)",
        6: "slightly acid (6.1 - 6.5)",
        7: "neutral (6.6 - 7.3)",
        8: "slightly alkaline (7.4 - 7.8)"
      },
      "treeCover": {
        0: "2001",
        1: "2002",
        2: "2003",
        3: "2004",
        4: "2005",
        5: "2006",
        6: "2007",
        7: "2008",
        8: "2009",
        9: "2010",
        10: "2011",
        11: "2012"
      }
		}


	};

});