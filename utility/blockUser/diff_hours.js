const diff_hours = (dt2, dt1) => {
  let diff = (dt2 - dt1) / 1000;
  return (diff /= 60 * 60);
}

exports.diff_hours = diff_hours;
