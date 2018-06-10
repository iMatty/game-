angular.module("observed", ["firebaseuiAuth", "gameDetailsFetcher"])
	.run(function() {
		addStyle();

		function addStyle() {
            let css = 	'.observedButtonContainer {\n' +
                '    line-height: 1;\n' +
                '    cursor: pointer;\n' +
                '    height: 100%;\n' +
                '}\n' +
                '.observedButtonContainer:hover svg{\n' +
				'    height: 140%;\n'+
                '    transform: rotate(180deg);\n' +
                '    transition: transform 0.2s linear, height 0.2s linear;\n' +
                '}';
            $("head").append("<style>" + css + "</style>");
		}
	});