define([
    "dojo/on",
    "dojo/dom",
    "dojo/query",
    "dojo/topic",
    "dojo/dom-class",
    "dojo/dom-style",
    "dijit/registry",
    "dojo/_base/array",
    "dojo/dom-geometry",
    "dojo/number",
    "map/config",
    "map/Map",
    "map/Finder",
    "map/MapModel",
    "utils/Hasher",
    "utils/Animator",
    "esri/geometry/webMercatorUtils",
    "esri/geometry/Point",
    "map/Controls",
    "map/LayerController",
    "analysis/WizardHelper",
    "components/LayerList",
    "utils/Loader"
], function(on, dom, dojoQuery, topic, domClass, domStyle, registry, arrayUtils, domGeom, number, MapConfig, Map, Finder, MapModel, Hasher, Animator, webMercatorUtils, Point, MapControl, LayerController, WizardHelper, LayerList, Loader) {
    'use strict';

    var initialized = false,
        mapModel,
        layerList,
        dataDivLoaded = false,
        map;
    var infoDiv = document.createElement("infoDiv");

    return {

        /* NOTE : Set Default Layers in renderComponents at the bottom of the page, 
							Hash needs to be updated before the LayerList is created */

        init: function(template) {

            var self = this,
                ids = [];

            if (initialized) {
                registry.byId("stackContainer").selectChild("mapView");
                return;
            }

            initialized = true;
            registry.byId("mapView").set('content', template);
            registry.byId("stackContainer").selectChild("mapView");

            // 20141222 CRB - Added restoring of map center & level when sharing url
            var hashX =  Hasher.getHash('x');
            var hashY =  Hasher.getHash('y');
            var hashL =  Hasher.getHash('l');
            //console.log("**********************> map settings in hash: " + hashX + "/" + hashY + "/" + hashL);
            var mapOptions = {};
            for (var prop in MapConfig.mapOptions) {
                mapOptions[prop] = MapConfig.mapOptions[prop];
            }
            if (hashX != undefined && hashX != "") mapOptions.centerX = hashX;
            if (hashX != undefined && hashX != "") mapOptions.centerY = hashY;
            if (hashX != undefined && hashX != "") mapOptions.zoom = hashL;
            //console.log("**********************> map options:", mapOptions);

            // This is not esri map, it is custom map class, esri map object available as map.map
            //map = new Map(MapConfig.mapOptions);
            map = new Map(mapOptions);

            // Set the map object to the global app variable for easy use throughout the project
            app.map = map.map;

            map.on("map-ready", function() {
                // Bind the Model to the Map Panel, and then again to the list in the header
                var extent = webMercatorUtils.webMercatorToGeographic(map.map.extent);
                var x = number.round(extent.getCenter().x, 2);
                var y = number.round(extent.getCenter().y, 2);

                Hasher.setHash('x', x);
                Hasher.setHash('y', y);
                Hasher.setHash('l', 5);

                mapModel = MapModel.initialize("map-container");
                // Render any React Components - These will activate any default or hashed layers
                // Only use this after the map has been loaded,
                // Also call other functions in renderComponents that build UI elements 
                self.renderComponents();
                // Connect Events
                self.bindUIEvents();
                // Check Hash for some defaults and react accordingly
                var wizardState = Hasher.getHash('wiz');
                if (wizardState !== undefined && wizardState === 'open') {
                    WizardHelper.toggleWizard();
                }
            });

            // Set up zoom listener for Protected Areas Layer *and now Gain Layer
            app.map.on('zoom-end', LayerController.checkZoomDependentLayers.bind(LayerController));

            // Set up Click Listener to Perform Identify
            app.map.on('click', Finder.performIdentify.bind(Finder));

            // Have the Finder create any formatter functions necessary for info window content
            // and then have it setup info window specific listeners for specific info windows with buttons
            Finder.createFormattingFunctions();
            Finder.setupInfowindowListeners();

            // Fade in the map controls, first, get a list of the ids		
            dojoQuery(".gfw .map-layer-controls li").forEach(function(item) {
                ids.push(item.id);
            });
            // FadeIn fades opacity from current opacity to 1
            Animator.fadeIn(ids, {
                duration: 100
            });

            // Initialize Add This
            addthis.init();

        },

        bindUIEvents: function() {

            var self = this;

            on(app.map, "mouse-move", function(evt) {
                MapModel.set('currentLatitude', evt.mapPoint.getLatitude().toFixed(4));
                MapModel.set('currentLongitude', evt.mapPoint.getLongitude().toFixed(4));
            });

            on(app.map, "extent-change", function(e) {
                var delta = e.delta;
                var extent = webMercatorUtils.webMercatorToGeographic(e.extent);
                var levelChange = e.levelChange;
                var lod = e.lod;
                var map = e.target;

                var x = number.round(extent.getCenter().x, 2);
                var y = number.round(extent.getCenter().y, 2);

                Hasher.setHash('x', x);
                Hasher.setHash('y', y);
                Hasher.setHash('l', lod.level);

                // Hasher.setHash({
                //     x: x,
                //     y: y,
                //     l: lod.level
                // });
            });

            on(dom.byId("locator-widget-button"), "click", function() {
                MapModel.set('showBasemapGallery', false);
                MapModel.set('showSharingOptions', false);
                MapModel.set('showLocatorOptions', !MapModel.get('showLocatorOptions'));
            });

            on(dom.byId("basemap-gallery-button"), "click", function() {
                MapModel.set('showLocatorOptions', false);
                MapModel.set('showSharingOptions', false);
                MapModel.set('showBasemapGallery', !MapModel.get('showBasemapGallery'));
            });

            on(dom.byId("share-button"), "click", function() {
                MapModel.set('showLocatorOptions', false);
                MapModel.set('showBasemapGallery', false);
                MapModel.set('showSharingOptions', !MapModel.get('showSharingOptions'));
            });

            on(dom.byId("dms-search"), "change", function(evt) {
                var checked = evt.target ? evt.target.checked : evt.srcElement.checked;
                if (checked) {
                    MapModel.set('showDMSInputs', true);
                    MapModel.set('showLatLongInputs', false);
                }
            });

            on(dom.byId("lat-long-search"), "change", function(evt) {
                var checked = evt.target ? evt.target.checked : evt.srcElement.checked;
                if (checked) {
                    MapModel.set('showDMSInputs', false);
                    MapModel.set('showLatLongInputs', true);
                }
            });

            on(dom.byId("search-option-go-button"), "click", function() {
                Finder.searchAreaByCoordinates();
            });

            on(dom.byId("clear-search-pins"), "click", function() {
                map.map.graphics.clear();
                MapModel.set('showClearPinsOption', false);
            });

            dojoQuery(".map-layer-controls li").forEach(function(node) {
                on(node, "mouseover", function(evt) {
                    self.toggleLayerList(node);
                });
            });

            on(dom.byId("master-layer-list"), "mouseleave", function() {
                domStyle.set("master-layer-list", "opacity", 0.0);
                domStyle.set("master-layer-list", "left", '-1000px');
            });

            dojoQuery(".fires_toolbox .toolbox-list li").forEach(function(node) {
                on(node, "click", MapControl.toggleFiresLayerOptions);
            });

            on(dom.byId("high-confidence"), "change", MapControl.toggleFiresConfidenceLevel);

            dojoQuery(".gfw .overlays-container .overlays-checkbox").forEach(function(node) {
                on(node, "click", MapControl.toggleOverlays);
            });

            on(dom.byId("legend-title"), "click", function() {
                MapControl.toggleLegendContainer();
            });

            on(dom.byId("reset-suitability"), "click", function() {
                MapControl.resetSuitabilitySettings();
            });

            on(dom.byId("export-suitability"), "click", function() {
                MapControl.exportSuitabilitySettings();
            });

            on(dom.byId("close-suitability"), "click", function() {
                // Pass in the key from the MapConfig.LayerUI
                // for Custom Suitability Layer
                self.toggleItemInLayerList('suit');
            });

            on(dom.byId("wizard-tab"), "click", function() {
                WizardHelper.toggleWizard();
            });

            // Click info icon in suitabiliyy tools container for all sliders
            dojoQuery('.suitability-accordion .slider-name .layer-info-icon').forEach(function(node) {
                on(node, 'click', function(evt) {
                    var target = evt.target ? evt.target : evt.srcElement,
                        dataClass = target.dataset ? target.dataset.class : target.getAttribute('data-class');
                    self.showInfoPanel(dataClass);
                });
            });

            // Click info icon in suitabiliyy tools container for Headers of sections of checkboxes
            dojoQuery('.suitability-accordion .criteria-separator .layer-info-icon').forEach(function(node) {
                on(node, 'click', function(evt) {
                    var target = evt.target ? evt.target : evt.srcElement,
                        dataClass = target.dataset ? target.dataset.class : target.getAttribute('data-class');
                    self.showInfoPanel(dataClass);
                });
            });


        },

        toggleLayerList: function(el) {
            var filter = el.dataset ? el.dataset.filter : el.getAttribute('data-filter'),
                newclass = el.dataset ? el.dataset.class : el.getAttribute('data-class'),
                position = domGeom.position(el, true),
                containerWidth = 180,
                offset;

            // 200 is the default width of the container, to keep it centered, update containerWidth
            offset = (position.w - containerWidth) / 2;
            domStyle.set("master-layer-list", "left", (position.x + offset) + "px");

            // Show the Container
            Animator.fadeIn("master-layer-list", {
                duration: 100
            });
            // Add the Appropriate Class so the Items display correct color, styling etc.
            domClass.remove("master-layer-list");
            domClass.add("master-layer-list", newclass);

            // Update the list, reuse the title from the first anchor tag in the element (el)
            if (layerList) {
                layerList.setProps({
                    title: el.children[0].innerHTML,
                    filter: filter
                });
            }
        },

        renderComponents: function() {

            // Set Default Layers Here if none are present in the URL
            // Current Default Layers(lyrs) are tcc and loss
            var state = Hasher.getHash();
            // If state.lyrs is undefined, set hash, otherwise, load the layers already there
            if (state.lyrs === undefined) {
                Hasher.toggleLayers('tcc');
                Hasher.toggleLayers('loss');
            }

            MapControl.generateSuitabilitySliders();

            layerList = new LayerList({
                items: MapConfig.layersUI
            }, "master-layer-list");

            MapControl.generateTimeSliders();

        },


        toggleItemInLayerList: function(key) {
            layerList.toggleFormElement(key);
        },

        centerChange: function(x, y, zoom) {
            //debugger;
            //console.log("center change");
            //console.log(o.map);
            //compare current center and change if different
            if (!initialized) {
                return; //map not initialized yet
            }
            var currentExtent = webMercatorUtils.webMercatorToGeographic(map.map.extent);

            var extent = webMercatorUtils.webMercatorToGeographic(map.map.extent);
            var x = number.round(extent.getCenter().x, 2);
            var y = number.round(extent.getCenter().y, 2);
            var l = map.map.getLevel();

            // Hasher.setHash('x', x);
            // Hasher.setHash('y', y);
            // Hasher.setHash('l', 5);
            //var newState = HashController.newState;
            //console.log(Hasher.getHash());
            var state = Hasher.getHash();

            // Hasher.toggleLayers('tcc');
            // Hasher.toggleLayers('loss');


            var centerChangeByUrl = ((parseFloat(state.x) != x) || (parseFloat(state.y) != y) || (parseInt(state.l) != l));
            //console.log(centerChangeByUrl + " " + state.y + " " + state.x);
            if (centerChangeByUrl) {
                //o.mapExtentPausable.pause();
                // on.once(map.map, "extent-change", function() {
                //     o.mapExtentPausable.resume();
                // });
                var ptWM = webMercatorUtils.geographicToWebMercator(new Point(parseFloat(state.x), parseFloat(state.y)));

                map.map.centerAndZoom(ptWM, parseInt(state.l));

                // Hasher.setHash(x, xValue);
                // Hasher.setHash(y, yValue);
            }
        },

        showInfoPanel: function(infoPanelClass) {
            if (typeof(infoPanelClass) === 'object') {
                var content = infoPanelClass;
                MapControl.createDialogBox(content);
            } else {
                if (dataDivLoaded) {
                    var content = infoDiv.querySelector("." + infoPanelClass);
                    MapControl.createDialogBox(content);
                } else {
                    Loader.getTemplate("data").then(function(template) {
                        dataDivLoaded = true;
                        infoDiv.innerHTML = template;
                        var content = infoDiv.querySelector("." + infoPanelClass);
                        MapControl.createDialogBox(content);
                    })
                }
            }
        }
    };

});