// Separated Module that uses IIFE and Closure
var budgetController = (function () {
	var data;

	var Expense = function (id, desc, val) {
		this.id = id;
		this.description = desc;
		this.value = val;
		this.percentage = -1
	};
	Expense.prototype.calcPercentage = function (totalIncome) {
		if (totalIncome > 0) this.percentage = Math.round((this.value / totalIncome) * 100);
		else this.percentage = -1;
	}
	Expense.prototype.getPercentage = function () {
		return this.percentage;
	}

	var Income = function (id, desc, val) {
		this.id = id;
		this.description = desc;
		this.value = val
	};

	data = {
		allItems: {
			exp: [],
			inc: []
		},
		totals: {
			exp: 0,
			inc: 0
		},
		budget: 0,
		percentage: -1
	}

	var calcTotal = function (type) {
		var sum = 0;
		data.allItems[type].forEach(function (i) {
			sum += i.value;
		});
		data.totals[type] = sum;
	}

	return {
		addItem: function (type, desc, val) {
			var newItem, id;
			// create new id
			if (data.allItems[type].length > 0) {
				id = (data.allItems[type][data.allItems[type].length - 1].id) + 1;
			}
			else id = 0;

			// create new item
			if (type === 'exp') {
				newItem = new Expense(id, desc, val)
			}
			else if (type === 'inc') {
				newItem = new Income(id, desc, val)
			}

			// push to DS and return
			data.allItems[type].push(newItem); // look data structure above
			return newItem;
		},

		deleteItem: function (type, id) {
			var IDs, index;

			// we need the index of the id.
			IDs = data.allItems[type].map(function (el) {
				return el.id;
			});
			index = IDs.indexOf(id);
			if (index !== -1) {
				data.allItems[type].splice(index, 1);
			}
		},

		calcBudget: function () {
			// calc total inc, exp
			calcTotal('exp');
			calcTotal('inc');

			// calc total budget (inc - exp)
			data.budget = data.totals.inc - data.totals.exp;
			// calc exp percent w.r.t inc
			if (data.totals.inc > 0) {
				data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100);
			}
			else {
				data.percentage = -1;
			}
		},

		calcPercentages: function () {
			// a=20, b=10, c=40, I=100, a:20/I,b:10/I,c:40/I
			// So add a method in Expense Object to Calc percentages
			data.allItems.exp.forEach(el => {
				el.calcPercentage(data.totals.inc);
			});
		},

		getPercentages: function () {
			return data.allItems.exp.map(el => {
				return el.getPercentage();
			});
		},

		getBudget: function () {
			return {
				budget: data.budget,
				totalInc: data.totals.inc,
				totalExp: data.totals.exp,
				percentage: data.percentage
			}
		},

		getData: function () {
			return data;
		}
	}

})();


// Separated Module that uses IIFE and Closure
var UIController = (function () {
	var DOMStrings = {
		inputType: '.add__type',
		inputDesc: '.add__description',
		inputVal: '.add__value',
		addBtn: '.add__btn',
		incomeContainer: '.income__list',
		expensesContainer: '.expenses__list',
		budgetLabel: '.budget__value',
		incomeLabel: '.budget__income--value',
		expenseLabel: '.budget__expenses--value',
		percentageLabel: '.budget__expenses--percentage',
		container: '.container',
		expensesPercetageLabel: '.item__percentage',
		monthLabel: '.budget__title--month'
	}

	var formatNumber = function (num, type) {
		var numSplit, int, dec;
		/* + or - before number,
		 * exactly 2 decimal points
		 * comma separates thousands
		*/
		num = Math.abs(num);
		num = num.toFixed(2);

		numSplit = num.split('.');
		int = numSplit[0];
		dec = numSplit[1];
		if (int.length > 3) {
			int = int.substr(0, int.length - 3) + ',' + int.substr(int.length - 3, 3);
		}

		return (type === 'exp' ? '-' : '+') + " " + int + '.' + dec;

	}

	var nodeListForEach = function (list, callback) {
		for (var i = 0; i < list.length; i++) {
			callback(list[i], i);
		}
	}

	return {
		getInput: function () {
			return {
				type: document.querySelector(DOMStrings.inputType).value, // inc or exp
				description: document.querySelector(DOMStrings.inputDesc).value,
				value: parseFloat(document.querySelector(DOMStrings.inputVal).value)
			}
		},

		addListItem: function (obj, type) {
			var html, newHTML, element;

			// create a HTML string with placeholder text
			if (type === 'inc') {
				element = DOMStrings.incomeContainer;
				html = '<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><svg class="i-s"><use xlink:href="feather-sprite.svg#x-circle"></use></svg></button></div></div></div>';

			} else if (type === 'exp') {
				element = DOMStrings.expensesContainer;
				html = '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">10%</div><div class="item__delete"><button class="item__delete--btn"><svg class="i-s"><use xlink:href="feather-sprite.svg#x-circle"></use></svg></button></div></div></div>';
			}

			// replace the placeholders
			newHTML = html.replace('%id%', obj.id);
			newHTML = newHTML.replace('%description%', obj.description);
			newHTML = newHTML.replace('%value%', formatNumber(obj.value, type));

			// insert HTML into DOM
			document.querySelector(element).insertAdjacentHTML('beforeend', newHTML);

		},

		deleteListItem: function (id) {
			var delElement = document.getElementById(id);
			delElement.parentNode.removeChild(delElement);
		},

		clearFields: function () {
			var fields = document.querySelectorAll(DOMStrings.inputDesc + ',' + DOMStrings.inputVal);
			var fieldsArr = Array.prototype.slice.call(fields);
			fieldsArr.forEach(function (el) {
				el.value = "";
			})
			fieldsArr[0].focus();
		},

		displayBudget: function (obj) {
			var type;
			obj.budget > 0 ? type = 'inc' : type = 'exp';

			if (obj.budget == 0) {
				document.querySelector(DOMStrings.budgetLabel).textContent = obj.budget + '.00';
			} else {
				document.querySelector(DOMStrings.budgetLabel).textContent = formatNumber(obj.budget, type);
			}
			document.querySelector(DOMStrings.incomeLabel).textContent = formatNumber(obj.totalInc, 'inc');
			document.querySelector(DOMStrings.expenseLabel).textContent = formatNumber(obj.totalExp, 'exp');

			if (obj.percentage > 0) {
				document.querySelector(DOMStrings.percentageLabel).textContent = obj.percentage + " %";
			}
			else {
				document.querySelector(DOMStrings.percentageLabel).textContent = '---';
			}
		},

		displayPercentages: function (percentages) {
			var fields = document.querySelectorAll(DOMStrings.expensesPercetageLabel);

			nodeListForEach(fields, function (e, i) {
				if (percentages[i] > 0) e.textContent = percentages[i] + " %";
				else e.textContent = '---';
			})
		},

		displayMonth: function () {
			var months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
			var now = new Date();
			document.querySelector(DOMStrings.monthLabel).textContent = months[now.getMonth()] + ' ' + now.getFullYear();
		},

		changedType: function () {
			var fields = document.querySelectorAll(
				DOMStrings.inputType + ',' +
				DOMStrings.inputDesc + ',' +
				DOMStrings.inputVal
			);
			nodeListForEach(fields, function (el) {
				el.classList.toggle('red-focus');
			});
			document.querySelector(DOMStrings.addBtn).classList.toggle('red');
		},

		getDOMStrings: function () {
			return DOMStrings;
		}
	}
})();


// Separated Module that uses IIFE and Closure
var controller = (function (budgetCtrl, UICtrl) {

	var setupEventListeners = function () {
		var DOM = UICtrl.getDOMStrings();
		document.querySelector(DOM.addBtn).addEventListener('click', ctrlAddItem);
		document.addEventListener('keypress', function (e) {
			if (e.keyCode === 13 || e.which === 13) {
				ctrlAddItem();
			}
		});

		document.querySelector(DOM.container).addEventListener('click', ctrlDeleteItem);
		document.querySelector(DOM.inputType).addEventListener('change', UICtrl.changedType);
	}

	var updateBudget = function () {
		// 1. Calculate the Budget
		budgetCtrl.calcBudget();
		// 2. Return the budget
		var budget = budgetCtrl.getBudget();
		// 3. Display the Budget to UI
		UICtrl.displayBudget(budget);
	}

	var updatePercetages = function () {
		// calc percentages
		budgetCtrl.calcPercentages();
		// read from budget ctrl
		var percents = budgetCtrl.getPercentages();
		// update in UI with new %
		UICtrl.displayPercentages(percents);
	}


	var ctrlAddItem = function () {
		var input, newItem;

		//1. Get the field input data
		input = UICtrl.getInput();

		if (input.description !== "" && !isNaN(input.value) && input.value > 0) {
			document.getElementById('input__error').innerHTML = "";
			// 2. Add item to the BudgetController
			newItem = budgetCtrl.addItem(input.type, input.description, input.value);

			// 3. Add item to the UI
			UICtrl.addListItem(newItem, input.type);

			//Clear the Fields
			UICtrl.clearFields();

			// Update Budget
			updateBudget()

			// calc and update percentages
			updatePercetages()
		}
		else {
			document.getElementById('input__error').innerHTML = 'Enter Valid Data :p';
		}

	}

	var ctrlDeleteItem = function (event) {
		var itemID, splitID, type, id;
		itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;
		if (itemID) {
			splitID = itemID.split('-');
			type = splitID[0];
			id = parseInt(splitID[1]);

			// Delete from DS
			budgetCtrl.deleteItem(type, id);
			// Delete from UI
			UICtrl.deleteListItem(itemID);
			// Update Budget and Show
			updateBudget();

			// calc and update percentages
			updatePercetages()
		}
	}


	return {
		init: function () {
			console.log('Initializing APP... Done.');
			UICtrl.displayBudget({
				budget: 0,
				totalInc: 0,
				totalExp: 0,
				percentage: -1
			});
			setupEventListeners();
			UICtrl.displayMonth();
		}
	}

})(budgetController, UIController);

controller.init();
// UIController.clearFields()