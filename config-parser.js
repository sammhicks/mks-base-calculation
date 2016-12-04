(function (configParser) {
	var space_or_tab = Parsimmon.oneOf(" \t").many();
	
	var eol = Parsimmon.seq(
		space_or_tab,
		Parsimmon.alt(
			Parsimmon.string("\r\n").desc("Windows EOL"),
			Parsimmon.string("\r").desc("Mac EOL"),
			Parsimmon.string("\n").desc("Linux EOL")
		)
	);
	
	var empty_line = Parsimmon.seq(
		Parsimmon.regex(/^[ \t]*/),
		eol
	).result((x) => x).desc("Empty line");
	
	var comment_line = Parsimmon.seq(
		space_or_tab,
		Parsimmon.string("//"),
		Parsimmon.noneOf("\r\n").many(),
		eol
	).map((results) => (x) => x).desc("Comment line");
	
	var replace_value = (n, v) => (o) => {o[n] = v;};
	
	var append_value = (n, v) => (o) => {
		if (o[n] === undefined)
		{
			o[n] = [];
		}
		o[n].push(v);
	}
	
	var parameter = (indent_num) => Parsimmon.seq(
		space_or_tab,
		Parsimmon.regex(/\w+/),
		Parsimmon.string(" ").many(),
		Parsimmon.string("="),
		Parsimmon.string(" ").many(),
		Parsimmon.noneOf("\r\n").atLeast(1).map((values) => values.reduce((a, b) => a.concat(b))),
		eol
	).map((results) => replace_value(results[1].trim(), results[5].trim())).desc("Parameter");
	
	var sub_values = (indent_num) => Parsimmon.alt(
		empty_line,
		parameter(indent_num),
		sub(indent_num),
		comment_line
	).desc("Sub value").many().map((values) => {
		var x = {};
		
		values.forEach((f) => f(x));
		
		return x;
	});
	
	var sub = (indent_num) => Parsimmon.lazy("Sub", () => Parsimmon.seq(
			space_or_tab, Parsimmon.regex(/[A-Z_]+/), eol,
			space_or_tab, Parsimmon.string("{"),     eol,
			sub_values(indent_num + 1),
			space_or_tab, Parsimmon.string("}"),     eol
		).map((results) => append_value(results[1].trim(), results[6]))
	);
	
	configParser.config = Parsimmon.seq(
		Parsimmon.string("PART"), eol,
		Parsimmon.string("{"),    eol,
		sub_values(1),
		Parsimmon.string("}"),    eol
	).map((results) => results[4]).desc("Part");
}(window.configParser = window.configParser || {}));