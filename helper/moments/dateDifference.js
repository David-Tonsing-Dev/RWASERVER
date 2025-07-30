const moment = require("moment");

const differenceTwoDates = (date1, date2) => {
  const firstDate = moment(date1);
  const secondDate = moment();

  return secondDate.diff(firstDate, "days");
};

module.exports = differenceTwoDates;
