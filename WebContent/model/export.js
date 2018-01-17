sap.ui.define([
	'sap/ui/base/Object',
	'sap/ui/core/util/Export',
	'sap/ui/core/util/ExportTypeCSV'
], function (Object, Export, ExportTypeCSV) {
	"use strict";

	return Object.extend("sap.ui.demo.wt.model.export", {

		oExport: null,
		
		constructor: function() {
						
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
				}, 
				// Model 2 
				{
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
				},
				// Model 3: procedure/criteresattribution
				{
					name : "criterescctp",
					template : {
						content : "{donnees/procedure/criteresattribution/criterescctp}"
					}
				},
				{
					name : "critereslibre",
					template : {
						content : "{donnees/procedure/criteresattribution/critereslibre}"
					}
				},
				{
					name : "criterespriorites",
					template : {
						content : "{donnees/procedure/criteresattribution/criterespriorites}"
					}
				},
				{
					name : "criteresprix",
					template : {
						content : "{donnees/procedure/criteresattribution/criteresprix}"
					}
				},
				// Model 4: donnees/attribution
				{
					name : "totalementinfructueux",
					template : {
						content : "{donnees/attribution/totalementinfructueux}"
					}
				},
				{
					name : "sanssuite",
					template : {
						content : "{donnees/attribution/sanssuite}"
					}
				},
				{
					name : "attribuecomportelotinfructueux",
					template : {
						content : "{donnees/attribution/attribuecomportelotinfructueux}"
					}
				},
				{
					name : "attribueparlotsmarches",
					template : {
						content : "{donnees/attribution/attribueparlotsmarches}"
					}
				},
				{
					name : "valeurtotale",
					template : {
						content : "{donnees/attribution/valeurtotale}"
					}
				},
				{
					name : "offrebasse",
					template : {
						content : "{donnees/attribution/offrebasse}"
					}
				},
				{
					name : "offreelevee",
					template : {
						content : "{donnees/attribution/offreelevee}"
					}
				},
				{
					name : "datedecision",
					template : {
						content : "{donnees/attribution/datedecision}"
					}
				}]
			});
		},
		
		exportToCSV: function (oModel) {
			var that = this;
			// Pass in the model created above
			this.oExport.setModel(oModel);

			// download exported file
			this.oExport.saveFile().catch(function(oError) {
				MessageBox.error("Error when downloading data. Browser might not be supported!\n\n" + oError);
			}).then(function() {
				that.oExport.destroy();
			});
		},
		
		formatDate: function(time) {
			var oDateFormat = sap.ui.core.format.DateFormat.getDateInstance();
			return oDateFormat.format(new Date(time));
		},
	});
});
