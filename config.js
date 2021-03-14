const config = {
	baseURL: 'https://www.rabota.md',
	ruBaseURL: 'https://www.rabota.md/ru/',
	searchForJob: 'Java',
	search: {
		input_s: '#searchInput',
		btn_s: '#search_container > div > div > div > input'
	},
	vip: {
		list_s:
			'#main > div.content_wr > div:nth-child(3) > div > div.uk-width-2-3\\@m.uk-grid-margin.uk-first-column > div.b_info10.free.vip-vacancies > div',
		title_s: 'div:nth-child(1) > h3 > a.vacancy-title',
		company_s: 'div.vacancy-meta > a'
	},
	simple: {
		list_s:
			'#main > div.content_wr > div:nth-child(3) > div > div.uk-width-2-3\\@m.uk-grid-margin.uk-first-column > div.b_info10.free.simple-vacancies > div',
		title_s: 'h3 > a.vacancy-title',
		company_s: 'div.vacancy-meta > span'
	},
	job: {
		container_s_v1:
			'#main > div.c_wr > div > div > div > div.preview.uk-width-1-1.uk-width-2-3\\@m > div.inbody',
		container_s_v2:
			'#main > div.content_wr > div.c_wr > div > div.vip-vacancies-grid.uk-grid-medium.uk-grid > div.uk-width-1-1.uk-width-2-3\\@s.vc_detail_vip.uk-first-column > div > div.in.inbody',
		container_s_v3:
			'#main > div.content_wr > div > div.content.uk-width-1-1.uk-width-2-3\\@m > div > div'
	}
};

module.exports.default = config;
