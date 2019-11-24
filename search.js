const sqlite = require("sqlite");
/*
* resultArray: searchRestaurants(string: searchQuery, database: dbPromise,
* 								boolean: glutenFreeFilter,
*								boolean: vegetarianFilter,
*								boolean: veganFilter,
*								boolean: lowCalorieFilter,
*								boolean: kosherFilter)
*/
function searchRestaurants(searchQuery, dbPromise,
						glutenFreeFilter,
						vegetarianFilter,
						veganFilter,
						lowCalorieFilter,
						kosherFilter) {
	searchQuery = "%"+searchQuery+"%"
	const db = await dbPromise;
	var resultArray;
	var index = 0;
	var filterMatches, filterCount;
	var restrictionNames = ["Gluten-free", "Vegetarian",
							"Vegan","Low sugar/calories",
							"Kosher"];
	var queryRestaurant = `SELECT Name name, Description description, Accomodations accomodations FROM Restaurant WHERE Name LIKE ${searchQuery} OR
				  Description LIKE ${searchQuery}`;
	var queryRestriction = `SELECT Restriction restriction
				FROM DietaryRestriction
				WHERE RestrictionID = ?`;
	
	filterCount += glutenFreeFilter;
	filterCount += vegetarianFilter;
	filterCount += veganFilter;
	filterCount += lowCalorieFilter;
	filterCount += kosherFilter;
	
	await db.each(queryRestaurant, (err, restaurantRow) => {
	  if (err) {
		throw err;
	  }
	  
	  db.each(queryRestriction, restaurantRow.Accomodations, (err, restrictionRow) => {//Filter by dietary restrictions
		  switch (restrictionRow.restriction) {
			  case restrictionNames[0]:
				filterMatches += glutenFreeFilter;
				break;
			  case restrictionNames[1]:
				filterMatches += vegetarianFilter;
				break;
			  case restrictionNames[2]:
				filterMatches += veganFilter;
				break;
			  case restrictionNames[3]:
				filterMatches += lowCalorieFilter;
				break;
			  case restrictionNames[4]:
				filterMatches += kosherFilter;
				break;
		  }
	  });
	  
	  if (filterMatches >= filterCount) {//Add restaurant data to array
		  resultArray[index].name = restaurantRow.name;
		  resultArray[index].description = restaurantRow.description;
		  index++;
	  }
	});
	
	return resultArray;
}