// receive sales events in JS
session.subscribe('http://tavendo.de/webmq/demo/dashboard#onSale', session.log);

// the following events are available:
//
// onSale
// totalUnits
// totalASP
// totalRevenue
// unitsByProduct
// aspByProduct
// revenueByProduct
// unitsByRegion
// aspByRegion
// revenueByRegion
