"use strict";
var phridge = require("phridge");
var Firebase = require('firebase');
var _ = require('underscore');
var pass = process.argv[2]; console.log(pass);

startScrape(pass);

function startScrape(at){console.log('starting pass '+pass); var prefix='http://foodbanknyc.org/index.cfm?furl=/CD6F9867-926E-0C0F-558E6A7EC4762F9E&&city=Bronx&CatCode=PANTRY&go.x=64&go.y=13&go=go&pagenumber=';
if(at==1){ scrapePage('http://foodbanknyc.org/CD6F9867-926E-0C0F-558E6A7EC4762F9E?city=Bronx&CatCode=PANTRY&go.x=64&go.y=13&go=go',1,1);} 
else if(at==2){ scrapePage(prefix+'2',26,2); }
else if(at==3){ scrapePage(prefix+'3',51,3); }
else if(at==4){ scrapePage(prefix+'4',76,4); }
else if(at==5){ scrapePage(prefix+'5',101,5); }
else if(at==6){ scrapePage(prefix+'6',126,6); } }

function scrapePage(URl,starting,pass){ console.log('PASS '+pass);
phridge.spawn()
	.then(function (phantom) {
		return phantom.openPage(URl); })

	.then(function (page) {
		return page.run(function () { 
		// Here we're inside PhantomJS

		return this.evaluate(function () {
		return document.querySelector(".ColumnMain").innerHTML;

	}); }); })

	.finally(phridge.disposeAll)

	.done(function (text) { 
		
		var i, pantries=[]; 

		// address, contact, phone
		
		var just = text.split('found in your search.');

		var clean = just[1].replace(/(\r\n|\n|\r)/gm,"");
		var array = clean.split("(view map)");var h=starting-1;
		var streez=[],zip=[],contact=[],phone=[];

		for(i=1; i<array.length; i++) { var j=h+i;
			var piece = array[i].split('PANTRY');
			var address = piece[1].split('Contact:');
			var streetzip = address[0].split('Bronx, NY');var street=myTrim(streetzip[0]);
			streez[j]=street.substr(0,street.length-5);
			zip[j]=myTrim(streetzip[1]);
			var contacts = address[1].split('Tel:');contact[j]=myTrim(contacts[0]);
			var phones = contacts[1].substr(0,13);phone[j]=myTrim(phones);

			pantries[i]=[street,zip,contact,phone];		
			
		}

		// title, service, schedule

		var titles=[],frequency=[],rschedule=[],lines=[],k=starting-1,l=starting-1;
		var lines=just[1].split(/\n/);
		var lineas = _.uniq(lines);

		for(i=1; i<lines.length; i++) {  console.log(i+' '+myTrim(lineas[i])+'|');

			if(lines[i].indexOf('(view map)')!=-1){ k++;
				titles[k]=myTrim(lines[i-2]);
				var title=titles[k].split('<h4>');
				var tfinal=title[1];
				frequency[k]=lines[i+12].substr(1,40);  
				var frequent=frequency[k].replace('&amp;','&');
			}
			if(lines[i].indexOf('AM - ')!=-1||lines[i].indexOf('PM - ')!=-1){

				var hours=lines[i].split(';">'); var hourss=hours[1].split(' - '); var from=myTrim(hourss[0]);
				var to = hourss[1].substr(0,14);
				var two = to.substr(0,to.indexOf('<'));
				var service=lines[i-3].substr(1,40);
				var days=lines[i+2].substr(3,60);var dayz=myTrim(days);
				var comment=lines[i+4].substr(15,70);var cmmnt=comment.substr(0,comment.length-14);

				var locations = new Firebase('https://foodbank-nyc.firebaseio.com/locations'); 

console.log('------------------');
console.log(k);
console.log(streez[k]);
console.log(zip[k]);
console.log(contact[k]);
console.log(phone[k]);

console.log(tfinal[k]);
console.log(frequent[k]);

console.log(service[k]);
console.log(from[k]);
console.log(two[k]);
console.log(dayz[k]);

console.log(cmmnt[k]);



				locations.child(k+'/street').setWithPriority(streez[k],2);
 				locations.child(k+'/zip').setWithPriority(zip[k],3);
 				locations.child(k+'/contact').setWithPriority(contact[k],4);
				locations.child(k+'/phone').setWithPriority(phone[k],5);
				locations.child(k+'/title').setWithPriority(tfinal,1);
				locations.child(k+'/frequency').setWithPriority(frequent,6);
				locations.child(k+'/service').setWithPriority(service,7);
				locations.child(k+'/from').setWithPriority(from,8);
				locations.child(k+'/to').setWithPriority(two,9);
				locations.child(k+'/days').setWithPriority(dayz,10);
				locations.child(k+'/comment').setWithPriority(cmmnt,11);
				
		 	}
		 }
if(i>450){console.log('done'); process.exit();}else{console.log('failed, trying again in 3 seconds'); setTimeout(function(){scrapePage(URl,starting,pass);},3000); } 
}, function (err) { throw err; });   }


function myTrim(x){var yumm = x.replace(/^\s+|\s+$/gm,''); var yummy = yumm.replace("/(<([^>]+)>)/ig",''); return yummy.replace(/(<([^>]+)>)/ig,""); }