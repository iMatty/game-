angular.module("observed", ["firebaseuiAuth"])
	.run(function() {
		addStyle();

		function addStyle() {
            let css = 	'.observedButtonContainer {\n' +
                '    line-height: 1;\n' +
                '    cursor: pointer;\n' +
                '    height: 100%;\n' +
                '}\n' +
                '.observedButtonContainer:hover {\n' +
                '    transform: rotate(180deg);\n' +
                '    transition: transform 0.15s linear;\n' +
                '}';
            $("head").append("<style>" + css + "</style>");
		}
	});