sap.ui.require(
    [
        'sap/fe/test/JourneyRunner',
        'bs/buys/test/integration/FirstJourney',
		'bs/buys/test/integration/pages/BuysList',
		'bs/buys/test/integration/pages/BuysObjectPage'
    ],
    function(JourneyRunner, opaJourney, BuysList, BuysObjectPage) {
        'use strict';
        var JourneyRunner = new JourneyRunner({
            // start index.html in web folder
            launchUrl: sap.ui.require.toUrl('bs/buys') + '/index.html'
        });

       
        JourneyRunner.run(
            {
                pages: { 
					onTheBuysList: BuysList,
					onTheBuysObjectPage: BuysObjectPage
                }
            },
            opaJourney.run
        );
    }
);