sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/json/JSONModel",
	"sap/ui/demo/wt/model/formatter",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
	"sap/ui/demo/wt/model/export"
], function (Controller, JSONModel, formatter, Filter, FilterOperator, DataExport) {
	"use strict";

	return Controller.extend("sap.ui.demo.wt.controller.InvoiceList", {

		formatter: formatter,

		onInit: function () {
			this.getOwnerComponent().getRouter().getRoute("overview").attachPatternMatched(this._onRouteMatched, this);			

			var oViewModel = new JSONModel({
				currency: "EUR"
			});
			this.getView().setModel(oViewModel, "view");
		},

		onFilterInvoices: function (oEvent) {

			// build filter array
			var aFilter = [];
			var sQuery = oEvent.getParameter("query");

			this.getOwnerComponent().getRouter().navTo("overview", {criterion: sQuery, curseur: 100, count: 100 })
			
		},
		
		loadData: function(sQuery, iCurseur, iCount) {
			var oTable = this.byId("invoiceList");

			oTable.setBusyIndicatorDelay(0);
			oTable.setBusy(true);
			
			this.byId("selecAllCB").setSelected(false);
			var that = this;
			setTimeout(function() {
				
				var oJSONModel = new sap.ui.model.json.JSONModel();
				oJSONModel.loadData("http://api.dila.fr/opendata/api-boamp/annonces/search?criterion=" + sQuery + "&curseur=" + iCurseur + "&nbItemParPage=" + iCount, null, false);
				oJSONModel.setSizeLimit(iCount);
				that.getView().setModel(oJSONModel);
				
				that.byId("totalCountLabel").setText("Total Count: " + oJSONModel.getProperty("/nbItemsExistants"));
				
				oTable.invalidate();
				oTable.setBusy(false);
				
			}, 500);
			
			
		},

		onPress: function (oEvent) {			
			var sId = oEvent.getSource().getBindingContext().getProperty("value");
			
			var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			oRouter.navTo("detail", { id: sId });
		},
		
		_onRouteMatched: function(oEvent) {
			var sQuery = oEvent.getParameter("arguments").criterion;
			var iCurseur = parseInt(oEvent.getParameter("arguments").curseur);
			var iCount = parseInt(oEvent.getParameter("arguments").count);
			
			this.byId("searchField").setValue(sQuery);
			this.loadData(sQuery, iCurseur, iCount);
			
		},
		
		toggleSelectAll: function(oEvent) {
			var selected = oEvent.getSource().getSelected();
			var items = this.byId("invoiceList").getItems();
			for (var i = 0; i < items.length; ++i) {
				var item = items[i];
				item.setSelected(selected);
			}
		},
		
		onDataExport: function() {
			
			var that = this;
			
			var oTable = this.byId("invoiceList");
			oTable.setBusy(true);
			
			var that = this;
			setTimeout(jQuery.proxy(function() {

				var data = {"reports":[]};
				var jsonModel = new JSONModel();
				jsonModel.setSizeLimit(10000);
				
				var dataExport = new DataExport();
	
				var items = oTable.getSelectedItems();
	
				var iReturned = 0;
				var columns = [];
				for (var i = 0; i < items.length; ++i) {				
					var item = items[i];
					$.ajax({
					   type: "GET",
					   async: false,
					   url: "http://api.dila.fr/opendata/api-boamp/annonces/v230/" + item.getIntro(),
					   success: function(result){					   
					     data["reports"].push(result);
					     
					     // remove XML tags
					     
					     
					     that._handleCritere(result, dataExport, columns);
					     
					     that._handleAttribution(result, dataExport, columns);
					   },
					   complete: function(error) {
						   iReturned += 1;
						   if (iReturned == items.length) { // done					    	 	
					    	 	
							   jsonModel.setData(data);
					    	 	
							   dataExport.exportToCSV(jsonModel);
							   
							   oTable.setBusy(false);
						   }
					   	}
					 });
				}
			}, this), 500);
		},
		
		_handleCritere: function(result, dataExport, columns) {
			var donnees = result["donnees"];
		     if (!donnees) {
		    	 	return
		     }
		     
		     //donnees/attribution/attribueparlotsmarches
		     if (donnees["attribution"] 
		     		&& donnees["attribution"]["attribueparlotsmarches"] 
		     		&& donnees["attribution"]["attribueparlotsmarches"].indexOf("<?xml") != -1) {
		    	 	donnees["attribution"]["attribueparlotsmarches"] = "";
		     }
		     
		     var procedure = donnees["procedure"];
		     if (!procedure) {
		    	 	return
		     }
		     var criteresattribution = procedure["criteresattribution"];
		     if (!criteresattribution) {
		    	 	return
		     }
		     
		     // remove XML tags
		     if (criteresattribution["criterescctp"] && criteresattribution["criterescctp"].indexOf("<?xml") != -1) {
		    	 	criteresattribution["criterescctp"] = "";
		     }
		     if (criteresattribution["criteresprix"] && criteresattribution["criteresprix"].indexOf("<?xml") != -1) {
		    	 	criteresattribution["criteresprix"] = "";
		     }
		     
		     var criteresponderes = criteresattribution["criteresponderes"];
		     if (!criteresponderes) {
		    	 	return
		     }
		     var aCriteres = criteresponderes["critere"];
		     if (aCriteres && typeof aCriteres === 'object' && aCriteres.constructor === Array) {
		    	 	for (var j = 0; j < aCriteres.length; ++j) {
		    	 		var critere = aCriteres[j];
		    	 		
		    	 		var cvalue = critere["value"];
		    	 		var cpoids = critere["poids"];
		    	 		
		    	 		var key1 = "critere-value-"+j;
		    	 		result[key1] = cvalue;
		    	 		
		    	 		var key2 = "critere-poids-"+j;
		    	 		result[key2] = cpoids;
		    	 		
		    	 		if (columns.indexOf(key1) === -1) {
	 						
    	 					var exportCol = new sap.ui.core.util.ExportColumn({name: key1});
    	 					var exportCell = new sap.ui.core.util.ExportCell({content: "{" + key1 + "}"});
    	 					exportCol.setTemplate(exportCell);
    	 										    	 					
    	 					dataExport.oExport.addColumn(exportCol);

    	 					columns.push(key1);
	 						
	 				}
		    	 		if (columns.indexOf(key2) === -1) {
	 						
    	 					var exportCol = new sap.ui.core.util.ExportColumn({name: key2});
    	 					var exportCell = new sap.ui.core.util.ExportCell({content: "{" + key2 + "}"});
    	 					exportCol.setTemplate(exportCell);
    	 										    	 					
    	 					dataExport.oExport.addColumn(exportCol);

    	 					columns.push(key2);
	 						
	 				}		    	 		
		    	 	}		    	 	
		     }		     
		     
		},
		
		_handleAttribution: function(result, dataExport, columns) {
		     var donnees = result["donnees"];
		     if (!donnees) {
		    	 	return
		     }
		     var attribution = donnees["attribution"];
		     if (!attribution) {
		    	 	return
		     }
		     var decision = attribution["decision"];
		     if (decision && typeof decision === 'object' && decision.constructor === Array) {
		    	 	for (var j = 0; j < decision.length; ++j) {
		    	 		var titulaireandRenseignement = decision[j]["titulaireandRENSEIGNEMENT"];
		    	 		if (titulaireandRenseignement && typeof titulaireandRenseignement === 'object' && titulaireandRenseignement.constructor === Array) {
		    	 		
		    	 			for (var k = 0; k < titulaireandRenseignement.length; ++k) {
		    	 				var montant = titulaireandRenseignement[k]["montant"];
		    	 				if (montant) {
		    	 					var idx = j + "-" + k;
		    	 					
		    	 					var key = "montant"+idx;
		    	 					result[key] = montant.value + " " + montant.devise;

		    	 					if (columns.indexOf(key) === -1) {
			    	 						
			    	 					var exportCol = new sap.ui.core.util.ExportColumn({name: key});
			    	 					var exportCell = new sap.ui.core.util.ExportCell({content: "{" + key + "}"});
			    	 					exportCol.setTemplate(exportCell);
			    	 										    	 					
			    	 					dataExport.oExport.addColumn(exportCol);

			    	 					columns.push(key);
		    	 						
		    	 					}
		    	 				}
		    	 			}
		    	 		}
		    	 	}
		     }
		}	
		
		
		
	});

});
