define([
	"esri/config",
	"dojo/Deferred",
	"dojo/dom-class",
	"dojo/promise/all",
	"dojo/_base/array",
	// Local Modules from report folder
	"report/config",
	"report/Fetcher"
], function (esriConfig, Deferred, domClass, all, arrayUtils, Config, Fetcher) {
	'use strict';

	window.report = {};

	return {

		init: function () {
			// Payload is passed as Global Payload object, grab and make sure its defined before doing anything else
			if (window.payload) {
				this.applyConfigurations();
				this.prepareForAnalysis();
			} else {
				// There was a problem getting the payload params from the last window
				// Notify the user here that the report will not load and show the correct warning
				alert("There was an erorr generating the report at this time.  Please make sure your pop-up blocker is disabled and try again.");
			}
		},

		applyConfigurations: function () {
			arrayUtils.forEach(Config.corsEnabledServers, function (server) {
				esriConfig.defaults.io.corsEnabledServers.push(server);
			});
		},

		prepareForAnalysis: function () {

			var features = window.payload.features;

			// First, if report.payload.features is an array, we need a single geometry to work with,
			if (Object.prototype.toString.call(features) === '[object Array]') {
				if (features.length === 1) {
					report.geometry = features[0].geometry;
				} else {
					report.geometry = features[0].geometry;
					arrayUtils.forEach(features, function (feature, index) {
						// Skip the first one, geometry alerady grabbed above
						if (index > 0) {
							arrayUtils.forEach(feature.geometry.rings, function (ring) {
								report.geometry.addRing(ring);
							});
						}
					});
				}
			} else {
				report.geometry = features.geometry;
			}

			// Next, set some properties that we can use to filter what kinds of queries we will be performing
			report.analyzeClearanceAlerts = window.payload.types.forma;
			report.analyzeTreeCoverLoss = window.payload.types.loss;
			report.analyzeSuitability = window.payload.types.suit;
			report.analyzeMillPoints = window.payload.types.risk;

			// Lastly, grab the datasets from the payload and store them in report so we know which 
			// datasets we will perform the above analyses on
			report.datasets = window.payload.datasets;

			// Now that we are ready, set the title, unhide the report, and begin the analysis
			this.setTitleAndShowReport(window.payload.title);
			this.beginAnalysis();

		},

		/*
			@param  {string} title
		*/
		setTitleAndShowReport: function (title) {
			// The report markup is hidden by default so they user does not see a flash of unstyled content
			// Remove the hidden class at this point and set the title
			document.getElementById("title").innerHTML = title;
			domClass.remove("report", "hidden");
		},

		/*
			Get a lookup list of deferred functions to execute via _getArrayOfRequests
			Fire off a query to get the area of the analysis and clearance alert bounds if necessary
			split the lookup list based on the size to managable chunks using this._chunk
			execute each chunk synchronously so we dont overwhelm the server using processRequests
			  -- These deferred functions will request data, visualize it, and insert it into dom (all in Fetcher)
			uses _getDeferredsForItems to return actual deferreds based on items in lookup list
		*/
		beginAnalysis: function () {

			var requests = this._getArrayOfRequests(),
					self = this,
					chunk;

			// Helper Function to Continue Making Requests if Necessary
			function processRequests() {
				// If the requests array has more chunks to process, process them, else, analysis is complete
				if (requests.length > 0) {
					// Remove a chunk from the requests array
					chunk = requests.shift();
					// Get Deferreds, wait til they are done, then call self to check for more
					all(self._getDeferredsForItems(chunk)).then(processRequests);
				} else {
					self.analysisComplete();
				}
			}

			// Get area 
			Fetcher.getAreaFromGeometry(report.geometry);

			// If report.analyzeClearanceAlerts is true, get the bounds, else this resolves immediately and moves on
			all([
				Fetcher._getClearanceBounds()
			]).then(function () {
				// Now that all dependencies and initial Queries are resolved, start processing all the analyses deferreds
				// If the number of requests is less then three, do all now, else chunk the requests and start processing them
				if (requests.length < 3) {
					all(self._getDeferredsForItems(requests)).then(self.analysisComplete);
				} else {
					// Get an array of arrays, each containing 3 lookup items so 
					// we can request three analyses at a time
					requests = requests.chunk(3);
					processRequests();
				}

			});

		},

		/*
			Analysis is complete, handle that here
		*/
		analysisComplete: function () {

			// Show Print Option as Enabled
			domClass.remove("print", "disabled");

			// Add the Print Listener

		},

		/* Helper Functions */

		/*
			Returns array of strings representing which requests need to be made
			@return  {array}
			Deferred Mapping is in comments below this function
		*/
		_getArrayOfRequests: function () {
			var requests = [];

			if (report.analyzeSuitability) {
				requests.push('suit');
			}

			if (report.analyzeMillPoints) {
				requests.push('mill');
			}

			if (report.analyzeTreeCoverLoss || report.analyzeClearanceAlerts) {
				for (var key in report.datasets) {
					if (report.datasets[key]) {
						requests.push(key);
					}
				}
			}

			if (report.analyzeTreeCoverLoss) {
				requests.push('fires');
			}

			return requests;
		},

		/*
			
			Deferred's Mapping

			suit - Fetcher._getSuitabilityAnalysis()
			fires - Fetcher._getFireAlertAnalysis()
			mill - Fetcher._getMillPointAnalysis()
			primForest - Fetcher.getPrimaryForestResults()
			protected - Fetcher.getProtectedAreaResults()
			treeDensity - Fetcher.getTreeCoverResults()
			carbon - Fetcher.getCarbonStocksResults()
			intact - Fetcher.getIntactForestResults()
			landCover - Fetcher.getLandCoverResults()
			legal - Fetcher.getLegalClassResults()
			peat - Fetcher.getPeatLandsResults()
			rspo - Fetcher.getRSPOResults()
		*/

		/*
			@param  {array} item
			@return {array} of deferred functions
		*/
		_getDeferredsForItems: function (items) {
			var deferreds = [];

			arrayUtils.forEach(items, function (item) {

				switch (item) {
					case "suit":
						deferreds.push(Fetcher._getSuitabilityAnalysis());
					break;
					case "mill":
						deferreds.push(Fetcher._getMillPointAnalysis());
					break;
					case "carbon":
						deferreds.push(Fetcher.getCarbonStocksResults());
					break;
					case "intact":
						deferreds.push(Fetcher.getIntactForestResults());
					break;
					case "landCover":
						deferreds.push(Fetcher.getLandCoverResults());
					break;
					case "legal":
						deferreds.push(Fetcher.getLegalClassResults());
					break;
					case "peat":
						deferreds.push(Fetcher.getPeatLandsResults());
					break;
					case "primForest":
						deferreds.push(Fetcher.getPrimaryForestResults());
					break;
					case "protected":
						deferreds.push(Fetcher.getProtectedAreaResults());
					break;
					case "rspo":
						deferreds.push(Fetcher.getRSPOResults());
					break;
					case "treeDensity":
						deferreds.push(Fetcher.getTreeCoverResults());
					break;
					case "fires":
						deferreds.push(Fetcher._getFireAlertAnalysis());
					break;
					default:
					break;
				}

			});

			return deferreds;
		}

	};

});