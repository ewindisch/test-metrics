var iopipe = require('iopipe')({ clientId: 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpZCI6ImF1dGgwfDU3OTBmMDc1NDViZTFkNjcwOWU5ODc1OCIsInVzZXJuYW1lIjoiZXdpbmRpc2NoMiIsImlhdCI6MTQ2OTExNjU1MywiYXVkIjoiaHR0cHM6Ly9tZXRyaWNzLWFwaS5pb3BpcGUuY29tL2V2ZW50LyJ9.S9UKWDfzkTyaA0r8Tdc72x5J3AptuQXcABmYvNWgnjo' })

var _ = require('lodash')
var system = require('./system.js')

function total_cpu_time (s) {
  return _.get(s, 'utime', 0) +
         _.get(s, 'stime', 0) +
         _.get(s, 'cutime', 0) +
         _.get(s, 'cstime', 0)
}

function calc_cpu_percentile (start_stat, end_stat, duration) {
  return 100 *
   (
     (
       total_cpu_time(
         start_stat
       ) -
       total_cpu_time(
         end_stat
       )
     ) / 100 / duration / 1e9
   );
}

exports.handle = iopipe(
  function(e, ctx, cb) {
    console.log("Started.")
    var start = process.hrtime();

    console.log("Got time: ", start)
    system.readstat().then((start_stat) => {
      console.log("Got stats.")
      for(var i = 0; i < 10 * 500 * 1e6; i++) {
        undefined
      }
      console.log("Looped.")

      system.readstat().then((end_stat) => {
        console.log("Got end stats.")

        var time = process.hrtime(start)
        var duration = time[0] * 1e9 + time[1]
        var cpu = calc_cpu_percentile(start_stat, end_stat, duration)
        console.log("cpu_percentage", cpu)
        iopipe.log("cpu_percentage", cpu)
        return cb(null, cpu)
      })
    })

    console.log("promises and such registered.")
  }
)
