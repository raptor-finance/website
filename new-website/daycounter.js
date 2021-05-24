// To set two dates to two variables
var date1 = new Date("05/18/2021");
var date2 = new Date();

// To calculate the time difference of two dates
var Difference_In_Time = date2.getTime() - date1.getTime();

// To calculate the no. of days between two dates
var Difference_In_Days = Difference_In_Time / (1000 * 3600 * 24);

//To display the final no. of days (result)
document.getElementById("dayCounter").innerHTML = Math.floor(Difference_In_Days);
