sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/json/JSONModel",
	"sap/ui/demo/wt/model/formatter",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator"
], function (Controller, JSONModel, formatter, Filter, FilterOperator) {
	"use strict";

	return Controller.extend("sap.ui.demo.wt.controller.Detail", {

		formatter: formatter,

		onInit: function () {
		
			this.getOwnerComponent().getRouter().getRoute("detail").attachPatternMatched(this._onRouteMatched, this);
		},
		
		
		_onRouteMatched: function(oEvent) {
			this._annonceId = oEvent.getParameter("arguments").id;
			
			var oModel = new sap.ui.model.json.JSONModel("http://api.dila.fr/opendata/api-boamp/annonces/v230/" + this._annonceId);
			
			this.getView().setModel(oModel);
			
		}
		
	});

});
