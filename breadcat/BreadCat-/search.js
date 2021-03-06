const sqlite = require("sqlite");

module.exports = {
/*
* resultArray: searchRestaurants(string: searchQuery, database: dbPromise,
* 								boolean: glutenFreeFilter,
*								boolean: vegetarianFilter,
*								boolean: veganFilter,
*								boolean: lowCalorieFilter,
*								boolean: kosherFilter)
*/
searchRestaurants: async function(searchQuery, dbPromise,
						glutenFreeFilter,
						vegetarianFilter,
						veganFilter,
						lowCalorieFilter,
						kosherFilter) {
	searchQuery = searchQuery.length>0 ? "'%"+searchQuery+"%'" : "'%'"
	console.log(searchQuery);
	const db = await dbPromise;
	var resultArray = new Array();
	var index = 0;
	var filterCount;
	var restrictionNames = ["Gluten-Free", "Vegetarian",
							"Vegan","Low Calories/Sugar",
							"Kosher"];
	var queryRestaurant = `SELECT name, description, id
				  FROM restaurant
				  WHERE name LIKE ${searchQuery}
				  OR
				  description LIKE ${searchQuery}`;
	var queryRestaurantCount = `SELECT COUNT()
				  FROM restaurant
				  WHERE name LIKE ${searchQuery}
				  OR
				  description LIKE ${searchQuery}`;
	var queryRestriction = `SELECT restriction
				FROM rest_diet
				WHERE restID = ?`;
	
	filterCount = 0;
	filterCount += glutenFreeFilter ? 1 : 0;
	filterCount += vegetarianFilter ? 1 : 0;
	filterCount += veganFilter ? 1 : 0;
	filterCount += lowCalorieFilter ? 1 : 0;
	filterCount += kosherFilter ? 1 : 0;
	
	var initialResultCount = await db.get(queryRestaurantCount);
	initialResultCount = initialResultCount["COUNT()"];
	console.log("Initial Result Count: ", initialResultCount);
	
	if (initialResultCount<1) { return resultArray; }
	
	var resolvedResults = 0;
	await new Promise(function (resolve, reject) {
		db.each(queryRestaurant, async (err, restaurantRow) => {
			if (err) {
				throw err;
			}

			var filterMatches = 0;
			if (filterCount > 0) {
				await db.each(queryRestriction, restaurantRow.id, (err, restrictionRow) => {//Filter by dietary restrictions
					switch (restrictionRow.restriction) {
						case restrictionNames[0]:
							filterMatches += glutenFreeFilter ? 1 : 0;
							break;
						case restrictionNames[1]:
							filterMatches += vegetarianFilter ? 1 : 0;
							break;
						case restrictionNames[2]:
							filterMatches += veganFilter ? 1 : 0;
							break;
						case restrictionNames[3]:
							filterMatches += lowCalorieFilter ? 1 : 0;
							break;
						case restrictionNames[4]:
							filterMatches += kosherFilter ? 1 : 0;
							break;
					}
				});
			}

			if (filterMatches >= filterCount) {//Add restaurant data to array
				resultArray[index] = { name: "", description: "", id: ""};
				resultArray[index].name = restaurantRow.name;
				resultArray[index].description = restaurantRow.description;
				resultArray[index].id = restaurantRow.id;
				index++;
			}
			resolvedResults++;
			
			if (resolvedResults == initialResultCount) {
				resolve();
			}
		});
	});
	
	return resultArray;
}
}