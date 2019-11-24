const sqlite = require("sqlite");
/*
* resultArray: searchRestaurants(string: searchQuery, database: dbPromise)
*/
function searchRestaurants(searchQuery, dbPromise) {
	searchQuery = "%"+searchQuery+"%"
	const db = await dbPromise;
	var resultArray;
	var index = 0;
	var query = "SELECT Name name,
                  Description description
				FROM Restaurant
				WHERE Name LIKE ${searchQuery} OR
				  Description LIKE ${searchQuery}";
	
	db.each(query, (err, row) => {
	  if (err) {
		throw err;
	  }
	  
	  resultArray[index].name = row.name;
	  resultArray[index].description = row.description;
	  index++;
	});
	
	return resultArray;
}