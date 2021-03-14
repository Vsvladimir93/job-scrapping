const fs = require('fs');

const resultFileName = (date) =>
	`companies_result_${date.getFullYear()}_${
		date.getMonth() + 1
	}_${date.getDate()}.json`;

function handle(filePath) {
	let rawJson = JSON.parse(fs.readFileSync(filePath));

	let filtered = rawJson
		.filter((c) => c)
		.map((company) => ({
			company: company.company,
			document: parseText(company.rawDocument)
		}));

	filtered = cleanResult(filtered);
	filtered = cleanResult(filtered);
	filtered = cleanResult(filtered);
	filtered = cleanResult(filtered);

	fs.writeFileSync(resultFileName(new Date()), JSON.stringify(filtered));
}

function parseText(data) {
	if (data.node === 'text') {
		let text = data.text.trim();
		text = text.replace(/&nbsp;/g, '');
		return text ? text : null;
	} else {
		if (data.child) {
			return data.child.map((c) => parseText(c));
		}
	}
}

function cleanResult(filtered) {
	return filtered.map((f) => ({
		company: f.company,
		document: clean(f.document)
	}));
}

function clean(parsed) {
	if (Array.isArray(parsed)) {
		if (parsed.length) {
			if (parsed.length === 1) {
				return parsed[0];
			} else {
				return parsed.filter((t) => t).map((t) => clean(t));
			}
		} else {
			return null;
		}
	} else {
		return parsed;
	}
}

module.exports.default = handle;
