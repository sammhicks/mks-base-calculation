"use strict";

(function (configParser) {
	var whitespace = Parsimmon.oneOf(" \t").many();
	
	var eol = Parsimmon.seq(
		whitespace,
		Parsimmon.alt(
			Parsimmon.string("\r\n").desc("Windows EOL"),
			Parsimmon.string("\r").desc("Mac EOL"),
			Parsimmon.string("\n").desc("Linux EOL")
		)
	);
	
	var emptyLine = Parsimmon.seq(
		Parsimmon.regex(/^[ \t]*/),
		eol
	).result((x) => x).desc("Empty line");
	
	var comment_line = Parsimmon.seq(
		whitespace,
		Parsimmon.string("//"),
		Parsimmon.noneOf("\r\n").many(),
		eol
	).map((results) => (x) => x).desc("Comment line");
	
	var replaceValue = (n, v) => (o) => {o[n] = v;};
	
	var appendValue = (n, v) => (o) => {
		if (o[n] === undefined)
		{
			o[n] = [];
		}
		o[n].push(v);
	}
	
	var parameter = (indent_num) => Parsimmon.seq(
		whitespace,
		Parsimmon.regex(/\w+/),
		whitespace,
		Parsimmon.string("="),
		whitespace,
		Parsimmon.alt(
			Parsimmon.noneOf("\r\n").atLeast(1).map((values) => values.reduce((a, b) => a.concat(b)).trim()),
			Parsimmon.succeed(undefined)
		),
		eol
	).map((results) => replaceValue(results[1], results[5])).desc("Parameter");
	
	var subValues = (indent_num) => Parsimmon.alt(
		emptyLine,
		parameter(indent_num),
		sub(indent_num),
		comment_line
	).desc("Sub value").many().map((values) => {
		var x = {};
		
		values.forEach((f) => f(x));
		
		return x;
	});
	
	var sub = (indent_num) => Parsimmon.lazy("Sub", () => Parsimmon.seq(
			whitespace, Parsimmon.regex(/\w+/), eol,
			whitespace, Parsimmon.string("{"),     eol,
			subValues(indent_num + 1),
			whitespace, Parsimmon.string("}"),     eol
		).map((results) => appendValue(results[1], results[6]))
	);
	
	configParser.config = Parsimmon.seq(
		Parsimmon.optWhitespace,
		Parsimmon.string("PART"), eol,
		Parsimmon.string("{"),    eol,
		subValues(1),
		Parsimmon.string("}"),
		Parsimmon.optWhitespace
	).map((results) => results[5]).desc("Part");
}(window.configParser = window.configParser || {}));