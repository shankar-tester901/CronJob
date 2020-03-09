module.exports = (event, context) => {

	const catalyst = require('zcatalyst-sdk-node');
	const catalystApp = catalyst.initialize(context);

	var event_info = event.data[0];
	console.log('Incoming event is ' + JSON.stringify(event_info));
	var location_info = event.data[0].location;
	console.log('Location is ' + JSON.stringify(location_info));


	//if  location is GreenBelt, then mail
	if (location_info.toUpperCase() === "GreenBelt") {

		let config = {
			from_email: 'shankarr+1002@zohocorp.com',
			to_email: 'shankarr+1002@zohocorp.com',
			subject: 'Nasa Job Opportunity',
			content: "Nasa Opportunity Details ---- >" + "    company :  " + JSON.stringify(event_info.company) + "   title :  " + JSON.stringify(event_info.title) + "   Salary Range :  " + JSON.stringify(event_info.salary) + "   Experience :  " + JSON.stringify(event_info.experience)
		};

		let email = catalystApp.email();
		let mailPromise = email.sendMail(config);
		mailPromise.then((mailObject) => {
			console.log('Mail Sent ' + JSON.stringify(mailObject));
			dropOtherRows(catalystApp, context);
		}).catch(err => {
			console.log('error while sending the mail' + err);
			context.closeWithFailure();
		});
	}
	else {
		console.log('No mail sent');
		context.closeWithSuccess();
	}
}

function dropOtherRows(catalystApp, context) {
	//	console.log('drop other rows invoked ');
	let datastore = catalystApp.datastore();
	let table = datastore.table('NasaJobs');

	let q_zcql = catalystApp.zcql();
	let zcqlPromise = q_zcql.executeZCQLQuery("SELECT * FROM NasaJobs where location !='GreenBelt' ");
	zcqlPromise.then(queryResult => {

		//	console.log(' -------------   ' + JSON.stringify(queryResult));
		if (queryResult.length > 0) {
			let promiseArr = [];
			for (i = 0; i < queryResult.length; i++) {
				//	console.log('ROWID IS ... ' + queryResult[i].NasaJobs.ROWID);
				let rowPromise = table.deleteRow(queryResult[i].NasaJobs.ROWID);
				promiseArr.push(rowPromise);
			};

			Promise.all(promiseArr).then(function (values) {
				//		console.log(values);
				context.closeWithSuccess();
			}).catch(error => {
				console.log('error occurred while deleting row' + error);
				context.closeWithFailure();
			})
		}
	})
}
