export const formatTimestamp = timestamp => {
  // http://stackoverflow.com/a/3552493/1928484
  const monthNames = [
    "Jan", "Feb", "Mar", "April", "May", "June", "July", "Aug", "Sept", "Oct", "Nov", "Dec"
  ];

  let date = new Date(timestamp);
  let day = date.getDate();
  let monthIndex = date.getMonth();
  let year = date.getFullYear();

  let hours = date.getHours();
  let minutes = date.getMinutes();
  let seconds = date.getSeconds();

  day = day < 10 ? `0${day}` : day;
  hours = hours < 10 ? `0${hours}` : hours;
  minutes = minutes < 10 ? `0${minutes}` : minutes;
  seconds = seconds < 10 ? `0${seconds}` : seconds;

  const timeStr = `${hours}:${minutes}:${seconds}`;
  const dateStr = `${day} ${monthNames[monthIndex]} ${year}`;

  return `${timeStr} ${dateStr}`;
};

