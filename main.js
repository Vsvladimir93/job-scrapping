const puppeteer = require('puppeteer');
const config = require('./config').default;
const handleRawFiles = require('./dataHandler').default;
const html2json = require('html2json').html2json;
const json2html = require('html2json').json2html;
const fs = require('fs');

const test = true;
const rawDataFilePath = 'companies_raw_data.json';
const nullCompanies = [];

main();

async function main() {
	const { browser, page } = await init();
	try {
		await searchJob(page);

		const vipCompaniesHeads = await vacanciesHead(page, config.vip);

		const simpleCompaniesHeads = await vacanciesHead(page, config.simple);

		let allCompanies = [...vipCompaniesHeads, ...simpleCompaniesHeads];

		allCompanies = allCompanies.filter((c) => !c.href.startsWith('http'));

		const partition = jobPartition(allCompanies);

		const companiesRawJson = [];

		for (let part of partition) {
			companiesRawJson.push(...(await handleCompanies(browser, part)));
		}

		fs.writeFileSync(rawDataFilePath, JSON.stringify(companiesRawJson));

		await handleRawFiles(rawDataFilePath);
	} catch (e) {
		console.error(e);
	}
	await browser.close();
}

async function init() {
	const browser = await puppeteer.launch({ headless: !test });
	const page = await browser.newPage();
	await page.goto(config.ruBaseURL);
	await page.setViewport({
		width: 1920,
		height: 1080
	});

	return { browser, page };
}

async function searchJob(page) {
	const search = await page.$(config.search.input_s);
	const job = config.searchForJob;
	await search.evaluate((el, job) => (el.value = job), job);

	await Promise.all([
		page.click(config.search.btn_s),
		page.waitForNavigation({ waitUntil: 'networkidle0' })
	]);
}

async function vacanciesHead(page, config) {
	const vacancies = await page.$$(config.list_s);
	const companies = [];

	for (let i = 0; i < vacancies.length; i++) {
		try {
			const title = await vacancies[i].$(config.title_s);
			companies.push({
				company: await (
					await (await vacancies[i].$(config.company_s)).getProperty(
						'innerText'
					)
				).jsonValue(),
				title: await (await title.getProperty('innerText')).jsonValue(),
				href: await title.evaluate(async (e) => {
					return await e.getAttribute('href');
				})
			});
		} catch (e) {
			console.error(e);
		}
	}

	return companies;
}

async function getJobInfo(page, company) {
	await page.goto(`${config.baseURL}${company.href}`, {
		waitUntil: 'networkidle0'
	});

	let { type, path, container } = await tryGetJobContainer(page);

	if (type === null) {
		console.log('NULL COMPANY');
		console.log(company);
		nullCompanies.push(company);
		await page.close();
		return null;
	}

	let element = await container.evaluate((el, path) => {
		return document.querySelector(path).innerHTML;
	}, path);

	await page.close();

	try {
		return { company, type, rawDocument: html2json(element) };
	} catch (e) {
		console.error(e);
		return null;
	}
}

function jobPartition(companies) {
	const partition = [];
	for (let i = 0; i < companies.length; i += 10) {
		partition.push(companies.slice(i, i + 10));
	}
	return partition;
}

async function handleCompanies(browser, companies) {
	const jobHandlers = [];
	for (let company of companies) {
		const page = await browser.newPage();
		jobHandlers.push({ page, company });
	}

	return await Promise.all(
		jobHandlers.map((h) => getJobInfo(h.page, h.company))
	);
}

async function tryGetJobContainer(page) {
	let container = null;
	const containerTypes = Object.entries(config.job);
	let counter = 0;
	while (counter < containerTypes.length) {
		container = await page.$(containerTypes[counter][1]);
		if (container) break;
		counter++;
	}

	try {
		return {
			type: containerTypes[counter][0],
			path: containerTypes[counter][1],
			container
		};
	} catch (e) {
		console.error('error', counter);
	}

	return {
		type: null,
		path: null,
		container
	};
}

function sleep(milliseconds) {
	const date = Date.now();
	let currentDate = null;
	do {
		currentDate = Date.now();
	} while (currentDate - date < milliseconds);
}
