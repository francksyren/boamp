sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/json/JSONModel",
	"sap/ui/demo/wt/model/formatter",
	'sap/ui/core/util/Export',
	'sap/ui/core/util/ExportTypeCSV',
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator"
], function (Controller, JSONModel, formatter, Export, ExportTypeCSV, Filter, FilterOperator) {
	"use strict";

	return Controller.extend("sap.ui.demo.wt.controller.YearlyReport", {


		onInit: function () {
			
			this.getOwnerComponent().getRouter().getRoute("yearlyreport").attachPatternMatched(this._onRouteMatched, this);			
			
			this.oExport = new Export({

				// Type that will be used to generate the content. Own ExportType's can be created to support other formats
				exportType : new ExportTypeCSV({
					separatorChar : "|"
				}),

				// binding information for the rows aggregation
				rows : {
					path : "/reports"
				},
				// column definitions with column name and binding info for the content
				columns : [{
					name : "idweb",
					template : {
						content : "{gestion/reference/idweb}"
					}
				}, {
					name : "Date Publication",
					template : {
						content : {
							parts: ["gestion/indexation/datepublication"],
							formatter: this.formatDate
						}
					}
				}, {
					name : "CPV",
					template : {
						content : "{donnees/objet/0/cpv/0/principal}"
					}
				}, {
					name : "Valeur",
					template : {
						content : "{donnees/objet/0/caracteristiques/valeur}"
					}
				}, {
					name : "typemarche objectcomplet",
					template : {
						content : "{donnees/objet/0/typemarche/objectcomplet}"
					}
				}, {
					name : "typemarche travaux",
					template : {
						content : "{donnees/objet/0/typemarche/travaux}"
					}
				}, {
					name : "typemarche service",
					template : {
						content : "{donnees/objet/0/typemarche/service}"
					}
				},
				{
					name : "typemarche fournitures achat",
					template : {
						content : "{donnees/objet/0/typemarche/fournitures/achat}"
					}
				},
				{
					name : "typemarche fournitures loc",
					template : {
						content : "{donnees/objet/0/typemarche/fournitures/loc}"
					}
				},
				{
					name : "typemarche fournitures creditbail",
					template : {
						content : "{donnees/objet/0/typemarche/fournitures/creditbail}"
					}
				},
				{
					name : "typemarche fournitures locvente",
					template : {
						content : "{donnees/objet/0/typemarche/fournitures/locvente}"
					}
				},
				{
					name : "typemarche fournitures plusieursformes",
					template : {
						content : "{donnees/objet/0/typemarche/fournitures/plusieursformes}"
					}
				}]
			});
		},
				
		_loadData:function() {
			
			var oTable = this.byId("idReportTable");
			
			var oColumnListItem = this.byId("listItem");

			var data = {"reports":[]};
			var jsonModel = new JSONModel();
			jsonModel.setSizeLimit(10000);
			
			var year = "17";
			var that = this;
			
			var count = Math.min(this._iCount, 10000);

			var arr = new Array(count);
			var iReturned = 0;
			var columns = [];
			for (var i = 0; i < count; ++i) {				
				
				var reportNumber = year + "-" + (this._iStart + i);
				console.log(reportNumber);
				$.ajax({
				   type: "GET",
				   async: false,
				   url: "http://api.dila.fr/opendata/api-boamp/annonces/v230/" + reportNumber,
				   success: function(result){					   
				     data["reports"].push(result);
				     
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
				    	 									    	 						
				    	 					if ( oTable.getColumns().findIndex(col => col.getId() === key) == -1 ) {
				    	 										    	 					
					    	 					var oColumn = new sap.m.Column("montant"+idx);
					    	 					oColumn.setMinScreenWidth("Tablet");
					    	 					oColumn.setDemandPopin(true);
					    	 					oColumn.setHAlign("End");
					    	 					
					    	 					
					    	 					var header = new sap.m.Text({text:"Montant " + idx});
					    	 					
					    	 					oColumn.setHeader(header);
					    	 					oTable.addColumn(oColumn);
					    	 					
					    	 					columns.push(idx);
					    	 					
					    	 					var t = new sap.m.Text();
					    	 					t.bindText(key);
					    	 					oColumnListItem.addCell(t);
					    	 					
					    	 					
					    	 					var exportCol = new sap.ui.core.util.ExportColumn({name: key});
					    	 					var exportCell = new sap.ui.core.util.ExportCell({content: "{" + key + "}"});
					    	 					exportCol.setTemplate(exportCell);
					    	 										    	 					
					    	 					that.oExport.addColumn(exportCol);
				    	 					}

				    	 				}
				    	 			}
				    	 		}
				    	 	}
				     }

				   },
				   complete: function(error) {
					   iReturned += 1;
					   if (iReturned == count) { // done					    	 	
				    	 	
				    	 	jsonModel.setData(data);
							
						that.getView().setModel(jsonModel);
						that.byId("idReportTable").setBusy(false);
				     }
				   }
				 });						

			}	
		},
		
		loadData: function() {
			
			this.byId("idReportTable").setBusy(true);
			
			var that = this;
			
			setTimeout(function() {
				that._loadData();
			}, 2000);
		},
		
		_onRouteMatched: function(oEvent) {
			this._iStart = parseInt(oEvent.getParameter("arguments").start);
			this._iCount = parseInt(oEvent.getParameter("arguments").count);			
			
			this.loadData();
			
		},
		
		formatDate: function(time) {
			var oDateFormat = sap.ui.core.format.DateFormat.getDateInstance();
			return oDateFormat.format(new Date(time));
		},
		
		onDataExport : sap.m.Table.prototype.exportData || function(oEvent) {

			// Pass in the model created above
			this.oExport.setModel(this.getView().getModel());

			// download exported file
			this.oExport.saveFile().catch(function(oError) {
				MessageBox.error("Error when downloading data. Browser might not be supported!\n\n" + oError);
			}).then(function() {
				oExport.destroy();
			});
		}


	});

});
