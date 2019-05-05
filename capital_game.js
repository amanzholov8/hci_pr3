// This allows the Javascript code inside this block to only run when the page
// has finished loading in the browser.

$( document ).ready(function() {
  	// Initialize Firebase
  	var config = {
	    apiKey: "AIzaSyBjqn29hoiAUtOcBTNBa40Zs7mOAQAa_lE",
	    authDomain: "hci-pr3-d65de.firebaseapp.com",
	    databaseURL: "https://hci-pr3-d65de.firebaseio.com",
	    projectId: "hci-pr3-d65de",
	    storageBucket: "hci-pr3-d65de.appspot.com",
	    messagingSenderId: "163302572854"
  	};

  	firebase.initializeApp(config);

  	pairs = [];


	var request = new XMLHttpRequest();
	request.open("GET",'https://s3.ap-northeast-2.amazonaws.com/ec2-54-144-69-91.compute-1.amazonaws.com/country_capital_pairs_2019.csv');
	request.addEventListener('load', function(event) {
	   if (request.status >= 200 && request.status < 300) {
	      	let csv = request.responseText;
	      	let lines = csv.split('\r\n');
	      	for (let i=1; i<lines.length; i++){
	      		let pair = lines[i].split(',');
	      		pairs.push({"country": pair[0], "capital": pair[1]});
	      	}

	      	var myTable = document.getElementById('myTable');
			var submit = document.getElementById('pr3__submit');
			var input = document.getElementById('pr3__answer');
			var country = document.getElementById('pr3__question');
			let clearBtn = document.getElementById('pr3__clear');
			let undoBtn = document.getElementById('pr3__undo');
			let resetBtn = document.getElementById('pr3__reset')
			let map = document.getElementById('map');
			let count = 0;

			function writeToDatabase(type, entry, userAns, correctAns) {
				  firebase.database().ref(`/${type}/${entry}`).set({
				     entry: entry,
				     userAns: userAns,
				     correctAns: correctAns
				  });
			}

			function readFromDatabase() {
			  	return firebase.database().ref('/entries/').once('value', 
			                                                      function(snapshot) {
			    	initializeTable();
			    
			    	var myValue = snapshot.val();
			    	if (myValue) {
			    		var keyList = Object.keys(myValue);
			    
			    		for (var i=0;i<keyList.length;i++){
			      			var currentKey = keyList[i];
			      			addRowFromDatabase(myValue[currentKey].entry, myValue[currentKey].userAns, myValue[currentKey].correctAns);
			    		}

			    		clearBtn.disabled = false;
			    	}
			  	});
			}

			function initCount() {
				firebase.database().ref(`/history/`).once('value', function(snapshot) {
					count = snapshot.val() ? Object.keys(snapshot.val()).length : 0;
					if (count != 0) 
						undoBtn.disabled = false;
				});
			}

			async function addToHistory() {
				await firebase.database().ref('/entries/').once('value', function(snapshot) {
					count++;
					var myValue = snapshot.val();
					firebase.database().ref(`/history/${count}`).set({
						length: myValue? Object.keys(myValue).length : 0,
						count: count,
						entries: myValue
					});
					undoBtn.disabled = false;
				});
			}

			function refreshHistory() {
				firebase.database().ref(`/history/${count}`).remove();
				count --;
				if (count==0) {
					undoBtn.disabled = true;
				}
			}

			async function removeFromHistory() {
				clearEntries();
				clearBtn.disabled = true;
				await firebase.database().ref(`/history/`).once('value', function(snapshot) {
					var myValue = snapshot.val();
					if (myValue[count.toString()].length!=0) {
						firebase.database().ref('/entries/').set(myValue[count.toString()].entries);
						readFromDatabase();
					}
				});
			}

			function deleteFromDatabase(entry) {
				firebase.database().ref(`/entries/${entry}`).remove();
			}

			function addRowFromDatabase(entry, userAns, correctAns) {
			    var newRow = myTable.insertRow(3);
			    var newCellCountry = newRow.insertCell(0);
			    var newCellAnswer = newRow.insertCell(1);
			    var status = newRow.insertCell(2);

			    let fval = $('input:radio[name=radioFilter]:checked').val();

			    newCellCountry.innerHTML = entry;
			    newCellCountry.className = 'historyCountry';  
			    newCellAnswer.innerHTML = userAns;
			    status.innerHTML = correctAns;

		    	if (userAns==correctAns){
		    		if(fval == 'wrong'){
		            	$('.correct').show();
		            	$('#all').prop('checked', true);
		          	}
		    		newRow.style.color = 'green';
		        	newRow.className = 'correct';

		    	} else {	
		         	if(fval == 'correct'){
		           		$('.wrong').show();
		           		$('#all').prop('checked', true);
		         	}
		    		newRow.style.color = 'red';
		    		newCellAnswer.style.textDecoration = 'line-through';
		        	newRow.className = 'wrong';
		    	}
		    	status.className = "historyCity";

		        var q = document.createElement('button');
		        q.type = 'button';
		        q.innerHTML = 'Delete';
		        q.className = 'delete';
		        q.style.float = "right";
		        q.style.marginLeft = '15px';
		        status.appendChild(q);

			}

			function initializeTable() {
			  	var numRows = myTable.rows.length;
			  
			  	for(var i=0;i<numRows-3;i++) {
			    	myTable.deleteRow(3);
			  	}
			}

			function fillContent(divObj, content) {
			  divObj.innerHTML = content
			}

			function getRandomInt(min, max) {
			    return Math.floor(Math.random() * (max - min + 1)) + min;
			}

			function firstQuestion() {
				var randInd = getRandomInt(0, pairs.length-1);
				var question = pairs[randInd];

				fillContent(country, question.country);
				map.src = `https://www.google.com/maps/embed/v1/place?key=AIzaSyDP1BMvIpAaV5lXKud5MNgq5tWkNLtqs7s
        					&q=${country.innerHTML}
        					&language=en`;
			}

			function addRow(value) {
				var numRows = myTable.rows.length;
			  
			    var newRow = myTable.insertRow(3);
			    var newCellCountry = newRow.insertCell(0);
			    var newCellAnswer = newRow.insertCell(1);
			    var status = newRow.insertCell(2);

			    clearBtn.disabled = false;

			    let fval = $('input:radio[name=radioFilter]:checked').val();

			    newCellCountry.innerHTML = country.innerHTML;  
			    newCellCountry.className = 'historyCountry';
			    newCellAnswer.innerHTML = value;

			    for (var i in pairs) {
			    	if (country.innerHTML === pairs[i].country) {
			    		if (pairs[i].capital.toLowerCase()===value.toLowerCase()){
			    			if(fval == 'wrong'){
			            		$('.correct').show();
			            		$('#all').prop('checked', true);
			          		}

			    			newCellAnswer.innerHTML = pairs[i].capital;
			    			status.innerHTML = pairs[i].capital;
			    			newRow.style.color = 'green';
			        		newRow.className = 'correct';

			    		} else {	
			         		if(fval == 'correct'){
			           			$('.wrong').show();
			           			$('#all').prop('checked', true);
			         		}
			         		status.innerHTML = pairs[i].capital;
			    			newRow.style.color = 'red';
			    			newCellAnswer.style.textDecoration = 'line-through';
			        		newRow.className = 'wrong';
			    		}
			    		status.className = "historyCity";
			    		writeToDatabase('entries', newCellCountry.innerHTML, newCellAnswer.innerHTML, status.innerHTML);

			        	var q = document.createElement('button');
			        	q.type = 'button';
			        	q.innerHTML = 'Delete';
			        	q.className = 'delete';
			        	q.style.float = "right";
			        	q.style.marginLeft = '15px';
			        	status.appendChild(q);
			    		break;
			    	}
			    }
			}  
  
			function clearEntries() {
				firebase.database().ref('/entries/').remove();
				var numRows = myTable.rows.length;

				for(var i=0;i<numRows-3;i++) {
			    	myTable.deleteRow(3);
			  	}
			}

			function seeAnswer() {
			    submit.onclick = function() {
			    	if (input.value != ''){
			    		addToHistory().then(() => {
			    			addRow(input.value);
			    			input.value = '';
							input.focus();
							firstQuestion();
			    		});
			    	} else {
			    		firstQuestion();
			    	}
				}

			    input.addEventListener("keyup", function(event) {
			  		if (event.keyCode === 13) {
			    		event.preventDefault();
			   			submit.click();
			  		}
				});

			  	$('#myTable').on('click', '.delete', e=>{
			  		addToHistory().then(() => {
			  			deleteFromDatabase($(e.target).parent().parent().children().first().text());
			  			$(e.target).parent().parent().remove();

			    		map.src = `https://www.google.com/maps/embed/v1/place?key=AIzaSyDP1BMvIpAaV5lXKud5MNgq5tWkNLtqs7s
        					&q=${country.innerHTML}
        					&language=en`;
        				map.style.border = '0';
			  		});
			    	
			  	});

			  	clearBtn.onclick = function() {
			  		addToHistory().then(() => {
			  			clearEntries();
			  			clearBtn.disabled = true;
			  		});
			  	}

			  	undoBtn.onclick = function() {
			  		removeFromHistory().then(()=> {
			  			refreshHistory();
			  		});
			  	}

			  	resetBtn.onclick = function() {
			  		clearEntries();
			  		firebase.database().ref('/history/').remove();
			  		count = 0;
			  		clearBtn.disabled = true;
			  		undoBtn.disabled = true;
			  	}
				
			  	var timer;
			    $('#myTable').on('mouseenter', '.historyCountry', function(e){
        			timer = setTimeout(function(){
        				var valueOfTd = $(e.target).text();
        				map.src = `https://www.google.com/maps/embed/v1/place?key=AIzaSyDP1BMvIpAaV5lXKud5MNgq5tWkNLtqs7s
        					&q=${valueOfTd}
        					&language=en`;
        				map.style.border = '1px solid black';
    				}, 1000);
    			});
    			$('#myTable').on('mouseleave', '.historyCountry', function() {
    				clearTimeout(timer);
    				map.src = `https://www.google.com/maps/embed/v1/place?key=AIzaSyDP1BMvIpAaV5lXKud5MNgq5tWkNLtqs7s
        					&q=${country.innerHTML}
        					&language=en`;
        			map.style.border = '0';
				});

				$('#myTable').on('mouseenter', '.historyCity', function(e){
        			timer = setTimeout(function(){
        				var valueOfTd = $(e.target).text().slice(0, -6);
        				map.src = `https://www.google.com/maps/embed/v1/place?key=AIzaSyDP1BMvIpAaV5lXKud5MNgq5tWkNLtqs7s
        					&q=${valueOfTd}
        					&zoom=5
        					&language=en`;
        				map.style.border = '1px solid black';
    				}, 1000);
    			});

    			$('#myTable').on('mouseleave', '.historyCity', function() {
    				clearTimeout(timer);
    				map.src = `https://www.google.com/maps/embed/v1/place?key=AIzaSyDP1BMvIpAaV5lXKud5MNgq5tWkNLtqs7s
        					&q=${country.innerHTML}
        					&language=en`;
        			map.style.border = '0';
				});

    			$('input:radio[name=radioFilter]').change(()=>{
			    	let val = $('input:radio[name=radioFilter]:checked').val();
			    	if (val==='all') {
			      		$('.correct, .wrong').show();
			    	} else if (val == 'correct') {
			        	$('.correct').show();
			        	$('.wrong').hide();
			    	} else {
			        	$('.correct').hide();
			        	$('.wrong').show();
				    }
				});

				var cityList = [];
			    for (var i in pairs) {
			    	cityList.push(pairs[i].capital);
			    }
			  	$('#pr3__answer').autocomplete({
			    	source: cityList,
			    	select: (e, ui) => {
			      		$('#pr3__answer').val(ui.item.value);
			      		submit.click();
			      		e.preventDefault();
			    	}
			  	});
				
			}

     			
			initCount();
			readFromDatabase();
			firstQuestion();
			seeAnswer();
	   } else {
	      console.warn(request.statusText, request.responseText);
	   }
	});
	request.send();

});