// THIS COMPONENT IS A PIECE NECESSARY FOR STEP TWO

define([
	"react",
  "analysis/config",
  "esri/Color",
  "esri/graphic",
  "esri/request",
  "esri/toolbars/draw",
  "esri/geometry/Polygon",
  "esri/geometry/scaleUtils",
  "esri/symbols/SimpleFillSymbol",
  "esri/symbols/SimpleLineSymbol",
  "dojo/dom",
  "dojo/query",
  "dojo/sniff",
  "dijit/registry",
  "dojo/dom-class",
  "dojo/store/Memory",
  "dojo/dom-construct",
  "dijit/form/ComboBox",
  "map/config",
  "map/MapModel"
], function (React, AnalyzerConfig, Color, Graphic, esriRequest, Draw, Polygon, scaleUtils, SimpleFillSymbol, SimpleLineSymbol, dom, dojoQuery, sniff, registry, domClass, Memory, domConstruct, ComboBox, MapConfig, MapModel) {

  var customFeatureSymbol = new SimpleFillSymbol(SimpleFillSymbol.STYLE_SOLID,
                            new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID, new Color([255, 0, 0]), 2),
                            new Color([103, 200, 255, 0.0])),
      customFeatures = [],
      graphicsLayer,
      drawToolbar,
      activeTool;

  function getDefaultState() {
    return {
      graphics: customFeatures,
      showUploadTools: false
    };
  }

	return React.createClass({

    getInitialState: function () {
      return getDefaultState();
    },

    componentDidMount: function () {
      // Create all the Necessary Drawing Tools Here
      drawToolbar = new Draw(app.map);
      drawToolbar.on('draw-end', this._drawComplete);
      graphicsLayer = app.map.getLayer(MapConfig.customGraphicsLayer.id);

      /* 
        If adding graphics from URL, pull them from URL, add to customFeatures, then setState here like below 
        customFeatures.push(graphic);
        this.setState({
          graphics: customFeatures
        });
      */

    },

    componentWillReceiveProps: function (newProps) {
      if (newProps.isResetting) {
        this.replaceState(getDefaultState());
        this._disableUploadTools();
        this._deactivateToolbar();
        this._removeActiveClass();
      }
    },

    render: function () {
      return (
        React.DOM.div({'className': 'custom-area'},
          React.DOM.p({'className': 'drawing-instructions'}, AnalyzerConfig.customArea.instructions),
          React.DOM.div({'className': 'drawing-tools'},
            React.DOM.div({'className': 'drawing-tool-button', 'onClick': this._activateToolbar, 'id': 'draw-freehand' }, AnalyzerConfig.customArea.freehandLabel),
            React.DOM.div({'className': 'drawing-tool-button', 'onClick': this._activateToolbar, 'id': 'draw-polygon' }, AnalyzerConfig.customArea.polyLabel),
            React.DOM.div({'className': 'drawing-tool-button', 'onClick': this._showUploadTools, 'id': 'draw-upload' }, AnalyzerConfig.customArea.uploadLabel)
          ),
          React.DOM.div({'className': 'upload-toolbox ' + (this.state.showUploadTools ? '' : 'hidden')},
            React.DOM.ul({'className': 'upload-instructions'},
              AnalyzerConfig.customArea.uploadInstructions.map(this._instructionsMapper)
            ),
            React.DOM.form({'enctype': 'multipart/form-data', 'method': 'post', 'id': 'uploadForm', 'onChange': this._uploadShapefile},
              React.DOM.label(null,
                React.DOM.input({'type': 'file', 'name': 'file', 'id': 'shapefileUploader'})
              )
            ),
            React.DOM.div({'id': 'upload-select-boxes'})
          ),
          React.DOM.div({'className': 'custom-graphics-list-container ' + (this.state.graphics.length > 0 ? '' : 'hidden')},
            React.DOM.div({'className': 'clear-custom-features', 'onClick': this._clearFeatures}, "clear all"),
            React.DOM.div({'className': 'drawing-instructions'}, AnalyzerConfig.customArea.instructionsPartTwo),
            this.state.graphics.map(this._graphicsMapper, this)
          )
        )
      );
    },

    _graphicsMapper: function (item) {
      return React.DOM.div(
        {
          'className': 'custom-feature-row', 
          'onClick': this._chooseGraphic,
          'data-feature-id': item.attributes.WRI_ID
        },
        item.attributes[AnalyzerConfig.stepTwo.labelField]);
    },

    _instructionsMapper: function (item) {
      return React.DOM.li(null, item);
    },

    _clearFeatures: function () {
      customFeatures = [];
      graphicsLayer.clear();
      this.setState(getDefaultState());
      this.props.callback.updateAnalysisArea();
      // Deactivate all the tools if active
      this._deactivateToolbar();
      this._removeActiveClass();
    },

    _activateToolbar: function (evt) {

      // If any other tools are active, remove the active class
      this._removeActiveClass();

      // Hide the Upload tools if visible
      this.setState({
        showUploadTools: false
      });

      // If they clicked the same button twice, deactivate the toolbar
      if (activeTool === evt.target.id) {
        this._deactivateToolbar();
        return;
      }

      activeTool = evt.target.id;

      switch (evt.target.innerHTML) {
        case AnalyzerConfig.customArea.freehandLabel:
          drawToolbar.activate(Draw.FREEHAND_POLYGON);
        break;
        case AnalyzerConfig.customArea.polyLabel:
          drawToolbar.activate(Draw.POLYGON);
        break;
        default:
        break;
      }

      domClass.add(evt.target, "active");

      // Update the Model so other parts of the application can be aware of this
      MapModel.set('drawToolsEnabled', true);

    },

    _showUploadTools: function (evt) {

      if(domClass.contains(evt.target, 'active')) {
        this._disableUploadTools();
      } else {
        domClass.add(evt.target, 'active');
        this.setState({
          showUploadTools: true
        });
      }

      // If one of the other tools is active, deactivate it and remove active classes from other tools
      if (activeTool) {
        this._deactivateToolbar();
        dojoQuery(".drawing-tool-button").forEach(function (node) {
          if (node.id !== evt.target.id) {
            domClass.remove(node, "active");
          }
        });
      }

    },

    _uploadShapefile: function (evt) {

      if (evt.target.value === "") {
        // Form was reset so ignore onChange event
        return;
      }

      var filename = evt.target.value.toLowerCase(),
          self = this,
          params,
          extent;

      // Filename is full path so extract the filename if in IE
      if (sniff("ie")) {
        var temp = filename.split("\\");
        filename = temp[temp.length - 1];
      }

      if (filename.indexOf('.zip') < 0) {
        alert(AnalyzerConfig.customArea.incorrectFileTypeError);
        return;
      }

      // Split based on .
      filename = filename.split(".");

      //Chrome and IE add c:\fakepath to the value - we need to remove it
      //See this link for more info: http://davidwalsh.name/fakepath
      filename = filename[0].replace("c:\\fakepath\\", "");

      params = {
        'name': filename,
        'targetSR': app.map.spatialReference,
        'maxRecordCount': 1000,
        'reducePrecision': true,
        'numberOfDigitsAfterDecimal': 0,
        'enforceInputFileSizeLimit': true,
        'enforceOutputJsonSizeLimit': true
      };

      // Generalize Features, based on https://developers.arcgis.com/javascript/jssamples/portal_addshapefile.html
      extent = scaleUtils.getExtentForScale(app.map, 40000);
      params.generalize = true;
      params.maxAllowableOffset = extent.getWidth() / app.map.width;

      esriRequest({
        url: AnalyzerConfig.customArea.portalUrl,
        content: {
          'filetype': 'shapefile',
          'publishParameters': JSON.stringify(params),
          'f': 'json',
          'callback.html': 'textarea'
        },
        form: dom.byId('uploadForm'),
        handleAs: 'json',
        load: self._uploadSuccess,
        error: self._uploadError
      });

    },

    _uploadError: function (err) {
      alert("Error: " + err.message);
    },

    _uploadSuccess: function (res) {

      // Create Items for DropDown boxes
      var locationNode = dom.byId("upload-select-boxes"),
          featureCollection = res.featureCollection,
          uploadedFeatureStore = [],
          self = this,
          store;

      // Create a store of Data
      featureCollection.layers[0].layerDefinition.fields.forEach(function (field) {
        uploadedFeatureStore.push({
          name: field.name,
          id: field.alias
        });
      });

      // function that will assist in the cleanup once a selection is made
      function resetView() {
        // if (registry.byId("uploadComboWidget")) {
        //   registry.byId("uploadComboWidget").destroy();
        // }
        // if (dom.byId("dropdownContainer")) {
        //   domConstruct.destroy("dropdownContainer");
        // }
        if (registry.byId("uploadComboNameWidget")) {
          registry.byId("uploadComboNameWidget").destroy();
        }
        if (dom.byId("dropdownContainerName")) {
          domConstruct.destroy("dropdownContainerName");
        }

        self._disableUploadTools();
      }

      // Create Containers for DropDowns
      // domConstruct.create("div", {
      //   'id': 'dropdownContainer',
      //   'innerHTML': '<div id="uploadComboWidget"></div>'
      // }, locationNode, "after");

      domConstruct.create("div", {
        'id': 'dropdownContainerName',
        'innerHTML': '<div id="uploadComboNameWidget"></div>'
      }, locationNode, "after");

      // Create a Memory Store for both Dropdowns
      store = new Memory({
        data: uploadedFeatureStore
      });

      // Create the DropDowns finally and handle onChange behavior
      new ComboBox({
        id: "uploadComboNameWidget",
        value: "-- Choose name field --",
        store: store,
        searchAttr: "name",
        onChange: function (name) {
          if (name) {
            self._addFeaturesToMapFromShapefile(featureCollection.layers[0].featureSet, name);
          }
          resetView();
        }
      }, "uploadComboNameWidget");

      // new ComboBox({
      //   id: "uploadComboWidget",
      //   value: "-- Choose Unique ID field --",
      //   store: store,
      //   searchAttr: "name",
      //   onChange: function (name) {
      //     self._addFeaturesToMapFromShapefile(featureCollection.layers[0].featureSet, name);
      //   }
      // }, "uploadComboWidget");
      
    },

    _addFeaturesToMapFromShapefile: function (featureSet, labelName) {

      var counter = this._nextAvailWRI_ID(),
          graphic,
          polygon,
          extent;

      // Add the appropriate attribtue that is used for labeling, and WRI_ID
      // Then add the graphic to the map and to the customFeatures list
      featureSet.features.forEach(function (feature, index) {
        feature.attributes[AnalyzerConfig.stepTwo.labelField] = "ID - " + (counter + index) + ": " + feature.attributes[labelName];
        feature.attributes.WRI_ID = (counter + index);
        polygon = new Polygon(feature.geometry);
        graphic = new Graphic(polygon, customFeatureSymbol, feature.attributes);
        extent = extent ? extent.union(polygon.getExtent()) : polygon.getExtent();
        customFeatures.push(graphic);
        graphicsLayer.add(graphic);
      });

      app.map.setExtent(extent, true);
      // Update the UI
      this.setState({
        graphics: customFeatures
      });

    },

    _drawComplete: function (evt) {
      
      this._removeActiveClass();
      this._deactivateToolbar();

      if (!evt.geometry) {
        return;
      }

      // WRI_ID = Unique ID for Drawn Graphics

      var id = this._nextAvailWRI_ID(),
          attrs = { "WRI_ID": id },
          graphic;

      // Add a Label
      attrs[AnalyzerConfig.stepTwo.labelField] = "ID - " + id + ": Custom drawn feature";
      graphic = new Graphic(evt.geometry, customFeatureSymbol, attrs);

      graphicsLayer.add(graphic);

      // Update the UI
      customFeatures.push(graphic);
      this.setState({
        graphics: customFeatures
      });
    },

    _deactivateToolbar: function () {
      drawToolbar.deactivate();
      activeTool = undefined;
      MapModel.set('drawToolsEnabled', false);
    },

    _disableUploadTools: function () {
      dom.byId("shapefileUploader").value = "";
      domClass.remove("draw-upload", "active");
      this.setState({
        showUploadTools: false
      });
    },

    _removeActiveClass: function () {
      dojoQuery(".drawing-tools .drawing-tool-button").forEach(function (node) {
        domClass.remove(node, "active");
      });
    },

    _chooseGraphic: function (evt) {
      var id = evt.target.dataset ? evt.target.dataset.featureId : evt.target.getAttribute("data-feature-id"),
          self = this;
      graphicsLayer.graphics.forEach(function (g) {
        if (g.attributes.WRI_ID === parseInt(id)) {
          app.map.setExtent(g.geometry.getExtent(), true);
          // Pass the Feature to Component StepTwo.js, he will update his state to completed is true, and he will 
          // have a feature to display in the Current feature for analysis section
          self.props.callback.updateAnalysisArea(g);
        }
      });
    },

    _nextAvailWRI_ID: function() {
      var i = 0,
          x = 0,
          graphics = graphicsLayer.graphics,
          length = graphics.length,
          temp;
      for (i; i < length; i++) {
        if (graphics[i].geometry.type !== "point") {
          temp = parseInt(graphics[i].attributes.WRI_ID);
          if (!isNaN(temp)) {
            x = (x > temp) ? x : temp;
          }
        }
      }
      return (x + 1);
    }

  });

});